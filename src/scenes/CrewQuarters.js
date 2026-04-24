/**
 * Crew Quarters Scene Module
 * Manages crew management and interaction
 *
 * Displays and manages crew members with:
 * - Tab navigation (Roster/Applicants/Training)
 * - Card grid layout showing crew information
 * - Skill bars visualization
 * - Health and morale indicators
 * - Status badges
 * - Action buttons (Recruit/Train/Assign)
 */

import EventBus from '../game/EventBus.js';
import { CREW_ROLES, generateProceduralCrew, CREW_ROLES as ROLE_TEMPLATES } from '../data/crew.js';

class CrewQuarters {
  constructor(renderer = null, camera = null, config = {}) {
    this.name = 'CrewQuarters';
    this.renderer = renderer;
    this.camera = camera;
    this.config = config;

    this.sceneElement = null;
    this.tabsContainer = null;
    this.gridContainer = null;
    this.tabs = [];
    this.currentTab = 'roster';

    this.eventBus = EventBus.getInstance();
    this.crewMembers = {
      roster: [],
      applicants: [],
      training: [],
    };

    this.eventListeners = {
      crewUpdated: null,
      trainingComplete: null,
      budgetUpdated: null,
    };
  }

  init() {
    this.initialize();
  }

  /**
   * Initialize the crew quarters scene
   */
  initialize() {
    this.createSceneUI();
    this.attachEventListeners();
    this.generateInitialApplicants();
    this.updateCrewDisplay();
    console.log('CrewQuarters scene initialized');
  }

  /**
   * Generate initial applicants pool if empty
   */
  generateInitialApplicants() {
    if (this.crewMembers.applicants.length === 0) {
      const roleIds = Object.values(ROLE_TEMPLATES).map(r => r.id);
      const applicantCount = 5;

      for (let i = 0; i < applicantCount; i++) {
        const randomRoleId = roleIds[Math.floor(Math.random() * roleIds.length)];
        const crew = generateProceduralCrew(randomRoleId);
        crew.status = 'applicant';
        // Add individual skill stats
        crew.stats.piloting = Math.floor(Math.random() * 100);
        crew.stats.engineering = Math.floor(Math.random() * 100);
        crew.stats.science = Math.floor(Math.random() * 100);
        crew.stats.medical = Math.floor(Math.random() * 100);
        this.crewMembers.applicants.push(crew);
      }
    }
  }

  /**
   * Create the scene UI structure
   */
  createSceneUI() {
    // Main scene container
    this.sceneElement = document.createElement('div');
    this.sceneElement.id = 'crewQuarters';
    this.sceneElement.className = 'crew-quarters';

    // Header
    const header = document.createElement('div');
    header.className = 'crew-quarters__header';
    const title = document.createElement('h1');
    title.className = 'crew-quarters__title';
    title.textContent = 'CREW QUARTERS';
    header.appendChild(title);
    this.sceneElement.appendChild(header);

    // Tabs
    this.tabsContainer = document.createElement('div');
    this.tabsContainer.className = 'crew-quarters__tabs';

    const tabConfigs = [
      { id: 'roster', label: 'ROSTER', crew: 'roster' },
      { id: 'applicants', label: 'APPLICANTS', crew: 'applicants' },
      { id: 'training', label: 'TRAINING', crew: 'training' },
    ];

    tabConfigs.forEach((tabConfig) => {
      const tab = document.createElement('button');
      tab.className = 'crew-quarters__tab';
      tab.dataset.tab = tabConfig.id;
      tab.dataset.crew = tabConfig.crew;
      tab.textContent = tabConfig.label;
      if (tabConfig.id === this.currentTab) {
        tab.classList.add('crew-quarters__tab--active');
      }
      tab.addEventListener('click', (e) => this.handleTabClick(e));
      this.tabsContainer.appendChild(tab);
      this.tabs.push(tab);
    });

    this.sceneElement.appendChild(this.tabsContainer);

    // Grid container
    this.gridContainer = document.createElement('div');
    this.gridContainer.className = 'crew-quarters__grid';
    this.sceneElement.appendChild(this.gridContainer);

    // Append to body
    if (!document.getElementById('crewQuarters')) {
      document.body.appendChild(this.sceneElement);
    }
  }

