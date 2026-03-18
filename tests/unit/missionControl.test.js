import { MissionControl } from '../../src/scenes/MissionControl.js';

describe('Mission Control Scene', () => {
  let missionControl;

  beforeEach(() => {
    missionControl = new MissionControl();
  });

  afterEach(() => {
    if (missionControl) {
      missionControl.destroy();
    }
  });

  test('should create a mission control instance', () => {
    expect(missionControl).toBeDefined();
    expect(missionControl.name).toBe('MissionControl');
  });

  test('should initialize mission control', () => {
    expect(() => missionControl.init()).not.toThrow();
  });

  test('should update mission control', () => {
    expect(() => missionControl.update()).not.toThrow();
  });

  test('should render mission control', () => {
    expect(() => missionControl.render()).not.toThrow();
  });

  test('should destroy mission control', () => {
    expect(() => missionControl.destroy()).not.toThrow();
  });
});
