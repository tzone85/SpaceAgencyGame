/**
 * Renderer Tests
 *
 * Test suite for the Renderer class
 */

import Renderer from '../../src/core/renderer.js';

describe('Renderer', () => {
  let renderer;

  beforeEach(() => {
    renderer = new Renderer();
  });

  test('should create renderer instance', () => {
    expect(renderer).toBeDefined();
    expect(renderer.isInitialized).toBe(false);
  });

  test('should have render method', () => {
    expect(typeof renderer.render).toBe('function');
  });

  test('should have clear method', () => {
    expect(typeof renderer.clear).toBe('function');
  });

  test('should have initialize method', () => {
    expect(typeof renderer.initialize).toBe('function');
  });
});
