/**
 * Particles Class
 *
 * Reusable particle system for managing emitters with configurable particle effects.
 * Supports rocket exhaust, explosions, sparkles, and custom particle effects.
 * Integrates with EventBus to listen for particle animation triggers.
 */

import EventBus from "../game/EventBus.js";

class Particles {
  constructor(canvas) {
    if (!canvas) {
      throw new Error(
        "Canvas element is required for Particles initialization",
      );
    }

    this.canvas = canvas;
    this.context = canvas.getContext("2d");

    if (!this.context) {
      throw new Error("Failed to get 2D canvas context");
    }

    this.particles = [];
    this.emitters = [];
    this.isActive = false;
    this.eventBus = EventBus.getInstance();

    // Bind handler for proper unsubscription
    this.handleParticleEvent = this.handleParticleEvent.bind(this);

    this.setupEventListeners();
  }

  /**
   * Setup EventBus listeners for particle triggers
   */
  setupEventListeners() {
    this.eventBus.subscribe("animation:particles", this.handleParticleEvent);
  }

  /**
   * Handle particle animation events from EventBus
   */
  handleParticleEvent(data) {
    if (!data || !data.type) {
      return;
    }

    switch (data.type) {
      case "emit":
        if (data.x !== undefined && data.y !== undefined && data.config) {
          this.emit(data.x, data.y, data.config);
        }
        break;
      case "clear":
        this.clear();
        break;
    }
  }

  /**
   * Emit particles at a specific position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} config - Particle configuration
   * @param {string} config.type - 'exhaust', 'explosion', 'sparkle', or custom
   * @param {number} config.count - Number of particles to emit
   * @param {string} config.color - Particle color (default: white)
   * @param {number} config.size - Particle size (default: 3)
   * @param {number} config.lifetime - Particle lifetime in seconds (default: 1)
   * @param {number} config.velocitySpread - Velocity magnitude spread (default: 1)
   * @param {number} config.angle - Initial direction angle in radians (default: random)
   * @param {number} config.angleSpread - Angle variation in radians (default: Math.PI * 2)
   */
  emit(x, y, config = {}) {
    const {
      type = "sparkle",
      count = 10,
      color = "rgba(255, 255, 255, 1)",
      size = 3,
      lifetime = 1,
      velocitySpread = 1,
      angle = Math.random() * Math.PI * 2,
      angleSpread = Math.PI * 2,
    } = config;

    for (let i = 0; i < count; i++) {
      const particleAngle = angle + (Math.random() - 0.5) * angleSpread;
      const speed = Math.random() * velocitySpread + 0.5;

      const particle = {
        x,
        y,
        vx: Math.cos(particleAngle) * speed,
        vy: Math.sin(particleAngle) * speed,
        size,
        color,
        lifetime,
        age: 0,
        type,
        baseColor: color,
      };

      this.particles.push(particle);
    }
  }

  /**
   * Update all particles
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    if (!this.isActive || this.particles.length === 0) {
      return;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update position
      particle.x += particle.vx * dt * 60; // Normalize to 60fps
      particle.y += particle.vy * dt * 60;

      // Update age
      particle.age += dt;

      // Apply gravity
      particle.vy += 0.1 * dt * 60;

      // Remove dead particles
      if (particle.age >= particle.lifetime) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render all particles
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  render(ctx = null) {
    const renderCtx = ctx || this.context;

    if (!renderCtx || this.particles.length === 0) {
      return;
    }

    this.particles.forEach((particle) => {
      // Calculate fade based on lifetime
      const progress = particle.age / particle.lifetime;
      const opacity = 1 - progress; // Fade out at end

      // Parse color and apply opacity
      let color = particle.baseColor;
      if (color.includes("rgba")) {
        // Replace the alpha value in rgba color
        color = color.replace(/[\d.]+\)$/, `${opacity})`);
      } else if (color.includes("rgb")) {
        // Convert rgb to rgba with opacity
        color = color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
      } else if (color.startsWith("#")) {
        // For hex colors, we'll render with opacity set separately
        renderCtx.globalAlpha = opacity;
      }

      // Render particle
      renderCtx.fillStyle = color;
      renderCtx.beginPath();
      renderCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      renderCtx.fill();

      // Reset global alpha if it was set
      if (color.startsWith("#")) {
        renderCtx.globalAlpha = 1;
      }
    });
  }

  /**
   * Activate the particle system
   */
  activate() {
    this.isActive = true;
  }

  /**
   * Deactivate the particle system
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
    this.emitters = [];
  }

  /**
   * Get particle count
   */
  getParticleCount() {
    return this.particles.length;
  }

  /**
   * Destroy particle system and cleanup
   */
  destroy() {
    this.eventBus.unsubscribe("animation:particles", this.handleParticleEvent);
    this.clear();
    this.context = null;
    this.canvas = null;
    this.isActive = false;
  }
}

export default Particles;
