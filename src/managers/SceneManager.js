/**
 * SceneManager Class
 *
 * Consolidated scene manager handling scene lifecycle, transitions,
 * rendering, and state management. Supports both immediate scene
 * switching and animated transitions with fade effects.
 */

class SceneManager {
  constructor(renderer = null, camera = null) {
    this.renderer = renderer;
    this.camera = camera;

    // Scene management
    this.scenes = new Map();
    this.currentScene = null;
    this.currentSceneId = null;
    this.nextScene = null;

    // Transition management
    this.isTransitioning = false;
    this.transitionDuration = 0.5;
    this.transitionProgress = 0;
    this.transitionData = {
      fromScene: null,
      toScene: null,
      progress: 0,
      duration: 1.0,
      type: 'fade',
    };

    // Scene stack for modal/overlay scenes
    this.sceneStack = [];
    this.sceneData = new Map();
    this.previousScene = null;
  }

  // ---------------------------------------------------------------------------
  // Registration (supports both class-based and instance-based registration)
  // ---------------------------------------------------------------------------

  /**
   * Register a scene with a class constructor and optional config.
   * The scene class will be instantiated and validated for required methods.
   * @param {string} sceneId - Unique scene identifier
   * @param {Function|Object} sceneClassOrInstance - Scene class, factory, or instance
   * @param {Object} config - Optional config passed to scene constructor
   * @returns {boolean} Whether registration succeeded
   */
  registerScene(sceneId, sceneClassOrInstance, config = {}) {
    if (this.scenes.has(sceneId)) {
      console.warn(`Scene '${sceneId}' already registered, replacing...`);
    }

    // If it's a plain object (instance) with an initialize method, store it directly
    if (
      sceneClassOrInstance &&
      typeof sceneClassOrInstance === 'object' &&
      typeof sceneClassOrInstance.initialize === 'function'
    ) {
      this.scenes.set(sceneId, sceneClassOrInstance);
      return true;
    }

    // If it's a class/function, try to instantiate it
    if (typeof sceneClassOrInstance === 'function') {
      try {
        const scene = new sceneClassOrInstance(this.renderer, this.camera, config);

        if (!this.validateSceneInterface(scene)) {
          throw new Error(`Scene '${sceneId}' does not implement required interface`);
        }

        this.scenes.set(sceneId, scene);
        console.log(`Scene '${sceneId}' registered successfully`);
        return true;
      } catch (error) {
        console.error(`Failed to register scene '${sceneId}':`, error);
        return false;
      }
    }

    // Invalid scene
    if (!sceneClassOrInstance || typeof sceneClassOrInstance.initialize !== 'function') {
      throw new Error(`Invalid scene: ${sceneId}. Scene must have initialize method.`);
    }

    this.scenes.set(sceneId, sceneClassOrInstance);
    return true;
  }

  /**
   * Register a scene class or factory function (simple API).
   * @param {string} name - Unique scene identifier
   * @param {Function} sceneClass - Scene class or factory function
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
   * Unregister a scene by name (simple API).
   * @param {string} name - Scene name to unregister
   */
  unregister(name) {
    this.scenes.delete(name);
  }

  /**
   * Unregister a scene by ID, preventing removal of the current scene.
   * @param {string} sceneId - Scene identifier
   * @returns {boolean} Whether unregistration succeeded
   */
  unregisterScene(sceneId) {
    if (!this.scenes.has(sceneId)) {
      console.warn(`Scene '${sceneId}' not found for unregistration`);
      return false;
    }

    const scene = this.scenes.get(sceneId);

    if (scene === this.currentScene) {
      console.error(`Cannot unregister current scene '${sceneId}'`);
      return false;
    }

    if (typeof scene.destroy === 'function') {
      scene.destroy();
    }

    this.scenes.delete(sceneId);
    console.log(`Scene '${sceneId}' unregistered`);
    return true;
  }

  /**
   * Check if a scene is registered.
   * @param {string} name - Scene name
   * @returns {boolean}
   */
  isRegistered(name) {
    return this.scenes.has(name);
  }

  // ---------------------------------------------------------------------------
  // Scene Interface Validation
  // ---------------------------------------------------------------------------

  /**
   * Validate that a scene implements all required methods.
   * @param {Object} scene - Scene instance to validate
   * @returns {boolean}
   */
  validateSceneInterface(scene) {
    const requiredMethods = ['initialize', 'update', 'render', 'destroy', 'onEnter', 'onExit'];

    for (const method of requiredMethods) {
      if (typeof scene[method] !== 'function') {
        console.error(`Scene missing required method: ${method}`);
        return false;
      }
    }

    return true;
  }

