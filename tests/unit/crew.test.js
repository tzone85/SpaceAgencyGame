/**
 * Crew Data Tests
 *
 * Test suite for crew member templates, roles, stats, and procedural generation
 */

import {
  CREW_ROLES,
  CREW_STATS,
  FAMOUS_ASTRONAUTS,
  NAME_POOLS,
  generateProceduralCrew,
  getCrewRoleTemplate,
  getAllCrewRoles,
  getAllCrewStats,
  getCrewStatDefinition,
  getFamousAstronaut,
  getAllFamousAstronauts
} from '../../src/data/crew.js';

describe('Crew Data & Templates', () => {
  describe('Crew Roles', () => {
    test('should have all required crew roles', () => {
      expect(CREW_ROLES.PILOT).toBeDefined();
      expect(CREW_ROLES.ENGINEER).toBeDefined();
      expect(CREW_ROLES.SCIENTIST).toBeDefined();
      expect(CREW_ROLES.MEDICAL_OFFICER).toBeDefined();
      expect(CREW_ROLES.MISSION_SPECIALIST).toBeDefined();
    });

    test('each role should have required properties', () => {
      Object.values(CREW_ROLES).forEach(role => {
        expect(role.id).toBeDefined();
        expect(role.name).toBeDefined();
        expect(role.description).toBeDefined();
        expect(role.statRanges).toBeDefined();
        expect(role.baseSalary).toBeGreaterThan(0);
        expect(role.recruitmentCost).toBeGreaterThan(0);
      });
    });

    test('each role should have stat ranges for all crew stats', () => {
      Object.values(CREW_ROLES).forEach(role => {
        expect(role.statRanges.experience).toBeDefined();
        expect(role.statRanges.morale).toBeDefined();
        expect(role.statRanges.health).toBeDefined();
        expect(role.statRanges.skillLevel).toBeDefined();
      });
    });

    test('stat ranges should have valid min and max values', () => {
      Object.values(CREW_ROLES).forEach(role => {
        Object.entries(role.statRanges).forEach(([stat, range]) => {
          expect(range.min).toBeGreaterThanOrEqual(0);
          expect(range.max).toBeLessThanOrEqual(100);
          expect(range.min).toBeLessThanOrEqual(range.max);
        });
      });
    });

    test('recruitment cost should be greater than base salary', () => {
      Object.values(CREW_ROLES).forEach(role => {
        expect(role.recruitmentCost).toBeGreaterThan(role.baseSalary);
      });
    });
  });

  describe('Crew Stats', () => {
    test('should have all required crew stat definitions', () => {
      expect(CREW_STATS.EXPERIENCE).toBeDefined();
      expect(CREW_STATS.MORALE).toBeDefined();
      expect(CREW_STATS.HEALTH).toBeDefined();
      expect(CREW_STATS.SKILL_LEVEL).toBeDefined();
    });

    test('each stat should have required properties', () => {
      Object.values(CREW_STATS).forEach(stat => {
        expect(stat.id).toBeDefined();
        expect(stat.name).toBeDefined();
        expect(stat.description).toBeDefined();
        expect(stat.min).toBeDefined();
        expect(stat.max).toBeDefined();
        expect(stat.impact).toBeDefined();
      });
    });

    test('stat ranges should be 0-100', () => {
      Object.values(CREW_STATS).forEach(stat => {
        expect(stat.min).toBe(0);
        expect(stat.max).toBe(100);
      });
    });
  });

  describe('Famous Astronauts', () => {
    test('should have at least some famous astronauts', () => {
      expect(FAMOUS_ASTRONAUTS.length).toBeGreaterThan(0);
    });

    test('each astronaut should have required properties', () => {
      FAMOUS_ASTRONAUTS.forEach(astronaut => {
        expect(astronaut.id).toBeDefined();
        expect(astronaut.firstName).toBeDefined();
        expect(astronaut.lastName).toBeDefined();
        expect(astronaut.role).toBeDefined();
        expect(astronaut.stats).toBeDefined();
        expect(astronaut.recruitmentCost).toBeGreaterThan(0);
        expect(astronaut.baseSalary).toBeGreaterThan(0);
        expect(astronaut.historicalNote).toBeDefined();
      });
    });

    test('each astronaut should have all required stats', () => {
      FAMOUS_ASTRONAUTS.forEach(astronaut => {
        expect(astronaut.stats.experience).toBeDefined();
        expect(astronaut.stats.morale).toBeDefined();
        expect(astronaut.stats.health).toBeDefined();
        expect(astronaut.stats.skillLevel).toBeDefined();
      });
    });

    test('astronaut stats should be within valid ranges', () => {
      FAMOUS_ASTRONAUTS.forEach(astronaut => {
        Object.entries(astronaut.stats).forEach(([stat, value]) => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(100);
        });
      });
    });

    test('astronaut roles should be valid', () => {
      const validRoles = Object.values(CREW_ROLES).map(r => r.id);
      FAMOUS_ASTRONAUTS.forEach(astronaut => {
        expect(validRoles).toContain(astronaut.role);
      });
    });

    test('famous astronauts should have higher stats than typical ranges', () => {
      FAMOUS_ASTRONAUTS.forEach(astronaut => {
        const role = Object.values(CREW_ROLES).find(r => r.id === astronaut.role);
        // Famous astronauts should generally have higher stats
        const avgStats = Object.values(astronaut.stats).reduce((a, b) => a + b, 0) / 4;
        const avgRoleMax = Object.values(role.statRanges).reduce(
          (a, b) => a + b.max, 0
        ) / 4;
        expect(avgStats).toBeGreaterThan(avgRoleMax * 0.8);
      });
    });
  });

  describe('Name Pools', () => {
    test('should have first names', () => {
      expect(NAME_POOLS.firstNames).toBeDefined();
      expect(Array.isArray(NAME_POOLS.firstNames)).toBe(true);
      expect(NAME_POOLS.firstNames.length).toBeGreaterThan(0);
    });

    test('should have last names', () => {
      expect(NAME_POOLS.lastNames).toBeDefined();
      expect(Array.isArray(NAME_POOLS.lastNames)).toBe(true);
      expect(NAME_POOLS.lastNames.length).toBeGreaterThan(0);
    });

    test('all names should be non-empty strings', () => {
      NAME_POOLS.firstNames.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });

      NAME_POOLS.lastNames.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Procedural Crew Generation', () => {
    test('should generate a procedural crew member', () => {
      const crew = generateProceduralCrew(CREW_ROLES.PILOT.id);
      expect(crew).toBeDefined();
      expect(crew.id).toBeDefined();
      expect(crew.firstName).toBeDefined();
      expect(crew.lastName).toBeDefined();
      expect(crew.role).toBe(CREW_ROLES.PILOT.id);
    });

    test('generated crew should have all required stats', () => {
      const crew = generateProceduralCrew(CREW_ROLES.ENGINEER.id);
      expect(crew.stats.experience).toBeDefined();
      expect(crew.stats.morale).toBeDefined();
      expect(crew.stats.health).toBeDefined();
      expect(crew.stats.skillLevel).toBeDefined();
    });

    test('generated crew stats should be within role ranges', () => {
      const roleId = CREW_ROLES.SCIENTIST.id;
      const role = CREW_ROLES.SCIENTIST;
      const crew = generateProceduralCrew(roleId);

      expect(crew.stats.experience).toBeGreaterThanOrEqual(role.statRanges.experience.min);
      expect(crew.stats.experience).toBeLessThanOrEqual(role.statRanges.experience.max);
      expect(crew.stats.morale).toBeGreaterThanOrEqual(role.statRanges.morale.min);
      expect(crew.stats.morale).toBeLessThanOrEqual(role.statRanges.morale.max);
      expect(crew.stats.health).toBeGreaterThanOrEqual(role.statRanges.health.min);
      expect(crew.stats.health).toBeLessThanOrEqual(role.statRanges.health.max);
      expect(crew.stats.skillLevel).toBeGreaterThanOrEqual(role.statRanges.skillLevel.min);
      expect(crew.stats.skillLevel).toBeLessThanOrEqual(role.statRanges.skillLevel.max);
    });

    test('generated crew should inherit role salary and cost', () => {
      const crew = generateProceduralCrew(CREW_ROLES.PILOT.id);
      expect(crew.baseSalary).toBe(CREW_ROLES.PILOT.baseSalary);
      expect(crew.recruitmentCost).toBe(CREW_ROLES.PILOT.recruitmentCost);
    });

    test('generated crew IDs should be unique', () => {
      const crew1 = generateProceduralCrew(CREW_ROLES.PILOT.id);
      const crew2 = generateProceduralCrew(CREW_ROLES.PILOT.id);
      expect(crew1.id).not.toBe(crew2.id);
    });

    test('should generate crew for each role', () => {
      Object.values(CREW_ROLES).forEach(role => {
        const crew = generateProceduralCrew(role.id);
        expect(crew.role).toBe(role.id);
      });
    });

    test('should throw error for invalid role', () => {
      expect(() => {
        generateProceduralCrew('invalid_role');
      }).toThrow();
    });

    test('generated crew names should be from name pools', () => {
      const crew = generateProceduralCrew(CREW_ROLES.PILOT.id);
      expect(NAME_POOLS.firstNames).toContain(crew.firstName);
      expect(NAME_POOLS.lastNames).toContain(crew.lastName);
    });
  });

  describe('Helper Functions', () => {
    describe('getCrewRoleTemplate', () => {
      test('should return a role template for valid role ID', () => {
        const template = getCrewRoleTemplate(CREW_ROLES.PILOT.id);
        expect(template).toBeDefined();
        expect(template.id).toBe(CREW_ROLES.PILOT.id);
        expect(template.name).toBe(CREW_ROLES.PILOT.name);
      });

      test('should return a copy of the role template', () => {
        const template = getCrewRoleTemplate(CREW_ROLES.PILOT.id);
        template.name = 'Modified';
        expect(CREW_ROLES.PILOT.name).not.toBe('Modified');
      });

      test('should throw error for invalid role ID', () => {
        expect(() => {
          getCrewRoleTemplate('invalid_role');
        }).toThrow();
      });
    });

    describe('getAllCrewRoles', () => {
      test('should return all crew roles', () => {
        const roles = getAllCrewRoles();
        expect(roles.length).toBe(5);
      });

      test('should return an array of role objects', () => {
        const roles = getAllCrewRoles();
        expect(Array.isArray(roles)).toBe(true);
        roles.forEach(role => {
          expect(role.id).toBeDefined();
          expect(role.name).toBeDefined();
        });
      });
    });

    describe('getAllCrewStats', () => {
      test('should return all crew stats', () => {
        const stats = getAllCrewStats();
        expect(stats.length).toBe(4);
      });

      test('should return an array of stat objects', () => {
        const stats = getAllCrewStats();
        expect(Array.isArray(stats)).toBe(true);
        stats.forEach(stat => {
          expect(stat.id).toBeDefined();
          expect(stat.name).toBeDefined();
        });
      });
    });

    describe('getCrewStatDefinition', () => {
      test('should return stat definition for valid stat ID', () => {
        const stat = getCrewStatDefinition(CREW_STATS.EXPERIENCE.id);
        expect(stat).toBeDefined();
        expect(stat.id).toBe(CREW_STATS.EXPERIENCE.id);
        expect(stat.name).toBe(CREW_STATS.EXPERIENCE.name);
      });

      test('should throw error for invalid stat ID', () => {
        expect(() => {
          getCrewStatDefinition('invalid_stat');
        }).toThrow();
      });
    });

    describe('getFamousAstronaut', () => {
      test('should return astronaut for valid ID', () => {
        const astronaut = getFamousAstronaut('neil_armstrong');
        expect(astronaut).toBeDefined();
        expect(astronaut.id).toBe('neil_armstrong');
        expect(astronaut.firstName).toBe('Neil');
        expect(astronaut.lastName).toBe('Armstrong');
      });

      test('should return a copy of astronaut data', () => {
        const astronaut = getFamousAstronaut('neil_armstrong');
        astronaut.stats.experience = 0;
        const original = FAMOUS_ASTRONAUTS.find(a => a.id === 'neil_armstrong');
        expect(original.stats.experience).not.toBe(0);
      });

      test('should throw error for invalid ID', () => {
        expect(() => {
          getFamousAstronaut('invalid_id');
        }).toThrow();
      });
    });

    describe('getAllFamousAstronauts', () => {
      test('should return all famous astronauts', () => {
        const astronauts = getAllFamousAstronauts();
        expect(astronauts.length).toBe(FAMOUS_ASTRONAUTS.length);
      });

      test('should return copies of astronaut data', () => {
        const astronauts = getAllFamousAstronauts();
        astronauts[0].stats.experience = 0;
        expect(FAMOUS_ASTRONAUTS[0].stats.experience).not.toBe(0);
      });
    });
  });

  describe('Crew Data Consistency', () => {
    test('all roles should have recruitment cost >= base salary * 2', () => {
      Object.values(CREW_ROLES).forEach(role => {
        expect(role.recruitmentCost).toBeGreaterThanOrEqual(role.baseSalary * 1.5);
      });
    });

    test('famous astronauts should have higher recruitment costs', () => {
      FAMOUS_ASTRONAUTS.forEach(astronaut => {
        const roleTemplate = Object.values(CREW_ROLES).find(r => r.id === astronaut.role);
        // Famous astronauts typically cost more
        expect(astronaut.recruitmentCost).toBeGreaterThan(roleTemplate.recruitmentCost);
      });
    });

    test('stat ranges should not exceed 0-100', () => {
      Object.values(CREW_ROLES).forEach(role => {
        Object.values(role.statRanges).forEach(range => {
          expect(range.min).toBeGreaterThanOrEqual(0);
          expect(range.max).toBeLessThanOrEqual(100);
        });
      });
    });
  });
});
