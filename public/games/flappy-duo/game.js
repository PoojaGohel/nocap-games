/*
  Flappy Duo · 2 players
  ----------------------
  Goal: Both birds fly through the same pipes. The bird that passes more pipes wins.
  Pink: A key, or tap the left half.
  Blue: L key, or tap the right half.
  Round: When both birds crash, the round ends. Flap to race again. Wins are counted at the top.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// FLAPPY DUO · 2 players · same pipes, who survives longer?
// PINK: A key or tap the left half · BLUE: L key or tap the right half
let birds = [];
let pipes = [];
let frames = 0;
let wins = [0, 0];
let state = "ready";
let wait = 0;
let result = "";

// a bird is [x, y, vy, alive, score, color]
function reset() {
  birds = [[90, 140, 0, true, 0, "#ff5aa8"], [130, 160, 0, true, 0, "#7fd3ff"]];
  pipes = [];
  frames = 0;
  state = "ready";
  result = "";
}
reset();

gameloop(function () {
  let ts = taps();
  wait -= 1;
  let flap = [justpressed("a"), justpressed("l")];
  for (const t of ts) {
    if (t[0] < 200) { flap[0] = true; } else { flap[1] = true; }
  }

  if (state === "ready") {
    if (flap[0] || flap[1]) { state = "play"; }
  } else if (state === "over") {
    if (wait <= 0 && (flap[0] || flap[1])) { reset(); }
  }

  if (state === "play") {
    frames += 1;
    if (frames % 90 === 1) {
      pipes.push([400, rng(50, 160), false, false]);
    }
    let keep = [];
    for (const p of pipes) {
      p[0] -= 2.5;
      if (p[0] > -60) { keep.push(p); }
    }
    pipes = keep;

    for (let i = 0; i <= 1; i++) {
      let b = birds[i];
      if (b[3]) {
        if (flap[i]) { b[2] = -6; }
        b[2] += 0.35;
        b[1] += b[2];
        if (b[1] < 12) {
          b[1] = 12;
          b[2] = 0;
        }
        if (b[1] > 273) { b[3] = false; }
        for (const p of pipes) {
          if (bonk(b[0] - 11, b[1] - 11, 22, 22, p[0], 0, 50, p[1])) { b[3] = false; }
          if (bonk(b[0] - 11, b[1] - 11, 22, 22, p[0], p[1] + 110, 50, 300)) { b[3] = false; }
          // pipe passed? each bird counts its own score
          if (p[0] + 50 < b[0] && !p[2 + i]) {
            p[2 + i] = true;
            b[4] += 1;
          }
        }
      } else {
        // a crashed bird falls to the ground
        if (b[1] < 273) {
          b[2] += 0.5;
          b[1] += b[2];
        }
      }
    }

    if (!birds[0][3] && !birds[1][3]) {
      state = "over";
      wait = 50;
      if (birds[0][4] > birds[1][4]) {
        result = "PINK wins 🏆";
        wins[0] += 1;
      } else if (birds[1][4] > birds[0][4]) {
        result = "BLUE wins 🏆";
        wins[1] += 1;
      } else {
        result = "same score, it's a tie 🤝";
      }
    }
  }

  wipe("#7fd3ff");
  for (const p of pipes) {
    box(p[0], 0, 50, p[1], "#13804f");
    box(p[0], p[1] + 110, 50, 300, "#13804f");
  }
  box(0, 285, 400, 15, "#c25a00");
  for (const b of birds) {
    let c = b[5];
    if (!b[3]) { c = "#655a7d"; }
    bubble(b[0], b[1], 12, c);
    bubble(b[0] + 5, b[1] - 4, 3, "#1d1631");
    bubble(b[0] + 12, b[1] + 1, 4, "#ffb469");
  }
  write("PINK " + birds[0][4] + " · wins " + wins[0], 8, 8, "#e0177a", 14);
  write("BLUE " + birds[1][4] + " · wins " + wins[1], 280, 8, "#2450f0", 14);

  if (state === "ready") {
    box(0, 110, 400, 80, "rgba(19, 13, 32, 0.9)");
    center("FLAPPY DUO 🐦🐦", 120, "white", 26);
    center("PINK: A or left half · BLUE: L or right half · flap to start", 158, "#ffb469", 12);
  }
  if (state === "over") {
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.9)");
    center(result + " · " + birds[0][4] + " - " + birds[1][4], 257, "white", 19);
    if (wait <= 0) { center("flap to race again", 280, "#a79cc2", 12); }
  }
});