  // ---------------------------------------------------------------------------
  // Scene Creation (for class-based registration via register())
  // ---------------------------------------------------------------------------

  /**
   * Create a scene instance from a registered class or factory.
   * @param {string} name - Scene name
   * @returns {Object} Scene instance
   */
  createScene(name) {
    if (!this.isRegistered(name)) {
      throw new Error(`Scene '${name}' is not registered`);
    }

    const SceneClass = this.scenes.get(name);

    if (typeof SceneClass === 'function') {
      if (SceneClass.prototype && Object.getPrototypeOf(SceneClass).constructor === Function) {
        return new SceneClass();
      }
      return SceneClass();
    }

    throw new Error(`Invalid scene type for '${name}'`);
  }

  // ---------------------------------------------------------------------------
  // Immediate Scene Switching
  // ---------------------------------------------------------------------------

  /**
   * Switch to a scene immediately (no transition animation).
   * @param {string} sceneId - Scene identifier
   * @returns {boolean} Whether switch succeeded
   */
  switchToScene(sceneId) {
    if (!this.scenes.has(sceneId)) {
      console.error(`Scene '${sceneId}' not found`);
      return false;
    }

    if (this.currentScene && typeof this.currentScene.onExit === 'function') {
      this.currentScene.onExit();
    }

    this.currentScene = this.scenes.get(sceneId);
    this.currentSceneId = sceneId;

    if (!this.currentScene.isInitialized) {
      this.currentScene.initialize();
    }
    if (typeof this.currentScene.onEnter === 'function') {
      this.currentScene.onEnter();
    }

    console.log(`Switched to scene: ${sceneId}`);
    return true;
  }

  /**
   * Load and queue a scene for transition on next update (simple API).
   * @param {string} sceneName - Scene name
   */
  loadScene(sceneName) {
    if (!this.scenes.has(sceneName)) {
      throw new Error(`Scene not found: ${sceneName}`);
    }
    this.nextScene = this.scenes.get(sceneName);
  }

