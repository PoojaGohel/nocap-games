/*
  Copter
  ------
  Goal: Fly through the cave as far as you can.
  Controls: Hold space or ↑ (or hold the screen) to fly up. Let go to drop.
  Danger: Touching the cave walls or the green blocks ends the run.
  Harder: The cave gets narrower and faster the further you go.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// COPTER: hold to fly up, let go to drop. Don't touch the cave!
// hold space / ↑ or hold the screen · the cave gets narrower the further you go
let y = 150;
let vy = 0;
let cave = [];
let blocks = [];
let smoke = [];
let mid = 150;
let gap = 200;
let dist = 0;
let best = 0;
let state = "start";
let wait = 0;

// the cave is made of thin slices: [x, top, bottom]
function addSlice(x) {
  mid += rng(-7, 7);
  gap = 200 - dist / 80;
  if (gap < 105) { gap = 105; }
  if (mid < gap / 2 + 10) { mid = gap / 2 + 10; }
  if (mid > 290 - gap / 2) { mid = 290 - gap / 2; }
  cave.push([x, mid - gap / 2, mid + gap / 2]);
}

function reset() {
  y = 150;
  vy = 0;
  cave = [];
  blocks = [];
  smoke = [];
  mid = 150;
  dist = 0;
  for (let i = 0; i <= 41; i++) {
    cave.push([i * 10, 50, 250]);
  }
  state = "play";
}
reset();
state = "start";

gameloop(function () {
  let ts = taps();
  wait -= 1;
  let up = pressed("space") || pressed("up") || holding();

  if (state !== "play") {
    if (wait <= 0 && (ts.length > 0 || justpressed("space"))) { reset(); }
  } else {
    let speed = 3 + dist / 3000;
    dist += speed;
    if (up) { vy -= 0.45; } else { vy += 0.35; }
    if (vy > 6) { vy = 6; }
    if (vy < -6) { vy = -6; }
    y += vy;

    // scroll the cave and add new slices on the right
    for (const c of cave) {
      c[0] -= speed;
    }
    if (cave[0][0] < -10) {
      let keep = [];
      for (const c of cave) {
        if (c[0] >= -10) { keep.push(c); }
      }
      cave = keep;
    }
    while (cave[cave.length - 1][0] < 410) {
      addSlice(cave[cave.length - 1][0] + 10);
    }

    // floating blocks in the middle of the cave
    if (rng(1, 90) === 1 && dist > 600) {
      let last = cave[cave.length - 1];
      blocks.push([420, rng(Math.floor(last[1]) + 20, Math.floor(last[2]) - 60), 40]);
    }
    let keepB = [];
    for (const b of blocks) {
      b[0] -= speed;
      if (bonk(70, y - 8, 22, 16, b[0], b[1], 16, b[2])) { state = "dead"; }
      if (b[0] > -20) { keepB.push(b); }
    }
    blocks = keepB;

    // crash into the cave walls?
    for (const c of cave) {
      if (c[0] <= 82 && c[0] + 10 > 82) {
        if (y - 8 < c[1] || y + 8 > c[2]) { state = "dead"; }
      }
    }
    if (state === "dead") {
      wait = 40;
      if (Math.floor(dist / 10) > best) { best = Math.floor(dist / 10); }
    }
    if (Math.floor(dist) % 9 < 3) { smoke.push([66, y + 2, 20]); }
  }

  let keepS = [];
  for (const s of smoke) {
    s[0] -= 2;
    s[2] -= 1;
    if (s[2] > 0) { keepS.push(s); }
  }
  smoke = keepS;

  wipe("#1b1530");
  for (const c of cave) {
    box(c[0], 0, 11, c[1], "#2e8a5a");
    box(c[0], c[2], 11, 300 - c[2], "#2e8a5a");
  }
  for (const b of blocks) {
    box(b[0], b[1], 16, b[2], "#5fd69b");
  }
  for (const s of smoke) {
    bubble(s[0], s[1], s[2] / 4, "rgba(255, 255, 255, 0.3)");
  }
  sprite("🚁", 82, y, 26);
  write(Math.floor(dist / 10) + " m", 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);

  if (state === "start") {
    box(0, 110, 400, 80, "rgba(19, 13, 32, 0.9)");
    center("COPTER 🚁", 120, "white", 28);
    center("hold to fly up · let go to drop · tap to start", 158, "#ffb469", 13);
  }
  if (state === "dead") {
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.9)");
    center("💥 crashed at " + Math.floor(dist / 10) + " m · best " + best, 257, "white", 19);
    if (wait <= 0) { center("tap to fly again", 280, "#a79cc2", 12); }
  }
});
