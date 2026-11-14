---
name: short-looks
description: >
  This skill should be used when the user runs /short-looks or asks to "show me style options", "compare the
  looks", "pick a visual style", "make it warmer / darker / more neon", "change the colour grade" or "create a
  custom style" for a Kutuhal 3D project. It renders the same frames in five presets (midnight, ember,
  arctic, neon, pastel) as a comparison grid, records the choice in config.json, and builds custom styles.
metadata:
  version: "1.0.0"
---

# /short-looks: style presets and custom looks

Read `../make-3d-short/references/style-bible.md`.

1. Pick 3 representative times (a hook, a mid scene, the payoff) and run
   `node render.mjs --project P --styles midnight,ember,arctic,neon,pastel --at 3.5,12,20` → `build/styles/style_grid.png`. Show it to the user.
2. Record the choice: `"style": "<id>"` in `config.json`.
3. Custom style: add an entry to `STYLES` in `engine/styles.js` (ui colours, grade CSS filter, vignette, grain) and select it by id; re-run the grid.
4. After a look change, re-run the contact sheet (`--sheet`) – overlays and captions may need a contrast check.
