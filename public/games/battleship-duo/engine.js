/*
  engine.js: the small game engine shared by every game in this pack.

  It gives a game:
    - a 400 × 300 screen (scaled to fit any device, sharp on retina screens)
    - drawing:   wipe, box, bubble, line, write, center, sprite
    - input:     pressed, justpressed, tapped, holding, tapx, tapy, taps, fingers
    - a loop:    gameloop(fn) runs fn about 60 times a second, gg() stops it
    - helpers:   rng, sin, cos, bonk, eq, range, clock

  A game is a normal JavaScript file (game.js) that sets up its variables
  and then calls gameloop(function () { ... }) once.
*/

/* ------------------------------------------------------------------ */
/* Helpers (plain functions, no browser needed)                        */
/* ------------------------------------------------------------------ */

// random whole number from a to b (both included)
function rng(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// sine and cosine that take degrees instead of radians
function sin(degrees) { return Math.sin(degrees * Math.PI / 180); }
function cos(degrees) { return Math.cos(degrees * Math.PI / 180); }

// do two boxes overlap? (x, y, width, height for each box)
function bonk(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x2 < x1 + w1 && y1 < y2 + h2 && y2 < y1 + h1;
}

// equality that also compares lists item by item: eq([1, 2], [1, 2]) is true
function eq(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => eq(x, b[i]));
  }
  return a === b;
}

// list of whole numbers from a to b, counting up or down: range(3, 1) is [3, 2, 1]
function range(a, b) {
  const out = [];
  const step = a <= b ? 1 : -1;
  for (let i = a; step > 0 ? i <= b : i >= b; i += step) out.push(i);
  return out;
}

// turn any value into display text (keeps decimals short)
function fmt(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v * 1e10) / 1e10);
  if (Array.isArray(v)) return '[' + v.map(fmt).join(', ') + ']';
  return String(v);
}

function num(x) { return Number(x); }

/* ------------------------------------------------------------------ */
/* Screen, input and game loop (browser)                               */
/* ------------------------------------------------------------------ */

const Engine = {
  W: 400,
  H: 300,
  canvas: null,
  ctx: null,
  keys: new Set(),      // keys held down right now
  hits: new Set(),      // keys that went down this frame
  tapList: [],          // taps that started this frame
  pointers: new Map(),  // fingers / mouse buttons held right now
  tap: { down: false, held: false, x: 0, y: 0 },
  loopFn: null,
  stopped: false,
  startTime: 0,
  last: 0,
};

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"';

/* ---- drawing ---- */

// fill the whole screen with one color
function wipe(color = '#1d1631') {
  Engine.ctx.fillStyle = color;
  Engine.ctx.fillRect(0, 0, Engine.W, Engine.H);
}

// rectangle: x, y is the top-left corner
function box(x, y, w, h, color = 'white') {
  Engine.ctx.fillStyle = color;
  Engine.ctx.fillRect(x, y, w, h);
}

// circle: x, y is the center
function bubble(x, y, r, color = 'white') {
  const ctx = Engine.ctx;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  ctx.fill();
}

