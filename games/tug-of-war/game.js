/*
  Tug of War · 2 players
  ----------------------
  Goal: Pull the 🚩 flag all the way to your side.
  Pink: Mash A, or keep tapping the left half.
  Blue: Mash L, or keep tapping the right half.
  How: Wait for 3-2-1. Every press pulls the flag one step toward you.
  Win: The flag reaches your colored zone. Press or tap again for a rematch.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// TUG OF WAR · 2 players · mash your button as fast as you can!
// PINK: A key or tap the left side · BLUE: L key or tap the right side
let rope = 0;
let count = 180;
let result = "";
let wait = 0;
let pinkWins = 0;
let blueWins = 0;

gameloop(function () {
  // count every press and tap this frame
  let lc = 0;
  let rc = 0;
  if (justpressed("a")) { lc += 1; }
  if (justpressed("l")) { rc += 1; }
  for (const t of taps()) {
    if (t[0] < 200) { lc += 1; } else { rc += 1; }
  }

  if (count > 0) {
    count -= 1;
  } else if (result === "") {
    rope += (rc - lc) * 4;
    if (rope <= -100) {
      result = "PINK wins 💪";
      pinkWins += 1;
      wait = 60;
    }
    if (rope >= 100) {
      result = "BLUE wins 💪";
      blueWins += 1;
      wait = 60;
    }
  } else {
    wait -= 1;
    if (wait <= 0 && lc + rc > 0) {
      rope = 0;
      count = 180;
      result = "";
    }
  }

  wipe("#1d1631");
  box(0, 0, 40, 300, "#3a1430");
  box(360, 0, 40, 300, "#14304a");
  box(198, 120, 4, 90, "#4a3f6b");
  // the flag moves toward whoever is winning
  let mid = 200 + rope * 1.6;
  box(30, 163, 340, 5, "#ffb469");
  box(mid - 2, 150, 4, 30, "white");
  sprite("🚩", mid + 8, 140, 26);
  sprite("😤", 30, 165, 40);
  sprite("😤", 370, 165, 40);
  write("PINK " + pinkWins, 8, 8, "#ff5aa8", 16);
  write("BLUE " + blueWins, 330, 8, "#7fd3ff", 16);

  if (count > 0) {
    sprite(Math.floor(count / 60) + 1, 200, 70, 48, "white");
  } else if (result === "") {
    sprite("MASH! 🔥", 200, 70, 30, "#ffb469");
  } else {
    center(result, 230, "white", 26);
    if (wait <= 0) {
      center("tap or press A / L for a rematch", 266, "#a79cc2", 14);
    }
  }
});
