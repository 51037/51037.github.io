function _twinkle(p, factor) {
  const v = p.variance * factor * (0.5 + Math.random() * 0.5);
  return Math.min(p.maxBright + v, 1.0);
}

// Returns rgba string. For non-rainbow, uses cfg hue so slider updates apply live.
function _pColor(p, alpha, pcfg) {
  if (pcfg.colorMode === 'white') return `rgba(255,255,255,${alpha.toFixed(3)})`;
  const hue = pcfg.colorMode === 'rainbow' ? p.hue : pcfg.hue;
  const l   = 50 + p.z * 30; // depth drives lightness: far=50%, near=80%
  const [r, g, b] = hslToRgb(hue / 360, pcfg.saturation / 100, l / 100);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

function renderBackground(ctx, w, h) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
}

function renderPassiveField(ctx, passiveParticles, twinkleFactor) {
  for (const p of passiveParticles) {
    const alpha = _twinkle(p, twinkleFactor) * (0.2 + p.z * 0.5);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
}

function renderActiveField(ctx, particles, nodes, cfg, mouseX, mouseY) {
  const maxR    = cfg.connections.maxRadius;
  const maxRN   = cfg.nodes.maxRadius;
  const mouseR2 = (maxRN * 1.5) * (maxRN * 1.5);
  const nodeR2  = maxRN * maxRN;
  const pcfg    = cfg.particles;
  const useGrad = cfg.connections.gradient && pcfg.colorMode !== 'white';

  for (const p of particles) {
    const baseAlpha = _twinkle(p, pcfg.twinkle) * (0.4 + p.z * 0.6);
    ctx.fillStyle = _pColor(p, baseAlpha, pcfg);
    ctx.fillRect(p.x, p.y, p.size, p.size);

    // Mirror original logic: render connections from p if p is in a node zone,
    // or per-connection if the target is near the mouse.
    let sourceInNode = false;
    for (const n of nodes) {
      if (dist2(p.x, p.y, n.x, n.y) <= nodeR2) { sourceInNode = true; break; }
    }

    const near = getNearParticles(p.x, p.y, maxR, cfg.connections.nClosest);
    if (near.length < 2) continue;

    for (const { p: q, dist } of near) {
      const render = sourceInNode || dist2(q.x, q.y, mouseX, mouseY) <= mouseR2;
      if (!render) continue;

      // Slightly reduce alpha when two particles differ greatly in depth
      const zMatch    = 1 - Math.abs(p.z - q.z) * 0.4;
      const connAlpha = (1 - dist / maxR) * cfg.connections.alphaBias * zMatch;
      ctx.lineWidth   = 0.5 + p.z * 0.75;

      if (useGrad) {
        const grad = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
        grad.addColorStop(0, _pColor(p, connAlpha, pcfg));
        grad.addColorStop(1, _pColor(q, connAlpha, pcfg));
        ctx.strokeStyle = grad;
      } else {
        ctx.strokeStyle = `rgba(255,255,255,${connAlpha.toFixed(3)})`;
      }
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }
  }
}

function renderDebug(ctx, cfg, fps) {
  if (!cfg.debug) return;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(8, 8, 240, 118);
  ctx.fillStyle = '#0f0';
  ctx.font = '12px monospace';
  ctx.fillText(`FPS:       ${fps.toFixed(1)}`,              18, 28);
  ctx.fillText(`Particles: ${particles.length}`,            18, 46);
  ctx.fillText(`Passive:   ${passiveParticles.length}`,     18, 64);
  ctx.fillText(`Nodes:     ${nodes.length}`,                18, 82);
  ctx.fillText(`Depth:     ${cfg.depth.enabled ? 'on  factor='+cfg.depth.factor : 'off'}`, 18, 100);
  ctx.fillText(`Mode:      ${cfg.particles.colorMode}`,     18, 118);
}
