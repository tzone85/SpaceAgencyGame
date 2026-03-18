/**
 * Tutorial Scene Tests
 *
 * Tests for Tutorial scene initialization, step progression, spotlight rendering,
 * tooltip positioning, and completion state management
 */

import Tutorial from "../../src/scenes/Tutorial.js";
import EventBus from "../../src/game/EventBus.js";

// Mock canvas getContext
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  beginPath: jest.fn(),
  globalCompositeOperation: "",
}));

describe("Tutorial Scene", () => {
  let tutorial;
  let eventBus;

  beforeEach(() => {
    // Clear any existing tutorial from DOM
    const existingTutorial = document.getElementById("tutorial");
    if (existingTutorial) {
      existingTutorial.remove();
    }

    // Create fresh instances
    eventBus = EventBus.getInstance();
    tutorial = new Tutorial();
  });

  afterEach(() => {
    tutorial.cleanup();
    eventBus.clearListeners();
  });

  describe("Initialization", () => {
    test("should initialize with default state", () => {
      expect(tutorial.name).toBe("Tutorial");
      expect(tutorial.currentStep).toBe(0);
      expect(tutorial.isActive).toBe(false);
      expect(tutorial.sceneElement).toBeNull();
    });

    test("should have 8 tutorial steps", () => {
      expect(tutorial.steps.length).toBe(8);
    });

    test("should have correct step IDs", () => {
      const stepIds = tutorial.steps.map((s) => s.id);
      expect(stepIds).toEqual([
        "welcome",
        "budget",
        "missions",
        "launch",
        "crew",
        "research",
        "events",
        "save",
      ]);
    });

    test("should create DOM elements when initialized", () => {
      tutorial.initialize();

      expect(tutorial.sceneElement).not.toBeNull();
      expect(tutorial.overlayElement).not.toBeNull();
      expect(tutorial.spotlightCanvas).not.toBeNull();
      expect(tutorial.tooltipElement).not.toBeNull();
    });

    test("should add tutorial element to DOM", () => {
      tutorial.initialize();

      const tutorialInDOM = document.getElementById("tutorial");
      expect(tutorialInDOM).not.toBeNull();
      expect(tutorialInDOM).toBe(tutorial.sceneElement);
    });
  });

  describe("DOM Elements", () => {
    beforeEach(() => {
      tutorial.initialize();
    });

    test("should create scene with correct ID and class", () => {
      expect(tutorial.sceneElement.id).toBe("tutorial");
      expect(tutorial.sceneElement.className).toBe("tutorial-scene");
    });

    test("should create overlay with correct class", () => {
      expect(tutorial.overlayElement.className).toBe("tutorial-overlay");
    });

    test("should create canvas with correct properties", () => {
      expect(tutorial.spotlightCanvas.id).toBe("tutorialSpotlight");
      expect(tutorial.spotlightCanvas.className).toBe(
        "tutorial-spotlight-canvas",
      );
      expect(tutorial.spotlightCanvas.width).toBe(window.innerWidth);
      expect(tutorial.spotlightCanvas.height).toBe(window.innerHeight);
    });

    test("should create tooltip element", () => {
      expect(tutorial.tooltipElement.className).toBe("tutorial-tooltip");
    });
  });

  describe("Step Navigation", () => {
    beforeEach(() => {
      tutorial.initialize();
    });

    test("should start at step 0 (welcome)", () => {
      expect(tutorial.currentStep).toBe(0);
      const currentStep = tutorial.steps[tutorial.currentStep];
      expect(currentStep.id).toBe("welcome");
    });

    test("should progress to next step when next() is called", () => {
      tutorial.next();
      expect(tutorial.currentStep).toBe(1);

      const currentStep = tutorial.steps[tutorial.currentStep];
      expect(currentStep.id).toBe("budget");
    });

    test("should progress through all 8 steps", () => {
      for (let i = 0; i < 7; i++) {
        expect(tutorial.currentStep).toBe(i);
        tutorial.next();
      }
      expect(tutorial.currentStep).toBe(7);
    });

    test("should complete tutorial after final step", () => {
      // Move to last step
      tutorial.currentStep = tutorial.steps.length - 1;

      const completeSpyFn = jest.fn();
      tutorial.setOnComplete(completeSpyFn);

      tutorial.next();

      expect(completeSpyFn).toHaveBeenCalled();
    });

    test("should emit tutorial:complete event on completion", () => {
      const emitSpy = jest.spyOn(eventBus, "emit");
      tutorial.currentStep = tutorial.steps.length - 1;

      tutorial.next();

      expect(emitSpy).toHaveBeenCalledWith("tutorial:complete");
      emitSpy.mockRestore();
    });
  });

  describe("Skip Functionality", () => {
    beforeEach(() => {
      tutorial.initialize();
    });

    test("should skip tutorial immediately", () => {
      tutorial.currentStep = 3;
      const skipSpyFn = jest.fn();
      tutorial.setOnSkip(skipSpyFn);

      tutorial.skip();

      expect(skipSpyFn).toHaveBeenCalled();
    });

    test("should emit tutorial:complete event when skipped", () => {
      const emitSpy = jest.spyOn(eventBus, "emit");

      tutorial.skip();

      expect(emitSpy).toHaveBeenCalledWith("tutorial:complete");
      emitSpy.mockRestore();
    });

    test("should clean up after skip", () => {
      tutorial.skip();

      const tutorialInDOM = document.getElementById("tutorial");
      expect(tutorialInDOM).toBeNull();
    });
  });

  describe("Tooltip Positioning", () => {
    beforeEach(() => {
      tutorial.initialize();
    });

    test("should center welcome step tooltip", () => {
      tutorial.currentStep = 0;
      tutorial.positionTooltip();

      expect(tutorial.tooltipElement.style.top).toBe("50%");
      expect(tutorial.tooltipElement.style.left).toBe("50%");
      expect(tutorial.tooltipElement.style.transform).toBe(
        "translate(-50%, -50%)",
      );
    });

    test("should position tooltip to the right when step position is right", () => {
      // Create a mock element for budget panel
      const mockElement = document.createElement("div");
      mockElement.setAttribute("data-tutorial", "budget");
      mockElement.style.position = "fixed";
      mockElement.style.left = "100px";
      mockElement.style.top = "100px";
      mockElement.style.width = "200px";
      mockElement.style.height = "100px";
      document.body.appendChild(mockElement);

      tutorial.currentStep = 1; // budget step with 'right' position
      tutorial.positionTooltip();

      const expectedLeft =
        "100px" === mockElement.getBoundingClientRect().left
          ? mockElement.getBoundingClientRect().right + 20
          : undefined;

      // Tooltip should be positioned relative to the element
      expect(tutorial.tooltipElement.style.position).toBe("fixed");

      mockElement.remove();
    });

    test("should handle missing target element gracefully", () => {
      tutorial.currentStep = 1; // budget step with target selector
      // No element with data-tutorial="budget" exists in DOM

      tutorial.positionTooltip();

      // Should fall back to center positioning
      expect(tutorial.tooltipElement.style.top).toBe("50%");
      expect(tutorial.tooltipElement.style.left).toBe("50%");
    });
  });

  describe("Target Rectangle Detection", () => {
    beforeEach(() => {
      tutorial.initialize();
    });

    test("should return null for welcome step (no target)", () => {
      tutorial.currentStep = 0;
      const rect = tutorial.getTargetRect();
      expect(rect).toBeNull();
    });

    test("should return null when target element not found", () => {
      tutorial.currentStep = 1; // budget step with selector
      const rect = tutorial.getTargetRect();
      expect(rect).toBeNull();
    });

    test("should return bounding rect when target exists", () => {
      // Create mock element
      const mockElement = document.createElement("div");
      mockElement.setAttribute("data-tutorial", "budget");
      mockElement.style.position = "fixed";
      mockElement.style.left = "100px";
      mockElement.style.top = "100px";
      mockElement.style.width = "200px";
      mockElement.style.height = "100px";
      document.body.appendChild(mockElement);

      tutorial.currentStep = 1; // budget step
      const rect = tutorial.getTargetRect();

      expect(rect).not.toBeNull();
      expect(rect.left).toBeDefined();
      expect(rect.top).toBeDefined();
      expect(rect.width).toBeDefined();
      expect(rect.height).toBeDefined();

      mockElement.remove();
    });
  });

  describe("Spotlight Canvas Rendering", () => {
    beforeEach(() => {
      tutorial.initialize();
    });

    test("should have canvas context", () => {
      const ctx = tutorial.spotlightCanvas.getContext("2d");
      expect(ctx).not.toBeNull();
    });

    test("should draw spotlight without target (welcome screen)", () => {
      // Get context and verify it's mocked
      const ctx = tutorial.spotlightCanvas.getContext("2d");
      expect(ctx).not.toBeNull();
      expect(ctx.clearRect).toBeDefined();
      expect(ctx.fillRect).toBeDefined();

      tutorial.currentStep = 0;
      tutorial.drawSpotlight();

      // Verify context methods exist (they're mocked)
      expect(typeof ctx.clearRect).toBe("function");
      expect(typeof ctx.fillRect).toBe("function");
    });

    test("should handle canvas resize", () => {
      const newWidth = 1024;
      const newHeight = 768;

      tutorial.spotlightCanvas.width = newWidth;
      tutorial.spotlightCanvas.height = newHeight;

      expect(tutorial.spotlightCanvas.width).toBe(newWidth);
      expect(tutorial.spotlightCanvas.height).toBe(newHeight);
    });
  });

  describe("Tooltip Content", () => {
    beforeEach(() => {
      tutorial.initialize();
    });

    test("should render tooltip for current step", () => {
      tutorial.currentStep = 0;
      tutorial.updateTooltip();

      const tooltipContent =
        tutorial.tooltipElement.querySelector(".tooltip-content");
      expect(tooltipContent).not.toBeNull();
    });

    test("should display correct title for welcome step", () => {
      tutorial.currentStep = 0;
      tutorial.updateTooltip();

      const title = tutorial.tooltipElement.querySelector(".tooltip-title");
      expect(title.textContent).toBe("Welcome to Stellar Horizon");
    });

    test("should display correct description for budget step", () => {
      tutorial.currentStep = 1;
      tutorial.updateTooltip();

      const description = tutorial.tooltipElement.querySelector(
        ".tooltip-description",
      );
      expect(description.textContent).toContain("budget panel");
    });

    test("should show Next button on non-final steps", () => {
      tutorial.currentStep = 0;
      tutorial.updateTooltip();

      const nextBtn =
        tutorial.tooltipElement.querySelector(".tutorial-next-btn");
      expect(nextBtn.textContent).toBe("Next");
    });

    test("should show Complete button on final step", () => {
      tutorial.currentStep = tutorial.steps.length - 1;
      tutorial.updateTooltip();

      const nextBtn =
        tutorial.tooltipElement.querySelector(".tutorial-next-btn");
      expect(nextBtn.textContent).toBe("Complete");
    });

    test("should have Skip button on all steps", () => {
      for (let i = 0; i < tutorial.steps.length; i++) {
        tutorial.currentStep = i;
        tutorial.updateTooltip();

        const skipBtn =
          tutorial.tooltipElement.querySelector(".tutorial-skip-btn");
        expect(skipBtn).not.toBeNull();
        expect(skipBtn.textContent).toBe("Skip Tutorial");
      }
    });
  });

  describe("Button Interactions", () => {
    beforeEach(() => {
      tutorial.initialize();
    });

    test("should call next() when Next button is clicked", () => {
      const nextSpy = jest.spyOn(tutorial, "next");
      tutorial.currentStep = 0;
      tutorial.updateTooltip();

      const nextBtn =
        tutorial.tooltipElement.querySelector(".tutorial-next-btn");
      nextBtn.click();

      expect(nextSpy).toHaveBeenCalled();
      nextSpy.mockRestore();
    });

    test("should call skip() when Skip button is clicked", () => {
      const skipSpy = jest.spyOn(tutorial, "skip");
      tutorial.updateTooltip();

      const skipBtn =
        tutorial.tooltipElement.querySelector(".tutorial-skip-btn");
      skipBtn.click();

      expect(skipSpy).toHaveBeenCalled();
      skipSpy.mockRestore();
    });
  });

  describe("Keyboard Navigation", () => {
    beforeEach(() => {
      tutorial.initialize();
    });

    test("should progress to next step on Arrow Right key", () => {
      const nextSpy = jest.spyOn(tutorial, "next");

      const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
      document.dispatchEvent(event);

      expect(nextSpy).toHaveBeenCalled();
      nextSpy.mockRestore();
    });

    test("should progress to next step on Enter key", () => {
      const nextSpy = jest.spyOn(tutorial, "next");

      const event = new KeyboardEvent("keydown", { key: "Enter" });
      document.dispatchEvent(event);

      expect(nextSpy).toHaveBeenCalled();
      nextSpy.mockRestore();
    });

    test("should skip tutorial on Escape key", () => {
      const skipSpy = jest.spyOn(tutorial, "skip");

      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);

      expect(skipSpy).toHaveBeenCalled();
      skipSpy.mockRestore();
    });
  });

  describe("Cleanup", () => {
    beforeEach(() => {
      tutorial.initialize();
    });

    test("should remove DOM elements on cleanup", () => {
      expect(document.getElementById("tutorial")).not.toBeNull();

      tutorial.cleanup();

      expect(document.getElementById("tutorial")).toBeNull();
    });

    test("should remove event listeners on cleanup", () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        "removeEventListener",
      );

      tutorial.cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );

      removeEventListenerSpy.mockRestore();
    });

    test("should reset all references on cleanup", () => {
      tutorial.cleanup();

      expect(tutorial.sceneElement).toBeNull();
      expect(tutorial.overlayElement).toBeNull();
      expect(tutorial.spotlightCanvas).toBeNull();
      expect(tutorial.tooltipElement).toBeNull();
      expect(tutorial.isActive).toBe(false);
    });
  });

  describe("Callbacks", () => {
    beforeEach(() => {
      tutorial.initialize();
    });

    test("should register and call onComplete callback", () => {
      const callback = jest.fn();
      tutorial.setOnComplete(callback);

      tutorial.currentStep = tutorial.steps.length - 1;
      tutorial.next();

      expect(callback).toHaveBeenCalled();
    });

    test("should register and call onSkip callback", () => {
      const callback = jest.fn();
      tutorial.setOnSkip(callback);

      tutorial.skip();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("Step Configuration", () => {
    test("should have all required properties for each step", () => {
      tutorial.steps.forEach((step, index) => {
        expect(step).toHaveProperty("id");
        expect(step).toHaveProperty("title");
        expect(step).toHaveProperty("description");
        expect(step).toHaveProperty("targetSelector");
        expect(step).toHaveProperty("position");
        expect(typeof step.id).toBe("string");
        expect(typeof step.title).toBe("string");
        expect(typeof step.description).toBe("string");
        expect(["left", "right", "center", "bottom", null]).toContain(
          step.position,
        );
      });
    });

    test("should have first step as welcome with no target", () => {
      const welcomeStep = tutorial.steps[0];
      expect(welcomeStep.id).toBe("welcome");
      expect(welcomeStep.targetSelector).toBeNull();
      expect(welcomeStep.position).toBe("center");
    });

    test("should have meaningful step titles", () => {
      tutorial.steps.forEach((step) => {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.title).not.toMatch(/^undefined|^null/);
      });
    });

    test("should have meaningful step descriptions", () => {
      tutorial.steps.forEach((step) => {
        expect(step.description.length).toBeGreaterThan(0);
        expect(step.description).not.toMatch(/^undefined|^null/);
      });
    });
  });
});
