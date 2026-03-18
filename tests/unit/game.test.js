/**
 * Game Tests
 *
 * Test suite for the main Game controller class
 */

import Game from "../../src/core/game.js";
import EventBus from "../../src/game/EventBus.js";

describe("Game", () => {
  let game;

  beforeEach(() => {
    EventBus.reset();
    game = new Game();
  });

  afterEach(() => {
    if (game && game.isRunning) {
      game.destroy();
    }
    EventBus.reset();
  });

  test("should create game instance", () => {
    expect(game).toBeDefined();
    expect(game.engine).toBeDefined();
  });

  test("should initialize with isRunning = false", () => {
    expect(game.isRunning).toBe(false);
  });

  test("should have start method", () => {
    expect(typeof game.start).toBe("function");
  });

  test("should have stop method", () => {
    expect(typeof game.stop).toBe("function");
  });

  test("should have destroy method", () => {
    expect(typeof game.destroy).toBe("function");
  });

  test("should have eventBus, gameState, and saveSystem", () => {
    expect(game.eventBus).toBeDefined();
    expect(game.gameState).toBeDefined();
    expect(game.saveSystem).toBeDefined();
  });

  test("should set isRunning to true after start", () => {
    game.start();
    expect(game.isRunning).toBe(true);
    game.destroy();
  });

  test("should set isRunning to false after stop", () => {
    game.start();
    game.stop();
    expect(game.isRunning).toBe(false);
  });
});
