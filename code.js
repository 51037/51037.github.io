function setup()
{
  w = window.innerWidth;
  h = window.innerHeight;
  size = 40;
  var canvas_wrapper = document.getElementById('canvas-wrapper');
  canvas_wrapper.innerHTML = '';
  canvas_wrapper.innerHTML += '<canvas id="board" width="' + w + '" height="'+h+'"></canvas>';
  //canvas_wrapper.innerHTML += '<div class="dimensions">' + mouseX + 'px x ' + mouseY + 'px</div>';
  var canvas = document.getElementById('board');
	c = canvas.getContext('2d');

  c.lineWidth = 2;

  initializeField();
  initializePassiveField();
  initializeNodes();

  mouseX = 0;
  mouseY = 0;

  canvas.addEventListener("mousemove", function(e) {
    var cRect = canvas.getBoundingClientRect();        // Gets CSS pos, and width/height
    mouseX = Math.round(e.clientX - cRect.left);  // Subtract the 'left' of the canvas
    mouseY = Math.round(e.clientY - cRect.top);   // from the X/Y positions to make
  });

  renderer = setInterval(function()
  {
    render();
  }, 40);
}

var point_dist = function(a, b, c, d)
{
  return Math.sqrt(Math.pow(a-c, 2) + Math.pow(b-d, 2));
}

var getRandomTwinkle = function(p)
{
  var variance = p.variance * (0.5 + (Math.random() / 2.0));
  var alpha = Math.min(p.brightness - variance, p.max_brightness);
  return alpha.toString();
}

var getNearParticles = function(x, y)
{
  const closest = new Set();
  for (var i = 0; i < n_particles; i++) {
    const p = particles[i];
    var dist = point_dist(p.x,p.y,x,y);
    if (dist <= max_radius && closest.size <= n_closest && dist != 0) {
      closest.add({point:p,distance:dist});
    }
  }
  return closest;
}

var initializeNodes = function()
{
  n_nodes = 9;
  max_radius_node = Math.min(w, h) / 4.0;
  const max_speed = 1.0;
  nodes = new Array(n_nodes);
  for (var i = 0; i < nodes.length; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const xvel = Math.random() * 2 * max_speed - max_speed;
    const yvel = Math.random() * 2 * max_speed - max_speed;
    const n = {x: x, y: y, xvel: xvel, yvel: yvel};
    nodes[i] = n;
  }
}

var initializeField = function()
{
  n_particles = 250;
  max_radius = Math.min(w, h) / 7.0;
  n_closest = 3;
  const max_size = 2.25;
  const max_speed = 0.5;
  particles = new Array(n_particles);

  for (var i = 0; i < n_particles; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const xvel = Math.random() * 2 * max_speed - max_speed;
    const yvel = Math.random() * 2 * max_speed - max_speed;
    const size = Math.pow(Math.random(), 2) * max_size + 0.1;
    const max_bright = 0.75 + (Math.random() / 4.0); // (0.75 - 1.0)
    const variance = (Math.random() / 10.0); // (0 - 0.1)
    const brightness = max_bright - (Math.random() * variance);
    const p = {x: x, y: y, xvel: xvel, yvel: yvel, size: size, brightness: brightness, max_brightness: max_bright, variance: variance};
    particles[i] = p;
  }
}

var initializePassiveField = function()
{
  const n_passive_particles = 75;
  const max_size = 2;
  const max_speed = 0.4;
  passive_particles = new Array(n_passive_particles);

  for (var i = 0; i < n_particles; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const xvel = Math.random() * 2 * max_speed - max_speed;
    const yvel = Math.random() * 2 * max_speed - max_speed;
    const size = Math.pow(Math.random(), 2) * max_size + 0.1;
    const max_bright = 0.7 + (Math.random() / 4.0); // (0.7 - 0.95)
    const variance = (Math.random() / 10.0); // (0 - 0.1)
    const brightness = max_bright - (Math.random() * variance);
    const p = {x: x, y: y, xvel: xvel, yvel: yvel, size: size, brightness: brightness, max_brightness: max_bright, variance: variance};
    passive_particles[i] = p;
  }
}

var updateNodes = function()
{
  for (var i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    n.x += n.xvel;
    n.y += n.yvel;
    //c.fillStyle = 'purple';
    //c.fillRect(n.x,n.y,10,10);

    // Bounce
    if (n.x > w || n.x < 0) {
      n.xvel *= -1;
      //p.x += p.xvel;
    }
    if (n.y > h || n.y < 0) {
      n.yvel *= -1;
      //p.y += p.yvel;
    }
  }
}

var renderBackground = function()
{
  c.fillStyle = 'black';
	c.fillRect(0,0,w,h);
}

var renderConnections = function(p)
{
  nearSet = getNearParticles(p.x, p.y);
  nearIterator = nearSet.entries();
  if (nearSet.size < 2) {
    return;
  }
  for (const near of nearSet) {
    var render = false;
    for (var k = 0; k < nodes.length; k++) {
      if (point_dist(p.x, p.y, nodes[k].x, nodes[k].y) <= max_radius_node) {
        render = true;
        break;
      }
    }
    if (!render && point_dist(near.point.x, near.point.y, mouseX, mouseY) <= max_radius_node * 1.5) {
      render = true;
    }
    if (render) {
      var alpha_bias = 0.4;
      var alpha = (1.0 - (near.distance / max_radius)) * alpha_bias;
      c.strokeStyle = "rgba(255,255,255," + alpha.toString() + ")";
      c.beginPath();
      c.moveTo(near.point.x, near.point.y);
      c.lineTo(p.x, p.y);
      c.closePath();
      c.stroke();
    }
  }
}

var renderField = function()
{
  for (var i = 0; i < particles.length; i++) {
    const p = particles[i];

    c.fillStyle = "rgba(255,255,255," + getRandomTwinkle(p) + ")";
    c.fillRect(p.x,p.y,p.size,p.size);

    p.x += p.xvel;
    p.y += p.yvel;

    // Bounce
    if (p.x > w || p.x < 0) {
      p.xvel *= -1;
      //p.x += p.xvel;
    }
    if (p.y > h || p.y < 0) {
      p.yvel *= -1;
      //p.y += p.yvel;
    }
    renderConnections(p);
  }
}

var renderPassiveField = function()
{
  for (var i = 0; i < passive_particles.length; i++) {
    const p = passive_particles[i];

    c.fillStyle = "rgba(255,255,255," + getRandomTwinkle(p) + ")";
    c.fillRect(p.x,p.y,p.size,p.size);

    p.x += p.xvel;
    p.y += p.yvel;

    // Bounce
    if (p.x > w || p.x < 0) {
      p.xvel *= -1;
    }
    if (p.y > h || p.y < 0) {
      p.yvel *= -1;
    }
  }
}

var render = function()
{
  renderBackground();
  updateNodes();
  renderField();
  renderPassiveField();
}

function resized()
{
  clearInterval(renderer);
  setup();
}
/**
 * Run the setup on launch and add event listener
 * to rerun the setup if the window resizes.
 */
setup();
window.addEventListener( 'resize', resized );
