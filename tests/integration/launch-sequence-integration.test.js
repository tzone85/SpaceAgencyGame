/**
 * Launch Sequence Integration Test
 *
 * Simple integration test to verify the LaunchAnim and LaunchSequence classes
 * can be instantiated and basic methods work without throwing errors.
 */

import LaunchAnim from "../../src/canvas/LaunchAnim.js";
import LaunchSequence from "../../src/scenes/LaunchSequence.js";
import Engine from "../../src/core/engine.js";
import Renderer from "../../src/core/renderer.js";

// Mock DOM environment for Node.js
if (typeof window === "undefined") {
  global.window = {
    innerWidth: 800,
    innerHeight: 600,
  };

  global.document = {
    createTextNode: (text) => ({ textContent: text }),
    createElement: (tag) => {
      const element = {
        id: "",
        style: {},
        width: 0,
        height: 0,
        appendChild: () => {},
        removeChild: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        textContent: "",
        children: [],
        parentNode: null,
        getContext: (type) => {
          // Mock WebGL context
          if (type === "webgl2" || type === "webgl") {
            return {
              VERTEX_SHADER: 35633,
              FRAGMENT_SHADER: 35632,
              ARRAY_BUFFER: 34962,
              STATIC_DRAW: 35044,
              TRIANGLES: 4,
              POINTS: 0,
              FLOAT: 5126,
              COLOR_BUFFER_BIT: 16384,
              DEPTH_BUFFER_BIT: 256,
              BLEND: 3042,
              COMPILE_STATUS: 35713,
              LINK_STATUS: 35714,
              createShader: () => ({}),
              createProgram: () => ({}),
              createBuffer: () => ({}),
              shaderSource: () => {},
              compileShader: () => {},
              attachShader: () => {},
              linkProgram: () => {},
              getShaderParameter: () => true,
              getProgramParameter: () => true,
              getShaderInfoLog: () => "",
              getProgramInfoLog: () => "",
              deleteShader: () => {},
              deleteProgram: () => {},
              deleteBuffer: () => {},
              useProgram: () => {},
              getAttribLocation: () => 0,
              getUniformLocation: () => ({}),
              enableVertexAttribArray: () => {},
              vertexAttribPointer: () => {},
              uniform2f: () => {},
              uniform1f: () => {},
              uniformMatrix3fv: () => {},
              drawArrays: () => {},
              bindBuffer: () => {},
              bufferData: () => {},
              enable: () => {},
              blendFunc: () => {},
              viewport: () => {},
              clearColor: () => {},
              clear: () => {},
            };
          }
          // Mock 2D context
          if (type === "2d") {
            return {
              save: () => {},
              restore: () => {},
              fillStyle: "",
              beginPath: () => {},
              arc: () => {},
              fill: () => {},
              fillRect: () => {},
            };
          }
          return null;
        },
      };
      return element;
    },
    getElementById: (id) => null,
    body: {
      appendChild: () => {},
    },
  };

  global.performance = {
    now: () => Date.now(),
  };

  // Mock AudioContext
  global.AudioContext = function () {
    return {
      state: "running",
      currentTime: 0,
      sampleRate: 44100,
      createOscillator: () => ({
        frequency: { setValueAtTime: () => {} },
        type: "sine",
        connect: () => {},
        start: () => {},
        stop: () => {},
      }),
      createGain: () => ({
        gain: {
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
          linearRampToValueAtTime: () => {},
        },
        connect: () => {},
      }),
      createBuffer: () => ({
        getChannelData: () => new Float32Array(44100),
      }),
      createBufferSource: () => ({
        buffer: null,
        connect: () => {},
        start: () => {},
        stop: () => {},
      }),
      createBiquadFilter: () => ({
        type: "lowpass",
        frequency: { setValueAtTime: () => {} },
        connect: () => {},
      }),
      destination: {},
      resume: () => {},
      close: () => {},
    };
  };

  global.requestAnimationFrame = (callback) => {
    setTimeout(callback, 16);
    return 1;
  };

  global.cancelAnimationFrame = () => {};
}

/**
 * Test runner function
 */
