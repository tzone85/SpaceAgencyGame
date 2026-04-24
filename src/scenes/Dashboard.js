/**
 * Dashboard Scene Module
 * Manages the main dashboard view for mission control
 * Displays game status including live data from all systems
 */

import EventBus from "../game/EventBus.js";

export class Dashboard {
  constructor(gameInstance = null) {
    this.name = "Dashboard";
    this.gameInstance = gameInstance;
    this.dashboardElement = null;
    this.eventBus = null;
    this.gameState = null;

    // Extract eventBus and gameState from gameInstance if provided
    if (gameInstance) {
      this.eventBus = gameInstance.eventBus || EventBus.getInstance?.() || new EventBus();
      this.gameState = gameInstance.gameState;
    } else {
      // Fallback to singleton EventBus
      this.eventBus = EventBus.getInstance?.() || new EventBus();
    }

    // UI element references
    this.budgetDisplay = null;
    this.crewDisplay = null;
    this.missionsDisplay = null;
    this.researchDisplay = null;
    this.lastSavedElement = null;
    this.advanceTimeButton = null;
  }

  init() {
    // Initialize dashboard UI
    this.createDashboardUI();
  }

  /**
   * Create the dashboard UI structure with live system data
   */
  createDashboardUI() {
    this.dashboardElement = document.createElement("div");
    this.dashboardElement.id = "dashboard";
    this.dashboardElement.className = "dashboard";

    // Create header with title
    const header = document.createElement("div");
    header.className = "dashboard-header";
    const title = document.createElement("h1");
    title.textContent = "Mission Control Dashboard";
    header.appendChild(title);

    // Create status panel
    const statusPanel = document.createElement("div");
    statusPanel.className = "dashboard-status";

    // Last saved display
    this.lastSavedElement = document.createElement("div");
    this.lastSavedElement.className = "dashboard-last-saved";
    statusPanel.appendChild(this.lastSavedElement);

    // Create live systems section
    const systemsSection = document.createElement("div");
    systemsSection.className = "dashboard-systems";

    // Budget display
    this.budgetDisplay = document.createElement("div");
    this.budgetDisplay.className = "dashboard-panel dashboard-budget";
    this.budgetDisplay.innerHTML = "<h2>Budget</h2><div class=\"budget-content\"></div>";
    systemsSection.appendChild(this.budgetDisplay);

    // Crew display
    this.crewDisplay = document.createElement("div");
    this.crewDisplay.className = "dashboard-panel dashboard-crew";
    this.crewDisplay.innerHTML = "<h2>Crew</h2><div class=\"crew-content\"></div>";
    systemsSection.appendChild(this.crewDisplay);

    // Missions display
    this.missionsDisplay = document.createElement("div");
    this.missionsDisplay.className = "dashboard-panel dashboard-missions";
    this.missionsDisplay.innerHTML = "<h2>Active Missions</h2><div class=\"missions-content\"></div>";
    systemsSection.appendChild(this.missionsDisplay);

    // Research display
    this.researchDisplay = document.createElement("div");
    this.researchDisplay.className = "dashboard-panel dashboard-research";
    this.researchDisplay.innerHTML = "<h2>Research</h2><div class=\"research-content\"></div>";
    systemsSection.appendChild(this.researchDisplay);

    // Advance Time button
    this.advanceTimeButton = document.createElement("button");
    this.advanceTimeButton.id = "advance-time-btn";
    this.advanceTimeButton.className = "dashboard-advance-time-btn";
    this.advanceTimeButton.textContent = "Advance Time (1 day)";
    this.advanceTimeButton.addEventListener("click", () => this.onAdvanceTimeClicked());
    systemsSection.appendChild(this.advanceTimeButton);

    this.dashboardElement.appendChild(header);
    this.dashboardElement.appendChild(statusPanel);
    this.dashboardElement.appendChild(systemsSection);

    if (!document.getElementById("dashboard")) {
      document.body.appendChild(this.dashboardElement);
    }

    // Initial update
    this.updateDisplays();
  }

  /**
   * Update all dashboard displays with current game state
   */
  updateDisplays() {
    this.updateLastSavedDisplay();
    this.updateBudgetDisplay();
    this.updateCrewDisplay();
    this.updateMissionsDisplay();
    this.updateResearchDisplay();
  }

