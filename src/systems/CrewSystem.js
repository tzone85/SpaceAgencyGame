/**
 * CrewSystem - Crew Management & Progression System
 *
 * Manages crew roster, recruitment, mission assignments, skill training,
 * and morale. Handles all crew-related state updates and event emissions.
 *
 * Integrates with GameState for persistence and EventBus for event-driven updates.
 *
 * API:
 * - recruit(crewMember: object) → void — add crew to roster
 * - assignToCrew(crewId: string, missionId: string) → boolean — assign to mission
 * - trainCrew(crewId: string, program: string) → void — start training
 * - updateMorale(crewId: string, delta: number) → void — adjust morale
 * - getAvailable() → array — get available crew members
 */

import EventBus from "../game/EventBus.js";
import {
  CREW_ROLES,
  CREW_STATS,
  generateProceduralCrew,
  getFamousAstronaut,
  FAMOUS_ASTRONAUTS,
} from "../data/crew.js";

class CrewSystem {
  /**
   * Initialize CrewSystem
   * @param {GameState|EventBus} eventBusOrGameState - Reference to the GameState instance or EventBus
   * @param {object} crewData - Legacy crew data
   * @param {object} initialState - Legacy initial state
   */
  constructor(eventBusOrGameState, crewData = {}, initialState = {}) {
    // Handle both legacy and new constructor signatures
    if (eventBusOrGameState && eventBusOrGameState.getState) {
      // New signature with GameState
      this.gameState = eventBusOrGameState;
      this.eventBus = EventBus.getInstance();
    } else {
      // Legacy signature
      this.eventBus = eventBusOrGameState;
      this.crewData = crewData;
    }
    
    this.crewMembers = new Map(); // crewId -> crewMember
    this.missionAssignments = new Map(); // missionId -> Set of crewIds
    this.crewMissionMap = new Map(); // crewId -> current missionId (null if unassigned)

    // Legacy state structure
    this.state = {
      roster: initialState.roster ?? [],
      assigned: initialState.assigned ?? {},
      training: initialState.training ?? [],
    };

    // Store bound methods for cleanup
    this.boundOnCrewRecruit = this.onCrewRecruit.bind(this);
    this.boundOnCrewAssign = this.onCrewAssign.bind(this);
    this.boundOnMissionCompleted = this.onMissionCompleted.bind(this);

    this.initializeEventListeners();
  }

  /**
   * Initialize event listeners for crew-related events
   */
  initializeEventListeners() {
    this.eventBus?.subscribe?.("crew:recruit", this.boundOnCrewRecruit);
    this.eventBus?.subscribe?.("crew:assign", this.boundOnCrewAssign);
    this.eventBus?.subscribe?.("mission:completed", this.boundOnMissionCompleted);
  }

