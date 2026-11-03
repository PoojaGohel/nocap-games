/*
  Connect 4 · 2 players
  ---------------------
  Goal: Get 4 of your pieces in a row: across, down, or diagonal.
  Turns: Pink and Blue take turns. The bottom line shows whose turn it is.
  Keys: ← → to aim, space or ↓ to drop.
  Phone: Tap the column you want.
  End: First to connect 4 wins. A full board with no winner is a draw.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// CONNECT 4 · 2 players take turns · get 4 in a row to win
// tap a column to drop your piece, or use ← → to aim and space to drop
let board = [];
let turn = 1;
let cursor = 3;
let winner = 0;
let drops = 0;
let wins = [0, 0, 0];
let colors = ["#2a1f45", "#ff5aa8", "#7fd3ff"];
let names = ["", "PINK", "BLUE"];

function reset() {
  board = [];
  for (let i = 0; i <= 41; i++) {
    board.push(0);
  }
  winner = 0;
  drops = 0;
}
reset();

// what's in column c, row r (0 if off the board)
function at(c, r) {
  if (c < 0 || c > 6 || r < 0 || r > 5) { return 0; }
  return board[r * 7 + c];
}

// count matching pieces in both directions along 4 lines
function fourInRow(c, r) {
  let p = at(c, r);
  for (const d of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    let n = 1;
    let k = 1;
    while (eq(at(c + d[0] * k, r + d[1] * k), p)) {
      n += 1;
      k += 1;
    }
    k = 1;
    while (eq(at(c - d[0] * k, r - d[1] * k), p)) {
      n += 1;
      k += 1;
    }
    if (n >= 4) { return true; }
  }
  return false;
}

function drop(c) {
  if (winner !== 0) { return false; }
  for (let r = 5; r >= 0; r--) {
    if (board[r * 7 + c] === 0) {
      board[r * 7 + c] = turn;
      drops += 1;
      if (fourInRow(c, r)) {
        winner = turn;
        wins[turn] += 1;
      } else if (drops === 42) {
        winner = 3;
      }
      turn = 3 - turn;
      return true;
    }
  }
  return false;
}

gameloop(function () {
  let ts = taps();
  if (winner === 0) {
    if (justpressed("left") && cursor > 0) { cursor -= 1; }
    if (justpressed("right") && cursor < 6) { cursor += 1; }
    if (justpressed("space") || justpressed("down")) { drop(cursor); }
    for (const t of ts) {
      let c = Math.floor((t[0] - 60) / 40);
      if (c >= 0 && c <= 6) {
        cursor = c;
        drop(c);
      }
    }
  } else if (justpressed("space") || ts.length > 0) {
    reset();
  }

  wipe("#1d1631");
  box(60, 40, 280, 240, "#3b2a8a");
  for (let r = 0; r <= 5; r++) {
    for (let c = 0; c <= 6; c++) {
      bubble(60 + c * 40 + 20, 40 + r * 40 + 20, 15, colors[board[r * 7 + c]]);
    }
  }
  write("PINK " + wins[1], 8, 8, "#ff5aa8", 14);
  write("BLUE " + wins[2], 345, 8, "#7fd3ff", 14);

  if (winner === 0) {
    bubble(60 + cursor * 40 + 20, 20, 14, colors[turn]);
    sprite(names[turn] + "'s turn", 200, 291, 14, colors[turn]);
  } else {
    let msg = "board full, it's a draw 🤝";
    if (winner < 3) { msg = names[winner] + " connects 4 🏆"; }
    box(0, 118, 400, 64, "#130d20");
    center(msg, 126, "white", 24);
    center("tap or press space to play again", 160, "#a79cc2", 14);
  }
});
