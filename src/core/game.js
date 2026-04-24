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
import BudgetSystem from "../systems/BudgetSystem.js";
import CrewSystem from "../systems/CrewSystem.js";
import MissionSystem from "../systems/MissionSystem.js";
import { ResearchSystem } from "../systems/ResearchSystem.js";
import { EventSystem } from "../systems/EventSystem.js";
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

    // Game systems
    this.budgetSystem = null;
    this.crewSystem = null;
    this.missionSystem = null;
    this.researchSystem = null;
    this.eventSystem = null;
  }

  /**
   * Initialize all game systems
   * @private
   */
  _initializeSystems() {
    // Initialize BudgetSystem
    this.budgetSystem = new BudgetSystem(this.eventBus, this.gameState);
    console.log("BudgetSystem initialized");

    // Initialize CrewSystem
    this.crewSystem = new CrewSystem(this.gameState);
    console.log("CrewSystem initialized");

    // Initialize MissionSystem
    this.missionSystem = new MissionSystem(this.eventBus, this.gameState);
    console.log("MissionSystem initialized");

    // Initialize ResearchSystem
    this.researchSystem = new ResearchSystem(
      this.eventBus,
      this.gameState
    );
    console.log("ResearchSystem initialized");

    // Initialize EventSystem
    this.eventSystem = new EventSystem(this.gameState);
    console.log("EventSystem initialized");
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

    // Initialize all game systems
    this._initializeSystems();

    // Initialize and start the engine with EventBus for game:tick events
    this.engine.setEventBus(this.eventBus);
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

    // Destroy all game systems
    if (this.budgetSystem) {
      this.budgetSystem.destroy?.();
    }
    if (this.crewSystem) {
      this.crewSystem.destroy?.();
    }
    if (this.missionSystem) {
      this.missionSystem.destroy?.();
    }
    if (this.researchSystem) {
      this.researchSystem.destroy?.();
    }
    if (this.eventSystem) {
      this.eventSystem.teardown?.();
    }

    this.eventBus.clearListeners();
    this.engine.destroy();
  }
}

export default Game;
export { Game };
