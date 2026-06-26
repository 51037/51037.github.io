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

// Steer each particle toward the local flow angle by ROTATING its velocity,
// not accelerating along it. Speed (and thus kinetic energy) is preserved
// exactly, so the field can run forever without pumping energy into the system.
// `force` becomes a turn rate: the fraction of the angle gap closed per frame.
function applyFlowField(parts, dt, cfg) {
  const cc = cfg.clouds;
  if (!cc.enabled || cc.force <= 0) return;
  const invScale = 1 / cc.scale;
  const octs     = Math.max(1, cc.octaves | 0);
  const pers     = cc.persistence;
  const rate     = Math.min(1, cc.force * (dt / 16.67)); // turn fraction per frame
  const TAU      = Math.PI * 2;

  for (const p of parts) {
    const s = Math.hypot(p.xvel, p.yvel);
    if (s < 1e-6) continue; // no direction to steer

    const n      = perlin.octave(p.x * invScale + _cOff.x, p.y * invScale + _cOff.y, octs, pers);
    const target = n * TAU;                 // desired heading
    const cur    = Math.atan2(p.yvel, p.xvel);
    let   d      = target - cur;
    d = Math.atan2(Math.sin(d), Math.cos(d)); // shortest signed angular gap
    const na = cur + d * rate;                // rotate partway toward the flow

    p.xvel = Math.cos(na) * s;                // magnitude unchanged → energy preserved
    p.yvel = Math.sin(na) * s;
  }
}
