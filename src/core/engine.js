/**
 * Engine Class
 *
 * Core game engine that handles rendering, game loop,
 * and system updates. Acts as the heart of the game.
 */

import Renderer from "./renderer.js";
import Camera from "./camera.js";
import SceneManager from "../scenes/scene-manager.js";
import SpaceScene from "../scenes/space-scene.js";

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
    
    // 3D components
    this.camera = null;
    this.sceneManager = null;
  }

  /**
   * Initialize the engine - setup canvas, renderer, camera and scenes
   */
  initialize() {
    if (this.isInitialized) {
      console.warn("Engine already initialized");
      return;
    }

    console.log("Initializing 3D game engine...");

    try {
      // Setup canvas
      this.setupCanvas();

      // Initialize renderer
      this.renderer = new Renderer(this.canvas);

      // Initialize 3D camera
      this.camera = new Camera(this.canvas);
      
      // Initialize scene manager
      this.sceneManager = new SceneManager(this.renderer, this.camera);
      
      // Register and initialize default scenes
      this.registerDefaultScenes();
      
      // Setup resize handler
      this.setupResizeHandler();

      this.isInitialized = true;
      console.log("3D Game engine initialized successfully");
    } catch (error) {
      console.error("Failed to initialize engine:", error);
      throw error;
    }
  }
  
  /**
   * Register default scenes
   */
  registerDefaultScenes() {
    // Register the main space scene
    this.sceneManager.registerScene('space', SpaceScene, {
      starCount: 1500,
      enableParticles: true
    });
    
    // Switch to space scene as default
    this.sceneManager.switchToScene('space');
  }
  
  /**
   * Setup window resize handling
   */
  setupResizeHandler() {
    const handleResize = () => {
      if (this.canvas) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Update camera aspect ratio
        if (this.camera) {
          this.camera.updateAspectRatio(this.canvas);
        }
        
        // Update WebGL viewport
        if (this.renderer && this.renderer.getContext()) {
          const gl = this.renderer.getContext();
          gl.viewport(0, 0, width, height);
        }
        
        // Notify current scene about resize
        const currentScene = this.sceneManager?.getCurrentScene();
        if (currentScene && currentScene.onResize) {
          currentScene.onResize(width, height);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Store reference for cleanup
    this.resizeHandler = handleResize;
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

    // Add styling for fullscreen 3D
    canvas.style.display = "block";
    canvas.style.margin = "0";
    canvas.style.padding = "0";
    canvas.style.backgroundColor = "#000000";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1";

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

    console.log("Starting 3D game loop at 60 FPS...");
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
    
    // Update camera
    if (this.camera) {
      this.camera.update(deltaTime);
    }
    
    // Update scene manager and current scene
    if (this.sceneManager) {
      this.sceneManager.update(deltaTime);
    }
  }

  /**
   * Render the game
   */
  render() {
    if (!this.renderer || !this.renderer.isReady()) {
      return;
    }
    
    // Enable 3D depth testing
    const gl = this.renderer.getContext();
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    // Clear buffers
    this.renderer.clear();
    
    // Render through scene manager
    if (this.sceneManager) {
      this.sceneManager.render();
    }
  }
  
  /**
   * Get the camera instance
   */
  getCamera() {
    return this.camera;
  }
  
  /**
   * Get the scene manager instance
   */
  getSceneManager() {
    return this.sceneManager;
  }
  
  /**
   * Switch to a scene
   */
  switchScene(sceneId) {
    if (this.sceneManager) {
      return this.sceneManager.switchToScene(sceneId);
    }
    return false;
  }
  
  /**
   * Transition to a scene with animation
   */
  transitionToScene(sceneId, transitionType = 'fade', duration = 1.0) {
    if (this.sceneManager) {
      return this.sceneManager.transitionToScene(sceneId, transitionType, duration);
    }
    return false;
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
      cameraState: this.camera ? this.camera.getState() : null,
      sceneManagerState: this.sceneManager ? this.sceneManager.getState() : null,
    };
  }

  /**
   * Cleanup and destroy engine resources
   */
  destroy() {
    this.stop();

    // Remove resize handler
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    // Destroy scene manager
    if (this.sceneManager) {
      this.sceneManager.destroy();
      this.sceneManager = null;
    }

    // Clear camera reference
    this.camera = null;

    // Destroy renderer
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }

    this.isInitialized = false;
    console.log("Engine destroyed");
  }
}

export default Engine;
