/*
  Catch
  -----
  Goal: Catch the falling snacks in your 🧺 basket.
  Keys: ← → to move.
  Phone: Drag your finger.
  Score: +1 per snack. Missing a snack is fine.
  Lose: You have 3 lives. Every 💣 you catch costs one.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// CATCH: move with the arrow keys or drag
// catch the snacks, but NOT the bombs
let px = 200;
let items = [];
let snacks = ["🍕", "🍩", "🍓", "🧋", "🍔"];
let score = 0;
let lives = 3;
let frames = 0;

gameloop(function () {
  frames += 1;
  if (pressed("left")) { px -= 7; }
  if (pressed("right")) { px += 7; }
  if (holding()) { px = tapx(); }
  if (px < 25) { px = 25; }
  if (px > 375) { px = 375; }

  // drop something every 40 frames, 1 in 4 is a bomb
  if (frames % 40 === 0) {
    let thing = snacks[rng(0, snacks.length - 1)];
    if (rng(1, 4) === 1) { thing = "💣"; }
    items.push([rng(20, 380), -20, thing, 2 + frames / 900]);
  }

  let keep = [];
  for (const it of items) {
    it[1] += it[3];
    if (bonk(px - 26, 252, 52, 30, it[0] - 12, it[1] - 12, 24, 24)) {
      if (it[2] === "💣") {
        lives -= 1;
      } else {
        score += 1;
      }
    } else if (it[1] < 320) {
      keep.push(it);
    }
  }
  items = keep;

  wipe("#1d1631");
  for (const it of items) {
    sprite(it[2], it[0], it[1], 26);
  }
  sprite("🧺", px, 266, 44);
  write("snacks " + score, 8, 8, "white", 14);
  write("lives " + lives, 336, 8, "#ff5aa8", 14);

  if (lives <= 0) {
    center("GG 💀 bombs got you", 120, "white", 26);
    center("you caught " + score + " snacks", 160, "#ffb469", 18);
    gg();
  }
});
