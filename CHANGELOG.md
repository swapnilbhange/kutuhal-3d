# Changelog

## 1.1.0 – 2026-11-14
- **Cross-tool support:** `scripts/install-skills.sh` installs the skills for Claude Code, OpenAI Codex / ChatGPT desktop, Gemini CLI and Google Antigravity (user or project scope, copy or symlink).
- New guide `docs/OTHER-AI-TOOLS.md`; `AGENTS.md` and `GEMINI.md` for agents that open the repo as a workspace.
- `docs/PUBLISHING.md` and `scripts/set-github-user.sh` for publishing your own copy.
- `make-3d-short/SKILL.md` gained a tool-mapping table for non-Claude agents.

## 1.0.0 – 2026-11-14
First public release of **Kutuhal 3D**.

- Pipeline skill `make-3d-short` plus stage skills `new-short`, `render-short`, `short-sound`, `short-looks`.
- Script analysis → `story/script.json`, `story/bible.md`, `story/shots.json`.
- Kokoro-82M narration with per-word forced alignment (`timeline/words.json`).
- three.js engine: fixed light rig, 8 lighting moods, 5 style presets, procedural characters, declarative overlays (title, big, stat, counter, toast, list, bars, quote, end), word-timed captions.
- Headless-Chrome frame renderer with parallel workers, contact sheets, stills, style grids, `--resume`.
- Procedural audio: 12 music moods, ~30 SFX, 6 ambience beds, sidechain ducking, −14 LUFS mastering, SRT export.
- Complete worked example (`planning-fallacy`), docs, prompts and sample media.
- Marketplace manifest for `/plugin marketplace add` (validated and install-tested with the Claude Code CLI).
