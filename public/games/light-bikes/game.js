/*
  Light Bikes · 2 players
  -----------------------
  Goal: Your bike never stops and leaves a glowing trail. Make the other player crash.
  Pink: W A S D to turn.
  Blue: Arrow keys to turn.
  Phone: Tap your half of the screen in the direction you want to go.
  Lose: Hit a wall, your own trail, or the other trail. If both crash at once, it's a draw.
  Rounds: Press space or tap for the next round. Wins are counted at the top.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// LIGHT BIKES · 2 players · don't crash into walls or trails
// PINK: W A S D · BLUE: arrow keys
// on a phone: tap your half of the screen where you want to go
let W = 40;
let H = 30;
let grid = [];
let a = [];
let b = [];
let frames = 0;
let result = "";
let wait = 0;
let pinkWins = 0;
let blueWins = 0;

// a bike is [x, y, dx, dy, next dx, next dy]
function reset() {
  grid = [];
  for (let i = 0; i <= W * H - 1; i++) {
    grid.push(0);
  }
  a = [8, 15, 1, 0, 1, 0];
  b = [31, 15, -1, 0, -1, 0];
  grid[15 * W + 8] = 1;
  grid[15 * W + 31] = 2;
  frames = 0;
  result = "";
}
reset();

// turn, but never straight back into your own trail
function turn(bike, nx, ny) {
  if (!eq(nx, -bike[2]) || !eq(ny, -bike[3])) {
    bike[4] = nx;
    bike[5] = ny;
  }
}

function crashed(bike) {
  if (bike[0] < 0 || bike[0] >= W || bike[1] < 0 || bike[1] >= H) { return true; }
  return grid[bike[1] * W + bike[0]] !== 0;
}

gameloop(function () {
  if (pressed("w")) { turn(a, 0, -1); }
  if (pressed("s")) { turn(a, 0, 1); }
  if (pressed("a")) { turn(a, -1, 0); }
  if (pressed("d")) { turn(a, 1, 0); }
  if (pressed("up")) { turn(b, 0, -1); }
  if (pressed("down")) { turn(b, 0, 1); }
  if (pressed("left")) { turn(b, -1, 0); }
  if (pressed("right")) { turn(b, 1, 0); }
  let ts = taps();
  for (const t of ts) {
    let bike = a;
    if (t[0] >= 200) { bike = b; }
    let ddx = t[0] - bike[0] * 10 - 5;
    let ddy = t[1] - bike[1] * 10 - 5;
    if (Math.abs(ddx) > Math.abs(ddy)) {
      turn(bike, ddx / Math.abs(ddx), 0);
    } else if (ddy !== 0) {
      turn(bike, 0, ddy / Math.abs(ddy));
    }
  }

  if (result !== "") {
    wait -= 1;
    if (wait <= 0 && (justpressed("space") || ts.length > 0)) { reset(); }
  } else {
    frames += 1;
    if (frames % 4 === 0) {
      for (const bike of [a, b]) {
        bike[2] = bike[4];
        bike[3] = bike[5];
        bike[0] += bike[2];
        bike[1] += bike[3];
      }
      let aDead = crashed(a);
      let bDead = crashed(b);
      if (eq(a[0], b[0]) && eq(a[1], b[1])) {
        aDead = true;
        bDead = true;
      }
      if (aDead && bDead) {
        result = "head-on crash, it's a draw 🤝";
      } else if (aDead) {
        result = "BLUE wins the round 🏆";
        blueWins += 1;
      } else if (bDead) {
        result = "PINK wins the round 🏆";
        pinkWins += 1;
      } else {
        grid[a[1] * W + a[0]] = 1;
        grid[b[1] * W + b[0]] = 2;
      }
      if (result !== "") { wait = 45; }
    }
  }

  wipe("#0b0716");
  for (let i = 0; i <= W * H - 1; i++) {
    if (grid[i] === 1) { box(i % W * 10, Math.floor(i / W) * 10, 10, 10, "#ff5aa8"); }
    if (grid[i] === 2) { box(i % W * 10, Math.floor(i / W) * 10, 10, 10, "#7fd3ff"); }
  }
  box(a[0] * 10, a[1] * 10, 10, 10, "white");
  box(b[0] * 10, b[1] * 10, 10, 10, "white");
  write("PINK " + pinkWins, 8, 6, "#ff5aa8", 14);
  write("BLUE " + blueWins, 338, 6, "#7fd3ff", 14);

  if (frames < 60 && result === "") {
    center("PINK: W A S D · BLUE: arrow keys", 250, "#a79cc2", 14);
  }
  if (result !== "") {
    box(0, 118, 400, 64, "#1d1631");
    center(result, 126, "white", 22);
    center("tap or press space for the next round", 160, "#a79cc2", 14);
  }
});