  /**
   * Update the last-saved time display
   */
  updateLastSavedDisplay() {
    if (!this.lastSavedElement) return;

    if (this.gameInstance && this.gameInstance.getLastSavedTime) {
      const lastSaved = this.gameInstance.getLastSavedTime();
      if (lastSaved) {
        const date = new Date(lastSaved);
        const timeStr = date.toLocaleString();
        this.lastSavedElement.textContent = `Last saved: ${timeStr}`;
      } else {
        this.lastSavedElement.textContent = "Last saved: Never";
      }
    } else {
      this.lastSavedElement.textContent = "Last saved: N/A";
    }
  }

  /**
   * Update budget display with live data from GameState
   */
  updateBudgetDisplay() {
    if (!this.budgetDisplay || !this.gameState) return;

    const state = this.gameState.getState();
    const budget = state.budget;
    const content = this.budgetDisplay.querySelector(".budget-content");

    if (content) {
      const balanceStr = (budget.balance / 1_000_000).toFixed(1);
      content.innerHTML = `
        <div class="budget-balance">Balance: $${balanceStr}M</div>
        <div class="budget-quarterly">Quarterly: $${(budget.quarterlyFunding / 1_000_000).toFixed(1)}M</div>
        <div class="budget-period">Q${budget.currentQuarter} ${budget.currentYear}</div>
      `;
    }
  }

  /**
   * Update crew display with live data from GameState
   */
  updateCrewDisplay() {
    if (!this.crewDisplay || !this.gameState) return;

    const state = this.gameState.getState();
    const crew = state.crew.roster || [];
    const content = this.crewDisplay.querySelector(".crew-content");

    if (content) {
      const crewCount = crew.length;
      const crewList = crew.length > 0
        ? crew.slice(0, 5).map(c => `<div class="crew-member">${c.name || c.id}</div>`).join("")
        : "<div class=\"crew-empty\">No crew members</div>";

      content.innerHTML = `
        <div class="crew-count">Total: ${crewCount}</div>
        ${crewList}
        ${crew.length > 5 ? `<div class="crew-more">+${crew.length - 5} more</div>` : ""}
      `;
    }
  }

  /**
   * Update missions display with live data from GameState
   */
  updateMissionsDisplay() {
    if (!this.missionsDisplay || !this.gameState) return;

    const state = this.gameState.getState();
    const missions = state.missions.active || [];
    const content = this.missionsDisplay.querySelector(".missions-content");

    if (content) {
      const missionCount = missions.length;
      const missionList = missions.length > 0
        ? missions.slice(0, 5).map(m => `
          <div class="mission-item">
            <div class="mission-name">${m.mission?.name || m.missionId || 'Unknown'}</div>
            <div class="mission-progress">${m.elapsed ? Math.round((m.elapsed / (m.mission?.duration * 86400 || 1)) * 100) : 0}%</div>
          </div>
        `).join("")
        : "<div class=\"missions-empty\">No active missions</div>";

      content.innerHTML = `
        <div class="missions-count">Active: ${missionCount}</div>
        ${missionList}
      `;
    }
  }

  /**
   * Update research display with live data from GameState
   */
  updateResearchDisplay() {
    if (!this.researchDisplay || !this.gameState) return;

    const state = this.gameState.getState();
    const research = state.research.active;
    const content = this.researchDisplay.querySelector(".research-content");

    if (content) {
      if (research) {
        const progress = Math.round((research.progress || 0) * 100);
        content.innerHTML = `
          <div class="research-name">${research.name || research.id}</div>
          <div class="research-progress">${progress}%</div>
          <div class="research-bar">
            <div class="research-bar-fill" style="width: ${progress}%"></div>
          </div>
        `;
      } else {
        content.innerHTML = "<div class=\"research-empty\">No active research</div>";
      }
    }
  }

  /**
   * Handle advance time button click
   * Emits game:tick event to progress all systems
   */
  onAdvanceTimeClicked() {
    if (this.eventBus) {
      // Emit game:tick event with deltaTime of 1 game-day
      this.eventBus.emit("game:tick", {
        deltaTime: 1, // 1 day
      });
    }
  }

  update() {
    // Update dashboard state every frame
    this.updateDisplays();
  }

  render() {
    // Render dashboard
  }

  destroy() {
    // Clean up dashboard resources
    if (this.advanceTimeButton) {
      this.advanceTimeButton.removeEventListener("click", () => this.onAdvanceTimeClicked());
    }
    if (this.dashboardElement && this.dashboardElement.parentNode) {
      this.dashboardElement.parentNode.removeChild(this.dashboardElement);
    }
    this.dashboardElement = null;
    this.budgetDisplay = null;
    this.crewDisplay = null;
    this.missionsDisplay = null;
    this.researchDisplay = null;
    this.lastSavedElement = null;
    this.advanceTimeButton = null;
  }
}

export default Dashboard;
