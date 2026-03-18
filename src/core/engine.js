/**
 * Game Loop Engine
 *
 * Runs a requestAnimationFrame loop, calculates delta time,
 * and calls registered update callbacks. Manages a Canvas 2D context.
 * No WebGL, no 3D camera, no scene manager — systems and scenes
 * will be added by later waves.
 */

class Engine {
  constructor() {
    this.frameRate = 60;
    this.frameCount = 0;
    this.deltaTime = 0;
    this.lastTime = 0;
    this.fpsTarget = 60;
    this.animationFrameId = null;
    this.isRunning = false;
    this.isInitialized = false;

    // Canvas 2D
    this.canvas = null;
    this.ctx = null;

    // Registered update callbacks
    this.updateCallbacks = [];

    // Resize handler reference for cleanup
    this.resizeHandler = null;
  }

  /**
   * Initialize the engine - setup canvas and 2D context
   */
  initialize() {
    if (this.isInitialized) {
      console.warn("Engine already initialized");
      return;
    }

    this.setupCanvas();
    this.setupResizeHandler();

    this.isInitialized = true;
    console.log("Game engine initialized (Canvas 2D)");
  }

  /**
   * Setup the game canvas with a 2D context
   */
  setupCanvas() {
    let canvas = document.getElementById("gameCanvas");

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "gameCanvas";
      document.body.appendChild(canvas);
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    canvas.style.display = "block";
    canvas.style.margin = "0";
    canvas.style.padding = "0";
    canvas.style.backgroundColor = "#000000";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1";

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  /**
   * Setup window resize handling
   */
  setupResizeHandler() {
    const handleResize = () => {
      if (this.canvas) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    this.resizeHandler = handleResize;
  }

  /**
   * Register a callback to be called every frame with deltaTime
   * @param {Function} callback - Receives deltaTime in seconds
   * @returns {Function} Unregister function
   */
  onUpdate(callback) {
    if (typeof callback !== "function") {
      throw new Error("onUpdate callback must be a function");
    }
    this.updateCallbacks.push(callback);

    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(
        (cb) => cb !== callback
      );
    };
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

    console.log("Engine started");
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  /**
   * Core loop - calculates delta, invokes update callbacks, schedules next frame
   */
  loop() {
    if (!this.isRunning) return;

    const now = performance.now();
    this.deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Cap delta to prevent large jumps (e.g. after tab switch)
    if (this.deltaTime > 0.1) {
      this.deltaTime = 0.1;
    }

    this.update(this.deltaTime);
    this.frameCount++;

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  /**
   * Call all registered update callbacks
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    for (const callback of this.updateCallbacks) {
      try {
        callback(deltaTime);
      } catch (error) {
        console.error("Error in update callback:", error);
      }
    }
  }

  /**
   * Stop the game loop
   */
  stop() {
    console.log("Engine stopped");
    this.isRunning = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Get engine statistics
   * @returns {Object} Current engine stats
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
   * Destroy the engine and clean up all resources
   */
  destroy() {
    this.stop();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }

    this.updateCallbacks = [];

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
    this.isInitialized = false;

    console.log("Engine destroyed");
  }
}

export default Engine;
export { Engine };
