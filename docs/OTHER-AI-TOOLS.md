# Using Kutuhal 3D in other AI tools

Kutuhal 3D's brain is five **skills** – folders with a `SKILL.md` – and a bundled **studio kit** of ordinary Python/Node scripts. The `SKILL.md` folder format is an open standard (the *Agent Skills* format) that Claude Code, OpenAI Codex / ChatGPT, Gemini CLI and Google Antigravity all load. That means the same folders can be installed in each of them; only the *folder location* and the *install command* differ.

> **Status of this guide.** I verified the Claude Code plugin install with the Claude Code CLI, and I verified that the installer script places the skills correctly for every tool below. I have **not** been able to run Kutuhal 3D inside Codex, ChatGPT, Gemini or Antigravity themselves. The locations and commands come from each vendor's documentation (linked at the end); if something differs in your version, the vendor docs win – and please open an issue.

## 1 · At a glance

| Tool | Can run Kutuhal 3D? | How | Where skills live |
|---|---|---|---|
| **Claude Code – CLI** | ✅ Yes (tested) | Plugin: `/plugin marketplace add …` · or skills via installer | plugin cache · or `~/.claude/skills` / `.claude/skills` |
| **Claude Code – desktop app / IDE extension** | ✅ Yes | Same `/plugin` commands as the CLI (menu names vary by version) | same as CLI |
| **Claude desktop app, Cowork, claude.ai** | ✅ Yes (needs code execution) | Customize → Plugins → Add → Upload plugin | managed by the app |
| **OpenAI Codex CLI / IDE extension** | ✅ Should work (skills standard) | Installer `codex` or copy folders | `~/.agents/skills` (user) · `.agents/skills` (repo) |
| **ChatGPT desktop app (Codex / skills)** | ⚠️ Probably, untested | Standalone skills are supported in the desktop app; use the Codex route above | `~/.agents/skills` |
| **ChatGPT web / mobile chat** | ❌ Not practical | Only plugin-bundled skills are available there, in a chat sandbox without Chrome/ffmpeg/your files; Kutuhal 3D isn't packaged as an OpenAI plugin | – |
| **Gemini CLI** | ✅ Should work (skills standard) | `gemini skills install …` or installer `gemini` | `~/.gemini/skills` (user) · `.gemini/skills` (workspace); alias `~/.agents/skills` |
| **Gemini app (web / phone chat)** | ❌ No | A chat window can't run Python/Node/Chrome on your files – use Gemini CLI or Antigravity | – |
| **Google Antigravity (IDE)** | ✅ Should work (skills standard) | Installer `antigravity` or copy folders | `.agents/skills` (workspace) · `~/.gemini/antigravity/skills` (global) |
| **Cursor, Windsurf, other agent IDEs** | ⚠️ Depends | Use `AGENTS.md` (included) or their skills folder | see that tool's docs |
| **Grok** | ❓ Unverified | I found no documented skills system – use the manual route (§8) | – |

**What an agent needs to run the pipeline:** a shell (Python ≥ 3.9, Node ≥ 18, ffmpeg, Chrome/Chromium), read/write access to a workspace folder, internet on first run (Kokoro model ≈ 330 MB), and – for the visual QC loop – the ability to **look at PNG/JPG images**. A model that writes good JavaScript and follows long instructions gives the best scenes.

## 2 · The one-command installer

From the repo folder (macOS / Linux / WSL / Git Bash):

```bash
bash scripts/install-skills.sh <claude|codex|chatgpt|gemini|antigravity|generic> [--scope user|project] [--link] [--dest DIR] [--dry-run]
```

