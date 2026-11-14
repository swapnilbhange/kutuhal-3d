# Installing Kutuhal 3D

Kutuhal 3D is a Claude **plugin**. Installing it gives Claude five skills (`make-3d-short`, `new-short`, `render-short`, `short-sound`, `short-looks`) and a bundled studio kit that Claude copies into a workspace and runs to render your video.

There are two separate things to set up:

1. **The plugin** – installed into Claude (sections 1–3 below). Takes a minute.
2. **The machine that renders** – needs Python, Node, ffmpeg and Chrome (section 4). In Cowork / Claude Code that is your own computer; in a cloud sandbox it is usually already there.

> **Which Claude do I have?** Claude on the web (claude.ai), the Claude desktop app and **Cowork** all use the *Upload plugin* route (section 1). **Claude Code** (the terminal/IDE tool) uses the `/plugin` command (section 2). Both can also install straight from GitHub.

---

## 0. What you can download

| File | Use it for |
|---|---|
| `dist/kutuhal-3d.plugin` | Upload in Claude desktop / Cowork / claude.ai |
| `dist/kutuhal-3d.zip` | Exactly the same archive with a `.zip` name – use this if an upload dialog rejects `.plugin` |
| The whole repo (`plugins/kutuhal-3d/` inside it) | GitHub install, Claude Code `--plugin-dir`, or editing the plugin |

Both archives hold the plugin folder's contents directly, with `.claude-plugin/plugin.json` at the top level – the layout Claude's upload dialog expects.

---

## 1. Claude desktop app, Cowork, or claude.ai (upload a file)

Menu names change between app versions; the idea is always "Customize → Plugins → add → upload".

1. Open Claude (desktop app or claude.ai). For **Cowork**, open the *Cowork* tab first.
2. Open **Customize** (sidebar), then **Plugins**.
3. Click **Add** (or the **+** button) → **Upload plugin**.
4. Choose `kutuhal-3d.plugin`. If the dialog says "Only .zip files are accepted" or "Upload failed", choose `kutuhal-3d.zip` instead – same content.
5. Wait for the plugin to appear in the list as **kutuhal-3d**. If it does not show up, fully restart the app and look again.
6. Start a **new chat/task** and type `/` – you should see `make-3d-short`, `new-short`, `render-short`, `short-sound`, `short-looks` (shown as `kutuhal-3d:make-3d-short` etc.).

Notes
- Plugins you upload yourself are saved to your account and are also available in Cowork and Claude Code; on desktop they are stored locally on your computer.
- Size limits: a plugin may hold up to 5 000 files / 200 MB. Kutuhal 3D is ~6 MB.
- Hooks and sub-agents are not used by this plugin, so nothing is greyed out in chat.
- **Code execution is required.** The pipeline runs Python, Node and Chrome. In chat on the web make sure *code execution / file creation* is enabled; in Cowork the task runs on your computer and uses your installed tools.

### Updating / removing
Upload the newer file again (or remove the plugin under Customize → Plugins and re-add it). Remove it from the same list.

---

## 2. Claude Code (terminal / IDE)

### 2a. From GitHub (recommended for sharing)

After you publish the repo (see section 5):

```text
/plugin marketplace add swapnilbhange/kutuhal-3d
/plugin install kutuhal-3d@kutuhal-plugins
```

`kutuhal-plugins` is the marketplace name defined in `.claude-plugin/marketplace.json`; `kutuhal-3d` is the plugin. If the skills are not visible, restart Claude Code and check `/plugin`.

Other git hosts: `/plugin marketplace add https://gitlab.com/swapnilbhange/kutuhal-3d.git`.

> ✅ Verified: with the Claude Code CLI, `claude plugin validate` passes for the marketplace and the plugin, and `plugin marketplace add <repo folder>` followed by `plugin install kutuhal-3d@kutuhal-plugins` installs it (user scope, enabled).

### 2b. From a local folder (no GitHub needed)

```text
/plugin marketplace add /path/to/kutuhal-3d          # the repo root, where .claude-plugin/marketplace.json lives
/plugin install kutuhal-3d@kutuhal-plugins
```

### 2c. Try it without installing (development mode)

```bash
claude --plugin-dir /path/to/kutuhal-3d/plugins/kutuhal-3d
```

### 2d. Share with a whole team (project-level)

Commit this to your project's `.claude/settings.json`; teammates are prompted to install when they trust the folder:

```json
{
  "extraKnownMarketplaces": {
    "kutuhal-plugins": { "source": { "source": "github", "repo": "swapnilbhange/kutuhal-3d" } }
  },
  "enabledPlugins": { "kutuhal-3d@kutuhal-plugins": true }
}
```

### Validate, update, uninstall
```bash
claude plugin validate /path/to/kutuhal-3d            # checks marketplace.json + the plugin
/plugin marketplace update kutuhal-plugins            # pull the latest from GitHub
/plugin uninstall kutuhal-3d@kutuhal-plugins
```

