# Match 3

A small browser game written in plain JavaScript (no libraries, no build step).

## Run it

1. Unzip the folder.
2. Double-click `index.html` (or drag it into Chrome, Edge, Firefox or Safari).

That's it, no install or server needed. If you prefer a local server:

```
npx serve .
```

## How to play

- **Goal:** Reach the target score (green bar) before your 20 moves run out.
- **Swap:** Tap a fruit, then tap the fruit next to it to swap them. Or press and swipe toward a neighbor.
- **Match:** A swap only works if it makes a line of 3 or more of the same fruit. Otherwise they swap back for free.
- **Combos:** Fruit falls after a match. New matches from falling fruit are combos and score double, triple and more.
- **Levels:** Each level has a higher target. If there are no possible moves, the board reshuffles.

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
