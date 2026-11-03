/*
  Pattern
  -------
  Goal: Some squares light up blue. Remember them, then tap the exact same squares.
  Levels: Every level adds one more square. The grid grows from 3×3 up to 6×6.
  Lose: Tapping a wrong square costs a ❤️ and gives you a new pattern. You have 3 hearts.
  Tip: Look for shapes, like an L or a line, instead of single squares.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// PATTERN: some squares light up. Remember them, then tap the same squares!
// each level adds a square, and the grid grows every 3 levels
let level = 1;
let lives = 3;
let best = 0;
let g = 3;
let lit = [];
let got = [];
let need = 0;
let found = 0;
let state = "show";
let timer = 0;
let cs = 0;
let x0 = 0;
let wrongCell = -1;

function newRound() {
  g = 3 + Math.floor((level - 1) / 3);
  if (g > 6) { g = 6; }
  need = 2 + level;
  if (need > g * g - 3) { need = g * g - 3; }
  lit = [];
  got = [];
  for (let i = 0; i <= g * g - 1; i++) {
    lit.push(false);
    got.push(false);
  }
  // light up random squares
  let placed = 0;
  while (placed < need) {
    let k = rng(0, g * g - 1);
    if (!lit[k]) {
      lit[k] = true;
      placed += 1;
    }
  }
  found = 0;
  wrongCell = -1;
  cs = Math.floor((240 - (g - 1) * 6) / g);
  x0 = (400 - g * cs - (g - 1) * 6) / 2;
  // more squares = more time to look
  timer = 60 + need * 12;
  state = "show";
}
newRound();

gameloop(function () {
  let ts = taps();
  timer -= 1;

  if (state === "show" && timer <= 0) {
    state = "play";
  } else if (state === "play") {
    for (const t of ts) {
      let c = Math.floor((t[0] - x0) / (cs + 6));
      let r = Math.floor((t[1] - 44) / (cs + 6));
      if (state === "play" && c >= 0 && c < g && r >= 0 && r < g) {
        let i = r * g + c;
        if (lit[i] && !got[i]) {
          got[i] = true;
          found += 1;
          if (eq(found, need)) {
            state = "good";
            timer = 50;
          }
        } else if (!lit[i]) {
          wrongCell = i;
          lives -= 1;
          state = "bad";
          timer = 80;
        }
      }
    }
  } else if (state === "good" && timer <= 0) {
    if (level > best) { best = level; }
    level += 1;
    newRound();
  } else if (state === "bad" && timer <= 0) {
    if (lives <= 0) {
      state = "over";
    } else {
      newRound();
    }
  } else if (state === "over" && timer < -30 && ts.length > 0) {
    level = 1;
    lives = 3;
    newRound();
  }

  wipe("#1d1631");
  for (let i = 0; i <= g * g - 1; i++) {
    let x = x0 + i % g * (cs + 6);
    let y = 44 + Math.floor(i / g) * (cs + 6);
    let c = "#372d55";
    if (state === "show" && lit[i]) { c = "#7fd3ff"; }
    if (got[i]) { c = "#5fd69b"; }
    if ((state === "bad" || state === "over") && lit[i] && !got[i]) { c = "#2f5d7a"; }
    if (eq(i, wrongCell)) { c = "#ff5aa8"; }
    box(x, y, cs, cs, c);
  }

  write("level " + level, 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);
  if (lives > 0) { sprite("❤️".repeat(Math.max(0, lives)), 392 - lives * 9, 16, 16); }
  let say = "";
  if (state === "show") { say = "remember the " + need + " squares 👀"; }
  if (state === "play") { say = "tap them! " + found + " / " + need; }
  if (state === "good") { say = "perfect ✅"; }
  if (state === "bad") { say = "wrong square ❌ dark blue = the ones you missed"; }
  sprite(say, 200, 24, 14, "#ffb469");

  if (state === "over") {
    box(0, 118, 400, 64, "#130d20");
    center("GG 🧠 you reached level " + level, 126, "white", 24);
    center("tap to start again", 160, "#a79cc2", 14);
  }
});
