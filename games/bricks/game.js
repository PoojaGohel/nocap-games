/*
  Bricks
  ------
  Goal: Break all 32 bricks with the ball.
  Keys: ← → to move the paddle.
  Phone: Drag your finger.
  Score: +10 per brick. Where the ball hits the paddle changes its angle.
  Lose: You have 3 lives. Letting the ball fall costs one.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// BRICKS: move with the arrow keys or drag on the screen
// break every brick. You have 3 lives
let px = 160;
let bx = 200;
let by = 200;
let vx = 3;
let vy = -3.5;
let score = 0;
let lives = 3;
let colors = ["#ff5aa8", "#ffb469", "#7fd3ff", "#c9a4ff"];
let bricks = [];
for (let row = 0; row <= 3; row++) {
  for (let col = 0; col <= 7; col++) {
    bricks.push([col * 48 + 8, row * 20 + 40, row]);
  }
}

gameloop(function () {
  if (pressed("left")) { px -= 7; }
  if (pressed("right")) { px += 7; }
  if (holding()) { px = tapx() - 40; }
  if (px < 0) { px = 0; }
  if (px > 320) { px = 320; }

  bx += vx;
  by += vy;
  if (bx < 6 && vx < 0) { vx = -vx; }
  if (bx > 394 && vx > 0) { vx = -vx; }
  if (by < 6 && vy < 0) { vy = -vy; }

  // paddle: where the ball lands changes its angle
  if (vy > 0 && bonk(bx - 6, by - 6, 12, 12, px, 270, 80, 10)) {
    vy = -vy;
    vx = (bx - px - 40) / 7;
    if (Math.abs(vx) < 1) { vx = 1; }
  }

  let keep = [];
  let hit = false;
  for (const b of bricks) {
    if (!hit && bonk(bx - 6, by - 6, 12, 12, b[0], b[1], 44, 16)) {
      hit = true;
      vy = -vy;
      score += 10;
    } else {
      keep.push(b);
    }
  }
  bricks = keep;

  if (by > 310) {
    lives -= 1;
    bx = 200;
    by = 200;
    vx = 3;
    vy = -3.5;
  }

  wipe("#1d1631");
  for (const b of bricks) {
    box(b[0], b[1], 44, 16, colors[b[2]]);
  }
  box(px, 270, 80, 10, "white");
  bubble(bx, by, 6, "#ffb469");
  write("score " + score, 8, 8, "white", 14);
  write("lives " + lives, 336, 8, "#ff5aa8", 14);

  if (bricks.length === 0) {
    center("you ate 🏆 all bricks gone", 150, "white", 24);
    gg();
  }
  if (lives === 0) {
    center("GG 💀 score: " + score, 150, "white", 26);
    gg();
  }
});
