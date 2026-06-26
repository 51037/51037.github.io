// ── Log-slider helpers ───────────────────────────────────────────────────────
// A log row drives the range input over a 0..1000 integer position. Position 0
// is reserved as an exact "off / pause" (value 0); 1..1000 map exponentially
// across [lmin, lmax], giving fine control at the low end.
const _LOG_STEPS = 1000;

function _logToPos(v, lmin, lmax) {
  if (!(v > 0)) return 0;
  const cl = Math.min(lmax, Math.max(lmin, v));
  return Math.round(1 + (_LOG_STEPS - 1) * Math.log(cl / lmin) / Math.log(lmax / lmin));
}

function _posToLog(pos, lmin, lmax) {
  if (pos <= 0) return 0;
  return lmin * Math.pow(lmax / lmin, (pos - 1) / (_LOG_STEPS - 1));
}

function _fmtVal(v) {
  if (v === 0)  return '0';
  if (v < 1)    return v.toFixed(3);
  if (v < 10)   return v.toFixed(2);
  return v.toFixed(1);
}

const SLIDER_DEFS = [
  { section: 'Simulation', group: 'sim', rows: [
    { label: 'Speed',        key: 'speed',          min: 0.05, max: 8,    log: true  },
  ]},
  { section: 'Particles', group: 'particles', rows: [
    { label: 'Count',        key: 'count',          min: 10,   max: 800,  step: 1    },
    { label: 'Max Size',     key: 'maxSize',         min: 0.5,  max: 10,   step: 0.1  },
    { label: 'Max Speed',    key: 'maxSpeed',        min: 0.05, max: 4,    step: 0.05 },
    { label: 'Twinkle',      key: 'twinkle',         min: 0,    max: 3,    step: 0.05 },
    { label: 'Hue',          key: 'hue',             min: 0,    max: 360,  step: 1    },
    { label: 'Saturation',   key: 'saturation',      min: 0,    max: 100,  step: 1    },
  ]},
  { section: 'Passive Stars', group: 'passive', enable: true, rows: [
    { label: 'Count',        key: 'count',          min: 0,    max: 400,  step: 1    },
    { label: 'Max Size',     key: 'maxSize',         min: 0.5,  max: 8,    step: 0.1  },
    { label: 'Max Speed',    key: 'maxSpeed',        min: 0.01, max: 3,    step: 0.05 },
  ]},
  { section: 'Connections', group: 'connections', enable: true, rows: [
    { label: 'Max Radius',   key: 'maxRadius',      min: 30,   max: 500,  step: 5    },
    { label: 'N Closest',    key: 'nClosest',        min: 1,    max: 12,   step: 1    },
    { label: 'Alpha Bias',   key: 'alphaBias',       min: 0.05, max: 1,    step: 0.05 },
  ]},
  { section: 'Mouse Reveal', group: 'mouse', rows: [
    { label: 'Charge/px',   key: 'energyGain',   min: 0,    max: 0.03, step: 0.001 },
    { label: 'Idle Decay',  key: 'energyDecay',  min: 0,    max: 3,    step: 0.05  },
  ]},
  { section: 'Nodes', group: 'nodes', enable: true, rows: [
    { label: 'Count',        key: 'count',          min: 0,    max: 25,   step: 1    },
    { label: 'Zone Radius',  key: 'maxRadius',      min: 50,   max: 600,  step: 10   },
    { label: 'Max Speed',    key: 'maxSpeed',        min: 0.1,  max: 5,    step: 0.1  },
  ]},
  { section: 'Z-Depth', group: 'depth', enable: true, rows: [
    { label: 'Factor',       key: 'factor',         min: 0,    max: 1,    step: 0.05 },
  ]},
  { section: 'Physics (Drag)', group: 'physics', enable: true, rows: [
    { label: 'Drag Rate',    key: 'drag',           min: 0,    max: 5,    step: 0.05 },
  ]},
  { section: 'Flow Field', group: 'clouds', enable: true, rows: [
    { label: 'Scale',       key: 'scale',       min: 30,  max: 800,  step: 10    },
    { label: 'Speed',       key: 'speed',       min: 0,   max: 10,   step: 0.1   },
    { label: 'Force',       key: 'force',       min: 0,   max: 0.3,  step: 0.005 },
    { label: 'Octaves',     key: 'octaves',     min: 1,   max: 8,    step: 1     },
    { label: 'Persistence', key: 'persistence', min: 0.1, max: 0.95, step: 0.05  },
    { label: 'Direction °', key: 'direction',   min: 0,   max: 360,  step: 1     },
  ]},
  { section: 'Lightning', group: 'lightning', enable: true, rows: [
    { label: 'Frequency/s', key: 'frequency',   min: 0,   max: 3,    step: 0.05 },
    { label: 'Duration ms', key: 'duration',    min: 100, max: 1500, step: 50   },
    { label: 'Reach',       key: 'radius',      min: 100, max: 1200, step: 50   },
    { label: 'Branches',    key: 'branches',    min: 1,   max: 12,   step: 1    },
    { label: 'Intensity',   key: 'intensity',   min: 0.1, max: 2,    step: 0.1  },
    { label: 'Pull',        key: 'pull',        min: 0,   max: 10,   step: 0.5  },
    { label: 'Jaggedness',  key: 'jaggedness',  min: 0,   max: 0.3,  step: 0.005 },
    { label: 'Segments',    key: 'segments',    min: 2,   max: 24,   step: 1    },
    { label: 'Glow',        key: 'glow',        min: 0,   max: 40,   step: 1    },
    { label: 'Width',       key: 'width',       min: 0.2, max: 6,    step: 0.1  },
    { label: 'Forks',       key: 'forks',       min: 0,   max: 8,    step: 1    },
  ]},
  { section: 'Annihilation', group: 'annihilation', enable: true, rows: [
    { label: 'Radius',       key: 'radius',         min: 0,    max: 60,   step: 1    },
  ]},
  { section: 'Click FX', group: 'click', rows: [
    { label: 'Impulse',      key: 'impulse',        min: 0,    max: 15,   step: 0.5  },
    { label: 'Ripple Radius',key: 'rippleRadius',   min: 30,   max: 500,  step: 10   },
    { label: 'Duration (ms)',key: 'rippleDuration', min: 100,  max: 3000, step: 100  },
  ]},
];