  /**
   * Process queued scene transitions (called internally by update).
   */
  transitionScene() {
    if (this.nextScene && this.nextScene !== this.currentScene) {
      if (this.currentScene && typeof this.currentScene.cleanup === 'function') {
        this.currentScene.cleanup();
      }

      this.currentScene = this.nextScene;
      this.nextScene = null;

      if (typeof this.currentScene.initialize === 'function') {
        this.currentScene.initialize();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Animated Transitions
  // ---------------------------------------------------------------------------

  /**
   * Start an animated transition to a scene (WebGL transition).
   * @param {string} sceneId - Scene identifier
   * @param {string} transitionType - Transition type: 'fade', 'slide', 'zoom'
   * @param {number} duration - Transition duration in seconds
   * @returns {boolean} Whether transition started
   */
  transitionToScene(sceneId, transitionType = 'fade', duration = 1.0) {
    if (!this.scenes.has(sceneId)) {
      console.error(`Scene '${sceneId}' not found`);
      return false;
    }

    if (this.isTransitioning) {
      console.warn('Already transitioning, ignoring request');
      return false;
    }

    if (this.currentSceneId === sceneId) {
      console.log(`Already in scene '${sceneId}'`);
      return true;
    }

    const targetScene = this.scenes.get(sceneId);

    if (!targetScene.isInitialized && typeof targetScene.initialize === 'function') {
      targetScene.initialize();
    }

    this.isTransitioning = true;
    this.transitionData = {
      fromScene: this.currentScene,
      toScene: targetScene,
      progress: 0,
      duration: Math.max(0.1, duration),
      type: transitionType,
    };

    if (this.currentScene && typeof this.currentScene.onTransitionOut === 'function') {
      this.currentScene.onTransitionOut();
    }
    if (typeof targetScene.onTransitionIn === 'function') {
      targetScene.onTransitionIn();
    }

    console.log(`Starting transition to scene '${sceneId}' (${transitionType}, ${duration}s)`);
    return true;
  }

  /**
   * Transition to a new scene with async lifecycle (Promise-based).
   * @param {string} name - Scene name
   * @param {Object} params - Optional parameters to pass to the scene
   * @param {number} duration - Optional transition duration in seconds
   * @returns {Promise<Object>} Resolves with the new scene instance
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

    this.previousScene = this.currentScene;

    const newScene = this.createScene(name);

    if (Object.keys(params).length > 0) {
      this.sceneData.set(name, params);
    }

    try {
      if (newScene && typeof newScene.initialize === 'function') {
        await newScene.initialize();
      }

      await this.performFadeTransition(transitionDuration);

      if (this.previousScene && typeof this.previousScene.cleanup === 'function') {
        await this.previousScene.cleanup();
      }

      this.currentScene = newScene;

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
   * Perform fade transition animation.
   * @param {number} duration - Duration in seconds
   * @returns {Promise<void>}
   */
  performFadeTransition(duration) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let frameId = null;

      const animate = (currentTime) => {
        const elapsed = (currentTime - startTime) / 1000;
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
   * Get the current transition opacity for fade effect.
   * @returns {number} Opacity value (0 to 1)
   */
  getTransitionOpacity() {
    if (!this.isTransitioning) {
      return 1;
    }

    if (this.transitionProgress < 0.5) {
      return 1 - this.transitionProgress * 2;
    }
    return (this.transitionProgress - 0.5) * 2;
  }

  /**
   * Complete the current WebGL transition.
   */
  completeTransition() {
    const { fromScene, toScene } = this.transitionData;

    if (fromScene && typeof fromScene.onExit === 'function') {
      fromScene.onExit();
    }

    this.currentScene = toScene;
    this.currentSceneId = this.getSceneId(toScene);
    if (toScene && typeof toScene.onEnter === 'function') {
      toScene.onEnter();
    }

    this.isTransitioning = false;
    this.transitionData = {
      fromScene: null,
      toScene: null,
      progress: 0,
      duration: 1.0,
      type: 'fade',
    };

    console.log(`Transition completed to scene: ${this.currentSceneId}`);
  }

  // ---------------------------------------------------------------------------
  // Scene Stack (modal/overlay scenes)
  // ---------------------------------------------------------------------------

  /**
   * Push a scene onto the stack.
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
   * Pop the current scene off the stack.
   * @returns {Object|null} Popped scene instance
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

  // ---------------------------------------------------------------------------
  // Update & Render
  // ---------------------------------------------------------------------------

  /**
   * Update the scene manager and current scene.
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Handle queued scene transitions (from loadScene)
    this.transitionScene();

    // Handle WebGL transitions
    if (this.isTransitioning && this.transitionData.toScene) {
      this.updateTransition(deltaTime);
    }

    if (this.currentScene && typeof this.currentScene.update === 'function') {
      if (!this.isTransitioning || this.currentScene.isInitialized) {
        this.currentScene.update(deltaTime);
      }
    }

    if (this.isTransitioning && this.transitionData.toScene) {
      if (typeof this.transitionData.toScene.update === 'function') {
        this.transitionData.toScene.update(deltaTime);
      }
    }
  }

  /**
   * Update transition progress for WebGL transitions.
   * @param {number} deltaTime - Time since last frame
   */
  updateTransition(deltaTime) {
    this.transitionData.progress += deltaTime / this.transitionData.duration;

    if (this.transitionData.progress >= 1.0) {
      this.completeTransition();
    }
  }

  /**
   * Render the current scene.
   * @param {Object} renderer - Optional renderer instance
   */
  render(renderer) {
    // If called with a renderer argument (simple API)
    if (renderer !== undefined) {
      if (this.currentScene && typeof this.currentScene.render === 'function') {
        this.currentScene.render(renderer);
      }
      return;
    }

    // WebGL rendering path
    if (!this.renderer || (typeof this.renderer.isReady === 'function' && !this.renderer.isReady())) {
      return;
    }

    if (this.isTransitioning) {
      this.renderTransition();
    } else if (this.currentScene && this.currentScene.isInitialized) {
      this.currentScene.render();
    }
  }

  /**
   * Render scenes during a WebGL transition.
   */
  renderTransition() {
    const { fromScene, toScene, progress, type } = this.transitionData;

    switch (type) {
      case 'fade':
        this.renderFadeTransition(fromScene, toScene, progress);
        break;
      case 'slide':
      case 'zoom':
        this.renderFadeTransition(fromScene, toScene, progress);
        break;
      default:
        if (toScene && typeof toScene.render === 'function') {
          toScene.render();
        }
    }
  }

  /**
   * Render fade transition between two scenes.
   */
  renderFadeTransition(fromScene, toScene, progress) {
    const gl = this.renderer.getContext();

    this.renderer.clear();

    if (fromScene && progress < 1.0 && typeof fromScene.render === 'function') {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      fromScene.render(1.0 - progress);
    }

    if (toScene && progress > 0.0 && typeof toScene.render === 'function') {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      toScene.render(progress);
    }
  }

  // ---------------------------------------------------------------------------
  // Queries & State
  // ---------------------------------------------------------------------------

  /**
   * Get the current scene instance.
   * @returns {Object|null}
   */
  getCurrentScene() {
    return this.currentScene;
  }

  /**
   * Get the current scene ID.
   * @returns {string|null}
   */
  getCurrentSceneId() {
    return this.currentSceneId;
  }

  /**
   * Get the current scene name (for class-based scenes).
   * @returns {string|null}
   */
  getCurrentSceneName() {
    if (!this.currentScene) {
      return null;
    }

    for (const [name, SceneClass] of this.scenes.entries()) {
      if (
        this.currentScene instanceof SceneClass ||
        this.currentScene.constructor === SceneClass
      ) {
        return name;
      }
    }

    return 'unknown';
  }

  /**
   * Get scene ID by scene instance.
   * @param {Object} sceneInstance
   * @returns {string|null}
   */
  getSceneId(sceneInstance) {
    for (const [id, scene] of this.scenes) {
      if (scene === sceneInstance) {
        return id;
      }
    }
    return null;
  }

  /**
   * Check if currently transitioning.
   * @returns {boolean}
   */
  isCurrentlyTransitioning() {
    return this.isTransitioning;
  }

  /**
   * Check if currently in a transition (alias).
   * @returns {boolean}
   */
  isInTransition() {
    return this.isTransitioning;
  }

  /**
   * Get transition progress (0 to 1).
   * @returns {number}
   */
  getTransitionProgress() {
    return this.transitionProgress;
  }

  /**
   * List all registered scene IDs.
   * @returns {string[]}
   */
  listScenes() {
    return Array.from(this.scenes.keys());
  }

  /**
   * Get all registered scene names (alias for listScenes).
   * @returns {string[]}
   */
  getRegisteredScenes() {
    return Array.from(this.scenes.keys());
  }

  /**
   * Get scene data that was passed during transition.
   * @param {string} sceneName
   * @returns {Object|undefined}
   */
  getSceneData(sceneName) {
    return this.sceneData.get(sceneName);
  }

  /**
   * Set scene data.
   * @param {string} sceneName
   * @param {Object} data
   */
  setSceneData(sceneName, data) {
    this.sceneData.set(sceneName, data);
  }

  /**
   * Set the default transition duration.
   * @param {number} duration - Duration in seconds
   */
  setTransitionDuration(duration) {
    if (typeof duration !== 'number' || duration < 0) {
      throw new Error('Transition duration must be a non-negative number');
    }
    this.transitionDuration = duration;
  }

  /**
   * Get scene manager state for debugging (WebGL-oriented state).
   * @returns {Object}
   */
  getState() {
    return {
      currentSceneId: this.currentSceneId,
      isTransitioning: this.isTransitioning,
      transitionProgress: this.transitionData.progress,
      transitionType: this.transitionData.type,
      registeredScenes: this.listScenes(),
    };
  }

  /**
   * Get manager statistics.
   * @returns {Object}
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

  // ---------------------------------------------------------------------------
  // Cleanup & Destruction
  // ---------------------------------------------------------------------------

  /**
   * Clear all scenes, data, and reset state.
   */
  clear() {
    if (this.currentScene && typeof this.currentScene.cleanup === 'function') {
      this.currentScene.cleanup();
    }

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
   * Destroy scene manager and all scenes.
   */
  destroy() {
    if (this.isTransitioning && this.transitionData.toScene) {
      this.completeTransition();
    }

    // Cleanup current scene
    if (this.currentScene && typeof this.currentScene.cleanup === 'function') {
      this.currentScene.cleanup();
    }

    // Destroy all registered scenes
    for (const [sceneId, scene] of this.scenes) {
      try {
        if (typeof scene.destroy === 'function') {
          scene.destroy();
        } else if (typeof scene.cleanup === 'function') {
          scene.cleanup();
        }
      } catch (error) {
        console.error(`Error destroying scene '${sceneId}':`, error);
      }
    }

    this.scenes.clear();
    this.currentScene = null;
    this.currentSceneId = null;
    this.nextScene = null;
    this.renderer = null;
    this.camera = null;

    console.log('Scene Manager destroyed');
  }
}

export default SceneManager;
