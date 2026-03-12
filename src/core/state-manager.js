/**
 * StateManager Class
 *
 * Manages different game states (menu, gameplay, pause, settings).
 * Handles state transitions, allows multiple simultaneous states,
 * and ensures proper memory cleanup when states change.
 */

class StateManager {
  constructor() {
    this.states = new Map(); // state name -> state object
    this.activeStates = new Set(); // set of currently active state names
    this.stateHistory = []; // for tracking previous states
    this.transitionCallbacks = new Map(); // state name -> callbacks
  }

  /**
   * Register a new state with the manager
   * @param {string} name - Unique state identifier
   * @param {Object} state - State object with lifecycle methods
   */
  registerState(name, state) {
    if (this.states.has(name)) {
      console.warn(`State "${name}" already registered. Overwriting...`);
    }

    // Validate state object has required methods
    if (typeof state.enter !== "function") {
      console.warn(`State "${name}" missing enter() method`);
    }
    if (typeof state.exit !== "function") {
      console.warn(`State "${name}" missing exit() method`);
    }

    this.states.set(name, state);
    this.transitionCallbacks.set(name, []);
  }

  /**
   * Register a callback to be called when transitioning to a state
   * @param {string} stateName - State to trigger callback on
   * @param {Function} callback - Function to call on transition
   */
  onStateTransition(stateName, callback) {
    if (!this.transitionCallbacks.has(stateName)) {
      this.transitionCallbacks.set(stateName, []);
    }
    this.transitionCallbacks.get(stateName).push(callback);
  }

  /**
   * Transition to a new state (replace current states)
   * @param {string|string[]} stateName - State name(s) to transition to
   */
  transition(stateName) {
    const targetStates = Array.isArray(stateName) ? stateName : [stateName];

    // Exit all currently active states
    for (const active of this.activeStates) {
      this.exitState(active);
    }

    // Clear active states
    this.activeStates.clear();

    // Enter new states
    for (const name of targetStates) {
      this.enterState(name);
    }
  }

  /**
   * Push a new state (keep existing states active, add new one)
   * @param {string} stateName - State to push
   */
  push(stateName) {
    if (this.activeStates.has(stateName)) {
      console.warn(`State "${stateName}" is already active`);
      return;
    }

    this.enterState(stateName);
  }

  /**
   * Pop a state (remove from active states)
   * @param {string} stateName - State to pop
   */
  pop(stateName) {
    if (!this.activeStates.has(stateName)) {
      console.warn(`State "${stateName}" is not active`);
      return;
    }

    this.exitState(stateName);
  }

  /**
   * Check if a state is currently active
   * @param {string} stateName - State to check
   * @returns {boolean} True if state is active
   */
  isActive(stateName) {
    return this.activeStates.has(stateName);
  }

  /**
   * Get all currently active states
   * @returns {string[]} Array of active state names
   */
  getActiveStates() {
    return Array.from(this.activeStates);
  }

  /**
   * Internal method to enter a state
   * @private
   * @param {string} name - State name
   */
  enterState(name) {
    const state = this.states.get(name);

    if (!state) {
      console.error(`State "${name}" not registered`);
      return;
    }

    // Track in history
    this.stateHistory.push(name);

    // Mark as active
    this.activeStates.add(name);

    // Call enter lifecycle method
    try {
      if (typeof state.enter === "function") {
        state.enter();
      }
    } catch (error) {
      console.error(`Error entering state "${name}":`, error);
      this.activeStates.delete(name);
      return;
    }

    // Call registered callbacks
    const callbacks = this.transitionCallbacks.get(name) || [];
    for (const callback of callbacks) {
      try {
        callback();
      } catch (error) {
        console.error(`Error in transition callback for "${name}":`, error);
      }
    }

    console.log(`Entered state: ${name}`);
  }

  /**
   * Internal method to exit a state
   * @private
   * @param {string} name - State name
   */
  exitState(name) {
    const state = this.states.get(name);

    if (!state) {
      console.warn(`State "${name}" not registered`);
      this.activeStates.delete(name);
      return;
    }

    // Only proceed if state is actually active
    if (!this.activeStates.has(name)) {
      return;
    }

    // Call exit lifecycle method (cleanup)
    try {
      if (typeof state.exit === "function") {
        state.exit();
      }
    } catch (error) {
      console.error(`Error exiting state "${name}":`, error);
    }

    // Remove from active states
    this.activeStates.delete(name);

    // Clean up state resources
    this.cleanupState(state);

    console.log(`Exited state: ${name}`);
  }

  /**
   * Clean up state resources (memory management)
   * @private
   * @param {Object} state - State object to cleanup
   */
  cleanupState(state) {
    // Clear any event listeners
    if (state.eventListeners && Array.isArray(state.eventListeners)) {
      for (const listener of state.eventListeners) {
        if (listener.target && listener.event && listener.handler) {
          listener.target.removeEventListener(listener.event, listener.handler);
        }
      }
      state.eventListeners = [];
    }

    // Clear timers
    if (state.timers && Array.isArray(state.timers)) {
      for (const timerId of state.timers) {
        clearTimeout(timerId);
        clearInterval(timerId);
      }
      state.timers = [];
    }

    // Call cleanup method if it exists
    if (typeof state.cleanup === "function") {
      try {
        state.cleanup();
      } catch (error) {
        console.error("Error in state cleanup:", error);
      }
    }
  }

  /**
   * Get the previous state from history
   * @returns {string|null} Previous state name or null
   */
  getPreviousState() {
    if (this.stateHistory.length < 2) {
      return null;
    }
    return this.stateHistory[this.stateHistory.length - 2];
  }

  /**
   * Get full state history
   * @returns {string[]} Array of state transitions
   */
  getStateHistory() {
    return [...this.stateHistory];
  }

  /**
   * Clear state history (memory management)
   */
  clearStateHistory() {
    this.stateHistory = [];
  }

  /**
   * Get information about a registered state
   * @param {string} stateName - State name
   * @returns {Object|null} State object or null
   */
  getState(stateName) {
    return this.states.get(stateName) || null;
  }

  /**
   * Destroy the state manager and cleanup all states
   */
  destroy() {
    // Exit all active states
    for (const active of this.activeStates) {
      this.exitState(active);
    }

    // Clear all data structures
    this.states.clear();
    this.activeStates.clear();
    this.stateHistory = [];
    this.transitionCallbacks.clear();

    console.log("StateManager destroyed");
  }
}

export default StateManager;