| Command | Installs the five skills into |
|---|---|
| `bash scripts/install-skills.sh claude` | `~/.claude/skills` |
| `bash scripts/install-skills.sh claude --scope project` | `./.claude/skills` |
| `bash scripts/install-skills.sh codex` (or `chatgpt`, `generic`) | `~/.agents/skills` |
| `bash scripts/install-skills.sh codex --scope project` | `./.agents/skills` |
| `bash scripts/install-skills.sh gemini` | `~/.gemini/skills` |
| `bash scripts/install-skills.sh gemini --scope project` | `./.gemini/skills` |
| `bash scripts/install-skills.sh antigravity` | `~/.gemini/antigravity/skills` |
| `bash scripts/install-skills.sh antigravity --scope project` | `./.agents/skills` |

`--link` creates symlinks instead of copies (handy while editing the skills), `--dry-run` only prints what would happen. **Always install all five skills together** – the stage skills load `../make-3d-short/references/…`, so the folders must be siblings. After installing, restart the tool or open a new session.

Windows without WSL (PowerShell):
```powershell
$dest = "$HOME\.agents\skills"      # or $HOME\.gemini\skills, $HOME\.gemini\antigravity\skills, $HOME\.claude\skills
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item -Recurse -Force plugins\kutuhal-3d\skills\* $dest
```

## 3 · Claude Code (CLI, desktop app, IDE extensions)

**Preferred – as a plugin** (everything stays together and updates with `/plugin marketplace update`):
```text
/plugin marketplace add swapnilbhange/kutuhal-3d        # or a local path to the repo folder
/plugin install kutuhal-3d@kutuhal-plugins
```
Try it without installing: `claude --plugin-dir /path/to/kutuhal-3d/plugins/kutuhal-3d`.
**Alternative – as plain skills:** `bash scripts/install-skills.sh claude` (commands are then un-namespaced: `/make-3d-short`).
In the **Claude desktop app chat / Cowork / claude.ai** use *Customize → Plugins → Add → Upload plugin* with `dist/kutuhal-3d.plugin` (or `.zip`). Details: [INSTALL.md](INSTALL.md).

## 4 · OpenAI Codex CLI, IDE extension and the ChatGPT desktop app

Skills are folders with `SKILL.md`; Codex scans `.agents/skills` from your working directory up to the repo root, plus `~/.agents/skills` for your user.

```bash
bash scripts/install-skills.sh codex                 # user-wide  → ~/.agents/skills
# or per repo:
cd my-videos && /path/to/kutuhal-3d/scripts/install-skills.sh codex --scope project
```
Then start Codex in your working folder:
- type `$` (or run `/skills`) and pick **make-3d-short**, or just describe the job – Codex can pick the skill when your request matches its description;
- attach/point to your script: *"Use $make-3d-short on ./script.txt – 9:16, 45 s, midnight style."*
- if a new skill doesn't show up, restart Codex.

