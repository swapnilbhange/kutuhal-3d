# Using Kutuhal 3D

## The 60-second version
1. Attach your script (or paste it) in a chat where the plugin is installed.
2. Say what you want: *"Make a 9:16 short from this script. Midnight style, warm female voice, 45 seconds max."*
3. Claude builds it end to end and sends you `out/<title>.mp4`, `captions.srt` and `narration.wav`.

You can also drive the stages yourself: `/new-short` → `/render-short` → `/short-sound` / `/short-looks`.

---

## What happens, stage by stage

| # | Stage | What Claude does | What you see / can change |
|---|---|---|---|
| 1 | **Intake** | Reads the script and your instructions; asks only for what is missing (aspect, length cap, voice, style, title). | Answer once; defaults: 9:16, 1080p, `hm_psi` voice, `midnight` style, captions + music + SFX on. |
| 2 | **Studio** | Copies the bundled kit into a workspace, runs `doctor.py --install`, creates `projects/<slug>`. | Nothing – unless a dependency is missing. |
| 3 | **Script analysis** | Splits the script into scenes and one-sentence units, cleans it for speech, sets pronunciations and emphasised words, writes a **bible** (premise, tone, cast, sets, hero motif, music moods). | You get a ≤ 12-line plan to approve or correct. |
| 4 | **Narration** | Generates the voice-over with Kokoro TTS, aligns every word to its exact time. | Duration is checked against your length cap; text is trimmed if over. |
| 5 | **Shot plan** | Drafts one shot per unit, then rewrites it by hand: set, camera, transition, overlays, SFX, ambience, music sections – all timed from real word times. | Shot list with time ranges. |
| 6 | **Scene building** | Writes the 3D scene code (characters, sets, props, shots) against the engine API. | – |
| 7 | **QC loop** | Renders a contact sheet and key stills, **looks at them**, fixes problems (clipped props, overlays over faces, caption collisions, odd poses), repeats. | You can ask to see the sheet. |
| 8 | **Render** | Renders every frame in headless Chrome and encodes silent video. | ETA is stated first; see timings below. |
| 9 | **Sound & mix** | Synthesises music, SFX, ambience; ducks music under the voice; normalises loudness to −14 LUFS; muxes the MP4; writes the SRT. | Tune levels / mood afterwards in seconds. |
| 10 | **Delivery** | Verifies the file with ffprobe, checks sample frames, sends the files. | – |

### What is automatic vs. authored
- **Automatic:** voice, word timing, captions, music, SFX, ambience, mix, overlays, encoding.
- **Authored by Claude for each script:** the 3D world (who is on screen, what the sets and props are, how the camera moves). That is why every video looks tailor-made, and why a very abstract script may need a round or two of "make shot 4 clearer".

---

## Typical instructions (mix and match)
- **Format:** "16:9 instead", "9:16 for Shorts/Reels/TikTok", "720p draft first".
- **Length:** "under 45 seconds", "about 60 seconds" (Claude trims the *script*, never speeds the voice up).
- **Voice:** "audition voices" (renders one sentence in 9 voices so you can listen), "use `af_heart`".
- **Look:** "midnight / ember / arctic / neon / pastel", "warmer", "less dark".
- **Sound:** "no music", "calmer music", "more whooshes", "music –3 dB".
- **Content:** "main character is a young woman with a bun", "keep a clock as the recurring prop", "end with a text card saying …".

See [PROMPTS.md](PROMPTS.md) for ready-made prompts.

---

## Iterating after the first render

| You want | Say | What re-runs |
|---|---|---|
| Different music / louder SFX | "calmer music, SFX a bit louder" | `audio/mix.py` only – seconds |
| Different voice | "re-record in `bm_george`" | narration → timings → **everything downstream** (timing changes) |
| Different style | "show me the five looks" then "go with ember" | style grid, then full render |
| Change one shot | "shot 4: make the clock bigger, title lower" | that shot's code → stills → full render |
| Edit wording | edit the script line | narration + timings + shots touching that line + render |
| Other aspect ratio | "give me a 16:9 version" | scene framing check + render |

Because the final render is whole-video, always batch your changes before asking for it.

---

## Timings (measured)

Measured on a 2-CPU Linux sandbox, software WebGL, 2 render workers, 30 fps:

| Output | Time per frame per worker | 30 s Short (912 frames) |
|---|---|---|
| 540 × 960 (preview) | ≈ 0.63 s | ≈ 5 min |
| 1080 × 1920 (final) | ≈ 1.9 s | ≈ 14 min |

More CPU cores and `--workers N` scale it almost linearly. Narration (Kokoro, CPU) is ≈ 1–2× real time; audio mixing is a few seconds.

---

## Running the studio yourself (no Claude needed for these)
Everything the plugin does is plain scripts in the kit, so you can re-run any stage:

```bash
cd studio
python3 tools/new_project.py --name my-short --script my_script.txt --title "My Short"
python3 tools/draft_script.py --project projects/my-short      # then edit story/script.json
python3 tools/narrate.py     --project projects/my-short [--voice af_heart | --audition]
python3 tools/beats.py       --project projects/my-short       # draft story/shots.json
# write scenes/*.js (this is the creative part Claude does) …
node render.mjs --project projects/my-short --sheet --scale 0.5
node render.mjs --project projects/my-short --workers 2        # build/video_silent.mp4
python3 audio/mix.py --project projects/my-short               # out/<title>.mp4 + captions.srt
```
Render options: `--from/--to` (time range), `--scale 0.5`, `--workers N`, `--resume`, `--stills t1,t2`, `--styles a,b --at t1,t2`, `--style id`, `--crf N`, `--out file`.

## Your own narration or music
- **Own voice-over:** put it at `input/narration.wav` and give Claude a timestamped script/SRT; Claude builds `timeline/words.json` from it (same schema as `narrate.py` output). Everything else is unchanged.
- **Own music:** set `"music": { "file": "input/my_music.mp3", "gainDb": -20 }` in `config.json`, then run `mix.py`.

## What you get
```
projects/<slug>/
  out/<Title>.mp4        final video (H.264 + AAC, −14 LUFS)
  out/captions.srt       word-level captions
  out/narration.wav      the clean voice track
  story/                 script.json, bible.md, shots.json   (the plan)
  timeline/              words.json, units.json, transcript.txt (the timing)
  scenes/                the 3D scene code Claude wrote for this video
  build/                 contact sheets, stills, silent video, mix (safe to delete)
```
