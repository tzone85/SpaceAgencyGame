/**
 * Mission Control Scene Module
 *
 * Manages mission planning and control operations with real-time mission tracking.
 * Displays:
 * - Active missions with progress tracking
 * - Mission phases (Planning → Preparation → Launch → Transit → Arrival → Return)
 * - Progress bars for each phase
 * - Mission outcomes and results
 */

import EventBus from '../game/EventBus.js';
import GameState from '../game/GameState.js';
import MissionSystem from '../systems/MissionSystem.js';
import { getMissionsByTier } from '../data/missions.js';

class MissionControl {
  constructor(renderer = null, camera = null, config = {}) {
    this.name = 'MissionControl';
    this.renderer = renderer;
    this.camera = camera;
    this.config = config;

    this.sceneElement = null;
    this.missionsContainer = null;
    this.completedContainer = null;

    this.eventBus = EventBus.getInstance();
    this.gameState = new GameState();
    this.missionSystem = new MissionSystem(this.eventBus, this.gameState);

    this.activeMissions = [];
    this.completedMissions = [];

    this.eventListeners = {
      missionStarted: null,
      missionPhaseChanged: null,
      missionCompleted: null,
    };

    this.updateInterval = null;
  }

  init() {
    this.initialize();
  }

  /**
   * Initialize the mission control scene
   */
  initialize() {
    this.createSceneUI();
    this.attachEventListeners();
    this.updateMissionsDisplay();
    this.startUpdateLoop();
    console.log('MissionControl scene initialized');
  }

  /**
   * Create the scene UI structure
   */
  createSceneUI() {
    // Main scene container
    this.sceneElement = document.createElement('div');
    this.sceneElement.id = 'missionControl';
    this.sceneElement.className = 'mission-control';

    // Header
    const header = document.createElement('div');
    header.className = 'mission-control__header';
    const title = document.createElement('h1');
    title.className = 'mission-control__title';
    title.textContent = 'MISSION CONTROL';
    header.appendChild(title);
    this.sceneElement.appendChild(header);

    // Active Missions Section
    const activeSection = document.createElement('div');
    activeSection.className = 'mission-control__section';

    const activeTitle = document.createElement('h2');
    activeTitle.className = 'mission-control__section-title';
    activeTitle.textContent = 'ACTIVE MISSIONS';
    activeSection.appendChild(activeTitle);

    this.missionsContainer = document.createElement('div');
    this.missionsContainer.className = 'mission-control__missions-list';
    activeSection.appendChild(this.missionsContainer);

    this.sceneElement.appendChild(activeSection);

    // Completed Missions Section
    const completedSection = document.createElement('div');
    completedSection.className = 'mission-control__section';

    const completedTitle = document.createElement('h2');
    completedTitle.className = 'mission-control__section-title';
    completedTitle.textContent = 'COMPLETED MISSIONS';
    completedSection.appendChild(completedTitle);

    this.completedContainer = document.createElement('div');
    this.completedContainer.className = 'mission-control__completed-list';
    completedSection.appendChild(this.completedContainer);

    this.sceneElement.appendChild(completedSection);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    this.eventListeners.missionStarted = this.eventBus.subscribe(
      'mission:started',
      (data) => {
        console.log('Mission started:', data);
        this.updateMissionsDisplay();
      }
    );

    this.eventListeners.missionPhaseChanged = this.eventBus.subscribe(
      'mission:phase-changed',
      (data) => {
        console.log('Mission phase changed:', data);
        this.updateMissionsDisplay();
      }
    );

    this.eventListeners.missionCompleted = this.eventBus.subscribe(
      'mission:completed',
      (data) => {
        console.log('Mission completed:', data);
        this.updateMissionsDisplay();
      }
    );
  }

  /**
   * Update the missions display
   */
  updateMissionsDisplay() {
    const state = this.gameState.getState();
    const activeMissions = state.missions.active || [];
    const completedMissions = state.missions.completed || [];

    this.updateActiveMissionsDisplay(activeMissions);
    this.updateCompletedMissionsDisplay(completedMissions);
  }

  /**
   * Update active missions display
   */
  updateActiveMissionsDisplay(activeMissions) {
    this.missionsContainer.innerHTML = '';

    if (activeMissions.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'mission-control__empty';
      emptyMsg.textContent = 'No active missions';
      this.missionsContainer.appendChild(emptyMsg);
      return;
    }

    for (const mission of activeMissions) {
      const missionCard = this.createMissionCard(mission);
      this.missionsContainer.appendChild(missionCard);
    }
  }

  /**
   * Update completed missions display
   */
  updateCompletedMissionsDisplay(completedMissions) {
    this.completedContainer.innerHTML = '';

    if (completedMissions.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'mission-control__empty';
      emptyMsg.textContent = 'No completed missions';
      this.completedContainer.appendChild(emptyMsg);
      return;
    }

    // Show last 10 completed missions
    const recent = completedMissions.slice(-10).reverse();
    for (const mission of recent) {
      const card = this.createCompletedMissionCard(mission);
      this.completedContainer.appendChild(card);
    }
  }

