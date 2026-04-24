/**
 * Event Notification Handler
 *
 * Wires the EventSystem to the UI by listening for event:triggered events
 * and displaying event cards with player choices.
 *
 * Emits event:resolve to the EventBus when a choice is made.
 */

import {
  createEventCard,
  showEventCard,
  removeEventCard,
} from "./components.js";
import EventBus from "../game/EventBus.js";

export class EventNotificationHandler {
  constructor(eventBus = null) {
    this.eventBus = eventBus || EventBus.getInstance();
    this.activeEventCards = new Map();
    this.setupListeners();
  }

  /**
   * Setup event listeners for event:triggered
   */
  setupListeners() {
    this.eventBus.subscribe("event:triggered", this.handleEventTriggered, this);
  }

  /**
   * Remove all event listeners
   */
  teardown() {
    this.eventBus.unsubscribe(
      "event:triggered",
      this.handleEventTriggered,
      this
    );
    // Remove any active event cards
    this.activeEventCards.forEach((card) => {
      removeEventCard(card);
    });
    this.activeEventCards.clear();
  }

  /**
   * Handle event:triggered event from EventSystem
   * @param {Object} eventData - Event data with id, title, description, choices
   */
  handleEventTriggered(eventData) {
    if (!eventData || !eventData.id) {
      console.warn("Invalid event data received");
      return;
    }

    // Don't display duplicate cards
    if (this.activeEventCards.has(eventData.id)) {
      return;
    }

    // Determine event type based on consequences
    let eventType = "info";
    if (eventData.choices && eventData.choices.length > 0) {
      const firstChoice = eventData.choices[0];
      if (firstChoice.consequences) {
        if (firstChoice.consequences.budget < 0) {
          eventType = "warning";
        } else if (firstChoice.consequences.reputation > 20) {
          eventType = "success";
        }
      }
    }

    // Create event card
    const card = createEventCard({
      id: eventData.id,
      title: eventData.title,
      description: eventData.description,
      choices: eventData.choices || [],
      type: eventType,
      onChoice: (eventId, choiceIndex) => {
        this.handleChoiceMade(eventId, choiceIndex);
      },
    });

    // Store and display
    this.activeEventCards.set(eventData.id, card);
    showEventCard(card);
  }

  /**
   * Handle when player makes a choice
   * @param {string} eventId - ID of the event
   * @param {number} choiceIndex - Index of the chosen option
   */
  handleChoiceMade(eventId, choiceIndex) {
    // Emit event:resolve to trigger resolution in EventSystem
    this.eventBus.emit("event:resolve", {
      eventId,
      choiceIndex,
    });

    // Remove the card
    const card = this.activeEventCards.get(eventId);
    if (card) {
      removeEventCard(card, () => {
        this.activeEventCards.delete(eventId);
      });
    }
  }

  /**
   * Get number of active event cards
   * @returns {number}
   */
  getActiveEventCount() {
    return this.activeEventCards.size;
  }
}

export default EventNotificationHandler;
