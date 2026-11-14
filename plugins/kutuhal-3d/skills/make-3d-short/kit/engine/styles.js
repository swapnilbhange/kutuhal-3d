// styles.js — light moods (3D lighting presets) and visual style presets (UI colours + colour grade).

/** Light moods. Positions are OFFSETS from the `focus` point passed to X.light(mood, {focus}).
 *  Keys: hc/hg/hi hemisphere sky/ground/intensity · k* spot key · r* rim · f* fill · bg/fn/ff background + fog. */
export const MOODS = {
  day:          { hc: 0xcfe0ff, hg: 0x6a5a48, hi: 1.25, kc: 0xfff2dc, ki: 150, ka: 0.9, kpen: 0.8, rc: 0xbcd4ff, ri: 1.0, fc: 0xffe8cc, fi: 8,  bg: 0x9ec3ee, fn: 25, ff: 90 },
  golden:       { hc: 0xffd8a8, hg: 0x3a2418, hi: 1.0,  kc: 0xffc27a, ki: 170, ka: 0.8, kpen: 0.8, rc: 0xff9a60, ri: 2.2, fc: 0xffb070, fi: 10, bg: 0xd98a52, fn: 25, ff: 90 },
  dusk:         { hc: 0x9aa8e0, hg: 0x3a2a24, hi: 1.0,  kc: 0xffcf9a, ki: 160, ka: 0.8, kpen: 0.8, rc: 0xffa070, ri: 2.4, fc: 0xffb070, fi: 9,  bg: 0x3a3560, fn: 25, ff: 90 },
  night:        { hc: 0x5060a0, hg: 0x10101a, hi: 0.6,  kc: 0xaac0ff, ki: 100, ka: 0.8, kpen: 0.8, rc: 0x6a8cff, ri: 1.8, fc: 0x6070c0, fi: 6,  bg: 0x0b1020, fn: 14, ff: 50 },
  warmInterior: { hc: 0x8090c8, hg: 0x2a1c14, hi: 1.0,  kc: 0xffe0b8, ki: 180, ka: 0.9, kpen: 0.8, rc: 0x88aaff, ri: 1.6, fc: 0xffb878, fi: 14, bg: 0x1c2238, fn: 16, ff: 45 },
  coolInterior: { hc: 0x90a8e0, hg: 0x1c2028, hi: 1.0,  kc: 0xe0ecff, ki: 150, ka: 0.9, kpen: 0.8, rc: 0x88ccff, ri: 1.8, fc: 0x9ab8ff, fi: 10, bg: 0x141c2c, fn: 16, ff: 45 },
  studio:       { hc: 0x7080c0, hg: 0x2a2018, hi: 0.8,  kc: 0xffe5bd, ki: 190, ka: 0.5, kpen: 0.7, rc: 0x7aa2ff, ri: 1.6, fc: 0xffb878, fi: 12, bg: 0x0d1428, fn: 14, ff: 45 },
  void:         { hc: 0x6070b0, hg: 0x14101c, hi: 0.8,  kc: 0xe8eeff, ki: 110, ka: 0.8, kpen: 0.9, rc: 0x88aaff, ri: 1.4, fc: 0x8890d0, fi: 8,  bg: 0x070b18, fn: 12, ff: 40 },
};
// offsets from focus (same for every mood unless overridden with {over:{kp:[...]}})
export const OFFSETS = { kp: [1.8, 5.0, 2.6], kt: [0, -0.4, 0], rp: [-3, 3.2, -3], rt: [0, 0.2, 0], fp: [-0.8, 1.4, 4.0] };

/** Visual style presets: UI colours, CSS colour grade, vignette and grain strength. */
export const STYLES = {
  midnight: { name: 'Midnight Gold', desc: 'Navy and charcoal with gold accents (default).',
    ui: { accent: '#ffd23f', text: '#ffffff', alert: '#ff4d4d', ok: '#2fe08a', panel: 'rgba(14,20,38,.88)', bg1: '#16244a', bg2: '#05070f' },
    grade: 'saturate(1.08) contrast(1.04)', vignette: 0.55, grain: 0.07 },
  ember:    { name: 'Ember', desc: 'Warm, high contrast, copper and crimson. Drama and history.',
    ui: { accent: '#ff9a3c', text: '#fff4e8', alert: '#ff4040', ok: '#7be07b', panel: 'rgba(30,14,10,.88)', bg1: '#3a1410', bg2: '#0c0504' },
    grade: 'saturate(1.18) contrast(1.1) sepia(0.12)', vignette: 0.65, grain: 0.09 },
  arctic:   { name: 'Arctic', desc: 'Cool, clean, crisp. Science, tech and explainers.',
    ui: { accent: '#5de0ff', text: '#f2fbff', alert: '#ff6a6a', ok: '#5df0b0', panel: 'rgba(8,22,34,.88)', bg1: '#0f3050', bg2: '#030a12' },
    grade: 'saturate(1.0) contrast(1.06) hue-rotate(-8deg)', vignette: 0.4, grain: 0.03 },
  neon:     { name: 'Neon', desc: 'Deep blacks, magenta and teal. Tech, nightlife, futurism.',
    ui: { accent: '#ff3df0', text: '#ffffff', alert: '#ff3d5a', ok: '#2dffd0', panel: 'rgba(14,6,28,.88)', bg1: '#2a0c46', bg2: '#05020c' },
    grade: 'saturate(1.35) contrast(1.12) hue-rotate(6deg)', vignette: 0.6, grain: 0.06 },
  pastel:   { name: 'Pastel', desc: 'Soft, light and friendly. Lifestyle, wellbeing, kids.',
    ui: { accent: '#ff8fb8', text: '#2b2540', alert: '#e8505b', ok: '#3fbf8a', panel: 'rgba(255,255,255,.9)', bg1: '#f6e9ff', bg2: '#cfd8ff' },
    grade: 'saturate(0.95) contrast(0.98) brightness(1.04)', vignette: 0.2, grain: 0.03, lightText: true },
};
export const DEFAULT_STYLE = 'midnight';
