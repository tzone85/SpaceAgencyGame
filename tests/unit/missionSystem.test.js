/**
 * Mission System Tests
 *
 * Test suite for MissionSystem: mission catalog, launch, progress, completion
 */

import MissionSystem from "../../src/systems/MissionSystem.js";

describe("MissionSystem", () => {
  let system;
  let mockEventBus;
  let mockMissionData;

  beforeEach(() => {
    mockEventBus = {
      emit: jest.fn(),
    };
    mockMissionData = {
      lunar_orbit: {
        id: "lunar_orbit",
        name: "Lunar Orbit",
        tier: "beginner",
        duration: 5000,
        cost: 50_000_000,
      },
      mars_probe: {
        id: "mars_probe",
        name: "Mars Probe",
        tier: "advanced",
        duration: 10000,
        cost: 200_000_000,
      },
    };
    system = new MissionSystem(mockEventBus, mockMissionData);
  });

  describe("getMissionsByTier", () => {
    beforeEach(() => {
      system.state.available = ["lunar_orbit", "mars_probe"];
    });

    it("should return missions of specified tier", () => {
      const beginner = system.getMissionsByTier("beginner");
      expect(beginner.length).toBe(1);
      expect(beginner[0].id).toBe("lunar_orbit");
    });

    it("should filter by tier correctly", () => {
      const advanced = system.getMissionsByTier("advanced");
      expect(advanced.length).toBe(1);
      expect(advanced[0].id).toBe("mars_probe");
    });

    it("should return empty array for tier with no missions", () => {
      const expert = system.getMissionsByTier("expert");
      expect(expert.length).toBe(0);
    });
  });

  describe("launchMission", () => {
    it("should launch mission with valid crew assignment", () => {
      const result = system.launchMission("lunar_orbit", ["crew_1", "crew_2"]);
      expect(result).toBe(true);
      expect(system.state.active.length).toBe(1);
    });

    it("should emit mission:started event", () => {
      system.launchMission("lunar_orbit", ["crew_1"]);
      expect(mockEventBus.emit).toHaveBeenCalledWith("mission:started", {
        missionId: "lunar_orbit",
        crewIds: ["crew_1"],
      });
    });

    it("should deduct mission cost from budget", () => {
      system.launchMission("lunar_orbit", ["crew_1"]);
      expect(mockEventBus.emit).toHaveBeenCalledWith("budget:deduct", {
        amount: 50_000_000,
      });
    });

    it("should reject launch for non-existent mission", () => {
      const result = system.launchMission("nonexistent", ["crew_1"]);
      expect(result).toBe(false);
    });

    it("should emit validation error for invalid mission", () => {
      system.launchMission("nonexistent", ["crew_1"]);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "mission:validation-error",
        expect.any(Object),
      );
    });

    it("should track mission in active list", () => {
      system.launchMission("lunar_orbit", ["crew_1", "crew_2"]);
      const active = system.state.active[0];
      expect(active.id).toBe("lunar_orbit");
      expect(active.crewIds).toEqual(["crew_1", "crew_2"]);
      expect(active.status).toBe("active");
    });
  });

  describe("updateProgress", () => {
    beforeEach(() => {
      system.launchMission("lunar_orbit", ["crew_1"]);
      mockEventBus.emit.mockClear();
    });

    it("should advance mission progress", () => {
      system.updateProgress(1000);
      expect(system.state.active[0].progress).toBeGreaterThan(0);
    });

    it("should complete mission when progress reaches 100", () => {
      system.updateProgress(5000);
      expect(system.state.active.length).toBe(0);
      expect(system.state.completed.length).toBe(1);
    });

    it("should emit mission:completed when finished", () => {
      system.updateProgress(5000);
      expect(mockEventBus.emit).toHaveBeenCalledWith("mission:completed", {
        missionId: "lunar_orbit",
      });
    });
  });

  describe("completeMission", () => {
    beforeEach(() => {
      system.launchMission("lunar_orbit", ["crew_1"]);
      mockEventBus.emit.mockClear();
    });

    it("should move mission to completed", () => {
      system.completeMission("lunar_orbit");
      expect(system.state.active.length).toBe(0);
      expect(system.state.completed.length).toBe(1);
    });

    it("should emit mission:completed event", () => {
      system.completeMission("lunar_orbit");
      expect(mockEventBus.emit).toHaveBeenCalledWith("mission:completed", {
        missionId: "lunar_orbit",
      });
    });

    it("should handle non-existent mission gracefully", () => {
      system.completeMission("nonexistent");
      expect(system.state.active.length).toBe(1);
      expect(system.state.completed.length).toBe(0);
    });
  });
});
