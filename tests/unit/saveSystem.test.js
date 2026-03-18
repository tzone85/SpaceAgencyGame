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
        "QuotaExceededError"
      );
      jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
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
      jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
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
});
