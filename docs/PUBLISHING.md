# Publishing Kutuhal 3D on GitHub

1. **Unzip** the package; the folder `kutuhal-3d/` is the repository root.
2. **Set your username:** `./scripts/set-github-user.sh YOURNAME` (replaces `<your-github-username>` in the README and docs).
3. **Set your git identity** (the package has no `.git`, so nothing to amend):
   ```bash
   cd kutuhal-3d
   git init -b main
   git config user.name "Your Name"
   git config user.email "<your GitHub noreply email>"   # Settings → Emails
   ```
4. **Commit and push:**
   ```bash
   git add -A && git commit -m "Kutuhal 3D 1.1.0"
   gh repo create kutuhal-3d --public --source=. --push
   # or: create an empty repo on github.com, then
   # git remote add origin https://github.com/YOURNAME/kutuhal-3d.git && git push -u origin main
   ```
5. **Repo settings:** add a description, topics (`claude-code`, `agent-skills`, `three-js`, `video-generation`, `shorts`), and keep the repo **public** so `/plugin marketplace add` works for others.
6. **Release:** create release `v1.1.0` and attach `dist/kutuhal-3d.plugin` and `dist/kutuhal-3d.zip` for people who only want to upload the plugin.
7. **Test as a stranger:**
   ```text
   /plugin marketplace add YOURNAME/kutuhal-3d
   /plugin install kutuhal-3d@kutuhal-plugins
   ```
8. **Size note:** `samples/planning_fallacy_1080p.mp4` is ≈ 35 MB (under GitHub's 100 MB file limit). Delete it and keep the 540p preview if you want a lighter repo.

Later releases: bump `version` in `plugins/kutuhal-3d/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`, update `CHANGELOG.md`, run `./scripts/build-dist.sh`, tag, and attach the new `dist/` files.
