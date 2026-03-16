/**
 * Jest Setup File for WebGL Mocking
 * 
 * Mocks the WebGL context for tests running in jsdom environment
 */

// Create a mock WebGL context
function createMockWebGLContext() {
  return {
    // Basic WebGL context methods
    enable: () => {},
    disable: () => {},
    blendFunc: () => {},
    viewport: () => {},
    clearColor: () => {},
    clear: () => {},
    createProgram: () => ({}),
    createShader: () => ({}),
    attachShader: () => {},
    linkProgram: () => {},
    shaderSource: () => {},
    compileShader: () => {},
    getProgramParameter: () => true,
    getShaderParameter: () => true,
    getProgramInfoLog: () => '',
    getShaderInfoLog: () => '',
    deleteProgram: () => {},
    deleteShader: () => {},
    createBuffer: () => ({}),
    bindBuffer: () => {},
    bufferData: () => {},
    getSupportedExtensions: () => [],
    getParameter: function(param) {
      if (param === 0x0BA6) { // VIEWPORT
        return [0, 0, 800, 600];
      }
      return null;
    },
    // Capabilities
    BLEND: 3042,
    SRC_ALPHA: 0x0302,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    ARRAY_BUFFER: 34962,
    ELEMENT_ARRAY_BUFFER: 34963,
    STATIC_DRAW: 35044,
    COLOR_BUFFER_BIT: 16384,
    DEPTH_BUFFER_BIT: 256,
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    LINK_STATUS: 35714,
    COMPILE_STATUS: 35713,
  };
}

// Mock canvas getContext to return a WebGL context
HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === 'webgl2' || contextType === 'webgl') {
    return createMockWebGLContext();
  }
  return null;
};

// Mock window.requestAnimationFrame if needed
if (typeof window.requestAnimationFrame === 'undefined') {
  window.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 1000 / 60);
  };
}

// Mock window.cancelAnimationFrame if needed
if (typeof window.cancelAnimationFrame === 'undefined') {
  window.cancelAnimationFrame = (id) => {
    clearTimeout(id);
  };
}

// Mock performance.now if needed
if (typeof performance.now === 'undefined') {
  performance.now = () => Date.now();
}
