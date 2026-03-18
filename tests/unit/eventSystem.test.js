/**
 * Event System Tests
 *
 * Comprehensive test suite for event triggering, presentation, and resolution
 */

import EventSystem from "../../src/systems/EventSystem.js";
import GameState from "../../src/game/GameState.js";
import EventBus from "../../src/game/EventBus.js";
import EVENTS from "../../src/data/events.js";

describe("EventSystem", () => {
  let eventSystem;
  let gameState;
  let eventBus;
  let system;
  let mockEventBus;
  let mockEventData;

  beforeEach(() => {
    // Reset EventBus singleton
    EventBus.reset();
    eventBus = EventBus.getInstance();

    // Create fresh GameState
    gameState = new GameState();

    // Create EventSystem instance
    eventSystem = new EventSystem(gameState);

    mockEventBus = {
      emit: jest.fn(),
    };
    mockEventData = {
      FUNDING_CUT: {
        id: "funding_cut",
        title: "Government Budget Reduction",
        description: "Congress votes to reduce space agency funding.",
        probability: 0.5, // High probability for testing
        choices: [
          {
            text: "Accept the cut",
            budgetDelta: -25_000_000,
            moraleDelta: -15,
          },
          {
            text: "Launch campaign",
            budgetDelta: -5_000_000,
            moraleDelta: 10,
          },
        ],
      },
      DISCOVERY: {
        id: "discovery",
        title: "Scientific Discovery",
        description: "One of our missions discovers something remarkable.",
        probability: 0.4,
        choices: [
          {
            text: "Publish immediately",
            budgetDelta: 20_000_000,
            moraleDelta: 15,
          },
        ],
      },
    };
    system = new EventSystem(mockEventBus, mockEventData);
  });

  afterEach(() => {
    // Cleanup
    eventSystem.teardown();
    EventBus.reset();
  });

  describe("checkForEvents", () => {
    it("should roll for random events", () => {
      const triggered = system.checkForEvents({});
      // With probabilities 0.5 and 0.4, we expect some events (but not guaranteed)
      expect(Array.isArray(triggered)).toBe(true);
    });

    it("should emit event:triggered for each event", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.2); // Ensure events trigger
      system.checkForEvents({});
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "event:triggered",
        expect.any(Object),
      );
      jest.restoreAllMocks();
    });

    it("should add events to active list", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.2);
      system.checkForEvents({});
      expect(system.state.active.length).toBeGreaterThan(0);
      jest.restoreAllMocks();
    });

    it("should set event properties correctly", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.2);
      system.checkForEvents({});
      const event = system.state.active[0];
      expect(event).toHaveProperty("id");
      expect(event).toHaveProperty("templateId");
      expect(event).toHaveProperty("title");
      expect(event).toHaveProperty("triggeredAt");
      jest.restoreAllMocks();
    });

    test("should return null when no event conditions are met", () => {
      // Set state to values that don't trigger any conditions
      gameState.update("agency.reputation", 20); // Below all reputation thresholds
      gameState.update("budget.balance", 50_000_000); // Below budget_audit threshold (100M)
      gameState.update("missions.active", []);
      gameState.update("research.active", null);
      gameState.update("crew.training", []);
      gameState.update("crew.roster", []);

      const state = gameState.getState();
      const event = eventSystem.checkForEvents(state);
      expect(event).toBeNull();
    });

    test("should return null when an event is already active", () => {
      eventSystem.activeEvent = { id: "test_event" };
      const state = gameState.getState();
      const event = eventSystem.checkForEvents(state);
      expect(event).toBeNull();
    });

    test("should trigger event when mission is active", () => {
      // Set up game state with active mission
      gameState.update("missions.active", [
        { id: "test_mission", name: "Test" },
      ]);

      const state = gameState.getState();
      const event = eventSystem.checkForEvents(state);

      // Should find an event that requires active missions
      expect(event).not.toBeNull();
      expect(event.id).toBeDefined();
      expect(event.choices).toBeDefined();
      expect(Array.isArray(event.choices)).toBe(true);
    });

    test("should not repeat recently triggered events", () => {
      const recentEventId = "solar_flare_warning";

      // Add event to history
      gameState.update("events.history", [
        {
          id: recentEventId,
          timestamp: Date.now(),
          chosenChoice: "action_satellites",
        },
      ]);

      // Set up state that would normally trigger that event
      gameState.update("missions.active", [
        { id: "test_mission", name: "Test" },
      ]);

      const state = gameState.getState();
      const event = eventSystem.checkForEvents(state);

      // If event is triggered, it should be different from recent one
      if (event) {
        expect(event.id).not.toBe(recentEventId);
      }
    });

    test("should return random event when multiple conditions are met", () => {
      // Set up state with multiple active conditions
      gameState.update("missions.active", [{ id: "test_mission" }]);
      gameState.update("research.active", { id: "test_research" });

      const state = gameState.getState();
      const event = eventSystem.checkForEvents(state);

      expect(event).not.toBeNull();
      expect(EVENTS.some((e) => e.id === event.id)).toBe(true);
    });
  });

  describe("presentEvent", () => {
    it("should emit event:triggered event", () => {
      const event = {
        id: "test_event",
        title: "Test Event",
        description: "Test",
      };
      system.presentEvent(event);
      expect(mockEventBus.emit).toHaveBeenCalledWith("event:triggered", {
        event,
      });
    });

    test("should add event to active events in game state", () => {
      const event = EVENTS[0];
      eventSystem.presentEvent(event);

      const state = gameState.getState();
      expect(state.events.active.length).toBe(1);
      expect(state.events.active[0].id).toBe(event.id);
      expect(state.events.active[0].title).toBe(event.title);
    });

    test("should set activeEvent property", () => {
      const event = EVENTS[0];
      eventSystem.presentEvent(event);

      expect(eventSystem.activeEvent).toBe(event);
    });

    test("should emit event:triggered event", () => {
      const event = EVENTS[0];
      const listener = jest.fn();
      eventBus.subscribe("event:triggered", listener);

      eventSystem.presentEvent(event);

      expect(listener).toHaveBeenCalledTimes(1);
      const eventData = listener.mock.calls[0][0];
      expect(eventData.id).toBe(event.id);
      expect(eventData.title).toBe(event.title);
      expect(eventData.choices).toBeDefined();
    });

    test("should include event choices in presentation", () => {
      const event = EVENTS[0];
      eventSystem.presentEvent(event);

      const state = gameState.getState();
      const activeEvent = state.events.active[0];

      expect(activeEvent.choices.length).toBe(event.choices.length);
      activeEvent.choices.forEach((choice, index) => {
        expect(choice.id).toBe(event.choices[index].id);
        expect(choice.text).toBe(event.choices[index].text);
      });
    });

    test("should not include consequences in state (only in event:triggered)", () => {
      const event = EVENTS[0];
      eventSystem.presentEvent(event);

      const state = gameState.getState();
      const activeEvent = state.events.active[0];

      // Consequences should not be in state's active event
      activeEvent.choices.forEach((choice) => {
        expect(choice.consequences).toBeUndefined();
      });
    });
  });

  describe("resolveEvent", () => {
    beforeEach(() => {
      const event = {
        id: "event_001",
        templateId: "funding_cut",
        title: "Budget Cut",
        description: "Budget reduction",
        choices: mockEventData.FUNDING_CUT.choices,
        triggeredAt: Date.now(),
      };
      system.state.active.push(event);
      mockEventBus.emit.mockClear();
    });

    it("should apply budget consequences from choice", () => {
      system.resolveEvent("event_001", 0);
      expect(mockEventBus.emit).toHaveBeenCalledWith("budget:deduct", {
        amount: 25_000_000,
      });
    });

    it("should apply morale consequences from choice", () => {
      system.resolveEvent("event_001", 0);
      expect(mockEventBus.emit).toHaveBeenCalledWith("crew:morale-adjust", {
        delta: -15,
      });
    });

    it("should move event to history", () => {
      system.resolveEvent("event_001", 0);
      expect(system.state.active.length).toBe(0);
      expect(system.state.history.length).toBe(1);
    });

    it("should emit event:resolved event", () => {
      system.resolveEvent("event_001", 0);
      expect(mockEventBus.emit).toHaveBeenCalledWith("event:resolved", {
        eventId: "event_001",
        choiceIndex: 0,
      });
    });

    it("should handle positive budget delta", () => {
      const event = {
        id: "event_002",
        templateId: "discovery",
        title: "Discovery",
        description: "Scientific discovery",
        choices: mockEventData.DISCOVERY.choices,
        triggeredAt: Date.now(),
      };
      system.state.active.push(event);
      mockEventBus.emit.mockClear();

      system.resolveEvent("event_002", 0);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "budget:add-income",
        expect.any(Object),
      );
    });

    it("should handle non-existent event gracefully", () => {
      const initialLength = system.state.active.length;
      system.resolveEvent("nonexistent", 0);
      expect(system.state.active.length).toBe(initialLength);
      expect(system.state.history.length).toBe(0);
    });

    it("should record choice in history", () => {
      system.resolveEvent("event_001", 1);
      expect(system.state.history[0].choiceIndex).toBe(1);
    });

    test("should apply budget consequences to game state", () => {
      const event = EVENTS.find((e) =>
        e.choices.some((c) => c.consequences.budget !== 0),
      );
      const choiceIndex = event.choices.findIndex(
        (c) => c.consequences.budget !== 0,
      );

      const initialBalance = gameState.getState().budget.balance;
      const expectedChange = event.choices[choiceIndex].consequences.budget;

      eventSystem.resolveEvent(event.id, choiceIndex);

      const newBalance = gameState.getState().budget.balance;
      expect(newBalance).toBe(initialBalance + expectedChange);
    });

    test("should apply reputation consequences to game state", () => {
      const event = EVENTS.find((e) =>
        e.choices.some((c) => c.consequences.reputation !== 0),
      );
      const choiceIndex = event.choices.findIndex(
        (c) => c.consequences.reputation !== 0,
      );

      const initialReputation = gameState.getState().agency.reputation;
      const expectedChange = event.choices[choiceIndex].consequences.reputation;

      eventSystem.resolveEvent(event.id, choiceIndex);

      const newReputation = gameState.getState().agency.reputation;
      expect(newReputation).toBe(
        Math.min(100, Math.max(0, initialReputation + expectedChange)),
      );
    });

    test("should add event to history", () => {
      const event = EVENTS[0];
      const choiceIndex = 0;

      eventSystem.resolveEvent(event.id, choiceIndex);

      const state = gameState.getState();
      expect(state.events.history.length).toBe(1);
      expect(state.events.history[0].id).toBe(event.id);
      expect(state.events.history[0].chosenChoice).toBe(
        event.choices[choiceIndex].id,
      );
    });

    test("should remove event from active events", () => {
      const event = EVENTS[0];
      eventSystem.presentEvent(event);

      expect(gameState.getState().events.active.length).toBe(1);

      eventSystem.resolveEvent(event.id, 0);

      expect(gameState.getState().events.active.length).toBe(0);
    });

    test("should emit event:resolved event", () => {
      const event = EVENTS[0];
      const listener = jest.fn();
      eventBus.subscribe("event:resolved", listener);

      eventSystem.resolveEvent(event.id, 0);

      expect(listener).toHaveBeenCalledTimes(1);
      const eventData = listener.mock.calls[0][0];
      expect(eventData.eventId).toBe(event.id);
      expect(eventData.choiceId).toBe(event.choices[0].id);
      expect(eventData.consequences).toBeDefined();
    });

    test("should emit state:changed event", () => {
      const event = EVENTS[0];
      const listener = jest.fn();
      eventBus.subscribe("state:changed", listener);

      eventSystem.resolveEvent(event.id, 0);

      expect(listener).toHaveBeenCalledTimes(1);
      const eventData = listener.mock.calls[0][0];
      expect(eventData.changedPaths).toBeDefined();
      expect(Array.isArray(eventData.changedPaths)).toBe(true);
    });

    test("should clear activeEvent after resolution", () => {
      const event = EVENTS[0];
      eventSystem.presentEvent(event);
      expect(eventSystem.activeEvent).not.toBeNull();

      eventSystem.resolveEvent(event.id, 0);
      expect(eventSystem.activeEvent).toBeNull();
    });

    test("should prevent negative budget", () => {
      const lowBudgetState = new GameState();
      lowBudgetState.update("budget.balance", 1_000_000);

      const eventSystem2 = new EventSystem(lowBudgetState);
      const event = EVENTS.find((e) =>
        e.choices.some((c) => c.consequences.budget < -5_000_000),
      );

      if (event) {
        const largeNegativeIndex = event.choices.findIndex(
          (c) => c.consequences.budget < -5_000_000,
        );
        eventSystem2.resolveEvent(event.id, largeNegativeIndex);

        const state = lowBudgetState.getState();
        expect(state.budget.balance).toBeGreaterThanOrEqual(0);
      }

      eventSystem2.teardown();
    });

    test("should cap reputation between 0 and 100", () => {
      const highRepState = new GameState();
      highRepState.update("agency.reputation", 90);

      const eventSystem2 = new EventSystem(highRepState);
      const event = EVENTS.find((e) =>
        e.choices.some((c) => c.consequences.reputation > 15),
      );

      if (event) {
        const highRepIndex = event.choices.findIndex(
          (c) => c.consequences.reputation > 15,
        );
        eventSystem2.resolveEvent(event.id, highRepIndex);

        const state = highRepState.getState();
        expect(state.agency.reputation).toBeLessThanOrEqual(100);
      }

      eventSystem2.teardown();
    });

    test("should handle invalid event ID gracefully", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      eventSystem.resolveEvent("invalid_event_id", 0);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test("should handle invalid choice index gracefully", () => {
      const event = EVENTS[0];
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      eventSystem.resolveEvent(event.id, 999);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getHistory", () => {
    beforeEach(() => {
      const event = {
        id: "event_001",
        templateId: "funding_cut",
        title: "Budget Cut",
        choices: mockEventData.FUNDING_CUT.choices,
        triggeredAt: Date.now(),
      };
      system.state.active.push(event);
    });

    it("should return event history", () => {
      system.resolveEvent("event_001", 0);
      const history = system.getHistory();
      expect(history.length).toBe(1);
    });

    it("should return copy of history (not reference)", () => {
      system.resolveEvent("event_001", 0);
      const history = system.getHistory();
      history[0].title = "Modified";
      expect(system.state.history[0].title).toBe("Budget Cut");
    });

    it("should return empty array initially", () => {
      system.state.active = [];
      const history = system.getHistory();
      expect(history).toEqual([]);
    });
  });

  describe("Event Listeners", () => {
    test("should handle game:tick event", () => {
      const spy = jest.spyOn(eventSystem, "checkForEvents");

      // Set up conditions for event to trigger
      gameState.update("missions.active", [{ id: "test_mission" }]);

      // Emit game:tick
      eventBus.emit("game:tick", {});

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    test("should handle event:resolve event", () => {
      const spy = jest.spyOn(eventSystem, "resolveEvent");
      const event = EVENTS[0];

      // Present an event first
      eventSystem.presentEvent(event);

      // Emit event:resolve
      eventBus.emit("event:resolve", { eventId: event.id, choiceIndex: 0 });

      expect(spy).toHaveBeenCalledWith(event.id, 0);
      spy.mockRestore();
    });

    test("should setup listeners on initialization", () => {
      const listeners = eventBus.getListeners("game:tick");
      expect(listeners.length).toBeGreaterThan(0);

      const listeners2 = eventBus.getListeners("event:resolve");
      expect(listeners2.length).toBeGreaterThan(0);
    });

    test("should teardown listeners correctly", () => {
      eventSystem.teardown();

      const listeners = eventBus.getListeners("game:tick");
      expect(listeners.length).toBe(0);

      const listeners2 = eventBus.getListeners("event:resolve");
      expect(listeners2.length).toBe(0);
    });
  });

  describe("Event Data", () => {
    test("should have at least 15 events", () => {
      expect(EVENTS.length).toBeGreaterThanOrEqual(15);
    });

    test("each event should have required properties", () => {
      EVENTS.forEach((event) => {
        expect(event.id).toBeDefined();
        expect(typeof event.id).toBe("string");
        expect(event.title).toBeDefined();
        expect(typeof event.title).toBe("string");
        expect(event.description).toBeDefined();
        expect(typeof event.description).toBe("string");
        expect(event.condition).toBeDefined();
        expect(typeof event.condition).toBe("function");
        expect(event.choices).toBeDefined();
        expect(Array.isArray(event.choices)).toBe(true);
        expect(event.choices.length).toBeGreaterThan(0);
      });
    });

    test("each choice should have required properties", () => {
      EVENTS.forEach((event) => {
        event.choices.forEach((choice) => {
          expect(choice.id).toBeDefined();
          expect(typeof choice.id).toBe("string");
          expect(choice.text).toBeDefined();
          expect(typeof choice.text).toBe("string");
          expect(choice.consequences).toBeDefined();
          expect(typeof choice.consequences).toBe("object");
        });
      });
    });

    test("each choice should have budget or reputation consequences", () => {
      EVENTS.forEach((event) => {
        event.choices.forEach((choice) => {
          const hasBudget = "budget" in choice.consequences;
          const hasReputation = "reputation" in choice.consequences;
          expect(hasBudget || hasReputation).toBe(true);
        });
      });
    });
  });

  describe("Utility Methods", () => {
    test("getActiveEvent should return active event", () => {
      const event = EVENTS[0];
      eventSystem.presentEvent(event);

      const activeEvent = eventSystem.getActiveEvent();
      expect(activeEvent).toBe(event);
    });

    test("getActiveEvent should return null when no event is active", () => {
      const activeEvent = eventSystem.getActiveEvent();
      expect(activeEvent).toBeNull();
    });

    test("triggerEventById should present specific event", () => {
      const event = EVENTS[2];
      const listener = jest.fn();
      eventBus.subscribe("event:triggered", listener);

      eventSystem.triggerEventById(event.id);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(eventSystem.getActiveEvent().id).toBe(event.id);
    });

    test("getAllEvents should return all events", () => {
      const allEvents = eventSystem.getAllEvents();
      expect(allEvents.length).toBe(EVENTS.length);
    });
  });

  describe("Integration Tests", () => {
    test("should complete full event cycle: trigger -> resolve", () => {
      // Set up conditions for event
      gameState.update("missions.active", [{ id: "test_mission" }]);

      // Trigger through game:tick
      eventBus.emit("game:tick", {});

      const state1 = gameState.getState();
      expect(state1.events.active.length).toBe(1);

      const eventId = eventSystem.getActiveEvent().id;
      const initialBalance = state1.budget.balance;

      // Resolve through event:resolve
      eventBus.emit("event:resolve", { eventId, choiceIndex: 0 });

      const state2 = gameState.getState();
      expect(state2.events.active.length).toBe(0);
      expect(state2.events.history.length).toBe(1);
    });

    test("should maintain event history across multiple events", () => {
      const event1 = EVENTS[0];
      const event2 = EVENTS[1];

      eventSystem.resolveEvent(event1.id, 0);
      eventSystem.resolveEvent(event2.id, 0);

      const state = gameState.getState();
      expect(state.events.history.length).toBe(2);
      expect(state.events.history[0].id).toBe(event1.id);
      expect(state.events.history[1].id).toBe(event2.id);
    });

    test("should apply cumulative consequences from multiple events", () => {
      const initialBalance = gameState.getState().budget.balance;

      // Resolve two budget-affecting events
      const event1 = EVENTS.find((e) =>
        e.choices.some((c) => c.consequences.budget > 0),
      );
      const event2 = EVENTS.find(
        (e) =>
          e.id !== event1.id &&
          e.choices.some((c) => c.consequences.budget > 0),
      );

      const choice1Index = event1.choices.findIndex(
        (c) => c.consequences.budget > 0,
      );
      const choice2Index = event2.choices.findIndex(
        (c) => c.consequences.budget > 0,
      );

      eventSystem.resolveEvent(event1.id, choice1Index);
      eventSystem.resolveEvent(event2.id, choice2Index);

      const finalBalance = gameState.getState().budget.balance;
      const totalChange =
        event1.choices[choice1Index].consequences.budget +
        event2.choices[choice2Index].consequences.budget;

      expect(finalBalance).toBe(initialBalance + totalChange);
    });
  });
});