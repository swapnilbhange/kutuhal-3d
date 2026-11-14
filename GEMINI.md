# GEMINI.md – Kutuhal 3D (same instructions as AGENTS.md)

This repository contains **Kutuhal 3D**, a script-to-3D-Short pipeline (narration, 3D video, music, SFX, captions → MP4).
If the user gives you a script and asks for a short/video/reel, **follow the skill** in
`plugins/kutuhal-3d/skills/make-3d-short/SKILL.md` and read the guides in its `references/` folder as it directs.
Stage skills (`new-short`, `render-short`, `short-sound`, `short-looks`) are in the sibling folders.

Essentials
- The studio kit is `plugins/kutuhal-3d/skills/make-3d-short/kit/`. Copy it to a working folder (e.g. `./studio`), run `python3 tools/doctor.py --install` and `npm install`, then follow the skill's stages.
- You author the 3D scene modules (`scenes/`) against the engine API in `references/engine-api.md`; narration, music, SFX, captions and rendering are driven by `story/shots.json` and `timeline/words.json`.
- You must be able to run shell commands and **view images** (contact sheets/stills) to check your work. If you cannot view images, say so and ask the user to review `build/sheets/*.png`.
- Rendering is slow (≈ 2 s/frame/worker at 1080×1920): state an ETA, run it in the background, poll the log.
- Never use copyrighted characters, logos, music, or real people's likeness.
- Deliver `out/<Title>.mp4`, `out/captions.srt`, `out/narration.wav` and give the user their paths.

Installing the skills into your tool: see `docs/OTHER-AI-TOOLS.md` and `scripts/install-skills.sh`.
