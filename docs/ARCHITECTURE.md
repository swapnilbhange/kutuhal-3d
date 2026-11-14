# How Kutuhal 3D works

## One-page overview

```
 script.txt + your instructions
        │
        ▼
 ┌───────────────┐   story/script.json   (scenes → units, pronounce, emph, notes)
 │ 1 ANALYSE     │   story/bible.md      (premise, tone, cast, sets, motif, style, moods)
 └──────┬────────┘
        ▼
 ┌───────────────┐   input/narration.wav     Kokoro-82M (ONNX, CPU)
 │ 2 NARRATE     │   timeline/words.json     every word with start/end (forced alignment, pocketsphinx)
 └──────┬────────┘   timeline/units.json     sentence start/end
        ▼
 ┌───────────────┐   story/shots.json        THE CUE SHEET: shots, sets, transitions, overlays,
 │ 3 STORYBOARD  │                           SFX cues, ambience, music sections – all timed from words.json
 └──────┬────────┘
        ▼
 ┌───────────────┐   scenes/cast.js · props.js · sets/*.js · shots/*.js
 │ 4 BUILD       │   (written by Claude against the engine API)
 └──────┬────────┘
        ▼
 ┌───────────────┐   build/video_silent.mp4
 │ 5 RENDER      │   headless Chrome + three.js, deterministic frame-by-frame, ffmpeg encode
 └──────┬────────┘
        ▼
 ┌───────────────┐   out/<Title>.mp4 · captions.srt · narration.wav
 │ 6 SOUND + MUX │   music + SFX + ambience synthesised in numpy; sidechain duck; −14 LUFS
 └───────────────┘
```

**Design principle – the cue sheet.** `story/shots.json` and `timeline/words.json` are the single source of truth. Visuals, overlays, captions and every sound cue read their timing from them, so changing a word, a voice or a shot never leaves audio and picture out of sync.

---

## Repository layout

```
kutuhal-3d/                         ← GitHub repo / marketplace
├─ .claude-plugin/marketplace.json  ← lets `/plugin marketplace add` find the plugin
├─ plugins/kutuhal-3d/              ← THE PLUGIN (this is what gets zipped into dist/)
│  ├─ .claude-plugin/plugin.json
│  └─ skills/
│     ├─ make-3d-short/             ← pipeline skill (start here)
│     │  ├─ SKILL.md
│     │  ├─ references/             ← install · script-analysis · style-bible · engine-api · sound-design · render-qc
│     │  └─ kit/                    ← the studio, copied to a workspace at run time
│     │     ├─ engine/  lib.js core.js styles.js ui.js player.js
│     │     ├─ player.html  render.mjs  package.json  requirements.txt
│     │     ├─ tools/   doctor.py new_project.py draft_script.py narrate.py beats.py sheet.py
│     │     ├─ audio/   dsp.py sfx.py music.py mix.py
│     │     ├─ assets/fonts/Poppins-Bold.ttf
│     │     └─ examples/planning-fallacy/   ← complete working project
│     ├─ new-short/   render-short/   short-sound/   short-looks/   ← stage skills
├─ docs/  samples/  dist/  scripts/
└─ README.md  LICENSE  THIRD_PARTY_NOTICES.md  CHANGELOG.md  CONTRIBUTING.md
```

A **project** (created by `new_project.py`) lives in `<studio>/projects/<slug>/`:

```
config.json         title, aspect, resolution, fps, style, voice, captions, music/sfx/ambience gains, loudness, crf, tail, fadeOut
input/              script.txt, narration.wav, (optional) logo.png, music file
story/              script.json, bible.md, shots.json
timeline/           words.json, units.json, transcript.txt
scenes/             cast.js, props.js, sets/*.js, shots/*.js      ← the creative code
build/              sheets, stills, frames, video_silent.mp4, mix.wav   (disposable)
out/                final MP4, SRT, narration.wav
```

---

## Stage details

### 1 · Analyse (`draft_script.py` + Claude)
`draft_script.py` turns paragraphs into **scenes** and sentences into **units**, and pulls bracketed / `VISUAL:` lines out as `notes`. Claude then edits `story/script.json`:

```jsonc
{ "voice": "hm_psi", "lead": 0.2,
  "pronounce": { "Diderot": "dee-dro" },        // respellings (or /IPA/) fed to the TTS
  "emph": ["two", "five", "buffer"],             // words highlighted in captions and used as visual hits
  "scenes": [ { "id": 1, "speed": 1.0, "gap": 1.0, "pause": 0.3,
                "notes": ["[VISUAL: a student at a desk]"],
                "units": [ { "say": "How long will it take?",     // what is spoken
                             "show": "How long will it take?" } ] } ] }   // what is shown in captions
```

