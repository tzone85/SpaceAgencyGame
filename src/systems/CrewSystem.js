/**
 * Crew System
 *
 * Manages crew members: recruitment, assignment, training, morale.
 * Maintains roster of available and assigned crew.
 *
 * API:
 * - recruit(crewMember: object) → void — add crew to roster
 * - assignToCrew(crewId: string, missionId: string) → boolean — assign to mission
 * - trainCrew(crewId: string, program: string) → void — start training
 * - updateMorale(crewId: string, delta: number) → void — adjust morale
 * - getAvailable() → array — get available crew members
 */

export class CrewSystem {
  constructor(eventBus, crewData = {}, initialState = {}) {
    this.eventBus = eventBus;
    this.crewData = crewData;
    this.state = {
      roster: initialState.roster ?? [],
      assigned: initialState.assigned ?? {},
      training: initialState.training ?? [],
    };
  }

  /**
   * Recruit a new crew member
   * @param {object} crewMember - Crew member object
   */
  recruit(crewMember) {
    const newCrew = {
      ...crewMember,
      id: crewMember.id || `crew_${Date.now()}`,
      morale: crewMember.morale ?? 75,
      health: crewMember.health ?? 100,
      experience: crewMember.experience ?? 0,
    };
    this.state.roster.push(newCrew);
    this.eventBus?.emit?.('crew:updated', { crew: newCrew });
  }

  /**
   * Assign crew member to a mission
   * @param {string} crewId - Crew member ID
   * @param {string} missionId - Mission ID
   * @returns {boolean} - true if assignment successful
   */
  assignToCrew(crewId, missionId) {
    const crew = this.state.roster.find(c => c.id === crewId);
    if (!crew) {
      return false;
    }
    if (this.state.assigned[crewId]) {
      return false; // Already assigned
    }
    this.state.assigned[crewId] = missionId;
    this.eventBus?.emit?.('crew:updated', {
      crewId,
      missionId,
      status: 'assigned',
    });
    return true;
  }

  /**
   * Start training program for crew member
   * @param {string} crewId - Crew member ID
   * @param {string} program - Training program name
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
  }

  /**
   * Update crew morale
   * @param {string} crewId - Crew member ID
   * @param {number} delta - Morale change
   */
  updateMorale(crewId, delta) {
    const crew = this.state.roster.find(c => c.id === crewId);
    if (crew) {
      crew.morale = Math.max(0, Math.min(100, crew.morale + delta));
      this.eventBus?.emit?.('crew:morale-updated', {
        crewId,
        morale: crew.morale,
      });
    }
  }

  /**
   * Get available crew members
   * @returns {array} - Crew members not currently assigned
   */
  getAvailable() {
    return this.state.roster.filter(c => !this.state.assigned[c.id]);
  }
}

export default CrewSystem;
