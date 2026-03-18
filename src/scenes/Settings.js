/**
 * Settings Scene Module
 * Manages game settings and manual save/load functionality
 */

import { createButton, createToast, showToast } from "../ui/components.js";
import { GameState } from "../game/GameState.js";

export class Settings {
  constructor(gameInstance = null) {
    this.name = "Settings";
    this.gameInstance = gameInstance;
    this.settingsElement = null;
    this.saveButton = null;
    this.loadButton = null;
    this.clearButton = null;
  }

  /**
   * Initialize the settings scene
   */
  init() {
    this.initialize();
  }

  /**
   * Initialize the settings scene
   */
  initialize() {
    this.createSettingsUI();
  }

  /**
   * Create the settings UI structure
   */
  createSettingsUI() {
    this.settingsElement = document.createElement("div");
    this.settingsElement.id = "settings";
    this.settingsElement.className = "settings";

    // Create header
    const header = document.createElement("div");
    header.className = "settings-header";
    const title = document.createElement("h1");
    title.textContent = "Settings";
    header.appendChild(title);

    // Create save section
    const saveSection = document.createElement("div");
    saveSection.className = "settings-section";
    const saveTitle = document.createElement("h2");
    saveTitle.textContent = "Game Save";
    saveSection.appendChild(saveTitle);

    // Manual save button
    this.saveButton = createButton({
      text: "Save Game",
      variant: "primary",
      id: "manual-save-btn",
      onClick: () => this.handleManualSave(),
    });
    saveSection.appendChild(this.saveButton);

    // Load button
    this.loadButton = createButton({
      text: "Load Game",
      variant: "secondary",
      id: "manual-load-btn",
      onClick: () => this.handleManualLoad(),
    });
    saveSection.appendChild(this.loadButton);

    // Clear button
    this.clearButton = createButton({
      text: "Clear Save",
      variant: "danger",
      id: "clear-save-btn",
      onClick: () => this.handleClearSave(),
    });
    saveSection.appendChild(this.clearButton);

    this.settingsElement.appendChild(header);
    this.settingsElement.appendChild(saveSection);

    if (!document.getElementById("settings")) {
      document.body.appendChild(this.settingsElement);
    }
  }

  /**
   * Handle manual save
   */
  handleManualSave() {
    if (!this.gameInstance || !this.gameInstance.manualSave) {
      const toast = createToast({
        message: "Game instance not available",
        type: "error",
        duration: 3000,
      });
      showToast(toast, 3000);
      return;
    }

    const success = this.gameInstance.manualSave();
    const toast = createToast({
      message: success ? "Game saved successfully!" : "Failed to save game",
      type: success ? "success" : "error",
      duration: 3000,
    });
    showToast(toast, 3000);
  }

  /**
   * Handle manual load
   */
  handleManualLoad() {
    if (!this.gameInstance || !this.gameInstance.saveSystem) {
      const toast = createToast({
        message: "Game instance not available",
        type: "error",
        duration: 3000,
      });
      showToast(toast, 3000);
      return;
    }

    const savedData = this.gameInstance.saveSystem.load();
    if (!savedData) {
      const toast = createToast({
        message: "No save game found",
        type: "error",
        duration: 3000,
      });
      showToast(toast, 3000);
      return;
    }

    // Load the saved state
    this.gameInstance.gameState = new GameState(savedData);
    const toast = createToast({
      message: "Game loaded successfully!",
      type: "success",
      duration: 3000,
    });
    showToast(toast, 3000);
  }

  /**
   * Handle clear save
   */
  handleClearSave() {
    if (!this.gameInstance || !this.gameInstance.saveSystem) {
      const toast = createToast({
        message: "Game instance not available",
        type: "error",
        duration: 3000,
      });
      showToast(toast, 3000);
      return;
    }

    if (confirm("Are you sure you want to clear your save game?")) {
      this.gameInstance.saveSystem.clear();
      const toast = createToast({
        message: "Save game cleared",
        type: "success",
        duration: 3000,
      });
      showToast(toast, 3000);
    }
  }

  /**
   * Update the scene
   */
  update() {
    // Update settings state
  }

  /**
   * Render the scene
   */
  render() {
    // Render settings
  }

  /**
   * Cleanup the scene
   */
  destroy() {
    if (this.settingsElement && this.settingsElement.parentNode) {
      this.settingsElement.parentNode.removeChild(this.settingsElement);
    }
    this.settingsElement = null;
    this.saveButton = null;
    this.loadButton = null;
    this.clearButton = null;
  }

  /**
   * Cleanup resources (alias for destroy)
   */
  cleanup() {
    this.destroy();
  }
}

export default Settings;
