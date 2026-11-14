import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export { THREE };

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sm = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const eo = t => 1 - Math.pow(1 - clamp(t), 3);
export const ob = t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function mat(color, o = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...o }); }
export function basic(color, o = {}) { return new THREE.MeshBasicMaterial({ color, ...o }); }
export function glow(color, k = 1.0, o = {}) { return new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: k, ...o }); }
export function add(parent, geo, m, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], shadow = true) {
  const me = new THREE.Mesh(geo, m);
  me.position.set(...p); me.rotation.set(...r); me.scale.set(...s);
  me.castShadow = shadow; me.receiveShadow = true;
  if (parent) parent.add(me);
  return me;
}
export const grp = (parent, p = [0, 0, 0]) => { const g = new THREE.Group(); g.position.set(...p); if (parent) parent.add(g); return g; };
export const RB = (w, h, d, r = 0.03, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, r);
export const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
export const CAP = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 16);
export const SPH = (r, w = 28, h = 18) => new THREE.SphereGeometry(r, w, h);
export const CYL = (rt, rb, h, s = 32) => new THREE.CylinderGeometry(rt, rb, h, s);
export const TOR = (r, t, arc = Math.PI * 2, rs = 10, ts = 36) => new THREE.TorusGeometry(r, t, rs, ts, arc);

// ---------- textures ----------
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData.canvas = c; t.userData.g = g; return t;
}
let _star, _dot;
export function starTex() {
  if (_star) return _star;
  _star = canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.15, 'rgba(255,236,170,0.9)'); gr.addColorStop(1, 'rgba(255,220,120,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.beginPath(); g.moveTo(64, 2); g.lineTo(70, 58); g.lineTo(126, 64); g.lineTo(70, 70); g.lineTo(64, 126); g.lineTo(58, 70); g.lineTo(2, 64); g.lineTo(58, 58); g.closePath(); g.fill();
  });
  return _star;
}
export function dotTex() {
  if (_dot) return _dot;
  _dot = canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  return _dot;
}
export function sprite(tex, color, size, opacity = 1) {
  const m = new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
  const s = new THREE.Sprite(m); s.scale.set(size, size, size); return s;
}

// sparkle field
export function makeSparkles(parent, n, radius, seed = 1) {
  const g = grp(parent); const list = [];
  for (let i = 0; i < n; i++) {
    const s = sprite(starTex(), 0xffe9a8, 0.08, 0);
    const a = rnd(seed + i * 3.1) * Math.PI * 2, b = rnd(seed + i * 5.7) * 2 - 1, r = radius * (0.4 + 0.6 * rnd(seed + i * 7.3));
    s.userData = { p: [Math.cos(a) * r * Math.sqrt(1 - b * b), b * r, Math.sin(a) * r * Math.sqrt(1 - b * b)], ph: rnd(seed + i * 11.7), sp: 0.8 + rnd(seed + i * 2.3) * 1.4, sz: 0.5 + rnd(seed + i) };
    s.position.set(...s.userData.p); g.add(s); list.push(s);
  }
  g.userData.update = (t, amt, size = 0.12) => {
    list.forEach(s => {
      const u = s.userData, k = (t * u.sp + u.ph) % 1, tw = Math.sin(k * Math.PI);
      s.material.opacity = amt * tw * tw; const z = size * u.sz * (0.4 + tw);
      s.scale.set(z, z, z);
      s.position.set(u.p[0], u.p[1] + k * 0.15, u.p[2]);
    });
  };
  return g;
}

