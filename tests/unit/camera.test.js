/**
 * Camera Unit Tests
 *
 * Test suite for the 3D Camera class functionality.
 */

import Camera from '../../src/core/camera.js';

describe('Camera', () => {
  let mockCanvas;
  let camera;

  beforeEach(() => {
    // Mock canvas
    mockCanvas = {
      width: 800,
      height: 600
    };
    
    camera = new Camera(mockCanvas);
  });

  describe('initialization', () => {
    test('should initialize with default values', () => {
      expect(camera.position).toEqual([0, 0, 5]);
      expect(camera.target).toEqual([0, 0, 0]);
      expect(camera.up).toEqual([0, 1, 0]);
      expect(camera.aspectRatio).toBeCloseTo(800/600);
    });

    test('should create identity matrices', () => {
      const identity = camera.createIdentityMatrix();
      const expected = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
      expect(identity).toEqual(expected);
    });
  });

  describe('position and target management', () => {
    test('should set position immediately when smooth=false', () => {
      camera.setPosition(1, 2, 3, false);
      expect(camera.position).toEqual([1, 2, 3]);
      expect(camera.targetPosition).toEqual([1, 2, 3]);
      expect(camera.isTransitioning).toBe(false);
    });

    test('should set target position for smooth transition when smooth=true', () => {
      camera.setPosition(1, 2, 3, true);
      expect(camera.position).toEqual([0, 0, 5]); // Original position
      expect(camera.targetPosition).toEqual([1, 2, 3]);
      expect(camera.isTransitioning).toBe(true);
    });

    test('should set target immediately when smooth=false', () => {
      camera.setTarget(1, 2, 3, false);
      expect(camera.target).toEqual([1, 2, 3]);
      expect(camera.targetTarget).toEqual([1, 2, 3]);
      expect(camera.isTransitioning).toBe(false);
    });
  });

  describe('smooth transitions', () => {
    test('should interpolate position during transitions', () => {
      camera.setPosition(10, 0, 0, true);
      
      // Update with a time step
      camera.update(0.1);
      
      // Position should have moved towards target
      expect(camera.position[0]).toBeGreaterThan(0);
      expect(camera.position[0]).toBeLessThan(10);
      expect(camera.isTransitioning).toBe(true);
    });

    test('should complete transition when close to target', () => {
      camera.setPosition(0.005, 0, 5, true);
      
      // Update with sufficient time
      camera.update(1.0);
      
      // Should have reached target and stopped transitioning
      expect(camera.vectorDistance(camera.position, camera.targetPosition)).toBeLessThan(0.01);
      expect(camera.isTransitioning).toBe(false);
    });
  });

  describe('field of view', () => {
    test('should set field of view in degrees', () => {
      camera.setFieldOfView(60);
      expect(camera.fieldOfView).toBeCloseTo(Math.PI / 3);
    });
  });

  describe('aspect ratio', () => {
    test('should update aspect ratio from canvas', () => {
      const newCanvas = { width: 1920, height: 1080 };
      camera.updateAspectRatio(newCanvas);
      expect(camera.aspectRatio).toBeCloseTo(1920/1080);
    });
  });

  describe('vector math utilities', () => {
    test('should subtract vectors correctly', () => {
      const result = camera.subtractVectors([5, 3, 1], [2, 1, 0]);
      expect(result).toEqual([3, 2, 1]);
    });

    test('should calculate cross product correctly', () => {
      const result = camera.crossProduct([1, 0, 0], [0, 1, 0]);
      expect(result).toEqual([0, 0, 1]);
    });

    test('should calculate dot product correctly', () => {
      const result = camera.dotProduct([1, 2, 3], [4, 5, 6]);
      expect(result).toBe(32); // 1*4 + 2*5 + 3*6
    });

    test('should normalize vectors correctly', () => {
      const result = camera.normalizeVector([3, 4, 0]);
      expect(result[0]).toBeCloseTo(0.6);
      expect(result[1]).toBeCloseTo(0.8);
      expect(result[2]).toBeCloseTo(0);
    });

    test('should handle zero vector normalization', () => {
      const result = camera.normalizeVector([0, 0, 0]);
      expect(result).toEqual([0, 0, 0]);
    });
  });

  describe('camera movement', () => {
    test('should move forward along view direction', () => {
      const originalPosition = [...camera.position];
      camera.moveForward(1);
      
      // Should have set target position for smooth movement
      expect(camera.isTransitioning).toBe(true);
      expect(camera.targetPosition).not.toEqual(originalPosition);
    });

    test('should move right perpendicular to view direction', () => {
      const originalPosition = [...camera.position];
      camera.moveRight(1);
      
      // Should have set target position for smooth movement
      expect(camera.isTransitioning).toBe(true);
      expect(camera.targetPosition).not.toEqual(originalPosition);
    });

    test('should orbit around target', () => {
      camera.orbitAroundTarget(Math.PI/4, Math.PI/6, 10);
      
      // Should have set new target position
      expect(camera.isTransitioning).toBe(true);
      
      // Distance from target should be approximately 10
      const distance = camera.vectorDistance(camera.targetPosition, camera.target);
      expect(distance).toBeCloseTo(10, 1);
    });
  });

  describe('matrix generation', () => {
    test('should generate view matrix', () => {
      const viewMatrix = camera.getViewMatrix();
      expect(viewMatrix).toHaveLength(16);
      expect(Array.isArray(viewMatrix)).toBe(true);
    });

    test('should generate projection matrix', () => {
      const projMatrix = camera.getProjectionMatrix();
      expect(projMatrix).toHaveLength(16);
      expect(Array.isArray(projMatrix)).toBe(true);
    });

    test('should return copies of matrices', () => {
      const view1 = camera.getViewMatrix();
      const view2 = camera.getViewMatrix();
      expect(view1).not.toBe(view2); // Different object references
      expect(view1).toEqual(view2); // Same values
    });
  });

  describe('transition speed', () => {
    test('should set transition speed', () => {
      camera.setTransitionSpeed(5.0);
      expect(camera.transitionSpeed).toBe(5.0);
    });

    test('should enforce minimum transition speed', () => {
      camera.setTransitionSpeed(0.05);
      expect(camera.transitionSpeed).toBe(0.1);
    });
  });

  describe('state reporting', () => {
    test('should return current state', () => {
      const state = camera.getState();
      
      expect(state).toHaveProperty('position');
      expect(state).toHaveProperty('target');
      expect(state).toHaveProperty('up');
      expect(state).toHaveProperty('fieldOfView');
      expect(state).toHaveProperty('aspectRatio');
      expect(state).toHaveProperty('isTransitioning');
      
      expect(state.position).toEqual(camera.position);
      expect(state.isTransitioning).toBe(camera.isTransitioning);
    });
  });
});