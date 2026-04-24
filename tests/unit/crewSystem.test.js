/**
 * CrewSystem Tests
 *
 * Test suite for the CrewSystem class including crew management,
 * mission assignments, skill training, morale tracking, and event handling.
 */

import CrewSystem from '../../src/systems/CrewSystem.js';
import GameState from '../../src/game/GameState.js';
import EventBus from '../../src/game/EventBus.js';

describe('CrewSystem', () => {
  let crewSystem;
  let gameState;
  let eventBus;
  let system;
  let mockEventBus;
  let mockCrewData;

  beforeEach(() => {
    // Reset EventBus singleton
    EventBus.reset();
    eventBus = new EventBus();

    // Create fresh GameState
    gameState = new GameState();

    // Create CrewSystem with the fresh GameState
    crewSystem = new CrewSystem(gameState);

    // Legacy setup for backward compatibility
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

  afterEach(() => {
    if (crewSystem) {
      crewSystem.destroy();
    }
    EventBus.reset();
  });

  describe('initialization', () => {
    test('should initialize with empty crew roster', () => {
      expect(crewSystem.getAllCrew()).toEqual([]);
    });

    test('should initialize internal maps', () => {
      expect(crewSystem.crewMembers).toBeInstanceOf(Map);
      expect(crewSystem.missionAssignments).toBeInstanceOf(Map);
      expect(crewSystem.crewMissionMap).toBeInstanceOf(Map);
    });

    test('should set up event listeners', () => {
      expect(eventBus.hasListeners('crew:recruit')).toBe(true);
      expect(eventBus.hasListeners('crew:assign')).toBe(true);
      expect(eventBus.hasListeners('mission:completed')).toBe(true);
    });
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

    test('should recruit a famous astronaut', () => {
      const result = crewSystem.recruit('neil_armstrong');

      expect(result.id).toBe('neil_armstrong');
      expect(result.firstName).toBe('Neil');
      expect(result.lastName).toBe('Armstrong');
      expect(result.isRecruited).toBe(true);
      expect(result.recruitedAt).toBeDefined();
      expect(result.skills).toEqual({});
      expect(result.assignedMissionId).toBe(null);
    });

    test('should recruit procedural crew', () => {
      const result = crewSystem.recruit('engineer');

      expect(result.id).toBeDefined();
      expect(result.role).toBe('engineer');
      expect(result.isRecruited).toBe(true);
      expect(result.firstName).toBeDefined();
      expect(result.lastName).toBeDefined();
      expect(result.stats).toBeDefined();
    });

    test('should deduct recruitment cost from budget', () => {
      const initialBalance = gameState.getState().budget.balance;

      const crew = crewSystem.recruit('neil_armstrong');
      const newBalance = gameState.getState().budget.balance;

      const costDeducted = initialBalance - newBalance;
      expect(costDeducted).toBe(crew.recruitmentCost);
      expect(newBalance).toBeLessThan(initialBalance);
    });

    test('should update GameState crew roster', () => {
      crewSystem.recruit('neil_armstrong');

      const roster = gameState.getState().crew.roster;
      expect(roster.length).toBe(1);
      expect(roster[0].id).toBe('neil_armstrong');
    });

    test('should emit crew:updated event', () => {
      const callback = jest.fn();
      eventBus.subscribe('crew:updated', callback);

      crewSystem.recruit('neil_armstrong');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'recruited',
          crewId: 'neil_armstrong',
        })
      );
    });

    test('should emit budget:deduct event', () => {
      const callback = jest.fn();
      eventBus.subscribe('budget:deduct', callback);

      const crew = crewSystem.recruit('neil_armstrong');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: crew.recruitmentCost,
          reason: 'crew_recruitment',
          crewId: 'neil_armstrong',
        })
      );
    });

    test('should emit state:changed event', () => {
      const callback = jest.fn();
      eventBus.subscribe('state:changed', callback);

      crewSystem.recruit('neil_armstrong');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'crew',
          action: 'recruit',
        })
      );
    });

    test('should throw error if crew already recruited', () => {
      crewSystem.recruit('neil_armstrong');

      expect(() => {
        crewSystem.recruit('neil_armstrong');
      }).toThrow('already recruited');
    });

    test('should allow recruiting multiple crew members', () => {
      crewSystem.recruit('neil_armstrong');
      crewSystem.recruit('buzz_aldrin');
      crewSystem.recruit('yuri_gagarin');

      expect(crewSystem.getAllCrew().length).toBe(3);
    });

    test('should track crew in internal map', () => {
      crewSystem.recruit('neil_armstrong');

      const crew = crewSystem.getCrewMember('neil_armstrong');
      expect(crew).toBeDefined();
      expect(crew.id).toBe('neil_armstrong');
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

  describe('assignToMission', () => {
    beforeEach(() => {
      crewSystem.recruit('neil_armstrong');
    });

    test('should assign crew to mission', () => {
      const result = crewSystem.assignToMission('neil_armstrong', 'iss-resupply');

      expect(result.crewId).toBe('neil_armstrong');
      expect(result.missionId).toBe('iss-resupply');
      expect(result.crewMember.assignedMissionId).toBe('iss-resupply');
    });

    test('should track crew by mission', () => {
      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');

      const crew = crewSystem.getCrewByMission('iss-resupply');
      expect(crew.length).toBe(1);
      expect(crew[0].id).toBe('neil_armstrong');
    });

    test('should allow multiple crew on same mission', () => {
      crewSystem.recruit('buzz_aldrin');

      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');
      crewSystem.assignToMission('buzz_aldrin', 'iss-resupply');

      const crew = crewSystem.getCrewByMission('iss-resupply');
      expect(crew.length).toBe(2);
    });

    test('should update GameState', () => {
      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');

      const roster = gameState.getState().crew.roster;
      const crewMember = roster[0];
      expect(crewMember.assignedMissionId).toBe('iss-resupply');
    });

    test('should emit crew:updated event', () => {
      const callback = jest.fn();
      eventBus.subscribe('crew:updated', callback);

      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'assigned',
          crewId: 'neil_armstrong',
          missionId: 'iss-resupply',
        })
      );
    });

    test('should emit state:changed event', () => {
      const callback = jest.fn();
      eventBus.subscribe('state:changed', callback);

      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'crew',
          action: 'assign_to_mission',
        })
      );
    });

    test('should throw error if crew not found', () => {
      expect(() => {
        crewSystem.assignToMission('nonexistent', 'iss-resupply');
      }).toThrow('not found');
    });

    test('should throw error if crew already assigned', () => {
      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');

      expect(() => {
        crewSystem.assignToMission('neil_armstrong', 'hubble-repair');
      }).toThrow('already assigned');
    });
  });

  describe('unassign', () => {
    beforeEach(() => {
      crewSystem.recruit('neil_armstrong');
      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');
    });

    test('should unassign crew from mission', () => {
      const result = crewSystem.unassign('neil_armstrong');

      expect(result.crewId).toBe('neil_armstrong');
      expect(result.missionId).toBe('iss-resupply');
      expect(result.crewMember.assignedMissionId).toBe(null);
    });

    test('should update GameState', () => {
      crewSystem.unassign('neil_armstrong');

      const roster = gameState.getState().crew.roster;
      expect(roster[0].assignedMissionId).toBe(null);
    });

    test('should remove from mission assignments', () => {
      crewSystem.unassign('neil_armstrong');

      const crew = crewSystem.getCrewByMission('iss-resupply');
      expect(crew.length).toBe(0);
    });

    test('should emit crew:updated event', () => {
      const callback = jest.fn();
      eventBus.subscribe('crew:updated', callback);

      crewSystem.unassign('neil_armstrong');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'unassigned',
          crewId: 'neil_armstrong',
          missionId: 'iss-resupply',
        })
      );
    });

    test('should emit state:changed event', () => {
      const callback = jest.fn();
      eventBus.subscribe('state:changed', callback);

      crewSystem.unassign('neil_armstrong');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'crew',
          action: 'unassign_from_mission',
        })
      );
    });

    test('should throw error if crew not found', () => {
      expect(() => {
        crewSystem.unassign('nonexistent');
      }).toThrow('not found');
    });

    test('should throw error if crew not assigned', () => {
      crewSystem.unassign('neil_armstrong');

      expect(() => {
        crewSystem.unassign('neil_armstrong');
      }).toThrow('not assigned');
    });
  });

  describe("trainCrew", () => {
    beforeEach(() => {
      system.recruit({ name: "Frank", role: "engineer" });
      crewSystem.recruit('neil_armstrong');
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

    test('should increase skill level', () => {
      const result = crewSystem.trainCrew('neil_armstrong', 'EXPERIENCE');

      expect(result.skillName).toBe('EXPERIENCE');
      expect(result.oldLevel).toBe(0);
      expect(result.newLevel).toBe(5);
    });

    test('should cap skill level at 100', () => {
      const crew = crewSystem.getCrewMember('neil_armstrong');
      crew.skills.EXPERIENCE = 98;
      crewSystem.crewMembers.set('neil_armstrong', crew);

      const result = crewSystem.trainCrew('neil_armstrong', 'EXPERIENCE');

      expect(result.newLevel).toBe(100);
    });

    test('should initialize skill if not present', () => {
      const crew = crewSystem.getCrewMember('neil_armstrong');
      expect(crew.skills.MORALE).toBeUndefined();

      crewSystem.trainCrew('neil_armstrong', 'MORALE');

      const updatedCrew = crewSystem.getCrewMember('neil_armstrong');
      expect(updatedCrew.skills.MORALE).toBe(5);
    });

    test('should update GameState', () => {
      crewSystem.trainCrew('neil_armstrong', 'EXPERIENCE');

      const roster = gameState.getState().crew.roster;
      expect(roster[0].skills.EXPERIENCE).toBe(5);
    });

    test('should emit crew:updated event', () => {
      const callback = jest.fn();
      eventBus.subscribe('crew:updated', callback);

      crewSystem.trainCrew('neil_armstrong', 'EXPERIENCE');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'trained',
          crewId: 'neil_armstrong',
          skillName: 'EXPERIENCE',
          newLevel: 5,
        })
      );
    });

    test('should emit state:changed event', () => {
      const callback = jest.fn();
      eventBus.subscribe('state:changed', callback);

      crewSystem.trainCrew('neil_armstrong', 'EXPERIENCE');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'crew',
          action: 'train_skill',
        })
      );
    });

    test('should throw error if crew not found', () => {
      expect(() => {
        crewSystem.trainCrew('nonexistent', 'EXPERIENCE');
      }).toThrow('not found');
    });

    test('should throw error for invalid skill', () => {
      expect(() => {
        crewSystem.trainCrew('neil_armstrong', 'INVALID_SKILL');
      }).toThrow('Invalid skill');
    });

    test('should allow training multiple skills', () => {
      crewSystem.trainCrew('neil_armstrong', 'EXPERIENCE');
      crewSystem.trainCrew('neil_armstrong', 'MORALE');
      crewSystem.trainCrew('neil_armstrong', 'HEALTH');

      const crew = crewSystem.getCrewMember('neil_armstrong');
      expect(crew.skills.EXPERIENCE).toBe(5);
      expect(crew.skills.MORALE).toBe(5);
      expect(crew.skills.HEALTH).toBe(5);
    });

    test('should allow progressive skill training', () => {
      crewSystem.trainCrew('neil_armstrong', 'EXPERIENCE');
      crewSystem.trainCrew('neil_armstrong', 'EXPERIENCE');
      crewSystem.trainCrew('neil_armstrong', 'EXPERIENCE');

      const crew = crewSystem.getCrewMember('neil_armstrong');
      expect(crew.skills.EXPERIENCE).toBe(15);
    });
  });

  describe("updateMorale", () => {
    beforeEach(() => {
      system.recruit({ name: "Grace", role: "scientist" });
      crewSystem.recruit('neil_armstrong');
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

    test('should increase morale with positive delta', () => {
      const result = crewSystem.updateMorale('neil_armstrong', 10);

      expect(result.delta).toBe(10);
      expect(result.oldMorale).toBe(85); // neil_armstrong's initial morale
      expect(result.newMorale).toBe(95);
    });

    test('should decrease morale with negative delta', () => {
      const result = crewSystem.updateMorale('neil_armstrong', -20);

      expect(result.delta).toBe(-20);
      expect(result.newMorale).toBe(65);
    });

    test('should cap morale at 100', () => {
      crewSystem.updateMorale('neil_armstrong', 50);

      const result = crewSystem.updateMorale('neil_armstrong', 50);

      expect(result.newMorale).toBe(100);
    });

    test('should cap morale at 0', () => {
      const result = crewSystem.updateMorale('neil_armstrong', -100);

      expect(result.newMorale).toBe(0);
    });

    test('should update GameState', () => {
      crewSystem.updateMorale('neil_armstrong', 10);

      const roster = gameState.getState().crew.roster;
      expect(roster[0].stats.morale).toBe(95);
    });

    test('should emit crew:updated event', () => {
      const callback = jest.fn();
      eventBus.subscribe('crew:updated', callback);

      crewSystem.updateMorale('neil_armstrong', 10);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'morale_updated',
          crewId: 'neil_armstrong',
          delta: 10,
        })
      );
    });

    test('should emit state:changed event', () => {
      const callback = jest.fn();
      eventBus.subscribe('state:changed', callback);

      crewSystem.updateMorale('neil_armstrong', 10);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          system: 'crew',
          action: 'update_morale',
        })
      );
    });

    test('should throw error if crew not found', () => {
      expect(() => {
        crewSystem.updateMorale('nonexistent', 10);
      }).toThrow('not found');
    });

    test('should throw error for non-numeric delta', () => {
      expect(() => {
        crewSystem.updateMorale('neil_armstrong', 'invalid');
      }).toThrow('must be a number');
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

  describe('event listeners', () => {
    test('should handle crew:recruit event', () => {
      const callback = jest.fn();
      eventBus.subscribe('crew:updated', callback);

      eventBus.emit('crew:recruit', { crewId: 'neil_armstrong' });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'recruited',
          crewId: 'neil_armstrong',
        })
      );
    });

    test('should handle crew:assign event', () => {
      crewSystem.recruit('neil_armstrong');

      const callback = jest.fn();
      eventBus.subscribe('crew:updated', callback);

      eventBus.emit('crew:assign', {
        crewId: 'neil_armstrong',
        missionId: 'iss-resupply',
      });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'assigned',
          crewId: 'neil_armstrong',
          missionId: 'iss-resupply',
        })
      );
    });

    test('should handle mission:completed event', () => {
      crewSystem.recruit('neil_armstrong');
      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');

      const callback = jest.fn();
      eventBus.subscribe('crew:updated', callback);

      eventBus.emit('mission:completed', { missionId: 'iss-resupply' });

      // Should unassign crew
      const crew = crewSystem.getCrewMember('neil_armstrong');
      expect(crew.assignedMissionId).toBe(null);

      // Should increase experience
      expect(crew.stats.experience).toBeGreaterThan(85);
    });

    test('should handle mission:completed with multiple crew', () => {
      crewSystem.recruit('neil_armstrong');
      crewSystem.recruit('buzz_aldrin');

      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');
      crewSystem.assignToMission('buzz_aldrin', 'iss-resupply');

      eventBus.emit('mission:completed', { missionId: 'iss-resupply' });

      const crewOnMission = crewSystem.getCrewByMission('iss-resupply');
      expect(crewOnMission.length).toBe(0);
    });

    test('should handle event with error gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Emit crew:recruit with invalid crewId should not crash
      eventBus.emit('crew:recruit', { crewId: 'nonexistent' });

      consoleSpy.mockRestore();
    });
  });

  describe('query methods', () => {
    beforeEach(() => {
      crewSystem.recruit('neil_armstrong');
      crewSystem.recruit('buzz_aldrin');
      crewSystem.recruit('yuri_gagarin');

      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');
      crewSystem.assignToMission('buzz_aldrin', 'iss-resupply');
    });

    test('should get all crew', () => {
      const all = crewSystem.getAllCrew();
      expect(all.length).toBe(3);
    });

    test('should get crew by mission', () => {
      const crew = crewSystem.getCrewByMission('iss-resupply');
      expect(crew.length).toBe(2);
      expect(crew[0].id).toMatch(/neil_armstrong|buzz_aldrin/);
    });

    test('should get unassigned crew', () => {
      const unassigned = crewSystem.getUnassignedCrew();
      expect(unassigned.length).toBe(1);
      expect(unassigned[0].id).toBe('yuri_gagarin');
    });

    test('should get crew member by ID', () => {
      const crew = crewSystem.getCrewMember('neil_armstrong');
      expect(crew.id).toBe('neil_armstrong');
    });

    test('should return null for nonexistent crew', () => {
      const crew = crewSystem.getCrewMember('nonexistent');
      expect(crew).toBe(null);
    });
  });

  describe('state persistence', () => {
    test('should persist crew to GameState on recruit', () => {
      crewSystem.recruit('neil_armstrong');

      const state = gameState.getState();
      expect(state.crew.roster.length).toBe(1);
      expect(state.crew.roster[0].id).toBe('neil_armstrong');
    });

    test('should persist mission assignments to GameState', () => {
      crewSystem.recruit('neil_armstrong');
      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');

      const state = gameState.getState();
      expect(state.crew.roster[0].assignedMissionId).toBe('iss-resupply');
    });

    test('should persist skill training to GameState', () => {
      crewSystem.recruit('neil_armstrong');
      crewSystem.trainCrew('neil_armstrong', 'EXPERIENCE');

      const state = gameState.getState();
      expect(state.crew.roster[0].skills.EXPERIENCE).toBe(5);
    });

    test('should persist morale changes to GameState', () => {
      crewSystem.recruit('neil_armstrong');
      crewSystem.updateMorale('neil_armstrong', -10);

      const state = gameState.getState();
      expect(state.crew.roster[0].stats.morale).toBe(75);
    });

    test('should persist budget deductions to GameState', () => {
      const initialBalance = gameState.getState().budget.balance;

      crewSystem.recruit('neil_armstrong');

      const newBalance = gameState.getState().budget.balance;
      expect(newBalance).toBeLessThan(initialBalance);
    });
  });

  describe('complex scenarios', () => {
    test('should handle full crew lifecycle', () => {
      // Recruit
      crewSystem.recruit('neil_armstrong');
      expect(crewSystem.getAllCrew().length).toBe(1);

      // Assign to mission
      crewSystem.assignToMission('neil_armstrong', 'iss-resupply');
      const crewOnMission = crewSystem.getCrewByMission('iss-resupply');
      expect(crewOnMission.length).toBe(1);

      // Train skills
      crewSystem.trainCrew('neil_armstrong', 'EXPERIENCE');
      crewSystem.trainCrew('neil_armstrong', 'SKILL_LEVEL');

      // Update morale
      crewSystem.updateMorale('neil_armstrong', 10);

      // Mission completes
      EventBus.getInstance().emit('mission:completed', {
        missionId: 'iss-resupply',
      });

      // Verify crew was unassigned after mission
      const unassigned = crewSystem.getUnassignedCrew();
      expect(unassigned.length).toBeGreaterThan(0);
    });
  });
});