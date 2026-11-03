/*
  Rhythm
  ------
  Goal: Hit each note exactly when it reaches the ring at the bottom of its lane.
  Keys: D F J K for the 4 lanes (or ← ↓ ↑ →).
  Phone: Tap anywhere in the lane.
  Score: PERFECT, GREAT or OK depending on timing. Combos add bonus points.
  Hype: Hits fill the hype meter and misses drain it. If it empties, the song fails.
  Clear: Survive the 60 second song to get a grade: S, A, B or C.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// RHYTHM: hit each note right when it reaches the ring!
// keys: D F J K (or ← ↓ ↑ →) · phone: tap the lane · 60 second song
let lanes = [80, 160, 240, 320];
let keysA = ["d", "f", "j", "k"];
let keysB = ["left", "down", "up", "right"];
let colors = ["#ff5aa8", "#7fd3ff", "#5fd69b", "#ffd84d"];
let notes = [];
let frames = 0;
let nextBeat = 60;
let score = 0;
let combo = 0;
let bestCombo = 0;
let hype = 60;
let hits = 0;
let spawned = 0;
let glow = [0, 0, 0, 0];
let judge = "";
let judgeColor = "white";
let judgeT = 0;
let state = "start";
let wait = 0;
let SONG = 3600;

function reset() {
  notes = [];
  frames = 0;
  nextBeat = 60;
  score = 0;
  combo = 0;
  bestCombo = 0;
  hype = 60;
  hits = 0;
  spawned = 0;
  state = "play";
}

// you pressed lane L: find the closest note to the ring
function press(L) {
  glow[L] = 8;
  let target = null;
  let bestD = 36;
  for (const n of notes) {
    let d = Math.abs(n[1] - 250);
    if (eq(n[0], L) && n[2] && d < bestD) {
      bestD = d;
      target = n;
    }
  }
  if (target === null) { return; }
  target[2] = false;
  hits += 1;
  combo += 1;
  if (combo > bestCombo) { bestCombo = combo; }
  hype += 4;
  if (hype > 100) { hype = 100; }
  if (bestD < 10) {
    score += 300 + combo * 10;
    judge = "PERFECT";
    judgeColor = "#ffd84d";
  } else if (bestD < 22) {
    score += 200 + combo * 10;
    judge = "GREAT";
    judgeColor = "#5fd69b";
  } else {
    score += 100 + combo * 5;
    judge = "OK";
    judgeColor = "#7fd3ff";
  }
  judgeT = 30;
}

gameloop(function () {
  let ts = taps();
  wait -= 1;
  judgeT -= 1;
  for (let i = 0; i <= 3; i++) {
    glow[i] -= 1;
  }

  if (state !== "play") {
    if (wait <= 0 && (ts.length > 0 || justpressed("space"))) { reset(); }
  } else {
    frames += 1;
    // the beat speeds up through the song
    if (frames < SONG && frames >= nextBeat) {
      let gap = 32 - Math.floor(frames / 600) * 3;
      if (gap < 15) { gap = 15; }
      nextBeat = frames + gap;
      let a = rng(0, 3);
      notes.push([a, -20, true]);
      spawned += 1;
      // sometimes two notes at once
      if (rng(1, 6) === 1) {
        notes.push([(a + rng(1, 3)) % 4, -20, true]);
        spawned += 1;
      }
    }
    let speed = 3 + frames / 1500;

    for (let L = 0; L <= 3; L++) {
      if (justpressed(keysA[L]) || justpressed(keysB[L])) { press(L); }
    }
    for (const t of ts) {
      for (let L = 0; L <= 3; L++) {
        if (Math.abs(t[0] - lanes[L]) < 40) { press(L); }
      }
    }

    let keep = [];
    for (const n of notes) {
      n[1] += speed;
      if (n[2] && n[1] > 285) {
        n[2] = false;
        combo = 0;
        hype -= 12;
        judge = "MISS";
        judgeColor = "#ff4d6d";
        judgeT = 30;
      }
      if (n[2]) { keep.push(n); }
    }
    notes = keep;
    if (hype <= 0) {
      state = "fail";
      wait = 45;
    }
    if (frames >= SONG && notes.length === 0) {
      state = "clear";
      wait = 45;
    }
  }

  wipe("#120b20");
  for (let L = 0; L <= 3; L++) {
    let c = "#1d1631";
    if (glow[L] > 0) { c = "#33285a"; }
    box(lanes[L] - 36, 0, 72, 300, c);
  }
  box(40, 248, 320, 4, "rgba(255, 255, 255, 0.35)");
  for (let L = 0; L <= 3; L++) {
    bubble(lanes[L], 250, 20, colors[L]);
    bubble(lanes[L], 250, 16, "#120b20");
    sprite(keysA[L].toUpperCase(), lanes[L], 285, 12, "#8f84ab");
  }
  for (const n of notes) {
    bubble(lanes[n[0]], n[1], 17, colors[n[0]]);
    bubble(lanes[n[0]], n[1], 7, "white");
  }
  if (judgeT > 0) { sprite(judge, 200, 160, 26, judgeColor); }
  if (combo >= 5) { sprite(combo + " combo 🔥", 200, 192, 14, "#ffb469"); }

  write("score " + score, 8, 10, "white", 14);
  write("hype", 212, 7, "#a79cc2", 11);
  box(250, 10, 140, 8, "#372d55");
  let hc = "#5fd69b";
  if (hype < 35) { hc = "#ff4d6d"; }
  box(250, 10, 1.4 * hype, 8, hc);
  let done = frames;
  if (done > SONG) { done = SONG; }
  box(0, 0, 400 * done / SONG, 3, "#c9a4ff");

  if (state === "start") {
    box(0, 90, 400, 110, "#130d20");
    center("RHYTHM 🎶", 102, "white", 30);
    center("press D F J K (or tap a lane) when a note hits its ring", 144, "#ffb469", 13);
    center("tap to start", 170, "#a79cc2", 13);
  }
  if (state === "fail" || state === "clear") {
    let acc = 0;
    if (spawned > 0) { acc = Math.floor(hits * 100 / spawned); }
    let grade = "C";
    if (acc >= 70) { grade = "B"; }
    if (acc >= 85) { grade = "A"; }
    if (acc >= 95) { grade = "S"; }
    let msg = "song cleared! grade " + grade + " 🎉";
    if (state === "fail") { msg = "the crowd lost the hype 💀"; }
    box(0, 90, 400, 110, "#130d20");
    center(msg, 104, "white", 24);
    center("score " + score + " · " + acc + "% hit · best combo " + bestCombo, 140, "#ffb469", 14);
    if (wait <= 0) { center("tap to play again", 168, "#a79cc2", 13); }
  }
});
