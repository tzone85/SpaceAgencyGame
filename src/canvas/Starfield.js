/**
 * Starfield Class
 *
 * Renders an animated starfield background using HTML5 Canvas.
 * Features multiple star layers with parallax scrolling, twinkling effects,
 * shooting stars, and mouse-tracked parallax.
 */

class Starfield {
  constructor(canvas) {
    if (!canvas) {
      throw new Error(
        "Canvas element is required for Starfield initialization",
      );
    }

    this.canvas = canvas;
    this.context = canvas.getContext("2d");

    if (!this.context) {
      throw new Error("Failed to get 2D canvas context");
    }

    this.isInitialized = false;
    this.isAnimating = false;
    this.animationFrameId = null;
    this.lastFrameTime = 0;

    // Star layer configuration
    this.layers = [];
    this.layerCount = 3;
    this.baseStarCount = 100;

    // Animation settings
    this.twinkleSpeed = 0.05;
    this.scrollSpeed = 0.3;
    this.maxOpacity = 1.0;
    this.minOpacity = 0.1;

    // Mouse tracking for parallax
    this.mouseX = canvas.width / 2;
    this.mouseY = canvas.height / 2;
    this.parallaxStrength = 0.1;

    // Shooting stars
    this.shootingStars = [];
    this.shootingStarFrequency = 0.02; // 2% chance per frame

    // Resize handler and mouse listener
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

    this.initializeLayers();
    this.isInitialized = true;
  }

