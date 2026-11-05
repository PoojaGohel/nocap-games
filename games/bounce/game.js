/*
  Bounce
  ------
  Goal: Keep the ball in the air. Don't let it touch the floor.
  Kick: Tap or click the ball to kick it up. Hit it on the left to send it right, and the other way round.
    Keyboard: press space when the ball is in the glowing kick zone at the bottom.
  Stars: Bounce the ball through a ⭐ for +5.
  Harder: The ball gets heavier as your score goes up.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// BOUNCE · tap the ball to keep it up
let R = 18;
let FLOOR = 282;
let ZONE = 205;
let x = 200;
let y = 86;
let dx = 0;
let dy = 0;
let spin = 0;
let score = 0;
let kicks = 0;
let best = 0;
let state = "ready";
let star = null;
let pops = [];
let wait = 0;
let flash = 0;

function reset() {
  x = 200;
  y = 120;
  dx = 0;
  dy = -2;
  spin = 0;
  score = 0;
  kicks = 0;
  star = null;
  pops = [];
  state = "play";
}

function gravity() {
  return 0.22 + Math.min(score, 60) * 0.004;
}

// kick from point (px, py): the further from the middle you hit, the more sideways it goes
function kick(px) {
  let side = (x - px) / R;
  dx = Math.max(-6, Math.min(6, dx * 0.4 + side * 4 + rng(-5, 5) / 10));
  dy = -(7.2 + Math.min(score, 40) * 0.03);
  spin = side * 12;
  score += 1;
  kicks += 1;
  flash = 6;
  pops.push({ x: x, y: y - R, text: "+1", age: 0, c: "white" });
  if (star === null && kicks % 4 === 0) {
    star = { x: rng(40, 360), y: rng(60, 150), age: 0 };
  }
}

gameloop(function () {
  if (state === "ready") {
    if (tapped() || justpressed("space")) { reset(); }
  } else if (state === "play") {
    // taps close enough to the ball count as a kick (a little extra room for fingers)
    for (const t of taps()) {
      if (Math.hypot(t[0] - x, t[1] - y) <= R + 14) { kick(t[0]); }
    }
    if (justpressed("space") && y > ZONE) { kick(x + rng(-6, 6)); }

    dy += gravity();
    x += dx;
    y += dy;
    if (x < R) {
      x = R;
      dx = -dx * 0.9;
    }
    if (x > 400 - R) {
      x = 400 - R;
      dx = -dx * 0.9;
    }
    if (y < R + 40) {
      y = R + 40;
      dy = Math.abs(dy) * 0.6;
    }

    if (star !== null) {
      star.age += 1;
      if (Math.hypot(star.x - x, star.y - y) < R + 14) {
        score += 5;
        pops.push({ x: star.x, y: star.y, text: "+5 ⭐", age: 0, c: "#ffd84d" });
        star = null;
      } else if (star.age > 420) {
        star = null;
      }
    }

    if (y >= FLOOR - R) {
      y = FLOOR - R;
      state = "over";
      wait = 0;
      if (score > best) { best = score; }
    }
  } else {
    wait += 1;
    if (wait > 45 && (tapped() || justpressed("space"))) { reset(); }
  }
  for (let i = pops.length - 1; i >= 0; i--) {
    pops[i].age += 1;
    if (pops[i].age > 36) { pops.splice(i, 1); }
  }
  if (flash > 0) { flash -= 1; }

  wipe("#1d1631");
  // kick zone for keyboard players, and the floor
  box(0, ZONE, 400, FLOOR - ZONE, "rgba(255, 90, 168, 0.06)");
  box(0, ZONE, 400, 1, "rgba(255, 90, 168, 0.25)");
  box(0, FLOOR, 400, 300 - FLOOR, "#3b2a5c");
  box(0, FLOOR, 400, 3, "#ff5aa8");

  if (star !== null) {
    let s = 22 + sin(star.age * 6) * 3;
    sprite("⭐", star.x, star.y, s);
  }

  // shadow on the floor gets smaller the higher the ball is
  let h = Math.max(0.2, 1 - (FLOOR - y) / 260);
  bubble(x, FLOOR + 6, R * h, "rgba(0, 0, 0, 0.35)");
  let squash = flash > 0 ? 3 : 0;
  bubble(x, y, R + squash, flash > 0 ? "#ff8cc4" : "#ff5aa8");
  bubble(x - 6, y - 6, 5, "rgba(255, 255, 255, 0.55)");
  let a = clock() * spin * 20;
  line(x - cos(a) * R * 0.7, y - sin(a) * R * 0.7, x + cos(a) * R * 0.7, y + sin(a) * R * 0.7, "rgba(19, 13, 32, 0.35)", 3);

  for (const p of pops) {
    sprite(p.text, p.x, p.y - p.age * 0.8, 14, p.c);
  }

  box(0, 0, 400, 36, "rgba(19, 13, 32, 0.8)");
  write("score " + score, 10, 10, "white", 16);
  write("best " + best, 320, 12, "#a79cc2", 13);

  if (state === "ready") {
    center("keep the ball in the air ⚽", 130, "white", 20);
    center("tap the ball to kick it up · keyboard: space in the pink zone", 160, "#a79cc2", 12);
    center("tap or press space to start", 186, "#ffb469", 14);
  } else if (state === "over") {
    box(60, 96, 280, 110, "rgba(19, 13, 32, 0.94)");
    center("it touched the floor 😵", 108, "white", 18);
    center(score + " points · " + kicks + " kicks", 138, "#ffd84d", 18);
    center(score >= best && score > 0 ? "new best! 🏆" : "best " + best, 166, "#5ee6a8", 13);
    if (wait > 45) { center("tap to try again", 186, "#a79cc2", 12); }
  }
});
