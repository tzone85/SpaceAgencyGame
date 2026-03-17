/**
 * Launch Animation Tests
 *
 * Test suite for the LaunchAnim class
 */

import LaunchAnim from '../../src/canvas/LaunchAnim.js';
import Renderer from '../../src/core/renderer.js';

// Mock WebGL context
const mockWebGLContext = {
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  ARRAY_BUFFER: 34962,
  STATIC_DRAW: 35044,
  DYNAMIC_DRAW: 35048,
  TRIANGLES: 4,
  POINTS: 0,
  FLOAT: 5126,
  COLOR_BUFFER_BIT: 16384,
  DEPTH_BUFFER_BIT: 256,
  BLEND: 3042,
  SRC_ALPHA: 770,
  ONE_MINUS_SRC_ALPHA: 771,
  COMPILE_STATUS: 35713,
  LINK_STATUS: 35714,

  createShader: jest.fn(() => ({})),
  createProgram: jest.fn(() => ({})),
  createBuffer: jest.fn(() => ({})),
  deleteShader: jest.fn(),
  deleteProgram: jest.fn(),
  deleteBuffer: jest.fn(),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  getShaderParameter: jest.fn(() => true),
  getProgramParameter: jest.fn(() => true),
  getShaderInfoLog: jest.fn(() => ''),
  getProgramInfoLog: jest.fn(() => ''),
  getAttribLocation: jest.fn(() => 0),
  getUniformLocation: jest.fn(() => ({})),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  uniform2f: jest.fn(),
  uniform1f: jest.fn(),
  uniformMatrix3fv: jest.fn(),
  drawArrays: jest.fn(),
  enable: jest.fn(),
  blendFunc: jest.fn(),
  viewport: jest.fn(),
  clearColor: jest.fn(),
  clear: jest.fn()
};

