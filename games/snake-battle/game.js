/*
  Snake Battle · vs bot
  ---------------------
  Goal: Survive longer than the 🤖 bot snake. Eat 🍎 to grow.
  Keys: Arrow keys, or the buttons under the screen.
  The bot: It heads for the apple and avoids spots with no room to escape.
  Lose: Hit a wall, yourself, or the bot. Head-on crash = draw.
  Rounds: Tap or press space for the next round. Wins are counted at the top.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// SNAKE BATTLE vs BOT · you are green, the 🤖 bot is orange
// arrow keys or buttons to turn · eat 🍎 to grow
// crash into a wall or any snake and you lose the round
let me = [];
let bot = [];
let dx = 1;
let dy = 0;
let nx = 1;
let ny = 0;
let bdx = -1;
let bdy = 0;
let food = [];
let frames = 0;
let result = "";
let wait = 0;
let wins = [0, 0];
let crashes = [];

function blocked(x, y) {
  if (x < 0 || x > 19 || y < 0 || y > 14) { return true; }
  for (const p of me) {
    if (eq(p[0], x) && eq(p[1], y)) { return true; }
  }
  for (const p of bot) {
    if (eq(p[0], x) && eq(p[1], y)) { return true; }
  }
  return false;
}

function newFood() {
  food = [rng(0, 19), rng(0, 14)];
  while (blocked(food[0], food[1])) {
    food = [rng(0, 19), rng(0, 14)];
  }
}

function reset() {
  me = [[4, 7], [3, 7], [2, 7]];
  bot = [[15, 7], [16, 7], [17, 7]];
  dx = 1;
  dy = 0;
  nx = 1;
  ny = 0;
  bdx = -1;
  bdy = 0;
  frames = 0;
  result = "";
  crashes = [];
  newFood();
}
reset();

// how many open squares are next to x, y?
function space(x, y) {
  let n = 0;
  for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    if (!blocked(x + d[0], y + d[1])) { n += 1; }
  }
  return n;
}

// the bot's brain: score every safe move, pick the best
function botThink() {
  let head = bot[0];
  let best = -999;
  let choice = [bdx, bdy];
  for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    if (!eq(d[0], -bdx) || !eq(d[1], -bdy)) {
      let x = head[0] + d[0];
      let y = head[1] + d[1];
      if (!blocked(x, y)) {
        // closer to the food is good, more room to move is safer
        let s = 0 - Math.abs(x - food[0]) - Math.abs(y - food[1]) + space(x, y) * 3 + rng(0, 1);
        if (s > best) {
          best = s;
          choice = d;
        }
      }
    }
  }
  bdx = choice[0];
  bdy = choice[1];
}

gameloop(function () {
  if (pressed("left") && dx !== 1) {
    nx = -1;
    ny = 0;
  }
  if (pressed("right") && dx !== -1) {
    nx = 1;
    ny = 0;
  }
  if (pressed("up") && dy !== 1) {
    nx = 0;
    ny = -1;
  }
  if (pressed("down") && dy !== -1) {
    nx = 0;
    ny = 1;
  }

  if (result !== "") {
    wait -= 1;
    if (wait <= 0 && (justpressed("space") || taps().length > 0)) { reset(); }
  } else {
    frames += 1;
    if (frames % 7 === 0) {
      dx = nx;
      dy = ny;
      botThink();
      let mh = [me[0][0] + dx, me[0][1] + dy];
      let bh = [bot[0][0] + bdx, bot[0][1] + bdy];
      let meDead = blocked(mh[0], mh[1]);
      let botDead = blocked(bh[0], bh[1]);
      if (eq(mh, bh)) {
        meDead = true;
        botDead = true;
      }
      // remember where the crash happened
      if (meDead) { crashes.push(mh); }
      if (botDead) { crashes.push(bh); }
      if (meDead && botDead) {
        result = "head-on crash, it's a draw 🤝";
      } else if (meDead) {
        result = "🤖 the bot wins this round";
        wins[1] += 1;
      } else if (botDead) {
        result = "the bot crashed, you win 🏆";
        wins[0] += 1;
      } else {
        me = [mh].concat(me);
        bot = [bh].concat(bot);
        let meAte = eq(mh, food);
        let botAte = eq(bh, food);
        if (!meAte) { me.pop(); }
        if (!botAte) { bot.pop(); }
        if (meAte || botAte) { newFood(); }
      }
      if (result !== "") { wait = 40; }
    }
  }

  wipe("#0f1a12");
  sprite("🍎", food[0] * 20 + 10, food[1] * 20 + 11, 18);
  for (const p of me) {
    box(p[0] * 20 + 1, p[1] * 20 + 1, 18, 18, "#5fd69b");
  }
  box(me[0][0] * 20 + 1, me[0][1] * 20 + 1, 18, 18, "#b6ffd4");
  for (const p of bot) {
    box(p[0] * 20 + 1, p[1] * 20 + 1, 18, 18, "#ff9a4d");
  }
  sprite("🤖", bot[0][0] * 20 + 10, bot[0][1] * 20 + 11, 18);
  for (const c of crashes) {
    let cx = c[0];
    let cy = c[1];
    if (cx < 0) { cx = 0; }
    if (cx > 19) { cx = 19; }
    if (cy < 0) { cy = 0; }
    if (cy > 14) { cy = 14; }
    sprite("💥", cx * 20 + 10, cy * 20 + 11, 26);
  }
  write("YOU " + me.length + " · wins " + wins[0], 8, 6, "#5fd69b", 13);
  write("BOT " + bot.length + " · wins " + wins[1], 290, 6, "#ff9a4d", 13);

  if (result !== "") {
    box(0, 252, 400, 48, "rgba(19, 13, 32, 0.9)");
    center(result, 257, "white", 19);
    center("💥 marks the crash · tap or press space for the next round", 280, "#a79cc2", 12);
  }
});
