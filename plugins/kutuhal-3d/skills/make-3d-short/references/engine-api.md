# Engine API (what shot modules can call)

A project = `config.json` + `story/shots.json` + `timeline/words.json` + `scenes/**/*.js`. The player loads every module under `scenes/` (order: `cast.js`, `sets/*`, the rest) and renders `renderFrame(f)` deterministically from the time `t`.

## Registration
```js
import { registerCast, registerSet, registerShot } from '/engine/core.js';
registerCast('maya', { skin, hair, brow, hairStyle:'bun'|'wig'|default, shirt, sleeve, pants, seed });
registerSet('desk', (X) => { const g = X.grp(); …build static geometry…; g.userData.clock = …; return g; });   // built once, shown while shot.set == name
registerShot('s03', { set:'desk', draw(X, t, info){…}, overlay(X, t, info){ return [ …overlay specs… ]; } });
```
`t` = seconds since shot start; `info` = `{ id, dur, start, end, shot, params, f, fps }`. `draw` must be a pure function of `t` (no accumulating state).

## X (selected)
- **Light/colour:** `X.light(mood,{focus,over})`, `X.accent(color,k,[x,y,z])`, `X.grade(cssFilter)`, `X.flash(v)`, `X.dark(v)`, `X.ring([x,y,z],r,a)` (screen-space highlight ring), `X.lift(px)`.
- **Camera:** `X.move(t,dur,from,to,opts)`, `X.orbit(t,{target,radius,height,from,to,dur,fov})`, `X.kf(t,keys)` + `X.cam(k,t,{shake,roll})`, `X.setCam(p,l,fov)`. Views are `{p:[x,y,z], l:[x,y,z], f:fov}`.
- **Objects:** `X.human(id)` → `X.place(h,x,y,z,ry)`, `X.pose(h, pose)`, `X.expr(h,t,{brow,mouth,tilt,eye,lx,ly})`; `X.prop(key, factory)` (cached, auto-hidden each frame), `X.sparkles(key,n,r,seed)` → `.userData.update(t, amount, size)`; `X.sets.get(name).userData`.
- **Poses:** `X.SIT({torsoX,headX,headZ,shL:[x,z],shR,elL,elR})`, `X.walkPose(t,speed)`, `X.idlePose(t)`. Arm index 0 = right, 1 = left. Negative shoulder x = arm forward; elbow bends forward-up.
- **Timing:** `X.wordTime(word, afterSeconds)` → absolute time of the next occurrence of `word` after that time (or null); `X.talkAmount(t)` → 0..1 speech energy for mouth animation. Always convert to local time with `- info.start`.
- **Maths:** `X.sm, X.seg(t,a,b), X.clamp, X.lerp, X.ob` (easing) and the whole `lib.js` (primitives `RB, BOX, CAP, SPH, CYL, TOR`, `mat`, `glow`, `add`, `grp`, `canvasTex`, props `sneaker, bag, phone, watch`).

## `story/shots.json`
```json
{ "title":"…", "duration":30.4,
  "music":[{"start":0,"end":6.8,"mood":"playful","intensity":0.45}], "sfx":[{"t":12.5,"name":"impact"}],
  "shots":[{ "id":"s01","start":0,"end":4.17,"line":"…","scene":"description","set":"desk",
     "in":{"type":"flash","dur":0.4}, "params":{},
     "overlays":[{"type":"stat","at":1.9,"dur":2,"value":"2 HOURS","label":"THE PLAN","pos":"top"}],
     "sfx":[{"at":0.1,"name":"whoosh","gain":-8}], "amb":{"name":"room","gain":0} }] }
```
A shot's `id` must match a `registerShot` id (else a plain `set` background is drawn). `overlays` in JSON and the `overlay()` hook are concatenated.

## Overlay types (`at`, `dur` in shot seconds; `pos`: top|upper|center|mid|low; `x`: left|center|right; text supports `*accent*`)
`title {lines[], sub}` · `big {text, sub}` · `stat {value,label,color}` · `counter {from,to,prefix,suffix,format,count,label}` · `toast {icon,title,value,slot}` · `list {items[],step}` · `bars {items:[{label,value,color}],max,suffix,step}` · `quote {text,who}` · `end {lines[]}`. Colours: accent, ok, alert.

## Config (`config.json`)
`aspect` 9:16|16:9, `resolution` 720p…2160p, `fps`, `style`, `captions`, `voice`, `music/sfx/ambience.gainDb`, `loudness`, `crf`, `tail`, `fadeOut`, an optional corner logo is picked up from `input/logo.png`.

## Gotchas
- Never create lights or materials per frame (shader recompiles = black frames); use `X.light`/`X.accent` only.
- Module syntax errors show as `pageerror` and the render hangs on `READY`; check with `node --input-type=module --check < file.js`. Don't nest `/* */` in comments.
- The window globals `IMPORT_ERRORS` / `BOOT_ERROR` / `LAST_ERROR` are printed by `render.mjs` when something fails.
