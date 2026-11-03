/*
  Memory
  ------
  Goal: Find all the matching emoji pairs, then level up.
  How: Tap or click two cards. A match stays face up. If they don't match, they flip back.
  Peek: Each level starts by showing every card so you can memorize them. Bigger levels give you more time.
  Levels: 6 levels: 6, 8, 12, 16, 20, then 24 cards. Memorize time: 4, 6, 9, 12, 15, then 18 seconds.
  Stars: ⭐⭐⭐ for finishing in about one move per pair. Collect up to 18 stars across all 6 levels.
  Next: Tap or press space after a level to start the next one.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// MEMORY: match the emoji pairs. Every level adds more cards!
// tap or click two cards to flip them
let emojis = ["🐸", "🦄", "🍕", "👾", "🧋", "🔥", "💅", "🐐", "🌮", "🎧", "🛹", "🍩"];
let sizes = [[3, 2], [4, 2], [4, 3], [4, 4], [5, 4], [6, 4]];
// seconds to memorize the cards on each level (more cards, more time)
let peekTimes = [4, 6, 9, 12, 15, 18];
let level = 0;
let cols = 0;
let rows = 0;
let cw = 0;
let ch = 0;
let x0 = 0;
let y0 = 0;
let cards = [];
let open = [];
let picks = [];
let wait = 0;
let peek = 0;
let moves = 0;
let found = 0;
let stars = 0;
let totalStars = 0;
let state = "play";

// mix up a list
function shuffle(list) {
  for (let i = list.length - 1; i >= 1; i--) {
    let j = rng(0, i);
    let tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
}

function startLevel(n) {
  level = n;
  cols = sizes[n - 1][0];
  rows = sizes[n - 1][1];
  let count = cols * rows;

  // pick random emojis, two of each
  shuffle(emojis);
  cards = [];
  for (let i = 0; i <= count / 2 - 1; i++) {
    cards.push(emojis[i]);
    cards.push(emojis[i]);
  }
  shuffle(cards);
  open = [];
  for (let i = 0; i <= count - 1; i++) {
    open.push(false);
  }
  picks = [];
  wait = 0;
  moves = 0;
  found = 0;

  // you get a peek at the start, longer on bigger levels
  peek = peekTimes[n - 1] * 60;

  // make the cards fit the screen
  cw = Math.floor((380 - (cols - 1) * 8) / cols);
  if (cw > 72) { cw = 72; }
  ch = Math.floor((262 - (rows - 1) * 8) / rows);
  if (ch > 58) { ch = 58; }
  x0 = (400 - cols * cw - (cols - 1) * 8) / 2;
  y0 = 30 + (266 - rows * ch - (rows - 1) * 8) / 2;
  state = "play";
}

// which card is at x, y? (-1 if none)
function cardAt(x, y) {
  let c = Math.floor((x - x0) / (cw + 8));
  let r = Math.floor((y - y0) / (ch + 8));
  if (c < 0 || c >= cols || r < 0 || r >= rows) { return -1; }
  if (x - x0 - c * (cw + 8) > cw || y - y0 - r * (ch + 8) > ch) { return -1; }
  return r * cols + c;
}

function pick(i) {
  if (i < 0 || wait > 0 || picks.length >= 2) { return; }
  if (open[i]) { return; }
  if (picks.length === 1 && eq(picks[0], i)) { return; }
  picks.push(i);
  if (picks.length === 2) {
    moves += 1;
    if (eq(cards[picks[0]], cards[picks[1]])) {
      open[picks[0]] = true;
      open[picks[1]] = true;
      found += 1;
      picks = [];
    } else {
      wait = 40;
    }
  }
}

startLevel(1);

gameloop(function () {
  let ts = taps();

  if (state === "play") {
    if (peek > 0) {
      peek -= 1;
    } else if (wait > 0) {
      wait -= 1;
      if (wait === 0) { picks = []; }
    } else {
      for (const t of ts) {
        pick(cardAt(t[0], t[1]));
      }
    }

    // level cleared: stars for using few moves
    if (eq(found, cards.length / 2)) {
      stars = 1;
      if (moves <= found * 2) { stars = 2; }
      if (moves <= found + 2) { stars = 3; }
      totalStars += stars;
      state = "cleared";
      wait = 30;
    }
  } else if (state === "cleared") {
    wait -= 1;
    if (wait <= 0 && (ts.length > 0 || justpressed("space"))) {
      if (eq(level, sizes.length)) {
        state = "done";
      } else {
        startLevel(level + 1);
      }
    }
  }

  wipe("#1d1631");
  for (let i = 0; i <= cards.length - 1; i++) {
    let x = x0 + i % cols * (cw + 8);
    let y = y0 + Math.floor(i / cols) * (ch + 8);
    let up = open[i] || peek > 0;
    for (const p of picks) {
      if (eq(p, i)) { up = true; }
    }
    if (up) {
      let bg = "#f1ecfb";
      if (open[i]) { bg = "#d4f5e4"; }
      box(x, y, cw, ch, bg);
      sprite(cards[i], x + cw / 2, y + ch / 2 + 1, ch * 0.58);
    } else {
      box(x, y, cw, ch, "#7b3fd6");
      sprite("?", x + cw / 2, y + ch / 2 + 1, ch * 0.4, "#c9a4ff");
    }
  }

  write("level " + level + "/" + sizes.length, 8, 8, "white", 14);
  if (peek > 0) {
    sprite("memorize! " + (Math.floor(peek / 60) + 1), 200, 15, 14, "#ffb469");
  } else {
    sprite("moves " + moves, 200, 15, 14, "#a79cc2");
  }
  write("⭐ " + totalStars, 345, 8, "#ffd84d", 14);

  if (state === "cleared") {
    box(0, 118, 400, 64, "#130d20");
    center("level " + level + " cleared " + "⭐".repeat(Math.max(0, stars)), 126, "white", 22);
    if (level < sizes.length) {
      center("tap or press space for level " + (level + 1) + " · " + sizes[level][0] * sizes[level][1] + " cards", 160, "#a79cc2", 14);
    } else {
      center("tap or press space to finish", 160, "#a79cc2", 14);
    }
  }
  if (state === "done") {
    box(0, 118, 400, 64, "#130d20");
    center("you beat all " + sizes.length + " levels 🏆", 126, "white", 22);
    center("total stars: " + totalStars + " of " + sizes.length * 3 + " · press Restart to play again", 160, "#ffd84d", 14);
    gg();
  }
});
