import LaunchSequence from "../../src/scenes/LaunchSequence.js";
import EventBus from "../../src/game/EventBus.js";

describe("Launch Sequence Scene", () => {
  let launchSequence;
  let mockEngine;
  let eventBus;
  let mockCanvas;
  let mockRenderer;

  beforeEach(() => {
    // Reset EventBus singleton
    EventBus.instance = null;
    eventBus = EventBus.getInstance();

    // Mock canvas context
    mockCanvas = {
      width: 800,
      height: 600,
      getContext: jest.fn(() => ({
        save: jest.fn(),
        restore: jest.fn(),
        fillStyle: "",
        fillRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
      })),
    };

    // Mock WebGL context
    const mockWebGLContext = {
      createBuffer: jest.fn(() => ({})),
      createProgram: jest.fn(() => ({})),
      useProgram: jest.fn(),
      getUniformLocation: jest.fn(() => null),
      uniform2f: jest.fn(),
      uniformMatrix3fv: jest.fn(),
      bindBuffer: jest.fn(),
      vertexAttribPointer: jest.fn(),
      enableVertexAttribArray: jest.fn(),
      drawArrays: jest.fn(),
      bufferData: jest.fn(),
      uniform1f: jest.fn(),
      blendFunc: jest.fn(),
      enable: jest.fn(),
      getAttribLocation: jest.fn(() => 0),
      deleteProgram: jest.fn(),
      deleteBuffer: jest.fn(),
      ARRAY_BUFFER: 34962,
      TRIANGLES: 4,
      POINTS: 0,
      DYNAMIC_DRAW: 35048,
      BLEND: 3042,
      SRC_ALPHA: 770,
      ONE_MINUS_SRC_ALPHA: 771,
      FLOAT: 5126,
    };

    // Mock renderer
    mockRenderer = {
      getContext: jest.fn(() => mockWebGLContext),
      getCanvasDimensions: jest.fn(() => ({ width: 800, height: 600 })),
      createShaderProgram: jest.fn(() => ({})),
      createBuffer: jest.fn(() => ({})),
      setClearColor: jest.fn(),
      clear: jest.fn(),
    };

    // Mock engine
    mockEngine = {
      canvas: mockCanvas,
      renderer: mockRenderer,
    };

    // Create LaunchSequence instance with inline LaunchAnim mock
    launchSequence = new LaunchSequence(mockEngine);

    // Replace LaunchAnim with a mock
    launchSequence.launchAnim = {
      startLaunch: jest.fn(),
      update: jest.fn(),
      render: jest.fn(),
      stop: jest.fn(),
      destroy: jest.fn(),
      isAnimationPlaying: jest.fn(() => false),
      getCurrentPhase: jest.fn(() => "complete"),
      getLaunchOutcome: jest.fn(() => "success"),
    };
  });

  afterEach(() => {
    if (launchSequence) {
      launchSequence.destroy();
    }
  });

  describe("Initialization", () => {
    test("should export LaunchSequence class", () => {
      expect(LaunchSequence).toBeDefined();
      expect(typeof LaunchSequence).toBe("function");
    });

    test("should require engine parameter", () => {
      expect(() => new LaunchSequence()).toThrow(
        "Engine is required for LaunchSequence initialization"
      );
    });

    test("should initialize with correct default state", () => {
      expect(launchSequence.isActive).toBe(false);
      expect(launchSequence.state).toBe("idle");
      expect(launchSequence.countdownValue).toBe(10);
      expect(launchSequence.launchOutcome).toBe("success");
    });

    test("should create UI elements on initialization", () => {
      expect(launchSequence.uiElements.countdown).toBeDefined();
      expect(launchSequence.uiElements.missionInfo).toBeDefined();
      expect(launchSequence.uiElements.statusText).toBeDefined();
      expect(launchSequence.uiOverlay).toBeDefined();
    });

    test("should initialize EventBus instance", () => {
      expect(launchSequence.eventBus).toBeDefined();
      expect(launchSequence.eventBus).toBe(eventBus);
    });
  });

  describe("Countdown Timer", () => {
    test("should display countdown on scene start", () => {
      const missionData = { name: "Test Mission" };
      launchSequence.startLaunchSequence(missionData);

      expect(launchSequence.isActive).toBe(true);
      expect(launchSequence.state).toBe("countdown");
      expect(launchSequence.uiOverlay.style.display).toBe("block");
    });

    test("should update countdown value every second", (done) => {
      const missionData = { name: "Test Mission" };
      launchSequence.startLaunchSequence(missionData);

      const initialCountdown = launchSequence.countdownValue;

      // Simulate update for 1.1 seconds
      setTimeout(() => {
        launchSequence.lastCountdownUpdate = performance.now() - 1100;
        launchSequence.updateCountdown(0.1);

        // The countdown should have decremented
        expect(launchSequence.countdownValue).toBeLessThan(initialCountdown);
        expect(launchSequence.uiElements.countdown.textContent).toBe(
          launchSequence.countdownValue.toString()
        );
        done();
      }, 100);
    });

    test("should change countdown color to red in final 3 seconds", () => {
      const missionData = { name: "Test Mission" };
      launchSequence.startLaunchSequence(missionData);

      // Simulate countdown to 3 seconds
      launchSequence.countdownValue = 3;
      launchSequence.uiElements.countdown.textContent = "3";

      // Manually update to trigger color change
      launchSequence.lastCountdownUpdate = performance.now() - 1000;
      launchSequence.updateCountdown(0);

      // CSS color value might be in rgb format or hex depending on browser
      const color = launchSequence.uiElements.countdown.style.color;
      expect(color === "#ff0000" || color === "rgb(255, 0, 0)").toBe(true);
    });

    test("should transition from countdown to launch at zero", (done) => {
      const missionData = { name: "Test Mission" };
      launchSequence.startLaunchSequence(missionData);

      // Set countdown to 0
      launchSequence.countdownValue = 1;
      launchSequence.lastCountdownUpdate = performance.now() - 1100;

      launchSequence.updateCountdown(0.1);

      // The state should transition to launch
      setTimeout(() => {
        expect(launchSequence.state).toBe("launch");
        done();
      }, 50);
    });
  });

  describe("Mission Info Display", () => {
    test("should display mission information", () => {
      const missionData = {
        name: "Test Mission",
        destination: "Moon",
        payload: "Lunar Probe",
        crew: 3,
        duration: "10 days",
      };

      launchSequence.startLaunchSequence(missionData);
      launchSequence.updateMissionInfo();

      const missionInfo = launchSequence.uiElements.missionInfo;
      const text = missionInfo.textContent;

      expect(text).toContain("Test Mission");
      expect(text).toContain("Moon");
      expect(text).toContain("Lunar Probe");
      expect(text).toContain("3");
    });

    test("should use default mission data if not provided", () => {
      launchSequence.startLaunchSequence({});
      launchSequence.updateMissionInfo();

      const missionInfo = launchSequence.uiElements.missionInfo;
      const text = missionInfo.textContent;

      expect(text).toContain("Mission Alpha-1");
      expect(text).toContain("Low Earth Orbit");
    });

    test("should merge provided mission data with defaults", () => {
      const missionData = {
        name: "Custom Mission",
        destination: "Mars",
      };

      launchSequence.startLaunchSequence(missionData);
      launchSequence.updateMissionInfo();

      const missionInfo = launchSequence.uiElements.missionInfo;
      const text = missionInfo.textContent;

      expect(text).toContain("Custom Mission");
      expect(text).toContain("Mars");
      expect(text).toContain("Communication Satellite"); // Default payload
    });
  });

  describe("Launch Animation", () => {
    test("should start launch animation after countdown", (done) => {
      const missionData = { name: "Test Mission" };
      launchSequence.startLaunchSequence(missionData);

      // Move to launch state
      launchSequence.state = "launch";
      launchSequence.launchAnim.startLaunch = jest.fn();

      launchSequence.startLaunch();

      expect(launchSequence.launchAnim.startLaunch).toHaveBeenCalledWith(
        "success"
      );
      expect(launchSequence.state).toBe("launch");
      done();
    });

    test("should update launch animation during launch phase", (done) => {
      const missionData = { name: "Test Mission" };
      launchSequence.startLaunchSequence(missionData);

      launchSequence.state = "launch";
      launchSequence.launchAnim.update = jest.fn();
      launchSequence.launchAnim.isAnimationPlaying = jest.fn(() => true);
      launchSequence.launchAnim.getCurrentPhase = jest.fn(() => "flight");

      const deltaTime = 0.016; // ~60fps
      launchSequence.updateLaunch(deltaTime);

      expect(launchSequence.launchAnim.update).toHaveBeenCalledWith(deltaTime);
      done();
    });

    test("should handle different launch outcomes", (done) => {
      const missionData = { name: "Test Mission" };
      launchSequence.startLaunchSequence(missionData, "failure");

      expect(launchSequence.launchOutcome).toBe("failure");
      launchSequence.launchAnim.startLaunch(launchSequence.launchOutcome);

      done();
    });

    test("should render launch animation when active", () => {
      const missionData = { name: "Test Mission" };
      launchSequence.startLaunchSequence(missionData);

      launchSequence.state = "launch";
      launchSequence.launchAnim.render = jest.fn();

      launchSequence.render();

      expect(launchSequence.launchAnim.render).toHaveBeenCalled();
    });
  });

  describe("Launch Sequence Transitions", () => {
    test("should complete launch sequence after animation ends", (done) => {
      const missionData = { name: "Test Mission" };
      const onComplete = jest.fn();

      launchSequence.startLaunchSequence(missionData, "success", onComplete);
      launchSequence.state = "launch";

      // Mock animation completion
      launchSequence.launchAnim.isAnimationPlaying = jest.fn(() => false);
      launchSequence.launchAnim.getLaunchOutcome = jest.fn(() => "success");

      launchSequence.completeLaunch();

      expect(launchSequence.state).toBe("complete");
      expect(onComplete).toHaveBeenCalledWith("success", missionData);
      done();
    });

    test("should transition back to mission tracking after completion", (done) => {
      const missionData = { name: "Test Mission" };
      const onReturn = jest.fn();

      launchSequence.startLaunchSequence(missionData);
      launchSequence.setOnReturnToMissionTracking(onReturn);

      launchSequence.state = "complete";
      launchSequence.transitionBackToMissionTracking();

      expect(launchSequence.isActive).toBe(false);
      expect(launchSequence.state).toBe("idle");
      expect(launchSequence.uiOverlay.style.display).toBe("none");
      expect(onReturn).toHaveBeenCalled();
      done();
    });

    test("should reset UI after launch sequence ends", (done) => {
      const missionData = { name: "Test Mission" };
      launchSequence.startLaunchSequence(missionData);
      launchSequence.endLaunchSequence();

      expect(launchSequence.isActive).toBe(false);
      expect(launchSequence.state).toBe("idle");
      expect(launchSequence.uiOverlay.style.display).toBe("none");
      expect(launchSequence.uiElements.countdown.textContent).toBe("10");
      expect(launchSequence.uiElements.countdown.style.display).toBe("block");
      done();
    });
  });

  describe("EventBus Integration", () => {
    test("should listen for mission:started events", (done) => {
      const missionEventData = {
        missionId: "mission-001",
        missionName: "Integration Test Mission",
        crewIds: ["crew-1", "crew-2"],
        duration: 5,
      };

      // Emit mission:started event
      eventBus.emit("mission:started", missionEventData);

      // The launch sequence should start automatically
      setTimeout(() => {
        expect(launchSequence.isActive).toBe(true);
        expect(launchSequence.state).toBe("countdown");
        expect(launchSequence.missionId).toBe("mission-001");
        done();
      }, 100);
    });

    test("should populate mission data from event", (done) => {
      const missionEventData = {
        missionId: "mission-002",
        missionName: "Mars Exploration",
        crewIds: ["crew-1", "crew-2", "crew-3"],
        duration: 30,
      };

      eventBus.emit("mission:started", missionEventData);

      setTimeout(() => {
        expect(launchSequence.missionData).toBeDefined();
        expect(launchSequence.missionData.name).toBe("Mars Exploration");
        expect(launchSequence.missionData.crew).toBe(3);
        done();
      }, 100);
    });

    test("should unsubscribe from events on destroy", () => {
      const unsubscribeSpy = jest.spyOn(eventBus, "unsubscribe");
      launchSequence.destroy();

      expect(unsubscribeSpy).toHaveBeenCalledWith(
        "mission:started",
        expect.any(Function),
        launchSequence
      );
    });
  });

  describe("Audio System", () => {
    test("should attempt to initialize audio context", () => {
      // Audio context might not be available in test environment
      // Just verify the property exists
      expect(launchSequence).toHaveProperty('audioEnabled');
      expect(typeof launchSequence.audioEnabled).toBe('boolean');
    });

    test("should allow audio to be disabled", () => {
      launchSequence.setAudioEnabled(false);
      expect(launchSequence.audioEnabled).toBe(false);

      launchSequence.setAudioEnabled(true);
      expect(launchSequence.audioEnabled).toBe(true);
    });
  });

  describe("Status Updates", () => {
    test("should update status text during launch", () => {
      const missionData = { name: "Test Mission" };
      launchSequence.startLaunchSequence(missionData);

      launchSequence.updateStatusText("TEST STATUS");
      expect(launchSequence.uiElements.statusText.textContent).toBe(
        "TEST STATUS"
      );
    });

    test("should update launch status based on phase", () => {
      const missionData = { name: "Test Mission" };
      launchSequence.startLaunchSequence(missionData);

      launchSequence.updateLaunchStatus("liftoff");
      expect(launchSequence.uiElements.statusText.textContent).toContain(
        "LIFTOFF"
      );

      launchSequence.updateLaunchStatus("flight");
      expect(launchSequence.uiElements.statusText.textContent).toContain(
        "FLIGHT"
      );
    });
  });

  describe("Scene Management", () => {
    test("should track if scene is active", () => {
      expect(launchSequence.isSceneActive()).toBe(false);

      launchSequence.startLaunchSequence({});
      expect(launchSequence.isSceneActive()).toBe(true);

      launchSequence.endLaunchSequence();
      expect(launchSequence.isSceneActive()).toBe(false);
    });

    test("should get current scene state", () => {
      expect(launchSequence.getState()).toBe("idle");

      launchSequence.startLaunchSequence({});
      expect(launchSequence.getState()).toBe("countdown");

      launchSequence.state = "launch";
      expect(launchSequence.getState()).toBe("launch");

      launchSequence.state = "complete";
      expect(launchSequence.getState()).toBe("complete");
    });

    test("should set and call callbacks", (done) => {
      const onComplete = jest.fn();
      const onReturn = jest.fn();

      launchSequence.setOnLaunchComplete(onComplete);
      launchSequence.setOnReturnToMissionTracking(onReturn);

      launchSequence.startLaunchSequence(
        { name: "Test" },
        "success",
        onComplete
      );
      launchSequence.completeLaunch();

      setTimeout(() => {
        expect(onComplete).toHaveBeenCalled();
        done();
      }, 100);
    });
  });
});
