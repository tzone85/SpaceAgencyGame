/**
 * WebGL Mocking Setup
 * Provides mock WebGL context for testing
 */

// Mock Canvas context
HTMLCanvasElement.prototype.getContext = function(contextId) {
  if (contextId === 'webgl' || contextId === 'webgl2') {
    const mockFn = (fn) => fn;
    return {
      clear: mockFn(() => {}),
      clearColor: mockFn(() => {}),
      enable: mockFn(() => {}),
      disable: mockFn(() => {}),
      viewport: mockFn(() => {}),
      useProgram: mockFn(() => {}),
      createProgram: mockFn(() => ({})),
      createShader: mockFn(() => ({})),
      shaderSource: mockFn(() => {}),
      compileShader: mockFn(() => {}),
      attachShader: mockFn(() => {}),
      linkProgram: mockFn(() => {}),
      getUniformLocation: mockFn(() => ({})),
      uniform1f: mockFn(() => {}),
      uniform2f: mockFn(() => {}),
      uniform3f: mockFn(() => {}),
      uniform4f: mockFn(() => {}),
      uniformMatrix4fv: mockFn(() => {}),
      COLOR_BUFFER_BIT: 0x4000,
      DEPTH_BUFFER_BIT: 0x100,
    };
  }
  return null;
};

// Mock window.requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};

// Mock performance API
global.performance = {
  now: () => Date.now(),
};
