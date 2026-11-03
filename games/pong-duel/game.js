/*
  Pong Duel · 2 players
  ---------------------
  Goal: Hit the ball past the other player's paddle to score.
  Pink: W up, S down. Left paddle.
  Blue: ↑ up, ↓ down. Right paddle.
  Phone: Each player drags a finger on their own half of the screen.
  Win: First to 7 points. The ball gets faster with every hit.
  Tip: Hit the ball with the edge of your paddle for a sharp angle.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// PONG DUEL · 2 players · first to 7 wins
// PINK (left): W and S keys · BLUE (right): up and down keys
// on a phone: each player drags a finger on their half
let ly = 120;
let ry = 120;
let bx = 200;
let by = 150;
let vx = 4;
let vy = 2;
let ls = 0;
let rs = 0;

function serveball(dir) {
  bx = 200;
  by = 150;
  vx = 4 * dir;
  vy = rng(-3, 3);
}

gameloop(function () {
  if (pressed("w")) { ly -= 6; }
  if (pressed("s")) { ly += 6; }
  if (pressed("up")) { ry -= 6; }
  if (pressed("down")) { ry += 6; }
  for (const f of fingers()) {
    if (f[0] < 200) {
      ly = f[1] - 30;
    } else {
      ry = f[1] - 30;
    }
  }
  if (ly < 0) { ly = 0; }
  if (ly > 240) { ly = 240; }
  if (ry < 0) { ry = 0; }
  if (ry > 240) { ry = 240; }

  bx += vx;
  by += vy;
  if (by < 6 && vy < 0) { vy = -vy; }
  if (by > 294 && vy > 0) { vy = -vy; }
  if (vx < 0 && bonk(bx - 6, by - 6, 12, 12, 16, ly, 10, 60)) {
    vx = -vx * 1.06;
    vy = (by - ly - 30) / 5;
  }
  if (vx > 0 && bonk(bx - 6, by - 6, 12, 12, 374, ry, 10, 60)) {
    vx = -vx * 1.06;
    vy = (by - ry - 30) / 5;
  }
  if (Math.abs(vx) > 11) { vx = 11 * vx / Math.abs(vx); }

  if (bx < -10) {
    rs += 1;
    serveball(-1);
  }
  if (bx > 410) {
    ls += 1;
    serveball(1);
  }

  wipe("#130d20");
  for (let i = 0; i <= 14; i++) {
    box(198, i * 20 + 4, 4, 12, "#372d55");
  }
  box(16, ly, 10, 60, "#ff5aa8");
  box(374, ry, 10, 60, "#7fd3ff");
  bubble(bx, by, 6, "white");
  write(ls, 160, 12, "#ff5aa8", 28);
  write(rs, 226, 12, "#7fd3ff", 28);

  if (ls === 7 || rs === 7) {
    let who = "PINK";
    if (rs === 7) { who = "BLUE"; }
    box(0, 118, 400, 64, "#1d1631");
    center(who + " wins 🏆", 126, "white", 26);
    center("press Restart for a rematch", 160, "#a79cc2", 14);
    gg();
  }
});