  /**
   * Create a mission card for active mission
   */
  createMissionCard(mission) {
    const progress = this.missionSystem.getMissionProgress(mission.missionId);

    const card = document.createElement('div');
    card.className = 'mission-card';
    card.dataset.missionId = mission.missionId;

    // Mission header
    const header = document.createElement('div');
    header.className = 'mission-card__header';

    const titleEl = document.createElement('h3');
    titleEl.className = 'mission-card__title';
    titleEl.textContent = progress?.missionName || 'Unknown Mission';
    header.appendChild(titleEl);

    const statusEl = document.createElement('div');
    statusEl.className = 'mission-card__status';
    statusEl.textContent = `Status: ${progress?.currentPhase || 'Unknown'}`;
    header.appendChild(statusEl);

    card.appendChild(header);

    // Progress bars for each phase
    if (progress?.phasesProgress) {
      const phasesContainer = document.createElement('div');
      phasesContainer.className = 'mission-card__phases';

      for (const phaseData of progress.phasesProgress) {
        const phaseEl = this.createPhaseProgressBar(phaseData);
        phasesContainer.appendChild(phaseEl);
      }

      card.appendChild(phasesContainer);
    }

    // Overall progress
    if (progress) {
      const overallContainer = document.createElement('div');
      overallContainer.className = 'mission-card__overall';

      const overallLabel = document.createElement('div');
      overallLabel.className = 'mission-card__overall-label';
      overallLabel.textContent = 'Overall Progress';
      overallContainer.appendChild(overallLabel);

      const overallBar = document.createElement('div');
      overallBar.className = 'progress-bar';
      const overallFill = document.createElement('div');
      overallFill.className = 'progress-bar__fill';
      overallFill.style.width = `${Math.min(progress.overallProgress, 100)}%`;
      overallBar.appendChild(overallFill);

      const overallPercent = document.createElement('div');
      overallPercent.className = 'progress-bar__text';
      overallPercent.textContent = `${Math.round(progress.overallProgress)}%`;
      overallBar.appendChild(overallPercent);

      overallContainer.appendChild(overallBar);
      card.appendChild(overallContainer);
    }

    return card;
  }

  /**
   * Create phase progress bar element
   */
  createPhaseProgressBar(phaseData) {
    const container = document.createElement('div');
    container.className = 'mission-card__phase';
    if (phaseData.completed) {
      container.classList.add('mission-card__phase--completed');
    }

    const label = document.createElement('div');
    label.className = 'mission-card__phase-label';
    label.textContent = phaseData.phase;
    container.appendChild(label);

    const bar = document.createElement('div');
    bar.className = 'progress-bar progress-bar--small';

    const fill = document.createElement('div');
    fill.className = 'progress-bar__fill';
    fill.style.width = `${Math.min(phaseData.progressPercent, 100)}%`;
    bar.appendChild(fill);

    const text = document.createElement('div');
    text.className = 'progress-bar__text progress-bar__text--small';
    text.textContent = `${Math.round(phaseData.progressPercent)}%`;
    bar.appendChild(text);

    container.appendChild(bar);
    return container;
  }

  /**
   * Create a card for completed mission
   */
  createCompletedMissionCard(mission) {
    const card = document.createElement('div');
    card.className = 'mission-card mission-card--completed';
    card.dataset.missionId = mission.missionId;

    // Header
    const header = document.createElement('div');
    header.className = 'mission-card__header';

    const titleEl = document.createElement('h3');
    titleEl.className = 'mission-card__title';
    titleEl.textContent = mission.missionName;
    header.appendChild(titleEl);

    const statusEl = document.createElement('div');
    statusEl.className = `mission-card__status ${mission.success ? 'mission-card__status--success' : 'mission-card__status--failure'}`;
    statusEl.textContent = mission.success ? '✓ SUCCESS' : '✗ FAILED';
    header.appendChild(statusEl);

    card.appendChild(header);

    // Outcome details
    const details = document.createElement('div');
    details.className = 'mission-card__details';

    const outcomeEl = document.createElement('div');
    outcomeEl.className = 'mission-card__outcome';
    outcomeEl.textContent = mission.outcome || 'Mission completed';
    details.appendChild(outcomeEl);

    const fundingEl = document.createElement('div');
    fundingEl.className = 'mission-card__funding';
    fundingEl.innerHTML = `Funding: <strong>$${mission.revenue?.toLocaleString() || '0'}</strong>`;
    details.appendChild(fundingEl);

    const reputationEl = document.createElement('div');
    reputationEl.className = `mission-card__reputation ${mission.reputation >= 0 ? 'mission-card__reputation--positive' : 'mission-card__reputation--negative'}`;
    reputationEl.innerHTML = `Reputation: <strong>${mission.reputation >= 0 ? '+' : ''}${mission.reputation}</strong>`;
    details.appendChild(reputationEl);

    card.appendChild(details);

    return card;
  }

  /**
   * Start update loop to refresh display
   */
  startUpdateLoop() {
    this.updateInterval = setInterval(() => {
      this.updateMissionsDisplay();
    }, 500); // Update every 500ms
  }

  /**
   * Stop update loop
   */
  stopUpdateLoop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  update() {
    // Update mission control state
  }

  render() {
    // Render mission control
  }

  destroy() {
    // Clean up event listeners
    if (this.eventListeners.missionStarted) {
      this.eventListeners.missionStarted();
    }
    if (this.eventListeners.missionPhaseChanged) {
      this.eventListeners.missionPhaseChanged();
    }
    if (this.eventListeners.missionCompleted) {
      this.eventListeners.missionCompleted();
    }

    // Stop update loop
    this.stopUpdateLoop();

    // Destroy mission system
    if (this.missionSystem) {
      this.missionSystem.destroy();
    }
  }
}

export default MissionControl;
export { MissionControl };
