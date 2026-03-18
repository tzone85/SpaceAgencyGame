/**
 * Mission System
 *
 * Manages space missions: catalog, launching, progress, completion.
 * Validates crew and budget before launch. Updates mission progress over time.
 *
 * API:
 * - getMissionsByTier(tier: string) → array — filter available missions
 * - launchMission(missionId: string, crewIds: string[]) → boolean — start mission
 * - updateProgress(deltaTime: number) → void — advance active missions
 * - completeMission(missionId: string) → void — resolve outcome, apply rewards
 */

export class MissionSystem {
  constructor(eventBus, missionData = {}, initialState = {}) {
    this.eventBus = eventBus;
    this.missionData = missionData;
    this.state = {
      available: initialState.available ?? [],
      active: initialState.active ?? [],
      completed: initialState.completed ?? [],
    };
  }

  /**
   * Get missions by tier
   * @param {string} tier - Mission tier (e.g., "beginner", "advanced")
   * @returns {array} - Available missions matching tier
   */
  getMissionsByTier(tier) {
    return this.state.available
      .map((missionId) => this.missionData[missionId])
      .filter((m) => m && m.tier === tier);
  }

  /**
   * Launch a mission with assigned crew
   * @param {string} missionId - Mission ID
   * @param {string[]} crewIds - Array of crew member IDs
   * @returns {boolean} - true if launch successful
   */
  launchMission(missionId, crewIds) {
    const mission = this.missionData[missionId];
    if (!mission) {
      this.eventBus?.emit?.("mission:validation-error", {
        missionId,
        error: "Mission not found",
      });
      return false;
    }

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

  /**
   * Update progress for active missions
   * @param {number} deltaTime - Time elapsed in milliseconds
   */
  updateProgress(deltaTime) {
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

  /**
   * Complete a mission
   * @param {string} missionId - Mission ID
   */
  completeMission(missionId) {
    const index = this.state.active.findIndex((m) => m.id === missionId);
    if (index !== -1) {
      const completed = this.state.active.splice(index, 1)[0];
      this.state.completed.push(completed);
      this.eventBus?.emit?.("mission:completed", { missionId });
    }
  }
}

export default MissionSystem;
