/**
 * SaveSystem - Persistent Game State Storage
 *
 * Handles saving and loading game state to/from localStorage.
 * Emits events via EventBus for save lifecycle notifications.
 */

const SAVE_KEY = "stellar-horizon-save";

class SaveSystem {
  #eventBus;

  /**
   * @param {EventBus} eventBus - EventBus instance for emitting save events
   */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  /**
   * Save the game state to localStorage
   * @param {Object} state - The game state to persist
   * @returns {boolean} True if save succeeded, false otherwise
   */
  save(state) {
    try {
      const data = JSON.stringify(state);
      localStorage.setItem(SAVE_KEY, data);
      if (this.#eventBus) {
        this.#eventBus.emit("save:completed");
      }
      return true;
    } catch (err) {
      if (err.name === "QuotaExceededError") {
        if (this.#eventBus) {
          this.#eventBus.emit("save:error", { reason: "storage-full" });
        }
      }
      return false;
    }
  }

  /**
   * Load the game state from localStorage
   * @returns {Object|null} The parsed game state, or null if not found/invalid
   */
  load() {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) {
        return null;
      }
      const parsed = JSON.parse(data);
      // Version check
      if (parsed.meta?.saveVersion !== 1) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Remove the saved game from localStorage
   */
  clear() {
    localStorage.removeItem(SAVE_KEY);
  }

  /**
   * Check whether a saved game exists
   * @returns {boolean} True if a save exists in localStorage
   */
  hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }
}

export default SaveSystem;
export { SaveSystem, SAVE_KEY };
