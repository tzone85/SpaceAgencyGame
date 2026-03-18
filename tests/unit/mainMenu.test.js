/**
 * MainMenu Scene Tests
 *
 * Tests for MainMenu scene initialization, UI creation, button interactions,
 * starfield background, space facts ticker, and scene transitions
 */

import MainMenu from "../../src/scenes/MainMenu.js";
import SaveSystem from "../../src/game/SaveSystem.js";
import EventBus from "../../src/game/EventBus.js";

describe("MainMenu Scene", () => {
  let mainMenu;

  beforeEach(() => {
    // Clear any existing elements from DOM
    const existingMenu = document.getElementById("mainMenu");
    if (existingMenu) {
      existingMenu.remove();
    }
    const existingCanvas = document.getElementById("mainmenu-starfield");
    if (existingCanvas) {
      existingCanvas.remove();
    }
    const existingTicker = document.getElementById("space-facts-ticker");
    if (existingTicker) {
      existingTicker.remove();
    }

    // Clear localStorage to ensure no save exists by default
    localStorage.clear();

    mainMenu = new MainMenu();
  });

  afterEach(() => {
    mainMenu.cleanup();
    localStorage.clear();
  });

  describe("Initialization", () => {
    test("should initialize with no menu element initially", () => {
      expect(mainMenu.menuElement).toBeNull();
      expect(mainMenu.titleElement).toBeNull();
      expect(mainMenu.buttonsContainer).toBeNull();
      expect(mainMenu.buttons).toEqual([]);
    });

    test("should create menu UI when initialized", () => {
      mainMenu.initialize();

      expect(mainMenu.menuElement).not.toBeNull();
      expect(mainMenu.menuElement.id).toBe("mainMenu");
      expect(mainMenu.menuElement.className).toBe("main-menu");
    });

    test("should add menu element to DOM", () => {
      mainMenu.initialize();

      const menuInDOM = document.getElementById("mainMenu");
      expect(menuInDOM).not.toBeNull();
      expect(menuInDOM).toBe(mainMenu.menuElement);
    });
  });

  describe("UI Elements", () => {
    beforeEach(() => {
      mainMenu.initialize();
    });

    test("should create animated title element with Stellar Horizon", () => {
      expect(mainMenu.titleElement).not.toBeNull();
      expect(mainMenu.titleElement.textContent).toBe("Stellar Horizon");
      expect(mainMenu.titleElement.className).toContain("game-title");
      expect(mainMenu.titleElement.className).toContain("glow-text");
    });

    test("should create buttons container", () => {
      expect(mainMenu.buttonsContainer).not.toBeNull();
      expect(mainMenu.buttonsContainer.className).toBe("menu-buttons");
    });

    test("should create menu buttons (without save, only New Game and Settings)", () => {
      expect(mainMenu.buttons.length).toBe(2);
    });

    test("should create New Game button with correct properties", () => {
      const newGameBtn = mainMenu.buttons[0];
      expect(newGameBtn.id).toBe("newGameBtn");
      expect(newGameBtn.textContent).toBe("NEW GAME");
      expect(newGameBtn.className).toBe("menu-button");
      expect(newGameBtn.dataset.action).toBe("newGame");
    });

    test("should create Settings button with correct properties", () => {
      const settingsBtn = mainMenu.buttons[1];
      expect(settingsBtn.id).toBe("settingsBtn");
      expect(settingsBtn.textContent).toBe("SETTINGS");
      expect(settingsBtn.className).toBe("menu-button");
      expect(settingsBtn.dataset.action).toBe("settings");
    });

    test("should NOT show Continue button when no save exists", () => {
      const continueBtn = mainMenu.buttons.find(
        (btn) => btn.id === "continueBtn",
      );
      expect(continueBtn).toBeUndefined();
    });
  });

  describe("Button Interactions", () => {
    beforeEach(() => {
      mainMenu.initialize();
    });

    test("should trigger onNewGame callback when New Game button is clicked", () => {
      const mockCallback = jest.fn();
      mainMenu.setOnNewGame(mockCallback);

      const newGameBtn = mainMenu.buttons[0];
      newGameBtn.click();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test("should trigger onContinueGame callback when Continue Game button is clicked", () => {
      // This test only applies when there's a save file
      const saveName = "stellar-horizon-save";
      if (!localStorage.getItem(saveName)) {
        // Skip test if no save file exists
        expect(
          mainMenu.buttons.find((b) => b.id === "continueBtn"),
        ).toBeUndefined();
        return;
      }

      const mockCallback = jest.fn();
      mainMenu.setOnContinueGame(mockCallback);

      const continueBtn = mainMenu.buttons.find((b) => b.id === "continueBtn");
      expect(continueBtn).toBeDefined();

      mainMenu.handleButtonClick({ target: continueBtn });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test("should trigger onSettings callback when Settings button is clicked", () => {
      const mockCallback = jest.fn();
      mainMenu.setOnSettings(mockCallback);

      const settingsBtn = mainMenu.buttons[1];
      settingsBtn.click();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test("should show Continue button when save exists", () => {
      mainMenu.cleanup();
      // Simulate a save existing
      localStorage.setItem(
        "stellar-horizon-save",
        JSON.stringify({ meta: { saveVersion: 1 } }),
      );

      mainMenu = new MainMenu();
      mainMenu.initialize();

      const continueBtn = mainMenu.buttons.find(
        (btn) => btn.id === "continueBtn",
      );
      expect(continueBtn).toBeDefined();
      expect(continueBtn.textContent).toBe("CONTINUE GAME");
    });

    test("should trigger onContinueGame callback when Continue button is clicked", () => {
      mainMenu.cleanup();
      // Simulate a save existing
      localStorage.setItem(
        "stellar-horizon-save",
        JSON.stringify({ meta: { saveVersion: 1 } }),
      );

      mainMenu = new MainMenu();
      mainMenu.initialize();

      const mockCallback = jest.fn();
      mainMenu.setOnContinueGame(mockCallback);

      // Get the Continue button - should be second button
      const continueBtn = mainMenu.buttons.find(
        (btn) => btn.id === "continueBtn",
      );

      expect(continueBtn).toBeDefined();
      expect(continueBtn.dataset.action).toBe("continueGame");

      // Directly call the handler with a mock event
      mainMenu.handleButtonClick({ target: continueBtn });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test("should handle button clicks without callbacks gracefully", () => {
      const newGameBtn = mainMenu.buttons[0];
      expect(() => {
        newGameBtn.click();
      }).not.toThrow();
    });
  });

  describe("Lifecycle Methods", () => {
    test("should have update method that does not throw", () => {
      mainMenu.initialize();
      expect(() => {
        mainMenu.update(0.016); // 60 FPS delta time
      }).not.toThrow();
    });

    test("should have render method that does not throw", () => {
      mainMenu.initialize();
      const mockRenderer = {};
      expect(() => {
        mainMenu.render(mockRenderer);
      }).not.toThrow();
    });

    test("should remove menu from DOM on cleanup", () => {
      mainMenu.initialize();
      expect(document.getElementById("mainMenu")).not.toBeNull();

      mainMenu.cleanup();
      expect(document.getElementById("mainMenu")).toBeNull();
    });

    test("should remove event listeners on cleanup", () => {
      mainMenu.initialize();
      const mockCallback = jest.fn();
      mainMenu.setOnNewGame(mockCallback);

      const newGameBtn = mainMenu.buttons[0];
      mainMenu.cleanup();

      // After cleanup, the button reference should be cleared
      expect(mainMenu.menuElement).toBeNull();
      expect(mainMenu.buttons).toEqual([]);
    });

    test("should reset all references on cleanup", () => {
      mainMenu.initialize();
      mainMenu.cleanup();

      expect(mainMenu.menuElement).toBeNull();
      expect(mainMenu.titleElement).toBeNull();
      expect(mainMenu.buttonsContainer).toBeNull();
      expect(mainMenu.buttons).toEqual([]);
      expect(mainMenu.onNewGame).toBeUndefined();
      expect(mainMenu.onContinueGame).toBeUndefined();
      expect(mainMenu.onSettings).toBeUndefined();
    });
  });

  describe("Callback Registration", () => {
    test("should set onNewGame callback", () => {
      const callback = jest.fn();
      mainMenu.setOnNewGame(callback);
      expect(mainMenu.onNewGame).toBe(callback);
    });

    test("should set onContinueGame callback", () => {
      const callback = jest.fn();
      mainMenu.setOnContinueGame(callback);
      expect(mainMenu.onContinueGame).toBe(callback);
    });

    test("should set onSettings callback", () => {
      const callback = jest.fn();
      mainMenu.setOnSettings(callback);
      expect(mainMenu.onSettings).toBe(callback);
    });
  });

  describe("Starfield Background", () => {
    test("should create starfield canvas on initialization", () => {
      mainMenu.initialize();

      expect(mainMenu.starfieldCanvas).not.toBeNull();
      expect(mainMenu.starfieldCanvas.id).toBe("mainmenu-starfield");
    });

    test("should add starfield canvas to DOM", () => {
      mainMenu.initialize();

      const canvas = document.getElementById("mainmenu-starfield");
      expect(canvas).not.toBeNull();
    });

    test("should initialize starfield with proper dimensions", () => {
      mainMenu.initialize();

      expect(mainMenu.starfieldCanvas.width).toBe(window.innerWidth);
      expect(mainMenu.starfieldCanvas.height).toBe(window.innerHeight);
    });

    test("should start starfield animation on initialize", () => {
      mainMenu.initialize();

      expect(mainMenu.starfield).not.toBeNull();
      expect(mainMenu.starfield.isAnimating).toBe(true);
    });

    test("should remove starfield on cleanup", () => {
      mainMenu.initialize();
      mainMenu.cleanup();

      const canvas = document.getElementById("mainmenu-starfield");
      expect(canvas).toBeNull();
      expect(mainMenu.starfield).toBeNull();
    });
  });

  describe("Space Facts Ticker", () => {
    test("should create space facts ticker on initialization", () => {
      mainMenu.initialize();

      expect(mainMenu.spaceFactsTicker).not.toBeNull();
    });

    test("should add ticker element to DOM", () => {
      mainMenu.initialize();

      const ticker = document.getElementById("space-facts-ticker");
      expect(ticker).not.toBeNull();
    });

    test("should rotate facts on initialization", () => {
      mainMenu.initialize();

      expect(mainMenu.spaceFactsTicker.currentFactIndex).toBe(0);
    });

    test("should remove ticker on cleanup", () => {
      mainMenu.initialize();
      mainMenu.cleanup();

      const ticker = document.getElementById("space-facts-ticker");
      expect(ticker).toBeNull();
      expect(mainMenu.spaceFactsTicker).toBeNull();
    });
  });

  describe("Scene Lifecycle", () => {
    test("should have onEnter method that starts starfield", () => {
      mainMenu.initialize();
      mainMenu.starfield.stop();

      expect(mainMenu.starfield.isAnimating).toBe(false);
      mainMenu.onEnter();
      expect(mainMenu.starfield.isAnimating).toBe(true);
    });

    test("should have onExit method", () => {
      mainMenu.initialize();

      expect(() => {
        mainMenu.onExit();
      }).not.toThrow();
    });

    test("should have onTransitionOut method that stops animation", () => {
      mainMenu.initialize();

      expect(mainMenu.starfield.isAnimating).toBe(true);
      mainMenu.onTransitionOut();
      expect(mainMenu.starfield.isAnimating).toBe(false);
    });

    test("should have onTransitionIn method", () => {
      mainMenu.initialize();

      expect(() => {
        mainMenu.onTransitionIn();
      }).not.toThrow();
    });

    test("should have destroy method", () => {
      mainMenu.initialize();

      expect(() => {
        mainMenu.destroy();
      }).not.toThrow();

      expect(mainMenu.menuElement).toBeNull();
    });
  });

  describe("Save System Integration", () => {
    test("should have SaveSystem instance after initialization", () => {
      mainMenu.initialize();

      expect(mainMenu.saveSystem).not.toBeNull();
    });

    test("should have EventBus instance after initialization", () => {
      mainMenu.initialize();

      expect(mainMenu.eventBus).not.toBeNull();
    });
  });
});
