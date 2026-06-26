// Classic improved Perlin noise (Ken Perlin, 2002).
const _GRAD2 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];

class Perlin {
  constructor() {
    this._p = new Uint8Array(512);
    this.reseed();
  }

  reseed() {
    const src = Array.from({length: 256}, (_, i) => i);
    for (let i = 255; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = src[i]; src[i] = src[j]; src[j] = t;
    }
    for (let i = 0; i < 512; i++) this._p[i] = src[i & 255];
  }

  _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  _lerp(t, a, b) { return a + t * (b - a); }
  _g(h, x, y) { const [gx,gy] = _GRAD2[h & 7]; return gx*x + gy*y; }

  _n(x, y) {
    const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x),   yf = y - Math.floor(y);
    const u  = this._fade(xf),       v  = this._fade(yf);
    const p  = this._p;
    const aa = p[p[xi]   + yi],     ab = p[p[xi]   + yi + 1];
    const ba = p[p[xi+1] + yi],     bb = p[p[xi+1] + yi + 1];
    return this._lerp(v,
      this._lerp(u, this._g(aa, xf,   yf  ), this._g(ba, xf-1, yf  )),
      this._lerp(u, this._g(ab, xf,   yf-1), this._g(bb, xf-1, yf-1))
    );
  }

  // Fractal (octave) noise — returns value in [-1, 1].
  octave(x, y, octaves, persistence) {
    let val = 0, amp = 1, freq = 1, norm = 0;
    for (let i = 0; i < octaves; i++) {
      val  += this._n(x * freq, y * freq) * amp;
      norm += amp;
      amp  *= persistence;
      freq *= 2;
    }
    return val / norm;
  }
}

const perlin = new Perlin();
