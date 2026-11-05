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

const FONT = '"Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"';

// ---- color helpers (used to give the drawings some light and depth) ----

Engine.colorCache = new Map();

// any CSS color ("hotpink", "#ff5aa8", "rgba(...)") as { r, g, b, a }. The browser does the parsing.
Engine.rgbaOf = function (color) {
  let c = Engine.colorCache.get(color);
  if (c) return c;
  const ctx = Engine.ctx;
  ctx.fillStyle = '#000';
  ctx.fillStyle = color;
  const s = String(ctx.fillStyle);
  c = { r: 0, g: 0, b: 0, a: 1 };
  if (s[0] === '#' && s.length === 7) {
    c = { r: parseInt(s.slice(1, 3), 16), g: parseInt(s.slice(3, 5), 16), b: parseInt(s.slice(5, 7), 16), a: 1 };
  } else {
    const m = s.match(/[\d.]+/g);
    if (m && m.length >= 3) c = { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] };
  }
  if (Engine.colorCache.size > 600) Engine.colorCache.clear();
  Engine.colorCache.set(color, c);
  return c;
}

// how bright a color looks, 0 (black) to 255 (white)
Engine.lum = function (c) { return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; }

// mix a color toward white (k > 0) or black (k < 0), k from -1 to 1
Engine.tint = function (c, k, a = c.a) {
  const t = k > 0 ? 255 : 0;
  const f = Math.abs(k);
  const m = v => Math.round(v + (t - v) * f);
  return `rgba(${m(c.r)}, ${m(c.g)}, ${m(c.b)}, ${a})`;
}

// a soft round light that fades out to nothing
Engine.glow = function (x, y, r, c, a) {
  const ctx = Engine.ctx;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`);
  g.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, Engine.W, Engine.H);
}

// the same hue as a color, but brighter and more colorful (for glows on dark backgrounds).
// Grey colors get a violet glow.
Engine.richer = function (c) {
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 265;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = d / (1 - Math.abs(max + min - 1));
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
  }
  if (s < 0.1) h = 265;
  s = Math.max(s, 0.6);
  const l = 0.42;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return { r: f(0), g: f(8), b: f(4), a: 1 };
};

/* ---- drawing ---- */

// a few stars for dark backgrounds (same spots every frame, they just twinkle)
Engine.stars = [];
for (let i = 0; i < 46; i++) {
  Engine.stars.push([Math.random() * 400, Math.random() * 300, Math.random() * 1.3 + 0.5, Math.random() * 6.3]);
}
Engine.PINK = { r: 255, g: 90, b: 168 };
Engine.WHITE = { r: 255, g: 255, b: 255 };
Engine.shadeTop = null;
Engine.shadeEdge = null;

// fill the whole screen with one color, then bring it to life:
//   dark colors get two slowly drifting colored lights and twinkling stars,
//   light colors (like a sky) get soft drifting clouds of light,
//   colors in between (grass, sand...) get a warm light from above.
// Every background also gets a light-to-dark shade and darker edges for depth.
function wipe(color = '#1d1631') {
  const ctx = Engine.ctx;
  const W = Engine.W;
  const H = Engine.H;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);

  const c = Engine.rgbaOf(color);
  const L = Engine.lum(c);
  const t = clock();
  if (L < 80) {
    const light = Engine.richer(c);
    Engine.glow(W * (0.25 + 0.08 * Math.sin(t * 0.21)), H * (0.2 + 0.1 * Math.cos(t * 0.17)), H * 0.95, light, 0.42);
    Engine.glow(W * (0.8 + 0.06 * Math.cos(t * 0.15)), H * (0.78 + 0.08 * Math.sin(t * 0.19)), H * 0.8, Engine.PINK, 0.1);
    for (const s of Engine.stars) {
      const a = 0.12 + 0.28 * (0.5 + 0.5 * Math.sin(t * 1.4 + s[3]));
      ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`;
      ctx.fillRect(s[0], s[1], s[2], s[2]);
    }
  } else if (L > 160) {
    Engine.glow(W * (((0.2 + t * 0.012) % 1.3) - 0.15), H * 0.22, H * 0.45, Engine.WHITE, 0.4);
    Engine.glow(W * (((0.85 + t * 0.008) % 1.3) - 0.15), H * 0.5, H * 0.38, Engine.WHITE, 0.28);
  } else {
    Engine.glow(W * 0.5, -H * 0.25, H * 1.15, Engine.rgbaOf(Engine.tint(c, 0.5, 1)), 0.35);
  }

  if (!Engine.shadeTop) {
    Engine.shadeTop = ctx.createLinearGradient(0, 0, 0, H);
    Engine.shadeTop.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
    Engine.shadeTop.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    Engine.shadeTop.addColorStop(1, 'rgba(0, 0, 0, 0.16)');
    Engine.shadeEdge = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
    Engine.shadeEdge.addColorStop(0, 'rgba(0, 0, 0, 0)');
    Engine.shadeEdge.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
  }
  ctx.fillStyle = Engine.shadeTop;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = Engine.shadeEdge;
  ctx.fillRect(0, 0, W, H);
}

