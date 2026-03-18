/**
 * GameState - Immutable State Manager
 *
 * Manages the entire game state using immutable patterns.
 * All updates create new state objects via structuredClone + Object.freeze.
 */

const INITIAL_STATE = {
  agency: {
    name: "Stellar Horizon Space Agency",
    reputation: 50,
    founded: "2024-Q1",
  },
  budget: {
    balance: 500_000_000,
    quarterlyFunding: 50_000_000,
    currentQuarter: 1,
    currentYear: 2024,
    history: [],
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
};

class GameState {
  #state;

  constructor(initialState = null) {
    this.#state = Object.freeze(
      structuredClone(initialState || INITIAL_STATE)
    );
  }

  /**
   * Get the current frozen state
   * @returns {Object} The frozen game state
   */
  getState() {
    return this.#state;
  }

  /**
   * Immutable update - replaces internal state with a new frozen copy
   * @param {string} path - Dot-separated path, e.g. "budget.balance"
   * @param {*} value - New value to set at the path
   */
  update(path, value) {
    if (typeof path !== "string" || !path.trim()) {
      throw new Error("Path must be a non-empty string");
    }

    const newState = structuredClone(this.#state);
    const keys = path.split(".");
    let obj = newState;

    for (let i = 0; i < keys.length - 1; i++) {
      if (obj[keys[i]] === undefined) {
        throw new Error(`Invalid path: "${path}" - key "${keys[i]}" not found`);
      }
      obj = obj[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    obj[lastKey] = value;
    this.#state = Object.freeze(newState);
  }

  /**
   * Batch update - takes an object of path:value pairs
   * @param {Object} updates - Object with dot-separated paths as keys
   */
  batchUpdate(updates) {
    if (!updates || typeof updates !== "object") {
      throw new Error("Updates must be a non-null object");
    }

    const newState = structuredClone(this.#state);

    for (const [path, value] of Object.entries(updates)) {
      const keys = path.split(".");
      let obj = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] === undefined) {
          throw new Error(
            `Invalid path: "${path}" - key "${keys[i]}" not found`
          );
        }
        obj = obj[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      obj[lastKey] = value;
    }

    this.#state = Object.freeze(newState);
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.#state = Object.freeze(structuredClone(INITIAL_STATE));
  }
}

export default GameState;
export { GameState, INITIAL_STATE };
