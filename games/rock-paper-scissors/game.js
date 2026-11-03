/*
  Rock Paper Scissors · vs bot
  ----------------------------
  Goal: Beat the bot to 10 wins. Rock beats scissors, scissors beats paper, paper beats rock.
  Controls: Tap a hand, or press R P S (or 1 2 3).
  The bot: It remembers what you usually play after each hand, and plays whatever beats its guess. It tells you what it guessed.
  Tip: Humans fall into patterns. Try to be random, or set a trap and switch it up.
  Rematch: Tap after a match. The bot keeps its memory of you.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// ROCK PAPER SCISSORS vs a bot that LEARNS your habits
// tap a hand, or press R, P or S. First to 10 wins
let hands = ["🪨", "📄", "✂️"];
let names = ["rock", "paper", "scissors"];
// memory[a][b] = how many times you played b right after a
let memory = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
let last = -1;
let you = 0;
let bot = 0;
let ties = 0;
let yourHand = -1;
let botHand = -1;
let guess = -1;
let result = "";
let cool = 0;
let over = false;
let learned = 0;

// does hand a beat hand b? (paper > rock, scissors > paper, rock > scissors)
function beats(a, b) {
  return (a - b + 3) % 3 === 1;
}

// the bot's brain: guess your next hand from what you did before
function botPick() {
  guess = -1;
  if (last >= 0) {
    let row = memory[last];
    let most = 0;
    for (let i = 0; i <= 2; i++) {
      if (row[i] > most) {
        most = row[i];
        guess = i;
      }
    }
  }
  // sometimes it plays random so you can't trick it easily
  if (guess < 0 || rng(1, 5) === 1) {
    guess = -1;
    return rng(0, 2);
  }
  // play the hand that beats its guess
  return (guess + 1) % 3;
}

function play(h) {
  botHand = botPick();
  yourHand = h;
  if (last >= 0) {
    memory[last][h] += 1;
    learned += 1;
  }
  last = h;
  if (eq(h, botHand)) {
    ties += 1;
    result = "tie 🤝";
  } else if (beats(h, botHand)) {
    you += 1;
    result = "you win this round ✅";
  } else {
    bot += 1;
    result = "the bot wins this round 🤖";
  }
  if (you === 10 || bot === 10) { over = true; }
  cool = 15;
}

gameloop(function () {
  let pick = -1;
  if (justpressed("r") || justpressed("1")) { pick = 0; }
  if (justpressed("p") || justpressed("2")) { pick = 1; }
  if (justpressed("s") || justpressed("3")) { pick = 2; }
  let ts = taps();
  for (const t of ts) {
    let i = Math.floor((t[0] - 20) / 124);
    if (t[1] > 205 && t[1] < 285 && i >= 0 && i <= 2) { pick = i; }
  }
  cool -= 1;

  if (over) {
    // a new match, but the bot still remembers you
    if (cool <= -30 && (pick >= 0 || ts.length > 0)) {
      you = 0;
      bot = 0;
      ties = 0;
      result = "";
      yourHand = -1;
      over = false;
    }
  } else if (pick >= 0 && cool <= 0) {
    play(pick);
  }

  wipe("#1d1631");
  sprite("YOU " + you, 80, 18, 18, "#ff5aa8");
  sprite("ties " + ties, 200, 18, 14, "#a79cc2");
  sprite("BOT " + bot, 320, 18, 18, "#7fd3ff");

  if (yourHand >= 0) {
    sprite(hands[yourHand], 110, 92, 64);
    sprite("vs", 200, 92, 20, "#a79cc2");
    sprite(hands[botHand], 290, 92, 64);
    sprite("you", 110, 140, 12, "#ff5aa8");
    sprite("bot", 290, 140, 12, "#7fd3ff");
    sprite(result, 200, 164, 17, "white");
    let why = "the bot picked at random 🎲";
    if (guess >= 0) { why = "the bot guessed you'd play " + names[guess] + " 🧠"; }
    sprite(why, 200, 186, 12, "#ffb469");
  } else {
    sprite("pick a hand to start", 200, 92, 18, "white");
    sprite("the bot learns from every move you make 👀", 200, 130, 12, "#a79cc2");
  }

  for (let i = 0; i <= 2; i++) {
    let x = 20 + i * 124;
    box(x, 210, 112, 72, "#372d55");
    sprite(hands[i], x + 56, 238, 34);
    sprite(names[i] + " · " + names[i][0].toUpperCase(), x + 56, 270, 11, "#c9a4ff");
  }

  if (over) {
    let msg = "you beat the bot 🏆";
    if (bot === 10) { msg = "the bot read your mind 🤖"; }
    // shown at the bottom so you can still see the last round
    box(0, 200, 400, 100, "rgba(19, 13, 32, 0.95)");
    center(msg, 210, "white", 24);
    center("final score: YOU " + you + " · BOT " + bot + " · ties " + ties, 242, "#ffb469", 14);
    center("it learned from " + learned + " of your moves · tap for a rematch", 266, "#a79cc2", 12);
  }
});
