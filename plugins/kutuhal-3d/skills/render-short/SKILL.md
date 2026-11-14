---
name: render-short
description: >
  This skill should be used when the user runs /render-short or asks to "build the scenes", "check the shots",
  "show me a contact sheet", "preview the short", "render the video", "render in 1080p / 9:16 / 16:9",
  "re-render after a fix", or "export the final MP4" for a Kutuhal 3D project. It writes or repairs
  scene modules with contact-sheet QC, renders the frames, mixes the sound and muxes the final MP4.
---

# /render-short: scenes → QC → render → mix → MP4

Stages 4–6 of `make-3d-short`. Read `../make-3d-short/references/engine-api.md`, `style-bible.md` and `render-qc.md`; use `../make-3d-short/kit/examples/planning-fallacy/scenes/` as the template.

1. Confirm the project has `story/shots.json`, `timeline/words.json`, `input/narration.wav` (else run `/new-short` first).
2. Write/repair `scenes/cast.js`, `props.js`, `sets/*.js`, `shots/*.js`. Syntax-check each file with `node --input-type=module --check < file`.
3. `node render.mjs --project P --sheet --scale 0.5` → read the sheet → fix → repeat; check key stills with `--stills`.
4. Optional preview: `--from 0 --to 10 --scale 0.5`.
5. Full render in the background: `node render.mjs --project P --workers 2` (`--resume` to continue). Report the ETA first.
6. `python3 audio/mix.py --project P` → `out/<title>.mp4`, `captions.srt`, `narration.wav`. Verify with `ffprobe` and 3 extracted frames; deliver with `SendUserFile`.

Re-render after a fix: only the changed shot range needs a re-check (`--from/--to`), but the final render is always the whole video.
