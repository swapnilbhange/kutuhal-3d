import { registerShot } from '/engine/core.js';
import { sitMaya, localTime } from '../helpers.js';
const room = X => X.sets.get('desk').userData;

registerShot('s06', { set: 'desk',
  draw(X, t, info) {
    X.light('warmInterior', { focus: [0.62, 0.8, -0.5] }); room(X).setSky(1); room(X).clock.userData.setTime(11);
    room(X).notebook.userData.draw(X.sm(X.seg(t, 0.6, info.dur - 0.3))); X.accent(0xfff0d0, 2.0, [0.6, 1.6, -0.2]);
    X.move(t, info.dur, { p: [0.62, 1.8, 0.05], l: [0.62, 0.76, -0.5], f: 34 }, { p: [0.62, 1.4, -0.15], l: [0.62, 0.76, -0.5], f: 34 });
  },
  overlay(X, t, info) { const at = Math.max(0, localTime(X, info, 'check') - 0.1); return [{ type: 'big', at, dur: info.dur - at - 0.1, text: 'CHECK YOUR *PAST*', pos: 'top' }]; } });

registerShot('s07', { set: 'desk',
  draw(X, t, info) {
    X.light('warmInterior', { focus: [0, 1.2, -1] }); room(X).setSky(1); room(X).clock.userData.setTime(11);
    room(X).notebook.userData.draw(1);
    sitMaya(X, t, { type: 0.2, pose: { shR: [-1.0 + Math.sin(t * 4) * 0.05, 0.3], elR: 0.9 }, expr: { brow: 0.3, mouth: 0.9, ly: -0.5 } }); X.accent(0x9fc4ff, 1.8, [0, 1.05, -0.3]);
    const b = localTime(X, info, 'buffer'); const sp = X.sparkles('buf', 24, 0.5, 5); sp.position.set(0.6, 1.0, -0.5); sp.userData.update(t, X.sm(X.seg(t, b - 0.2, b + 0.3)), 0.1);
    X.orbit(t, { target: [0.1, 1.15, -1], radius: 3.2, height: 1.5, from: 0.45, to: -0.3, dur: info.dur, fov: 37 });
  },
  overlay(X, t, info) { return [{ type: 'list', at: 0.15, dur: info.dur - 0.25, pos: 'top', step: 3.2, items: ['How long it *really* took', 'Add a *buffer*'] }]; } });
