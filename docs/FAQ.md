# FAQ

**Can I share the plugin with others?**
Yes. Send them `dist/kutuhal-3d.plugin` (or `.zip`), or publish the repo on GitHub. The code is MIT-licensed; keep `LICENSE` and `THIRD_PARTY_NOTICES.md`.

**Do they need an Anthropic account?**
They need an AI agent that can run code: Claude (claude.ai / desktop / Cowork / Claude Code) is the tested path; OpenAI Codex / ChatGPT desktop, Gemini CLI and Google Antigravity can load the same skills (see [OTHER-AI-TOOLS.md](OTHER-AI-TOOLS.md)). The kit's scripts also run without any AI, but writing the scene code is the part the agent does.

**Is it free?**
The plugin is free and open source. Using Claude is governed by your Claude plan. Narration, music, SFX and rendering run locally and cost nothing extra.

**Does it need internet?**
Only for the first-time install (pip, npm, the ~330 MB Kokoro model). After that it runs offline (Claude itself needs a connection).

**Does it need a GPU?**
No. Rendering uses software WebGL in headless Chrome. A GPU-enabled Chrome is faster.

**Does it work on Windows?**
Use WSL 2. Native Windows is untested.

**Can it make 16:9 videos?**
Yes: `aspect: "16:9"`. Shots are authored for the chosen aspect ratio; ask Claude to re-check framing when switching.

**Can I use my own voice?**
Yes, provide the recording and a timestamped script/SRT (see USAGE → "Your own narration"). Voice *cloning* is not included.

**Which languages?**
The bundled TTS is English-centric (Kokoro voices; Hindi voices exist but quality and alignment are less tested). The pipeline's alignment uses an English dictionary.

**Can I use the videos commercially / on YouTube?**
Yes. Music and SFX are synthesised by the code (no third-party samples), Kokoro is Apache-2.0, Poppins is OFL. Check platform rules on synthetic voices/AI disclosure, which are your responsibility.

**Why do my characters look simple?**
It is a stylised low-poly look by design. Faces and bodies are procedural. You can restyle colours, hair and clothes in `cast.js`.

**How long can a video be?**
There's no hard limit, but time scales with frames (30 s = 912 frames ≈ 14 min at 1080p on 2 CPUs). Prefer ≤ 60 s Shorts; for longer videos, render in segments or on a faster machine.

**Can Claude see/hear the result?**
Claude looks at stills and contact sheets to QC visuals. It cannot listen, so judge voice and music yourself; changes are cheap (re-mix in seconds).

**Can it use real people's photos / copyrighted characters?**
No – the plugin is built for original characters and procedural props.

**How do I update to a new version?**
Re-upload the new `.plugin`, or `/plugin marketplace update kutuhal-plugins` in Claude Code.

**Something is wrong in my render – where do I start?**
`TROUBLESHOOTING.md`, then run `python3 tools/doctor.py`.

**Can I use it in ChatGPT / Gemini / Grok?**
In the desktop/CLI agents (Codex, ChatGPT desktop app, Gemini CLI, Antigravity) yes – install the skills with `scripts/install-skills.sh`. In plain chat windows (ChatGPT web/mobile, the Gemini app, Grok) no: they can't run Python, Node and Chrome on your files. Details and caveats: [OTHER-AI-TOOLS.md](OTHER-AI-TOOLS.md).
