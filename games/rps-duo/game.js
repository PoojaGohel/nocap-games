/*
  Rock Paper Scissors · 2 players
  -------------------------------
  Goal: First to 5 wins. Rock beats scissors, scissors beats paper, paper beats rock.
  Pass and play: PINK picks while BLUE looks away, then passes the device. BLUE picks, then both hands are shown.
  Controls: Tap a hand, or press R P S (or 1 2 3). Tap or press space to go on.
  Secret: Your pick is never shown until both players have picked.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// ROCK PAPER SCISSORS · pass and play · first to 5
let hands = ["🪨", "📄", "✂️"];
let names = ["rock", "paper", "scissors"];
let pink = "#ff5aa8";
let blue = "#7fd3ff";
let score = [0, 0];
let ties = 0;
let picks = [-1, -1];
let result = "";
// "pick1" → "pass" → "pick2" → "show" → back to "pick1" (or "over")
let state = "pick1";
let cool = 0;

// does hand a beat hand b? (paper > rock, scissors > paper, rock > scissors)
function beats(a, b) {
  return (a - b + 3) % 3 === 1;
}

function go(next) {
  state = next;
  cool = 15;
}

function settle() {
  let a = picks[0];
  let b = picks[1];
  if (eq(a, b)) {
    ties += 1;
    result = "tie 🤝";
  } else if (beats(a, b)) {
    score[0] += 1;
    result = "PINK wins this round";
  } else {
    score[1] += 1;
    result = "BLUE wins this round";
  }
  if (score[0] === 5 || score[1] === 5) { go("over"); } else { go("show"); }
}

function handButtons() {
  for (let i = 0; i <= 2; i++) {
    let x = 20 + i * 124;
    box(x, 190, 112, 80, "#372d55");
    sprite(hands[i], x + 56, 222, 36);
    sprite(names[i] + " · " + names[i][0].toUpperCase(), x + 56, 258, 11, "#c9a4ff");
  }
}

gameloop(function () {
  cool -= 1;
  let ts = taps();
  let next = cool <= 0 && (ts.length > 0 || justpressed("space"));
  let pick = -1;
  if (justpressed("r") || justpressed("1")) { pick = 0; }
  if (justpressed("p") || justpressed("2")) { pick = 1; }
  if (justpressed("s") || justpressed("3")) { pick = 2; }
  for (const t of ts) {
    let i = Math.floor((t[0] - 20) / 124);
    if (t[1] > 190 && t[1] < 270 && i >= 0 && i <= 2) { pick = i; }
  }
  if (cool > 0) { pick = -1; }

  if (state === "pick1" && pick >= 0) {
    picks[0] = pick;
    go("pass");
  } else if (state === "pass" && next) {
    go("pick2");
  } else if (state === "pick2" && pick >= 0) {
    picks[1] = pick;
    settle();
  } else if (state === "show" && next) {
    go("pick1");
  } else if (state === "over" && next && cool <= -30) {
    score = [0, 0];
    ties = 0;
    go("pick1");
  }

  wipe("#1d1631");
  sprite("PINK " + score[0], 80, 18, 18, pink);
  sprite("ties " + ties, 200, 18, 14, "#a79cc2");
  sprite("BLUE " + score[1], 320, 18, 18, blue);

  if (state === "pick1" || state === "pick2") {
    let who = "PINK";
    let other = "BLUE";
    let c = pink;
    if (state === "pick2") {
      who = "BLUE";
      other = "PINK";
      c = blue;
    }
    sprite(who + ", pick a hand 🤫", 200, 80, 22, c);
    sprite(other + ", no peeking 🙈", 200, 116, 14, "#a79cc2");
    if (state === "pick2") { sprite("PINK has picked ✅", 200, 150, 13, "#ffb469"); }
    handButtons();
  } else if (state === "pass") {
    sprite("PINK has picked ✅", 200, 92, 22, pink);
    sprite("pass to BLUE 👉", 200, 140, 26, blue);
    sprite("BLUE: tap or press space when ready", 200, 186, 13, "#a79cc2");
  } else {
    sprite(hands[picks[0]], 110, 100, 64);
    sprite("vs", 200, 100, 20, "#a79cc2");
    sprite(hands[picks[1]], 290, 100, 64);
    sprite("PINK", 110, 148, 12, pink);
    sprite("BLUE", 290, 148, 12, blue);
    let c = "white";
    if (result.startsWith("PINK")) { c = pink; }
    if (result.startsWith("BLUE")) { c = blue; }
    sprite(result, 200, 186, 18, c);
    if (state === "show") {
      sprite("tap or press space for the next round", 200, 240, 13, "#a79cc2");
    } else {
      let winner = "PINK wins the match 🏆";
      let wc = pink;
      if (score[1] === 5) {
        winner = "BLUE wins the match 🏆";
        wc = blue;
      }
      box(0, 206, 400, 94, "rgba(19, 13, 32, 0.95)");
      center(winner, 216, wc, 24);
      center("final score: PINK " + score[0] + " · BLUE " + score[1] + " · ties " + ties, 250, "#ffb469", 14);
      center("tap or press space for a rematch", 274, "#a79cc2", 12);
    }
  }
});
