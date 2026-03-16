/**
 * Engine Tests
 *
 * Test suite for the Engine class
 */

import Engine from '../../src/core/engine.js';

describe('Engine', () => {
  let engine;

  beforeEach(() => {
    engine = new Engine();
  });

  test('should create engine instance', () => {
    expect(engine).toBeDefined();
    expect(engine.frameRate).toBe(60);
  });

  test('should initialize with isRunning = false', () => {
    expect(engine.isRunning).toBe(false);
  });

  test('should have start method', () => {
    expect(typeof engine.start).toBe('function');
  });

  test('should have stop method', () => {
    expect(typeof engine.stop).toBe('function');
  });

  test('should have update method', () => {
    expect(typeof engine.update).toBe('function');
  });
});
