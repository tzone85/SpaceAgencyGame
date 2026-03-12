/**
 * SpaceScene Class
 *
 * Main 3D space environment scene for Stellar Command.
 * Handles space objects, starfields, and space agency gameplay elements.
 */

class SpaceScene {
  constructor(renderer, camera, config = {}) {
    this.renderer = renderer;
    this.camera = camera;
    this.config = {
      starCount: 1000,
      nebulaDensity: 0.3,
      ambientLightLevel: 0.2,
      enableParticles: true,
      ...config
    };
    
    // Scene state
    this.isInitialized = false;
    this.isActive = false;
    
    // Rendering components
    this.shaderProgram = null;
    this.starField = null;
    this.spaceObjects = [];
    
    // Animation state
    this.time = 0;
    this.starRotation = 0;
    
    console.log('Space Scene created');
  }
  
  /**
   * Initialize scene resources
   */
  initialize() {
    if (this.isInitialized) {
      console.warn('Space Scene already initialized');
      return;
    }
    
    console.log('Initializing Space Scene...');
    
    try {
      this.initializeShaders();
      this.createStarField();
      this.setupLighting();
      this.createSpaceObjects();
      
      this.isInitialized = true;
      console.log('Space Scene initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Space Scene:', error);
      throw error;
    }
  }
  
  /**
   * Initialize shader programs
   */
  /**
   * Get WebGL context helper
   */
  getGL() {
    return this.renderer.getContext();
  }

