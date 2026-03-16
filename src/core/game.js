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

  start() {
    console.log('Game started');
    this.isRunning = true;
    this.engine.start();
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

  render() {
    if (this.isRunning) {
      this.renderer.render();
    }
  }
}

export default Game;
export { Game };
