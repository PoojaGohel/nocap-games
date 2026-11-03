/*
  Flappy
  ------
  Goal: Fly through the gaps between the pipes.
  Keys: space or ↑ to flap.
  Phone: Tap the screen.
  Score: +1 for every pipe you pass. Your best score is saved until you press Restart.
  Lose: Hit a pipe or the ground. Tap to try again.
  Tip: Small, steady taps beat panic tapping.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// FLAPPY: press space, up, or tap the screen to flap
let by = 150;
let vy = 0;
let pipes = [];
let frames = 0;
let score = 0;
let best = 0;
let started = false;
let dead = false;
let was = false;

function reset() {
  by = 150;
  vy = 0;
  pipes = [];
  frames = 0;
  score = 0;
  started = false;
  dead = false;
}

gameloop(function () {
  // only flap on a fresh press, not while holding
  let down = pressed("space") || pressed("up") || tapped();
  let flap = down && !was;
  was = down;

  if (flap) {
    if (dead) {
      reset();
    } else {
      started = true;
      vy = -6;
    }
  }

  if (started && !dead) {
    frames += 1;
    vy += 0.35;
    by += vy;
    if (frames % 90 === 1) {
      pipes.push([400, rng(50, 160), false]);
    }
    let keep = [];
    for (const p of pipes) {
      p[0] -= 2.5;
      if (bonk(91, by - 11, 22, 22, p[0], 0, 50, p[1])) { dead = true; }
      if (bonk(91, by - 11, 22, 22, p[0], p[1] + 110, 50, 300)) { dead = true; }
      if (!p[2] && p[0] + 50 < 90) {
        p[2] = true;
        score += 1;
      }
      if (p[0] > -60) { keep.push(p); }
    }
    pipes = keep;
    if (by < 12) {
      by = 12;
      vy = 0;
    }
    if (by + 12 > 285) { dead = true; }
    if (score > best) { best = score; }
  }

  wipe("#7fd3ff");
  for (const p of pipes) {
    box(p[0], 0, 50, p[1], "#13804f");
    box(p[0], p[1] + 110, 50, 300, "#13804f");
  }
  box(0, 285, 400, 15, "#c25a00");
  bubble(102, by, 12, "#ffb469");
  bubble(107, by - 4, 3, "#1d1631");
  center(score, 20, "white", 34);
  write("best " + best, 8, 8, "#1d1631", 14);

  if (!started) {
    center("tap or press space to flap", 200, "#1d1631", 18);
  }
  if (dead) {
    center("GG 💀 tap to try again", 140, "#1d1631", 22);
  }
});
