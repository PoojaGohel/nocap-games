/*
  Pong
  ----
  Goal: Get the ball past the bot's paddle on the right.
  Keys: ↑ ↓ to move.
  Phone: Drag your finger.
  Win: First to 5. The ball speeds up with every hit.
  Tip: Hit with the edge of your paddle. The bot is slow on sharp angles.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// PONG vs the bot: up and down keys (or drag) to move
// first to 5 wins
let py = 120;
let cy = 120;
let bx = 200;
let by = 150;
let vx = 4;
let vy = 2;
let me = 0;
let bot = 0;

function serveball(dir) {
  bx = 200;
  by = 150;
  vx = 4 * dir;
  vy = rng(-3, 3);
}

gameloop(function () {
  if (pressed("up")) { py -= 6; }
  if (pressed("down")) { py += 6; }
  if (holding()) { py = tapy() - 30; }
  if (py < 0) { py = 0; }
  if (py > 240) { py = 240; }

  // the bot chases the ball, but a little slow
  if (cy + 30 < by - 8) { cy += 3.6; }
  if (cy + 30 > by + 8) { cy -= 3.6; }

  bx += vx;
  by += vy;
  if (by < 6 && vy < 0) { vy = -vy; }
  if (by > 294 && vy > 0) { vy = -vy; }

  if (vx < 0 && bonk(bx - 6, by - 6, 12, 12, 16, py, 10, 60)) {
    vx = -vx * 1.06;
    vy = (by - py - 30) / 5;
  }
  if (vx > 0 && bonk(bx - 6, by - 6, 12, 12, 374, cy, 10, 60)) {
    vx = -vx * 1.06;
    vy = (by - cy - 30) / 5;
  }
  if (Math.abs(vx) > 10) { vx = 10 * vx / Math.abs(vx); }

  if (bx < -10) {
    bot += 1;
    serveball(-1);
  }
  if (bx > 410) {
    me += 1;
    serveball(1);
  }

  wipe("#130d20");
  for (let i = 0; i <= 14; i++) {
    box(198, i * 20 + 4, 4, 12, "#372d55");
  }
  box(16, py, 10, 60, "#ff5aa8");
  box(374, cy, 10, 60, "#7fd3ff");
  bubble(bx, by, 6, "white");
  write(me, 160, 12, "#ff5aa8", 28);
  write(bot, 226, 12, "#7fd3ff", 28);

  if (me === 5 || bot === 5) {
    let msg = "W 🏆 you beat the bot";
    if (bot === 5) { msg = "L 💀 the bot cooked you"; }
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.9)");
    center(msg + " · " + me + " - " + bot, 257, "white", 19);
    center("press Restart for a rematch", 280, "#a79cc2", 12);
    gg();
  }
});
