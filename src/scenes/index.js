/**
 * Scenes Module
 *
 * Placeholder for scene management.
 * This module will handle different game scenes like menu, gameplay, etc.
 */

import MainMenu from "./MainMenu.js";
import CrewQuarters from "./CrewQuarters.js";
import LaunchSequence from "./LaunchSequence.js";
import Tutorial from "./Tutorial.js";

export const SceneManager = class {
  constructor() {
    this.scenes = {};
    this.currentScene = null;
  }

  registerScene(name, scene) {
    this.scenes[name] = scene;
  }

  switchScene(name) {
    this.currentScene = this.scenes[name];
    console.log(`Switched to scene: ${name}`);
  }

  initialize() {
    console.log("Scene Manager initialized");
  }

  destroy() {
    console.log("Scene Manager destroyed");
  }
};

export { MainMenu, CrewQuarters, LaunchSequence, Tutorial };
export default SceneManager;
