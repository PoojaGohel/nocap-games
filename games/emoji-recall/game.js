/*
  Emoji Recall
  ------------
  Goal: Watch the emojis flash one at a time, then tap them back in the same order.
  Controls: Tap the emojis at the bottom, or press 1 to 8.
  Levels: Starts with 3 emojis. Every level adds one more and flashes a little faster.
  Lose: One wrong pick costs a ❤️ and shows the right answer. You have 3 hearts.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// EMOJI RECALL: watch the emojis flash one by one,
// then tap them in the SAME order. Each level adds one more
let pool = ["🐸", "🦄", "🍕", "👾", "🧋", "🔥", "💅", "🐐"];
let level = 1;
let lives = 3;
let best = 0;
let seq = [];
let answers = [];
let step = 0;
let showing = -1;
let state = "show";
let timer = 0;
let speed = 50;

function newRound() {
  seq = [];
  for (let i = 1; i <= level + 2; i++) {
    seq.push(rng(0, 7));
  }
  answers = [];
  step = 0;
  showing = -1;
  timer = 40;
  // flashes get a little faster each level
  speed = 55 - level * 3;
  if (speed < 28) { speed = 28; }
  state = "show";
}
newRound();

gameloop(function () {
  let ts = taps();
  timer -= 1;

  if (state === "show") {
    if (timer <= 0) {
      if (step < seq.length) {
        showing = seq[step];
        step += 1;
        timer = speed;
      } else {
        showing = -1;
        state = "play";
      }
    }
  } else if (state === "play") {
    // tap the palette, or press 1 to 8
    let pick = -1;
    for (let k = 1; k <= 8; k++) {
      if (justpressed(String(k))) { pick = k - 1; }
    }
    for (const t of ts) {
      let c = Math.floor((t[0] - 30) / 88);
      let r = Math.floor((t[1] - 170) / 64);
      if (c >= 0 && c <= 3 && r >= 0 && r <= 1) { pick = r * 4 + c; }
    }
    if (pick >= 0) {
      answers.push(pick);
      if (!eq(pick, seq[answers.length - 1])) {
        lives -= 1;
        state = "bad";
        timer = 100;
      } else if (eq(answers.length, seq.length)) {
        state = "good";
        timer = 45;
      }
    }
  } else if (state === "good" && timer <= 0) {
    if (level > best) { best = level; }
    level += 1;
    newRound();
  } else if (state === "bad" && timer <= 0) {
    if (lives <= 0) {
      state = "over";
    } else {
      newRound();
    }
  } else if (state === "over" && timer < -30 && ts.length > 0) {
    level = 1;
    lives = 3;
    newRound();
  }

  wipe("#1d1631");
  write("level " + level, 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);
  if (lives > 0) { sprite("❤️".repeat(Math.max(0, lives)), 392 - lives * 9, 16, 16); }

  if (state === "show") {
    sprite("watch the order 👀  " + step + " / " + seq.length, 200, 24, 14, "#ffb469");
    // a short blank gap so the same emoji twice still looks like two
    if (showing >= 0 && timer > 8) { sprite(pool[showing], 200, 105, 70); }
  } else {
    // the answer row
    let w = 34;
    if (seq.length * 38 > 380) { w = Math.floor(380 / seq.length) - 4; }
    let sx = (400 - seq.length * (w + 4)) / 2;
    for (let i = 0; i <= seq.length - 1; i++) {
      let bx = sx + i * (w + 4);
      let c = "#372d55";
      if (i < answers.length && eq(answers[i], seq[i])) { c = "#2e5a46"; }
      if (i < answers.length && !eq(answers[i], seq[i])) { c = "#7a2348"; }
      box(bx, 70, w, 44, c);
      if (i < answers.length) { sprite(pool[answers[i]], bx + w / 2, 93, w * 0.7); }
      if ((state === "bad" || state === "over") && i >= answers.length - 1) {
        sprite(pool[seq[i]], bx + w / 2, 132, w * 0.6);
      }
    }
    let say = "tap them in order · " + answers.length + " / " + seq.length;
    if (state === "good") { say = "perfect ✅"; }
    if (state === "bad") { say = "wrong ❌ the right answer is under the row"; }
    sprite(say, 200, 24, 14, "#ffb469");
  }

  // the palette of 8 emojis
  for (let i = 0; i <= 7; i++) {
    let x = 30 + i % 4 * 88;
    let y = 170 + Math.floor(i / 4) * 64;
    box(x, y, 80, 56, "#372d55");
    sprite(pool[i], x + 40, y + 26, 30);
    write(i + 1, x + 4, y + 3, "#8f84ab", 10);
  }

  if (state === "over") {
    box(0, 118, 400, 64, "#130d20");
    center("GG 🧠 you remembered " + (level + 1) + " in a row", 126, "white", 22);
    center("tap to start again", 160, "#a79cc2", 14);
  }
});
