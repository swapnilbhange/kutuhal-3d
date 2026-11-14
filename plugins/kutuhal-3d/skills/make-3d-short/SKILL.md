---
name: make-3d-short
description: >
  Kutuhal 3D, the script-to-Short studio. This skill should be used when the user uploads or pastes a script (with or without instructions) and wants a
  finished narrated explainer Short made from it, e.g. "make a 3D short from this script", "turn this script into
  a video with voiceover, music and sfx", "analyse my script and create the video", "make a YouTube Short /
  Reel / TikTok", "animate this explainer", or "do the whole video". It runs the full pipeline: script analysis,
  generated narration (Kokoro TTS) with word timings, a stylised low-poly three.js 3D storyboard, rendering in
  9:16 or 16:9, synthesised music, SFX and ambience, word-by-word captions and the final MP4 with SRT.
---

# Kutuhal 3D · make-3d-short: script → analysis → narration → 3D video → music & SFX → MP4

Claude analyses the script, then **authors** the visual scenes as small JS modules against a stable engine API (see `references/engine-api.md`). Narration, captions, music, SFX, ambience, overlays and rendering are data-driven from `story/shots.json` and `timeline/words.json`, which are the single source of truth for timing. Be honest with the user: visuals are designed per script by Claude (not an automatic template), audio is fully generated.

Bundled in this skill: `kit/` (the studio: engine, tools, audio, renderer, a complete example in `kit/examples/planning-fallacy`) and `references/`. Stage skills exist for partial work: **new-short** (stages 1–4), **render-short** (5–7), **short-sound** (audio only), **short-looks** (styles). Read the references you need, when you need them:

| Reference | When |
|---|---|
| `references/install.md` | setting up the studio |
| `references/script-analysis.md` | turning script + instructions into script.json, bible, shot plan |
| `references/style-bible.md` | look, lighting, shot vocabulary, 9:16 framing rules |
| `references/engine-api.md` | writing scene modules and shots.json |
| `references/sound-design.md` | music moods, SFX names, mix |
| `references/render-qc.md` | rendering and checks |

## Stage 1 — Intake (ask once, skip what the user already said)
Script (required; text/markdown/docx → plain text), **aspect** (default 9:16), **length cap**, **tone/audience**, **voice** (default `hm_psi`; offer `--audition`), **style** (default midnight), captions (default on), music/SFX (default on), title. If the person isn't watching, state the defaults you took and continue.

## Stage 2 — Studio & project
```bash
cp -r <this skill>/kit ./studio && cd studio && python3 tools/doctor.py --install && npm install
python3 tools/new_project.py --name <slug> --script <script.txt> --title "<Title>" [--aspect 9:16] [--style midnight] [--voice hm_psi]
```
Work in `projects/<slug>`. Paths below are relative to `studio/`; `P=projects/<slug>`.

## Stage 3 — Script analysis (see `references/script-analysis.md`)
1. `python3 tools/draft_script.py --project $P`, then **edit `story/script.json`**: clean spoken text, units, `pronounce`, `emph`.
2. Write `story/bible.md` (premise, tone, cast, sets, hero motif, style, music moods).
3. Narration: `python3 tools/narrate.py --project $P [--voice X]` → `input/narration.wav`, `timeline/words.json`, `units.json`. Check the duration against the length cap; trim the script if needed, then re-run.
4. `python3 tools/beats.py --project $P` → draft `story/shots.json`. Rewrite it: per shot `scene`, `set`, `in`, `overlays`, `sfx`, `amb`; plus `music` sections. Time everything from real word times.
5. Show the user a ≤ 12-line plan (bible + shot list) and continue unless they object.

## Stage 4 — Build the scenes (see `references/engine-api.md`, `style-bible.md`, example project)
Write `scenes/cast.js`, `scenes/props.js` (custom props from `X.THREE` primitives), `scenes/sets/*.js`, `scenes/shots/*.js` (`registerShot` per shot id). Open `kit/examples/planning-fallacy/scenes/` as the working template – copy its structure.
Check syntax of every module: `node --input-type=module --check < file.js`.

## Stage 5 — QC loop
`node render.mjs --project $P --sheet --scale 0.5` → **Read** `build/sheets/sheet_01.png`; then `--stills t1,t2,…` at overlay moments. Fix: clipped props, faces covered by overlays, captions covering subjects, odd poses, flat frames. Repeat until clean (see `render-qc.md` checklist). Optionally `--styles …` to let the user compare looks.

## Stage 6 — Render, mix, deliver
```bash
node render.mjs --project $P --workers 2          # build/video_silent.mp4 (run in background, poll the log)
python3 audio/mix.py --project $P                 # music + sfx + ambience + loudnorm, muxes out/<title>.mp4 + captions.srt
```
`ffprobe` the result, grab 3 frames and look at them, then `SendUserFile` the MP4 (plus the SRT and narration WAV). Finish with 2–3 lines: what was made, runtime, one next step (e.g. other style, other voice, 16:9 version). Estimate time before rendering: ≈ 1 s per frame per worker at 1080×1920 on 2 CPUs.

## Running this skill in other agents (Codex / ChatGPT, Gemini CLI, Antigravity, Cursor …)
The skills follow the open Agent Skills format (folders with `SKILL.md`), so other agents can load them; install all five skill folders **side by side** (`scripts/install-skills.sh <tool>` in the repo does this). Requirements: a shell, file read/write, and the ability to **view images** (the QC loop needs it). Map the Claude-specific wording as follows:

| This skill says | In another agent do this |
|---|---|
| Read a PNG/JPG (contact sheet, still) | use the agent's image-viewing/read-file tool; if it truly cannot view images, tell the user that visual QC was skipped and ask them to review `build/sheets/*.png` |
| `SendUserFile`, deliver files | state the output paths (`out/<Title>.mp4`, `captions.srt`, `narration.wav`) and attach/export them if the tool offers it |
| `AskUserQuestion`, task list tools | ask in plain text / keep a short checklist in the reply |
| "the skill's base directory" | the folder this `SKILL.md` was loaded from; the studio kit is `./kit` next to it |
| background render + poll | `nohup node render.mjs … > render.log 2>&1 &`, then poll the log |

Everything else (Python, Node, ffmpeg, Chrome, the kit scripts) is agent-independent.

## Rules
- Hook inside 3 s, a visual change every 2.5–5 s, one idea per shot, camera always moving, payoff on a calm still, end card after the last word.
- Never show a caption word before it is spoken; never time overlays/SFX by guess.
- Keep subjects above the caption band in 9:16. Maximum two recurring characters and three sets.
- Don't use real people's likeness or copyrighted characters/music.
- Claude can't hear audio: say so, and let the user judge voice/music; offer re-mix knobs (`gainDb`, mood, voice).
- If the user supplies their own narration audio instead of using TTS: place it at `input/narration.wav` and build `timeline/words.json` from their timestamps/SRT (same schema as `narrate.py` output) – the rest of the pipeline is unchanged.