  /**
   * Handle tab click events
   * @param {Event} event - Click event
   */
  handleTabClick(event) {
    const tabId = event.target.dataset.tab;
    this.switchTab(tabId);
  }

  /**
   * Switch to a different tab
   * @param {string} tabId - Tab identifier
   */
  switchTab(tabId) {
    this.currentTab = tabId;

    // Update tab styling
    this.tabs.forEach((tab) => {
      tab.classList.remove('crew-quarters__tab--active');
      if (tab.dataset.tab === tabId) {
        tab.classList.add('crew-quarters__tab--active');
      }
    });

    this.updateCrewDisplay();
  }

  /**
   * Update crew display based on current tab
   */
  updateCrewDisplay() {
    const crew = this.crewMembers[this.currentTab] || [];
    this.gridContainer.innerHTML = '';

    if (crew.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'crew-quarters__empty';
      emptyState.textContent = `No crew in ${this.currentTab}`;
      this.gridContainer.appendChild(emptyState);
      return;
    }

    crew.forEach((member) => {
      const card = this.createCrewCard(member);
      this.gridContainer.appendChild(card);
    });
  }

  /**
   * Create a crew member card
   * @param {Object} member - Crew member data
   * @returns {HTMLElement} Card element
   */
  createCrewCard(member) {
    const card = document.createElement('div');
    card.className = 'crew-card';
    card.dataset.memberId = member.id;

    // Header with name and role icon
    const header = document.createElement('div');
    header.className = 'crew-card__header';

    const nameSection = document.createElement('div');
    nameSection.className = 'crew-card__name-section';

    const name = document.createElement('h3');
    name.className = 'crew-card__name';
    name.textContent = `${member.firstName} ${member.lastName}`;
    nameSection.appendChild(name);

    const roleIcon = document.createElement('span');
    roleIcon.className = `crew-card__role-icon crew-card__role-icon--${member.role}`;
    roleIcon.title = this.getRoleName(member.role);
    nameSection.appendChild(roleIcon);

    header.appendChild(nameSection);

    // Status badge
    const statusBadge = document.createElement('span');
    statusBadge.className = `crew-card__status crew-card__status--${member.status}`;
    statusBadge.textContent = member.status.toUpperCase();
    header.appendChild(statusBadge);

    card.appendChild(header);

    // Skill bars
    const skillsSection = document.createElement('div');
    skillsSection.className = 'crew-card__skills';

    const skills = ['piloting', 'engineering', 'science', 'medical'];
    skills.forEach((skill) => {
      const skillBar = this.createSkillBar(skill, member.stats[skill] || 0);
      skillsSection.appendChild(skillBar);
    });

    card.appendChild(skillsSection);

    // Stats display
    const statsSection = document.createElement('div');
    statsSection.className = 'crew-card__stats';

    // Morale indicator
    const moraleDisplay = document.createElement('div');
    moraleDisplay.className = 'crew-card__stat';
    const moraleLabel = document.createElement('span');
    moraleLabel.className = 'crew-card__stat-label';
    moraleLabel.textContent = 'Morale';
    moraleDisplay.appendChild(moraleLabel);

    const moraleBarWrapper = document.createElement('div');
    moraleBarWrapper.className = 'crew-card__stat-bar';
    const moraleFill = document.createElement('div');
    moraleFill.className = 'crew-card__stat-fill crew-card__stat-fill--morale';
    moraleFill.style.width = `${member.stats?.morale || 0}%`;
    moraleBarWrapper.appendChild(moraleFill);
    moraleDisplay.appendChild(moraleBarWrapper);

    const moraleValue = document.createElement('span');
    moraleValue.className = 'crew-card__stat-value';
    moraleValue.textContent = `${member.stats?.morale || 0}`;
    moraleDisplay.appendChild(moraleValue);
    statsSection.appendChild(moraleDisplay);

    // Health indicator
    const healthDisplay = document.createElement('div');
    healthDisplay.className = 'crew-card__stat';
    const healthLabel = document.createElement('span');
    healthLabel.className = 'crew-card__stat-label';
    healthLabel.textContent = 'Health';
    healthDisplay.appendChild(healthLabel);

    const healthBarWrapper = document.createElement('div');
    healthBarWrapper.className = 'crew-card__stat-bar';
    const healthFill = document.createElement('div');
    healthFill.className = 'crew-card__stat-fill crew-card__stat-fill--health';
    healthFill.style.width = `${member.stats?.health || 0}%`;
    healthBarWrapper.appendChild(healthFill);
    healthDisplay.appendChild(healthBarWrapper);

    const healthValue = document.createElement('span');
    healthValue.className = 'crew-card__stat-value';
    healthValue.textContent = `${member.stats?.health || 0}`;
    healthDisplay.appendChild(healthValue);
    statsSection.appendChild(healthDisplay);

    card.appendChild(statsSection);

    // Action buttons
    const actionsSection = document.createElement('div');
    actionsSection.className = 'crew-card__actions';

    if (this.currentTab === 'applicants') {
      const recruitBtn = document.createElement('button');
      recruitBtn.className = 'crew-card__action-btn crew-card__action-btn--recruit';
      recruitBtn.textContent = 'RECRUIT';
      recruitBtn.addEventListener('click', () => this.handleRecruit(member));
      actionsSection.appendChild(recruitBtn);
    }

    if (this.currentTab === 'roster') {
      const trainBtn = document.createElement('button');
      trainBtn.className = 'crew-card__action-btn crew-card__action-btn--train';
      trainBtn.textContent = 'TRAIN';
      trainBtn.addEventListener('click', () => this.handleTrain(member));
      actionsSection.appendChild(trainBtn);

      if (member.status === 'available') {
        const assignBtn = document.createElement('button');
        assignBtn.className = 'crew-card__action-btn crew-card__action-btn--assign';
        assignBtn.textContent = 'ASSIGN';
        assignBtn.addEventListener('click', () => this.handleAssign(member));
        actionsSection.appendChild(assignBtn);
      }
    }

    card.appendChild(actionsSection);

    return card;
  }

