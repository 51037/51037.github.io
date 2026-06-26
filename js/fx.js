let ripples = [];

function addRipple(x, y, cfg) {
  ripples.push({
    x, y,
    maxR: cfg.click.rippleRadius,
    dur:  cfg.click.rippleDuration,
    born: performance.now(),
  });
}

function updateRipples() {
  const now = performance.now();
  ripples = ripples.filter(r => (now - r.born) < r.dur);
}

function renderRipples(ctx) {
  const now = performance.now();
  for (const rp of ripples) {
    const t = (now - rp.born) / rp.dur;
    const alpha = (1 - t) * 0.55;
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.maxR * t, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.lineWidth = 2.5 * (1 - t);
    ctx.stroke();
  }
}
