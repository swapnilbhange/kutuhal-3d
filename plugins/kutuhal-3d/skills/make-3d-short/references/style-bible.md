# Look & shot vocabulary

**Look:** stylised low-poly 3D, soft materials, rounded procedural characters (bean-limbed humans with big eyes, hair styles `bun`, `wig` or the default short cut), a moody key/rim/fill rig, a vignette + grain + colour grade from the chosen STYLE. Backgrounds are simple sets with one strong practical light (window, lamp, screen) and a glowing hero prop.

## Style presets (`engine/styles.js` → `config.style`)
| id | feel | use for |
|---|---|---|
| midnight (default) | deep navy + gold | psychology, finance, explainers |
| ember | warm black + orange | history, drama, motivation |
| arctic | cold teal + white | science, tech, calm |
| neon | magenta/cyan on black | tech, gaming, future |
| pastel | soft light | lifestyle, kids, wellness |
Compare looks with `node render.mjs --project P --styles midnight,ember,arctic,neon,pastel --at 3.5,12,20` → `build/styles/style_grid.png`.

## Mood lights (`X.light(mood, {focus, over})`)
`day, golden, dusk, night, warmInterior, coolInterior, studio, void`. `focus:[x,y,z]` aims the key light at the subject; `over:{ki:130, bg:0x112233}` tweaks. Add colour with `X.accent(color, intensity, [x,y,z])` – e.g. screen glow on a face, window light.

## Shot vocabulary
- **Establishing** – wide, slow push-in, character small in a set.
- **Orbit** – `X.orbit` around a subject to add depth during exposition.
- **Insert / macro** – tight on a prop (clock, phone) while the narration names it.
- **Top-down** – desk/notebook/map; good for lists and diagrams.
- **Void stage** – dark disc + ring + floating hero prop for titles and the final line.
- **Transitions** – `cut` (default), `fade`, `dip`, `dipWhite`, `flash` (use `flash` for the title only).
- **Overlays** over the 3D: `stat`, `counter`, `bars`, `list`, `big`, `quote`, `toast`, `title`, `end`.

## Framing rules (9:16)
- The bottom ~28 % belongs to captions. The engine lifts the 3D view by `X.lift(px)` (default 230 px with captions) – keep subjects in the upper 70 %. Overlays sit at `top`/`upper` (not `low`).
- Characters face +z at rotation.y = 0; seated characters should have a desk or prop in front so the body language reads.
- Maximum 1 overlay group on screen at once; give each ≥ 1.2 s.
- Move the camera in every shot (≥ 15 % change in distance or ≥ 20° orbit).

## Quality bar (check on the contact sheet)
No clipped hero prop, no overlay covering a face, caption never covering the subject, arms/hands plausible on every pose, colours consistent with the style, no flat empty frame.