describe('LaunchAnim', () => {
  let canvas;
  let renderer;
  let launchAnim;

  beforeEach(() => {
    // Create canvas and mock WebGL context
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    // Mock getContext to return our mock WebGL context
    canvas.getContext = jest.fn((type) => {
      if (type === 'webgl2' || type === 'webgl') {
        return mockWebGLContext;
      }
      return null;
    });

    document.body.appendChild(canvas);

    // Create renderer
    renderer = new Renderer(canvas);

    // Create launch animation
    launchAnim = new LaunchAnim(renderer);
  });

  afterEach(() => {
    if (launchAnim) {
      launchAnim.destroy();
    }
    if (renderer) {
      renderer.destroy();
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('should throw error if renderer is not provided', () => {
      expect(() => {
        new LaunchAnim(null);
      }).toThrow('Renderer is required for LaunchAnim initialization');
    });

    test('should initialize with valid renderer', () => {
      expect(launchAnim).toBeDefined();
      expect(launchAnim.renderer).toBe(renderer);
      expect(launchAnim.context).toBe(mockWebGLContext);
      expect(launchAnim.isPlaying).toBe(false);
      expect(launchAnim.currentPhase).toBe('idle');
    });

    test('should initialize rocket properties', () => {
      expect(launchAnim.rocket).toBeDefined();
      expect(launchAnim.rocket.x).toBe(400); // canvas width / 2
      expect(launchAnim.rocket.y).toBe(500); // canvas height - 100
      expect(launchAnim.rocket.width).toBe(40);
      expect(launchAnim.rocket.height).toBe(120);
      expect(launchAnim.rocket.velocityY).toBe(0);
      expect(launchAnim.rocket.thrust).toBe(false);
    });

    test('should initialize empty particle arrays', () => {
      expect(launchAnim.particles).toEqual([]);
      expect(launchAnim.exhaustParticles).toEqual([]);
      expect(launchAnim.explosionParticles).toEqual([]);
    });

    test('should create shader programs', () => {
      expect(mockWebGLContext.createProgram).toHaveBeenCalledTimes(2); // rocket + particle shaders
      expect(launchAnim.shaderProgram).toBeDefined();
      expect(launchAnim.particleShaderProgram).toBeDefined();
    });
  });

  describe('launch control', () => {
    test('should start launch with success outcome', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      launchAnim.startLaunch('success');

      expect(launchAnim.isPlaying).toBe(true);
      expect(launchAnim.currentPhase).toBe('ignition');
      expect(launchAnim.launchOutcome).toBe('success');
      expect(launchAnim.rocket.thrust).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Starting rocket launch with outcome: success');

      consoleSpy.mockRestore();
    });

    test('should start launch with failure outcome', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      launchAnim.startLaunch('failure');

      expect(launchAnim.isPlaying).toBe(true);
      expect(launchAnim.currentPhase).toBe('ignition');
      expect(launchAnim.launchOutcome).toBe('failure');
      expect(consoleSpy).toHaveBeenCalledWith('Starting rocket launch with outcome: failure');

      consoleSpy.mockRestore();
    });

    test('should reset rocket position on launch start', () => {
      // Move rocket first
      launchAnim.rocket.y = 100;
      launchAnim.rocket.velocityY = -50;

      launchAnim.startLaunch();

      expect(launchAnim.rocket.x).toBe(400);
      expect(launchAnim.rocket.y).toBe(500);
      expect(launchAnim.rocket.velocityY).toBe(0);
    });

    test('should clear existing particles on launch start', () => {
      // Add some particles first
      launchAnim.exhaustParticles.push({ test: 'particle' });
      launchAnim.explosionParticles.push({ test: 'explosion' });

      launchAnim.startLaunch();

      expect(launchAnim.exhaustParticles).toHaveLength(0);
      expect(launchAnim.explosionParticles).toHaveLength(0);
    });

    test('should stop animation', () => {
      launchAnim.startLaunch();
      expect(launchAnim.isPlaying).toBe(true);

      launchAnim.stop();

      expect(launchAnim.isPlaying).toBe(false);
      expect(launchAnim.currentPhase).toBe('idle');
      expect(launchAnim.particles).toHaveLength(0);
      expect(launchAnim.exhaustParticles).toHaveLength(0);
      expect(launchAnim.explosionParticles).toHaveLength(0);
    });
  });

  describe('animation phases', () => {
    beforeEach(() => {
      // Mock performance.now to control time
      jest.spyOn(performance, 'now')
        .mockReturnValueOnce(1000) // startTime
        .mockReturnValue(1000); // currentTime in update calls
    });

    afterEach(() => {
      performance.now.mockRestore();
    });

    test('should progress through phases correctly', () => {
      launchAnim.startLaunch();

      // Test ignition phase (0-10% progress)
      performance.now.mockReturnValue(1500); // 500ms elapsed (6.25% of 8000ms)
      launchAnim.update(0.016);
      expect(launchAnim.currentPhase).toBe('ignition');

      // Test liftoff phase (10-30% progress)
      performance.now.mockReturnValue(2000); // 1000ms elapsed (12.5% progress)
      launchAnim.update(0.016);
      expect(launchAnim.currentPhase).toBe('liftoff');

      // Test flight phase (30-80% progress)
      performance.now.mockReturnValue(4000); // 3000ms elapsed (37.5% progress)
      launchAnim.update(0.016);
      expect(launchAnim.currentPhase).toBe('flight');

      // Test success phase (80%+ progress)
      performance.now.mockReturnValue(7500); // 6500ms elapsed (81.25% progress)
      launchAnim.update(0.016);
      expect(launchAnim.currentPhase).toBe('success');
    });

    test('should complete animation after full duration', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      launchAnim.startLaunch();

      // Simulate full animation duration
      performance.now.mockReturnValue(9000); // 8000ms elapsed (100% progress)
      launchAnim.update(0.016);

      expect(launchAnim.isPlaying).toBe(false);
      expect(launchAnim.currentPhase).toBe('complete');
      expect(consoleSpy).toHaveBeenCalledWith('Launch animation completed with outcome: success');

      consoleSpy.mockRestore();
    });
  });

  describe('particle effects', () => {
    test('should generate exhaust particles during ignition', () => {
      launchAnim.startLaunch();
      launchAnim.currentPhase = 'ignition';

      const initialCount = launchAnim.exhaustParticles.length;
      launchAnim.updateRocket(0.016);

      expect(launchAnim.exhaustParticles.length).toBeGreaterThan(initialCount);
    });

    test('should generate exhaust particles during liftoff', () => {
      launchAnim.startLaunch();
      launchAnim.currentPhase = 'liftoff';

      const initialCount = launchAnim.exhaustParticles.length;
      launchAnim.updateRocket(0.016);

      expect(launchAnim.exhaustParticles.length).toBeGreaterThan(initialCount);
      expect(launchAnim.rocket.velocityY).toBe(-50);
    });

    test('should generate explosion particles during failure', () => {
      launchAnim.startLaunch('failure');
      launchAnim.currentPhase = 'failure';

      const initialCount = launchAnim.explosionParticles.length;
      launchAnim.updateRocket(0.016);

      expect(launchAnim.explosionParticles.length).toBeGreaterThan(initialCount);
      expect(launchAnim.rocket.thrust).toBe(false);
    });

    test('should update particle life and remove dead particles', () => {
      // Add a particle with low life
      launchAnim.exhaustParticles.push({
        x: 100,
        y: 100,
        velocityX: 0,
        velocityY: 0,
        life: 0.01, // Very low life
        decay: 2,
        size: 5,
        color: { r: 1, g: 1, b: 1, a: 1 }
      });

      const initialCount = launchAnim.exhaustParticles.length;
      launchAnim.updateParticles(0.1); // Large deltaTime to kill particle

      expect(launchAnim.exhaustParticles.length).toBe(initialCount - 1);
    });
  });

  describe('rendering', () => {
    test('should not render when not playing', () => {
      launchAnim.render();

      // Should not call any WebGL draw commands
      expect(mockWebGLContext.drawArrays).not.toHaveBeenCalled();
    });

    test('should render rocket when playing', () => {
      launchAnim.startLaunch();
      launchAnim.render();

      expect(mockWebGLContext.useProgram).toHaveBeenCalled();
      expect(mockWebGLContext.drawArrays).toHaveBeenCalledWith(mockWebGLContext.TRIANGLES, 0, 18);
    });

    test('should render particles when present', () => {
      launchAnim.startLaunch();

      // Add some particles
      launchAnim.exhaustParticles.push({
        x: 100, y: 100, size: 5,
        color: { r: 1, g: 0, b: 0, a: 0.8 }
      });

      launchAnim.render();

      expect(mockWebGLContext.drawArrays).toHaveBeenCalledWith(mockWebGLContext.POINTS, 1);
    });
  });

  describe('state queries', () => {
    test('should return correct animation playing state', () => {
      expect(launchAnim.isAnimationPlaying()).toBe(false);

      launchAnim.startLaunch();
      expect(launchAnim.isAnimationPlaying()).toBe(true);

      launchAnim.stop();
      expect(launchAnim.isAnimationPlaying()).toBe(false);
    });

    test('should return current phase', () => {
      expect(launchAnim.getCurrentPhase()).toBe('idle');

      launchAnim.startLaunch();
      expect(launchAnim.getCurrentPhase()).toBe('ignition');
    });

    test('should return launch outcome', () => {
      expect(launchAnim.getLaunchOutcome()).toBeNull();

      launchAnim.startLaunch('failure');
      expect(launchAnim.getLaunchOutcome()).toBe('failure');
    });
  });

  describe('cleanup', () => {
    test('should clean up resources on destroy', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      launchAnim.destroy();

      expect(mockWebGLContext.deleteProgram).toHaveBeenCalledTimes(2); // rocket + particle shaders
      expect(mockWebGLContext.deleteBuffer).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('LaunchAnim destroyed');

      consoleSpy.mockRestore();
    });

    test('should stop animation on destroy', () => {
      launchAnim.startLaunch();
      expect(launchAnim.isPlaying).toBe(true);

      launchAnim.destroy();
      expect(launchAnim.isPlaying).toBe(false);
    });
  });
});