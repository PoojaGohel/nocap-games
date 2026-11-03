/*
  Tic Tac Toe · 2 players
  -----------------------
  Goal: Get 3 of your marks in a row: across, down, or diagonal.
  Turns: PINK is ❌, BLUE is ⭕. Pass the device after each move.
  Controls: Tap a square, or move with the arrow keys and press space.
  Fair play: The starting player swaps every round.
  Next: Tap after a game to play again. Wins are counted at the top.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// TIC TAC TOE · 2 players on one device · PINK ❌ vs BLUE ⭕
let lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
let names = { X: "PINK ❌", O: "BLUE ⭕" };
let colors = { X: "#ff5aa8", O: "#7fd3ff" };
let wins = { X: 0, O: 0, draw: 0 };
let board = [];
let turn = "X";
let starter = "O";
let winner = "";
let winLine = [];
let over = 0;
let cursor = 4;

// a fresh board, and the other player starts this time
function newRound() {
  board = ["", "", "", "", "", "", "", "", ""];
  winner = "";
  winLine = [];
  over = 0;
  cursor = 4;
  if (starter === "X") { starter = "O"; } else { starter = "X"; }
  turn = starter;
}
newRound();

// who won? "X", "O", "draw", or "" if still playing. Also remembers the winning line
function check() {
  for (const l of lines) {
    if (board[l[0]] !== "" && eq(board[l[0]], board[l[1]]) && eq(board[l[1]], board[l[2]])) {
      winLine = l;
      return board[l[0]];
    }
  }
  for (const cell of board) {
    if (cell === "") { return ""; }
  }
  return "draw";
}

function mark(i) {
  if (board[i] !== "") { return; }
  board[i] = turn;
  winner = check();
  if (winner !== "") {
    wins[winner] += 1;
  } else if (turn === "X") {
    turn = "O";
  } else {
    turn = "X";
  }
}

gameloop(function () {
  if (winner === "") {
    if (justpressed("left") && cursor % 3 > 0) { cursor -= 1; }
    if (justpressed("right") && cursor % 3 < 2) { cursor += 1; }
    if (justpressed("up") && cursor > 2) { cursor -= 3; }
    if (justpressed("down") && cursor < 6) { cursor += 3; }
    if (justpressed("space")) { mark(cursor); }
    if (tapped()) {
      let col = Math.floor((tapx() - 80) / 80);
      let row = Math.floor((tapy() - 6) / 80);
      if (col >= 0 && col <= 2 && row >= 0 && row <= 2) {
        cursor = row * 3 + col;
        mark(cursor);
      }
    }
  } else {
    // wait a moment so both players can see how it ended
    over += 1;
    if (over > 45 && (tapped() || justpressed("space"))) { newRound(); }
  }

  wipe("#1d1631");
  write("PINK " + wins.X, 8, 8, colors.X, 14);
  write("BLUE " + wins.O, 335, 8, colors.O, 14);
  write("draws " + wins.draw, 8, 28, "#a79cc2", 11);

  for (let i = 1; i <= 2; i++) {
    box(80 + i * 80 - 2, 6, 4, 240, "#7b3fd6");
    box(80, 6 + i * 80 - 2, 240, 4, "#7b3fd6");
  }
  // keyboard cursor
  if (winner === "") {
    box(80 + cursor % 3 * 80 + 4, 6 + Math.floor(cursor / 3) * 80 + 4, 72, 72, "rgba(255, 255, 255, 0.07)");
  }
  // glow behind the winning line
  for (const k of winLine) {
    box(80 + k % 3 * 80 + 4, 6 + Math.floor(k / 3) * 80 + 4, 72, 72, "rgba(255, 216, 77, 0.4)");
  }
  for (let i = 0; i <= 8; i++) {
    let cx = 80 + i % 3 * 80 + 40;
    let cy = 6 + Math.floor(i / 3) * 80 + 40;
    if (board[i] === "X") { sprite("❌", cx, cy, 44); }
    if (board[i] === "O") { sprite("⭕", cx, cy, 44); }
  }

  if (winner === "") {
    center(names[turn] + "'s turn", 262, colors[turn], 18);
    center("tap a square, or use the arrows and space", 284, "#a79cc2", 12);
  } else {
    let msg = "draw. nobody got 3 🤝";
    if (winner !== "draw") { msg = names[winner] + " wins 🏆"; }
    let c = "white";
    if (winner !== "draw") { c = colors[winner]; }
    // result bar at the bottom, so the board stays visible
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.9)");
    center(msg, 257, c, 19);
    center("tap or press space for the next round", 280, "#a79cc2", 12);
  }
});
