/**
 * AudioManager Class
 *
 * Manages all audio functionality including procedural ambient music generation,
 * sound effects, volume controls, and Web Audio API lifecycle management.
 */

import EventBus from "../game/EventBus.js";

class AudioManager {
  constructor() {
    this.isInitialized = false;
    this.audioContext = null;
    this.masterGainNode = null;
    this.musicGainNode = null;
    this.sfxGainNode = null;

    // Volume controls (0.0 to 1.0)
    this.masterVolume = 1.0;
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.isMuted = false;

    // Procedural music state
    this.musicNodes = [];
    this.musicTempo = 60; // BPM
    this.musicKey = "C"; // Root note for procedural generation
    this.ambientDrones = [];

    // Sound effect management
    this.soundEffects = new Map();
    this.activeEffects = new Set();

    // Procedural music parameters
    this.ambientFrequencies = [65.41, 98.0, 130.81, 196.0, 261.63]; // C2, G2, C3, G3, C4
    this.musicUpdateInterval = null;
    this.nextNoteTime = 0;
    this.noteResolution = 0.25; // Quarter note

    // Audio context state management
    this.contextState = "suspended";
    this.resumePromise = null;

    // EventBus integration
    this.eventBus = null;
    this.eventListeners = [];
  }

  /**
   * Initialize the audio system
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn("AudioManager already initialized");
      return;
    }

    try {
      console.log("Initializing AudioManager...");

      // Create audio context
      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      this.contextState = this.audioContext.state;

      // Create master gain node
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);

      // Create music and SFX gain nodes
      this.musicGainNode = this.audioContext.createGain();
      this.sfxGainNode = this.audioContext.createGain();

      this.musicGainNode.connect(this.masterGainNode);
      this.sfxGainNode.connect(this.masterGainNode);

      // Set initial volumes
      this.updateVolumes();

      // Setup procedural music generators
      this.initializeProceduralMusic();

      // Handle audio context state changes
      this.audioContext.addEventListener("statechange", () => {
        this.contextState = this.audioContext.state;
        console.log(`Audio context state: ${this.contextState}`);
      });

      // Setup EventBus integration for automatic sound triggering
      this.setupEventBus();

      this.isInitialized = true;
      console.log("AudioManager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AudioManager:", error);
      throw error;
    }
  }

  /**
   * Setup EventBus listeners for game events
   */
  setupEventBus() {
    try {
      this.eventBus = EventBus.getInstance();

      // Subscribe to game events for automatic sound triggering
      const unsubscribeMissionLaunch = this.eventBus.subscribe(
        "mission:launched",
        () => this.playMissionLaunchSFX(),
        this,
      );
      const unsubscribeMissionComplete = this.eventBus.subscribe(
        "mission:completed",
        () => this.playMissionCompleteSFX(),
        this,
      );
      const unsubscribeBudgetWarning = this.eventBus.subscribe(
        "budget:warning",
        () => this.playBudgetWarningSFX(),
        this,
      );
      const unsubscribeResearchComplete = this.eventBus.subscribe(
        "research:completed",
        () => this.playResearchCompleteSFX(),
        this,
      );
      const unsubscribeEventTriggered = this.eventBus.subscribe(
        "event:triggered",
        () => this.playEventNotificationSFX(),
        this,
      );

      // Store unsubscribe functions for cleanup
      this.eventListeners = [
        unsubscribeMissionLaunch,
        unsubscribeMissionComplete,
        unsubscribeBudgetWarning,
        unsubscribeResearchComplete,
        unsubscribeEventTriggered,
      ];
    } catch (error) {
      console.warn("Failed to setup EventBus listeners:", error);
    }
  }

  /**
   * Resume audio context if suspended (required for user interaction)
   */
  async resumeContext() {
    if (!this.audioContext) {
      return false;
    }

    if (this.audioContext.state === "suspended") {
      if (!this.resumePromise) {
        this.resumePromise = this.audioContext.resume();
      }
      await this.resumePromise;
      this.resumePromise = null;
      return true;
    }

    return this.audioContext.state === "running";
  }

