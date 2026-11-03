/*
  Hockey · vs bot
  ---------------
  Goal: Score 7 goals in the bot's goal (right side) before it scores 7 in yours.
  Controls: Drag anywhere on the screen, or use the arrow keys / W A S D. You stay on the left half.
  The bot: It defends its goal, then rushes the puck when it crosses the middle. It speeds up when you are winning.
  Tip: Hit the puck at an angle off the walls. The bot is slow to react to bank shots.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// HOCKEY vs BOT · first to 7 goals · the bot gets faster when you lead
// drag on your half, or use the arrow keys / W A S D
let lp = [80, 150, 0, 0];
let rp = [340, 150, 0, 0];
let puck = [200, 150, 0, 0];
let ls = 0;
let rs = 0;
let pause = 40;
let aim = 0;
let side = "left";

function moveTo(p, x, y, minX, maxX) {
  if (x < minX) { x = minX; }
  if (x > maxX) { x = maxX; }
  if (y < 20) { y = 20; }
  if (y > 280) { y = 280; }
  p[2] = x - p[0];
  p[3] = y - p[1];
  p[0] = x;
  p[1] = y;
}

function hit(p) {
  let dx = puck[0] - p[0];
  let dy = puck[1] - p[1];
  let d = Math.sqrt(dx * dx + dy * dy);
  if (d < 32 && d > 0) {
    let nx = dx / d;
    let ny = dy / d;
    puck[0] = p[0] + nx * 32;
    puck[1] = p[1] + ny * 32;
    let along = puck[2] * nx + puck[3] * ny;
    if (along < 0) {
      puck[2] -= 2 * along * nx;
      puck[3] -= 2 * along * ny;
    }
    puck[2] += p[2] * 0.7 + nx;
    puck[3] += p[3] * 0.7 + ny;
  }
}

function faceoff() {
  puck = [200, 150 + rng(-30, 30), 0, 0];
  pause = 40;
}

// the bot's brain: attack when the puck is on its side, defend when not
function botThink() {
  let tx = 350;
  let ty = puck[1];
  if (ty < 110) { ty = 110; }
  if (ty > 190) { ty = 190; }
  // each time the puck comes over, pick a new angle to shoot at
  if (puck[0] > 195 && side === "left") { aim = rng(-16, 16); }
  side = "left";
  if (puck[0] > 195) { side = "right"; }
  if (puck[0] > 195) {
    // get behind the puck and push it toward your goal
    tx = puck[0] + 24;
    ty = puck[1] + aim;
  }
  let speed = 3.2 + (ls - rs) * 0.5;
  if (speed < 2.5) { speed = 2.5; }
  if (speed > 6) { speed = 6; }
  let ddx = tx - rp[0];
  let ddy = ty - rp[1];
  let d = Math.sqrt(ddx * ddx + ddy * ddy);
  // lunge when it's close to the puck
  if (puck[0] > 195 && d < 60) { speed = speed * 1.8; }
  if (d > speed) {
    ddx = ddx * speed / d;
    ddy = ddy * speed / d;
  }
  moveTo(rp, rp[0] + ddx, rp[1] + ddy, 220, 380);
}

gameloop(function () {
  let lx = lp[0];
  let ly = lp[1];
  if (pressed("w") || pressed("up")) { ly -= 6; }
  if (pressed("s") || pressed("down")) { ly += 6; }
  if (pressed("a") || pressed("left")) { lx -= 6; }
  if (pressed("d") || pressed("right")) { lx += 6; }
  for (const f of fingers()) {
    lx = f[0];
    ly = f[1];
  }
  moveTo(lp, lx, ly, 20, 180);
  botThink();

  if (pause > 0) {
    pause -= 1;
  } else {
    puck[0] += puck[2];
    puck[1] += puck[3];
    puck[2] = puck[2] * 0.993;
    puck[3] = puck[3] * 0.993;
    let mouth = puck[1] > 110 && puck[1] < 190;
    if (puck[1] < 12 && puck[3] < 0) { puck[3] = -puck[3]; }
    if (puck[1] > 288 && puck[3] > 0) { puck[3] = -puck[3]; }
    if (!mouth && puck[0] < 12 && puck[2] < 0) { puck[2] = -puck[2]; }
    if (!mouth && puck[0] > 388 && puck[2] > 0) { puck[2] = -puck[2]; }
    hit(lp);
    hit(rp);
    let sp = Math.sqrt(puck[2] * puck[2] + puck[3] * puck[3]);
    if (sp > 13) {
      puck[2] = puck[2] * 13 / sp;
      puck[3] = puck[3] * 13 / sp;
    }
    if (puck[1] < 12) { puck[1] = 12; }
    if (puck[1] > 288) { puck[1] = 288; }
    if (puck[0] < -12) {
      rs += 1;
      faceoff();
    }
    if (puck[0] > 412) {
      ls += 1;
      faceoff();
    }
  }

  wipe("#dff1ff");
  box(199, 0, 2, 300, "#9cc9e6");
  bubble(200, 150, 42, "#9cc9e6");
  bubble(200, 150, 39, "#dff1ff");
  box(0, 110, 6, 80, "#ff5aa8");
  box(394, 110, 6, 80, "#7fd3ff");
  bubble(puck[0], puck[1], 12, "#1d1631");
  bubble(lp[0], lp[1], 20, "#ff5aa8");
  bubble(lp[0], lp[1], 8, "#e0177a");
  bubble(rp[0], rp[1], 20, "#7fd3ff");
  sprite("🤖", rp[0], rp[1] + 1, 18);
  sprite("YOU " + ls, 150, 20, 20, "#e0177a");
  sprite("BOT " + rs, 250, 20, 20, "#2450f0");

  if (ls === 7 || rs === 7) {
    let msg = "you beat the bot 🏆";
    if (rs === 7) { msg = "🤖 the bot wins"; }
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.9)");
    center(msg + " · " + ls + " - " + rs, 257, "white", 19);
    center("press Restart for a rematch", 280, "#a79cc2", 12);
    gg();
  }
});
