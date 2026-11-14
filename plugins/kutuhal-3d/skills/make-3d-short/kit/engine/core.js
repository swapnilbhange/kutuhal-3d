// core.js — registries and shared helpers used by project scene modules.
//   import { registerShot, registerSet, registerCast, E, clamp, lerp, sm, seg, eo, ob, rnd } from '/engine/core.js';
export { THREE, clamp, lerp, sm, seg, eo, ob, rnd } from './lib.js';

/** Environment, filled by player.js before any shot runs. */
export const E = { W: 1080, H: 1920, fps: 30, vertical: true, cfg: {}, words: [], shots: [], duration: 0, lift: 0 };

export const SHOTS = new Map();   // id  -> shot definition
export const SETS = new Map();    // name -> builder(X) => THREE.Group
export const CAST = new Map();    // id  -> makeHuman options

/** registerShot('s03', { set:'desk', light:'warmInterior', grade:'css filter', draw(X,t,info){…}, overlay(UI,t,info){…} }) */
export const registerShot = (id, def) => { SHOTS.set(id, def); };
/** registerSet('desk', X => { const g = X.grp(); … return g; })  — built once, shown only for shots whose set matches. */
export const registerSet = (name, build) => { SETS.set(name, build); };
/** registerCast('hero', { skin, hair, shirt, pants, … }) — see makeHuman in lib.js */
export const registerCast = (id, opts) => { CAST.set(id, opts); };

/** Time (global seconds) at which `word` (case-insensitive, punctuation ignored) is spoken, searching after `after`. */
export function wordTime(word, after = 0) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9']/g, '');
  const w = norm(word);
  const hit = E.words.find(x => x.start >= after - 1e-6 && norm(x.w) === w);
  return hit ? hit.start : null;
}
/** 0..1 "talking" amount for a character while the narration (or a quoted line) is in [from,to]. */
export const talkAmount = (g, from, to) => {
  const act = E.words.some(w => w.start <= g && w.end >= g && w.start >= from - 1e-6 && w.end <= to + 1e-6);
  return act ? 0.5 + 0.5 * Math.abs(Math.sin(g * 17)) : 0;
};