// light text gets a small soft shadow so it stands out from whatever is behind it
// (dark text is left alone, a dark shadow would only make it blurry)
Engine.textShadow = function (on) {
  const ctx = Engine.ctx;
  const light = on && Engine.lum(Engine.rgbaOf(String(ctx.fillStyle))) > 120;
  ctx.shadowColor = light ? 'rgba(0, 0, 0, 0.4)' : 'transparent';
  ctx.shadowBlur = light ? 3 : 0;
  ctx.shadowOffsetY = light ? 1.5 : 0;
}

// how round box corners are. A game can set Engine.round = 0 for sharp corners
// (handy when boxes touch each other, like the squares of a tile board)
Engine.round = 3;

// rectangle: x, y is the top-left corner
// Corners are slightly rounded, and solid boxes get a thin light top edge so tiles
// and buttons look raised. Boxes as wide or tall as the screen stay plain.
function box(x, y, w, h, color = 'white') {
  const ctx = Engine.ctx;
  const full = Math.abs(w) >= Engine.W - 1 || Math.abs(h) >= Engine.H - 1;
  const r = Math.min(Engine.round, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.fillStyle = color;
  if (full || r < 0.5 || !ctx.roundRect) {
    ctx.fillRect(x, y, w, h);
  } else {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }
  if (!full && w >= 16 && h >= 14 && Engine.rgbaOf(color).a === 1) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x + r, y, w - 2 * r, 1);
  }
}

// circle: x, y is the center
// Solid circles are shaded like a ball: lighter at the top left, darker at the edge.
function bubble(x, y, r, color = 'white') {
  const ctx = Engine.ctx;
  r = Math.max(0, r);
  const c = Engine.rgbaOf(color);
  if (r >= 5 && c.a === 1 && Engine.lum(c) < 45) {
    // very dark circles are usually holes (mole holes, empty slots), so shade them sunken
    const g = ctx.createLinearGradient(x, y - r, x, y + r);
    g.addColorStop(0, Engine.tint(c, -0.55));
    g.addColorStop(0.6, `rgb(${c.r}, ${c.g}, ${c.b})`);
    g.addColorStop(1, Engine.tint(c, 0.22));
    ctx.fillStyle = g;
  } else if (r >= 5 && c.a === 1) {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, Engine.tint(c, 0.4));
    g.addColorStop(0.55, `rgb(${c.r}, ${c.g}, ${c.b})`);
    g.addColorStop(1, Engine.tint(c, -0.2));
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = color;
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
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
  ctx.font = `800 ${size}px ${FONT}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  Engine.textShadow(true);
  ctx.fillText(fmt(text), x, y);
  Engine.textShadow(false);
}

// text centered across the whole screen at height y
function center(text, y, color = 'white', size = 16) {
  const ctx = Engine.ctx;
  ctx.fillStyle = color;
  ctx.font = `800 ${size}px ${FONT}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  Engine.textShadow(true);
  ctx.fillText(fmt(text), Engine.W / 2, y);
  Engine.textShadow(false);
  ctx.textAlign = 'left';
}

// an emoji (or short text) centered at x, y
function sprite(text, x, y, size = 32, color = 'white') {
  const ctx = Engine.ctx;
  ctx.fillStyle = color;
  ctx.font = `800 ${size}px ${FONT}, ${EMOJI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  Engine.textShadow(true);
  ctx.fillText(fmt(text), x, y);
  Engine.textShadow(false);
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
