/*
  Stack
  -----
  Goal: Build the tallest tower you can.
  Keys: space to drop the sliding block.
  Phone: Tap the screen.
  How: Only the part that lands on the tower stays, so blocks get smaller. Each block slides a bit faster.
  Lose: Miss the tower completely.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// STACK: tap or press space to drop the block
// only the part that lands on the tower stays
let blocks = [[100, 200]];
let x = 0;
let w = 200;
let dir = 1;
let speed = 3;
let dead = false;
let was = false;
let colors = ["#ff5aa8", "#ffb469", "#ffd84d", "#5fd69b", "#7fd3ff", "#c9a4ff"];

gameloop(function () {
  let down = pressed("space") || tapped();
  let drop = down && !was;
  was = down;

  if (!dead) {
    x += dir * speed;
    if (x + w > 400 && dir > 0) { dir = -1; }
    if (x < 0 && dir < 0) { dir = 1; }

    if (drop) {
      // keep only the overlap with the block below
      let topY = blocks[blocks.length - 1];
      let left = x;
      if (topY[0] > left) { left = topY[0]; }
      let right = x + w;
      if (topY[0] + topY[1] < right) { right = topY[0] + topY[1]; }
      if (right - left <= 0) {
        dead = true;
      } else {
        w = right - left;
        blocks.push([left, w]);
        x = 0;
        dir = 1;
        speed += 0.25;
      }
    }
  }

  wipe("#130d20");
  // scroll up once the tower gets tall
  let shift = 0;
  if (blocks.length > 10) { shift = (blocks.length - 10) * 20; }
  for (let k = 0; k <= blocks.length - 1; k++) {
    let b = blocks[k];
    box(b[0], 260 - k * 20 + shift, b[1], 20, colors[k % colors.length]);
  }
  if (!dead) {
    box(x, 260 - blocks.length * 20 + shift, w, 20, "white");
  }
  write("height " + (blocks.length - 1), 8, 8, "white", 16);

  if (blocks.length === 1 && !dead) {
    center("tap or press space to drop", 120, "#a79cc2", 16);
  }
  if (dead) {
    box(0, 118, 400, 64, "#1d1631");
    center("GG 💀 tower height " + (blocks.length - 1), 126, "white", 22);
    center("press Restart to build again", 158, "#a79cc2", 14);
    gg();
  }
});
