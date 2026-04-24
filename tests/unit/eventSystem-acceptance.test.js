/**
 * Event System - Acceptance Criteria Tests
 *
 * Verifies story 01KPZATK-s-007 acceptance criteria:
 * - Random events trigger during gameplay
 * - Events affect budget/crew/missions/research
 * - Notification system shows events with player choices
 */

import EventSystem from "../../src/systems/EventSystem.js";
import { EventNotificationHandler } from "../../src/ui/EventNotificationHandler.js";
import GameState from "../../src/game/GameState.js";
import EventBus from "../../src/game/EventBus.js";
import EVENTS from "../../src/data/events.js";

describe("Story 01KPZATK-s-007 - Event System Acceptance Criteria", () => {
  let eventSystem;
  let notificationHandler;
  let gameState;
  let eventBus;

  beforeEach(() => {
    EventBus.reset();
    eventBus = EventBus.getInstance();
    gameState = new GameState();
    eventSystem = new EventSystem(gameState);
    notificationHandler = new EventNotificationHandler(eventBus);

    const container = document.getElementById("ui-event-card-container");
    if (container) {
      container.remove();
    }
  });

  afterEach(() => {
    eventSystem.teardown();
    notificationHandler.teardown();
    EventBus.reset();

    const container = document.getElementById("ui-event-card-container");
    if (container) {
      container.remove();
    }
  });

  describe("Acceptance Criterion 1: Random events trigger during gameplay", () => {
    it("should have 15-20 events defined", () => {
      expect(EVENTS.length).toBeGreaterThanOrEqual(15);
      expect(EVENTS.length).toBeLessThanOrEqual(20);
    });

    it("should trigger events when game conditions are met", () => {
      // Set conditions that trigger multiple events
      gameState.update("missions.active", [{ id: "test_mission" }]);

      const triggeredEvent = eventSystem.checkForEvents(gameState.getState());

      expect(triggeredEvent).not.toBeNull();
      expect(triggeredEvent.id).toBeDefined();
      expect(triggeredEvent.title).toBeDefined();
    });

    it("should trigger events randomly based on conditions", () => {
      // Multiple conditions
      gameState.update("missions.active", [{ id: "mission1" }]);
      gameState.update("research.active", { id: "research1" });
      gameState.update("agency.reputation", 75);

      const eventIds = new Set();

      for (let i = 0; i < 5; i++) {
        const event = eventSystem.checkForEvents(gameState.getState());
        if (event) {
          eventIds.add(event.id);
          // Clear active event to allow next trigger
          eventSystem.activeEvent = null;
        }
      }

      // Should trigger at least one event
      expect(eventIds.size).toBeGreaterThan(0);
    });

    it("should emit event:triggered when event is triggered", (done) => {
      const listener = jest.fn();
      eventBus.subscribe("event:triggered", listener);

      gameState.update("missions.active", [{ id: "test_mission" }]);

      eventBus.emit("game:tick", {});

      requestAnimationFrame(() => {
        expect(listener).toHaveBeenCalled();
        done();
      });
    });
  });

  describe("Acceptance Criterion 2: Events affect budget/crew/missions/research", () => {
    it("should apply budget consequences", () => {
      const event = EVENTS.find((e) =>
        e.choices.some((c) => c.consequences.budget !== 0)
      );

      const initialBalance = gameState.getState().budget.balance;
      const expectedChange = event.choices[0].consequences.budget;

      eventSystem.resolveEvent(event.id, 0);

      const newBalance = gameState.getState().budget.balance;
      expect(newBalance).toBe(initialBalance + expectedChange);
    });

    it("should apply reputation consequences", () => {
      const event = EVENTS.find((e) =>
        e.choices.some((c) => c.consequences.reputation !== 0)
      );

      const initialReputation = gameState.getState().agency.reputation;
      const expectedChange = event.choices[0].consequences.reputation;

      eventSystem.resolveEvent(event.id, 0);

      const newReputation = gameState.getState().agency.reputation;
      expect(newReputation).toBe(
        Math.min(100, Math.max(0, initialReputation + expectedChange))
      );
    });

    it("should prevent budget from going negative", () => {
      const lowBudgetState = new GameState();
      lowBudgetState.update("budget.balance", 1_000_000);

      const eventSystem2 = new EventSystem(lowBudgetState);
      const event = EVENTS.find((e) =>
        e.choices.some((c) => c.consequences.budget < -5_000_000)
      );

      if (event) {
        const largeNegativeIndex = event.choices.findIndex(
          (c) => c.consequences.budget < -5_000_000
        );
        eventSystem2.resolveEvent(event.id, largeNegativeIndex);

        expect(lowBudgetState.getState().budget.balance).toBeGreaterThanOrEqual(
          0
        );
      }

      eventSystem2.teardown();
    });

    it("should cap reputation between 0 and 100", () => {
      const highRepState = new GameState();
      highRepState.update("agency.reputation", 95);

      const eventSystem2 = new EventSystem(highRepState);
      const event = EVENTS.find((e) =>
        e.choices.some((c) => c.consequences.reputation > 10)
      );

      if (event) {
        eventSystem2.resolveEvent(event.id, 0);
        const finalRep = highRepState.getState().agency.reputation;
        expect(finalRep).toBeLessThanOrEqual(100);
        expect(finalRep).toBeGreaterThanOrEqual(0);
      }

      eventSystem2.teardown();
    });

    it("should record event consequences in history", () => {
      const event = EVENTS[0];
      const choiceIndex = 0;

      eventSystem.resolveEvent(event.id, choiceIndex);

      const state = gameState.getState();
      expect(state.events.history.length).toBe(1);
      expect(state.events.history[0].consequences).toBeDefined();
      expect(state.events.history[0].chosenChoice).toBe(
        event.choices[choiceIndex].id
      );
    });
  });

  describe("Acceptance Criterion 3: Notification system shows events with player choices", () => {
    it("should display event card when event is triggered", (done) => {
      gameState.update("missions.active", [{ id: "test_mission" }]);

      eventBus.emit("game:tick", {});

      requestAnimationFrame(() => {
        const activeEvent = eventSystem.getActiveEvent();
        if (activeEvent) {
          const eventId = activeEvent.id;
          const card = document.getElementById(`event-card-${eventId}`);
          expect(card).not.toBeNull();
        }
        done();
      });
    });

    it("should show event card with title and description", (done) => {
      gameState.update("missions.active", [{ id: "test_mission" }]);

      eventBus.emit("game:tick", {});

      requestAnimationFrame(() => {
        const activeEvent = eventSystem.getActiveEvent();
        if (activeEvent) {
          const eventId = activeEvent.id;
          const card = document.getElementById(`event-card-${eventId}`);
          const title = card.querySelector(".ui-event-card-title");
          const description = card.querySelector(".ui-event-card-description");

          expect(title).not.toBeNull();
          expect(description).not.toBeNull();
          expect(title.textContent).toBe(activeEvent.title);
          expect(description.textContent).toBe(activeEvent.description);
        }
        done();
      });
    });

    it("should display all event choices as buttons", (done) => {
      gameState.update("missions.active", [{ id: "test_mission" }]);

      eventBus.emit("game:tick", {});

      requestAnimationFrame(() => {
        const activeEvent = eventSystem.getActiveEvent();
        if (activeEvent) {
          const eventId = activeEvent.id;
          const card = document.getElementById(`event-card-${eventId}`);
          const buttons = card.querySelectorAll(".ui-event-card-choices button");

          expect(buttons.length).toBe(activeEvent.choices.length);

          activeEvent.choices.forEach((choice, index) => {
            expect(buttons[index].textContent).toBe(choice.text);
          });
        }
        done();
      });
    });

    it("should accept and dismiss player choices", (done) => {
      gameState.update("missions.active", [{ id: "test_mission" }]);

      eventBus.emit("game:tick", {});

      requestAnimationFrame(() => {
        const activeEvent = eventSystem.getActiveEvent();
        if (activeEvent) {
          const eventId = activeEvent.id;
          const card = document.getElementById(`event-card-${eventId}`);
          const buttons = card.querySelectorAll("button");

          buttons[0].click();

          setTimeout(() => {
            const removedCard = document.getElementById(`event-card-${eventId}`);
            expect(removedCard).toBeNull();
            done();
          }, 350);
        } else {
          done();
        }
      });
    });

    it("should apply event consequences when choice is made", (done) => {
      gameState.update("missions.active", [{ id: "test_mission" }]);

      const initialBalance = gameState.getState().budget.balance;

      eventBus.emit("game:tick", {});

      requestAnimationFrame(() => {
        const activeEvent = eventSystem.getActiveEvent();
        if (activeEvent) {
          const eventId = activeEvent.id;
          const card = document.getElementById(`event-card-${eventId}`);
          const buttons = card.querySelectorAll("button");

          buttons[0].click();

          setTimeout(() => {
            const state = gameState.getState();
            const expectedChange = activeEvent.choices[0].consequences.budget;

            if (expectedChange !== 0) {
              expect(state.budget.balance).not.toBe(initialBalance);
            }

            expect(state.events.active.length).toBe(0);
            expect(state.events.history.length).toBeGreaterThan(0);
            done();
          }, 350);
        } else {
          done();
        }
      });
    });

    it("should show event notifications with different types", (done) => {
      // Find an event with negative budget consequence
      const warningEvent = EVENTS.find((e) =>
        e.choices.some((c) => c.consequences.budget < 0)
      );

      if (!warningEvent) {
        done();
        return;
      }

      const eventData = {
        id: warningEvent.id,
        title: warningEvent.title,
        description: warningEvent.description,
        choices: warningEvent.choices,
      };

      eventBus.emit("event:triggered", eventData);

      requestAnimationFrame(() => {
        const card = document.getElementById(`event-card-${warningEvent.id}`);
        expect(card).not.toBeNull();

        // Should have a type class
        const hasTypeClass = Array.from(card.classList).some((cls) =>
          cls.startsWith("ui-event-card--")
        );
        expect(hasTypeClass).toBe(true);

        done();
      });
    });
  });

  describe("Full Story Integration", () => {
    it("should complete full event lifecycle: trigger -> display -> resolve", (done) => {
      // 1. Setup conditions
      gameState.update("missions.active", [{ id: "test_mission" }]);

      // 2. Trigger event through game tick
      eventBus.emit("game:tick", {});

      requestAnimationFrame(() => {
        // 3. Verify event is active
        const activeEvent = eventSystem.getActiveEvent();
        expect(activeEvent).not.toBeNull();

        // 4. Verify card is displayed
        const card = document.getElementById(`event-card-${activeEvent.id}`);
        expect(card).not.toBeNull();

        // 5. Simulate player choice
        const buttons = card.querySelectorAll("button");
        const initialBalance = gameState.getState().budget.balance;

        buttons[0].click();

        // 6. Verify resolution
        setTimeout(() => {
          const state = gameState.getState();

          // Event should be removed from active
          expect(state.events.active.length).toBe(0);

          // Event should be in history
          expect(state.events.history.length).toBeGreaterThan(0);

          // Card should be removed
          const removedCard = document.getElementById(
            `event-card-${activeEvent.id}`
          );
          expect(removedCard).toBeNull();

          // Consequences should be applied
          const expectedChange = activeEvent.choices[0].consequences.budget;
          if (expectedChange !== 0) {
            const newBalance = state.budget.balance;
            expect(newBalance).toBe(initialBalance + expectedChange);
          }

          done();
        }, 350);
      });
    });

    it("should handle multiple sequential events", (done) => {
      gameState.update("missions.active", [{ id: "test_mission" }]);
      gameState.update("research.active", { id: "test_research" });

      let eventsResolved = 0;

      const checkCompletion = () => {
        const state = gameState.getState();
        if (state.events.active.length === 0) {
          expect(state.events.history.length).toBeGreaterThan(0);
          done();
        } else if (eventsResolved < 3) {
          // Try to trigger and resolve another event
          eventBus.emit("game:tick", {});

          requestAnimationFrame(() => {
            const activeEvent = eventSystem.getActiveEvent();
            if (activeEvent && !eventsResolved) {
              const card = document.getElementById(
                `event-card-${activeEvent.id}`
              );
              const buttons = card.querySelectorAll("button");
              buttons[0].click();
              eventsResolved++;

              setTimeout(() => {
                checkCompletion();
              }, 350);
            } else {
              done();
            }
          });
        }
      };

      eventBus.emit("game:tick", {});

      requestAnimationFrame(() => {
        const activeEvent = eventSystem.getActiveEvent();
        if (activeEvent) {
          const card = document.getElementById(
            `event-card-${activeEvent.id}`
          );
          const buttons = card.querySelectorAll("button");
          buttons[0].click();
          eventsResolved++;

          setTimeout(() => {
            checkCompletion();
          }, 350);
        } else {
          done();
        }
      });
    });
  });
});
