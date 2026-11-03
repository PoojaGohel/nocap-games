/*
  Bounce
  ------
  What: Not a game yet. It's a bouncing ball animation to learn gameloop.
  Try: Change dx and dy to change the speed, or "hotpink" to change the color.
  Challenge: Add pressed("space") to make the ball jump.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// GAME KIT 101: a bouncing ball
// gameloop runs your cook 60 times a second
let x = 200;
let y = 80;
let dx = 4;
let dy = 3;

gameloop(function () {
  wipe("#1d1631");
  x += dx;
  y += dy;
  if (x < 20 || x > 380) { dx = -dx; }
  if (y < 20 || y > 280) { dy = -dy; }
  bubble(x, y, 20, "hotpink");
  write("it's giving bounce", 12, 12, "white", 16);
});
