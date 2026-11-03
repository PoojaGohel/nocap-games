/*
  Dodge
  -----
  Goal: Stay alive as long as you can.
  Keys: ← →, or the buttons under the screen.
  Score: Goes up every moment you survive. More rocks fall over time.
  Lose: One rock hit ends the game.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// DODGE: move with the arrow keys or the buttons
// click the game screen first so it hears your keys
let px = 180;
let rocks = [];
let frames = 0;
let dead = false;

gameloop(function () {
  wipe("#1d1631");
  frames += 1;

  if (pressed("left") && px > 0) { px -= 6; }
  if (pressed("right") && px < 360) { px += 6; }

  // more rocks the longer you survive
  if (rng(1, 100) <= 4 + frames / 300) {
    rocks.push([rng(0, 380), -20, rng(2, 5)]);
  }

  let keep = [];
  for (const r of rocks) {
    r[1] += r[2];
    box(r[0], r[1], 20, 20, "#ffb469");
    if (bonk(px, 265, 40, 16, r[0], r[1], 20, 20)) { dead = true; }
    if (r[1] < 300) { keep.push(r); }
  }
  rocks = keep;

  box(px, 265, 40, 16, "#ff5aa8");
  write("score " + Math.floor(frames / 6), 12, 12, "white", 16);

  if (dead) {
    box(90, 100, 220, 100, "#130d20");
    write("GG 💀", 150, 115, "white", 36);
    write("score: " + Math.floor(frames / 6), 150, 162, "#7fd3ff", 20);
    gg();
  }
});
