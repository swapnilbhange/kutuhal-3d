# Install & environment

The studio kit (`../kit/`) is copied into a workspace folder (`<studio>`, default `./studio`). Everything runs offline after setup, except the one-time Kokoro model download.

```bash
cp -r <skill>/kit <studio> && cd <studio>
python3 tools/doctor.py --install      # checks ffmpeg, python libs, node, Chrome; installs what it can
npm install                            # three + puppeteer-core
```

| Need | How it is satisfied |
|---|---|
| Python ≥ 3.9 + `numpy scipy soundfile kokoro-onnx pocketsphinx pillow` | `doctor.py --install` (pip, add `--break-system-packages` in sandboxes) |
| `ffmpeg` | system package; static build from PyPI `imageio-ffmpeg` is used as fallback |
| Node ≥ 18 | `npm install` inside `<studio>` |
| Chrome / Chromium | system, `CHROME_PATH`, or the playwright cache (`npx playwright install chromium`). Software GL (SwiftShader) is fine. |
| Kokoro model files (~330 MB) | `narrate.py` downloads them to `<studio>/models` on first run from GitHub releases (`thewh1teagle/kokoro-onnx`, tag `model-files-v1.0`). If the network blocks it, ask the user to place `kokoro-v1.0.onnx` and `voices-v1.0.bin` in `<studio>/models`. |

## Network-restricted sandboxes
Only PyPI, npm and GitHub release assets are normally reachable. Everything the pipeline needs is on those. If a download is refused, say so plainly and ask the user to attach the file – don't hunt for workarounds.

## Speed
Rendering is CPU-bound (software WebGL). Budget about **1 s per frame per worker at 1080×1920** on 2 CPUs (a 30 s Short = 900 frames ≈ 8–15 min with 2 workers). Use `--scale 0.5` for previews and `--resume` after interruptions. Long renders: run in the background, poll the log, and tell the user it may be stopped if the session ends.
