/**
 * Mission System Tests
 *
 * Comprehensive test suite for MissionSystem class covering:
 * - Mission tier filtering
 * - Mission launching with crew validation
 * - Progress tracking with deltaTime
 * - Mission completion
 * - Event handling (mission:launch, game:tick)
 * - Event emissions (mission:started, mission:completed, budget:deduct, state:changed)
 * - GameState integration
 * - Error handling and edge cases
 */

import MissionSystem from '../../src/systems/MissionSystem.js';
import GameState from '../../src/game/GameState.js';
import EventBus from '../../src/game/EventBus.js';
import { missions, getMissionById } from '../../src/data/missions.js';

describe('MissionSystem', () => {
  let missionSystem;
  let eventBus;
  let gameState;
  let system;
  let mockEventBus;
  let mockMissionData;

  beforeEach(() => {
    // Reset singleton
    EventBus.reset();
    eventBus = EventBus.getInstance();
    gameState = new GameState();
    missionSystem = new MissionSystem(eventBus, gameState);

    // Mock setup for legacy tests
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

  afterEach(() => {
    if (missionSystem) {
      missionSystem.destroy();
    }
  });

  describe('Constructor', () => {
    it('should create a MissionSystem with EventBus and GameState', () => {
      expect(missionSystem).toBeDefined();
      expect(missionSystem.getActiveMissions()).toEqual([]);
    });

    it('should throw if EventBus is missing', () => {
      expect(() => {
        new MissionSystem(null, gameState);
      }).toThrow('EventBus is required');
    });

    it('should throw if GameState is missing', () => {
      expect(() => {
        new MissionSystem(eventBus, null);
      }).toThrow('GameState is required');
    });

    it('should subscribe to mission:launch and game:tick events', () => {
      const unsubscribe1 = eventBus.subscribe('mission:launch', () => {});
      const unsubscribe2 = eventBus.subscribe('game:tick', () => {});

      expect(eventBus.listenerCount('mission:launch')).toBeGreaterThan(0);
      expect(eventBus.listenerCount('game:tick')).toBeGreaterThan(0);

      unsubscribe1();
      unsubscribe2();
    });
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

    it('should return missions for LEO tier', () => {
      const missions = missionSystem.getMissionsByTier('LEO');
      expect(missions.length).toBeGreaterThan(0);
      missions.forEach((mission) => {
        expect(mission.tier).toBe('LEO');
      });
    });

    it('should return missions for Lunar tier', () => {
      const missions = missionSystem.getMissionsByTier('Lunar');
      expect(missions.length).toBeGreaterThan(0);
      missions.forEach((mission) => {
        expect(mission.tier).toBe('Lunar');
      });
    });

    it('should return missions for Inner Solar tier', () => {
      const missions = missionSystem.getMissionsByTier('Inner Solar');
      expect(missions.length).toBeGreaterThan(0);
      missions.forEach((mission) => {
        expect(mission.tier).toBe('Inner Solar');
      });
    });

    it('should return empty array for non-existent tier', () => {
      const missions = missionSystem.getMissionsByTier('NonExistent');
      expect(missions).toEqual([]);
    });

    it('should throw if tier is not a string', () => {
      expect(() => {
        missionSystem.getMissionsByTier(123);
      }).toThrow();
    });

    it('should throw if tier is empty string', () => {
      expect(() => {
        missionSystem.getMissionsByTier('');
      }).toThrow();
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

    it('should launch a mission with correct crew', () => {
      const mission = getMissionById('iss-resupply');
      const crewIds = ['crew-1', 'crew-2'];

      const result = missionSystem.launchMission('iss-resupply', crewIds);

      expect(result).toBeDefined();
      expect(result.missionId).toBe('iss-resupply');
      expect(result.crewIds).toEqual(crewIds);
      expect(result.elapsed).toBe(0);
      expect(result.status).toBe('active');
    });

    it('should deduct budget from GameState', () => {
      const initialState = gameState.getState();
      const initialBalance = initialState.budget.balance;
      const mission = getMissionById('iss-resupply');

      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      const updatedState = gameState.getState();
      expect(updatedState.budget.balance).toBe(initialBalance - mission.cost);
    });

    it('should add mission to active missions in GameState', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      const state = gameState.getState();
      const activeMission = state.missions.active.find(
        (m) => m.missionId === 'iss-resupply'
      );

      expect(activeMission).toBeDefined();
      expect(activeMission.crewIds).toEqual(['crew-1', 'crew-2']);
      expect(activeMission.status).toBe('active');
    });

    it('should emit mission:started event', () => {
      const callback = jest.fn();
      eventBus.subscribe('mission:started', callback);

      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          missionId: 'iss-resupply',
          missionName: 'ISS Supply Mission',
          crewIds: ['crew-1', 'crew-2'],
          cost: expect.any(Number),
          duration: expect.any(Number),
        })
      );
    });

    it('should emit budget:deduct event', () => {
      const callback = jest.fn();
      eventBus.subscribe('budget:deduct', callback);

      const mission = getMissionById('iss-resupply');
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: mission.cost,
          reason: 'mission-launch',
          missionId: 'iss-resupply',
          newBalance: expect.any(Number),
        })
      );
    });

    it('should emit state:changed event', () => {
      const callback = jest.fn();
      eventBus.subscribe('state:changed', callback);

      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          change: 'mission-launched',
          missionId: 'iss-resupply',
        })
      );
    });

    it('should throw if missionId is not a string', () => {
      expect(() => {
        missionSystem.launchMission(123, ['crew-1']);
      }).toThrow();
    });

    it('should throw if missionId does not exist', () => {
      expect(() => {
        missionSystem.launchMission('nonexistent', ['crew-1', 'crew-2']);
      }).toThrow('Mission not found');
    });

    it('should throw if crew count does not match mission requirement', () => {
      const mission = getMissionById('iss-resupply');
      expect(() => {
        missionSystem.launchMission('iss-resupply', ['crew-1']); // Needs 2
      }).toThrow(
        `Mission requires ${mission.crewRequired} crew, but 1 provided`
      );
    });

    it('should fail if insufficient budget', () => {
      const callback = jest.fn();
      eventBus.subscribe('mission:launch-failed', callback);

      // Create a new game state with low budget
      const lowBudgetState = new GameState();
      lowBudgetState.update('budget.balance', 10);
      const system = new MissionSystem(eventBus, lowBudgetState);

      const result = system.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      expect(result).toBeNull();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: 'insufficient-budget',
        })
      );

      system.destroy();
    });

    it('should throw if mission is already active', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      expect(() => {
        missionSystem.launchMission('iss-resupply', ['crew-3', 'crew-4']);
      }).toThrow('Mission is already active');
    });

    it('should throw if crewIds is not an array', () => {
      expect(() => {
        missionSystem.launchMission('iss-resupply', 'crew-1');
      }).toThrow('Crew IDs must be an array');
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

    it('should increment elapsed time for active mission', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      missionSystem.updateProgress(3600); // 1 hour

      const state = gameState.getState();
      const activeMission = state.missions.active[0];

      expect(activeMission.elapsed).toBe(3600);
    });

    it('should update multiple active missions', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);
      missionSystem.launchMission('satellite-deploy', ['crew-3', 'crew-4']);

      missionSystem.updateProgress(7200); // 2 hours

      const state = gameState.getState();
      expect(state.missions.active).toHaveLength(2);
      state.missions.active.forEach((mission) => {
        expect(mission.elapsed).toBe(7200);
      });
    });

    it('should complete mission when elapsed >= duration', () => {
      const mission = getMissionById('iss-resupply');
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      const durationInSeconds = mission.duration * 86400;
      missionSystem.updateProgress(durationInSeconds);

      const state = gameState.getState();
      expect(state.missions.active).toHaveLength(0);
      expect(state.missions.completed).toHaveLength(1);
    });

    it('should throw if deltaTime is not a number', () => {
      expect(() => {
        missionSystem.updateProgress('1000');
      }).toThrow();
    });

    it('should throw if deltaTime is negative', () => {
      expect(() => {
        missionSystem.updateProgress(-100);
      }).toThrow();
    });

    it('should handle zero deltaTime', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);
      missionSystem.updateProgress(0);

      const state = gameState.getState();
      const activeMission = state.missions.active[0];
      expect(activeMission.elapsed).toBe(0);
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

    it('should move mission from active to completed', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      const mission = getMissionById('iss-resupply');
      const durationInSeconds = mission.duration * 86400;
      missionSystem.updateProgress(durationInSeconds);

      const state = gameState.getState();
      expect(state.missions.active).toHaveLength(0);
      expect(state.missions.completed).toHaveLength(1);
      expect(state.missions.completed[0].missionId).toBe('iss-resupply');
    });

    it('should emit mission:completed event', () => {
      const callback = jest.fn();
      eventBus.subscribe('mission:completed', callback);

      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      const mission = getMissionById('iss-resupply');
      const durationInSeconds = mission.duration * 86400;
      missionSystem.updateProgress(durationInSeconds);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          missionId: 'iss-resupply',
          missionName: 'ISS Supply Mission',
          crewIds: ['crew-1', 'crew-2'],
          successRate: expect.any(Number),
        })
      );
    });

    it('should increase agency reputation on completion', () => {
      const initialState = gameState.getState();
      const initialReputation = initialState.agency.reputation;

      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      const mission = getMissionById('iss-resupply');
      const durationInSeconds = mission.duration * 86400;
      missionSystem.updateProgress(durationInSeconds);

      const updatedState = gameState.getState();
      expect(updatedState.agency.reputation).toBeGreaterThan(initialReputation);
    });

    it('should cap reputation at 100', () => {
      gameState.update('agency.reputation', 95);

      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      const mission = getMissionById('iss-resupply');
      const durationInSeconds = mission.duration * 86400;
      missionSystem.updateProgress(durationInSeconds);

      const updatedState = gameState.getState();
      expect(updatedState.agency.reputation).toBeLessThanOrEqual(100);
    });

    it('should throw if mission is not active', () => {
      expect(() => {
        missionSystem.completeMission('iss-resupply');
      }).toThrow('Mission not found in active missions');
    });

    it('should throw if missionId is invalid', () => {
      expect(() => {
        missionSystem.completeMission('');
      }).toThrow();
    });
  });

  describe('cancelMission', () => {
    it('should cancel an active mission', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      const result = missionSystem.cancelMission('iss-resupply');

      expect(result).toBeDefined();
      expect(result.missionId).toBe('iss-resupply');
    });

    it('should refund 50% of mission cost', () => {
      const mission = getMissionById('iss-resupply');
      const initialBalance = gameState.getState().budget.balance;

      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);
      const balanceAfterLaunch = gameState.getState().budget.balance;

      missionSystem.cancelMission('iss-resupply');
      const balanceAfterCancel = gameState.getState().budget.balance;

      const refund = Math.floor(mission.cost * 0.5);
      expect(balanceAfterCancel).toBe(balanceAfterLaunch + refund);
      expect(balanceAfterCancel).toBeLessThan(initialBalance);
    });

    it('should emit mission:cancelled event', () => {
      const callback = jest.fn();
      eventBus.subscribe('mission:cancelled', callback);

      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);
      missionSystem.cancelMission('iss-resupply');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          missionId: 'iss-resupply',
          missionName: 'ISS Supply Mission',
          refundAmount: expect.any(Number),
        })
      );
    });

    it('should return null if mission not found', () => {
      const result = missionSystem.cancelMission('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getActiveMission', () => {
    it('should return active mission by ID', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      const mission = missionSystem.getActiveMission('iss-resupply');

      expect(mission).toBeDefined();
      expect(mission.missionId).toBe('iss-resupply');
    });

    it('should return null for non-existent mission', () => {
      const mission = missionSystem.getActiveMission('nonexistent');
      expect(mission).toBeNull();
    });
  });

  describe('getActiveMissions', () => {
    it('should return empty array when no active missions', () => {
      const missions = missionSystem.getActiveMissions();
      expect(missions).toEqual([]);
    });

    it('should return all active missions', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);
      missionSystem.launchMission('satellite-deploy', ['crew-3', 'crew-4']);

      const missions = missionSystem.getActiveMissions();
      expect(missions).toHaveLength(2);
      expect(missions[0].missionId).toBe('iss-resupply');
      expect(missions[1].missionId).toBe('satellite-deploy');
    });
  });

  describe('isActiveMission', () => {
    it('should return true for active mission', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      expect(missionSystem.isActiveMission('iss-resupply')).toBe(true);
    });

    it('should return false for non-active mission', () => {
      expect(missionSystem.isActiveMission('iss-resupply')).toBe(false);
    });
  });

  describe('Event listener integration', () => {
    it('should handle mission:launch event', () => {
      eventBus.emit('mission:launch', {
        missionId: 'iss-resupply',
        crewIds: ['crew-1', 'crew-2'],
      });

      const state = gameState.getState();
      expect(state.missions.active).toHaveLength(1);
    });

    it('should emit mission:launch-failed on invalid event data', () => {
      const callback = jest.fn();
      eventBus.subscribe('mission:launch-failed', callback);

      eventBus.emit('mission:launch', {
        missionId: 'nonexistent',
        crewIds: ['crew-1', 'crew-2'],
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should handle game:tick event', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      eventBus.emit('game:tick', { deltaTime: 3600 });

      const state = gameState.getState();
      const activeMission = state.missions.active[0];
      expect(activeMission.elapsed).toBe(3600);
    });

    it('should handle game:tick with mission completion', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      const mission = getMissionById('iss-resupply');
      const durationInSeconds = mission.duration * 86400;

      eventBus.emit('game:tick', { deltaTime: durationInSeconds });

      const state = gameState.getState();
      expect(state.missions.active).toHaveLength(0);
      expect(state.missions.completed).toHaveLength(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple rapid mission launches', () => {
      const result1 = missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);
      const result2 = missionSystem.launchMission('satellite-deploy', ['crew-3', 'crew-4']);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();

      const state = gameState.getState();
      expect(state.missions.active).toHaveLength(2);
    });

    it('should maintain crew immutability on launch', () => {
      const crewIds = ['crew-1', 'crew-2'];
      const originalCrewIds = [...crewIds];

      const mission = missionSystem.launchMission('iss-resupply', crewIds);

      expect(crewIds).toEqual(originalCrewIds);
      expect(mission.crewIds).toEqual(crewIds);
    });

    it('should handle rapid progress updates', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      missionSystem.updateProgress(1000);
      missionSystem.updateProgress(1000);
      missionSystem.updateProgress(1000);

      const state = gameState.getState();
      const activeMission = state.missions.active[0];
      expect(activeMission.elapsed).toBe(3000);
    });

    it('should not affect completed missions in updateProgress', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);

      const mission = getMissionById('iss-resupply');
      const durationInSeconds = mission.duration * 86400;
      missionSystem.updateProgress(durationInSeconds);

      const completedBefore = gameState.getState().missions.completed.length;

      // Update progress again
      missionSystem.updateProgress(3600);

      const completedAfter = gameState.getState().missions.completed.length;
      expect(completedBefore).toBe(completedAfter);
    });
  });

  describe('destroy', () => {
    it('should unsubscribe from events on destroy', () => {
      const system = new MissionSystem(eventBus, gameState);

      const listenersBefore = eventBus.listenerCount('mission:launch');
      system.destroy();
      const listenersAfter = eventBus.listenerCount('mission:launch');

      expect(listenersAfter).toBeLessThan(listenersBefore);
    });

    it('should clear active missions on destroy', () => {
      missionSystem.launchMission('iss-resupply', ['crew-1', 'crew-2']);
      missionSystem.destroy();

      expect(missionSystem.getActiveMissions()).toHaveLength(0);
    });
  });
});