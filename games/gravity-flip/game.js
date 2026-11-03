/*
  Gravity Flip
  ------------
  Goal: Run as far as you can without hitting a spike.
  Controls: Tap, or press space, to flip gravity. You fall up to the ceiling or down to the floor.
  Rule: You can only flip while you are touching the floor or ceiling, so time it!
  Harder: It speeds up, and later spikes come on both sides.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// GRAVITY FLIP: tap to flip gravity! Run on the floor or the ceiling
// dodge the spikes · you can only flip while you're touching the ground
let y = 230;
let vy = 0;
let g = 1;
let grounded = true;
let spikes = [];
let dist = 0;
let best = 0;
let gapLeft = 80;
let state = "start";
let wait = 0;

function reset() {
  y = 230;
  vy = 0;
  g = 1;
  grounded = true;
  spikes = [];
  dist = 0;
  gapLeft = 80;
  state = "play";
}

// a spike group is [x, side, how many]. side 0 = floor, 1 = ceiling
function addSpikes() {
  let side = rng(0, 1);
  let count = rng(1, 3);
  spikes.push([420, side, count]);
  // sometimes spikes on both sides with a gap in time between them
  if (dist > 1500 && rng(1, 3) === 1) {
    spikes.push([420 + count * 20 + 110, 1 - side, rng(1, 2)]);
  }
}

gameloop(function () {
  let ts = taps();
  wait -= 1;
  let flip = justpressed("space") || justpressed("up") || justpressed("down") || ts.length > 0;

  if (state !== "play") {
    if (wait <= 0 && flip) { reset(); }
  } else {
    let speed = 4 + dist / 2500;
    if (speed > 9) { speed = 9; }
    dist += speed;
    if (flip && grounded) {
      g = -g;
      grounded = false;
      vy = g * 2;
    }
    vy += 0.9 * g;
    y += vy;
    // land on the floor (y 230) or the ceiling (y 70)
    if (y >= 230 && g > 0) {
      y = 230;
      vy = 0;
      grounded = true;
    }
    if (y <= 70 && g < 0) {
      y = 70;
      vy = 0;
      grounded = true;
    }

    gapLeft -= speed;
    if (gapLeft <= 0) {
      addSpikes();
      gapLeft = rng(180, 320) - dist / 100;
      if (gapLeft < 130) { gapLeft = 130; }
    }
    let keep = [];
    for (const s of spikes) {
      s[0] -= speed;
      let sy = 232;
      if (s[1] === 1) { sy = 48; }
      if (bonk(72, y - 9, 18, 18, s[0] + 3, sy, s[2] * 20 - 6, 20)) { state = "dead"; }
      if (s[0] > -80) { keep.push(s); }
    }
    spikes = keep;
    if (state === "dead") {
      wait = 40;
      if (Math.floor(dist / 10) > best) { best = Math.floor(dist / 10); }
    }
  }

  wipe("#160f2a");
  box(0, 0, 400, 48, "#3b2a8a");
  box(0, 252, 400, 48, "#3b2a8a");
  box(0, 46, 400, 2, "#c9a4ff");
  box(0, 252, 400, 2, "#c9a4ff");
  // moving floor stripes so it feels fast
  for (let i = 0; i <= 10; i++) {
    let sx = (i * 40 - dist) % 440;
    if (sx < -40) { sx += 440; }
    box(sx, 262, 20, 4, "#5b47b5");
    box(sx + 20, 34, 20, 4, "#5b47b5");
  }
  for (const s of spikes) {
    for (let k = 0; k <= s[2] - 1; k++) {
      if (s[1] === 0) { sprite("🔺", s[0] + k * 20 + 10, 242, 20); } else { sprite("🔻", s[0] + k * 20 + 10, 58, 20); }
    }
  }
  box(72, y - 9, 18, 18, "#ff5aa8");
  let eye = y - 3;
  if (g < 0) { eye = y + 3; }
  box(82, eye - 2, 4, 4, "white");
  write(Math.floor(dist / 10) + " m", 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);

  if (state === "start") {
    box(0, 110, 400, 80, "rgba(19, 13, 32, 0.92)");
    center("GRAVITY FLIP 🔃", 120, "white", 28);
    center("tap to flip between the floor and the ceiling · tap to start", 158, "#ffb469", 12);
  }
  if (state === "dead") {
    box(0, 110, 400, 80, "rgba(19, 13, 32, 0.92)");
    center("🔺 ouch! " + Math.floor(dist / 10) + " m · best " + best, 120, "white", 22);
    if (wait <= 0) { center("tap to run again", 158, "#a79cc2", 13); }
  }
});