  /**
   * Initialize star layers with different speeds for parallax effect
   */
  initializeLayers() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (let layerIndex = 0; layerIndex < this.layerCount; layerIndex++) {
      // Layer 0 is nearest (fastest), layer 2 is farthest (slowest)
      const depthFactor = (layerIndex + 1) / this.layerCount;
      const starCount = Math.floor(this.baseStarCount * depthFactor);

      const layer = {
        index: layerIndex,
        depthFactor,
        scrollSpeed: this.scrollSpeed * (1 - depthFactor * 0.5),
        scrollOffset: 0,
        parallaxOffset: 0,
        stars: this.generateStars(starCount, width, height, depthFactor),
      };

      this.layers.push(layer);
    }
  }

  /**
   * Generate stars for a given layer
   */
  generateStars(count, width, height, depthFactor) {
    const stars = [];
    const maxSize = 2 * depthFactor;
    const minSize = 0.5 * depthFactor;

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        opacity:
          Math.random() * (this.maxOpacity - this.minOpacity) + this.minOpacity,
        twinkleDuration: Math.random() * 2 + 1, // 1-3 seconds
        twinklarTime: Math.random() * 2, // Start at random point in twinkle cycle
        twinkleDirection: Math.random() > 0.5 ? 1 : -1,
      });
    }

    return stars;
  }

  /**
   * Update star animations (twinkling and parallax)
   */
  update(deltaTime) {
    if (!this.isAnimating || !this.isInitialized) {
      return;
    }

    // Update each layer
    this.layers.forEach((layer) => {
      // Update scroll offset for parallax
      layer.scrollOffset += layer.scrollSpeed * deltaTime;

      // Apply mouse-tracked parallax based on depth
      const mouseOffsetX =
        (this.mouseX - this.canvas.width / 2) *
        this.parallaxStrength *
        layer.depthFactor;
      layer.parallaxOffset = mouseOffsetX;

      // Wrap around when scroll offset exceeds canvas width
      if (layer.scrollOffset > this.canvas.width) {
        layer.scrollOffset -= this.canvas.width;
      }

      // Update each star's twinkling
      layer.stars.forEach((star) => {
        star.twinklarTime += this.twinkleSpeed * deltaTime;

        // Calculate opacity using sine wave for smooth twinkling
        const twinkleProgress =
          (star.twinklarTime % star.twinkleDuration) / star.twinkleDuration;
        const twinkleValue = Math.sin(twinkleProgress * Math.PI * 2);
        const opacityRange = this.maxOpacity - this.minOpacity;
        star.opacity =
          this.minOpacity + (opacityRange * (twinkleValue + 1)) / 2;
      });
    });

    // Update shooting stars
    this.updateShootingStars(deltaTime);

    // Randomly spawn new shooting stars
    if (Math.random() < this.shootingStarFrequency) {
      this.spawnShootingStar();
    }
  }

  /**
   * Update all shooting stars
   */
  updateShootingStars(deltaTime) {
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];

      // Update position
      star.x += star.vx * deltaTime * 60;
      star.y += star.vy * deltaTime * 60;

      // Update lifetime
      star.age += deltaTime;

      // Remove if expired
      if (star.age >= star.lifetime) {
        this.shootingStars.splice(i, 1);
      }
    }
  }

  /**
   * Spawn a new shooting star
   */
  spawnShootingStar() {
    const startX = Math.random() * this.canvas.width;
    const startY = Math.random() * (this.canvas.height * 0.5); // Top half

    const angle = Math.random() * (Math.PI / 4) + Math.PI / 8; // 22.5 to 45 degrees
    const speed = Math.random() * 200 + 150;

    this.shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: Math.random() * 40 + 20,
      width: Math.random() * 2 + 1,
      opacity: 1,
      age: 0,
      lifetime: Math.random() * 0.5 + 0.3,
    });
  }

  /**
   * Render the starfield
   */
  render() {
    if (!this.isInitialized) {
      return;
    }

    // Clear canvas
    this.context.fillStyle = "rgba(0, 0, 0, 1)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render each layer
    this.layers.forEach((layer) => {
      this.renderLayer(layer);
    });

    // Render shooting stars
    this.renderShootingStars();
  }

  /**
   * Render a single star layer with mouse parallax
   */
  renderLayer(layer) {
    layer.stars.forEach((star) => {
      const parallaxOffset = layer.parallaxOffset || 0;
      const wrappedX =
        (star.x - layer.scrollOffset + parallaxOffset) % this.canvas.width;
      const displayX = wrappedX < 0 ? wrappedX + this.canvas.width : wrappedX;

      // Draw star
      this.context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      this.context.beginPath();
      this.context.arc(displayX, star.y, star.size, 0, Math.PI * 2);
      this.context.fill();

      // Draw wrapped star if it extends beyond canvas edge
      if (wrappedX < 0 || wrappedX > this.canvas.width - star.size * 2) {
        const wrappedDisplayX =
          wrappedX < 0
            ? wrappedX + this.canvas.width
            : wrappedX - this.canvas.width;
        this.context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        this.context.beginPath();
        this.context.arc(wrappedDisplayX, star.y, star.size, 0, Math.PI * 2);
        this.context.fill();
      }
    });
  }

  /**
   * Render all shooting stars as diagonal streaks
   */
  renderShootingStars() {
    this.shootingStars.forEach((star) => {
      const progress = star.age / star.lifetime;
      const opacity = 1 - progress; // Fade out

      // Calculate starting point (going backwards along velocity)
      const trailX = star.x - star.vx * (star.length / star.vx);
      const trailY = star.y - star.vy * (star.length / star.vy);

      // Draw gradient line for shooting star trail
      if (typeof this.context.createLinearGradient === "function") {
        const gradient = this.context.createLinearGradient(
          trailX,
          trailY,
          star.x,
          star.y,
        );
        gradient.addColorStop(0, `rgba(255, 255, 200, 0)`);
        gradient.addColorStop(0.5, `rgba(255, 255, 200, ${opacity * 0.7})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);
        this.context.strokeStyle = gradient;
      } else {
        this.context.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      }
      if (
        typeof this.context.moveTo === "function" &&
        typeof this.context.lineTo === "function" &&
        typeof this.context.stroke === "function"
      ) {
        this.context.lineWidth = star.width;
        this.context.lineCap = "round";
        this.context.beginPath();
        this.context.moveTo(trailX, trailY);
        this.context.lineTo(star.x, star.y);
        this.context.stroke();
      }

      // Draw bright core of shooting star
      this.context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      this.context.beginPath();
      this.context.arc(star.x, star.y, star.width * 1.5, 0, Math.PI * 2);
      this.context.fill();
    });
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isAnimating) {
      console.warn("Starfield animation already running");
      return;
    }

    if (!this.isInitialized) {
      console.error("Starfield must be initialized before starting");
      return;
    }

    this.isAnimating = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }

  /**
   * Animation loop
   */
  animate = () => {
    if (!this.isAnimating) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  /**
   * Stop the animation
   */
  stop() {
    if (!this.isAnimating) {
      console.warn("Starfield animation is not running");
      return;
    }

    this.isAnimating = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Handle canvas resize
   */
  handleResize() {
    if (!this.isInitialized) {
      return;
    }

    // Store current scroll offsets
    const scrollOffsets = this.layers.map((layer) => layer.scrollOffset);

    // Reinitialize layers with new canvas dimensions
    this.layers = [];
    this.initializeLayers();

    // Restore scroll offsets
    this.layers.forEach((layer, index) => {
      layer.scrollOffset = scrollOffsets[index] || 0;
    });

    this.render();
  }

  /**
   * Register resize listener
   */
  registerResizeListener() {
    window.addEventListener("resize", this.handleResize);
  }

  /**
   * Unregister resize listener
   */
  unregisterResizeListener() {
    window.removeEventListener("resize", this.handleResize);
  }

  /**
   * Handle mouse move for parallax effect
   */
  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
  }

  /**
   * Register mouse move listener
   */
  registerMouseListener() {
    if (this.canvas) {
      this.canvas.addEventListener("mousemove", this.handleMouseMove);
    }
  }

  /**
   * Unregister mouse move listener
   */
  unregisterMouseListener() {
    if (this.canvas) {
      this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    }
  }

  /**
   * Get canvas dimensions
   */
  getCanvasDimensions() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  /**
   * Get layer information for debugging/testing
   */
  getLayerInfo() {
    return this.layers.map((layer) => ({
      index: layer.index,
      depthFactor: layer.depthFactor,
      scrollSpeed: layer.scrollSpeed,
      starCount: layer.stars.length,
    }));
  }

  /**
   * Set animation configuration
   */
  setConfig(config) {
    if (config.twinkleSpeed !== undefined) {
      this.twinkleSpeed = config.twinkleSpeed;
    }
    if (config.scrollSpeed !== undefined) {
      this.scrollSpeed = config.scrollSpeed;
      this.updateLayerSpeeds();
    }
    if (config.maxOpacity !== undefined) {
      this.maxOpacity = config.maxOpacity;
    }
    if (config.minOpacity !== undefined) {
      this.minOpacity = config.minOpacity;
    }
    if (
      config.layerCount !== undefined &&
      config.layerCount !== this.layerCount
    ) {
      this.layerCount = config.layerCount;
      this.layers = [];
      this.initializeLayers();
    }
  }

  /**
   * Update layer scroll speeds when base scroll speed changes
   */
  updateLayerSpeeds() {
    this.layers.forEach((layer) => {
      layer.scrollSpeed = this.scrollSpeed * (1 - layer.depthFactor * 0.5);
    });
  }

  /**
   * Cleanup and destroy starfield
   */
  destroy() {
    this.stop();
    this.unregisterResizeListener();
    this.unregisterMouseListener();

    // Clear context
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context = null;
    }

    this.layers = [];
    this.shootingStars = [];
    this.canvas = null;
    this.isInitialized = false;
  }

  /**
   * Check if starfield is ready
   */
  isReady() {
    return this.isInitialized && this.context !== null;
  }
}

export default Starfield;
