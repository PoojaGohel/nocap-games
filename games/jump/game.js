/*
  Jump
  ----
  Goal: Run as far as you can and jump over 🌵 cacti and 🪨 rocks.
  Keys: space or ↑ to jump.
  Phone: Tap the screen.
  Score: Goes up the longer you run. The speed keeps rising.
  Lose: Touch an obstacle. Tap to run again.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// JUMP: space, up, or tap to jump over the cacti
let y = 240;
let vy = 0;
let obs = [];
let frames = 0;
let gap = 60;
let best = 0;
let started = false;
let dead = false;
let was = false;

function reset() {
  y = 240;
  vy = 0;
  obs = [];
  frames = 0;
  gap = 60;
  started = false;
  dead = false;
}

gameloop(function () {
  let down = pressed("space") || pressed("up") || tapped();
  let jump = down && !was;
  was = down;

  if (jump && dead) {
    reset();
  } else if (jump && y >= 240) {
    started = true;
    vy = -10.5;
  }

  if (started && !dead) {
    frames += 1;
    let speed = 5 + frames / 500;
    vy += 0.6;
    y += vy;
    if (y > 240) {
      y = 240;
      vy = 0;
    }

    // new obstacle after a random gap
    gap -= 1;
    if (gap <= 0) {
      let kind = "🌵";
      if (rng(1, 3) === 1) { kind = "🪨"; }
      obs.push([420, kind]);
      gap = rng(45, 95);
    }

    let keep = [];
    for (const o of obs) {
      o[0] -= speed;
      if (bonk(60, y - 12, 20, 24, o[0] - 10, 230, 20, 26)) { dead = true; }
      if (o[0] > -30) { keep.push(o); }
    }
    obs = keep;
    if (Math.floor(frames / 6) > best) { best = Math.floor(frames / 6); }
  }

  wipe("#2a1f45");
  bubble(330, 70, 26, "#ffb469");
  box(0, 258, 400, 42, "#c25a00");
  for (const o of obs) {
    sprite(o[1], o[0], 242, 30);
  }
  sprite("🐸", 70, y, 32);
  write("score " + Math.floor(frames / 6), 8, 8, "white", 14);
  write("best " + best, 8, 28, "#a79cc2", 14);

  if (!started) {
    center("tap or press space to jump", 130, "white", 18);
  }
  if (dead) {
    center("GG 💀 tap to run again", 130, "white", 22);
  }
});