// ---------- sneakers ----------
function taper(g) {
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i); let k = 1;
    k *= 1 - 0.38 * sm((x - 0.02) / 0.19);          // narrow toe
    k *= 1 - 0.14 * sm((-x - 0.0) / 0.14) * sm((y - 0.05) / 0.09); // narrow ankle/heel top
    pos.setZ(i, pos.getZ(i) * k);
  }
  pos.needsUpdate = true; g.computeVertexNormals(); return g;
}
let _sneakerGeo;
function sneakerGeos() {
  if (_sneakerGeo) return _sneakerGeo;
  const up = new THREE.Shape();
  up.moveTo(-0.125, 0.0); up.lineTo(0.12, 0.0);
  up.bezierCurveTo(0.17, 0.0, 0.2, 0.018, 0.195, 0.042);
  up.bezierCurveTo(0.185, 0.064, 0.14, 0.074, 0.1, 0.078);
  up.bezierCurveTo(0.06, 0.084, 0.04, 0.105, 0.012, 0.128);
  up.bezierCurveTo(-0.01, 0.145, -0.05, 0.15, -0.082, 0.143);
  up.bezierCurveTo(-0.118, 0.132, -0.14, 0.095, -0.14, 0.05);
  up.bezierCurveTo(-0.14, 0.02, -0.133, 0.005, -0.125, 0.0);
  const ug = taper(new THREE.ExtrudeGeometry(up, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.016, bevelSegments: 6, curveSegments: 24 }));
  ug.translate(0, 0, -0.025);
  const so = new THREE.Shape();
  so.moveTo(-0.14, -0.032); so.lineTo(0.185, -0.032);
  so.bezierCurveTo(0.22, -0.03, 0.225, 0.0, 0.205, 0.014);
  so.lineTo(-0.135, 0.014); so.bezierCurveTo(-0.16, 0.0, -0.16, -0.025, -0.14, -0.032);
  const sg = taper(new THREE.ExtrudeGeometry(so, { depth: 0.056, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.01, bevelSegments: 4, curveSegments: 20 }));
  sg.translate(0, 0, -0.028);
  _sneakerGeo = { ug, sg }; return _sneakerGeo;
}
export function makeSneaker(o = {}) {
  const g = new THREE.Group(); const { ug, sg } = sneakerGeos();
  const upper = mat(o.upper ?? 0xf6f6f8, { roughness: o.rough ?? 0.4 });
  const sole = mat(o.sole ?? 0xffffff, { roughness: 0.5 });
  const acc = mat(o.accent ?? 0xd9a62b, { roughness: 0.35, metalness: o.accentMetal ?? 0.35 });
  const lace = mat(o.lace ?? 0xffffff, { roughness: 0.7 });
  // sole sits so its bottom is at y=-0.06 relative to the ankle origin
  const body = grp(g, [0, -0.028, 0]);
  add(body, sg, sole, [0, -0.0, 0]);
  add(body, ug, upper, [0, 0.0, 0]);
  add(body, BOX(0.31, 0.012, 0.01), mat(o.sole2 ?? 0xd9d3c4, { roughness: 0.7 }), [0.03, -0.012, 0.0], [0, 0, 0], [1, 1, 1], false);
  // laces on the vamp
  for (let i = 0; i < 4; i++) { const t = i / 3; add(body, RB(0.012, 0.01, 0.062, 0.004), lace, [0.075 - t * 0.075, 0.087 + t * 0.04, 0], [0, 0, 0.62 + t * 0.1], [1, 1, 1], false); }
  // tongue + collar
  add(body, RB(0.03, 0.05, 0.04, 0.012), mat(o.collar ?? 0xe9e9ee, { roughness: 0.8 }), [-0.014, 0.145, 0], [0, 0, 0.45], [1, 1, 1], false);
  add(body, TOR(0.045, 0.01, Math.PI * 1.7, 8, 22), mat(o.collar ?? 0xe9e9ee, { roughness: 0.8 }), [-0.07, 0.14, 0], [Math.PI / 2, 0, 0], [1, 1.1, 0.5], false);
  // accent stripes both sides
  for (const s of [-1, 1]) {
    add(body, RB(0.1, 0.016, 0.004, 0.003), acc, [0.0, 0.07, s * 0.049], [0, 0, 0.55], [1, 1, 1], false);
    add(body, RB(0.04, 0.03, 0.004, 0.003), acc, [-0.085, 0.07, s * 0.047], [0, 0, 0.1], [1, 1, 1], false);
  }
  add(body, RB(0.012, 0.05, 0.03, 0.004), acc, [-0.152, 0.07, 0], [0, 0, 0], [1, 1, 1], false);
  g.userData.scuff = o.scuff;
  return g;
}

