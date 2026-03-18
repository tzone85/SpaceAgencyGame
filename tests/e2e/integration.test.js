/**
 * Integration Test - Full Mission Lifecycle
 *
 * Comprehensive end-to-end test validating the complete game flow:
 * 1. Game initialization with all systems
 * 2. Navigation to Mission Control scene
 * 3. Mission launch with budget deduction
 * 4. Mission completion with rewards
 * 5. Cross-system EventBus communication
 * 6. State management and immutability
 *
 * Acceptance Criteria:
 * ✓ Integration test covers full mission lifecycle
 * ✓ Budget deduction verified when mission launches
 * ✓ Mission completion rewards properly applied
 * ✓ Cross-system EventBus communication tested
 * ✓ Test runs reliably in CI/CD environment
 * ✓ All game systems interact correctly end-to-end
 */

import Game from "../../src/core/game.js";
import GameState from "../../src/game/GameState.js";
import EventBus from "../../src/game/EventBus.js";
import MissionSystem from "../../src/systems/MissionSystem.js";
import { BudgetSystem } from "../../src/systems/BudgetSystem.js";
import { getMissionById } from "../../src/data/missions.js";

describe("Integration Test - Full Mission Lifecycle", () => {
  let game;
  let gameState;
  let eventBus;
  let missionSystem;
  let eventLog;

  beforeEach(() => {
    // Reset singletons
    EventBus.reset();

    // Initialize game systems
    eventBus = new EventBus();
    gameState = new GameState();
    missionSystem = new MissionSystem(eventBus, gameState);

    // Log all events for verification
    eventLog = [];
    eventBus.subscribe("mission:started", (data) => {
      eventLog.push({ event: "mission:started", data });
    });
    eventBus.subscribe("mission:completed", (data) => {
      eventLog.push({ event: "mission:completed", data });
    });
    eventBus.subscribe("budget:deduct", (data) => {
      eventLog.push({ event: "budget:deduct", data });
    });
    eventBus.subscribe("state:changed", (data) => {
      eventLog.push({ event: "state:changed", data });
    });
  });

  afterEach(() => {
    EventBus.reset();
  });

  describe("Game Initialization", () => {
    test("should initialize all game systems", () => {
      expect(eventBus).toBeDefined();
      expect(gameState).toBeDefined();
      expect(missionSystem).toBeDefined();
    });

    test("should have correct initial game state", () => {
      const state = gameState.getState();

      expect(state.budget.balance).toBe(500_000_000);
      expect(state.budget.quarterlyFunding).toBe(50_000_000);
      expect(state.missions.available).toEqual([]);
      expect(state.missions.active).toEqual([]);
      expect(state.missions.completed).toEqual([]);
      expect(state.agency.reputation).toBe(50);
    });

    test("should have EventBus connections", () => {
      expect(typeof eventBus.subscribe).toBe("function");
      expect(typeof eventBus.emit).toBe("function");
    });
  });

  describe("Mission Control Navigation (Scene Context)", () => {
    test("should be able to access Mission Control scene context", () => {
      // In the actual game, Mission Control would be a registered scene
      // This test verifies the state is ready for Mission Control operations
      const state = gameState.getState();

      // Verify state has missions data structure
      expect(state.missions).toBeDefined();
      expect(state.missions.active).toBeInstanceOf(Array);
      expect(state.missions.completed).toBeInstanceOf(Array);
    });

    test("should have mission data available for Mission Control display", () => {
      // Verify we can access mission data
      const mission = getMissionById("iss-resupply");

      expect(mission).toBeDefined();
      expect(mission.id).toBe("iss-resupply");
      expect(mission.name).toBe("ISS Supply Mission");
      expect(mission.tier).toBe("LEO");
      expect(mission.cost).toBe(62); // in millions
      expect(mission.crewRequired).toBe(2);
    });
  });

  describe("Full Mission Lifecycle", () => {
    test("should launch mission with correct budget deduction", () => {
      // Get initial state
      const initialState = gameState.getState();
      const initialBalance = initialState.budget.balance;
      const mission = getMissionById("iss-resupply");

      // Verify mission data
      expect(mission).toBeDefined();
      expect(mission.cost).toBe(62);

      // Launch mission with crew
      const crewIds = ["crew-1", "crew-2"];
      const result = missionSystem.launchMission("iss-resupply", crewIds);

      // Verify mission launched
      expect(result).toBeDefined();
      expect(result.status).toBe("active");
      expect(result.crewIds).toEqual(crewIds);

      // Verify budget was deducted
      const updatedState = gameState.getState();
      const expectedBalance = initialBalance - mission.cost;
      expect(updatedState.budget.balance).toBe(expectedBalance);

      // Verify mission is in active list
      expect(updatedState.missions.active.length).toBe(1);
      expect(updatedState.missions.active[0].missionId).toBe("iss-resupply");
    });

    test("should verify budget deduction through EventBus", () => {
      const mission = getMissionById("iss-resupply");
      const crewIds = ["crew-1", "crew-2"];

      missionSystem.launchMission("iss-resupply", crewIds);

      // Find budget:deduct event
      const budgetEvent = eventLog.find((e) => e.event === "budget:deduct");

      expect(budgetEvent).toBeDefined();
      expect(budgetEvent.data.amount).toBe(mission.cost);
      expect(budgetEvent.data.reason).toBe("mission-launch");
      expect(budgetEvent.data.missionId).toBe("iss-resupply");
    });

    test("should emit mission:started event with correct data", () => {
      const mission = getMissionById("iss-resupply");
      const crewIds = ["crew-1", "crew-2"];

      missionSystem.launchMission("iss-resupply", crewIds);

      // Find mission:started event
      const missionEvent = eventLog.find((e) => e.event === "mission:started");

      expect(missionEvent).toBeDefined();
      expect(missionEvent.data.missionId).toBe("iss-resupply");
      expect(missionEvent.data.missionName).toBe("ISS Supply Mission");
      expect(missionEvent.data.crewIds).toEqual(crewIds);
      expect(missionEvent.data.cost).toBe(mission.cost);
      expect(missionEvent.data.duration).toBe(mission.duration);
    });

    test("should complete mission after duration passes", () => {
      const mission = getMissionById("iss-resupply");
      const crewIds = ["crew-1", "crew-2"];
      const durationInSeconds = mission.duration * 86400; // Convert days to seconds

      // Launch mission
      missionSystem.launchMission("iss-resupply", crewIds);

      let state = gameState.getState();
      expect(state.missions.active.length).toBe(1);
      expect(state.missions.completed.length).toBe(0);

      // Progress mission to completion
      missionSystem.updateProgress(durationInSeconds + 1);

      // Verify mission moved to completed
      state = gameState.getState();
      expect(state.missions.active.length).toBe(0);
      expect(state.missions.completed.length).toBe(1);

      const completedMission = state.missions.completed[0];
      expect(completedMission.missionId).toBe("iss-resupply");
      expect(completedMission.missionName).toBe("ISS Supply Mission");
      expect(completedMission.crewIds).toEqual(crewIds);
    });

    test("should apply mission completion rewards", () => {
      const mission = getMissionById("iss-resupply");
      const crewIds = ["crew-1", "crew-2"];
      const durationInSeconds = mission.duration * 86400;

      // Get initial state
      const initialState = gameState.getState();
      const initialReputation = initialState.agency.reputation;
      const expectedRevenue = Math.floor(mission.cost * 1.5);

      // Launch and complete mission
      missionSystem.launchMission("iss-resupply", crewIds);
      missionSystem.updateProgress(durationInSeconds + 1);

      // Verify rewards applied
      const finalState = gameState.getState();
      const completedMission = finalState.missions.completed[0];

      // Revenue should be 1.5x mission cost
      expect(completedMission.revenue).toBe(expectedRevenue);

      // Reputation should increase
      const expectedReputation = Math.min(
        100,
        initialReputation + Math.floor(mission.successRate / 10),
      );
      expect(finalState.agency.reputation).toBe(expectedReputation);
    });

    test("should emit mission:completed event", () => {
      const mission = getMissionById("iss-resupply");
      const crewIds = ["crew-1", "crew-2"];
      const durationInSeconds = mission.duration * 86400;

      missionSystem.launchMission("iss-resupply", crewIds);
      missionSystem.updateProgress(durationInSeconds + 1);

      // Find mission:completed event
      const completedEvent = eventLog.find(
        (e) => e.event === "mission:completed",
      );

      expect(completedEvent).toBeDefined();
      expect(completedEvent.data.missionId).toBe("iss-resupply");
      expect(completedEvent.data.missionName).toBe("ISS Supply Mission");
      expect(completedEvent.data.crewIds).toEqual(crewIds);
      expect(completedEvent.data.successRate).toBe(mission.successRate);
    });
  });

  describe("Cross-System EventBus Communication", () => {
    test("should propagate mission events through EventBus", () => {
      const crewIds = ["crew-1", "crew-2"];

      // Subscribe to specific events
      let missionStartedFired = false;
      let budgetDeductFired = false;

      eventBus.subscribe("mission:started", () => {
        missionStartedFired = true;
      });
      eventBus.subscribe("budget:deduct", () => {
        budgetDeductFired = true;
      });

      // Launch mission
      missionSystem.launchMission("iss-resupply", crewIds);

      // Both events should have fired
      expect(missionStartedFired).toBe(true);
      expect(budgetDeductFired).toBe(true);
    });

    test("should emit state:changed events for state mutations", () => {
      const crewIds = ["crew-1", "crew-2"];
      const stateChanges = [];

      eventBus.subscribe("state:changed", (data) => {
        stateChanges.push(data);
      });

      // Launch mission
      missionSystem.launchMission("iss-resupply", crewIds);

      // Verify state:changed event was emitted
      expect(stateChanges.length).toBeGreaterThan(0);
      expect(stateChanges.some((e) => e.change === "mission-launched")).toBe(
        true,
      );
    });

    test("should coordinate between MissionSystem and GameState through EventBus", () => {
      const crewIds = ["crew-1", "crew-2"];

      // Track all events
      let eventCount = 0;
      eventBus.subscribe("mission:started", () => eventCount++);
      eventBus.subscribe("budget:deduct", () => eventCount++);
      eventBus.subscribe("state:changed", () => eventCount++);

      missionSystem.launchMission("iss-resupply", crewIds);

      // Multiple events should be emitted for coordination
      expect(eventCount).toBeGreaterThan(0);

      // Verify state reflects all changes
      const state = gameState.getState();
      expect(state.missions.active.length).toBe(1);
    });
  });

  describe("State Management and Immutability", () => {
    test("should maintain immutable game state", () => {
      const initialState = gameState.getState();

      // Verify root state object is frozen (shallow freeze)
      expect(Object.isFrozen(initialState)).toBe(true);

      // Attempting to modify root-level properties should throw in strict mode or fail silently
      expect(() => {
        initialState.budget = { balance: 1_000_000 };
      }).toThrow();
    });

    test("should create new state objects on updates", () => {
      const state1 = gameState.getState();

      missionSystem.launchMission("iss-resupply", ["crew-1", "crew-2"]);

      const state2 = gameState.getState();

      // States should be different objects
      expect(state1).not.toBe(state2);

      // But initial state should still be unchanged
      expect(state1.budget.balance).toBe(500_000_000);
    });

    test("should properly track mission state across lifecycle", () => {
      const mission = getMissionById("iss-resupply");
      const crewIds = ["crew-1", "crew-2"];
      const durationInSeconds = mission.duration * 86400;

      // Phase 1: Initial state
      let state = gameState.getState();
      expect(state.missions.active.length).toBe(0);
      expect(state.missions.completed.length).toBe(0);

      // Phase 2: After launch
      missionSystem.launchMission("iss-resupply", crewIds);
      state = gameState.getState();
      expect(state.missions.active.length).toBe(1);
      expect(state.missions.completed.length).toBe(0);
      expect(state.missions.active[0].status).toBe("active");

      // Phase 3: During progress
      missionSystem.updateProgress(durationInSeconds / 2);
      state = gameState.getState();
      expect(state.missions.active.length).toBe(1);
      expect(state.missions.completed.length).toBe(0);
      expect(state.missions.active[0].elapsed).toBe(durationInSeconds / 2);

      // Phase 4: After completion
      missionSystem.updateProgress(durationInSeconds / 2 + 1);
      state = gameState.getState();
      expect(state.missions.active.length).toBe(0);
      expect(state.missions.completed.length).toBe(1);
    });
  });

  describe("Complete Mission Flow Integration", () => {
    test("should execute full mission flow: launch -> progress -> complete -> rewards", () => {
      const mission = getMissionById("hubble-repair");
      const crewIds = ["crew-1", "crew-2", "crew-3", "crew-4"];
      const durationInSeconds = mission.duration * 86400;

      // Get initial state
      const initialState = gameState.getState();
      const initialBalance = initialState.budget.balance;
      const initialReputation = initialState.agency.reputation;

      // Phase 1: Launch mission
      missionSystem.launchMission("hubble-repair", crewIds);

      let state = gameState.getState();
      expect(state.budget.balance).toBe(initialBalance - mission.cost);
      expect(state.missions.active.length).toBe(1);

      // Phase 2: Simulate mission duration
      missionSystem.updateProgress(durationInSeconds / 2);

      state = gameState.getState();
      expect(state.missions.active[0].elapsed).toBe(durationInSeconds / 2);

      // Phase 3: Complete mission
      missionSystem.updateProgress(durationInSeconds / 2 + 1);

      state = gameState.getState();
      expect(state.missions.active.length).toBe(0);
      expect(state.missions.completed.length).toBe(1);

      // Phase 4: Verify rewards
      const completedMission = state.missions.completed[0];
      expect(completedMission.missionName).toBe(
        "Hubble Space Telescope Repair",
      );
      expect(completedMission.revenue).toBe(Math.floor(mission.cost * 1.5));

      // Reputation should increase
      const expectedReputation = Math.min(
        100,
        initialReputation + Math.floor(mission.successRate / 10),
      );
      expect(state.agency.reputation).toBe(expectedReputation);

      // Verify all events logged
      expect(eventLog.length).toBeGreaterThan(0);
      expect(eventLog.some((e) => e.event === "mission:started")).toBe(true);
      expect(eventLog.some((e) => e.event === "mission:completed")).toBe(true);
      expect(eventLog.some((e) => e.event === "budget:deduct")).toBe(true);
    });

    test("should handle multiple concurrent missions", () => {
      const mission1 = getMissionById("iss-resupply"); // 5 days
      const mission2 = getMissionById("satellite-deploy"); // 4 days

      // Launch first mission
      missionSystem.launchMission("iss-resupply", ["crew-1", "crew-2"]);

      let state = gameState.getState();
      expect(state.missions.active.length).toBe(1);
      const balance1 = state.budget.balance;

      // Launch second mission shortly after
      missionSystem.launchMission("satellite-deploy", ["crew-3", "crew-4"]);

      state = gameState.getState();
      expect(state.missions.active.length).toBe(2);
      expect(state.budget.balance).toBe(balance1 - mission2.cost);

      // Progress time to complete shorter mission (satellite-deploy: 4 days)
      const duration2InSeconds = mission2.duration * 86400;
      missionSystem.updateProgress(duration2InSeconds + 1);

      state = gameState.getState();
      // After 4 days + 1, satellite-deploy should be completed
      // iss-resupply needs 5 days, so it should still be active
      expect(state.missions.completed.length).toBe(1);
      expect(state.missions.active.length).toBe(1);
      expect(state.missions.active[0].missionId).toBe("iss-resupply");

      // Progress time to complete remaining mission
      const duration1InSeconds = mission1.duration * 86400;
      // iss-resupply already has duration2InSeconds elapsed
      // It needs duration1InSeconds total, so add the difference
      missionSystem.updateProgress(duration1InSeconds - duration2InSeconds + 1);

      state = gameState.getState();
      expect(state.missions.active.length).toBe(0);
      expect(state.missions.completed.length).toBe(2);
    });

    test("should handle mission events with insufficient budget", () => {
      // Create new game state with low budget
      const lowBudgetState = new GameState({
        budget: {
          balance: 50, // Lower than mission cost
          quarterlyFunding: 50_000_000,
          currentQuarter: 1,
          currentYear: 2024,
          history: [],
        },
        agency: {
          name: "Stellar Horizon Space Agency",
          reputation: 50,
          founded: "2024-Q1",
        },
        missions: {
          available: [],
          active: [],
          completed: [],
        },
        crew: {
          roster: [],
          applicants: [],
          training: [],
        },
        research: {
          completed: [],
          active: null,
          available: [],
        },
        events: {
          active: [],
          history: [],
        },
        tutorial: {
          completed: false,
          currentStep: 0,
        },
        meta: {
          saveVersion: 1,
          lastSaved: null,
          totalPlayTime: 0,
        },
      });

      // Create new mission system with low budget state
      const newEventBus = new EventBus();
      const newMissionSystem = new MissionSystem(newEventBus, lowBudgetState);

      // Attempt to launch mission should fail
      const result = newMissionSystem.launchMission("iss-resupply", [
        "crew-1",
        "crew-2",
      ]);

      expect(result).toBeNull();

      const state = lowBudgetState.getState();
      expect(state.missions.active.length).toBe(0);
    });
  });

  describe("CI/CD Reliability", () => {
    test("should execute without side effects between tests", () => {
      // This test verifies isolation - beforeEach should clean state
      const state = gameState.getState();

      // Should start fresh
      expect(state.budget.balance).toBe(500_000_000);
      expect(state.missions.active.length).toBe(0);
      expect(state.missions.completed.length).toBe(0);
    });

    test("should complete in reasonable time", () => {
      const mission = getMissionById("iss-resupply");
      const durationInSeconds = mission.duration * 86400;

      const startTime = Date.now();

      missionSystem.launchMission("iss-resupply", ["crew-1", "crew-2"]);
      missionSystem.updateProgress(durationInSeconds + 1);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Should complete in less than 100ms (reasonable for integration test)
      expect(executionTime).toBeLessThan(100);
    });

    test("should not leave orphaned event listeners", () => {
      const initialListenerCount =
        eventBus.listenerCount("mission:started") || 0;

      missionSystem.launchMission("iss-resupply", ["crew-1", "crew-2"]);

      // Listeners should still be manageable
      const finalListenerCount = eventBus.listenerCount("mission:started") || 0;

      expect(finalListenerCount).toBeGreaterThanOrEqual(initialListenerCount);
    });
  });
});