  /**
   * Initialize procedural ambient music system
   */
  initializeProceduralMusic() {
    if (!this.audioContext) return;

    // Create ambient drone oscillators for space atmosphere
    this.ambientFrequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Configure oscillator for ambient drone
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);

      // Add slight detuning for organic feel
      const detune = (Math.random() - 0.5) * 10;
      oscillator.detune.setValueAtTime(detune, this.audioContext.currentTime);

      // Configure filter for warmth
      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(
        800 + Math.random() * 400,
        this.audioContext.currentTime,
      );
      filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);

      // Configure gain for subtle presence
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

      // Connect nodes
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.musicGainNode);

      // Store references
      this.ambientDrones.push({
        oscillator,
        gainNode,
        filterNode,
        baseFreq: freq,
        targetGain: 0.05 + Math.random() * 0.03,
      });

      // Start oscillator
      oscillator.start();
    });
  }

  /**
   * Start playing procedural ambient music
   */
  startAmbientMusic() {
    if (!this.isInitialized || this.isMuted) return;

    // Fade in ambient drones
    this.ambientDrones.forEach((drone, index) => {
      const fadeTime = 3.0 + Math.random() * 2.0; // Staggered fade-in
      const startTime = this.audioContext.currentTime + index * 0.5;

      drone.gainNode.gain.exponentialRampToValueAtTime(
        drone.targetGain,
        startTime + fadeTime,
      );

      // Add subtle frequency modulation
      this.modulateFrequency(drone, startTime);
    });

    // Start procedural note generation
    this.startProceduralNotes();

    console.log("Ambient music started");
  }

  /**
   * Stop ambient music
   */
  stopAmbientMusic() {
    if (!this.isInitialized) return;

    // Fade out ambient drones
    this.ambientDrones.forEach((drone) => {
      drone.gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + 2.0,
      );
    });

    // Stop procedural note generation
    if (this.musicUpdateInterval) {
      clearTimeout(this.musicUpdateInterval);
      this.musicUpdateInterval = null;
    }

    console.log("Ambient music stopped");
  }

  /**
   * Start procedural note generation
   */
  startProceduralNotes() {
    if (!this.audioContext) return;

    this.nextNoteTime = this.audioContext.currentTime;
    this.scheduleNote();
  }

  /**
   * Schedule the next procedural note
   */
  scheduleNote() {
    if (!this.audioContext || this.isMuted) {
      this.musicUpdateInterval = setTimeout(() => this.scheduleNote(), 100);
      return;
    }

    const secondsPerBeat = 60.0 / this.musicTempo;
    const nextNoteDelta = secondsPerBeat * this.noteResolution;

    // Only generate notes occasionally for ambient feel
    if (Math.random() < 0.3) {
      this.generateProceduralNote(this.nextNoteTime);
    }

    this.nextNoteTime += nextNoteDelta;

    // Schedule next note
    this.musicUpdateInterval = setTimeout(
      () => this.scheduleNote(),
      (this.nextNoteTime - this.audioContext.currentTime) * 1000,
    );
  }

  /**
   * Generate a single procedural note
   */
  generateProceduralNote(startTime) {
    if (!this.audioContext) return;

    const duration = 2.0 + Math.random() * 4.0; // 2-6 seconds
    const frequency =
      this.ambientFrequencies[
        Math.floor(Math.random() * this.ambientFrequencies.length)
      ] *
      (1 + Math.floor(Math.random() * 3));

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    // Configure oscillator
    oscillator.type = Math.random() < 0.7 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Configure filter
    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(1200 + Math.random() * 800, startTime);

    // Configure envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.02, startTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // Connect and start
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.musicGainNode);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    // Cleanup
    oscillator.addEventListener("ended", () => {
      oscillator.disconnect();
      gainNode.disconnect();
      filterNode.disconnect();
    });
  }

  /**
   * Add subtle frequency modulation to ambient drones
   */
  modulateFrequency(drone, startTime) {
    const lfoFreq = 0.1 + Math.random() * 0.2; // 0.1-0.3 Hz
    const modDepth = 2 + Math.random() * 3; // 2-5 Hz

    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(lfoFreq, startTime);
    lfoGain.gain.setValueAtTime(modDepth, startTime);

    lfo.connect(lfoGain);
    lfoGain.connect(drone.oscillator.frequency);

    lfo.start(startTime);

    // Store for cleanup
    drone.lfo = lfo;
    drone.lfoGain = lfoGain;
  }

  /**
   * Play a sound effect
   */
  async playSoundEffect(name, options = {}) {
    if (!this.isInitialized || this.isMuted) return null;

    try {
      await this.resumeContext();

      const {
        frequency = 440,
        duration = 0.5,
        type = "sine",
        volume = 1.0,
        fadeIn = 0.01,
        fadeOut = 0.1,
      } = options;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime,
      );

      // Envelope
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + fadeIn);
      gainNode.gain.linearRampToValueAtTime(0, now + duration - fadeOut);

      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);

      oscillator.start(now);
      oscillator.stop(now + duration);

      const effectId = `${name}-${Date.now()}`;
      this.activeEffects.add(effectId);

      oscillator.addEventListener("ended", () => {
        this.activeEffects.delete(effectId);
        oscillator.disconnect();
        gainNode.disconnect();
      });

      return effectId;
    } catch (error) {
      console.error(`Failed to play sound effect ${name}:`, error);
      return null;
    }
  }

  /**
   * Create common game sound effects
   */
  createUIClickEffect() {
    return this.playSoundEffect("ui-click", {
      frequency: 800,
      duration: 0.1,
      type: "square",
      volume: 0.5,
    });
  }

  createSuccessEffect() {
    return this.playSoundEffect("success", {
      frequency: 523, // C5
      duration: 0.3,
      type: "triangle",
      volume: 0.7,
    });
  }

  createErrorEffect() {
    return this.playSoundEffect("error", {
      frequency: 220, // A3
      duration: 0.2,
      type: "sawtooth",
      volume: 0.6,
    });
  }

  /**
   * Mission launch sound effect - ascending tone pattern
   */
  playMissionLaunchSFX() {
    return this.playSoundEffect("mission-launch", {
      frequency: 440, // A4
      duration: 0.8,
      type: "sine",
      volume: 0.8,
      fadeIn: 0.05,
      fadeOut: 0.2,
    });
  }

  /**
   * Mission complete sound effect - celebratory chord
   */
  playMissionCompleteSFX() {
    return this.playSoundEffect("mission-complete", {
      frequency: 523, // C5
      duration: 1.0,
      type: "triangle",
      volume: 0.9,
      fadeIn: 0.1,
      fadeOut: 0.3,
    });
  }

  /**
   * Budget warning sound effect - alert tone
   */
  playBudgetWarningSFX() {
    return this.playSoundEffect("budget-warning", {
      frequency: 880, // A5
      duration: 0.4,
      type: "square",
      volume: 0.7,
      fadeIn: 0.02,
      fadeOut: 0.1,
    });
  }

  /**
   * Research complete sound effect - achievement tone
   */
  playResearchCompleteSFX() {
    return this.playSoundEffect("research-complete", {
      frequency: 659, // E5
      duration: 0.6,
      type: "sine",
      volume: 0.85,
      fadeIn: 0.08,
      fadeOut: 0.15,
    });
  }

  /**
   * Event notification sound effect - notification ping
   */
  playEventNotificationSFX() {
    return this.playSoundEffect("event-notification", {
      frequency: 784, // G5
      duration: 0.3,
      type: "sine",
      volume: 0.7,
      fadeIn: 0.03,
      fadeOut: 0.1,
    });
  }

  /**
   * Public API: Play sound effect by name
   * @param {string} name - Name of the sound effect to play
   * @returns {Promise<string|null>} Effect ID or null if failed
   */
  playSFX(name) {
    const sfxMap = {
      "ui-click": () => this.createUIClickEffect(),
      "mission-launch": () => this.playMissionLaunchSFX(),
      "mission-complete": () => this.playMissionCompleteSFX(),
      "budget-warning": () => this.playBudgetWarningSFX(),
      "research-complete": () => this.playResearchCompleteSFX(),
      "event-notification": () => this.playEventNotificationSFX(),
      success: () => this.createSuccessEffect(),
      error: () => this.createErrorEffect(),
    };

    if (sfxMap[name]) {
      return sfxMap[name]();
    }

    console.warn(`Unknown sound effect: ${name}`);
    return null;
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * Set sound effects volume
   */
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.updateVolumes();

    if (this.isMuted) {
      this.stopAmbientMusic();
    } else {
      this.startAmbientMusic();
    }

    return this.isMuted;
  }

  /**
   * Update all volume levels
   */
  updateVolumes() {
    if (!this.isInitialized) return;

    const masterVol = this.isMuted ? 0 : this.masterVolume;

    this.masterGainNode.gain.setValueAtTime(
      masterVol,
      this.audioContext.currentTime,
    );
    this.musicGainNode.gain.setValueAtTime(
      this.musicVolume,
      this.audioContext.currentTime,
    );
    this.sfxGainNode.gain.setValueAtTime(
      this.sfxVolume,
      this.audioContext.currentTime,
    );
  }

  /**
   * Get current volume settings
   */
  getVolumeSettings() {
    return {
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isMuted: this.isMuted,
    };
  }

  /**
   * Get audio manager statistics
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      contextState: this.contextState,
      activeEffects: this.activeEffects.size,
      ambientDronesCount: this.ambientDrones.length,
      volumes: this.getVolumeSettings(),
      sampleRate: this.audioContext ? this.audioContext.sampleRate : 0,
      currentTime: this.audioContext ? this.audioContext.currentTime : 0,
    };
  }

  /**
   * Public API: Initialize audio manager
   * Alias for initialize() method
   */
  async init() {
    return this.initialize();
  }

  /**
   * Public API: Play ambient music
   * Alias for startAmbientMusic() method
   */
  playMusic() {
    return this.startAmbientMusic();
  }

  /**
   * Public API: Stop ambient music
   * Alias for stopAmbientMusic() method
   */
  stopMusic() {
    return this.stopAmbientMusic();
  }

  /**
   * Public API: Set volume for all audio
   * @param {number} level - Volume level (0.0 to 1.0)
   */
  setVolume(level) {
    this.setMasterVolume(level);
  }

  /**
   * Stop all audio and cleanup resources
   */
  destroy() {
    console.log("Destroying AudioManager...");

    // Unsubscribe from EventBus events
    if (this.eventListeners && this.eventListeners.length > 0) {
      this.eventListeners.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
      this.eventListeners = [];
    }

    // Stop ambient music
    this.stopAmbientMusic();

    // Cleanup ambient drones
    this.ambientDrones.forEach((drone) => {
      try {
        drone.oscillator.stop();
        drone.oscillator.disconnect();
        drone.gainNode.disconnect();
        drone.filterNode.disconnect();

        if (drone.lfo) {
          drone.lfo.stop();
          drone.lfo.disconnect();
          drone.lfoGain.disconnect();
        }
      } catch (error) {
        // Ignore errors during cleanup
      }
    });

    // Clear arrays and maps
    this.ambientDrones.length = 0;
    this.musicNodes.length = 0;
    this.soundEffects.clear();
    this.activeEffects.clear();

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Reset state
    this.isInitialized = false;
    this.contextState = "suspended";
    this.eventBus = null;

    console.log("AudioManager destroyed");
  }
}

export default AudioManager;
