/**
 * Dashboard Scene Module
 * Manages the main dashboard view for mission control
 * Displays game status including last-saved time
 */

export class Dashboard {
  constructor(gameInstance = null) {
    this.name = "Dashboard";
    this.gameInstance = gameInstance;
    this.dashboardElement = null;
    this.lastSavedElement = null;
  }

  init() {
    // Initialize dashboard UI
    this.createDashboardUI();
  }

  /**
   * Create the dashboard UI structure
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

    // Create status panel with last-saved time
    const statusPanel = document.createElement("div");
    statusPanel.className = "dashboard-status";
    this.lastSavedElement = document.createElement("div");
    this.lastSavedElement.className = "dashboard-last-saved";
    this.updateLastSavedDisplay();
    statusPanel.appendChild(this.lastSavedElement);

    this.dashboardElement.appendChild(header);
    this.dashboardElement.appendChild(statusPanel);

    if (!document.getElementById("dashboard")) {
      document.body.appendChild(this.dashboardElement);
    }
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

  update() {
    // Update dashboard state
    this.updateLastSavedDisplay();
  }

  render() {
    // Render dashboard
  }

  destroy() {
    // Clean up dashboard resources
    if (this.dashboardElement && this.dashboardElement.parentNode) {
      this.dashboardElement.parentNode.removeChild(this.dashboardElement);
    }
    this.dashboardElement = null;
    this.lastSavedElement = null;
  }
}

export default Dashboard;
