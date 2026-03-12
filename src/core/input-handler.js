/**
 * InputHandler Class
 *
 * Manages keyboard and mouse input events for the game.
 * Provides a centralized way to register input handlers,
 * query input state, and manage input events.
 */

class InputHandler {
  constructor() {
    this.keyPressed = new Map(); // key -> boolean
    this.mousePos = { x: 0, y: 0 };
    this.mouseButtons = { left: false, right: false, middle: false };
    this.listeners = new Map(); // event type -> callbacks array
    this.isEnabled = true;

    // Bind event handlers to preserve 'this' context
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
  }

  /**
   * Initialize the input handler by attaching event listeners
   * @param {HTMLElement} target - Target element to attach listeners to (default: window)
   */
  initialize(target = window) {
    if (!target) {
      console.error("Invalid target for input handler");
      return;
    }

    this.target = target;

    // Keyboard events
    this.target.addEventListener("keydown", this.handleKeyDown);
    this.target.addEventListener("keyup", this.handleKeyUp);

    // Mouse events
    this.target.addEventListener("mousemove", this.handleMouseMove);
    this.target.addEventListener("mousedown", this.handleMouseDown);
    this.target.addEventListener("mouseup", this.handleMouseUp);
    this.target.addEventListener("wheel", this.handleMouseWheel, {
      passive: false,
    });

    console.log("InputHandler initialized");
  }

  /**
   * Handle keydown events
   * @private
   */
  handleKeyDown(event) {
    if (!this.isEnabled) return;

    const key = event.key.toLowerCase();
    this.keyPressed.set(key, true);

    this.emit("keydown", { key, event });
  }

  /**
   * Handle keyup events
   * @private
   */
  handleKeyUp(event) {
    if (!this.isEnabled) return;

    const key = event.key.toLowerCase();
    this.keyPressed.set(key, false);

    this.emit("keyup", { key, event });
  }

  /**
   * Handle mousemove events
   * @private
   */
  handleMouseMove(event) {
    if (!this.isEnabled) return;

    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;

    this.emit("mousemove", { x: this.mousePos.x, y: this.mousePos.y, event });
  }

  /**
   * Handle mousedown events
   * @private
   */
  handleMouseDown(event) {
    if (!this.isEnabled) return;

    const button = this.getMouseButton(event.button);
    this.mouseButtons[button] = true;

    this.emit("mousedown", { button, x: event.clientX, y: event.clientY, event });
  }

  /**
   * Handle mouseup events
   * @private
   */
  handleMouseUp(event) {
    if (!this.isEnabled) return;

    const button = this.getMouseButton(event.button);
    this.mouseButtons[button] = false;

    this.emit("mouseup", { button, x: event.clientX, y: event.clientY, event });
  }

  /**
   * Handle mouse wheel events
   * @private
   */
  handleMouseWheel(event) {
    if (!this.isEnabled) return;

    event.preventDefault();

    const direction = event.deltaY > 0 ? "down" : "up";
    const delta = Math.abs(event.deltaY);

    this.emit("mousewheel", { direction, delta, event });
  }

  /**
   * Convert mouse button number to string
   * @private
   * @param {number} button - Mouse button code
   * @returns {string} Button name
   */
  getMouseButton(button) {
    const buttonMap = { 0: "left", 1: "middle", 2: "right" };
    return buttonMap[button] || "unknown";
  }

  /**
   * Register an event listener for input events
   * @param {string} eventType - Type of event (keydown, keyup, mousemove, mousedown, mouseup, mousewheel)
   * @param {Function} callback - Callback function
   */
  on(eventType, callback) {
    if (typeof callback !== "function") {
      console.error("Callback must be a function");
      return;
    }

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType).push(callback);
  }

  /**
   * Remove an event listener
   * @param {string} eventType - Type of event
   * @param {Function} callback - Callback function to remove
   */
  off(eventType, callback) {
    const callbacks = this.listeners.get(eventType);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit an input event to all registered listeners
   * @private
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   */
  emit(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (!callbacks) return;

    for (const callback of callbacks) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in input listener for "${eventType}":`, error);
      }
    }
  }

  /**
   * Check if a key is currently pressed
   * @param {string} key - Key name (e.g., 'a', 'enter', 'arrowup')
   * @returns {boolean} True if key is pressed
   */
  isKeyPressed(key) {
    return this.keyPressed.get(key.toLowerCase()) === true;
  }

  /**
   * Check if a mouse button is currently pressed
   * @param {string} button - Button name (left, right, middle)
   * @returns {boolean} True if button is pressed
   */
  isMouseButtonPressed(button) {
    return this.mouseButtons[button.toLowerCase()] === true;
  }

  /**
   * Get current mouse position
   * @returns {Object} Object with x and y properties
   */
  getMousePosition() {
    return { x: this.mousePos.x, y: this.mousePos.y };
  }

  /**
   * Get all currently pressed keys
   * @returns {string[]} Array of pressed key names
   */
  getPressedKeys() {
    const pressed = [];
    for (const [key, isPressed] of this.keyPressed.entries()) {
      if (isPressed) {
        pressed.push(key);
      }
    }
    return pressed;
  }

  /**
   * Check if any keys are pressed
   * @returns {boolean} True if any key is pressed
   */
  hasAnyKeyPressed() {
    return this.getPressedKeys().length > 0;
  }

  /**
   * Check if any mouse button is pressed
   * @returns {boolean} True if any button is pressed
   */
  hasAnyMouseButtonPressed() {
    return (
      this.mouseButtons.left || this.mouseButtons.right || this.mouseButtons.middle
    );
  }

  /**
   * Enable input handling
   */
  enable() {
    this.isEnabled = true;
  }

  /**
   * Disable input handling
   */
  disable() {
    this.isEnabled = false;
  }

  /**
   * Clear all pressed keys and mouse button states
   */
  clearInputState() {
    this.keyPressed.clear();
    this.mouseButtons = { left: false, right: false, middle: false };
  }

  /**
   * Reset input handler to initial state
   */
  reset() {
    this.clearInputState();
    this.mousePos = { x: 0, y: 0 };
  }

  /**
   * Destroy the input handler and remove all event listeners
   */
  destroy() {
    if (!this.target) return;

    // Remove keyboard listeners
    this.target.removeEventListener("keydown", this.handleKeyDown);
    this.target.removeEventListener("keyup", this.handleKeyUp);

    // Remove mouse listeners
    this.target.removeEventListener("mousemove", this.handleMouseMove);
    this.target.removeEventListener("mousedown", this.handleMouseDown);
    this.target.removeEventListener("mouseup", this.handleMouseUp);
    this.target.removeEventListener("wheel", this.handleMouseWheel);

    // Clear state
    this.keyPressed.clear();
    this.listeners.clear();
    this.target = null;
    this.isEnabled = false;

    console.log("InputHandler destroyed");
  }
}

export default InputHandler;
