/**
 * Launch Sequence Tests
 *
 * Test suite for the LaunchSequence scene
 */

import LaunchSequence from '../../src/scenes/LaunchSequence.js';
import Engine from '../../src/core/engine.js';
import Renderer from '../../src/core/renderer.js';

// Mock WebGL context
const mockWebGLContext = {
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  ARRAY_BUFFER: 34962,
  STATIC_DRAW: 35044,
  DYNAMIC_DRAW: 35048,
  TRIANGLES: 4,
  POINTS: 0,
  FLOAT: 5126,
  COLOR_BUFFER_BIT: 16384,
  DEPTH_BUFFER_BIT: 256,
  BLEND: 3042,
  SRC_ALPHA: 770,
  ONE_MINUS_SRC_ALPHA: 771,
  COMPILE_STATUS: 35713,
  LINK_STATUS: 35714,

  createShader: jest.fn(() => ({})),
  createProgram: jest.fn(() => ({})),
  createBuffer: jest.fn(() => ({})),
  deleteShader: jest.fn(),
  deleteProgram: jest.fn(),
  deleteBuffer: jest.fn(),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  getShaderParameter: jest.fn(() => true),
  getProgramParameter: jest.fn(() => true),
  getShaderInfoLog: jest.fn(() => ''),
  getProgramInfoLog: jest.fn(() => ''),
  getAttribLocation: jest.fn(() => 0),
  getUniformLocation: jest.fn(() => ({})),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  uniform2f: jest.fn(),
  uniform1f: jest.fn(),
  uniformMatrix3fv: jest.fn(),
  drawArrays: jest.fn(),
  enable: jest.fn(),
  blendFunc: jest.fn(),
  viewport: jest.fn(),
  clearColor: jest.fn(),
  clear: jest.fn()
};

// Mock AudioContext
const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  sampleRate: 44100,
  createOscillator: jest.fn(() => ({
    frequency: { setValueAtTime: jest.fn() },
    type: 'sine',
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  })),
  createGain: jest.fn(() => ({
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn()
    },
    connect: jest.fn()
  })),
  createBuffer: jest.fn(() => ({
    getChannelData: jest.fn(() => new Float32Array(44100))
  })),
  createBufferSource: jest.fn(() => ({
    buffer: null,
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  })),
  createBiquadFilter: jest.fn(() => ({
    type: 'lowpass',
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn()
  })),
  destination: {},
  resume: jest.fn(),
  close: jest.fn()
};

