/**
 * SceneManager Class
 *
 * Manages multiple 3D scenes, handles scene transitions,
 * and provides scene lifecycle management.
 */

class SceneManager {
  constructor(renderer, camera) {
    this.renderer = renderer;
    this.camera = camera;
    
    // Scene management
    this.scenes = new Map(); // scene_id -> scene_instance
    this.currentScene = null;
    this.currentSceneId = null;
    
    // Transition management
    this.isTransitioning = false;
    this.transitionData = {
      fromScene: null,
      toScene: null,
      progress: 0,
      duration: 1.0, // seconds
      type: 'fade' // 'fade', 'slide', 'zoom'
    };
    
    console.log('Scene Manager initialized successfully');
  }
  
  /**
   * Register a new scene
   */
  registerScene(sceneId, sceneClass, config = {}) {
    if (this.scenes.has(sceneId)) {
      console.warn(`Scene '${sceneId}' already registered, replacing...`);
    }
    
    try {
      // Create scene instance
      const scene = new sceneClass(this.renderer, this.camera, config);
      
      // Validate scene interface
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
  
  /**
   * Validate that scene implements required interface
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
  
  /**
   * Switch to a scene immediately (no transition)
   */
  switchToScene(sceneId) {
    if (!this.scenes.has(sceneId)) {
      console.error(`Scene '${sceneId}' not found`);
      return false;
    }
    
    // Exit current scene
    if (this.currentScene) {
      this.currentScene.onExit();
    }
    
    // Switch to new scene
    this.currentScene = this.scenes.get(sceneId);
    this.currentSceneId = sceneId;
    
    // Initialize and enter new scene
    if (!this.currentScene.isInitialized) {
      this.currentScene.initialize();
    }
    this.currentScene.onEnter();
    
    console.log(`Switched to scene: ${sceneId}`);
    return true;
  }
  
  /**
   * Transition to a scene with animation
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
    
    // Initialize target scene if needed
    if (!targetScene.isInitialized) {
      targetScene.initialize();
    }
    
    // Setup transition
    this.isTransitioning = true;
    this.transitionData = {
      fromScene: this.currentScene,
      toScene: targetScene,
      progress: 0,
      duration: Math.max(0.1, duration),
      type: transitionType
    };
    
    // Notify scenes about transition
    if (this.currentScene) {
      this.currentScene.onTransitionOut();
    }
    targetScene.onTransitionIn();
    
    console.log(`Starting transition to scene '${sceneId}' (${transitionType}, ${duration}s)`);
    return true;
  }
  
  /**
   * Update scene manager and current scene
   */
  update(deltaTime) {
    // Handle scene transitions
    if (this.isTransitioning) {
      this.updateTransition(deltaTime);
    }
    
    // Update current scene
    if (this.currentScene && this.currentScene.isInitialized) {
      this.currentScene.update(deltaTime);
    }
    
    // Update transition target scene during transition
    if (this.isTransitioning && this.transitionData.toScene) {
      this.transitionData.toScene.update(deltaTime);
    }
  }
  
  /**
   * Update transition progress
   */
  updateTransition(deltaTime) {
    this.transitionData.progress += deltaTime / this.transitionData.duration;
    
    if (this.transitionData.progress >= 1.0) {
      this.completeTransition();
    }
  }
  
  /**
   * Complete the current transition
   */
  completeTransition() {
    const { fromScene, toScene } = this.transitionData;
    
    // Exit old scene
    if (fromScene) {
      fromScene.onExit();
    }
    
    // Enter new scene
    this.currentScene = toScene;
    this.currentSceneId = this.getSceneId(toScene);
    toScene.onEnter();
    
    // Reset transition state
    this.isTransitioning = false;
    this.transitionData = {
      fromScene: null,
      toScene: null,
      progress: 0,
      duration: 1.0,
      type: 'fade'
    };
    
    console.log(`Transition completed to scene: ${this.currentSceneId}`);
  }
  
  /**
   * Render current scene with transition effects
   */
  render() {
    if (!this.renderer || !this.renderer.isReady()) {
      return;
    }
    
    if (this.isTransitioning) {
      this.renderTransition();
    } else if (this.currentScene && this.currentScene.isInitialized) {
      this.currentScene.render();
    }
  }
  
  /**
   * Render scenes during transition
   */
  renderTransition() {
    const { fromScene, toScene, progress, type } = this.transitionData;
    
    switch (type) {
      case 'fade':
        this.renderFadeTransition(fromScene, toScene, progress);
        break;
      case 'slide':
        this.renderSlideTransition(fromScene, toScene, progress);
        break;
      case 'zoom':
        this.renderZoomTransition(fromScene, toScene, progress);
        break;
      default:
        // Fallback to immediate switch
        if (toScene) {
          toScene.render();
        }
    }
  }
  
  /**
   * Render fade transition
   */
  renderFadeTransition(fromScene, toScene, progress) {
    const gl = this.renderer.getContext();
    
    // Clear with black
    this.renderer.clear();
    
    // Render from scene with decreasing alpha
    if (fromScene && progress < 1.0) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      fromScene.render(1.0 - progress);
    }
    
    // Render to scene with increasing alpha
    if (toScene && progress > 0.0) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      toScene.render(progress);
    }
  }
  
