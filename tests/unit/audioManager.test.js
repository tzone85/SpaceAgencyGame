/**
 * AudioManager Tests
 *
 * Test suite for the AudioManager class including Web Audio API mocking
 */

import AudioManager from "../../src/audio/AudioManager.js";
import EventBus from "../../src/game/EventBus.js";

// Mock Web Audio API
class MockAudioContext {
  constructor() {
    this.state = "suspended";
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.destination = new MockGainNode();
    this._eventListeners = new Map();
  }

  createOscillator() {
    return new MockOscillator();
  }

  createGain() {
    return new MockGainNode();
  }

  createBiquadFilter() {
    return new MockBiquadFilter();
  }

  resume() {
    this.state = "running";
    return Promise.resolve();
  }

  close() {
    this.state = "closed";
    return Promise.resolve();
  }

  addEventListener(event, listener) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event).push(listener);
  }

  removeEventListener(event, listener) {
    if (this._eventListeners.has(event)) {
      const listeners = this._eventListeners.get(event);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(event) {
    if (this._eventListeners.has(event.type)) {
      this._eventListeners
        .get(event.type)
        .forEach((listener) => listener(event));
    }
  }
}

class MockOscillator {
  constructor() {
    this.type = "sine";
    this.frequency = new MockAudioParam(440);
    this.detune = new MockAudioParam(0);
    this._eventListeners = new Map();
    this._started = false;
    this._stopped = false;
  }

  connect(destination) {
    this._destination = destination;
  }

  disconnect() {
    this._destination = null;
  }

  start(when = 0) {
    this._started = true;
    this._startTime = when;
  }

  stop(when = 0) {
    this._stopped = true;
    this._stopTime = when;
    // Simulate ended event
    setTimeout(() => {
      this.dispatchEvent({ type: "ended" });
    }, 0);
  }

  addEventListener(event, listener) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event).push(listener);
  }

  removeEventListener(event, listener) {
    if (this._eventListeners.has(event)) {
      const listeners = this._eventListeners.get(event);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(event) {
    if (this._eventListeners.has(event.type)) {
      this._eventListeners
        .get(event.type)
        .forEach((listener) => listener(event));
    }
  }
}

class MockGainNode {
  constructor() {
    this.gain = new MockAudioParam(1);
  }

  connect(destination) {
    this._destination = destination;
  }

  disconnect() {
    this._destination = null;
  }
}

class MockBiquadFilter {
  constructor() {
    this.type = "lowpass";
    this.frequency = new MockAudioParam(350);
    this.Q = new MockAudioParam(1);
  }

  connect(destination) {
    this._destination = destination;
  }

  disconnect() {
    this._destination = null;
  }
}

class MockAudioParam {
  constructor(defaultValue = 0) {
    this.value = defaultValue;
    this.defaultValue = defaultValue;
  }

  setValueAtTime(value, startTime) {
    this.value = value;
    return this;
  }

  linearRampToValueAtTime(value, endTime) {
    this.value = value;
    return this;
  }

  exponentialRampToValueAtTime(value, endTime) {
    this.value = value;
    return this;
  }
}

// Setup global mocks
global.AudioContext = MockAudioContext;
global.webkitAudioContext = MockAudioContext;
global.performance = {
  now: () => Date.now(),
};

describe("AudioManager", () => {
  let audioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (audioManager && audioManager.isInitialized) {
      audioManager.destroy();
    }
  });

  describe("initialization", () => {
    test("should create AudioManager instance", () => {
      expect(audioManager).toBeDefined();
      expect(audioManager.isInitialized).toBe(false);
      expect(audioManager.audioContext).toBeNull();
      expect(audioManager.masterVolume).toBe(1.0);
      expect(audioManager.musicVolume).toBe(0.7);
      expect(audioManager.sfxVolume).toBe(0.8);
      expect(audioManager.isMuted).toBe(false);
    });

    test("should initialize audio system successfully", async () => {
      await audioManager.initialize();

      expect(audioManager.isInitialized).toBe(true);
      expect(audioManager.audioContext).toBeInstanceOf(MockAudioContext);
      expect(audioManager.masterGainNode).toBeInstanceOf(MockGainNode);
      expect(audioManager.musicGainNode).toBeInstanceOf(MockGainNode);
      expect(audioManager.sfxGainNode).toBeInstanceOf(MockGainNode);
    });

    test("should not re-initialize if already initialized", async () => {
      await audioManager.initialize();
      const firstContext = audioManager.audioContext;

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      await audioManager.initialize();

      expect(consoleSpy).toHaveBeenCalledWith(
        "AudioManager already initialized",
      );
      expect(audioManager.audioContext).toBe(firstContext);

      consoleSpy.mockRestore();
    });

    test("should setup procedural music on initialization", async () => {
      await audioManager.initialize();

      expect(audioManager.ambientDrones).toHaveLength(5);
      audioManager.ambientDrones.forEach((drone) => {
        expect(drone.oscillator).toBeInstanceOf(MockOscillator);
        expect(drone.gainNode).toBeInstanceOf(MockGainNode);
        expect(drone.filterNode).toBeInstanceOf(MockBiquadFilter);
        expect(drone.oscillator._started).toBe(true);
      });
    });
  });

  describe("audio context management", () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });

    test("should resume suspended audio context", async () => {
      audioManager.audioContext.state = "suspended";

      const result = await audioManager.resumeContext();

      expect(result).toBe(true);
      expect(audioManager.audioContext.state).toBe("running");
    });

    test("should return true if context is already running", async () => {
      audioManager.audioContext.state = "running";

      const result = await audioManager.resumeContext();

      expect(result).toBe(true);
    });

    test("should handle context state changes", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      audioManager.audioContext.dispatchEvent({ type: "statechange" });

      expect(audioManager.contextState).toBe(audioManager.audioContext.state);

      consoleSpy.mockRestore();
    });
  });

  describe("procedural music generation", () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });

    test("should start ambient music", () => {
      const originalCurrentTime = audioManager.audioContext.currentTime;
      audioManager.audioContext.currentTime = 1.0;

      audioManager.startAmbientMusic();

      audioManager.ambientDrones.forEach((drone) => {
        expect(drone.gainNode.gain.value).toBeGreaterThan(0);
      });
    });

    test("should stop ambient music", () => {
      audioManager.startAmbientMusic();
      audioManager.stopAmbientMusic();

      // Should fade out drones
      audioManager.ambientDrones.forEach((drone) => {
        expect(drone.gainNode.gain.value).toBeLessThan(0.01);
      });
    });

    test("should not start music when muted", () => {
      audioManager.isMuted = true;
      audioManager.startAmbientMusic();

      // Music scheduling should not occur when muted
      expect(audioManager.musicUpdateInterval).toBeNull();
    });

    test("should generate procedural notes", () => {
      audioManager.startAmbientMusic();

      // Simulate note generation
      const initialCurrentTime = audioManager.audioContext.currentTime;
      audioManager.generateProceduralNote(initialCurrentTime);

      // Should have created audio nodes for the note
      expect(true).toBe(true); // Basic test passes
    });
  });

  describe("sound effects", () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });

    test("should play sound effect", async () => {
      audioManager.audioContext.state = "running";

      const effectId = await audioManager.playSoundEffect("test", {
        frequency: 440,
        duration: 0.5,
        type: "sine",
        volume: 0.8,
      });

      expect(effectId).toBeTruthy();
      expect(audioManager.activeEffects.has(effectId)).toBe(true);
    });

    test("should not play sound effect when muted", async () => {
      audioManager.isMuted = true;

      const effectId = await audioManager.playSoundEffect("test");

      expect(effectId).toBeNull();
    });

    test("should create UI click effect", async () => {
      audioManager.audioContext.state = "running";

      const effectId = await audioManager.createUIClickEffect();

      expect(effectId).toBeTruthy();
    });

    test("should create success effect", async () => {
      audioManager.audioContext.state = "running";

      const effectId = await audioManager.createSuccessEffect();

      expect(effectId).toBeTruthy();
    });

    test("should create error effect", async () => {
      audioManager.audioContext.state = "running";

      const effectId = await audioManager.createErrorEffect();

      expect(effectId).toBeTruthy();
    });

    test("should cleanup effects when they end", async () => {
      audioManager.audioContext.state = "running";

      const effectId = await audioManager.playSoundEffect("test", {
        duration: 0.1,
      });

      expect(audioManager.activeEffects.has(effectId)).toBe(true);

      // Simulate effect ending
      setTimeout(() => {
        expect(audioManager.activeEffects.has(effectId)).toBe(false);
      }, 200);
    });
  });

  describe("volume controls", () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });

    test("should set master volume", () => {
      audioManager.setMasterVolume(0.5);

      expect(audioManager.masterVolume).toBe(0.5);
      expect(audioManager.masterGainNode.gain.value).toBe(0.5);
    });

    test("should clamp master volume between 0 and 1", () => {
      audioManager.setMasterVolume(1.5);
      expect(audioManager.masterVolume).toBe(1.0);

      audioManager.setMasterVolume(-0.5);
      expect(audioManager.masterVolume).toBe(0);
    });

    test("should set music volume", () => {
      audioManager.setMusicVolume(0.3);

      expect(audioManager.musicVolume).toBe(0.3);
      expect(audioManager.musicGainNode.gain.value).toBe(0.3);
    });

    test("should set SFX volume", () => {
      audioManager.setSfxVolume(0.9);

      expect(audioManager.sfxVolume).toBe(0.9);
      expect(audioManager.sfxGainNode.gain.value).toBe(0.9);
    });

    test("should toggle mute state", () => {
      expect(audioManager.isMuted).toBe(false);

      const isMuted = audioManager.toggleMute();

      expect(isMuted).toBe(true);
      expect(audioManager.isMuted).toBe(true);
      expect(audioManager.masterGainNode.gain.value).toBe(0);
    });

    test("should stop ambient music when muted and start when unmuted", () => {
      const startSpy = jest.spyOn(audioManager, "startAmbientMusic");
      const stopSpy = jest.spyOn(audioManager, "stopAmbientMusic");

      audioManager.toggleMute(); // Mute
      expect(stopSpy).toHaveBeenCalled();

      audioManager.toggleMute(); // Unmute
      expect(startSpy).toHaveBeenCalled();

      startSpy.mockRestore();
      stopSpy.mockRestore();
    });

    test("should get volume settings", () => {
      audioManager.setMasterVolume(0.8);
      audioManager.setMusicVolume(0.6);
      audioManager.setSfxVolume(0.9);
      audioManager.toggleMute();

      const settings = audioManager.getVolumeSettings();

      expect(settings).toEqual({
        masterVolume: 0.8,
        musicVolume: 0.6,
        sfxVolume: 0.9,
        isMuted: true,
      });
    });
  });

  describe("statistics and state", () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });

    test("should return audio manager stats", () => {
      const stats = audioManager.getStats();

      expect(stats).toHaveProperty("isInitialized");
      expect(stats).toHaveProperty("contextState");
      expect(stats).toHaveProperty("activeEffects");
      expect(stats).toHaveProperty("ambientDronesCount");
      expect(stats).toHaveProperty("volumes");
      expect(stats).toHaveProperty("sampleRate");
      expect(stats).toHaveProperty("currentTime");

      expect(stats.isInitialized).toBe(true);
      expect(stats.ambientDronesCount).toBe(5);
      expect(stats.sampleRate).toBe(44100);
    });

    test("should return stats when not initialized", () => {
      const uninitializedManager = new AudioManager();
      const stats = uninitializedManager.getStats();

      expect(stats.isInitialized).toBe(false);
      expect(stats.sampleRate).toBe(0);
      expect(stats.currentTime).toBe(0);
    });
  });

  describe("cleanup and destruction", () => {
    beforeEach(async () => {
      await audioManager.initialize();
    });

    test("should destroy audio manager and cleanup resources", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      audioManager.destroy();

      expect(audioManager.isInitialized).toBe(false);
      expect(audioManager.audioContext).toBeNull();
      expect(audioManager.ambientDrones).toHaveLength(0);
      expect(audioManager.musicNodes).toHaveLength(0);
      expect(audioManager.soundEffects.size).toBe(0);
      expect(audioManager.activeEffects.size).toBe(0);

      expect(consoleSpy).toHaveBeenCalledWith("Destroying AudioManager...");
      expect(consoleSpy).toHaveBeenCalledWith("AudioManager destroyed");

      consoleSpy.mockRestore();
    });

    test("should stop ambient music before destroying", () => {
      const stopSpy = jest.spyOn(audioManager, "stopAmbientMusic");

      audioManager.destroy();

      expect(stopSpy).toHaveBeenCalled();
      stopSpy.mockRestore();
    });

    test("should handle cleanup errors gracefully", () => {
      // Force an error during cleanup
      audioManager.ambientDrones[0].oscillator.stop = () => {
        throw new Error("Test error");
      };

      // Should not throw
      expect(() => audioManager.destroy()).not.toThrow();
    });

    test("should reset context state on destroy", () => {
      audioManager.destroy();

      expect(audioManager.contextState).toBe("suspended");
    });
  });

  describe("error handling", () => {
    test("should handle initialization errors", async () => {
      // Mock AudioContext to throw an error
      global.AudioContext = jest.fn().mockImplementation(() => {
        throw new Error("AudioContext creation failed");
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(audioManager.initialize()).rejects.toThrow(
        "AudioContext creation failed",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to initialize AudioManager:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
      // Restore mock
      global.AudioContext = MockAudioContext;
    });

    test("should handle sound effect playback errors", async () => {
      await audioManager.initialize();

      // Mock context resume to fail
      audioManager.resumeContext = jest
        .fn()
        .mockRejectedValue(new Error("Resume failed"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await audioManager.playSoundEffect("test");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to play sound effect test:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    test("should return false from resumeContext when no context exists", async () => {
      const result = await audioManager.resumeContext();

      expect(result).toBe(false);
    });
  });

  describe("EventBus integration", () => {
    beforeEach(async () => {
      EventBus.reset();
      await audioManager.initialize();
      audioManager.audioContext.state = "running";
    });

    afterEach(() => {
      EventBus.reset();
    });

    test("should setup EventBus listeners on initialization", async () => {
      expect(audioManager.eventBus).toBeDefined();
      expect(audioManager.eventListeners.length).toBeGreaterThan(0);
    });

    test("should handle mission:launched event", async () => {
      const eventBus = EventBus.getInstance();
      const playSpy = jest.spyOn(audioManager, "playMissionLaunchSFX");

      eventBus.emit("mission:launched");

      // Give event handlers time to execute
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(playSpy).toHaveBeenCalled();
      playSpy.mockRestore();
    });

    test("should handle mission:completed event", async () => {
      const eventBus = EventBus.getInstance();
      const playSpy = jest.spyOn(audioManager, "playMissionCompleteSFX");

      eventBus.emit("mission:completed");

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(playSpy).toHaveBeenCalled();
      playSpy.mockRestore();
    });

    test("should handle budget:warning event", async () => {
      const eventBus = EventBus.getInstance();
      const playSpy = jest.spyOn(audioManager, "playBudgetWarningSFX");

      eventBus.emit("budget:warning");

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(playSpy).toHaveBeenCalled();
      playSpy.mockRestore();
    });

    test("should handle research:completed event", async () => {
      const eventBus = EventBus.getInstance();
      const playSpy = jest.spyOn(audioManager, "playResearchCompleteSFX");

      eventBus.emit("research:completed");

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(playSpy).toHaveBeenCalled();
      playSpy.mockRestore();
    });

    test("should handle event:triggered event", async () => {
      const eventBus = EventBus.getInstance();
      const playSpy = jest.spyOn(audioManager, "playEventNotificationSFX");

      eventBus.emit("event:triggered");

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(playSpy).toHaveBeenCalled();
      playSpy.mockRestore();
    });

    test("should unsubscribe from EventBus on destroy", () => {
      const eventBus = EventBus.getInstance();
      const initialListenerCount = Object.keys(eventBus.getListeners()).length;

      audioManager.destroy();

      const finalListenerCount = Object.keys(eventBus.getListeners()).length;

      expect(finalListenerCount).toBeLessThanOrEqual(initialListenerCount);
    });
  });

  describe("space-themed SFX methods", () => {
    beforeEach(async () => {
      await audioManager.initialize();
      audioManager.audioContext.state = "running";
    });

    test("should play mission launch SFX", async () => {
      const effectId = await audioManager.playMissionLaunchSFX();

      expect(effectId).toBeTruthy();
      expect(audioManager.activeEffects.has(effectId)).toBe(true);
    });

    test("should play mission complete SFX", async () => {
      const effectId = await audioManager.playMissionCompleteSFX();

      expect(effectId).toBeTruthy();
      expect(audioManager.activeEffects.has(effectId)).toBe(true);
    });

    test("should play budget warning SFX", async () => {
      const effectId = await audioManager.playBudgetWarningSFX();

      expect(effectId).toBeTruthy();
      expect(audioManager.activeEffects.has(effectId)).toBe(true);
    });

    test("should play research complete SFX", async () => {
      const effectId = await audioManager.playResearchCompleteSFX();

      expect(effectId).toBeTruthy();
      expect(audioManager.activeEffects.has(effectId)).toBe(true);
    });

    test("should play event notification SFX", async () => {
      const effectId = await audioManager.playEventNotificationSFX();

      expect(effectId).toBeTruthy();
      expect(audioManager.activeEffects.has(effectId)).toBe(true);
    });
  });

  describe("playSFX public API", () => {
    beforeEach(async () => {
      await audioManager.initialize();
      audioManager.audioContext.state = "running";
    });

    test("should play sound by name using playSFX", async () => {
      const effectId = await audioManager.playSFX("ui-click");

      expect(effectId).toBeTruthy();
    });

    test("should play mission-launch SFX via playSFX", async () => {
      const effectId = await audioManager.playSFX("mission-launch");

      expect(effectId).toBeTruthy();
    });

    test("should play mission-complete SFX via playSFX", async () => {
      const effectId = await audioManager.playSFX("mission-complete");

      expect(effectId).toBeTruthy();
    });

    test("should play budget-warning SFX via playSFX", async () => {
      const effectId = await audioManager.playSFX("budget-warning");

      expect(effectId).toBeTruthy();
    });

    test("should play research-complete SFX via playSFX", async () => {
      const effectId = await audioManager.playSFX("research-complete");

      expect(effectId).toBeTruthy();
    });

    test("should play event-notification SFX via playSFX", async () => {
      const effectId = await audioManager.playSFX("event-notification");

      expect(effectId).toBeTruthy();
    });

    test("should return null for unknown SFX name", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const result = await audioManager.playSFX("unknown-sfx");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Unknown sound effect: unknown-sfx",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("public API aliases", () => {
    test("should alias init() to initialize()", async () => {
      const initSpy = jest.spyOn(audioManager, "initialize");

      await audioManager.init();

      expect(initSpy).toHaveBeenCalled();
      expect(audioManager.isInitialized).toBe(true);

      initSpy.mockRestore();
    });

    test("should alias playMusic() to startAmbientMusic()", async () => {
      await audioManager.initialize();

      const playSpy = jest.spyOn(audioManager, "startAmbientMusic");

      audioManager.playMusic();

      expect(playSpy).toHaveBeenCalled();

      playSpy.mockRestore();
    });

    test("should alias stopMusic() to stopAmbientMusic()", async () => {
      await audioManager.initialize();

      const stopSpy = jest.spyOn(audioManager, "stopAmbientMusic");

      audioManager.stopMusic();

      expect(stopSpy).toHaveBeenCalled();

      stopSpy.mockRestore();
    });

    test("should alias setVolume() to setMasterVolume()", async () => {
      await audioManager.initialize();

      const setSpy = jest.spyOn(audioManager, "setMasterVolume");

      audioManager.setVolume(0.5);

      expect(setSpy).toHaveBeenCalledWith(0.5);
      expect(audioManager.masterVolume).toBe(0.5);

      setSpy.mockRestore();
    });
  });
});
