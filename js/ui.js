// Slider definitions. reinit:true means particle arrays must be recreated.
const SLIDER_DEFS = [
  { section: 'Particles', group: 'particles', rows: [
    { label: 'Count',        key: 'count',       min: 10,   max: 800,  step: 1,    reinit: true  },
    { label: 'Max Size',     key: 'maxSize',      min: 0.5,  max: 10,   step: 0.1,  reinit: true  },
    { label: 'Max Speed',    key: 'maxSpeed',     min: 0.05, max: 4,    step: 0.05, reinit: true  },
    { label: 'Twinkle',      key: 'twinkle',      min: 0,    max: 3,    step: 0.05                 },
    { label: 'Hue',          key: 'hue',          min: 0,    max: 360,  step: 1                    },
    { label: 'Saturation',   key: 'saturation',   min: 0,    max: 100,  step: 1                    },
  ]},
  { section: 'Passive Stars', group: 'passive', rows: [
    { label: 'Count',        key: 'count',       min: 0,    max: 400,  step: 1,    reinit: true  },
    { label: 'Max Size',     key: 'maxSize',      min: 0.5,  max: 8,    step: 0.1,  reinit: true  },
    { label: 'Max Speed',    key: 'maxSpeed',     min: 0.01, max: 3,    step: 0.05, reinit: true  },
  ]},
  { section: 'Connections', group: 'connections', rows: [
    { label: 'Max Radius',   key: 'maxRadius',   min: 30,   max: 500,  step: 5                    },
    { label: 'N Closest',    key: 'nClosest',     min: 1,    max: 12,   step: 1                    },
    { label: 'Alpha Bias',   key: 'alphaBias',    min: 0.05, max: 1,    step: 0.05                 },
  ]},
  { section: 'Nodes', group: 'nodes', rows: [
    { label: 'Count',        key: 'count',       min: 0,    max: 25,   step: 1,    reinit: true  },
    { label: 'Zone Radius',  key: 'maxRadius',   min: 50,   max: 600,  step: 10                   },
    { label: 'Max Speed',    key: 'maxSpeed',     min: 0.1,  max: 5,    step: 0.1,  reinit: true  },
  ]},
  { section: 'Z-Depth', group: 'depth', rows: [
    { label: 'Factor',       key: 'factor',      min: 0,    max: 1,    step: 0.05, reinit: true  },
  ]},
  { section: 'Click FX', group: 'click', rows: [
    { label: 'Impulse',      key: 'impulse',     min: 0,    max: 15,   step: 0.5                  },
    { label: 'Ripple Radius',key: 'rippleRadius',min: 30,   max: 500,  step: 10                   },
    { label: 'Duration (ms)',key: 'rippleDuration',min: 100,max: 3000, step: 100                  },
  ]},
];

function buildPanel(cfg, onChange, onSave, onReset) {
  const existing = document.getElementById('ctrl-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'ctrl-panel';

  let html = `<div class="panel-title">Controls <span class="panel-hint">[D] toggle</span></div>`;

  for (const { section, group, rows } of SLIDER_DEFS) {
    html += `<div class="panel-section"><div class="section-label">${section}</div>`;
    for (const sl of rows) {
      const val = cfg[group][sl.key];
      html += `<div class="row">
        <span class="row-label">${sl.label}</span>
        <input type="range" min="${sl.min}" max="${sl.max}" step="${sl.step}" value="${val}"
          data-group="${group}" data-key="${sl.key}" data-reinit="${sl.reinit ? '1' : '0'}">
        <span class="row-val">${val}</span>
      </div>`;
    }
    html += `</div>`;
  }

  const cmode = cfg.particles.colorMode;
  html += `<div class="panel-section">
    <div class="section-label">Color Mode</div>
    <select id="sel-colormode">
      <option value="white"       ${cmode === 'white'       ? 'selected' : ''}>White</option>
      <option value="monochrome"  ${cmode === 'monochrome'  ? 'selected' : ''}>Monochrome</option>
      <option value="rainbow"     ${cmode === 'rainbow'     ? 'selected' : ''}>Rainbow</option>
    </select>
  </div>`;

  html += `<div class="panel-section">
    <div class="section-label">Options</div>
    <label class="chk-row"><input type="checkbox" id="chk-depth"    ${cfg.depth.enabled          ? 'checked' : ''}> Z-Depth</label>
    <label class="chk-row"><input type="checkbox" id="chk-gradient" ${cfg.connections.gradient   ? 'checked' : ''}> Gradient lines</label>
  </div>`;

  html += `<div class="panel-btns">
    <button id="btn-save">Save Config</button>
    <button id="btn-reset" class="danger">Reset</button>
  </div>`;

  panel.innerHTML = html;
  document.body.appendChild(panel);

  panel.querySelectorAll('input[type=range]').forEach(el => {
    el.addEventListener('input', () => {
      const v = parseFloat(el.value);
      cfg[el.dataset.group][el.dataset.key] = v;
      el.nextElementSibling.textContent = v;
      onChange(cfg, el.dataset.reinit === '1');
    });
  });

  panel.querySelector('#sel-colormode').addEventListener('change', e => {
    cfg.particles.colorMode = e.target.value;
    onChange(cfg, true);
  });

  panel.querySelector('#chk-depth').addEventListener('change', e => {
    cfg.depth.enabled = e.target.checked;
    onChange(cfg, true);
  });

  panel.querySelector('#chk-gradient').addEventListener('change', e => {
    cfg.connections.gradient = e.target.checked;
    onChange(cfg, false);
  });

  panel.querySelector('#btn-save').addEventListener('click', () => onSave(cfg));
  panel.querySelector('#btn-reset').addEventListener('click', onReset);

  return panel;
}
