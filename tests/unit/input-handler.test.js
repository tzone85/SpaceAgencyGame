/**
 * InputHandler Unit Tests
 * Tests keyboard/mouse input capture, event handling, and input state management
 */

import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import InputHandler from "../../src/core/input-handler.js";

describe("InputHandler", () => {
  let inputHandler;
  let mockTarget;

  beforeEach(() => {
    inputHandler = new InputHandler();
    mockTarget = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  });

  afterEach(() => {
    if (inputHandler) {
      inputHandler.destroy();
    }
  });

  describe("Initialization", () => {
    test("should initialize with provided target", () => {
      inputHandler.initialize(mockTarget);

      expect(mockTarget.addEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
      expect(mockTarget.addEventListener).toHaveBeenCalledWith(
        "keyup",
        expect.any(Function)
      );
      expect(mockTarget.addEventListener).toHaveBeenCalledWith(
        "mousemove",
        expect.any(Function)
      );
    });

    test("should attach all required event listeners", () => {
      const standardListeners = [
        "keydown",
        "keyup",
        "mousemove",
        "mousedown",
        "mouseup",
      ];

      inputHandler.initialize(mockTarget);

      for (const listener of standardListeners) {
        expect(mockTarget.addEventListener).toHaveBeenCalledWith(
          listener,
          expect.any(Function)
        );
      }

      // wheel event is called with options object as third parameter
      expect(mockTarget.addEventListener).toHaveBeenCalledWith(
        "wheel",
        expect.any(Function),
        { passive: false }
      );
    });

    test("should handle invalid target", () => {
      const consoleError = jest.spyOn(console, "error");
      inputHandler.initialize(null);

      expect(consoleError).toHaveBeenCalledWith(
        "Invalid target for input handler"
      );

      consoleError.mockRestore();
    });

    test("should default to window target", () => {
      // Create a new handler without initializing yet
      const handler = new InputHandler();
      const windowAddEventListenerSpy = jest.spyOn(window, "addEventListener");

      handler.initialize();

      expect(windowAddEventListenerSpy).toHaveBeenCalled();

      windowAddEventListenerSpy.mockRestore();
      handler.destroy();
    });
  });

  describe("Keyboard Input", () => {
    test("should detect key press", () => {
      inputHandler.initialize(mockTarget);

      const keyDownEvent = new KeyboardEvent("keydown", { key: "a" });
      inputHandler.handleKeyDown(keyDownEvent);

      expect(inputHandler.isKeyPressed("a")).toBe(true);
    });

    test("should detect key release", () => {
      inputHandler.initialize(mockTarget);

      const keyDownEvent = new KeyboardEvent("keydown", { key: "a" });
      const keyUpEvent = new KeyboardEvent("keyup", { key: "a" });

      inputHandler.handleKeyDown(keyDownEvent);
      expect(inputHandler.isKeyPressed("a")).toBe(true);

      inputHandler.handleKeyUp(keyUpEvent);
      expect(inputHandler.isKeyPressed("a")).toBe(false);
    });

    test("should handle special keys", () => {
      inputHandler.initialize(mockTarget);

      const event = new KeyboardEvent("keydown", { key: "Enter" });
      inputHandler.handleKeyDown(event);

      expect(inputHandler.isKeyPressed("enter")).toBe(true);
    });

    test("should handle arrow keys", () => {
      inputHandler.initialize(mockTarget);

      const upEvent = new KeyboardEvent("keydown", { key: "ArrowUp" });
      const downEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });

      inputHandler.handleKeyDown(upEvent);
      inputHandler.handleKeyDown(downEvent);

      expect(inputHandler.isKeyPressed("arrowup")).toBe(true);
      expect(inputHandler.isKeyPressed("arrowdown")).toBe(true);
    });

    test("should get all pressed keys", () => {
      inputHandler.initialize(mockTarget);

      const eventA = new KeyboardEvent("keydown", { key: "a" });
      const eventB = new KeyboardEvent("keydown", { key: "b" });

      inputHandler.handleKeyDown(eventA);
      inputHandler.handleKeyDown(eventB);

      const pressed = inputHandler.getPressedKeys();
      expect(pressed).toContain("a");
      expect(pressed).toContain("b");
      expect(pressed.length).toBe(2);
    });

    test("should check if any key is pressed", () => {
      inputHandler.initialize(mockTarget);

      expect(inputHandler.hasAnyKeyPressed()).toBe(false);

      const event = new KeyboardEvent("keydown", { key: "a" });
      inputHandler.handleKeyDown(event);

      expect(inputHandler.hasAnyKeyPressed()).toBe(true);
    });

    test("should emit keydown event", () => {
      inputHandler.initialize(mockTarget);
      const callback = jest.fn();

      inputHandler.on("keydown", callback);

      const event = new KeyboardEvent("keydown", { key: "a" });
      inputHandler.handleKeyDown(event);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ key: "a" })
      );
    });

    test("should emit keyup event", () => {
      inputHandler.initialize(mockTarget);
      const callback = jest.fn();

      inputHandler.on("keyup", callback);

      const event = new KeyboardEvent("keyup", { key: "a" });
      inputHandler.handleKeyUp(event);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ key: "a" })
      );
    });
  });

  describe("Mouse Input", () => {
    test("should track mouse position", () => {
      inputHandler.initialize(mockTarget);

      const event = new MouseEvent("mousemove", { clientX: 100, clientY: 200 });
      inputHandler.handleMouseMove(event);

      const pos = inputHandler.getMousePosition();
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(200);
    });

    test("should detect left mouse button press", () => {
      inputHandler.initialize(mockTarget);

      const event = new MouseEvent("mousedown", { button: 0 });
      inputHandler.handleMouseDown(event);

      expect(inputHandler.isMouseButtonPressed("left")).toBe(true);
    });

    test("should detect right mouse button press", () => {
      inputHandler.initialize(mockTarget);

      const event = new MouseEvent("mousedown", { button: 2 });
      inputHandler.handleMouseDown(event);

      expect(inputHandler.isMouseButtonPressed("right")).toBe(true);
    });

    test("should detect middle mouse button press", () => {
      inputHandler.initialize(mockTarget);

      const event = new MouseEvent("mousedown", { button: 1 });
      inputHandler.handleMouseDown(event);

      expect(inputHandler.isMouseButtonPressed("middle")).toBe(true);
    });

    test("should detect mouse button release", () => {
      inputHandler.initialize(mockTarget);

      const downEvent = new MouseEvent("mousedown", { button: 0 });
      const upEvent = new MouseEvent("mouseup", { button: 0 });

      inputHandler.handleMouseDown(downEvent);
      expect(inputHandler.isMouseButtonPressed("left")).toBe(true);

      inputHandler.handleMouseUp(upEvent);
      expect(inputHandler.isMouseButtonPressed("left")).toBe(false);
    });

    test("should check if any mouse button is pressed", () => {
      inputHandler.initialize(mockTarget);

      expect(inputHandler.hasAnyMouseButtonPressed()).toBe(false);

      const event = new MouseEvent("mousedown", { button: 0 });
      inputHandler.handleMouseDown(event);

      expect(inputHandler.hasAnyMouseButtonPressed()).toBe(true);
    });

    test("should emit mousemove event", () => {
      inputHandler.initialize(mockTarget);
      const callback = jest.fn();

      inputHandler.on("mousemove", callback);

      const event = new MouseEvent("mousemove", { clientX: 100, clientY: 200 });
      inputHandler.handleMouseMove(event);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ x: 100, y: 200 })
      );
    });

    test("should emit mousedown event", () => {
      inputHandler.initialize(mockTarget);
      const callback = jest.fn();

      inputHandler.on("mousedown", callback);

      const event = new MouseEvent("mousedown", {
        button: 0,
        clientX: 50,
        clientY: 75,
      });
      inputHandler.handleMouseDown(event);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          button: "left",
          x: 50,
          y: 75,
        })
      );
    });

    test("should emit mouseup event", () => {
      inputHandler.initialize(mockTarget);
      const callback = jest.fn();

      inputHandler.on("mouseup", callback);

      const event = new MouseEvent("mouseup", {
        button: 0,
        clientX: 50,
        clientY: 75,
      });
      inputHandler.handleMouseUp(event);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          button: "left",
          x: 50,
          y: 75,
        })
      );
    });

    test("should handle mouse wheel events", () => {
      inputHandler.initialize(mockTarget);
      const callback = jest.fn();

      inputHandler.on("mousewheel", callback);

      const wheelEvent = new WheelEvent("wheel", { deltaY: 100 });
      inputHandler.handleMouseWheel(wheelEvent);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: "down",
          delta: 100,
        })
      );
    });

    test("should prevent default on mouse wheel", () => {
      inputHandler.initialize(mockTarget);

      const wheelEvent = new WheelEvent("wheel", { deltaY: 100 });
      const preventDefaultSpy = jest.spyOn(wheelEvent, "preventDefault");

      inputHandler.handleMouseWheel(wheelEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("Event Listener Management", () => {
    test("should register multiple listeners for same event", () => {
      inputHandler.initialize(mockTarget);
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      inputHandler.on("keydown", callback1);
      inputHandler.on("keydown", callback2);

      const event = new KeyboardEvent("keydown", { key: "a" });
      inputHandler.handleKeyDown(event);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    test("should remove event listener", () => {
      inputHandler.initialize(mockTarget);
      const callback = jest.fn();

      inputHandler.on("keydown", callback);
      inputHandler.off("keydown", callback);

      const event = new KeyboardEvent("keydown", { key: "a" });
      inputHandler.handleKeyDown(event);

      expect(callback).not.toHaveBeenCalled();
    });

    test("should validate callback is a function", () => {
      inputHandler.initialize(mockTarget);
      const consoleError = jest.spyOn(console, "error");

      inputHandler.on("keydown", "not a function");

      expect(consoleError).toHaveBeenCalledWith(
        "Callback must be a function"
      );

      consoleError.mockRestore();
    });

    test("should handle listener errors gracefully", () => {
      inputHandler.initialize(mockTarget);
      const consoleError = jest.spyOn(console, "error");
      const errorCallback = jest.fn(() => {
        throw new Error("Listener error");
      });

      inputHandler.on("keydown", errorCallback);

      const event = new KeyboardEvent("keydown", { key: "a" });
      expect(() => inputHandler.handleKeyDown(event)).not.toThrow();

      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe("Input State Management", () => {
    test("should enable input handling", () => {
      inputHandler.initialize(mockTarget);
      inputHandler.disable();
      inputHandler.enable();

      expect(inputHandler.isEnabled).toBe(true);
    });

    test("should disable input handling", () => {
      inputHandler.initialize(mockTarget);
      inputHandler.disable();

      expect(inputHandler.isEnabled).toBe(false);
    });

    test("should ignore input when disabled", () => {
      inputHandler.initialize(mockTarget);
      const callback = jest.fn();

      inputHandler.on("keydown", callback);
      inputHandler.disable();

      const event = new KeyboardEvent("keydown", { key: "a" });
      inputHandler.handleKeyDown(event);

      expect(callback).not.toHaveBeenCalled();
      expect(inputHandler.isKeyPressed("a")).toBe(false);
    });

    test("should clear input state", () => {
      inputHandler.initialize(mockTarget);

      const keyEvent = new KeyboardEvent("keydown", { key: "a" });
      const mouseEvent = new MouseEvent("mousedown", { button: 0 });

      inputHandler.handleKeyDown(keyEvent);
      inputHandler.handleMouseDown(mouseEvent);

      inputHandler.clearInputState();

      expect(inputHandler.isKeyPressed("a")).toBe(false);
      expect(inputHandler.isMouseButtonPressed("left")).toBe(false);
    });

    test("should reset input handler", () => {
      inputHandler.initialize(mockTarget);

      const keyEvent = new KeyboardEvent("keydown", { key: "a" });
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: 100,
        clientY: 200,
      });

      inputHandler.handleKeyDown(keyEvent);
      inputHandler.handleMouseMove(mouseEvent);

      inputHandler.reset();

      expect(inputHandler.isKeyPressed("a")).toBe(false);
      expect(inputHandler.getMousePosition()).toEqual({ x: 0, y: 0 });
    });
  });

  describe("Cleanup and Destruction", () => {
    test("should remove all event listeners on destroy", () => {
      inputHandler.initialize(mockTarget);
      inputHandler.destroy();

      expect(mockTarget.removeEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
      expect(mockTarget.removeEventListener).toHaveBeenCalledWith(
        "keyup",
        expect.any(Function)
      );
      expect(mockTarget.removeEventListener).toHaveBeenCalledWith(
        "mousemove",
        expect.any(Function)
      );
    });

    test("should clear all state on destroy", () => {
      inputHandler.initialize(mockTarget);

      const keyEvent = new KeyboardEvent("keydown", { key: "a" });
      inputHandler.handleKeyDown(keyEvent);

      inputHandler.destroy();

      expect(inputHandler.getPressedKeys().length).toBe(0);
      expect(inputHandler.isEnabled).toBe(false);
    });

    test("should handle destroy with no target", () => {
      inputHandler.destroy();
      // Should not throw
      expect(inputHandler.target).toBeUndefined();
    });
  });

  describe("Case Sensitivity", () => {
    test("should handle key queries case-insensitively", () => {
      inputHandler.initialize(mockTarget);

      const event = new KeyboardEvent("keydown", { key: "A" });
      inputHandler.handleKeyDown(event);

      expect(inputHandler.isKeyPressed("a")).toBe(true);
      expect(inputHandler.isKeyPressed("A")).toBe(true);
    });

    test("should handle mouse button queries case-insensitively", () => {
      inputHandler.initialize(mockTarget);

      const event = new MouseEvent("mousedown", { button: 0 });
      inputHandler.handleMouseDown(event);

      expect(inputHandler.isMouseButtonPressed("left")).toBe(true);
      expect(inputHandler.isMouseButtonPressed("LEFT")).toBe(true);
    });
  });
});
