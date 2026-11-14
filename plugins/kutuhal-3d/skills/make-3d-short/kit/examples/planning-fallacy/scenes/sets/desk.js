import { registerSet } from '/engine/core.js';
import { THREE, mat, glow, add, grp, RB, BOX, CYL, rnd } from '/engine/lib.js';
import { makeClock, makeLaptop, makeMug, makeNotebook } from '../props.js';

// A student's room at night. Back wall at z=-2.6, desk in front of it, camera looks toward -z.
registerSet('desk', X => {
  const g = grp(null), wood = mat(0x6a4a30, { roughness: 0.55 });
  add(g, BOX(16, 0.2, 14), mat(0x4a3426, { roughness: 0.6 }), [0, -0.1, -1]);
  for (let i = -8; i <= 8; i++) add(g, BOX(0.012, 0.002, 14), mat(0x2e1f15), [i * 0.5, 0.002, -1], [0, 0, 0], [1, 1, 1], false);
  add(g, BOX(16, 6, 0.2), mat(0x2d3a63, { roughness: 0.9 }), [0, 3, -2.7]);
  add(g, BOX(0.2, 6, 14), mat(0x2a3560, { roughness: 0.9 }), [-5, 3, 0]); add(g, BOX(0.2, 6, 14), mat(0x2a3560, { roughness: 0.9 }), [5, 3, 0]);
  add(g, BOX(16, 0.12, 0.08), mat(0x1c2442), [0, 0.06, -2.58], [0, 0, 0], [1, 1, 1], false);
  // window with sky that can shift dusk -> night
  const win = add(g, BOX(1.5, 1.4, 0.06), glow(0xc0703c, 1.1), [-1.6, 2.15, -2.58], [0, 0, 0], [1, 1, 1], false);
  for (const [w, h, x, y] of [[1.6, 0.06, 0, 0], [0.06, 1.5, 0, 0], [1.6, 0.08, 0, 0.7], [1.6, 0.08, 0, -0.7], [0.08, 1.5, 0.75, 0], [0.08, 1.5, -0.75, 0]]) add(g, BOX(w, h, 0.1), wood, [-1.6 + x, 2.15 + y, -2.55], [0, 0, 0], [1, 1, 1], false);
  g.userData.setSky = k => { const c = new THREE.Color(0xc0703c).lerp(new THREE.Color(0x182a58), Math.min(1, Math.max(0, k))); win.material.emissive.copy(c); };
  // wall clock + framed poster
  const clock = makeClock(0.3); clock.position.set(1.7, 2.45, -2.58); g.add(clock); g.userData.clock = clock;
  add(g, BOX(0.7, 0.5, 0.03), mat(0xf0e7d0), [0.2, 2.2, -2.58], [0, 0, 0], [1, 1, 1], false); add(g, BOX(0.6, 0.4, 0.04), mat(0x4a6fb8), [0.2, 2.2, -2.57], [0, 0, 0], [1, 1, 1], false);
  // shelf with books
  const shelf = grp(g, [3.1, 0, -2.35]); add(shelf, BOX(1.4, 2.2, 0.4), wood, [0, 1.1, 0]);
  for (let r = 0; r < 4; r++) { add(shelf, BOX(1.36, 0.04, 0.42), mat(0x3a2818), [0, 0.3 + r * 0.55, 0.0], [0, 0, 0], [1, 1, 1], false); for (let i = 0; i < 10; i++) add(shelf, BOX(0.1, 0.36 + rnd(i + r * 7) * 0.1, 0.28), mat([0xc0463a, 0x3a7bd5, 0xd9a62b, 0x3fa66b, 0x8a5ad6][(i + r) % 5], { roughness: 0.7 }), [-0.58 + i * 0.125, 0.52 + r * 0.55, 0.08], [0, 0, 0], [1, 1, 1], false); }
  // desk + chair (Maya sits at z=-1.2 facing +z)
  const desk = grp(g, [0, 0, -0.55]); add(desk, RB(2.0, 0.06, 0.9, 0.02), wood, [0, 0.72, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(desk, RB(0.07, 0.7, 0.07, 0.012), wood, [sx * 0.92, 0.35, sz * 0.38]);
  const chair = grp(g, [0, 0, -1.3]); add(chair, RB(0.5, 0.06, 0.48, 0.02), mat(0x23283c), [0, 0.42, 0]); add(chair, RB(0.46, 0.5, 0.05, 0.02), mat(0x23283c), [0, 0.7, -0.22], [0.08, 0, 0]);
  add(chair, CYL(0.03, 0.03, 0.4, 12), mat(0x15171f), [0, 0.2, 0]); add(chair, CYL(0.26, 0.26, 0.03, 20), mat(0x15171f), [0, 0.02, 0]);
  // things on the desk
  const lap = makeLaptop(); lap.position.set(0, 0.75, -0.5); lap.rotation.y = Math.PI; g.add(lap); g.userData.laptop = lap;
  const mug = makeMug(0xe8624a); mug.position.set(-0.55, 0.75, -0.45); g.add(mug);
  const nb = makeNotebook(); nb.position.set(0.62, 0.75, -0.5); nb.rotation.y = 0.12; g.add(nb); g.userData.notebook = nb;
  g.userData.deskTop = 0.75; return g;
});
