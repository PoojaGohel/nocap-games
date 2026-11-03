/*
  Path Recall
  -----------
  Goal: Watch the 🐸 hop from square to square, then tap the squares in the same order.
  Backwards: Every 3rd level, you must tap the path in REVERSE order, starting from the last square 🔄.
  Levels: Each level the path is one hop longer. From level 6 the grid grows to 5×5.
  Lose: A wrong tap costs a ❤️ and shows the real path with numbers. You have 3 hearts.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// PATH RECALL: watch the 🐸 hop from square to square, then tap the same path!
// every 3rd level you must tap it BACKWARDS 🔄 · 3 hearts
let level = 1;
let lives = 3;
let best = 0;
let n = 4;
let cs = 60;
let ox = 80;
let path = [];
let step = 0;
let showing = -1;
let got = 0;
let backwards = false;
let wrongCell = -1;
let state = "show";
let timer = 0;
let speed = 40;

function inPath(i) {
  for (const p of path) {
    if (eq(p, i)) { return true; }
  }
  return false;
}

// a random walk that never visits a square twice
function makePath(len0) {
  let done = false;
  while (!done) {
    path = [rng(0, n * n - 1)];
    let stuck = false;
    while (path.length < len0 && !stuck) {
      let cur = path[path.length - 1];
      let c = cur % n;
      let r = Math.floor(cur / n);
      let opts = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nc = c + dc;
          let nr = r + dr;
          if ((dr !== 0 || dc !== 0) && nc >= 0 && nc < n && nr >= 0 && nr < n) {
            if (!inPath(nr * n + nc)) { opts.push(nr * n + nc); }
          }
        }
      }
      if (opts.length === 0) { stuck = true; } else { path.push(opts[rng(0, opts.length - 1)]); }
    }
    done = eq(path.length, len0);
  }
}

function newRound() {
  n = 4;
  if (level >= 6) { n = 5; }
  cs = Math.floor(232 / n);
  ox = (400 - n * cs) / 2;
  let pathLength = 2 + level;
  if (pathLength > n * n - 2) { pathLength = n * n - 2; }
  makePath(pathLength);
  backwards = level % 3 === 0;
  speed = 42 - level * 2;
  if (speed < 22) { speed = 22; }
  step = 0;
  showing = -1;
  got = 0;
  wrongCell = -1;
  state = "show";
  timer = 40;
}
newRound();

// which square should be tapped next?
function expected() {
  if (backwards) { return path[path.length - 1 - got]; }
  return path[got];
}

gameloop(function () {
  let ts = taps();
  timer -= 1;

  if (state === "show") {
    if (timer <= 0) {
      if (step < path.length) {
        showing = path[step];
        step += 1;
        timer = speed;
      } else {
        showing = -1;
        state = "play";
      }
    }
  } else if (state === "play") {
    for (const t of ts) {
      let c = Math.floor((t[0] - ox) / cs);
      let r = Math.floor((t[1] - 44) / cs);
      if (state === "play" && c >= 0 && c < n && r >= 0 && r < n) {
        let i = r * n + c;
        if (eq(i, expected())) {
          got += 1;
          if (eq(got, path.length)) {
            state = "good";
            timer = 45;
          }
        } else {
          wrongCell = i;
          lives -= 1;
          state = "bad";
          timer = 120;
        }
      }
    }
  } else if (state === "good" && timer <= 0) {
    if (level > best) { best = level; }
    level += 1;
    newRound();
  } else if (state === "bad" && timer <= 0) {
    if (lives <= 0) { state = "over"; } else { newRound(); }
  } else if (state === "over" && ts.length > 0) {
    level = 1;
    lives = 3;
    newRound();
  }

  wipe("#1d1631");
  for (let i = 0; i <= n * n - 1; i++) {
    let x = ox + i % n * cs;
    let y = 44 + Math.floor(i / n) * cs;
    let c = "#372d55";
    if (eq(i, showing) && timer > 6) { c = "#7fd3ff"; }
    box(x + 3, y + 3, cs - 6, cs - 6, c);
  }
  // squares you already tapped turn green
  for (let k = 0; k <= path.length - 1; k++) {
    let idx = k;
    if (backwards) { idx = path.length - 1 - k; }
    let i = path[idx];
    let x = ox + i % n * cs;
    let y = 44 + Math.floor(i / n) * cs;
    if (k < got) { box(x + 3, y + 3, cs - 6, cs - 6, "#2e8a5a"); }
    // after a mistake, show the real path with numbers
    if (state === "bad" || state === "over") {
      sprite(idx + 1, x + cs / 2, y + cs / 2 + 1, cs * 0.35, "#ffd84d");
    }
  }
  if (wrongCell >= 0 && state !== "show") {
    box(ox + wrongCell % n * cs + 3, 44 + Math.floor(wrongCell / n) * cs + 3, cs - 6, cs - 6, "rgba(255, 77, 109, 0.6)");
  }
  if (showing >= 0 && timer > 6) {
    sprite("🐸", ox + showing % n * cs + cs / 2, 44 + Math.floor(showing / n) * cs + cs / 2 + 1, cs * 0.6);
  }

  write("level " + level, 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);
  if (lives > 0) { sprite("❤️".repeat(Math.max(0, lives)), 392 - lives * 9, 16, 16); }
  let say = "watch the frog 👀 " + step + " / " + path.length;
  if (state === "play" && backwards) { say = "tap it BACKWARDS 🔄 " + got + " / " + path.length; }
  if (state === "play" && !backwards) { say = "your turn! " + got + " / " + path.length; }
  if (state === "good") { say = "perfect ✅"; }
  if (state === "bad") { say = "wrong ❌ yellow numbers = the real path"; }
  if (state === "show" && backwards) { say = "BACKWARDS level 🔄 watch " + step + " / " + path.length; }
  sprite(say, 200, 24, 13, "#ffb469");

  if (state === "over") {
    box(0, 274, 400, 26, "rgba(19, 13, 32, 0.95)");
    center("GG 🧠 you reached level " + level + " · tap to play again", 280, "white", 14);
  }
});
