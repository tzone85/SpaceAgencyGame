/**
 * EventBus - Pub/Sub Event System
 *
 * Provides game-wide event communication using a publish/subscribe pattern
 * with support for event namespacing and data payloads.
 *
 * Implements singleton pattern to ensure single instance across the application.
 */

class EventBus {
  constructor() {
    if (EventBus.instance) {
      return EventBus.instance;
    }

    this.listeners = {};
    EventBus.instance = this;
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Event name (supports namespacing with dots, e.g., 'player.spawn')
   * @param {Function} callback - Callback function to execute when event is emitted
   * @param {*} context - Optional context to bind to the callback (default: null)
   * @returns {Function} Unsubscribe function for convenient removal
   */
  subscribe(eventName, callback, context = null) {
    if (typeof eventName !== "string" || !eventName.trim()) {
      throw new Error("Event name must be a non-empty string");
    }
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    const listener = {
      callback,
      context,
    };

    this.listeners[eventName].push(listener);

    // Return unsubscribe function for convenience
    return () => {
      this.unsubscribe(eventName, callback, context);
    };
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Event name to unsubscribe from
   * @param {Function} callback - Callback function to remove
   * @param {*} context - Context that was bound to the callback
   */
  unsubscribe(eventName, callback, context = null) {
    if (!this.listeners[eventName]) {
      return;
    }

    this.listeners[eventName] = this.listeners[eventName].filter((listener) => {
      return !(listener.callback === callback && listener.context === context);
    });

    // Clean up empty event arrays
    if (this.listeners[eventName].length === 0) {
      delete this.listeners[eventName];
    }
  }

  /**
   * Emit an event with optional data payload
   * @param {string} eventName - Event name to emit
   * @param {*} data - Optional data payload to pass to listeners
   */
  emit(eventName, data = null) {
    if (typeof eventName !== "string" || !eventName.trim()) {
      throw new Error("Event name must be a non-empty string");
    }

    if (!this.listeners[eventName]) {
      return;
    }

    // Create a copy of listeners array in case it's modified during iteration
    const listenersToCall = [...this.listeners[eventName]];

    listenersToCall.forEach((listener) => {
      try {
        if (listener.context) {
          listener.callback.call(listener.context, data);
        } else {
          listener.callback(data);
        }
      } catch (error) {
        console.error(`Error in event listener for "${eventName}":`, error);
      }
    });
  }

  /**
   * Get all listeners for an event or all events
   * @param {string} eventName - Optional event name to get listeners for
   * @returns {Object|Array} Listeners for the event or all listeners
   */
  getListeners(eventName = null) {
    if (eventName) {
      return this.listeners[eventName] || [];
    }
    return this.listeners;
  }

  /**
   * Check if an event has any listeners
   * @param {string} eventName - Event name to check
   * @returns {boolean} True if event has listeners
   */
  hasListeners(eventName) {
    return !!(
      this.listeners[eventName] && this.listeners[eventName].length > 0
    );
  }

  /**
   * Remove all listeners for a specific event
   * @param {string} eventName - Event name to clear, or omit to clear all events
   */
  clearListeners(eventName = null) {
    if (eventName) {
      delete this.listeners[eventName];
    } else {
      this.listeners = {};
    }
  }

  /**
   * Get count of listeners for an event
   * @param {string} eventName - Event name to count listeners for
   * @returns {number} Number of listeners
   */
  listenerCount(eventName) {
    return this.listeners[eventName] ? this.listeners[eventName].length : 0;
  }

  /**
   * Get the singleton instance
   * @returns {EventBus} The EventBus singleton instance
   */
  static getInstance() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Reset the singleton (useful for testing)
   */
  static reset() {
    EventBus.instance = null;
  }
}

export default EventBus;
