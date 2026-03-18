/**
 * Research System
 *
 * Manages technology research: tech tree, active research, progression, unlocks.
 * Technologies unlock new mission capabilities and improve agency capabilities.
 *
 * API:
 * - getAvailable() → array — tech nodes available to research
 * - startResearch(techId: string) → boolean — begin research on technology
 * - updateProgress(deltaTime: number) → void — advance active research
 * - completeResearch(techId: string) → void — unlock technology
 * - isUnlocked(techId: string) → boolean — check if tech is unlocked
 */

export class ResearchSystem {
  constructor(eventBus, researchData = {}, initialState = {}) {
    this.eventBus = eventBus;
    this.researchData = researchData;
    this.state = {
      completed: initialState.completed ?? [],
      active: initialState.active ?? null,
      available: initialState.available ?? [],
    };
  }

  /**
   * Get available technologies to research
   * @returns {array} - Tech nodes ready to research (IDs)
   */
  getAvailable() {
    return this.state.available.filter(
      (techId) => !this.state.completed.includes(techId),
    );
  }

  /**
   * Start researching a technology
   * @param {string} techId - Technology ID
   * @returns {boolean} - true if research started
   */
  startResearch(techId) {
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

  /**
   * Update research progress over time
   * @param {number} deltaTime - Time elapsed in milliseconds
   */
  updateProgress(deltaTime) {
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

  /**
   * Complete research and unlock technology
   * @param {string} techId - Technology ID
   */
  completeResearch(techId) {
    if (this.state.active?.techId === techId) {
      this.state.completed.push(techId);
      this.state.active = null;
      this.eventBus?.emit?.("research:completed", { techId });

      // Update available missions based on unlock
      this.eventBus?.emit?.("research:tech-unlocked", { techId });
    }
  }

  /**
   * Check if technology is unlocked
   * @param {string} techId - Technology ID
   * @returns {boolean} - true if unlocked
   */
  isUnlocked(techId) {
    return this.state.completed.includes(techId);
  }
}

export default ResearchSystem;
