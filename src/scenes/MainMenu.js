/**
 * MainMenu Scene
 *
 * Displays the main menu with:
 * - Animated game title
 * - Menu buttons (New Game, Continue Game, Settings)
 * - Hover effects and transitions
 */

class MainMenu {
  constructor() {
    this.menuElement = null;
    this.titleElement = null;
    this.buttonsContainer = null;
    this.buttons = [];
    this.onNewGame = null;
    this.onContinueGame = null;
    this.onSettings = null;
  }

  /**
   * Initialize the main menu
   */
  initialize() {
    this.createMenuUI();
    this.attachEventListeners();
    console.log("MainMenu scene initialized");
  }

  /**
   * Create the menu UI structure
   */
  createMenuUI() {
    // Create main menu container
    this.menuElement = document.createElement("div");
    this.menuElement.id = "mainMenu";
    this.menuElement.className = "main-menu";

    // Create title
    this.titleElement = document.createElement("h1");
    this.titleElement.className = "game-title";
    this.titleElement.textContent = "STELLAR COMMAND";
    this.menuElement.appendChild(this.titleElement);

    // Create buttons container
    this.buttonsContainer = document.createElement("div");
    this.buttonsContainer.className = "menu-buttons";

    // Create buttons
    const buttonConfigs = [
      { id: "newGameBtn", label: "NEW GAME", action: "newGame" },
      { id: "continueBtn", label: "CONTINUE GAME", action: "continueGame" },
      { id: "settingsBtn", label: "SETTINGS", action: "settings" },
    ];

    buttonConfigs.forEach((config) => {
      const button = document.createElement("button");
      button.id = config.id;
      button.className = "menu-button";
      button.textContent = config.label;
      button.dataset.action = config.action;
      this.buttonsContainer.appendChild(button);
      this.buttons.push(button);
    });

    this.menuElement.appendChild(this.buttonsContainer);

    // Append to body if not already in DOM
    if (!document.getElementById("mainMenu")) {
      document.body.appendChild(this.menuElement);
    }
  }

  /**
   * Attach event listeners to buttons
   */
  attachEventListeners() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        this.handleButtonClick(e);
      });
    });
  }

  /**
   * Handle button click events
   * @param {Event} event - Click event
   */
  handleButtonClick(event) {
    const action = event.target.dataset.action;

    switch (action) {
      case "newGame":
        if (typeof this.onNewGame === "function") {
          this.onNewGame();
        }
        console.log("New Game clicked");
        break;
      case "continueGame":
        if (typeof this.onContinueGame === "function") {
          this.onContinueGame();
        }
        console.log("Continue Game clicked");
        break;
      case "settings":
        if (typeof this.onSettings === "function") {
          this.onSettings();
        }
        console.log("Settings clicked");
        break;
    }
  }

  /**
   * Update method (called each frame)
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Menu is static, no update needed
  }

  /**
   * Render method
   * @param {Renderer} renderer - Renderer instance
   */
  render(renderer) {
    // Rendering is handled by DOM, not WebGL renderer
    // Menu is displayed via HTML/CSS
  }

  /**
   * Cleanup the menu UI
   */
  cleanup() {
    // Remove event listeners
    this.buttons.forEach((button) => {
      button.removeEventListener("click", null);
    });

    // Remove menu from DOM
    if (this.menuElement && this.menuElement.parentNode) {
      this.menuElement.parentNode.removeChild(this.menuElement);
    }

    // Reset references
    this.menuElement = null;
    this.titleElement = null;
    this.buttonsContainer = null;
    this.buttons = [];
    this.onNewGame = undefined;
    this.onContinueGame = undefined;
    this.onSettings = undefined;
    console.log("MainMenu scene cleaned up");
  }

  /**
   * Register callback for new game
   * @param {Function} callback - Function to call on new game
   */
  setOnNewGame(callback) {
    this.onNewGame = callback;
  }

  /**
   * Register callback for continue game
   * @param {Function} callback - Function to call on continue game
   */
  setOnContinueGame(callback) {
    this.onContinueGame = callback;
  }

  /**
   * Register callback for settings
   * @param {Function} callback - Function to call on settings
   */
  setOnSettings(callback) {
    this.onSettings = callback;
  }
}

export default MainMenu;