// ---------- props ----------
export function makeBag(color, color2 = 0xffffff, w = 0.34, h = 0.42, d = 0.16) {
  const g = new THREE.Group();
  add(g, RB(w, h, d, 0.012), mat(color, { roughness: 0.55 }), [0, h / 2, 0]);
  add(g, RB(w * 0.72, h * 0.12, d + 0.004, 0.006), mat(color2, { roughness: 0.5 }), [0, h * 0.62, 0]);
  add(g, TOR(w * 0.2, 0.008, Math.PI, 8, 18), mat(0x111111, { roughness: 0.6 }), [-w * 0.2, h, 0], [0, 0, 0]);
  add(g, TOR(w * 0.2, 0.008, Math.PI, 8, 18), mat(0x111111, { roughness: 0.6 }), [w * 0.2, h, 0], [0, 0, 0]);
  return g;
}

export function makeBackpack(o = {}) {
  const g = new THREE.Group();
  const body = mat(o.color ?? 0x7a7f6a, { roughness: o.rough ?? 0.9 });
  const trim = mat(o.trim ?? 0x3b3d33, { roughness: 0.85 });
  add(g, RB(0.34, 0.46, 0.18, 0.06, 4), body, [0, 0.25, 0]);
  add(g, RB(0.26, 0.2, 0.08, 0.035), body, [0, 0.14, 0.12]);
  add(g, RB(0.2, 0.02, 0.085, 0.01), trim, [0, 0.235, 0.125]);
  add(g, RB(0.30, 0.05, 0.19, 0.02), trim, [0, 0.43, 0]);
  add(g, TOR(0.05, 0.012, Math.PI, 8, 18), trim, [0, 0.5, 0]);
  for (const s of [-1, 1]) add(g, RB(0.045, 0.34, 0.02, 0.008), trim, [s * 0.1, 0.25, -0.1]);
  if (o.zip) add(g, RB(0.012, 0.012, 0.012, 0.004), mat(0xd9a62b, { metalness: 0.7, roughness: 0.3 }), [0, 0.235, 0.17]);
  return g;
}

export function makeWatch(o = {}) {
  const g = new THREE.Group();
  const strap = mat(o.strap ?? 0x3a2a1f, { roughness: 0.85 });
  const caseM = mat(o.caseColor ?? 0x9a9a9f, { metalness: 0.7, roughness: 0.35 });
  const dial = mat(o.dial ?? 0xe8e4da, { roughness: 0.5 });
  const R = o.r ?? 0.06;
  add(g, TOR(R, 0.012, Math.PI * 2, 8, 32), strap, [0, 0, 0], [Math.PI / 2, 0, 0], [1, 1, 1], false);
  add(g, CYL(0.04, 0.04, 0.016, 32), o.gold ? mat(0xd9a62b, { metalness: 0.9, roughness: 0.25 }) : caseM, [0, 0, R + 0.012], [Math.PI / 2, 0, 0]);
  add(g, CYL(0.034, 0.034, 0.004, 32), dial, [0, 0, R + 0.0215], [Math.PI / 2, 0, 0]);
  const hand1 = add(g, BOX(0.003, 0.026, 0.002), mat(0x111111), [0, 0.008, R + 0.025], [0, 0, 0], [1, 1, 1], false);
  const hand2 = add(g, BOX(0.003, 0.018, 0.002), mat(0x111111), [0.007, 0, R + 0.025], [0, 0, -1.2], [1, 1, 1], false);
  g.userData.hands = [hand1, hand2];
  return g;
}

export function makePhone(canvasTexture) {
  const g = new THREE.Group();
  add(g, RB(0.075, 0.155, 0.009, 0.01), mat(0x15161a, { roughness: 0.3, metalness: 0.4 }), [0, 0, 0]);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.146), new THREE.MeshBasicMaterial({ map: canvasTexture }));
  scr.position.z = 0.0051; g.add(scr);
  g.userData.screen = scr;
  return g;
}