  /**
   * Create a skill bar element
   * @param {string} skillName - Skill name
   * @param {number} level - Skill level (0-100)
   * @returns {HTMLElement} Skill bar element
   */
  createSkillBar(skillName, level) {
    const container = document.createElement('div');
    container.className = `crew-card__skill-bar crew-card__skill-bar--${skillName}`;

    const label = document.createElement('span');
    label.className = 'crew-card__skill-label';
    label.textContent = this.getSkillLabel(skillName);
    container.appendChild(label);

    const barWrapper = document.createElement('div');
    barWrapper.className = 'crew-card__skill-bar-wrapper';

    const bar = document.createElement('div');
    bar.className = `crew-card__skill-bar-fill crew-card__skill-bar-fill--${skillName}`;
    bar.style.width = `${level}%`;
    bar.title = `${skillName}: ${level}%`;
    barWrapper.appendChild(bar);

    container.appendChild(barWrapper);

    const value = document.createElement('span');
    value.className = 'crew-card__skill-value';
    value.textContent = `${level}`;
    container.appendChild(value);

    return container;
  }

  /**
   * Get skill label from skill name
   * @param {string} skillName - Skill name
   * @returns {string} Formatted skill label
   */
  getSkillLabel(skillName) {
    const labels = {
      piloting: 'Piloting',
      engineering: 'Engineering',
      science: 'Science',
      medical: 'Medical',
    };
    return labels[skillName] || skillName;
  }

  /**
   * Get role name from role ID
   * @param {string} roleId - Role ID
   * @returns {string} Role name
   */
  getRoleName(roleId) {
    const role = Object.values(CREW_ROLES).find((r) => r.id === roleId);
    return role ? role.name : roleId;
  }

