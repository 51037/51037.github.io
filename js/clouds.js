// Perlin-noise cloud overlay that drifts across the canvas.
// Renders to a small offscreen canvas then scales up — cheap and smooth.

let _cOff    = { x: 0, y: 0 };
let _cCanvas = null;
let _cCtx    = null;
let _cImg    = null; // reused ImageData

function initClouds() {
  _cOff = { x: 0, y: 0 };
  if (!_cCanvas) {
    _cCanvas = document.createElement('canvas');
    _cCtx    = _cCanvas.getContext('2d');
  }
  // canvas and ImageData are lazily sized on first renderClouds call
}

function updateClouds(dt, cfg) {
  if (!cfg.clouds.enabled) return;
  const rad = cfg.clouds.direction * (Math.PI / 180);
  const spd = cfg.clouds.speed * 0.0001; // slider 0-10 → 0-0.001 units/ms
  _cOff.x += Math.cos(rad) * spd * dt;
  _cOff.y += Math.sin(rad) * spd * dt;
}

function renderClouds(ctx, w, h, cfg) {
  const cc = cfg.clouds;
  if (!cc.enabled || cc.opacity <= 0) return;

  const res = Math.max(1, cc.resolution | 0);
  const cw  = Math.ceil(w / res);
  const ch  = Math.ceil(h / res);

  // Rebuild offscreen canvas if resolution or screen size changed.
  if (_cCanvas.width !== cw || _cCanvas.height !== ch) {
    _cCanvas.width  = cw;
    _cCanvas.height = ch;
    _cImg = null; // force ImageData rebuild
  }
  if (!_cImg || _cImg.width !== cw || _cImg.height !== ch) {
    _cImg = _cCtx.createImageData(cw, ch);
  }

  const data     = _cImg.data;
  const invScale = 1 / cc.scale;
  const thresh   = cc.threshold;
  const inv1t    = thresh < 1 ? 1 / (1 - thresh) : 1;
  const octs     = Math.max(1, cc.octaves | 0);
  const pers     = cc.persistence;
  const maxA     = cc.opacity * 255;

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const nx = x * res * invScale + _cOff.x;
      const ny = y * res * invScale + _cOff.y;

      // Raw noise [-1,1] → [0,1], then threshold + power curve for puffy edges
      let n = (perlin.octave(nx, ny, octs, pers) + 1) * 0.5;
      n = n < thresh ? 0 : Math.pow((n - thresh) * inv1t, 1.5);

      const idx      = (y * cw + x) * 4;
      data[idx]      = 255;
      data[idx + 1]  = 255;
      data[idx + 2]  = 255;
      data[idx + 3]  = n * maxA;
    }
  }

  _cCtx.putImageData(_cImg, 0, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'low';
  ctx.drawImage(_cCanvas, 0, 0, w, h);
  ctx.restore();
}
