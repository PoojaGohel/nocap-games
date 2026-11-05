/*
  Dots & Boxes · 2 players
  ------------------------
  Goal: Own more boxes than the other player when the board is full.
  Turns: PINK and BLUE take turns drawing one line between two dots.
  Bonus: Close the 4th side of a box and it's yours, and you go again.
  Controls: Tap a gap between two dots, or move with the arrow keys and press space.
  Tip: Don't draw the 3rd side of a box. The other player will take it.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// DOTS & BOXES · 5 × 4 boxes · PINK vs BLUE
let COLS = 5;
let ROWS = 4;
let GAP = 50;
let X0 = 75;
let Y0 = 34;
let names = ["", "PINK", "BLUE"];
let colors = ["", "#ff5aa8", "#7fd3ff"];
let fills = ["", "rgba(255, 90, 168, 0.28)", "rgba(127, 211, 255, 0.28)"];

let edges = [];
let owner = [];
let score = [0, 0, 0];
let wins = [0, 0, 0];
let turn = 1;
let starter = 2;
let cursor = 0;
let over = 0;
let msg = "";

// every line you can draw: across (h) or down (v), with its two dot positions
function reset() {
  edges = [];
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      edges.push({ kind: "h", r: r, c: c, x1: X0 + c * GAP, y1: Y0 + r * GAP, x2: X0 + (c + 1) * GAP, y2: Y0 + r * GAP, by: 0 });
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      edges.push({ kind: "v", r: r, c: c, x1: X0 + c * GAP, y1: Y0 + r * GAP, x2: X0 + c * GAP, y2: Y0 + (r + 1) * GAP, by: 0 });
    }
  }
  owner = [];
  for (let i = 0; i < ROWS * COLS; i++) { owner.push(0); }
  score = [0, 0, 0];
  starter = 3 - starter;
  turn = starter;
  cursor = 0;
  over = 0;
  msg = "";
}
reset();

function edgeAt(kind, r, c) {
  for (const e of edges) {
    if (e.kind === kind && e.r === r && e.c === c) { return e; }
  }
  return null;
}

// is box (r, c) closed on all 4 sides?
function closed(r, c) {
  return edgeAt("h", r, c).by > 0 && edgeAt("h", r + 1, c).by > 0 &&
         edgeAt("v", r, c).by > 0 && edgeAt("v", r, c + 1).by > 0;
}

// the boxes on each side of a line
function boxesBeside(e) {
  let list = [];
  if (e.kind === "h") {
    if (e.r > 0) { list.push([e.r - 1, e.c]); }
    if (e.r < ROWS) { list.push([e.r, e.c]); }
  } else {
    if (e.c > 0) { list.push([e.r, e.c - 1]); }
    if (e.c < COLS) { list.push([e.r, e.c]); }
  }
  return list;
}

function draw(i) {
  let e = edges[i];
  if (e.by > 0 || over > 0) { return; }
  e.by = turn;
  let got = 0;
  for (const b of boxesBeside(e)) {
    let k = b[0] * COLS + b[1];
    if (owner[k] === 0 && closed(b[0], b[1])) {
      owner[k] = turn;
      score[turn] += 1;
      got += 1;
    }
  }
  if (score[1] + score[2] === ROWS * COLS) {
    over = 1;
    if (score[1] > score[2]) { wins[1] += 1; }
    if (score[2] > score[1]) { wins[2] += 1; }
  } else if (got > 0) {
    msg = names[turn] + " closed a box, go again ✨";
  } else {
    turn = 3 - turn;
    msg = "";
  }
}

// keyboard: jump to the nearest free line in the arrow's direction
function moveCursor(dx, dy) {
  let cur = edges[cursor];
  let cx = (cur.x1 + cur.x2) / 2;
  let cy = (cur.y1 + cur.y2) / 2;
  let best = -1;
  let bestD = 99999;
  for (let i = 0; i < edges.length; i++) {
    let e = edges[i];
    let ex = (e.x1 + e.x2) / 2 - cx;
    let ey = (e.y1 + e.y2) / 2 - cy;
    let ahead = ex * dx + ey * dy;
    if (i !== cursor && ahead > 0) {
      let side = Math.abs(ex * dy - ey * dx);
      let d = ahead + side * 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
  }
  if (best >= 0) { cursor = best; }
}

gameloop(function () {
  if (over === 0) {
    if (justpressed("left")) { moveCursor(-1, 0); }
    if (justpressed("right")) { moveCursor(1, 0); }
    if (justpressed("up")) { moveCursor(0, -1); }
    if (justpressed("down")) { moveCursor(0, 1); }
    if (justpressed("space")) { draw(cursor); }
    if (tapped()) {
      // the closest line to the tap, if it's close enough
      let best = -1;
      let bestD = 20;
      for (let i = 0; i < edges.length; i++) {
        let e = edges[i];
        let d = Math.hypot((e.x1 + e.x2) / 2 - tapx(), (e.y1 + e.y2) / 2 - tapy());
        if (e.by === 0 && d < bestD) {
          bestD = d;
          best = i;
        }
      }
      if (best >= 0) {
        cursor = best;
        draw(best);
      }
    }
  } else {
    over += 1;
    if (over > 45 && (tapped() || justpressed("space"))) { reset(); }
  }

  wipe("#1d1631");
  write("PINK " + score[1], 8, 8, colors[1], 16);
  write("wins " + wins[1], 8, 28, "#a79cc2", 11);
  write("BLUE " + score[2], 340, 8, colors[2], 16);
  write("wins " + wins[2], 340, 28, "#a79cc2", 11);

  // boxes
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let o = owner[r * COLS + c];
      if (o > 0) {
        box(X0 + c * GAP + 3, Y0 + r * GAP + 3, GAP - 6, GAP - 6, fills[o]);
        sprite(names[o][0], X0 + c * GAP + GAP / 2, Y0 + r * GAP + GAP / 2, 18, colors[o]);
      }
    }
  }
  // lines
  for (let i = 0; i < edges.length; i++) {
    let e = edges[i];
    if (e.by > 0) {
      line(e.x1, e.y1, e.x2, e.y2, colors[e.by], 5);
    } else {
      line(e.x1, e.y1, e.x2, e.y2, "#2f2550", 3);
    }
  }
  if (over === 0) {
    let e = edges[cursor];
    if (e.by === 0) { line(e.x1, e.y1, e.x2, e.y2, "rgba(255, 255, 255, 0.45)", 5); }
  }
  // dots
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      bubble(X0 + c * GAP, Y0 + r * GAP, 5, "#f1ecfb");
    }
  }

  if (over === 0) {
    sprite(names[turn] + "'s turn", 200, 256, 17, colors[turn]);
    if (msg !== "") {
      sprite(msg, 200, 280, 12, "#ffb469");
    } else {
      sprite("tap a gap between two dots", 200, 280, 12, "#a79cc2");
    }
  } else {
    let text = "it's a tie 🤝";
    let c = "white";
    if (score[1] > score[2]) {
      text = "PINK wins " + score[1] + " to " + score[2] + " 🏆";
      c = colors[1];
    }
    if (score[2] > score[1]) {
      text = "BLUE wins " + score[2] + " to " + score[1] + " 🏆";
      c = colors[2];
    }
    box(0, 244, 400, 56, "rgba(19, 13, 32, 0.92)");
    center(text, 250, c, 20);
    center("tap or press space to play again", 278, "#a79cc2", 12);
  }
});
