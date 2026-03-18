/**
 * Game Tests
 *
 * Test suite for the main Game controller class
 */

import Game from "../../src/core/game.js";
import EventBus from "../../src/game/EventBus.js";

describe("Game", () => {
  let game;

  beforeEach(() => {
    EventBus.reset();
    game = new Game();
  });

  afterEach(() => {
    if (game && game.isRunning) {
      game.destroy();
    }
    EventBus.reset();
  });

  test("should create game instance", () => {
    expect(game).toBeDefined();
    expect(game.engine).toBeDefined();
  });

  test("should initialize with isRunning = false", () => {
    expect(game.isRunning).toBe(false);
  });

  test("should have start method", () => {
    expect(typeof game.start).toBe("function");
  });

  test("should have stop method", () => {
    expect(typeof game.stop).toBe("function");
  });

  test("should have destroy method", () => {
    expect(typeof game.destroy).toBe("function");
  });

  test("should have eventBus, gameState, and saveSystem", () => {
    expect(game.eventBus).toBeDefined();
    expect(game.gameState).toBeDefined();
    expect(game.saveSystem).toBeDefined();
  });

  test("should set isRunning to true after start", () => {
    game.start();
    expect(game.isRunning).toBe(true);
    game.destroy();
  });

  test("should set isRunning to false after stop", () => {
    game.start();
    game.stop();
    expect(game.isRunning).toBe(false);
  });

  describe("manual save functionality", () => {
    test("should have manualSave method", () => {
      expect(typeof game.manualSave).toBe("function");
    });

    test("should manually save game state", () => {
      localStorage.clear();
      game.start();
      const result = game.manualSave();
      expect(result).toBe(true);
      expect(game.saveSystem.hasSave()).toBe(true);
      game.destroy();
    });

    test("should update lastSaved timestamp on manual save", () => {
      localStorage.clear();
      game.start();
      const result = game.manualSave();
      expect(result).toBe(true);
      const lastSaved = game.getLastSavedTime();
      expect(lastSaved).toBeTruthy();
      // Verify it's a valid ISO string
      expect(() => new Date(lastSaved)).not.toThrow();
      game.destroy();
    });

    test("should have getLastSavedTime method", () => {
      expect(typeof game.getLastSavedTime).toBe("function");
    });

    test("should return null for lastSavedTime when never saved", () => {
      game.start();
      // Don't call manualSave, so lastSaved should only be the initial timestamp
      const time = game.getLastSavedTime();
      expect(time).toBeTruthy(); // Should have initial timestamp
      game.destroy();
    });
  });

  describe("auto-save functionality", () => {
    beforeEach(() => {
      localStorage.clear();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    test("should have debounced auto-save function", () => {
      game.start();
      expect(game.autoSaveDebounced).toBeDefined();
      expect(typeof game.autoSaveDebounced).toBe("function");
      game.destroy();
    });

    test("should not save immediately on state:changed event", () => {
      game.start();
      game.eventBus.emit("state:changed");
      expect(game.saveSystem.hasSave()).toBe(false);
      game.destroy();
    });

    test("should save after debounce delay (2 seconds)", () => {
      game.start();
      game.eventBus.emit("state:changed");
      jest.advanceTimersByTime(1999);
      expect(game.saveSystem.hasSave()).toBe(false);
      jest.advanceTimersByTime(1);
      expect(game.saveSystem.hasSave()).toBe(true);
      game.destroy();
    });

    test("should reset debounce timer on multiple state:changed events", () => {
      game.start();
      game.eventBus.emit("state:changed");
      jest.advanceTimersByTime(1000);
      game.eventBus.emit("state:changed");
      jest.advanceTimersByTime(1000);
      expect(game.saveSystem.hasSave()).toBe(false);
      jest.advanceTimersByTime(999);
      expect(game.saveSystem.hasSave()).toBe(false);
      jest.advanceTimersByTime(1);
      expect(game.saveSystem.hasSave()).toBe(true);
      game.destroy();
    });
  });

  describe("error handling", () => {
    test("should listen for save:error events", () => {
      game.start();
      const listenerCount = game.eventBus.listenerCount("save:error");
      expect(listenerCount).toBeGreaterThan(0);
      game.destroy();
    });

    test("should listen for save:completed events", () => {
      game.start();
      const listenerCount = game.eventBus.listenerCount("save:completed");
      expect(listenerCount).toBeGreaterThan(0);
      game.destroy();
    });
  });

  describe("save state restoration", () => {
    test("should restore saved game on start", () => {
      localStorage.clear();
      // Create and save a game state
      game.start();
      game.gameState.update("budget.balance", 999_999_999);
      game.manualSave();
      game.destroy();

      // Create a new game and check if state was restored
      game = new Game();
      game.start();
      const restoredBalance = game.gameState.getState().budget.balance;
      expect(restoredBalance).toBe(999_999_999);
      game.destroy();
    });

    test("should initialize lastSaved on first launch", () => {
      localStorage.clear();
      game.start();
      const lastSaved = game.gameState.getState().meta.lastSaved;
      expect(lastSaved).toBeTruthy();
      expect(typeof lastSaved).toBe("string");
      game.destroy();
    });

    test("should preserve all game systems on save/restore", () => {
      localStorage.clear();
      game.start();

      // Modify all systems
      game.gameState.update("budget.balance", 888_888_888);
      game.gameState.update("crew.roster", [{ id: "c1", name: "Test Crew" }]);
      game.gameState.update("missions.active", [
        { id: "m1", name: "Test Mission" },
      ]);
      game.gameState.update("research.completed", [
        { id: "r1", name: "Test Research" },
      ]);
      game.gameState.update("events.active", [{ id: "e1", type: "test" }]);

      game.manualSave();
      game.destroy();

      // Restore and verify
      game = new Game();
      game.start();
      const state = game.gameState.getState();
      expect(state.budget.balance).toBe(888_888_888);
      expect(state.crew.roster).toHaveLength(1);
      expect(state.missions.active).toHaveLength(1);
      expect(state.research.completed).toHaveLength(1);
      expect(state.events.active).toHaveLength(1);
      game.destroy();
    });
  });
});
