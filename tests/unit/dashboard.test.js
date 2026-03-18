import { Dashboard } from '../../src/scenes/Dashboard.js';

describe('Dashboard Scene', () => {
  let dashboard;

  beforeEach(() => {
    dashboard = new Dashboard();
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

  test('should initialize dashboard', () => {
    expect(() => dashboard.init()).not.toThrow();
  });

  test('should update dashboard', () => {
    expect(() => dashboard.update()).not.toThrow();
  });

  test('should render dashboard', () => {
    expect(() => dashboard.render()).not.toThrow();
  });

  test('should destroy dashboard', () => {
    expect(() => dashboard.destroy()).not.toThrow();
  });
});
