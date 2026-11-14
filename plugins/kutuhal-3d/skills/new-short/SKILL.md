---
name: new-short
description: >
  This skill should be used when the user runs /new-short or asks to "start a new 3D short from this script",
  "analyse my script", "generate the narration and timings", "plan the shots for my script", or "set up the
  project" in the Kutuhal 3D studio. It covers intake, studio install, project creation, script
  analysis (script.json, bible), Kokoro narration with word timings, and the draft shot list.
---

# /new-short: intake → install → analysis → narration → shot plan

This is stages 1–3 of the `make-3d-short` pipeline. Shared files are in the sibling skill `../make-3d-short/` (`kit/`, `references/`). Read `../make-3d-short/references/install.md` and `script-analysis.md` first.

1. **Intake**: script (required), aspect (9:16 default), length cap, tone, voice, style, captions, title. Ask once; defaults otherwise.
2. **Studio**: `cp -r ../make-3d-short/kit ./studio` (if not present), `python3 tools/doctor.py --install`, `npm install`.
3. **Project**: `python3 tools/new_project.py --name <slug> --script <file> --title "<Title>"`.
4. **Analysis**: `tools/draft_script.py` → refine `story/script.json` → `story/bible.md`.
5. **Narration**: `tools/narrate.py --project projects/<slug>` (offer `--audition` when the user wants to choose a voice); verify duration and `timeline/words.json`.
6. **Shot plan**: `tools/beats.py` → rewrite `story/shots.json` per `script-analysis.md`; show the user the short plan.

Stop after the plan and suggest `/render-short` (or continue straight into it if the user asked for the whole video).
