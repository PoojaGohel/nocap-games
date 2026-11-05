/*
  Reversi · vs bot
  ----------------
  Goal: Have more PINK discs than BLUE discs when the board is full.
  Move: Place a disc so that a line of the bot's discs is trapped between it and another
    of yours. Every trapped disc flips to your color. The small dots show where you can go.
  Controls: Tap a square, or move with the arrow keys and press space.
  No move? Your turn is skipped. The game ends when nobody can move.
  The bot: It loves corners and edges, and it counts how many discs each move flips.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// REVERSI · you are PINK, the bot is BLUE
let CELL = 34;
let X0 = 14;
let Y0 = 14;
let colors = ["", "#ff5aa8", "#7fd3ff"];
let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
// how much the bot likes each square: corners are great, squares next to corners are risky
let worth = [
  100, -20, 10, 5, 5, 10, -20, 100,
  -20, -40, -2, -2, -2, -2, -40, -20,
  10, -2, 1, 1, 1, 1, -2, 10,
  5, -2, 1, 0, 0, 1, -2, 5,
  5, -2, 1, 0, 0, 1, -2, 5,
  10, -2, 1, 1, 1, 1, -2, 10,
  -20, -40, -2, -2, -2, -2, -40, -20,
  100, -20, 10, 5, 5, 10, -20, 100,
];

let board = [];
let turn = 1;
let cursor = 19;
let wait = 0;
let msg = "";
let over = false;
let last = -1;

function reset() {
  board = [];
  for (let i = 0; i < 64; i++) { board.push(0); }
  board[27] = 2;
  board[36] = 2;
  board[28] = 1;
  board[35] = 1;
  turn = 1;
  wait = 0;
  msg = "you are PINK 🩷";
  over = false;
  last = -1;
}
reset();

// which discs would flip if `who` played at square i?
function flips(i, who) {
  if (board[i] !== 0) { return []; }
  let out = [];
  let x0 = i % 8;
  let y0 = Math.floor(i / 8);
  for (const d of dirs) {
    let line = [];
    let x = x0 + d[0];
    let y = y0 + d[1];
    while (x >= 0 && x < 8 && y >= 0 && y < 8 && board[y * 8 + x] === 3 - who) {
      line.push(y * 8 + x);
      x += d[0];
      y += d[1];
    }
    if (line.length > 0 && x >= 0 && x < 8 && y >= 0 && y < 8 && board[y * 8 + x] === who) {
      out = out.concat(line);
    }
  }
  return out;
}

function movesFor(who) {
  let list = [];
  for (let i = 0; i < 64; i++) {
    if (flips(i, who).length > 0) { list.push(i); }
  }
  return list;
}

function count(who) {
  let n = 0;
  for (const v of board) {
    if (v === who) { n += 1; }
  }
  return n;
}

function play(i, who) {
  for (const k of flips(i, who)) { board[k] = who; }
  board[i] = who;
  last = i;
}

// after a move, hand the turn over (or skip someone who can't move)
function nextTurn() {
  let other = 3 - turn;
  if (movesFor(other).length > 0) {
    turn = other;
    if (turn === 2) {
      wait = 35;
    } else {
      msg = "";
    }
  } else if (movesFor(turn).length > 0) {
    if (turn === 1) {
      msg = "the bot can't move, go again";
    } else {
      msg = "you can't move, the bot goes again";
      wait = 50;
    }
  } else {
    over = true;
  }
}

function botMove() {
  let best = -1;
  let bestScore = -9999;
  for (const i of movesFor(2)) {
    let s = worth[i] + flips(i, 2).length * 2 + rng(0, 3);
    if (s > bestScore) {
      bestScore = s;
      best = i;
    }
  }
  return best;
}

gameloop(function () {
  if (!over && turn === 1) {
    if (justpressed("left") && cursor % 8 > 0) { cursor -= 1; }
    if (justpressed("right") && cursor % 8 < 7) { cursor += 1; }
    if (justpressed("up") && cursor > 7) { cursor -= 8; }
    if (justpressed("down") && cursor < 56) { cursor += 8; }
    let pick = -1;
    if (justpressed("space")) { pick = cursor; }
    if (tapped()) {
      let c = Math.floor((tapx() - X0) / CELL);
      let r = Math.floor((tapy() - Y0) / CELL);
      if (c >= 0 && c < 8 && r >= 0 && r < 8) {
        cursor = r * 8 + c;
        pick = cursor;
      }
    }
    if (pick >= 0) {
      if (flips(pick, 1).length > 0) {
        play(pick, 1);
        nextTurn();
      } else {
        msg = "you can't go there, try a dot";
      }
    }
  } else if (!over && turn === 2) {
    wait -= 1;
    if (wait <= 0) {
      play(botMove(), 2);
      nextTurn();
    }
  } else if (over && (tapped() || justpressed("space"))) {
    reset();
  }

  wipe("#1d1631");
  box(X0 - 4, Y0 - 4, CELL * 8 + 8, CELL * 8 + 8, "#0f3d2c");
  let hints = [];
  if (!over && turn === 1) { hints = movesFor(1); }
  for (let i = 0; i < 64; i++) {
    let x = X0 + (i % 8) * CELL;
    let y = Y0 + Math.floor(i / 8) * CELL;
    box(x + 1, y + 1, CELL - 2, CELL - 2, "#1f6b4a");
    let cx = x + CELL / 2;
    let cy = y + CELL / 2;
    if (board[i] > 0) {
      bubble(cx, cy + 1, 13, "rgba(0, 0, 0, 0.3)");
      bubble(cx, cy, 13, colors[board[i]]);
    }
    if (i === last) { bubble(cx, cy, 3, "rgba(19, 13, 32, 0.6)"); }
  }
  for (const i of hints) {
    bubble(X0 + (i % 8) * CELL + CELL / 2, Y0 + Math.floor(i / 8) * CELL + CELL / 2, 4, "rgba(255, 255, 255, 0.35)");
  }
  if (!over && turn === 1) {
    let x = X0 + (cursor % 8) * CELL;
    let y = Y0 + Math.floor(cursor / 8) * CELL;
    box(x, y, CELL, 2, "white");
    box(x, y + CELL - 2, CELL, 2, "white");
    box(x, y, 2, CELL, "white");
    box(x + CELL - 2, y, 2, CELL, "white");
  }

  // score panel
  let px = 345;
  bubble(px - 22, 40, 10, colors[1]);
  write("YOU " + count(1), px - 8, 32, colors[1], 16);
  bubble(px - 22, 70, 10, colors[2]);
  write("BOT " + count(2), px - 8, 62, colors[2], 16);
  if (!over) {
    if (turn === 2) {
      sprite("bot is", px, 120, 13, "#a79cc2");
      sprite("thinking 🤔", px, 138, 13, "#a79cc2");
    } else {
      sprite("your turn", px, 120, 14, colors[1]);
    }
    // wrap the message onto two lines
    let words = msg.split(" ");
    let half = Math.ceil(words.length / 2);
    sprite(words.slice(0, half).join(" "), px, 180, 11, "#ffb469");
    sprite(words.slice(half).join(" "), px, 196, 11, "#ffb469");
  } else {
    let you = count(1);
    let bot = count(2);
    let text = "tie 🤝";
    let c = "white";
    if (you > bot) {
      text = "you win 🏆";
      c = colors[1];
    }
    if (bot > you) {
      text = "bot wins 🤖";
      c = colors[2];
    }
    sprite(text, px, 120, 16, c);
    sprite(you + " to " + bot, px, 144, 13, "white");
    sprite("tap to", px, 190, 12, "#a79cc2");
    sprite("play again", px, 206, 12, "#a79cc2");
  }
});
