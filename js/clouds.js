// Invisible Perlin flow field. Nothing is drawn — the noise pattern acts as a
// drifting current that steers particle velocities, like wind shaping smoke.
// Combined with the physics drag (which relaxes speed back to each particle's
// baseline energy) this rotates direction without permanently injecting energy.

let _cOff = { x: 0, y: 0 };

function initClouds() {
  _cOff = { x: 0, y: 0 };
}

// Drift the flow pattern across the canvas over time.
function updateClouds(dt, cfg) {
  if (!cfg.clouds.enabled) return;
  const rad = cfg.clouds.direction * (Math.PI / 180);
  const spd = cfg.clouds.speed * 0.0001; // slider 0-10 → 0-0.001 units/ms
  _cOff.x += Math.cos(rad) * spd * dt;
  _cOff.y += Math.sin(rad) * spd * dt;
}

// Nudge each particle's velocity along the local flow angle.
function applyFlowField(parts, dt, cfg) {
  const cc = cfg.clouds;
  if (!cc.enabled || cc.force <= 0) return;
  const invScale = 1 / cc.scale;
  const octs     = Math.max(1, cc.octaves | 0);
  const pers     = cc.persistence;
  const f        = cc.force * (dt / 16.67); // normalise to "per frame at 60fps"
  const TAU      = Math.PI * 2;

  for (const p of parts) {
    const n   = perlin.octave(p.x * invScale + _cOff.x, p.y * invScale + _cOff.y, octs, pers);
    const ang = n * TAU; // [-1,1] → full rotation
    p.xvel += Math.cos(ang) * f;
    p.yvel += Math.sin(ang) * f;
  }
}
