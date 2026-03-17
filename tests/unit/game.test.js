/**
 * Game Tests
 *
 * Test suite for the main Game class
 */

import Game from '../../src/core/game.js';

describe('Game', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test('should create game instance', () => {
    expect(game).toBeDefined();
    expect(game.engine).toBeDefined();
    expect(game.renderer).toBeDefined();
  });

  test('should initialize with isRunning = false', () => {
    expect(game.isRunning).toBe(false);
  });

  test('should have start method', () => {
    expect(typeof game.start).toBe('function');
  });

  test('should have stop method', () => {
    expect(typeof game.stop).toBe('function');
  });

  test('should start the game', () => {
    game.start();
    expect(game.isRunning).toBe(true);
  });

  test('should stop the game', () => {
    game.start();
    game.stop();
    expect(game.isRunning).toBe(false);
  });
});
