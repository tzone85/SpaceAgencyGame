import { CrewQuarters } from '../../src/scenes/CrewQuarters.js';

describe('Crew Quarters Scene', () => {
  let crewQuarters;

  beforeEach(() => {
    crewQuarters = new CrewQuarters();
  });

  afterEach(() => {
    if (crewQuarters) {
      crewQuarters.destroy();
    }
  });

  test('should create a crew quarters instance', () => {
    expect(crewQuarters).toBeDefined();
    expect(crewQuarters.name).toBe('CrewQuarters');
  });

  test('should initialize crew quarters', () => {
    expect(() => crewQuarters.init()).not.toThrow();
  });

  test('should update crew quarters', () => {
    expect(() => crewQuarters.update()).not.toThrow();
  });

  test('should render crew quarters', () => {
    expect(() => crewQuarters.render()).not.toThrow();
  });

  test('should destroy crew quarters', () => {
    expect(() => crewQuarters.destroy()).not.toThrow();
  });
});
