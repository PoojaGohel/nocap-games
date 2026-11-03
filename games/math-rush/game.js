/*
  Math Rush
  ---------
  Goal: Solve each sum before the orange bar runs out.
  Controls: Tap the right answer, or press 1 2 3 4.
  Levels: Every 5 right answers = level up. Level 1 is +, level 2 adds −, level 3 is ×, and level 4+ mixes everything including ÷.
  Lose: A wrong answer or running out of time costs a ❤️. The right answer flashes green.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// MATH RUSH: solve as fast as you can! Tap the right answer (or press 1-4)
// every 5 right answers = level up: + then − then × then ÷ and bigger numbers
let level = 1;
let score = 0;
let best = 0;
let streak = 0;
let lives = 3;
let a = 0;
let b = 0;
let op = "+";
let ans = 0;
let options = [];
let limit = 300;
let timer = 0;
let picked = -1;
let reveal = 0;
let state = "start";
let wait = 0;

function shuffle(list) {
  for (let i = list.length - 1; i >= 1; i--) {
    let j = rng(0, i);
    let tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
}

function newQ() {
  let kind = 0;
  if (level === 2) { kind = rng(0, 1); }
  if (level === 3) { kind = 2; }
  if (level >= 4) { kind = rng(0, 3); }
  let big = 10 + level * 5;
  if (kind === 0) {
    a = rng(1, big);
    b = rng(1, big);
    op = "+";
    ans = a + b;
  }
  if (kind === 1) {
    a = rng(5, big + 10);
    b = rng(1, a);
    op = "−";
    ans = a - b;
  }
  if (kind === 2) {
    a = rng(2, 9 + Math.floor(level / 3));
    b = rng(2, 10);
    op = "×";
    ans = a * b;
  }
  if (kind === 3) {
    b = rng(2, 9);
    ans = rng(2, 10);
    a = b * ans;
    op = "÷";
  }
  // 3 wrong answers that look believable
  options = [ans];
  while (options.length < 4) {
    let fake = ans + rng(-10, 10);
    let ok = fake >= 0;
    for (const o of options) {
      if (eq(o, fake)) { ok = false; }
    }
    if (ok) { options.push(fake); }
  }
  shuffle(options);
  limit = 330 - level * 30;
  if (limit < 150) { limit = 150; }
  timer = limit;
  picked = -1;
}

function answer(i) {
  picked = i;
  reveal = 40;
  if (i >= 0 && eq(options[i], ans)) {
    score += 1;
    streak += 1;
    if (score > best) { best = score; }
    if (score % 5 === 0) { level += 1; }
  } else {
    lives -= 1;
    streak = 0;
  }
}

gameloop(function () {
  let ts = taps();
  wait -= 1;
  if (state !== "play") {
    if (wait <= 0 && (ts.length > 0 || justpressed("space"))) {
      level = 1;
      score = 0;
      streak = 0;
      lives = 3;
      state = "play";
      newQ();
    }
  } else if (reveal > 0) {
    // show the right answer for a moment
    reveal -= 1;
    if (reveal === 0) {
      if (lives <= 0) {
        state = "over";
        wait = 40;
      } else {
        newQ();
      }
    }
  } else {
    let pick = -1;
    for (let k = 1; k <= 4; k++) {
      if (justpressed(String(k))) { pick = k - 1; }
    }
    for (const t of ts) {
      let c = Math.floor((t[0] - 30) / 175);
      let r = Math.floor((t[1] - 150) / 70);
      if (c >= 0 && c <= 1 && r >= 0 && r <= 1 && t[0] - 30 - c * 175 < 165) { pick = r * 2 + c; }
    }
    if (pick >= 0) {
      answer(pick);
    } else {
      timer -= 1;
      if (timer <= 0) { answer(-1); }
    }
  }

  wipe("#1d1631");
  write("score " + score, 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);
  sprite("level " + level, 200, 16, 14, "#ffb469");
  if (lives > 0) { sprite("❤️".repeat(Math.max(0, lives)), 392 - lives * 9, 16, 16); }
  if (streak >= 3) { sprite("🔥 " + streak + " in a row", 200, 36, 12, "#ffd84d"); }

  if (state === "play") {
    sprite(a + " " + op + " " + b + " = ?", 200, 90, 44, "white");
    box(40, 128, 320, 6, "#372d55");
    box(40, 128, 320 * timer / limit, 6, "#ffb469");
    for (let i = 0; i <= 3; i++) {
      let x = 30 + i % 2 * 175;
      let y = 150 + Math.floor(i / 2) * 70;
      let c = "#372d55";
      if (reveal > 0 && eq(options[i], ans)) { c = "#2e8a5a"; }
      if (reveal > 0 && eq(i, picked) && !eq(options[i], ans)) { c = "#a3265a"; }
      box(x, y, 165, 60, c);
      sprite(options[i], x + 82, y + 31, 26, "white");
      write(i + 1, x + 6, y + 4, "#8f84ab", 11);
    }
    if (reveal > 0 && picked === -1) { sprite("⏰ too slow!", 200, 290, 13, "#ff4d6d"); }
  }
  if (state === "start") {
    box(0, 90, 400, 110, "#130d20");
    center("MATH RUSH ➗", 102, "white", 30);
    center("tap the right answer before the bar runs out", 144, "#ffb469", 13);
    center("tap to start", 170, "#a79cc2", 13);
  }
  if (state === "over") {
    box(0, 90, 400, 110, "#130d20");
    center("GG 🧠 " + score + " solved · level " + level, 104, "white", 24);
    center("best " + best, 140, "#ffb469", 14);
    if (wait <= 0) { center("tap to play again", 168, "#a79cc2", 13); }
  }
});
