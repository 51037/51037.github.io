function hslToRgb(h, s, l) {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h)       * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

function dist2(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return dx * dx + dy * dy;
}

function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); }

function deepMerge(base, override) {
  const result = deepCopy(base);
  for (const k in override) {
    if (k in result && override[k] !== null && typeof override[k] === 'object' && !Array.isArray(override[k])) {
      result[k] = deepMerge(result[k], override[k]);
    } else {
      result[k] = override[k];
    }
  }
  return result;
}
