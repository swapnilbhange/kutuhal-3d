# Paste-ready GitHub settings for Kutuhal 3D

## 1. About box (repo page -> gear icon next to "About")

**Description** (one line):
Script-to-Short studio for Claude: upload a script and get a narrated, music-scored, captioned 3D explainer video (9:16 or 16:9). Runs offline.

**Website:** (leave blank, or your YouTube channel: https://www.youtube.com/@kutuhalstudio)

**Topics** (type each, press Enter):
claude-code, claude-plugin, claude-skills, agent-skills, threejs, text-to-speech, kokoro-tts, video-generation, faceless-youtube, youtube-shorts, explainer-videos, ai-video

Tick: Releases, and untick Packages / Deployments if you don't use them.

## 2. Release (repo page -> Releases -> Draft a new release)

- **Tag:** v1.1.0 (Create new tag on publish, target: main)
- **Release title:** Kutuhal 3D v1.1.0
- **Attach files:** dist/kutuhal-3d.plugin and dist/kutuhal-3d.zip (drag into "Attach binaries")
- **Description:** paste the contents of RELEASE_NOTES_v1.1.0.md (already in your repo), or use the short version below.

### Short description
Kutuhal 3D turns a script into a finished 3D explainer Short: Claude analyses the script, then generates Kokoro narration with word timings, a stylised low-poly three.js video, synthesised music/SFX/ambience, and word-by-word captions. Output: MP4 + SRT, 9:16 or 16:9, offline after setup.

**Install (Claude Code):**
```
/plugin marketplace add swapnilbhange/kutuhal-3d
/plugin install kutuhal-3d@kutuhal-plugins
```
Or upload kutuhal-3d.plugin (or the .zip) in Claude's plugin upload dialog.

Also works with Codex / ChatGPT desktop, Gemini CLI and Antigravity via the Agent Skills standard (see docs/OTHER-AI-TOOLS.md).

Includes a full example project (The Planning Fallacy) and sample 1080p output. Full docs in /docs. MIT licensed.

## 3. Optional: commit with your noreply email
git config user.email "52967667+swapnilbhange@users.noreply.github.com"
