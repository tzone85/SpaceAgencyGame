/**
 * UI Controller - Handles the UI interactions for missions and budget
 */

class UIController {
  constructor(missionManager) {
    this.manager = missionManager;
    this.budgetDisplay = null;
    this.missionList = null;
    this.warningElement = null;
  }

  /**
   * Initialize the UI controller with DOM elements
   * @param {HTMLElement} budgetDisplay - Element to display budget
   * @param {HTMLElement} missionList - Element to display mission list
   */
  init(budgetDisplay, missionList) {
    this.budgetDisplay = budgetDisplay;
    this.missionList = missionList;
    this.renderBudget();
  }

  /**
   * Render the budget display
   */
  renderBudget() {
    if (this.budgetDisplay) {
      const budget = this.manager.getBudget();
      this.budgetDisplay.textContent = `Budget: $${budget.toLocaleString()}`;
      this.updateBudgetColor();
    }
  }

  /**
   * Update budget color based on availability
   */
  updateBudgetColor() {
    if (!this.budgetDisplay) return;

    const budget = this.manager.getBudget();
    const missions = this.manager.getMissions();

    // Check if there are any missions that can be launched
    const hasAffordable = missions.some((mission) => budget >= mission.cost);

    if (budget === 0) {
      this.budgetDisplay.style.color = "#dc3545"; // Red - critical
    } else if (!hasAffordable && missions.length > 0) {
      this.budgetDisplay.style.color = "#ff9800"; // Orange - warning
    } else {
      this.budgetDisplay.style.color = "#333"; // Default
    }
  }

  /**
   * Render mission list with buttons and validation
   */
  renderMissions() {
    if (!this.missionList || typeof document === "undefined") return;

    const missions = this.manager.getMissions();

    if (missions.length === 0) {
      this.missionList.innerHTML = "<li>No missions available yet.</li>";
      this.missionList.classList.add("empty");
      return;
    }

    this.missionList.classList.remove("empty");
    this.missionList.innerHTML = "";

    missions.forEach((mission) => {
      const li = document.createElement("li");
      li.className = "mission-item";
      li.dataset.missionId = mission.id;

      const validation = this.manager.canLaunchMission(mission.id);
      const canLaunch = validation.canLaunch;

      li.innerHTML = `
        <div class="mission-content">
          <div class="mission-info">
            <h3>${mission.name}</h3>
            <p>${mission.description || "No description available"}</p>
            <span class="mission-cost">Cost: $${mission.cost.toLocaleString()}</span>
          </div>
          <div class="mission-actions">
            <button class="launch-btn" data-mission-id="${mission.id}" ${!canLaunch ? "disabled" : ""}>
              ${canLaunch ? "Launch Mission" : "Insufficient Budget"}
            </button>
            ${!canLaunch ? `<p class="mission-warning">${validation.reason}</p>` : ""}
          </div>
        </div>
      `;

      this.missionList.appendChild(li);

      const button = li.querySelector(".launch-btn");
      if (canLaunch) {
        button.addEventListener("click", (e) =>
          this.handleMissionLaunch(e, mission.id),
        );
      }
    });
  }

  /**
   * Handle mission launch button click
   * @param {Event} event - Click event
   * @param {string} missionId - ID of the mission to launch
   */
  handleMissionLaunch(event, missionId) {
    const button = event.target;
    button.disabled = true;

    const result = this.manager.launchMission(missionId);

    if (result.success) {
      this.renderBudget();
      this.renderMissions();
      this.showNotification(result.message, "success");
    } else {
      button.disabled = false;
      this.showNotification(result.message, "error");
    }
  }

  /**
   * Show a notification message
   * @param {string} message - Message to display
   * @param {string} type - Type of notification ('success', 'error', 'warning')
   */
  showNotification(message, type = "info") {
    // Skip notification if document is not available (e.g., in Node tests)
    if (typeof document === "undefined") {
      return;
    }

    // Remove existing notification if any
    const existing = document.querySelector(".notification");
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute("role", "alert");

    document.body.insertBefore(notification, document.body.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Update budget and refresh displays
   * @param {number} newBudget - New budget amount
   */
  updateBudget(newBudget) {
    try {
      this.manager.setBudget(newBudget);
      this.renderBudget();
      this.renderMissions();
    } catch (error) {
      this.showNotification(error.message, "error");
    }
  }
}

// Export for use in Node/module environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = UIController;
}
