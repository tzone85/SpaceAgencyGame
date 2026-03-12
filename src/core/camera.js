/**
 * Camera Class
 *
 * Handles 3D camera controls with smooth transitions, view matrix calculations,
 * and projection matrix management for WebGL rendering.
 */

class Camera {
  constructor(canvas) {
    // Camera position and orientation
    this.position = [0, 0, 5]; // x, y, z
    this.target = [0, 0, 0];   // what we're looking at
    this.up = [0, 1, 0];       // up direction
    
    // Projection settings
    this.fieldOfView = Math.PI / 4; // 45 degrees in radians
    this.aspectRatio = canvas ? canvas.width / canvas.height : 16/9;
    this.nearPlane = 0.1;
    this.farPlane = 1000.0;
    
    // Smooth transition properties
    this.targetPosition = [...this.position];
    this.targetTarget = [...this.target];
    this.transitionSpeed = 2.0; // units per second
    this.isTransitioning = false;
    
    // View and projection matrices (4x4)
    this.viewMatrix = this.createIdentityMatrix();
    this.projectionMatrix = this.createIdentityMatrix();
    
    // Update matrices
    this.updateViewMatrix();
    this.updateProjectionMatrix();
    
    console.log('3D Camera initialized successfully');
  }
  
  /**
   * Create a 4x4 identity matrix
   */
  createIdentityMatrix() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }
  
  /**
   * Set camera position with optional smooth transition
   */
  setPosition(x, y, z, smooth = true) {
    if (smooth) {
      this.targetPosition = [x, y, z];
      this.isTransitioning = true;
    } else {
      this.position = [x, y, z];
      this.targetPosition = [...this.position];
      this.updateViewMatrix();
    }
  }
  
  /**
   * Set camera target (what we're looking at) with optional smooth transition
   */
  setTarget(x, y, z, smooth = true) {
    if (smooth) {
      this.targetTarget = [x, y, z];
      this.isTransitioning = true;
    } else {
      this.target = [x, y, z];
      this.targetTarget = [...this.target];
      this.updateViewMatrix();
    }
  }
  
  /**
   * Set field of view in degrees
   */
  setFieldOfView(fovDegrees) {
    this.fieldOfView = (fovDegrees * Math.PI) / 180;
    this.updateProjectionMatrix();
  }
  
  /**
   * Update aspect ratio (call when canvas is resized)
   */
  updateAspectRatio(canvas) {
    this.aspectRatio = canvas.width / canvas.height;
    this.updateProjectionMatrix();
  }
  
  /**
   * Update camera smooth transitions
   */
  update(deltaTime) {
    if (!this.isTransitioning) {
      return;
    }
    
    let hasChanged = false;
    
    // Smoothly interpolate position
    hasChanged |= this.interpolateVector(this.position, this.targetPosition, deltaTime);
    
    // Smoothly interpolate target
    hasChanged |= this.interpolateVector(this.target, this.targetTarget, deltaTime);
    
    // If something changed, update view matrix
    if (hasChanged) {
      this.updateViewMatrix();
    }
    
    // Check if we've reached our targets
    if (this.vectorDistance(this.position, this.targetPosition) < 0.01 &&
        this.vectorDistance(this.target, this.targetTarget) < 0.01) {
      this.isTransitioning = false;
    }
  }
  
  /**
   * Interpolate between two 3D vectors
   */
  interpolateVector(current, target, deltaTime) {
    let hasChanged = false;
    const speed = this.transitionSpeed * deltaTime;
    
    for (let i = 0; i < 3; i++) {
      const diff = target[i] - current[i];
      if (Math.abs(diff) > 0.001) {
        const movement = Math.sign(diff) * Math.min(Math.abs(diff), speed);
        current[i] += movement;
        hasChanged = true;
      }
    }
    
    return hasChanged;
  }
  
  /**
   * Calculate distance between two 3D vectors
   */
  vectorDistance(vec1, vec2) {
    const dx = vec2[0] - vec1[0];
    const dy = vec2[1] - vec1[1];
    const dz = vec2[2] - vec1[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Update the view matrix using lookAt
   */
  updateViewMatrix() {
    this.viewMatrix = this.createLookAtMatrix(
      this.position,
      this.target,
      this.up
    );
  }
  
  /**
   * Update the projection matrix
   */
  updateProjectionMatrix() {
    this.projectionMatrix = this.createPerspectiveMatrix(
      this.fieldOfView,
      this.aspectRatio,
      this.nearPlane,
      this.farPlane
    );
  }
  
  /**
   * Create a look-at view matrix
   */
  createLookAtMatrix(eye, target, up) {
    // Calculate camera coordinate system
    const zAxis = this.normalizeVector(this.subtractVectors(eye, target));
    const xAxis = this.normalizeVector(this.crossProduct(up, zAxis));
    const yAxis = this.crossProduct(zAxis, xAxis);
    
    // Create view matrix
    return [
      xAxis[0], yAxis[0], zAxis[0], 0,
      xAxis[1], yAxis[1], zAxis[1], 0,
      xAxis[2], yAxis[2], zAxis[2], 0,
      -this.dotProduct(xAxis, eye),
      -this.dotProduct(yAxis, eye),
      -this.dotProduct(zAxis, eye),
      1
    ];
  }
  
  /**
   * Create a perspective projection matrix
   */
  createPerspectiveMatrix(fov, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
    const rangeInv = 1.0 / (near - far);
    
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  }
  
  /**
   * Vector math utilities
   */
  subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }
  
  crossProduct(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }
  
  dotProduct(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  
  normalizeVector(v) {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0) {
      return [v[0] / length, v[1] / length, v[2] / length];
    }
    return [0, 0, 0];
  }
  
  /**
   * Orbit around a point
   */
  orbitAroundTarget(horizontalAngle, verticalAngle, distance) {
    const x = this.target[0] + distance * Math.cos(verticalAngle) * Math.cos(horizontalAngle);
    const y = this.target[1] + distance * Math.sin(verticalAngle);
    const z = this.target[2] + distance * Math.cos(verticalAngle) * Math.sin(horizontalAngle);
    
    this.setPosition(x, y, z, true);
  }
  
  /**
   * Move camera forward/backward along view direction
   */
  moveForward(distance) {
    const direction = this.normalizeVector(this.subtractVectors(this.target, this.position));
    this.setPosition(
      this.position[0] + direction[0] * distance,
      this.position[1] + direction[1] * distance,
      this.position[2] + direction[2] * distance,
      true
    );
  }
  
  /**
   * Move camera right/left
   */
  moveRight(distance) {
    const forward = this.normalizeVector(this.subtractVectors(this.target, this.position));
    const right = this.normalizeVector(this.crossProduct(forward, this.up));
    
    this.setPosition(
      this.position[0] + right[0] * distance,
      this.position[1] + right[1] * distance,
      this.position[2] + right[2] * distance,
      true
    );
  }
  
  /**
   * Get view matrix
   */
  getViewMatrix() {
    return [...this.viewMatrix]; // Return copy
  }
  
  /**
   * Get projection matrix
   */
  getProjectionMatrix() {
    return [...this.projectionMatrix]; // Return copy
  }
  
  /**
   * Get camera state for debugging
   */
  getState() {
    return {
      position: [...this.position],
      target: [...this.target],
      up: [...this.up],
      fieldOfView: (this.fieldOfView * 180) / Math.PI,
      aspectRatio: this.aspectRatio,
      isTransitioning: this.isTransitioning
    };
  }
  
  /**
   * Set transition speed
   */
  setTransitionSpeed(speed) {
    this.transitionSpeed = Math.max(0.1, speed);
  }
}

export default Camera;