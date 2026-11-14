# Sound design

All audio is synthesised in numpy/scipy (no samples, no downloads) and mixed by `audio/mix.py`.

## Music (`audio/music.py`)
Moods: `mystery, tension, playful, action, dark, historical, epic, hopeful, calm, wonder, sad, triumph` (aliases: upbeat, suspense, build…). In `shots.json`:
```json
"music": [ {"start":0,"end":6.8,"mood":"playful","intensity":0.45}, … ]
```
Rules: one section per narrative act (hook → problem → concept → solution → payoff); change mood only on an idea change; intensity 0.4–0.6 under speech, 0.8+ only for the final payoff. Standalone: `python3 audio/music.py --mood mystery --intensity 0.5 --dur 20 --key A --out m.wav`.

## SFX (`audio/sfx.py`, `python3 audio/sfx.py --list`)
Names: beep, blip, buzz, chime, clock, counter, crackle, crinkle, ding, footstep, glitch, heartbeat, hit, impact, lid, ping, pop, powerup, register, riser, scratch, shimmer, slowmo, stinger, swish, thud, tick, whoosh.
Per shot: `"sfx":[{"at":1.9,"name":"pop","gain":-2,"dur":1.0,"pitch":0,"seed":1}]` – `at` in seconds **from shot start**. Global cues: `"sfx":[{"t":12.5,"name":"impact"}]` at the top level.
Conventions: `whoosh/swish` on camera moves and transitions, `pop` when an overlay item appears, `impact + shimmer` on the title, `riser` before a reveal, `tick/clock` under time, `hit` on a number landing, `chime` on the final line. ≤ 3 cues per second, nothing on every word. Gains: −8…−2 dB relative.

## Ambience
Per shot `"amb":{"name":"room","gain":0}`; names: city/street, crowd/murmur, hum, rain, room/roomtone, wind. Adjacent shots with the same bed are joined.

## Mix (`audio/mix.py`)
Voice is the reference; music is sidechain-ducked under speech; SFX/ambience sit under music. Levels come from `config.json` (`music.gainDb −20`, `sfx.gainDb −14`, `ambience.gainDb −26`), then loudness-normalised to `loudness` (−14 LUFS). Outputs `out/<title>.mp4` (when `build/video_silent.mp4` exists), `out/narration.wav`, `out/captions.srt`. Own music: set `music.file` in config. Too quiet/loud → change `gainDb` and rerun `mix.py` (seconds, no re-render).
