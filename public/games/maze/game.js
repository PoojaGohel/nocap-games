/*
  Maze
  ----
  Goal: Get your 🐸 from the top left to the 🚪 exit at the bottom right.
  Keys: Arrow keys or the buttons. Hold a key to keep walking.
  Phone: Tap on the side you want to move toward.
  Points: ⭐ = 50 points. Escaping faster gives a bigger speed bonus.
  Levels: Every level is a brand new random maze, and bigger. From level 4 you can only see around you 🔦.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// MAZE: find the 🚪 exit! Arrow keys or the buttons to move, or tap where to go
// grab ⭐ for bonus points · a new, bigger maze every level
// from level 4 the lights go out 🔦
let level = 1;
let W = 0;
let H = 0;
let cs = 0;
let ox = 0;
let oy = 0;
let right = [];
let down = [];
let me = 0;
let stars = [];
let score = 0;
let timer = 0;
let cool = 0;
let state = "play";
let wait = 0;
let dark = false;
let bonus = 0;

// build a brand new maze by digging random tunnels
function build() {
  W = 5 + level * 2;
  if (W > 19) { W = 19; }
  H = 3 + level;
  if (H > 11) { H = 11; }
  cs = Math.floor(380 / W);
  if (Math.floor(256 / H) < cs) { cs = Math.floor(256 / H); }
  ox = (400 - W * cs) / 2;
  oy = 34 + (260 - H * cs) / 2;
  // every cell starts with a wall on its right and bottom
  right = [];
  down = [];
  let seen = [];
  for (let i = 0; i <= W * H - 1; i++) {
    right.push(true);
    down.push(true);
    seen.push(false);
  }
  let stack = [0];
  seen[0] = true;
  while (stack.length > 0) {
    let cur = stack[stack.length - 1];
    let cx = cur % W;
    let cy = Math.floor(cur / W);
    let opts = [];
    if (cx > 0 && !seen[cur - 1]) { opts.push(cur - 1); }
    if (cx < W - 1 && !seen[cur + 1]) { opts.push(cur + 1); }
    if (cy > 0 && !seen[cur - W]) { opts.push(cur - W); }
    if (cy < H - 1 && !seen[cur + W]) { opts.push(cur + W); }
    if (opts.length === 0) {
      // dead end: walk back
      stack.pop();
    } else {
      // dig into a random neighbor
      let nxt = opts[rng(0, opts.length - 1)];
      if (eq(nxt, cur + 1)) { right[cur] = false; }
      if (eq(nxt, cur - 1)) { right[nxt] = false; }
      if (eq(nxt, cur + W)) { down[cur] = false; }
      if (eq(nxt, cur - W)) { down[nxt] = false; }
      seen[nxt] = true;
      stack.push(nxt);
    }
  }
  me = 0;
  stars = [];
  for (let k = 1; k <= 3; k++) {
    stars.push(rng(1, W * H - 2));
  }
  timer = 0;
  dark = level >= 4;
  state = "play";
}
build();

function tryMove(dx, dy) {
  let cx = me % W;
  let cy = Math.floor(me / W);
  let ok = false;
  if (dx === 1 && cx < W - 1 && !right[me]) { ok = true; }
  if (dx === -1 && cx > 0 && !right[me - 1]) { ok = true; }
  if (dy === 1 && cy < H - 1 && !down[me]) { ok = true; }
  if (dy === -1 && cy > 0 && !down[me - W]) { ok = true; }
  if (ok) { me += dx + dy * W; }
}

gameloop(function () {
  let ts = taps();
  wait -= 1;

  if (state === "play") {
    timer += 1;
    let dx = 0;
    let dy = 0;
    if (pressed("left")) { dx = -1; }
    if (pressed("right")) { dx = 1; }
    if (pressed("up")) { dy = -1; }
    if (pressed("down")) { dy = 1; }
    // hold a key to keep walking
    if (dx === 0 && dy === 0) {
      cool = 0;
    } else if (cool <= 0) {
      if (dx !== 0) { tryMove(dx, 0); } else { tryMove(0, dy); }
      cool = 7;
    }
    cool -= 1;
    for (const t of ts) {
      let tx = t[0] - (ox + me % W * cs + cs / 2);
      let ty = t[1] - (oy + Math.floor(me / W) * cs + cs / 2);
      if (Math.abs(tx) > Math.abs(ty)) {
        tryMove(tx / Math.abs(tx), 0);
      } else if (ty !== 0) {
        tryMove(0, ty / Math.abs(ty));
      }
    }
    let left = [];
    for (const s of stars) {
      if (eq(s, me)) { score += 50; } else { left.push(s); }
    }
    stars = left;
    if (eq(me, W * H - 1)) {
      bonus = 300 - Math.floor(timer / 6);
      if (bonus < 50) { bonus = 50; }
      score += bonus;
      state = "win";
      wait = 80;
    }
  } else if (state === "win" && wait <= 0) {
    level += 1;
    build();
  }

  wipe("#130d20");
  box(ox, oy, W * cs, H * cs, "#1d1631");
  sprite("🚪", ox + (W - 1) * cs + cs / 2, oy + (H - 1) * cs + cs / 2 + 1, cs * 0.7);
  for (const s of stars) {
    sprite("⭐", ox + s % W * cs + cs / 2, oy + Math.floor(s / W) * cs + cs / 2 + 1, cs * 0.55);
  }
  line(ox, oy, ox + W * cs, oy, "#c9a4ff", 2);
  line(ox, oy, ox, oy + H * cs, "#c9a4ff", 2);
  for (let i = 0; i <= W * H - 1; i++) {
    let x = ox + i % W * cs;
    let y = oy + Math.floor(i / W) * cs;
    if (right[i]) { line(x + cs, y, x + cs, y + cs, "#c9a4ff", 2); }
    if (down[i]) { line(x, y + cs, x + cs, y + cs, "#c9a4ff", 2); }
  }
  sprite("🐸", ox + me % W * cs + cs / 2, oy + Math.floor(me / W) * cs + cs / 2 + 1, cs * 0.7);

  // lights out: you only see the squares near you
  if (dark && state === "play") {
    for (let i = 0; i <= W * H - 1; i++) {
      let ddx = i % W - me % W;
      let ddy = Math.floor(i / W) - Math.floor(me / W);
      if (ddx * ddx + ddy * ddy > 9) {
        box(ox + i % W * cs - 1, oy + Math.floor(i / W) * cs - 1, cs + 2, cs + 2, "#0a0612");
      }
    }
  }

  write("level " + level, 8, 8, "white", 15);
  sprite(Math.floor(timer / 60) + "s", 200, 16, 14, "#ffb469");
  write("score " + score, 320, 8, "#ffd84d", 14);
  if (dark) { write("🔦 lights out", 80, 9, "#a79cc2", 12); }

  if (state === "win") {
    box(0, 118, 400, 64, "#130d20");
    center("escaped! 🚪 +" + bonus + " speed bonus", 126, "white", 22);
    center("get ready for level " + (level + 1), 160, "#a79cc2", 14);
  }
});