describe('LaunchSequence', () => {
  let canvas;
  let engine;
  let launchSequence;

  beforeEach(() => {
    // Mock AudioContext globally
    global.AudioContext = jest.fn(() => mockAudioContext);
    global.webkitAudioContext = jest.fn(() => mockAudioContext);

    // Create canvas and mock WebGL context
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    // Mock getContext for both WebGL and 2D
    canvas.getContext = jest.fn((type) => {
      if (type === 'webgl2' || type === 'webgl') {
        return mockWebGLContext;
      }
      if (type === '2d') {
        return {
          save: jest.fn(),
          restore: jest.fn(),
          fillStyle: '',
          beginPath: jest.fn(),
          arc: jest.fn(),
          fill: jest.fn(),
          fillRect: jest.fn()
        };
      }
      return null;
    });

    document.body.appendChild(canvas);

    // Create engine with mocked renderer
    engine = new Engine();
    engine.canvas = canvas;
    engine.renderer = new Renderer(canvas);

    // Create launch sequence
    launchSequence = new LaunchSequence(engine);
  });

  afterEach(() => {
    if (launchSequence) {
      launchSequence.destroy();
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }

    // Clean up any UI elements that might have been created
    const uiOverlay = document.getElementById('launchSequenceUI');
    if (uiOverlay && uiOverlay.parentNode) {
      uiOverlay.parentNode.removeChild(uiOverlay);
    }

    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('should throw error if engine is not provided', () => {
      expect(() => {
        new LaunchSequence(null);
      }).toThrow('Engine is required for LaunchSequence initialization');
    });

    test('should initialize with valid engine', () => {
      expect(launchSequence).toBeDefined();
      expect(launchSequence.engine).toBe(engine);
      expect(launchSequence.renderer).toBe(engine.renderer);
      expect(launchSequence.canvas).toBe(engine.canvas);
      expect(launchSequence.isActive).toBe(false);
      expect(launchSequence.state).toBe('idle');
    });

    test('should initialize countdown properties', () => {
      expect(launchSequence.countdownDuration).toBe(10000);
      expect(launchSequence.countdownValue).toBe(10);
    });

    test('should initialize launch animation', () => {
      expect(launchSequence.launchAnim).toBeDefined();
    });

    test('should create UI overlay', () => {
      const uiOverlay = document.getElementById('launchSequenceUI');
      expect(uiOverlay).toBeTruthy();
      expect(uiOverlay.style.display).toBe('none'); // Hidden initially
    });

    test('should create countdown display element', () => {
      expect(launchSequence.uiElements.countdown).toBeTruthy();
      expect(launchSequence.uiElements.countdown.id).toBe('countdownDisplay');
    });

    test('should create mission info panel', () => {
      expect(launchSequence.uiElements.missionInfo).toBeTruthy();
      expect(launchSequence.uiElements.missionInfo.id).toBe('missionInfo');
    });

    test('should create status text element', () => {
      expect(launchSequence.uiElements.statusText).toBeTruthy();
      expect(launchSequence.uiElements.statusText.id).toBe('statusText');
    });
  });

  describe('audio system', () => {
    test('should initialize audio context', () => {
      expect(launchSequence.audioContext).toBeTruthy();
      expect(launchSequence.audioEnabled).toBe(true);
    });

    test('should handle audio initialization failure gracefully', () => {
      // Create new instance without AudioContext
      delete global.AudioContext;
      delete global.webkitAudioContext;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const sequence = new LaunchSequence(engine);

      expect(sequence.audioEnabled).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Web Audio API not supported');

      consoleSpy.mockRestore();

      // Clean up
      sequence.destroy();
    });

    test('should enable/disable audio', () => {
      expect(launchSequence.audioEnabled).toBe(true);

      launchSequence.setAudioEnabled(false);
      expect(launchSequence.audioEnabled).toBe(false);

      launchSequence.setAudioEnabled(true);
      expect(launchSequence.audioEnabled).toBe(true);
    });
  });

  describe('launch sequence control', () => {
    test('should start launch sequence with default parameters', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      launchSequence.startLaunchSequence();

      expect(launchSequence.isActive).toBe(true);
      expect(launchSequence.state).toBe('countdown');
      expect(launchSequence.launchOutcome).toBe('success');
      expect(launchSequence.countdownValue).toBe(10);
      expect(launchSequence.uiOverlay.style.display).toBe('block');
      expect(consoleSpy).toHaveBeenCalledWith('Launch sequence started:', {});

      consoleSpy.mockRestore();
    });

    test('should start launch sequence with custom mission data', () => {
      const missionData = {
        name: 'Test Mission',
        destination: 'Mars',
        payload: 'Rover',
        crew: 3
      };

      launchSequence.startLaunchSequence(missionData, 'failure');

      expect(launchSequence.missionData).toEqual(missionData);
      expect(launchSequence.launchOutcome).toBe('failure');
    });

    test('should set launch complete callback', () => {
      const callback = jest.fn();
      launchSequence.setOnLaunchComplete(callback);

      expect(launchSequence.onLaunchComplete).toBe(callback);
    });

    test('should set return to mission tracking callback', () => {
      const callback = jest.fn();
      launchSequence.setOnReturnToMissionTracking(callback);

      expect(launchSequence.onReturnToMissionTracking).toBe(callback);
    });

    test('should end launch sequence', () => {
      launchSequence.startLaunchSequence();
      expect(launchSequence.isActive).toBe(true);

      launchSequence.endLaunchSequence();

      expect(launchSequence.isActive).toBe(false);
      expect(launchSequence.state).toBe('idle');
      expect(launchSequence.uiOverlay.style.display).toBe('none');
    });
  });

  describe('mission information display', () => {
    test('should update mission info with default data', () => {
      launchSequence.missionData = {};
      launchSequence.updateMissionInfo();

      const missionInfoElement = launchSequence.uiElements.missionInfo;
      expect(missionInfoElement.children.length).toBeGreaterThan(0);

      // Check for default mission name
      const titleElement = missionInfoElement.querySelector('h3');
      expect(titleElement.textContent).toBe('🚀 Mission Alpha-1');
    });

    test('should update mission info with custom data', () => {
      launchSequence.missionData = {
        name: 'Apollo 11',
        destination: 'Moon',
        payload: 'Lunar Module',
        crew: 3
      };

      launchSequence.updateMissionInfo();

      const missionInfoElement = launchSequence.uiElements.missionInfo;
      const titleElement = missionInfoElement.querySelector('h3');
      expect(titleElement.textContent).toBe('🚀 Apollo 11');

      // Check that custom data appears in paragraphs
      const paragraphs = Array.from(missionInfoElement.querySelectorAll('p'));
      const destinationParagraph = paragraphs.find(p => p.textContent.includes('Moon'));
      expect(destinationParagraph).toBeTruthy();
    });

    test('should update status text', () => {
      const testMessage = 'Test Status Message';
      launchSequence.updateStatusText(testMessage);

      expect(launchSequence.uiElements.statusText.textContent).toBe(testMessage);
    });
  });

  describe('countdown functionality', () => {
    beforeEach(() => {
      jest.spyOn(performance, 'now')
        .mockReturnValueOnce(1000) // startTime
        .mockReturnValueOnce(1000) // lastCountdownUpdate
        .mockReturnValue(1000); // default return
    });

    afterEach(() => {
      performance.now.mockRestore();
    });

    test('should update countdown display every second', () => {
      launchSequence.startLaunchSequence();

      // Simulate 1 second passing
      performance.now.mockReturnValue(2000);
      launchSequence.updateCountdown(0.016);

      expect(launchSequence.countdownValue).toBe(9);
      expect(launchSequence.uiElements.countdown.textContent).toBe('9');
    });

    test('should change countdown color for final 3 seconds', () => {
      launchSequence.startLaunchSequence();
      launchSequence.countdownValue = 3;

      // Simulate 1 second passing
      performance.now.mockReturnValue(2000);
      launchSequence.updateCountdown(0.016);

      expect(launchSequence.uiElements.countdown.style.color).toBe('#ff0000');
    });

    test('should start launch when countdown reaches zero', () => {
      const startLaunchSpy = jest.spyOn(launchSequence, 'startLaunch');

      launchSequence.startLaunchSequence();
      launchSequence.countdownValue = 1;

      // Simulate 1 second passing
      performance.now.mockReturnValue(2000);
      launchSequence.updateCountdown(0.016);

      expect(launchSequence.uiElements.countdown.textContent).toBe('LAUNCH!');
      expect(launchSequence.uiElements.countdown.style.color).toBe('#00ff00');
      expect(startLaunchSpy).toHaveBeenCalled();
    });

    test('should play countdown beep audio', () => {
      const oscillatorMock = mockAudioContext.createOscillator();
      const gainMock = mockAudioContext.createGain();

      launchSequence.countdownValue = 5;
      launchSequence.playCountdownBeep();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(oscillatorMock.start).toHaveBeenCalled();
      expect(oscillatorMock.stop).toHaveBeenCalled();
    });
  });

  describe('launch phase', () => {
    test('should transition to launch state', () => {
      launchSequence.startLaunchSequence();

      launchSequence.startLaunch();

      expect(launchSequence.state).toBe('launch');
      expect(launchSequence.uiElements.statusText.textContent).toBe('IGNITION SEQUENCE START...');
      expect(launchSequence.uiElements.countdown.style.display).toBe('none');
    });

    test('should update launch status based on animation phase', () => {
      launchSequence.startLaunchSequence();
      launchSequence.startLaunch();

      launchSequence.updateLaunchStatus('liftoff');
      expect(launchSequence.uiElements.statusText.textContent).toBe('LIFTOFF! WE HAVE LIFTOFF!');

      launchSequence.updateLaunchStatus('success');
      expect(launchSequence.uiElements.statusText.textContent).toBe('LAUNCH SUCCESSFUL! 🎉');

      launchSequence.updateLaunchStatus('failure');
      expect(launchSequence.uiElements.statusText.textContent).toBe('LAUNCH FAILURE DETECTED! ❌');
    });

    test('should complete launch when animation finishes', () => {
      const completeLaunchSpy = jest.spyOn(launchSequence, 'completeLaunch');

      launchSequence.startLaunchSequence();
      launchSequence.startLaunch();

      // Mock launch animation as complete
      jest.spyOn(launchSequence.launchAnim, 'isAnimationPlaying').mockReturnValue(false);
      jest.spyOn(launchSequence.launchAnim, 'getLaunchOutcome').mockReturnValue('success');

      launchSequence.updateLaunch(0.016);

      expect(completeLaunchSpy).toHaveBeenCalled();
    });
  });

  describe('completion and cleanup', () => {
    test('should complete launch with success outcome', () => {
      const callback = jest.fn();
      launchSequence.setOnLaunchComplete(callback);

      jest.spyOn(launchSequence.launchAnim, 'getLaunchOutcome').mockReturnValue('success');

      launchSequence.completeLaunch();

      expect(launchSequence.state).toBe('complete');
      expect(launchSequence.uiElements.statusText.textContent).toContain('LAUNCH SUCCESSFUL!');
      expect(callback).toHaveBeenCalledWith('success', null);
    });

    test('should complete launch with failure outcome', () => {
      const callback = jest.fn();
      launchSequence.setOnLaunchComplete(callback);

      jest.spyOn(launchSequence.launchAnim, 'getLaunchOutcome').mockReturnValue('failure');

      launchSequence.completeLaunch();

      expect(launchSequence.state).toBe('complete');
      expect(launchSequence.uiElements.statusText.textContent).toContain('LAUNCH FAILED!');
      expect(callback).toHaveBeenCalledWith('failure', null);
    });

    test('should transition back to mission tracking after delay', (done) => {
      const transitionSpy = jest.spyOn(launchSequence, 'transitionBackToMissionTracking');

      // Mock setTimeout to execute immediately
      jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
        setTimeout(() => {
          callback();
          expect(transitionSpy).toHaveBeenCalled();
          done();
        }, 0);
      });

      launchSequence.completeLaunch();

      global.setTimeout.mockRestore();
    });
  });

  describe('rendering', () => {
    test('should not render when inactive', () => {
      launchSequence.render();

      expect(mockWebGLContext.clear).not.toHaveBeenCalled();
    });

    test('should render when active', () => {
      launchSequence.startLaunchSequence();
      launchSequence.render();

      expect(mockWebGLContext.clearColor).toHaveBeenCalledWith(0.02, 0.02, 0.05, 1.0);
      expect(mockWebGLContext.clear).toHaveBeenCalled();
    });

    test('should render launch animation during launch phase', () => {
      const renderSpy = jest.spyOn(launchSequence.launchAnim, 'render');

      launchSequence.startLaunchSequence();
      launchSequence.state = 'launch';
      launchSequence.render();

      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('state queries', () => {
    test('should return correct scene active state', () => {
      expect(launchSequence.isSceneActive()).toBe(false);

      launchSequence.startLaunchSequence();
      expect(launchSequence.isSceneActive()).toBe(true);
    });

    test('should return current state', () => {
      expect(launchSequence.getState()).toBe('idle');

      launchSequence.startLaunchSequence();
      expect(launchSequence.getState()).toBe('countdown');
    });
  });

  describe('cleanup and destruction', () => {
    test('should clean up resources on destroy', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      launchSequence.destroy();

      expect(mockAudioContext.close).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('LaunchSequence destroyed');

      consoleSpy.mockRestore();
    });

    test('should remove UI elements on destroy', () => {
      const uiOverlay = document.getElementById('launchSequenceUI');
      expect(uiOverlay).toBeTruthy();

      launchSequence.destroy();

      const uiOverlayAfter = document.getElementById('launchSequenceUI');
      expect(uiOverlayAfter).toBeFalsy();
    });

    test('should end active launch sequence on destroy', () => {
      launchSequence.startLaunchSequence();
      expect(launchSequence.isActive).toBe(true);

      launchSequence.destroy();

      expect(launchSequence.isActive).toBe(false);
    });
  });
});