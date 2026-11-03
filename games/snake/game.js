/*
  Snake
  -----
  Goal: Eat the purple boba to grow as long as you can.
  Keys: Arrow keys, or the buttons under the screen.
  Score: +1 per boba. The snake speeds up as it grows.
  Lose: Hit a wall or bite your own body.
  Rule: You can't turn straight back the way you came.

  This file is plain JavaScript. It runs on engine.js, which provides the screen,
  drawing (wipe, box, bubble, line, write, center, sprite), input (pressed,
  justpressed, tapped, holding, tapx, tapy, taps, fingers), helpers (rng, sin, cos,
  bonk, eq) and the game loop: gameloop(function () { ... }) runs ~60 times a second.
*/

// SNAKE: turn with the arrow keys or buttons
// eat the purple boba, don't hit the walls or yourself
let snake = [[6, 7], [5, 7], [4, 7]];
let dx = 1;
let dy = 0;
let nx = 1;
let ny = 0;
let food = [14, 7];
let frames = 0;
let score = 0;
let dead = false;

gameloop(function () {
  // pick the next direction (no instant U-turns)
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

  // the snake gets faster as it grows
  frames += 1;
  let speed = 8 - Math.floor(score / 3);
  if (speed < 3) { speed = 3; }

  if (frames % speed === 0) {
    dx = nx;
    dy = ny;
    let head = [snake[0][0] + dx, snake[0][1] + dy];
    if (head[0] < 0 || head[0] > 19 || head[1] < 0 || head[1] > 14) { dead = true; }
    for (const part of snake) {
      if (eq(part, head)) { dead = true; }
    }
    if (!dead) {
      snake = [head].concat(snake);
      if (eq(head, food)) {
        score += 1;
        food = [rng(0, 19), rng(0, 14)];
      } else {
        snake.pop();
      }
    }
  }

  wipe("#0f1a12");
  bubble(food[0] * 20 + 10, food[1] * 20 + 10, 7, "#c9a4ff");
  for (const part of snake) {
    box(part[0] * 20 + 1, part[1] * 20 + 1, 18, 18, "#5fd69b");
  }
  box(snake[0][0] * 20 + 1, snake[0][1] * 20 + 1, 18, 18, "#b6ffd4");
  write("score " + score, 8, 6, "white", 14);

  if (dead) {
    center("GG 💀 snake got cooked", 120, "white", 26);
    center("score: " + score + " · press Restart to retry", 160, "#5fd69b", 16);
    gg();
  }
});
