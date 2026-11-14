# Customizing Kutuhal 3D

Everything is plain JS/Python in the kit, so you (or Claude) can extend it. All paths are relative to `plugins/kutuhal-3d/skills/make-3d-short/kit/` (the copy in your workspace is `studio/`).

## Characters – `projects/<slug>/scenes/cast.js`
```js
import { registerCast } from '/engine/core.js';
registerCast('maya', {
  skin: 0x8d5a3b, hair: 0x1b1210, brow: 0x1b1210,
  hairStyle: 'bun',            // 'bun' | 'wig' | omit for the default short cut
  shirt: 0xe8624a, sleeve: 0xe8624a, pants: 0x2b3348, seed: 0.4 });
```
Use in a shot: `const h = X.human('maya'); X.place(h, x, y, z, rotationY); X.pose(h, X.SIT({…})); X.expr(h, t, {brow, mouth, tilt, eye, lx, ly});`
Poses: `X.SIT`, `X.walkPose(t, speed)`, `X.idlePose(t)` or hand-write `{ torsoX, headX, headZ, shL:[x,z], shR:[x,z], elL, elR, … }`. Arm index 0 = right, 1 = left; negative shoulder-x lifts the arm forward.

## Props – `scenes/props.js`
Build any prop from primitives (`X.THREE` plus the helpers in `engine/lib.js`: `BOX CAP SPH CYL TOR RB`, `mat`, `glow`, `grp`, `add`, `canvasTex`):
```js
export function makeBook() {
  const g = new THREE.Group();
  g.add(add(RB(0.3, 0.04, 0.4, 0.01), mat(0x2a4d9b)));
  g.userData.open = k => { /* animate pages with k in 0..1 */ };
  return g;
}
```
Use it with `X.prop('book', () => makeBook())` – it is cached, hidden every frame, and shown when you call it. Keep animation controls on `userData` and call them from `draw`.

## Sets – `scenes/sets/<name>.js`
```js
registerSet('street', X => { const g = X.grp(); /* build once */ g.userData.sign = …; return g; });
```
Selected per shot with `"set": "street"` in `shots.json`. Reach it in `draw` with `X.sets.get('street').userData`.

## Shots – `scenes/shots/*.js`
`registerShot('s05', { set, draw(X,t,info){…}, overlay(X,t,info){ return […]; } })`. Time everything with `X.wordTime('buffer', info.start)` (absolute seconds of the next spoken "buffer") minus `info.start`.

## Looks
- **Lighting moods:** `MOODS` in `engine/styles.js` – add a new entry (`hc/hg/hi` hemisphere, `kc/ki/ka/kpen` key spot, `rc/ri` rim, `fc/fi` fill, `bg/fn/ff` background + fog).
- **Styles:** `STYLES` in the same file – `ui` colours (`accent text alert ok panel bg1 bg2`), `grade` (a CSS filter string), `vignette`, `grain`. Select with `"style": "<id>"` in `config.json`; compare with `node render.mjs --project P --styles a,b,c --at 3,12,20`.
  - **Pastel note:** `pastel` uses dark text and expects *light* scenes (`X.light('day', …)`). On dark sets, as in the sample, text contrast is poor – use `midnight/ember/arctic/neon` for dark scenes.
- **Font:** replace `assets/fonts/Poppins-Bold.ttf` (all weights map to this file; keep the same file name, or edit the `@font-face` rules in `player.html`).
- **Logo:** put a PNG at `projects/<slug>/input/logo.png` – it appears in the corner.
- **Overlay look:** CSS variables and classes in `player.html`; overlay logic in `engine/ui.js` (add a new `case` to create a new overlay type).

## Sound
- **New SFX:** in `audio/sfx.py` add a function `e_<name>(d=…, **k)` returning a numpy array – it is auto-registered as `<name>`. Ambience beds: `a_<name>`. `python3 audio/sfx.py --list` / `--demo` to audition.
- **New music mood:** in `audio/music.py` write `def <mood>(c, t0, t1, I)` using the existing helpers (`_arp`, instruments from `dsp.py`) and add it to the `MOODS` dict (and `ALIASES` for synonyms).
- **Levels:** `config.json` → `music.gainDb`, `sfx.gainDb`, `ambience.gainDb`, `loudness`.
- **Own music file:** `"music": { "file": "input/track.mp3", "gainDb": -20 }`.

## Voices
`config.json` → `voice` (and `story/script.json` → `voice`). The audition list is: `hm_psi, hm_omega, bm_george, bm_lewis, am_michael, am_adam, af_heart, af_bella, bf_emma` (first letter = accent/language: `h` Hindi, `b` British English, `a` American English; second letter `m`/`f` = male/female). Any other voice name in Kokoro's `voices-v1.0.bin` works too. Per-scene `speed`, `gap`, `pause` in `script.json` control pace and pauses.

## Output
`config.json` → `aspect` (`9:16` / `16:9`), `resolution` (`720p`…`2160p`), `fps`, `crf` (quality; lower is better), `tail` (seconds of silence after the last word), `fadeOut`.

## Changing the plugin itself
Edit the skills in `plugins/kutuhal-3d/skills/*/SKILL.md` (they are Markdown instructions for Claude). Re-package with `bash scripts/build-dist.sh`, re-upload / `git push`.
