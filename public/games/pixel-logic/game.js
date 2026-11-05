/*
  Pixel Logic
  -----------
  Goal: Find the hidden picture by filling in the right squares.
  Clues: The numbers next to each row and above each column are the runs of filled squares
    in that line, in order. "3 1" means 3 filled in a row, a gap, then 1 more.
  Controls: Tap a square to fill it. Switch to ❌ mode to mark squares you know are empty.
    Keyboard: arrows to move, space to fill, X to mark.
  Levels: Each solved picture makes the next one bigger, from 5 × 5 up to 8 × 8.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// PIXEL LOGIC · use the number clues to fill in the hidden picture
let GX = 180;
let GY = 86;
let SIZE = 180;
let n = 5;
let cell = 36;
let answer = [];
let marks = [];
let rowClues = [];
let colClues = [];
let cursor = 0;
let mode = "fill";
let state = "play";
let solved = 0;
let started = 0;
let time = 0;
let wait = 0;

// the runs of filled squares in a list of 0s and 1s: [1,1,0,1] gives [2, 1]
function runs(list) {
  let out = [];
  let k = 0;
  for (const v of list) {
    if (v === 1) {
      k += 1;
    } else if (k > 0) {
      out.push(k);
      k = 0;
    }
  }
  if (k > 0) { out.push(k); }
  return out;
}

function rowOf(grid, r) {
  let out = [];
  for (let c = 0; c < n; c++) { out.push(grid[r * n + c] === 1 ? 1 : 0); }
  return out;
}

function colOf(grid, c) {
  let out = [];
  for (let r = 0; r < n; r++) { out.push(grid[r * n + c] === 1 ? 1 : 0); }
  return out;
}

function newPuzzle() {
  n = Math.min(8, 5 + Math.floor(solved / 2));
  cell = SIZE / n;
  answer = [];
  marks = [];
  for (let i = 0; i < n * n; i++) {
    answer.push(rng(1, 100) <= 58 ? 1 : 0);
    marks.push(0);
  }
  rowClues = [];
  colClues = [];
  for (let i = 0; i < n; i++) {
    rowClues.push(runs(rowOf(answer, i)));
    colClues.push(runs(colOf(answer, i)));
  }
  cursor = 0;
  state = "play";
  started = clock();
  wait = 0;
}
newPuzzle();

// solved when every row and column matches its clue (any picture that fits counts)
function check() {
  for (let i = 0; i < n; i++) {
    if (!eq(runs(rowOf(marks, i)), rowClues[i])) { return false; }
    if (!eq(runs(colOf(marks, i)), colClues[i])) { return false; }
  }
  return true;
}

// marks: 0 empty, 1 filled, 2 crossed out
function act(i, how) {
  if (how === "fill") {
    if (marks[i] === 1) { marks[i] = 0; } else { marks[i] = 1; }
  } else if (marks[i] === 2) {
    marks[i] = 0;
  } else {
    marks[i] = 2;
  }
  if (check()) {
    state = "won";
    solved += 1;
    time = Math.round(clock() - started);
  }
}

gameloop(function () {
  if (state === "play") {
    if (justpressed("left") && cursor % n > 0) { cursor -= 1; }
    if (justpressed("right") && cursor % n < n - 1) { cursor += 1; }
    if (justpressed("up") && cursor >= n) { cursor -= n; }
    if (justpressed("down") && cursor < n * (n - 1)) { cursor += n; }
    if (justpressed("space")) { act(cursor, "fill"); }
    if (justpressed("x")) { act(cursor, "mark"); }
    if (tapped()) {
      let tx = tapx();
      let ty = tapy();
      let c = Math.floor((tx - GX) / cell);
      let r = Math.floor((ty - GY) / cell);
      if (c >= 0 && c < n && r >= 0 && r < n) {
        cursor = r * n + c;
        act(cursor, mode);
      }
      if (tx >= 12 && tx < 108 && ty >= 76 && ty < 108) {
        if (mode === "fill") { mode = "mark"; } else { mode = "fill"; }
      }
    }
  } else {
    wait += 1;
    if (wait > 40 && (tapped() || justpressed("space"))) { newPuzzle(); }
  }

  wipe("#1d1631");
  write("solved " + solved, 12, 10, "#ffb469", 14);
  write(n + " × " + n, 12, 30, "#a79cc2", 12);
  let secs = state === "play" ? Math.floor(clock() - started) : time;
  write("⏱ " + Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0"), 12, 48, "#a79cc2", 12);

  // clues (green when that line is right)
  let fs = Math.min(14, cell * 0.42);
  for (let i = 0; i < n; i++) {
    let rowOk = eq(runs(rowOf(marks, i)), rowClues[i]);
    let colOk = eq(runs(colOf(marks, i)), colClues[i]);
    let rc = rowClues[i].length === 0 ? [0] : rowClues[i];
    let cc = colClues[i].length === 0 ? [0] : colClues[i];
    for (let k = 0; k < rc.length; k++) {
      sprite(rc[rc.length - 1 - k], GX - 10 - k * 15, GY + i * cell + cell / 2, fs, rowOk ? "#5ee6a8" : "white");
    }
    for (let k = 0; k < cc.length; k++) {
      sprite(cc[cc.length - 1 - k], GX + i * cell + cell / 2, GY - 10 - k * 15, fs, colOk ? "#5ee6a8" : "white");
    }
  }

  // grid
  box(GX - 2, GY - 2, SIZE + 4, SIZE + 4, "#6a5a96");
  for (let i = 0; i < n * n; i++) {
    let x = GX + (i % n) * cell;
    let y = GY + Math.floor(i / n) * cell;
    let c = "#2a2140";
    if (marks[i] === 1) { c = state === "won" ? "#ff5aa8" : "#f1ecfb"; }
    box(x + 1, y + 1, cell - 2, cell - 2, c);
    if (marks[i] === 2) { sprite("✕", x + cell / 2, y + cell / 2, cell * 0.5, "#7a6aa6"); }
  }
  // thicker lines every 5 squares make big boards easier to read
  if (n > 5) {
    line(GX + 5 * cell, GY, GX + 5 * cell, GY + SIZE, "#6a5a96", 2);
    line(GX, GY + 5 * cell, GX + SIZE, GY + 5 * cell, "#6a5a96", 2);
  }
  if (state === "play") {
    let x = GX + (cursor % n) * cell;
    let y = GY + Math.floor(cursor / n) * cell;
    box(x, y, cell, 2, "#ffb469");
    box(x, y + cell - 2, cell, 2, "#ffb469");
    box(x, y, 2, cell, "#ffb469");
    box(x + cell - 2, y, 2, cell, "#ffb469");
  }

  // mode button
  box(12, 76, 96, 32, mode === "fill" ? "#f1ecfb" : "#372d55");
  if (mode === "fill") {
    sprite("⬛ fill", 60, 93, 13, "#140d1f");
  } else {
    sprite("❌ mark", 60, 93, 13, "white");
  }
  sprite("tap to switch", 60, 120, 10, "#a79cc2");

  if (state === "won") {
    box(0, 120, 400, 60, "rgba(19, 13, 32, 0.9)");
    center("picture found in " + time + "s 🖼️", 128, "#5ee6a8", 20);
    let nextN = Math.min(8, 5 + Math.floor(solved / 2));
    let sub = "tap or press space for the next one";
    if (nextN > n) { sub = "next one is bigger: " + nextN + " × " + nextN + " · tap to go"; }
    center(sub, 158, "#a79cc2", 12);
  }
});
