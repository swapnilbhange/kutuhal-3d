# Analysing a script into a production plan

Input: a script (plain text, or a production script with scene headings, `[VISUAL: …]` notes, `[SFX]` tags) plus the user's instructions. Output: `story/script.json`, a short **bible**, and a **shot plan** (`story/shots.json`).

## 1. Read for structure
- Split into **scenes** (a paragraph or a heading/beat = one idea) and **units** (one sentence ≈ one visual idea). `python3 tools/draft_script.py --project projects/<slug>` (reads `input/script.txt`) does a first pass: paragraphs → scenes, sentences → units, bracketed or `VISUAL:` lines → notes. **Always review and edit the result**: merge fragments, split run-ons, fix numbers and acronyms.
- Strip everything that is not narration from the text that will be spoken (stage directions, hashtags, titles, timestamps). Keep notes as `notes` on the unit for the storyboard.
- Spoken-form pass: write numbers/units the way they are spoken ("two hours", "five thousand"), expand symbols, add commas for pauses, avoid em-dashes in speech.
- Hard words → `pronounce` map in script.json (`{"Diderot": "dee-dro"}` – respelling the TTS can read, or IPA in `/…/`).
- `emph`: 5–9 key words to be highlighted in the captions and used as visual hits (numbers, the concept's name, the payoff).

## 2. Extract the bible (write it down in `story/bible.md`)
- **Premise** in one sentence, **audience** and **tone** (curious / urgent / warm / dark).
- **Cast**: at most 1–2 recurring characters. For each: role, skin/hair/clothes colours, hair style, signature prop. These go into `scenes/cast.js` via `registerCast`.
- **World**: 1–3 reusable **sets** (a room, a street, a void stage). Reuse sets across shots; a Short with 8 distinct environments is a smell.
- **Motifs**: one hero prop that carries the metaphor (a clock, a sneaker, a scale). Introduced in shot 1, paid off in the last shot.
- **Palette/style**: pick a `STYLES` preset (midnight default, ember, arctic, neon, pastel) matching the tone – see `style-bible.md`.
- **Moods per section** for music (see `sound-design.md`).

## 3. Pacing rules (Shorts)
- Hook in the first 3 seconds: a question, number or contradiction *on screen* with the first word.
- A new visual beat every **2.5–5 s**; never hold a static composition > 6 s. Camera always moves slowly (push-in, orbit, drift).
- One idea per shot. If a sentence has two ideas (e.g. "X, but Y"), two shots or an overlay change.
- Title card (concept name) lands on the word that says it – usually the first third of the video.
- Put the payoff line on a still, calm shot; end card after the last word; captions off during the end card.
- Total length: speech + 1.2–1.8 s tail. If the user wants ≤ 60 s, check `words.json` after narration and trim the script rather than speeding up the voice.

## 4. Shot plan
After narration (`tools/narrate.py`) run `tools/beats.py --project <p>` for a draft `story/shots.json` (one shot per unit; short units are merged). Then rewrite it by hand for each shot:
`scene` (one-line description of the visual), `set`, `in` (transition), `overlays`/`overlay()` hook, `sfx` cues (`at` is seconds from shot start), `amb`, plus `music` sections for the whole video.
Time every overlay and SFX from **real word times** (`timeline/words.json`, or `X.wordTime(word, afterTime)` inside a shot module) – never guess.

## 5. Show the plan before building
Summarise in ≤ 12 lines: bible, shot list (id, time range, one-line visual), music moods. Proceed unless the user objects; when unattended, state the reading you took and go.
