/*
  Target Rush
  -----------
  Goal: Hit as many targets as you can in 30 seconds.
  Targets: They pop up, grow, then shrink away. Hit them while they're small for more points.
  Combo: Every hit in a row adds to your combo. Missing a tap or letting a target vanish resets it.
  Controls: Tap or click the targets.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// TARGET RUSH · 30 seconds · hit the targets, build a combo
let LENGTH = 30;
let targets = [];
let pops = [];
let score = 0;
let hits = 0;
let misses = 0;
let combo = 0;
let bestCombo = 0;
let best = 0;
let state = "ready";
let started = 0;
let spawnIn = 0;
let wait = 0;

function start() {
  targets = [];
  pops = [];
  score = 0;
  hits = 0;
  misses = 0;
  combo = 0;
  bestCombo = 0;
  state = "play";
  started = clock();
  spawnIn = 0;
}

function timeLeft() {
  return Math.max(0, LENGTH - (clock() - started));
}

// a target lives for `life` frames: it grows for the first half and shrinks for the second
function spawn() {
  let left = timeLeft();
  let life = Math.round(70 + left * 2.4);
  targets.push({ x: rng(36, 364), y: rng(56, 264), age: 0, life: life, max: rng(20, 28) });
}

function radius(t) {
  let k = t.age / t.life;
  return t.max * sin(k * 180);
}

function onTap(x, y) {
  for (let i = targets.length - 1; i >= 0; i--) {
    let t = targets[i];
    let r = radius(t);
    if (Math.hypot(x - t.x, y - t.y) <= r + 4) {
      combo += 1;
      if (combo > bestCombo) { bestCombo = combo; }
      // smaller target = more points, combo adds a bonus
      let pts = Math.round(10 + (1 - r / t.max) * 20) + Math.min(combo - 1, 10) * 2;
      score += pts;
      hits += 1;
      pops.push({ x: t.x, y: t.y, text: "+" + pts, age: 0 });
      targets.splice(i, 1);
      return;
    }
  }
  combo = 0;
  misses += 1;
  pops.push({ x: x, y: y, text: "miss", age: 0 });
}

gameloop(function () {
  if (state === "ready") {
    if (tapped() || justpressed("space")) { start(); }
  } else if (state === "play") {
    for (const t of taps()) { onTap(t[0], t[1]); }
    spawnIn -= 1;
    let most = 2 + Math.floor((LENGTH - timeLeft()) / 10);
    if (spawnIn <= 0 && targets.length < most) {
      spawn();
      spawnIn = rng(18, 34);
    }
    for (let i = targets.length - 1; i >= 0; i--) {
      targets[i].age += 1;
      if (targets[i].age >= targets[i].life) {
        targets.splice(i, 1);
        combo = 0;
      }
    }
    if (timeLeft() <= 0) {
      state = "over";
      wait = 0;
      if (score > best) { best = score; }
    }
  } else {
    wait += 1;
    if (wait > 50 && (tapped() || justpressed("space"))) { start(); }
  }
  for (let i = pops.length - 1; i >= 0; i--) {
    pops[i].age += 1;
    if (pops[i].age > 40) { pops.splice(i, 1); }
  }

  wipe("#16102a");
  // faint grid so the screen feels like a range
  for (let x = 0; x <= 400; x += 40) { box(x, 0, 1, 300, "rgba(255, 255, 255, 0.04)"); }
  for (let y = 0; y <= 300; y += 40) { box(0, y, 400, 1, "rgba(255, 255, 255, 0.04)"); }

  for (const t of targets) {
    let r = radius(t);
    bubble(t.x, t.y, r, "#ff4d6d");
    bubble(t.x, t.y, r * 0.72, "white");
    bubble(t.x, t.y, r * 0.45, "#ff4d6d");
    bubble(t.x, t.y, r * 0.18, "white");
  }
  for (const p of pops) {
    let c = p.text === "miss" ? "rgba(167, 156, 194, 0.8)" : "#ffd84d";
    sprite(p.text, p.x, p.y - p.age * 0.6, 14, c);
  }

  // top bar
  box(0, 0, 400, 34, "rgba(19, 13, 32, 0.85)");
  write("score " + score, 10, 9, "white", 16);
  let left = state === "play" ? timeLeft() : 0;
  if (state === "ready") { left = LENGTH; }
  sprite("⏱ " + Math.ceil(left), 200, 17, 16, left <= 5 && state === "play" ? "#ff6b6b" : "white");
  if (combo >= 2) { write("combo x" + combo + " 🔥", 290, 9, "#ffb469", 14); }
  // time bar
  box(0, 34, 400 * (left / LENGTH), 3, "#ff5aa8");

  if (state === "ready") {
    sprite("🎯", 200, 120, 48);
    center("hit the targets before they vanish", 158, "white", 18);
    center("smaller = more points · hits in a row = combo", 186, "#a79cc2", 12);
    center("tap or press space to start", 222, "#ffb469", 14);
  } else if (state === "over") {
    let acc = hits + misses > 0 ? Math.round(hits * 100 / (hits + misses)) : 0;
    box(40, 70, 320, 170, "rgba(19, 13, 32, 0.94)");
    center("time's up ⏱", 84, "white", 22);
    center(score + " points", 118, "#ffd84d", 28);
    center("hits " + hits + " · accuracy " + acc + "% · best combo " + bestCombo, 160, "#c9a4ff", 12);
    let rec = score >= best && score > 0 ? "new best! 🏆" : "best " + best;
    center(rec, 184, "#5ee6a8", 14);
    if (wait > 50) { center("tap to play again", 212, "#a79cc2", 12); }
  }
});
