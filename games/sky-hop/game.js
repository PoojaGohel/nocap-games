/*
  Sky Hop
  -------
  Goal: Bounce up from platform to platform and climb as high as you can.
  Keys: ← → to move. You bounce on your own.
  Phone: Hold the left or right side of the screen.
  Tricks: Walk off one edge to appear on the other. Orange platforms move.
  Lose: Fall off the bottom of the screen.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// SKY HOP: bounce up the platforms as high as you can
// arrow keys to move, or hold the left/right side of the screen
let px = 200;
let py = 250;
let vy = -9;
let score = 0;
let plats = [[170, 290, 0]];
let topY = 290;
let dead = false;

// a platform is [x, y, speed]. Orange ones move
function addPlat(y) {
  let speed = 0;
  if (score > 300 && rng(1, 4) === 1) { speed = 1.5; }
  plats.push([rng(10, 330), y, speed]);
  topY = y;
}
let y = 245;
while (y > -20) {
  addPlat(y);
  y -= rng(35, 55);
}

gameloop(function () {
  if (!dead) {
    if (pressed("left")) { px -= 5; }
    if (pressed("right")) { px += 5; }
    if (holding()) {
      if (tapx() < 200) { px -= 5; } else { px += 5; }
    }
    // walk off one side, come back on the other
    if (px < -10) { px = 410; }
    if (px > 410) { px = -10; }

    vy += 0.35;
    py += vy;
    for (const p of plats) {
      p[0] += p[2];
      if (p[0] < 0 && p[2] < 0) { p[2] = -p[2]; }
      if (p[0] > 340 && p[2] > 0) { p[2] = -p[2]; }
      // only bounce when falling onto the top
      if (vy > 0 && bonk(px - 10, py + 10, 20, 6, p[0], p[1], 60, 10)) { vy = -9.5; }
    }

    // camera: keep the frog in the upper half
    if (py < 130) {
      let shift = 130 - py;
      py = 130;
      score += shift;
      topY += shift;
      let keep = [];
      for (const p of plats) {
        p[1] += shift;
        if (p[1] < 310) { keep.push(p); }
      }
      plats = keep;
      let gap = 55 + Math.floor(score / 200);
      if (gap > 100) { gap = 100; }
      while (topY > -20) {
        addPlat(topY - rng(40, gap));
      }
    }
    if (py > 320) { dead = true; }
  }

  wipe("#bfe6ff");
  bubble(60, 60, 30, "#ffffff");
  bubble(90, 55, 24, "#ffffff");
  for (const p of plats) {
    let c = "#5fd69b";
    if (p[2] !== 0) { c = "#ffb469"; }
    box(p[0], p[1], 60, 10, c);
  }
  sprite("🐸", px, py, 28);
  write("height " + Math.floor(score / 10), 8, 8, "#1d1631", 16);

  if (dead) {
    box(0, 118, 400, 64, "#1d1631");
    center("GG 💀 you reached " + Math.floor(score / 10), 126, "white", 24);
    center("press Restart to hop again", 160, "#a79cc2", 14);
    gg();
  }
});
