/**
 * Launch Animation Class
 *
 * Handles animated rocket launch sequence with particle effects,
 * rendering to WebGL canvas with customizable launch outcomes.
 */

class LaunchAnim {
  constructor(renderer) {
    if (!renderer) {
      throw new Error('Renderer is required for LaunchAnim initialization');
    }

    this.renderer = renderer;
    this.context = renderer.getContext();
    this.canvasDimensions = renderer.getCanvasDimensions();

    // Animation state
    this.isPlaying = false;
    this.startTime = 0;
    this.duration = 8000; // 8 seconds total animation
    this.currentPhase = 'idle'; // idle, ignition, liftoff, flight, success/failure

    // Rocket properties
    this.rocket = {
      x: this.canvasDimensions.width / 2,
      y: this.canvasDimensions.height - 100,
      width: 40,
      height: 120,
      velocityY: 0,
      acceleration: 0.5,
      rotation: 0,
      thrust: false
    };

    // Launch outcome
    this.launchOutcome = null; // null, 'success', 'failure'

    // Particles for effects
    this.particles = [];
    this.exhaustParticles = [];
    this.explosionParticles = [];

    // Shader programs
    this.shaderProgram = null;
    this.particleShaderProgram = null;
    this.buffers = {};

    this.initializeShaders();
    this.initializeBuffers();
  }

  /**
   * Initialize WebGL shaders for rocket and particles
   */
  initializeShaders() {
    // Rocket vertex shader
    const rocketVertexShaderSource = `
      attribute vec2 a_position;
      attribute vec3 a_color;

      uniform vec2 u_resolution;
      uniform mat3 u_transform;

      varying vec3 v_color;

      void main() {
        vec2 position = (u_transform * vec3(a_position, 1.0)).xy;
        vec2 clipSpace = ((position / u_resolution) * 2.0) - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_color = a_color;
      }
    `;

    const rocketFragmentShaderSource = `
      precision mediump float;
      varying vec3 v_color;

      void main() {
        gl_FragColor = vec4(v_color, 1.0);
      }
    `;

    this.shaderProgram = this.renderer.createShaderProgram(
      rocketVertexShaderSource,
      rocketFragmentShaderSource
    );

    // Particle vertex shader
    const particleVertexShaderSource = `
      attribute vec2 a_position;
      attribute float a_size;
      attribute vec4 a_color;

      uniform vec2 u_resolution;
      uniform float u_time;

      varying vec4 v_color;

      void main() {
        vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = a_size;
        v_color = a_color;
      }
    `;

    const particleFragmentShaderSource = `
      precision mediump float;
      varying vec4 v_color;

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        if (dist > 0.5) discard;

        float alpha = v_color.a * (1.0 - (dist * 2.0));
        gl_FragColor = vec4(v_color.rgb, alpha);
      }
    `;

    this.particleShaderProgram = this.renderer.createShaderProgram(
      particleVertexShaderSource,
      particleFragmentShaderSource
    );
  }

  /**
   * Initialize WebGL buffers
   */
  initializeBuffers() {
    // Rocket geometry (simple triangle representing rocket)
    const rocketVertices = new Float32Array([
      // Main body (rectangle)
      -20, -60,  0.8, 0.8, 0.9, // Light gray
       20, -60,  0.8, 0.8, 0.9,
       20,  60,  0.8, 0.8, 0.9,
      -20, -60,  0.8, 0.8, 0.9,
       20,  60,  0.8, 0.8, 0.9,
      -20,  60,  0.8, 0.8, 0.9,

      // Nose cone (triangle)
      -15,  60,  0.9, 0.1, 0.1, // Red nose
       15,  60,  0.9, 0.1, 0.1,
        0,  90,  0.9, 0.1, 0.1,

      // Fins
      -25, -60,  0.6, 0.6, 0.7,
      -15, -60,  0.6, 0.6, 0.7,
      -20, -40,  0.6, 0.6, 0.7,

       15, -60,  0.6, 0.6, 0.7,
       25, -60,  0.6, 0.6, 0.7,
       20, -40,  0.6, 0.6, 0.7
    ]);

    this.buffers.rocket = this.renderer.createBuffer(rocketVertices);

    // Initialize particle buffers (will be updated dynamically)
    this.buffers.particles = this.context.createBuffer();
  }

  /**
   * Start the launch animation
   * @param {string} outcome - 'success' or 'failure'
   */
  startLaunch(outcome = 'success') {
    this.isPlaying = true;
    this.startTime = performance.now();
    this.currentPhase = 'ignition';
    this.launchOutcome = outcome;

    // Reset rocket position
    this.rocket.x = this.canvasDimensions.width / 2;
    this.rocket.y = this.canvasDimensions.height - 100;
    this.rocket.velocityY = 0;
    this.rocket.thrust = true;

    // Clear existing particles
    this.particles.length = 0;
    this.exhaustParticles.length = 0;
    this.explosionParticles.length = 0;

    console.log(`Starting rocket launch with outcome: ${outcome}`);
  }

