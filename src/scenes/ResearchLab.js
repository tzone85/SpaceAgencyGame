/**
 * Research Lab Scene Module
 * Manages research and development activities
 *
 * Displays a horizontal tech tree with research nodes organized by category.
 * Nodes have different states: completed (cyan glow + checkmark), available (white border, clickable),
 * locked (grey, shows prerequisites), active (pulsing purple + progress bar).
 *
 * Features:
 * - Horizontal tech tree layout with 5 categories: Propulsion, Life Support, Communications, Materials, AI
 * - Detail panel showing research name, description, cost, duration, unlocks
 * - Research initiation with event emission (budget:deduct, research:start)
 * - Event listeners for research lifecycle and budget updates
 */

import EventBus from '../game/EventBus.js';
import { getAllResearch, ResearchCategories, canStartResearch, getResearchById } from '../data/research.js';

export class ResearchLab {
  constructor() {
    this.name = 'ResearchLab';
    this.sceneElement = null;
    this.techTreeContainer = null;
    this.detailPanel = null;
    this.nodeElements = new Map();
    this.selectedNode = null;
    this.eventBus = EventBus.getInstance();
    this.completedResearch = new Set();
    this.activeResearch = null;
    this.researchProgress = new Map();
  }

  init() {
    // Initialize research lab
    this.initialize();
  }

  /**
   * Initialize the Research Lab scene
   */
  initialize() {
    this.createSceneUI();
    this.attachEventListeners();
    this.renderTechTree();
    console.log('ResearchLab scene initialized');
  }

  /**
   * Create the scene UI structure
   */
  createSceneUI() {
    // Create main scene container
    this.sceneElement = document.createElement('div');
    this.sceneElement.id = 'researchLab';
    this.sceneElement.className = 'research-lab-scene';

    // Create header
    const header = document.createElement('div');
    header.className = 'research-header';
    const title = document.createElement('h1');
    title.textContent = 'RESEARCH LAB';
    header.appendChild(title);
    this.sceneElement.appendChild(header);

    // Create main container
    const mainContainer = document.createElement('div');
    mainContainer.className = 'research-main-container';

    // Create tech tree container
    this.techTreeContainer = document.createElement('div');
    this.techTreeContainer.className = 'tech-tree-container';
    mainContainer.appendChild(this.techTreeContainer);

    // Create detail panel
    this.detailPanel = document.createElement('div');
    this.detailPanel.className = 'research-detail-panel';
    const initialContent = document.createElement('div');
    initialContent.className = 'detail-content';
    const initialH2 = document.createElement('h2');
    initialH2.textContent = 'Select a Research';
    const initialP = document.createElement('p');
    initialP.textContent = 'Click on a research node to view details and initiate research.';
    initialContent.appendChild(initialH2);
    initialContent.appendChild(initialP);
    this.detailPanel.appendChild(initialContent);
    mainContainer.appendChild(this.detailPanel);

    this.sceneElement.appendChild(mainContainer);

    // Append to body if not already in DOM
    if (!document.getElementById('researchLab')) {
      document.body.appendChild(this.sceneElement);
    }
  }

  /**
   * Render the tech tree with categorized nodes
   */
  renderTechTree() {
    this.techTreeContainer.innerHTML = '';
    this.nodeElements.clear();

    const research = getAllResearch();
    const categories = [
      ResearchCategories.PROPULSION,
      ResearchCategories.LIFE_SUPPORT,
      ResearchCategories.COMMUNICATIONS,
      ResearchCategories.MATERIALS,
      ResearchCategories.AI
    ];

    categories.forEach(category => {
      const categoryColumn = document.createElement('div');
      categoryColumn.className = 'research-category-column';

      // Category label
      const categoryLabel = document.createElement('div');
      categoryLabel.className = 'category-label';
      categoryLabel.textContent = category;
      categoryColumn.appendChild(categoryLabel);

      // Get research nodes in this category, sorted by tier
      const categoryResearch = Object.entries(research)
        .filter(([, node]) => node.category === category)
        .sort((a, b) => a[1].tier - b[1].tier);

      categoryResearch.forEach(([id, node]) => {
        const nodeElement = this.createTechNode(id, node);
        categoryColumn.appendChild(nodeElement);
      });

      this.techTreeContainer.appendChild(categoryColumn);
    });
  }

