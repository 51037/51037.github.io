const DEFAULT_CONFIG = {
  particles:   { count: 250, maxSize: 2.25, maxSpeed: 0.5,  colorMode: 'white', hue: 200, saturation: 40, twinkle: 1.0 },
  passive:     { count: 75,  maxSize: 2.0,  maxSpeed: 0.4 },
  connections: { maxRadius: 150, nClosest: 3, alphaBias: 0.4, gradient: true },
  nodes:       { count: 9,   maxRadius: 300, maxSpeed: 1.0 },
  depth:       { enabled: true, factor: 0.6 },
  click:       { impulse: 3.0, rippleRadius: 180, rippleDuration: 800 },
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
