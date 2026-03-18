/**
 * Event System Tests
 *
 * Test suite for EventSystem: random events, choices, consequences
 */

import EventSystem from "../../src/systems/EventSystem.js";

describe("EventSystem", () => {
  let system;
  let mockEventBus;
  let mockEventData;

  beforeEach(() => {
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
});
