let canvas, ctx, W, H;
let cfg;
let mouseX = 0, mouseY = 0;
let mouseEnergy = 0; // 0..1; charged by movement, decays while idle
let panel;
let fps = 0, lastTime = 0;
let SIM = 0; // simulation clock (ms of scaled time); drives all sim/fx timing

// Click-amplification combo: accumulated energy that linearly dissipates over
// COMBO_WINDOW (ms) of real time. Each click decays the leftover then adds 1,
// so rapid clicks stack and a 3s pause fully resets it.
let _comboEnergy = 0, _comboTime = 0;
const COMBO_WINDOW = 3000;

// Track previous counts and color mode to detect what changed.
let _prev = { particles: 0, passive: 0, nodes: 0, colorMode: '' };

function init() {
  W = window.innerWidth;
  H = window.innerHeight;

  cfg = loadConfig();

  canvas = document.createElement('canvas');
  canvas.id = 'board';
  canvas.width  = W;
  canvas.height = H;
  const wrapper = document.getElementById('canvas-wrapper');
  wrapper.innerHTML = '';
  wrapper.appendChild(canvas);
  ctx = canvas.getContext('2d');

  setActivePalette(cfg.particles.palette || 'fire');
  initSim(W, H, cfg);
  _syncPrev();
  initClouds();

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    const nx = e.clientX - r.left, ny = e.clientY - r.top;
    // Accumulate energy from collected movement (skip the first event's jump).
    if (mouseX || mouseY) {
      const dm = Math.hypot(nx - mouseX, ny - mouseY);
      mouseEnergy = Math.min(1, mouseEnergy + dm * cfg.mouse.energyGain);
    }
    mouseX = nx; mouseY = ny;
  });

  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    // Decay the leftover combo by how long since the last click, then stack +1.
    const now = performance.now();
    _comboEnergy *= Math.max(0, 1 - (now - _comboTime) / COMBO_WINDOW);
    _comboEnergy += 1;
    _comboTime = now;

    const amplify   = _comboEnergy;                 // impulse strength multiplier
    const radiusMul = 1 + (_comboEnergy - 1) * 0.4; // reach multiplier
    applyClickImpulse(x, y, cfg, amplify, radiusMul);
    addRipple(x, y, cfg, radiusMul);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'd' || e.key === 'D') _toggleDebug();
  });

  panel = buildPanel(cfg, _onConfigChange, _onSave, _onReset);
  panel.style.display = cfg.debug ? 'block' : 'none';

  requestAnimationFrame(_frame);
}

function _syncPrev() {
  _prev.particles  = cfg.particles.count;
  _prev.passive    = cfg.passive.count;
  _prev.nodes      = cfg.nodes.count;
  _prev.colorMode  = cfg.particles.colorMode;
}

function _toggleDebug() {
  cfg.debug = !cfg.debug;
  panel.style.display = cfg.debug ? 'block' : 'none';
}

// Called by the panel on every slider/select change.
// No more full reinit — we add/delete particles as needed.
function _onConfigChange(newCfg) {
  cfg = newCfg;

  if (cfg.particles.count !== _prev.particles) {
    resizeParticles(cfg.particles.count, W, H, cfg);
    _prev.particles = cfg.particles.count;
  }

  if (cfg.passive.count !== _prev.passive) {
    resizePassive(cfg.passive.count, W, H, cfg);
    _prev.passive = cfg.passive.count;
  }

  if (cfg.nodes.count !== _prev.nodes) {
    resizeNodes(cfg.nodes.count, W, H, cfg);
    _prev.nodes = cfg.nodes.count;
  }

  // Instantly sync hues/t-values when color mode changes rather than waiting for respawn.
  if (cfg.particles.colorMode !== _prev.colorMode) {
    syncParticleHues(cfg.particles.colorMode, cfg.particles.hue);
    _prev.colorMode = cfg.particles.colorMode;
  }

  // Keep palette LUT in sync (no-op when palette hasn't changed).
  if (cfg.particles.colorMode === 'palette') {
    setActivePalette(cfg.particles.palette);
  }
}

function _onSave(c) {
  saveConfig(c);
  _toast('Config saved!');
}

function _onReset() {
  cfg = resetConfig();
  setActivePalette(cfg.particles.palette || 'fire');
  initSim(W, H, cfg);
  _syncPrev();
  panel = buildPanel(cfg, _onConfigChange, _onSave, _onReset);
  panel.style.display = cfg.debug ? 'block' : 'none';
  _toast('Config reset');
}

function _frame(ts) {
  const dt = ts - lastTime;            // real elapsed time — framerate is preserved
  if (dt > 0) fps = fps * 0.95 + (1000 / dt) * 0.05;
  lastTime = ts;

  // Global time scale: the sim sees a stretched/compressed dt, the loop does not.
  const sdt = Math.max(0, dt) * cfg.sim.speed;
  SIM += sdt;

  // Idle mouse bleeds off its reveal energy (real time, independent of sim speed).
  mouseEnergy = Math.max(0, mouseEnergy - cfg.mouse.energyDecay * dt / 1000);

  // Flow field steers velocity before the sim relaxes energy + moves particles.
  updateClouds(sdt, cfg);
  applyFlowField(particles, sdt, cfg);
  applyFlowField(passiveParticles, sdt, cfg);

  updateSim(W, H, cfg, sdt);
  updateRipples();
  updateLightning(sdt, cfg);

  renderBackground(ctx, W, H);
  if (cfg.passive.enabled) renderPassiveField(ctx, passiveParticles, cfg.particles.twinkle);
  renderActiveField(ctx, particles, nodes, cfg, mouseX, mouseY, mouseEnergy);
  renderRipples(ctx);
  renderLightning(ctx, cfg);
  renderDebug(ctx, cfg, fps);

  requestAnimationFrame(_frame);
}

function _toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 500);
  }, 1500);
}

window.addEventListener('resize', () => {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width  = W;
  canvas.height = H;
  // On resize just reinit — particle positions are meaningless at the old resolution.
  initSim(W, H, cfg);
  _syncPrev();
});

init();
