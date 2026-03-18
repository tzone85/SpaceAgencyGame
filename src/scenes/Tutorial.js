/**
 * Tutorial Scene
 *
 * Displays an interactive tutorial overlay with 8 sequential steps:
 * 1) Welcome message
 * 2) Budget panel explanation
 * 3) Mission catalog
 * 4) How to launch a mission
 * 5) Crew management
 * 6) Research tree
 * 7) Random events
 * 8) Save/load
 *
 * Features:
 * - Spotlight circle around target UI elements
 * - Tooltip with glassmorphism styling
 * - Next/Skip buttons for navigation
 * - Tutorial completion state persisted in GameState
 * - Auto-shows on first launch if not completed
 */

import EventBus from "../game/EventBus.js";

export class Tutorial {
  constructor() {
    this.name = "Tutorial";
    this.eventBus = EventBus.getInstance();
    this.sceneElement = null;
    this.overlayElement = null;
    this.spotlightCanvas = null;
    this.tooltipElement = null;
    this.currentStep = 0;
    this.isActive = false;
    this.onComplete = null;
    this.onSkip = null;
    this.resizeHandler = null;

    // Tutorial steps configuration
    this.steps = [
      {
        id: "welcome",
        title: "Welcome to Stellar Horizon",
        description:
          "Welcome! This tutorial will guide you through the basics of managing your space agency. Click Next to continue or Skip to dismiss this tutorial.",
        targetSelector: null, // No target for welcome screen
        position: "center",
      },
      {
        id: "budget",
        title: "Budget Panel",
        description:
          "This is your budget panel. It shows your current balance, quarterly funding, and financial history. Manage your funds wisely to keep your agency operational.",
        targetSelector: '[data-tutorial="budget"]',
        position: "right",
      },
      {
        id: "missions",
        title: "Mission Catalog",
        description:
          "Browse available missions here. Each mission has different difficulty levels, rewards, and requirements. Select one to learn more.",
        targetSelector: '[data-tutorial="missions"]',
        position: "left",
      },
      {
        id: "launch",
        title: "Launching Missions",
        description:
          "To launch a mission, select it from the catalog, assign crew members, and click the Launch button. You can monitor active missions in the control panel.",
        targetSelector: '[data-tutorial="mission-launch"]',
        position: "right",
      },
      {
        id: "crew",
        title: "Crew Management",
        description:
          "Your crew members are essential to mission success. Manage their training, assignments, and morale in the Crew Quarters. A well-trained crew improves mission success rates.",
        targetSelector: '[data-tutorial="crew"]',
        position: "left",
      },
      {
        id: "research",
        title: "Research & Development",
        description:
          "Invest in research to unlock new technologies and capabilities. The tech tree shows available, active, and completed research projects. Progress drives agency advancement.",
        targetSelector: '[data-tutorial="research"]',
        position: "right",
      },
      {
        id: "events",
        title: "Random Events",
        description:
          "Events happen throughout your game session. Some are beneficial, others are challenges. Stay alert and respond strategically to maintain agency stability.",
        targetSelector: '[data-tutorial="events"]',
        position: "bottom",
      },
      {
        id: "save",
        title: "Save & Load",
        description:
          "Your progress is auto-saved throughout the game. You can also manually save or load your game using the Save/Load menu. Good luck, Commander!",
        targetSelector: '[data-tutorial="save"]',
        position: "left",
      },
    ];
  }

  /**
   * Initialize the tutorial scene
   */
  init() {
    this.initialize();
  }

  /**
   * Initialize the tutorial
   */
  initialize() {
    this.createSceneUI();
    this.attachEventListeners();
    this.setupResizeHandler();
    this.render();
    console.log("Tutorial scene initialized");
  }

  /**
   * Create the scene UI structure
   */
  createSceneUI() {
    // Create main scene container
    this.sceneElement = document.createElement("div");
    this.sceneElement.id = "tutorial";
    this.sceneElement.className = "tutorial-scene";

    // Create overlay (semi-transparent background)
    this.overlayElement = document.createElement("div");
    this.overlayElement.className = "tutorial-overlay";

    // Create spotlight canvas
    this.spotlightCanvas = document.createElement("canvas");
    this.spotlightCanvas.id = "tutorialSpotlight";
    this.spotlightCanvas.className = "tutorial-spotlight-canvas";
    this.spotlightCanvas.width = window.innerWidth;
    this.spotlightCanvas.height = window.innerHeight;

    // Create tooltip container
    this.tooltipElement = document.createElement("div");
    this.tooltipElement.className = "tutorial-tooltip";
    this.updateTooltip();

    // Append elements
    this.overlayElement.appendChild(this.spotlightCanvas);
    this.sceneElement.appendChild(this.overlayElement);
    this.sceneElement.appendChild(this.tooltipElement);

    // Add to DOM if not already present
    if (!document.getElementById("tutorial")) {
      document.body.appendChild(this.sceneElement);
    }
  }

