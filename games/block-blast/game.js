/*
  Block Blast
  -----------
  Goal: Place pieces on the 8×8 board and score as much as you can.
  Place: Drag a piece from the right onto the board. A white shadow shows where it lands. Or tap a piece, then tap the board.
  Clear: Fill a whole row or column to clear it. Clearing several at once scores way more (2 lines = 40, 3 = 90).
  Pieces: You get 3 pieces at a time. Use all 3 to get new ones. Pieces cannot be turned.
  Lose: The game ends when none of your pieces fits anywhere.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// BLOCK BLAST: drag a piece onto the board (or tap a piece, then tap the board)
// fill a whole row or column to clear it · game over when no piece fits
let shapes = [[[0, 0]], [[0, 0], [1, 0]], [[0, 0], [0, 1]], [[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]], [[0, 0], [0, 1], [1, 1]], [[1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [1, 1]], [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], [[0, 0], [1, 0], [2, 0], [1, 1]]];

let colors = ["#ff5aa8", "#7fd3ff", "#5fd69b", "#ffd84d", "#b57bff", "#ff9f1c"];
let CELL = 30;
let X0 = 12;
let Y0 = 32;
let LIFT = 30;
let grid = [];
let pieces = [];
let sel = -1;
let dragging = false;
let score = 0;
let best = 0;
let popup = "";
let popT = 0;
let cleared = [];
let clearT = 0;
let state = "play";

// a piece is [shape, color, used]
function newSet() {
  pieces = [];
  for (let k = 1; k <= 3; k++) {
    pieces.push([shapes[rng(0, shapes.length - 1)], colors[rng(0, colors.length - 1)], false]);
  }
}

function reset() {
  grid = [];
  for (let i = 0; i <= 63; i++) {
    grid.push("");
  }
  score = 0;
  sel = -1;
  dragging = false;
  newSet();
  state = "play";
}
reset();

// how wide and tall is a shape?
function sizeOf(s) {
  let w = 0;
  let h = 0;
  for (const c of s) {
    if (c[0] + 1 > w) { w = c[0] + 1; }
    if (c[1] + 1 > h) { h = c[1] + 1; }
  }
  return [w, h];
}

function fits(s, col, row) {
  for (const c of s) {
    let x = col + c[0];
    let y = row + c[1];
    if (x < 0 || x > 7 || y < 0 || y > 7) { return false; }
    if (grid[y * 8 + x] !== "") { return false; }
  }
  return true;
}

// which board square would the piece's top-left land on?
function spotFor(s, px, py) {
  let wh = sizeOf(s);
  return [Math.round((px - X0) / CELL - wh[0] / 2), Math.round((py - Y0) / CELL - wh[1] / 2)];
}

function clearLines() {
  let full = [];
  for (let r = 0; r <= 7; r++) {
    let ok = true;
    for (let c = 0; c <= 7; c++) {
      if (grid[r * 8 + c] === "") { ok = false; }
    }
    if (ok) {
      for (let c = 0; c <= 7; c++) { full.push(r * 8 + c); }
    }
  }
  let lines = full.length / 8;
  for (let c = 0; c <= 7; c++) {
    let ok = true;
    for (let r = 0; r <= 7; r++) {
      if (grid[r * 8 + c] === "") { ok = false; }
    }
    if (ok) {
      lines += 1;
      for (let r = 0; r <= 7; r++) { full.push(r * 8 + c); }
    }
  }
  if (lines > 0) {
    for (const i of full) {
      grid[i] = "";
    }
    cleared = full;
    clearT = 15;
    let pts = 10 * lines * lines;
    score += pts;
    popup = "+" + pts;
    if (lines >= 2) { popup = lines + " lines! +" + pts + " 🔥"; }
    popT = 50;
  }
}

function canPlaceAny() {
  for (const p of pieces) {
    if (!p[2]) {
      for (let row = 0; row <= 7; row++) {
        for (let col = 0; col <= 7; col++) {
          if (fits(p[0], col, row)) { return true; }
        }
      }
    }
  }
  return false;
}

function tryPlace(k, px, py) {
  let p = pieces[k];
  let spot = spotFor(p[0], px, py);
  if (!fits(p[0], spot[0], spot[1])) { return false; }
  for (const c of p[0]) {
    grid[(spot[1] + c[1]) * 8 + spot[0] + c[0]] = p[1];
  }
  score += p[0].length;
  p[2] = true;
  sel = -1;
  clearLines();
  let left = 0;
  for (const q of pieces) {
    if (!q[2]) { left += 1; }
  }
  if (left === 0) { newSet(); }
  if (!canPlaceAny()) {
    state = "over";
    if (score > best) { best = score; }
  }
  return true;
}

// which of the 3 slots on the right is at x, y?
function slotAt(x, y) {
  if (x < 262) { return -1; }
  let k = Math.floor((y - 32) / 80);
  if (k < 0 || k > 2) { return -1; }
  return k;
}

gameloop(function () {
  popT -= 1;
  clearT -= 1;
  if (state === "over") {
    if (tapped()) { reset(); }
  } else {
    if (tapped()) {
      let k = slotAt(tapx(), tapy());
      if (k >= 0 && !pieces[k][2]) {
        sel = k;
        dragging = true;
      } else if (sel >= 0 && tapx() < 262) {
        // tap-then-tap: put the piece's middle where you tapped
        tryPlace(sel, tapx(), tapy());
      }
    }
    if (dragging && !holding()) {
      dragging = false;
      if (sel >= 0 && tapx() < 262) { tryPlace(sel, tapx(), tapy() - LIFT); }
    }
  }

  wipe("#1d1631");
  box(X0 - 4, Y0 - 4, 8 * CELL + 8, 8 * CELL + 8, "#2a2140");
  for (let i = 0; i <= 63; i++) {
    let c = grid[i];
    if (c === "") { c = "#372d55"; }
    box(X0 + i % 8 * CELL + 1, Y0 + Math.floor(i / 8) * CELL + 1, CELL - 2, CELL - 2, c);
  }
  if (clearT > 0) {
    for (const i of cleared) {
      box(X0 + i % 8 * CELL + 1, Y0 + Math.floor(i / 8) * CELL + 1, CELL - 2, CELL - 2, "rgba(255, 255, 255, 0.6)");
    }
  }

  // shadow showing where a dragged piece would land
  if (dragging && sel >= 0 && tapx() < 262) {
    let p = pieces[sel];
    let spot = spotFor(p[0], tapx(), tapy() - LIFT);
    if (fits(p[0], spot[0], spot[1])) {
      for (const c of p[0]) {
        box(X0 + (spot[0] + c[0]) * CELL + 1, Y0 + (spot[1] + c[1]) * CELL + 1, CELL - 2, CELL - 2, "rgba(255, 255, 255, 0.28)");
      }
    }
  }

  // the 3 pieces on the right
  for (let k = 0; k <= 2; k++) {
    let p = pieces[k];
    if (eq(k, sel) && !dragging) { box(266, 34 + k * 80, 128, 76, "#3b2a8a"); }
    if (!p[2] && !(dragging && eq(k, sel))) {
      let wh = sizeOf(p[0]);
      for (const c of p[0]) {
        box(330 - wh[0] * 7 + c[0] * 14, 72 + k * 80 - wh[1] * 7 + c[1] * 14, 13, 13, p[1]);
      }
    }
  }
  // the piece you are dragging follows your finger (a little above it)
  if (dragging && sel >= 0) {
    let p = pieces[sel];
    let wh = sizeOf(p[0]);
    for (const c of p[0]) {
      box(tapx() - wh[0] * CELL / 2 + c[0] * CELL + 1, tapy() - LIFT - wh[1] * CELL / 2 + c[1] * CELL + 1, CELL - 2, CELL - 2, p[1]);
    }
  }

  write("score " + score, 12, 7, "white", 15);
  write("best " + best, 180, 9, "#c9a4ff", 12);
  if (popT > 0) { sprite(popup, 132, 150, 22, "#ffd84d"); }
  if (state === "over") {
    box(0, 274, 400, 26, "rgba(19, 13, 32, 0.95)");
    center("no piece fits 💀 score " + score + " · tap to play again", 280, "white", 14);
  }
});
