/**
 * Game Class
 *
 * Main game controller that manages the overall game state,
 * initializes the engine, and handles the game lifecycle.
 */

import Engine from "./engine.js";

class Game {
  constructor() {
    this.engine = new Engine();
    this.isRunning = false;
  }

  /**
   * Start the game
   */
  start() {
    console.log("Starting Stellar Command...");
    this.isRunning = true;
    this.engine.initialize();
    this.engine.start();
  }

  /**
   * Stop the game
   */
  stop() {
    console.log("Stopping Stellar Command...");
    this.isRunning = false;
    this.engine.stop();
  }

  /**
   * Get the current game state
   */
  getState() {
    return {
      isRunning: this.isRunning,
      engineStats: this.engine.getStats(),
    };
  }

  /**
   * Destroy the game and cleanup resources
   */
  destroy() {
    if (this.isRunning) {
      this.stop();
    }
    this.engine.destroy();
  }
}

export default Game;
