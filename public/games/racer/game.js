/*
  Racer
  -----
  Goal: Drive as far as you can without crashing.
  Keys: ← → to switch lanes.
  Phone: Tap the left or right side of the screen.
  Score: Distance in meters. The road keeps getting faster.
  Lose: Hit any car.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// RACER: switch lanes with the arrow keys
// or tap the left/right side of the screen. Dodge the traffic!
let lanes = [140, 200, 260];
let lane = 1;
let px = 200;
let cars = [];
let frames = 0;
let dist = 0;
let dead = false;
let last = "";

gameloop(function () {
  if (!dead) {
    frames += 1;
    let speed = 4 + frames / 400;
    dist += speed;

    let dir = "";
    if (pressed("left")) { dir = "left"; }
    if (pressed("right")) { dir = "right"; }
    if (tapped()) {
      dir = "right";
      if (tapx() < 200) { dir = "left"; }
    }
    if (dir === "left" && last !== "left" && lane > 0) { lane -= 1; }
    if (dir === "right" && last !== "right" && lane < 2) { lane += 1; }
    last = dir;
    // glide smoothly toward the lane
    px += (lanes[lane] - px) / 4;

    if (frames % 40 === 0) {
      cars.push([lanes[rng(0, 2)], -30]);
    }
    let keep = [];
    for (const c of cars) {
      c[1] += speed;
      if (bonk(px - 14, 240, 28, 44, c[0] - 14, c[1] - 15, 28, 30)) { dead = true; }
      if (c[1] < 340) { keep.push(c); }
    }
    cars = keep;
  }

  wipe("#2f6b24");
  box(110, 0, 180, 300, "#3a3350");
  for (let i = 0; i <= 8; i++) {
    let sy = (i * 40 + dist) % 360 - 40;
    box(168, sy, 4, 20, "#efe9fb");
    box(228, sy, 4, 20, "#efe9fb");
  }
  for (const c of cars) {
    sprite("🚘", c[0], c[1], 34);
  }
  // your car, seen from behind
  box(px - 15, 240, 30, 44, "#ff5aa8");
  box(px - 11, 248, 22, 10, "#1d1631");
  box(px - 15, 278, 8, 6, "#ffb469");
  box(px + 7, 278, 8, 6, "#ffb469");
  write(Math.floor(dist / 10) + " m", 8, 8, "white", 16);

  if (dead) {
    box(0, 118, 400, 64, "#130d20");
    center("💥 crashed after " + Math.floor(dist / 10) + " m", 126, "white", 22);
    center("press Restart to race again", 158, "#a79cc2", 14);
    gg();
  }
});