  /**
   * Recruit a new crew member
   * @param {object|string} crewMember - Crew member object or crew ID
   * @returns {Object} The recruited crew member
   */
  recruit(crewMember) {
    // Handle both legacy object format and new ID format
    if (typeof crewMember === 'string') {
      const crewId = crewMember;
      
      // Validate crew doesn't already exist in roster
      if (this.crewMembers.has(crewId)) {
        throw new Error(`Crew member ${crewId} is already recruited`);
      }

      let crewData;

      // Check if it's a famous astronaut
      const isFamous = FAMOUS_ASTRONAUTS.some((a) => a.id === crewId);
      if (isFamous) {
        crewData = getFamousAstronaut(crewId);
      } else {
        // Otherwise treat as procedural crew ID (role-based)
        crewData = generateProceduralCrew(crewId);
      }

      // Add required fields for tracking
      const newCrewMember = {
        ...crewData,
        isRecruited: true,
        recruitedAt: Date.now(),
        skills: {}, // Map of skillName -> skillLevel (0-100)
        assignedMissionId: null,
      };

      this.crewMembers.set(crewId, newCrewMember);
      this.crewMissionMap.set(crewId, null);

      // Deduct recruitment cost from budget if gameState exists
      if (this.gameState) {
        const cost = crewData.recruitmentCost;
        this.gameState.update(
          "budget.balance",
          this.gameState.getState().budget.balance - cost,
        );

        // Update GameState with new crew
        const currentRoster = this.gameState.getState().crew.roster;
        this.gameState.update("crew.roster", [...currentRoster, newCrewMember]);

        // Emit budget event
        this.eventBus.emit("budget:deduct", {
          amount: cost,
          reason: "crew_recruitment",
          crewId,
        });
      }

      // Legacy roster update
      this.state.roster.push(newCrewMember);

      // Emit events
      this.eventBus.emit("crew:updated", {
        action: "recruited",
        crewId,
        crewMember: newCrewMember,
        crew: newCrewMember,
      });
      this.eventBus.emit("state:changed", {
        system: "crew",
        action: "recruit",
        data: newCrewMember,
      });

      return newCrewMember;
    } else {
      // Legacy object format
      const newCrew = {
        ...crewMember,
        id: crewMember.id || `crew_${Date.now()}`,
        morale: crewMember.morale ?? 75,
        health: crewMember.health ?? 100,
        experience: crewMember.experience ?? 0,
      };
      this.state.roster.push(newCrew);
      this.eventBus?.emit?.('crew:updated', { crew: newCrew });
      return newCrew;
    }
  }

  /**
   * Assign crew member to a mission
   * @param {string} crewId - Crew member ID
   * @param {string} missionId - Mission ID
   * @returns {boolean|Object} - true if assignment successful (legacy) or assignment result object (new)
   */
  assignToCrew(crewId, missionId) {
    // Legacy behavior
    const crew = this.state.roster.find(c => c.id === crewId);
    if (!crew) {
      return false;
    }
    if (this.state.assigned[crewId]) {
      return false; // Already assigned
    }
    this.state.assigned[crewId] = missionId;

    // New behavior
    if (this.crewMembers.has(crewId)) {
      const crewMember = this.crewMembers.get(crewId);
      
      // Check if already assigned to another mission
      if (crewMember.assignedMissionId !== null) {
        return false;
      }

      // Update crew member's mission assignment
      crewMember.assignedMissionId = missionId;
      this.crewMembers.set(crewId, crewMember);
      this.crewMissionMap.set(crewId, missionId);

      // Track crew by mission
      if (!this.missionAssignments.has(missionId)) {
        this.missionAssignments.set(missionId, new Set());
      }
      this.missionAssignments.get(missionId).add(crewId);

      // Update GameState if available
      if (this.gameState) {
        this.syncCrewToGameState();
      }
    }

    this.eventBus?.emit?.('crew:updated', {
      crewId,
      missionId,
      status: 'assigned',
      action: "assigned",
      crewMember: crew,
    });
    this.eventBus.emit("state:changed", {
      system: "crew",
      action: "assign_to_mission",
      data: { crewId, missionId },
    });
    
    return true;
  }

  /**
   * Assign a crew member to a mission (new method name)
   * @param {string} crewId - The crew member ID
   * @param {string} missionId - The mission ID
   * @returns {Object} The assignment result
   */
  assignToMission(crewId, missionId) {
    // Validate crew exists
    if (!this.crewMembers.has(crewId) && !this.state.roster.find(c => c.id === crewId)) {
      throw new Error(`Crew member ${crewId} not found`);
    }

    // Check if already assigned
    const crewMember = this.getCrewMember(crewId);
    if (crewMember && crewMember.assignedMissionId !== null && crewMember.assignedMissionId !== undefined) {
      throw new Error(`Crew member ${crewId} already assigned to mission ${crewMember.assignedMissionId}`);
    }

    const result = this.assignToCrew(crewId, missionId);
    if (result === false) {
      throw new Error(`Failed to assign crew member ${crewId} to mission ${missionId}`);
    }
    return { crewId, missionId, crewMember };
  }