  initializeShaders() {
    const gl = this.getGL();
    
    // Vertex shader for basic 3D rendering
    const vertexShaderSource = `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      attribute float aSize;
      
      uniform mat4 uViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform float uTime;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        // Apply view and projection transformations
        vec4 worldPosition = vec4(aPosition, 1.0);
        gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
        
        // Set point size for stars
        gl_PointSize = aSize;
        
        // Pass color to fragment shader
        vColor = aColor;
        
        // Animate alpha for twinkling effect
        vAlpha = 0.5 + 0.5 * sin(uTime * 2.0 + aPosition.x * 10.0);
      }
    `;
    
    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        // Create circular star shape
        vec2 coord = gl_PointCoord - vec2(0.5);
        float distance = length(coord);
        
        if (distance > 0.5) {
          discard;
        }
        
        // Smooth edge falloff
        float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
        alpha *= vAlpha;
        
        gl_FragColor = vec4(vColor, alpha);
      }
    `;
    
    this.shaderProgram = this.renderer.createShaderProgram(
      vertexShaderSource,
      fragmentShaderSource
    );
    
    if (!this.shaderProgram) {
      throw new Error('Failed to create shader program');
    }
    
    // Get shader attribute and uniform locations
    // Reuse gl variable from above
    this.shaderLocations = {
      attributes: {
        position: gl.getAttribLocation(this.shaderProgram, 'aPosition'),
        color: gl.getAttribLocation(this.shaderProgram, 'aColor'),
        size: gl.getAttribLocation(this.shaderProgram, 'aSize')
      },
      uniforms: {
        viewMatrix: gl.getUniformLocation(this.shaderProgram, 'uViewMatrix'),
        projectionMatrix: gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
        time: gl.getUniformLocation(this.shaderProgram, 'uTime')
      }
    };
  }
  
  /**
   * Create the star field
   */
  createStarField() {
    const starCount = this.config.starCount;
    const positions = [];
    const colors = [];
    const sizes = [];
    
    // Generate random stars
    for (let i = 0; i < starCount; i++) {
      // Random position in a sphere around the origin
      const radius = 50 + Math.random() * 450; // 50-500 units from center
      const theta = Math.random() * Math.PI * 2; // Horizontal angle
      const phi = Math.random() * Math.PI; // Vertical angle
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      positions.push(x, y, z);
      
      // Random star colors (mostly white/blue/yellow)
      const starType = Math.random();
      if (starType < 0.7) {
        // White stars
        colors.push(1.0, 1.0, 1.0);
      } else if (starType < 0.85) {
        // Blue stars
        colors.push(0.7, 0.8, 1.0);
      } else {
        // Yellow/orange stars
        colors.push(1.0, 0.9, 0.6);
      }
      
      // Random star sizes
      sizes.push(1.0 + Math.random() * 3.0);
    }
    
    // Create WebGL buffers
    const gl = this.getGL();
    
    this.starField = {
      positionBuffer: this.renderer.createBuffer(new Float32Array(positions)),
      colorBuffer: this.renderer.createBuffer(new Float32Array(colors)),
      sizeBuffer: this.renderer.createBuffer(new Float32Array(sizes)),
      vertexCount: starCount
    };
  }
  
  /**
   * Setup lighting for the scene
   */
  setupLighting() {
    // Set ambient lighting
    const gl = this.getGL();
    gl.clearColor(0.02, 0.02, 0.05, 1.0); // Very dark blue space background
  }
  
  /**
   * Create space objects (planets, asteroids, etc.)
   */
  createSpaceObjects() {
    // For now, just create a few colored objects as placeholders
    this.spaceObjects = [
      {
        position: [10, 0, -20],
        color: [0.8, 0.4, 0.2], // Orange planet
        size: 2.0,
        rotationSpeed: 0.5
      },
      {
        position: [-15, 5, -30],
        color: [0.2, 0.6, 0.8], // Blue planet
        size: 1.5,
        rotationSpeed: 0.3
      },
      {
        position: [0, -10, -40],
        color: [0.6, 0.6, 0.6], // Gray asteroid
        size: 0.8,
        rotationSpeed: 1.0
      }
    ];
  }
  
  /**
   * Scene lifecycle - called when entering scene
   */
  onEnter() {
    console.log('Entering Space Scene');
    this.isActive = true;
    
    // Set up camera for space view
    this.camera.setPosition(0, 0, 10, true);
    this.camera.setTarget(0, 0, 0, true);
    this.camera.setTransitionSpeed(1.5);
    
    // Enable 3D rendering
    const gl = this.getGL();
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
  
  /**
   * Scene lifecycle - called when exiting scene
   */
  onExit() {
    console.log('Exiting Space Scene');
    this.isActive = false;
  }
  
  /**
   * Scene lifecycle - called when starting transition out
   */
  onTransitionOut() {
    console.log('Space Scene transitioning out');
  }
  
  /**
   * Scene lifecycle - called when starting transition in
   */
  onTransitionIn() {
    console.log('Space Scene transitioning in');
  }
  
  /**
   * Update scene logic
   */
  update(deltaTime) {
    if (!this.isActive) {
      return;
    }
    
    this.time += deltaTime;
    this.starRotation += deltaTime * 0.1; // Slow star field rotation
    
    // Update space objects
    for (const obj of this.spaceObjects) {
      obj.rotation = (obj.rotation || 0) + obj.rotationSpeed * deltaTime;
    }
    
    // Update camera
    this.camera.update(deltaTime);
  }
  
  /**
   * Render the scene
   */
  render(alpha = 1.0) {
    if (!this.isInitialized || !this.renderer.isReady()) {
      return;
    }
    
    const gl = this.getGL();
    
    // Clear the canvas
    this.renderer.clear();
    
    // Use our shader program
    gl.useProgram(this.shaderProgram);
    
    // Set matrices
    gl.uniformMatrix4fv(
      this.shaderLocations.uniforms.viewMatrix,
      false,
      this.camera.getViewMatrix()
    );
    gl.uniformMatrix4fv(
      this.shaderLocations.uniforms.projectionMatrix,
      false,
      this.camera.getProjectionMatrix()
    );
    gl.uniform1f(this.shaderLocations.uniforms.time, this.time);
    
    // Render star field
    this.renderStarField(alpha);
    
    // Render space objects
    this.renderSpaceObjects(alpha);
  }
  
  /**
   * Render the star field
   */
  renderStarField(alpha) {
    const gl = this.getGL();
    
    // Enable point sprite rendering
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    
    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.starField.positionBuffer);
    gl.enableVertexAttribArray(this.shaderLocations.attributes.position);
    gl.vertexAttribPointer(this.shaderLocations.attributes.position, 3, gl.FLOAT, false, 0, 0);
    
    // Bind color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.starField.colorBuffer);
    gl.enableVertexAttribArray(this.shaderLocations.attributes.color);
    gl.vertexAttribPointer(this.shaderLocations.attributes.color, 3, gl.FLOAT, false, 0, 0);
    
    // Bind size buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.starField.sizeBuffer);
    gl.enableVertexAttribArray(this.shaderLocations.attributes.size);
    gl.vertexAttribPointer(this.shaderLocations.attributes.size, 1, gl.FLOAT, false, 0, 0);
    
    // Draw stars as points
    gl.drawArrays(gl.POINTS, 0, this.starField.vertexCount);
    
    // Reset blend mode
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
  
  /**
   * Render space objects (simplified for now)
   */
  renderSpaceObjects(alpha) {
    // TODO: Implement proper 3D object rendering
    // For now, just render as larger colored points
    const gl = this.getGL();
    
    for (const obj of this.spaceObjects) {
      // Create temporary buffers for this object
      const positions = obj.position;
      const colors = obj.color;
      const size = obj.size * 5; // Make objects visible
      
      const posBuffer = this.renderer.createBuffer(new Float32Array(positions));
      const colorBuffer = this.renderer.createBuffer(new Float32Array(colors));
      const sizeBuffer = this.renderer.createBuffer(new Float32Array([size]));
      
      // Bind buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(this.shaderLocations.attributes.position, 3, gl.FLOAT, false, 0, 0);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.vertexAttribPointer(this.shaderLocations.attributes.color, 3, gl.FLOAT, false, 0, 0);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
      gl.vertexAttribPointer(this.shaderLocations.attributes.size, 1, gl.FLOAT, false, 0, 0);
      
      // Draw object
      gl.drawArrays(gl.POINTS, 0, 1);
      
      // Clean up temporary buffers
      gl.deleteBuffer(posBuffer);
      gl.deleteBuffer(colorBuffer);
      gl.deleteBuffer(sizeBuffer);
    }
  }
  
  /**
   * Handle window resize
   */
  onResize(width, height) {
    if (this.camera) {
      this.camera.updateAspectRatio({ width, height });
    }
  }
  
  /**
   * Get scene configuration
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * Update scene configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Recreate star field if star count changed
    if (newConfig.starCount && newConfig.starCount !== this.config.starCount) {
      this.createStarField();
    }
  }
  
  /**
   * Get scene state for debugging
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      isActive: this.isActive,
      time: this.time,
      starRotation: this.starRotation,
      spaceObjectCount: this.spaceObjects.length,
      config: this.config
    };
  }
  
  /**
   * Destroy scene and cleanup resources
   */
  destroy() {
    console.log('Destroying Space Scene...');
    
    const gl = this.getGL();
    
    // Delete shader program
    if (this.shaderProgram) {
      gl.deleteProgram(this.shaderProgram);
      this.shaderProgram = null;
    }
    
    // Delete star field buffers
    if (this.starField) {
      gl.deleteBuffer(this.starField.positionBuffer);
      gl.deleteBuffer(this.starField.colorBuffer);
      gl.deleteBuffer(this.starField.sizeBuffer);
      this.starField = null;
    }
    
    // Clear references
    this.spaceObjects = [];
    this.renderer = null;
    this.camera = null;
    this.isInitialized = false;
    this.isActive = false;
    
    console.log('Space Scene destroyed');
  }
}

export default SpaceScene;