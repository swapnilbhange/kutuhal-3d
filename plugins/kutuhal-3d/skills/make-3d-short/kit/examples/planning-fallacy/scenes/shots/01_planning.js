import { registerShot } from '/engine/core.js';
import { sitMaya, localTime } from '../helpers.js';

const room = X => X.sets.get('desk').userData;
const glowOn = (X, k = 2.2) => X.accent(0x9fc4ff, k, [0, 1.05, -0.3]);   // laptop glow on her face

registerShot('s01', { set: 'desk',
  draw(X, t, info) {
    X.light('warmInterior', { focus: [0, 1.2, -1] }); room(X).setSky(0); room(X).clock.userData.setTime(6);
    sitMaya(X, t, { expr: { brow: 0.3, mouth: 0.85 } }); glowOn(X);
    X.move(t, info.dur, { p: [0.5, 1.5, 3.0], l: [0, 1.1, -1], f: 38 }, { p: [0.15, 1.42, 2.4], l: [0, 1.12, -1], f: 34 });
  },
  overlay(X, t, info) { const at = Math.max(0, localTime(X, info, 'two') - 0.05); return [{ type: 'stat', at, dur: info.dur - at - 0.1, value: '2 HOURS', label: 'THE PLAN', pos: 'top' }]; } });

registerShot('s02', { set: 'desk',
  draw(X, t, info) {
    X.light('warmInterior', { focus: [0, 1.2, -1] }); room(X).setSky(0.1); room(X).clock.userData.setTime(6 + 0.1 * t / 3);
    sitMaya(X, t, { expr: { brow: 0.1, mouth: 0.6 } }); glowOn(X);
    X.orbit(t, { target: [0, 1.15, -1], radius: 3.4, height: 1.55, from: -0.55, to: 0.3, dur: info.dur, fov: 38 });
  },
  overlay(X, t, info) { return [{ type: 'list', at: 0.35, dur: info.dur - 0.45, pos: 'top', step: 0.9, items: ['*2 hours* for the task', 'Rest of the evening: *free*'] }]; } });

registerShot('s03', { set: 'desk',
  draw(X, t, info) {
    const k = X.sm(X.seg(t, 0.5, info.dur - 0.4)); X.light('night', { focus: [1.2, 2.2, -1.5], over: { ki: 130 } });
    room(X).setSky(k * 1.2); room(X).clock.userData.setTime(6 + 5 * k * k); X.accent(0xffe0b0, 1.6, [1.3, 2.5, -1.4]);
    X.move(t, info.dur, { p: [0.9, 2.2, 0.3], l: [1.5, 2.4, -2.2], f: 36 }, { p: [1.7, 2.45, -0.5], l: [1.7, 2.45, -2.58], f: 34 });
    const h = sitMaya(X, t, { type: 0.3, expr: { brow: -0.4, tilt: -0.6, mouth: -0.5, eye: 0.8 }, pose: { torsoX: 0.3, headX: 0.3 } });
  },
  overlay(X, t, info) { const at = localTime(X, info, 'quietly') - 0.1; return [{ type: 'counter', at, dur: info.dur - at - 0.15, from: 2, to: 5, suffix: ' HOURS', label: 'WHAT IT REALLY TOOK', color: 'alert', pos: 'top', count: 1.3 }]; } });
