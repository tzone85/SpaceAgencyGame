/**
 * Game Controller
 * Manages the overall game state and lifecycle
 */

import { Engine } from './engine.js';
import { Renderer } from './renderer.js';

class Game {
  constructor() {
    this.engine = new Engine();
    this.renderer = new Renderer();
    this.isRunning = false;
  }

  /**
   * Start the game
   */
  async start() {
    console.log("Starting Stellar Command...");
    this.isRunning = true;
    await this.engine.initialize();
    await this.engine.start();
  }

  stop() {
    console.log('Game stopped');
    this.isRunning = false;
    this.engine.stop();
  }

  update(deltaTime) {
    if (this.isRunning) {
      this.engine.update(deltaTime);
    }
  }

  /**
   * Get the audio manager for controlling sound and music
   */
  getAudioManager() {
    return this.engine.audioManager;
  }

  /**
   * Destroy the game and cleanup resources
   */
  destroy() {
    if (this.isRunning) {
      this.renderer.render();
    }
  }
}

export default Game;
export { Game };