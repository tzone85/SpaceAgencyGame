/**
 * Stellar Command - Space Agency Management Game
 *
 * This is the main entry point for the Stellar Command space agency game.
 * It initializes the game engine and starts the game loop.
 */

import Game from "./core/game.js";

// Initialize the game
const game = new Game();

// Start the game
game.start().catch((error) => {
  console.error("Failed to start game:", error);
});

export default game;