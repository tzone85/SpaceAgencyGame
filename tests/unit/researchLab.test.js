import { ResearchLab } from '../../src/scenes/ResearchLab.js';

describe('Research Lab Scene', () => {
  let researchLab;

  beforeEach(() => {
    researchLab = new ResearchLab();
  });

  afterEach(() => {
    if (researchLab) {
      researchLab.destroy();
    }
  });

  test('should create a research lab instance', () => {
    expect(researchLab).toBeDefined();
    expect(researchLab.name).toBe('ResearchLab');
  });

  test('should initialize research lab', () => {
    expect(() => researchLab.init()).not.toThrow();
  });

  test('should update research lab', () => {
    expect(() => researchLab.update()).not.toThrow();
  });

  test('should render research lab', () => {
    expect(() => researchLab.render()).not.toThrow();
  });

  test('should destroy research lab', () => {
    expect(() => researchLab.destroy()).not.toThrow();
  });
});
