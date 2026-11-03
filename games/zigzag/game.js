/*
  Zigzag
  ------
  Goal: Keep the ball on the twisting path as long as you can.
  Controls: Tap, or press space, to switch direction (↖ or ↗).
  Timing: Tap right at each corner. Too early or too late and the ball rolls off the edge.
  Score: Distance, plus 5 for every 💎. The ball keeps speeding up.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// ZIGZAG: the ball zooms along the path. Tap to switch direction ↖ ↗
// stay on the path! grab 💎 for bonus points
let W = 22;
let pts = [];
let gems = [];
let bx = 200;
let by = 280;
let dir = 1;
let camY = 0;
let got = 0;
let score = 0;
let best = 0;
let fallT = 0;
let state = "start";
let wait = 0;

// add the next corner of the path (it always turns the other way)
function addPt() {
  let last = pts[pts.length - 1];
  let d = 1;
  if (pts.length >= 2) {
    if (last[0] > pts[pts.length - 2][0]) { d = -1; }
  } else if (rng(0, 1) === 1) {
    d = -1;
  }
  let room = 340 - last[0];
  if (d < 0) { room = last[0] - 60; }
  let L = rng(30, 150);
  if (L > room) { L = room; }
  if (L < 24) { L = 24; }
  pts.push([last[0] + d * L, last[1] - L]);
  if (rng(1, 3) === 1) { gems.push([last[0] + d * L / 2, last[1] - L / 2]); }
}

function reset() {
  pts = [[200, 280]];
  gems = [];
  for (let k = 1; k <= 8; k++) { addPt(); }
  bx = 200;
  by = 280;
  dir = 1;
  if (pts[1][0] < pts[0][0]) { dir = -1; }
  got = 0;
  score = 0;
  state = "play";
}
reset();
state = "start";

// where is the middle of the path at height y?
function centerX(y) {
  for (let k = 0; k <= pts.length - 2; k++) {
    let a = pts[k];
    let b = pts[k + 1];
    if (y <= a[1] && y >= b[1]) {
      let s = 1;
      if (b[0] < a[0]) { s = -1; }
      return a[0] + (a[1] - y) * s;
    }
  }
  return pts[0][0];
}

gameloop(function () {
  let tap = tapped() || justpressed("space");
  wait -= 1;
  if (state === "start" || state === "over") {
    if (wait <= 0 && tap) { reset(); }
  } else if (state === "play") {
    let speed = 2.2 + score / 120;
    if (speed > 5) { speed = 5; }
    if (tap) { dir = -dir; }
    by -= speed;
    bx += dir * speed;
    score = Math.floor((280 - by) / 20) + got * 5;
    if (Math.abs(bx - centerX(by)) > W) {
      state = "fall";
      fallT = 30;
    }
    let keep = [];
    for (const g of gems) {
      if (Math.abs(g[0] - bx) < 14 && Math.abs(g[1] - by) < 14) {
        got += 1;
      } else {
        keep.push(g);
      }
    }
    gems = keep;
    while (pts[pts.length - 1][1] > by - 500) { addPt(); }
    // forget path corners far below the screen
    if (pts.length > 3 && pts[1][1] > by + 400) {
      let rest = [];
      for (let k = 1; k <= pts.length - 1; k++) { rest.push(pts[k]); }
      pts = rest;
    }
  } else if (state === "fall") {
    fallT -= 1;
    if (fallT <= 0) {
      state = "over";
      wait = 20;
      if (score > best) { best = score; }
    }
  }
  camY = by - 200;

  wipe("#7fd3ff");
  for (let k = 0; k <= pts.length - 2; k++) {
    line(pts[k][0], pts[k][1] - camY + 6, pts[k + 1][0], pts[k + 1][1] - camY + 6, "#2450f0", W * 2);
  }
  for (let k = 0; k <= pts.length - 2; k++) {
    line(pts[k][0], pts[k][1] - camY, pts[k + 1][0], pts[k + 1][1] - camY, "#efe9fb", W * 2);
  }
  for (const g of gems) {
    sprite("💎", g[0], g[1] - camY, 16);
  }
  let r = 8;
  if (state === "fall" || state === "over") { r = 8 * fallT / 30; }
  if (r > 0) { bubble(bx, by - camY, r, "#ff5aa8"); }
  sprite(score, 200, 30, 34, "#1d1631");
  write("best " + best, 8, 8, "#1d1631", 13);
  write("💎 " + got, 340, 8, "#1d1631", 14);

  if (state === "start") {
    box(0, 110, 400, 80, "rgba(19, 13, 32, 0.9)");
    center("ZIGZAG ↗↖", 120, "white", 28);
    center("tap to switch direction · stay on the path · tap to start", 158, "#ffb469", 12);
  }
  if (state === "over") {
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.9)");
    center("💀 off the path · score " + score + " · best " + best, 257, "white", 17);
    if (wait <= 0) { center("tap to play again", 280, "#a79cc2", 12); }
  }
});