  /**
   * Unassign a crew member from their current mission
   * @param {string} crewId - The crew member ID
   * @returns {Object} The unassignment result
   */
  unassign(crewId) {
    // Validate crew exists
    if (!this.crewMembers.has(crewId)) {
      throw new Error(`Crew member ${crewId} not found`);
    }

    const crewMember = this.crewMembers.get(crewId);
    const missionId = crewMember.assignedMissionId;

    // Check if crew is actually assigned
    if (missionId === null) {
      throw new Error(`Crew member ${crewId} is not assigned to any mission`);
    }

    // Update crew member
    crewMember.assignedMissionId = null;
    this.crewMembers.set(crewId, crewMember);
    this.crewMissionMap.set(crewId, null);

    // Remove from mission assignments
    if (this.missionAssignments.has(missionId)) {
      this.missionAssignments.get(missionId).delete(crewId);
    }

    // Legacy state update
    delete this.state.assigned[crewId];

    // Update GameState
    if (this.gameState) {
      this.syncCrewToGameState();
    }

    // Emit events
    this.eventBus.emit("crew:updated", {
      action: "unassigned",
      crewId,
      missionId,
      crewMember,
    });
    this.eventBus.emit("state:changed", {
      system: "crew",
      action: "unassign_from_mission",
      data: { crewId, missionId },
    });

    return { crewId, missionId, crewMember };
  }

  /**
   * Start training program for crew member
   * @param {string} crewId - Crew member ID
   * @param {string} program - Training program name or skill name
   * @returns {Object} The training result
   */
  trainCrew(crewId, program) {
    const crew = this.state.roster.find(c => c.id === crewId);
    if (crew) {
      this.state.training.push({
        crewId,
        program,
        startTime: Date.now(),
        progress: 0,
      });
      this.eventBus?.emit?.('crew:training-started', { crewId, program });
    }

    // New training behavior
    if (this.crewMembers.has(crewId)) {
      // Validate skill exists
      const validSkills = Object.keys(CREW_STATS);
      if (!validSkills.includes(program)) {
        if (this.gameState) {
          throw new Error(`Invalid skill: ${program}`);
        }
        // If not a valid skill in legacy mode, just return
        return { crewId, program };
      }

      const crewMember = this.crewMembers.get(crewId);

      // Initialize skill if not present
      if (crewMember.skills[program] === undefined) {
        crewMember.skills[program] = 0;
      }

      // Increase skill level by 5 (capped at 100)
      const skillIncrease = 5;
      const oldLevel = crewMember.skills[program];
      crewMember.skills[program] = Math.min(100, oldLevel + skillIncrease);

      const newLevel = crewMember.skills[program];

      this.crewMembers.set(crewId, crewMember);

      // Update GameState
      if (this.gameState) {
        this.syncCrewToGameState();
      }

      // Emit events
      this.eventBus.emit("crew:updated", {
        action: "trained",
        crewId,
        skillName: program,
        oldLevel,
        newLevel,
        crewMember,
      });
      this.eventBus.emit("state:changed", {
        system: "crew",
        action: "train_skill",
        data: { crewId, skillName: program, newLevel },
      });

      return { crewId, skillName: program, oldLevel, newLevel, crewMember };
    }

    // Check if crew not found when using new system
    if (this.gameState && !crew) {
      throw new Error(`Crew member ${crewId} not found`);
    }

    return { crewId, program };
  }

