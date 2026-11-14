// player.js — boots a project in the browser and exposes window.renderFrame(f) for the renderer.
import { THREE, clamp, lerp, sm, seg, eo, ob, rnd, makeHuman, makeSparkles } from './lib.js';
import * as LIB from './lib.js';
import { E, SHOTS, SETS, CAST, wordTime, talkAmount } from './core.js';
import { MOODS, OFFSETS, STYLES, DEFAULT_STYLE } from './styles.js';
import { renderOverlays } from './ui.js';

window.READY = false;
const $ = id => document.getElementById(id);
const fetchJSON = async (u, dflt) => { try { const r = await fetch(u, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); return await r.json(); } catch (e) { if (dflt !== undefined) return dflt; throw new Error('cannot load ' + u + ': ' + e.message); } };

async function boot() {
  const q = new URLSearchParams(location.search);
  const CFG = await fetchJSON('/project/config.json');
  const STORY = await fetchJSON('/project/story/shots.json');
  const WORDS = (await fetchJSON('/project/timeline/words.json', { words: [] })).words || [];
  const vertical = (CFG.aspect || '9:16') === '9:16';
  Object.assign(E, { W: vertical ? 1080 : 1920, H: vertical ? 1920 : 1080, fps: CFG.fps || 30, vertical, cfg: CFG, words: WORDS, shots: STORY.shots || [], duration: STORY.duration });
  E.captions = CFG.captions !== false;
  E.lift = CFG.lift ?? (vertical && E.captions ? 230 : 0);
  const styleId = q.get('style') || CFG.style || DEFAULT_STYLE; const style = STYLES[styleId] || STYLES[DEFAULT_STYLE];
  const { W, H, fps } = E;
  const root = $('root'); root.style.width = W + 'px'; root.style.height = H + 'px'; document.body.style.width = W + 'px'; document.body.style.height = H + 'px';
  const css = root.style; for (const [k, v] of Object.entries(style.ui)) css.setProperty('--' + k, v);
  css.setProperty('--capy', (vertical ? 0.61 : 0.78) * H + 'px'); css.setProperty('--capsize', (vertical ? 92 : 74) + 'px');
  $('vig').style.background = `radial-gradient(ellipse at 50% 42%,rgba(0,0,0,0) 45%,rgba(0,0,0,${style.vignette}) 100%)`;
  $('grain').style.opacity = style.grain;
  if (style.lightText) root.classList.add('lighttext');
  await Promise.all(['600', '700', '800'].map(w => document.fonts.load(w + ' 24px Poppins')));

  /* ---------- renderer / scene / camera ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(window.devicePixelRatio || 1); renderer.setSize(W, H);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  $('stage').appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b1020); scene.fog = new THREE.Fog(0x0b1020, 12, 40);
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.05, 300);

  /* ---------- fixed light rig (constant light count => no shader recompiles) ---------- */
  const hemi = new THREE.HemisphereLight(0x8fa0ff, 0x201510, 0.5); scene.add(hemi);
  const key = new THREE.SpotLight(0xffe2b8, 60, 0, 0.6, 0.6, 2); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.camera.near = 0.5; key.shadow.camera.far = 40; scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x88aaff, 1.0); scene.add(rim, rim.target);
  const fill = new THREE.PointLight(0xffaa66, 10, 0, 2); scene.add(fill);
  const acc = new THREE.PointLight(0xffffff, 0, 0, 2); scene.add(acc);   // accent light for glows (keep intensity 0 when unused)
  const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const state = { flash: 0, dark: 0, grade: '', ring: null, lift: E.lift };

  /** X.light('night', { focus:[x,y,z], key:1.2, over:{ ki:200, bg:0x112233 } }) or X.light({...full config}) */
  function light(m, o = {}) {
    const base = typeof m === 'string' ? MOODS[m] : m; if (!base) throw new Error('unknown mood ' + m);
    const c = { ...base, ...(o.over || {}) }, f = o.focus || [0, 1, 0], ks = o.key ?? 1;
    const O = { ...OFFSETS, ...(o.offsets || {}) };
    hemi.color.set(c.hc); hemi.groundColor.set(c.hg); hemi.intensity = c.hi * (o.hemi ?? 1);
    key.position.set(...(c.kp || add3(f, O.kp))); key.target.position.set(...(c.kt || add3(f, O.kt)));
    key.color.set(c.kc); key.intensity = c.ki * ks; key.angle = c.ka; key.penumbra = c.kpen;
    rim.position.set(...(c.rp || add3(f, O.rp))); rim.target.position.set(...(c.rt || add3(f, O.rt))); rim.color.set(c.rc); rim.intensity = c.ri;
    fill.position.set(...(c.fp || add3(f, O.fp))); fill.color.set(c.fc); fill.intensity = c.fi;
    acc.intensity = 0;
    scene.background.set(c.bg); scene.fog.color.set(c.bg); scene.fog.near = c.fn; scene.fog.far = c.ff;
  }
  /** Colourful accent glow: X.accent(color, intensity, [x,y,z]) */
  const accent = (color, k, p) => { acc.color.set(color); acc.intensity = k; if (p) acc.position.set(...p); };

  /* ---------- camera helpers ---------- */
  function setCam(p, l, fov = 35, roll = 0, shake = 0, t = 0) {
    camera.position.set(p[0] + Math.sin(t * 1.9) * 0.008 + Math.sin(t * 47) * shake, p[1] + Math.sin(t * 1.3) * 0.006 + Math.sin(t * 53) * shake, p[2]);
    camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(l[0], l[1], l[2]);
    camera.fov = fov; camera.aspect = W / H; camera.setViewOffset(W, H, 0, state.lift, W, H); camera.updateProjectionMatrix();
  }
  const mix = (a, b, k) => ({ p: a.p.map((v, j) => lerp(v, b.p[j], k)), l: a.l.map((v, j) => lerp(v, b.l[j], k)), f: lerp(a.f, b.f, k) });
  /** Keyframed camera. keys:[{t,p:[x,y,z],l:[x,y,z],f:fov}]; smooth=true eases each leg, false = constant speed. */
  function kf(t, keys, smooth = true) {
    if (t <= keys[0].t) return keys[0];
    for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (t <= b.t) { const k = (t - a.t) / (b.t - a.t); return mix(a, b, smooth ? sm(k) : k); } }
    return keys[keys.length - 1];
  }
  /** Apply a camera: X.cam(X.kf(t,keys), t, {shake, roll}) */
  const cam = (k, t, o = {}) => setCam(k.p, k.l, k.f, o.roll || 0, o.shake || 0, t);
  /** Slow move between two views over the shot: X.move(t, dur, {p,l,f}, {p,l,f}, opts) */
  const move = (t, dur, a, b, o = {}) => { const k = clamp(t / dur); cam(mix({ f: 35, ...a }, { f: 35, ...b }, o.linear ? k : sm(k)), t, o); };
  /** Orbit around a target: X.orbit(t, {target:[0,1,0], radius:4, height:1.6, from:-0.6, to:0.4, dur, fov:36}) */
  const orbit = (t, o) => { const k = sm(clamp(t / (o.dur || 4))), a = lerp(o.from ?? -0.6, o.to ?? 0.6, k), r = o.radius ?? 4, tg = o.target || [0, 1, 0];
    cam({ p: [tg[0] + Math.sin(a) * r, o.height ?? 1.6, tg[2] + Math.cos(a) * r], l: tg, f: o.fov ?? 36 }, t, o); };

  /* ---------- managed objects (hidden at the start of every frame) ---------- */
  const humans = new Map(), props = new Map(), managed = [];
  const X = {
    THREE, ...LIB, scene, camera, renderer, E, CFG, style, MOODS, key, rim, fill, hemi,
    light, accent, setCam, kf, cam, move, orbit, mix, wordTime, talkAmount,
    /** Character by cast id (shown for this frame). */
    human(id) { const h = humans.get(id); if (!h) throw new Error('unknown cast id "' + id + '" (registerCast it in scenes/cast.js)'); h.root.visible = true; return h; },
    place(h, x, y, z, ry = 0) { h.root.visible = true; h.root.position.set(x, y, z); h.root.rotation.set(0, ry, 0); return h; },
    /** Apply an expression with automatic blinking. e = {brow,tilt,mouth,open,eye,lx,ly} */
    expr(h, t, e = {}) { h.setExpr({ ...e, eye: (e.eye ?? 1) * h.blink(t) }); },
    /** Cached prop: build once with factory(X), shown for this frame only. */
    prop(k, factory) { let o = props.get(k); if (!o) { if (!factory) throw new Error('prop "' + k + '" not built yet'); o = factory(X); scene.add(o); props.set(k, o); managed.push(o); } o.visible = true; return o; },
    /** Sparkle field (call .userData.update(t, amount, size) each frame). */
    sparkles(k, n = 24, radius = 0.5, seed = 1) { return X.prop(k, () => makeSparkles(scene, n, radius, seed)); },
    flash(v) { state.flash = Math.max(state.flash, v); },      // white overlay 0..1
    dark(v) { state.dark = Math.max(state.dark, v); },         // dark overlay 0..1
    grade(css) { state.grade = css; },                         // CSS filter on the 3D canvas
    lift(px) { state.lift = px; },                             // vertical view offset (px) to keep subjects above captions
    /** Highlight ring around a world point: X.ring([x,y,z], radiusPx, alpha) (call after the camera is set) */
    ring(p, r = 120, a = 1) { state.ring = { p, r, a }; },
    /** Per-frame extra overlays (declarative specs, same as shots.json "overlays"). */
    overlays: [],
    onEnd: [],
  };
  Object.defineProperty(X, 'safeLift', { get: () => E.lift });

  /* ---------- load project scene modules ---------- */
  const manifest = await fetchJSON('/__manifest', []);
  for (const m of manifest) { try { await import(m + '?v=' + Date.now()); } catch (e) { console.log('ERROR scene import ' + m + ': ' + e.message); window.IMPORT_ERRORS = (window.IMPORT_ERRORS || []).concat(m + ': ' + e.message); } }

  /* ---------- build sets + cast ---------- */
  const setGroups = new Map();
  for (const [name, build] of SETS) { try { const g = build(X); g.visible = false; scene.add(g); setGroups.set(name, g); } catch (e) { console.log('ERROR set ' + name + ': ' + e.stack); } }
  X.sets = setGroups;
  for (const [id, o] of CAST) { const h = makeHuman(o); h.root.visible = false; scene.add(h.root); humans.set(id, h); }

  /* ---------- captions ---------- */
  const chunks = []; { let cur = []; const flush = () => { if (cur.length) { chunks.push(cur); cur = []; } };
    for (const w of WORDS) { cur.push(w); const len = cur.map(x => x.w).join(' ').length; if (/[.?!:,]$|\.\.\.$/.test(w.w) || cur.length >= 5 || len > (vertical ? 26 : 40)) flush(); } flush(); }
  const capEl = $('cap'), accent_ = style.ui.accent, base_ = style.lightText ? '#2b2540' : '#ffffff';
  function captions(g, on) {
    let html = '';
    if (on) for (const ch of chunks) {
      const s = ch[0].start, e = ch[ch.length - 1].end + 0.22;
      if (g >= s && g < e) {
        let active = -1; ch.forEach((w, i) => { if (g >= w.start) active = i; });
        ch.forEach((w, i) => {
          if (g < w.start) return;                          // never show a word before it is spoken
          const isAct = i === active, since = g - w.start, pop = isAct ? 1 + 0.14 * Math.max(0, 1 - since / 0.14) : 1;
          html += `<span style="color:${(w.emph || isAct) ? accent_ : base_};transform:scale(${(pop * (w.emph ? 1.1 : 1)).toFixed(3)})">${w.w}</span> `;
        });
        break;
      }
    }
    if (capEl._last !== html) { capEl.innerHTML = html; capEl._last = html; }
  }

  /* ---------- frame ---------- */
  const shotAt = t => { const s = E.shots; for (let i = 0; i < s.length; i++) if (t >= s[i].start && t < s[i].end) return s[i]; return s[s.length - 1]; };
  const ovEl = $('ov'), flashEl = $('flash'), fadeEl = $('fade'), darkEl = $('dark'), ringEl = $('ring'), grainEl = $('grain'), canvas = renderer.domElement;
  function reset() { humans.forEach(h => h.root.visible = false); managed.forEach(o => o.visible = false); setGroups.forEach(g => g.visible = false);
    Object.assign(state, { flash: 0, dark: 0, grade: '', ring: null, lift: E.lift }); acc.intensity = 0; }

  window.renderFrame = f => {
    const g = f / fps, shot = shotAt(g), t = g - shot.start, dur = shot.end - shot.start;
    const def = SHOTS.get(shot.id), info = { dur, globalT: g, p: clamp(t / dur), shot, line: shot.line, ...(shot.params || {}) };
    reset(); let err = '';
    if (shot.lift !== undefined) state.lift = shot.lift;
    const sets = [].concat(shot.set ?? def?.set ?? []); sets.forEach(n => { const sg = setGroups.get(n); if (sg) sg.visible = true; else err = 'unknown set "' + n + '"'; });
    if (shot.light || def?.light) { try { const L = shot.light || def.light; Array.isArray(L) ? light(L[0], L[1]) : light(L); } catch (e) { err = e.message; } }
    if (def) { try { def.draw && def.draw(X, t, info); } catch (e) { err = e.message; console.log('ERROR shot ' + shot.id + ': ' + e.stack); } }
    else { err = 'MISSING SHOT ' + shot.id; setCam([0, 1.5, 6], [0, 1, 0], 40, 0, 0, t); }
    renderer.render(scene, camera);

    // overlays: declarative (shots.json) + programmatic (def.overlay returns specs)
    let specs = [...(shot.overlays || [])]; if (def?.overlay) { try { specs = specs.concat(def.overlay(X, t, info) || []); } catch (e) { err = e.message; } }
    ovEl.innerHTML = renderOverlays(specs, t, E) + (err ? `<div class="ov-err">${err.replace(/</g, '&lt;')}</div>` : '');
    captions(g, E.captions && shot.captions !== false);

    // transitions + global fades
    let fade = 0, white = 0; const tin = shot.in || {}, td = tin.dur ?? 0.35;
    if (t < td && g > 0.01) { const k = 1 - t / td; if (tin.type === 'fade') fade = k; else if (tin.type === 'dip') fade = k; else if (tin.type === 'dipWhite' || tin.type === 'flash') white = k * (tin.type === 'flash' ? 0.8 : 1); }
    const k0 = g / (CFG.fadeIn ?? 0.15); if (g < (CFG.fadeIn ?? 0.15)) fade = Math.max(fade, 1 - k0);
    const out = (E.duration - g) / (CFG.fadeOut ?? 0.5); if (out < 1) fade = Math.max(fade, 1 - out);
    fadeEl.style.opacity = clamp(fade); flashEl.style.opacity = clamp(Math.max(white, state.flash)); darkEl.style.opacity = clamp(state.dark);
    canvas.style.filter = state.grade || style.grade;
    grainEl.style.backgroundPosition = `${(f * 37) % 256}px ${(f * 91) % 256}px`;
    if (state.ring && state.ring.a > 0.01) { const v = new THREE.Vector3(...state.ring.p).project(camera); ringEl.style.opacity = state.ring.a; ringEl.style.left = ((v.x * 0.5 + 0.5) * W) + 'px'; ringEl.style.top = ((1 - (v.y * 0.5 + 0.5)) * H) + 'px'; ringEl.style.width = ringEl.style.height = state.ring.r * 2 + 'px'; } else ringEl.style.opacity = 0;
    window.LAST_ERROR = err; return !err;
  };
  window.TOTAL_FRAMES = Math.ceil(E.duration * fps);
  window.SHOT_LIST = E.shots.map(s => ({ id: s.id, start: s.start, end: s.end, ok: SHOTS.has(s.id) }));
  window.OUT = [W, H];
  // grain tile
  { const c = document.createElement('canvas'); c.width = c.height = 256; const gg = c.getContext('2d'), d = gg.createImageData(256, 256); let s = 1; for (let i = 0; i < d.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = (s / 2147483647) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } gg.putImageData(d, 0, 0); grainEl.style.backgroundImage = 'url(' + c.toDataURL() + ')'; }
  // optional logo
  try { const r = await fetch('/project/input/logo.png', { method: 'HEAD' }); if (r.ok) { root.classList.add('haslogo'); root.style.setProperty('--logo', 'url(/project/input/logo.png)'); } } catch (e) { }
}
boot().then(() => { window.READY = true; }).catch(e => { window.BOOT_ERROR = String(e && e.stack || e); console.log('ERROR boot ' + window.BOOT_ERROR); });
