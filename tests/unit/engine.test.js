/**
 * Engine Tests
 *
 * Test suite for the simplified Canvas 2D Engine class
 */

import Engine from "../../src/core/engine.js";

describe("Engine", () => {
  let engine;

  beforeEach(() => {
    engine = new Engine();
  });

  afterEach(() => {
    if (engine.isInitialized) {
      engine.destroy();
    }
  });

  test("should create engine instance", () => {
    expect(engine).toBeDefined();
    expect(engine.frameRate).toBe(60);
  });

  test("should initialize with isRunning = false", () => {
    expect(engine.isRunning).toBe(false);
  });

  test("should have start method", () => {
    expect(typeof engine.start).toBe("function");
  });

  test("should have stop method", () => {
    expect(typeof engine.stop).toBe("function");
  });

  test("should have update method", () => {
    expect(typeof engine.update).toBe("function");
  });

  test("should have onUpdate method for registering callbacks", () => {
    expect(typeof engine.onUpdate).toBe("function");
  });

  test("should have destroy method", () => {
    expect(typeof engine.destroy).toBe("function");
  });

  test("should initialize canvas on initialize()", () => {
    engine.initialize();
    expect(engine.isInitialized).toBe(true);
    expect(engine.canvas).toBeDefined();
    expect(engine.ctx).toBeDefined();
  });

  test("should register and call update callbacks", () => {
    const callback = jest.fn();
    engine.onUpdate(callback);

    engine.update(0.016);

    expect(callback).toHaveBeenCalledWith(0.016);
  });

  test("should return unregister function from onUpdate", () => {
    const callback = jest.fn();
    const unregister = engine.onUpdate(callback);

    unregister();
    engine.update(0.016);

    expect(callback).not.toHaveBeenCalled();
  });

  test("should throw if onUpdate receives non-function", () => {
    expect(() => engine.onUpdate("not a function")).toThrow();
  });

  test("should handle errors in update callbacks gracefully", () => {
    const errorCallback = jest.fn(() => {
      throw new Error("callback error");
    });
    const normalCallback = jest.fn();

    engine.onUpdate(errorCallback);
    engine.onUpdate(normalCallback);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    engine.update(0.016);

    expect(errorCallback).toHaveBeenCalled();
    expect(normalCallback).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
