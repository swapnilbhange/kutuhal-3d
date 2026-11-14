---
name: short-sound
description: >
  This skill should be used when the user runs /short-sound or asks to "add music", "add sound effects",
  "change the music mood", "the music is too loud/quiet", "use my own music", "remix the audio" or "redo the
  soundtrack" for a Kutuhal 3D project. It plans mood-based generated music, SFX and ambience cues in
  story/shots.json, mixes them under the narration with ducking and loudness normalisation, and re-muxes the MP4.
---

# /short-sound: music, SFX, ambience, mix

Read `../make-3d-short/references/sound-design.md`.

1. Plan `music` sections (one per narrative act) and per-shot `sfx` / `amb` cues in `story/shots.json`, timing from real words (`timeline/words.json`).
2. Audition: `python3 audio/sfx.py --list`, `--demo`; `python3 audio/music.py --mood <m> --dur 15 --out /tmp/m.wav`.
3. Mix: `python3 audio/mix.py --project projects/<slug>` (seconds; no re-render needed when `build/video_silent.mp4` exists).
4. Levels: tune `music/sfx/ambience.gainDb` and `loudness` in `config.json`; own music via `music.file`.
5. Claude can't listen: verify by measuring (ffmpeg loudnorm/ebur128, no silence/clipping) and tell the user to judge the taste.
