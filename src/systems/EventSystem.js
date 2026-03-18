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
 */

export class EventSystem {
  constructor(eventBus, eventData = {}, initialState = {}) {
    this.eventBus = eventBus;
    this.eventData = eventData;
    this.state = {
      active: initialState.active ?? [],
      history: initialState.history ?? [],
    };
  }

  /**
   * Check for random events based on game state
   * @param {object} gameState - Current game state
   * @returns {array} - Events triggered
   */
  checkForEvents(gameState) {
    const triggered = [];

    // Roll probability for each event type
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

    return triggered;
  }

  /**
   * Present event to player (emit for UI)
   * @param {object} event - Event to present
   */
  presentEvent(event) {
    this.eventBus?.emit?.("event:triggered", { event });
  }

  /**
   * Resolve event with chosen outcome
   * @param {string} eventId - Event ID
   * @param {number} choiceIndex - Index of chosen option
   */
  resolveEvent(eventId, choiceIndex) {
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

  /**
   * Get event history
   * @returns {array} - Past events and outcomes (deep copy)
   */
  getHistory() {
    return this.state.history.map((event) => ({ ...event }));
  }
}

export default EventSystem;
