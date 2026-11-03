/*
  Asteroids
  ---------
  Goal: Blast the space rocks without getting hit.
  Keys: ← → to turn, ↑ to boost, space to shoot.
  Phone: Use ◀ ▶ to turn, ▲ to boost, space to shoot.
  Score: Big rocks give 20 and split in two, medium give 50, small give 100. Clear a wave to start a bigger one.
  Lose: You have 3 lives. After a hit you blink and can't be hit for a moment.
  Tip: You drift after boosting, and everything wraps around the edges.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// ASTEROIDS: ← → to turn, ↑ to boost, space to shoot
// on a phone, use the buttons under the screen
let x = 200;
let y = 150;
let ang = -90;
let vx = 0;
let vy = 0;
let shots = [];
let rocks = [];
let score = 0;
let lives = 3;
let safe = 90;
let cool = 0;
let level = 0;

// fly off one edge, come back on the other
function wrap(o) {
  if (o[0] < -20) { o[0] += 440; }
  if (o[0] > 420) { o[0] -= 440; }
  if (o[1] < -20) { o[1] += 340; }
  if (o[1] > 320) { o[1] -= 340; }
}

// a rock is [x, y, vx, vy, size]
function newWave() {
  level += 1;
  for (let k = 1; k <= level + 2; k++) {
    let a = rng(0, 359);
    rocks.push([200 + cos(a) * 190, 150 + sin(a) * 150, cos(a + 90) * rng(1, 2), sin(a + 90) * rng(1, 2), 30]);
  }
}
newWave();

gameloop(function () {
  let boosting = false;
  if (lives > 0) {
    if (pressed("left")) { ang -= 4; }
    if (pressed("right")) { ang += 4; }
    if (pressed("up")) {
      vx += cos(ang) * 0.15;
      vy += sin(ang) * 0.15;
      boosting = true;
    }
    vx = vx * 0.99;
    vy = vy * 0.99;
    x += vx;
    y += vy;
    if (x < 0) { x += 400; }
    if (x > 400) { x -= 400; }
    if (y < 0) { y += 300; }
    if (y > 300) { y -= 300; }
    cool -= 1;
    safe -= 1;
    if (pressed("space") && cool <= 0) {
      shots.push([x + cos(ang) * 14, y + sin(ang) * 14, cos(ang) * 7 + vx, sin(ang) * 7 + vy, 50]);
      cool = 10;
    }
  }

  let keepShots = [];
  for (const s of shots) {
    s[0] += s[2];
    s[1] += s[3];
    s[4] -= 1;
    wrap(s);
    if (s[4] > 0) { keepShots.push(s); }
  }
  shots = keepShots;

  let alive = [];
  for (const r of rocks) {
    r[0] += r[2];
    r[1] += r[3];
    wrap(r);
    let hit = false;
    for (const s of shots) {
      let dx = s[0] - r[0];
      let dy = s[1] - r[1];
      if (!hit && s[4] > 0 && dx * dx + dy * dy < r[4] * r[4]) {
        hit = true;
        s[4] = 0;
      }
    }
    if (hit) {
      // big rocks split into two smaller ones
      if (r[4] === 30) { score += 20; }
      if (r[4] === 18) { score += 50; }
      if (r[4] === 10) { score += 100; }
      if (r[4] > 10) {
        let size = 18;
        if (r[4] === 18) { size = 10; }
        for (let k = 1; k <= 2; k++) {
          let a = rng(0, 359);
          alive.push([r[0], r[1], cos(a) * 2, sin(a) * 2, size]);
        }
      }
    } else {
      alive.push(r);
      let dx = x - r[0];
      let dy = y - r[1];
      if (lives > 0 && safe <= 0 && dx * dx + dy * dy < (r[4] + 8) * (r[4] + 8)) {
        lives -= 1;
        x = 200;
        y = 150;
        vx = 0;
        vy = 0;
        safe = 120;
      }
    }
  }
  rocks = alive;
  if (rocks.length === 0) { newWave(); }

  wipe("#0b0716");
  for (let i = 0; i <= 25; i++) {
    box(i * 83 % 400, i * 59 % 300, 2, 2, "#4a3f6b");
  }
  for (const s of shots) {
    bubble(s[0], s[1], 2, "#7fd3ff");
  }
  for (const r of rocks) {
    bubble(r[0], r[1], r[4], "#6b5a8e");
    bubble(r[0] - r[4] / 3, r[1] - r[4] / 3, r[4] / 3, "#7d6ba0");
  }

  // the ship is a triangle drawn with 3 lines
  if (lives > 0 && (safe <= 0 || safe % 10 < 5)) {
    let nx = x + cos(ang) * 14;
    let ny = y + sin(ang) * 14;
    let ax = x + cos(ang + 140) * 10;
    let ay = y + sin(ang + 140) * 10;
    let bx = x + cos(ang - 140) * 10;
    let by = y + sin(ang - 140) * 10;
    line(nx, ny, ax, ay, "white", 2);
    line(ax, ay, bx, by, "white", 2);
    line(bx, by, nx, ny, "white", 2);
    if (boosting) {
      line(x - cos(ang) * 8, y - sin(ang) * 8, x - cos(ang) * 16, y - sin(ang) * 16, "#ffb469", 4);
    }
  }
  write("score " + score, 8, 8, "white", 14);
  write("wave " + level, 180, 8, "#a79cc2", 14);
  write("lives " + lives, 340, 8, "#ff5aa8", 14);

  if (lives <= 0) {
    box(0, 118, 400, 64, "#1d1631");
    center("GG 💀 score " + score, 126, "white", 24);
    center("press Restart to fly again", 160, "#a79cc2", 14);
    gg();
  }
});
