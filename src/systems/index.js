/**
 * Systems Module
 *
 * Exports all game systems that handle specific functionality.
 * Includes physics, audio, input, mission systems, crew systems, etc.
 */

import CrewSystem from "./CrewSystem.js";

export const SystemManager = class {
  constructor() {
    this.systems = {};
  }

  initialize() {
    console.log("System Manager initialized");
  }

  destroy() {
    console.log("System Manager destroyed");
  }
};

export { CrewSystem };
export default SystemManager;