  /**
   * Handle recruit action
   * @param {Object} member - Crew member
   */
  handleRecruit(member) {
    // Move from applicants to roster
    this.crewMembers.applicants = this.crewMembers.applicants.filter(c => c.id !== member.id);
    member.status = 'available';
    this.crewMembers.roster.push(member);

    // Emit recruitment event
    this.eventBus.emit('crew:recruit', { memberId: member.id });
    console.log(`Recruited ${member.firstName} ${member.lastName}`);

    // Generate new applicant to replace the recruited one
    const roleIds = Object.values(ROLE_TEMPLATES).map(r => r.id);
    const randomRoleId = roleIds[Math.floor(Math.random() * roleIds.length)];
    const newApplicant = generateProceduralCrew(randomRoleId);
    newApplicant.status = 'applicant';
    // Add individual skill stats
    newApplicant.stats.piloting = Math.floor(Math.random() * 100);
    newApplicant.stats.engineering = Math.floor(Math.random() * 100);
    newApplicant.stats.science = Math.floor(Math.random() * 100);
    newApplicant.stats.medical = Math.floor(Math.random() * 100);
    this.crewMembers.applicants.push(newApplicant);

    this.updateCrewDisplay();
  }

  /**
   * Handle train action
   * @param {Object} member - Crew member
   */
  handleTrain(member) {
    // Show training skill selector
    const skills = ['piloting', 'engineering', 'science', 'medical'];
    const skill = prompt(`Select skill to train (${skills.join(', ')}):`, 'piloting');

    if (skill && skills.includes(skill)) {
      this.eventBus.emit('crew:train', { memberId: member.id, skill });
      console.log(`Started training ${member.firstName} in ${skill}`);
    }
  }

  /**
   * Handle assign action
   * @param {Object} member - Crew member
   */
  handleAssign(member) {
    this.eventBus.emit('crew:assign', { memberId: member.id });
    console.log(`Assigned ${member.firstName} ${member.lastName}`);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Listen for crew updates
    this.eventListeners.crewUpdated = (data) => {
      this.handleCrewUpdated(data);
    };
    this.eventBus.subscribe('crew:updated', this.eventListeners.crewUpdated, this);

    // Listen for training complete
    this.eventListeners.trainingComplete = (data) => {
      this.handleTrainingComplete(data);
    };
    this.eventBus.subscribe(
      'crew:training-complete',
      this.eventListeners.trainingComplete,
      this
    );

    // Listen for budget updates
    this.eventListeners.budgetUpdated = (data) => {
      // Handle budget changes if needed
    };
    this.eventBus.subscribe('budget:updated', this.eventListeners.budgetUpdated, this);
  }

  /**
   * Handle crew updated event
   * @param {Object} data - Event data
   */
  handleCrewUpdated(data) {
    if (data && data.crew) {
      this.crewMembers = data.crew;
      this.updateCrewDisplay();
    }
  }

  /**
   * Handle training complete event
   * @param {Object} data - Event data
   */
  handleTrainingComplete(data) {
    if (data && data.memberId) {
      this.updateCrewDisplay();
    }
  }

  /**
   * Set crew data
   * @param {Array} roster - Roster crew
   * @param {Array} applicants - Applicant crew
   * @param {Array} training - Training crew
   */
  setCrewData(roster, applicants, training) {
    this.crewMembers = {
      roster: roster || [],
      applicants: applicants || [],
      training: training || [],
    };
    this.updateCrewDisplay();
  }

  update() {
    // Update crew quarters state
  }

  render() {
    // Render crew quarters
  }

  destroy() {
    this.cleanup();
  }

  /**
   * Cleanup the scene
   */
  cleanup() {
    // Unsubscribe from events
    if (this.eventListeners.crewUpdated) {
      this.eventBus.unsubscribe('crew:updated', this.eventListeners.crewUpdated, this);
    }
    if (this.eventListeners.trainingComplete) {
      this.eventBus.unsubscribe(
        'crew:training-complete',
        this.eventListeners.trainingComplete,
        this
      );
    }
    if (this.eventListeners.budgetUpdated) {
      this.eventBus.unsubscribe('budget:updated', this.eventListeners.budgetUpdated, this);
    }

    // Remove event listeners from tabs
    this.tabs.forEach((tab) => {
      tab.removeEventListener('click', null);
    });

    // Remove scene from DOM
    if (this.sceneElement && this.sceneElement.parentNode) {
      this.sceneElement.parentNode.removeChild(this.sceneElement);
    }

    // Reset references
    this.sceneElement = null;
    this.tabsContainer = null;
    this.gridContainer = null;
    this.tabs = [];
    this.crewMembers = { roster: [], applicants: [], training: [] };
    console.log('CrewQuarters scene cleaned up');
  }
}

export default CrewQuarters;