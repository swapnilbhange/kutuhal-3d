# Writing a script Kutuhal 3D loves

You can give almost any text – a paragraph, an outline, a full production script. A little structure makes the result much better.

## Length ⇄ duration
Narration runs at about **2.25 words per second** (≈ 135 wpm). Add ~1.5 s of tail.

| Target | Words |
|---|---|
| 30 s | 60–65 |
| 45 s | 95–100 |
| 60 s | 130–135 |
| 90 s | 200 |

YouTube Shorts allow up to 3 minutes, but retention is best under 60 s.

## Shape of a good explainer Short
1. **Hook (first 3 s):** a question, a number or a contradiction. *"How long will it take? Two hours, tops."*
2. **Problem / setup (5–10 s):** the relatable situation.
3. **Concept (5–8 s):** name it. *"This is the planning fallacy."* The title card lands on this line.
4. **Explanation (8–15 s):** why it happens, one idea per sentence.
5. **Fix / takeaway (5–8 s):** what to do.
6. **Payoff line (≤ 5 s):** short, quotable. *"Plan with history, not hope."*

## Format rules
- **One paragraph = one scene.** Blank lines separate scenes.
- **One sentence = one visual idea.** Long sentences become two shots, so keep sentences ≤ 20 words.
- Write numbers as spoken ("two hours", "five thousand dollars"), spell out symbols, avoid parentheses and em-dashes in spoken lines.
- **Notes to the storyboard** (never read aloud) are any line that is wrapped in `[…]` or `(…)`, or starts with `VISUAL:`, `SCENE:`, `SHOT:`, `MUSIC:`, `SFX:`, `B-ROLL:` or `NOTE:`. Example: `[VISUAL: a student at a desk, late evening]`. They are attached to the scene and used when Claude plans the shots, music and sound effects.
- Speaker labels such as `Narrator:`, `VO:`, `Voice-over:` or `Host:` are stripped automatically.
- Dialogue quote marks are *not* removed automatically; Claude cleans them in the analysis step, but it is easier if the narration has none.
- Hard names and emphasis: tell Claude in plain words ("pronounce Diderot as dee-dro", "emphasise: two, five, buffer"). There is no rigid syntax – Claude records them in `story/script.json` (`pronounce`, `emph`). If you don't say, Claude picks 5–9 key words (numbers, the concept name, the payoff).

## Instructions that help (put them above the script, or just write them in your message)
```
FORMAT: 9:16, 45 seconds max   (free-form lines like these are read by Claude, not parsed by a tool)
VOICE: warm female, calm
STYLE: midnight (or "dark and moody with gold accents")
CHARACTER: Maya, young woman, bun, coral top
HERO PROP: a wall clock
TONE: curious, gentle
```

## Do / Don't
| Do | Don't |
|---|---|
| One recurring character at most two | A cast of six – the engine is built for 1–2 characters |
| Concrete, visual nouns (clock, notebook, phone) | Pure abstractions with nothing to show ("synergy of paradigms") – Claude will invent a metaphor, but you control it better |
| Short punchy sentences | Paragraph-long sentences with sub-clauses |
| Give the payoff its own line | Burying the point mid-paragraph |
| Real brands only if you want them as text | Copyrighted characters, logos, songs, or real people's likeness |

## Template
```
FORMAT: 9:16, ~45 s
STYLE: midnight

[VISUAL: <hook scene>]
<Hook question or shock number.>

<Setup in 2 sentences.>

<Name the concept.> <One-line definition.>

<Why it happens – 2 or 3 short sentences.>

<The fix – 2 sentences.>

<Payoff line.>
```

## Worked example
`samples/script_planning_fallacy.txt` (65 words → 30.4 s video). The finished result is `samples/planning_fallacy_1080p.mp4`, and its plan is in `samples/example_plan/` (`script.json`, `shots.json`, `words.json`).
