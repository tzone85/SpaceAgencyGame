/**
 * Launch Sequence Scene
 *
 * Manages the complete launch sequence experience including countdown timer,
 * audio cues, rocket animation, and mission departure visualization.
 * Integrates with MissionSystem via EventBus to listen for mission:started events.
 */

import LaunchAnim from '../canvas/LaunchAnim.js';
import EventBus from '../game/EventBus.js';

class LaunchSequence {
  constructor(engine) {
    if (!engine) {
      throw new Error('Engine is required for LaunchSequence initialization');
    }

    this.engine = engine;
    this.renderer = engine.renderer;
    this.canvas = engine.canvas;

    // Scene state
    this.isActive = false;
    this.state = 'idle'; // idle, countdown, launch, complete
    this.startTime = 0;

    // Countdown properties
    this.countdownDuration = 10000; // 10 seconds
    this.countdownValue = 10;
    this.lastCountdownUpdate = 0;

    // Launch animation
    this.launchAnim = new LaunchAnim(this.renderer);

    // Mission parameters
    this.missionData = null;
    this.launchOutcome = 'success'; // Default to success, can be overridden
    this.missionId = null;

    // UI elements
    this.uiElements = {
      countdown: null,
      missionInfo: null,
      statusText: null
    };

    // Audio context and sounds
    this.audioContext = null;
    this.audioBuffers = {};
    this.audioEnabled = true;

    // Callbacks
    this.onLaunchComplete = null;
    this.onReturnToMissionTracking = null;

    // Event bus for mission integration
    this.eventBus = EventBus.getInstance();

    this.initializeAudio();
    this.initializeUI();
    this.subscribeMissionEvents();
  }

