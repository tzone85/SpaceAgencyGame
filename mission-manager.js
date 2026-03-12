/**
 * Mission Manager - Handles mission launches and budget validation
 */

class MissionManager {
  constructor(initialBudget = 1000000) {
    this.budget = initialBudget;
    this.missions = [];
  }

  /**
   * Add a mission to the available missions list
   * @param {Object} mission - Mission object with id, name, cost, description
   */
  addMission(mission) {
    if (!mission.id || !mission.name || mission.cost === undefined) {
      throw new Error('Mission must have id, name, and cost properties');
    }
    if (mission.cost < 0) {
      throw new Error('Mission cost cannot be negative');
    }
    this.missions.push(mission);
  }

  /**
   * Get all available missions
   * @returns {Array} Array of missions
   */
  getMissions() {
    return this.missions;
  }

  /**
   * Get current budget
   * @returns {number} Current budget value
   */
  getBudget() {
    return this.budget;
  }

  /**
   * Set budget to a new value
   * @param {number} amount - New budget amount
   */
  setBudget(amount) {
    if (amount < 0) {
      throw new Error('Budget cannot be negative');
    }
    this.budget = amount;
  }

  /**
   * Check if a mission can be launched (has sufficient budget)
   * @param {string} missionId - ID of the mission
   * @returns {Object} {canLaunch: boolean, reason: string}
   */
  canLaunchMission(missionId) {
    const mission = this.missions.find(m => m.id === missionId);
    
    if (!mission) {
      return { canLaunch: false, reason: 'Mission not found' };
    }

    if (this.budget < mission.cost) {
      return {
        canLaunch: false,
        reason: `Insufficient budget. Mission costs $${mission.cost.toLocaleString()}, but only $${this.budget.toLocaleString()} available`
      };
    }

    return { canLaunch: true, reason: 'Mission can be launched' };
  }

  /**
   * Launch a mission if budget is sufficient
   * @param {string} missionId - ID of the mission to launch
   * @returns {Object} {success: boolean, message: string, newBudget: number}
   */
  launchMission(missionId) {
    const validation = this.canLaunchMission(missionId);
    
    if (!validation.canLaunch) {
      return {
        success: false,
        message: validation.reason,
        newBudget: this.budget
      };
    }

    const mission = this.missions.find(m => m.id === missionId);
    this.budget -= mission.cost;

    return {
      success: true,
      message: `Mission "${mission.name}" launched successfully! Spent $${mission.cost.toLocaleString()}`,
      newBudget: this.budget
    };
  }
}

// Export for use in Node/module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MissionManager;
}
