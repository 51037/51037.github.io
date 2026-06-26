// Globals shared across sim/render/fx modules.
let particles, passiveParticles, nodes, grid;

function initSim(w, h, cfg) {
  grid = new SpatialGrid(cfg.connections.maxRadius);
  particles      = _makeParticles(cfg.particles.count, w, h, cfg.particles, cfg.depth);
  passiveParticles = _makePassive(cfg.passive.count,   w, h, cfg.passive,   cfg.depth);
  nodes          = _makeNodes(cfg.nodes.count, w, h, cfg.nodes);
}

// depthFactor: 1 = near (fast/big/bright), approaches (1 - factor*0.7) at z=0 (far)
function _depthFactor(z, dc) {
  return dc.enabled ? (1 - dc.factor * 0.7 * (1 - z)) : 1.0;
}

function _makeParticles(count, w, h, pc, dc) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const z  = Math.random();
    const df = _depthFactor(z, dc);
    const ms = pc.maxSpeed * df;
    arr.push({
      x:         Math.random() * w,
      y:         Math.random() * h,
      z,
      xvel:      (Math.random() * 2 - 1) * ms,
      yvel:      (Math.random() * 2 - 1) * ms,
      size:      Math.pow(Math.random(), 2) * pc.maxSize * df + 0.2,
      maxBright: 0.75 + Math.random() * 0.25,
      variance:  Math.random() * 0.2 - 0.1,
      hue:       pc.colorMode === 'rainbow' ? Math.random() * 360 : pc.hue,
    });
  }
  return arr;
}

function _makePassive(count, w, h, pc, dc) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const z  = Math.random() * 0.45;
    const df = _depthFactor(z, dc);
    const ms = pc.maxSpeed * (0.3 + z);
    arr.push({
      x:         Math.random() * w,
      y:         Math.random() * h,
      z,
      xvel:      (Math.random() * 2 - 1) * ms,
      yvel:      (Math.random() * 2 - 1) * ms,
      size:      Math.pow(Math.random(), 2) * pc.maxSize + 0.1,
      maxBright: 0.5 + Math.random() * 0.25,
      variance:  Math.random() * 0.15 - 0.075,
    });
  }
  return arr;
}

function _makeNodes(count, w, h, nc) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const ms = nc.maxSpeed;
    arr.push({
      x:    Math.random() * w,
      y:    Math.random() * h,
      xvel: (Math.random() * 2 - 1) * ms,
      yvel: (Math.random() * 2 - 1) * ms,
    });
  }
  return arr;
}

function updateSim(w, h, cfg) {
  for (const n of nodes) {
    n.x += n.xvel; n.y += n.yvel;
    if (n.x > w || n.x < 0) n.xvel *= -1;
    if (n.y > h || n.y < 0) n.yvel *= -1;
  }

  grid.cellSize = cfg.connections.maxRadius;
  grid.clear();

  for (const p of particles) {
    p.x += p.xvel; p.y += p.yvel;
    if (p.x > w || p.x < 0) p.xvel *= -1;
    if (p.y > h || p.y < 0) p.yvel *= -1;
    grid.insert(p);
  }

  for (const p of passiveParticles) {
    p.x += p.xvel; p.y += p.yvel;
    if (p.x > w || p.x < 0) p.xvel *= -1;
    if (p.y > h || p.y < 0) p.yvel *= -1;
  }
}

function getNearParticles(px, py, maxR, nClosest) {
  const candidates = grid.query(px, py, maxR);
  const r2 = maxR * maxR;
  const hits = [];
  for (const q of candidates) {
    const d2 = dist2(px, py, q.x, q.y);
    if (d2 > 0 && d2 <= r2) hits.push({ p: q, dist: Math.sqrt(d2) });
  }
  hits.sort((a, b) => a.dist - b.dist);
  return nClosest > 0 ? hits.slice(0, nClosest) : hits;
}

function applyClickImpulse(x, y, cfg) {
  const r  = cfg.click.rippleRadius;
  const r2 = r * r;
  const str = cfg.click.impulse;
  for (const p of particles) {
    const d2 = dist2(p.x, p.y, x, y);
    if (d2 > 0 && d2 < r2) {
      const d = Math.sqrt(d2);
      const force = (1 - d / r) * str;
      p.xvel += (p.x - x) / d * force;
      p.yvel += (p.y - y) / d * force;
    }
  }
}