  /**
   * Create a single tech tree node element
   * @param {string} id - Research ID
   * @param {Object} node - Research node data
   * @returns {HTMLElement} Node element
   */
  createTechNode(id, node) {
    const nodeElement = document.createElement('div');
    nodeElement.className = 'tech-node';
    nodeElement.dataset.researchId = id;

    // Determine node state
    const state = this.getNodeState(id);
    nodeElement.classList.add(`node-${state}`);

    // Create node content
    const nodeName = document.createElement('div');
    nodeName.className = 'node-name';
    nodeName.textContent = node.name;
    nodeElement.appendChild(nodeName);

    // Add state indicator
    if (state === 'completed') {
      const checkmark = document.createElement('div');
      checkmark.className = 'node-checkmark';
      checkmark.textContent = '✓';
      nodeElement.appendChild(checkmark);
    } else if (state === 'active') {
      const progressBar = document.createElement('div');
      progressBar.className = 'node-progress-bar';
      const progress = document.createElement('div');
      progress.className = 'progress-fill';
      const progressPercent = this.researchProgress.get(id) || 0;
      progress.style.width = `${progressPercent}%`;
      progressBar.appendChild(progress);
      nodeElement.appendChild(progressBar);
    } else if (state === 'locked') {
      const lockIcon = document.createElement('div');
      lockIcon.className = 'node-lock';
      lockIcon.textContent = '🔒';
      nodeElement.appendChild(lockIcon);
    }

    // Add click handler for available and locked nodes
    if (state === 'available' || state === 'locked') {
      nodeElement.addEventListener('click', () => this.selectNode(id, node));
    } else if (state === 'completed' || state === 'active') {
      nodeElement.addEventListener('click', () => this.selectNode(id, node));
    }

    this.nodeElements.set(id, nodeElement);
    return nodeElement;
  }

  /**
   * Get the current state of a research node
   * @param {string} id - Research ID
   * @returns {string} State: 'completed', 'active', 'available', or 'locked'
   */
  getNodeState(id) {
    if (this.completedResearch.has(id)) {
      return 'completed';
    }
    if (this.activeResearch === id) {
      return 'active';
    }
    if (canStartResearch(id, this.completedResearch)) {
      return 'available';
    }
    return 'locked';
  }

  /**
   * Select a research node and show its details
   * @param {string} id - Research ID
   * @param {Object} node - Research node data
   */
  selectNode(id, node) {
    this.selectedNode = id;

    const state = this.getNodeState(id);
    const dependencies = node.dependencies.map(depId => {
      const depNode = getResearchById(depId);
      const completed = this.completedResearch.has(depId);
      return `${depNode?.name || depId} ${completed ? '✓' : '✗'}`;
    }).join(', ') || 'None';

    const unlocks = [
      ...node.unlockedMissions,
      ...node.unlockedCapabilities
    ].join(', ') || 'None';

    const costText = `Science: ${node.costs.science} | Credits: ${node.costs.credits}`;

    // Clear and rebuild detail panel
    this.detailPanel.innerHTML = '';
    const detailContent = document.createElement('div');
    detailContent.className = 'detail-content';

    const title = document.createElement('h2');
    title.textContent = node.name;
    detailContent.appendChild(title);

    // Category section
    const categorySection = document.createElement('div');
    categorySection.className = 'detail-section';
    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Category:';
    const categorySpan = document.createElement('span');
    categorySpan.textContent = `${node.category} (Tier ${node.tier})`;
    categorySection.appendChild(categoryLabel);
    categorySection.appendChild(categorySpan);
    detailContent.appendChild(categorySection);

    // Description section
    const descSection = document.createElement('div');
    descSection.className = 'detail-section';
    const descLabel = document.createElement('label');
    descLabel.textContent = 'Description:';
    const descP = document.createElement('p');
    descP.textContent = node.description;
    descSection.appendChild(descLabel);
    descSection.appendChild(descP);
    detailContent.appendChild(descSection);

    // Cost section
    const costSection = document.createElement('div');
    costSection.className = 'detail-section';
    const costLabel = document.createElement('label');
    costLabel.textContent = 'Cost:';
    const costSpan = document.createElement('span');
    costSpan.textContent = costText;
    costSection.appendChild(costLabel);
    costSection.appendChild(costSpan);
    detailContent.appendChild(costSection);

    // Duration section
    const durSection = document.createElement('div');
    durSection.className = 'detail-section';
    const durLabel = document.createElement('label');
    durLabel.textContent = 'Duration:';
    const durSpan = document.createElement('span');
    durSpan.textContent = `${node.duration} days`;
    durSection.appendChild(durLabel);
    durSection.appendChild(durSpan);
    detailContent.appendChild(durSection);

    // Prerequisites section
    const prereqSection = document.createElement('div');
    prereqSection.className = 'detail-section';
    const prereqLabel = document.createElement('label');
    prereqLabel.textContent = 'Prerequisites:';
    const prereqSpan = document.createElement('span');
    prereqSpan.textContent = dependencies;
    prereqSection.appendChild(prereqLabel);
    prereqSection.appendChild(prereqSpan);
    detailContent.appendChild(prereqSection);

    // Unlocks section
    const unlocksSection = document.createElement('div');
    unlocksSection.className = 'detail-section';
    const unlocksLabel = document.createElement('label');
    unlocksLabel.textContent = 'Unlocks:';
    const unlocksSpan = document.createElement('span');
    unlocksSpan.textContent = unlocks;
    unlocksSection.appendChild(unlocksLabel);
    unlocksSection.appendChild(unlocksSpan);
    detailContent.appendChild(unlocksSection);

    // Add action buttons based on state
    if (state === 'available') {
      const button = document.createElement('button');
      button.id = 'startResearchBtn';
      button.className = 'research-button';
      button.textContent = 'START RESEARCH';
      button.addEventListener('click', () => this.startResearch(id, node));
      detailContent.appendChild(button);
    } else if (state === 'completed') {
      const statusP = document.createElement('p');
      statusP.className = 'status-completed';
      statusP.textContent = '✓ Research Completed';
      detailContent.appendChild(statusP);
    } else if (state === 'active') {
      const statusP = document.createElement('p');
      statusP.className = 'status-active';
      statusP.textContent = '⏳ Research in Progress';
      detailContent.appendChild(statusP);
    } else if (state === 'locked') {
      const statusP = document.createElement('p');
      statusP.className = 'status-locked';
      statusP.textContent = '🔒 Prerequisites Not Met';
      detailContent.appendChild(statusP);
    }

    this.detailPanel.appendChild(detailContent);

    // Update node visual selection
    this.nodeElements.forEach((element) => {
      element.classList.remove('node-selected');
    });
    const selectedElement = this.nodeElements.get(id);
    if (selectedElement) {
      selectedElement.classList.add('node-selected');
    }
  }

