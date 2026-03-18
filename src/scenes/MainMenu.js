/**
 * MainMenu Scene
 *
 * Displays the main menu with:
 * - Animated 'Stellar Horizon' title with CSS glow animation
 * - Starfield canvas background
 * - Menu buttons (New Game, Continue Game if save exists, Settings)
 * - Space facts ticker at bottom
 * - Hover effects and transitions
 */

import Starfield from "../canvas/Starfield.js";
import SpaceFactsTicker from "../ui/SpaceFactsTicker.js";
import SaveSystem from "../game/SaveSystem.js";
import EventBus from "../game/EventBus.js";

class MainMenu {
  constructor() {
    this.menuElement = null;
    this.titleElement = null;
    this.buttonsContainer = null;
    this.buttons = [];
    this.onNewGame = null;
    this.onContinueGame = null;
    this.onSettings = null;

    // Starfield and ticker
    this.starfield = null;
    this.starfieldCanvas = null;
    this.spaceFactsTicker = null;

    // Save system
    this.saveSystem = null;
    this.eventBus = null;

    this.isInitialized = false;
  }

  /**
   * Initialize the main menu
   */
  initialize() {
    this.eventBus = EventBus.getInstance();
    this.saveSystem = new SaveSystem(this.eventBus);

    this.createStarfieldBackground();
    this.createMenuUI();
    this.createSpaceFactsTicker();
    this.attachEventListeners();

    this.isInitialized = true;
    console.log("MainMenu scene initialized");
  }

  /**
   * Create the starfield canvas background
   */
  createStarfieldBackground() {
    // Create canvas element
    this.starfieldCanvas = document.createElement("canvas");
    this.starfieldCanvas.id = "mainmenu-starfield";
    this.starfieldCanvas.className = "mainmenu-starfield";
    this.starfieldCanvas.width = window.innerWidth;
    this.starfieldCanvas.height = window.innerHeight;

    // Append to body before menu
    if (!document.getElementById("mainmenu-starfield")) {
      document.body.insertBefore(
        this.starfieldCanvas,
        document.body.firstChild,
      );
    }

    // Initialize and start starfield
    this.starfield = new Starfield(this.starfieldCanvas);
    this.starfield.start();

    // Handle window resize
    window.addEventListener("resize", () => {
      if (this.starfieldCanvas) {
        this.starfieldCanvas.width = window.innerWidth;
        this.starfieldCanvas.height = window.innerHeight;
        this.starfield.handleResize();
      }
    });
  }

  /**
   * Create the space facts ticker
   */
  createSpaceFactsTicker() {
    this.spaceFactsTicker = new SpaceFactsTicker();
    this.spaceFactsTicker.initialize();
  }

  /**
   * Create the menu UI structure
   */
  createMenuUI() {
    // Create main menu container
    this.menuElement = document.createElement("div");
    this.menuElement.id = "mainMenu";
    this.menuElement.className = "main-menu";

    // Create title with animated glow effect
    this.titleElement = document.createElement("h1");
    this.titleElement.className = "game-title glow-text";
    this.titleElement.textContent = "Stellar Horizon";
    this.menuElement.appendChild(this.titleElement);

    // Create buttons container
    this.buttonsContainer = document.createElement("div");
    this.buttonsContainer.className = "menu-buttons";

    // Create buttons - Continue button only shows if save exists
    const buttonConfigs = [
      { id: "newGameBtn", label: "NEW GAME", action: "newGame" },
    ];

    // Conditionally add Continue button if save exists
    if (this.saveSystem && this.saveSystem.hasSave()) {
      buttonConfigs.push({
        id: "continueBtn",
        label: "CONTINUE GAME",
        action: "continueGame",
      });
    }

    buttonConfigs.push({
      id: "settingsBtn",
      label: "SETTINGS",
      action: "settings",
    });

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
    // Stop starfield animation
    if (this.starfield) {
      this.starfield.stop();
      this.starfield.destroy();
      this.starfield = null;
    }

    // Remove starfield canvas from DOM
    if (this.starfieldCanvas && this.starfieldCanvas.parentNode) {
      this.starfieldCanvas.parentNode.removeChild(this.starfieldCanvas);
      this.starfieldCanvas = null;
    }

    // Cleanup space facts ticker
    if (this.spaceFactsTicker) {
      this.spaceFactsTicker.cleanup();
      this.spaceFactsTicker = null;
    }

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
    this.saveSystem = null;
    this.eventBus = null;
    this.isInitialized = false;
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

  /**
   * Called when scene is entered
   */
  onEnter() {
    if (this.starfield) {
      this.starfield.start();
    }
    console.log("MainMenu scene entered");
  }

  /**
   * Called when scene is exited
   */
  onExit() {
    console.log("MainMenu scene exited");
  }

  /**
   * Called during transition out (fade effect)
   */
  onTransitionOut() {
    if (this.starfield) {
      this.starfield.stop();
    }
    if (this.spaceFactsTicker) {
      this.spaceFactsTicker.stopRotation();
    }
    console.log("MainMenu transitioning out");
  }

  /**
   * Called during transition in (fade effect)
   */
  onTransitionIn() {
    console.log("MainMenu transitioning in");
  }

  /**
   * Destroy the scene
   */
  destroy() {
    this.cleanup();
  }
}

export default MainMenu;
