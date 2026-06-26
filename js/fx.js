let ripples = [];

// amplify/radiusMul come from the click combo (successive clicks stack).
// Timing is tracked against SIM (the scaled simulation clock), so the global
// sim-speed control stretches/compresses ripple + bolt animations too.
function addRipple(x, y, cfg, radiusMul) {
  ripples.push({
    x, y,
    maxR: cfg.click.rippleRadius * (radiusMul || 1),
    dur:  cfg.click.rippleDuration,
    born: SIM,
  });
}

function updateRipples() {
  ripples = ripples.filter(r => (SIM - r.born) < r.dur);
}

function renderRipples(ctx) {
  for (const rp of ripples) {
    const t = (SIM - rp.born) / rp.dur;
    const alpha = (1 - t) * 0.55;
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.maxR * t, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.lineWidth = 2.5 * (1 - t);
    ctx.stroke();
  }
}

// ── Lightning ────────────────────────────────────────────────────────────────
// A random "heavy node" (invisible) flashes into being and arcs bright bolts to
// every node within reach, then fades. It also yanks nearby particles toward it.

let bolts = [];

function updateLightning(dt, cfg) {
  bolts = bolts.filter(b => (SIM - b.born) < b.dur);

  const lc = cfg.lightning;
  if (!lc.enabled || nodes.length < 1) return;

  // Poisson-ish trigger: frequency = expected strikes per second.
  if (Math.random() < lc.frequency * dt / 1000) _triggerLightning(cfg);
}

function _triggerLightning(cfg) {
  const lc  = cfg.lightning;
  const ox  = Math.random() * W;
  const oy  = Math.random() * H;
  const r2  = lc.radius * lc.radius;

  const targets = nodes
    .map(n => ({ n, d2: dist2(ox, oy, n.x, n.y) }))
    .filter(o => o.d2 <= r2)
    .sort((a, b) => a.d2 - b.d2)
    .slice(0, lc.branches | 0);

  if (targets.length === 0) return;

  const segs = [];
  for (const { n } of targets) _makeBolt(segs, ox, oy, n.x, n.y, lc);
  bolts.push({
    born:      SIM,
    dur:       lc.duration,
    intensity: lc.intensity,
    t:         0.5 + Math.random() * 0.5, // brighter half of the palette so the hue reads
    hue:       Math.random(),             // stable hue for rainbow mode
    segs,
  });

  if (lc.pull > 0) _applyLightningPull(ox, oy, lc.radius, lc.pull);
}

// Build a jagged polyline (plus optional fork offshoots) from (x0,y0) to
// (x1,y1) and append each polyline to `out`. Shape is driven by lc controls.
function _makeBolt(out, x0, y0, x1, y1, lc) {
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len; // unit perpendicular
  const steps = Math.max(2, lc.segments | 0);
  const jag   = lc.jaggedness;

  const pts = [{ x: x0, y: y0 }];
  for (let i = 1; i < steps; i++) {
    const t   = i / steps;
    const off = (Math.random() * 2 - 1) * len * jag;
    pts.push({ x: x0 + dx * t + nx * off, y: y0 + dy * t + ny * off });
  }
  pts.push({ x: x1, y: y1 });
  out.push(pts);

  // Forks: short jagged offshoots springing from interior kinks.
  const forks = lc.forks | 0;
  for (let f = 0; f < forks && pts.length > 2; f++) {
    const a   = pts[1 + ((Math.random() * (pts.length - 2)) | 0)];
    const ang = Math.atan2(dy, dx) + (Math.random() * 2 - 1) * 1.2;
    const fl  = len * (0.15 + Math.random() * 0.25);
    _makeBolt(out, a.x, a.y, a.x + Math.cos(ang) * fl, a.y + Math.sin(ang) * fl,
              { segments: Math.max(2, (steps / 2) | 0), jaggedness: jag, forks: 0 });
  }
}

// Heavy node = strong attractive impulse on nearby particles.
function _applyLightningPull(x, y, radius, strength) {
  const r2 = radius * radius;
  for (const p of particles) {
    const d2 = dist2(p.x, p.y, x, y);
    if (d2 > 0 && d2 < r2) {
      const d = Math.sqrt(d2);
      const force = (1 - d / radius) * strength;
      p.xvel += (x - p.x) / d * force;
      p.yvel += (y - p.y) / d * force;
    }
  }
}

// Resolve a bolt's base [r,g,b]. 'match' follows the particle colour mode so
// lightning tracks the coloring selection; the others force a specific look.
function _boltRGB(b, pcfg, source) {
  let mode = source === 'match' ? pcfg.colorMode : source;
  switch (mode) {
    case 'white':   return [255, 255, 255];
    case 'palette': return lutColor(b.t);
    case 'rainbow': return hslToRgb(b.hue, pcfg.saturation / 100, 0.6);
    case 'mono':
    case 'monochrome': return hslToRgb(pcfg.hue / 360, pcfg.saturation / 100, 0.6);
    default:        return [255, 255, 255]; // particle 'white' mode → white bolts
  }
}

function renderLightning(ctx, cfg) {
  if (bolts.length === 0) return;
  const lc  = cfg.lightning;
  const pcfg = cfg.particles;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const b of bolts) {
    const t = (SIM - b.born) / b.dur;
    const a = 1 - t;
    const alpha = Math.min(1, a * a * b.intensity);
    // Bolt colour follows the lightning colour source, lifted slightly toward
    // white so the hue stays dominant while the core still reads as hot.
    const [r, g, bl] = _boltRGB(b, pcfg, lc.color);
    const lift = v => Math.round(v + (255 - v) * 0.2);
    ctx.strokeStyle = `rgba(${lift(r)},${lift(g)},${lift(bl)},${alpha.toFixed(3)})`;
    ctx.shadowColor = `rgba(${r},${g},${bl},${alpha.toFixed(3)})`;
    ctx.shadowBlur  = lc.glow * a;
    ctx.lineWidth   = lc.width * a + 0.4;
    for (const pts of b.segs) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
  }
  ctx.restore();
}
