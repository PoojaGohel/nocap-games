# Zombies

A small browser game written in plain JavaScript (no libraries, no build step).

## Run it

1. Unzip the folder.
2. Double-click `index.html` (or drag it into Chrome, Edge, Firefox or Safari).

That's it, no install or server needed. If you prefer a local server:

```
npx serve .
```

## How to play

- **Goal:** Survive the zombie waves as long as you can.
- **Move:** `W` `A` `S` `D` or arrow keys. On a phone, hold and drag where to walk.
- **Shoot:** Automatic! You always fire at the closest zombie.
- **Power-ups:** ⚡ = rapid fire for 5 seconds · 💊 = +1 ❤️ (up to 5). Zombies sometimes drop them.
- **Waves:** A new wave every 15 seconds: more and faster zombies. Big zombies take 3 hits.
- **Lose:** Each bite costs a ❤️. You blink and are safe for a moment after a bite.

Press **↺ Restart** under the game screen to start over.

## Files

| File | What it does |
|---|---|
| `index.html` | The page: game screen, phone buttons and the rules |
| `style.css` | The look of the page |
| `engine.js` | Shared mini game engine (screen, drawing, input, game loop). The same file is used by every game in the pack |
| `game.js` | This game's code. Edit this to change the game |

## Engine cheat sheet

| Function | What it does |
|---|---|
| `gameloop(function () { ... })` | Runs your code about 60 times a second |
| `wipe(color)` | Clears the screen with a color |
| `box(x, y, w, h, color)` | Rectangle (x, y is the top-left corner) |
| `bubble(x, y, r, color)` | Circle (x, y is the center) |
| `line(x1, y1, x2, y2, color, width)` | Line between two points |
| `write(text, x, y, color, size)` / `center(text, y, color, size)` | Text |
| `sprite("🐸", x, y, size, color)` | Emoji or short text centered at x, y |
| `pressed("left")` / `justpressed("a")` | Key held / key pressed this frame |
| `tapped()`, `holding()`, `tapx()`, `tapy()` | Mouse / touch |
| `taps()`, `fingers()` | Every tap / finger, for 2 players on one screen |
| `rng(a, b)`, `sin(deg)`, `cos(deg)`, `bonk(...)`, `clock()` | Helpers |
| `gg()` | Stops the game loop (game over) |

The screen is 400 × 300 units. (0, 0) is the top-left corner.
