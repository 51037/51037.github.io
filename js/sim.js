// Globals shared with render/fx modules.
let particles, passiveParticles, nodes, grid;

// ── Initialisation ──────────────────────────────────────────────────────────

function initSim(w, h, cfg) {
  grid = new SpatialGrid(cfg.connections.maxRadius);

  const pPos  = stratifiedPositions(cfg.particles.count, w, h);
  const ppPos = stratifiedPositions(cfg.passive.count,   w, h);
  const nPos  = stratifiedPositions(cfg.nodes.count,     w, h);

  particles        = pPos .map(({x,y}) => _spawnParticle(x, y, w, h, cfg.particles, cfg.depth, true));
  passiveParticles = ppPos.map(({x,y}) => _spawnPassive (x, y, w, h, cfg.passive,   cfg.depth, true));
  nodes            = nPos .map(({x,y}) => _spawnNode    (x, y,        cfg.nodes));
}

// ── Spawn helpers ────────────────────────────────────────────────────────────

function _depthFactor(z, dc) {
  return dc.enabled ? (1 - dc.factor * 0.7 * (1 - z)) : 1.0;
}

// stagger=true gives a random initial age so all particles don't die at once
function _spawnParticle(x, y, w, h, pc, dc, stagger) {
  const z   = Math.random();
  const df  = _depthFactor(z, dc);
  const ms  = pc.maxSpeed * df;
  const maxAge = (8 + Math.random() * 12) * 1000; // 8-20 s in ms
  return {
    x, y, z,
    xvel:      (Math.random() * 2 - 1) * ms,
    yvel:      (Math.random() * 2 - 1) * ms,
    size:      Math.pow(Math.random(), 2) * pc.maxSize * df + 0.2,
    maxBright: 0.75 + Math.random() * 0.25,
    variance:  Math.random() * 0.2 - 0.1,
    hue:       pc.colorMode === 'rainbow' ? Math.random() * 360 : pc.hue,
    age:       stagger ? Math.random() * maxAge * 0.75 : 0,
    maxAge,
  };
}

function _spawnPassive(x, y, w, h, pc, dc, stagger) {
  const z      = Math.random() * 0.45;
  const ms     = pc.maxSpeed * (0.3 + z);
  const maxAge = (10 + Math.random() * 15) * 1000;
  return {
    x, y, z,
    xvel:      (Math.random() * 2 - 1) * ms,
    yvel:      (Math.random() * 2 - 1) * ms,
    size:      Math.pow(Math.random(), 2) * pc.maxSize + 0.1,
    maxBright: 0.5 + Math.random() * 0.25,
    variance:  Math.random() * 0.15 - 0.075,
    age:       stagger ? Math.random() * maxAge * 0.75 : 0,
    maxAge,
  };
}

function _spawnNode(x, y, nc) {
  const ms = nc.maxSpeed;
  return {
    x, y,
    xvel: (Math.random() * 2 - 1) * ms,
    yvel: (Math.random() * 2 - 1) * ms,
  };
}

// Respawn a dead particle in-place with current config (no alloc, just mutate).
function _respawnParticle(p, w, h, pc, dc) {
  const x  = Math.random() * w;
  const y  = Math.random() * h;
  const z  = Math.random();
  const df = _depthFactor(z, dc);
  const ms = pc.maxSpeed * df;
  p.x = x; p.y = y; p.z = z;
  p.xvel      = (Math.random() * 2 - 1) * ms;
  p.yvel      = (Math.random() * 2 - 1) * ms;
  p.size      = Math.pow(Math.random(), 2) * pc.maxSize * df + 0.2;
  p.maxBright = 0.75 + Math.random() * 0.25;
  p.variance  = Math.random() * 0.2 - 0.1;
  p.hue       = pc.colorMode === 'rainbow' ? Math.random() * 360 : pc.hue;
  p.age       = 0;
  p.maxAge    = (8 + Math.random() * 12) * 1000;
}

function _respawnPassive(p, w, h, pc, dc) {
  const ms = pc.maxSpeed * (0.3 + Math.random() * 0.45);
  p.x         = Math.random() * w;
  p.y         = Math.random() * h;
  p.z         = Math.random() * 0.45;
  p.xvel      = (Math.random() * 2 - 1) * ms;
  p.yvel      = (Math.random() * 2 - 1) * ms;
  p.size      = Math.pow(Math.random(), 2) * pc.maxSize + 0.1;
  p.maxBright = 0.5 + Math.random() * 0.25;
  p.variance  = Math.random() * 0.15 - 0.075;
  p.age       = 0;
  p.maxAge    = (10 + Math.random() * 15) * 1000;
}

