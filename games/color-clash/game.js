/*
  Color Clash
  -----------
  Goal: Decide if the word's COLOR matches what the word SAYS. RED in red = match. RED in blue = no match.
  Controls: Tap ✅ match or ❌ no match. Keys: ← or Y = match, → or N = no match.
  Speed: You start with 3 seconds per word, and it gets faster as your score climbs.
  Lose: A wrong answer or running out of time costs a ❤️. You have 3 hearts.
  Why: Your brain reads the word before it sees the color. This is a famous brain test called the Stroop effect.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// COLOR CLASH: does the COLOR of the word match what the word SAYS?
// "RED" in red = match ✅ · "RED" in blue = no match ❌
// tap a button, or press ← (match) and → (no match). Be quick!
let colors = [["RED", "#ff4d6d"], ["BLUE", "#4dabff"], ["GREEN", "#5fd69b"], ["YELLOW", "#ffd84d"], ["PURPLE", "#b57bff"], ["ORANGE", "#ff9f1c"]];
let word = 0;
let ink = 0;
let limit = 180;
let timer = 0;
let score = 0;
let streak = 0;
let best = 0;
let lives = 3;
let state = "start";
let flash = 0;
let flashGood = false;
let wait = 0;

function newQuestion() {
  word = rng(0, 5);
  ink = word;
  // about half the time, use a different color
  if (rng(0, 1) === 1) {
    while (eq(ink, word)) {
      ink = rng(0, 5);
    }
  }
  // less time as your score goes up (3 sec down to 1.2 sec)
  limit = 180 - score * 6;
  if (limit < 72) { limit = 72; }
  timer = limit;
}

function answer(saysMatch) {
  let right = eq(saysMatch, eq(word, ink));
  flash = 18;
  flashGood = right;
  if (right) {
    score += 1;
    streak += 1;
    if (score > best) { best = score; }
  } else {
    lives -= 1;
    streak = 0;
  }
  if (lives <= 0) {
    state = "over";
    wait = 40;
  } else {
    newQuestion();
  }
}

gameloop(function () {
  let ts = taps();
  flash -= 1;
  wait -= 1;
  if (state === "start" || state === "over") {
    if (wait <= 0 && (ts.length > 0 || justpressed("space"))) {
      score = 0;
      streak = 0;
      lives = 3;
      state = "play";
      newQuestion();
    }
  } else {
    let pick = -1;
    if (justpressed("left") || justpressed("y")) { pick = 1; }
    if (justpressed("right") || justpressed("n")) { pick = 0; }
    for (const t of ts) {
      if (t[1] > 200 && t[1] < 280) {
        pick = 0;
        if (t[0] < 200) { pick = 1; }
      }
    }
    if (pick >= 0) {
      answer(pick === 1);
    } else {
      timer -= 1;
      if (timer <= 0) {
        // too slow counts as wrong
        lives -= 1;
        streak = 0;
        flash = 18;
        flashGood = false;
        if (lives <= 0) {
          state = "over";
          wait = 40;
        } else {
          newQuestion();
        }
      }
    }
  }

  wipe("#1d1631");
  if (flash > 0 && flashGood) { box(0, 0, 400, 300, "rgba(95, 214, 155, 0.18)"); }
  if (flash > 0 && !flashGood) { box(0, 0, 400, 300, "rgba(255, 90, 168, 0.22)"); }
  write("score " + score, 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);
  if (streak >= 3) { sprite("🔥 x" + streak, 200, 18, 15, "#ffb469"); }
  if (lives > 0) { sprite("❤️".repeat(Math.max(0, lives)), 392 - lives * 9, 16, 16); }

  if (state === "play") {
    sprite("does the color match the word?", 200, 56, 13, "#a79cc2");
    sprite(colors[word][0], 200, 110, 58, colors[ink][1]);
    box(40, 160, 320, 8, "#372d55");
    box(40, 160, 320 * timer / limit, 8, "#ffb469");
  }
  box(30, 205, 165, 70, "#2e5a46");
  sprite("✅ match", 112, 232, 20, "white");
  sprite("← or Y", 112, 258, 11, "#b6ffd4");
  box(205, 205, 165, 70, "#7a2348");
  sprite("❌ no match", 287, 232, 20, "white");
  sprite("→ or N", 287, 258, 11, "#ffc2dc");

  if (state === "start") {
    box(0, 60, 400, 110, "#130d20");
    center("COLOR CLASH 🧠", 72, "white", 28);
    center("is the word's COLOR the same as what it SAYS?", 112, "#ffb469", 14);
    center("tap to start", 140, "#a79cc2", 13);
  }
  if (state === "over") {
    box(0, 60, 400, 110, "#130d20");
    center("GG 🧠 score " + score, 76, "white", 28);
    center("best " + best + " · tap to play again", 122, "#a79cc2", 14);
  }
});
