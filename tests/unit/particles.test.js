/**
 * Particles Tests
 *
 * Unit tests for the Particles class covering initialization,
 * particle emission, updates, rendering, and EventBus integration.
 */

import Particles from "../../src/canvas/Particles.js";
import EventBus from "../../src/game/EventBus.js";

describe("Particles", () => {
  let canvas;
  let context;
  let particles;
  let eventBus;

  beforeEach(() => {
    // Setup canvas mock
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;

    // Mock canvas context methods
    context = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      globalAlpha: 1,
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      clearRect: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
    };

    canvas.getContext = jest.fn(() => context);

    // Reset EventBus singleton
    EventBus.reset();
    eventBus = EventBus.getInstance();

    particles = new Particles(canvas);
  });

  afterEach(() => {
    if (particles) {
      particles.destroy();
    }
    EventBus.reset();
    jest.clearAllMocks();
  });

  describe("Constructor", () => {
    test("should throw error if canvas is not provided", () => {
      expect(() => {
        new Particles(null);
      }).toThrow("Canvas element is required for Particles initialization");
    });

    test("should throw error if canvas context is unavailable", () => {
      canvas.getContext = jest.fn(() => null);

      expect(() => {
        new Particles(canvas);
      }).toThrow("Failed to get 2D canvas context");
    });

    test("should initialize with provided canvas", () => {
      expect(particles.canvas).toBe(canvas);
      expect(particles.context).toBe(context);
    });

    test("should initialize with empty particles array", () => {
      expect(particles.particles).toEqual([]);
    });

    test("should initialize with inactive state", () => {
      expect(particles.isActive).toBe(false);
    });

    test("should setup EventBus listener", () => {
      expect(eventBus.hasListeners("animation:particles")).toBe(true);
    });
  });

  describe("Emit Particles", () => {
    test("should emit particles at specified position", () => {
      particles.emit(100, 150, { count: 5 });

      expect(particles.particles.length).toBe(5);
    });

    test("should emit with default configuration", () => {
      particles.emit(100, 100);

      expect(particles.particles.length).toBe(10); // Default count
      const particle = particles.particles[0];
      expect(particle.x).toBe(100);
      expect(particle.y).toBe(100);
      expect(particle.size).toBe(3); // Default size
      expect(particle.lifetime).toBe(1); // Default lifetime
    });

    test("should emit with custom configuration", () => {
      const config = {
        count: 20,
        color: "rgba(255, 0, 0, 1)",
        size: 5,
        lifetime: 2,
        velocitySpread: 2,
      };

      particles.emit(100, 100, config);

      expect(particles.particles.length).toBe(20);
      const particle = particles.particles[0];
      expect(particle.size).toBe(5);
      expect(particle.lifetime).toBe(2);
      expect(particle.color).toContain("255, 0, 0");
    });

    test("should emit particles with varied velocities", () => {
      particles.emit(100, 100, { count: 5, velocitySpread: 5 });

      const velocities = particles.particles.map(
        (p) => Math.sqrt(p.vx * p.vx + p.vy * p.vy),
      );
      const allSame = velocities.every((v) => v === velocities[0]);

      expect(allSame).toBe(false); // Should have variation
    });

    test("should calculate velocity based on angle and spread", () => {
      particles.emit(100, 100, {
        count: 1,
        angle: 0,
        angleSpread: 0,
      });

      const particle = particles.particles[0];
      // Should move primarily in positive X direction
      expect(particle.vx).toBeGreaterThan(0);
    });
  });

  describe("Update Particles", () => {
    test("should not update if inactive", () => {
      particles.emit(100, 100, { count: 1 });
      const initialX = particles.particles[0].x;
      particles.isActive = false;

      particles.update(0.1);

      expect(particles.particles[0].x).toBe(initialX);
    });

    test("should update particle positions", () => {
      particles.emit(100, 100, { count: 1, velocitySpread: 1 });
      particles.isActive = true;
      const initialX = particles.particles[0].x;

      particles.update(0.1);

      expect(particles.particles[0].x).not.toBe(initialX);
    });

    test("should increase particle age", () => {
      particles.emit(100, 100, { count: 1 });
      particles.isActive = true;

      particles.update(0.1);

      expect(particles.particles[0].age).toBeCloseTo(0.1);
    });

    test("should apply gravity to particles", () => {
      particles.emit(100, 100, { count: 1, velocitySpread: 0 });
      particles.isActive = true;
      const initialVy = particles.particles[0].vy;

      particles.update(0.1);

      expect(particles.particles[0].vy).toBeGreaterThan(initialVy);
    });

    test("should remove expired particles", () => {
      particles.emit(100, 100, { count: 1, lifetime: 0.05 });
      particles.isActive = true;

      particles.update(0.1); // Age > lifetime

      expect(particles.particles.length).toBe(0);
    });

    test("should handle multiple particles correctly", () => {
      particles.emit(100, 100, { count: 10 });
      particles.isActive = true;

      particles.update(0.05);

      expect(particles.particles.length).toBe(10);
      expect(
        particles.particles.every((p) => p.age > 0 && p.age < p.lifetime),
      ).toBe(true);
    });
  });

  describe("Render Particles", () => {
    test("should render particles with arc", () => {
      particles.emit(100, 100, { count: 1 });

      particles.render(context);

      expect(context.beginPath).toHaveBeenCalled();
      expect(context.arc).toHaveBeenCalled();
      expect(context.fill).toHaveBeenCalled();
    });

    test("should apply opacity based on lifetime", () => {
      particles.emit(100, 100, { count: 1, lifetime: 1 });
      particles.particles[0].age = 0.5; // 50% through lifetime

      particles.render(context);

      // Should have been called with an rgba color
      expect(typeof context.fillStyle).toBe("string");
      expect(context.fillStyle).toMatch(/rgba/);
    });

    test("should render using provided context", () => {
      const customContext = {
        fillStyle: "",
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        globalAlpha: 1,
      };

      particles.emit(100, 100, { count: 1 });
      particles.render(customContext);

      expect(customContext.beginPath).toHaveBeenCalled();
      expect(customContext.arc).toHaveBeenCalled();
      expect(customContext.fill).toHaveBeenCalled();
    });

    test("should not render if no particles", () => {
      context.arc.mockClear();

      particles.render(context);

      expect(context.arc).not.toHaveBeenCalled();
    });

    test("should handle hex colors", () => {
      particles.emit(100, 100, { count: 1, color: "#FF0000" });

      particles.render(context);

      expect(context.globalAlpha).toBeDefined();
    });
  });

  describe("Activation Control", () => {
    test("should activate particle system", () => {
      particles.activate();

      expect(particles.isActive).toBe(true);
    });

    test("should deactivate particle system", () => {
      particles.activate();
      particles.deactivate();

      expect(particles.isActive).toBe(false);
    });

    test("should not update when inactive", () => {
      particles.emit(100, 100, { count: 1 });
      const initialX = particles.particles[0].x;

      particles.deactivate();
      particles.update(0.1);

      expect(particles.particles[0].x).toBe(initialX);
    });
  });

  describe("EventBus Integration", () => {
    test("should listen to animation:particles event", () => {
      expect(eventBus.hasListeners("animation:particles")).toBe(true);
    });

    test("should emit particles on animation:particles event", () => {
      eventBus.emit("animation:particles", {
        type: "emit",
        x: 100,
        y: 100,
        config: { count: 5 },
      });

      expect(particles.particles.length).toBe(5);
    });

    test("should clear particles on clear event", () => {
      particles.emit(100, 100, { count: 10 });

      eventBus.emit("animation:particles", { type: "clear" });

      expect(particles.particles.length).toBe(0);
    });

    test("should ignore invalid event data", () => {
      const initialCount = particles.particles.length;

      eventBus.emit("animation:particles", { type: "invalid" });

      expect(particles.particles.length).toBe(initialCount);
    });

    test("should handle missing data in event", () => {
      expect(() => {
        eventBus.emit("animation:particles", { type: "emit" });
      }).not.toThrow();
    });
  });

  describe("Utility Methods", () => {
    test("should get particle count", () => {
      particles.emit(100, 100, { count: 15 });

      expect(particles.getParticleCount()).toBe(15);
    });

    test("should clear all particles", () => {
      particles.emit(100, 100, { count: 10 });

      particles.clear();

      expect(particles.particles.length).toBe(0);
      expect(particles.emitters.length).toBe(0);
    });
  });

  describe("Cleanup", () => {
    test("should unsubscribe from EventBus on destroy", () => {
      particles.destroy();

      expect(eventBus.hasListeners("animation:particles")).toBe(false);
    });

    test("should clear all particles on destroy", () => {
      particles.emit(100, 100, { count: 10 });

      particles.destroy();

      expect(particles.particles.length).toBe(0);
    });

    test("should clear context reference on destroy", () => {
      particles.destroy();

      expect(particles.context).toBe(null);
      expect(particles.canvas).toBe(null);
    });

    test("should set inactive on destroy", () => {
      particles.activate();

      particles.destroy();

      expect(particles.isActive).toBe(false);
    });
  });

  describe("Integration", () => {
    test("should handle rapid particle emissions", () => {
      for (let i = 0; i < 10; i++) {
        particles.emit(100 + i * 10, 100, { count: 5 });
      }

      expect(particles.particles.length).toBe(50);
    });

    test("should maintain particle properties through update cycles", () => {
      particles.activate();
      particles.emit(100, 100, { count: 1, lifetime: 1 });

      for (let i = 0; i < 10; i++) {
        particles.update(0.01);
      }

      expect(particles.particles.length).toBe(1);
      expect(particles.particles[0].age).toBeCloseTo(0.1);
    });

    test("should handle emission and rendering together", () => {
      particles.activate();
      particles.emit(100, 100, { count: 5 });
      particles.update(0.05);

      particles.render(context);

      expect(context.beginPath).toHaveBeenCalled();
      expect(context.arc).toHaveBeenCalled();
    });
  });
});
