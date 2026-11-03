/*
  Tower Defense
  -------------
  Goal: Stop the bugs from walking all the way to the 🏁. You have 10 ❤️.
  Build: Tap the grass (not the path) to build a 🗼 tower for 50 🪙.
  Upgrade: Tap a tower to upgrade it (more damage, range and speed). Max level is ⭐⭐⭐.
  Coins: Every bug you squash pays coins. 🦗 crickets are fast, 🐌 snails are tough.
  Waves: There is a short break between waves. Tap ▶ next wave (or press space) to start early.
  Tip: Build where the path bends. A tower there can hit bugs on two parts of the path.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// TOWER DEFENSE: bugs march along the path. Stop them before the 🏁!
// tap the grass to build a 🗼 (50 coins) · tap a tower to upgrade it
// towers shoot the bug that is furthest along · each kill pays coins
let path = [[-20, 80], [300, 80], [300, 160], [90, 160], [90, 240], [420, 240]];
let towers = [];
let bugs = [];
let zaps = [];
let coins = 120;
let lives = 10;
let wave = 0;
let toSpawn = 0;
let spawnCool = 0;
let pause = 240;
let kills = 0;
let msg = "tap the grass to build a 🗼 · 50 coins";
let msgT = 400;
let over = false;

// how far is point (px, py) from the line between a and b?
function distToSeg(px, py, a, b) {
  let dx = b[0] - a[0];
  let dy = b[1] - a[1];
  let t = ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy);
  if (t < 0) { t = 0; }
  if (t > 1) { t = 1; }
  let cx = a[0] + t * dx - px;
  let cy = a[1] + t * dy - py;
  return Math.sqrt(cx * cx + cy * cy);
}

function onPath(x, y) {
  for (let i = 0; i <= path.length - 2; i++) {
    if (distToSeg(x, y, path[i], path[i + 1]) < 30) { return true; }
  }
  return false;
}

function say(t) {
  msg = t;
  msgT = 100;
}

// a bug is [segment, x, y, hp, max hp, speed, emoji, coins, distance walked]
function spawnBug() {
  let roll = rng(1, 10);
  let hp = 2 + wave * 2;
  let e = "🐛";
  let sp = 0.9;
  let reward = 6;
  if (wave >= 2 && roll <= 3) {
    e = "🦗";
    sp = 1.7;
    hp = Math.floor(hp * 0.6) + 1;
    reward = 7;
  }
  if (wave >= 3 && roll === 10) {
    e = "🐌";
    sp = 0.5;
    hp = hp * 3;
    reward = 15;
  }
  bugs.push([0, path[0][0], path[0][1], hp, hp, sp, e, reward, 0]);
}

gameloop(function () {
  let ts = taps();
  msgT -= 1;

  if (!over) {
    // waves: a short break, then the next wave comes
    if (toSpawn === 0 && bugs.length === 0) {
      pause -= 1;
      if (pause <= 0 || justpressed("space")) {
        wave += 1;
        toSpawn = 6 + wave * 2;
        pause = 300;
        say("wave " + wave + " incoming 🐛");
      }
    }
    if (toSpawn > 0) {
      spawnCool -= 1;
      if (spawnCool <= 0) {
        spawnBug();
        toSpawn -= 1;
        spawnCool = 40 - wave * 2;
        if (spawnCool < 14) { spawnCool = 14; }
      }
    }

    // building and upgrading
    for (const t of ts) {
      if (t[1] < 30) {
        if (t[0] > 290 && toSpawn === 0 && bugs.length === 0) { pause = 0; }
      } else {
        let hitTower = null;
        for (const tw of towers) {
          if (Math.abs(tw[0] - t[0]) < 18 && Math.abs(tw[1] - t[1]) < 18) { hitTower = tw; }
        }
        if (hitTower !== null) {
          let cost = 40 * hitTower[2];
          if (hitTower[2] >= 3) {
            say("that tower is maxed out ⭐⭐⭐");
          } else if (coins >= cost) {
            coins -= cost;
            hitTower[2] += 1;
            say("upgraded to level " + hitTower[2] + " ⭐");
          } else {
            say("you need " + cost + " coins to upgrade");
          }
        } else if (onPath(t[0], t[1])) {
          say("you can't build on the path");
        } else if (coins < 50) {
          say("you need 50 coins 🪙 kill more bugs");
        } else {
          let crowded = false;
          for (const tw of towers) {
            if (Math.abs(tw[0] - t[0]) < 30 && Math.abs(tw[1] - t[1]) < 30) { crowded = true; }
          }
          if (crowded) {
            say("too close to another tower");
          } else {
            towers.push([t[0], t[1], 1, 0]);
            coins -= 50;
            say("tower built! tap it to upgrade");
          }
        }
      }
    }

    // towers fire at the bug furthest along the path
    for (const tw of towers) {
      tw[3] -= 1;
      let reach = 60 + tw[2] * 15;
      if (tw[3] <= 0) {
        let target = null;
        let bestP = -1;
        for (const b of bugs) {
          let dx = b[1] - tw[0];
          let dy = b[2] - tw[1];
          if (b[3] > 0 && dx * dx + dy * dy < reach * reach && b[8] > bestP) {
            bestP = b[8];
            target = b;
          }
        }
        if (target !== null) {
          target[3] -= tw[2];
          zaps.push([tw[0], tw[1] - 8, target[1], target[2], 6]);
          tw[3] = 28 - tw[2] * 4;
        }
      }
    }

    // bugs walk from point to point along the path
    let keep = [];
    for (const b of bugs) {
      let goal = path[b[0] + 1];
      let dx = goal[0] - b[1];
      let dy = goal[1] - b[2];
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d <= b[5]) {
        b[1] = goal[0];
        b[2] = goal[1];
        b[0] += 1;
      } else {
        b[1] += dx / d * b[5];
        b[2] += dy / d * b[5];
      }
      b[8] += b[5];
      if (b[3] <= 0) {
        coins += b[7];
        kills += 1;
      } else if (b[0] >= path.length - 1) {
        lives -= 1;
        say("a bug got through! 😱");
      } else {
        keep.push(b);
      }
    }
    bugs = keep;
    if (lives <= 0) { over = true; }
  }

  wipe("#3a6b35");
  for (let i = 0; i <= path.length - 2; i++) {
    line(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], "#a88b55", 36);
  }
  for (let i = 0; i <= path.length - 2; i++) {
    line(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], "#d4b77f", 28);
  }
  sprite("🏁", 386, 240, 22);
  for (const tw of towers) {
    bubble(tw[0], tw[1] + 8, 13, "#2a4a26");
    sprite("🗼", tw[0], tw[1], 28);
    sprite("⭐".repeat(Math.max(0, tw[2])), tw[0], tw[1] + 20, 9);
  }
  let keepZaps = [];
  for (const z of zaps) {
    line(z[0], z[1], z[2], z[3], "#ffd84d", 2);
    z[4] -= 1;
    if (z[4] > 0) { keepZaps.push(z); }
  }
  zaps = keepZaps;
  for (const b of bugs) {
    sprite(b[6], b[1], b[2], 22);
    box(b[1] - 12, b[2] - 17, 24, 3, "#3a1430");
    box(b[1] - 12, b[2] - 17, 24 * b[3] / b[4], 3, "#ff4d6d");
  }

  box(0, 0, 400, 30, "#203d1d");
  write("🪙 " + coins, 8, 8, "#ffd84d", 15);
  write("❤️ " + lives, 92, 8, "white", 15);
  write("wave " + wave + " · kills " + kills, 160, 9, "#b6ffd4", 13);
  if (!over && toSpawn === 0 && bugs.length === 0) {
    box(292, 4, 102, 22, "#2e8a5a");
    sprite("▶ next wave " + (Math.floor(pause / 60) + 1) + "s", 343, 15, 11, "white");
  }
  if (msgT > 0 && !over) {
    box(0, 276, 400, 24, "rgba(0, 0, 0, 0.45)");
    sprite(msg, 200, 288, 13, "white");
  }
  if (over) {
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.92)");
    center("the bugs broke through 🐛 you survived " + (wave - 1) + " waves", 257, "white", 17);
    center(kills + " bugs squashed · press Restart to play again", 280, "#a79cc2", 12);
    gg();
  }
});