  /**
   * Render slide transition (simplified)
   */
  renderSlideTransition(fromScene, toScene, progress) {
    // For now, just do a simple fade
    // TODO: Implement proper slide transition with viewport offsets
    this.renderFadeTransition(fromScene, toScene, progress);
  }
  
  /**
   * Render zoom transition (simplified)
   */
  renderZoomTransition(fromScene, toScene, progress) {
    // For now, just do a simple fade
    // TODO: Implement proper zoom transition with camera scaling
    this.renderFadeTransition(fromScene, toScene, progress);
  }
  
  /**
   * Get scene ID by scene instance
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
   * Get current scene
   */
  getCurrentScene() {
    return this.currentScene;
  }
  
  /**
   * Get current scene ID
   */
  getCurrentSceneId() {
    return this.currentSceneId;
  }
  
  /**
   * Check if currently transitioning
   */
  isCurrentlyTransitioning() {
    return this.isTransitioning;
  }
  
  /**
   * Get transition progress (0-1)
   */
  getTransitionProgress() {
    return this.transitionData.progress;
  }
  
  /**
   * Unregister a scene
   */
  unregisterScene(sceneId) {
    if (!this.scenes.has(sceneId)) {
      console.warn(`Scene '${sceneId}' not found for unregistration`);
      return false;
    }
    
    const scene = this.scenes.get(sceneId);
    
    // Don't unregister the current scene
    if (scene === this.currentScene) {
      console.error(`Cannot unregister current scene '${sceneId}'`);
      return false;
    }
    
    // Destroy scene resources
    scene.destroy();
    
    // Remove from registry
    this.scenes.delete(sceneId);
    
    console.log(`Scene '${sceneId}' unregistered`);
    return true;
  }
  
  /**
   * List all registered scenes
   */
  listScenes() {
    return Array.from(this.scenes.keys());
  }
  
  /**
   * Get scene manager state for debugging
   */
  getState() {
    return {
      currentSceneId: this.currentSceneId,
      isTransitioning: this.isTransitioning,
      transitionProgress: this.transitionData.progress,
      transitionType: this.transitionData.type,
      registeredScenes: this.listScenes()
    };
  }
  
  /**
   * Destroy scene manager and all scenes
   */
  destroy() {
    // Complete any ongoing transition
    if (this.isTransitioning) {
      this.completeTransition();
    }
    
    // Destroy all scenes
    for (const [sceneId, scene] of this.scenes) {
      try {
        scene.destroy();
      } catch (error) {
        console.error(`Error destroying scene '${sceneId}':`, error);
      }
    }
    
    // Clear references
    this.scenes.clear();
    this.currentScene = null;
    this.currentSceneId = null;
    this.renderer = null;
    this.camera = null;
    
    console.log('Scene Manager destroyed');
  }
}

export default SceneManager;