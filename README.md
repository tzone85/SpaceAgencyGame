# Stellar Command

A browser-based space agency management game where players control a space agency, plan missions, manage resources, and explore the cosmos.

## Game Concept

Stellar Command puts you in the role of a space agency director. Build and expand your agency, recruit scientists and astronauts, construct spacecraft, and launch missions to explore distant planets and moons. Balance budget constraints, public support, and scientific goals as you establish humanity's presence throughout the solar system.

### Key Features

- **Space Agency Management**: Build and manage your space agency from the ground up
- **Mission Planning**: Design and execute complex space missions with multiple objectives
- **Resource Management**: Manage budgets, personnel, and research programs
- **Technology Research**: Develop new technologies to improve spacecraft and mission capabilities
- **Exploration**: Discover new celestial bodies and conduct scientific research
- **Strategic Gameplay**: Make meaningful decisions that affect your agency's future

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

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start the development server with hot reloading at `http://localhost:8080`.

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