function buildPanel(cfg, onChange, onSave, onReset) {
  const existing = document.getElementById('ctrl-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'ctrl-panel';

  const lim = cfg.limits || {};

  let html = `<div class="panel-title">Controls <span class="panel-hint">[D] toggle</span></div>`;

  for (const { section, group, rows, enable } of SLIDER_DEFS) {
    const toggle = enable
      ? `<input type="checkbox" class="sec-enable" data-group="${group}" ${cfg[group].enabled ? 'checked' : ''} title="Enable ${section}">`
      : '';
    html += `<div class="panel-section"><div class="section-label"><span>${section}</span>${toggle}</div>`;
    for (const sl of rows) {
      if (sl.log) {
        const v   = cfg[group][sl.key];
        const pos = _logToPos(v, sl.min, sl.max);
        html += `<div class="row">
          <span class="row-label">${sl.label}</span>
          <input type="range" min="0" max="${_LOG_STEPS}" step="1" value="${pos}"
            data-group="${group}" data-key="${sl.key}" data-log="1"
            data-lmin="${sl.min}" data-lmax="${sl.max}">
          <span class="row-val">${_fmtVal(v)}</span>
        </div>`;
        continue;
      }
      const rawVal     = cfg[group][sl.key];
      const effectiveMax = lim[`${group}.${sl.key}`] || sl.max;
      const val        = Math.min(rawVal, effectiveMax);
      html += `<div class="row">
        <span class="row-label">${sl.label}</span>
        <input type="range" min="${sl.min}" max="${effectiveMax}" step="${sl.step}" value="${val}"
          data-group="${group}" data-key="${sl.key}">
        <span class="row-val">${val}</span>
        <button class="btn-max" data-group="${group}" data-key="${sl.key}" title="Set max (${effectiveMax})">↑</button>
      </div>`;
    }
    html += `</div>`;
  }

  // ── Color mode + palette ─────────────────────────────────────────────────────
  const cmode = cfg.particles.colorMode;
  const palOpts = Object.keys(PALETTES).map(k =>
    `<option value="${k}" ${cfg.particles.palette === k ? 'selected' : ''}>${PALETTE_NAMES[k]}</option>`
  ).join('');

  html += `<div class="panel-section">
    <div class="section-label">Color Mode</div>
    <select id="sel-colormode">
      <option value="white"       ${cmode === 'white'       ? 'selected' : ''}>White</option>
      <option value="monochrome"  ${cmode === 'monochrome'  ? 'selected' : ''}>Monochrome</option>
      <option value="rainbow"     ${cmode === 'rainbow'     ? 'selected' : ''}>Rainbow</option>
      <option value="palette"     ${cmode === 'palette'     ? 'selected' : ''}>Palette</option>
    </select>
    <div id="pal-row" style="display:${cmode === 'palette' ? 'block' : 'none'}; margin-top:6px">
      <select id="sel-palette">${palOpts}</select>
    </div>
  </div>`;

  const ltc = cfg.lightning.color;
  html += `<div class="panel-section">
    <div class="section-label"><span>Lightning Color</span></div>
    <select id="sel-ltcolor">
      <option value="match"   ${ltc === 'match'   ? 'selected' : ''}>Match coloring</option>
      <option value="white"   ${ltc === 'white'   ? 'selected' : ''}>White</option>
      <option value="palette" ${ltc === 'palette' ? 'selected' : ''}>Palette</option>
      <option value="rainbow" ${ltc === 'rainbow' ? 'selected' : ''}>Rainbow</option>
      <option value="mono"    ${ltc === 'mono'    ? 'selected' : ''}>Monochrome (hue)</option>
    </select>
  </div>`;

  html += `<div class="panel-section">
    <div class="section-label"><span>Options</span></div>
    <label class="chk-row"><input type="checkbox" id="chk-gradient" ${cfg.connections.gradient  ? 'checked' : ''}> Gradient lines</label>
  </div>`;

  html += `<div class="panel-btns">
    <button id="btn-save">Save Config</button>
    <button id="btn-export">Export</button>
    <button id="btn-reset" class="danger">Reset</button>
  </div>`;

  panel.innerHTML = html;
  document.body.appendChild(panel);

  // ── Slider inputs ────────────────────────────────────────────────────────────
  panel.querySelectorAll('input[type=range]').forEach(el => {
    el.addEventListener('input', () => {
      let outVal;
      if (el.dataset.log) {
        outVal = _posToLog(parseFloat(el.value), parseFloat(el.dataset.lmin), parseFloat(el.dataset.lmax));
        el.nextElementSibling.textContent = _fmtVal(outVal);
      } else {
        outVal = parseFloat(el.value);
        el.nextElementSibling.textContent = el.value;
      }
      cfg[el.dataset.group][el.dataset.key] = outVal;
      onChange(cfg);
    });
  });

  // ── Max-adjust buttons (event delegation) ───────────────────────────────────
  panel.addEventListener('click', e => {
    const btn = e.target.closest('.btn-max');
    if (!btn) return;
    const g = btn.dataset.group, k = btn.dataset.key;
    const sliderEl = panel.querySelector(`input[type=range][data-group="${g}"][data-key="${k}"]`);
    const valEl    = sliderEl.nextElementSibling; // .row-val span

    const inp = document.createElement('input');
    inp.type      = 'number';
    inp.value     = sliderEl.max;
    inp.className = 'max-input';
    btn.style.display = 'none';
    btn.after(inp);
    inp.focus(); inp.select();

    const commit = () => {
      const v = parseFloat(inp.value);
      if (!isNaN(v) && v > parseFloat(sliderEl.min)) {
        sliderEl.max = v;
        if (!cfg.limits) cfg.limits = {};
        cfg.limits[`${g}.${k}`] = v;
        btn.title = `Set max (${v})`;
        if (parseFloat(sliderEl.value) > v) {
          sliderEl.value = v;
          cfg[g][k] = v;
          valEl.textContent = v;
        }
        onChange(cfg);
      }
      inp.remove();
      btn.style.display = '';
    };

    inp.addEventListener('blur', commit);
    inp.addEventListener('keydown', e2 => {
      if (e2.key === 'Enter') commit();
      if (e2.key === 'Escape') { inp.remove(); btn.style.display = ''; }
    });
  });

  // ── Color mode / palette selects ─────────────────────────────────────────────
  panel.querySelector('#sel-colormode').addEventListener('change', e => {
    cfg.particles.colorMode = e.target.value;
    panel.querySelector('#pal-row').style.display = e.target.value === 'palette' ? 'block' : 'none';
    onChange(cfg);
  });

  panel.querySelector('#sel-palette').addEventListener('change', e => {
    cfg.particles.palette = e.target.value;
    onChange(cfg);
  });

  panel.querySelector('#sel-ltcolor').addEventListener('change', e => {
    cfg.lightning.color = e.target.value;
    onChange(cfg);
  });

  // ── Per-section enable toggles ───────────────────────────────────────────────
  panel.querySelectorAll('.sec-enable').forEach(el => {
    el.addEventListener('change', () => {
      cfg[el.dataset.group].enabled = el.checked;
      onChange(cfg);
    });
  });

  // ── Checkboxes ───────────────────────────────────────────────────────────────
  panel.querySelector('#chk-gradient').addEventListener('change', e => {
    cfg.connections.gradient = e.target.checked;
    onChange(cfg);
  });

  panel.querySelector('#btn-save').addEventListener('click', () => onSave(cfg));
  panel.querySelector('#btn-reset').addEventListener('click', onReset);

  // Export current config as JSON to the clipboard (and console) so it can be
  // pasted back in and baked into DEFAULT_CONFIG as the shipped default.
  panel.querySelector('#btn-export').addEventListener('click', () => {
    const json = JSON.stringify(cfg, null, 2);
    console.log('=== BG CONFIG ===\n' + json);
    const done = () => { if (typeof _toast === 'function') _toast('Config copied to clipboard'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(done).catch(() => {
        if (typeof _toast === 'function') _toast('Copy failed — see console');
      });
    } else {
      if (typeof _toast === 'function') _toast('Clipboard unavailable — see console');
    }
  });

  return panel;
}
