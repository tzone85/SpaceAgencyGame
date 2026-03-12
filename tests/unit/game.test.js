/**
 * Game Tests
 *
 * Test suite for the main Game class
 */

import Game from '../../src/core/game.js';

describe('Game', () => {
  let game;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    game = new Game();
  });

  afterEach(() => {
    if (game) {
      game.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('initialization', () => {
    test('should create game instance', () => {
      expect(game).toBeDefined();
      expect(game.engine).toBeDefined();
      expect(game.isRunning).toBe(false);
    });

    test('should have engine instance', () => {
      expect(game.engine).toBeDefined();
      expect(game.engine.constructor.name).toBe('Engine');
    });
  });

  describe('starting the game', () => {
    test('should start the game', (done) => {
      game.start();

      expect(game.isRunning).toBe(true);
      expect(game.engine.isInitialized).toBe(true);
      expect(game.engine.isRunning).toBe(true);

      setTimeout(() => {
        game.stop();
        done();
      }, 50);
    });

    test('should initialize engine when starting', () => {
      const initSpy = jest.spyOn(game.engine, 'initialize');

      game.start();

      expect(initSpy).toHaveBeenCalled();
      initSpy.mockRestore();

      game.stop();
    });

    test('should start engine loop when starting', (done) => {
      const startSpy = jest.spyOn(game.engine, 'start');

      game.start();

      expect(startSpy).toHaveBeenCalled();
      startSpy.mockRestore();

      setTimeout(() => {
        game.stop();
        done();
      }, 50);
    });
  });

  describe('stopping the game', () => {
    test('should stop the game', (done) => {
      game.start();

      setTimeout(() => {
        game.stop();

        expect(game.isRunning).toBe(false);
        expect(game.engine.isRunning).toBe(false);

        done();
      }, 50);
    });

    test('should stop the engine loop', (done) => {
      game.start();

      setTimeout(() => {
        const stopSpy = jest.spyOn(game.engine, 'stop');

        game.stop();

        expect(stopSpy).toHaveBeenCalled();
        stopSpy.mockRestore();

        done();
      }, 50);
    });
  });

  describe('game state', () => {
    test('should return game state', (done) => {
      game.start();

      setTimeout(() => {
        const state = game.getState();

        expect(state).toHaveProperty('isRunning');
        expect(state).toHaveProperty('engineStats');
        expect(state.isRunning).toBe(true);
        expect(state.engineStats).toBeDefined();

        game.stop();
        done();
      }, 50);
    });

    test('should include engine stats in game state', (done) => {
      game.start();

      setTimeout(() => {
        const state = game.getState();

        expect(state.engineStats).toHaveProperty('frameCount');
        expect(state.engineStats).toHaveProperty('deltaTime');
        expect(state.engineStats).toHaveProperty('isInitialized');
        expect(state.engineStats).toHaveProperty('isRunning');

        game.stop();
        done();
      }, 50);
    });

    test('should report isRunning as false when stopped', () => {
      const state = game.getState();

      expect(state.isRunning).toBe(false);
    });
  });

  describe('cleanup', () => {
    test('should destroy game and cleanup resources', () => {
      game.start();

      game.destroy();

      expect(game.engine.isInitialized).toBe(false);
      expect(game.engine.canvas).toBeNull();
    });

    test('should stop game before destroying', (done) => {
      game.start();

      setTimeout(() => {
        const stopSpy = jest.spyOn(game, 'stop');

        game.destroy();

        expect(stopSpy).toHaveBeenCalled();
        stopSpy.mockRestore();

        done();
      }, 50);
    });

    test('should call engine destroy', () => {
      const destroySpy = jest.spyOn(game.engine, 'destroy');

      game.destroy();

      expect(destroySpy).toHaveBeenCalled();
      destroySpy.mockRestore();
    });
  });
});
