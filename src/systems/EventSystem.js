/**
 * Event System
 *
 * Manages random events and storyline triggers.
 * Events can affect budget, crew morale, mission availability, and more.
 *
 * API:
 * - checkForEvents(gameState: object) → array — roll for events
 * - presentEvent(event: object) → void — emit event to UI
 * - resolveEvent(eventId: string, choiceIndex: number) → void — apply consequences
 * - getHistory() → array — event history
 *
 * EventSystem - Game Event Management
 *
 * Handles event triggering, presentation, and resolution.
 * Listens for game:tick events to check for new events.
 * Manages event history and applies consequences to game state.
 * Emits event:triggered, event:resolved, and state:changed events.
 */

import EventBus from "../game/EventBus.js";
import EVENTS from "../data/events.js";

export class EventSystem {
  constructor(eventBus, eventData = {}, initialState = {}) {
    this.eventBus = eventBus;
    this.eventData = eventData;
    this.gameState = arguments[0] && arguments[0].getState ? arguments[0] : null;
    this.state = {
      active: initialState.active ?? [],
      history: initialState.history ?? [],
    };
    this.activeEvent = null;
    this.eventPool = [...EVENTS];

    if (this.gameState) {
      this.setupListeners();
    }
  }

  /**
   * Setup event listeners for game:tick and event:resolve
   */
  setupListeners() {
    this.eventBus.subscribe("game:tick", this.handleGameTick, this);
    this.eventBus.subscribe("event:resolve", this.handleEventResolve, this);
  }

  /**
   * Remove all event listeners
   */
  teardown() {
    this.eventBus.unsubscribe("game:tick", this.handleGameTick, this);
    this.eventBus.unsubscribe("event:resolve", this.handleEventResolve, this);
  }

  /**
   * Check if an event should trigger based on game state
   * Called on each game:tick event
   * @param {Object} gameState - Current game state
   */
  handleGameTick(data) {
    const triggeredEvent = this.checkForEvents(this.gameState.getState());
    if (triggeredEvent) {
      this.presentEvent(triggeredEvent);
    }
  }

  /**
   * Handle event resolution when event:resolve event is emitted
   * @param {Object} data - Contains eventId and choiceIndex
   */
  handleEventResolve(data) {
    if (data && typeof data === "object") {
      this.resolveEvent(data.eventId, data.choiceIndex);
    }
  }

  /**
   * Check for random events based on game state
   * @param {object} gameState - Current game state
   * @returns {array|object} - Events triggered
   */
  checkForEvents(gameState) {
    if (this.gameState && this.activeEvent) {
      return null; // Don't trigger new events while one is active
    }

    // Check if there are active events in game state
    if (this.gameState && gameState.events && gameState.events.active && gameState.events.active.length > 0) {
      return null; // Events already pending
    }

    const triggered = [];

    // Check for events whose conditions are met (new system)
    if (this.gameState) {
      const triggeredEvents = EVENTS.filter((event) => {
        // Don't trigger events already in history recently (avoid spam)
        const recentHistory = gameState.events.history.slice(-10);
        const alreadyTriggered = recentHistory.some((h) => h.id === event.id);
        if (alreadyTriggered) {
          return false;
        }

        // Check event condition
        try {
          return event.condition(gameState);
        } catch (error) {
          console.error(`Error checking condition for event "${event.id}":`, error);
          return false;
        }
      });

      if (triggeredEvents.length > 0) {
        // Randomly select one event
        const selectedEvent = triggeredEvents[
          Math.floor(Math.random() * triggeredEvents.length)
        ];
        return selectedEvent;
      }
    }

    // Roll probability for each event type (legacy system)
    Object.values(this.eventData).forEach((eventTemplate) => {
      const probability = eventTemplate.probability ?? 0.1;
      if (Math.random() < probability) {
        const event = {
          id: `event_${Date.now()}_${Math.random()}`,
          templateId: eventTemplate.id,
          title: eventTemplate.title,
          description: eventTemplate.description,
          choices: eventTemplate.choices ?? [],
          triggeredAt: Date.now(),
        };
        this.state.active.push(event);
        triggered.push(event);
        this.presentEvent(event);
      }
    });

    return this.gameState ? null : triggered;
  }

