/*
  Word Guess
  ----------
  Goal: Find the hidden word one letter at a time before you run out of ❤️.
  Hint: The emoji above the word tells you what kind of thing it is.
  Controls: Type a letter on your keyboard, or tap one on the screen.
  Lives: Every wrong letter costs a ❤️. You have 6.
  Streak: Guess words in a row to build your streak 🔥.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// WORD GUESS · type or tap letters to find the word
let words = [
  ["PIZZA", "🍕 food"], ["BANANA", "🍌 fruit"], ["CUPCAKE", "🧁 sweet treat"], ["PANCAKE", "🥞 breakfast"],
  ["PENGUIN", "🐧 animal"], ["OCTOPUS", "🐙 sea animal"], ["GIRAFFE", "🦒 animal"], ["DOLPHIN", "🐬 sea animal"],
  ["KOALA", "🐨 animal"], ["DRAGON", "🐉 legend"], ["UNICORN", "🦄 legend"], ["WIZARD", "🧙 magic"],
  ["PIRATE", "🏴‍☠️ adventure"], ["TREASURE", "💰 adventure"], ["ROCKET", "🚀 space"], ["PLANET", "🪐 space"],
  ["GALAXY", "🌌 space"], ["VOLCANO", "🌋 nature"], ["RAINBOW", "🌈 weather"], ["THUNDER", "⛈️ weather"],
  ["JUNGLE", "🌴 place"], ["CASTLE", "🏰 place"], ["LIBRARY", "📚 place"], ["GUITAR", "🎸 music"],
  ["TRUMPET", "🎺 music"], ["SOCCER", "⚽ sport"], ["BICYCLE", "🚲 ride"], ["HELICOPTER", "🚁 ride"],
  ["SNOWMAN", "⛄ winter"], ["CAMPFIRE", "🔥 outdoors"], ["BACKPACK", "🎒 school"], ["NOTEBOOK", "📓 school"],
  ["PUZZLE", "🧩 game"], ["TROPHY", "🏆 winning"], ["BALLOON", "🎈 party"], ["POPCORN", "🍿 movie snack"],
  ["SANDWICH", "🥪 food"], ["AVOCADO", "🥑 food"], ["CACTUS", "🌵 plant"], ["SUNFLOWER", "🌻 plant"],
];
let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let KW = 28;
let KH = 30;
let KX = 18;
let KY = [196, 232];

let word = "";
let hint = "";
let guessed = [];
let lives = 6;
let state = "play";
let streak = 0;
let best = 0;
let wait = 0;
let shake = 0;
let lastWord = -1;

function newWord() {
  let i = rng(0, words.length - 1);
  while (i === lastWord) { i = rng(0, words.length - 1); }
  lastWord = i;
  word = words[i][0];
  hint = words[i][1];
  guessed = [];
  lives = 6;
  state = "play";
  wait = 0;
}
newWord();

function found() {
  for (const ch of word) {
    if (!guessed.includes(ch)) { return false; }
  }
  return true;
}

function guess(ch) {
  if (state !== "play" || guessed.includes(ch)) { return; }
  guessed.push(ch);
  if (!word.includes(ch)) {
    lives -= 1;
    shake = 12;
    if (lives === 0) {
      state = "lost";
      streak = 0;
    }
  } else if (found()) {
    state = "won";
    streak += 1;
    if (streak > best) { best = streak; }
  }
}

// where letter k sits on the on-screen keyboard
function keySpot(k) {
  let row = Math.floor(k / 13);
  let col = k % 13;
  return [KX + col * KW, KY[row]];
}

gameloop(function () {
  if (state === "play") {
    for (const ch of letters) {
      if (justpressed(ch.toLowerCase())) { guess(ch); }
    }
    if (tapped()) {
      for (let k = 0; k < 26; k++) {
        let p = keySpot(k);
        if (tapx() >= p[0] && tapx() < p[0] + KW - 2 && tapy() >= p[1] && tapy() < p[1] + KH - 2) {
          guess(letters[k]);
        }
      }
    }
  } else {
    wait += 1;
    if (wait > 40 && (tapped() || justpressed("space"))) { newWord(); }
  }
  if (shake > 0) { shake -= 1; }

  wipe("#1d1631");
  // lives and streak
  let hearts = "";
  for (let i = 0; i < 6; i++) {
    if (i < lives) { hearts += "❤️"; } else { hearts += "🖤"; }
  }
  sprite(hearts, 80, 20, 14);
  write("streak " + streak + " 🔥", 290, 8, "#ffb469", 13);
  write("best " + best, 290, 26, "#a79cc2", 11);

  sprite(hint, 200, 58, 18, "#c9a4ff");

  // the word
  let n = word.length;
  let w = Math.min(34, 360 / n);
  let x0 = 200 - (n * w) / 2;
  let wobble = 0;
  if (shake > 0) { wobble = sin(shake * 60) * 4; }
  for (let i = 0; i < n; i++) {
    let x = x0 + i * w + w / 2 + wobble;
    box(x - w / 2 + 3, 130, w - 6, 3, "#6a5a96");
    let ch = word[i];
    if (guessed.includes(ch)) {
      sprite(ch, x, 112, 26, "white");
    } else if (state === "lost") {
      sprite(ch, x, 112, 26, "#ff6b6b");
    }
  }

  // keyboard
  for (let k = 0; k < 26; k++) {
    let p = keySpot(k);
    let ch = letters[k];
    let c = "#372d55";
    let t = "white";
    if (guessed.includes(ch)) {
      if (word.includes(ch)) {
        c = "#2f7d5a";
      } else {
        c = "#241b38";
        t = "#5c5078";
      }
    }
    box(p[0], p[1], KW - 2, KH - 2, c);
    sprite(ch, p[0] + (KW - 2) / 2, p[1] + (KH - 2) / 2 + 1, 14, t);
  }

  if (state === "play") {
    center("type or tap a letter", 160, "#a79cc2", 12);
  } else {
    let text = "you got it! 🎉";
    let c = "#5ee6a8";
    if (state === "lost") {
      text = "out of hearts 💀 it was " + word;
      c = "#ff6b6b";
    }
    box(0, 150, 400, 40, "rgba(19, 13, 32, 0.92)");
    center(text, 152, c, 16);
    center("tap or press space for the next word", 172, "#a79cc2", 11);
  }
});
