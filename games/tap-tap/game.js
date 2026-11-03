/*
  Tap Tap
  -------
  Goal: Tap the bubble as many times as you can in 20 seconds.
  Controls: Click or tap the bubble. It jumps and shrinks after every hit.
  Rating: 8+ is a W, 15+ is goated 🐐.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// TAP TAP: click or tap the bubble. You have 20 seconds!
let tx = 200;
let ty = 150;
let score = 0;

function move() {
  tx = rng(40, 360);
  ty = rng(60, 260);
}

gameloop(function () {
  let left = 20 - Math.floor(clock());
  let size = 32 - score;
  if (size < 12) { size = 12; }
  wipe("#130d20");

  if (left <= 0) {
    let rating = "mid";
    if (score >= 15) {
      rating = "goated 🐐";
    } else if (score >= 8) {
      rating = "W";
    }
    write("time! you got " + score, 90, 110, "white", 28);
    write("rating: " + rating, 90, 155, "#ff5aa8", 22);
    gg();
    return;
  }

  if (tapped()) {
    let ddx = tapx() - tx;
    let ddy = tapy() - ty;
    if (Math.sqrt(ddx * ddx + ddy * ddy) < size) {
      score += 1;
      move();
    }
  }

  bubble(tx, ty, size, "#c9a4ff");
  write("score " + score, 12, 12, "white", 16);
  write(left + "s", 340, 12, "#ffb469", 16);
});