  /**
   * Update animation state
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    if (!this.isPlaying) return;

    const elapsed = performance.now() - this.startTime;
    const progress = elapsed / this.duration;

    // Update animation phase
    this.updatePhase(progress);

    // Update rocket physics
    this.updateRocket(deltaTime);

    // Update particles
    this.updateParticles(deltaTime);

    // Check for animation completion
    if (progress >= 1.0) {
      this.completeLaunch();
    }
  }

  /**
   * Update animation phase based on progress
   */
  updatePhase(progress) {
    if (progress < 0.1) {
      this.currentPhase = 'ignition';
    } else if (progress < 0.3) {
      this.currentPhase = 'liftoff';
    } else if (progress < 0.8) {
      this.currentPhase = 'flight';
    } else {
      this.currentPhase = this.launchOutcome;
    }
  }

  /**
   * Update rocket position and properties
   */
  updateRocket(deltaTime) {
    switch (this.currentPhase) {
      case 'ignition':
        // Slight rumble effect
        this.rocket.x += (Math.random() - 0.5) * 2;
        this.generateExhaustParticles();
        break;

      case 'liftoff':
        this.rocket.velocityY = -50; // Start moving up
        this.rocket.thrust = true;
        this.generateExhaustParticles();
        break;

      case 'flight':
        this.rocket.velocityY += -this.rocket.acceleration * deltaTime;
        this.rocket.y += this.rocket.velocityY * deltaTime;
        this.generateExhaustParticles();
        break;

      case 'failure':
        // Explosion effect
        this.rocket.thrust = false;
        this.generateExplosionParticles();
        this.rocket.rotation += 180 * deltaTime; // Tumble
        this.rocket.velocityY += 100 * deltaTime; // Fall
        this.rocket.y += this.rocket.velocityY * deltaTime;
        break;

      case 'success':
        // Continue flight upward
        this.rocket.y += this.rocket.velocityY * deltaTime;
        if (this.rocket.thrust) {
          this.generateExhaustParticles();
        }
        break;
    }
  }

  /**
   * Generate exhaust particles
   */
  generateExhaustParticles() {
    for (let i = 0; i < 5; i++) {
      const particle = {
        x: this.rocket.x + (Math.random() - 0.5) * 20,
        y: this.rocket.y - 60 + (Math.random() * 10),
        velocityX: (Math.random() - 0.5) * 20,
        velocityY: Math.random() * 50 + 20,
        size: Math.random() * 8 + 4,
        life: 1.0,
        decay: Math.random() * 2 + 1,
        color: {
          r: 1.0,
          g: Math.random() * 0.5 + 0.3,
          b: 0.0,
          a: 0.8
        }
      };
      this.exhaustParticles.push(particle);
    }
  }

