/*
  2048
  ----
  Goal: Merge tiles to make a 2048 tile.
  Keys: Arrow keys, or the buttons under the screen.
  Phone: Swipe up, down, left or right.
  How: Every move slides all tiles. Two touching tiles with the same number merge into one. A new 2 or 4 appears after each move.
  Score: Each merge adds the new tile's value to your score.
  Lose: The board is full and nothing can merge.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// 2048: slide with the arrow keys, buttons, or swipe
// same numbers merge. Can you reach 2048?
let grid = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let score = 0;
let last = "";
let held = false;
let sx = 0;
let sy = 0;
let colors = [[2, "#efe9fb"], [4, "#e3d5ff"], [8, "#ffb469"], [16, "#ff9a4d"], [32, "#ff6f61"], [64, "#ff5aa8"], [128, "#c9a4ff"], [256, "#a77bff"], [512, "#7fd3ff"], [1024, "#5fd69b"], [2048, "#ffd84d"]];

function colorOf(v) {
  for (const p of colors) {
    if (eq(p[0], v)) { return p[1]; }
  }
  return "#13804f";
}

function addTile() {
  let free = [];
  for (let i = 0; i <= 15; i++) {
    if (grid[i] === 0) { free.push(i); }
  }
  if (free.length > 0) {
    let tile = 2;
    if (rng(1, 10) === 1) { tile = 4; }
    grid[free[rng(0, free.length - 1)]] = tile;
  }
}

// slide 4 numbers toward the front and merge pairs
function slide(row) {
  let nums = [];
  for (const v of row) {
    if (v !== 0) { nums.push(v); }
  }
  let res = [];
  let i = 0;
  while (i < nums.length) {
    if (i + 1 < nums.length && eq(nums[i], nums[i + 1])) {
      res.push(nums[i] * 2);
      score += nums[i] * 2;
      i += 2;
    } else {
      res.push(nums[i]);
      i += 1;
    }
  }
  while (res.length < 4) { res.push(0); }
  return res;
}

// the 4 cells of line k, in the order they slide
function lineOf(dir, k) {
  let idx = [];
  for (let j = 0; j <= 3; j++) {
    if (dir === "left") { idx.push(k * 4 + j); }
    if (dir === "right") { idx.push(k * 4 + 3 - j); }
    if (dir === "up") { idx.push(j * 4 + k); }
    if (dir === "down") { idx.push((3 - j) * 4 + k); }
  }
  return idx;
}

function move(dir) {
  let changed = false;
  for (let k = 0; k <= 3; k++) {
    let idx = lineOf(dir, k);
    let row = [];
    for (const i of idx) { row.push(grid[i]); }
    let res = slide(row);
    for (let j = 0; j <= 3; j++) {
      if (!eq(grid[idx[j]], res[j])) { changed = true; }
      grid[idx[j]] = res[j];
    }
  }
  if (changed) { addTile(); }
}

function stuck() {
  for (let i = 0; i <= 15; i++) {
    if (grid[i] === 0) { return false; }
    if (i % 4 < 3 && eq(grid[i], grid[i + 1])) { return false; }
    if (i < 12 && eq(grid[i], grid[i + 4])) { return false; }
  }
  return true;
}

addTile();
addTile();

gameloop(function () {
  // keys: move once per press
  let dir = "";
  for (const d of ["left", "right", "up", "down"]) {
    if (pressed(d)) { dir = d; }
  }
  let go = "";
  if (dir !== "" && !eq(dir, last)) { go = dir; }
  last = dir;

  // swipes: compare where the finger started and ended
  if (holding() && !held) {
    sx = tapx();
    sy = tapy();
  }
  if (held && !holding()) {
    let ddx = tapx() - sx;
    let ddy = tapy() - sy;
    if (Math.abs(ddx) > 30 && Math.abs(ddx) > Math.abs(ddy)) {
      go = "right";
      if (ddx < 0) { go = "left"; }
    } else if (Math.abs(ddy) > 30) {
      go = "down";
      if (ddy < 0) { go = "up"; }
    }
  }
  held = holding();

  if (go !== "") { move(go); }

  wipe("#1d1631");
  box(12, 7, 286, 286, "#2a2140");
  let biggest = 0;
  for (let i = 0; i <= 15; i++) {
    let x = 18 + i % 4 * 70;
    let y = 13 + Math.floor(i / 4) * 70;
    let v = grid[i];
    if (v > biggest) { biggest = v; }
    if (v === 0) {
      box(x, y, 64, 64, "#372d55");
    } else {
      box(x, y, 64, 64, colorOf(v));
      let size = 28;
      if (v >= 128) { size = 22; }
      if (v >= 1024) { size = 17; }
      let ink = "white";
      if (v <= 4) { ink = "#1d1631"; }
      sprite(v, x + 32, y + 33, size, ink);
    }
  }
  write("score", 314, 16, "#a79cc2", 13);
  write(score, 314, 34, "white", 24);
  write("best tile", 314, 80, "#a79cc2", 13);
  write(biggest, 314, 98, "#ffb469", 24);

  if (biggest >= 2048) {
    write("2048 🏆", 314, 150, "#ffd84d", 18);
  }
  if (stuck()) {
    box(12, 118, 286, 64, "#130d20");
    sprite("GG 💀 no moves left", 155, 140, 20, "white");
    sprite("press Restart to retry", 155, 166, 13, "#a79cc2");
    gg();
  }
});
