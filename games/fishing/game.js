/*
  Fishing
  -------
  Goal: Catch as many points of fish as you can in 60 seconds.
  Controls: Hold space or ↓ (or hold the screen) to drop the hook. Let go to reel up. ← → move the boat.
  Phone: Hold where you want to fish. The boat follows your finger.
  Points: 🐟 1 · 🐠 3 · 🐡 5 · 🦑 10 (deep and fast) · 🥾 0
  Danger: A 🦈 shark steals the fish off your hook if it touches it.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// FISHING: hold to drop your hook, let go to reel it back up
// steer the boat with ← → (or hold where you want to fish) · 60 seconds
// a kind is [emoji, points, top depth, bottom depth, speed]
let kinds = [["🐟", 1, 80, 150, 1.2], ["🐠", 3, 140, 220, 1.6], ["🐡", 5, 200, 270, 0.9], ["🦑", 10, 245, 278, 2.2], ["🥾", 0, 90, 270, 0.6], ["🦈", 0, 120, 260, 2.6]];

let fish = [];
let boat = 200;
let hookY = 50;
let caught = -1;
let score = 0;
let best = 0;
let frames = 0;
let popups = [];
let state = "start";
let wait = 0;
let TIME = 3600;

// a fish is [x, y, speed, kind]
function spawnFish() {
  let roll = rng(1, 100);
  let k = 0;
  if (roll > 40) { k = 1; }
  if (roll > 65) { k = 2; }
  if (roll > 80) { k = 3; }
  if (roll > 85) { k = 4; }
  if (roll > 93) { k = 5; }
  let kd = kinds[k];
  let dir = 1;
  let x = -20;
  if (rng(0, 1) === 1) {
    dir = -1;
    x = 420;
  }
  fish.push([x, rng(kd[2], kd[3]), kd[4] * dir * (0.8 + rng(0, 4) / 10), k]);
}

function pop(x, y, text, color) {
  popups.push([x, y, text, color, 60]);
}

function reset() {
  fish = [];
  for (let i = 1; i <= 6; i++) {
    spawnFish();
    fish[i - 1][0] = rng(20, 380);
  }
  boat = 200;
  hookY = 50;
  caught = -1;
  score = 0;
  frames = 0;
  popups = [];
  state = "play";
}

gameloop(function () {
  let ts = taps();
  wait -= 1;
  if (state !== "play") {
    if (wait <= 0 && (ts.length > 0 || justpressed("space"))) { reset(); }
  } else {
    frames += 1;
    let down = pressed("space") || pressed("down") || holding();
    if (pressed("left")) { boat -= 3; }
    if (pressed("right")) { boat += 3; }
    if (holding()) { boat += (tapx() - boat) / 10; }
    if (boat < 30) { boat = 30; }
    if (boat > 370) { boat = 370; }

    // a catch reels in by itself
    if (caught >= 0) {
      hookY -= 4;
    } else if (down) {
      hookY += 3;
    } else {
      hookY -= 5;
    }
    if (hookY < 50) { hookY = 50; }
    if (hookY > 282) { hookY = 282; }

    let keep = [];
    for (const f of fish) {
      f[0] += f[2];
      let touching = Math.abs(f[0] - boat) < 16 && Math.abs(f[1] - hookY) < 14 && hookY > 60;
      if (touching && caught < 0 && f[3] !== 5) {
        caught = f[3];
      } else if (touching && f[3] === 5 && caught >= 0 && caught !== 4) {
        pop(boat, hookY, "🦈 stole your fish!", "#ff4d6d");
        caught = -1;
        keep.push(f);
      } else if (f[0] > -40 && f[0] < 440) {
        keep.push(f);
      }
    }
    fish = keep;
    if (frames % 28 === 0) { spawnFish(); }

    // landed it!
    if (caught >= 0 && hookY <= 50) {
      let kd = kinds[caught];
      score += kd[1];
      if (caught === 4) {
        pop(boat, 90, "just a boot 🥾", "#c9a4ff");
      } else {
        pop(boat, 90, "+" + kd[1] + " " + kd[0], "#ffd84d");
      }
      caught = -1;
    }
    if (frames >= TIME) {
      state = "over";
      wait = 45;
      if (score > best) { best = score; }
    }
  }

  let keepPops = [];
  for (const p of popups) {
    p[1] -= 0.5;
    p[4] -= 1;
    if (p[4] > 0) { keepPops.push(p); }
  }
  popups = keepPops;

  wipe("#9fd8ff");
  bubble(350, 22, 14, "#ffd84d");
  box(0, 50, 400, 80, "#2e7fc2");
  box(0, 130, 400, 80, "#226aa8");
  box(0, 210, 400, 90, "#17507f");
  box(0, 288, 400, 12, "#c2a36b");
  sprite("🌿", 40, 278, 22);
  sprite("🪸", 180, 280, 20);
  sprite("🌿", 330, 278, 22);
  for (const f of fish) {
    let size = 26;
    if (f[3] === 5) { size = 36; }
    sprite(kinds[f[3]][0], f[0], f[1], size);
  }
  line(boat + 12, 30, boat, hookY, "rgba(255, 255, 255, 0.8)", 1);
  bubble(boat, hookY, 3, "#d9d9d9");
  if (caught >= 0) { sprite(kinds[caught][0], boat, hookY + 12, 26); }
  sprite("🚣", boat, 36, 34);
  for (const p of popups) {
    sprite(p[2], p[0], p[1], 15, p[3]);
  }

  write("score " + score, 8, 8, "#1d1631", 15);
  write("best " + best, 8, 27, "#2450f0", 12);
  if (state === "play") {
    sprite(Math.floor((TIME - frames) / 60) + "s", 200, 16, 15, "#1d1631");
  }

  if (state === "start") {
    box(0, 100, 400, 100, "#130d20");
    center("FISHING 🎣", 112, "white", 28);
    center("hold to drop the hook · 🦑 = 10 · watch out for 🦈", 150, "#ffb469", 13);
    center("tap to start", 174, "#a79cc2", 13);
  }
  if (state === "over") {
    box(0, 100, 400, 100, "#130d20");
    center("time's up! you scored " + score + " 🐟", 114, "white", 24);
    center("best " + best, 150, "#ffb469", 14);
    if (wait <= 0) { center("tap to fish again", 174, "#a79cc2", 13); }
  }
});
