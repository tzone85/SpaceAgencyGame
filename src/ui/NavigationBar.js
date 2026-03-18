/**
 * NavigationBar Component
 *
 * Displays a navigation bar at the top of game scenes with:
 * - Navigation buttons for Dashboard, Missions, Crew, Research
 * - Active scene highlighting
 * - Scene transition callbacks
 */

class NavigationBar {
  constructor() {
    this.navElement = null;
    this.navButtons = [];
    this.currentActiveScene = null;
    this.onNavigate = null;
  }

  /**
   * Initialize the navigation bar
   */
  initialize() {
    this.createNavBar();
    this.attachEventListeners();
  }

  /**
   * Create the navigation bar UI
   */
  createNavBar() {
    // Create nav container
    this.navElement = document.createElement("div");
    this.navElement.id = "navigation-bar";
    this.navElement.className = "navigation-bar";

    // Scene navigation buttons
    const sceneConfigs = [
      { id: "dashboard", label: "Dashboard", sceneId: "dashboard" },
      { id: "missions", label: "Missions", sceneId: "missions" },
      { id: "crew", label: "Crew", sceneId: "crew" },
      { id: "research", label: "Research", sceneId: "research" },
    ];

    sceneConfigs.forEach((config) => {
      const button = document.createElement("button");
      button.id = config.id;
      button.className = "nav-button";
      button.textContent = config.label;
      button.dataset.sceneId = config.sceneId;
      this.navElement.appendChild(button);
      this.navButtons.push(button);
    });

    // Append to body if not already in DOM
    if (!document.getElementById("navigation-bar")) {
      document.body.appendChild(this.navElement);
    }
  }

  /**
   * Attach event listeners to navigation buttons
   */
  attachEventListeners() {
    this.navButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        this.handleNavClick(e);
      });
    });
  }

  /**
   * Handle navigation button click
   * @param {Event} event - Click event
   */
  handleNavClick(event) {
    const sceneId = event.target.dataset.sceneId;
    if (typeof this.onNavigate === "function") {
      this.onNavigate(sceneId);
    }
  }

  /**
   * Set the active scene in the navigation bar
   * @param {string} sceneId - The active scene ID
   */
  setActiveScene(sceneId) {
    this.currentActiveScene = sceneId;

    // Update button styling
    this.navButtons.forEach((button) => {
      button.classList.remove("nav-button--active");
      if (button.dataset.sceneId === sceneId) {
        button.classList.add("nav-button--active");
      }
    });
  }

  /**
   * Register callback for navigation
   * @param {Function} callback - Function to call on navigation
   */
  setOnNavigate(callback) {
    this.onNavigate = callback;
  }

  /**
   * Show the navigation bar
   */
  show() {
    if (this.navElement) {
      this.navElement.classList.remove("hidden");
    }
  }

  /**
   * Hide the navigation bar
   */
  hide() {
    if (this.navElement) {
      this.navElement.classList.add("hidden");
    }
  }

  /**
   * Cleanup the navigation bar
   */
  cleanup() {
    // Remove event listeners
    this.navButtons.forEach((button) => {
      button.removeEventListener("click", null);
    });

    // Remove nav bar from DOM
    if (this.navElement && this.navElement.parentNode) {
      this.navElement.parentNode.removeChild(this.navElement);
    }

    // Reset references
    this.navElement = null;
    this.navButtons = [];
    this.currentActiveScene = null;
    this.onNavigate = null;
    console.log("NavigationBar cleaned up");
  }
}

export default NavigationBar;
