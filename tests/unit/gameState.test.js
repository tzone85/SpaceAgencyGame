/**
 * GameState Tests
 *
 * Test suite for the immutable GameState manager
 */

import { GameState, INITIAL_STATE } from "../../src/game/GameState.js";

describe("GameState", () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe("initial state", () => {
    test("should have correct top-level keys", () => {
      const state = gameState.getState();
      const expectedKeys = [
        "agency",
        "budget",
        "missions",
        "crew",
        "research",
        "events",
        "tutorial",
        "meta",
      ];
      expect(Object.keys(state).sort()).toEqual(expectedKeys.sort());
    });

    test("should have correct agency defaults", () => {
      const state = gameState.getState();
      expect(state.agency.name).toBe("Stellar Horizon Space Agency");
      expect(state.agency.reputation).toBe(50);
      expect(state.agency.founded).toBe("2024-Q1");
    });

    test("should have correct budget defaults", () => {
      const state = gameState.getState();
      expect(state.budget.balance).toBe(500_000_000);
      expect(state.budget.quarterlyFunding).toBe(50_000_000);
      expect(state.budget.currentQuarter).toBe(1);
      expect(state.budget.currentYear).toBe(2024);
      expect(state.budget.history).toEqual([]);
    });

    test("should have correct missions defaults", () => {
      const state = gameState.getState();
      expect(state.missions.available).toEqual([]);
      expect(state.missions.active).toEqual([]);
      expect(state.missions.completed).toEqual([]);
    });

    test("should have correct crew defaults", () => {
      const state = gameState.getState();
      expect(state.crew.roster).toEqual([]);
      expect(state.crew.applicants).toEqual([]);
      expect(state.crew.training).toEqual([]);
    });

    test("should have correct research defaults", () => {
      const state = gameState.getState();
      expect(state.research.completed).toEqual([]);
      expect(state.research.active).toBeNull();
      expect(state.research.available).toEqual([]);
    });

    test("should have correct meta defaults", () => {
      const state = gameState.getState();
      expect(state.meta.saveVersion).toBe(1);
      expect(state.meta.lastSaved).toBeNull();
      expect(state.meta.totalPlayTime).toBe(0);
    });

    test("should accept custom initial state", () => {
      const custom = {
        agency: { name: "Custom Agency", reputation: 100, founded: "2025-Q1" },
        budget: {
          balance: 1_000_000,
          quarterlyFunding: 100_000,
          currentQuarter: 2,
          currentYear: 2025,
          history: [],
        },
        missions: { available: [], active: [], completed: [] },
        crew: { roster: [], applicants: [], training: [] },
        research: { completed: [], active: null, available: [] },
        events: { active: [], history: [] },
        tutorial: { completed: true, currentStep: 5 },
        meta: { saveVersion: 1, lastSaved: null, totalPlayTime: 100 },
      };

      const customState = new GameState(custom);
      expect(customState.getState().agency.name).toBe("Custom Agency");
      expect(customState.getState().tutorial.completed).toBe(true);
    });
  });

  describe("getState", () => {
    test("should return a frozen object", () => {
      const state = gameState.getState();
      expect(Object.isFrozen(state)).toBe(true);
    });

    test("should prevent direct mutation of top-level properties", () => {
      const state = gameState.getState();
      expect(() => {
        state.agency = {};
      }).toThrow();
    });

    test("should return the same reference if state has not changed", () => {
      const state1 = gameState.getState();
      const state2 = gameState.getState();
      expect(state1).toBe(state2);
    });
  });

  describe("update", () => {
    test("should update a top-level nested value", () => {
      gameState.update("agency.reputation", 75);
      expect(gameState.getState().agency.reputation).toBe(75);
    });

    test("should update a deeply nested value", () => {
      gameState.update("budget.balance", 999_999);
      expect(gameState.getState().budget.balance).toBe(999_999);
    });

    test("should create a new state reference", () => {
      const stateBefore = gameState.getState();
      gameState.update("agency.reputation", 75);
      const stateAfter = gameState.getState();

      expect(stateBefore).not.toBe(stateAfter);
    });

    test("should not mutate previous state reference", () => {
      const stateBefore = gameState.getState();
      const originalReputation = stateBefore.agency.reputation;

      gameState.update("agency.reputation", 75);

      // The old reference still holds the old value (frozen clone)
      expect(stateBefore.agency.reputation).toBe(originalReputation);
    });

    test("should freeze the new state", () => {
      gameState.update("agency.reputation", 75);
      expect(Object.isFrozen(gameState.getState())).toBe(true);
    });

    test("should handle array values", () => {
      gameState.update("missions.available", [{ id: "m1", name: "Mars" }]);
      expect(gameState.getState().missions.available).toEqual([
        { id: "m1", name: "Mars" },
      ]);
    });

    test("should throw for empty path", () => {
      expect(() => gameState.update("", 42)).toThrow();
    });

    test("should throw for invalid path", () => {
      expect(() => gameState.update("nonexistent.deep.path", 42)).toThrow();
    });
  });

  describe("batchUpdate", () => {
    test("should update multiple paths at once", () => {
      gameState.batchUpdate({
        "agency.reputation": 80,
        "budget.balance": 1_000_000,
        "tutorial.completed": true,
      });

      const state = gameState.getState();
      expect(state.agency.reputation).toBe(80);
      expect(state.budget.balance).toBe(1_000_000);
      expect(state.tutorial.completed).toBe(true);
    });

    test("should create only one new state for multiple updates", () => {
      const stateBefore = gameState.getState();

      gameState.batchUpdate({
        "agency.reputation": 80,
        "budget.balance": 1_000_000,
      });

      const stateAfter = gameState.getState();
      expect(stateBefore).not.toBe(stateAfter);
    });

    test("should freeze the resulting state", () => {
      gameState.batchUpdate({
        "agency.reputation": 80,
      });

      expect(Object.isFrozen(gameState.getState())).toBe(true);
    });

    test("should throw for null updates", () => {
      expect(() => gameState.batchUpdate(null)).toThrow();
    });

    test("should throw for non-object updates", () => {
      expect(() => gameState.batchUpdate("invalid")).toThrow();
    });
  });

  describe("reset", () => {
    test("should restore to initial state values", () => {
      gameState.update("agency.reputation", 100);
      gameState.update("budget.balance", 0);

      gameState.reset();

      const state = gameState.getState();
      expect(state.agency.reputation).toBe(50);
      expect(state.budget.balance).toBe(500_000_000);
    });

    test("should return a frozen state after reset", () => {
      gameState.update("agency.reputation", 100);
      gameState.reset();
      expect(Object.isFrozen(gameState.getState())).toBe(true);
    });

    test("should produce a new reference after reset", () => {
      const stateBeforeReset = gameState.getState();
      gameState.update("agency.reputation", 100);
      gameState.reset();
      const stateAfterReset = gameState.getState();

      // Different reference from the modified state
      expect(stateBeforeReset).not.toBe(stateAfterReset);
    });
  });

  describe("immutability guarantees", () => {
    test("should not share references between INITIAL_STATE and game state", () => {
      const state = gameState.getState();
      expect(state).not.toBe(INITIAL_STATE);
      expect(state.missions.available).not.toBe(INITIAL_STATE.missions.available);
    });

    test("should not share references between two GameState instances", () => {
      const gs1 = new GameState();
      const gs2 = new GameState();

      gs1.update("agency.reputation", 99);

      expect(gs2.getState().agency.reputation).toBe(50);
    });
  });
});
