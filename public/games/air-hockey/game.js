/*
  Air Hockey · 2 players
  ----------------------
  Goal: Knock the puck into the other player's goal (the colored slot on their wall).
  Pink: W A S D to move. You defend the left goal.
  Blue: Arrow keys to move. You defend the right goal.
  Phone: Each player drags a finger on their own half. Best on a tablet.
  Rules: You can't cross the middle line. Swing your paddle into the puck to hit it harder.
  Win: First to 7 goals.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// AIR HOCKEY · 2 players · first to 7 goals
// PINK: W A S D · BLUE: arrow keys
// on a phone or tablet: each player drags a finger on their half
let lp = [80, 150, 0, 0];
let rp = [320, 150, 0, 0];
let puck = [200, 150, 0, 0];
let ls = 0;
let rs = 0;
let pause = 30;

// move a paddle and remember how fast it moved
function moveTo(p, x, y, minX, maxX) {
  if (x < minX) { x = minX; }
  if (x > maxX) { x = maxX; }
  if (y < 20) { y = 20; }
  if (y > 280) { y = 280; }
  p[2] = x - p[0];
  p[3] = y - p[1];
  p[0] = x;
  p[1] = y;
}

// bounce the puck off a paddle, adding the paddle's speed
function hit(p) {
  let dx = puck[0] - p[0];
  let dy = puck[1] - p[1];
  let d = Math.sqrt(dx * dx + dy * dy);
  if (d < 32 && d > 0) {
    let nx = dx / d;
    let ny = dy / d;
    puck[0] = p[0] + nx * 32;
    puck[1] = p[1] + ny * 32;
    let along = puck[2] * nx + puck[3] * ny;
    if (along < 0) {
      puck[2] -= 2 * along * nx;
      puck[3] -= 2 * along * ny;
    }
    puck[2] += p[2] * 0.7 + nx;
    puck[3] += p[3] * 0.7 + ny;
  }
}

function faceoff() {
  puck = [200, 150, 0, 0];
  pause = 40;
}

gameloop(function () {
  let lx = lp[0];
  let ly = lp[1];
  let rx = rp[0];
  let ry = rp[1];
  if (pressed("w")) { ly -= 6; }
  if (pressed("s")) { ly += 6; }
  if (pressed("a")) { lx -= 6; }
  if (pressed("d")) { lx += 6; }
  if (pressed("up")) { ry -= 6; }
  if (pressed("down")) { ry += 6; }
  if (pressed("left")) { rx -= 6; }
  if (pressed("right")) { rx += 6; }
  for (const f of fingers()) {
    if (f[0] < 200) {
      lx = f[0];
      ly = f[1];
    } else {
      rx = f[0];
      ry = f[1];
    }
  }
  moveTo(lp, lx, ly, 20, 180);
  moveTo(rp, rx, ry, 220, 380);

  if (pause > 0) {
    pause -= 1;
  } else {
    puck[0] += puck[2];
    puck[1] += puck[3];
    puck[2] = puck[2] * 0.993;
    puck[3] = puck[3] * 0.993;
    let mouth = puck[1] > 110 && puck[1] < 190;
    if (puck[1] < 12 && puck[3] < 0) { puck[3] = -puck[3]; }
    if (puck[1] > 288 && puck[3] > 0) { puck[3] = -puck[3]; }
    if (!mouth && puck[0] < 12 && puck[2] < 0) { puck[2] = -puck[2]; }
    if (!mouth && puck[0] > 388 && puck[2] > 0) { puck[2] = -puck[2]; }
    hit(lp);
    hit(rp);
    // speed limit
    let sp = Math.sqrt(puck[2] * puck[2] + puck[3] * puck[3]);
    if (sp > 13) {
      puck[2] = puck[2] * 13 / sp;
      puck[3] = puck[3] * 13 / sp;
    }
    if (puck[1] < 12) { puck[1] = 12; }
    if (puck[1] > 288) { puck[1] = 288; }
    if (puck[0] < -12) {
      rs += 1;
      faceoff();
    }
    if (puck[0] > 412) {
      ls += 1;
      faceoff();
    }
  }

  wipe("#dff1ff");
  box(199, 0, 2, 300, "#9cc9e6");
  bubble(200, 150, 42, "#9cc9e6");
  bubble(200, 150, 39, "#dff1ff");
  box(0, 110, 6, 80, "#ff5aa8");
  box(394, 110, 6, 80, "#7fd3ff");
  bubble(puck[0], puck[1], 12, "#1d1631");
  bubble(lp[0], lp[1], 20, "#ff5aa8");
  bubble(lp[0], lp[1], 8, "#e0177a");
  bubble(rp[0], rp[1], 20, "#7fd3ff");
  bubble(rp[0], rp[1], 8, "#2450f0");
  sprite(ls, 170, 22, 26, "#e0177a");
  sprite(rs, 230, 22, 26, "#2450f0");

  if (ls === 7 || rs === 7) {
    let who = "PINK";
    if (rs === 7) { who = "BLUE"; }
    box(0, 118, 400, 64, "#1d1631");
    center(who + " wins 🏆", 126, "white", 26);
    center("press Restart for a rematch", 160, "#a79cc2", 14);
    gg();
  }
});
