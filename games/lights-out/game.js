/*
  Lights Out
  ----------
  Goal: Turn every light OFF.
  How: Tapping a light flips it AND the lights directly above, below, left and right of it.
  Stars: Every puzzle can be solved in "par" taps. Finish in par for ⭐⭐⭐.
  Stuck?: Tap ↺ reset (or press R) to start the level over.
  Tip: Try clearing the top row first, then use the row below to fix the row above.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// LIGHTS OUT: tapping a light flips it AND the lights next to it (up, down, left, right)
// turn EVERY light off · solve it in "par" taps or fewer for ⭐⭐⭐ · press R to reset
let level = 1;
let on = [];
let start = [];
let moves = 0;
let par = 0;
let stars = 0;
let totalStars = 0;
let glow = -1;
let glowT = 0;
let state = "play";
let wait = 0;

function flip(i) {
  let c = i % 5;
  let r = Math.floor(i / 5);
  on[i] = !on[i];
  if (c > 0) { on[i - 1] = !on[i - 1]; }
  if (c < 4) { on[i + 1] = !on[i + 1]; }
  if (r > 0) { on[i - 5] = !on[i - 5]; }
  if (r < 4) { on[i + 5] = !on[i + 5]; }
}

function anyOn() {
  for (const x of on) {
    if (x) { return true; }
  }
  return false;
}

// start from all-off and secretly tap a few lights, so it can be solved
function build() {
  par = 1 + level;
  if (par > 12) { par = 12; }
  let ok = false;
  while (!ok) {
    on = [];
    for (let i = 0; i <= 24; i++) {
      on.push(false);
    }
    let picks = [];
    while (picks.length < par) {
      let k = rng(0, 24);
      let fresh = true;
      for (const p of picks) {
        if (eq(p, k)) { fresh = false; }
      }
      if (fresh) { picks.push(k); }
    }
    for (const k of picks) {
      flip(k);
    }
    ok = anyOn();
  }
  start = [];
  for (const x of on) {
    start.push(x);
  }
  moves = 0;
  state = "play";
}
build();

function resetLevel() {
  on = [];
  for (const x of start) {
    on.push(x);
  }
  moves = 0;
}

gameloop(function () {
  let ts = taps();
  wait -= 1;
  glowT -= 1;
  if (state === "play") {
    if (justpressed("r")) { resetLevel(); }
    for (const t of ts) {
      if (t[1] < 30 && t[0] > 320) {
        resetLevel();
      } else {
        let c = Math.floor((t[0] - 72) / 52);
        let r = Math.floor((t[1] - 36) / 52);
        if (c >= 0 && c <= 4 && r >= 0 && r <= 4) {
          flip(r * 5 + c);
          moves += 1;
          glow = r * 5 + c;
          glowT = 10;
        }
      }
    }
    if (!anyOn()) {
      stars = 1;
      if (moves <= par * 2) { stars = 2; }
      if (moves <= par) { stars = 3; }
      totalStars += stars;
      state = "win";
      wait = 40;
    }
  } else if (state === "win" && wait <= 0 && (ts.length > 0 || justpressed("space"))) {
    level += 1;
    build();
  }

  wipe("#120b20");
  for (let i = 0; i <= 24; i++) {
    let x = 72 + i % 5 * 52;
    let y = 36 + Math.floor(i / 5) * 52;
    if (on[i]) {
      box(x - 2, y - 2, 52, 52, "rgba(255, 216, 77, 0.25)");
      box(x, y, 48, 48, "#ffd84d");
    } else {
      box(x, y, 48, 48, "#2a1f45");
    }
    if (eq(i, glow) && glowT > 0) { box(x + 18, y + 18, 12, 12, "white"); }
  }
  write("level " + level, 8, 8, "white", 14);
  sprite("taps " + moves + " · par " + par, 200, 16, 14, "#ffb469");
  box(326, 4, 66, 22, "#372d55");
  sprite("↺ reset", 359, 15, 12, "white");
  write("⭐ " + totalStars, 8, 28, "#ffd84d", 12);

  if (state === "win") {
    box(0, 118, 400, 64, "#130d20");
    center("lights out! " + "⭐".repeat(Math.max(0, stars)), 126, "white", 24);
    center(moves + " taps (par " + par + ") · tap for level " + (level + 1), 160, "#a79cc2", 14);
  }
});
