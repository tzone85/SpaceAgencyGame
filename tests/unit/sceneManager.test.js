/**
 * SceneManager Tests
 *
 * Tests for scene registration, loading, transitions, and lifecycle management
 */

import SceneManager from '../../src/managers/SceneManager.js';

describe('SceneManager', () => {
  let sceneManager;

  beforeEach(() => {
    sceneManager = new SceneManager();
  });

  describe('Initialization', () => {
    test('should initialize with no scenes or current scene', () => {
      expect(sceneManager.scenes.size).toBe(0);
      expect(sceneManager.currentScene).toBeNull();
      expect(sceneManager.nextScene).toBeNull();
    });
  });

  describe('Scene Registration', () => {
    test('should register a valid scene', () => {
      const mockScene = { initialize: jest.fn() };
      sceneManager.registerScene('testScene', mockScene);

      expect(sceneManager.scenes.has('testScene')).toBe(true);
      expect(sceneManager.scenes.get('testScene')).toBe(mockScene);
    });

    test('should throw error when registering scene without initialize method', () => {
      const invalidScene = {};
      expect(() => {
        sceneManager.registerScene('invalidScene', invalidScene);
      }).toThrow('Invalid scene: invalidScene. Scene must have initialize method.');
    });

    test('should throw error when registering null scene', () => {
      expect(() => {
        sceneManager.registerScene('nullScene', null);
      }).toThrow('Invalid scene: nullScene. Scene must have initialize method.');
    });

    test('should register multiple scenes', () => {
      const scene1 = { initialize: jest.fn() };
      const scene2 = { initialize: jest.fn() };
      const scene3 = { initialize: jest.fn() };

      sceneManager.registerScene('scene1', scene1);
      sceneManager.registerScene('scene2', scene2);
      sceneManager.registerScene('scene3', scene3);

      expect(sceneManager.scenes.size).toBe(3);
    });
  });

  describe('Scene Loading', () => {
    beforeEach(() => {
      const mockScene = { initialize: jest.fn() };
      sceneManager.registerScene('testScene', mockScene);
    });

    test('should mark scene as next scene when loading', () => {
      sceneManager.loadScene('testScene');
      expect(sceneManager.nextScene).not.toBeNull();
      expect(sceneManager.nextScene).toBe(sceneManager.scenes.get('testScene'));
    });

    test('should throw error when loading non-existent scene', () => {
      expect(() => {
        sceneManager.loadScene('nonExistent');
      }).toThrow('Scene not found: nonExistent');
    });

    test('should queue scene transition for next update', () => {
      sceneManager.loadScene('testScene');
      expect(sceneManager.currentScene).toBeNull();
      expect(sceneManager.nextScene).not.toBeNull();
    });
  });

  describe('Scene Transitions', () => {
    let scene1, scene2;

    beforeEach(() => {
      scene1 = {
        initialize: jest.fn(),
        cleanup: jest.fn(),
        update: jest.fn(),
        render: jest.fn(),
      };
      scene2 = {
        initialize: jest.fn(),
        cleanup: jest.fn(),
        update: jest.fn(),
        render: jest.fn(),
      };

      sceneManager.registerScene('scene1', scene1);
      sceneManager.registerScene('scene2', scene2);
    });

    test('should transition to scene on next update call', () => {
      sceneManager.loadScene('scene1');
      sceneManager.update(0.016);

      expect(scene1.initialize).toHaveBeenCalled();
      expect(sceneManager.currentScene).toBe(scene1);
      expect(sceneManager.nextScene).toBeNull();
    });

    test('should cleanup old scene when transitioning to new scene', () => {
      sceneManager.loadScene('scene1');
      sceneManager.update(0.016);
      expect(scene1.initialize).toHaveBeenCalled();

      sceneManager.loadScene('scene2');
      sceneManager.update(0.016);

      expect(scene1.cleanup).toHaveBeenCalled();
      expect(scene2.initialize).toHaveBeenCalled();
      expect(sceneManager.currentScene).toBe(scene2);
    });

    test('should not transition if nextScene is same as currentScene', () => {
      sceneManager.loadScene('scene1');
      sceneManager.update(0.016);

      const initCallCount = scene1.initialize.mock.calls.length;
      sceneManager.loadScene('scene1');
      sceneManager.update(0.016);

      expect(scene1.initialize.mock.calls.length).toBe(initCallCount);
    });

    test('should handle scenes without cleanup method gracefully', () => {
      const sceneWithoutCleanup = {
        initialize: jest.fn(),
        update: jest.fn(),
        render: jest.fn(),
      };

      sceneManager.registerScene('sceneNoCleanup', sceneWithoutCleanup);
      sceneManager.loadScene('sceneNoCleanup');
      sceneManager.update(0.016);

      expect(() => {
        sceneManager.loadScene('scene1');
        sceneManager.update(0.016);
      }).not.toThrow();
    });
  });

  describe('Scene Updates', () => {
    let mockScene;

    beforeEach(() => {
      mockScene = {
        initialize: jest.fn(),
        update: jest.fn(),
        render: jest.fn(),
      };
      sceneManager.registerScene('testScene', mockScene);
      sceneManager.loadScene('testScene');
      sceneManager.update(0.016);
    });

    test('should call update on current scene', () => {
      const deltaTime = 0.016;
      sceneManager.update(deltaTime);

      expect(mockScene.update).toHaveBeenCalledWith(deltaTime);
    });

    test('should not call update if no current scene', () => {
      sceneManager.currentScene = null;
      expect(() => {
        sceneManager.update(0.016);
      }).not.toThrow();
    });

    test('should handle scenes without update method gracefully', () => {
      const sceneNoUpdate = { initialize: jest.fn() };
      sceneManager.registerScene('noUpdate', sceneNoUpdate);
      sceneManager.loadScene('noUpdate');

      expect(() => {
        sceneManager.update(0.016);
      }).not.toThrow();
    });
  });

  describe('Scene Rendering', () => {
    let mockScene, mockRenderer;

    beforeEach(() => {
      mockScene = {
        initialize: jest.fn(),
        update: jest.fn(),
        render: jest.fn(),
      };
      mockRenderer = {};
      sceneManager.registerScene('testScene', mockScene);
      sceneManager.loadScene('testScene');
      sceneManager.update(0.016);
    });

    test('should call render on current scene with renderer', () => {
      sceneManager.render(mockRenderer);

      expect(mockScene.render).toHaveBeenCalledWith(mockRenderer);
    });

    test('should not call render if no current scene', () => {
      sceneManager.currentScene = null;
      expect(() => {
        sceneManager.render(mockRenderer);
      }).not.toThrow();
    });

    test('should handle scenes without render method gracefully', () => {
      const sceneNoRender = { initialize: jest.fn() };
      sceneManager.registerScene('noRender', sceneNoRender);
      sceneManager.loadScene('noRender');
      sceneManager.update(0.016);

      expect(() => {
        sceneManager.render(mockRenderer);
      }).not.toThrow();
    });
  });

  describe('Scene Queries', () => {
    let mockScene;

    beforeEach(() => {
      mockScene = { initialize: jest.fn() };
      sceneManager.registerScene('testScene', mockScene);
    });

    test('should return current scene', () => {
      expect(sceneManager.getCurrentScene()).toBeNull();

      sceneManager.loadScene('testScene');
      sceneManager.update(0.016);

      expect(sceneManager.getCurrentScene()).toBe(mockScene);
    });
  });

  describe('Cleanup', () => {
    let scene1, scene2;

    beforeEach(() => {
      scene1 = {
        initialize: jest.fn(),
        cleanup: jest.fn(),
      };
      scene2 = {
        initialize: jest.fn(),
        cleanup: jest.fn(),
      };

      sceneManager.registerScene('scene1', scene1);
      sceneManager.registerScene('scene2', scene2);
      sceneManager.loadScene('scene1');
      sceneManager.update(0.016);
    });

    test('should cleanup all scenes on destroy', () => {
      sceneManager.destroy();

      expect(scene1.cleanup).toHaveBeenCalled();
      expect(scene2.cleanup).toHaveBeenCalled();
    });

    test('should clear all scenes on destroy', () => {
      sceneManager.destroy();

      expect(sceneManager.scenes.size).toBe(0);
      expect(sceneManager.currentScene).toBeNull();
      expect(sceneManager.nextScene).toBeNull();
    });

    test('should handle scenes without cleanup method on destroy', () => {
      const sceneNoCleanup = { initialize: jest.fn() };
      sceneManager.registerScene('noCleanup', sceneNoCleanup);

      expect(() => {
        sceneManager.destroy();
      }).not.toThrow();
    });
  });
});
