/**
 * Stellar Command - Main Entry Point
 * 
 * This is the main entry point for the Stellar Command space agency game.
 * It initializes the game engine and starts the game loop.
 */

import Game from './core/game.js';

// Initialize the game
const game = new Game();

// Start the game
game.start();

export default game;