// ── Resize (add / delete) ─────────────────────────────────────────────────────

// Returns stratified positions covering the full screen.
function stratifiedPositions(n, w, h) {
  if (n === 0) return [];
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * (w / h))));
  const rows = Math.ceil(n / cols);
  const out  = [];
  for (let r = 0; r < rows && out.length < n; r++) {
    for (let c = 0; c < cols && out.length < n; c++) {
      out.push({
        x: (c + Math.random()) / cols * w,
        y: (r + Math.random()) / rows * h,
      });
    }
  }
  // Shuffle so addition order isn't visually grid-shaped
  for (let i = out.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out;
}

function resizeParticles(n, w, h, cfg) {
  const diff = n - particles.length;
  if (diff > 0) {
    const pos = stratifiedPositions(diff, w, h);
    for (const {x, y} of pos)
      particles.push(_spawnParticle(x, y, w, h, cfg.particles, cfg.depth, false));
  } else if (diff < 0) {
    _pruneOldest(particles, -diff);
  }
}

function resizePassive(n, w, h, cfg) {
  const diff = n - passiveParticles.length;
  if (diff > 0) {
    const pos = stratifiedPositions(diff, w, h);
    for (const {x, y} of pos)
      passiveParticles.push(_spawnPassive(x, y, w, h, cfg.passive, cfg.depth, false));
  } else if (diff < 0) {
    _pruneOldest(passiveParticles, -diff);
  }
}

// When reducing node count: prune the oldest particles first (they'd die soon anyway),
// then shrink the node array from the tail.
function resizeNodes(n, w, h, cfg) {
  const diff = n - nodes.length;
  if (diff > 0) {
    const pos = stratifiedPositions(diff, w, h);
    for (const {x, y} of pos)
      nodes.push(_spawnNode(x, y, cfg.nodes));
  } else if (diff < 0) {
    // Prune oldest particles proportionally before removing nodes
    const toPrune = Math.min(Math.abs(diff) * 3, Math.floor(particles.length * 0.15));
    if (toPrune > 0) _pruneOldest(particles, toPrune);
    nodes.splice(nodes.length + diff);
  }
}

// Remove the n oldest particles from arr (sort by age desc, splice front).
function _pruneOldest(arr, n) {
  arr.sort((a, b) => b.age - a.age);
  arr.splice(0, Math.min(n, arr.length));
}

// Instantly update hues when color mode changes (avoids waiting for respawn).
function syncParticleHues(colorMode, hue) {
  if (colorMode === 'rainbow') {
    for (const p of particles) p.hue = Math.random() * 360;
  } else {
    for (const p of particles) p.hue = hue;
  }
}

// ── Per-frame update ─────────────────────────────────────────────────────────

function updateSim(w, h, cfg, dt) {
  // Nodes
  for (const n of nodes) {
    n.x = ((n.x + n.xvel) % w + w) % w;
    n.y = ((n.y + n.yvel) % h + h) % h;
  }

  // Active particles: age, respawn if expired, then move + index
  grid.cellSize = cfg.connections.maxRadius;
  grid.clear();
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.age += dt;
    if (p.age >= p.maxAge) _respawnParticle(p, w, h, cfg.particles, cfg.depth);
    p.x = ((p.x + p.xvel) % w + w) % w;
    p.y = ((p.y + p.yvel) % h + h) % h;
    grid.insert(p);
  }

  // Passive particles
  for (let i = 0; i < passiveParticles.length; i++) {
    const p = passiveParticles[i];
    p.age += dt;
    if (p.age >= p.maxAge) _respawnPassive(p, w, h, cfg.passive, cfg.depth);
    p.x = ((p.x + p.xvel) % w + w) % w;
    p.y = ((p.y + p.yvel) % h + h) % h;
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
  const r   = cfg.click.rippleRadius;
  const r2  = r * r;
  const str = cfg.click.impulse;

  const _push = p => {
    const d2 = dist2(p.x, p.y, x, y);
    if (d2 > 0 && d2 < r2) {
      const d = Math.sqrt(d2);
      const force = (1 - d / r) * str;
      p.xvel += (p.x - x) / d * force;
      p.yvel += (p.y - y) / d * force;
    }
  };

  for (const p of particles)        _push(p);
  for (const p of passiveParticles) _push(p);
  for (const n of nodes)            _push(n);
}
