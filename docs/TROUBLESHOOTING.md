# Troubleshooting

Run `python3 tools/doctor.py` first – it checks Python, ffmpeg, Node, packages, Chrome and the Kokoro model and tells you what to fix.

## Plugin / Claude side
| Symptom | Cause | Fix |
|---|---|---|
| `Permission denied` running `scripts/*.sh` | Unzipping lost the executable bit (common on Windows/macOS Finder) | Run it with bash: `bash scripts/install-skills.sh codex`, or `chmod +x scripts/*.sh` |
| "Only .zip files are accepted" / "Upload failed" when uploading `.plugin` | Some app versions only accept `.zip` | Upload `dist/kutuhal-3d.zip` (same content) |
| Plugin uploaded but skills not listed | App needs a refresh | Fully restart the app, open a **new** chat, type `/` |
| `/plugin marketplace add …` says repo not found | Repo is private or name wrong | Make the repo public (or authenticate git), check `owner/repo` |
| "Plugin not found in marketplace" | Wrong marketplace name | Use `kutuhal-3d@kutuhal-plugins` (marketplace name comes from `.claude-plugin/marketplace.json`) |
| `claude plugin validate` fails | JSON syntax | `python3 -m json.tool .claude-plugin/marketplace.json` and the plugin's `plugin.json` |
| Claude says it can't run code / no shell | Chat has no code execution | Enable code execution, or use Cowork / Claude Code on your computer |
| Claude can't find the kit | Skill not loaded | Say "use the Kutuhal 3D make-3d-short skill", check the plugin is enabled |

## Setup
| Symptom | Fix |
|---|---|
| `FAIL node packages` | `cd studio && npm install` |
| `FAIL Chrome/Chromium` | Install Google Chrome, or `npx playwright install chromium --with-deps`, or set `CHROME_PATH=/path/to/chrome` |
| Snap Chromium fails to launch | Don't use snap Chromium – install Chrome `.deb` or the Playwright build |
| `pip install` error "externally-managed-environment" | `pip install --break-system-packages -r requirements.txt` or use a venv (`python3 -m venv .venv && . .venv/bin/activate`) |
| Kokoro model download blocked / slow | Download `kokoro-v1.0.onnx` and `voices-v1.0.bin` (release `model-files-v1.0` of `thewh1teagle/kokoro-onnx`) into `studio/models/` |
| `ffmpeg: command not found` | Install ffmpeg (`brew install ffmpeg` / `apt install ffmpeg`) |
| Behind a proxy | Set `HTTPS_PROXY`; pip/npm/curl honour it |

## Narration
| Symptom | Fix |
|---|---|
| A name is mispronounced | Add it to `pronounce` in `story/script.json` (respelling like `dee-dro`, or IPA between slashes) and re-run `narrate.py` |
| Voice sounds wrong for the topic | `narrate.py --audition`, listen to `build/voices/*.wav`, pick one, `--voice <id>` |
| Video too long | Trim the script (don't speed up the voice); ≈ 2.25 words/s |
| Word timings look off in captions | Check `timeline/words.json`; re-run `narrate.py`; unusual abbreviations should be spelled out in `say` |

## Rendering
| Symptom | Fix |
|---|---|
| Render hangs at start, "Waiting failed: 180000ms exceeded" | A scene module has a **syntax error**. Check each file: `node --input-type=module --check < scenes/shots/xx.js`. Also avoid nested `/* … */` in comments |
| Black frames / flicker | A shot creates lights or materials per frame. Use `X.light()` / `X.accent()` only; build materials once |
| Some shots draw only the set background | The `registerShot` id doesn't match the shot `id` in `shots.json`, or the module failed to import (see `IMPORT_ERRORS` in the log) |
| "unknown cast id" | `X.human('id')` not registered – add it in `scenes/cast.js` |
| Out of memory with many workers | `--workers 1`, or `--scale 0.5` |
| Render stopped midway | Re-run the same command with `--resume` |
| Very slow | Expected on software GL (≈ 2 s/frame at 1080×1920 per worker). Use more CPU cores and `--workers N`, or a GPU-enabled Chrome, or preview with `--scale 0.5` |
| Captions hidden behind subjects / overlays cover faces | Move overlays to `top`/`upper`, raise `X.lift(px)`, re-check the contact sheet |
| Pastel style is unreadable on dark scenes | Pastel expects light scenes; use another style for dark sets |

## Audio
| Symptom | Fix |
|---|---|
| Music too loud / quiet | `config.json` → `music.gainDb` (try −24 … −16), run `audio/mix.py` |
| SFX too busy | Remove cues from `shots.json` (≤ 3 per second) or lower `sfx.gainDb` |
| Final video silent | You ran `mix.py` before rendering; render first or pass `--video build/preview.mp4` |
| Loudness not −14 LUFS | `ffmpeg -i out/<t>.mp4 -af ebur128 -f null -` to measure; check `loudness` in `config.json` |
| Audio ends early / late | `shots.json` `duration` must be narration end + tail; re-run `beats.py` or fix manually |

## Still stuck?
Open an issue with: OS, `python3 tools/doctor.py` output, the last 30 lines of the render log, and `projects/<slug>/story/shots.json`.
