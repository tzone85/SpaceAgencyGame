/**
 * MainMenu Scene Tests
 *
 * Tests for MainMenu scene initialization, UI creation, and button interactions
 */

import MainMenu from '../../src/scenes/MainMenu.js';

describe('MainMenu Scene', () => {
  let mainMenu;

  beforeEach(() => {
    mainMenu = new MainMenu();
    // Clear any existing menu from DOM
    const existingMenu = document.getElementById('mainMenu');
    if (existingMenu) {
      existingMenu.remove();
    }
  });

  afterEach(() => {
    mainMenu.cleanup();
  });

  describe('Initialization', () => {
    test('should initialize with no menu element initially', () => {
      expect(mainMenu.menuElement).toBeNull();
      expect(mainMenu.titleElement).toBeNull();
      expect(mainMenu.buttonsContainer).toBeNull();
      expect(mainMenu.buttons).toEqual([]);
    });

    test('should create menu UI when initialized', () => {
      mainMenu.initialize();

      expect(mainMenu.menuElement).not.toBeNull();
      expect(mainMenu.menuElement.id).toBe('mainMenu');
      expect(mainMenu.menuElement.className).toBe('main-menu');
    });

    test('should add menu element to DOM', () => {
      mainMenu.initialize();

      const menuInDOM = document.getElementById('mainMenu');
      expect(menuInDOM).not.toBeNull();
      expect(menuInDOM).toBe(mainMenu.menuElement);
    });
  });

  describe('UI Elements', () => {
    beforeEach(() => {
      mainMenu.initialize();
    });

    test('should create animated title element', () => {
      expect(mainMenu.titleElement).not.toBeNull();
      expect(mainMenu.titleElement.textContent).toBe('STELLAR COMMAND');
      expect(mainMenu.titleElement.className).toBe('game-title');
    });

    test('should create buttons container', () => {
      expect(mainMenu.buttonsContainer).not.toBeNull();
      expect(mainMenu.buttonsContainer.className).toBe('menu-buttons');
    });

    test('should create three menu buttons', () => {
      expect(mainMenu.buttons.length).toBe(3);
    });

    test('should create New Game button with correct properties', () => {
      const newGameBtn = mainMenu.buttons[0];
      expect(newGameBtn.id).toBe('newGameBtn');
      expect(newGameBtn.textContent).toBe('NEW GAME');
      expect(newGameBtn.className).toBe('menu-button');
      expect(newGameBtn.dataset.action).toBe('newGame');
    });

    test('should create Continue Game button with correct properties', () => {
      const continueBtn = mainMenu.buttons[1];
      expect(continueBtn.id).toBe('continueBtn');
      expect(continueBtn.textContent).toBe('CONTINUE GAME');
      expect(continueBtn.className).toBe('menu-button');
      expect(continueBtn.dataset.action).toBe('continueGame');
    });

    test('should create Settings button with correct properties', () => {
      const settingsBtn = mainMenu.buttons[2];
      expect(settingsBtn.id).toBe('settingsBtn');
      expect(settingsBtn.textContent).toBe('SETTINGS');
      expect(settingsBtn.className).toBe('menu-button');
      expect(settingsBtn.dataset.action).toBe('settings');
    });
  });

  describe('Button Interactions', () => {
    beforeEach(() => {
      mainMenu.initialize();
    });

    test('should trigger onNewGame callback when New Game button is clicked', () => {
      const mockCallback = jest.fn();
      mainMenu.setOnNewGame(mockCallback);

      const newGameBtn = mainMenu.buttons[0];
      newGameBtn.click();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('should trigger onContinueGame callback when Continue Game button is clicked', () => {
      const mockCallback = jest.fn();
      mainMenu.setOnContinueGame(mockCallback);

      const continueBtn = mainMenu.buttons[1];
      continueBtn.click();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('should trigger onSettings callback when Settings button is clicked', () => {
      const mockCallback = jest.fn();
      mainMenu.setOnSettings(mockCallback);

      const settingsBtn = mainMenu.buttons[2];
      settingsBtn.click();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('should handle button clicks without callbacks gracefully', () => {
      const newGameBtn = mainMenu.buttons[0];
      expect(() => {
        newGameBtn.click();
      }).not.toThrow();
    });
  });

  describe('Lifecycle Methods', () => {
    test('should have update method that does not throw', () => {
      mainMenu.initialize();
      expect(() => {
        mainMenu.update(0.016); // 60 FPS delta time
      }).not.toThrow();
    });

    test('should have render method that does not throw', () => {
      mainMenu.initialize();
      const mockRenderer = {};
      expect(() => {
        mainMenu.render(mockRenderer);
      }).not.toThrow();
    });

    test('should remove menu from DOM on cleanup', () => {
      mainMenu.initialize();
      expect(document.getElementById('mainMenu')).not.toBeNull();

      mainMenu.cleanup();
      expect(document.getElementById('mainMenu')).toBeNull();
    });

    test('should remove event listeners on cleanup', () => {
      mainMenu.initialize();
      const mockCallback = jest.fn();
      mainMenu.setOnNewGame(mockCallback);

      const newGameBtn = mainMenu.buttons[0];
      mainMenu.cleanup();

      // After cleanup, the button reference should be cleared
      expect(mainMenu.menuElement).toBeNull();
      expect(mainMenu.buttons).toEqual([]);
    });

    test('should reset all references on cleanup', () => {
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

  describe('Callback Registration', () => {
    test('should set onNewGame callback', () => {
      const callback = jest.fn();
      mainMenu.setOnNewGame(callback);
      expect(mainMenu.onNewGame).toBe(callback);
    });

    test('should set onContinueGame callback', () => {
      const callback = jest.fn();
      mainMenu.setOnContinueGame(callback);
      expect(mainMenu.onContinueGame).toBe(callback);
    });

    test('should set onSettings callback', () => {
      const callback = jest.fn();
      mainMenu.setOnSettings(callback);
      expect(mainMenu.onSettings).toBe(callback);
    });
  });
});
