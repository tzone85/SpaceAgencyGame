import { Dashboard } from '../../src/scenes/Dashboard.js';
import EventBus from '../../src/game/EventBus.js';
import { GameState } from '../../src/game/GameState.js';

describe('Dashboard Scene', () => {
  let dashboard;
  let eventBus;
  let gameState;
  let mockGameInstance;

  beforeEach(() => {
    eventBus = new EventBus();
    gameState = new GameState();

    mockGameInstance = {
      eventBus,
      gameState,
      getLastSavedTime: jest.fn(() => new Date().toISOString()),
    };

    dashboard = new Dashboard(mockGameInstance);
  });

  afterEach(() => {
    if (dashboard) {
      dashboard.destroy();
    }
  });

  test('should create a dashboard instance', () => {
    expect(dashboard).toBeDefined();
    expect(dashboard.name).toBe('Dashboard');
  });

  test('should initialize dashboard with gameInstance', () => {
    expect(dashboard.gameInstance).toBe(mockGameInstance);
    expect(dashboard.eventBus).toBe(eventBus);
    expect(dashboard.gameState).toBe(gameState);
  });

  test('should initialize dashboard', () => {
    expect(() => dashboard.init()).not.toThrow();
  });

  test('should create dashboard element on init', () => {
    dashboard.init();
    expect(dashboard.dashboardElement).toBeDefined();
    expect(dashboard.dashboardElement.id).toBe('dashboard');
  });

  test('should create budget display element', () => {
    dashboard.init();
    expect(dashboard.budgetDisplay).toBeDefined();
    expect(dashboard.budgetDisplay.className).toContain('dashboard-budget');
  });

  test('should create crew display element', () => {
    dashboard.init();
    expect(dashboard.crewDisplay).toBeDefined();
    expect(dashboard.crewDisplay.className).toContain('dashboard-crew');
  });

  test('should create missions display element', () => {
    dashboard.init();
    expect(dashboard.missionsDisplay).toBeDefined();
    expect(dashboard.missionsDisplay.className).toContain('dashboard-missions');
  });

  test('should create research display element', () => {
    dashboard.init();
    expect(dashboard.researchDisplay).toBeDefined();
    expect(dashboard.researchDisplay.className).toContain('dashboard-research');
  });

  test('should create advance time button', () => {
    dashboard.init();
    expect(dashboard.advanceTimeButton).toBeDefined();
    expect(dashboard.advanceTimeButton.id).toBe('advance-time-btn');
    expect(dashboard.advanceTimeButton.textContent).toContain('Advance Time');
  });

  test('should display budget balance from game state', () => {
    dashboard.init();
    dashboard.updateBudgetDisplay();
    const budgetContent = dashboard.budgetDisplay.querySelector('.budget-content');
    const balanceText = budgetContent.textContent;
    expect(balanceText).toContain('Balance');
    expect(balanceText).toContain('$');
  });

  test('should display crew count from game state', () => {
    dashboard.init();
    // Add a crew member to game state
    const newState = gameState.getState();
    newState.crew.roster = [{ id: 'crew-1', name: 'John' }];
    gameState.update('crew.roster', newState.crew.roster);

    dashboard.updateCrewDisplay();
    const crewContent = dashboard.crewDisplay.querySelector('.crew-content');
    expect(crewContent.textContent).toContain('Total');
  });

  test('should display active missions from game state', () => {
    dashboard.init();
    dashboard.updateMissionsDisplay();
    const missionsContent = dashboard.missionsDisplay.querySelector('.missions-content');
    expect(missionsContent.textContent).toContain('Active');
  });

  test('should display research progress from game state', () => {
    dashboard.init();
    dashboard.updateResearchDisplay();
    const researchContent = dashboard.researchDisplay.querySelector('.research-content');
    expect(researchContent).toBeDefined();
  });

  test('should emit game:tick event when advance time button is clicked', () => {
    dashboard.init();
    const emitSpy = jest.spyOn(dashboard.eventBus, 'emit');

    dashboard.advanceTimeButton.click();

    expect(emitSpy).toHaveBeenCalledWith('game:tick', expect.objectContaining({
      deltaTime: 1,
    }));
    emitSpy.mockRestore();
  });

  test('should update all displays on update call', () => {
    dashboard.init();
    const updateBudgetSpy = jest.spyOn(dashboard, 'updateBudgetDisplay');
    const updateCrewSpy = jest.spyOn(dashboard, 'updateCrewDisplay');
    const updateMissionsSpy = jest.spyOn(dashboard, 'updateMissionsDisplay');
    const updateResearchSpy = jest.spyOn(dashboard, 'updateResearchDisplay');

    dashboard.update();

    expect(updateBudgetSpy).toHaveBeenCalled();
    expect(updateCrewSpy).toHaveBeenCalled();
    expect(updateMissionsSpy).toHaveBeenCalled();
    expect(updateResearchSpy).toHaveBeenCalled();

    updateBudgetSpy.mockRestore();
    updateCrewSpy.mockRestore();
    updateMissionsSpy.mockRestore();
    updateResearchSpy.mockRestore();
  });

  test('should update dashboard', () => {
    expect(() => dashboard.update()).not.toThrow();
  });

  test('should render dashboard', () => {
    expect(() => dashboard.render()).not.toThrow();
  });

  test('should destroy dashboard and clean up resources', () => {
    dashboard.init();
    expect(() => dashboard.destroy()).not.toThrow();

    expect(dashboard.dashboardElement).toBeNull();
    expect(dashboard.budgetDisplay).toBeNull();
    expect(dashboard.crewDisplay).toBeNull();
    expect(dashboard.missionsDisplay).toBeNull();
    expect(dashboard.researchDisplay).toBeNull();
    expect(dashboard.advanceTimeButton).toBeNull();
  });

  test('should display last saved time from game instance', () => {
    dashboard.init();
    dashboard.updateLastSavedDisplay();
    expect(dashboard.lastSavedElement.textContent).toContain('Last saved');
  });

  test('should handle empty crew roster gracefully', () => {
    dashboard.init();
    const emptyState = gameState.getState();
    gameState.update('crew.roster', []);

    expect(() => dashboard.updateCrewDisplay()).not.toThrow();
    const crewContent = dashboard.crewDisplay.querySelector('.crew-content');
    expect(crewContent.textContent).toContain('No crew');
  });

  test('should handle no active missions gracefully', () => {
    dashboard.init();
    gameState.update('missions.active', []);

    expect(() => dashboard.updateMissionsDisplay()).not.toThrow();
    const missionsContent = dashboard.missionsDisplay.querySelector('.missions-content');
    expect(missionsContent.textContent).toContain('No active missions');
  });

  test('should handle no active research gracefully', () => {
    dashboard.init();
    gameState.update('research.active', null);

    expect(() => dashboard.updateResearchDisplay()).not.toThrow();
    const researchContent = dashboard.researchDisplay.querySelector('.research-content');
    expect(researchContent.textContent).toContain('No active research');
  });
});