  /**
   * Update crew morale
   * @param {string} crewId - Crew member ID
   * @param {number} delta - Morale change
   * @returns {Object} The morale update result
   */
  updateMorale(crewId, delta) {
    // Legacy behavior
    const crew = this.state.roster.find(c => c.id === crewId);
    if (crew) {
      crew.morale = Math.max(0, Math.min(100, crew.morale + delta));
      this.eventBus?.emit?.('crew:morale-updated', {
        crewId,
        morale: crew.morale,
      });
    }

    // New behavior
    if (this.crewMembers.has(crewId)) {
      // Validate delta is a number
      if (typeof delta !== "number") {
        throw new Error("Morale delta must be a number");
      }

      const crewMember = this.crewMembers.get(crewId);
      const oldMorale = crewMember.stats.morale;

      // Update morale, capped between 0 and 100
      crewMember.stats.morale = Math.max(0, Math.min(100, oldMorale + delta));

      const newMorale = crewMember.stats.morale;

      this.crewMembers.set(crewId, crewMember);

      // Update GameState
      if (this.gameState) {
        this.syncCrewToGameState();
      }

      // Emit events
      this.eventBus.emit("crew:updated", {
        action: "morale_updated",
        crewId,
        oldMorale,
        newMorale,
        delta,
        crewMember,
      });
      this.eventBus.emit("state:changed", {
        system: "crew",
        action: "update_morale",
        data: { crewId, oldMorale, newMorale, delta },
      });

      return { crewId, oldMorale, newMorale, delta, crewMember };
    }

    // Check if crew not found when using new system
    if (this.gameState && !crew) {
      throw new Error(`Crew member ${crewId} not found`);
    }

    return { crewId, delta };
  }

  /**
   * Get a crew member by ID
   * @param {string} crewId - The crew member ID
   * @returns {Object|null} The crew member or null if not found
   */
  getCrewMember(crewId) {
    return this.crewMembers.get(crewId) || this.state.roster.find(c => c.id === crewId) || null;
  }

  /**
   * Get all recruited crew members
   * @returns {Array} Array of crew members
   */
  getAllCrew() {
    const newCrew = Array.from(this.crewMembers.values());
    return newCrew.length > 0 ? newCrew : this.state.roster;
  }

  /**
   * Get crew assigned to a specific mission
   * @param {string} missionId - The mission ID
   * @returns {Array} Array of crew members assigned to the mission
   */
  getCrewByMission(missionId) {
    const crewIds = this.missionAssignments.get(missionId) || new Set();
    const newCrewList = Array.from(crewIds).map((id) => this.crewMembers.get(id)).filter(Boolean);

    // Return new crew list if available, otherwise fall back to legacy
    if (newCrewList.length > 0 || this.crewMembers.size > 0) {
      return newCrewList;
    }

    // Also check legacy assigned state
    const legacyAssigned = Object.entries(this.state.assigned)
      .filter(([_, assignedMissionId]) => assignedMissionId === missionId)
      .map(([crewId, _]) => this.state.roster.find(c => c.id === crewId))
      .filter(Boolean);

    return legacyAssigned;
  }

  /**
   * Get unassigned crew members
   * @returns {Array} Array of unassigned crew members
   */
  getUnassignedCrew() {
    const newUnassigned = Array.from(this.crewMembers.values()).filter(
      (crew) => crew.assignedMissionId === null,
    );
    
    const legacyUnassigned = this.state.roster.filter(c => !this.state.assigned[c.id]);
    
    return newUnassigned.length > 0 ? newUnassigned : legacyUnassigned;
  }

  /**
   * Get available crew members
   * @returns {array} - Crew members not currently assigned
   */
  getAvailable() {
    return this.getUnassignedCrew();
  }

  /**
   * Sync crew state to GameState
   */
  syncCrewToGameState() {
    if (this.gameState) {
      const roster = Array.from(this.crewMembers.values());
      this.gameState.update("crew.roster", roster);
    }
  }

  /**
   * Handle crew recruit event from EventBus
   */
  onCrewRecruit(data) {
    const crewId = data?.crewId || data?.memberId;
    if (data && crewId) {
      try {
        this.recruit(crewId);
      } catch (error) {
        console.error("Error recruiting crew from event:", error);
      }
    }
  }

