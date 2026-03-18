/**
 * Game Controller
 *
 * Orchestrates the game lifecycle: initializes the engine, wires up
 * GameState, EventBus, and SaveSystem, and manages start/stop/destroy.
 * Systems and scenes will be added in later waves.
 */

import Engine from "./engine.js";
import EventBus from "../game/EventBus.js";
import { GameState } from "../game/GameState.js";
import { SaveSystem } from "../game/SaveSystem.js";

class Game {
  constructor() {
    this.engine = new Engine();
    this.eventBus = new EventBus();
    this.gameState = new GameState();
    this.saveSystem = new SaveSystem(this.eventBus);
    this.isRunning = false;
  }

  /**
   * Start the game - initialize engine, restore save, wire auto-save
   */
  start() {
    console.log("Starting Stellar Horizon...");

    // Restore saved game if one exists
    const savedData = this.saveSystem.load();
    if (savedData) {
      this.gameState = new GameState(savedData);
      console.log("Restored saved game");
    }

    // Wire auto-save on state:changed events
    this.eventBus.subscribe("state:changed", () => {
      this.saveSystem.save(this.gameState.getState());
    });

    // Initialize and start the engine
    this.engine.initialize();
    this.isRunning = true;
    this.engine.start();
  }

  /**
   * Stop the game
   */
  stop() {
    console.log("Game stopped");
    this.isRunning = false;
    this.engine.stop();
  }

  /**
   * Destroy the game and cleanup all resources
   */
  destroy() {
    this.stop();
    this.eventBus.clearListeners();
    this.engine.destroy();
  }
}

export default Game;
export { Game };
