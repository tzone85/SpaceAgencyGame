/**
 * Game Class
 * 
 * Main game controller that manages the overall game state,
 * initializes the engine, and handles the game lifecycle.
 */

import Engine from './engine.js';

class Game {
  constructor() {
    this.engine = new Engine();
    this.isRunning = false;
  }

  /**
   * Start the game
   */
  start() {
    console.log('Starting Stellar Command...');
    this.isRunning = true;
    this.engine.initialize();
  }

  /**
   * Stop the game
   */
  stop() {
    console.log('Stopping Stellar Command...');
    this.isRunning = false;
  }

  /**
   * Get the current game state
   */
  getState() {
    return {
      isRunning: this.isRunning,
    };
  }
}

export default Game;
