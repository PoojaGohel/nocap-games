/*
  Connect 4 · vs bot
  ------------------
  Goal: Get 4 PINK pieces in a row before the BLUE bot does: across, down, or diagonal.
  Controls: Tap a column, or aim with ← → and drop with space or ↓. You go first.
  The bot: It wins when it can, blocks your 4-in-a-row, never sets up a win for you, and likes the middle.
  Tip: Build two threats at once. It can only block one.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// CONNECT 4 vs BOT · you are PINK, the bot is BLUE
// tap a column, or use ← → to aim and space to drop
let board = [];
let turn = 1;
let cursor = 3;
let winner = 0;
let drops = 0;
let wait = 0;
let wins = [0, 0, 0];
let winCells = [];
let colors = ["#2a1f45", "#ff5aa8", "#7fd3ff"];

function reset() {
  board = [];
  for (let i = 0; i <= 41; i++) {
    board.push(0);
  }
  winner = 0;
  drops = 0;
  turn = 1;
  wait = 0;
  winCells = [];
}
reset();

function at(c, r) {
  if (c < 0 || c > 6 || r < 0 || r > 5) { return 0; }
  return board[r * 7 + c];
}

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

// the squares in the winning line (for the highlight)
function lineCells(c, r) {
  let p = at(c, r);
  for (const d of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    let cells = [[c, r]];
    let k = 1;
    while (eq(at(c + d[0] * k, r + d[1] * k), p)) {
      cells.push([c + d[0] * k, r + d[1] * k]);
      k += 1;
    }
    k = 1;
    while (eq(at(c - d[0] * k, r - d[1] * k), p)) {
      cells.push([c - d[0] * k, r - d[1] * k]);
      k += 1;
    }
    if (cells.length >= 4) { return cells; }
  }
  return [];
}

// lowest empty row in a column (-1 if full)
function rowFor(c) {
  for (let r = 5; r >= 0; r--) {
    if (board[r * 7 + c] === 0) { return r; }
  }
  return -1;
}

function drop(c) {
  let r = rowFor(c);
  if (winner !== 0 || r < 0) { return false; }
  board[r * 7 + c] = turn;
  drops += 1;
  if (fourInRow(c, r)) {
    winner = turn;
    wins[turn] += 1;
    winCells = lineCells(c, r);
  } else if (drops === 42) {
    winner = 3;
  }
  turn = 3 - turn;
  return true;
}

// would this player win by dropping in column c?
function wouldWin(c, who) {
  let r = rowFor(c);
  if (r < 0) { return false; }
  board[r * 7 + c] = who;
  let w = fourInRow(c, r);
  board[r * 7 + c] = 0;
  return w;
}

// the bot's brain, step by step
function botMove() {
  let order = [3, 2, 4, 1, 5, 0, 6];
  // 1. can I win right now?
  for (const c of order) {
    if (wouldWin(c, 2)) { return c; }
  }
  // 2. do I need to block you?
  for (const c of order) {
    if (wouldWin(c, 1)) { return c; }
  }
  // 3. never drop where you could win right on top of me
  let safe = [];
  for (const c of order) {
    let r = rowFor(c);
    if (r >= 0) {
      board[r * 7 + c] = 2;
      let bad = r > 0 && wouldWin(c, 1);
      board[r * 7 + c] = 0;
      if (!bad) { safe.push(c); }
    }
  }
  // 4. prefer the middle, with a little surprise
  if (safe.length > 0) {
    if (rng(1, 3) === 1) { return safe[rng(0, safe.length - 1)]; }
    return safe[0];
  }
  for (const c of order) {
    if (rowFor(c) >= 0) { return c; }
  }
  return 3;
}

gameloop(function () {
  let ts = taps();
  if (winner === 0 && turn === 1) {
    if (justpressed("left") && cursor > 0) { cursor -= 1; }
    if (justpressed("right") && cursor < 6) { cursor += 1; }
    let played = false;
    if (justpressed("space") || justpressed("down")) { played = drop(cursor); }
    for (const t of ts) {
      let c = Math.floor((t[0] - 74) / 36);
      if (!played && c >= 0 && c <= 6) {
        cursor = c;
        played = drop(c);
      }
    }
    if (played) { wait = 35; }
  } else if (winner === 0 && turn === 2) {
    wait -= 1;
    if (wait <= 0) { drop(botMove()); }
  } else if (winner !== 0) {
    // wait a moment so you can see how the game ended
    wait -= 1;
    if (wait < -90 && (justpressed("space") || ts.length > 0)) { reset(); }
  }

  wipe("#1d1631");
  box(74, 36, 252, 216, "#3b2a8a");
  // yellow rings around the winning 4
  for (const w of winCells) {
    bubble(74 + w[0] * 36 + 18, 36 + w[1] * 36 + 18, 17, "#ffd84d");
  }
  for (let r = 0; r <= 5; r++) {
    for (let c = 0; c <= 6; c++) {
      bubble(74 + c * 36 + 18, 36 + r * 36 + 18, 13, colors[board[r * 7 + c]]);
    }
  }
  write("YOU " + wins[1], 8, 8, "#ff5aa8", 14);
  write("BOT " + wins[2], 350, 8, "#7fd3ff", 14);

  if (winner === 0 && turn === 1) {
    bubble(74 + cursor * 36 + 18, 18, 12, colors[1]);
    sprite("your turn", 200, 272, 14, "#ff5aa8");
  }
  if (winner === 0 && turn === 2) {
    sprite("bot is thinking... 🤔", 200, 272, 14, "#7fd3ff");
  }
  if (winner !== 0) {
    let msg = "board full, it's a draw 🤝";
    if (winner === 1) { msg = "you beat the bot 🏆"; }
    if (winner === 2) { msg = "🤖 the bot connects 4"; }
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.9)");
    center(msg, 257, "white", 19);
    let sub = "yellow rings = the winning 4 · tap or press space to play again";
    if (winner === 3) { sub = "tap or press space to play again"; }
    center(sub, 280, "#a79cc2", 12);
  }
});
