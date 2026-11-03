/*
  Drop Merge
  ----------
  Goal: Drop number tiles and merge them into bigger and bigger numbers.
  Controls: Tap a column to drop. Or aim with ← → and drop with space or ↓.
  Merge: When a tile touches the same number (left, right, above or below) they merge into double. Three 8s together = 32!
  Chains: After a merge, tiles fall and can merge again. Chains are worth big points.
  Lose: A full column only takes a tile that matches its top. When no column can take the next tile, it is game over. Check NEXT to plan ahead.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// DROP MERGE: drop number tiles into the columns
// same numbers touching MERGE into double, and merges can chain! (like 2048 + Tetris)
// tap a column, or ← → to aim and space / ↓ to drop
let C = 5;
let R = 6;
let CELL = 40;
let X0 = 100;
let Y0 = 30;
let grid = [];
let cur = 2;
let upcoming = 2;
let aim = 2;
let score = 0;
let best = 0;
let biggest = 2;
let popup = "";
let popT = 0;
let flash = -1;
let flashT = 0;
let state = "play";
let colors = [[2, "#efe9fb"], [4, "#e3d5ff"], [8, "#ffb469"], [16, "#ff9a4d"], [32, "#ff6f61"], [64, "#ff5aa8"], [128, "#c9a4ff"], [256, "#a77bff"], [512, "#7fd3ff"], [1024, "#5fd69b"], [2048, "#ffd84d"]];

function colorOf(v) {
  for (const p of colors) {
    if (eq(p[0], v)) { return p[1]; }
  }
  return "#13804f";
}

// small tiles at first, bigger ones once you have big numbers
function randTile() {
  let opts = [2, 4, 8];
  let v = 16;
  while (v * 8 <= biggest && opts.length < 6) {
    opts.push(v);
    v = v * 2;
  }
  return opts[rng(0, opts.length - 1)];
}

function reset() {
  grid = [];
  for (let i = 0; i <= C * R - 1; i++) {
    grid.push(0);
  }
  score = 0;
  biggest = 2;
  cur = randTile();
  upcoming = randTile();
  state = "play";
}
reset();

function neighbors(i) {
  let out = [];
  let c = i % C;
  let r = Math.floor(i / C);
  if (c > 0) { out.push(i - 1); }
  if (c < C - 1) { out.push(i + 1); }
  if (r < R - 1) { out.push(i + C); }
  if (r > 0) { out.push(i - C); }
  return out;
}

// let tiles fall down; returns where tile a ended up
function gravity(a) {
  let g = [];
  for (let i = 0; i <= C * R - 1; i++) {
    g.push(0);
  }
  let na = a;
  for (let c = 0; c <= C - 1; c++) {
    let w = R - 1;
    for (let r = R - 1; r >= 0; r--) {
      let i = r * C + c;
      if (grid[i] !== 0) {
        g[w * C + c] = grid[i];
        if (eq(i, a)) { na = w * C + c; }
        w -= 1;
      }
    }
  }
  grid = g;
  return na;
}

// any two touching tiles with the same number? (-1 if none)
function findPair() {
  for (let i = C * R - 1; i >= 0; i--) {
    if (grid[i] !== 0) {
      for (const n of neighbors(i)) {
        if (eq(grid[n], grid[i])) { return i; }
      }
    }
  }
  return -1;
}

// keep merging until nothing touches its twin
function settle(a) {
  let chain = 0;
  let going = true;
  while (going) {
    going = false;
    let v = grid[a];
    let same = [];
    for (const n of neighbors(a)) {
      if (eq(grid[n], v)) { same.push(n); }
    }
    if (same.length > 0) {
      for (const n of same) {
        grid[n] = 0;
        v = v * 2;
      }
      grid[a] = v;
      score += v;
      if (v > biggest) { biggest = v; }
      chain += 1;
      a = gravity(a);
      going = true;
    } else {
      let other = findPair();
      if (other >= 0) {
        a = other;
        going = true;
      }
    }
  }
  flash = a;
  flashT = 12;
  if (chain >= 2) {
    popup = "chain x" + chain + " 🔥";
    popT = 50;
  }
}

function drop(c) {
  let r = -1;
  for (let rr = R - 1; rr >= 0; rr--) {
    if (r < 0 && grid[rr * C + c] === 0) { r = rr; }
  }
  if (r < 0) {
    // a full column only takes a tile that matches the top
    if (!eq(grid[c], cur)) {
      popup = "that column is full";
      popT = 40;
      return;
    }
    grid[c] = cur * 2;
    score += cur * 2;
    if (cur * 2 > biggest) { biggest = cur * 2; }
    settle(gravity(c));
  } else {
    grid[r * C + c] = cur;
    settle(r * C + c);
  }
  cur = upcoming;
  upcoming = randTile();
  // game over if no column can take the next tile
  let canGo = false;
  for (let k = 0; k <= C - 1; k++) {
    if (grid[k] === 0 || eq(grid[k], cur)) { canGo = true; }
  }
  if (!canGo) {
    state = "over";
    if (score > best) { best = score; }
  }
}

gameloop(function () {
  popT -= 1;
  flashT -= 1;
  let ts = taps();
  if (state === "over") {
    if (ts.length > 0 || justpressed("space")) { reset(); }
  } else {
    if (justpressed("left") && aim > 0) { aim -= 1; }
    if (justpressed("right") && aim < C - 1) { aim += 1; }
    if (justpressed("space") || justpressed("down")) { drop(aim); }
    for (const t of ts) {
      let c = Math.floor((t[0] - X0) / CELL);
      if (c >= 0 && c < C) {
        aim = c;
        drop(c);
      }
    }
  }

  wipe("#1d1631");
  box(X0 - 4, Y0 - 4, C * CELL + 8, R * CELL + 8, "#2a2140");
  box(X0 + aim * CELL, Y0, CELL, R * CELL, "#3b2a8a");
  for (let i = 0; i <= C * R - 1; i++) {
    let x = X0 + i % C * CELL;
    let y = Y0 + Math.floor(i / C) * CELL;
    let v = grid[i];
    if (v === 0) {
      box(x + 2, y + 2, CELL - 4, CELL - 4, "rgba(255, 255, 255, 0.04)");
    } else {
      if (eq(i, flash) && flashT > 0) { box(x, y, CELL, CELL, "white"); }
      box(x + 2, y + 2, CELL - 4, CELL - 4, colorOf(v));
      let ink = "white";
      if (v <= 4) { ink = "#1d1631"; }
      let size = 18;
      if (v >= 128) { size = 14; }
      if (v >= 1024) { size = 11; }
      sprite(v, x + CELL / 2, y + CELL / 2 + 1, size, ink);
    }
  }

  // left: the tile you are dropping, and the next one
  write("drop", 30, 40, "#a79cc2", 12);
  box(22, 58, 56, 56, colorOf(cur));
  let ink = "white";
  if (cur <= 4) { ink = "#1d1631"; }
  sprite(cur, 50, 87, 22, ink);
  write("next", 34, 132, "#a79cc2", 12);
  box(32, 150, 36, 36, colorOf(upcoming));
  sprite(upcoming, 50, 169, 14, "#1d1631");
  sprite("▼", X0 + aim * CELL + CELL / 2, 18, 14, "#ffd84d");

  write("score", 318, 40, "#a79cc2", 12);
  write(score, 318, 56, "white", 20);
  write("best", 318, 92, "#a79cc2", 12);
  write(best, 318, 108, "#c9a4ff", 16);
  write("biggest", 318, 140, "#a79cc2", 12);
  write(biggest, 318, 156, "#ffb469", 20);
  if (popT > 0) { sprite(popup, X0 + C * CELL / 2, 140, 18, "#ffd84d"); }

  if (state === "over") {
    box(0, 274, 400, 26, "rgba(19, 13, 32, 0.95)");
    center("no room left 💀 score " + score + " · tap to play again", 280, "white", 14);
  }
});
