/*
  Zombies
  -------
  Goal: Survive the zombie waves as long as you can.
  Move: W A S D or arrow keys. On a phone, hold and drag where to walk.
  Shoot: Automatic! You always fire at the closest zombie.
  Power-ups: ⚡ = rapid fire for 5 seconds · 💊 = +1 ❤️ (up to 5). Zombies sometimes drop them.
  Waves: A new wave every 15 seconds: more and faster zombies. Big zombies take 3 hits.
  Lose: Each bite costs a ❤️. You blink and are safe for a moment after a bite.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// ZOMBIES: survive as long as you can! You shoot the nearest zombie automatically
// move with W A S D or the arrow keys, or hold and drag where to walk
// grab ⚡ for rapid fire and 💊 to heal
let px = 200;
let py = 165;
let hp = 3;
let zs = [];
let shots = [];
let items = [];
let frames = 0;
let kills = 0;
let cool = 0;
let rapid = 0;
let hurt = 0;
let best = 0;
let wave = 1;
let state = "start";
let wait = 0;

function reset() {
  px = 200;
  py = 165;
  hp = 3;
  zs = [];
  shots = [];
  items = [];
  frames = 0;
  kills = 0;
  rapid = 0;
  hurt = 0;
  state = "play";
}

// a zombie is [x, y, speed, health]. Big ones take 3 hits
function spawnZombie() {
  let side = rng(0, 3);
  let x = rng(0, 400);
  let y = rng(40, 300);
  if (side === 0) { x = -15; }
  if (side === 1) { x = 415; }
  if (side === 2) { y = 25; }
  if (side === 3) { y = 315; }
  let sp = 0.5 + rng(0, 5) / 10 + wave * 0.08;
  let tough = 1;
  if (wave >= 3 && rng(1, 5) === 1) {
    tough = 3;
    sp = sp * 0.7;
  }
  zs.push([x, y, sp, tough]);
}

gameloop(function () {
  let ts = taps();
  wait -= 1;
  if (state !== "play") {
    if (wait <= 0 && (ts.length > 0 || justpressed("space"))) { reset(); }
  } else {
    frames += 1;
    wave = 1 + Math.floor(frames / 900);
    hurt -= 1;
    rapid -= 1;

    // walking
    let mx = 0;
    let my = 0;
    if (pressed("a") || pressed("left")) { mx = -1; }
    if (pressed("d") || pressed("right")) { mx = 1; }
    if (pressed("w") || pressed("up")) { my = -1; }
    if (pressed("s") || pressed("down")) { my = 1; }
    if (mx !== 0 && my !== 0) {
      mx = mx * 0.7;
      my = my * 0.7;
    }
    if (holding()) {
      let dx = tapx() - px;
      let dy = tapy() - py;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d > 6) {
        mx = dx / d;
        my = dy / d;
      }
    }
    px += mx * 2.4;
    py += my * 2.4;
    if (px < 12) { px = 12; }
    if (px > 388) { px = 388; }
    if (py < 42) { py = 42; }
    if (py > 288) { py = 288; }

    // more zombies every wave
    let every = 70 - wave * 8;
    if (every < 16) { every = 16; }
    if (frames % every === 0) { spawnZombie(); }

    // auto-aim at the nearest zombie
    cool -= 1;
    if (cool <= 0 && zs.length > 0) {
      let target = zs[0];
      let bestD = 999999;
      for (const z of zs) {
        let d2 = (z[0] - px) * (z[0] - px) + (z[1] - py) * (z[1] - py);
        if (d2 < bestD) {
          bestD = d2;
          target = z;
        }
      }
      if (bestD < 230 * 230) {
        let d = Math.sqrt(bestD);
        shots.push([px, py, (target[0] - px) / d * 7, (target[1] - py) / d * 7, 45]);
        cool = 14;
        if (rapid > 0) { cool = 5; }
      }
    }

    let keepShots = [];
    for (const s of shots) {
      s[0] += s[2];
      s[1] += s[3];
      s[4] -= 1;
      for (const z of zs) {
        let r = 14;
        if (z[3] > 1) { r = 20; }
        if (s[4] > 0 && z[3] > 0 && Math.abs(s[0] - z[0]) < r && Math.abs(s[1] - z[1]) < r) {
          z[3] -= 1;
          s[4] = 0;
          if (z[3] <= 0) {
            kills += 1;
            // sometimes a zombie drops a power-up
            if (rng(1, 12) === 1) {
              let kind = "⚡";
              if (rng(0, 1) === 1) { kind = "💊"; }
              items.push([z[0], z[1], kind, 600]);
            }
          }
        }
      }
      if (s[4] > 0) { keepShots.push(s); }
    }
    shots = keepShots;

    let keepZ = [];
    for (const z of zs) {
      let dx = px - z[0];
      let dy = py - z[1];
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0) {
        z[0] += dx / d * z[2];
        z[1] += dy / d * z[2];
      }
      if (z[3] > 0 && d < 18 && hurt <= 0) {
        hp -= 1;
        hurt = 60;
        z[3] = 0;
      }
      if (z[3] > 0) { keepZ.push(z); }
    }
    zs = keepZ;

    let keepItems = [];
    for (const it of items) {
      it[3] -= 1;
      if (Math.abs(it[0] - px) < 18 && Math.abs(it[1] - py) < 18) {
        if (it[2] === "⚡") { rapid = 300; }
        if (it[2] === "💊" && hp < 5) { hp += 1; }
      } else if (it[3] > 0) {
        keepItems.push(it);
      }
    }
    items = keepItems;

    if (hp <= 0) {
      state = "over";
      wait = 50;
      if (kills > best) { best = kills; }
    }
  }

  wipe("#22301f");
  for (let i = 0; i <= 14; i++) {
    bubble(i * 97 % 400, 40 + i * 61 % 260, 18 + i % 3 * 6, "#1d2a1b");
  }
  for (const it of items) {
    sprite(it[2], it[0], it[1], 22);
  }
  for (const s of shots) {
    bubble(s[0], s[1], 3, "#ffd84d");
  }
  for (const z of zs) {
    let size = 26;
    if (z[3] > 1) { size = 38; }
    sprite("🧟", z[0], z[1], size);
  }
  if (state === "play" && (hurt <= 0 || hurt % 10 < 5)) { sprite("🤠", px, py, 26); }

  box(0, 0, 400, 30, "#162014");
  write("kills " + kills, 8, 8, "white", 15);
  write("best " + best, 82, 10, "#c9a4ff", 12);
  sprite("wave " + wave, 200, 16, 14, "#ffb469");
  if (rapid > 0) { write("⚡", 250, 7, "#ffd84d", 15); }
  if (hp > 0) { sprite("❤️".repeat(Math.max(0, hp)), 392 - hp * 9, 16, 16); }

  if (state === "start") {
    box(0, 100, 400, 100, "#130d20");
    center("ZOMBIES 🧟", 112, "white", 28);
    center("move to dodge · you shoot automatically · grab ⚡ and 💊", 150, "#ffb469", 13);
    center("tap to start", 174, "#a79cc2", 13);
  }
  if (state === "over") {
    box(0, 100, 400, 100, "#130d20");
    center("the zombies got you 🧟 " + kills + " kills", 114, "white", 24);
    center("you lasted until wave " + wave + " · best " + best, 150, "#ffb469", 14);
    if (wait <= 0) { center("tap to play again", 174, "#a79cc2", 13); }
  }
});
