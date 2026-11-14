import { registerShot } from '/engine/core.js';
import { makeClock } from '../props.js';
import { sitMaya, localTime } from '../helpers.js';
const room = X => X.sets.get('desk').userData;

registerShot('s04', { set: 'void',
  draw(X, t, info) {
    X.light('void', { focus: [0, 1.6, 0] });
    const c = X.prop('bigClock', () => { const g = makeClock(0.7); return g; }); c.position.set(0, 1.35, 0); c.rotation.y = Math.sin(t * 0.8) * 0.5; c.userData.setTime(5 + t * 1.6);
    X.sparkles('sp1', 28, 1.6, 3).position.set(0, 1.35, 0.3); X.sparkles('sp1').userData.update(t, 0.8, 0.09);
    X.accent(0xffd23f, 3, [0, 1.9, 1.6]);
    X.move(t, info.dur, { p: [0, 1.9, 6.4], l: [0, 1.7, 0], f: 40 }, { p: [0, 1.9, 5.4], l: [0, 1.7, 0], f: 40 });
  },
  overlay(X, t, info) { return [{ type: 'title', at: 0.05, dur: null, lines: ['THE', 'PLANNING', 'FALLACY'], pos: 'upper' }]; } });

registerShot('s05', { set: 'desk',
  draw(X, t, info) {
    X.light('coolInterior', { focus: [0, 1.2, -1] }); room(X).setSky(1); room(X).clock.userData.setTime(11);
    sitMaya(X, t, { type: 0, pose: { torsoX: 0.0, headX: -0.18, headZ: 0.12, shL: [-0.55, 0.1], shR: [-1.5, 0.35], elL: 0.4, elR: 1.9 }, expr: { brow: 0.7, mouth: -0.1, lx: 0.9, ly: 0.8 } });
    X.accent(0x9fc4ff, 1.4, [0, 1.05, -0.3]);
    X.orbit(t, { target: [0, 1.2, -1], radius: 3.0, height: 1.5, from: 0.4, to: -0.35, dur: info.dur, fov: 36 });
  },
  overlay(X, t, info) { const at = Math.max(0, localTime(X, info, 'best') - 0.1); return [{ type: 'bars', at, dur: info.dur - at - 0.1, pos: 'top', step: 2.7, max: 6, suffix: ' h', items: [{ label: 'PLANNED', value: 2, color: 'ok' }, { label: 'ACTUAL', value: 5, color: 'alert' }] }]; } });

registerShot('s08', { set: 'void',
  draw(X, t, info) {
    X.light('void', { focus: [0, 1.6, 0] });
    const c = X.prop('bigClock', () => makeClock(0.7)); c.position.set(0, 1.9, 0); c.rotation.y = Math.sin(t * 0.6) * 0.4; c.userData.setTime(10 - t * 0.5);
    X.sparkles('sp2', 28, 1.6, 9).position.set(0, 1.9, 0.3); X.sparkles('sp2').userData.update(t, 0.7, 0.09); X.accent(0xffd23f, 2.5, [0, 1.9, 1.6]);
    X.move(t, info.dur, { p: [0, 1.8, 6.0], l: [0, 1.7, 0], f: 40 }, { p: [0, 1.9, 5.0], l: [0, 1.7, 0], f: 40 });
  },
  overlay(X, t, info) { const at = localTime(X, info, 'hope.') + 0.9; return [{ type: 'end', at, dur: null, lines: ['Plan with *history,*', 'not hope.'] }]; } });