  /**
   * Start research on a selected node
   * @param {string} id - Research ID
   * @param {Object} node - Research node data
   */
  startResearch(id, node) {
    // Emit budget deduction event
    this.eventBus.emit('budget:deduct', {
      amount: node.costs.credits,
      reason: `Research: ${node.name}`
    });

    // Emit research start event
    this.eventBus.emit('research:start', {
      researchId: id,
      name: node.name,
      costs: node.costs,
      duration: node.duration
    });

    // Update internal state
    this.activeResearch = id;
    this.researchProgress.set(id, 0);

    // Re-render to reflect state change
    this.renderTechTree();

    // Show updated detail
    this.selectNode(id, node);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    this.eventBus.subscribe('research:started', this.handleResearchStarted, this);
    this.eventBus.subscribe('research:progress', this.handleResearchProgress, this);
    this.eventBus.subscribe('research:completed', this.handleResearchCompleted, this);
    this.eventBus.subscribe('budget:updated', this.handleBudgetUpdated, this);
  }

  /**
   * Handle research:started event
   * @param {Object} data - Event data
   */
  handleResearchStarted(data) {
    if (data && data.researchId) {
      this.activeResearch = data.researchId;
      this.researchProgress.set(data.researchId, 0);
      this.renderTechTree();
    }
  }

  /**
   * Handle research:progress event
   * @param {Object} data - Event data with researchId and progress (0-100)
   */
  handleResearchProgress(data) {
    if (data && data.researchId) {
      this.researchProgress.set(data.researchId, data.progress || 0);
      const nodeElement = this.nodeElements.get(data.researchId);
      if (nodeElement) {
        const progressBar = nodeElement.querySelector('.progress-fill');
        if (progressBar) {
          progressBar.style.width = `${data.progress}%`;
        }
      }
    }
  }

  /**
   * Handle research:completed event
   * @param {Object} data - Event data with researchId
   */
  handleResearchCompleted(data) {
    if (data && data.researchId) {
      this.completedResearch.add(data.researchId);
      this.activeResearch = null;
      this.researchProgress.delete(data.researchId);
      this.renderTechTree();

      // Clear selection if the completed research was selected
      if (this.selectedNode === data.researchId) {
        const node = getResearchById(data.researchId);
        if (node) {
          this.selectNode(data.researchId, node);
        }
      }
    }
  }

  /**
   * Handle budget:updated event
   * @param {Object} data - Budget update data
   */
  handleBudgetUpdated(data) {
    // Re-evaluate available nodes when budget changes
    if (this.selectedNode) {
      const node = getResearchById(this.selectedNode);
      if (node) {
        this.selectNode(this.selectedNode, node);
      }
    }
  }

  /**
   * Set completed research
   * @param {Set<string>} research - Set of completed research IDs
   */
  setCompletedResearch(research) {
    this.completedResearch = new Set(research);
    this.renderTechTree();
  }

  /**
   * Get completed research
   * @returns {Set<string>} Set of completed research IDs
   */
  getCompletedResearch() {
    return new Set(this.completedResearch);
  }

  update() {
    // Update research lab state
  }

  render() {
    // Render research lab
  }

  destroy() {
    // Clean up research lab resources
    this.cleanup();
  }

  /**
   * Cleanup the scene
   */
  cleanup() {
    // Unsubscribe from events
    this.eventBus.unsubscribe('research:started', this.handleResearchStarted, this);
    this.eventBus.unsubscribe('research:progress', this.handleResearchProgress, this);
    this.eventBus.unsubscribe('research:completed', this.handleResearchCompleted, this);
    this.eventBus.unsubscribe('budget:updated', this.handleBudgetUpdated, this);

    // Remove scene from DOM
    if (this.sceneElement && this.sceneElement.parentNode) {
      this.sceneElement.parentNode.removeChild(this.sceneElement);
    }

    // Reset references
    this.sceneElement = null;
    this.techTreeContainer = null;
    this.detailPanel = null;
    this.nodeElements.clear();
    this.selectedNode = null;
    this.completedResearch.clear();
    this.activeResearch = null;
    this.researchProgress.clear();
    console.log('ResearchLab scene cleaned up');
  }
}

export default ResearchLab;