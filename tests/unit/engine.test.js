/**
 * Engine Tests
 *
 * Test suite for the game engine core functionality
 */

import Engine from '../../src/core/engine.js';

describe('Engine', () => {
  let engine;

  beforeEach(() => {
    // Setup a mock canvas
    document.body.innerHTML = '<div id="root"></div>';
    engine = new Engine();
  });

  afterEach(() => {
    if (engine) {
      engine.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('initialization', () => {
    test('should create engine instance with default values', () => {
      expect(engine).toBeDefined();
      expect(engine.isInitialized).toBe(false);
      expect(engine.isRunning).toBe(false);
      expect(engine.frameCount).toBe(0);
      expect(engine.fpsTarget).toBe(60);
    });

    test('should initialize engine and setup canvas', () => {
      engine.initialize();

      expect(engine.isInitialized).toBe(true);
      expect(engine.canvas).toBeDefined();
      expect(engine.canvas.id).toBe('gameCanvas');
      expect(engine.renderer).toBeDefined();
    });

    test('should not reinitialize if already initialized', () => {
      engine.initialize();
      const firstRenderer = engine.renderer;

      engine.initialize();

      expect(engine.renderer).toBe(firstRenderer);
    });

    test('should create canvas with correct dimensions', () => {
      engine.initialize();

      expect(engine.canvas.width).toBe(window.innerWidth);
      expect(engine.canvas.height).toBe(window.innerHeight);
    });

    test('should apply correct canvas styling', () => {
      engine.initialize();

      expect(engine.canvas.style.display).toBe('block');
      expect(engine.canvas.style.backgroundColor).toBe('rgb(0, 0, 0)');
    });

    test('should set canvas as a child of document body', () => {
      engine.initialize();

      expect(document.body.contains(engine.canvas)).toBe(true);
    });

    test('should use existing canvas if it exists', () => {
      const existingCanvas = document.createElement('canvas');
      existingCanvas.id = 'gameCanvas';
      document.body.appendChild(existingCanvas);

      engine.initialize();

      expect(engine.canvas).toBe(existingCanvas);
      expect(document.querySelectorAll('#gameCanvas').length).toBe(1);
    });
  });

  describe('game loop', () => {
    test('should not start if not initialized', () => {
      engine.start();

      expect(engine.isRunning).toBe(false);
    });

    test('should start game loop after initialization', (done) => {
      engine.initialize();
      engine.start();

      expect(engine.isRunning).toBe(true);

      setTimeout(() => {
        expect(engine.frameCount).toBeGreaterThan(0);
        engine.stop();
        done();
      }, 50);
    });

    test('should not start if already running', () => {
      engine.initialize();
      engine.start();

      const frameCountBefore = engine.frameCount;
      engine.start();

      expect(engine.isRunning).toBe(true);
    });

    test('should increment frame count in game loop', (done) => {
      engine.initialize();
      engine.start();

      const initialFrameCount = engine.frameCount;

      setTimeout(() => {
        expect(engine.frameCount).toBeGreaterThan(initialFrameCount);
        engine.stop();
        done();
      }, 50);
    });

    test('should calculate delta time', (done) => {
      engine.initialize();
      engine.start();

      setTimeout(() => {
        expect(engine.deltaTime).toBeGreaterThan(0);
        engine.stop();
        done();
      }, 50);
    });

    test('should cap delta time at 0.1 seconds', (done) => {
      engine.initialize();
      engine.start();

      // Simulate a large delta time jump
      engine.lastTime = performance.now() - 500;

      setTimeout(() => {
        if (engine.deltaTime > 0) {
          expect(engine.deltaTime).toBeLessThanOrEqual(0.1);
        }
        engine.stop();
        done();
      }, 50);
    });
  });

  describe('stopping the engine', () => {
    test('should stop the game loop', (done) => {
      engine.initialize();
      engine.start();

      setTimeout(() => {
        const frameCountBefore = engine.frameCount;
        engine.stop();

        expect(engine.isRunning).toBe(false);

        setTimeout(() => {
          expect(engine.frameCount).toBe(frameCountBefore);
          done();
        }, 50);
      }, 50);
    });

    test('should warn if stopping when not running', () => {
      engine.initialize();
      const consoleSpy = jest.spyOn(console, 'warn');

      engine.stop();

      expect(consoleSpy).toHaveBeenCalledWith('Game loop is not running');
      consoleSpy.mockRestore();
    });

    test('should clear animation frame ID on stop', () => {
      engine.initialize();
      engine.start();

      expect(engine.animationFrameId).not.toBeNull();

      engine.stop();

      expect(engine.animationFrameId).toBeNull();
    });
  });

  describe('statistics', () => {
    test('should return correct stats', (done) => {
      engine.initialize();
      engine.start();

      setTimeout(() => {
        const stats = engine.getStats();

        expect(stats).toHaveProperty('frameCount');
        expect(stats).toHaveProperty('deltaTime');
        expect(stats).toHaveProperty('isInitialized');
        expect(stats).toHaveProperty('isRunning');
        expect(stats).toHaveProperty('fpsTarget');
        expect(stats).toHaveProperty('canvasWidth');
        expect(stats).toHaveProperty('canvasHeight');

        expect(stats.isInitialized).toBe(true);
        expect(stats.isRunning).toBe(true);
        expect(stats.fpsTarget).toBe(60);
        expect(stats.frameCount).toBeGreaterThan(0);

        engine.stop();
        done();
      }, 50);
    });
  });

  describe('cleanup and destroy', () => {
    test('should clean up resources on destroy', () => {
      engine.initialize();
      engine.start();

      engine.destroy();

      expect(engine.isInitialized).toBe(false);
      expect(engine.isRunning).toBe(false);
      expect(engine.canvas).toBeNull();
      expect(engine.renderer).toBeNull();
    });

    test('should remove canvas from DOM on destroy', () => {
      engine.initialize();

      expect(document.body.contains(engine.canvas)).toBe(true);

      engine.destroy();

      expect(document.getElementById('gameCanvas')).toBeNull();
    });

    test('should stop engine before destroying', () => {
      engine.initialize();
      engine.start();

      const stopSpy = jest.spyOn(engine, 'stop');

      engine.destroy();

      expect(stopSpy).toHaveBeenCalled();
      stopSpy.mockRestore();
    });
  });

  describe('rendering', () => {
    test('should call renderer clear in render method', () => {
      engine.initialize();

      const renderSpy = jest.spyOn(engine.renderer, 'clear');

      engine.render();

      expect(renderSpy).toHaveBeenCalled();
      renderSpy.mockRestore();
    });
  });
});
