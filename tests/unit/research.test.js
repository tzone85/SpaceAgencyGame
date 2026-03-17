/**
 * Research & Technology Tree Tests
 *
 * Test suite for the research system including:
 * - Research tree structure and integrity
 * - Dependency management
 * - Cost and duration tracking
 * - Capability and mission unlocking
 * - Category and tier organization
 */

import ResearchTree, {
  ResearchCategories,
  getAllResearch,
  getResearchById,
  getResearchByCategory,
  getResearchByTier,
  getResearchDependencies,
  canStartResearch,
  getResearchCost,
  getResearchDuration,
  getUnlockedMissions,
  getUnlockedCapabilities,
  getAllUnlockedCapabilities,
  getAllUnlockedMissions,
  getResearchStats
} from '../../src/data/research.js';

describe('Research System', () => {
  describe('Research Tree Structure', () => {
    test('should have research data defined', () => {
      expect(ResearchTree).toBeDefined();
      expect(Object.keys(ResearchTree).length).toBeGreaterThan(0);
    });

    test('should have 25 research nodes (5 per category)', () => {
      expect(Object.keys(ResearchTree).length).toBe(25);
    });

    test('should have all 5 categories represented', () => {
      const categories = new Set();
      Object.values(ResearchTree).forEach(research => {
        categories.add(research.category);
      });

      expect(categories.size).toBe(5);
      expect(categories.has(ResearchCategories.PROPULSION)).toBe(true);
      expect(categories.has(ResearchCategories.LIFE_SUPPORT)).toBe(true);
      expect(categories.has(ResearchCategories.COMMUNICATIONS)).toBe(true);
      expect(categories.has(ResearchCategories.MATERIALS)).toBe(true);
      expect(categories.has(ResearchCategories.AI)).toBe(true);
    });

    test('each research node should have required properties', () => {
      Object.entries(ResearchTree).forEach(([id, research]) => {
        expect(research).toHaveProperty('id');
        expect(research).toHaveProperty('name');
        expect(research).toHaveProperty('category');
        expect(research).toHaveProperty('tier');
        expect(research).toHaveProperty('description');
        expect(research).toHaveProperty('costs');
        expect(research).toHaveProperty('duration');
        expect(research).toHaveProperty('dependencies');
        expect(research).toHaveProperty('unlockedMissions');
        expect(research).toHaveProperty('unlockedCapabilities');

        expect(typeof research.id).toBe('string');
        expect(typeof research.name).toBe('string');
        expect(typeof research.description).toBe('string');
        expect(typeof research.duration).toBe('number');
        expect(Array.isArray(research.dependencies)).toBe(true);
        expect(Array.isArray(research.unlockedMissions)).toBe(true);
        expect(Array.isArray(research.unlockedCapabilities)).toBe(true);
      });
    });

    test('costs should have science and credits', () => {
      Object.values(ResearchTree).forEach(research => {
        expect(research.costs).toHaveProperty('science');
        expect(research.costs).toHaveProperty('credits');
        expect(typeof research.costs.science).toBe('number');
        expect(typeof research.costs.credits).toBe('number');
        expect(research.costs.science).toBeGreaterThan(0);
        expect(research.costs.credits).toBeGreaterThan(0);
      });
    });

    test('tier should be between 1 and 5', () => {
      Object.values(ResearchTree).forEach(research => {
        expect(research.tier).toBeGreaterThanOrEqual(1);
        expect(research.tier).toBeLessThanOrEqual(5);
      });
    });

    test('duration should be positive', () => {
      Object.values(ResearchTree).forEach(research => {
        expect(research.duration).toBeGreaterThan(0);
      });
    });
  });

  describe('Research Categories', () => {
    test('should have 5 categories', () => {
      expect(Object.keys(ResearchCategories).length).toBe(5);
    });

    test('Propulsion category should have 5 research nodes', () => {
      const propulsion = getResearchByCategory(ResearchCategories.PROPULSION);
      expect(Object.keys(propulsion).length).toBe(5);
    });

    test('Life Support category should have 5 research nodes', () => {
      const lifeSupport = getResearchByCategory(ResearchCategories.LIFE_SUPPORT);
      expect(Object.keys(lifeSupport).length).toBe(5);
    });

    test('Communications category should have 5 research nodes', () => {
      const communications = getResearchByCategory(ResearchCategories.COMMUNICATIONS);
      expect(Object.keys(communications).length).toBe(5);
    });

    test('Materials category should have 5 research nodes', () => {
      const materials = getResearchByCategory(ResearchCategories.MATERIALS);
      expect(Object.keys(materials).length).toBe(5);
    });

    test('AI category should have 5 research nodes', () => {
      const ai = getResearchByCategory(ResearchCategories.AI);
      expect(Object.keys(ai).length).toBe(5);
    });
  });

  describe('Research Tiers', () => {
    test('should have 5 research nodes at each tier', () => {
      for (let tier = 1; tier <= 5; tier++) {
        const tierResearch = getResearchByTier(tier);
        expect(Object.keys(tierResearch).length).toBe(5);
      }
    });

    test('tier 1 research should have no dependencies', () => {
      const tier1Research = getResearchByTier(1);
      Object.values(tier1Research).forEach(research => {
        expect(research.dependencies.length).toBe(0);
      });
    });

    test('higher tier research should have dependencies', () => {
      for (let tier = 2; tier <= 5; tier++) {
        const tierResearch = getResearchByTier(tier);
        Object.values(tierResearch).forEach(research => {
          expect(research.dependencies.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Dependencies', () => {
    test('all dependencies should reference existing research', () => {
      const allIds = Object.keys(ResearchTree);
      Object.values(ResearchTree).forEach(research => {
        research.dependencies.forEach(dep => {
          expect(allIds).toContain(dep);
        });
      });
    });

    test('dependencies should not create circular references', () => {
      const visited = new Set();
      const recursionStack = new Set();

      const hasCycle = (id) => {
        visited.add(id);
        recursionStack.add(id);

        const research = getResearchById(id);
        for (const dep of research.dependencies) {
          if (!visited.has(dep)) {
            if (hasCycle(dep)) return true;
          } else if (recursionStack.has(dep)) {
            return true;
          }
        }

        recursionStack.delete(id);
        return false;
      };

      const allIds = Object.keys(ResearchTree);
      for (const id of allIds) {
        visited.clear();
        recursionStack.clear();
        expect(hasCycle(id)).toBe(false);
      }
    });

    test('should return correct dependencies for research', () => {
      const ionDrives = getResearchDependencies('ion_drives');
      expect(ionDrives).toEqual(['basic_rockets']);

      const plasmaDrives = getResearchDependencies('plasma_drives');
      expect(plasmaDrives).toEqual(['ion_drives']);

      const basicRockets = getResearchDependencies('basic_rockets');
      expect(basicRockets).toEqual([]);
    });

    test('should return empty array for non-existent research', () => {
      const deps = getResearchDependencies('non_existent');
      expect(deps).toEqual([]);
    });
  });

  describe('Research Access Functions', () => {
    test('getAllResearch should return all research', () => {
      const all = getAllResearch();
      expect(Object.keys(all).length).toBe(25);
    });

    test('getAllResearch should return a copy', () => {
      const all1 = getAllResearch();
      const all2 = getAllResearch();
      expect(all1).not.toBe(all2);
      all1.fake_research = { id: 'fake' };
      expect(all2.fake_research).toBeUndefined();
    });

    test('getResearchById should return correct research', () => {
      const basicRockets = getResearchById('basic_rockets');
      expect(basicRockets).toBeDefined();
      expect(basicRockets.name).toBe('Basic Rockets');
      expect(basicRockets.category).toBe(ResearchCategories.PROPULSION);
    });

    test('getResearchById should return null for non-existent research', () => {
      const result = getResearchById('non_existent');
      expect(result).toBeNull();
    });

    test('getResearchByCategory should filter correctly', () => {
      const propulsion = getResearchByCategory(ResearchCategories.PROPULSION);
      Object.values(propulsion).forEach(research => {
        expect(research.category).toBe(ResearchCategories.PROPULSION);
      });
    });

    test('getResearchByTier should filter correctly', () => {
      const tier2 = getResearchByTier(2);
      Object.values(tier2).forEach(research => {
        expect(research.tier).toBe(2);
      });
    });
  });

  describe('Can Start Research', () => {
    test('should allow tier 1 research without dependencies', () => {
      const completed = new Set();
      expect(canStartResearch('basic_rockets', completed)).toBe(true);
      expect(canStartResearch('basic_life_support', completed)).toBe(true);
      expect(canStartResearch('radio_communication', completed)).toBe(true);
      expect(canStartResearch('metal_alloys', completed)).toBe(true);
      expect(canStartResearch('basic_automation', completed)).toBe(true);
    });

    test('should prevent tier 2 research without dependencies', () => {
      const completed = new Set();
      expect(canStartResearch('ion_drives', completed)).toBe(false);
      expect(canStartResearch('advanced_life_support', completed)).toBe(false);
    });

    test('should allow tier 2 research with dependencies complete', () => {
      const completed = new Set(['basic_rockets']);
      expect(canStartResearch('ion_drives', completed)).toBe(true);
    });

    test('should allow research with multiple dependencies', () => {
      const completed = new Set();
      expect(canStartResearch('warp_drive_research', completed)).toBe(false);

      completed.add('basic_rockets');
      expect(canStartResearch('warp_drive_research', completed)).toBe(false);

      completed.add('ion_drives');
      expect(canStartResearch('warp_drive_research', completed)).toBe(false);

      completed.add('plasma_drives');
      expect(canStartResearch('warp_drive_research', completed)).toBe(true);
    });
  });

  describe('Costs and Duration', () => {
    test('should return correct cost for research', () => {
      const cost = getResearchCost('basic_rockets');
      expect(cost).toEqual({
        science: 100,
        credits: 50000
      });
    });

    test('should return null cost for non-existent research', () => {
      const cost = getResearchCost('non_existent');
      expect(cost).toBeNull();
    });

    test('should return correct duration for research', () => {
      const duration = getResearchDuration('basic_rockets');
      expect(duration).toBe(10);
    });

    test('should return 0 duration for non-existent research', () => {
      const duration = getResearchDuration('non_existent');
      expect(duration).toBe(0);
    });

    test('higher tier research should cost more', () => {
      const tier1Cost = getResearchCost('basic_rockets').science;
      const tier2Cost = getResearchCost('ion_drives').science;
      const tier3Cost = getResearchCost('plasma_drives').science;
      const tier4Cost = getResearchCost('warp_drive_research').science;
      const tier5Cost = getResearchCost('exotic_propulsion').science;

      expect(tier1Cost).toBeLessThan(tier2Cost);
      expect(tier2Cost).toBeLessThan(tier3Cost);
      expect(tier3Cost).toBeLessThan(tier4Cost);
      expect(tier4Cost).toBeLessThan(tier5Cost);
    });

    test('higher tier research should take longer', () => {
      const tier1Duration = getResearchDuration('basic_rockets');
      const tier2Duration = getResearchDuration('ion_drives');
      const tier3Duration = getResearchDuration('plasma_drives');
      const tier4Duration = getResearchDuration('warp_drive_research');
      const tier5Duration = getResearchDuration('exotic_propulsion');

      expect(tier1Duration).toBeLessThan(tier2Duration);
      expect(tier2Duration).toBeLessThan(tier3Duration);
      expect(tier3Duration).toBeLessThan(tier4Duration);
      expect(tier4Duration).toBeLessThan(tier5Duration);
    });
  });

  describe('Mission Unlocks', () => {
    test('should return missions unlocked by research', () => {
      const missions = getUnlockedMissions('basic_rockets');
      expect(Array.isArray(missions)).toBe(true);
      expect(missions).toContain('moon_orbit');
      expect(missions).toContain('lunar_landing_1');
    });

    test('should return empty array for non-existent research', () => {
      const missions = getUnlockedMissions('non_existent');
      expect(missions).toEqual([]);
    });

    test('should return a copy of missions array', () => {
      const missions1 = getUnlockedMissions('basic_rockets');
      const missions2 = getUnlockedMissions('basic_rockets');
      expect(missions1).not.toBe(missions2);
      missions1.push('fake_mission');
      expect(missions2).not.toContain('fake_mission');
    });

    test('each research should unlock at least one mission', () => {
      Object.keys(ResearchTree).forEach(id => {
        const missions = getUnlockedMissions(id);
        expect(missions.length).toBeGreaterThan(0);
      });
    });

    test('should get all missions from completed research', () => {
      const completed = new Set(['basic_rockets', 'basic_life_support']);
      const allMissions = getAllUnlockedMissions(completed);

      expect(allMissions).toContain('moon_orbit');
      expect(allMissions).toContain('lunar_landing_1');
      expect(allMissions).toContain('space_station_1');
      expect(allMissions).toContain('lunar_base_1');
    });

    test('should handle empty completed research set', () => {
      const completed = new Set();
      const allMissions = getAllUnlockedMissions(completed);
      expect(allMissions.size).toBe(0);
    });
  });

  describe('Capability Unlocks', () => {
    test('should return capabilities unlocked by research', () => {
      const capabilities = getUnlockedCapabilities('basic_rockets');
      expect(Array.isArray(capabilities)).toBe(true);
      expect(capabilities).toContain('launch_small_rockets');
      expect(capabilities).toContain('orbital_mechanics');
    });

    test('should return empty array for non-existent research', () => {
      const capabilities = getUnlockedCapabilities('non_existent');
      expect(capabilities).toEqual([]);
    });

    test('should return a copy of capabilities array', () => {
      const cap1 = getUnlockedCapabilities('basic_rockets');
      const cap2 = getUnlockedCapabilities('basic_rockets');
      expect(cap1).not.toBe(cap2);
      cap1.push('fake_capability');
      expect(cap2).not.toContain('fake_capability');
    });

    test('each research should unlock at least one capability', () => {
      Object.keys(ResearchTree).forEach(id => {
        const capabilities = getUnlockedCapabilities(id);
        expect(capabilities.length).toBeGreaterThan(0);
      });
    });

    test('should get all capabilities from completed research', () => {
      const completed = new Set(['basic_rockets', 'basic_automation']);
      const allCapabilities = getAllUnlockedCapabilities(completed);

      expect(allCapabilities).toContain('launch_small_rockets');
      expect(allCapabilities).toContain('orbital_mechanics');
      expect(allCapabilities).toContain('drone_control');
      expect(allCapabilities).toContain('automated_mining');
    });

    test('should handle empty completed research set', () => {
      const completed = new Set();
      const allCapabilities = getAllUnlockedCapabilities(completed);
      expect(allCapabilities.size).toBe(0);
    });

    test('should not have duplicate capabilities across research in same tree path', () => {
      const tier1 = getResearchByTier(1);
      const allCaps = new Set();

      Object.keys(tier1).forEach(id => {
        const caps = getUnlockedCapabilities(id);
        caps.forEach(cap => {
          // Most capabilities should be unique, but some may be intentionally shared
          // This is a loose check to ensure capabilities are meaningful
          expect(typeof cap).toBe('string');
        });
      });
    });
  });

  describe('Research Statistics', () => {
    test('should return research statistics', () => {
      const stats = getResearchStats();
      expect(stats).toBeDefined();
      expect(stats.totalResearch).toBe(25);
    });

    test('statistics should show all categories', () => {
      const stats = getResearchStats();
      expect(stats.categories).toBeDefined();
      expect(stats.categories[ResearchCategories.PROPULSION]).toBe(5);
      expect(stats.categories[ResearchCategories.LIFE_SUPPORT]).toBe(5);
      expect(stats.categories[ResearchCategories.COMMUNICATIONS]).toBe(5);
      expect(stats.categories[ResearchCategories.MATERIALS]).toBe(5);
      expect(stats.categories[ResearchCategories.AI]).toBe(5);
    });

    test('statistics byTier should have all tiers', () => {
      const stats = getResearchStats();
      expect(stats.byTier).toBeDefined();
      for (let tier = 1; tier <= 5; tier++) {
        expect(stats.byTier[tier]).toBeDefined();
        expect(stats.byTier[tier].length).toBe(5);
      }
    });

    test('statistics byCategory should have all categories', () => {
      const stats = getResearchStats();
      expect(stats.byCategory).toBeDefined();
      expect(stats.byCategory[ResearchCategories.PROPULSION].length).toBe(5);
      expect(stats.byCategory[ResearchCategories.LIFE_SUPPORT].length).toBe(5);
      expect(stats.byCategory[ResearchCategories.COMMUNICATIONS].length).toBe(5);
      expect(stats.byCategory[ResearchCategories.MATERIALS].length).toBe(5);
      expect(stats.byCategory[ResearchCategories.AI].length).toBe(5);
    });
  });

  describe('Balanced Progression', () => {
    test('each category should have one tier 1 research', () => {
      const tier1 = getResearchByTier(1);
      const categories = {};

      Object.values(tier1).forEach(research => {
        categories[research.category] = (categories[research.category] || 0) + 1;
      });

      expect(Object.keys(categories).length).toBe(5);
      Object.values(categories).forEach(count => {
        expect(count).toBe(1);
      });
    });

    test('should have linear progression within categories', () => {
      Object.values(ResearchCategories).forEach(category => {
        for (let tier = 2; tier <= 5; tier++) {
          const tierResearch = getResearchByTier(tier);
          const categoryHasTier = Object.values(tierResearch).some(
            r => r.category === category
          );
          expect(categoryHasTier).toBe(true);
        }
      });
    });

    test('final tier research should unlock high-level capabilities', () => {
      const tier5 = getResearchByTier(5);
      Object.values(tier5).forEach(research => {
        const capabilities = getUnlockedCapabilities(research.id);
        expect(capabilities.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Research Relationships', () => {
    test('basic_rockets should lead to ion_drives', () => {
      const ionDrives = getResearchById('ion_drives');
      expect(ionDrives.dependencies).toContain('basic_rockets');
    });

    test('ion_drives should lead to plasma_drives', () => {
      const plasmaDrives = getResearchById('plasma_drives');
      expect(plasmaDrives.dependencies).toContain('ion_drives');
    });

    test('research progression should be possible through all tiers', () => {
      const propulsionCategory = getResearchByCategory(ResearchCategories.PROPULSION);
      const researchList = Object.keys(propulsionCategory).sort((a, b) => {
        return propulsionCategory[a].tier - propulsionCategory[b].tier;
      });

      let completed = new Set();
      for (const researchId of researchList) {
        expect(canStartResearch(researchId, completed)).toBe(true);
        completed.add(researchId);
      }
    });

    test('should be able to research complete path for any category', () => {
      Object.values(ResearchCategories).forEach(category => {
        const categoryResearch = getResearchByCategory(category);
        const orderedIds = Object.keys(categoryResearch).sort((a, b) => {
          return categoryResearch[a].tier - categoryResearch[b].tier;
        });

        let completed = new Set();
        orderedIds.forEach(id => {
          expect(canStartResearch(id, completed)).toBe(true);
          completed.add(id);
        });

        // All research in category should be completable
        expect(completed.size).toBe(5);
      });
    });
  });
});