// straight line with round ends
function line(x1, y1, x2, y2, color = 'white', width = 2) {
  const ctx = Engine.ctx;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// text: x, y is the top-left corner
function write(text, x, y, color = 'white', size = 16) {
  const ctx = Engine.ctx;
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText(fmt(text), x, y);
}

// text centered across the whole screen at height y
function center(text, y, color = 'white', size = 16) {
  const ctx = Engine.ctx;
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.fillText(fmt(text), Engine.W / 2, y);
  ctx.textAlign = 'left';
}

// an emoji (or short text) centered at x, y
function sprite(text, x, y, size = 32, color = 'white') {
  const ctx = Engine.ctx;
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px ${FONT}, ${EMOJI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(fmt(text), x, y);
  ctx.textAlign = 'left';
}

/* ---- input ---- */

// is this key held down? names: "left" "right" "up" "down" "space", or any letter / digit
function pressed(key) {
  key = key.toLowerCase();
  return Engine.keys.has(key) || Engine.hits.has(key);
}

// did this key go down during this frame? (one press = true for one frame)
function justpressed(key) {
  return Engine.hits.has(key.toLowerCase());
}

// was the screen tapped / clicked during this frame?
function tapped() { return Engine.tap.down; }

// is a finger or mouse button held down on the screen?
function holding() { return Engine.tap.held; }

// where the last tap / finger is, in screen units (0-400, 0-300)
function tapx() { return Engine.tap.x; }
function tapy() { return Engine.tap.y; }

// every tap that started this frame, as [x, y] (several players can tap at once)
function taps() { return Engine.tapList.map(p => [p[0], p[1]]); }

// every finger on the screen right now, as [x, y]
function fingers() { return [...Engine.pointers.values()].map(p => [p[0], p[1]]); }

// seconds since the game started
function clock() { return (performance.now() - Engine.startTime) / 1000; }

/* ---- loop ---- */

// run fn about 60 times a second
function gameloop(fn) {
  Engine.loopFn = fn;
}

// game over: stop the loop after this frame
function gg() { Engine.stopped = true; }

function showError(err) {
  const el = document.getElementById('error');
  if (el) { el.textContent = 'Error: ' + err.message; el.hidden = false; }
  console.error(err);
}

function tick(now) {
  if (Engine.stopped) return;
  requestAnimationFrame(tick);
  if (now - Engine.last < 15) return;   // cap at ~60 frames per second
  Engine.last = now;
  try {
    Engine.loopFn();
  } catch (err) {
    Engine.stopped = true;
    showError(err);
  }
  Engine.tap.down = false;
  Engine.hits.clear();
  Engine.tapList.length = 0;
}

/* ---- setup ---- */

(function setup() {
  const canvas = document.getElementById('screen');
  Engine.canvas = canvas;
  Engine.ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Engine.W * dpr;
  canvas.height = Engine.H * dpr;
  Engine.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  Engine.startTime = performance.now();

  // keyboard
  const KEYMAP = { arrowleft: 'left', arrowright: 'right', arrowup: 'up', arrowdown: 'down', ' ': 'space', spacebar: 'space' };
  const keyName = e => KEYMAP[e.key.toLowerCase()] || e.key.toLowerCase();
  window.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === 'Tab') return;
    const k = keyName(e);
    if (!e.repeat) { Engine.keys.add(k); Engine.hits.add(k); }
    if (['left', 'right', 'up', 'down', 'space'].includes(k)) e.preventDefault();
  });
  window.addEventListener('keyup', e => Engine.keys.delete(keyName(e)));
  window.addEventListener('blur', () => Engine.keys.clear());

  // mouse and touch on the screen
  const aim = e => {
    const r = canvas.getBoundingClientRect();
    Engine.tap.x = (e.clientX - r.left) * Engine.W / r.width;
    Engine.tap.y = (e.clientY - r.top) * Engine.H / r.height;
    return [Engine.tap.x, Engine.tap.y];
  };
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    const pt = aim(e);
    Engine.tap.down = true;
    Engine.tap.held = true;
    Engine.tapList.push(pt);
    Engine.pointers.set(e.pointerId, pt);
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* older browsers */ }
  });
  canvas.addEventListener('pointermove', e => {
    const pt = aim(e);
    if (Engine.pointers.has(e.pointerId)) Engine.pointers.set(e.pointerId, pt);
  });
  const lift = e => {
    Engine.pointers.delete(e.pointerId);
    Engine.tap.held = Engine.pointers.size > 0;
  };
  canvas.addEventListener('pointerup', lift);
  canvas.addEventListener('pointercancel', lift);

  // on-screen buttons (for phones): <button data-key="left">
  document.querySelectorAll('[data-key]').forEach(btn => {
    const k = btn.dataset.key;
    btn.addEventListener('pointerdown', e => { e.preventDefault(); Engine.keys.add(k); Engine.hits.add(k); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, () => Engine.keys.delete(k)));
  });

  const restart = document.getElementById('restart');
  if (restart) restart.addEventListener('click', () => location.reload());

  // start the loop once game.js has loaded and called gameloop()
  window.addEventListener('load', () => {
    if (Engine.loopFn) requestAnimationFrame(tick);
  });
})();
