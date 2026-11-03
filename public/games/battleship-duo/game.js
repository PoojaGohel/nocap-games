/*
  Battleship · 2 players
  ----------------------
  Goal: Sink all 4 of the other player's ships (12 squares) before they sink yours.
  Pass and play: Each player sets up their fleet in secret, then you take turns firing.
    A cover screen hides the boards every time you pass the device.
  Setup: Tap 🔀 (or press R) to shuffle your ships, then ✅ (or space) when you like it.
  Fire: Tap a square on ENEMY WATERS (right), or aim with the arrows and press space.
    💥 = hit, dot = miss. The left board is your fleet and where they fired (🔥 = hit).
  Ships: Battleship 4 · cruiser 3 · sub 3 · speedboat 2. Sunk ships turn dark red.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// BATTLESHIP · 2 players on one device · PINK vs BLUE
let lengths = [4, 3, 3, 2];
let shipNames = ["", "battleship", "cruiser", "sub", "speedboat"];
let names = ["", "PINK", "BLUE"];
let colors = ["", "#ff5aa8", "#7fd3ff"];
// ships[p] = player p's fleet, shots[p] = shots fired AT player p (0 none, 1 miss, 2 hit)
let ships = [[], [], []];
let shots = [[], [], []];
for (let p = 1; p <= 2; p++) {
  for (let i = 0; i <= 63; i++) {
    ships[p].push(0);
    shots[p].push(0);
  }
}
// "cover" (pass the device) → "place" or "aim" → "result" → "cover" for the other player ... → "won"
let state = "cover";
let after = "place";
let turn = 1;
let cursor = 27;
let msg = "";
let cool = 0;

// put ships in random spots without overlapping
function place(grid) {
  for (let i = 0; i <= 63; i++) { grid[i] = 0; }
  for (let id = 1; id <= 4; id++) {
    let size = lengths[id - 1];
    let done = false;
    while (!done) {
      let across = rng(0, 1) === 1;
      let x = rng(0, 7);
      let y = rng(0, 7);
      let ok = true;
      for (let k = 0; k <= size - 1; k++) {
        let cx = x;
        let cy = y + k;
        if (across) {
          cx = x + k;
          cy = y;
        }
        if (cx > 7 || cy > 7) {
          ok = false;
        } else if (grid[cy * 8 + cx] !== 0) {
          ok = false;
        }
      }
      if (ok) {
        for (let k = 0; k <= size - 1; k++) {
          if (across) { grid[y * 8 + x + k] = id; } else { grid[(y + k) * 8 + x] = id; }
        }
        done = true;
      }
    }
  }
}
place(ships[1]);
place(ships[2]);

function sunk(p, id) {
  for (let i = 0; i <= 63; i++) {
    if (eq(ships[p][i], id) && shots[p][i] !== 2) { return false; }
  }
  return true;
}

function hitsOn(p) {
  let n = 0;
  for (const s of shots[p]) {
    if (s === 2) { n += 1; }
  }
  return n;
}

function go(next) {
  state = next;
  cool = 15;
}

function fire(i) {
  let foe = 3 - turn;
  if (shots[foe][i] !== 0) { return; }
  if (ships[foe][i] > 0) {
    shots[foe][i] = 2;
    let id = ships[foe][i];
    if (sunk(foe, id)) {
      msg = "you sank " + names[foe] + "'s " + shipNames[id] + " 🚢💥";
    } else {
      msg = "hit! 🔥";
    }
  } else {
    shots[foe][i] = 1;
    msg = "miss 💦";
  }
  if (hitsOn(foe) === 12) { go("won"); } else { go("result"); }
}

// left: my fleet and their shots. right: their waters, ships hidden unless hit (or game over)
function boards(me, showEnemy) {
  let foe = 3 - me;
  write(names[me] + "'S FLEET", 20, 16, colors[me], 13);
  write("ENEMY WATERS", 220, 16, colors[foe], 13);
  for (let i = 0; i <= 63; i++) {
    let x = i % 8 * 20;
    let y = 40 + Math.floor(i / 8) * 20;

    let c = "#14304a";
    if (ships[me][i] > 0) { c = "#5b6b8a"; }
    if (ships[me][i] > 0 && sunk(me, ships[me][i])) { c = "#3a2030"; }
    box(20 + x, y, 19, 19, c);
    if (shots[me][i] === 1) { bubble(30 + x, y + 10, 3, "#a7c4dd"); }
    if (shots[me][i] === 2) { sprite("🔥", 30 + x, y + 11, 13); }

    let e = "#1b2f6b";
    if (shots[foe][i] === 2 && sunk(foe, ships[foe][i])) { e = "#6b1b3f"; }
    if (showEnemy && ships[foe][i] > 0 && shots[foe][i] === 0) { e = "#5b6b8a"; }
    box(220 + x, y, 19, 19, e);
    if (shots[foe][i] === 1) { bubble(230 + x, y + 10, 3, "#a7c4dd"); }
    if (shots[foe][i] === 2) { sprite("💥", 230 + x, y + 11, 14); }
  }
  write("hits taken " + hitsOn(me) + "/12", 20, 206, colors[me], 12);
  write("hits " + hitsOn(foe) + "/12", 220, 206, colors[foe], 12);
}

gameloop(function () {
  cool -= 1;
  let ts = taps();
  let ready = cool <= 0;
  let next = ready && (ts.length > 0 || justpressed("space"));

  if (state === "cover" && next) {
    go(after);
  } else if (state === "place" && ready) {
    let shuffle = justpressed("r");
    let done = justpressed("space");
    for (const t of ts) {
      if (t[0] > 230 && t[0] < 380 && t[1] > 60 && t[1] < 104) { shuffle = true; }
      if (t[0] > 230 && t[0] < 380 && t[1] > 120 && t[1] < 164) { done = true; }
    }
    if (shuffle) { place(ships[turn]); }
    if (done) {
      // PINK sets up, then BLUE. After BLUE, the battle starts with PINK
      if (turn === 1) {
        turn = 2;
        after = "place";
      } else {
        turn = 1;
        after = "aim";
      }
      go("cover");
    }
  } else if (state === "aim" && ready) {
    if (justpressed("left") && cursor % 8 > 0) { cursor -= 1; }
    if (justpressed("right") && cursor % 8 < 7) { cursor += 1; }
    if (justpressed("up") && cursor > 7) { cursor -= 8; }
    if (justpressed("down") && cursor < 56) { cursor += 8; }
    if (justpressed("space")) { fire(cursor); }
    for (const t of ts) {
      let c = Math.floor((t[0] - 220) / 20);
      let r = Math.floor((t[1] - 40) / 20);
      if (state === "aim" && c >= 0 && c <= 7 && r >= 0 && r <= 7) {
        cursor = r * 8 + c;
        fire(cursor);
      }
    }
  } else if (state === "result" && next) {
    turn = 3 - turn;
    after = "aim";
    go("cover");
  }

  wipe("#0b1a2e");

  if (state === "cover") {
    // nothing secret on this screen, so it is safe to pass the device
    sprite("🚢", 200, 80, 48);
    sprite("pass to " + names[turn] + " 👉", 200, 140, 26, colors[turn]);
    let what = "time to set up your fleet in secret";
    if (after === "aim") { what = "your turn to fire"; }
    sprite(what, 200, 176, 14, "white");
    sprite(names[3 - turn] + ", look away 🙈", 200, 202, 13, "#a79cc2");
    sprite("tap or press space when ready", 200, 250, 13, "#ffb469");
    return;
  }

  if (state === "place") {
    write(names[turn] + "'S FLEET", 20, 16, colors[turn], 13);
    for (let i = 0; i <= 63; i++) {
      let c = "#14304a";
      if (ships[turn][i] > 0) { c = "#5b6b8a"; }
      box(20 + i % 8 * 20, 40 + Math.floor(i / 8) * 20, 19, 19, c);
    }
    box(230, 60, 150, 44, "#372d55");
    sprite("🔀 shuffle · R", 305, 82, 14);
    box(230, 120, 150, 44, colors[turn]);
    sprite("✅ ready · space", 305, 142, 14, "#130d20");
    sprite("battleship 4 · cruiser 3", 305, 186, 11, "#a79cc2");
    sprite("sub 3 · speedboat 2", 305, 202, 11, "#a79cc2");
    sprite(names[turn] + ", set up your ships 🤫", 200, 250, 16, colors[turn]);
    sprite("only " + names[turn] + " should be looking", 200, 274, 12, "#a79cc2");
    return;
  }

  boards(turn, state === "won");

  if (state === "aim") {
    // keyboard cursor on enemy waters
    let x = 220 + cursor % 8 * 20;
    let y = 40 + Math.floor(cursor / 8) * 20;
    box(x - 1, y - 1, 21, 2, "white");
    box(x - 1, y + 18, 21, 2, "white");
    box(x - 1, y - 1, 2, 21, "white");
    box(x + 18, y - 1, 2, 21, "white");
    sprite(names[turn] + ", fire! 🎯", 200, 240, 17, colors[turn]);
    sprite("tap enemy waters, or aim with the arrows and press space", 200, 266, 12, "#a79cc2");
  } else if (state === "result") {
    sprite(msg, 200, 240, 17, "white");
    sprite("tap or press space, then pass to " + names[3 - turn], 200, 266, 12, "#ffb469");
  } else if (state === "won") {
    let fired = 0;
    for (const s of shots[3 - turn]) {
      if (s !== 0) { fired += 1; }
    }
    box(0, 222, 400, 78, "rgba(19, 13, 32, 0.95)");
    center(names[turn] + " sank the whole fleet 🏆", 232, colors[turn], 20);
    center(names[turn] + " won in " + fired + " shots · all ships are shown now", 260, "#ffb469", 12);
    center("press Restart for a new battle", 280, "#a79cc2", 12);
    gg();
  }
});
