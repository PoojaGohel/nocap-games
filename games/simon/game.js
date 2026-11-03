/*
  Simon
  -----
  Goal: Repeat the color pattern for as long as you can.
  How: Watch the pads flash, then repeat them in the same order.
  Keys: ↑ ← → ↓ match where the pads are.
  Phone: Tap the pads.
  Lose: One wrong pad ends the game. Each round adds one more step.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// SIMON: watch the colors flash, then repeat them in order
// tap the pads, or use the arrow keys
let pads = [[130, 10, "#ff5aa8", "up"], [10, 105, "#7fd3ff", "left"], [250, 105, "#5fd69b", "right"], [130, 200, "#ffb469", "down"]];
let seq = [];
let mode = "show";
let step = 0;
let timer = 0;
let lit = -1;
let litTime = 0;
let last = "";

function addStep() {
  seq.push(rng(0, 3));
  mode = "show";
  step = 0;
  timer = 60;
}
addStep();

gameloop(function () {
  litTime -= 1;
  if (litTime <= 0) { lit = -1; }

  if (mode === "show") {
    // flash the pattern, a little faster each level
    timer -= 1;
    if (timer <= 0) {
      if (step < seq.length) {
        lit = seq[step];
        litTime = 22;
        step += 1;
        timer = 40 - seq.length;
        if (timer < 26) { timer = 26; }
      } else {
        mode = "play";
        step = 0;
      }
    }
  } else if (mode === "play") {
    let choice = -1;
    let key = "";
    for (let i = 0; i <= 3; i++) {
      let p = pads[i];
      if (pressed(p[3])) { key = p[3]; }
      if (eq(key, p[3]) && !eq(last, key)) { choice = i; }
      if (tapped() && bonk(tapx(), tapy(), 1, 1, p[0], p[1], 140, 85)) { choice = i; }
    }
    last = key;

    if (choice >= 0) {
      lit = choice;
      litTime = 12;
      if (eq(choice, seq[step])) {
        step += 1;
        if (eq(step, seq.length)) { addStep(); }
      } else {
        mode = "over";
      }
    }
  }

  wipe("#130d20");
  for (let i = 0; i <= 3; i++) {
    let p = pads[i];
    box(p[0], p[1], 140, 85, p[2]);
    if (!eq(i, lit)) { box(p[0], p[1], 140, 85, "rgba(19, 13, 32, 0.72)"); }
  }
  write("level " + seq.length, 8, 8, "white", 16);
  if (mode === "show") { sprite("watch 👀", 200, 147, 16, "#a79cc2"); }
  if (mode === "play") { sprite("your turn", 200, 147, 16, "white"); }

  if (mode === "over") {
    box(0, 118, 400, 64, "#1d1631");
    center("GG 💀 you made it to level " + seq.length, 126, "white", 22);
    center("press Restart to play again", 158, "#a79cc2", 14);
    gg();
  }
});
