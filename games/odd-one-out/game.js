/*
  Odd One Out
  -----------
  Goal: All the emojis are the same except one. Find it and tap it before the timer runs out.
  Levels: Every find = level up. The grid gets bigger, and from level 4 the difference is sneaky (😀 vs 😃).
  Lose: Tapping the wrong one or running out of time costs a ❤️. The odd one gets circled so you can see it.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// ODD ONE OUT: every emoji is the same except ONE. Find it and tap it fast!
// the grid gets bigger and the difference gets sneakier · 3 hearts
let easy = [["🐶", "🐱"], ["🍎", "🍊"], ["⚽", "🏀"], ["🚗", "🚕"], ["🌞", "🌝"], ["🐸", "🐢"]];
let hard = [["😀", "😃"], ["😐", "😑"], ["🙂", "🙃"], ["🍏", "🍎"], ["💙", "💜"], ["⭐", "🌟"], ["🐟", "🐠"], ["😺", "😸"], ["🌑", "🌚"], ["🕐", "🕑"], ["🔵", "🟣"]];
let level = 1;
let lives = 3;
let best = 0;
let cols = 3;
let rows = 3;
let cell = 0;
let ox = 0;
let oy = 0;
let odd = 0;
let pair = [];
let limit = 600;
let timer = 0;
let reveal = 0;
let lastGood = false;
let state = "start";
let wait = 0;

function newRound() {
  cols = 3 + Math.floor(level / 2);
  if (cols > 8) { cols = 8; }
  rows = 3 + Math.floor(level / 3);
  if (rows > 5) { rows = 5; }
  cell = Math.floor(360 / cols);
  if (Math.floor(250 / rows) < cell) { cell = Math.floor(250 / rows); }
  ox = (400 - cols * cell) / 2;
  oy = 40 + (256 - rows * cell) / 2;
  if (level < 4) {
    pair = easy[rng(0, easy.length - 1)];
  } else {
    pair = hard[rng(0, hard.length - 1)];
  }
  // sometimes swap which one is the odd one
  if (rng(0, 1) === 1) { pair = [pair[1], pair[0]]; }
  odd = rng(0, cols * rows - 1);
  limit = 600 - level * 25;
  if (limit < 240) { limit = 240; }
  timer = limit;
}

gameloop(function () {
  let ts = taps();
  wait -= 1;
  if (state !== "play") {
    if (wait <= 0 && (ts.length > 0 || justpressed("space"))) {
      level = 1;
      lives = 3;
      state = "play";
      reveal = 0;
      newRound();
    }
  } else if (reveal > 0) {
    reveal -= 1;
    if (reveal === 0) {
      if (lives <= 0) {
        state = "over";
        wait = 40;
      } else {
        newRound();
      }
    }
  } else {
    timer -= 1;
    for (const t of ts) {
      let c = Math.floor((t[0] - ox) / cell);
      let r = Math.floor((t[1] - oy) / cell);
      if (reveal === 0 && c >= 0 && c < cols && r >= 0 && r < rows) {
        if (eq(r * cols + c, odd)) {
          level += 1;
          if (level - 1 > best) { best = level - 1; }
          lastGood = true;
          reveal = 25;
        } else {
          lives -= 1;
          lastGood = false;
          reveal = 60;
        }
      }
    }
    if (reveal === 0 && timer <= 0) {
      lives -= 1;
      lastGood = false;
      reveal = 60;
    }
  }

  wipe("#1d1631");
  write("level " + level, 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);
  if (lives > 0) { sprite("❤️".repeat(Math.max(0, lives)), 392 - lives * 9, 16, 16); }
  if (state === "play") {
    box(110, 12, 180, 6, "#372d55");
    box(110, 12, 180 * timer / limit, 6, "#ffb469");
    for (let i = 0; i <= cols * rows - 1; i++) {
      let x = ox + i % cols * cell + cell / 2;
      let y = oy + Math.floor(i / cols) * cell + cell / 2;
      if (reveal > 0 && eq(i, odd)) {
        let c = "#ff4d6d";
        if (lastGood) { c = "#5fd69b"; }
        bubble(x, y, cell * 0.48, c);
      }
      let e = pair[0];
      if (eq(i, odd)) { e = pair[1]; }
      sprite(e, x, y + 1, cell * 0.62);
    }
    if (reveal > 0 && !lastGood) { sprite("it was this one 👆", 200, 290, 12, "#ff4d6d"); }
  }
  if (state === "start") {
    box(0, 90, 400, 110, "#130d20");
    center("ODD ONE OUT 🔍", 102, "white", 30);
    center("one emoji is different. find it before time runs out", 144, "#ffb469", 13);
    center("tap to start", 170, "#a79cc2", 13);
  }
  if (state === "over") {
    box(0, 90, 400, 110, "#130d20");
    center("GG 🧠 you reached level " + level, 104, "white", 24);
    center("best " + best, 140, "#ffb469", 14);
    if (wait <= 0) { center("tap to play again", 168, "#a79cc2", 13); }
  }
});
