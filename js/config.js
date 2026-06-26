const DEFAULT_CONFIG = {
  sim:         { speed: 0.14605110782519648 }, // global time scale; framerate is unaffected
  particles:   { count: 800, maxSize: 2.25, maxSpeed: 0.15, colorMode: 'palette', hue: 200, saturation: 100, twinkle: 1.0, palette: 'candy' },
  passive:     { enabled: true, count: 75,  maxSize: 2.0,  maxSpeed: 0.4 },
  connections: { enabled: true, maxRadius: 125, nClosest: 12, alphaBias: 0.1, gradient: true },
  // Mouse reveal "energy": charges with movement, decays while idle.
  mouse:       { energyGain: 0.005, energyDecay: 0.5 },
  nodes:       { enabled: true, count: 25,  maxRadius: 250, maxSpeed: 0.1 },
  depth:       { enabled: true, factor: 0.6 },
  physics:     { enabled: true, drag: 3.45 }, // rate (per sec) velocities relax toward baseline energy
  click:       { impulse: 6.5, rippleRadius: 180, rippleDuration: 800 },
  annihilation:{ enabled: true, radius: 8 },
  lightning: {
    enabled:    true,
    frequency:  3,     // expected events per second
    duration:   400,   // ms a bolt stays lit
    radius:     450,   // heavy-node reach; nodes within light up
    branches:   6,     // max nodes a single strike connects to
    intensity:  0.3,   // brightness multiplier
    pull:       0.5,   // gravitational impulse the heavy node imparts to particles
    color:      'match', // match | white | palette | rainbow | mono
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
    speed:       0.6,   // how fast the flow pattern drifts (× 0.0001 internally)
    force:       0.04,  // steering strength applied per frame at 60fps
    octaves:     4,
    persistence: 0.5,
    direction:   0,     // degrees the field drifts; 0 = rightward
  },
  debug:       true,
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
