/*
  Tic Tac Toe
  -----------
  Goal: Get 3 ❌ in a row before the ⭕ bot does: across, down, or diagonal.
  Controls: Click or tap a square. You always go first.
  Bot: It takes a win when it can and blocks yours.
  Tip: Set up two ways to win at once. The bot can only block one.
  Next: Tap after a game to play again.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// TIC TAC TOE: tap a square. You are ❌, the bot is ⭕
let board = ["", "", "", "", "", "", "", "", ""];
let lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
let winner = "";
let wait = 0;
let winLine = [];
let over = 0;

// who won? "X", "O", "draw", or "" if still playing
function winOf(b) {
  for (const l of lines) {
    if (b[l[0]] !== "" && eq(b[l[0]], b[l[1]]) && eq(b[l[1]], b[l[2]])) {
      return b[l[0]];
    }
  }
  for (const cell of b) {
    if (cell === "") { return ""; }
  }
  return "draw";
}

// which 3 squares made the win? (for the highlight)
function findLine() {
  for (const l of lines) {
    if (board[l[0]] !== "" && eq(board[l[0]], board[l[1]]) && eq(board[l[1]], board[l[2]])) { return l; }
  }
  return [];
}

// the bot: win if it can, block you if it must, else take the middle or a random spot
function botMove() {
  for (const who of ["O", "X"]) {
    for (let i = 0; i <= 8; i++) {
      if (board[i] === "") {
        board[i] = who;
        let w = winOf(board);
        board[i] = "";
        if (eq(w, who)) { return i; }
      }
    }
  }
  if (board[4] === "") { return 4; }
  let free = [];
  for (let i = 0; i <= 8; i++) {
    if (board[i] === "") { free.push(i); }
  }
  return free[rng(0, free.length - 1)];
}

gameloop(function () {
  if (winner === "") {
    if (tapped() && wait <= 0) {
      let col = Math.floor((tapx() - 80) / 80);
      let row = Math.floor((tapy() - 6) / 80);
      if (col >= 0 && col <= 2 && row >= 0 && row <= 2) {
        let i = row * 3 + col;
        if (board[i] === "") {
          board[i] = "X";
          winner = winOf(board);
          winLine = findLine();
          wait = 30;
        }
      }
    }
    if (wait > 0) {
      wait -= 1;
      if (wait === 0 && winner === "") {
        board[botMove()] = "O";
        winner = winOf(board);
        winLine = findLine();
      }
    }
  } else {
    // wait a moment so you can see how the game ended
    over += 1;
    if (over > 90 && tapped()) {
      board = ["", "", "", "", "", "", "", "", ""];
      winner = "";
      wait = 0;
      winLine = [];
      over = 0;
    }
  }

  wipe("#1d1631");
  for (let i = 1; i <= 2; i++) {
    box(80 + i * 80 - 2, 6, 4, 240, "#7b3fd6");
    box(80, 6 + i * 80 - 2, 240, 4, "#7b3fd6");
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
  if (wait > 0 && winner === "") {
    center("bot is thinking... 🤔", 278, "#a79cc2", 14);
  }

  if (winner !== "") {
    let msg = "draw. kinda mid 😐";
    if (winner === "X") { msg = "W 🏆 you beat the bot"; }
    if (winner === "O") { msg = "L 💀 the bot got 3 in a row"; }
    // result bar at the bottom, so you can still see the board
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.9)");
    center(msg, 257, "white", 19);
    let sub = "the yellow squares show the winning line · tap to play again";
    if (winner === "draw") { sub = "nobody got 3 in a row · tap to play again"; }
    center(sub, 280, "#a79cc2", 12);
  }
});
