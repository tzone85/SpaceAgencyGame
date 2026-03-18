/**
 * SceneManager Unit Tests
 *
 * Test suite for the SceneManager class functionality.
 * Test suite for scene management, transitions, and lifecycle
 */

import SceneManager from "../../src/managers/SceneManager.js";

// Mock Scene classes for testing
class MockScene {
  constructor(renderer, camera, config) {
    this.renderer = renderer;
    this.camera = camera;
    this.config = config;
    this.isInitialized = false;
    this.isActive = false;
    this.initialized = false;
    this.activated = false;
    this.cleaned = false;
    this.initializeDelay = 0;
    this.activateDelay = 0;
  }

  async initialize() {
    this.isInitialized = true;
    this.initialized = true;
    if (this.initializeDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.initializeDelay));
    }
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

  async activate(params) {
    this.activatedParams = params;
    this.activated = true;
    if (this.activateDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.activateDelay));
    }
  }

  async cleanup() {
    this.cleaned = true;
  }
}

class SimpleScene {
  constructor() {
    this.name = "simple";
  }
}

describe("SceneManager", () => {
  let mockRenderer;
  let mockCamera;
  let sceneManager;

  beforeEach(() => {
    // Mock renderer
    mockRenderer = {
      getContext: jest.fn(() => ({
        enable: jest.fn(),
        blendFunc: jest.fn(),
        SRC_ALPHA: 1,
        ONE_MINUS_SRC_ALPHA: 2,
      })),
      clear: jest.fn(),
      isReady: jest.fn(() => true),
    };

    // Mock camera
    mockCamera = {
      update: jest.fn(),
      getViewMatrix: jest.fn(() => [
        1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
      ]),
      getProjectionMatrix: jest.fn(() => [
        1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
      ]),
    };

    sceneManager = new SceneManager(mockRenderer, mockCamera);
  });

  afterEach(() => {
    if (sceneManager.clear) {
      sceneManager.clear();
    }
  });

  describe("initialization", () => {
    test("should initialize with no scenes", () => {
      expect(sceneManager.currentScene).toBeNull();
      expect(sceneManager.currentSceneId).toBeNull();
      expect(sceneManager.isTransitioning).toBe(false);
      expect(sceneManager.listScenes()).toEqual([]);
    });

    test("should create manager with default values", () => {
      expect(sceneManager).toBeDefined();
      expect(sceneManager.currentScene).toBeNull();
      expect(sceneManager.isTransitioning).toBe(false);
      expect(sceneManager.transitionDuration).toBe(0.5);
      expect(sceneManager.transitionProgress).toBe(0);
    });

    test("should have empty scene registry", () => {
      expect(sceneManager.getRegisteredScenes()).toHaveLength(0);
    });
  });

  describe("scene registration", () => {
    test("should register a valid scene", () => {
      const result = sceneManager.registerScene("test", MockScene, {
        test: true,
      });

      expect(result).toBe(true);
      expect(sceneManager.listScenes()).toContain("test");
      expect(sceneManager.scenes.has("test")).toBe(true);
    });

    test("should register a scene class", () => {
      sceneManager.register("game", MockScene);

      expect(sceneManager.isRegistered("game")).toBe(true);
    });

    test("should register multiple scenes", () => {
      sceneManager.register("menu", MockScene);
      sceneManager.register("game", MockScene);
      sceneManager.register("settings", MockScene);

      expect(sceneManager.getRegisteredScenes()).toHaveLength(3);
      expect(sceneManager.isRegistered("menu")).toBe(true);
      expect(sceneManager.isRegistered("game")).toBe(true);
      expect(sceneManager.isRegistered("settings")).toBe(true);
    });

    test("should replace existing scene with warning", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      sceneManager.registerScene("test", MockScene);
      sceneManager.registerScene("test", MockScene); // Register again

      expect(consoleSpy).toHaveBeenCalledWith(
        "Scene 'test' already registered, replacing...",
      );
      consoleSpy.mockRestore();
    });

    test("should fail to register invalid scene", () => {
      class InvalidScene {} // Missing required methods

      const result = sceneManager.registerScene("invalid", InvalidScene);
      expect(result).toBe(false);
      expect(sceneManager.listScenes()).not.toContain("invalid");
    });

    test("should throw error if scene name is invalid", () => {
      expect(() => {
        sceneManager.register("", MockScene);
      }).toThrow("Scene name must be a non-empty string");

      expect(() => {
        sceneManager.register(null, MockScene);
      }).toThrow("Scene name must be a non-empty string");
    });

    test("should throw error if scene class is not provided", () => {
      expect(() => {
        sceneManager.register("game", null);
      }).toThrow("Scene class or factory function is required");
    });

    test("should unregister a scene", () => {
      sceneManager.register("game", MockScene);
      expect(sceneManager.isRegistered("game")).toBe(true);

      sceneManager.unregister("game");

      expect(sceneManager.isRegistered("game")).toBe(false);
    });
  });

  describe("scene interface validation", () => {
    test("should validate complete scene interface", () => {
      const scene = new MockScene();
      const result = sceneManager.validateSceneInterface(scene);
      expect(result).toBe(true);
    });

    test("should reject incomplete scene interface", () => {
      const incompleteScene = {
        initialize: () => {},
        update: () => {},
        // Missing render, destroy, onEnter, onExit
      };

      const result = sceneManager.validateSceneInterface(incompleteScene);
      expect(result).toBe(false);
    });
  });

  describe("scene creation", () => {
    test("should create scene instance from registered class", () => {
      sceneManager.register("game", MockScene);

      const scene = sceneManager.createScene("game");

      expect(scene).toBeInstanceOf(MockScene);
    });

    test("should throw error when creating unregistered scene", () => {
      expect(() => {
        sceneManager.createScene("nonexistent");
      }).toThrow("Scene 'nonexistent' is not registered");
    });

    test("should support factory functions", () => {
      const factory = () => ({ type: "custom", initialize: () => {} });
      sceneManager.register("custom", factory);

      const scene = sceneManager.createScene("custom");

      expect(scene.type).toBe("custom");
    });

    test("should create independent scene instances", () => {
      sceneManager.register("game", MockScene);

      const scene1 = sceneManager.createScene("game");
      const scene2 = sceneManager.createScene("game");

      expect(scene1).not.toBe(scene2);
      expect(scene1).toBeInstanceOf(MockScene);
      expect(scene2).toBeInstanceOf(MockScene);
    });
  });

  describe("immediate scene switching", () => {
    beforeEach(() => {
      sceneManager.registerScene("scene1", MockScene);
      sceneManager.registerScene("scene2", MockScene);
    });

    test("should switch to scene immediately", () => {
      const result = sceneManager.switchToScene("scene1");

      expect(result).toBe(true);
      expect(sceneManager.currentSceneId).toBe("scene1");
      expect(sceneManager.currentScene).toBeInstanceOf(MockScene);
      expect(sceneManager.currentScene.isInitialized).toBe(true);
      expect(sceneManager.currentScene.hasEntered).toBe(true);
    });

    test("should exit previous scene when switching", () => {
      sceneManager.switchToScene("scene1");
      const firstScene = sceneManager.currentScene;

      sceneManager.switchToScene("scene2");

      expect(firstScene.hasExited).toBe(true);
      expect(sceneManager.currentSceneId).toBe("scene2");
    });

    test("should fail to switch to non-existent scene", () => {
      const result = sceneManager.switchToScene("nonexistent");
      expect(result).toBe(false);
      expect(sceneManager.currentScene).toBeNull();
    });
  });

  describe("basic scene transitions", () => {
    beforeEach(() => {
      sceneManager.register("menu", MockScene);
      sceneManager.register("game", MockScene);
    });

    test("should transition to a new scene", async () => {
      const scene = await sceneManager.transitionTo("menu");

      expect(sceneManager.getCurrentScene()).toBe(scene);
      expect(scene.initialized).toBe(true);
      expect(scene.activated).toBe(true);
    });

    test("should set current scene after successful transition", async () => {
      await sceneManager.transitionTo("menu");

      const currentScene = sceneManager.getCurrentScene();

      expect(currentScene).toBeInstanceOf(MockScene);
      expect(currentScene.initialized).toBe(true);
    });

    test("should throw error when transitioning to unregistered scene", async () => {
      await expect(sceneManager.transitionTo("nonexistent")).rejects.toThrow(
        "Cannot transition to unregistered scene 'nonexistent'",
      );
    });

    test("should prevent transition if already transitioning", async () => {
      sceneManager.isTransitioning = true;

      const consoleSpy = jest.spyOn(console, "warn");
      await sceneManager.transitionTo("menu");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Scene transition already in progress",
      );
      consoleSpy.mockRestore();
    });

    test("should reset transition state after completion", async () => {
      await sceneManager.transitionTo("menu");

      expect(sceneManager.isTransitioning).toBe(false);
    });
  });

  describe("scene transitions", () => {
    beforeEach(() => {
      sceneManager.registerScene("scene1", MockScene);
      sceneManager.registerScene("scene2", MockScene);
      sceneManager.switchToScene("scene1");
    });

    test("should start transition to another scene", () => {
      const result = sceneManager.transitionToScene("scene2", "fade", 2.0);

      expect(result).toBe(true);
      expect(sceneManager.isTransitioning).toBe(true);
      expect(sceneManager.transitionData.type).toBe("fade");
      expect(sceneManager.transitionData.duration).toBe(2.0);
      expect(sceneManager.transitionData.progress).toBe(0);
    });

    test("should notify scenes about transition", () => {
      sceneManager.transitionToScene("scene2");

      expect(sceneManager.transitionData.fromScene.isTransitioningOut).toBe(
        true,
      );
      expect(sceneManager.transitionData.toScene.isTransitioningIn).toBe(true);
    });

    test("should not transition to same scene", () => {
      const result = sceneManager.transitionToScene("scene1");
      expect(result).toBe(true); // Returns true but doesn't transition
      expect(sceneManager.isTransitioning).toBe(false);
    });

    test("should ignore transition request if already transitioning", () => {
      sceneManager.transitionToScene("scene2");
      const result = sceneManager.transitionToScene("scene1");

      expect(result).toBe(false);
      expect(sceneManager.transitionData.toScene).toBeInstanceOf(MockScene);
    });

    test("should fail to transition to non-existent scene", () => {
      const result = sceneManager.transitionToScene("nonexistent");
      expect(result).toBe(false);
      expect(sceneManager.isTransitioning).toBe(false);
    });
  });

  describe("transition lifecycle", () => {
    beforeEach(() => {
      sceneManager.register("scene1", MockScene);
      sceneManager.register("scene2", MockScene);
    });

    test("should call initialize before transition", async () => {
      const scene = await sceneManager.transitionTo("scene1");

      expect(scene.initialized).toBe(true);
    });

    test("should call activate after transition", async () => {
      const scene = await sceneManager.transitionTo("scene1");

      expect(scene.activated).toBe(true);
    });

    test("should cleanup previous scene when transitioning", async () => {
      const scene1 = await sceneManager.transitionTo("scene1");
      const scene2 = await sceneManager.transitionTo("scene2");

      expect(scene1.cleaned).toBe(true);
      expect(scene2.initialized).toBe(true);
    });

    test("should pass parameters to new scene", async () => {
      const params = { level: 1, difficulty: "hard" };
      const scene = await sceneManager.transitionTo("scene1", params);

      expect(scene.activatedParams).toEqual(params);
    });

    test("should store scene data", async () => {
      const params = { player: "John" };
      await sceneManager.transitionTo("scene1", params);

      const data = sceneManager.getSceneData("scene1");

      expect(data).toEqual(params);
    });

    test("should not store data if params are empty", async () => {
      await sceneManager.transitionTo("scene1", {});

      const data = sceneManager.getSceneData("scene1");

      expect(data).toBeUndefined();
    });
  });

  describe("transition updates", () => {
    beforeEach(() => {
      sceneManager.registerScene("scene1", MockScene);
      sceneManager.registerScene("scene2", MockScene);
      sceneManager.switchToScene("scene1");
      sceneManager.transitionToScene("scene2", "fade", 1.0);
    });

    test("should update transition progress", () => {
      sceneManager.update(0.5); // Half a second

      expect(sceneManager.transitionData.progress).toBeCloseTo(0.5);
      expect(sceneManager.isTransitioning).toBe(true);
    });

    test("should complete transition when progress reaches 1", () => {
      sceneManager.update(1.0); // Full second

      expect(sceneManager.isTransitioning).toBe(false);
      expect(sceneManager.currentSceneId).toBe("scene2");
      expect(sceneManager.currentScene.hasEntered).toBe(true);
    });

    test("should update both scenes during transition", () => {
      sceneManager.update(0.5);

      expect(sceneManager.transitionData.fromScene.lastDeltaTime).toBe(0.5);
      expect(sceneManager.transitionData.toScene.lastDeltaTime).toBe(0.5);
    });
  });

  describe("fade transitions", () => {
    beforeEach(() => {
      sceneManager.register("menu", MockScene);
      sceneManager.register("game", MockScene);
    });

    test("should have transition opacity 1 when not transitioning", () => {
      const opacity = sceneManager.getTransitionOpacity();

      expect(opacity).toBe(1);
    });

    test("should fade out then fade in during transition", async () => {
      sceneManager.transitionDuration = 0.1; // Short duration for testing

      const transitionPromise = sceneManager.transitionTo("menu");

      // Check during transition
      expect(sceneManager.isTransitioning).toBe(true);

      await transitionPromise;

      // After transition completes
      expect(sceneManager.getTransitionOpacity()).toBe(1);
    });

    test("should update transition progress", async () => {
      sceneManager.transitionDuration = 0.1;

      const transitionPromise = sceneManager.transitionTo("menu");

      // Progress should be updated during transition
      expect(sceneManager.getTransitionProgress()).toBeGreaterThanOrEqual(0);

      await transitionPromise;

      // Should be complete
      expect(sceneManager.getTransitionProgress()).toBe(1);
    });

    test("should support custom transition duration", async () => {
      sceneManager.transitionDuration = 0.5;

      const transitionPromise = sceneManager.transitionTo("menu", {}, 0.1);

      await transitionPromise;

      // Should complete in custom duration
      expect(sceneManager.isTransitioning).toBe(false);
    });
  });

  describe("rendering", () => {
    beforeEach(() => {
      sceneManager.registerScene("scene1", MockScene);
      sceneManager.switchToScene("scene1");
    });

    test("should render current scene when not transitioning", () => {
      sceneManager.render();

      expect(sceneManager.currentScene.lastAlpha).toBe(1.0);
    });

    test("should not render if renderer not ready", () => {
      mockRenderer.isReady.mockReturnValue(false);

      sceneManager.render();

      // Should not have called scene render
      expect(sceneManager.currentScene.lastAlpha).toBeUndefined();
    });

    test("should render transition when transitioning", () => {
      sceneManager.registerScene("scene2", MockScene);
      sceneManager.transitionToScene("scene2");

      sceneManager.render();

      // Should call transition rendering
      expect(mockRenderer.clear).toHaveBeenCalled();
    });
  });

  describe("scene stack (modal/overlay)", () => {
    beforeEach(() => {
      sceneManager.register("modal", MockScene);
      sceneManager.register("base", MockScene);
    });

    test("should push scene onto stack", async () => {
      await sceneManager.transitionTo("base");

      const modal = sceneManager.pushScene("modal");

      expect(modal).toBeInstanceOf(MockScene);
      expect(modal.initialized).toBe(true);
    });

    test("should pop scene from stack", async () => {
      await sceneManager.transitionTo("base");
      const modal = sceneManager.pushScene("modal");

      const popped = sceneManager.popScene();

      expect(popped).toBe(modal);
      expect(modal.cleaned).toBe(true);
    });

    test("should maintain scene stack count", async () => {
      await sceneManager.transitionTo("base");

      sceneManager.pushScene("modal");

      expect(sceneManager.sceneStack.length).toBe(1);

      sceneManager.popScene();

      expect(sceneManager.sceneStack.length).toBe(0);
    });

    test("should warn when popping from empty stack", () => {
      const consoleSpy = jest.spyOn(console, "warn");

      sceneManager.popScene();

      expect(consoleSpy).toHaveBeenCalledWith("Scene stack is empty");
      consoleSpy.mockRestore();
    });

    test("should pass parameters to pushed scenes", () => {
      const params = { id: 123 };

      const modal = sceneManager.pushScene("modal", params);

      expect(modal.activatedParams).toEqual(params);
    });
  });

  describe("scene naming", () => {
    beforeEach(() => {
      sceneManager.register("menu", MockScene);
    });

    test("should return current scene name", async () => {
      await sceneManager.transitionTo("menu");

      const name = sceneManager.getCurrentSceneName();

      expect(name).toBe("menu");
    });

    test("should return null when no scene is active", () => {
      const name = sceneManager.getCurrentSceneName();

      expect(name).toBeNull();
    });

    test("should handle unknown scene names", async () => {
      const unknownScene = new SimpleScene();
      sceneManager.currentScene = unknownScene;

      const name = sceneManager.getCurrentSceneName();

      expect(name).toBe("unknown");
    });
  });

  describe("scene unregistration", () => {
    beforeEach(() => {
      sceneManager.registerScene("scene1", MockScene);
      sceneManager.registerScene("scene2", MockScene);
    });

    test("should unregister non-current scene", () => {
      sceneManager.switchToScene("scene1");
      const result = sceneManager.unregisterScene("scene2");

      expect(result).toBe(true);
      expect(sceneManager.listScenes()).not.toContain("scene2");
    });

    test("should not unregister current scene", () => {
      sceneManager.switchToScene("scene1");
      const result = sceneManager.unregisterScene("scene1");

      expect(result).toBe(false);
      expect(sceneManager.listScenes()).toContain("scene1");
    });

    test("should warn when unregistering non-existent scene", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const result = sceneManager.unregisterScene("nonexistent");

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Scene 'nonexistent' not found for unregistration",
      );
      consoleSpy.mockRestore();
    });
  });

  describe("scene data management", () => {
    test("should set and get scene data", () => {
      const data = { level: 5, score: 1000 };

      sceneManager.setSceneData("game", data);
      const retrieved = sceneManager.getSceneData("game");

      expect(retrieved).toEqual(data);
    });

    test("should return undefined for non-existent scene data", () => {
      const data = sceneManager.getSceneData("nonexistent");

      expect(data).toBeUndefined();
    });

    test("should update scene data", () => {
      sceneManager.setSceneData("game", { version: 1 });
      sceneManager.setSceneData("game", { version: 2 });

      const data = sceneManager.getSceneData("game");

      expect(data.version).toBe(2);
    });
  });

  describe("utilities and state management", () => {
    beforeEach(() => {
      sceneManager.register("menu", MockScene);
      sceneManager.register("game", MockScene);
    });

    test("should return registered scene list", () => {
      const scenes = sceneManager.getRegisteredScenes();

      expect(scenes).toEqual(["menu", "game"]);
    });

    test("should report transition state", async () => {
      const transitionPromise = sceneManager.transitionTo("menu");
      expect(sceneManager.isInTransition()).toBe(true);

      await transitionPromise;
      expect(sceneManager.isInTransition()).toBe(false);
    });

    test("should set and validate transition duration", () => {
      sceneManager.setTransitionDuration(1.0);

      expect(sceneManager.transitionDuration).toBe(1.0);
    });

    test("should throw error for invalid transition duration", () => {
      expect(() => {
        sceneManager.setTransitionDuration(-1);
      }).toThrow("Transition duration must be a non-negative number");

      expect(() => {
        sceneManager.setTransitionDuration("invalid");
      }).toThrow("Transition duration must be a non-negative number");
    });

    test("should return stats", async () => {
      await sceneManager.transitionTo("menu");

      const stats = sceneManager.getStats();

      expect(stats).toHaveProperty("currentScene");
      expect(stats).toHaveProperty("isTransitioning");
      expect(stats).toHaveProperty("transitionProgress");
      expect(stats).toHaveProperty("transitionDuration");
      expect(stats).toHaveProperty("stackedScenes");
      expect(stats).toHaveProperty("registeredScenes");

      expect(stats.currentScene).toBe("menu");
      expect(stats.isTransitioning).toBe(false);
      expect(stats.registeredScenes).toBe(2);
    });
  });

  describe("state reporting", () => {
    test("should return current state", () => {
      sceneManager.registerScene("test", MockScene);
      sceneManager.switchToScene("test");

      const state = sceneManager.getState();

      expect(state).toHaveProperty("currentSceneId");
      expect(state).toHaveProperty("isTransitioning");
      expect(state).toHaveProperty("transitionProgress");
      expect(state).toHaveProperty("transitionType");
      expect(state).toHaveProperty("registeredScenes");

      expect(state.currentSceneId).toBe("test");
      expect(state.isTransitioning).toBe(false);
      expect(state.registeredScenes).toContain("test");
    });
  });

  describe("cleanup and clearing", () => {
    beforeEach(() => {
      sceneManager.register("menu", MockScene);
      sceneManager.register("game", MockScene);
    });

    test("should clear all scenes and data", async () => {
      await sceneManager.transitionTo("menu");
      sceneManager.pushScene("game");
      sceneManager.setSceneData("menu", { level: 1 });

      sceneManager.clear();

      expect(sceneManager.currentScene).toBeNull();
      expect(sceneManager.sceneStack).toHaveLength(0);
      expect(sceneManager.getSceneData("menu")).toBeUndefined();
    });

    test("should cleanup current scene on clear", async () => {
      const scene = await sceneManager.transitionTo("menu");

      sceneManager.clear();

      expect(scene.cleaned).toBe(true);
    });

    test("should cleanup all stacked scenes on clear", async () => {
      await sceneManager.transitionTo("menu");
      const modal = sceneManager.pushScene("game");

      sceneManager.clear();

      expect(modal.cleaned).toBe(true);
    });

    test("should reset transition state on clear", () => {
      sceneManager.isTransitioning = true;
      sceneManager.transitionProgress = 0.5;

      sceneManager.clear();

      expect(sceneManager.isTransitioning).toBe(false);
      expect(sceneManager.transitionProgress).toBe(0);
    });
  });

  describe("destruction", () => {
    test("should destroy all scenes and clean up", () => {
      sceneManager.registerScene("scene1", MockScene);
      sceneManager.registerScene("scene2", MockScene);
      sceneManager.switchToScene("scene1");

      const scene1 = sceneManager.currentScene;
      const scene2 = sceneManager.scenes.get("scene2");

      sceneManager.destroy();

      expect(scene1.isDestroyed).toBe(true);
      expect(scene2.isDestroyed).toBe(true);
      expect(sceneManager.scenes.size).toBe(0);
      expect(sceneManager.currentScene).toBeNull();
      expect(sceneManager.renderer).toBeNull();
      expect(sceneManager.camera).toBeNull();
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      sceneManager.register(
        "failing",
        class FailingScene {
          async initialize() {
            throw new Error("Initialization failed");
          }
        },
      );
    });

    test("should handle scene initialization errors", async () => {
      const consoleSpy = jest.spyOn(console, "error");

      await expect(sceneManager.transitionTo("failing")).rejects.toThrow(
        "Initialization failed",
      );

      expect(sceneManager.isTransitioning).toBe(false);
      consoleSpy.mockRestore();
    });

    test("should not complete transition if initialization fails", async () => {
      await expect(sceneManager.transitionTo("failing")).rejects.toThrow();

      expect(sceneManager.getCurrentScene()).toBeNull();
    });
  });

  describe("concurrency and timing", () => {
    beforeEach(() => {
      sceneManager.register(
        "slow",
        class SlowScene extends MockScene {
          constructor() {
            super();
            this.initializeDelay = 10;
          }
        },
      );
      sceneManager.register("fast", MockScene);
    });

    test("should complete transition despite slow scene initialization", async () => {
      const startTime = performance.now();
      await sceneManager.transitionTo("slow");
      const duration = performance.now() - startTime;

      expect(sceneManager.getCurrentScene()).toBeInstanceOf(MockScene);
      expect(duration).toBeGreaterThanOrEqual(10);
    });

    test("should properly sequence multiple transitions", async () => {
      sceneManager.transitionDuration = 0.05;

      await sceneManager.transitionTo("fast");
      const scene1 = sceneManager.getCurrentScene();

      await sceneManager.transitionTo("slow");
      const scene2 = sceneManager.getCurrentScene();

      expect(scene1).not.toBe(scene2);
      expect(scene1.cleaned).toBe(true);
    });
  });
});
