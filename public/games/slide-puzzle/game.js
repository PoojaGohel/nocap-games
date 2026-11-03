/*
  Slide Puzzle
  ------------
  Goal: Slide the tiles back into order: 1, 2, 3... left to right, top to bottom, with the gap in the last corner.
  Controls: Tap any tile in the same row or column as the gap to slide it. Arrow keys slide a tile into the gap.
  Help: Tiles turn green when they are in the right spot.
  Levels: 3×3, then 4×4, then 5×5. Try to use fewer moves!

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// SLIDE PUZZLE: slide the tiles back into order: 1, 2, 3... with the gap last
// tap a tile in the same row or column as the gap · arrow keys work too
// level 1 = 3×3, level 2 = 4×4, level 3+ = 5×5
let level = 1;
let n = 3;
let tiles = [];
let gap = 0;
let moves = 0;
let frames = 0;
let size = 0;
let ox = 0;
let state = "play";
let wait = 0;

function build() {
  n = 2 + level;
  if (n > 5) { n = 5; }
  tiles = [];
  for (let i = 1; i <= n * n - 1; i++) {
    tiles.push(i);
  }
  tiles.push(0);
  gap = n * n - 1;
  // mix it with random legal moves, so it can always be solved
  let last = -1;
  for (let k = 1; k <= n * n * 25; k++) {
    let opts = [];
    let gx = gap % n;
    let gy = Math.floor(gap / n);
    if (gx > 0 && !eq(gap - 1, last)) { opts.push(gap - 1); }
    if (gx < n - 1 && !eq(gap + 1, last)) { opts.push(gap + 1); }
    if (gy > 0 && !eq(gap - n, last)) { opts.push(gap - n); }
    if (gy < n - 1 && !eq(gap + n, last)) { opts.push(gap + n); }
    let pick = opts[rng(0, opts.length - 1)];
    last = gap;
    tiles[gap] = tiles[pick];
    tiles[pick] = 0;
    gap = pick;
  }
  moves = 0;
  frames = 0;
  size = Math.floor(244 / n);
  ox = (400 - n * size) / 2;
  state = "play";
}
build();

// slide everything between the gap and tile p
function slideFrom(p) {
  if (p < 0 || p >= n * n || eq(p, gap)) { return; }
  let step = 0;
  if (eq(Math.floor(p / n), Math.floor(gap / n))) {
    step = 1;
    if (p < gap) { step = -1; }
  } else if (eq(p % n, gap % n)) {
    step = n;
    if (p < gap) { step = -n; }
  }
  if (step === 0) { return; }
  while (!eq(gap, p)) {
    let nb = gap + step;
    tiles[gap] = tiles[nb];
    tiles[nb] = 0;
    gap = nb;
  }
  moves += 1;
}

function solved() {
  for (let i = 0; i <= n * n - 2; i++) {
    if (!eq(tiles[i], i + 1)) { return false; }
  }
  return true;
}

gameloop(function () {
  let ts = taps();
  wait -= 1;
  if (state === "play") {
    frames += 1;
    let gx = gap % n;
    let gy = Math.floor(gap / n);
    if (justpressed("left") && gx < n - 1) { slideFrom(gap + 1); }
    if (justpressed("right") && gx > 0) { slideFrom(gap - 1); }
    if (justpressed("up") && gy < n - 1) { slideFrom(gap + n); }
    if (justpressed("down") && gy > 0) { slideFrom(gap - n); }
    for (const t of ts) {
      let c = Math.floor((t[0] - ox) / size);
      let r = Math.floor((t[1] - 44) / size);
      if (c >= 0 && c < n && r >= 0 && r < n) { slideFrom(r * n + c); }
    }
    if (solved()) {
      state = "win";
      wait = 45;
    }
  } else if (state === "win" && wait <= 0 && (ts.length > 0 || justpressed("space"))) {
    level += 1;
    build();
  }

  wipe("#1d1631");
  box(ox - 4, 40, n * size + 8, n * size + 8, "#2a1f45");
  for (let i = 0; i <= n * n - 1; i++) {
    let v = tiles[i];
    if (v !== 0) {
      let x = ox + i % n * size;
      let y = 44 + Math.floor(i / n) * size;
      let c = "#7b3fd6";
      if (eq(v, i + 1)) { c = "#2e8a5a"; }
      box(x + 2, y + 2, size - 4, size - 4, c);
      sprite(v, x + size / 2, y + size / 2 + 1, size * 0.42, "white");
    }
  }
  write("level " + level + " · " + n + "×" + n, 8, 8, "white", 14);
  sprite("moves " + moves, 200, 16, 14, "#ffb469");
  write(Math.floor(frames / 60) + "s", 350, 8, "#a79cc2", 14);
  sprite("green = in the right spot", 200, 296, 10, "#5fd69b");

  if (state === "win") {
    box(0, 118, 400, 64, "#130d20");
    center("solved in " + moves + " moves 🧩", 126, "white", 24);
    center("tap for level " + (level + 1), 160, "#a79cc2", 14);
  }
});
