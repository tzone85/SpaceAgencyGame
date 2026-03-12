/**
 * Engine Class
 *
 * Core game engine that handles rendering, game loop,
 * and system updates. Acts as the heart of the game.
 */

import Renderer from "./renderer.js";

class Engine {
  constructor() {
    this.isInitialized = false;
    this.isRunning = false;
    this.frameCount = 0;
    this.deltaTime = 0;
    this.lastTime = 0;
    this.currentTime = 0;
    this.fpsTarget = 60;
    this.frameInterval = 1000 / this.fpsTarget;
    this.animationFrameId = null;

    // Canvas and renderer
    this.canvas = null;
    this.renderer = null;
  }

  /**
   * Initialize the engine - setup canvas and renderer
   */
  initialize() {
    if (this.isInitialized) {
      console.warn("Engine already initialized");
      return;
    }

    console.log("Initializing game engine...");

    // Setup canvas
    this.setupCanvas();

    // Initialize renderer
    this.renderer = new Renderer(this.canvas);

    this.isInitialized = true;
    console.log("Game engine initialized successfully");
  }

  /**
   * Setup the game canvas
   */
  setupCanvas() {
    // Create canvas if it doesn't exist
    let canvas = document.getElementById("gameCanvas");

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "gameCanvas";
      document.body.appendChild(canvas);
    }

    // Set canvas size
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Add styling
    canvas.style.display = "block";
    canvas.style.margin = "0";
    canvas.style.padding = "0";
    canvas.style.backgroundColor = "#000000";

    this.canvas = canvas;
  }

  /**
   * Start the main game loop
   */
  start() {
    if (!this.isInitialized) {
      console.error("Engine must be initialized before starting");
      return;
    }

    if (this.isRunning) {
      console.warn("Game loop already running");
      return;
    }

    console.log("Starting game loop at 60 FPS...");
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  /**
   * Main game loop - runs at 60 FPS
   */
  gameLoop = () => {
    this.currentTime = performance.now();
    this.deltaTime = (this.currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = this.currentTime;

    // Cap delta time to prevent large jumps
    if (this.deltaTime > 0.1) {
      this.deltaTime = 0.1;
    }

    // Update game state
    this.update(this.deltaTime);

    // Render
    this.render();

    // Continue loop if still running
    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  };

  /**
   * Update game state
   */
  update(deltaTime) {
    this.frameCount++;
  }

  /**
   * Render the game
   */
  render() {
    if (this.renderer) {
      this.renderer.clear();
      // Render game content here
    }
  }

  /**
   * Stop the game loop
   */
  stop() {
    if (!this.isRunning) {
      console.warn("Game loop is not running");
      return;
    }

    console.log("Stopping game loop...");
    this.isRunning = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Get engine statistics
   */
  getStats() {
    return {
      frameCount: this.frameCount,
      deltaTime: this.deltaTime,
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
      fpsTarget: this.fpsTarget,
      canvasWidth: this.canvas ? this.canvas.width : 0,
      canvasHeight: this.canvas ? this.canvas.height : 0,
    };
  }

  /**
   * Cleanup and destroy engine resources
   */
  destroy() {
    this.stop();

    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }

    this.isInitialized = false;
    console.log("Engine destroyed");
  }
}

export default Engine;
