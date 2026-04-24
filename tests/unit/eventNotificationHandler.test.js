/**
 * Event Notification Handler Tests
 *
 * Tests for wiring EventSystem to UI event card display
 */

import { EventNotificationHandler } from "../../src/ui/EventNotificationHandler.js";
import EventBus from "../../src/game/EventBus.js";

describe("EventNotificationHandler", () => {
  let handler;
  let eventBus;

  beforeEach(() => {
    // Reset EventBus singleton
    EventBus.reset();
    eventBus = EventBus.getInstance();

    // Create handler
    handler = new EventNotificationHandler(eventBus);

    // Clean up event cards
    const container = document.getElementById("ui-event-card-container");
    if (container) {
      container.remove();
    }
  });

  afterEach(() => {
    // Teardown handler
    handler.teardown();

    // Reset EventBus
    EventBus.reset();

    // Clean up containers
    const container = document.getElementById("ui-event-card-container");
    if (container) {
      container.remove();
    }
  });

  describe("Initialization", () => {
    it("should initialize with EventBus", () => {
      expect(handler.eventBus).toBe(eventBus);
    });

    it("should have empty active events map", () => {
      expect(handler.getActiveEventCount()).toBe(0);
    });

    it("should subscribe to event:triggered", () => {
      const listeners = eventBus.getListeners("event:triggered");
      expect(listeners.length).toBeGreaterThan(0);
    });
  });

  describe("Event Display", () => {
    it("should display event card when event:triggered is emitted", (done) => {
      const eventData = {
        id: "test_event",
        title: "Test Event",
        description: "Test Description",
        choices: [
          { id: "choice1", text: "Accept", consequences: { budget: 0 } },
          {
            id: "choice2",
            text: "Decline",
            consequences: { budget: -1000 },
          },
        ],
      };

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        const card = document.getElementById("event-card-test_event");
        expect(card).not.toBeNull();
        expect(handler.getActiveEventCount()).toBe(1);
        done();
      });
    });

    it("should create event card with correct title", (done) => {
      const eventData = {
        id: "test_event",
        title: "Test Event Title",
        description: "Description",
        choices: [],
      };

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        const card = document.getElementById("event-card-test_event");
        const title = card.querySelector(".ui-event-card-title");
        expect(title.textContent).toBe("Test Event Title");
        done();
      });
    });

    it("should display event card with choices", (done) => {
      const eventData = {
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [
          { id: "choice1", text: "Option 1", consequences: { budget: 0 } },
          { id: "choice2", text: "Option 2", consequences: { budget: 0 } },
        ],
      };

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        const card = document.getElementById("event-card-test_event");
        const buttons = card.querySelectorAll("button");
        expect(buttons.length).toBe(2);
        expect(buttons[0].textContent).toBe("Option 1");
        expect(buttons[1].textContent).toBe("Option 2");
        done();
      });
    });

    it("should not duplicate event cards", (done) => {
      const eventData = {
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [],
      };

      eventBus.emit("event:triggered", eventData);
      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        expect(handler.getActiveEventCount()).toBe(1);
        done();
      });
    });

    it("should set event type to warning for negative budget", (done) => {
      const eventData = {
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [
          { id: "choice1", text: "Accept", consequences: { budget: -5000 } },
        ],
      };

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        const card = document.getElementById("event-card-test_event");
        expect(card.classList.contains("ui-event-card--warning")).toBe(true);
        done();
      });
    });

    it("should set event type to success for positive reputation", (done) => {
      const eventData = {
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [
          {
            id: "choice1",
            text: "Accept",
            consequences: { reputation: 25 },
          },
        ],
      };

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        const card = document.getElementById("event-card-test_event");
        expect(card.classList.contains("ui-event-card--success")).toBe(true);
        done();
      });
    });
  });

  describe("Choice Handling", () => {
    it("should emit event:resolve when choice is made", (done) => {
      const listener = jest.fn();
      eventBus.subscribe("event:resolve", listener);

      const eventData = {
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [
          { id: "choice1", text: "Accept", consequences: { budget: 0 } },
          { id: "choice2", text: "Decline", consequences: { budget: 0 } },
        ],
      };

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        const card = document.getElementById("event-card-test_event");
        const button = card.querySelector("button");
        button.click();

        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({
            eventId: "test_event",
            choiceIndex: 0,
          })
        );
        done();
      });
    });

    it("should remove event card after choice", (done) => {
      const eventData = {
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [
          { id: "choice1", text: "Accept", consequences: { budget: 0 } },
        ],
      };

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        const card = document.getElementById("event-card-test_event");
        const button = card.querySelector("button");
        button.click();

        setTimeout(() => {
          expect(handler.getActiveEventCount()).toBe(0);
          done();
        }, 350);
      });
    });

    it("should handle multiple events in sequence", (done) => {
      const listener = jest.fn();
      eventBus.subscribe("event:resolve", listener);

      const event1 = {
        id: "event1",
        title: "Event 1",
        description: "Test",
        choices: [{ id: "choice1", text: "Accept", consequences: { budget: 0 } }],
      };

      const event2 = {
        id: "event2",
        title: "Event 2",
        description: "Test",
        choices: [
          { id: "choice1", text: "Accept", consequences: { budget: 0 } },
        ],
      };

      eventBus.emit("event:triggered", event1);

      requestAnimationFrame(() => {
        expect(handler.getActiveEventCount()).toBe(1);

        const card1 = document.getElementById("event-card-event1");
        card1.querySelector("button").click();

        setTimeout(() => {
          expect(handler.getActiveEventCount()).toBe(0);

          eventBus.emit("event:triggered", event2);

          requestAnimationFrame(() => {
            expect(handler.getActiveEventCount()).toBe(1);
            const card2 = document.getElementById("event-card-event2");
            expect(card2).not.toBeNull();
            done();
          });
        }, 350);
      });
    });
  });

  describe("Teardown", () => {
    it("should unsubscribe from event:triggered", () => {
      handler.teardown();
      const listeners = eventBus.getListeners("event:triggered");
      expect(listeners.length).toBe(0);
    });

    it("should remove active event cards", (done) => {
      const eventData = {
        id: "test_event",
        title: "Test Event",
        description: "Test",
        choices: [],
      };

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        expect(handler.getActiveEventCount()).toBe(1);
        handler.teardown();

        setTimeout(() => {
          expect(handler.getActiveEventCount()).toBe(0);
          const card = document.getElementById("event-card-test_event");
          expect(card).toBeNull();
          done();
        }, 350);
      });
    });
  });

  describe("Integration with EventSystem", () => {
    it("should handle events from EventSystem", (done) => {
      const eventData = {
        id: "solar_flare_warning",
        title: "Solar Flare Warning",
        description: "Space Weather Center detected an incoming solar flare",
        choices: [
          { id: "action_satellites", text: "Take action", consequences: { budget: -15000000 } },
          { id: "accept_risk", text: "Accept risk", consequences: { reputation: -10 } },
        ],
      };

      const resolveListener = jest.fn();
      eventBus.subscribe("event:resolve", resolveListener);

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        const card = document.getElementById("event-card-solar_flare_warning");
        expect(card).not.toBeNull();

        const buttons = card.querySelectorAll("button");
        buttons[0].click();

        expect(resolveListener).toHaveBeenCalledWith(
          expect.objectContaining({
            eventId: "solar_flare_warning",
            choiceIndex: 0,
          })
        );
        done();
      });
    });

    it("should handle events with full consequences", (done) => {
      const eventData = {
        id: "tech_breakthrough",
        title: "Technology Breakthrough",
        description: "Revolutionary propulsion system",
        choices: [
          {
            id: "fast_track",
            text: "Fast-track development",
            consequences: { budget: -18000000, reputation: 30 },
          },
          {
            id: "cautious",
            text: "Cautious approach",
            consequences: { budget: -8000000, reputation: 15 },
          },
        ],
      };

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        const card = document.getElementById("event-card-tech_breakthrough");
        const buttons = card.querySelectorAll("button");

        buttons[0].click();

        setTimeout(() => {
          // Card should be removed after animation
          expect(handler.getActiveEventCount()).toBe(0);
          done();
        }, 350);
      });
    });
  });

  describe("Error Handling", () => {
    it("should warn on invalid event data", () => {
      const spy = jest.spyOn(console, "warn").mockImplementation();

      eventBus.emit("event:triggered", {});

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("should handle missing choices gracefully", (done) => {
      const eventData = {
        id: "test_event",
        title: "Test Event",
        description: "Test",
      };

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        const card = document.getElementById("event-card-test_event");
        expect(card).not.toBeNull();
        done();
      });
    });
  });
});
