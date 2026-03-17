/**
 * Mission Data Tests
 *
 * Tests for mission catalog structure, properties, and utility functions
 */

import {
  missions,
  missionTiers,
  getMissionById,
  getMissionsByTier,
  getAvailableMissions,
  canUnlockMission,
  getTierByName,
  totalMissions,
} from "../../src/data/missions.js";

describe("Mission Data Catalog", () => {
  describe("Mission Count", () => {
    test("should have 20 or more missions", () => {
      expect(missions.length).toBeGreaterThanOrEqual(20);
    });

    test("totalMissions should match array length", () => {
      expect(totalMissions).toBe(missions.length);
    });
  });

  describe("Mission Structure", () => {
    test("each mission should have required properties", () => {
      const requiredProps = [
        "id",
        "name",
        "tier",
        "cost",
        "duration",
        "crewRequired",
        "successRate",
        "requiredTechLevel",
        "dependencies",
        "educationalFact",
      ];

      missions.forEach((mission) => {
        requiredProps.forEach((prop) => {
          expect(mission).toHaveProperty(prop);
        });
      });
    });

    test("each mission ID should be unique", () => {
      const ids = missions.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(missions.length);
    });

    test("mission names should not be empty", () => {
      missions.forEach((mission) => {
        expect(mission.name).toBeTruthy();
        expect(typeof mission.name).toBe("string");
      });
    });

    test("mission costs should be positive numbers", () => {
      missions.forEach((mission) => {
        expect(typeof mission.cost).toBe("number");
        expect(mission.cost).toBeGreaterThan(0);
      });
    });

    test("mission duration should be positive numbers", () => {
      missions.forEach((mission) => {
        expect(typeof mission.duration).toBe("number");
        expect(mission.duration).toBeGreaterThan(0);
      });
    });

    test("crew requirement should be non-negative integers", () => {
      missions.forEach((mission) => {
        expect(typeof mission.crewRequired).toBe("number");
        expect(Number.isInteger(mission.crewRequired)).toBe(true);
        expect(mission.crewRequired).toBeGreaterThanOrEqual(0);
      });
    });

    test("success rate should be between 0 and 100", () => {
      missions.forEach((mission) => {
        expect(typeof mission.successRate).toBe("number");
        expect(mission.successRate).toBeGreaterThan(0);
        expect(mission.successRate).toBeLessThanOrEqual(100);
      });
    });

    test("required tech level should be positive integer", () => {
      missions.forEach((mission) => {
        expect(typeof mission.requiredTechLevel).toBe("number");
        expect(Number.isInteger(mission.requiredTechLevel)).toBe(true);
        expect(mission.requiredTechLevel).toBeGreaterThan(0);
      });
    });

    test("dependencies should be an array", () => {
      missions.forEach((mission) => {
        expect(Array.isArray(mission.dependencies)).toBe(true);
      });
    });

    test("educational facts should not be empty", () => {
      missions.forEach((mission) => {
        expect(mission.educationalFact).toBeTruthy();
        expect(typeof mission.educationalFact).toBe("string");
      });
    });
  });

  describe("Mission Tiers", () => {
    test("should have 5 tiers", () => {
      expect(missionTiers.length).toBe(5);
    });

    test("should have all expected tier names", () => {
      const tierNames = missionTiers.map((t) => t.name);
      expect(tierNames).toEqual([
        "LEO",
        "Lunar",
        "Inner Solar",
        "Outer Solar",
        "Deep Space",
      ]);
    });

    test("each tier should have required properties", () => {
      const requiredProps = [
        "name",
        "displayName",
        "level",
        "description",
        "costModifier",
      ];

      missionTiers.forEach((tier) => {
        requiredProps.forEach((prop) => {
          expect(tier).toHaveProperty(prop);
        });
      });
    });

    test("tier levels should be 1-5 in order", () => {
      missionTiers.forEach((tier, index) => {
        expect(tier.level).toBe(index + 1);
      });
    });

    test("cost modifiers should increase with tier level", () => {
      for (let i = 0; i < missionTiers.length - 1; i++) {
        expect(missionTiers[i].costModifier).toBeLessThan(
          missionTiers[i + 1].costModifier
        );
      }
    });

    test("all missions should belong to a valid tier", () => {
      const validTiers = missionTiers.map((t) => t.name);
      missions.forEach((mission) => {
        expect(validTiers).toContain(mission.tier);
      });
    });
  });

  describe("Mission Distribution", () => {
    test("should have missions across all tiers", () => {
      const tierNames = missionTiers.map((t) => t.name);
      tierNames.forEach((tier) => {
        const missionsInTier = missions.filter((m) => m.tier === tier);
        expect(missionsInTier.length).toBeGreaterThan(0);
      });
    });

    test("LEO tier should have missions", () => {
      const leoMissions = missions.filter((m) => m.tier === "LEO");
      expect(leoMissions.length).toBeGreaterThanOrEqual(4);
    });

    test("Lunar tier should have missions", () => {
      const lunarMissions = missions.filter((m) => m.tier === "Lunar");
      expect(lunarMissions.length).toBeGreaterThanOrEqual(4);
    });

    test("Inner Solar tier should have missions", () => {
      const innerSolarMissions = missions.filter(
        (m) => m.tier === "Inner Solar"
      );
      expect(innerSolarMissions.length).toBeGreaterThanOrEqual(3);
    });

    test("Outer Solar tier should have missions", () => {
      const outerSolarMissions = missions.filter(
        (m) => m.tier === "Outer Solar"
      );
      expect(outerSolarMissions.length).toBeGreaterThanOrEqual(4);
    });

    test("Deep Space tier should have missions", () => {
      const deepSpaceMissions = missions.filter(
        (m) => m.tier === "Deep Space"
      );
      expect(deepSpaceMissions.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Mission Dependencies", () => {
    test("mission dependencies should reference valid mission IDs", () => {
      const validIds = new Set(missions.map((m) => m.id));
      missions.forEach((mission) => {
        mission.dependencies.forEach((depId) => {
          expect(validIds.has(depId)).toBe(true);
        });
      });
    });

    test("missions should not depend on themselves", () => {
      missions.forEach((mission) => {
        expect(mission.dependencies).not.toContain(mission.id);
      });
    });

    test("LEO missions should have no dependencies or depend on other LEO missions", () => {
      const leoMissions = missions.filter((m) => m.tier === "LEO");
      const leoIds = new Set(leoMissions.map((m) => m.id));

      leoMissions.forEach((mission) => {
        mission.dependencies.forEach((depId) => {
          const depMission = getMissionById(depId);
          expect(depMission.tier).toBe("LEO");
        });
      });
    });

    test("later tiers should typically depend on earlier tiers", () => {
      const tierHierarchy = {
        LEO: 1,
        Lunar: 2,
        "Inner Solar": 3,
        "Outer Solar": 4,
        "Deep Space": 5,
      };

      missions.forEach((mission) => {
        mission.dependencies.forEach((depId) => {
          const depMission = getMissionById(depId);
          const currentTierLevel = tierHierarchy[mission.tier];
          const depTierLevel = tierHierarchy[depMission.tier];
          expect(depTierLevel).toBeLessThanOrEqual(currentTierLevel);
        });
      });
    });
  });

  describe("Mission Tech Levels", () => {
    test("tech level requirements should increase with tier", () => {
      const tierTechLevels = {};
      missionTiers.forEach((tier) => {
        const missionsInTier = missions.filter((m) => m.tier === tier.name);
        const minTechLevel = Math.min(
          ...missionsInTier.map((m) => m.requiredTechLevel)
        );
        tierTechLevels[tier.name] = minTechLevel;
      });

      const tierNames = missionTiers.map((t) => t.name);
      for (let i = 0; i < tierNames.length - 1; i++) {
        expect(tierTechLevels[tierNames[i]]).toBeLessThanOrEqual(
          tierTechLevels[tierNames[i + 1]]
        );
      }
    });

    test("missions should reference techs realistically", () => {
      missions.forEach((mission) => {
        expect(mission.requiredTechLevel).toBeGreaterThanOrEqual(1);
        expect(mission.requiredTechLevel).toBeLessThanOrEqual(8);
      });
    });
  });

  describe("Utility Functions", () => {
    describe("getMissionById", () => {
      test("should return mission by valid ID", () => {
        const mission = getMissionById("iss-resupply");
        expect(mission).toBeTruthy();
        expect(mission.name).toBe("ISS Supply Mission");
      });

      test("should return undefined for invalid ID", () => {
        const mission = getMissionById("non-existent-mission");
        expect(mission).toBeUndefined();
      });
    });

    describe("getMissionsByTier", () => {
      test("should return all missions of a tier", () => {
        const leoMissions = getMissionsByTier("LEO");
        expect(leoMissions.length).toBeGreaterThan(0);
        leoMissions.forEach((mission) => {
          expect(mission.tier).toBe("LEO");
        });
      });

      test("should return empty array for invalid tier", () => {
        const missions = getMissionsByTier("InvalidTier");
        expect(missions).toEqual([]);
      });

      test("should work for all valid tiers", () => {
        missionTiers.forEach((tier) => {
          const tierMissions = getMissionsByTier(tier.name);
          expect(tierMissions.length).toBeGreaterThan(0);
        });
      });
    });

    describe("getAvailableMissions", () => {
      test("should return missions below tech level", () => {
        const available = getAvailableMissions(2);
        available.forEach((mission) => {
          expect(mission.requiredTechLevel).toBeLessThanOrEqual(2);
        });
      });

      test("should include all missions at max tech level", () => {
        const maxTechLevel = Math.max(
          ...missions.map((m) => m.requiredTechLevel)
        );
        const available = getAvailableMissions(maxTechLevel);
        expect(available.length).toBe(missions.length);
      });

      test("should return empty array for tech level 0", () => {
        const available = getAvailableMissions(0);
        expect(available.length).toBe(0);
      });
    });

    describe("canUnlockMission", () => {
      test("should return true for mission with no dependencies", () => {
        const missionWithNoDeps = missions.find((m) => m.dependencies.length === 0);
        const canUnlock = canUnlockMission(missionWithNoDeps.id, []);
        expect(canUnlock).toBe(true);
      });

      test("should return false when dependencies not met", () => {
        const missionWithDeps = missions.find((m) => m.dependencies.length > 0);
        if (missionWithDeps) {
          const canUnlock = canUnlockMission(missionWithDeps.id, []);
          expect(canUnlock).toBe(false);
        }
      });

      test("should return true when all dependencies met", () => {
        const missionWithDeps = missions.find((m) => m.dependencies.length > 0);
        if (missionWithDeps) {
          const canUnlock = canUnlockMission(
            missionWithDeps.id,
            missionWithDeps.dependencies
          );
          expect(canUnlock).toBe(true);
        }
      });

      test("should return false for invalid mission ID", () => {
        const canUnlock = canUnlockMission("invalid-id", []);
        expect(canUnlock).toBe(false);
      });
    });

    describe("getTierByName", () => {
      test("should return tier by valid name", () => {
        const tier = getTierByName("LEO");
        expect(tier).toBeTruthy();
        expect(tier.displayName).toBe("Low Earth Orbit");
      });

      test("should return undefined for invalid tier name", () => {
        const tier = getTierByName("InvalidTier");
        expect(tier).toBeUndefined();
      });

      test("should work for all valid tiers", () => {
        missionTiers.forEach((originalTier) => {
          const tier = getTierByName(originalTier.name);
          expect(tier).toEqual(originalTier);
        });
      });
    });
  });

  describe("Real Space Mission Data", () => {
    test("should contain recognizable space missions", () => {
      const missionNames = missions.map((m) => m.name.toLowerCase());
      expect(
        missionNames.some((name) => name.includes("iss") || name.includes("station"))
      ).toBe(true);
      expect(missionNames.some((name) => name.includes("lunar"))).toBe(true);
      expect(missionNames.some((name) => name.includes("jupiter"))).toBe(true);
    });

    test("should have realistic mission costs", () => {
      missions.forEach((mission) => {
        // LEO missions typically $50-500M, Lunar $1-5B, etc.
        if (mission.tier === "LEO") {
          expect(mission.cost).toBeLessThan(1000);
        }
        if (mission.tier === "Deep Space") {
          expect(mission.cost).toBeGreaterThan(5000);
        }
      });
    });

    test("should have realistic mission durations", () => {
      missions.forEach((mission) => {
        // LEO missions typically 5-15 days, Deep Space > 500 days
        if (mission.tier === "LEO") {
          expect(mission.duration).toBeLessThan(50);
        }
        if (mission.tier === "Deep Space") {
          expect(mission.duration).toBeGreaterThan(300);
        }
      });
    });

    test("should have educational value in facts", () => {
      missions.forEach((mission) => {
        expect(mission.educationalFact.length).toBeGreaterThan(20);
      });
    });
  });
});
