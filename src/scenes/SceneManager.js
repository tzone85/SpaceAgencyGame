/**
 * SceneManager Class
 *
 * Manages scene transitions, loading, cleanup, and lifecycle.
 * Handles fade transitions and maintains current scene state.
 */

class SceneManager {
  constructor() {
    this.scenes = new Map(); // Registry of all available scenes
    this.currentScene = null; // Currently active scene
    this.previousScene = null; // Previously active scene (for fade transitions)
    this.isTransitioning = false; // Whether a transition is in progress
    this.transitionDuration = 0.5; // Default transition duration in seconds
    this.transitionProgress = 0; // Current progress (0 to 1)
    this.sceneStack = []; // Stack for nested/modal scenes
    this.sceneData = new Map(); // Data passed between scenes
  }

  /**
   * Register a scene class or factory
   * @param {string} name - Unique scene identifier
   * @param {Class|Function} sceneClass - Scene class or factory function
   */
  register(name, sceneClass) {
    if (!name || typeof name !== 'string') {
      throw new Error('Scene name must be a non-empty string');
    }

    if (!sceneClass) {
      throw new Error('Scene class or factory function is required');
    }

    this.scenes.set(name, sceneClass);
  }

  /**
   * Unregister a scene
   * @param {string} name - Scene name to unregister
   */
  unregister(name) {
    this.scenes.delete(name);
  }

  /**
   * Check if a scene is registered
   * @param {string} name - Scene name
   * @returns {boolean}
   */
  isRegistered(name) {
    return this.scenes.has(name);
  }

  /**
   * Create a scene instance
   * @private
   * @param {string} name - Scene name
   * @returns {Object} Scene instance
   */
  createScene(name) {
    if (!this.isRegistered(name)) {
      throw new Error(`Scene '${name}' is not registered`);
    }

    const SceneClass = this.scenes.get(name);

    // Handle both class and factory function patterns
    if (typeof SceneClass === 'function') {
      // Check if it's a class (has prototype methods) or a factory
      if (SceneClass.prototype && Object.getPrototypeOf(SceneClass).constructor === Function) {
        return new SceneClass();
      } else {
        return SceneClass();
      }
    }

    throw new Error(`Invalid scene type for '${name}'`);
  }

  /**
   * Transition to a new scene
   * @param {string} name - Scene name
   * @param {Object} params - Optional parameters to pass to the scene
   * @param {number} duration - Optional transition duration in seconds
   * @returns {Promise} Resolves when transition completes
   */
  async transitionTo(name, params = {}, duration = null) {
    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }

    if (!this.isRegistered(name)) {
      throw new Error(`Cannot transition to unregistered scene '${name}'`);
    }

    this.isTransitioning = true;
    const transitionDuration = duration !== null ? duration : this.transitionDuration;

    // Store the previous scene
    this.previousScene = this.currentScene;

    // Create and initialize the new scene
    const newScene = this.createScene(name);

    // Store scene data if provided
    if (Object.keys(params).length > 0) {
      this.sceneData.set(name, params);
    }

