/**
 * MissionSystem - Manages game mission lifecycle
 *
 * Handles mission launching, progress tracking, and completion.
 * Integrates with GameState for persistence and EventBus for communication.
 * Listens for mission:launch and game:tick events.
 * Emits mission:started, mission:completed, budget:deduct, and state:changed events.
 *
 * API:
 * - getMissionsByTier(tier: string) → array — filter available missions
 * - launchMission(missionId: string, crewIds: string[]) → boolean — start mission
 * - updateProgress(deltaTime: number) → void — advance active missions
 * - completeMission(missionId: string) → void — resolve outcome, apply rewards
 */

import {
  getMissionById,
  getMissionsByTier as getMissionsByTierData,
} from "../data/missions.js";

class MissionSystem {
  #eventBus;
  #gameState;
  #activeMissions; // Map of missionId -> { mission, crewIds, elapsed, status }

  /**
   * @param {EventBus} eventBus - EventBus singleton for event communication
   * @param {GameState} gameState - GameState manager for persistence
   * @param {object} missionData - Mission data (for backward compatibility)
   * @param {object} initialState - Initial state (for backward compatibility)
   */
  constructor(eventBus, gameState, missionData = {}, initialState = {}) {
    if (!eventBus) {
      throw new Error("EventBus is required");
    }

    this.#eventBus = eventBus;
    this.eventBus = eventBus;
    
    // Support both new architecture and legacy constructor
    if (gameState && typeof gameState.getState === 'function') {
      this.#gameState = gameState;
    } else {
      // Legacy mode - second parameter is missionData
      this.missionData = gameState || missionData;
      this.state = {
        available: initialState.available ?? [],
        active: initialState.active ?? [],
        completed: initialState.completed ?? [],
      };
    }

    this.#activeMissions = new Map();

    // Subscribe to game events
    this.#eventBus.subscribe("mission:launch", this.#onMissionLaunch, this);
    this.#eventBus.subscribe("game:tick", this.#onGameTick, this);
  }

  /**
   * Get missions filtered by tier
   * @param {string} tier - Mission tier name (e.g., 'LEO', 'Lunar', etc.)
   * @returns {Array} Array of missions for the given tier
   */
  getMissionsByTier(tier) {
    if (typeof tier !== "string" || !tier.trim()) {
      throw new Error("Tier must be a non-empty string");
    }

    // Use new data source if available, otherwise fall back to legacy
    if (typeof getMissionsByTierData === 'function') {
      return getMissionsByTierData(tier);
    }

    // Legacy implementation
    return this.state.available
      .map((missionId) => this.missionData[missionId])
      .filter((m) => m && m.tier === tier);
  }

  /**
   * Launch a mission with assigned crew
   * @param {string} missionId - ID of the mission to launch
   * @param {Array<string>} crewIds - Array of crew member IDs to assign
   * @returns {Object|boolean} Mission progress object or boolean for legacy compatibility
   */
  launchMission(missionId, crewIds = []) {
    // Validate inputs
    if (typeof missionId !== "string" || !missionId.trim()) {
      throw new Error("Mission ID must be a non-empty string");
    }
    if (!Array.isArray(crewIds)) {
      throw new Error("Crew IDs must be an array");
    }

    // Get mission data from appropriate source
    const mission = getMissionById ? getMissionById(missionId) : this.missionData[missionId];
    if (!mission) {
      if (this.#gameState) {
        throw new Error(`Mission not found: ${missionId}`);
      } else {
        this.eventBus?.emit?.("mission:validation-error", {
          missionId,
          error: "Mission not found",
        });
        return false;
      }
    }

    // New architecture validation
    if (this.#gameState) {
      // Validate crew assignment
      if (crewIds.length !== mission.crewRequired) {
        throw new Error(
          `Mission requires ${mission.crewRequired} crew, but ${crewIds.length} provided`,
        );
      }

      // Check budget
      const state = this.#gameState.getState();
      if (state.budget.balance < mission.cost) {
        this.#eventBus.emit("mission:launch-failed", {
          missionId,
          reason: "insufficient-budget",
        });
        return null;
      }

      // Prevent duplicate launches
      if (this.#activeMissions.has(missionId)) {
        throw new Error(`Mission is already active: ${missionId}`);
      }

