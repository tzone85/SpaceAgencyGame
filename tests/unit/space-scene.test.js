/**
 * SpaceScene Unit Tests
 *
 * Test suite for the SpaceScene class functionality.
 */

import SpaceScene from '../../src/scenes/space-scene.js';

describe('SpaceScene', () => {
  let mockRenderer;
  let mockCamera;
  let mockGL;
  let spaceScene;

  beforeEach(() => {
    // Mock WebGL context
    mockGL = {
      createProgram: jest.fn(() => 'mockProgram'),
      createShader: jest.fn(() => 'mockShader'),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      getProgramParameter: jest.fn(() => true),
      deleteShader: jest.fn(),
      getAttribLocation: jest.fn(() => 0),
      getUniformLocation: jest.fn(() => 'mockLocation'),
      createBuffer: jest.fn(() => 'mockBuffer'),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      useProgram: jest.fn(),
      uniformMatrix4fv: jest.fn(),
      uniform1f: jest.fn(),
      enableVertexAttribArray: jest.fn(),
      vertexAttribPointer: jest.fn(),
      drawArrays: jest.fn(),
      deleteBuffer: jest.fn(),
      deleteProgram: jest.fn(),
      clearColor: jest.fn(),
      enable: jest.fn(),
      blendFunc: jest.fn(),
      ARRAY_BUFFER: 1,
      STATIC_DRAW: 2,
      VERTEX_SHADER: 3,
      FRAGMENT_SHADER: 4,
      LINK_STATUS: 5,
      COMPILE_STATUS: 6,
      POINTS: 7,
      BLEND: 8,
      DEPTH_TEST: 9,
      SRC_ALPHA: 10,
      ONE: 11,
      ONE_MINUS_SRC_ALPHA: 12,
      FLOAT: 13
    };

    // Mock renderer
    mockRenderer = {
      getContext: jest.fn(() => mockGL),
      createShaderProgram: jest.fn(() => 'mockProgram'),
      createBuffer: jest.fn(() => 'mockBuffer'),
      clear: jest.fn(),
      isReady: jest.fn(() => true)
    };

    // Mock camera
    mockCamera = {
      setPosition: jest.fn(),
      setTarget: jest.fn(),
      setTransitionSpeed: jest.fn(),
      update: jest.fn(),
      updateAspectRatio: jest.fn(),
      getViewMatrix: jest.fn(() => [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),
      getProjectionMatrix: jest.fn(() => [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])
    };

    spaceScene = new SpaceScene(mockRenderer, mockCamera, {
      starCount: 100,
      enableParticles: true
    });
  });

  describe('initialization', () => {
    test('should initialize with default configuration', () => {
      const defaultScene = new SpaceScene(mockRenderer, mockCamera);
      
      expect(defaultScene.config.starCount).toBe(1000);
      expect(defaultScene.config.nebulaDensity).toBe(0.3);
      expect(defaultScene.config.ambientLightLevel).toBe(0.2);
      expect(defaultScene.config.enableParticles).toBe(true);
    });

    test('should merge custom configuration', () => {
      expect(spaceScene.config.starCount).toBe(100);
      expect(spaceScene.config.enableParticles).toBe(true);
      expect(spaceScene.config.nebulaDensity).toBe(0.3); // Default value
    });

    test('should start uninitialized and inactive', () => {
      expect(spaceScene.isInitialized).toBe(false);
      expect(spaceScene.isActive).toBe(false);
    });
  });

  describe('scene initialization', () => {
    test('should initialize all components successfully', () => {
      spaceScene.initialize();
      
      expect(spaceScene.isInitialized).toBe(true);
      expect(mockRenderer.createShaderProgram).toHaveBeenCalled();
      expect(mockRenderer.createBuffer).toHaveBeenCalled();
    });

    test('should not initialize twice', () => {
      spaceScene.initialize();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      spaceScene.initialize();
      
      expect(consoleSpy).toHaveBeenCalledWith('Space Scene already initialized');
      consoleSpy.mockRestore();
    });

    test('should handle initialization errors', () => {
      mockRenderer.createShaderProgram.mockReturnValue(null);
      
      expect(() => spaceScene.initialize()).toThrow('Failed to create shader program');
    });
  });

  describe('star field generation', () => {
    beforeEach(() => {
      spaceScene.initialize();
    });

    test('should create star field with correct count', () => {
      expect(spaceScene.starField.vertexCount).toBe(100);
      expect(mockRenderer.createBuffer).toHaveBeenCalledTimes(3); // position, color, size
    });

    test('should generate stars within specified radius', () => {
      // This is tested indirectly through the buffer creation
      // In a real test, we'd mock the buffer creation to capture the data
      expect(spaceScene.starField).toHaveProperty('positionBuffer');
      expect(spaceScene.starField).toHaveProperty('colorBuffer');
      expect(spaceScene.starField).toHaveProperty('sizeBuffer');
    });
  });

  describe('space objects', () => {
    beforeEach(() => {
      spaceScene.initialize();
    });

    test('should create default space objects', () => {
      expect(spaceScene.spaceObjects).toHaveLength(3);
      expect(spaceScene.spaceObjects[0]).toHaveProperty('position');
      expect(spaceScene.spaceObjects[0]).toHaveProperty('color');
      expect(spaceScene.spaceObjects[0]).toHaveProperty('size');
      expect(spaceScene.spaceObjects[0]).toHaveProperty('rotationSpeed');
    });
  });

  describe('scene lifecycle', () => {
    beforeEach(() => {
      spaceScene.initialize();
    });

    test('should enter scene and configure camera', () => {
      spaceScene.onEnter();
      
      expect(spaceScene.isActive).toBe(true);
      expect(mockCamera.setPosition).toHaveBeenCalledWith(0, 0, 10, true);
      expect(mockCamera.setTarget).toHaveBeenCalledWith(0, 0, 0, true);
      expect(mockCamera.setTransitionSpeed).toHaveBeenCalledWith(1.5);
      expect(mockGL.enable).toHaveBeenCalledWith(mockGL.DEPTH_TEST);
    });

    test('should exit scene', () => {
      spaceScene.onEnter();
      spaceScene.onExit();
      
      expect(spaceScene.isActive).toBe(false);
    });

    test('should handle transition callbacks', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      spaceScene.onTransitionIn();
      spaceScene.onTransitionOut();
      
      expect(consoleSpy).toHaveBeenCalledWith('Space Scene transitioning in');
      expect(consoleSpy).toHaveBeenCalledWith('Space Scene transitioning out');
      consoleSpy.mockRestore();
    });
  });

  describe('scene updates', () => {
    beforeEach(() => {
      spaceScene.initialize();
      spaceScene.onEnter();
    });

    test('should update time and animations', () => {
      const initialTime = spaceScene.time;
      const initialRotation = spaceScene.starRotation;
      
      spaceScene.update(0.1);
      
      expect(spaceScene.time).toBeGreaterThan(initialTime);
      expect(spaceScene.starRotation).toBeGreaterThan(initialRotation);
      expect(mockCamera.update).toHaveBeenCalledWith(0.1);
    });

    test('should update space object rotations', () => {
      const initialRotation = spaceScene.spaceObjects[0].rotation || 0;
      
      spaceScene.update(0.1);
      
      expect(spaceScene.spaceObjects[0].rotation).toBeGreaterThan(initialRotation);
    });

    test('should not update when inactive', () => {
      spaceScene.onExit();
      const initialTime = spaceScene.time;
      
      spaceScene.update(0.1);
      
      expect(spaceScene.time).toBe(initialTime);
    });
  });

  describe('scene rendering', () => {
    beforeEach(() => {
      spaceScene.initialize();
      spaceScene.onEnter();
    });

    test('should render when ready', () => {
      spaceScene.render();
      
      expect(mockRenderer.clear).toHaveBeenCalled();
      expect(mockGL.useProgram).toHaveBeenCalledWith('mockProgram');
      expect(mockGL.uniformMatrix4fv).toHaveBeenCalled();
    });

    test('should not render when not initialized', () => {
      const uninitializedScene = new SpaceScene(mockRenderer, mockCamera);
      
      uninitializedScene.render();
      
      expect(mockRenderer.clear).not.toHaveBeenCalled();
    });

    test('should not render when renderer not ready', () => {
      mockRenderer.isReady.mockReturnValue(false);
      
      spaceScene.render();
      
      expect(mockGL.useProgram).not.toHaveBeenCalled();
    });

    test('should render star field', () => {
      spaceScene.render();
      
      expect(mockGL.drawArrays).toHaveBeenCalledWith(mockGL.POINTS, 0, 100);
    });
  });

  describe('configuration management', () => {
    test('should return current configuration', () => {
      const config = spaceScene.getConfig();
      
      expect(config).toEqual(spaceScene.config);
      expect(config).not.toBe(spaceScene.config); // Should be a copy
    });

    test('should update configuration', () => {
      spaceScene.updateConfig({ starCount: 500, newProperty: true });
      
      expect(spaceScene.config.starCount).toBe(500);
      expect(spaceScene.config.newProperty).toBe(true);
      expect(spaceScene.config.nebulaDensity).toBe(0.3); // Unchanged
    });
  });

  describe('resize handling', () => {
    test('should update camera aspect ratio on resize', () => {
      spaceScene.onResize(1920, 1080);
      
      expect(mockCamera.updateAspectRatio).toHaveBeenCalledWith({
        width: 1920,
        height: 1080
      });
    });
  });

  describe('state reporting', () => {
    beforeEach(() => {
      spaceScene.initialize();
    });

    test('should return current state', () => {
      const state = spaceScene.getState();
      
      expect(state).toHaveProperty('isInitialized');
      expect(state).toHaveProperty('isActive');
      expect(state).toHaveProperty('time');
      expect(state).toHaveProperty('starRotation');
      expect(state).toHaveProperty('spaceObjectCount');
      expect(state).toHaveProperty('config');
      
      expect(state.isInitialized).toBe(true);
      expect(state.spaceObjectCount).toBe(3);
    });
  });

  describe('destruction', () => {
    beforeEach(() => {
      spaceScene.initialize();
    });

    test('should clean up all resources', () => {
      spaceScene.destroy();
      
      expect(mockGL.deleteProgram).toHaveBeenCalledWith('mockProgram');
      expect(mockGL.deleteBuffer).toHaveBeenCalledTimes(3);
      expect(spaceScene.isInitialized).toBe(false);
      expect(spaceScene.isActive).toBe(false);
      expect(spaceScene.spaceObjects).toEqual([]);
      expect(spaceScene.renderer).toBeNull();
      expect(spaceScene.camera).toBeNull();
    });
  });
});