// Gradient colour palettes mapped to a 256-entry LUT.
// Each palette is an array of CSS hex stops; the LUT interpolates between them.

const PALETTES = {
  fire:      ['#000', '#600', '#c30', '#f60', '#ff0', '#fff'],
  ocean:     ['#000', '#013', '#036', '#09b', '#4ce', '#fff'],
  nebula:    ['#000', '#210', '#519', '#a4e', '#e9f', '#fff'],
  neon:      ['#001', '#0f4', '#0ef', '#f0f', '#ff0', '#fff'],
  sunset:    ['#100', '#400', '#820', '#e40', '#f80', '#fc0'],
  aurora:    ['#000', '#011', '#065', '#0a8', '#4fb', '#cfe'],
  candy:     ['#110', '#a08', '#f4c', '#fc8', '#8ff', '#fff'],
  thermal:   ['#000', '#00f', '#0ff', '#0f0', '#ff0', '#f00'],
  grayscale: ['#000', '#333', '#777', '#aaa', '#ddd', '#fff'],
};

const PALETTE_NAMES = {
  fire: 'Fire', ocean: 'Ocean', nebula: 'Nebula', neon: 'Neon',
  sunset: 'Sunset', aurora: 'Aurora', candy: 'Candy',
  thermal: 'Thermal', grayscale: 'Grayscale',
};

let _lut            = new Uint8Array(256 * 3);
let _currentPalette = null;

function setActivePalette(name) {
  const key = PALETTES[name] ? name : 'fire';
  if (key === _currentPalette) return;
  _currentPalette = key;
  _buildLUT(PALETTES[key]);
}

function _parse(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function _buildLUT(stops) {
  for (let i = 0; i < 256; i++) {
    const t   = i / 255;
    const seg = t * (stops.length - 1);
    const lo  = Math.floor(seg);
    const hi  = Math.min(lo + 1, stops.length - 1);
    const f   = seg - lo;
    const c0  = _parse(stops[lo]);
    const c1  = _parse(stops[hi]);
    const j   = i * 3;
    _lut[j]   = (c0[0] + (c1[0] - c0[0]) * f) | 0;
    _lut[j+1] = (c0[1] + (c1[1] - c0[1]) * f) | 0;
    _lut[j+2] = (c0[2] + (c1[2] - c0[2]) * f) | 0;
  }
}

// Returns [r, g, b] for t ∈ [0, 1].
function lutColor(t) {
  const j = Math.min(255, (t * 255) | 0) * 3;
  return [_lut[j], _lut[j+1], _lut[j+2]];
}

setActivePalette('fire');
