# Contributing

Thanks for helping make Kutuhal 3D better.

## Good first contributions
- New **sets** and **props** for `examples/` (street, classroom, office, space station…).
- New **SFX** (`audio/sfx.py`, function `e_<name>`) and **music moods** (`audio/music.py`).
- New **overlay types** (`engine/ui.js`) and **style presets** (`engine/styles.js`).
- Windows / macOS testing and fixes (the project is tested on Linux).
- Documentation, translated scripts, better TTS voices.

## Dev loop
```bash
git clone https://github.com/swapnilbhange/kutuhal-3d && cd kutuhal-3d
cp -r plugins/kutuhal-3d/skills/make-3d-short/kit /tmp/studio && cd /tmp/studio
python3 tools/doctor.py --install
cp -r examples/planning-fallacy projects/
node render.mjs --project projects/planning-fallacy --sheet --scale 0.5     # must still render
```
Test the plugin in Claude Code without installing: `claude --plugin-dir plugins/kutuhal-3d`.

## Rules of the road
- Keep scene code **deterministic** (pure function of `t`) and never create lights/materials per frame.
- Every SFX/music function must return finite, non-silent audio – run `python3 audio/sfx.py --demo` and `python3 audio/music.py --mood <m> --dur 6 --out /tmp/m.wav`.
- Syntax-check modules: `node --input-type=module --check < file.js`.
- No third-party samples, copyrighted characters, logos or songs.
- Update `CHANGELOG.md`; bump versions in `plugin.json` **and** `marketplace.json`; run `bash scripts/build-dist.sh`.
- Skill names must not contain "claude" or "anthropic".

## Pull requests
Describe what changed, attach a contact sheet or sample frames for visual changes, and note the platform you tested on.