export function makeJeans(color = 0x264a82) {
  const g = new THREE.Group();
  const m = mat(color, { roughness: 0.92 });
  add(g, RB(0.34, 0.1, 0.09, 0.02), m, [0, 0.35, 0]);
  add(g, RB(0.34, 0.1, 0.09, 0.02), m, [0, 0.25, 0]);
  add(g, RB(0.34, 0.1, 0.09, 0.02), m, [0, 0.15, 0]);
  add(g, RB(0.34, 0.1, 0.09, 0.02), mat(color, { roughness: 0.9 }), [0, 0.05, 0]);
  for (let i = 0; i < 4; i++) add(g, BOX(0.3, 0.003, 0.002), mat(0xe0b060, { roughness: 0.6 }), [0, 0.01 + i * 0.1, 0.046]);
  add(g, RB(0.05, 0.05, 0.005, 0.01), mat(0xd9a62b, { roughness: 0.5, metalness: 0.5 }), [0.09, 0.39, 0.047]);
  return g;
}

export function makeJacket(color = 0x6b4a2f) {
  const g = new THREE.Group();
  const m = mat(color, { roughness: 0.55 });
  add(g, CAP(0.17, 0.3), m, [0, 0.55, 0], [0, 0, 0], [1.05, 1, 0.65]);
  for (const s of [-1, 1]) add(g, CAP(0.065, 0.3), m, [s * 0.24, 0.5, 0], [0, 0, s * 0.35]);
  add(g, RB(0.34, 0.07, 0.17, 0.03), mat(0x2b2118, { roughness: 0.8 }), [0, 0.2, 0]);
  add(g, RB(0.012, 0.5, 0.012, 0.004), mat(0xd9a62b, { metalness: 0.8, roughness: 0.3 }), [0, 0.5, 0.11]);
  add(g, TOR(0.09, 0.03, Math.PI * 1.1, 8, 20), mat(0x2b2118, { roughness: 0.8 }), [0, 0.76, 0], [Math.PI / 2, 0, 0]);
  return g;
}

