// Every game in the pack. Each id is a folder in public/games/ with its own index.html.
// To add a game: drop its folder in public/games/ and add a line here.
export const CATEGORIES = [
  {
    "title": "2 players",
    "games": [
      {
        "id": "flappy-duo",
        "name": "Flappy Duo",
        "desc": "Both birds fly through the same pipes. The bird that passes more pipes wins."
      },
      {
        "id": "air-hockey",
        "name": "Air Hockey",
        "desc": "Knock the puck into the other player's goal (the colored slot on their wall)."
      },
      {
        "id": "pong-duel",
        "name": "Pong Duel",
        "desc": "Hit the ball past the other player's paddle to score."
      },
      {
        "id": "light-bikes",
        "name": "Light Bikes",
        "desc": "Your bike never stops and leaves a glowing trail. Make the other player crash."
      },
      {
        "id": "quick-draw",
        "name": "Quick Draw",
        "desc": "Wait for the screen to turn green and say GO!, then press first."
      },
      {
        "id": "tug-of-war",
        "name": "Tug of War",
        "desc": "Pull the 🚩 flag all the way to your side."
      },
      {
        "id": "connect-4",
        "name": "Connect 4",
        "desc": "Get 4 of your pieces in a row: across, down, or diagonal."
      },
      {
        "id": "tic-tac-toe-duo",
        "name": "Tic Tac Toe",
        "desc": "Pass and play. Get 3 in a row before the other player does."
      },
      {
        "id": "rps-duo",
        "name": "Rock Paper Scissors",
        "desc": "Pass and play. Pick in secret, then reveal. First to 5 wins."
      },
      {
        "id": "battleship-duo",
        "name": "Battleship",
        "desc": "Pass and play. Hide your fleet, then take turns firing. Sink all 4 ships to win."
      }
    ]
  },
  {
    "title": "vs bot",
    "games": [
      {
        "id": "rock-paper-scissors",
        "name": "Rock Paper Scissors",
        "desc": "Beat the bot to 10 wins. Rock beats scissors, scissors beats paper, paper beats rock."
      },
      {
        "id": "connect-4-bot",
        "name": "Connect 4",
        "desc": "Get 4 PINK pieces in a row before the BLUE bot does: across, down, or diagonal."
      },
      {
        "id": "snake-battle",
        "name": "Snake Battle",
        "desc": "Survive longer than the 🤖 bot snake. Eat 🍎 to grow."
      },
      {
        "id": "hockey-bot",
        "name": "Hockey",
        "desc": "Score 7 goals in the bot's goal (right side) before it scores 7 in yours."
      },
      {
        "id": "battleship",
        "name": "Battleship",
        "desc": "Sink all 4 enemy ships (12 squares) before the bot sinks yours."
      },
      {
        "id": "tic-tac-toe",
        "name": "Tic Tac Toe",
        "desc": "Get 3 ❌ in a row before the ⭕ bot does: across, down, or diagonal."
      },
      {
        "id": "pong",
        "name": "Pong",
        "desc": "Get the ball past the bot's paddle on the right."
      }
    ]
  },
  {
    "title": "brain",
    "games": [
      {
        "id": "memory",
        "name": "Memory",
        "desc": "Find all the matching emoji pairs, then level up."
      },
      {
        "id": "simon",
        "name": "Simon",
        "desc": "Repeat the color pattern for as long as you can."
      },
      {
        "id": "path-recall",
        "name": "Path Recall",
        "desc": "Watch the 🐸 hop from square to square, then tap the squares in the same order."
      },
      {
        "id": "pattern",
        "name": "Pattern",
        "desc": "Some squares light up blue. Remember them, then tap the exact same squares."
      },
      {
        "id": "number-order",
        "name": "Number Order",
        "desc": "Remember where each number is, then tap 1, 2, 3... in order."
      },
      {
        "id": "emoji-recall",
        "name": "Emoji Recall",
        "desc": "Watch the emojis flash one at a time, then tap them back in the same order."
      },
      {
        "id": "color-clash",
        "name": "Color Clash",
        "desc": "Decide if the word's COLOR matches what the word SAYS. RED in red = match. RED in blue = no match."
      },
      {
        "id": "math-rush",
        "name": "Math Rush",
        "desc": "Solve each sum before the orange bar runs out."
      },
      {
        "id": "unscramble",
        "name": "Unscramble",
        "desc": "The letters of a Gen Z word are mixed up. Put them back in order. CIRZZ → RIZZ."
      },
      {
        "id": "odd-one-out",
        "name": "Odd One Out",
        "desc": "All the emojis are the same except one. Find it and tap it before the timer runs out."
      }
    ]
  },
  {
    "title": "puzzle",
    "games": [
      {
        "id": "2048",
        "name": "2048",
        "desc": "Merge tiles to make a 2048 tile."
      },
      {
        "id": "block-blast",
        "name": "Block Blast",
        "desc": "Place pieces on the 8×8 board and score as much as you can."
      },
      {
        "id": "drop-merge",
        "name": "Drop Merge",
        "desc": "Drop number tiles and merge them into bigger and bigger numbers."
      },
      {
        "id": "match-3",
        "name": "Match 3",
        "desc": "Reach the target score (green bar) before your 20 moves run out."
      },
      {
        "id": "mines",
        "name": "Mines",
        "desc": "Open every square that doesn't have a bomb. There are 15 bombs."
      },
      {
        "id": "slide-puzzle",
        "name": "Slide Puzzle",
        "desc": "Slide the tiles back into order: 1, 2, 3... left to right, top to bottom, with the gap in the last corner."
      },
      {
        "id": "lights-out",
        "name": "Lights Out",
        "desc": "Turn every light OFF."
      }
    ]
  },
  {
    "title": "arcade",
    "games": [
      {
        "id": "flappy",
        "name": "Flappy",
        "desc": "Fly through the gaps between the pipes."
      },
      {
        "id": "flappy-dunk",
        "name": "Flappy Dunk",
        "desc": "Flap the 🏀 through every hoop. Missing a hoop ends the game."
      },
      {
        "id": "copter",
        "name": "Copter",
        "desc": "Fly through the cave as far as you can."
      },
      {
        "id": "gravity-flip",
        "name": "Gravity Flip",
        "desc": "Run as far as you can without hitting a spike."
      },
      {
        "id": "jetpack",
        "name": "Jetpack",
        "desc": "Fly as far as you can and grab 🪙 coins. Each coin is worth 10 points."
      },
      {
        "id": "color-switch",
        "name": "Color Switch",
        "desc": "Bounce up through as many spinning rings as you can."
      },
      {
        "id": "stick-hero",
        "name": "Stick Hero",
        "desc": "Get the 🥷 from platform to platform."
      },
      {
        "id": "zigzag",
        "name": "Zigzag",
        "desc": "Keep the ball on the twisting path as long as you can."
      },
      {
        "id": "swing",
        "name": "Swing",
        "desc": "Swing from rope to rope as far as you can without falling into the lava."
      },
      {
        "id": "wave",
        "name": "Wave",
        "desc": "Fly through the zigzag tunnel without touching the walls."
      },
      {
        "id": "tower-defense",
        "name": "Tower Defense",
        "desc": "Stop the bugs from walking all the way to the 🏁. You have 10 ❤️."
      },
      {
        "id": "mini-golf",
        "name": "Mini Golf",
        "desc": "Get the ball into the hole by the 🚩 in as few shots as you can. 5 holes."
      },
      {
        "id": "rhythm",
        "name": "Rhythm",
        "desc": "Hit each note exactly when it reaches the ring at the bottom of its lane."
      },
      {
        "id": "fishing",
        "name": "Fishing",
        "desc": "Catch as many points of fish as you can in 60 seconds."
      },
      {
        "id": "maze",
        "name": "Maze",
        "desc": "Get your 🐸 from the top left to the 🚪 exit at the bottom right."
      },
      {
        "id": "zombies",
        "name": "Zombies",
        "desc": "Survive the zombie waves as long as you can."
      },
      {
        "id": "sky-hop",
        "name": "Sky Hop",
        "desc": "Bounce up from platform to platform and climb as high as you can."
      },
      {
        "id": "slice",
        "name": "Slice",
        "desc": "Swipe through the flying fruit to slice it."
      },
      {
        "id": "asteroids",
        "name": "Asteroids",
        "desc": "Blast the space rocks without getting hit."
      },
      {
        "id": "snake",
        "name": "Snake",
        "desc": "Eat the purple boba to grow as long as you can."
      },
      {
        "id": "racer",
        "name": "Racer",
        "desc": "Drive as far as you can without crashing."
      },
      {
        "id": "stack",
        "name": "Stack",
        "desc": "Build the tallest tower you can."
      },
      {
        "id": "space",
        "name": "Space",
        "desc": "Shoot the 👾 aliens before they get past you."
      },
      {
        "id": "jump",
        "name": "Jump",
        "desc": "Run as far as you can and jump over 🌵 cacti and 🪨 rocks."
      },
      {
        "id": "catch",
        "name": "Catch",
        "desc": "Catch the falling snacks in your 🧺 basket."
      },
      {
        "id": "whack",
        "name": "Whack",
        "desc": "Tap the 🐹 hamster before it hides."
      },
      {
        "id": "bricks",
        "name": "Bricks",
        "desc": "Break all 32 bricks with the ball."
      },
      {
        "id": "dodge",
        "name": "Dodge",
        "desc": "Stay alive as long as you can."
      },
      {
        "id": "tap-tap",
        "name": "Tap Tap",
        "desc": "Tap the bubble as many times as you can in 20 seconds."
      },
      {
        "id": "bounce",
        "name": "Bounce",
        "desc": "Not a game yet. It's a bouncing ball animation to learn gameloop."
      }
    ]
  }
];

export const ALL_GAMES = CATEGORIES.flatMap(c => c.games);
