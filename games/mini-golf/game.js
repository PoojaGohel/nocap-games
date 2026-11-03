/*
  Mini Golf
  ---------
  Goal: Get the ball into the hole by the 🚩 in as few shots as you can. 5 holes.
  Shoot: Press anywhere, pull back like a slingshot, and let go. Pull further = harder shot.
  Keys: ← → to aim, ↑ ↓ for power, space to shoot.
  Walls: The ball bounces off walls and edges. Use bank shots!
  Score: Each hole has a par (a normal number of shots). Under par is great: birdie (-1), eagle (-2), hole in one!
  Tip: A ball that is going too fast rolls right over the hole.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// MINI GOLF · 5 holes · sink the ball in as few shots as you can
// drag back from anywhere and let go to shoot, like a slingshot
// keys: ← → to aim, ↑ ↓ for power, space to shoot
// a hole is [start, cup, par, walls]. A wall is [x, y, width, height]
let holes = [[[60, 160], [340, 160], 2, []], [[60, 240], [340, 240], 3, [[190, 110, 20, 180]]], [[50, 70], [350, 250], 3, [[130, 30, 20, 170], [250, 120, 20, 170]]], [[60, 250], [335, 70], 3, [[240, 30, 16, 200], [80, 120, 110, 14]]], [[40, 160], [365, 160], 4, [[110, 30, 16, 95], [110, 195, 16, 95], [200, 95, 16, 110], [290, 30, 16, 100], [290, 190, 16, 100]]]];

let hole = 0;
let bx = 0;
let by = 0;
let vx = 0;
let vy = 0;
let hx = 0;
let hy = 0;
let par = 0;
let walls = [];
let strokes = 0;
let total = 0;
let parTotal = 0;
let state = "aim";
let wait = 0;
let ax = 1;
let ay = 0;
let power = 40;
let sx = 0;
let sy = 0;
let armed = false;
let was = false;
let dragging = false;

function loadHole(n) {
  let h = holes[n];
  bx = h[0][0];
  by = h[0][1];
  hx = h[1][0];
  hy = h[1][1];
  par = h[2];
  walls = h[3];
  vx = 0;
  vy = 0;
  strokes = 0;
  ax = 1;
  ay = 0;
  armed = false;
  state = "aim";
}
loadHole(0);

function clampv(v, a, b) {
  if (v < a) { return a; }
  if (v > b) { return b; }
  return v;
}

// bounce the ball off a wall
function bounce(w) {
  let cx = clampv(bx, w[0], w[0] + w[2]);
  let cy = clampv(by, w[1], w[1] + w[3]);
  let dx = bx - cx;
  let dy = by - cy;
  let d = Math.sqrt(dx * dx + dy * dy);
  if (d < 6) {
    if (d === 0) {
      dx = 0;
      dy = -1;
      d = 1;
    }
    let nx = dx / d;
    let ny = dy / d;
    bx = cx + nx * 6;
    by = cy + ny * 6;
    let along = vx * nx + vy * ny;
    if (along < 0) {
      vx -= 2 * along * nx;
      vy -= 2 * along * ny;
      vx = vx * 0.8;
      vy = vy * 0.8;
    }
  }
}

function shoot() {
  vx = ax * power * 0.12;
  vy = ay * power * 0.12;
  strokes += 1;
  armed = false;
  state = "rolling";
}

function scoreName(d) {
  if (strokes === 1) { return "HOLE IN ONE 🤯"; }
  if (d <= -2) { return "eagle 🦅"; }
  if (d === -1) { return "birdie 🐦"; }
  if (d === 0) { return "par 👍"; }
  if (d === 1) { return "bogey 😅"; }
  return "+" + d + " over par 😵";
}

gameloop(function () {
  let ts = taps();
  wait -= 1;

  if (state === "aim") {
    // keyboard aiming: turn the arrow a little each frame
    if (pressed("left") || pressed("right")) {
      let a = 3;
      if (pressed("left")) { a = -3; }
      let nax = ax * cos(a) - ay * sin(a);
      let nay = ax * sin(a) + ay * cos(a);
      ax = nax;
      ay = nay;
    }
    if (pressed("up") && power < 100) { power += 1.5; }
    if (pressed("down") && power > 10) { power -= 1.5; }
    if (justpressed("space")) { shoot(); }

    // slingshot: press, pull back, let go
    if (holding() && !was) {
      sx = tapx();
      sy = tapy();
      armed = true;
    }
    dragging = false;
    if (holding() && armed) {
      let dx = sx - tapx();
      let dy = sy - tapy();
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d > 8) {
        dragging = true;
        ax = dx / d;
        ay = dy / d;
        power = d;
        if (power > 100) { power = 100; }
      }
    }
    if (was && !holding() && armed) {
      let dx = sx - tapx();
      let dy = sy - tapy();
      if (Math.sqrt(dx * dx + dy * dy) > 8) { shoot(); }
      armed = false;
    }
  } else if (state === "rolling") {
    // two small steps per frame so the ball can't skip through walls
    for (let k = 1; k <= 2; k++) {
      bx += vx / 2;
      by += vy / 2;
      if (bx < 16 && vx < 0) { vx = -vx * 0.8; }
      if (bx > 384 && vx > 0) { vx = -vx * 0.8; }
      if (by < 36 && vy < 0) { vy = -vy * 0.8; }
      if (by > 284 && vy > 0) { vy = -vy * 0.8; }
      for (const w of walls) { bounce(w); }
    }
    vx = vx * 0.985;
    vy = vy * 0.985;
    let sp = Math.sqrt(vx * vx + vy * vy);
    let dhx = bx - hx;
    let dhy = by - hy;
    // too fast and the ball skips right over the cup
    if (dhx * dhx + dhy * dhy < 100 && sp < 6) {
      bx = hx;
      by = hy;
      state = "sunk";
      wait = 40;
      total += strokes;
      parTotal += par;
    } else if (sp < 0.08) {
      vx = 0;
      vy = 0;
      state = "aim";
    }
  } else if (state === "sunk" && wait <= 0 && (ts.length > 0 || justpressed("space"))) {
    if (eq(hole, holes.length - 1)) {
      state = "done";
    } else {
      hole += 1;
      loadHole(hole);
    }
  }
  was = holding();

  wipe("#2d6e3a");
  box(10, 30, 380, 260, "#3a8f4a");
  for (let i = 0; i <= 12; i++) {
    box(10 + i * 30, 30, 15, 260, "rgba(255, 255, 255, 0.04)");
  }
  for (const w of walls) {
    box(w[0], w[1], w[2], w[3], "#6b4a2b");
    box(w[0], w[1], w[2], 3, "#8a6239");
  }
  bubble(hx, hy, 9, "#0b1a0f");
  sprite("🚩", hx + 7, hy - 16, 18);
  if (state !== "sunk" && state !== "done") {
    bubble(bx + 1.5, by + 2, 6, "rgba(0, 0, 0, 0.25)");
    bubble(bx, by, 6, "white");
  }

  // aiming dots: green = soft, yellow = medium, pink = full power
  if (state === "aim") {
    let c = "#5fd69b";
    if (power > 45) { c = "#ffd84d"; }
    if (power > 75) { c = "#ff5aa8"; }
    for (let k = 1; k <= 6; k++) {
      bubble(bx + ax * k * power * 0.16, by + ay * k * power * 0.16, 3 - k * 0.3, c);
    }
    if (dragging) { line(sx, sy, tapx(), tapy(), "rgba(255, 255, 255, 0.35)", 2); }
  }

  let diff = total - parTotal;
  let sign = "even";
  if (diff > 0) { sign = "+" + diff; }
  if (diff < 0) { sign = String(diff); }
  write("hole " + (hole + 1) + "/" + holes.length + " · par " + par, 10, 8, "white", 14);
  sprite("shots " + strokes, 200, 16, 14, "#ffd84d");
  write("total " + sign, 320, 8, "#b6ffd4", 14);

  if (state === "sunk") {
    box(0, 118, 400, 64, "#1d1631");
    center(scoreName(strokes - par), 126, "white", 24);
    let hint = "tap for the next hole";
    if (eq(hole, holes.length - 1)) { hint = "tap to see your final score"; }
    center(hint, 160, "#a79cc2", 14);
  }
  if (state === "done") {
    let msg = "even par, solid 👍";
    if (diff < 0) { msg = "you finished " + Math.abs(diff) + " under par 🏆"; }
    if (diff > 0) { msg = "you finished " + diff + " over par"; }
    box(0, 118, 400, 64, "#1d1631");
    center(msg, 126, "white", 24);
    center(total + " shots on " + parTotal + " par · press Restart to play again", 160, "#a79cc2", 14);
    gg();
  }
});
