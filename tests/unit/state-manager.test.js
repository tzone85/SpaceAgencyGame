/**
 * StateManager Unit Tests
 * Tests state transitions, simultaneous states, memory cleanup, and state management
 */

import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import StateManager from "../../src/core/state-manager.js";

describe("StateManager", () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  afterEach(() => {
    stateManager.destroy();
  });

  describe("State Registration", () => {
    test("should register a new state", () => {
      const menuState = {
        enter: jest.fn(),
        exit: jest.fn(),
      };

      stateManager.registerState("menu", menuState);
      expect(stateManager.getState("menu")).toBe(menuState);
    });

    test("should warn when registering duplicate state", () => {
      const consoleWarn = jest.spyOn(console, "warn");
      const state = { enter: () => {}, exit: () => {} };

      stateManager.registerState("menu", state);
      stateManager.registerState("menu", state);

      expect(consoleWarn).toHaveBeenCalledWith(
        'State "menu" already registered. Overwriting...'
      );
      consoleWarn.mockRestore();
    });

    test("should warn if state missing enter method", () => {
      const consoleWarn = jest.spyOn(console, "warn");
      const state = { exit: () => {} };

      stateManager.registerState("menu", state);

      expect(consoleWarn).toHaveBeenCalledWith(
        'State "menu" missing enter() method'
      );
      consoleWarn.mockRestore();
    });

    test("should warn if state missing exit method", () => {
      const consoleWarn = jest.spyOn(console, "warn");
      const state = { enter: () => {} };

      stateManager.registerState("menu", state);

      expect(consoleWarn).toHaveBeenCalledWith(
        'State "menu" missing exit() method'
      );
      consoleWarn.mockRestore();
    });
  });

  describe("State Transitions", () => {
    test("should transition to a new state", () => {
      const menuState = {
        enter: jest.fn(),
        exit: jest.fn(),
      };

      stateManager.registerState("menu", menuState);
      stateManager.transition("menu");

      expect(menuState.enter).toHaveBeenCalled();
      expect(stateManager.isActive("menu")).toBe(true);
    });

    test("should exit previous state when transitioning", () => {
      const menuState = { enter: jest.fn(), exit: jest.fn() };
      const gameState = { enter: jest.fn(), exit: jest.fn() };

      stateManager.registerState("menu", menuState);
      stateManager.registerState("game", gameState);

      stateManager.transition("menu");
      expect(menuState.enter).toHaveBeenCalled();

      stateManager.transition("game");
      expect(menuState.exit).toHaveBeenCalled();
      expect(gameState.enter).toHaveBeenCalled();
    });

    test("should transition to multiple states at once", () => {
      const gameState = { enter: jest.fn(), exit: jest.fn() };
      const uiState = { enter: jest.fn(), exit: jest.fn() };

      stateManager.registerState("game", gameState);
      stateManager.registerState("ui", uiState);

      stateManager.transition(["game", "ui"]);

      expect(gameState.enter).toHaveBeenCalled();
      expect(uiState.enter).toHaveBeenCalled();
      expect(stateManager.isActive("game")).toBe(true);
      expect(stateManager.isActive("ui")).toBe(true);
    });

    test("should handle invalid state transition gracefully", () => {
      const consoleError = jest.spyOn(console, "error");

      stateManager.transition("nonexistent");

      expect(consoleError).toHaveBeenCalledWith(
        'State "nonexistent" not registered'
      );
      consoleError.mockRestore();
    });
  });

  describe("Multiple Simultaneous States", () => {
    test("should push a new state without exiting previous", () => {
      const gameState = { enter: jest.fn(), exit: jest.fn() };
      const pauseState = { enter: jest.fn(), exit: jest.fn() };

      stateManager.registerState("game", gameState);
      stateManager.registerState("pause", pauseState);

      stateManager.transition("game");
      expect(gameState.enter).toHaveBeenCalled();

      stateManager.push("pause");
      expect(gameState.exit).not.toHaveBeenCalled();
      expect(pauseState.enter).toHaveBeenCalled();
      expect(stateManager.isActive("game")).toBe(true);
      expect(stateManager.isActive("pause")).toBe(true);
    });

    test("should pop a state without exiting others", () => {
      const gameState = { enter: jest.fn(), exit: jest.fn() };
      const pauseState = { enter: jest.fn(), exit: jest.fn() };

      stateManager.registerState("game", gameState);
      stateManager.registerState("pause", pauseState);

      stateManager.push("game");
      stateManager.push("pause");

      stateManager.pop("pause");

      expect(pauseState.exit).toHaveBeenCalled();
      expect(gameState.exit).not.toHaveBeenCalled();
      expect(stateManager.isActive("game")).toBe(true);
      expect(stateManager.isActive("pause")).toBe(false);
    });

    test("should get all active states", () => {
      const gameState = { enter: jest.fn(), exit: jest.fn() };
      const pauseState = { enter: jest.fn(), exit: jest.fn() };

      stateManager.registerState("game", gameState);
      stateManager.registerState("pause", pauseState);

      stateManager.push("game");
      stateManager.push("pause");

      const active = stateManager.getActiveStates();
      expect(active).toContain("game");
      expect(active).toContain("pause");
      expect(active.length).toBe(2);
    });

    test("should warn when pushing already active state", () => {
      const consoleWarn = jest.spyOn(console, "warn");
      const gameState = { enter: jest.fn(), exit: jest.fn() };

      stateManager.registerState("game", gameState);
      stateManager.push("game");
      stateManager.push("game");

      expect(consoleWarn).toHaveBeenCalledWith(
        'State "game" is already active'
      );
      consoleWarn.mockRestore();
    });
  });

  describe("Memory Cleanup", () => {
    test("should call cleanup method when exiting state", () => {
      const state = {
        enter: jest.fn(),
        exit: jest.fn(),
        cleanup: jest.fn(),
      };

      stateManager.registerState("menu", state);
      stateManager.transition("menu");
      stateManager.pop("menu");

      expect(state.cleanup).toHaveBeenCalled();
    });

    test("should remove event listeners on cleanup", () => {
      const handler = jest.fn();
      const element = document.createElement("div");
      const removeEventListenerSpy = jest.spyOn(element, "removeEventListener");

      const state = {
        enter: jest.fn(),
        exit: jest.fn(),
        eventListeners: [
          { target: element, event: "click", handler },
        ],
      };

      stateManager.registerState("menu", state);
      stateManager.transition("menu");
      stateManager.pop("menu");

      expect(removeEventListenerSpy).toHaveBeenCalledWith("click", handler);
      removeEventListenerSpy.mockRestore();
    });

    test("should clear timers on cleanup", () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
      const clearIntervalSpy = jest.spyOn(global, "clearInterval");

      const timeoutId = setTimeout(() => {}, 1000);
      const intervalId = setInterval(() => {}, 1000);

      const state = {
        enter: jest.fn(),
        exit: jest.fn(),
        timers: [timeoutId, intervalId],
      };

      stateManager.registerState("menu", state);
      stateManager.transition("menu");
      stateManager.pop("menu");

      expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
      expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);

      clearTimeoutSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });

    test("should cleanup all states when destroyed", () => {
      const state1 = { enter: jest.fn(), exit: jest.fn(), cleanup: jest.fn() };
      const state2 = { enter: jest.fn(), exit: jest.fn(), cleanup: jest.fn() };

      stateManager.registerState("state1", state1);
      stateManager.registerState("state2", state2);

      stateManager.push("state1");
      stateManager.push("state2");

      stateManager.destroy();

      expect(state1.cleanup).toHaveBeenCalled();
      expect(state2.cleanup).toHaveBeenCalled();
    });
  });

  describe("State Callbacks", () => {
    test("should call registered transition callback", () => {
      const callback = jest.fn();
      const state = { enter: jest.fn(), exit: jest.fn() };

      stateManager.registerState("menu", state);
      stateManager.onStateTransition("menu", callback);
      stateManager.transition("menu");

      expect(callback).toHaveBeenCalled();
    });

    test("should handle multiple callbacks for same state", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const state = { enter: jest.fn(), exit: jest.fn() };

      stateManager.registerState("menu", state);
      stateManager.onStateTransition("menu", callback1);
      stateManager.onStateTransition("menu", callback2);
      stateManager.transition("menu");

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    test("should handle callback errors gracefully", () => {
      const consoleError = jest.spyOn(console, "error");
      const errorCallback = jest.fn(() => {
        throw new Error("Callback error");
      });
      const state = { enter: jest.fn(), exit: jest.fn() };

      stateManager.registerState("menu", state);
      stateManager.onStateTransition("menu", errorCallback);

      expect(() => stateManager.transition("menu")).not.toThrow();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe("State History", () => {
    test("should track state history", () => {
      const state1 = { enter: jest.fn(), exit: jest.fn() };
      const state2 = { enter: jest.fn(), exit: jest.fn() };

      stateManager.registerState("state1", state1);
      stateManager.registerState("state2", state2);

      stateManager.transition("state1");
      stateManager.transition("state2");

      const history = stateManager.getStateHistory();
      expect(history).toContain("state1");
      expect(history).toContain("state2");
    });

    test("should get previous state from history", () => {
      const state1 = { enter: jest.fn(), exit: jest.fn() };
      const state2 = { enter: jest.fn(), exit: jest.fn() };

      stateManager.registerState("state1", state1);
      stateManager.registerState("state2", state2);

      stateManager.transition("state1");
      stateManager.transition("state2");

      expect(stateManager.getPreviousState()).toBe("state1");
    });

    test("should return null for previous state with no history", () => {
      const state = { enter: jest.fn(), exit: jest.fn() };
      stateManager.registerState("state", state);
      stateManager.transition("state");

      expect(stateManager.getPreviousState()).toBeNull();
    });

    test("should clear state history", () => {
      const state = { enter: jest.fn(), exit: jest.fn() };
      stateManager.registerState("state", state);
      stateManager.transition("state");

      stateManager.clearStateHistory();
      expect(stateManager.getStateHistory().length).toBe(0);
    });
  });

  describe("Error Handling", () => {
    test("should handle errors in enter method", () => {
      const consoleError = jest.spyOn(console, "error");
      const state = {
        enter: jest.fn(() => {
          throw new Error("Enter failed");
        }),
        exit: jest.fn(),
      };

      stateManager.registerState("menu", state);
      stateManager.transition("menu");

      expect(consoleError).toHaveBeenCalled();
      expect(stateManager.isActive("menu")).toBe(false);

      consoleError.mockRestore();
    });

    test("should handle errors in exit method", () => {
      const consoleError = jest.spyOn(console, "error");
      const state = {
        enter: jest.fn(),
        exit: jest.fn(() => {
          throw new Error("Exit failed");
        }),
      };

      stateManager.registerState("menu", state);
      stateManager.transition("menu");
      stateManager.pop("menu");

      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });
});
