/*
  Swing
  -----
  Goal: Swing from rope to rope as far as you can without falling into the lava.
  Controls: Hold the screen or space to grab the nearest 📍 in front of you. Let go to fly.
  Start: You begin on a rope. Press and hold, then let go at the top of the swing.
  Tip: Let go while swinging forward and up, then grab the next rope while you are still flying.
  Score: Distance, plus 20 for every 🍌.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// SWING: hold to grab the nearest 📍 with your rope, let go to fly!
// swing as far as you can, grab 🍌 bananas · don't fall in the lava
let anchors = [];
let bananas = [];
let px = 0;
let py = 0;
let vx = 0;
let vy = 0;
let att = -1;
let ropeL = 0;
let camX = 0;
let far = 0;
let got = 0;
let best = 0;
let autoHold = true;
let msgT = 0;
let state = "start";
let wait = 0;

// an anchor is [x, y]
function addAnchor() {
  let last = anchors[anchors.length - 1];
  let ax = last[0] + rng(110, 170);
  anchors.push([ax, rng(40, 100)]);
  if (rng(1, 2) === 1) { bananas.push([ax - rng(40, 70), rng(120, 210)]); }
}

function reset() {
  anchors = [[140, 60]];
  bananas = [];
  while (anchors[anchors.length - 1][0] < 700) { addAnchor(); }
  px = 60;
  py = 130;
  vx = 0;
  vy = 0;
  att = 0;
  ropeL = 105;
  camX = 0;
  far = 0;
  got = 0;
  autoHold = true;
  state = "play";
}
reset();
state = "start";

// grab the closest anchor that is not behind you
function grab() {
  let bestD = 230;
  att = -1;
  for (let i = 0; i <= anchors.length - 1; i++) {
    let a = anchors[i];
    let dx = a[0] - px;
    let dy = a[1] - py;
    let d = Math.sqrt(dx * dx + dy * dy);
    if (dx > -40 && d < bestD) {
      bestD = d;
      att = i;
    }
  }
  if (att >= 0) {
    ropeL = bestD;
    if (ropeL < 50) { ropeL = 50; }
  } else {
    msgT = 40;
  }
}

gameloop(function () {
  let down = pressed("space") || pressed("up") || holding();
  let press = tapped() || justpressed("space") || justpressed("up");
  wait -= 1;
  msgT -= 1;

  if (state !== "play") {
    if (wait <= 0 && press) { reset(); }
  } else {
    // your first press takes over the starting rope
    if (press && autoHold) {
      autoHold = false;
    } else if (press && att < 0) {
      grab();
    }
    if (!down && !autoHold) { att = -1; }

    vy += 0.3;
    px += vx;
    py += vy;
    // on a rope: stay exactly rope-length away, keep only the sideways speed
    if (att >= 0) {
      let a = anchors[att];
      let dx = px - a[0];
      let dy = py - a[1];
      let d = Math.sqrt(dx * dx + dy * dy);
      let nx = dx / d;
      let ny = dy / d;
      px = a[0] + nx * ropeL;
      py = a[1] + ny * ropeL;
      let along = vx * nx + vy * ny;
      vx -= along * nx;
      vy -= along * ny;
    }
    if (py < -60) {
      py = -60;
      vy = 0;
    }
    if (px > far) { far = px; }

    let keepB = [];
    for (const b of bananas) {
      if (Math.abs(b[0] - px) < 18 && Math.abs(b[1] - py) < 18) { got += 1; } else { keepB.push(b); }
    }
    bananas = keepB;
    while (anchors[anchors.length - 1][0] < camX + 650) { addAnchor(); }

    if (py > 280) {
      state = "over";
      wait = 40;
      let total = Math.floor(far / 10) + got * 20;
      if (total > best) { best = total; }
    }
  }
  let goal = px - 130;
  if (goal > camX) { camX += (goal - camX) * 0.12; }

  wipe("#1d1631");
  for (let i = 0; i <= 12; i++) {
    let tx = (i * 97 - camX * 0.3) % 440;
    if (tx < -40) { tx += 440; }
    sprite("🌴", tx, 250 - i % 3 * 18, 34);
  }
  for (const a of anchors) {
    let sx = a[0] - camX;
    if (sx > -20 && sx < 420) {
      box(sx - 1, 0, 2, a[1], "#4a3f6b");
      bubble(sx, a[1], 7, "#ffd84d");
    }
  }
  for (const b of bananas) {
    sprite("🍌", b[0] - camX, b[1], 18);
  }
  if (att >= 0 && state === "play") {
    line(anchors[att][0] - camX, anchors[att][1], px - camX, py, "#c2a36b", 2);
  }
  sprite("🐒", px - camX, py, 26);
  box(0, 284, 400, 16, "#ff6f61");
  for (let i = 0; i <= 9; i++) {
    bubble((i * 53 - camX * 0.8) % 420, 286, 6, "#ffb469");
  }
  let score = Math.floor(far / 10) + got * 20;
  write("score " + score, 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);
  write("🍌 " + got, 345, 8, "#ffd84d", 14);
  if (msgT > 0) { sprite("no rope in reach!", 200, 60, 14, "#ff4d6d"); }
  if (state === "play" && autoHold) { sprite("let go to fly, hold to grab the next 📍", 200, 150, 13, "#ffb469"); }

  if (state === "start") {
    box(0, 110, 400, 80, "rgba(19, 13, 32, 0.92)");
    center("SWING 🐒", 120, "white", 28);
    center("hold = grab a rope · let go = fly · tap to start", 158, "#ffb469", 13);
  }
  if (state === "over") {
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.92)");
    center("🔥 into the lava · score " + score + " · best " + best, 257, "white", 17);
    if (wait <= 0) { center("tap to swing again", 280, "#a79cc2", 12); }
  }
});
