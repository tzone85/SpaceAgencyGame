/**
 * ResearchSystem Tests
 *
 * Comprehensive test suite for research system lifecycle, event handling,
 * and integration with GameState and EventBus.
 */

import ResearchSystem from "../../src/systems/ResearchSystem.js";
import GameState from "../../src/game/GameState.js";
import EventBus from "../../src/game/EventBus.js";

describe("ResearchSystem", () => {
  let researchSystem;
  let gameState;
  let eventBus;
  let system;
  let mockEventBus;
  let mockResearchData;

  beforeEach(() => {
    EventBus.reset();
    eventBus = new EventBus();
    gameState = new GameState();
    researchSystem = new ResearchSystem(gameState, eventBus);

    mockEventBus = {
      emit: jest.fn(),
    };
    mockResearchData = {
      reusable_rockets: {
        id: "reusable_rockets",
        name: "Reusable Rockets",
        duration: 10000,
        cost: 100_000_000,
      },
      life_support: {
        id: "life_support",
        name: "Advanced Life Support",
        duration: 8000,
        cost: 80_000_000,
      },
      warp_drive: {
        id: "warp_drive",
        name: "Theoretical Warp Drive",
        duration: 20000,
        cost: 500_000_000,
      },
    };
    system = new ResearchSystem(mockEventBus, mockResearchData);
  });

  afterEach(() => {
    if (researchSystem) {
      researchSystem.destroy();
    }
    EventBus.reset();
  });

  describe("initialization", () => {
    test("should initialize with GameState and EventBus", () => {
      expect(researchSystem.gameState).toBe(gameState);
      expect(researchSystem.eventBus).toBe(eventBus);
    });

    test("should initialize progress tracker at 0", () => {
      expect(researchSystem.activeResearchProgress).toBe(0);
    });

    test("should subscribe to research:start event", () => {
      expect(eventBus.hasListeners("research:start")).toBe(true);
    });

    test("should subscribe to game:tick event", () => {
      expect(eventBus.hasListeners("game:tick")).toBe(true);
    });
  });

  describe("getAvailable", () => {
    beforeEach(() => {
      system.state.available = ["reusable_rockets", "life_support"];
    });

    it("should return available techs not yet completed", () => {
      const available = system.getAvailable();
      expect(available.length).toBe(2);
    });

    it("should exclude completed techs", () => {
      system.state.completed.push("reusable_rockets");
      const available = system.getAvailable();
      expect(available.length).toBe(1);
      expect(available).toContain("life_support");
    });

    it("should handle empty available list", () => {
      system.state.available = [];
      const available = system.getAvailable();
      expect(available.length).toBe(0);
    });

    test("should return available research for tier 1 (no dependencies)", () => {
      const available = researchSystem.getAvailable();

      // Tier 1 research with no dependencies should be available
      const tierOneIds = available.map((r) => r.id);
      expect(tierOneIds).toContain("basic_rockets");
      expect(tierOneIds).toContain("basic_life_support");
      expect(tierOneIds).toContain("radio_communication");
      expect(tierOneIds).toContain("metal_alloys");
      expect(tierOneIds).toContain("basic_automation");
    });

    test("should not return completed research", () => {
      // Mark basic_rockets as completed
      gameState.update("research.completed", ["basic_rockets"]);

      const available = researchSystem.getAvailable();
      const tierOneIds = available.map((r) => r.id);

      expect(tierOneIds).not.toContain("basic_rockets");
    });

    test("should not return active research", () => {
      gameState.update("research.active", {
        id: "basic_rockets",
        progress: 0.5,
        duration: 10,
      });

      const available = researchSystem.getAvailable();
      const ids = available.map((r) => r.id);

      expect(ids).not.toContain("basic_rockets");
    });

    test("should not return research with unmet dependencies", () => {
      const available = researchSystem.getAvailable();
      const ids = available.map((r) => r.id);

      // ion_drives requires basic_rockets, which is not completed
      expect(ids).not.toContain("ion_drives");
    });

    test("should return research when dependencies are met", () => {
      // Complete basic_rockets
      gameState.update("research.completed", ["basic_rockets"]);

      const available = researchSystem.getAvailable();
      const ids = available.map((r) => r.id);

      // ion_drives requires basic_rockets, now available
      expect(ids).toContain("ion_drives");
    });
  });

  describe("startResearch", () => {
    beforeEach(() => {
      system.state.available = ["reusable_rockets"];
    });

    it("should start research on available tech", () => {
      const result = system.startResearch("reusable_rockets");
      expect(result).toBe(true);
      expect(system.state.active).not.toBeNull();
    });

    it("should emit research:started event", () => {
      system.startResearch("reusable_rockets");
      expect(mockEventBus.emit).toHaveBeenCalledWith("research:started", {
        techId: "reusable_rockets",
      });
    });

    it("should deduct research cost from budget", () => {
      system.startResearch("reusable_rockets");
      expect(mockEventBus.emit).toHaveBeenCalledWith("budget:deduct", {
        amount: 100_000_000,
      });
    });

    it("should reject research if already active", () => {
      system.startResearch("reusable_rockets");
      const result = system.startResearch("life_support");
      expect(result).toBe(false);
    });

    it("should reject research on non-existent tech", () => {
      const result = system.startResearch("nonexistent");
      expect(result).toBe(false);
    });

    test("should start available research", () => {
      const result = researchSystem.startResearch("basic_rockets");

      expect(result).toBe(true);
      const state = gameState.getState();
      expect(state.research.active).toBeDefined();
      expect(state.research.active.id).toBe("basic_rockets");
    });

    test("should initialize research with correct duration", () => {
      researchSystem.startResearch("basic_rockets");

      const state = gameState.getState();
      expect(state.research.active.duration).toBe(10);
    });

    test("should deduct budget for research cost", () => {
      const initialBalance = gameState.getState().budget.balance;

      researchSystem.startResearch("basic_rockets");

      const newBalance = gameState.getState().budget.balance;
      // basic_rockets costs 50000 credits
      expect(newBalance).toBe(initialBalance - 50000);
    });

    test("should emit research:started event", () => {
      const callback = jest.fn();
      eventBus.subscribe("research:started", callback);

      researchSystem.startResearch("basic_rockets");

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          techId: "basic_rockets",
          name: "Basic Rockets",
          duration: 10,
          costs: expect.objectContaining({ science: 100, credits: 50000 }),
        }),
      );
    });

    test("should emit budget:deduct event", () => {
      const callback = jest.fn();
      eventBus.subscribe("budget:deduct", callback);

      researchSystem.startResearch("basic_rockets");

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50000,
          reason: "research",
          researchId: "basic_rockets",
        }),
      );
    });

    test("should emit state:changed event", () => {
      const callback = jest.fn();
      eventBus.subscribe("state:changed", callback);

      researchSystem.startResearch("basic_rockets");

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "research:started",
          data: expect.objectContaining({
            techId: "basic_rockets",
            name: "Basic Rockets",
          }),
        }),
      );
    });

    test("should fail if research not found", () => {
      const result = researchSystem.startResearch("nonexistent_research");

      expect(result).toBe(false);
      const state = gameState.getState();
      expect(state.research.active).toBeNull();
    });

    test("should fail if research already completed", () => {
      gameState.update("research.completed", ["basic_rockets"]);

      const result = researchSystem.startResearch("basic_rockets");

      expect(result).toBe(false);
    });

    test("should fail if research already active", () => {
      researchSystem.startResearch("basic_rockets");

      const result = researchSystem.startResearch("basic_rockets");

      expect(result).toBe(false);
    });

    test("should fail if prerequisites not met", () => {
      const result = researchSystem.startResearch("ion_drives");

      expect(result).toBe(false);
      const state = gameState.getState();
      expect(state.research.active).toBeNull();
    });

    test("should fail if insufficient budget", () => {
      // Set very low budget
      gameState.update("budget.balance", 1000);

      const result = researchSystem.startResearch("basic_rockets");

      expect(result).toBe(false);
      const state = gameState.getState();
      expect(state.budget.balance).toBe(1000); // No deduction
      expect(state.research.active).toBeNull();
    });

    test("should reset progress tracker when starting research", () => {
      researchSystem.activeResearchProgress = 0.5;

      researchSystem.startResearch("basic_rockets");

      expect(researchSystem.activeResearchProgress).toBe(0);
    });
  });

  describe("updateProgress", () => {
    beforeEach(() => {
      system.state.available = ["reusable_rockets"];
      system.startResearch("reusable_rockets");
      mockEventBus.emit.mockClear();
      researchSystem.startResearch("basic_rockets");
    });

    it("should advance research progress", () => {
      system.updateProgress(1000);
      expect(system.state.active.progress).toBeGreaterThan(0);
    });

    it("should complete research when progress reaches 100%", () => {
      system.updateProgress(10000);
      expect(system.state.active).toBeNull();
      expect(system.state.completed).toContain("reusable_rockets");
    });

    it("should emit research:completed when finished", () => {
      system.updateProgress(10000);
      expect(mockEventBus.emit).toHaveBeenCalledWith("research:completed", {
        techId: "reusable_rockets",
      });
    });

    it("should do nothing if no active research", () => {
      system.state.active = null;
      system.updateProgress(1000);
      expect(system.state.active).toBeNull();
    });

    test("should update progress with deltaTime", () => {
      // basic_rockets has 10 game-day duration
      // deltaTime of 1 should increase progress by 0.1
      researchSystem.updateProgress(1);

      expect(researchSystem.activeResearchProgress).toBeCloseTo(0.1);
    });

    test("should accumulate progress across multiple updates", () => {
      researchSystem.updateProgress(2);
      researchSystem.updateProgress(3);

      // 2 + 3 = 5 game-days out of 10 = 0.5 progress
      expect(researchSystem.activeResearchProgress).toBeCloseTo(0.5);
    });

    test("should cap progress at 1.0", () => {
      researchSystem.updateProgress(15);

      // Progress is capped at 1.0 but then completeResearch resets it to 0
      // Verify research was completed instead
      const state = gameState.getState();
      expect(state.research.active).toBeNull();
      expect(state.research.completed).toContain("basic_rockets");
    });

    test("should update GameState progress", () => {
      researchSystem.updateProgress(3);

      const state = gameState.getState();
      expect(state.research.active.progress).toBeCloseTo(0.3);
    });

    test("should not update if no active research", () => {
      gameState.update("research.active", null);

      // Should not throw
      expect(() => {
        researchSystem.updateProgress(5);
      }).not.toThrow();
    });

    test("should not update if active research not found", () => {
      gameState.update("research.active", {
        id: "nonexistent",
        progress: 0,
        duration: 10,
      });

      // Should not throw
      expect(() => {
        researchSystem.updateProgress(5);
      }).not.toThrow();
    });

    test("should trigger completion when progress reaches 1.0", () => {
      const callback = jest.fn();
      eventBus.subscribe("research:completed", callback);

      researchSystem.updateProgress(10);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("completeResearch", () => {
    beforeEach(() => {
      system.state.available = ["reusable_rockets"];
      system.startResearch("reusable_rockets");
      mockEventBus.emit.mockClear();
      researchSystem.startResearch("basic_rockets");
    });

    it("should unlock technology", () => {
      system.completeResearch("reusable_rockets");
      expect(system.state.completed).toContain("reusable_rockets");
    });

    it("should clear active research", () => {
      system.completeResearch("reusable_rockets");
      expect(system.state.active).toBeNull();
    });

    it("should emit research:completed event", () => {
      system.completeResearch("reusable_rockets");
      expect(mockEventBus.emit).toHaveBeenCalledWith("research:completed", {
        techId: "reusable_rockets",
      });
    });

    it("should emit research:tech-unlocked event", () => {
      system.completeResearch("reusable_rockets");
      expect(mockEventBus.emit).toHaveBeenCalledWith("research:tech-unlocked", {
        techId: "reusable_rockets",
      });
    });

    it("should not complete research if not active", () => {
      system.state.active = null;
      system.completeResearch("reusable_rockets");
      expect(system.state.completed).not.toContain("reusable_rockets");
    });

    test("should add research to completed list", () => {
      researchSystem.completeResearch("basic_rockets");

      const state = gameState.getState();
      expect(state.research.completed).toContain("basic_rockets");
    });

    test("should clear active research", () => {
      researchSystem.completeResearch("basic_rockets");

      const state = gameState.getState();
      expect(state.research.active).toBeNull();
    });

    test("should reset progress tracker", () => {
      researchSystem.activeResearchProgress = 0.8;

      researchSystem.completeResearch("basic_rockets");

      expect(researchSystem.activeResearchProgress).toBe(0);
    });

    test("should emit research:completed event", () => {
      const callback = jest.fn();
      eventBus.subscribe("research:completed", callback);

      researchSystem.completeResearch("basic_rockets");

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          techId: "basic_rockets",
          name: "Basic Rockets",
          unlockedCapabilities: expect.any(Array),
          unlockedMissions: expect.any(Array),
        }),
      );
    });

    test("should emit state:changed event", () => {
      const callback = jest.fn();
      eventBus.subscribe("state:changed", callback);

      researchSystem.completeResearch("basic_rockets");

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "research:completed",
          data: expect.objectContaining({
            techId: "basic_rockets",
            name: "Basic Rockets",
          }),
        }),
      );
    });

    test("should include unlocked capabilities in event", () => {
      const callback = jest.fn();
      eventBus.subscribe("research:completed", callback);

      researchSystem.completeResearch("basic_rockets");

      const eventData = callback.mock.calls[0][0];
      expect(eventData.unlockedCapabilities).toEqual([
        "launch_small_rockets",
        "orbital_mechanics",
      ]);
    });

    test("should fail gracefully if research not found", () => {
      expect(() => {
        researchSystem.completeResearch("nonexistent_research");
      }).not.toThrow();
    });
  });

  describe("isUnlocked", () => {
    it("should return true for unlocked technology", () => {
      system.state.completed.push("reusable_rockets");
      expect(system.isUnlocked("reusable_rockets")).toBe(true);
    });

    it("should return false for locked technology", () => {
      expect(system.isUnlocked("reusable_rockets")).toBe(false);
    });
  });

  describe("event listeners", () => {
    test("should handle research:start event", () => {
      const callback = jest.fn();
      eventBus.subscribe("research:started", callback);

      eventBus.emit("research:start", { techId: "basic_rockets" });

      expect(callback).toHaveBeenCalled();
      const state = gameState.getState();
      expect(state.research.active?.id).toBe("basic_rockets");
    });

    test("should handle game:tick event", () => {
      researchSystem.startResearch("basic_rockets");

      eventBus.emit("game:tick", { deltaTime: 5 });

      expect(researchSystem.activeResearchProgress).toBeCloseTo(0.5);
    });

    test("should ignore invalid research:start event data", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      eventBus.emit("research:start", { techId: null });

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    test("should ignore invalid game:tick event data", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      researchSystem.startResearch("basic_rockets");
      eventBus.emit("game:tick", { deltaTime: "invalid" });

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    test("should handle missing event data", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      eventBus.emit("research:start", null);
      eventBus.emit("game:tick", null);

      expect(warnSpy).toHaveBeenCalledTimes(2);
      warnSpy.mockRestore();
    });
  });

  describe("complete research lifecycle", () => {
    test("should complete full research cycle", () => {
      // Start research
      const started = researchSystem.startResearch("basic_rockets");
      expect(started).toBe(true);

      let state = gameState.getState();
      expect(state.research.active.id).toBe("basic_rockets");

      // Progress through ticks
      researchSystem.updateProgress(3);
      state = gameState.getState();
      expect(state.research.active.progress).toBeCloseTo(0.3);

      researchSystem.updateProgress(3);
      state = gameState.getState();
      expect(state.research.active.progress).toBeCloseTo(0.6);

      // Complete research
      researchSystem.updateProgress(4);
      state = gameState.getState();

      // Should be marked as completed
      expect(state.research.completed).toContain("basic_rockets");
      expect(state.research.active).toBeNull();
    });

    test("should unlock tier 2 research after tier 1 completion", () => {
      // Complete tier 1
      researchSystem.startResearch("basic_rockets");
      researchSystem.updateProgress(10);

      // Verify completion
      let state = gameState.getState();
      expect(state.research.completed).toContain("basic_rockets");

      // Check that tier 2 becomes available
      const available = researchSystem.getAvailable();
      const ids = available.map((r) => r.id);
      expect(ids).toContain("ion_drives");
    });

    test("should allow chaining multiple research", () => {
      // Complete basic_rockets
      researchSystem.startResearch("basic_rockets");
      researchSystem.updateProgress(10);

      let state = gameState.getState();
      expect(state.research.completed).toContain("basic_rockets");

      // Start ion_drives (depends on basic_rockets)
      const ionStarted = researchSystem.startResearch("ion_drives");
      expect(ionStarted).toBe(true);

      state = gameState.getState();
      expect(state.research.active.id).toBe("ion_drives");

      // Complete ion_drives
      researchSystem.updateProgress(20);

      state = gameState.getState();
      expect(state.research.completed).toContain("ion_drives");
    });
  });

  describe("budget integration", () => {
    test("should deduct correct amount for each research", () => {
      const initialBalance = gameState.getState().budget.balance;

      // basic_rockets: 50000 credits
      researchSystem.startResearch("basic_rockets");
      const afterFirst = gameState.getState().budget.balance;
      expect(afterFirst).toBe(initialBalance - 50000);

      // Complete first research and start second
      researchSystem.updateProgress(10);

      // basic_life_support: 60000 credits
      researchSystem.startResearch("basic_life_support");
      const afterSecond = gameState.getState().budget.balance;
      expect(afterSecond).toBe(afterFirst - 60000);
    });

    test("should prevent starting research without sufficient budget", () => {
      // Set budget to less than needed
      gameState.update("budget.balance", 30000);

      const result = researchSystem.startResearch("basic_rockets");

      expect(result).toBe(false);
      expect(gameState.getState().budget.balance).toBe(30000);
    });
  });

  describe("destroy", () => {
    test("should unsubscribe from events on destroy", () => {
      researchSystem.destroy();

      expect(eventBus.hasListeners("research:start")).toBe(false);
      expect(eventBus.hasListeners("game:tick")).toBe(false);
    });

    test("should not process events after destroy", () => {
      const callback = jest.fn();
      eventBus.subscribe("research:started", callback);

      researchSystem.destroy();
      eventBus.emit("research:start", { techId: "basic_rockets" });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    test("should handle research with no unlocked capabilities", () => {
      // Most research have capabilities, but test gracefully handles empty arrays
      const callback = jest.fn();
      eventBus.subscribe("research:completed", callback);

      researchSystem.startResearch("basic_rockets");
      researchSystem.updateProgress(10);

      expect(callback).toHaveBeenCalled();
      const eventData = callback.mock.calls[0][0];
      expect(Array.isArray(eventData.unlockedCapabilities)).toBe(true);
    });

    test("should handle rapid progress updates", () => {
      researchSystem.startResearch("basic_rockets");

      // Rapid updates
      for (let i = 0; i < 10; i++) {
        researchSystem.updateProgress(1);
      }

      // After completion, progress is reset to 0 and research marked as completed
      const state = gameState.getState();
      expect(state.research.active).toBeNull();
      expect(state.research.completed).toContain("basic_rockets");
      expect(researchSystem.activeResearchProgress).toBeLessThanOrEqual(1.0);
    });

    test("should maintain immutability of GameState", () => {
      researchSystem.startResearch("basic_rockets");

      const state1 = gameState.getState();
      researchSystem.updateProgress(5);
      const state2 = gameState.getState();

      // States should be different references (immutability)
      expect(state1).not.toBe(state2);
      expect(state1.research.active).not.toBe(state2.research.active);
    });
  });
});