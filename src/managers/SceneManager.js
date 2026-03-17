/**
 * SceneManager Class
 *
 * Manages scene lifecycle, transitions, and updates.
 * Handles loading, unloading, and rendering of scenes.
 */

class SceneManager {
  constructor() {
    this.scenes = new Map();
    this.currentScene = null;
    this.nextScene = null;
  }

  /**
   * Register a scene
   * @param {string} name - Scene name/ID
   * @param {Scene} scene - Scene instance
   */
  registerScene(name, scene) {
    if (!scene || typeof scene.initialize !== 'function') {
      throw new Error(`Invalid scene: ${name}. Scene must have initialize method.`);
    }
    this.scenes.set(name, scene);
  }

  /**
   * Load and switch to a scene
   * @param {string} sceneName - Name of the scene to load
   */
  loadScene(sceneName) {
    if (!this.scenes.has(sceneName)) {
      throw new Error(`Scene not found: ${sceneName}`);
    }

    const scene = this.scenes.get(sceneName);
    this.nextScene = scene;
  }

  /**
   * Process scene transitions
   */
  transitionScene() {
    if (this.nextScene && this.nextScene !== this.currentScene) {
      // Cleanup old scene
      if (this.currentScene && typeof this.currentScene.cleanup === 'function') {
        this.currentScene.cleanup();
      }

      // Load new scene
      this.currentScene = this.nextScene;
      this.nextScene = null;

      if (typeof this.currentScene.initialize === 'function') {
        this.currentScene.initialize();
      }
    }
  }

  /**
   * Update the current scene
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    this.transitionScene();

    if (this.currentScene && typeof this.currentScene.update === 'function') {
      this.currentScene.update(deltaTime);
    }
  }

  /**
   * Render the current scene
   * @param {Renderer} renderer - Renderer instance
   */
  render(renderer) {
    if (this.currentScene && typeof this.currentScene.render === 'function') {
      this.currentScene.render(renderer);
    }
  }

  /**
   * Get the current scene
   */
  getCurrentScene() {
    return this.currentScene;
  }

  /**
   * Cleanup and destroy all scenes
   */
  destroy() {
    if (this.currentScene && typeof this.currentScene.cleanup === 'function') {
      this.currentScene.cleanup();
    }

    this.scenes.forEach((scene) => {
      if (typeof scene.cleanup === 'function') {
        scene.cleanup();
      }
    });

    this.scenes.clear();
    this.currentScene = null;
    this.nextScene = null;
  }
}

export default SceneManager;
