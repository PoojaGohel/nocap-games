/*
  Match 3
  -------
  Goal: Reach the target score (green bar) before your 20 moves run out.
  Swap: Tap a fruit, then tap the fruit next to it to swap them. Or press and swipe toward a neighbor.
  Match: A swap only works if it makes a line of 3 or more of the same fruit. Otherwise they swap back for free.
  Combos: Fruit falls after a match. New matches from falling fruit are combos and score double, triple and more.
  Levels: Each level has a higher target. If there are no possible moves, the board reshuffles.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// MATCH 3: swap two neighbors to line up 3 or more of the same fruit
// tap one, then tap a neighbor (or swipe it) · hit the target score before your moves run out
let kinds = ["🍓", "🍋", "🫐", "🍀", "🍊", "🍇"];
let CELL = 30;
let X0 = 80;
let Y0 = 30;
let grid = [];
let sel = -1;
let downCell = -1;
let sx = 0;
let sy = 0;
let level = 1;
let target = 500;
let moves = 20;
let score = 0;
let combo = 1;
let marks = [];
let state = "play";
let timer = 0;
let undoA = -1;
let undoB = -1;
let popup = "";
let popT = 0;

function freshGrid() {
  grid = [];
  for (let i = 0; i <= 63; i++) {
    let k = rng(0, 5);
    let ok = false;
    while (!ok) {
      k = rng(0, 5);
      ok = true;
      if (i % 8 >= 2 && eq(grid[i - 1], k) && eq(grid[i - 2], k)) { ok = false; }
      if (i >= 16 && eq(grid[i - 8], k) && eq(grid[i - 16], k)) { ok = false; }
    }
    grid.push(k);
  }
}
freshGrid();

function swapCells(a, b) {
  let t = grid[a];
  grid[a] = grid[b];
  grid[b] = t;
}

function adjacent(a, b) {
  if (Math.abs(a - b) === 8) { return true; }
  return Math.abs(a - b) === 1 && eq(Math.floor(a / 8), Math.floor(b / 8));
}

// is cell i part of a line of 3+?
function lineAt(i) {
  let k = grid[i];
  let c = i % 8;
  let r = Math.floor(i / 8);
  let n = 1;
  let x = c - 1;
  while (x >= 0 && eq(grid[r * 8 + x], k)) {
    n += 1;
    x -= 1;
  }
  x = c + 1;
  while (x < 8 && eq(grid[r * 8 + x], k)) {
    n += 1;
    x += 1;
  }
  if (n >= 3) { return true; }
  n = 1;
  let y = r - 1;
  while (y >= 0 && eq(grid[y * 8 + c], k)) {
    n += 1;
    y -= 1;
  }
  y = r + 1;
  while (y < 8 && eq(grid[y * 8 + c], k)) {
    n += 1;
    y += 1;
  }
  return n >= 3;
}

// mark every cell that is in a line of 3+
function findMarks() {
  let m = [];
  let count = 0;
  for (let i = 0; i <= 63; i++) {
    let hit = lineAt(i);
    m.push(hit);
    if (hit) { count += 1; }
  }
  marks = m;
  return count;
}

// is there ANY swap that makes a match?
function hasMove() {
  for (let i = 0; i <= 63; i++) {
    let others = [];
    if (i % 8 < 7) { others.push(i + 1); }
    if (i < 56) { others.push(i + 8); }
    for (const j of others) {
      swapCells(i, j);
      let ok = lineAt(i) || lineAt(j);
      swapCells(i, j);
      if (ok) { return true; }
    }
  }
  return false;
}

function fall() {
  for (let c = 0; c <= 7; c++) {
    let stack = [];
    for (let r = 7; r >= 0; r--) {
      if (grid[r * 8 + c] >= 0) { stack.push(grid[r * 8 + c]); }
    }
    for (let r = 7; r >= 0; r--) {
      let k = 7 - r;
      if (k < stack.length) { grid[r * 8 + c] = stack[k]; } else { grid[r * 8 + c] = rng(0, 5); }
    }
  }
}

function trySwap(a, b) {
  swapCells(a, b);
  sel = -1;
  if (lineAt(a) || lineAt(b)) {
    moves -= 1;
    combo = 1;
    state = "check";
    timer = 8;
  } else {
    // no match: swap back after a moment
    undoA = a;
    undoB = b;
    state = "undo";
    timer = 18;
  }
}

function cellAt(x, y) {
  let c = Math.floor((x - X0) / CELL);
  let r = Math.floor((y - Y0) / CELL);
  if (c < 0 || c > 7 || r < 0 || r > 7) { return -1; }
  return r * 8 + c;
}

gameloop(function () {
  popT -= 1;
  timer -= 1;

  if (state === "play") {
    if (tapped()) {
      let cell = cellAt(tapx(), tapy());
      if (cell >= 0) {
        if (sel >= 0 && adjacent(sel, cell)) {
          trySwap(sel, cell);
        } else {
          sel = cell;
          downCell = cell;
          sx = tapx();
          sy = tapy();
        }
      }
    }
    // swipe: press on a fruit and drag toward a neighbor
    if (state === "play" && downCell >= 0 && holding()) {
      let dx = tapx() - sx;
      let dy = tapy() - sy;
      if (Math.abs(dx) > 16 || Math.abs(dy) > 16) {
        let nb = -1;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0 && downCell % 8 < 7) { nb = downCell + 1; }
          if (dx < 0 && downCell % 8 > 0) { nb = downCell - 1; }
        } else {
          if (dy > 0 && downCell < 56) { nb = downCell + 8; }
          if (dy < 0 && downCell >= 8) { nb = downCell - 8; }
        }
        let from = downCell;
        downCell = -1;
        if (nb >= 0) { trySwap(from, nb); }
      }
    }
    if (!holding()) { downCell = -1; }
  } else if (state === "undo" && timer <= 0) {
    swapCells(undoA, undoB);
    state = "play";
  } else if (state === "check" && timer <= 0) {
    let n = findMarks();
    if (n > 0) {
      score += n * 10 * combo;
      if (combo >= 2) {
        popup = "combo x" + combo + " 🔥";
        popT = 40;
      }
      combo += 1;
      state = "pop";
      timer = 14;
    } else {
      // the board settled: did you win, lose, or need a reshuffle?
      state = "play";
      if (score >= target) {
        state = "won";
      } else if (moves <= 0) {
        state = "lost";
      } else if (!hasMove()) {
        freshGrid();
        popup = "no moves left · reshuffled 🔀";
        popT = 60;
      }
    }
  } else if (state === "pop" && timer <= 0) {
    for (let i = 0; i <= 63; i++) {
      if (marks[i]) { grid[i] = -1; }
    }
    marks = [];
    fall();
    state = "check";
    timer = 10;
  } else if ((state === "won" || state === "lost") && tapped()) {
    if (state === "won") {
      level += 1;
      target = target + 250 + level * 50;
    } else {
      level = 1;
      target = 500;
    }
    score = 0;
    moves = 20;
    freshGrid();
    state = "play";
  }

  wipe("#1d1631");
  for (let i = 0; i <= 63; i++) {
    let x = X0 + i % 8 * CELL;
    let y = Y0 + Math.floor(i / 8) * CELL;
    let bg = "#2a2140";
    if ((i % 8 + Math.floor(i / 8)) % 2 === 0) { bg = "#30264a"; }
    if (eq(i, sel)) { bg = "#7b3fd6"; }
    box(x, y, CELL, CELL, bg);
    if (state === "pop" && marks[i]) {
      bubble(x + CELL / 2, y + CELL / 2, 14 - timer / 2, "rgba(255, 255, 255, 0.7)");
    } else if (grid[i] >= 0) {
      sprite(kinds[grid[i]], x + CELL / 2, y + CELL / 2 + 1, 22);
    }
  }

  write("level " + level, 8, 8, "white", 14);
  box(100, 10, 200, 8, "#372d55");
  let part = score / target;
  if (part > 1) { part = 1; }
  box(100, 10, 200 * part, 8, "#5fd69b");
  sprite(score + " / " + target, 200, 24, 10, "#b6ffd4");
  write("moves " + moves, 320, 8, "#ffb469", 14);
  if (popT > 0) { sprite(popup, 200, 150, 18, "#ffd84d"); }

  if (state === "won") {
    box(0, 272, 400, 28, "rgba(19, 13, 32, 0.95)");
    center("level " + level + " cleared 🏆 tap for level " + (level + 1), 279, "white", 14);
  }
  if (state === "lost") {
    box(0, 272, 400, 28, "rgba(19, 13, 32, 0.95)");
    center("out of moves 💀 " + score + " / " + target + " · tap to start over", 279, "white", 14);
  }
});