      // Create mission progress entry
      const missionProgress = {
        missionId,
        mission,
        crewIds: [...crewIds], // Immutable copy
        elapsed: 0,
        status: "active",
        startedAt: Date.now(),
      };

      this.#activeMissions.set(missionId, missionProgress);

      // Deduct budget from game state
      const newBalance = state.budget.balance - mission.cost;
      this.#gameState.update("budget.balance", newBalance);

      // Add mission to active missions list in game state
      const activeMissions = [...(state.missions.active || [])];
      activeMissions.push({
        missionId,
        crewIds,
        elapsed: 0,
        status: "active",
        startedAt: Date.now(),
      });
      this.#gameState.update("missions.active", activeMissions);

      // Emit events
      this.#eventBus.emit("mission:started", {
        missionId,
        missionName: mission.name,
        crewIds,
        cost: mission.cost,
        duration: mission.duration,
      });

      this.#eventBus.emit("budget:deduct", {
        amount: mission.cost,
        reason: "mission-launch",
        missionId,
        newBalance,
      });

      this.#eventBus.emit("state:changed", {
        change: "mission-launched",
        missionId,
      });

      return missionProgress;
    } else {
      // Legacy implementation
      const activeMission = {
        id: missionId,
        crewIds,
        startTime: Date.now(),
        progress: 0,
        status: "active",
      };

      this.state.active.push(activeMission);
      this.eventBus?.emit?.("mission:started", {
        missionId,
        crewIds,
      });

      // Deduct mission cost from budget
      if (mission.cost) {
        this.eventBus?.emit?.("budget:deduct", { amount: mission.cost });
      }

      return true;
    }
  }

  /**
   * Update progress of active missions based on time delta
   * @param {number} deltaTime - Time delta in seconds or milliseconds
   */
  updateProgress(deltaTime) {
    if (typeof deltaTime !== "number" || deltaTime < 0) {
      throw new Error("Delta time must be a non-negative number");
    }

    if (this.#gameState) {
      // New architecture implementation
      const state = this.#gameState.getState();
      const activeMissions = state.missions.active || [];
      const updatedMissions = [];
      const completedMissionIds = [];

      for (const activeMission of activeMissions) {
        const { missionId } = activeMission;
        const missionProgress = this.#activeMissions.get(missionId);

        if (!missionProgress) {
          updatedMissions.push(activeMission);
          continue;
        }

        const mission = missionProgress.mission;
        const newElapsed = activeMission.elapsed + deltaTime;
        const durationInSeconds = mission.duration * 86400; // Convert days to seconds

        if (newElapsed >= durationInSeconds) {
          // Mission is complete
          completedMissionIds.push(missionId);
        } else {
          // Mission still in progress
          updatedMissions.push({
            ...activeMission,
            elapsed: newElapsed,
          });
        }
      }

      // Always update active missions in game state to persist elapsed time changes
      this.#gameState.update("missions.active", updatedMissions);

      // Complete each finished mission
      for (const missionId of completedMissionIds) {
        this.completeMission(missionId);
      }
    } else {
      // Legacy implementation
      this.state.active.forEach((mission) => {
        const missionTemplate = this.missionData[mission.id];
        if (missionTemplate) {
          mission.progress +=
            (deltaTime / (missionTemplate.duration || 1000)) * 100;
          if (mission.progress >= 100) {
            this.completeMission(mission.id);
          }
        }
      });
    }
  }

  /**
   * Complete a mission
   * @param {string} missionId - ID of the mission to complete
   */
  completeMission(missionId) {
    if (typeof missionId !== "string" || !missionId.trim()) {
      throw new Error("Mission ID must be a non-empty string");
    }

    if (this.#gameState) {
      // New architecture implementation
      const missionProgress = this.#activeMissions.get(missionId);
      if (!missionProgress) {
        throw new Error(`Mission not found in active missions: ${missionId}`);
      }

      const { mission, crewIds } = missionProgress;
      const state = this.#gameState.getState();

      // Remove from active missions
      const activeMissions = (state.missions.active || []).filter(
        (m) => m.missionId !== missionId,
      );
      this.#gameState.update("missions.active", activeMissions);

      // Add to completed missions
      const completedMissions = [...(state.missions.completed || [])];
      completedMissions.push({
        missionId,
        missionName: mission.name,
        crewIds,
        completedAt: Date.now(),
        cost: mission.cost,
        revenue: Math.floor(mission.cost * 1.5), // 50% return for example
      });
      this.#gameState.update("missions.completed", completedMissions);

      // Update reputation
      const currentReputation = state.agency.reputation || 50;
      const newReputation = Math.min(
        100,
        currentReputation + Math.floor(mission.successRate / 10),
      );
      this.#gameState.update("agency.reputation", newReputation);

      // Remove from active tracking
      this.#activeMissions.delete(missionId);

      // Emit events
      this.#eventBus.emit("mission:completed", {
        missionId,
        missionName: mission.name,
        crewIds,
        successRate: mission.successRate,
      });

      this.#eventBus.emit("state:changed", {
        change: "mission-completed",
        missionId,
      });
    } else {
      // Legacy implementation
      const index = this.state.active.findIndex((m) => m.id === missionId);
      if (index !== -1) {
        const completed = this.state.active.splice(index, 1)[0];
        this.state.completed.push(completed);
        this.eventBus?.emit?.("mission:completed", { missionId });
      }
    }
  }

  /**
   * Get an active mission by ID
   * @param {string} missionId - Mission ID
   * @returns {Object|null} Mission progress object or null
   */
  getActiveMission(missionId) {
    return this.#activeMissions.get(missionId) || null;
  }

  /**
   * Get all active missions
   * @returns {Array} Array of active mission progress objects
   */
  getActiveMissions() {
    return Array.from(this.#activeMissions.values());
  }

  /**
   * Check if a mission is active
   * @param {string} missionId - Mission ID
   * @returns {boolean} True if mission is active
   */
  isActiveMission(missionId) {
    return this.#activeMissions.has(missionId);
  }

  /**
   * Cancel an active mission
   * @param {string} missionId - Mission ID
   * @returns {Object|null} Mission progress object or null if not found
   */
  cancelMission(missionId) {
    const missionProgress = this.#activeMissions.get(missionId);
    if (!missionProgress) {
      return null;
    }

    const state = this.#gameState.getState();

    // Remove from active missions
    const activeMissions = (state.missions.active || []).filter(
      (m) => m.missionId !== missionId,
    );
    this.#gameState.update("missions.active", activeMissions);

    // Remove from tracking
    this.#activeMissions.delete(missionId);

    // Refund a portion of the cost
    const refundAmount = Math.floor(missionProgress.mission.cost * 0.5);
    const newBalance = state.budget.balance + refundAmount;
    this.#gameState.update("budget.balance", newBalance);

    // Emit events
    this.#eventBus.emit("mission:cancelled", {
      missionId,
      missionName: missionProgress.mission.name,
      refundAmount,
    });

    this.#eventBus.emit("state:changed", {
      change: "mission-cancelled",
      missionId,
    });

    return missionProgress;
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    this.#eventBus.unsubscribe("mission:launch", this.#onMissionLaunch, this);
    this.#eventBus.unsubscribe("game:tick", this.#onGameTick, this);
    this.#activeMissions.clear();
  }

  /**
   * Handle mission:launch event
   * @private
   */
  #onMissionLaunch = (data) => {
    if (!data || !data.missionId) {
      console.error("Invalid mission:launch event data");
      return;
    }

    const { missionId, crewIds = [] } = data;
    try {
      this.launchMission(missionId, crewIds);
    } catch (error) {
      console.error(`Failed to launch mission ${missionId}:`, error);
      this.#eventBus.emit("mission:launch-failed", {
        missionId,
        reason: error.message,
      });
    }
  };

  /**
   * Handle game:tick event
   * @private
   */
  #onGameTick = (data) => {
    if (!data || typeof data.deltaTime !== "number") {
      console.error("Invalid game:tick event data");
      return;
    }

    try {
      this.updateProgress(data.deltaTime);
    } catch (error) {
      console.error("Failed to update mission progress:", error);
    }
  };
}

export default MissionSystem;
export { MissionSystem };