  /**
   * Initialize audio system
   */
  initializeAudio() {
    try {
      // Create audio context (requires user interaction)
      if (typeof AudioContext !== 'undefined') {
        this.audioContext = new AudioContext();
      } else if (typeof webkitAudioContext !== 'undefined') {
        this.audioContext = new webkitAudioContext();
      }

      if (this.audioContext) {
        console.log('Audio system initialized');
      } else {
        console.warn('Web Audio API not supported');
        this.audioEnabled = false;
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.audioEnabled = false;
    }
  }

  /**
   * Initialize UI elements
   */
  initializeUI() {
    // Create UI overlay div if it doesn't exist
    let uiOverlay = document.getElementById('launchSequenceUI');
    if (!uiOverlay) {
      uiOverlay = document.createElement('div');
      uiOverlay.id = 'launchSequenceUI';
      uiOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
        font-family: 'Courier New', monospace;
        color: white;
        display: none;
      `;
      document.body.appendChild(uiOverlay);
    }

    // Create countdown display
    const countdownDiv = document.createElement('div');
    countdownDiv.id = 'countdownDisplay';
    countdownDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 72px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      text-align: center;
    `;
    uiOverlay.appendChild(countdownDiv);

    // Create mission info panel
    const missionInfoDiv = document.createElement('div');
    missionInfoDiv.id = 'missionInfo';
    missionInfoDiv.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0,0,0,0.7);
      padding: 20px;
      border-radius: 10px;
      font-size: 16px;
      max-width: 300px;
      border: 2px solid #00ff00;
    `;
    uiOverlay.appendChild(missionInfoDiv);

    // Create status text
    const statusTextDiv = document.createElement('div');
    statusTextDiv.id = 'statusText';
    statusTextDiv.style.cssText = `
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 24px;
      text-align: center;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    `;
    uiOverlay.appendChild(statusTextDiv);

    this.uiElements.countdown = countdownDiv;
    this.uiElements.missionInfo = missionInfoDiv;
    this.uiElements.statusText = statusTextDiv;
    this.uiOverlay = uiOverlay;
  }

  /**
   * Subscribe to mission events from EventBus
   * @private
   */
  subscribeMissionEvents() {
    if (!this.eventBus) return;

    // Listen for mission start events from MissionSystem
    this.eventBus.subscribe('mission:started', this.#onMissionStarted, this);
  }

  /**
   * Handle mission:started event
   * @private
   */
  #onMissionStarted = (eventData) => {
    if (!eventData) return;

    const { missionId, missionName, crewIds = [], duration } = eventData;

    // Prepare mission data for launch sequence
    const missionData = {
      name: missionName || 'Mission',
      destination: 'Target Destination',
      payload: 'Standard Payload',
      crew: crewIds.length,
      duration: duration ? `${Math.ceil(duration)} hours` : 'Unknown'
    };

    // Start launch sequence automatically when mission is started
    this.missionId = missionId;
    this.startLaunchSequence(missionData, 'success');
  }

  /**
   * Start the launch sequence
   * @param {Object} missionData - Mission information
   * @param {string} outcome - Expected launch outcome ('success' or 'failure')
   * @param {Function} onComplete - Callback when launch is complete
   */
  startLaunchSequence(missionData = {}, outcome = 'success', onComplete = null) {
    this.isActive = true;
    this.state = 'countdown';
    this.startTime = performance.now();
    this.missionData = missionData;
    this.launchOutcome = outcome;
    this.onLaunchComplete = onComplete;

    // Reset countdown
    this.countdownValue = 10;
    this.lastCountdownUpdate = performance.now();

    // Show UI
    this.uiOverlay.style.display = 'block';

    // Update mission info
    this.updateMissionInfo();

    // Update status
    this.updateStatusText('PREPARING FOR LAUNCH...');

    // Resume audio context if suspended
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    console.log('Launch sequence started:', missionData);
  }

  /**
   * Update mission information display
   */
  updateMissionInfo() {
    if (!this.missionData) return;

    const defaultMission = {
      name: 'Mission Alpha-1',
      destination: 'Low Earth Orbit',
      payload: 'Communication Satellite',
      crew: 0,
      duration: '2 hours'
    };

    const mission = { ...defaultMission, ...this.missionData };

    // Clear existing content
    this.uiElements.missionInfo.textContent = '';

    // Create title
    const title = document.createElement('h3');
    title.textContent = `🚀 ${mission.name}`;
    this.uiElements.missionInfo.appendChild(title);

    // Create mission details
    const details = [
      ['Destination', mission.destination],
      ['Payload', mission.payload],
      ['Crew', `${mission.crew} members`],
      ['Duration', mission.duration]
    ];

    details.forEach(([label, value]) => {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `${label}: `;
      p.appendChild(strong);
      p.appendChild(document.createTextNode(value));
      this.uiElements.missionInfo.appendChild(p);
    });
  }

  /**
   * Update status text
   */
  updateStatusText(text) {
    if (this.uiElements.statusText) {
      this.uiElements.statusText.textContent = text;
    }
  }

  /**
   * Update scene state
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    if (!this.isActive) return;

    const elapsed = performance.now() - this.startTime;

    switch (this.state) {
      case 'countdown':
        this.updateCountdown(deltaTime);
        break;

      case 'launch':
        this.updateLaunch(deltaTime);
        break;

      case 'complete':
        this.updateComplete(deltaTime);
        break;
    }
  }

  /**
   * Update countdown phase
   */
  updateCountdown(deltaTime) {
    const now = performance.now();
    const timeSinceLastUpdate = now - this.lastCountdownUpdate;

    // Update countdown every second
    if (timeSinceLastUpdate >= 1000) {
      this.countdownValue--;
      this.lastCountdownUpdate = now;

      // Play countdown audio cue
      this.playCountdownBeep();

      // Update countdown display
      if (this.countdownValue > 0) {
        this.uiElements.countdown.textContent = this.countdownValue.toString();
        this.uiElements.countdown.style.color = this.countdownValue <= 3 ? '#ff0000' : '#ffffff';
      } else {
        this.uiElements.countdown.textContent = 'LAUNCH!';
        this.uiElements.countdown.style.color = '#00ff00';
        this.startLaunch();
      }
    }
  }

  /**
   * Start the rocket launch
   */
  startLaunch() {
    this.state = 'launch';
    this.updateStatusText('IGNITION SEQUENCE START...');

    // Hide countdown, start rocket animation
    this.uiElements.countdown.style.display = 'none';

    // Start launch animation with specified outcome
    this.launchAnim.startLaunch(this.launchOutcome);

    // Play launch audio
    this.playLaunchSound();
  }

  /**
   * Update launch phase
   */
  updateLaunch(deltaTime) {
    // Update launch animation
    this.launchAnim.update(deltaTime);

    // Update status based on current launch phase
    const currentPhase = this.launchAnim.getCurrentPhase();
    this.updateLaunchStatus(currentPhase);

    // Check if launch animation is complete
    if (!this.launchAnim.isAnimationPlaying()) {
      this.completeLaunch();
    }
  }

  /**
   * Update launch status text based on phase
   */
  updateLaunchStatus(phase) {
    const statusMessages = {
      ignition: 'IGNITION SEQUENCE START...',
      liftoff: 'LIFTOFF! WE HAVE LIFTOFF!',
      flight: 'ROCKET IN FLIGHT...',
      success: 'LAUNCH SUCCESSFUL! 🎉',
      failure: 'LAUNCH FAILURE DETECTED! ❌',
      complete: 'MISSION STATUS UPDATED'
    };

    if (statusMessages[phase]) {
      this.updateStatusText(statusMessages[phase]);
    }
  }

  /**
   * Complete the launch sequence
   */
  completeLaunch() {
    this.state = 'complete';

    const outcome = this.launchAnim.getLaunchOutcome();
    this.updateStatusText(
      outcome === 'success'
        ? 'LAUNCH SUCCESSFUL! Returning to Mission Control...'
        : 'LAUNCH FAILED! Investigating failure...'
    );

    // Show completion message briefly, then transition
    setTimeout(() => {
      this.transitionBackToMissionTracking();
    }, 3000);

    // Call completion callback
    if (this.onLaunchComplete) {
      this.onLaunchComplete(outcome, this.missionData);
    }
  }

  /**
   * Update complete phase
   */
  updateComplete(deltaTime) {
    // Could add any post-launch effects here
  }

  /**
   * Play countdown beep sound
   */
  playCountdownBeep() {
    if (!this.audioEnabled || !this.audioContext) return;

    try {
      // Generate a simple beep tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure the beep
      oscillator.frequency.setValueAtTime(
        this.countdownValue <= 3 ? 1000 : 800, // Higher pitch for final countdown
        this.audioContext.currentTime
      );
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.error('Error playing countdown beep:', error);
    }
  }

  /**
   * Play launch sound
   */
  playLaunchSound() {
    if (!this.audioEnabled || !this.audioContext) return;

    try {
      // Generate launch rumble sound using noise
      const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = buffer.getChannelData(0);

      // Generate brown noise for rumble effect
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Amplify
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure low-pass filter for rumble effect
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, this.audioContext.currentTime);

      // Fade in and out
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.5);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 1.5);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);

      source.start(this.audioContext.currentTime);
      source.stop(this.audioContext.currentTime + 2);
    } catch (error) {
      console.error('Error playing launch sound:', error);
    }
  }

  /**
   * Render the scene
   */
  render() {
    if (!this.isActive) return;

    // Clear the canvas with space background
    this.renderer.setClearColor(0.02, 0.02, 0.05, 1.0); // Dark space blue
    this.renderer.clear();

    // Render stars background
    this.renderStarField();

    // Render launch animation
    if (this.state === 'launch' || this.state === 'complete') {
      this.launchAnim.render();
    }

    // Render launch pad
    this.renderLaunchPad();
  }

  /**
   * Render simple star field background
   */
  renderStarField() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // Use 2D context for simple star rendering
    ctx.save();
    ctx.fillStyle = 'white';

    // Generate deterministic star positions
    const starCount = 100;
    for (let i = 0; i < starCount; i++) {
      const x = (i * 123456789) % this.canvas.width;
      const y = (i * 987654321) % this.canvas.height;
      const size = (i % 3) + 1;

      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Render launch pad
   */
  renderLaunchPad() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();

    // Launch pad base
    const padWidth = 200;
    const padHeight = 20;
    const padX = (this.canvas.width - padWidth) / 2;
    const padY = this.canvas.height - 80;

    ctx.fillStyle = '#444444';
    ctx.fillRect(padX, padY, padWidth, padHeight);

    // Support towers
    ctx.fillStyle = '#666666';
    ctx.fillRect(padX - 10, padY - 100, 20, 100);
    ctx.fillRect(padX + padWidth - 10, padY - 100, 20, 100);

    // Platform details
    ctx.fillStyle = '#555555';
    for (let i = 0; i < 5; i++) {
      const x = padX + (i * padWidth / 4);
      ctx.fillRect(x, padY - 5, 2, 25);
    }

    ctx.restore();
  }

  /**
   * Transition back to mission tracking
   */
  transitionBackToMissionTracking() {
    this.endLaunchSequence();

    if (this.onReturnToMissionTracking) {
      this.onReturnToMissionTracking();
    }
  }

  /**
   * End the launch sequence and clean up
   */
  endLaunchSequence() {
    this.isActive = false;
    this.state = 'idle';

    // Hide UI overlay
    if (this.uiOverlay) {
      this.uiOverlay.style.display = 'none';
    }

    // Reset UI elements
    if (this.uiElements.countdown) {
      this.uiElements.countdown.style.display = 'block';
      this.uiElements.countdown.textContent = '10';
      this.uiElements.countdown.style.color = '#ffffff';
    }

    // Stop launch animation
    this.launchAnim.stop();

    console.log('Launch sequence ended');
  }

  /**
   * Set callback for when launch sequence completes
   */
  setOnLaunchComplete(callback) {
    this.onLaunchComplete = callback;
  }

  /**
   * Set callback for returning to mission tracking
   */
  setOnReturnToMissionTracking(callback) {
    this.onReturnToMissionTracking = callback;
  }

  /**
   * Check if scene is currently active
   */
  isSceneActive() {
    return this.isActive;
  }

  /**
   * Get current scene state
   */
  getState() {
    return this.state;
  }

  /**
   * Enable or disable audio
   */
  setAudioEnabled(enabled) {
    this.audioEnabled = enabled;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.endLaunchSequence();

    // Unsubscribe from mission events
    if (this.eventBus) {
      this.eventBus.unsubscribe('mission:started', this.#onMissionStarted, this);
    }

    // Clean up launch animation
    if (this.launchAnim) {
      this.launchAnim.destroy();
    }

    // Clean up UI elements
    if (this.uiOverlay && this.uiOverlay.parentNode) {
      this.uiOverlay.parentNode.removeChild(this.uiOverlay);
    }

    // Clean up audio context
    if (this.audioContext) {
      this.audioContext.close();
    }

    console.log('LaunchSequence destroyed');
  }
}

export default LaunchSequence;