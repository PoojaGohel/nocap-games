/*
  Space
  -----
  Goal: Shoot the 👾 aliens before they get past you.
  Keys: ← → to move, space to shoot.
  Phone: Hold and drag. Your ship fires on its own while you hold.
  Score: +1 per alien. Aliens come faster over time.
  Lose: You have 3 lives. Every alien that reaches the bottom costs one.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// SPACE: move with the arrow keys, press space to shoot
// on a phone: hold and drag to move and fire
let px = 200;
let shots = [];
let aliens = [];
let frames = 0;
let score = 0;
let lives = 3;
let cool = 0;

gameloop(function () {
  frames += 1;
  if (pressed("left") && px > 20) { px -= 5; }
  if (pressed("right") && px < 380) { px += 5; }
  if (holding()) { px = tapx(); }

  // shoot, but not every frame
  cool -= 1;
  if ((pressed("space") || holding()) && cool <= 0) {
    shots.push([px, 250]);
    cool = 12;
  }

  // aliens show up faster over time
  if (rng(1, 100) <= 2 + frames / 600) {
    aliens.push([rng(20, 380), -20, rng(1, 2) + frames / 1500]);
  }

  let keepShots = [];
  for (const s of shots) {
    s[1] -= 8;
    if (s[1] > -10) { keepShots.push(s); }
  }
  shots = keepShots;

  let keepAliens = [];
  for (const a of aliens) {
    a[1] += a[2];
    let hit = false;
    for (const s of shots) {
      if (!hit && bonk(a[0] - 14, a[1] - 14, 28, 28, s[0] - 2, s[1], 4, 12)) {
        hit = true;
        s[1] = -100;
        score += 1;
      }
    }
    if (!hit && a[1] > 290) {
      lives -= 1;
    } else if (!hit) {
      keepAliens.push(a);
    }
  }
  aliens = keepAliens;

  wipe("#0b0716");
  for (let i = 0; i <= 30; i++) {
    box(i * 73 % 400, (i * 47 + frames) % 300, 2, 2, "#4a3f6b");
  }
  for (const s of shots) {
    box(s[0] - 2, s[1], 4, 12, "#7fd3ff");
  }
  for (const a of aliens) {
    sprite("👾", a[0], a[1], 28);
  }
  sprite("🚀", px, 272, 30);
  write("score " + score, 8, 8, "white", 14);
  write("lives " + lives, 336, 8, "#ff5aa8", 14);

  if (lives <= 0) {
    center("GG 💀 the aliens got through", 125, "white", 24);
    center("score: " + score + " · press Restart to retry", 165, "#7fd3ff", 16);
    gg();
  }
});