  /**
   * Update tooltip content for current step
   */
  updateTooltip() {
    const step = this.steps[this.currentStep];
    if (!step) return;

    // Clear existing content
    while (this.tooltipElement.firstChild) {
      this.tooltipElement.removeChild(this.tooltipElement.firstChild);
    }

    // Tooltip content
    const content = document.createElement("div");
    content.className = "tooltip-content";

    const title = document.createElement("h2");
    title.className = "tooltip-title";
    title.textContent = step.title;
    content.appendChild(title);

    const description = document.createElement("p");
    description.className = "tooltip-description";
    description.textContent = step.description;
    content.appendChild(description);

    // Button container
    const buttons = document.createElement("div");
    buttons.className = "tooltip-buttons";

    const skipBtn = document.createElement("button");
    skipBtn.className = "tooltip-button tutorial-skip-btn";
    skipBtn.textContent = "Skip Tutorial";
    skipBtn.addEventListener("click", () => this.skip());

    const nextBtn = document.createElement("button");
    nextBtn.className = "tooltip-button tutorial-next-btn";
    nextBtn.textContent =
      this.currentStep === this.steps.length - 1 ? "Complete" : "Next";
    nextBtn.addEventListener("click", () => this.next());

    buttons.appendChild(skipBtn);
    buttons.appendChild(nextBtn);
    content.appendChild(buttons);

    this.tooltipElement.appendChild(content);
    this.positionTooltip();
  }

  /**
   * Position tooltip based on step configuration
   */
  positionTooltip() {
    const step = this.steps[this.currentStep];
    if (!step) return;

    const rect = this.getTargetRect();
    if (!rect) {
      // Center tooltip for welcome screen or if target not found
      this.tooltipElement.style.top = "50%";
      this.tooltipElement.style.left = "50%";
      this.tooltipElement.style.transform = "translate(-50%, -50%)";
      this.tooltipElement.style.position = "fixed";
      return;
    }

    const padding = 20;
    this.tooltipElement.style.position = "fixed";

    switch (step.position) {
      case "right":
        this.tooltipElement.style.left = `${rect.right + padding}px`;
        this.tooltipElement.style.top = `${rect.top}px`;
        this.tooltipElement.style.transform = "none";
        break;
      case "left":
        this.tooltipElement.style.right = `${window.innerWidth - rect.left + padding}px`;
        this.tooltipElement.style.top = `${rect.top}px`;
        this.tooltipElement.style.transform = "none";
        break;
      case "bottom":
        this.tooltipElement.style.left = `${rect.left}px`;
        this.tooltipElement.style.top = `${rect.bottom + padding}px`;
        this.tooltipElement.style.transform = "none";
        break;
      case "center":
      default:
        this.tooltipElement.style.top = "50%";
        this.tooltipElement.style.left = "50%";
        this.tooltipElement.style.transform = "translate(-50%, -50%)";
        break;
    }
  }

  /**
   * Get the bounding rect of the target element
   * @returns {DOMRect|null}
   */
  getTargetRect() {
    const step = this.steps[this.currentStep];
    if (!step || !step.targetSelector) return null;

    const element = document.querySelector(step.targetSelector);
    return element ? element.getBoundingClientRect() : null;
  }

  /**
   * Draw spotlight effect on canvas
   */
  drawSpotlight() {
    const canvas = this.spotlightCanvas;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw spotlight circle around target
    const rect = this.getTargetRect();
    if (rect) {
      // Create circular spotlight with some padding
      const padding = 15;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radius = Math.max(rect.width, rect.height) / 2 + padding;

      // Clear spotlight area with gradient
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";

      // Create radial gradient for smooth spotlight edge
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius - 10,
        centerX,
        centerY,
        radius + 10,
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Draw glowing circle outline
      ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /**
   * Render the current tutorial step
   */
  render() {
    this.drawSpotlight();
    this.updateTooltip();
  }

  /**
   * Move to next step
   */
  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.render();
    } else {
      this.complete();
    }
  }

  /**
   * Skip the tutorial
   */
  skip() {
    this.complete();
    if (typeof this.onSkip === "function") {
      this.onSkip();
    }
  }

  /**
   * Complete the tutorial
   */
  complete() {
    // Emit event to mark tutorial as complete in GameState
    this.eventBus.emit("tutorial:complete");

    // Call completion callback if registered
    if (typeof this.onComplete === "function") {
      this.onComplete();
    }

    this.cleanup();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Handle keyboard navigation
    this.keyHandler = (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        this.next();
      } else if (e.key === "Escape") {
        this.skip();
      }
    };

    document.addEventListener("keydown", this.keyHandler);
  }

  /**
   * Setup resize handler to update spotlight
   */
  setupResizeHandler() {
    this.resizeHandler = () => {
      if (this.spotlightCanvas) {
        this.spotlightCanvas.width = window.innerWidth;
        this.spotlightCanvas.height = window.innerHeight;
        this.render();
      }
    };

    window.addEventListener("resize", this.resizeHandler);
  }

  /**
   * Register callback for completion
   * @param {Function} callback
   */
  setOnComplete(callback) {
    this.onComplete = callback;
  }

  /**
   * Register callback for skip
   * @param {Function} callback
   */
  setOnSkip(callback) {
    this.onSkip = callback;
  }

  /**
   * Update method (called each frame)
   * @param {number} deltaTime
   */
  update(deltaTime) {
    // Tutorial is mostly event-driven, minimal frame-by-frame updates needed
  }

  /**
   * Cleanup the tutorial
   */
  cleanup() {
    // Remove event listeners
    if (this.keyHandler) {
      document.removeEventListener("keydown", this.keyHandler);
    }

    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }

    // Remove from DOM
    if (this.sceneElement && this.sceneElement.parentNode) {
      this.sceneElement.parentNode.removeChild(this.sceneElement);
    }

    // Reset references
    this.sceneElement = null;
    this.overlayElement = null;
    this.spotlightCanvas = null;
    this.tooltipElement = null;
    this.isActive = false;

    console.log("Tutorial scene cleaned up");
  }
}

export default Tutorial;