Skills are namespaced by the plugin name: `/kutuhal-3d:make-3d-short`, `/kutuhal-3d:new-short`, `/kutuhal-3d:render-short`, `/kutuhal-3d:short-sound`, `/kutuhal-3d:short-looks`. You rarely need to type them – describing the job ("make a short from this script") makes Claude pick the right skill.

---

## 3. Use only the skills, no plugin system (also for Codex / ChatGPT, Gemini CLI, Antigravity)

Run `bash scripts/install-skills.sh claude` (user-wide `~/.claude/skills`, or add `--scope project`). Skills then run un-namespaced (`/make-3d-short`). The plugin route is preferred in Claude because it keeps the kit and references together.

The same script installs the skills for other AI tools – `codex`, `chatgpt`, `gemini`, `antigravity`, `generic` – see **[OTHER-AI-TOOLS.md](OTHER-AI-TOOLS.md)** for each tool's folder, commands and caveats.

---

## 4. Prepare the machine that renders

Run this once. Claude does it for you automatically (`python3 tools/doctor.py --install`) when it can, but if you want to do it yourself or Claude reports a missing tool:

### Requirements
| Tool | Version | Why |
|---|---|---|
| Python | ≥ 3.9 | TTS, alignment, audio synthesis, mixing |
| Node.js | ≥ 18 | three.js scene player and frame renderer |
| ffmpeg | any recent | encode video, loudness normalise, mux audio |
| Chrome or Chromium | any recent | headless WebGL renderer (software GL is fine – no GPU needed) |
| Disk | ~1.5 GB | Kokoro model (~330 MB) + Python/Node packages + render frames |
| RAM | 4 GB+ | 8 GB recommended for 1080p with 2 workers |
| Internet | first run only | downloads the Kokoro model from GitHub releases + pip/npm packages |

### macOS
```bash
brew install ffmpeg node python@3.12
# install Google Chrome from google.com/chrome (or: brew install --cask google-chrome)
```

### Linux (Debian / Ubuntu)
```bash
sudo apt update && sudo apt install -y ffmpeg nodejs npm python3 python3-pip
# Chrome: install the .deb from google.com/chrome, OR let Playwright fetch a Chromium:
npx playwright install chromium --with-deps
```
(Avoid the Ubuntu *snap* Chromium – it cannot be driven reliably. Use Google Chrome or the Playwright build.)

### Windows
Use **WSL 2 (Ubuntu)** and follow the Linux steps – this is the path we recommend. Native Windows may work (`winget install Gyan.FFmpeg OpenJS.NodeJS Python.Python.3.12 Google.Chrome`, then set `CHROME_PATH` to `chrome.exe`) but has **not been tested**.

### Then, inside the studio folder
```bash
python3 tools/doctor.py --install     # pip + npm install, reports anything missing
```
`doctor.py` prints `OK` / `FAIL` per dependency. The only expected `FAIL` on a fresh machine is the Kokoro model, which `narrate.py` downloads automatically on first use. If you are offline, download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the `model-files-v1.0` release of `thewh1teagle/kokoro-onnx` and put them in `<studio>/models/`.

### Environment variables
| Variable | Meaning |
|---|---|
| `CHROME_PATH` | Full path to the Chrome/Chromium binary if auto-detection fails |
| `HTTPS_PROXY` | Honoured by pip/npm/curl; needed behind a corporate proxy |

### Sanity test (≈ 10 minutes, proves the install end to end)
```bash
cd <studio>
cp -r examples/planning-fallacy projects/
node render.mjs --project projects/planning-fallacy --sheet --scale 0.5   # contact sheet in ~1 min
node render.mjs --project projects/planning-fallacy --scale 0.5           # 540p preview video
python3 audio/mix.py --project projects/planning-fallacy --video projects/planning-fallacy/build/preview.mp4
# -> projects/planning-fallacy/out/The_Planning_Fallacy.mp4
```
(The example already contains its narration, so no model download is needed for this test.)

---

## 5. Publish to GitHub so others can install it

```bash
cd kutuhal-3d                                  # the repo root of this package
# 1. replace placeholders: search for swapnilbhange in README.md and docs/
git init && git add -A && git commit -m "Kutuhal 3D 1.0.0"
gh repo create kutuhal-3d --public --source=. --push      # or create it on github.com and `git remote add origin … && git push -u origin main`
```
Then anyone can run, in Claude Code:
```text
/plugin marketplace add swapnilbhange/kutuhal-3d
/plugin install kutuhal-3d@kutuhal-plugins
```
and anyone else can download the repo as a ZIP (or use the files in `dist/`) and upload it in the Claude app.

Release checklist: bump `version` in `plugins/kutuhal-3d/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`, add a line to `CHANGELOG.md`, rebuild `dist/` (`bash scripts/build-dist.sh`), tag `v1.x.y`.

---

## 6. Check that it worked

Open a new chat and write: *"What can the Kutuhal 3D plugin do?"* – Claude should describe the script-to-Short pipeline. Then try the real thing: attach `samples/script_planning_fallacy.txt` and say *"Make a 9:16 short from this script."* The finished video should look like `samples/planning_fallacy_1080p.mp4`.

Problems? See [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
