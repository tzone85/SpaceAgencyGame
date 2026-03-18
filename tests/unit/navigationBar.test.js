/**
 * NavigationBar Component Tests
 *
 * Tests for NavigationBar functionality including initialization,
 * active scene highlighting, and navigation callbacks
 */

import NavigationBar from '../../src/ui/NavigationBar.js';

describe('NavigationBar Component', () => {
  let navBar;

  beforeEach(() => {
    // Clear any existing nav bar from DOM
    const existingNav = document.getElementById('navigation-bar');
    if (existingNav) {
      existingNav.remove();
    }

    navBar = new NavigationBar();
  });

  afterEach(() => {
    navBar.cleanup();
  });

  describe('Initialization', () => {
    test('should initialize with null nav element', () => {
      expect(navBar.navElement).toBeNull();
      expect(navBar.navButtons).toEqual([]);
    });

    test('should create nav bar UI when initialized', () => {
      navBar.initialize();

      expect(navBar.navElement).not.toBeNull();
      expect(navBar.navElement.id).toBe('navigation-bar');
      expect(navBar.navElement.className).toBe('navigation-bar');
    });

    test('should add nav bar to DOM', () => {
      navBar.initialize();

      const navInDOM = document.getElementById('navigation-bar');
      expect(navInDOM).not.toBeNull();
      expect(navInDOM).toBe(navBar.navElement);
    });
  });

  describe('Navigation Buttons', () => {
    beforeEach(() => {
      navBar.initialize();
    });

    test('should create four navigation buttons', () => {
      expect(navBar.navButtons.length).toBe(4);
    });

    test('should create Dashboard button', () => {
      const dashboardBtn = navBar.navButtons[0];
      expect(dashboardBtn.id).toBe('dashboard');
      expect(dashboardBtn.textContent).toBe('Dashboard');
      expect(dashboardBtn.dataset.sceneId).toBe('dashboard');
    });

    test('should create Missions button', () => {
      const missionsBtn = navBar.navButtons[1];
      expect(missionsBtn.id).toBe('missions');
      expect(missionsBtn.textContent).toBe('Missions');
      expect(missionsBtn.dataset.sceneId).toBe('missions');
    });

    test('should create Crew button', () => {
      const crewBtn = navBar.navButtons[2];
      expect(crewBtn.id).toBe('crew');
      expect(crewBtn.textContent).toBe('Crew');
      expect(crewBtn.dataset.sceneId).toBe('crew');
    });

    test('should create Research button', () => {
      const researchBtn = navBar.navButtons[3];
      expect(researchBtn.id).toBe('research');
      expect(researchBtn.textContent).toBe('Research');
      expect(researchBtn.dataset.sceneId).toBe('research');
    });

    test('should have correct button class', () => {
      navBar.navButtons.forEach((btn) => {
        expect(btn.className).toBe('nav-button');
      });
    });
  });

  describe('Active Scene Highlighting', () => {
    beforeEach(() => {
      navBar.initialize();
    });

    test('should set active scene and highlight button', () => {
      navBar.setActiveScene('dashboard');

      const dashboardBtn = navBar.navButtons[0];
      expect(dashboardBtn.classList.contains('nav-button--active')).toBe(true);
      expect(navBar.currentActiveScene).toBe('dashboard');
    });

    test('should remove active class from previous button when setting new active', () => {
      navBar.setActiveScene('dashboard');
      const dashboardBtn = navBar.navButtons[0];
      expect(dashboardBtn.classList.contains('nav-button--active')).toBe(true);

      navBar.setActiveScene('missions');
      const missionsBtn = navBar.navButtons[1];

      expect(dashboardBtn.classList.contains('nav-button--active')).toBe(false);
      expect(missionsBtn.classList.contains('nav-button--active')).toBe(true);
    });

    test('should highlight only one button at a time', () => {
      navBar.setActiveScene('crew');

      const activeButtons = navBar.navButtons.filter((btn) =>
        btn.classList.contains('nav-button--active')
      );

      expect(activeButtons.length).toBe(1);
      expect(activeButtons[0].dataset.sceneId).toBe('crew');
    });
  });

  describe('Navigation Callbacks', () => {
    beforeEach(() => {
      navBar.initialize();
    });

    test('should set navigation callback', () => {
      const callback = jest.fn();
      navBar.setOnNavigate(callback);

      expect(navBar.onNavigate).toBe(callback);
    });

    test('should trigger navigation callback when Dashboard button clicked', () => {
      const mockCallback = jest.fn();
      navBar.setOnNavigate(mockCallback);

      navBar.navButtons[0].click();

      expect(mockCallback).toHaveBeenCalledWith('dashboard');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('should trigger navigation callback with correct scene ID', () => {
      const mockCallback = jest.fn();
      navBar.setOnNavigate(mockCallback);

      navBar.navButtons[2].click(); // Crew button

      expect(mockCallback).toHaveBeenCalledWith('crew');
    });

    test('should handle clicks without callback gracefully', () => {
      expect(() => {
        navBar.navButtons[0].click();
      }).not.toThrow();
    });
  });

  describe('Visibility Controls', () => {
    beforeEach(() => {
      navBar.initialize();
    });

    test('should show navigation bar', () => {
      navBar.hide();
      expect(navBar.navElement.classList.contains('hidden')).toBe(true);

      navBar.show();
      expect(navBar.navElement.classList.contains('hidden')).toBe(false);
    });

    test('should hide navigation bar', () => {
      navBar.hide();
      expect(navBar.navElement.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Cleanup', () => {
    test('should remove nav bar from DOM on cleanup', () => {
      navBar.initialize();
      expect(document.getElementById('navigation-bar')).not.toBeNull();

      navBar.cleanup();
      expect(document.getElementById('navigation-bar')).toBeNull();
    });

    test('should reset all references on cleanup', () => {
      navBar.initialize();
      navBar.cleanup();

      expect(navBar.navElement).toBeNull();
      expect(navBar.navButtons).toEqual([]);
      expect(navBar.currentActiveScene).toBeNull();
      expect(navBar.onNavigate).toBeNull();
    });

    test('should remove event listeners on cleanup', () => {
      navBar.initialize();
      const mockCallback = jest.fn();
      navBar.setOnNavigate(mockCallback);

      navBar.cleanup();

      // Button reference should be cleared
      expect(navBar.navButtons).toEqual([]);
    });
  });
});
