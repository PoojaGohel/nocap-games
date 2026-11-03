/*
  Quick Draw · 2 players
  ----------------------
  Goal: Wait for the screen to turn green and say GO!, then press first.
  Pink: A key, or tap the left half.
  Blue: L key, or tap the right half.
  Careful: Press before GO! and the other player gets the point.
  Score: One point per round. Your reaction time shows in milliseconds.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// QUICK DRAW · 2 players · wait for GO, then be first!
// PINK: A key or tap the left side · BLUE: L key or tap the right side
// go too early and the other player gets the point
let state = "wait";
let timer = rng(90, 240);
let goAt = 0;
let cool = 0;
let msg = "";
let ls = 0;
let rs = 0;

gameloop(function () {
  let l = justpressed("a");
  let r = justpressed("l");
  for (const t of taps()) {
    if (t[0] < 200) { l = true; } else { r = true; }
  }

  if (state === "wait") {
    timer -= 1;
    if (l && r) {
      msg = "both jumped the gun 💀";
      state = "done";
    } else if (l) {
      msg = "PINK jumped the gun · point to BLUE";
      rs += 1;
      state = "done";
    } else if (r) {
      msg = "BLUE jumped the gun · point to PINK";
      ls += 1;
      state = "done";
    } else if (timer <= 0) {
      state = "go";
      goAt = clock();
    }
    cool = 60;
  } else if (state === "go") {
    let ms = Math.floor((clock() - goAt) * 1000);
    if (l && r) {
      msg = "exact tie at " + ms + " ms 🤯";
      state = "done";
    } else if (l) {
      msg = "PINK wins in " + ms + " ms ⚡";
      ls += 1;
      state = "done";
    } else if (r) {
      msg = "BLUE wins in " + ms + " ms ⚡";
      rs += 1;
      state = "done";
    }
    cool = 60;
  } else {
    cool -= 1;
    if (cool <= 0 && (l || r)) {
      state = "wait";
      timer = rng(90, 240);
    }
  }

  if (state === "go") {
    wipe("#5fd69b");
    center("GO!", 100, "#130d20", 72);
  } else {
    box(0, 0, 200, 300, "#3a1430");
    box(200, 0, 200, 300, "#14304a");
    if (state === "wait") {
      center("wait for it... 🤠", 125, "white", 26);
    }
    if (state === "done") {
      center(msg, 115, "white", 20);
      if (cool <= 0) {
        center("tap or press A / L for the next round", 155, "#a79cc2", 14);
      }
    }
  }
  sprite("PINK " + ls, 100, 270, 22, "#ff5aa8");
  sprite("BLUE " + rs, 300, 270, 22, "#7fd3ff");
});