export function makeSunglasses() {
  const g = new THREE.Group();
  const f = mat(0x15161a, { roughness: 0.3, metalness: 0.4 });
  for (const s of [-1, 1]) {
    add(g, TOR(0.075, 0.012, Math.PI * 2, 8, 28), f, [s * 0.09, 0, 0]);
    add(g, CYL(0.07, 0.07, 0.006, 28), mat(0x1d2333, { roughness: 0.1, metalness: 0.6 }), [s * 0.09, 0, 0], [Math.PI / 2, 0, 0]);
    add(g, BOX(0.012, 0.012, 0.17), f, [s * 0.165, 0, -0.085]);
  }
  add(g, TOR(0.025, 0.008, Math.PI, 8, 12), f, [0, 0.015, 0]);
  return g;
}
export function makeCap() {
  const g = new THREE.Group();
  add(g, new THREE.SphereGeometry(0.11, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(0x1b2a4a, { roughness: 0.8 }), [0, 0.04, 0]);
  add(g, RB(0.16, 0.012, 0.12, 0.006), mat(0x1b2a4a, { roughness: 0.8 }), [0, 0.035, 0.13]);
  add(g, SPH(0.014), mat(0xd9a62b, { metalness: 0.7, roughness: 0.3 }), [0, 0.15, 0]);
  return g;
}
export function makeBelt() {
  const g = new THREE.Group();
  add(g, TOR(0.12, 0.018, Math.PI * 2, 8, 36), mat(0x2b1d12, { roughness: 0.6 }), [0, 0.02, 0], [Math.PI / 2, 0, 0]);
  add(g, RB(0.045, 0.045, 0.01, 0.006), mat(0xd9a62b, { metalness: 0.9, roughness: 0.25 }), [0, 0.02, 0.125]);
  return g;
}

export function makeCard() {
  const g = new THREE.Group();
  add(g, RB(0.085, 0.054, 0.002, 0.004), mat(0x1b2a4a, { roughness: 0.35, metalness: 0.5 }), [0, 0, 0]);
  add(g, BOX(0.085, 0.01, 0.0025), mat(0x0a0a0f), [0, 0.012, 0]);
  add(g, RB(0.014, 0.011, 0.0028, 0.002), mat(0xd9a62b, { metalness: 0.9, roughness: 0.25 }), [-0.025, -0.006, 0]);
  return g;
}

export function makeShoebox(color = 0x1b2a4a) {
  const g = new THREE.Group();
  add(g, RB(0.34, 0.12, 0.2, 0.01), mat(color, { roughness: 0.6 }), [0, 0.06, 0]);
  const lid = grp(g, [-0.17, 0.12, 0]);
  const lidMesh = add(lid, RB(0.35, 0.03, 0.21, 0.008), mat(color, { roughness: 0.55 }), [0.175, 0.0, 0]);
  add(lid, RB(0.12, 0.006, 0.05, 0.003), mat(0xd9a62b, { metalness: 0.8, roughness: 0.3 }), [0.175, 0.018, 0]);
  add(g, RB(0.30, 0.01, 0.17, 0.004), mat(0xf5f0e6, { roughness: 0.9 }), [0, 0.118, 0]); // tissue paper
  g.userData.lid = lid;
  return g;
}

// ---------- humans ----------
export function makeHuman(o) {
  const H = {}; const root = new THREE.Group(); H.root = root; H.o = o;
  const skin = mat(o.skin, { roughness: 0.7 }), hairM = mat(o.hair, { roughness: 0.35 });
  const shirtM = mat(o.shirt, { roughness: 0.8 }), pantsM = mat(o.pants, { roughness: 0.92 });
  const sleeveM = mat(o.sleeve ?? o.shirt, { roughness: 0.8 });
  const hips = H.hips = grp(root, [0, 0.93, 0]);
  add(hips, CAP(0.15, 0.1), pantsM, [0, 0.0, 0], [0, 0, Math.PI / 2], [1, 1, 0.82]);
  const torso = H.torso = grp(hips, [0, 0.06, 0]);
  add(torso, CAP(0.185, 0.25), shirtM, [0, 0.29, 0], [0, 0, 0], [1.0, 1, 0.68]);
  if (o.robe) {
    add(torso, new THREE.CylinderGeometry(0.19, 0.3, 0.72, 28, 1, true), mat(o.shirt, { roughness: 0.6, side: THREE.DoubleSide }), [0, 0.0, 0], [0, 0, 0], [1, 1, 0.8]);
    add(torso, TOR(0.2, 0.025, Math.PI * 2, 8, 28), mat(0xd9a62b, { roughness: 0.4, metalness: 0.6 }), [0, 0.14, 0], [Math.PI / 2, 0, 0], [1, 0.8, 1]);
    add(torso, TOR(0.12, 0.03, Math.PI * 1.3, 8, 20), mat(0xe8d2a0, { roughness: 0.6 }), [0, 0.6, 0.0], [Math.PI / 2, 0, 0]);
    add(torso, RB(0.04, 0.5, 0.012, 0.005), mat(0xd9a62b, { metalness: 0.7, roughness: 0.35 }), [0, 0.32, 0.13]);
  }
  add(torso, CYL(0.05, 0.06, 0.1, 16), skin, [0, 0.6, 0]);
  const head = H.head = grp(torso, [0, 0.75, 0]);
  add(head, SPH(0.17, 32, 24), skin, [0, 0, 0], [0, 0, 0], [0.98, 1.08, 1.0]);
  for (const s of [-1, 1]) add(head, SPH(0.035, 12, 10), skin, [s * 0.17, -0.005, 0], [0, 0, 0], [0.5, 1, 0.8]);
  // hair
  const hairCap = new THREE.SphereGeometry(0.182, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.56);
  const hr = add(head, hairCap, hairM, [0, 0.012, -0.012], [-0.3, 0, 0], [1.0, 1.08, 1.06]);
  if (o.hairStyle === 'wig') {
    hr.material = mat(0xf0eee8, { roughness: 0.9 });
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) add(head, SPH(0.05, 14, 10), hr.material, [s * 0.185, -0.02 - i * 0.05, -0.02], [0, 0, 0], [0.8, 0.8, 1]);
    add(head, SPH(0.06, 14, 10), hr.material, [0, -0.05, -0.2], [0, 0, 0], [1, 1.5, 0.8]);
    add(head, RB(0.04, 0.03, 0.01, 0.005), mat(0x111118), [0, -0.1, -0.2]);
  } else if (o.hairStyle === 'bun') {
    add(head, SPH(0.075, 16, 12), hairM, [0, 0.19, -0.1]);
    add(head, CAP(0.04, 0.2), hairM, [0, -0.08, -0.17], [0.2, 0, 0]);
  } else {
    add(head, SPH(0.1, 18, 12), hairM, [0, 0.13, 0.085], [0, 0, 0], [1.1, 0.8, 0.9]);
  }
  // face
  const eyeW = mat(0xffffff, { roughness: 0.3 }), eyeD = mat(0x0b0b10, { roughness: 0.2 });
  H.eyes = []; H.pupils = [];
  for (const s of [-1, 1]) {
    const eg = grp(head, [s * 0.066, 0.025, 0.152]);
    add(eg, SPH(0.036, 16, 12), eyeW, [0, 0, 0], [0, 0, 0], [1, 1, 0.55], false);
    const p = add(eg, SPH(0.021, 12, 10), eyeD, [0, 0, 0.012], [0, 0, 0], [1, 1, 0.5], false); H.pupils.push(p);
    H.eyes.push(eg);
  }
  H.brows = [];
  const browM = mat(o.brow ?? o.hair, { roughness: 0.6 });
  for (const s of [-1, 1]) { const b = add(head, RB(0.075, 0.016, 0.014, 0.006), browM, [s * 0.066, 0.092, 0.158], [0, 0, 0], [1, 1, 1], false); H.brows.push(b); }
  add(head, SPH(0.026, 12, 10), skin, [0, -0.018, 0.17], [0, 0, 0], [1, 1.2, 1]);
  H.mouth = add(head, TOR(0.05, 0.0085, Math.PI, 8, 18), mat(0x5a1f1a, { roughness: 0.5 }), [0, -0.075, 0.153], [0, 0, 0], [1, 1, 1], false);
  H.mouthOpen = add(head, SPH(0.03, 14, 10), mat(0x2a0d0c, { roughness: 0.4 }), [0, -0.088, 0.152], [0, 0, 0], [1, 0.1, 0.4], false);
  if (o.stubble) add(head, new THREE.SphereGeometry(0.172, 28, 16, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.3), mat(0x2b211c, { roughness: 1, transparent: true, opacity: 0.55 }), [0, -0.005, 0.004], [0, 0, 0], [0.99, 1.08, 1.0], false);
  // arms
  H.sh = []; H.el = []; H.hand = [];
  for (const s of [-1, 1]) {
    const sh = grp(torso, [s * 0.235, 0.5, 0]);
    add(sh, CAP(0.062, 0.19), sleeveM, [0, -0.17, 0]);
    const el = grp(sh, [0, -0.34, 0]);
    add(el, CAP(0.052, 0.17), o.longSleeve ? sleeveM : skin, [0, -0.15, 0]);
    const hand = grp(el, [0, -0.33, 0]);
    add(hand, SPH(0.058, 14, 12), skin, [0, -0.02, 0], [0, 0, 0], [0.85, 1.1, 0.7]);
    add(hand, CAP(0.014, 0.04), skin, [s * -0.04, -0.01, 0.02], [0.3, 0, s * 0.8]);
    H.sh.push(sh); H.el.push(el); H.hand.push(hand);
  }
  // legs
  H.hip = []; H.kn = []; H.ank = [];
  for (const s of [-1, 1]) {
    const hp = grp(hips, [s * 0.095, -0.03, 0]);
    add(hp, CAP(0.092, 0.27), pantsM, [0, -0.225, 0]);
    const kn = grp(hp, [0, -0.45, 0]);
    add(kn, CAP(0.078, 0.24), pantsM, [0, -0.2, 0]);
    const ank = grp(kn, [0, -0.4, 0]);
    H.hip.push(hp); H.kn.push(kn); H.ank.push(ank);
    if (o.fade) { // faded jeans patches on thigh/knee for old jeans
      add(hp, SPH(1, 14, 10), mat(o.fade, { roughness: 0.95 }), [0, -0.28, 0.084], [0, 0, 0], [0.055, 0.1, 0.012], false);
      add(kn, SPH(1, 14, 10), mat(o.fade, { roughness: 0.95 }), [0, -0.06, 0.07], [0, 0, 0], [0.05, 0.07, 0.012], false);
    }
  }
  // watch on left wrist (index 0 = left in image?) we use hand[0]
  root.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  H.shoes = {};
  H.setExpr = (e = {}) => {
    const { brow = 0, tilt = 0, mouth = 0.3, open = 0, eye = 1, lx = 0, ly = 0 } = e;
    H.brows.forEach((b, i) => { const s = i === 0 ? -1 : 1; b.position.y = 0.092 + brow * 0.03; b.rotation.z = -s * tilt * 0.45; });
    H.eyes.forEach(g => g.scale.set(1, eye, 1));
    H.pupils.forEach(p => p.position.set(lx * 0.012, ly * 0.012, 0.012));
    const m = H.mouth; m.rotation.z = mouth > 0 ? Math.PI : 0; m.scale.set(1 - 0.2 * (1 - Math.abs(mouth)), Math.max(0.05, Math.abs(mouth)), 1);
    m.position.y = mouth > 0 ? -0.07 : -0.105;
    H.mouthOpen.scale.set(1 + open * 0.3, 0.1 + open * 1.2, 0.4);
    H.mouthOpen.visible = open > 0.02;
    H.mouth.visible = open < 0.5;
  };
  H.setExpr({});
  H.blink = (t) => { const k = (t * 0.37 + (o.seed || 0)) % 1; return (k > 0.96 || (k > 0.0 && k < 0.015)) ? 0.12 : 1; };
  return H;
}