  /**
   * Generate explosion particles
   */
  generateExplosionParticles() {
    if (this.explosionParticles.length > 100) return; // Limit particle count

    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 100 + 50;

      const particle = {
        x: this.rocket.x,
        y: this.rocket.y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: Math.random() * 12 + 6,
        life: 1.0,
        decay: Math.random() * 3 + 2,
        color: {
          r: 1.0,
          g: Math.random() * 0.3,
          b: 0.0,
          a: 0.9
        }
      };
      this.explosionParticles.push(particle);
    }
  }

  /**
   * Update all particles
   */
  updateParticles(deltaTime) {
    // Update exhaust particles
    this.updateParticleArray(this.exhaustParticles, deltaTime);

    // Update explosion particles
    this.updateParticleArray(this.explosionParticles, deltaTime);
  }

  /**
   * Update a particle array
   */
  updateParticleArray(particles, deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];

      particle.x += particle.velocityX * deltaTime;
      particle.y += particle.velocityY * deltaTime;
      particle.life -= particle.decay * deltaTime;
      particle.color.a = particle.life;

      // Add gravity to explosion particles
      if (particles === this.explosionParticles) {
        particle.velocityY += 100 * deltaTime;
      }

      // Remove dead particles
      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  /**
   * Render the launch animation
   */
  render() {
    if (!this.isPlaying) return;

    // Render particles first (behind rocket)
    this.renderParticles();

    // Render rocket
    this.renderRocket();
  }

  /**
   * Render the rocket
   */
  renderRocket() {
    if (!this.shaderProgram) return;

    this.context.useProgram(this.shaderProgram);

    // Set uniforms
    const resolutionLocation = this.context.getUniformLocation(this.shaderProgram, 'u_resolution');
    this.context.uniform2f(resolutionLocation, this.canvasDimensions.width, this.canvasDimensions.height);

    const transformLocation = this.context.getUniformLocation(this.shaderProgram, 'u_transform');

    // Create transformation matrix (translation and rotation)
    const cos = Math.cos(this.rocket.rotation * Math.PI / 180);
    const sin = Math.sin(this.rocket.rotation * Math.PI / 180);

    const transform = [
      cos, -sin, this.rocket.x,
      sin, cos,  this.rocket.y,
      0,   0,    1
    ];

    this.context.uniformMatrix3fv(transformLocation, false, transform);

    // Bind rocket geometry
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffers.rocket);

    const positionLocation = this.context.getAttribLocation(this.shaderProgram, 'a_position');
    const colorLocation = this.context.getAttribLocation(this.shaderProgram, 'a_color');

    this.context.enableVertexAttribArray(positionLocation);
    this.context.enableVertexAttribArray(colorLocation);

    const stride = 5 * 4; // 5 floats per vertex (x, y, r, g, b)
    this.context.vertexAttribPointer(positionLocation, 2, this.context.FLOAT, false, stride, 0);
    this.context.vertexAttribPointer(colorLocation, 3, this.context.FLOAT, false, stride, 2 * 4);

    // Draw rocket
    this.context.drawArrays(this.context.TRIANGLES, 0, 18); // 18 vertices total
  }

  /**
   * Render particles
   */
  renderParticles() {
    if (!this.particleShaderProgram) return;

    // Combine all particles
    const allParticles = [...this.exhaustParticles, ...this.explosionParticles];
    if (allParticles.length === 0) return;

    this.context.useProgram(this.particleShaderProgram);

    // Create particle vertex data
    const particleData = new Float32Array(allParticles.length * 7); // x, y, size, r, g, b, a
    for (let i = 0; i < allParticles.length; i++) {
      const particle = allParticles[i];
      const offset = i * 7;

      particleData[offset] = particle.x;
      particleData[offset + 1] = particle.y;
      particleData[offset + 2] = particle.size;
      particleData[offset + 3] = particle.color.r;
      particleData[offset + 4] = particle.color.g;
      particleData[offset + 5] = particle.color.b;
      particleData[offset + 6] = particle.color.a;
    }

    // Update particle buffer
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffers.particles);
    this.context.bufferData(this.context.ARRAY_BUFFER, particleData, this.context.DYNAMIC_DRAW);

    // Set uniforms
    const resolutionLocation = this.context.getUniformLocation(this.particleShaderProgram, 'u_resolution');
    this.context.uniform2f(resolutionLocation, this.canvasDimensions.width, this.canvasDimensions.height);

    const timeLocation = this.context.getUniformLocation(this.particleShaderProgram, 'u_time');
    this.context.uniform1f(timeLocation, performance.now() / 1000.0);

    // Set vertex attributes
    const positionLocation = this.context.getAttribLocation(this.particleShaderProgram, 'a_position');
    const sizeLocation = this.context.getAttribLocation(this.particleShaderProgram, 'a_size');
    const colorLocation = this.context.getAttribLocation(this.particleShaderProgram, 'a_color');

    this.context.enableVertexAttribArray(positionLocation);
    this.context.enableVertexAttribArray(sizeLocation);
    this.context.enableVertexAttribArray(colorLocation);

    const stride = 7 * 4; // 7 floats per particle
    this.context.vertexAttribPointer(positionLocation, 2, this.context.FLOAT, false, stride, 0);
    this.context.vertexAttribPointer(sizeLocation, 1, this.context.FLOAT, false, stride, 2 * 4);
    this.context.vertexAttribPointer(colorLocation, 4, this.context.FLOAT, false, stride, 3 * 4);

    // Enable point sprite rendering
    this.context.enable(this.context.BLEND);
    this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA);

    // Draw particles as points
    this.context.drawArrays(this.context.POINTS, 0, allParticles.length);
  }

  /**
   * Complete the launch animation
   */
  completeLaunch() {
    this.isPlaying = false;
    this.currentPhase = 'complete';
    console.log(`Launch animation completed with outcome: ${this.launchOutcome}`);
  }

  /**
   * Stop the animation
   */
  stop() {
    this.isPlaying = false;
    this.currentPhase = 'idle';
    this.particles.length = 0;
    this.exhaustParticles.length = 0;
    this.explosionParticles.length = 0;
  }

  /**
   * Check if animation is playing
   */
  isAnimationPlaying() {
    return this.isPlaying;
  }

  /**
   * Get current animation phase
   */
  getCurrentPhase() {
    return this.currentPhase;
  }

  /**
   * Get launch outcome
   */
  getLaunchOutcome() {
    return this.launchOutcome;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stop();

    // Clean up WebGL resources
    if (this.shaderProgram) {
      this.context.deleteProgram(this.shaderProgram);
    }
    if (this.particleShaderProgram) {
      this.context.deleteProgram(this.particleShaderProgram);
    }

    Object.values(this.buffers).forEach(buffer => {
      if (buffer) {
        this.context.deleteBuffer(buffer);
      }
    });

    console.log('LaunchAnim destroyed');
  }
}

export default LaunchAnim;