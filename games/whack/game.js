/*
  Whack
  -----
  Goal: Tap the 🐹 hamster before it hides.
  Controls: Click or tap the hole it pops out of.
  Score: +1 per hamster. Tapping a 💣 costs 3 points.
  Time: 30 seconds. Hamsters get faster as your score goes up.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// WHACK: tap or click the hamster before it hides
// don't tap the bomb! 30 seconds
let holes = [];
for (let r = 0; r <= 2; r++) {
  for (let c = 0; c <= 2; c++) {
    holes.push([c * 110 + 90, r * 80 + 80]);
  }
}
let spot = 4;
let bomb = false;
let shown = 0;
let score = 0;
let boom = 0;

gameloop(function () {
  let left = 30 - Math.floor(clock());
  shown -= 1;
  boom -= 1;

  // pop up somewhere new, faster as you score
  if (shown <= 0) {
    spot = rng(0, 8);
    bomb = rng(1, 5) === 1;
    shown = 60 - score * 2;
    if (shown < 25) { shown = 25; }
  }

  if (tapped()) {
    let h = holes[spot];
    if (Math.abs(tapx() - h[0]) < 38 && Math.abs(tapy() - h[1]) < 38) {
      if (bomb) {
        score -= 3;
        boom = 20;
      } else {
        score += 1;
      }
      shown = 0;
    }
  }

  wipe("#2f6b24");
  for (const h of holes) {
    bubble(h[0], h[1] + 14, 30, "#1a0f06");
  }
  let who = "🐹";
  if (bomb) { who = "💣"; }
  sprite(who, holes[spot][0], holes[spot][1], 42);
  if (boom > 0) {
    center("💥 -3", 130, "#ffb469", 40);
  }
  write("score " + score, 8, 8, "white", 16);
  write(left + "s", 350, 8, "#ffb469", 16);

  if (left <= 0) {
    wipe("#2f6b24");
    center("time! 🔨", 110, "white", 30);
    center("you whacked " + score + " hamsters", 155, "#ffb469", 20);
    gg();
  }
});
