/*
  Unscramble
  ----------
  Goal: The letters of a Gen Z word are mixed up. Put them back in order. CIRZZ → RIZZ.
  Controls: Tap the yellow letters in order, or type them on a keyboard. Backspace or ⌫ undoes.
  Buttons: 🔀 mixes the letters again. 💡 fills in the next letter but costs 5 points.
  Score: 10 points per letter. Words get longer as you solve more. You have 90 seconds.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// UNSCRAMBLE: the letters of a Gen Z word got mixed up. Fix it!
// tap the letters in order, or just type them · 90 seconds
let words = ["sus", "lit", "bet", "rizz", "slay", "vibe", "yeet", "goat", "drip", "mood", "aura", "flex", "stan", "hype", "meme", "chill", "salty", "extra", "sigma", "based", "snack", "bussin", "savage", "bestie", "cringe", "glowup", "periodt", "lowkey"];
let word = "";
let tiles = [];
let answer = [];
let solved = 0;
let score = 0;
let best = 0;
let frames = 0;
let TIME = 5400;
let shake = 0;
let good = 0;
let state = "start";
let wait = 0;
let abc = "abcdefghijklmnopqrstuvwxyz";

function shuffle(list) {
  for (let i = list.length - 1; i >= 1; i--) {
    let j = rng(0, i);
    let tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
}

// a tile is [letter, used]
function newWord() {
  // longer words as you solve more
  let maxLen = 3 + Math.floor(solved / 3);
  let pool = [];
  for (const w of words) {
    if (w.length <= maxLen) { pool.push(w); }
  }
  let pick = pool[rng(0, pool.length - 1)];
  while (eq(pick, word)) {
    pick = pool[rng(0, pool.length - 1)];
  }
  word = pick;
  tiles = [];
  for (const ch of word.split("")) {
    tiles.push([ch, false]);
  }
  let mixed = false;
  while (!mixed) {
    shuffle(tiles);
    let s = "";
    for (const t of tiles) {
      s = s + t[0];
    }
    mixed = !eq(s, word);
  }
  answer = [];
}

function typed() {
  let s = "";
  for (const i of answer) {
    s = s + tiles[i][0];
  }
  return s;
}

function useTile(i) {
  if (tiles[i][1]) { return; }
  tiles[i][1] = true;
  answer.push(i);
  if (eq(answer.length, word.length)) {
    if (eq(typed(), word)) {
      solved += 1;
      score += word.length * 10;
      if (score > best) { best = score; }
      good = 30;
      newWord();
    } else {
      shake = 20;
      for (const t of tiles) {
        t[1] = false;
      }
      answer = [];
    }
  }
}

function undo() {
  if (answer.length > 0) {
    let i = answer.pop();
    tiles[i][1] = false;
  }
}

// hint: fill in the next correct letter (costs 5 points)
function hint() {
  let right = 0;
  let t = typed();
  while (right < t.length && eq(t[right], word[right])) {
    right += 1;
  }
  for (const x of tiles) {
    x[1] = false;
  }
  answer = [];
  for (let k = 0; k <= right; k++) {
    if (k < word.length) {
      let done = false;
      for (let i = 0; i <= tiles.length - 1; i++) {
        if (!done && !tiles[i][1] && eq(tiles[i][0], word[k])) {
          tiles[i][1] = true;
          answer.push(i);
          done = true;
        }
      }
    }
  }
  score -= 5;
  if (score < 0) { score = 0; }
  if (eq(answer.length, word.length)) {
    answer = [];
    for (const x of tiles) {
      x[1] = false;
    }
    solved += 1;
    newWord();
  }
}

gameloop(function () {
  let ts = taps();
  wait -= 1;
  shake -= 1;
  good -= 1;
  if (state !== "play") {
    if (wait <= 0 && (ts.length > 0 || justpressed("space"))) {
      solved = 0;
      score = 0;
      frames = 0;
      word = "";
      state = "play";
      newWord();
    }
  } else {
    frames += 1;
    // typing on a keyboard
    for (let i = 0; i <= 25; i++) {
      let ch = abc[i];
      if (justpressed(ch)) {
        let done = false;
        for (let k = 0; k <= tiles.length - 1; k++) {
          if (!done && !tiles[k][1] && eq(tiles[k][0], ch)) {
            done = true;
            useTile(k);
          }
        }
      }
    }
    if (justpressed("backspace")) { undo(); }

    // tapping
    let n = tiles.length;
    let tx0 = (400 - n * 48 + 8) / 2;
    for (const t of ts) {
      if (t[1] > 140 && t[1] < 190) {
        let i = Math.floor((t[0] - tx0) / 48);
        if (i >= 0 && i < n) { useTile(i); }
      }
      if (t[1] > 222 && t[1] < 266) {
        if (t[0] > 50 && t[0] < 150) { undo(); }
        if (t[0] > 160 && t[0] < 240) {
          shuffle(tiles);
          for (const x of tiles) {
            x[1] = false;
          }
          answer = [];
        }
        if (t[0] > 250 && t[0] < 350) { hint(); }
      }
    }
    if (frames >= TIME) {
      state = "over";
      wait = 45;
    }
  }

  wipe("#1d1631");
  write("score " + score, 8, 8, "white", 15);
  write("best " + best, 8, 27, "#c9a4ff", 12);
  if (state === "play") { sprite(Math.floor((TIME - frames) / 60) + "s", 200, 16, 15, "#ffb469"); }
  write("words " + solved, 330, 8, "#5fd69b", 14);

  if (state === "play") {
    let n = word.length;
    // answer slots
    let ox = (400 - n * 48 + 8) / 2;
    if (shake > 0) { ox += (shake % 4 - 2) * 4; }
    for (let i = 0; i <= n - 1; i++) {
      let c = "#372d55";
      if (shake > 0) { c = "#7a2348"; }
      box(ox + i * 48, 70, 40, 46, c);
      if (i < answer.length) { sprite(tiles[answer[i]][0].toUpperCase(), ox + i * 48 + 20, 94, 24, "white"); }
    }
    // letter tiles
    let tx0 = (400 - tiles.length * 48 + 8) / 2;
    for (let i = 0; i <= tiles.length - 1; i++) {
      if (!tiles[i][1]) {
        box(tx0 + i * 48, 144, 40, 44, "#ffd84d");
        sprite(tiles[i][0].toUpperCase(), tx0 + i * 48 + 20, 167, 24, "#1d1631");
      } else {
        box(tx0 + i * 48, 144, 40, 44, "#2a2140");
      }
    }
    box(50, 224, 100, 40, "#372d55");
    sprite("⌫ undo", 100, 245, 14, "white");
    box(160, 224, 80, 40, "#372d55");
    sprite("🔀 mix", 200, 245, 14, "white");
    box(250, 224, 100, 40, "#372d55");
    sprite("💡 hint -5", 300, 245, 14, "white");
    if (good > 0) { sprite("✅ nice!", 200, 128, 14, "#5fd69b"); }
    sprite("type the letters or tap them · Backspace to undo", 200, 286, 11, "#8f84ab");
  }
  if (state === "start") {
    box(0, 90, 400, 110, "#130d20");
    center("UNSCRAMBLE 🔤", 102, "white", 30);
    center("rebuild the slang word: CIRZZ → RIZZ", 144, "#ffb469", 13);
    center("tap to start", 170, "#a79cc2", 13);
  }
  if (state === "over") {
    box(0, 90, 400, 110, "#130d20");
    center("time! " + solved + " words · " + score + " points", 104, "white", 24);
    center("the last word was " + word.toUpperCase(), 140, "#ffb469", 14);
    if (wait <= 0) { center("tap to play again", 168, "#a79cc2", 13); }
  }
});
