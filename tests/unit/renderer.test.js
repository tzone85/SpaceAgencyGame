/**
 * Renderer Tests
 *
 * Test suite for the WebGL renderer
 */

import Renderer from '../../src/core/renderer.js';

describe('Renderer', () => {
  let canvas;
  let renderer;

  beforeEach(() => {
    // Create a canvas element for testing
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
  });

  afterEach(() => {
    if (renderer) {
      renderer.destroy();
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });

  describe('initialization', () => {
    test('should throw error if canvas is not provided', () => {
      expect(() => {
        new Renderer(null);
      }).toThrow('Canvas element is required for Renderer initialization');
    });

    test('should initialize with valid canvas', () => {
      renderer = new Renderer(canvas);

      expect(renderer).toBeDefined();
      expect(renderer.canvas).toBe(canvas);
      expect(renderer.isInitialized).toBe(true);
      expect(renderer.context).not.toBeNull();
    });

    test('should have WebGL context', () => {
      renderer = new Renderer(canvas);

      expect(renderer.context).not.toBeNull();
      expect(renderer.isReady()).toBe(true);
    });

    test('should set initial clear color to black', () => {
      renderer = new Renderer(canvas);

      expect(renderer.clearColor).toEqual([0, 0, 0, 1]);
    });

    test('should setup viewport with canvas dimensions', () => {
      renderer = new Renderer(canvas);

      expect(renderer.context.getParameter(renderer.context.VIEWPORT)).toEqual([
        0,
        0,
        canvas.width,
        canvas.height,
      ]);
    });
  });

  describe('clear color', () => {
    test('should set clear color', () => {
      renderer = new Renderer(canvas);

      renderer.setClearColor(1, 0, 0, 0.5);

      expect(renderer.clearColor).toEqual([1, 0, 0, 0.5]);
    });

    test('should default alpha to 1.0 if not provided', () => {
      renderer = new Renderer(canvas);

      renderer.setClearColor(0.5, 0.5, 0.5);

      expect(renderer.clearColor[3]).toBe(1.0);
    });
  });

  describe('clearing', () => {
    test('should clear canvas', () => {
      renderer = new Renderer(canvas);

      expect(() => {
        renderer.clear();
      }).not.toThrow();
    });

    test('should not throw if context is null', () => {
      renderer = new Renderer(canvas);
      renderer.context = null;

      expect(() => {
        renderer.clear();
      }).not.toThrow();
    });
  });

  describe('context access', () => {
    test('should return WebGL context', () => {
      renderer = new Renderer(canvas);

      const context = renderer.getContext();

      expect(context).not.toBeNull();
      expect(context).toBe(renderer.context);
    });
  });

  describe('canvas dimensions', () => {
    test('should return canvas dimensions', () => {
      renderer = new Renderer(canvas);

      const dimensions = renderer.getCanvasDimensions();

      expect(dimensions.width).toBe(800);
      expect(dimensions.height).toBe(600);
    });
  });

  describe('shader programs', () => {
    test('should create a shader program', () => {
      renderer = new Renderer(canvas);

      const vertexShader = `
        attribute vec4 position;
        void main() {
          gl_Position = position;
        }
      `;

      const fragmentShader = `
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
      `;

      const program = renderer.createShaderProgram(vertexShader, fragmentShader);

      expect(program).not.toBeNull();
    });

    test('should return null for invalid shader program', () => {
      renderer = new Renderer(canvas);

      const vertexShader = 'invalid vertex shader';
      const fragmentShader = 'invalid fragment shader';

      const program = renderer.createShaderProgram(vertexShader, fragmentShader);

      expect(program).toBeNull();
    });
  });

  describe('buffer creation', () => {
    test('should create a buffer', () => {
      renderer = new Renderer(canvas);

      const data = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
      const buffer = renderer.createBuffer(data);

      expect(buffer).not.toBeNull();
    });
  });

  describe('isReady', () => {
    test('should return true when ready', () => {
      renderer = new Renderer(canvas);

      expect(renderer.isReady()).toBe(true);
    });

    test('should return false when not initialized', () => {
      renderer = new Renderer(canvas);
      renderer.isInitialized = false;

      expect(renderer.isReady()).toBe(false);
    });

    test('should return false when context is null', () => {
      renderer = new Renderer(canvas);
      renderer.context = null;

      expect(renderer.isReady()).toBe(false);
    });
  });

  describe('cleanup', () => {
    test('should destroy renderer', () => {
      renderer = new Renderer(canvas);

      renderer.destroy();

      expect(renderer.context).toBeNull();
    });

    test('should allow creating new renderer after destroy', () => {
      renderer = new Renderer(canvas);
      renderer.destroy();

      const newRenderer = new Renderer(canvas);

      expect(newRenderer.isInitialized).toBe(true);
      expect(newRenderer.context).not.toBeNull();

      newRenderer.destroy();
    });
  });
});