async function runIntegrationTests() {
  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ ${message}`);
      testsPassed++;
    } else {
      console.error(`✗ ${message}`);
      testsFailed++;
    }
  }

  function assertNoThrow(fn, message) {
    try {
      fn();
      console.log(`✓ ${message}`);
      testsPassed++;
    } catch (error) {
      console.error(`✗ ${message}: ${error.message}`);
      testsFailed++;
    }
  }

  console.log("Running Launch Sequence Integration Tests...\n");

  // Test 1: Engine can be instantiated
  let engine;
  assertNoThrow(() => {
    engine = new Engine();
  }, "Engine can be instantiated");

  // Test 2: Engine has expected properties
  assert(engine !== undefined, "Engine instance exists");
  assert(engine.isInitialized === false, "Engine starts uninitialized");

  // Test 3: Renderer can be instantiated with mock canvas
  let renderer;
  assertNoThrow(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    renderer = new Renderer(canvas);
    engine.renderer = renderer;
    engine.canvas = canvas;
  }, "Renderer can be instantiated");

  // Test 4: LaunchAnim can be instantiated
  let launchAnim;
  assertNoThrow(() => {
    launchAnim = new LaunchAnim(renderer);
  }, "LaunchAnim can be instantiated");

  // Test 5: LaunchAnim has expected initial state
  assert(launchAnim.isPlaying === false, "LaunchAnim starts not playing");
  assert(launchAnim.currentPhase === "idle", "LaunchAnim starts in idle phase");
  assert(launchAnim.rocket !== undefined, "LaunchAnim has rocket object");

  // Test 6: LaunchAnim methods work
  assertNoThrow(() => {
    launchAnim.startLaunch("success");
  }, "LaunchAnim.startLaunch() works");

  assert(
    launchAnim.isAnimationPlaying() === true,
    "LaunchAnim reports playing after start",
  );
  assert(
    launchAnim.getCurrentPhase() === "ignition",
    "LaunchAnim phase updates correctly",
  );
  assert(
    launchAnim.getLaunchOutcome() === "success",
    "LaunchAnim outcome set correctly",
  );

  assertNoThrow(() => {
    launchAnim.update(0.016);
  }, "LaunchAnim.update() works");

  assertNoThrow(() => {
    launchAnim.render();
  }, "LaunchAnim.render() works");

  assertNoThrow(() => {
    launchAnim.stop();
  }, "LaunchAnim.stop() works");

  // Test 7: LaunchSequence can be instantiated
  let launchSequence;
  assertNoThrow(() => {
    launchSequence = new LaunchSequence(engine);
  }, "LaunchSequence can be instantiated");

  // Test 8: LaunchSequence has expected initial state
  assert(launchSequence.isActive === false, "LaunchSequence starts inactive");
  assert(
    launchSequence.state === "idle",
    "LaunchSequence starts in idle state",
  );
  assert(
    launchSequence.launchAnim !== undefined,
    "LaunchSequence has LaunchAnim instance",
  );

  // Test 9: LaunchSequence methods work
  assertNoThrow(() => {
    launchSequence.startLaunchSequence(
      {
        name: "Test Mission",
        destination: "Mars",
      },
      "success",
    );
  }, "LaunchSequence.startLaunchSequence() works");

  assert(
    launchSequence.isSceneActive() === true,
    "LaunchSequence reports active after start",
  );
  assert(
    launchSequence.getState() === "countdown",
    "LaunchSequence state updates correctly",
  );

  assertNoThrow(() => {
    launchSequence.update(0.016);
  }, "LaunchSequence.update() works");

  assertNoThrow(() => {
    launchSequence.render();
  }, "LaunchSequence.render() works");

  assertNoThrow(() => {
    launchSequence.setAudioEnabled(false);
  }, "LaunchSequence.setAudioEnabled() works");

  assertNoThrow(() => {
    launchSequence.updateStatusText("Test Status");
  }, "LaunchSequence.updateStatusText() works");

  // Test 10: Cleanup works
  assertNoThrow(() => {
    launchAnim.destroy();
  }, "LaunchAnim.destroy() works");

  assertNoThrow(() => {
    launchSequence.destroy();
  }, "LaunchSequence.destroy() works");

  // Summary
  console.log(`\nTest Results:`);
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log("\n🎉 All integration tests passed!");
    process.exit(0);
  } else {
    console.log("\n❌ Some tests failed!");
    process.exit(1);
  }
}

// Run the tests
runIntegrationTests().catch((error) => {
  console.error("Integration test runner failed:", error);
  process.exit(1);
});
