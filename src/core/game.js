/**
 * Game Controller
 *
 * Orchestrates the game lifecycle: initializes the engine, wires up
 * GameState, EventBus, and SaveSystem, and manages start/stop/destroy.
 * Implements auto-save with debouncing and manual save functionality.
 */

import Engine from "./engine.js";
import EventBus from "../game/EventBus.js";
import { GameState } from "../game/GameState.js";
import { SaveSystem } from "../game/SaveSystem.js";
import { debounce } from "../utils/index.js";
import { createToast, showToast } from "../ui/components.js";

class Game {
  constructor() {
    this.engine = new Engine();
    this.eventBus = new EventBus();
    this.gameState = new GameState();
    this.saveSystem = new SaveSystem(this.eventBus);
    this.isRunning = false;
    this.autoSaveDebounced = null;
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
    } else {
      // Initialize lastSaved on first launch
      this.gameState.update("meta.lastSaved", new Date().toISOString());
    }

    // Create debounced auto-save function (2 second delay)
    this.autoSaveDebounced = debounce(() => {
      const currentState = this.gameState.getState();
      const stateWithTimestamp = structuredClone(currentState);
      stateWithTimestamp.meta.lastSaved = new Date().toISOString();
      this.saveSystem.save(stateWithTimestamp);
    }, 2000);

    // Wire auto-save on state:changed events
    this.eventBus.subscribe("state:changed", () => {
      this.autoSaveDebounced();
    });

    // Handle save errors with toast notification
    this.eventBus.subscribe("save:error", (errorData) => {
      let message = "Failed to save game";
      if (errorData?.reason === "storage-full") {
        message = "Storage quota exceeded. Please clear some space.";
      }
      const toast = createToast({
        message,
        type: "error",
        duration: 5000,
      });
      showToast(toast, 5000);
    });

    // Listen for successful saves to update lastSaved time
    this.eventBus.subscribe("save:completed", () => {
      console.log("Game auto-saved successfully");
    });

    // Initialize and start the engine
    this.engine.initialize();
    this.isRunning = true;
    this.engine.start();
  }

  /**
   * Manually save the game state
   * Updates lastSaved timestamp and persists to storage
   * @returns {boolean} True if save succeeded, false otherwise
   */
  manualSave() {
    const currentState = this.gameState.getState();
    const stateWithTimestamp = structuredClone(currentState);
    stateWithTimestamp.meta.lastSaved = new Date().toISOString();
    return this.saveSystem.save(stateWithTimestamp);
  }

  /**
   * Get the last saved timestamp
   * @returns {string|null} ISO string of last save time, or null if never saved
   */
  getLastSavedTime() {
    return this.gameState.getState().meta.lastSaved;
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
