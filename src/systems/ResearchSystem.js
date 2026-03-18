/**
 * ResearchSystem - Manages research and technology progression
 *
 * Handles research lifecycle: availability checking, progression, completion,
 * and integration with GameState. Uses EventBus for event communication.
 *
 * Tracks:
 * - Available research (based on prerequisites)
 * - Active research progress (tracked in game ticks/deltaTime)
 * - Completed research and unlocked capabilities
 * - Budget deductions for research costs
 *
 * API:
 * - getAvailable() → array — tech nodes available to research
 * - startResearch(techId: string) → boolean — begin research on technology
 * - updateProgress(deltaTime: number) → void — advance active research
 * - completeResearch(techId: string) → void — unlock technology
 * - isUnlocked(techId: string) → boolean — check if tech is unlocked
 */

import {
  getResearchById,
  canStartResearch,
  getUnlockedCapabilities,
  getAllResearch,
} from "../data/research.js";

export class ResearchSystem {
  /**
   * @param {EventBus} eventBus - Event pub/sub system
   * @param {GameState} gameState - Immutable state manager
   * @param {Object} researchData - Research configuration data
   * @param {Object} initialState - Initial state for backward compatibility
   */
  constructor(eventBus, gameState, researchData = {}, initialState = {}) {
    this.eventBus = eventBus;
    this.gameState = gameState;
    this.researchData = researchData;
    
    // Support both new GameState system and legacy state management
    if (gameState) {
      // Internal tracking for research progress (separate from GameState)
      // This allows smooth progress tracking between ticks without constant state updates
      this.activeResearchProgress = 0;

      // Subscribe to relevant events
      this.onResearchStartBound = this.onResearchStart.bind(this);
      this.onGameTickBound = this.onGameTick.bind(this);

      this.eventBus.subscribe("research:start", this.onResearchStartBound);
      this.eventBus.subscribe("game:tick", this.onGameTickBound);
    } else {
      // Legacy state management
      this.state = {
        completed: initialState.completed ?? [],
        active: initialState.active ?? null,
        available: initialState.available ?? [],
      };
    }
  }

  /**
   * Get all available research (can be started based on prerequisites)
   * @returns {Array<Object>} Array of available research objects
   */
  getAvailable() {
    if (this.gameState) {
      const state = this.gameState.getState();
      const completedSet = new Set(state.research.completed);

      const available = [];
      const allResearch = getAllResearch();

      Object.values(allResearch).forEach((research) => {
        // Research is available if:
        // 1. Not already completed
        // 2. Not currently active
        // 3. All dependencies are met
        if (
          !completedSet.has(research.id) &&
          state.research.active?.id !== research.id &&
          canStartResearch(research.id, completedSet)
        ) {
          available.push(research);
        }
      });

      return available;
    } else {
      // Legacy implementation
      return this.state.available.filter(
        (techId) => !this.state.completed.includes(techId),
      );
    }
  }

  /**
   * Start research on a specific technology
   * Checks prerequisites, budget, and emits appropriate events
   * @param {string} techId - Research ID to start
   * @returns {boolean} True if research started successfully
   */
  startResearch(techId) {
    if (this.gameState) {
      const research = getResearchById(techId);
      if (!research) {
        console.warn(`Research not found: ${techId}`);
        return false;
      }

      const state = this.gameState.getState();
      const completedSet = new Set(state.research.completed);

      // Check if already completed
      if (completedSet.has(techId)) {
        console.warn(`Research already completed: ${techId}`);
        return false;
      }

      // Check if research is already active
      if (state.research.active?.id === techId) {
        console.warn(`Research already active: ${techId}`);
        return false;
      }

      // Check prerequisites
      if (!canStartResearch(techId, completedSet)) {
        console.warn(`Prerequisites not met for research: ${techId}`);
        return false;
      }

      // Check budget
      const costs = research.costs;
      if (state.budget.balance < costs.credits) {
        console.warn(`Insufficient budget for research: ${techId}`);
        return false;
      }

      // Deduct budget
      this.gameState.update(
        "budget.balance",
        state.budget.balance - costs.credits,
      );

      // Initialize research progress
      this.activeResearchProgress = 0;

      // Update GameState with active research
      this.gameState.update("research.active", {
        id: techId,
        startedAt: Date.now(),
        progress: 0, // Progress 0-1
        duration: research.duration,
      });

      // Emit events
      this.eventBus?.emit("budget:deduct", {
        amount: costs.credits,
        reason: "research",
        researchId: techId,
      });

      this.eventBus?.emit("research:started", {
        techId,
        name: research.name,
        duration: research.duration,
        costs,
      });

      this.eventBus?.emit("state:changed", {
        type: "research:started",
        data: { techId, name: research.name },
      });

      return true;
    } else {
      // Legacy implementation
      const tech = this.researchData[techId];
      if (!tech || this.state.active) {
        return false;
      }

      this.state.active = {
        techId,
        startTime: Date.now(),
        progress: 0,
        duration: tech.duration || 5000,
      };

      // Deduct research cost from budget
      if (tech.cost) {
        this.eventBus?.emit?.("budget:deduct", { amount: tech.cost });
      }

      this.eventBus?.emit?.("research:started", { techId });
      return true;
    }
  }