// pose: object of optional angles, everything in radians
export function pose(H, p = {}) {
  const d = (v, def = 0) => (v === undefined ? def : v);
  H.hips.position.y = 0.93 + d(p.hipsY);
  H.hips.rotation.set(d(p.hipsX), d(p.hipsRY), d(p.hipsRZ));
  H.torso.rotation.set(d(p.torsoX), d(p.torsoY), d(p.torsoZ));
  H.head.rotation.set(d(p.headX), d(p.headY), d(p.headZ));
  for (let i = 0; i < 2; i++) {
    const S = i ? 'L' : 'R'; // index 0 = character's right (x<0), index 1 = left (x>0)
    const sh = p['sh' + S] || [0.0, 0.0], el = p['el' + S];
    H.sh[i].rotation.set(sh[0], 0, sh[1] * (i ? 1 : -1));
    H.el[i].rotation.set(-(el ?? 0.12), 0, 0);
    H.hip[i].rotation.set(d(p['hip' + S]), 0, (i ? -1 : 1) * d(p['hipZ' + S]));
    H.kn[i].rotation.set(d(p['kn' + S]), 0, 0);
    H.ank[i].rotation.set(d(p['an' + S]), 0, 0);
  }
}

export function walkPose(phase, amp = 1, extra = {}) {
  const s = Math.sin(phase), c = Math.cos(phase);
  return {
    hipsY: -Math.abs(Math.cos(phase)) * 0.0 + (Math.abs(c) * 0.035 - 0.02) * amp,
    torsoY: s * 0.08 * amp, hipsRY: -s * 0.08 * amp,
    hipL: -s * 0.55 * amp, hipR: s * 0.55 * amp,
    knL: Math.max(0, -c) * 0.95 * amp + 0.05, knR: Math.max(0, c) * 0.95 * amp + 0.05,
    anL: s * 0.15, anR: -s * 0.15,
    shL: [s * 0.55 * amp, 0.05], shR: [-s * 0.55 * amp, 0.05], elL: 0.25 + Math.max(0, -s) * 0.25 * amp, elR: 0.25 + Math.max(0, s) * 0.25 * amp,
    ...extra,
  };
}
export function idlePose(t, extra = {}) {
  const b = Math.sin(t * 2.0) * 0.008;
  return { torsoX: b, shL: [0.04 + b, 0.06], shR: [0.04 - b, 0.06], elL: 0.12, elR: 0.12, headX: b * 0.5, ...extra };
}
export const SIT = (extra = {}) => ({ hipsY: -0.4, hipL: -1.38, hipR: -1.38, knL: 1.38, knR: 1.38, anL: -0.05, anR: -0.05, torsoX: 0.05, ...extra });
