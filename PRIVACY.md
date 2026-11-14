# Privacy Policy: Kutuhal 3D

_Last updated: 15 November 2026_

Kutuhal 3D is an open-source Claude plugin (MIT licence). It has no servers, accounts, analytics or telemetry. The author does not receive, collect or store any data from people who use it.

## What the plugin handles

- **Your script and instructions.** Claude reads the script you provide in order to plan the video. The plugin writes its working files (analysis, narration audio, word timings, rendered frames, music, captions and the final MP4/SRT) into a project folder on your own computer or session workspace.
- **Personal data.** The plugin does not look for, collect or store personal data. If your own script happens to contain names or other personal details, they stay in your project files, under your control.
- **Connectors.** The plugin declares no connectors and no MCP servers, and does not read data from other apps.

## What leaves your machine

Nothing you create is sent to the plugin author or to any third party by the plugin. Narration, rendering, music and captions are generated locally.

Network access happens only during setup, as one-way downloads:

- Python and npm packages (from PyPI and npm).
- The Kokoro text-to-speech model files (downloaded once from the kokoro-onnx GitHub releases).
- Optionally, Chromium via `npx playwright install chromium`.

No script, audio or video content is uploaded in these steps.

## Retention

The author retains no data, because none is received. Files the plugin creates stay in your project folder until you delete them.

## Claude and other AI tools

When you use the plugin inside Claude (or another AI tool), your conversation is handled by that service under its own terms and privacy policy. This policy covers only the plugin's own code.

## Children

The plugin is a general-purpose video tool and is not directed at children under 18.

## Contact

Questions: open an issue at https://github.com/swapnilbhange/kutuhal-3d/issues
