/*
  Mines
  -----
  Goal: Open every square that doesn't have a bomb. There are 15 bombs.
  Open: Tap or click a square. Your first tap is always safe.
  Flag: Hold a square to plant a 🚩, or turn on flag mode (top right, or press F).
  Numbers: A number tells you how many bombs touch that square, including diagonals.
  Lose: Open a bomb. Win by opening all the safe squares.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// MINES: open every safe square without hitting a 💣
// tap to open · hold (or turn on flag mode) to plant a 🚩
// numbers tell you how many bombs touch that square
let C = 12;
let R = 9;
let MINES = 15;
let mine = [];
let shown = [];
let flag = [];
let nums = [];
for (let i = 0; i <= C * R - 1; i++) {
  mine.push(false);
  shown.push(false);
  flag.push(false);
  nums.push(0);
}
let numColors = ["", "#2450f0", "#13804f", "#e0177a", "#7b3fd6", "#c25a00", "#0a7f86", "#1d1631", "#655a7d"];
let placed = false;
let state = "play";
let opened = 0;
let holdCell = -1;
let holdTime = 0;
let flagMode = false;

function cellAt(x, y) {
  let c = Math.floor((x - 38) / 27);
  let r = Math.floor((y - 26) / 27);
  if (c < 0 || c >= C || r < 0 || r >= R) { return -1; }
  return r * C + c;
}

function neighbors(i) {
  let out = [];
  let c = i % C;
  let r = Math.floor(i / C);
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      let nc = c + dc;
      let nr = r + dr;
      if ((dr !== 0 || dc !== 0) && nc >= 0 && nc < C && nr >= 0 && nr < R) {
        out.push(nr * C + nc);
      }
    }
  }
  return out;
}

// bombs are placed after your first tap, so it's always safe
function placeMines(safe) {
  let banned = neighbors(safe);
  banned.push(safe);
  let left = MINES;
  while (left > 0) {
    let k = rng(0, C * R - 1);
    let ok = !mine[k];
    for (const b of banned) {
      if (eq(b, k)) { ok = false; }
    }
    if (ok) {
      mine[k] = true;
      left -= 1;
    }
  }
  for (let i = 0; i <= C * R - 1; i++) {
    for (const j of neighbors(i)) {
      if (mine[j]) { nums[i] += 1; }
    }
  }
  placed = true;
}

function reveal(i) {
  if (!placed) { placeMines(i); }
  if (flag[i] || shown[i]) { return; }
  if (mine[i]) {
    state = "lost";
    return;
  }
  // open it, and keep opening around empty squares
  let todo = [i];
  while (todo.length > 0) {
    let j = todo.pop();
    if (!shown[j] && !flag[j]) {
      shown[j] = true;
      opened += 1;
      if (nums[j] === 0) {
        for (const k of neighbors(j)) {
          if (!shown[k]) { todo.push(k); }
        }
      }
    }
  }
  if (eq(opened, C * R - MINES)) { state = "won"; }
}

gameloop(function () {
  if (justpressed("f")) { flagMode = !flagMode; }

  if (state === "play") {
    for (const t of taps()) {
      if (t[1] < 24 && t[0] > 290) {
        flagMode = !flagMode;
      } else {
        holdCell = cellAt(t[0], t[1]);
        holdTime = 0;
      }
    }
    if (holding() && holdCell >= 0) {
      holdTime += 1;
      if (holdTime === 20 && !shown[holdCell]) {
        flag[holdCell] = !flag[holdCell];
      }
    }
    if (!holding() && holdCell >= 0) {
      if (holdTime < 20) {
        if (flagMode && !shown[holdCell]) {
          flag[holdCell] = !flag[holdCell];
        } else if (!flagMode) {
          reveal(holdCell);
        }
      }
      holdCell = -1;
    }
  }

  wipe("#1d1631");
  let flags = 0;
  for (let i = 0; i <= C * R - 1; i++) {
    let x = 38 + i % C * 27;
    let y = 26 + Math.floor(i / C) * 27;
    if (flag[i]) { flags += 1; }
    if (shown[i]) {
      box(x, y, 26, 26, "#efe9fb");
      if (nums[i] > 0) { sprite(nums[i], x + 13, y + 14, 15, numColors[nums[i]]); }
    } else {
      let c = "#7b3fd6";
      if (eq(i, holdCell)) { c = "#9a63f0"; }
      box(x, y, 26, 26, c);
      if (flag[i]) { sprite("🚩", x + 13, y + 13, 16); }
    }
    if (state === "lost" && mine[i]) { sprite("💣", x + 13, y + 13, 16); }
  }
  write("💣 " + (MINES - flags), 38, 5, "white", 15);
  let btn = "#372d55";
  if (flagMode) { btn = "#ff5aa8"; }
  box(296, 3, 84, 20, btn);
  sprite("🚩 flag mode", 338, 13, 11, "white");

  if (state !== "play") {
    let msg = "💥 boom. you hit a bomb";
    if (state === "won") { msg = "you ate 🏆 every safe square"; }
    // result bar at the bottom, so the whole board stays visible
    box(0, 271, 400, 29, "rgba(19, 13, 32, 0.95)");
    center(msg + " · press Restart for a new board", 278, "white", 14);
    gg();
  }
});
