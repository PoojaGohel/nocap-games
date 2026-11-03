/*
  Wave
  ----
  Goal: Fly through the zigzag tunnel without touching the walls.
  Controls: Hold the screen or space to fly up at a slant ↗. Let go to dive ↘.
  Tip: Match the walls: hold when the tunnel goes up, let go when it goes down, tap quickly when it is flat.
  Harder: The tunnel gets narrower and faster the further you go.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// WAVE: hold to zoom up ↗, let go to dive ↘ (like Geometry Dash)
// slide through the zigzag tunnel without touching the walls
let PX = 80;
let slices = [];
let y = 150;
let up = false;
let cy = 150;
let slope = 0;
let runLeft = 0;
let dist = 0;
let trail = [];
let best = 0;
let state = "start";
let wait = 0;

// the tunnel is thin slices: [x, top, bottom]. Walls go straight or at 45°
function addSlice(x) {
  let gap = 140 - dist / 90;
  if (gap < 64) { gap = 64; }
  if (runLeft <= 0) {
    slope = [-1, 0, 1, -1, 1][rng(0, 4)];
    runLeft = rng(4, 14);
  }
  runLeft -= 1;
  cy += slope * 8;
  if (cy < gap / 2 + 8) {
    cy = gap / 2 + 8;
    slope = 1;
  }
  if (cy > 292 - gap / 2) {
    cy = 292 - gap / 2;
    slope = -1;
  }
  slices.push([x, cy - gap / 2, cy + gap / 2]);
}

function reset() {
  slices = [];
  cy = 150;
  slope = 0;
  runLeft = 12;
  dist = 0;
  for (let i = 0; i <= 52; i++) { addSlice(i * 8); }
  y = 150;
  trail = [];
  state = "play";
}
reset();
state = "start";

gameloop(function () {
  let down = pressed("space") || pressed("up") || holding();
  wait -= 1;
  if (state !== "play") {
    if (wait <= 0 && (tapped() || justpressed("space"))) { reset(); }
  } else {
    let speed = 3.5 + dist / 4000;
    if (speed > 6.5) { speed = 6.5; }
    dist += speed;
    up = down;
    if (up) { y -= speed; } else { y += speed; }
    for (const s of slices) {
      s[0] -= speed;
    }
    if (slices[0][0] < -8) {
      let keep = [];
      for (const s of slices) {
        if (s[0] >= -8) { keep.push(s); }
      }
      slices = keep;
    }
    while (slices[slices.length - 1][0] < 410) { addSlice(slices[slices.length - 1][0] + 8); }
    for (const p of trail) {
      p[0] -= speed;
    }
    trail.push([PX, y]);
    if (trail.length > 30) {
      let t2 = [];
      for (let k = 1; k <= trail.length - 1; k++) { t2.push(trail[k]); }
      trail = t2;
    }
    for (const s of slices) {
      if (s[0] <= PX && s[0] + 8 > PX) {
        if (y - 4 < s[1] || y + 4 > s[2]) { state = "over"; }
      }
    }
    if (state === "over") {
      wait = 40;
      if (Math.floor(dist / 10) > best) { best = Math.floor(dist / 10); }
    }
  }

  wipe("#0b0716");
  for (const s of slices) {
    box(s[0], 0, 9, s[1] + 2, "#3b2a8a");
    box(s[0], s[2] - 2, 9, 302 - s[2], "#3b2a8a");
  }
  // smooth glowing edges on the walls
  for (let k = 1; k <= slices.length - 1; k++) {
    let a = slices[k - 1];
    let c = slices[k];
    line(a[0] + 4, a[1], c[0] + 4, c[1], "#7fd3ff", 3);
    line(a[0] + 4, a[2], c[0] + 4, c[2], "#7fd3ff", 3);
  }
  if (trail.length >= 2) {
    for (let k = 1; k <= trail.length - 1; k++) {
      line(trail[k - 1][0], trail[k - 1][1], trail[k][0], trail[k][1], "rgba(255, 90, 168, 0.6)", 4);
    }
  }
  // the wave arrow
  let dy = 8;
  if (up) { dy = -8; }
  line(PX - 8, y - dy, PX + 8, y + dy * 0, "#ff5aa8", 4);
  line(PX - 8, y + 6 - dy, PX + 8, y, "#ff5aa8", 4);
  bubble(PX + 6, y, 4, "white");
  write(Math.floor(dist / 10) + " m", 8, 8, "white", 15);
  write("best " + best, 330, 9, "#c9a4ff", 12);

  if (state === "start") {
    box(0, 110, 400, 80, "rgba(19, 13, 32, 0.92)");
    center("WAVE 〰️", 120, "white", 28);
    center("hold = go up ↗ · let go = go down ↘ · tap to start", 158, "#ffb469", 13);
  }
  if (state === "over") {
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.92)");
    center("💥 hit the wall at " + Math.floor(dist / 10) + " m · best " + best, 257, "white", 17);
    if (wait <= 0) { center("tap to play again", 280, "#a79cc2", 12); }
  }
});
