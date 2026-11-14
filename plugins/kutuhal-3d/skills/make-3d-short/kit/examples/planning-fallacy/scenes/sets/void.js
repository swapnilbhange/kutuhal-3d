import { registerSet } from '/engine/core.js';
import { THREE, mat, glow, add, grp, BOX, CYL, TOR, rnd } from '/engine/lib.js';
// Dark stage with a glowing ring: for title cards and end cards.
registerSet('void', X => {
  const g = grp(null);
  add(g, CYL(9, 9, 0.2, 64), mat(0x0e1428, { roughness: 0.25, metalness: 0.5 }), [0, -0.1, 0]);
  add(g, TOR(1.7, 0.02, Math.PI * 2, 8, 80), glow(0xffd23f, 2.5), [0, 0.01, 0], [Math.PI / 2, 0, 0], [1, 1, 1], false);
  add(g, TOR(2.6, 0.012, Math.PI * 2, 8, 80), glow(0x6d8cff, 1.5), [0, 0.01, 0], [Math.PI / 2, 0, 0], [1, 1, 1], false);
  add(g, BOX(60, 30, 0.2), mat(0x070b18, { roughness: 1 }), [0, 10, -9]);
  return g;
});
