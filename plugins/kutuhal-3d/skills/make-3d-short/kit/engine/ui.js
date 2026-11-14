// ui.js — declarative on-screen graphics (shots.json "overlays") rendered as DOM, deterministic per frame.
import { clamp, sm, seg, ob, lerp } from './lib.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const em = s => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');          // *word* -> accent colour
const POS = { top: 0.10, upper: 0.19, center: 0.34, mid: 0.44, low: 0.55 };
const XPOS = { left: 0.27, center: 0.5, right: 0.73 };

function fmt(v, f = 'int', prefix = '', suffix = '') {
  let s;
  if (f === 'money') s = Math.round(v).toLocaleString('en-US');
  else if (f === 'dec1') s = v.toFixed(1);
  else if (f === 'dec2') s = v.toFixed(2);
  else if (f === 'pct') s = Math.round(v) + '%';
  else s = String(Math.round(v));
  return prefix + s + suffix;
}

/** Render all overlays active at shot-local time t. Returns an HTML string for the #ov layer. */
export function renderOverlays(specs, t, E) {
  let html = '';
  (specs || []).forEach((o, idx) => {
    const at = o.at ?? 0, dur = o.dur ?? 3, k = t - at;
    if (k < 0 || (dur !== null && k > dur + 0.05)) return;
    const inn = ob(seg(k, 0, 0.32)), out = dur === null ? 1 : 1 - sm(seg(k, dur - 0.3, dur));
    const a = clamp(inn * out * 1.0, 0, 1), top = (POS[o.pos] ?? POS.center) * E.H;
    const px = (XPOS[o.x] ?? 0.5) * E.W;
    switch (o.type) {
      case 'title': {
        const lines = o.lines || [o.text || ''];
        html += `<div class="ov-title" style="top:${E.H * (POS[o.pos] ?? 0.36)}px;opacity:${clamp(k / 0.12) * out};transform:translate(-50%,-50%) scale(${(1.35 - 0.35 * inn).toFixed(3)})">` +
          lines.map((l, i) => `<span class="l${i % 2 ? 1 : 0}${i === 0 && lines.length > 2 ? ' small' : ''}">${esc(l)}</span>`).join('') + `<div class="rule"></div></div>`;
        if (o.sub) html += `<div class="ov-sub" style="top:${E.H * 0.50}px;opacity:${sm(seg(k, 0.8, 1.2)) * out};transform:translate(-50%,${((1 - sm(seg(k, 0.8, 1.2))) * 24).toFixed(1)}px)">${em(o.sub)}</div>`;
        break; }
      case 'big':
        html += `<div class="ov-big" style="top:${top}px;opacity:${a};transform:translate(-50%,${((1 - inn) * 30).toFixed(1)}px)"><span class="m1">${em(o.text || '')}</span>${o.sub ? `<span class="m2">${em(o.sub)}</span>` : ''}</div>`;
        break;
      case 'stat':
        html += `<div class="ov-stat c-${o.color || 'accent'}" style="top:${top}px;left:${px}px;opacity:${a};transform:translate(-50%,0) scale(${(0.7 + 0.3 * inn).toFixed(3)})"><b>${esc(o.value)}</b>${o.label ? `<small>${esc(o.label)}</small>` : ''}</div>`;
        break;
      case 'counter': {
        const cd = o.count ?? Math.min(dur, 2.0), v = lerp(o.from ?? 0, o.to ?? 100, sm(seg(k, o.delay ?? 0.2, (o.delay ?? 0.2) + cd)));
        html += `<div class="ov-stat c-${o.color || 'accent'}" style="top:${top}px;left:${px}px;opacity:${a};transform:translate(-50%,0) scale(${(0.7 + 0.3 * inn).toFixed(3)})"><b>${esc(fmt(v, o.format, o.prefix, o.suffix))}</b>${o.label ? `<small>${esc(o.label)}</small>` : ''}</div>`;
        break; }
      case 'toast':
        html += `<div class="toast" style="top:${E.H * 0.16 + (o.slot || 0) * 92}px;opacity:${a};transform:translate(-50%,${((1 - inn) * -90).toFixed(1)}px)"><div class="chk">${esc(o.icon || '✓')}</div><div><b>${esc(o.title || '')}</b><span>${esc(o.value || '')}</span></div></div>`;
        break;
      case 'list': {
        const step = o.step ?? 0.9;
        html += `<div class="ov-list" style="top:${top}px;opacity:${out}">` + (o.items || []).map((it, i) => {
          const ik = k - 0.2 - i * step; if (ik < 0) return '';
          return `<div style="opacity:${sm(seg(ik, 0, 0.3))};transform:translateX(${((1 - ob(seg(ik, 0, 0.35))) * -50).toFixed(1)}px)"><i></i>${em(it)}</div>`; }).join('') + `</div>`;
        break; }
      case 'bars': {
        const mx = o.max ?? Math.max(...(o.items || []).map(b => b.value), 1), step = o.step ?? 0.35;
        html += `<div class="ov-bars" style="top:${top}px;opacity:${out}">` + (o.items || []).map((b, i) => {
          const bk = k - 0.2 - i * step, g = sm(seg(bk, 0, 0.9));
          return `<div class="row"><span class="lab">${esc(b.label)}</span><div class="trk"><div class="bar c-${b.color || 'accent'}" style="width:${(g * clamp(b.value / mx) * 100).toFixed(1)}%"></div></div><span class="val">${esc(fmt(b.value * g, o.format, o.prefix, o.suffix))}</span></div>`; }).join('') + `</div>`;
        break; }
      case 'quote':
        html += `<div class="ov-quote" style="top:${top}px;opacity:${a};transform:translate(-50%,${((1 - inn) * 24).toFixed(1)}px)"><span>“${em(o.text || '')}”</span>${o.who ? `<small>— ${esc(o.who)}</small>` : ''}</div>`;
        break;
      case 'end': {
        const g = sm(seg(k, 0, 0.6));
        html += `<div class="ov-end" style="opacity:${g}"><div class="endtxt" style="transform:translateY(${((1 - sm(seg(k, 0, 0.8))) * 30).toFixed(1)}px)">${(o.lines || []).map(em).join('<br>')}</div><div class="endline" style="width:${(sm(seg(k, 0.4, 1.2)) * 360).toFixed(0)}px"></div>${o.logo ? '<div class="endlogo"></div>' : ''}</div>`;
        break; }
      default: html += `<div class="ov-err">unknown overlay type: ${esc(o.type)}</div>`;
    }
  });
  return html;
}
