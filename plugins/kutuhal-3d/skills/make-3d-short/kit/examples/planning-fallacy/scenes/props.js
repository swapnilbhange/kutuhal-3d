// Shared prop factories for this project (no registrations here; imported by sets and shots).
import { THREE, mat, glow, add, grp, RB, BOX, CAP, SPH, CYL, TOR, canvasTex } from '/engine/lib.js';

/** Wall/stand clock. group.userData.setTime(hours) with fractional hours (6.5 = 6:30). Face looks toward +z. */
export function makeClock(r = 0.3, face = 0xf4efe3, rimColor = 0xd9a62b) {
  const g = grp(null);
  add(g, CYL(r, r, 0.04, 48), mat(face, { roughness: 0.5 }), [0, 0, 0], [Math.PI / 2, 0, 0]);
  add(g, TOR(r, r * 0.07, Math.PI * 2, 10, 48), mat(rimColor, { roughness: 0.35, metalness: 0.6 }), [0, 0, 0.0]);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; add(g, BOX(r * 0.04, r * (i % 3 ? 0.1 : 0.18), 0.01), mat(0x1a1a22), [Math.sin(a) * r * 0.82, Math.cos(a) * r * 0.82, 0.025], [0, 0, -a], [1, 1, 1], false); }
  const hh = grp(g, [0, 0, 0.035]), mh = grp(g, [0, 0, 0.045]);
  add(hh, BOX(r * 0.07, r * 0.5, 0.012), mat(0x1a1a22), [0, r * 0.2, 0], [0, 0, 0], [1, 1, 1], false);
  add(mh, BOX(r * 0.05, r * 0.75, 0.012), mat(0xc0392b), [0, r * 0.3, 0], [0, 0, 0], [1, 1, 1], false);
  add(g, SPH(r * 0.06, 12, 10), mat(0xd9a62b, { metalness: 0.6 }), [0, 0, 0.055], [0, 0, 0], [1, 1, 0.5], false);
  g.userData.setTime = h => { hh.rotation.z = -h / 12 * Math.PI * 2; mh.rotation.z = -(h % 1) * Math.PI * 2; };
  g.userData.setTime(6);
  return g;
}
/** Laptop: screen normal faces +z (rotate the group by PI to face a seated person). userData.screen = glowing panel. */
export function makeLaptop() {
  const g = grp(null); const metal = mat(0xb9bcc6, { roughness: 0.35, metalness: 0.7 });
  add(g, RB(0.34, 0.016, 0.24, 0.006), metal, [0, 0.008, 0.0]);
  add(g, RB(0.3, 0.004, 0.1, 0.002), mat(0x2a2c34, { roughness: 0.8 }), [0, 0.018, 0.05], [0, 0, 0], [1, 1, 1], false);
  const lid = grp(g, [0, 0.016, -0.12]); lid.rotation.x = -0.28; g.userData.lid = lid;
  add(lid, RB(0.34, 0.225, 0.008, 0.004), metal, [0, 0.112, 0]);
  const tex = canvasTex(256, 168, (c, w, h) => { c.fillStyle = '#0f1a33'; c.fillRect(0, 0, w, h); c.fillStyle = '#1c2c55'; c.fillRect(0, 0, w, 14); for (let i = 0; i < 9; i++) { c.fillStyle = i % 3 ? '#5b8bd9' : '#8fd0ff'; c.fillRect(14 + (i % 2) * 18, 28 + i * 14, 60 + (i * 37) % 120, 6); } });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.195), new THREE.MeshBasicMaterial({ map: tex })); scr.position.set(0, 0.112, 0.0045); lid.add(scr); g.userData.screen = scr;
  return g;
}
export function makeMug(color = 0xf2f2f5) { const g = grp(null); add(g, CYL(0.04, 0.035, 0.09, 24), mat(color, { roughness: 0.4 }), [0, 0.045, 0]); add(g, TOR(0.026, 0.007, Math.PI, 8, 16), mat(color, { roughness: 0.4 }), [0.043, 0.047, 0], [0, 0, -Math.PI / 2]); add(g, CYL(0.034, 0.034, 0.004, 20), mat(0x3a2412), [0, 0.088, 0], [0, 0, 0], [1, 1, 1], false); return g; }
/** Open notebook; userData.draw(k) fills in rows with ticks (k 0..1) */
export function makeNotebook() {
  const g = grp(null);
  const tex = canvasTex(512, 360, () => { });
  const draw = k => { const c = tex.userData.g; c.fillStyle = '#f6f1e4'; c.fillRect(0, 0, 512, 360); c.fillStyle = '#d8d2c0'; c.fillRect(254, 0, 4, 360);
    for (let i = 0; i < 6; i++) { const y = 50 + i * 52; c.fillStyle = '#b9b2a0'; c.fillRect(30, y + 14, 200, 3); c.fillRect(280, y + 14, 200, 3); c.fillStyle = '#44506e'; c.fillRect(34, y, 70 + (i * 41) % 90, 8);
      const a = Math.max(0, Math.min(1, k * 6 - i)); if (a > 0) { c.strokeStyle = '#2fa86a'; c.lineWidth = 7; c.beginPath(); c.moveTo(300, y + 4); c.lineTo(310 + 14 * a, y + 4 + 14 * a); if (a > 0.5) c.lineTo(340 + 30 * (a - 0.5) * 2, y - 20 * (a - 0.5) * 2); c.stroke(); } }
    tex.needsUpdate = true; };
  draw(0); add(g, BOX(0.42, 0.012, 0.3), mat(0x2b3a66, { roughness: 0.7 }), [0, 0.006, 0]);
  const pg = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.28), new THREE.MeshBasicMaterial({ map: tex })); pg.rotation.x = -Math.PI / 2; pg.position.y = 0.0125; g.add(pg);
  g.userData.draw = draw; return g;
}
