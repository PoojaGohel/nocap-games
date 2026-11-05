/*
  Flood
  -----
  Goal: Make the whole board ONE color in 25 moves or fewer.
  How: Your area starts in the top-left corner. Pick a color and your area turns that color,
    swallowing every square of that color touching it. It grows with every move.
  Controls: Tap a color button, tap any square of that color, or press 1 to 6.
  Tip: Look for the color that touches your area the most.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// FLOOD · fill the board with one color in 25 moves
let N = 14;
let CELL = 19;
let X0 = 14;
let Y0 = 17;
let LIMIT = 25;
let palette = ["#ff5aa8", "#7fd3ff", "#ffd84d", "#5ee6a8", "#b794ff", "#ff8a4c"];
let names = ["pink", "blue", "yellow", "green", "purple", "orange"];

let grid = [];
let moves = 0;
let state = "play";
let wins = 0;
let played = 0;
let wait = 0;

function reset() {
  grid = [];
  for (let i = 0; i < N * N; i++) { grid.push(rng(0, 5)); }
  moves = 0;
  state = "play";
  wait = 0;
}
reset();

// all squares connected to the top-left square with the same color
function area() {
  let color = grid[0];
  let seen = [0];
  let todo = [0];
  while (todo.length > 0) {
    let i = todo.pop();
    let x = i % N;
    let y = Math.floor(i / N);
    let next = [];
    if (x > 0) { next.push(i - 1); }
    if (x < N - 1) { next.push(i + 1); }
    if (y > 0) { next.push(i - N); }
    if (y < N - 1) { next.push(i + N); }
    for (const j of next) {
      if (grid[j] === color && !seen.includes(j)) {
        seen.push(j);
        todo.push(j);
      }
    }
  }
  return seen;
}

function pick(c) {
  if (state !== "play" || c === grid[0]) { return; }
  for (const i of area()) { grid[i] = c; }
  moves += 1;
  if (area().length === N * N) {
    state = "won";
    wins += 1;
    played += 1;
  } else if (moves >= LIMIT) {
    state = "lost";
    played += 1;
  }
}

function buttonSpot(c) {
  return [298 + (c % 2) * 48, 92 + Math.floor(c / 2) * 48];
}

gameloop(function () {
  if (state === "play") {
    for (let c = 0; c < 6; c++) {
      if (justpressed(String(c + 1))) { pick(c); }
    }
    if (tapped()) {
      let tx = tapx();
      let ty = tapy();
      let col = Math.floor((tx - X0) / CELL);
      let row = Math.floor((ty - Y0) / CELL);
      if (col >= 0 && col < N && row >= 0 && row < N) { pick(grid[row * N + col]); }
      for (let c = 0; c < 6; c++) {
        let p = buttonSpot(c);
        if (tx >= p[0] && tx < p[0] + 42 && ty >= p[1] && ty < p[1] + 42) { pick(c); }
      }
    }
  } else {
    wait += 1;
    if (wait > 40 && (tapped() || justpressed("space"))) { reset(); }
  }

  wipe("#1d1631");
  let mine = area();
  // the squares touch each other, so draw them with sharp corners
  Engine.round = 0;
  for (let i = 0; i < N * N; i++) {
    box(X0 + (i % N) * CELL, Y0 + Math.floor(i / N) * CELL, CELL, CELL, palette[grid[i]]);
  }
  // a soft glow on your area so you can see it
  for (const i of mine) {
    box(X0 + (i % N) * CELL, Y0 + Math.floor(i / N) * CELL, CELL, CELL, "rgba(255, 255, 255, 0.14)");
  }

  Engine.round = 3;

  // side panel
  write("moves", 298, 18, "#a79cc2", 12);
  let left = LIMIT - moves;
  let mc = "white";
  if (left <= 5) { mc = "#ff6b6b"; }
  write(moves + " / " + LIMIT, 298, 34, mc, 22);
  write("wins " + wins + " of " + played, 298, 64, "#a79cc2", 11);
  for (let c = 0; c < 6; c++) {
    let p = buttonSpot(c);
    box(p[0], p[1], 42, 42, palette[c]);
    if (c === grid[0]) { box(p[0] + 4, p[1] + 4, 34, 34, "rgba(19, 13, 32, 0.35)"); }
    sprite(String(c + 1), p[0] + 21, p[1] + 22, 15, "#140d1f");
  }
  sprite("you are " + names[grid[0]], 343, 252, 11, "#c9a4ff");
  sprite("tap a color", 343, 270, 11, "#a79cc2");

  if (state !== "play") {
    let text = "flooded in " + moves + " moves 🌊";
    let c = "#5ee6a8";
    if (state === "lost") {
      text = "out of moves 😵 " + (N * N - mine.length) + " squares left";
      c = "#ff6b6b";
    }
    box(0, 118, 400, 64, "rgba(19, 13, 32, 0.92)");
    center(text, 126, c, 20);
    center("tap or press space for a new board", 158, "#a79cc2", 12);
  }
});