  /**
   * Present event to player (emit for UI)
   * @param {object} event - Event to present
   */
  presentEvent(event) {
    if (this.gameState) {
      this.activeEvent = event;

      // Add event to active events in game state
      const currentState = this.gameState.getState();
      const activeEvents = [...currentState.events.active];
      activeEvents.push({
        id: event.id,
        title: event.title,
        description: event.description,
        choices: event.choices.map((choice) => ({
          id: choice.id,
          text: choice.text,
        })),
        timestamp: Date.now(),
      });

      this.gameState.update("events.active", activeEvents);

      // Emit event:triggered event
      this.eventBus.emit("event:triggered", {
        id: event.id,
        title: event.title,
        description: event.description,
        choices: event.choices,
      });
    } else {
      this.eventBus?.emit?.("event:triggered", { event });
    }
  }

  /**
   * Resolve event with chosen outcome
   * @param {string} eventId - Event ID
   * @param {number} choiceIndex - Index of chosen option
   */
  resolveEvent(eventId, choiceIndex) {
    if (this.gameState) {
      const event = EVENTS.find((e) => e.id === eventId);
      if (!event) {
        console.error(`Event with id "${eventId}" not found`);
        return;
      }

      const choice = event.choices[choiceIndex];
      if (!choice) {
        console.error(
          `Choice index ${choiceIndex} not found for event "${eventId}"`
        );
        return;
      }

      const currentState = this.gameState.getState();

      // Apply consequences to game state
      const updates = {};
      if (choice.consequences.budget !== undefined && choice.consequences.budget !== 0) {
        const newBalance = currentState.budget.balance + choice.consequences.budget;
        updates["budget.balance"] = Math.max(0, newBalance); // Prevent negative balance
      }

      if (
        choice.consequences.reputation !== undefined &&
        choice.consequences.reputation !== 0
      ) {
        const newReputation = Math.max(
          0,
          Math.min(
            100,
            currentState.agency.reputation + choice.consequences.reputation
          )
        );
        updates["agency.reputation"] = newReputation;
      }

      // Add to event history
      const eventHistory = [...currentState.events.history];
      eventHistory.push({
        id: event.id,
        title: event.title,
        chosenChoice: choice.id,
        consequences: choice.consequences,
        timestamp: Date.now(),
      });
      updates["events.history"] = eventHistory;

      // Remove from active events
      const activeEvents = currentState.events.active.filter(
        (e) => e.id !== eventId
      );
      updates["events.active"] = activeEvents;

      // Apply all updates
      if (Object.keys(updates).length > 0) {
        this.gameState.batchUpdate(updates);
      }

      // Emit state:changed event
      this.eventBus.emit("state:changed", {
        changedPaths: Object.keys(updates),
        consequences: choice.consequences,
      });

      // Emit event:resolved event
      this.eventBus.emit("event:resolved", {
        eventId: event.id,
        choiceId: choice.id,
        consequences: choice.consequences,
      });

      this.activeEvent = null;
    } else {
      const eventIndex = this.state.active.findIndex((e) => e.id === eventId);
      if (eventIndex === -1) {
        return;
      }

      const event = this.state.active[eventIndex];
      const choice = event.choices[choiceIndex];

      if (choice) {
        // Apply consequences
        if (choice.budgetDelta) {
          if (choice.budgetDelta > 0) {
            this.eventBus?.emit?.("budget:add-income", {
              amount: choice.budgetDelta,
              source: `event:${event.templateId}`,
            });
          } else {
            this.eventBus?.emit?.("budget:deduct", {
              amount: Math.abs(choice.budgetDelta),
            });
          }
        }

        if (choice.moraleDelta) {
          this.eventBus?.emit?.("crew:morale-adjust", {
            delta: choice.moraleDelta,
          });
        }
      }

      // Move to history
      this.state.active.splice(eventIndex, 1);
      this.state.history.push({
        ...event,
        resolvedAt: Date.now(),
        choiceIndex,
      });

      this.eventBus?.emit?.("event:resolved", { eventId, choiceIndex });
    }
  }

  /**
   * Get event history
   * @returns {array} - Past events and outcomes (deep copy)
   */
  getHistory() {
    return this.state.history.map((event) => ({ ...event }));
  }

  /**
   * Get the currently active event
   * @returns {Object|null} Currently active event or null
   */
  getActiveEvent() {
    return this.activeEvent;
  }

  /**
   * Force trigger a specific event (for testing)
   * @param {string} eventId - ID of event to trigger
   */
  triggerEventById(eventId) {
    const event = EVENTS.find((e) => e.id === eventId);
    if (event) {
      this.presentEvent(event);
    }
  }

  /**
   * Get all available events
   * @returns {Array} Array of all event definitions
   */
  getAllEvents() {
    return [...EVENTS];
  }
}

export default EventSystem;