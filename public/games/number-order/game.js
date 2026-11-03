/*
  Number Order
  ------------
  Goal: Remember where each number is, then tap 1, 2, 3... in order.
  Twist: The moment you tap 1, all the other numbers turn into blank squares.
  Levels: Level 1 has 3 numbers. Every level adds one more.
  Lose: A wrong tap costs a ❤️ and shows you the answers. You have 3 hearts.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// NUMBER ORDER: look at where the numbers are, then tap 1
// after that the numbers HIDE, so tap the rest in order from memory!
let level = 1;
let lives = 3;
let best = 0;
let spots = [];
let nextNum = 1;
let hidden = false;
let state = "play";
let timer = 0;
let wrong = -1;

// a spot is [cell, number]. The board is 8 x 5 cells
function newRound() {
  spots = [];
  let used = [];
  for (let i = 0; i <= 39; i++) {
    used.push(false);
  }
  for (let n = 1; n <= level + 2; n++) {
    let k = rng(0, 39);
    while (used[k]) {
      k = rng(0, 39);
    }
    used[k] = true;
    spots.push([k, n]);
  }
  nextNum = 1;
  hidden = false;
  wrong = -1;
  state = "play";
}
newRound();

gameloop(function () {
  let ts = taps();
  timer -= 1;

  if (state === "play") {
    for (const t of ts) {
      let c = Math.floor((t[0] - 16) / 46);
      let r = Math.floor((t[1] - 44) / 46);
      if (state === "play" && c >= 0 && c < 8 && r >= 0 && r < 5) {
        let cell = r * 8 + c;
        for (const s of spots) {
          if (eq(s[0], cell) && state === "play") {
            if (eq(s[1], nextNum)) {
              s[0] = -1;
              nextNum += 1;
              hidden = true;
              if (nextNum > spots.length) {
                state = "good";
                timer = 45;
              }
            } else {
              wrong = cell;
              lives -= 1;
              state = "bad";
              timer = 90;
            }
          }
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
  for (let i = 0; i <= 39; i++) {
    box(16 + i % 8 * 46, 44 + Math.floor(i / 8) * 46, 40, 40, "#241b3d");
  }
  for (const s of spots) {
    if (s[0] >= 0) {
      let x = 16 + s[0] % 8 * 46;
      let y = 44 + Math.floor(s[0] / 8) * 46;
      if (!hidden || state === "bad" || state === "over") {
        let c = "#7b3fd6";
        if (eq(s[0], wrong)) { c = "#ff5aa8"; }
        box(x, y, 40, 40, c);
        sprite(s[1], x + 20, y + 21, 20, "white");
      } else {
        box(x, y, 40, 40, "#efe9fb");
      }
    }
  }

  write("level " + level, 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);
  if (lives > 0) { sprite("❤️".repeat(Math.max(0, lives)), 392 - lives * 9, 16, 16); }
  let say = "memorize, then tap 1 · " + spots.length + " numbers";
  if (hidden) { say = "next: " + nextNum; }
  if (state === "good") { say = "perfect ✅"; }
  if (state === "bad") { say = "wrong one ❌ the answers are showing"; }
  sprite(say, 200, 24, 14, "#ffb469");

  if (state === "over") {
    box(0, 118, 400, 64, "#130d20");
    center("GG 🧠 you remembered " + (level + 1) + " numbers", 126, "white", 22);
    center("tap to start again", 160, "#a79cc2", 14);
  }
});