Tips
- The repo includes an `AGENTS.md`; open the **repo itself** as your working folder and Codex will read it and know where the pipeline lives, even without installing skills.
- Codex shortens skill descriptions when many skills are installed; Kutuhal 3D's descriptions front-load the key trigger words ("script", "short", "video").
- **ChatGPT desktop app:** standalone skills are available there as well (see *Skills* in its sidebar), and it hosts Codex – use the same folders. **ChatGPT on the web/mobile** only loads skills that are bundled in a *plugin*, which uses OpenAI's own plugin packaging; Kutuhal 3D is not packaged that way, and those chats don't have a machine with Chrome and your files. If you want an OpenAI-plugin build, ask for it (OpenAI's `plugin-creator` skill converts skills into plugins).
- Run long renders in the background (`nohup … &`) and poll the log if the tool's command timeout is short.

## 5 · Gemini CLI

Gemini CLI has native skills. Either use the installer or Gemini's own commands:

```bash
# user scope (~/.gemini/skills or ~/.agents/skills)
gemini skills install /path/to/kutuhal-3d/plugins/kutuhal-3d/skills
# workspace scope (.gemini/skills or .agents/skills)
gemini skills install /path/to/kutuhal-3d/plugins/kutuhal-3d/skills --scope workspace
# during development: symlink instead of copying
gemini skills link /path/to/kutuhal-3d/plugins/kutuhal-3d/skills --scope workspace
# or
bash scripts/install-skills.sh gemini
```
Check with `gemini skills list` (or `/skills` in a session). Gemini loads each skill's name and description at session start and activates the full instructions on demand.
Open the repo as your workspace to also get the included `GEMINI.md` (identical to `AGENTS.md`). The consumer **Gemini app** (web/phone) can't run the pipeline.

If `gemini skills install <dir>` installs only a single skill in your version, run it once per folder (`…/skills/make-3d-short`, `…/new-short`, `…/render-short`, `…/short-sound`, `…/short-looks`) or use the installer script.

## 6 · Google Antigravity

Antigravity supports skills in two scopes: **workspace** `<workspace>/.agents/skills/` and **global** `~/.gemini/antigravity/skills/` (older builds and some guides use `.agent/skills/` – if the skills don't appear, try that spelling). It also reads `AGENTS.md` / `GEMINI.md` rules.

```bash
bash scripts/install-skills.sh antigravity                  # global
bash scripts/install-skills.sh antigravity --scope project  # this workspace (.agents/skills)
```
Open your video folder as the workspace, start an agent task and say *"Make a 9:16 short from `script.txt`"*. Restart Antigravity if the skills don't show up. Antigravity can drive its own browser; Kutuhal 3D doesn't need it – it uses Chrome through the kit's `render.mjs`, so make sure Chrome/Chromium is installed (or `CHROME_PATH` is set).

## 7 · Cursor and other agent IDEs
Many accept `AGENTS.md`: open the repo as the workspace and the included `AGENTS.md` points the agent to the skill. If the tool has a skills folder, copy the five skill folders there; if it has neither, paste `plugins/kutuhal-3d/skills/make-3d-short/SKILL.md` into the chat/rules and keep the folder reachable so the agent can read `references/` and `kit/`.

## 8 · No skills system at all (Grok, plain chat models, scripts)
The studio kit works without any AI framework:
```bash
cp -r plugins/kutuhal-3d/skills/make-3d-short/kit ./studio && cd studio
python3 tools/doctor.py --install
python3 tools/new_project.py --name my-short --script my_script.txt --title "My Short"
python3 tools/draft_script.py --project projects/my-short
python3 tools/narrate.py --project projects/my-short
python3 tools/beats.py --project projects/my-short
# write scenes/*.js with any capable coding model, using references/engine-api.md and examples/planning-fallacy as templates
node render.mjs --project projects/my-short --sheet --scale 0.5
node render.mjs --project projects/my-short && python3 audio/mix.py --project projects/my-short
```
A chat model without a shell can still help you *write the scene files* from the API reference; you run the commands.

## 9 · What differs when it isn't Claude
- **Scene quality** depends on the model writing the three.js modules and judging contact sheets. Expect more QC rounds with weaker models.
- **Tool names** in the skill text are Claude's (`SendUserFile`, `AskUserQuestion`, task list). `make-3d-short/SKILL.md` contains a mapping table to the generic equivalents (view image, print path, plain questions), so other agents can follow it.
- **Image viewing:** if the agent can't view images, it can't self-check frames – review `build/sheets/*.png` yourself.
- **Command timeouts:** rendering takes minutes; the agent should background it and poll.

## Sources
- OpenAI Codex skills: <https://developers.openai.com/codex/skills> · ChatGPT & Codex skills: <https://learn.chatgpt.com/codex/skills>, <https://learn.chatgpt.com/docs/build-skills>
- Gemini CLI skills: <https://geminicli.com/docs/cli/creating-skills/>
- Antigravity skills: <https://www.antigravity.google/docs/ide/skills> · codelab <https://codelabs.developers.google.com/getting-started-with-antigravity-skills>
- Agent Skills open format: <https://agentskills.io>
- Claude Code plugins: <https://code.claude.com/docs/en/plugin-marketplaces> · Claude plugins in apps: <https://claude.com/docs/plugins/overview>
