/**
 * Starfield Class
 *
 * Renders an animated starfield background using HTML5 Canvas.
 * Features multiple star layers with parallax scrolling, twinkling effects,
 * and varying star sizes and opacity.
 */

class Starfield {
  constructor(canvas) {
    if (!canvas) {
      throw new Error('Canvas element is required for Starfield initialization');
    }

    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    if (!this.context) {
      throw new Error('Failed to get 2D canvas context');
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

    // Resize handler
    this.handleResize = this.handleResize.bind(this);

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
        opacity: Math.random() * (this.maxOpacity - this.minOpacity) + this.minOpacity,
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

      // Wrap around when scroll offset exceeds canvas width
      if (layer.scrollOffset > this.canvas.width) {
        layer.scrollOffset -= this.canvas.width;
      }

      // Update each star's twinkling
      layer.stars.forEach((star) => {
        star.twinklarTime += this.twinkleSpeed * deltaTime;

        // Calculate opacity using sine wave for smooth twinkling
        const twinkleProgress = (star.twinklarTime % star.twinkleDuration) / star.twinkleDuration;
        const twinkleValue = Math.sin(twinkleProgress * Math.PI * 2);
        const opacityRange = this.maxOpacity - this.minOpacity;
        star.opacity = this.minOpacity + (opacityRange * (twinkleValue + 1) / 2);
      });
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
    this.context.fillStyle = 'rgba(0, 0, 0, 1)';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render each layer
    this.layers.forEach((layer) => {
      this.renderLayer(layer);
    });
  }

  /**
   * Render a single star layer
   */
  renderLayer(layer) {
    layer.stars.forEach((star) => {
      const wrappedX = (star.x - layer.scrollOffset) % this.canvas.width;
      const displayX = wrappedX < 0 ? wrappedX + this.canvas.width : wrappedX;

      // Draw star
      this.context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      this.context.beginPath();
      this.context.arc(displayX, star.y, star.size, 0, Math.PI * 2);
      this.context.fill();

      // Draw wrapped star if it extends beyond canvas edge
      if (wrappedX < 0 || wrappedX > this.canvas.width - star.size * 2) {
        const wrappedDisplayX = wrappedX < 0 ? wrappedX + this.canvas.width : wrappedX - this.canvas.width;
        this.context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        this.context.beginPath();
        this.context.arc(wrappedDisplayX, star.y, star.size, 0, Math.PI * 2);
        this.context.fill();
      }
    });
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isAnimating) {
      console.warn('Starfield animation already running');
      return;
    }

    if (!this.isInitialized) {
      console.error('Starfield must be initialized before starting');
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
      console.warn('Starfield animation is not running');
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
    const scrollOffsets = this.layers.map(layer => layer.scrollOffset);

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
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Unregister resize listener
   */
  unregisterResizeListener() {
    window.removeEventListener('resize', this.handleResize);
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
    return this.layers.map(layer => ({
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
    if (config.layerCount !== undefined && config.layerCount !== this.layerCount) {
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

    // Clear context
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context = null;
    }

    this.layers = [];
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
