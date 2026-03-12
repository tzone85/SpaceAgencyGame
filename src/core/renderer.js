/**
 * Renderer Class
 *
 * Handles WebGL rendering, context management,
 * and basic drawing operations for the game.
 */

class Renderer {
  constructor(canvas) {
    if (!canvas) {
      throw new Error('Canvas element is required for Renderer initialization');
    }

    this.canvas = canvas;
    this.context = null;
    this.clearColor = [0, 0, 0, 1]; // RGBA black
    this.isInitialized = false;

    this.initializeContext();
  }

  /**
   * Initialize the WebGL context
   */
  initializeContext() {
    try {
      // Try to get WebGL 2 context, fallback to WebGL 1
      this.context = this.canvas.getContext('webgl2') ||
                     this.canvas.getContext('webgl');

      if (!this.context) {
        throw new Error('WebGL not supported');
      }

      // Enable basic capabilities
      this.context.enable(this.context.BLEND);
      this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA);

      // Setup viewport
      this.context.viewport(0, 0, this.canvas.width, this.canvas.height);

      this.isInitialized = true;
      console.log('WebGL Renderer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebGL context:', error);
      throw error;
    }
  }

  /**
   * Set the clear color
   */
  setClearColor(r, g, b, a = 1.0) {
    this.clearColor = [r, g, b, a];
    if (this.context) {
      this.context.clearColor(r, g, b, a);
    }
  }

  /**
   * Clear the canvas
   */
  clear() {
    if (!this.context) {
      return;
    }

    this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
  }

  /**
   * Get the WebGL context
   */
  getContext() {
    return this.context;
  }

  /**
   * Get canvas dimensions
   */
  getCanvasDimensions() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  /**
   * Create a shader program
   */
  createShaderProgram(vertexShaderSource, fragmentShaderSource) {
    const vertexShader = this.compileShader(vertexShaderSource, this.context.VERTEX_SHADER);
    const fragmentShader = this.compileShader(fragmentShaderSource, this.context.FRAGMENT_SHADER);

    const program = this.context.createProgram();
    this.context.attachShader(program, vertexShader);
    this.context.attachShader(program, fragmentShader);
    this.context.linkProgram(program);

    if (!this.context.getProgramParameter(program, this.context.LINK_STATUS)) {
      const error = this.context.getProgramInfoLog(program);
      console.error('Shader program linking failed:', error);
      this.context.deleteProgram(program);
      return null;
    }

    this.context.deleteShader(vertexShader);
    this.context.deleteShader(fragmentShader);

    return program;
  }

  /**
   * Compile a single shader
   */
  compileShader(source, type) {
    const shader = this.context.createShader(type);
    this.context.shaderSource(shader, source);
    this.context.compileShader(shader);

    if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
      const error = this.context.getShaderInfoLog(shader);
      console.error('Shader compilation failed:', error);
      this.context.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Create a buffer
   */
  createBuffer(data, target = null) {
    const buffer = this.context.createBuffer();
    const bufferTarget = target || this.context.ARRAY_BUFFER;

    this.context.bindBuffer(bufferTarget, buffer);
    this.context.bufferData(bufferTarget, data, this.context.STATIC_DRAW);

    return buffer;
  }

  /**
   * Cleanup and destroy renderer resources
   */
  destroy() {
    if (this.context) {
      // Get all resources and clean them up
      const extensions = this.context.getSupportedExtensions();
      this.context = null;
    }

    console.log('Renderer destroyed');
  }

  /**
   * Check if renderer is ready
   */
  isReady() {
    return this.isInitialized && this.context !== null;
  }
}

export default Renderer;
