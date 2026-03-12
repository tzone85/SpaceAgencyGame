/**
 * SceneManager Unit Tests
 *
 * Test suite for the SceneManager class functionality.
 */

import SceneManager from '../../src/scenes/scene-manager.js';

describe('SceneManager', () => {
  let mockRenderer;
  let mockCamera;
  let sceneManager;
  let MockScene;

  beforeEach(() => {
    // Mock renderer
    mockRenderer = {
      getContext: jest.fn(() => ({
        enable: jest.fn(),
        blendFunc: jest.fn(),
        SRC_ALPHA: 1,
        ONE_MINUS_SRC_ALPHA: 2
      })),
      clear: jest.fn(),
      isReady: jest.fn(() => true)
    };

    // Mock camera
    mockCamera = {
      update: jest.fn(),
      getViewMatrix: jest.fn(() => [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),
      getProjectionMatrix: jest.fn(() => [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])
    };

    sceneManager = new SceneManager(mockRenderer, mockCamera);

    // Mock scene class
    MockScene = class {
      constructor(renderer, camera, config) {
        this.renderer = renderer;
        this.camera = camera;
        this.config = config;
        this.isInitialized = false;
        this.isActive = false;
      }

      initialize() {
        this.isInitialized = true;
      }

      update(deltaTime) {
        this.lastDeltaTime = deltaTime;
      }

      render(alpha = 1.0) {
        this.lastAlpha = alpha;
      }

      destroy() {
        this.isDestroyed = true;
      }

      onEnter() {
        this.hasEntered = true;
      }

      onExit() {
        this.hasExited = true;
      }

      onTransitionIn() {
        this.isTransitioningIn = true;
      }

      onTransitionOut() {
        this.isTransitioningOut = true;
      }
    };
  });

  describe('initialization', () => {
    test('should initialize with no scenes', () => {
      expect(sceneManager.currentScene).toBeNull();
      expect(sceneManager.currentSceneId).toBeNull();
      expect(sceneManager.isTransitioning).toBe(false);
      expect(sceneManager.listScenes()).toEqual([]);
    });
  });

  describe('scene registration', () => {
    test('should register a valid scene', () => {
      const result = sceneManager.registerScene('test', MockScene, { test: true });
      
      expect(result).toBe(true);
      expect(sceneManager.listScenes()).toContain('test');
      expect(sceneManager.scenes.has('test')).toBe(true);
    });

    test('should replace existing scene with warning', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      sceneManager.registerScene('test', MockScene);
      sceneManager.registerScene('test', MockScene); // Register again
      
      expect(consoleSpy).toHaveBeenCalledWith("Scene 'test' already registered, replacing...");
      consoleSpy.mockRestore();
    });

    test('should fail to register invalid scene', () => {
      class InvalidScene {} // Missing required methods
      
      const result = sceneManager.registerScene('invalid', InvalidScene);
      expect(result).toBe(false);
      expect(sceneManager.listScenes()).not.toContain('invalid');
    });
  });

  describe('scene interface validation', () => {
    test('should validate complete scene interface', () => {
      const scene = new MockScene();
      const result = sceneManager.validateSceneInterface(scene);
      expect(result).toBe(true);
    });

    test('should reject incomplete scene interface', () => {
      const incompleteScene = {
        initialize: () => {},
        update: () => {},
        // Missing render, destroy, onEnter, onExit
      };
      
      const result = sceneManager.validateSceneInterface(incompleteScene);
      expect(result).toBe(false);
    });
  });

  describe('immediate scene switching', () => {
    beforeEach(() => {
      sceneManager.registerScene('scene1', MockScene);
      sceneManager.registerScene('scene2', MockScene);
    });

    test('should switch to scene immediately', () => {
      const result = sceneManager.switchToScene('scene1');
      
      expect(result).toBe(true);
      expect(sceneManager.currentSceneId).toBe('scene1');
      expect(sceneManager.currentScene).toBeInstanceOf(MockScene);
      expect(sceneManager.currentScene.isInitialized).toBe(true);
      expect(sceneManager.currentScene.hasEntered).toBe(true);
    });

    test('should exit previous scene when switching', () => {
      sceneManager.switchToScene('scene1');
      const firstScene = sceneManager.currentScene;
      
      sceneManager.switchToScene('scene2');
      
      expect(firstScene.hasExited).toBe(true);
      expect(sceneManager.currentSceneId).toBe('scene2');
    });

    test('should fail to switch to non-existent scene', () => {
      const result = sceneManager.switchToScene('nonexistent');
      expect(result).toBe(false);
      expect(sceneManager.currentScene).toBeNull();
    });
  });

  describe('scene transitions', () => {
    beforeEach(() => {
      sceneManager.registerScene('scene1', MockScene);
      sceneManager.registerScene('scene2', MockScene);
      sceneManager.switchToScene('scene1');
    });

    test('should start transition to another scene', () => {
      const result = sceneManager.transitionToScene('scene2', 'fade', 2.0);
      
      expect(result).toBe(true);
      expect(sceneManager.isTransitioning).toBe(true);
      expect(sceneManager.transitionData.type).toBe('fade');
      expect(sceneManager.transitionData.duration).toBe(2.0);
      expect(sceneManager.transitionData.progress).toBe(0);
    });

    test('should notify scenes about transition', () => {
      sceneManager.transitionToScene('scene2');
      
      expect(sceneManager.transitionData.fromScene.isTransitioningOut).toBe(true);
      expect(sceneManager.transitionData.toScene.isTransitioningIn).toBe(true);
    });

    test('should not transition to same scene', () => {
      const result = sceneManager.transitionToScene('scene1');
      expect(result).toBe(true); // Returns true but doesn't transition
      expect(sceneManager.isTransitioning).toBe(false);
    });

    test('should ignore transition request if already transitioning', () => {
      sceneManager.transitionToScene('scene2');
      const result = sceneManager.transitionToScene('scene1');
      
      expect(result).toBe(false);
      expect(sceneManager.transitionData.toScene).toBeInstanceOf(MockScene);
    });

    test('should fail to transition to non-existent scene', () => {
      const result = sceneManager.transitionToScene('nonexistent');
      expect(result).toBe(false);
      expect(sceneManager.isTransitioning).toBe(false);
    });
  });

  describe('transition updates', () => {
    beforeEach(() => {
      sceneManager.registerScene('scene1', MockScene);
      sceneManager.registerScene('scene2', MockScene);
      sceneManager.switchToScene('scene1');
      sceneManager.transitionToScene('scene2', 'fade', 1.0);
    });

    test('should update transition progress', () => {
      sceneManager.update(0.5); // Half a second
      
      expect(sceneManager.transitionData.progress).toBeCloseTo(0.5);
      expect(sceneManager.isTransitioning).toBe(true);
    });

    test('should complete transition when progress reaches 1', () => {
      sceneManager.update(1.0); // Full second
      
      expect(sceneManager.isTransitioning).toBe(false);
      expect(sceneManager.currentSceneId).toBe('scene2');
      expect(sceneManager.currentScene.hasEntered).toBe(true);
    });

    test('should update both scenes during transition', () => {
      sceneManager.update(0.5);
      
      expect(sceneManager.transitionData.fromScene.lastDeltaTime).toBe(0.5);
      expect(sceneManager.transitionData.toScene.lastDeltaTime).toBe(0.5);
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      sceneManager.registerScene('scene1', MockScene);
      sceneManager.switchToScene('scene1');
    });

    test('should render current scene when not transitioning', () => {
      sceneManager.render();
      
      expect(sceneManager.currentScene.lastAlpha).toBe(1.0);
    });

    test('should not render if renderer not ready', () => {
      mockRenderer.isReady.mockReturnValue(false);
      
      sceneManager.render();
      
      // Should not have called scene render
      expect(sceneManager.currentScene.lastAlpha).toBeUndefined();
    });

    test('should render transition when transitioning', () => {
      sceneManager.registerScene('scene2', MockScene);
      sceneManager.transitionToScene('scene2');
      
      sceneManager.render();
      
      // Should call transition rendering
      expect(mockRenderer.clear).toHaveBeenCalled();
    });
  });

  describe('scene unregistration', () => {
    beforeEach(() => {
      sceneManager.registerScene('scene1', MockScene);
      sceneManager.registerScene('scene2', MockScene);
    });

    test('should unregister non-current scene', () => {
      sceneManager.switchToScene('scene1');
      const result = sceneManager.unregisterScene('scene2');
      
      expect(result).toBe(true);
      expect(sceneManager.listScenes()).not.toContain('scene2');
    });

    test('should not unregister current scene', () => {
      sceneManager.switchToScene('scene1');
      const result = sceneManager.unregisterScene('scene1');
      
      expect(result).toBe(false);
      expect(sceneManager.listScenes()).toContain('scene1');
    });

    test('should warn when unregistering non-existent scene', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = sceneManager.unregisterScene('nonexistent');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith("Scene 'nonexistent' not found for unregistration");
      consoleSpy.mockRestore();
    });
  });

  describe('state reporting', () => {
    test('should return current state', () => {
      sceneManager.registerScene('test', MockScene);
      sceneManager.switchToScene('test');
      
      const state = sceneManager.getState();
      
      expect(state).toHaveProperty('currentSceneId');
      expect(state).toHaveProperty('isTransitioning');
      expect(state).toHaveProperty('transitionProgress');
      expect(state).toHaveProperty('transitionType');
      expect(state).toHaveProperty('registeredScenes');
      
      expect(state.currentSceneId).toBe('test');
      expect(state.isTransitioning).toBe(false);
      expect(state.registeredScenes).toContain('test');
    });
  });

  describe('destruction', () => {
    test('should destroy all scenes and clean up', () => {
      sceneManager.registerScene('scene1', MockScene);
      sceneManager.registerScene('scene2', MockScene);
      sceneManager.switchToScene('scene1');
      
      const scene1 = sceneManager.currentScene;
      const scene2 = sceneManager.scenes.get('scene2');
      
      sceneManager.destroy();
      
      expect(scene1.isDestroyed).toBe(true);
      expect(scene2.isDestroyed).toBe(true);
      expect(sceneManager.scenes.size).toBe(0);
      expect(sceneManager.currentScene).toBeNull();
      expect(sceneManager.renderer).toBeNull();
      expect(sceneManager.camera).toBeNull();
    });
  });
});