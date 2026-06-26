let canvas, ctx, W, H;
let cfg;
let mouseX = 0, mouseY = 0;
let panel;
let fps = 0, lastTime = 0;

// Track previous counts and color mode to detect what changed.
let _prev = { particles: 0, passive: 0, nodes: 0, colorMode: '' };

function init() {
  W = window.innerWidth;
  H = window.innerHeight;

  const hasSaved = !!localStorage.getItem('bgConfig');
  cfg = loadConfig();
  if (!hasSaved) {
    cfg.connections.maxRadius = (Math.min(W, H) / 7) | 0;
    cfg.nodes.maxRadius       = (Math.min(W, H) / 4) | 0;
  }

  canvas = document.createElement('canvas');
  canvas.id = 'board';
  canvas.width  = W;
  canvas.height = H;
  const wrapper = document.getElementById('canvas-wrapper');
  wrapper.innerHTML = '';
  wrapper.appendChild(canvas);
  ctx = canvas.getContext('2d');

  initSim(W, H, cfg);
  _syncPrev();

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });

  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    applyClickImpulse(e.clientX - r.left, e.clientY - r.top, cfg);
    addRipple(e.clientX - r.left, e.clientY - r.top, cfg);
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

  // Instantly sync hues when color mode changes rather than waiting for respawn.
  if (cfg.particles.colorMode !== _prev.colorMode) {
    syncParticleHues(cfg.particles.colorMode, cfg.particles.hue);
    _prev.colorMode = cfg.particles.colorMode;
  }
}

function _onSave(c) {
  saveConfig(c);
  _toast('Config saved!');
}

function _onReset() {
  cfg = resetConfig();
  cfg.connections.maxRadius = (Math.min(W, H) / 7) | 0;
  cfg.nodes.maxRadius       = (Math.min(W, H) / 4) | 0;
  initSim(W, H, cfg);
  _syncPrev();
  panel = buildPanel(cfg, _onConfigChange, _onSave, _onReset);
  panel.style.display = cfg.debug ? 'block' : 'none';
  _toast('Config reset');
}

function _frame(ts) {
  const dt = ts - lastTime;
  if (dt > 0) fps = fps * 0.95 + (1000 / dt) * 0.05;
  lastTime = ts;

  updateSim(W, H, cfg, dt);
  updateRipples();

  renderBackground(ctx, W, H);
  renderPassiveField(ctx, passiveParticles, cfg.particles.twinkle);
  renderActiveField(ctx, particles, nodes, cfg, mouseX, mouseY);
  renderRipples(ctx);
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
