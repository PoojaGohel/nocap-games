/*
  Color Switch
  ------------
  Goal: Bounce up through as many spinning rings as you can.
  Controls: Tap, or press space, to bounce up. Gravity pulls you down.
  Rule: You can only pass through the part of a ring that is YOUR color. Wrong color = game over.
  Switch: Touching a 🌈 changes your color, so watch the next ring carefully.
  Lose: Hitting a wrong color, or falling off the bottom of the screen.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// COLOR SWITCH: tap to bounce up through the spinning rings
// you can only pass through the part that matches YOUR color!
// touch the 🌈 to change your color
let colors = ["#ff5aa8", "#7fd3ff", "#ffd84d", "#b57bff"];
let by = 250;
let vy = 0;
let cam = 0;
let me = 0;
let rings = [];
let switches = [];
let nextY = 120;
let score = 0;
let best = 0;
let started = false;
let state = "play";
let wait = 0;

// a ring is [y, radius, angle, spin, counted]
function addRing() {
  let spin = 1.2 + score * 0.08;
  if (spin > 3) { spin = 3; }
  if (rng(0, 1) === 1) { spin = -spin; }
  rings.push([nextY, rng(52, 68), rng(0, 3) * 90, spin, false]);
  switches.push([nextY - 120, false]);
  nextY -= 240;
}

function reset() {
  by = 250;
  vy = 0;
  cam = 0;
  me = rng(0, 3);
  rings = [];
  switches = [];
  nextY = 60;
  score = 0;
  started = false;
  for (let k = 1; k <= 3; k++) { addRing(); }
  state = "play";
}
reset();

// which color is at angle a (in degrees) on this ring?
function colorAt(r, a) {
  let d = ((a - r[2]) % 360 + 360) % 360;
  return Math.floor(d / 90);
}

gameloop(function () {
  let ts = taps();
  wait -= 1;
  let tap = ts.length > 0 || justpressed("space") || justpressed("up");

  if (state !== "play") {
    if (wait <= 0 && tap) { reset(); }
  } else {
    if (tap) {
      vy = -6.2;
      started = true;
    }
    if (started) {
      vy += 0.32;
      by += vy;
    }
    // keep the ball in the lower half of the screen
    if (by - cam < 150) { cam = by - 150; }

    for (const r of rings) {
      r[2] += r[3];
      let d = Math.abs(by - r[0]);
      // touching the ring band?
      if (Math.abs(d - r[1]) < 12) {
        let a = 90;
        if (by < r[0]) { a = 270; }
        if (!eq(colorAt(r, a), me)) { state = "dead"; }
      }
      if (!r[4] && by < r[0]) {
        r[4] = true;
        score += 1;
      }
    }
    for (const s of switches) {
      if (!s[1] && Math.abs(by - s[0]) < 14) {
        s[1] = true;
        let c = rng(0, 2);
        if (c >= me) { c += 1; }
        me = c;
      }
    }
    // add more rings above, forget the ones far below
    if (nextY > cam - 300) { addRing(); }
    let keep = [];
    for (const r of rings) {
      if (r[0] - cam < 500) { keep.push(r); }
    }
    rings = keep;
    if (by - cam > 310) { state = "dead"; }
    if (state === "dead") {
      wait = 40;
      if (score > best) { best = score; }
    }
  }

  wipe("#160f2a");
  for (const r of rings) {
    let sy = r[0] - cam;
    if (sy > -90 && sy < 390) {
      // draw each quarter as short lines along the circle
      for (let q = 0; q <= 3; q++) {
        for (let k = 0; k <= 8; k++) {
          let a1 = r[2] + q * 90 + k * 10;
          let a2 = a1 + 10;
          line(200 + cos(a1) * r[1], sy + sin(a1) * r[1], 200 + cos(a2) * r[1], sy + sin(a2) * r[1], colors[q], 10);
        }
      }
    }
  }
  for (const s of switches) {
    let sy = s[0] - cam;
    if (!s[1] && sy > -20 && sy < 320) { sprite("🌈", 200, sy, 22); }
  }
  bubble(200, by - cam, 8, colors[me]);
  if (!started && state === "play") { sprite("tap to bounce", 200, 285, 13, "#a79cc2"); }
  write("score " + score, 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);

  if (state === "dead") {
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.92)");
    center("wrong color 💀 score " + score + " · best " + best, 257, "white", 19);
    if (wait <= 0) { center("tap to play again", 280, "#a79cc2", 12); }
  }
});
