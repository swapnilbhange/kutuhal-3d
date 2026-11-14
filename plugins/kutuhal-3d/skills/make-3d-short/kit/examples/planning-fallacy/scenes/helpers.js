// Shared staging helpers for the desk scenes.
export function sitMaya(X, t, o = {}) {
  const h = X.human('maya'); X.place(h, 0, 0, -1.22, 0);
  const tp = Math.sin(t * 9) * 0.04 * (o.type ?? 1);
  X.pose(h, X.SIT({ torsoX: 0.2, headX: 0.1, shL: [-1.1 + tp, 0.12], shR: [-1.1 - tp, 0.12], elL: 0.5, elR: 0.5, ...(o.pose || {}) }));
  X.expr(h, t, o.expr || { brow: 0.2, mouth: 0.5 });
  return h;
}
export const localTime = (X, info, word, fallback = 0) => { const g = X.wordTime(word, info.shot.start - 0.01); return g === null ? fallback : Math.max(0, g - info.shot.start); };