### 2 · Narrate (`narrate.py`)
- **TTS:** Kokoro-82M via `kokoro-onnx` (CPU, 24 kHz). Each word is phonemised separately so that `pronounce` overrides and per-word speed work.
- **Alignment:** word start/end times come from **pocketsphinx forced alignment** of the generated audio against the script; words missing from its dictionary are mapped from IPA to ARPAbet phonemes. A `reconcile()` pass makes the result a monotonic, gap-free word list that matches the script words exactly.
- **Outputs:** `narration.wav`, `words.json` (`{w,start,end,scene,emph}` per word), `units.json`, `transcript.txt`.

### 3 · Storyboard (`beats.py` + Claude)
`beats.py` drafts one shot per unit (short units under 1.8 s merge) with `duration = narration end + tail` and one `hopeful` music section per scene. Claude replaces that with the real plan. A shot:

```jsonc
{ "id": "s03", "start": 6.8, "end": 11.58, "line": "Then reality shows up…",
  "scene": "Camera swings to the wall clock; sky goes dusk→night; counter 2→5",   // human description
  "set": "desk",
  "in": { "type": "cut" },                       // cut | fade | dip | dipWhite | flash
  "overlays": [ { "type": "counter", "at": 2.4, "dur": 2.0, "from": 2, "to": 5, "suffix": " HOURS", "pos": "top" } ],
  "sfx": [ { "at": 0.3, "name": "whoosh", "gain": -6 } ],     // at = seconds from shot start
  "amb": { "name": "room", "gain": 0 } }
```
Top-level: `title`, `duration`, `music: [{start,end,mood,intensity}]`, optional global `sfx: [{t,name}]`.

### 4 · Build (Claude writes `scenes/`)
Each shot is a module calling `registerShot(id, { set, draw(X,t,info), overlay(X,t,info) })`. `draw` is a **pure function of time** – it positions the camera, lights, characters and props for time `t` seconds into the shot. Full API: `plugins/kutuhal-3d/skills/make-3d-short/references/engine-api.md`.

Key engine properties
- **Deterministic:** the frame at time *t* is computed from *t* alone (no accumulated state), so any frame can be rendered independently and in parallel.
- **Fixed light rig:** lights are created once (key, rim, fill, hemisphere, accent); `X.light(mood)` and `X.accent()` only change their values, so shaders never recompile (a recompile causes black frames).
- **Managed objects:** props, humans and sparkles obtained through `X.prop/X.human/X.sparkles` are hidden automatically every frame and re-shown only when the shot asks for them.
- **Procedural characters:** `makeHuman` builds a rounded figure from primitives; `X.pose` / `X.SIT` / `X.walkPose` / `X.idlePose` drive joints, `X.expr` drives brows, mouth and eyes (mouth follows `talkAmount(t)`, derived from the word timings).
- **Captions:** rendered as DOM text at the bottom; a word never appears before it is spoken; emphasised words are highlighted.
- **View offset:** the 3D view is lifted ≈ 230 px in 9:16 so subjects stay above the caption band.

### 5 · Render (`render.mjs`)
A tiny static server serves the engine, the project and a `/__manifest` of scene modules. N workers each open `player.html` in headless Chrome (puppeteer-core; SwiftShader software GL if there is no GPU), call `window.renderFrame(f)` for their frame range, and write JPEG/PNG frames to `build/frames`, which ffmpeg then encodes (H.264, CRF 20). Workers run frame ranges in parallel; `--resume` skips frames already rendered. Failures surface through `window.IMPORT_ERRORS / BOOT_ERROR / LAST_ERROR`, which `render.mjs` prints.

### 6 · Sound + mux (`audio/*.py`)
- **Instruments** (`dsp.py`): oscillators, FM bells, plucks, pads, noise, filters, reverb – all numpy/scipy, no samples.
- **Music** (`music.py`): 12 moods composed procedurally from chord/arpeggio patterns in a chosen key; each section has an intensity 0–1 and its own mood.
- **SFX** (`sfx.py`): about 30 synthesised effects + 6 ambience beds, placed by `shots.json` cues with gain/pitch/seed variation.
- **Mix** (`mix.py`): narration is the reference level; music is **sidechain-ducked** from the voice envelope; SFX and ambience sit under it; the bus is **loudness-normalised to −14 LUFS** (ffmpeg `loudnorm`); then video and audio are muxed (AAC 192 kbps, 48 kHz). It also writes `captions.srt` from `words.json`.

---

## Why three.js in Chrome instead of Blender?
- No install of a 3D suite; pure JS that Claude can write and debug in a few lines.
- Deterministic and scriptable; runs on any CPU box with Chrome.
- Stylised low-poly looks good with simple geometry and lighting, and renders in seconds per frame without a GPU.

Trade-off: software rendering is slower than a GPU (≈ 2 s/frame at 1080×1920). Use a machine with a GPU-enabled Chrome and more workers to go faster.

## Limits (by design)
- Stylised, not photoreal. Characters are procedural "bean people"; no lip-sync to phonemes (mouth follows loudness).
- One narrator voice per video (Kokoro voices; no voice cloning).
- Scene code is per-video; there is no library of ready-made environments beyond the example's `desk` and `void` sets.
- Tested on Linux only.
