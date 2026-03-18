/**
 * Research System Tests
 *
 * Test suite for ResearchSystem: tech tree, research progress, unlocking
 */

import ResearchSystem from "../../src/systems/ResearchSystem.js";

describe("ResearchSystem", () => {
  let system;
  let mockEventBus;
  let mockResearchData;

  beforeEach(() => {
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
  });

  describe("updateProgress", () => {
    beforeEach(() => {
      system.state.available = ["reusable_rockets"];
      system.startResearch("reusable_rockets");
      mockEventBus.emit.mockClear();
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
  });

  describe("completeResearch", () => {
    beforeEach(() => {
      system.state.available = ["reusable_rockets"];
      system.startResearch("reusable_rockets");
      mockEventBus.emit.mockClear();
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
});
