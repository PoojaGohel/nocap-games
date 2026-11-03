/*
  Stick Hero
  ----------
  Goal: Get the 🥷 from platform to platform.
  Controls: Hold the screen or space to grow the stick. Let go and it falls over to make a bridge.
  Rule: The stick has to land on the next platform. Too short or too long, and you fall.
  Perfect: Land the stick right on the red dot for +1 bonus.
  Harder: Platforms get thinner as your score goes up.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// STICK HERO: hold to grow the stick, let go to drop it as a bridge
// too short or too long and the 🥷 falls! Land on the red dot for a PERFECT bonus
let plats = [];
let stickLen = 0;
let angle = 0;
let hx = 0;
let hy = 188;
let score = 0;
let best = 0;
let ok = false;
let tooShort = false;
let shift = 0;
let armed = false;
let perfectT = 0;
let state = "start";
let wait = 0;

// a platform is [x, width]
function addPlat() {
  let last = plats[plats.length - 1];
  let w = rng(24, 70) - score;
  if (w < 14) { w = 14; }
  plats.push([last[0] + last[1] + rng(40, 160), w]);
}

function reset() {
  plats = [[0, 90]];
  addPlat();
  addPlat();
  hx = 78;
  hy = 188;
  stickLen = 0;
  angle = 0;
  score = 0;
  armed = false;
  state = "wait";
}
reset();
state = "start";

gameloop(function () {
  let down = pressed("space") || pressed("up") || holding();
  wait -= 1;
  perfectT -= 1;
  let edge = plats[0][0] + plats[0][1];
  let nxt = plats[1];

  if (state === "start" || state === "over") {
    if (wait <= 0 && (tapped() || justpressed("space"))) { reset(); }
  } else if (state === "wait") {
    // you have to let go once before you can start growing
    if (!down) { armed = true; }
    if (down && armed) { state = "grow"; }
  } else if (state === "grow") {
    stickLen += 4;
    if (stickLen > 380) { stickLen = 380; }
    if (!down) { state = "drop"; }
  } else if (state === "drop") {
    angle += 6;
    if (angle >= 90) {
      angle = 90;
      let tip = edge + stickLen;
      ok = tip >= nxt[0] && tip <= nxt[0] + nxt[1];
      tooShort = tip < nxt[0];
      if (ok && Math.abs(tip - (nxt[0] + nxt[1] / 2)) <= 4) { perfectT = 50; }
      state = "walk";
    }
  } else if (state === "walk") {
    hx += 4;
    let goal = edge + stickLen;
    if (ok) { goal = nxt[0] + nxt[1] - 12; }
    if (hx >= goal) {
      hx = goal;
      if (ok) {
        score += 1;
        if (perfectT > 0) { score += 1; }
        shift = nxt[0] + nxt[1] - 90;
        state = "slide";
      } else {
        state = "fall";
      }
    }
  } else if (state === "slide") {
    // move the world left so the new platform is where you stand
    let m = 8;
    if (shift < m) { m = shift; }
    for (const p of plats) {
      p[0] -= m;
    }
    hx -= m;
    shift -= m;
    if (shift <= 0) {
      plats = [plats[1], plats[2]];
      addPlat();
      stickLen = 0;
      angle = 0;
      armed = false;
      state = "wait";
    }
  } else if (state === "fall") {
    if (tooShort && angle < 180) { angle += 8; }
    hy += 7;
    if (hy > 330) {
      state = "over";
      wait = 30;
      if (score > best) { best = score; }
    }
  }

  wipe("#ffb469");
  box(0, 0, 400, 120, "#ff9a7a");
  bubble(320, 70, 34, "#ffe3a3");
  for (const p of plats) {
    box(p[0], 200, p[1], 100, "#1d1631");
  }
  box(nxt[0] + nxt[1] / 2 - 3, 200, 6, 4, "#ff4d6d");
  // the stick: angle 0 = straight up, 90 = flat
  let edge2 = plats[0][0] + plats[0][1];
  if (stickLen > 0) {
    line(edge2, 200, edge2 + sin(angle) * stickLen, 200 - cos(angle) * stickLen, "#1d1631", 3);
  }
  sprite("🥷", hx, hy, 24);
  sprite(score, 200, 40, 40, "white");
  write("best " + best, 8, 8, "#1d1631", 13);
  if (perfectT > 0 && state !== "fall") { sprite("PERFECT +1 ✨", 200, 78, 16, "#1d1631"); }

  if (state === "start") {
    box(0, 110, 400, 80, "rgba(29, 22, 49, 0.92)");
    center("STICK HERO 🥷", 120, "white", 28);
    center("hold to grow the stick · let go to drop it · tap to start", 158, "#ffd84d", 12);
  }
  if (state === "wait" && score === 0) { sprite("hold to grow the stick", 200, 240, 14, "#ffd84d"); }
  if (state === "over") {
    box(0, 252, 400, 48, "rgba(29, 22, 49, 0.92)");
    let why = "too long";
    if (tooShort) { why = "too short"; }
    center("💀 stick was " + why + " · score " + score + " · best " + best, 257, "white", 16);
    if (wait <= 0) { center("tap to play again", 280, "#a79cc2", 12); }
  }
});
