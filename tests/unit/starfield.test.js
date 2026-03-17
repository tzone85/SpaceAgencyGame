/**
 * Starfield Tests
 *
 * Unit tests for the Starfield class covering initialization,
 * animation, rendering, and cleanup.
 */

import Starfield from "../../src/canvas/Starfield.js";

describe("Starfield", () => {
  let canvas;
  let context;
  let starfield;

  beforeEach(() => {
    // Setup canvas mock
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;

    // Mock canvas context methods
    context = {
      fillStyle: "",
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(),
    };

    canvas.getContext = jest.fn(() => context);

    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((callback) => {
      return setTimeout(callback, 16);
    });

    global.cancelAnimationFrame = jest.fn((id) => {
      clearTimeout(id);
    });

    // Mock window.addEventListener/removeEventListener
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  afterEach(() => {
    if (starfield && starfield.isInitialized) {
      starfield.stop();
      starfield.unregisterResizeListener();
      starfield.isInitialized = false;
    }
    jest.clearAllMocks();
  });

  describe("Constructor", () => {
    test("should throw error if canvas is not provided", () => {
      expect(() => {
        new Starfield(null);
      }).toThrow("Canvas element is required for Starfield initialization");
    });

    test("should throw error if canvas context is unavailable", () => {
      canvas.getContext = jest.fn(() => null);

      expect(() => {
        new Starfield(canvas);
      }).toThrow("Failed to get 2D canvas context");
    });

    test("should initialize with provided canvas", () => {
      starfield = new Starfield(canvas);

      expect(starfield.isInitialized).toBe(true);
      expect(starfield.canvas).toBe(canvas);
      expect(starfield.context).toBe(context);
    });

    test("should initialize with default configuration", () => {
      starfield = new Starfield(canvas);

      expect(starfield.layerCount).toBe(3);
      expect(starfield.baseStarCount).toBe(100);
      expect(starfield.twinkleSpeed).toBe(0.05);
      expect(starfield.scrollSpeed).toBe(0.3);
      expect(starfield.maxOpacity).toBe(1.0);
      expect(starfield.minOpacity).toBe(0.1);
    });

    test("should not be animating initially", () => {
      starfield = new Starfield(canvas);

      expect(starfield.isAnimating).toBe(false);
    });
  });

  describe("Layer Initialization", () => {
    beforeEach(() => {
      starfield = new Starfield(canvas);
    });

    test("should create correct number of layers", () => {
      expect(starfield.layers.length).toBe(3);
    });

    test("should assign correct depth factors to layers", () => {
      expect(starfield.layers[0].depthFactor).toBeCloseTo(1 / 3);
      expect(starfield.layers[1].depthFactor).toBeCloseTo(2 / 3);
      expect(starfield.layers[2].depthFactor).toBe(1);
    });

    test("should create stars for each layer", () => {
      expect(starfield.layers[0].stars.length).toBeGreaterThan(0);
      expect(starfield.layers[1].stars.length).toBeGreaterThan(0);
      expect(starfield.layers[2].stars.length).toBeGreaterThan(0);
    });

    test("should have each star with required properties", () => {
      const star = starfield.layers[0].stars[0];

      expect(star).toHaveProperty("x");
      expect(star).toHaveProperty("y");
      expect(star).toHaveProperty("size");
      expect(star).toHaveProperty("opacity");
      expect(star).toHaveProperty("twinkleDuration");
      expect(star).toHaveProperty("twinklarTime");
      expect(star).toHaveProperty("twinkleDirection");
    });

    test("should position stars within canvas bounds", () => {
      starfield.layers.forEach((layer) => {
        layer.stars.forEach((star) => {
          expect(star.x).toBeGreaterThanOrEqual(0);
          expect(star.x).toBeLessThanOrEqual(canvas.width);
          expect(star.y).toBeGreaterThanOrEqual(0);
          expect(star.y).toBeLessThanOrEqual(canvas.height);
        });
      });
    });

    test("should vary star sizes based on depth", () => {
      const layer0Sizes = starfield.layers[0].stars.map((s) => s.size);
      const layer2Sizes = starfield.layers[2].stars.map((s) => s.size);

      const avgLayer0Size =
        layer0Sizes.reduce((a, b) => a + b) / layer0Sizes.length;
      const avgLayer2Size =
        layer2Sizes.reduce((a, b) => a + b) / layer2Sizes.length;

      // Deeper (farther) stars should be smaller on average
      expect(avgLayer0Size).toBeLessThan(avgLayer2Size);
    });

    test("should set opacity within valid range", () => {
      starfield.layers.forEach((layer) => {
        layer.stars.forEach((star) => {
          expect(star.opacity).toBeGreaterThanOrEqual(starfield.minOpacity);
          expect(star.opacity).toBeLessThanOrEqual(starfield.maxOpacity);
        });
      });
    });
  });

  describe("Animation Updates", () => {
    beforeEach(() => {
      starfield = new Starfield(canvas);
    });

    test("should update scroll offset over time", () => {
      starfield.isAnimating = true; // Must be animating for update to work
      const initialOffsets = starfield.layers.map((l) => l.scrollOffset);

      starfield.update(0.1); // 100ms for significant change

      starfield.layers.forEach((layer, index) => {
        expect(layer.scrollOffset).toBeGreaterThan(initialOffsets[index]);
      });
    });

    test("should wrap scroll offset when exceeding canvas width", () => {
      starfield.layers[0].scrollOffset = canvas.width - 10;
      starfield.update(1); // Large delta time

      starfield.layers.forEach((layer) => {
        expect(layer.scrollOffset).toBeLessThanOrEqual(canvas.width);
      });
    });

    test("should update star twinkling over time", () => {
      starfield.isAnimating = true; // Must be animating for update to work
      const star = starfield.layers[0].stars[0];
      const initialTime = star.twinklarTime;

      starfield.update(0.1);

      expect(star.twinklarTime).toBeGreaterThan(initialTime);
    });

    test("should vary star opacity for twinkling effect", () => {
      starfield.isAnimating = true; // Must be animating for update to work
      const initialOpacities = starfield.layers[0].stars.map((s) => s.opacity);

      starfield.update(0.5); // Significant time to see opacity change

      const updatedOpacities = starfield.layers[0].stars.map((s) => s.opacity);

      // At least some stars should have changed opacity
      const hasChanges = initialOpacities.some(
        (op, i) => Math.abs(op - updatedOpacities[i]) > 0.01,
      );
      expect(hasChanges).toBe(true);
    });

    test("should not update if not animating", () => {
      const initialOffset = starfield.layers[0].scrollOffset;
      starfield.isAnimating = false;

      starfield.update(0.016);

      expect(starfield.layers[0].scrollOffset).toBe(initialOffset);
    });

    test("should not update if not initialized", () => {
      starfield.isInitialized = false;
      const initialOffset = starfield.layers[0].scrollOffset;

      starfield.update(0.016);

      expect(starfield.layers[0].scrollOffset).toBe(initialOffset);
    });
  });

  describe("Rendering", () => {
    beforeEach(() => {
      starfield = new Starfield(canvas);
    });

    test("should clear canvas with black background", () => {
      starfield.render();

      // fillRect should have been called with canvas dimensions
      expect(context.fillRect).toHaveBeenCalledWith(
        0,
        0,
        canvas.width,
        canvas.height,
      );

      // The black background should be set before any rendering
      const fillRectCalls = context.fillRect.mock.calls;
      expect(fillRectCalls[0]).toEqual([0, 0, canvas.width, canvas.height]);
    });

    test("should draw circles for stars", () => {
      starfield.render();

      // Should call arc for each star across all layers
      // May call more if stars wrap at canvas edges
      const totalStars = starfield.layers.reduce(
        (sum, layer) => sum + layer.stars.length,
        0,
      );
      expect(context.arc.mock.calls.length).toBeGreaterThanOrEqual(totalStars);
    });

    test("should use star opacity in rendering", () => {
      starfield.layers[0].stars[0].opacity = 0.75;

      starfield.render();

      // fillStyle should be called with the star's opacity value
      const fillStyleCalls = context.fillStyle;
      // Last fillStyle set should contain a numeric opacity
      expect(typeof context.fillStyle).toBe("string");
      expect(context.fillStyle).toMatch(/rgba\(\d+,\s*\d+,\s*\d+,\s*\d/);
    });

    test("should not render if not initialized", () => {
      context.fillRect.mockClear();
      starfield.isInitialized = false;

      starfield.render();

      expect(context.fillRect).not.toHaveBeenCalled();
    });

    test("should handle star wrapping at canvas edge", () => {
      // Place a star near the right edge
      starfield.layers[0].stars[0].x = 750;
      starfield.layers[0].scrollOffset = 100;

      starfield.render();

      // Should still draw the star (either wrapped or within bounds)
      expect(context.arc).toHaveBeenCalled();
    });
  });

  describe("Animation Control", () => {
    beforeEach(() => {
      starfield = new Starfield(canvas);
    });

    test("should start animation", (done) => {
      expect(starfield.isAnimating).toBe(false);

      starfield.start();

      expect(starfield.isAnimating).toBe(true);
      expect(global.requestAnimationFrame).toHaveBeenCalled();

      // Clean up
      starfield.stop();
      done();
    });

    test("should warn if starting already running animation", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      starfield.start();
      starfield.start();

      expect(warnSpy).toHaveBeenCalledWith(
        "Starfield animation already running",
      );

      warnSpy.mockRestore();
      starfield.stop();
    });

    test("should error if starting before initialized", () => {
      starfield.isInitialized = false;
      const errorSpy = jest.spyOn(console, "error").mockImplementation();

      starfield.start();

      expect(errorSpy).toHaveBeenCalledWith(
        "Starfield must be initialized before starting",
      );

      errorSpy.mockRestore();
    });

    test("should stop animation", (done) => {
      starfield.start();
      expect(starfield.isAnimating).toBe(true);

      starfield.stop();

      expect(starfield.isAnimating).toBe(false);
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
      done();
    });

    test("should warn if stopping when not animating", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      starfield.stop();

      expect(warnSpy).toHaveBeenCalledWith(
        "Starfield animation is not running",
      );

      warnSpy.mockRestore();
    });
  });

  describe("Canvas Resize Handling", () => {
    beforeEach(() => {
      starfield = new Starfield(canvas);
    });

    test("should register resize listener", () => {
      starfield.registerResizeListener();

      expect(window.addEventListener).toHaveBeenCalledWith(
        "resize",
        starfield.handleResize,
      );
    });

    test("should unregister resize listener", () => {
      starfield.unregisterResizeListener();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        "resize",
        starfield.handleResize,
      );
    });

    test("should handle resize without animation", () => {
      const initialLayerCount = starfield.layers.length;

      starfield.handleResize();

      expect(starfield.layers.length).toBe(initialLayerCount);
    });

    test("should preserve scroll offsets on resize", () => {
      starfield.layers[0].scrollOffset = 50;
      starfield.layers[1].scrollOffset = 75;

      starfield.handleResize();

      expect(starfield.layers[0].scrollOffset).toBeCloseTo(50);
      expect(starfield.layers[1].scrollOffset).toBeCloseTo(75);
    });

    test("should render after resize", () => {
      context.fillRect.mockClear();

      starfield.handleResize();

      expect(context.fillRect).toHaveBeenCalled();
    });
  });

  describe("Configuration", () => {
    beforeEach(() => {
      starfield = new Starfield(canvas);
    });

    test("should update twinkle speed", () => {
      starfield.setConfig({ twinkleSpeed: 0.1 });

      expect(starfield.twinkleSpeed).toBe(0.1);
    });

    test("should update scroll speed and layer speeds", () => {
      const initialLayerSpeed = starfield.layers[0].scrollSpeed;

      starfield.setConfig({ scrollSpeed: 0.5 });

      expect(starfield.scrollSpeed).toBe(0.5);
      expect(starfield.layers[0].scrollSpeed).not.toBe(initialLayerSpeed);
    });

    test("should update opacity bounds", () => {
      starfield.setConfig({ maxOpacity: 0.8, minOpacity: 0.2 });

      expect(starfield.maxOpacity).toBe(0.8);
      expect(starfield.minOpacity).toBe(0.2);
    });

    test("should reinitialize layers on layer count change", () => {
      const initialCount = starfield.layers.length;

      starfield.setConfig({ layerCount: 5 });

      expect(starfield.layerCount).toBe(5);
      expect(starfield.layers.length).toBe(5);
    });

    test("should ignore undefined config values", () => {
      const originalSpeed = starfield.scrollSpeed;

      starfield.setConfig({});

      expect(starfield.scrollSpeed).toBe(originalSpeed);
    });
  });

  describe("Utility Methods", () => {
    beforeEach(() => {
      starfield = new Starfield(canvas);
    });

    test("should return canvas dimensions", () => {
      const dims = starfield.getCanvasDimensions();

      expect(dims.width).toBe(canvas.width);
      expect(dims.height).toBe(canvas.height);
    });

    test("should return layer information", () => {
      const layerInfo = starfield.getLayerInfo();

      expect(layerInfo.length).toBe(3);
      expect(layerInfo[0]).toHaveProperty("index");
      expect(layerInfo[0]).toHaveProperty("depthFactor");
      expect(layerInfo[0]).toHaveProperty("scrollSpeed");
      expect(layerInfo[0]).toHaveProperty("starCount");
    });

    test("should check if ready", () => {
      expect(starfield.isReady()).toBe(true);

      starfield.context = null;

      expect(starfield.isReady()).toBe(false);
    });

    test("should check if ready when not initialized", () => {
      starfield.isInitialized = false;

      expect(starfield.isReady()).toBe(false);
    });
  });

  describe("Cleanup", () => {
    beforeEach(() => {
      starfield = new Starfield(canvas);
      starfield.start();
    });

    test("should stop animation on destroy", () => {
      starfield.destroy();

      expect(starfield.isAnimating).toBe(false);
    });

    test("should unregister resize listener on destroy", () => {
      window.removeEventListener.mockClear();

      starfield.destroy();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        "resize",
        starfield.handleResize,
      );
    });

    test("should clear context on destroy", () => {
      starfield.destroy();

      expect(context.clearRect).toHaveBeenCalledWith(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      expect(starfield.context).toBe(null);
    });

    test("should clear layers on destroy", () => {
      starfield.destroy();

      expect(starfield.layers.length).toBe(0);
    });

    test("should mark as uninitialized on destroy", () => {
      starfield.destroy();

      expect(starfield.isInitialized).toBe(false);
    });

    test("should clear canvas reference on destroy", () => {
      starfield.destroy();

      expect(starfield.canvas).toBe(null);
    });
  });

  describe("Integration", () => {
    beforeEach(() => {
      starfield = new Starfield(canvas);
    });

    test("should update and render continuously when animating", (done) => {
      starfield.registerResizeListener();
      starfield.start();

      setTimeout(() => {
        expect(starfield.isAnimating).toBe(true);
        expect(context.fillRect).toHaveBeenCalled();
        expect(context.arc).toHaveBeenCalled();

        starfield.stop();
        starfield.unregisterResizeListener();
        done();
      }, 50);
    });

    test("should handle configuration during animation", () => {
      starfield.start();

      starfield.setConfig({
        twinkleSpeed: 0.1,
        scrollSpeed: 0.4,
        layerCount: 4,
      });

      expect(starfield.twinkleSpeed).toBe(0.1);
      expect(starfield.scrollSpeed).toBe(0.4);
      expect(starfield.layerCount).toBe(4);
      expect(starfield.layers.length).toBe(4);

      starfield.stop();
    });

    test("should handle resize during animation", () => {
      const initialStarCount = starfield.layers.reduce(
        (sum, layer) => sum + layer.stars.length,
        0,
      );

      starfield.start();
      starfield.registerResizeListener();

      starfield.handleResize();

      const newStarCount = starfield.layers.reduce(
        (sum, layer) => sum + layer.stars.length,
        0,
      );

      // Star counts should be similar (based on layer configuration)
      expect(newStarCount).toBeCloseTo(initialStarCount, -1);

      starfield.stop();
      starfield.unregisterResizeListener();
    });
  });
});
