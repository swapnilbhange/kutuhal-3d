# Kutuhal 3D (plugin)

Upload a script → Claude analyses it → narration, 3D video, music, SFX and captions → finished MP4.

Full documentation (install guides, usage, script guide, prompts, architecture, troubleshooting, samples) is in the repository root: `README.md` and `docs/`.

## Skills
| Skill | What it does |
|---|---|
| `make-3d-short` | The whole pipeline from script to MP4 (start here). |
| `new-short` | Intake, install, script analysis, narration + word timings, shot plan. |
| `render-short` | Build scenes, contact-sheet QC, render, mix, MP4. |
| `short-sound` | Music, SFX, ambience, mix levels. |
| `short-looks` | Compare / choose visual styles. |

Invoke by describing the job ("make a 9:16 short from this script") or with the namespaced commands `/kutuhal-3d:make-3d-short`, `/kutuhal-3d:new-short`, …

## Inside
```
.claude-plugin/plugin.json
skills/make-3d-short/   SKILL.md · references/ (6 guides) · kit/ (engine, tools, audio, renderer, examples/planning-fallacy)
skills/new-short  skills/render-short  skills/short-sound  skills/short-looks
```

## Needs
Python ≥ 3.9, Node ≥ 18, ffmpeg, Chrome/Chromium; internet on first run (Kokoro model ≈ 330 MB). Claude must be able to run code (Cowork, Claude Code, or chat with code execution).

MIT licence – see `LICENSE`. Third-party notices are in the repository root.

## Install (Claude Code)
```text
/plugin marketplace add <owner>/<repo>
/plugin install kutuhal-3d@kutuhal-plugins
```
Claude desktop / Cowork / claude.ai: Customize → Plugins → Add → Upload plugin (`kutuhal-3d.plugin`, or the identical `.zip`).