  /**
   * Handle crew assign event from EventBus
   */
  onCrewAssign(data) {
    const crewId = data?.crewId || data?.memberId;
    if (data && crewId && data.missionId) {
      try {
        this.assignToMission(crewId, data.missionId);
      } catch (error) {
        console.error("Error assigning crew from event:", error);
      }
    }
  }

  /**
   * Handle mission completed event - increase crew experience
   */
  onMissionCompleted(data) {
    if (data && data.missionId) {
      const crewOnMission = this.getCrewByMission(data.missionId);

      crewOnMission.forEach((crewMember) => {
        if (crewMember) {
          const crewId = crewMember.id;

          // Check mission outcome (success vs failure)
          const missionSuccess = data.outcome?.success !== false;

          if (missionSuccess) {
            // Increase experience by 5 points for new crew system
            if (this.crewMembers.has(crewId)) {
              crewMember.stats.experience = Math.min(
                100,
                crewMember.stats.experience + 5,
              );

              // Increase morale slightly for successful mission
              this.updateMorale(crewId, 5);

              // Auto-unassign from mission
              try {
                this.unassign(crewId);
              } catch (error) {
                console.error(
                  `Error unassigning crew ${crewId} after mission:`,
                  error,
                );
              }
            } else {
              // Legacy crew system - just update morale
              this.updateMorale(crewId, 5);

              // Remove from legacy assigned state
              delete this.state.assigned[crewId];
            }
          } else {
            // Mission failed - handle crew injury/loss
            this.handleMissionFailure(crewId);
          }
        }
      });
    }
  }

  /**
   * Handle crew injury or loss from mission failure
   * @param {string} crewId - Crew member ID
   */
  handleMissionFailure(crewId) {
    if (this.crewMembers.has(crewId)) {
      const crewMember = this.crewMembers.get(crewId);

      // 50% chance of injury vs loss
      const isInjured = Math.random() < 0.5;

      if (isInjured) {
        // Crew is injured - reduce health and morale, mark as recovering
        crewMember.stats.health = Math.max(0, crewMember.stats.health - 30);
        crewMember.stats.morale = Math.max(0, crewMember.stats.morale - 20);
        crewMember.status = 'recovering';

        this.eventBus.emit("crew:injured", {
          crewId,
          crewMember,
          healthLoss: 30,
          moraleLoss: 20,
        });
      } else {
        // Crew is lost - mark as lost and remove from missions
        crewMember.status = 'lost';
        crewMember.assignedMissionId = null;
        this.crewMissionMap.set(crewId, null);

        this.eventBus.emit("crew:lost", {
          crewId,
          crewMember,
        });
      }

      this.crewMembers.set(crewId, crewMember);

      // Update GameState
      if (this.gameState) {
        this.syncCrewToGameState();
      }

      // Emit crew updated event
      this.eventBus.emit("crew:updated", {
        action: isInjured ? "injured" : "lost",
        crewId,
        crewMember,
      });
    } else {
      // Legacy crew system
      const crew = this.state.roster.find(c => c.id === crewId);
      if (crew) {
        crew.health = Math.max(0, crew.health - 30);
        crew.morale = Math.max(0, crew.morale - 20);
        crew.status = 'injured';
      }
      delete this.state.assigned[crewId];
    }
  }

  /**
   * Destroy the crew system and clean up event listeners
   */
  destroy() {
    this.eventBus?.unsubscribe?.("crew:recruit", this.boundOnCrewRecruit);
    this.eventBus?.unsubscribe?.("crew:assign", this.boundOnCrewAssign);
    this.eventBus?.unsubscribe?.(
      "mission:completed",
      this.boundOnMissionCompleted,
    );
    this.crewMembers.clear();
    this.missionAssignments.clear();
    this.crewMissionMap.clear();
  }
}

export default CrewSystem;