/**
 * SaveSystem Tests
 *
 * Test suite for the SaveSystem localStorage persistence layer
 */

import { SaveSystem, SAVE_KEY } from "../../src/game/SaveSystem.js";

describe("SaveSystem", () => {
  let saveSystem;
  let mockEventBus;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    mockEventBus = {
      emit: jest.fn(),
    };

    saveSystem = new SaveSystem(mockEventBus);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("save and load round-trip", () => {
    test("should save and load state correctly", () => {
      const state = {
        agency: { name: "Test Agency", reputation: 75 },
        budget: { balance: 1_000_000 },
        meta: { saveVersion: 1, lastSaved: null, totalPlayTime: 0 },
      };

      const result = saveSystem.save(state);
      expect(result).toBe(true);

      const loaded = saveSystem.load();
      expect(loaded).toEqual(state);
    });

    test("should preserve nested data structures", () => {
      const state = {
        missions: {
          active: [
            { id: "m1", name: "Mars Probe", progress: 0.5 },
            { id: "m2", name: "Moon Base", progress: 0.8 },
          ],
          completed: [],
          available: [],
        },
        meta: { saveVersion: 1, lastSaved: null, totalPlayTime: 500 },
      };

      saveSystem.save(state);
      const loaded = saveSystem.load();

      expect(loaded.missions.active).toHaveLength(2);
      expect(loaded.missions.active[0].name).toBe("Mars Probe");
    });

    test("should emit save:completed on successful save", () => {
      const state = {
        meta: { saveVersion: 1 },
      };

      saveSystem.save(state);

      expect(mockEventBus.emit).toHaveBeenCalledWith("save:completed");
    });
  });

  describe("load", () => {
    test("should return null when no save exists", () => {
      const loaded = saveSystem.load();
      expect(loaded).toBeNull();
    });

    test("should return null on corrupted JSON data", () => {
      localStorage.setItem(SAVE_KEY, "not-valid-json{{{");
      const loaded = saveSystem.load();
      expect(loaded).toBeNull();
    });

    test("should return null if saveVersion is missing", () => {
      const state = { agency: { name: "Test" } };
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));

      const loaded = saveSystem.load();
      expect(loaded).toBeNull();
    });

    test("should return null if saveVersion does not match", () => {
      const state = { meta: { saveVersion: 999 } };
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));

      const loaded = saveSystem.load();
      expect(loaded).toBeNull();
    });

    test("should load state with correct saveVersion", () => {
      const state = { meta: { saveVersion: 1 }, agency: { name: "Valid" } };
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));

      const loaded = saveSystem.load();
      expect(loaded).toEqual(state);
    });
  });

  describe("clear", () => {
    test("should remove saved data from localStorage", () => {
      const state = { meta: { saveVersion: 1 } };
      saveSystem.save(state);
      expect(localStorage.getItem(SAVE_KEY)).not.toBeNull();

      saveSystem.clear();
      expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    });

    test("should not throw when clearing with no save", () => {
      expect(() => saveSystem.clear()).not.toThrow();
    });
  });

  describe("hasSave", () => {
    test("should return false when no save exists", () => {
      expect(saveSystem.hasSave()).toBe(false);
    });

    test("should return true after saving", () => {
      saveSystem.save({ meta: { saveVersion: 1 } });
      expect(saveSystem.hasSave()).toBe(true);
    });

    test("should return false after clearing", () => {
      saveSystem.save({ meta: { saveVersion: 1 } });
      saveSystem.clear();
      expect(saveSystem.hasSave()).toBe(false);
    });
  });

  describe("QuotaExceededError handling", () => {
    test("should emit save:error with storage-full reason", () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      const quotaError = new DOMException(
        "Storage quota exceeded",
        "QuotaExceededError",
      );
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw quotaError;
      });

      const result = saveSystem.save({ meta: { saveVersion: 1 } });

      expect(result).toBe(false);
      expect(mockEventBus.emit).toHaveBeenCalledWith("save:error", {
        reason: "storage-full",
      });

      Storage.prototype.setItem.mockRestore();
    });

    test("should return false on generic save errors", () => {
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Generic error");
      });

      const result = saveSystem.save({ meta: { saveVersion: 1 } });
      expect(result).toBe(false);

      Storage.prototype.setItem.mockRestore();
    });
  });

  describe("without eventBus", () => {
    test("should save without eventBus", () => {
      const noEventBusSave = new SaveSystem(null);
      const state = { meta: { saveVersion: 1 } };

      const result = noEventBusSave.save(state);
      expect(result).toBe(true);

      const loaded = noEventBusSave.load();
      expect(loaded).toEqual(state);
    });
  });

  describe("version migration", () => {
    test("should reject save version 0", () => {
      const state = { meta: { saveVersion: 0 } };
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));

      const loaded = saveSystem.load();
      expect(loaded).toBeNull();
    });

    test("should reject save version 2 (future)", () => {
      const state = { meta: { saveVersion: 2 } };
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));

      const loaded = saveSystem.load();
      expect(loaded).toBeNull();
    });

    test("should accept and return version 1 state", () => {
      const state = {
        meta: { saveVersion: 1 },
        budget: { balance: 1000 },
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));

      const loaded = saveSystem.load();
      expect(loaded).toEqual(state);
    });
  });

  describe("complete game state save/load", () => {
    test("should save and load full game state with all systems", () => {
      const completeState = {
        agency: {
          name: "Stellar Horizon Space Agency",
          reputation: 75,
          founded: "2024-Q1",
        },
        budget: {
          balance: 250_000_000,
          quarterlyFunding: 50_000_000,
          currentQuarter: 2,
          currentYear: 2024,
          history: [
            { quarter: 1, income: 50_000_000, spent: 10_000_000 },
            { quarter: 2, income: 50_000_000, spent: 15_000_000 },
          ],
        },
        missions: {
          available: [
            { id: "m1", name: "Moon Base", progress: 0 },
            { id: "m2", name: "Mars Probe", progress: 0 },
          ],
          active: [{ id: "m3", name: "LEO Station", progress: 0.5 }],
          completed: [],
        },
        crew: {
          roster: [
            { id: "c1", name: "Alice", role: "Captain", health: 100 },
            { id: "c2", name: "Bob", role: "Engineer", health: 95 },
          ],
          applicants: [],
          training: [],
        },
        research: {
          completed: [{ id: "r1", name: "BasicRocket" }],
          active: { id: "r2", name: "AdvancedThrusters", progress: 0.3 },
          available: [
            { id: "r3", name: "WarpDrive" },
            { id: "r4", name: "HyperDrive" },
          ],
        },
        events: {
          active: [{ id: "e1", type: "warning", message: "Solar flare" }],
          history: [{ id: "e0", type: "info", message: "Game started" }],
        },
        tutorial: {
          completed: true,
          currentStep: 5,
        },
        meta: {
          saveVersion: 1,
          lastSaved: new Date().toISOString(),
          totalPlayTime: 3600,
        },
      };

      const result = saveSystem.save(completeState);
      expect(result).toBe(true);

      const loaded = saveSystem.load();
      expect(loaded).toEqual(completeState);
      expect(loaded.budget.balance).toBe(250_000_000);
      expect(loaded.missions.active).toHaveLength(1);
      expect(loaded.crew.roster).toHaveLength(2);
      expect(loaded.research.completed).toHaveLength(1);
      expect(loaded.events.active).toHaveLength(1);
    });

    test("should handle large nested arrays in game state", () => {
      const largeState = {
        meta: { saveVersion: 1 },
        missions: {
          available: Array.from({ length: 50 }, (_, i) => ({
            id: `m${i}`,
            name: `Mission ${i}`,
            progress: 0,
          })),
          active: [],
          completed: Array.from({ length: 30 }, (_, i) => ({
            id: `m${i + 50}`,
            name: `Mission ${i + 50}`,
            progress: 1,
          })),
        },
        crew: {
          roster: Array.from({ length: 100 }, (_, i) => ({
            id: `c${i}`,
            name: `Crew Member ${i}`,
          })),
          applicants: [],
          training: [],
        },
      };

      const result = saveSystem.save(largeState);
      expect(result).toBe(true);

      const loaded = saveSystem.load();
      expect(loaded.missions.available).toHaveLength(50);
      expect(loaded.missions.completed).toHaveLength(30);
      expect(loaded.crew.roster).toHaveLength(100);
    });
  });

  describe("timestamp handling", () => {
    test("should preserve ISO timestamp in lastSaved", () => {
      const now = new Date().toISOString();
      const state = {
        meta: { saveVersion: 1, lastSaved: now },
      };

      saveSystem.save(state);
      const loaded = saveSystem.load();

      expect(loaded.meta.lastSaved).toBe(now);
      expect(new Date(loaded.meta.lastSaved)).toBeInstanceOf(Date);
    });

    test("should handle null lastSaved", () => {
      const state = {
        meta: { saveVersion: 1, lastSaved: null },
      };

      saveSystem.save(state);
      const loaded = saveSystem.load();

      expect(loaded.meta.lastSaved).toBeNull();
    });
  });
});
