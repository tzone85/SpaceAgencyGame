/**
 * Crew System Tests
 *
 * Test suite for CrewSystem: recruitment, assignment, training, morale
 */

import CrewSystem from "../../src/systems/CrewSystem.js";

describe("CrewSystem", () => {
  let system;
  let mockEventBus;
  let mockCrewData;

  beforeEach(() => {
    mockEventBus = {
      emit: jest.fn(),
    };
    mockCrewData = {
      pilot_001: {
        id: "pilot_001",
        name: "Captain Smith",
        role: "pilot",
      },
      engineer_001: {
        id: "engineer_001",
        name: "Dr. Johnson",
        role: "engineer",
      },
    };
    system = new CrewSystem(mockEventBus, mockCrewData);
  });

  describe("recruit", () => {
    it("should add crew member to roster", () => {
      const crew = { name: "Alice", role: "pilot" };
      system.recruit(crew);
      expect(system.state.roster.length).toBe(1);
    });

    it("should assign ID if not provided", () => {
      const crew = { name: "Bob", role: "engineer" };
      system.recruit(crew);
      expect(system.state.roster[0].id).toBeDefined();
    });

    it("should set default morale and health", () => {
      const crew = { name: "Charlie", role: "scientist" };
      system.recruit(crew);
      expect(system.state.roster[0].morale).toBe(75);
      expect(system.state.roster[0].health).toBe(100);
    });

    it("should emit crew:updated event", () => {
      const crew = { name: "Diana", role: "pilot" };
      system.recruit(crew);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "crew:updated",
        expect.any(Object),
      );
    });
  });

  describe("assignToCrew", () => {
    beforeEach(() => {
      system.recruit({ name: "Eve", role: "pilot" });
    });

    it("should assign crew to mission", () => {
      const crewId = system.state.roster[0].id;
      const result = system.assignToCrew(crewId, "mission_001");
      expect(result).toBe(true);
      expect(system.state.assigned[crewId]).toBe("mission_001");
    });

    it("should emit crew:updated event", () => {
      const crewId = system.state.roster[0].id;
      system.assignToCrew(crewId, "mission_001");
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "crew:updated",
        expect.any(Object),
      );
    });

    it("should reject assignment of non-existent crew", () => {
      const result = system.assignToCrew("nonexistent", "mission_001");
      expect(result).toBe(false);
    });

    it("should prevent double assignment", () => {
      const crewId = system.state.roster[0].id;
      system.assignToCrew(crewId, "mission_001");
      const result = system.assignToCrew(crewId, "mission_002");
      expect(result).toBe(false);
    });
  });

  describe("trainCrew", () => {
    beforeEach(() => {
      system.recruit({ name: "Frank", role: "engineer" });
    });

    it("should start training for crew member", () => {
      const crewId = system.state.roster[0].id;
      system.trainCrew(crewId, "advanced_piloting");
      expect(system.state.training.length).toBe(1);
      expect(system.state.training[0].program).toBe("advanced_piloting");
    });

    it("should emit crew:training-started event", () => {
      const crewId = system.state.roster[0].id;
      system.trainCrew(crewId, "advanced_piloting");
      expect(mockEventBus.emit).toHaveBeenCalledWith("crew:training-started", {
        crewId,
        program: "advanced_piloting",
      });
    });

    it("should not train non-existent crew", () => {
      system.trainCrew("nonexistent", "advanced_piloting");
      expect(system.state.training.length).toBe(0);
    });
  });

  describe("updateMorale", () => {
    beforeEach(() => {
      system.recruit({ name: "Grace", role: "scientist" });
    });

    it("should increase morale", () => {
      const crewId = system.state.roster[0].id;
      system.updateMorale(crewId, 10);
      expect(system.state.roster[0].morale).toBe(85);
    });

    it("should decrease morale", () => {
      const crewId = system.state.roster[0].id;
      system.updateMorale(crewId, -20);
      expect(system.state.roster[0].morale).toBe(55);
    });

    it("should clamp morale between 0 and 100", () => {
      const crewId = system.state.roster[0].id;
      system.updateMorale(crewId, 50);
      expect(system.state.roster[0].morale).toBe(100);
    });

    it("should not go below 0", () => {
      const crewId = system.state.roster[0].id;
      system.updateMorale(crewId, -100);
      expect(system.state.roster[0].morale).toBe(0);
    });

    it("should emit crew:morale-updated event", () => {
      const crewId = system.state.roster[0].id;
      system.updateMorale(crewId, 15);
      expect(mockEventBus.emit).toHaveBeenCalledWith("crew:morale-updated", {
        crewId,
        morale: 90,
      });
    });
  });

  describe("getAvailable", () => {
    beforeEach(() => {
      system.recruit({ id: "crew_henry", name: "Henry", role: "pilot" });
      system.recruit({ id: "crew_iris", name: "Iris", role: "engineer" });
    });

    it("should return all unassigned crew", () => {
      const available = system.getAvailable();
      expect(available.length).toBe(2);
    });

    it("should exclude assigned crew", () => {
      const crew1 = system.state.roster[0];
      const result = system.assignToCrew(crew1.id, "mission_001");
      expect(result).toBe(true);
      const available = system.getAvailable();
      expect(available.length).toBe(1);
      expect(available[0].id).not.toBe(crew1.id);
    });
  });
});
