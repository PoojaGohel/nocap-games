/*
  Flappy Dunk
  -----------
  Goal: Flap the 🏀 through every hoop. Missing a hoop ends the game.
  Controls: Tap, or press space / ↑, to flap.
  Score: +1 per hoop. Go through without touching the rim for a SWISH (+2). Swishes in a row build a 🔥 streak.
  Rims: The red rims are solid. The ball bounces off them.
  Lose: Missing a hoop, or hitting the floor.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// FLAPPY DUNK: tap to flap the 🏀 through every hoop!
// miss a hoop = game over · go through clean (no rim touch) for a SWISH +2
let BX = 110;
let H = 70;
let by = 140;
let vy = 0;
let hoops = [];
let frames = 0;
let score = 0;
let best = 0;
let streak = 0;
let popup = "";
let popT = 0;
let why = "";
let state = "start";
let wait = 0;

function reset() {
  by = 140;
  vy = 0;
  hoops = [];
  frames = 0;
  score = 0;
  streak = 0;
  state = "play";
}

// bounce off a rim (a small solid ball at the top or bottom of the hoop)
function rim(h, ry) {
  let dx = BX - h[0];
  let dy = by - ry;
  if (dx * dx + dy * dy < 17 * 17) {
    h[3] = true;
    if (dy < 0) {
      vy = -Math.abs(vy) * 0.6 - 0.5;
      by -= 2;
    } else {
      vy = Math.abs(vy) * 0.6;
      by += 2;
    }
  }
}

gameloop(function () {
  let flap = tapped() || justpressed("space") || justpressed("up");
  wait -= 1;
  popT -= 1;

  if (state !== "play") {
    if (wait <= 0 && flap) {
      reset();
      vy = -5.5;
    }
  } else {
    frames += 1;
    if (flap) { vy = -5.5; }
    vy += 0.32;
    by += vy;
    if (by < 12) {
      by = 12;
      vy = 0;
    }
    if (frames % 100 === 1) {
      let hy = rng(80, 230);
      hoops.push([430, hy, false, false]);
    }
    let keep = [];
    for (const h of hoops) {
      h[0] -= 2.4;
      rim(h, h[1] - H / 2);
      rim(h, h[1] + H / 2);
      // the hoop passed you: were you inside it?
      if (!h[2] && h[0] < BX) {
        h[2] = true;
        if (by > h[1] - H / 2 && by < h[1] + H / 2) {
          if (h[3]) {
            score += 1;
            streak = 0;
            popup = "+1";
          } else {
            streak += 1;
            score += 2;
            popup = "SWISH +2 🔥";
            if (streak >= 3) { popup = "SWISH x" + streak + " 🔥🔥"; }
          }
          popT = 40;
        } else {
          state = "over";
          why = "you missed the hoop";
        }
      }
      if (h[0] > -30) { keep.push(h); }
    }
    hoops = keep;
    if (by > 285) {
      state = "over";
      why = "you hit the floor";
    }
    if (state === "over") {
      wait = 40;
      if (score > best) { best = score; }
    }
  }

  wipe("#2a1f45");
  box(0, 285, 400, 15, "#c25a00");
  for (let i = 0; i <= 9; i++) {
    box(i * 44, 285, 2, 15, "#9a4600");
  }
  // back half of each hoop, then the ball, then the front half (looks 3D)
  for (const h of hoops) {
    for (let k = 0; k <= 5; k++) {
      let a1 = 90 + k * 30;
      let a2 = a1 + 30;
      line(h[0] + cos(a1) * 9, h[1] + sin(a1) * H / 2, h[0] + cos(a2) * 9, h[1] + sin(a2) * H / 2, "#a3265a", 4);
    }
  }
  sprite("🏀", BX, by, 26);
  for (const h of hoops) {
    for (let k = 0; k <= 5; k++) {
      let a1 = -90 + k * 30;
      let a2 = a1 + 30;
      line(h[0] + cos(a1) * 9, h[1] + sin(a1) * H / 2, h[0] + cos(a2) * 9, h[1] + sin(a2) * H / 2, "#ff4d6d", 4);
    }
  }
  sprite(score, 200, 30, 34, "white");
  write("best " + best, 8, 8, "#c9a4ff", 12);
  if (popT > 0) { sprite(popup, BX + 40, by - 34, 15, "#ffd84d"); }

  if (state === "start") {
    box(0, 110, 400, 80, "rgba(19, 13, 32, 0.92)");
    center("FLAPPY DUNK 🏀", 120, "white", 28);
    center("tap to flap through every hoop · tap to start", 158, "#ffb469", 13);
  }
  if (state === "over") {
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.92)");
    center("💀 " + why + " · score " + score + " · best " + best, 257, "white", 16);
    if (wait <= 0) { center("tap to play again", 280, "#a79cc2", 12); }
  }
});