    try {
      // Call scene initialize if it exists
      if (newScene && typeof newScene.initialize === 'function') {
        await newScene.initialize();
      }

      // Perform fade transition
      await this.performFadeTransition(transitionDuration);

      // Cleanup previous scene
      if (this.previousScene && typeof this.previousScene.cleanup === 'function') {
        await this.previousScene.cleanup();
      }

      // Update current scene
      this.currentScene = newScene;

      // Call scene activate if it exists
      if (this.currentScene && typeof this.currentScene.activate === 'function') {
        await this.currentScene.activate(params);
      }

      this.isTransitioning = false;
      return this.currentScene;
    } catch (error) {
      this.isTransitioning = false;
      console.error(`Failed to transition to scene '${name}':`, error);
      throw error;
    }
  }

  /**
   * Perform fade transition animation
   * @private
   * @param {number} duration - Duration in seconds
   */
  performFadeTransition(duration) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let frameId = null;

      const animate = (currentTime) => {
        const elapsed = (currentTime - startTime) / 1000; // Convert to seconds
        this.transitionProgress = Math.min(elapsed / duration, 1);

        if (this.transitionProgress >= 1) {
          this.transitionProgress = 1;
          cancelAnimationFrame(frameId);
          resolve();
        } else {
          frameId = requestAnimationFrame(animate);
        }
      };

      frameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Get the current transition opacity for fade effect
   * @returns {number} Opacity value (0 to 1)
   */
  getTransitionOpacity() {
    if (!this.isTransitioning) {
      return 1; // Fully opaque when not transitioning
    }

    // Fade out then fade in
    if (this.transitionProgress < 0.5) {
      // Fade out phase
      return 1 - (this.transitionProgress * 2);
    } else {
      // Fade in phase
      return (this.transitionProgress - 0.5) * 2;
    }
  }

  /**
   * Push a scene onto the stack (for modal/overlay scenes)
   * @param {string} name - Scene name
   * @param {Object} params - Optional parameters
   * @returns {Object} Scene instance
   */
  pushScene(name, params = {}) {
    if (!this.isRegistered(name)) {
      throw new Error(`Cannot push unregistered scene '${name}'`);
    }

    const scene = this.createScene(name);

    if (scene && typeof scene.initialize === 'function') {
      scene.initialize();
    }

    if (scene && typeof scene.activate === 'function') {
      scene.activate(params);
    }

    this.sceneStack.push({ name, scene, params });
    return scene;
  }

  /**
   * Pop the current scene off the stack
   * @returns {Object} Popped scene instance
   */
  popScene() {
    if (this.sceneStack.length === 0) {
      console.warn('Scene stack is empty');
      return null;
    }

    const { scene } = this.sceneStack.pop();

    if (scene && typeof scene.cleanup === 'function') {
      scene.cleanup();
    }

    return scene;
  }

  /**
   * Get the current active scene
   * @returns {Object|null} Current scene instance
   */
  getCurrentScene() {
    return this.currentScene;
  }

  /**
   * Get the current scene name
   * @returns {string|null} Current scene name
   */
  getCurrentSceneName() {
    if (!this.currentScene) {
      return null;
    }

    for (const [name, SceneClass] of this.scenes.entries()) {
      if (this.currentScene instanceof SceneClass || this.currentScene.constructor === SceneClass) {
        return name;
      }
    }

    return 'unknown';
  }

  /**
   * Get scene data that was passed during transition
   * @param {string} sceneName - Scene name
   * @returns {Object|undefined} Scene data
   */
  getSceneData(sceneName) {
    return this.sceneData.get(sceneName);
  }

  /**
   * Set scene data
   * @param {string} sceneName - Scene name
   * @param {Object} data - Data object
   */
  setSceneData(sceneName, data) {
    this.sceneData.set(sceneName, data);
  }

  /**
   * Get all registered scene names
   * @returns {string[]} Array of scene names
   */
  getRegisteredScenes() {
    return Array.from(this.scenes.keys());
  }

  /**
   * Check if currently in a transition
   * @returns {boolean}
   */
  isInTransition() {
    return this.isTransitioning;
  }

  /**
   * Get the transition progress (0 to 1)
   * @returns {number}
   */
  getTransitionProgress() {
    return this.transitionProgress;
  }

  /**
   * Set the default transition duration
   * @param {number} duration - Duration in seconds
   */
  setTransitionDuration(duration) {
    if (typeof duration !== 'number' || duration < 0) {
      throw new Error('Transition duration must be a non-negative number');
    }

    this.transitionDuration = duration;
  }

  /**
   * Clear all scenes and data
   */
  clear() {
    if (this.currentScene && typeof this.currentScene.cleanup === 'function') {
      this.currentScene.cleanup();
    }

    // Cleanup all stacked scenes
    while (this.sceneStack.length > 0) {
      this.popScene();
    }

    this.currentScene = null;
    this.previousScene = null;
    this.sceneStack = [];
    this.sceneData.clear();
    this.isTransitioning = false;
    this.transitionProgress = 0;
  }

  /**
   * Get manager statistics
   * @returns {Object} Manager state information
   */
  getStats() {
    return {
      currentScene: this.getCurrentSceneName(),
      isTransitioning: this.isTransitioning,
      transitionProgress: this.transitionProgress,
      transitionDuration: this.transitionDuration,
      stackedScenes: this.sceneStack.length,
      registeredScenes: this.getRegisteredScenes().length,
    };
  }
}

export default SceneManager;
