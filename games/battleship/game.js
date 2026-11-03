/*
  Battleship · vs bot
  -------------------
  Goal: Sink all 4 enemy ships (12 squares) before the bot sinks yours.
  Fire: Tap a square on ENEMY WATERS (right). 💥 = hit, dot = miss. You and the bot take turns.
  Your fleet: The left board shows your ships and where the bot fired (🔥 = hit).
  The bot: It searches in a checkerboard pattern. Once it hits, it fires around that spot.
  Ships: Battleship 4 · cruiser 3 · sub 3 · speedboat 2. Sunk ships turn dark red.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// BATTLESHIP vs BOT · sink all 4 enemy ships before the bot sinks yours
// tap a square on the ENEMY board (right) to fire
let lengths = [4, 3, 3, 2];
let shipNames = ["", "battleship", "cruiser", "sub", "speedboat"];
let myShips = [];
let myShots = [];
let enemyShips = [];
let enemyShots = [];
for (let i = 0; i <= 63; i++) {
  myShips.push(0);
  myShots.push(0);
  enemyShips.push(0);
  enemyShots.push(0);
}
let targets = [];
let state = "you";
let wait = 0;
let msg1 = "your turn: tap the enemy waters to fire";
let msg2 = "";

// put ships in random spots without overlapping
function place(grid) {
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
place(myShips);
place(enemyShips);

// shots: 0 = not fired, 1 = miss, 2 = hit
function sunk(ships, shots, id) {
  for (let i = 0; i <= 63; i++) {
    if (eq(ships[i], id) && shots[i] !== 2) { return false; }
  }
  return true;
}

function hitsOn(shots) {
  let n = 0;
  for (const s of shots) {
    if (s === 2) { n += 1; }
  }
  return n;
}

function fire(i) {
  if (enemyShips[i] > 0) {
    enemyShots[i] = 2;
    let id = enemyShips[i];
    if (sunk(enemyShips, enemyShots, id)) {
      msg1 = "you sank the bot's " + shipNames[id] + " 🚢💥";
    } else {
      msg1 = "hit! 🔥";
    }
  } else {
    enemyShots[i] = 1;
    msg1 = "miss 💦";
  }
}

// the bot's brain: hunt in a checkerboard, then target around hits
function botFire() {
  let cell = -1;
  while (cell < 0 && targets.length > 0) {
    let t = targets.pop();
    if (myShots[t] === 0) { cell = t; }
  }
  if (cell < 0) {
    let free = [];
    for (let i = 0; i <= 63; i++) {
      if (myShots[i] === 0 && (i % 8 + Math.floor(i / 8)) % 2 === 0) { free.push(i); }
    }
    if (free.length === 0) {
      for (let i = 0; i <= 63; i++) {
        if (myShots[i] === 0) { free.push(i); }
      }
    }
    cell = free[rng(0, free.length - 1)];
  }
  if (myShips[cell] > 0) {
    myShots[cell] = 2;
    let id = myShips[cell];
    if (sunk(myShips, myShots, id)) {
      msg2 = "the bot sank your " + shipNames[id] + " 😭";
      targets = [];
    } else {
      msg2 = "the bot hit your ship 💥";
      let cx = cell % 8;
      let cy = Math.floor(cell / 8);
      if (cx > 0) { targets.push(cell - 1); }
      if (cx < 7) { targets.push(cell + 1); }
      if (cy > 0) { targets.push(cell - 8); }
      if (cy < 7) { targets.push(cell + 8); }
    }
  } else {
    myShots[cell] = 1;
    msg2 = "the bot missed 💦";
  }
}

gameloop(function () {
  if (state === "you") {
    for (const t of taps()) {
      let c = Math.floor((t[0] - 220) / 20);
      let r = Math.floor((t[1] - 40) / 20);
      if (state === "you" && c >= 0 && c <= 7 && r >= 0 && r <= 7) {
        let i = r * 8 + c;
        if (enemyShots[i] === 0) {
          fire(i);
          state = "bot";
          wait = 40;
          if (hitsOn(enemyShots) === 12) { state = "won"; }
        }
      }
    }
  } else if (state === "bot") {
    wait -= 1;
    if (wait <= 0) {
      botFire();
      state = "you";
      if (hitsOn(myShots) === 12) { state = "lost"; }
    }
  }

  wipe("#0b1a2e");
  write("YOUR FLEET", 20, 16, "#7fd3ff", 13);
  write("ENEMY WATERS", 220, 16, "#ff5aa8", 13);
  for (let i = 0; i <= 63; i++) {
    let x = i % 8 * 20;
    let y = 40 + Math.floor(i / 8) * 20;

    // your board: you can see your own ships
    let c = "#14304a";
    if (myShips[i] > 0) { c = "#5b6b8a"; }
    if (myShips[i] > 0 && sunk(myShips, myShots, myShips[i])) { c = "#3a2030"; }
    box(20 + x, y, 19, 19, c);
    if (myShots[i] === 1) { bubble(30 + x, y + 10, 3, "#a7c4dd"); }
    if (myShots[i] === 2) { sprite("🔥", 30 + x, y + 11, 13); }

    // enemy board: ships stay hidden until you hit them
    let e = "#1b2f6b";
    if (enemyShots[i] === 2 && sunk(enemyShips, enemyShots, enemyShips[i])) { e = "#6b1b3f"; }
    if ((state === "lost" || state === "won") && enemyShips[i] > 0 && enemyShots[i] === 0) { e = "#5b6b8a"; }
    box(220 + x, y, 19, 19, e);
    if (enemyShots[i] === 1) { bubble(230 + x, y + 10, 3, "#a7c4dd"); }
    if (enemyShots[i] === 2) { sprite("💥", 230 + x, y + 11, 14); }
  }

  write("hits " + hitsOn(enemyShots) + "/12", 220, 206, "#ff5aa8", 12);
  write("hits " + hitsOn(myShots) + "/12", 20, 206, "#7fd3ff", 12);
  sprite(msg1, 200, 240, 15, "white");
  if (state === "bot") {
    sprite("the bot is aiming... 🎯", 200, 264, 13, "#a79cc2");
  } else {
    sprite(msg2, 200, 264, 13, "#ffb469");
  }

  if (state === "won" || state === "lost") {
    let msg = "you sank the whole bot fleet 🏆";
    if (state === "lost") { msg = "🤖 the bot sank your fleet"; }
    let fired = 0;
    for (const sh of myShots) {
      if (sh !== 0) { fired += 1; }
    }
    // bottom bar, so both boards stay visible
    box(0, 222, 400, 78, "rgba(19, 13, 32, 0.95)");
    center(msg, 232, "white", 20);
    center("the bot fired " + fired + " shots · all ships are shown now", 260, "#ffb469", 12);
    center("press Restart for a new battle", 280, "#a79cc2", 12);
    gg();
  }
});
