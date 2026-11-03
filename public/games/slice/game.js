/*
  Slice
  -----
  Goal: Swipe through the flying fruit to slice it.
  Controls: Drag fast with your finger, or hold the mouse button and swipe. Tap to start.
  Combo: Slice 3 or more fruits in one swipe for bonus points. COMBO x4 = +4.
  Power-ups: ❄️ slows everything down for 3 seconds. ❤️ gives you an extra life (up to 5).
  Levels: Every 10 points you level up: more fruit, flying faster, and more bombs.
  Lose: Slicing a 💣 ends the game right away. Every fruit that falls costs a ❤️.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// SLICE: swipe through the fruit, but never the bombs!
// drag with your mouse or finger
// ❄️ = slow motion · ❤️ = extra life · 3+ fruits in one swipe = COMBO
let fruits = [["🍉", "#ff4d6d"], ["🍊", "#ff9f1c"], ["🍎", "#e63946"], ["🍍", "#ffd166"], ["🥝", "#8ac926"], ["🍑", "#ffadad"], ["🍋", "#ffe066"]];
let items = [];
let halves = [];
let drops = [];
let trail = [];
let popups = [];
let lx = 0;
let ly = 0;
let was = false;
let score = 0;
let best = 0;
let lives = 3;
let level = 1;
let spawn = 30;
let freeze = 0;
let flash = 0;
let banner = 0;
let combo = 0;
let state = "start";
let wait = 0;
let overMsg = "";

function reset() {
  items = [];
  halves = [];
  drops = [];
  popups = [];
  score = 0;
  lives = 3;
  level = 1;
  spawn = 30;
  freeze = 0;
  state = "play";
}

// throw one thing up from the bottom
// an item is [x, y, vx, vy, emoji, kind, juice color]
function launch() {
  let x = rng(60, 340);
  let f = fruits[rng(0, fruits.length - 1)];
  let e = f[0];
  let kind = "fruit";
  let juice = f[1];
  let roll = rng(1, 100);
  if (roll <= 8 + level * 2) {
    e = "💣";
    kind = "bomb";
  } else if (roll <= 12 + level * 2 && level >= 2) {
    e = "❄️";
    kind = "ice";
    juice = "#bde0fe";
  } else if (roll >= 98 && lives < 5) {
    e = "❤️";
    kind = "heart";
    juice = "#ff5aa8";
  }
  items.push([x, 320, (200 - x) / 100 + rng(-1, 1) * 0.5, -rng(10, 12) - level * 0.15, e, kind, juice]);
}

function pop(x, y, text, color) {
  popups.push([x, y, text, color, 45]);
}

function splash(it) {
  halves.push([it[0], it[1], it[2] - 1.6, it[3] - 1, it[4], 50]);
  halves.push([it[0], it[1], it[2] + 1.6, it[3] - 1, it[4], 50]);
  for (let k = 1; k <= 7; k++) {
    drops.push([it[0], it[1], rng(-30, 30) / 10, rng(-40, 10) / 10, it[6], 26]);
  }
}

function near(x, y, it) {
  let dx = x - it[0];
  let dy = y - it[1];
  return dx * dx + dy * dy < 32 * 32;
}

gameloop(function () {
  let ts = taps();
  if (state === "start" && ts.length > 0) { reset(); }
  if (state === "over") {
    wait -= 1;
    if (wait <= 0 && ts.length > 0) { reset(); }
  }

  // slow motion makes everything move at 40% speed
  let speed = 1;
  if (freeze > 0) {
    speed = 0.4;
    freeze -= 1;
  }
  flash -= 1;
  banner -= 1;

  // the blade: holding down AND moving fast
  let cut = false;
  let mx = tapx();
  let my = tapy();
  if (holding()) {
    if (!was) { trail = []; }
    if (was && Math.abs(mx - lx) + Math.abs(my - ly) > 6) { cut = true; }
    trail.push([mx, my, 10]);
  } else if (was) {
    // swipe finished: pay out the combo
    if (combo >= 3 && state === "play") {
      score += combo;
      pop(lx, ly - 20, "COMBO x" + combo + " +" + combo, "#ffd166");
    }
    combo = 0;
  }
  let midx = (mx + lx) / 2;
  let midy = (my + ly) / 2;
  lx = mx;
  ly = my;
  was = holding();

  if (state === "play") {
    spawn -= speed;
    if (spawn <= 0) {
      let n = rng(1, 1 + Math.floor(level / 2));
      if (n > 4) { n = 4; }
      for (let k = 1; k <= n; k++) { launch(); }
      spawn = 55 - level * 5;
      if (spawn < 22) { spawn = 22; }
    }
  }

  let keep = [];
  for (const it of items) {
    it[0] += it[2] * speed;
    it[1] += it[3] * speed;
    it[3] += 0.22 * speed;
    let sliced = state === "play" && cut && (near(mx, my, it) || near(midx, midy, it));
    if (sliced && it[5] === "bomb") {
      flash = 20;
      overMsg = "💥 you sliced a bomb";
      lives = 0;
    } else if (sliced) {
      splash(it);
      if (it[5] === "fruit") {
        score += 1;
        combo += 1;
      }
      if (it[5] === "ice") {
        freeze = 180;
        pop(it[0], it[1], "❄️ slow-mo!", "#bde0fe");
      }
      if (it[5] === "heart") {
        lives += 1;
        pop(it[0], it[1], "+1 ❤️", "#ff5aa8");
      }
    } else if (it[1] > 330 && it[3] > 0) {
      if (it[5] === "fruit" && state === "play") {
        lives -= 1;
        pop(it[0], 270, "❌", "#ff4d6d");
        if (lives <= 0) { overMsg = "GG 💀 3 fruits hit the floor"; }
      }
    } else {
      keep.push(it);
    }
  }
  items = keep;

  // level up every 10 points
  if (state === "play" && 1 + Math.floor(score / 10) > level) {
    level = 1 + Math.floor(score / 10);
    banner = 90;
  }
  if (state === "play" && lives <= 0) {
    state = "over";
    wait = 45;
    if (score > best) { best = score; }
  }

  // move the halves, juice, trail and popups
  let keepHalves = [];
  for (const h of halves) {
    h[0] += h[2] * speed;
    h[1] += h[3] * speed;
    h[3] += 0.25 * speed;
    h[5] -= 1;
    if (h[5] > 0 && h[1] < 330) { keepHalves.push(h); }
  }
  halves = keepHalves;
  let keepDrops = [];
  for (const d of drops) {
    d[0] += d[2];
    d[1] += d[3];
    d[3] += 0.2;
    d[5] -= 1;
    if (d[5] > 0) { keepDrops.push(d); }
  }
  drops = keepDrops;
  let keepTrail = [];
  for (const p of trail) {
    p[2] -= 1;
    if (p[2] > 0) { keepTrail.push(p); }
  }
  trail = keepTrail;
  let keepPops = [];
  for (const p of popups) {
    p[1] -= 0.6;
    p[4] -= 1;
    if (p[4] > 0) { keepPops.push(p); }
  }
  popups = keepPops;

  // ---- draw ----
  wipe("#3b2414");
  for (let i = 0; i <= 7; i++) {
    box(0, i * 40 + 38, 400, 2, "#2e1b0f");
  }
  if (freeze > 0) { box(0, 0, 400, 300, "rgba(160, 210, 255, 0.18)"); }
  for (const d of drops) {
    bubble(d[0], d[1], 3, d[4]);
  }
  for (const h of halves) {
    sprite(h[4], h[0], h[1], 28);
  }
  for (const it of items) {
    sprite(it[4], it[0], it[1], 42);
  }
  if (trail.length >= 2) {
    for (let i = 1; i <= trail.length - 1; i++) {
      let a = trail[i - 1];
      let b = trail[i];
      line(a[0], a[1], b[0], b[1], "white", b[2] * 0.7);
    }
  }
  for (const p of popups) {
    sprite(p[2], p[0], p[1], 18, p[3]);
  }

  write("score " + score, 8, 8, "white", 16);
  write("best " + best, 8, 28, "#c9a4ff", 12);
  if (state !== "start") { sprite("level " + level, 200, 16, 14, "#ffb469"); }
  if (lives > 0) { sprite("❤️".repeat(Math.max(0, lives)), 392 - lives * 9, 16, 16); }
  if (freeze > 0) { sprite("❄️ " + (Math.floor(freeze / 60) + 1), 200, 36, 13, "#bde0fe"); }
  if (banner > 0) { center("LEVEL " + level + " 🔥", 110, "#ffd166", 34); }
  if (flash > 0) { box(0, 0, 400, 300, "rgba(255, 255, 255, 0.55)"); }

  if (state === "start") {
    box(0, 100, 400, 100, "#1d1631");
    center("🍉 SLICE 🍉", 110, "white", 30);
    center("swipe through fruit · never slice a 💣", 152, "#ffb469", 14);
    center("tap to start", 174, "#a79cc2", 13);
  }
  if (state === "over") {
    box(0, 108, 400, 84, "#1d1631");
    center(overMsg, 116, "white", 22);
    center("score " + score + " · best " + best + " · level " + level, 148, "#ffb469", 15);
    if (wait <= 0) { center("tap to play again", 170, "#a79cc2", 13); }
  }
});
