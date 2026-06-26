const DEFAULT_CONFIG = {
  sim:         { speed: 1.0 }, // global time scale; framerate is unaffected
  particles:   { count: 250, maxSize: 2.25, maxSpeed: 0.5,  colorMode: 'white', hue: 200, saturation: 40, twinkle: 1.0, palette: 'fire' },
  passive:     { enabled: true, count: 75,  maxSize: 2.0,  maxSpeed: 0.4 },
  connections: { enabled: true, maxRadius: 150, nClosest: 3, alphaBias: 0.4, gradient: true },
  nodes:       { enabled: true, count: 9,   maxRadius: 300, maxSpeed: 1.0 },
  depth:       { enabled: true, factor: 0.6 },
  physics:     { enabled: true, drag: 0.8 }, // rate (per sec) velocities relax toward baseline energy
  click:       { impulse: 3.0, rippleRadius: 180, rippleDuration: 800 },
  annihilation:{ enabled: true, radius: 8 },
  lightning: {
    enabled:    true,
    frequency:  0.2,   // expected events per second
    duration:   400,   // ms a bolt stays lit
    radius:     450,   // heavy-node reach; nodes within light up
    branches:   6,     // max nodes a single strike connects to
    intensity:  1.0,   // brightness multiplier
    pull:       2.0,   // gravitational impulse the heavy node imparts to particles
    // ── graphical / shape controls ──
    jaggedness: 0.07,  // perpendicular jitter as a fraction of bolt length
    segments:   7,     // kinks per bolt; more = finer, more erratic
    glow:       14,    // shadow-blur radius of the arc
    width:      1.4,   // base stroke width
    forks:      2,     // little offshoot branches per bolt
  },
  limits:      {},
  // Invisible Perlin flow field — does NOT render; it steers particle motion.
  clouds: {
    enabled:     true,
    scale:       250,   // noise frequency; larger = broader, slower-turning currents
    speed:       1.5,   // how fast the flow pattern drifts (× 0.0001 internally)
    force:       0.04,  // steering strength applied per frame at 60fps
    octaves:     4,
    persistence: 0.5,
    direction:   0,     // degrees the field drifts; 0 = rightward
  },
  debug:       false,
};

function loadConfig() {
  try {
    const raw = localStorage.getItem('bgConfig');
    if (raw) return deepMerge(DEFAULT_CONFIG, JSON.parse(raw));
  } catch(e) {}
  return deepCopy(DEFAULT_CONFIG);
}

function saveConfig(cfg) {
  try { localStorage.setItem('bgConfig', JSON.stringify(cfg)); } catch(e) {}
}

function resetConfig() {
  try { localStorage.removeItem('bgConfig'); } catch(e) {}
  return deepCopy(DEFAULT_CONFIG);
}