  /**
   * Update active research progress based on deltaTime
   * Called each game tick; internally tracks progress and emits completion when done
   * @param {number} deltaTime - Time elapsed in seconds (or game-days)
   */
  updateProgress(deltaTime) {
    if (this.gameState) {
      const state = this.gameState.getState();
      const activeResearch = state.research.active;

      // No active research
      if (!activeResearch) {
        return;
      }

      const research = getResearchById(activeResearch.id);
      if (!research) {
        return;
      }

      // Update internal progress tracker
      // Assume deltaTime is in game-days (matching research.duration units)
      const progressDelta = deltaTime / research.duration;
      this.activeResearchProgress += progressDelta;

      // Cap progress at 1.0
      this.activeResearchProgress = Math.min(this.activeResearchProgress, 1.0);

      // Update GameState with progress
      const currentActive = state.research.active;
      this.gameState.update("research.active", {
        ...currentActive,
        progress: this.activeResearchProgress,
      });

      // Check if research is complete (use small tolerance for floating-point precision)
      if (this.activeResearchProgress >= 0.9999) {
        this.completeResearch(activeResearch.id);
      }
    } else {
      // Legacy implementation
      if (this.state.active) {
        const tech = this.researchData[this.state.active.techId];
        if (tech) {
          this.state.active.progress += deltaTime / this.state.active.duration;
          if (this.state.active.progress >= 1) {
            this.completeResearch(this.state.active.techId);
          }
        }
      }
    }
  }

  /**
   * Complete active research and update state
   * Unlocks capabilities and emits completion events
   * @param {string} techId - Research ID to complete (should be the active research)
   */
  completeResearch(techId) {
    if (this.gameState) {
      const research = getResearchById(techId);
      if (!research) {
        console.warn(`Research not found: ${techId}`);
        return;
      }

      const state = this.gameState.getState();

      // Add to completed research
      const updatedCompleted = [...state.research.completed, techId];
      this.gameState.update("research.completed", updatedCompleted);

      // Clear active research
      this.gameState.update("research.active", null);

      // Reset progress tracker
      this.activeResearchProgress = 0;

      // Get newly unlocked capabilities
      const capabilities = getUnlockedCapabilities(techId);

      // Emit completion events
      this.eventBus.emit("research:completed", {
        techId,
        name: research.name,
        unlockedCapabilities: capabilities,
        unlockedMissions: research.unlockedMissions,
      });

      this.eventBus.emit("state:changed", {
        type: "research:completed",
        data: {
          techId,
          name: research.name,
          unlockedCapabilities: capabilities,
        },
      });
    } else {
      // Legacy implementation
      if (this.state.active?.techId === techId) {
        this.state.completed.push(techId);
        this.state.active = null;
        this.eventBus?.emit?.("research:completed", { techId });

        // Update available missions based on unlock
        this.eventBus?.emit?.("research:tech-unlocked", { techId });
      }
    }
  }

  /**
   * Check if technology is unlocked
   * @param {string} techId - Technology ID
   * @returns {boolean} - true if unlocked
   */
  isUnlocked(techId) {
    if (this.gameState) {
      const state = this.gameState.getState();
      return state.research.completed.includes(techId);
    } else {
      return this.state.completed.includes(techId);
    }
  }

  /**
   * Event listener for 'research:start' event
   * Initiates research when requested via EventBus
   * @private
   */
  onResearchStart(data) {
    if (!data || !data.techId) {
      console.warn("Invalid research:start event data");
      return;
    }
    this.startResearch(data.techId);
  }

  /**
   * Event listener for 'game:tick' event
   * Updates research progress each game tick
   * @private
   */
  onGameTick(data) {
    if (!data || typeof data.deltaTime !== "number") {
      console.warn("Invalid game:tick event data");
      return;
    }
    this.updateProgress(data.deltaTime);
  }

  /**
   * Cleanup - unsubscribe from events
   */
  destroy() {
    if (this.gameState) {
      this.eventBus.unsubscribe("research:start", this.onResearchStartBound);
      this.eventBus.unsubscribe("game:tick", this.onGameTickBound);
    }
  }
}

export default ResearchSystem;