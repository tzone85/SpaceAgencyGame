# Stellar Command

A responsive browser space-agency strategy game. Play solo against rival AI agencies, install it as a PWA, or host a same-WiFi LAN room from a PC so phones and laptops can join.

## Game Concept

Stellar Command puts you in the role of a space agency director. Build and expand your agency, recruit scientists and astronauts, construct spacecraft, and launch missions to explore distant planets and moons. Balance budget constraints, public support, and scientific goals as you establish humanity's presence throughout the solar system.

### Key Features

- **Playable agency loop**: launch missions, earn credits and science, unlock research, train and recruit crew.
- **Solo rival AI**: three computer agencies launch and complete missions while you race the league table.
- **Same-WiFi multiplayer**: run the LAN host on one PC and join from phones or laptops on the same network.
- **PWA-ready**: standalone display manifest, service worker app shell, responsive touch-friendly UI.
- **Modern browser game feel**: mobile-first controls, live signal feed, mission cards, crew cards, and league table.

## Project Structure

```
stellar-command/
├── src/
│   ├── main.js              # Application entry point
│   ├── core/                # Core game systems
│   │   ├── game.js          # Main game controller
│   │   └── engine.js        # Game engine/loop
│   ├── entities/            # Game entities (ships, missions, etc.)
│   ├── systems/             # Game systems (physics, pathfinding, etc.)
│   ├── scenes/              # Game scenes (menus, gameplay, etc.)
│   ├── ui/                  # User interface components
│   ├── utils/               # Utility functions and helpers
│   └── audio/               # Audio management
├── assets/
│   ├── textures/            # Sprite sheets and textures
│   ├── models/              # 3D models
│   ├── audio/               # Sound effects and music
│   ├── fonts/               # Custom fonts
│   └── data/                # Game data files (JSON, CSV, etc.)
├── tests/                   # Test suite
├── docs/                    # Documentation
├── config/                  # Configuration files
├── package.json             # NPM package metadata
├── webpack.config.js        # Webpack configuration
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts the development server at `http://localhost:3000`.

### Same-WiFi Play

```bash
npm run host
```

The host command builds the game, starts a static server with a WebSocket room endpoint, and prints a LAN URL such as `http://192.168.x.x:4174`. Open that URL on phones or other PCs connected to the same WiFi, then use the Network tab to create or join a room code.

### Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Testing

```bash
npm test
```

Run the test suite to verify all components are working correctly.

Focused revamp tests can be run without global coverage thresholds:

```bash
npm test -- tests/domain/stellar-command-session.test.js tests/net/multiplayerProtocol.test.js --runInBand --coverage=false
```

## Deployment

- **Best public game page**: itch.io. Upload a ZIP of `dist/` for a free HTML5 game page.
- **Best git-backed static deployment**: Vercel or Cloudflare Pages. Build command is `npm run build`; output directory is `dist`.
- **LAN multiplayer**: use `npm run host`; static hosts generally will not run the local WebSocket room server.

## Architecture

- **Game**: Main game controller managing game state and lifecycle
- **Engine**: Core game engine handling the main loop, updates, and rendering
- **Entities**: Game objects like spaceships, missions, and space stations
- **Systems**: Game systems handling physics, pathfinding, AI, etc.
- **Scenes**: Different game states (main menu, gameplay, mission planning, etc.)
- **UI**: User interface components and screens

## Contributing

Contributions are welcome! Please follow the project's coding standards and include tests for new features.

## License

MIT License - See LICENSE file for details

## Development Team

Built by the VXD Team
