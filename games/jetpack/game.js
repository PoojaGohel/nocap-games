/*
  Jetpack
  -------
  Goal: Fly as far as you can and grab 🪙 coins. Each coin is worth 10 points.
  Controls: Hold space or ↑ (or hold the screen) to fly up. Let go to fall.
  Zappers: The ⚡ yellow laser bars come in different angles. Touching one ends the run.
  Missiles: ⚠️ means a 🚀 missile is locking on to your height. Move away before it fires!

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// JETPACK: hold to fly, let go to fall
// grab 🪙 coins · dodge the ⚡ zappers and watch for ⚠️ missiles
let y = 240;
let vy = 0;
let coins = [];
let zaps = [];
let missiles = [];
let dist = 0;
let got = 0;
let best = 0;
let nextThing = 200;
let state = "start";
let wait = 0;
let flame = false;

function reset() {
  y = 240;
  vy = 0;
  coins = [];
  zaps = [];
  missiles = [];
  dist = 0;
  got = 0;
  nextThing = 200;
  state = "play";
}

// how far is point (px, py) from the line from (ax, ay) to (bx, by)?
function distToLine(px, py, ax, ay, bx, by) {
  let dx = bx - ax;
  let dy = by - ay;
  let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  if (t < 0) { t = 0; }
  if (t > 1) { t = 1; }
  let cx = ax + t * dx - px;
  let cy = ay + t * dy - py;
  return Math.sqrt(cx * cx + cy * cy);
}

// spawn the next thing: a zapper, a coin pattern, or a missile
function spawn() {
  let roll = rng(1, 10);
  if (roll <= 5) {
    // a zapper is [x, y, length, angle]
    let ang = [90, 0, 45, -45][rng(0, 3)];
    zaps.push([430, rng(70, 230), rng(50, 90), ang]);
  } else if (roll <= 8) {
    let cy = rng(70, 230);
    let wave = rng(0, 1) === 1;
    for (let k = 0; k <= 7; k++) {
      let oy = 0;
      if (wave) { oy = sin(k * 45) * 25; }
      coins.push([430 + k * 22, cy + oy]);
    }
  } else if (dist > 800) {
    // a missile is [x, y, warning time]
    missiles.push([430, y, 70]);
  }
}

gameloop(function () {
  let ts = taps();
  wait -= 1;
  let up = pressed("space") || pressed("up") || holding();

  if (state !== "play") {
    if (wait <= 0 && (ts.length > 0 || justpressed("space"))) { reset(); }
  } else {
    let speed = 4 + dist / 2500;
    if (speed > 9) { speed = 9; }
    dist += speed;
    flame = up;
    if (up) { vy -= 0.55; } else { vy += 0.45; }
    if (vy > 7) { vy = 7; }
    if (vy < -7) { vy = -7; }
    y += vy;
    if (y > 262) {
      y = 262;
      vy = 0;
    }
    if (y < 48) {
      y = 48;
      vy = 0;
    }

    nextThing -= speed;
    if (nextThing <= 0) {
      spawn();
      nextThing = rng(140, 230);
    }

    let keepC = [];
    for (const c of coins) {
      c[0] -= speed;
      if (Math.abs(c[0] - 90) < 16 && Math.abs(c[1] - y) < 18) {
        got += 1;
      } else if (c[0] > -20) {
        keepC.push(c);
      }
    }
    coins = keepC;

    let keepZ = [];
    for (const z of zaps) {
      z[0] -= speed;
      let ex = z[0] + cos(z[3]) * z[2];
      let ey = z[1] + sin(z[3]) * z[2];
      if (distToLine(90, y, z[0], z[1], ex, ey) < 14) { state = "dead"; }
      if (z[0] > -120) { keepZ.push(z); }
    }
    zaps = keepZ;

    let keepM = [];
    for (const m of missiles) {
      if (m[2] > 0) {
        // warning: it follows your height until it launches
        m[2] -= 1;
        m[1] += (y - m[1]) / 12;
      } else {
        m[0] -= 11;
      }
      if (m[2] <= 0 && Math.abs(m[0] - 90) < 18 && Math.abs(m[1] - y) < 14) { state = "dead"; }
      if (m[0] > -40) { keepM.push(m); }
    }
    missiles = keepM;

    if (state === "dead") {
      wait = 40;
      let total = Math.floor(dist / 10) + got * 10;
      if (total > best) { best = total; }
    }
  }

  wipe("#241b3d");
  for (let i = 0; i <= 8; i++) {
    let sx = (i * 60 - dist / 2) % 480;
    if (sx < -60) { sx += 480; }
    box(sx, 40, 4, 236, "#2e2350");
  }
  box(0, 276, 400, 24, "#3b2a8a");
  box(0, 0, 400, 36, "#3b2a8a");
  for (const c of coins) {
    sprite("🪙", c[0], c[1], 18);
  }
  for (const z of zaps) {
    let ex = z[0] + cos(z[3]) * z[2];
    let ey = z[1] + sin(z[3]) * z[2];
    line(z[0], z[1], ex, ey, "rgba(255, 216, 77, 0.35)", 12);
    line(z[0], z[1], ex, ey, "#ffd84d", 4);
    bubble(z[0], z[1], 7, "#c9a4ff");
    bubble(ex, ey, 7, "#c9a4ff");
  }
  for (const m of missiles) {
    if (m[2] > 0) {
      sprite("⚠️", 380, m[1], 22);
    } else {
      sprite("🚀", m[0], m[1], 26);
    }
  }
  if (flame && state === "play") {
    bubble(82, y + 16, 5, "#ffb469");
    bubble(82, y + 22, 3, "#ff5aa8");
  }
  sprite("🤖", 90, y, 28);

  write(Math.floor(dist / 10) + " m", 8, 10, "white", 15);
  write("🪙 " + got, 90, 10, "#ffd84d", 15);
  write("best " + best, 320, 11, "#c9a4ff", 12);

  if (state === "start") {
    box(0, 110, 400, 80, "rgba(19, 13, 32, 0.92)");
    center("JETPACK 🤖", 120, "white", 28);
    center("hold to fly · grab coins · dodge zappers and missiles · tap to start", 158, "#ffb469", 11);
  }
  if (state === "dead") {
    box(0, 230, 400, 46, "rgba(19, 13, 32, 0.92)");
    center("⚡ zapped! " + Math.floor(dist / 10) + " m + " + got + " coins = " + (Math.floor(dist / 10) + got * 10) + " · best " + best, 235, "white", 15);
    if (wait <= 0) { center("tap to fly again", 257, "#a79cc2", 12); }
  }
});
