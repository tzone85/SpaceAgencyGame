/**
 * Tests for Game Constants and Helpers
 *
 * Comprehensive test suite for game constants and utility functions
 */

import {
  BUDGET,
  INCOME,
  MISSION_COSTS,
  FACILITY_COSTS,
  DIFFICULTY,
  COLORS,
  TIME,
  MECHANICS,
  RESEARCH,
  EVENTS,
  UI,
  LIMITS,
} from '../../src/utils/constants.js';

import {
  formatCurrency,
  formatNumber,
  formatCurrencyFull,
  parseCurrency,
  formatGameTime,
  ticksToMonths,
  monthsToTicks,
  ticksToYears,
  yearsToTicks,
  getElapsedTime,
  randomInt,
  randomFloat,
  randomChoice,
  randomChoices,
  weightedRandom,
  randomGaussian,
  randomEvent,
  seededRandom,
  clamp,
  lerp,
  calculatePercentage,
  formatPercentage,
  shuffle,
  deepClone,
} from '../../src/utils/helpers.js';

describe('Constants', () => {
  describe('BUDGET', () => {
    test('should have starting budget defined', () => {
      expect(BUDGET.STARTING_BUDGET).toBe(1000000);
      expect(BUDGET.STARTING_BUDGET_EASY).toBe(1500000);
      expect(BUDGET.STARTING_BUDGET_HARD).toBe(500000);
    });

    test('should have positive budget thresholds', () => {
      expect(BUDGET.MIN_SAFE_BUDGET).toBeGreaterThan(0);
      expect(BUDGET.BANKRUPTCY_THRESHOLD).toBe(0);
    });
  });

  describe('INCOME', () => {
    test('should have all income types defined', () => {
      expect(INCOME.BASE_MONTHLY_INCOME).toBeGreaterThan(0);
      expect(INCOME.RESEARCH_INCOME).toBeGreaterThan(0);
      expect(INCOME.MINING_INCOME).toBeGreaterThan(0);
      expect(INCOME.TOURISM_INCOME).toBeGreaterThan(0);
      expect(INCOME.COMMERCIAL_INCOME).toBeGreaterThan(0);
    });
  });

  describe('MISSION_COSTS', () => {
    test('should have all mission types with costs', () => {
      expect(MISSION_COSTS.RECONNAISSANCE).toBeGreaterThan(0);
      expect(MISSION_COSTS.SAMPLE_COLLECTION).toBeGreaterThan(0);
      expect(MISSION_COSTS.SATELLITE_DEPLOYMENT).toBeGreaterThan(0);
      expect(MISSION_COSTS.DEEP_SPACE_PROBE).toBeGreaterThan(0);
      expect(MISSION_COSTS.CREWED_MISSION).toBeGreaterThan(0);
      expect(MISSION_COSTS.COLONY_ESTABLISHMENT).toBeGreaterThan(0);
    });

    test('should have increasing costs for more complex missions', () => {
      expect(MISSION_COSTS.RECONNAISSANCE)
        .toBeLessThan(MISSION_COSTS.SAMPLE_COLLECTION);
      expect(MISSION_COSTS.SAMPLE_COLLECTION)
        .toBeLessThan(MISSION_COSTS.SATELLITE_DEPLOYMENT);
      expect(MISSION_COSTS.CREWED_MISSION)
        .toBeLessThan(MISSION_COSTS.COLONY_ESTABLISHMENT);
    });
  });

  describe('FACILITY_COSTS', () => {
    test('should have all facility types with costs', () => {
      expect(FACILITY_COSTS.MISSION_CONTROL).toBeGreaterThan(0);
      expect(FACILITY_COSTS.LAUNCH_PAD).toBeGreaterThan(0);
      expect(FACILITY_COSTS.RESEARCH_LAB).toBeGreaterThan(0);
      expect(FACILITY_COSTS.HABITAT).toBeGreaterThan(0);
      expect(FACILITY_COSTS.FUEL_DEPOT).toBeGreaterThan(0);
      expect(FACILITY_COSTS.OBSERVATORY).toBeGreaterThan(0);
    });
  });

  describe('DIFFICULTY', () => {
    test('should have all difficulty levels', () => {
      expect(DIFFICULTY.EASY).toBeDefined();
      expect(DIFFICULTY.NORMAL).toBeDefined();
      expect(DIFFICULTY.HARD).toBeDefined();
    });

    test('should have valid multipliers for each difficulty', () => {
      [DIFFICULTY.EASY, DIFFICULTY.NORMAL, DIFFICULTY.HARD].forEach((diff) => {
        expect(diff.missionCostMultiplier).toBeGreaterThan(0);
        expect(diff.incomeMultiplier).toBeGreaterThan(0);
        expect(diff.researchSpeedMultiplier).toBeGreaterThan(0);
        expect(diff.emergencyFrequency).toBeGreaterThanOrEqual(0);
        expect(diff.startingBudget).toBeGreaterThan(0);
      });
    });

    test('should have Easy with lower costs and higher income', () => {
      expect(DIFFICULTY.EASY.missionCostMultiplier)
        .toBeLessThan(DIFFICULTY.NORMAL.missionCostMultiplier);
      expect(DIFFICULTY.EASY.incomeMultiplier)
        .toBeGreaterThan(DIFFICULTY.NORMAL.incomeMultiplier);
    });

    test('should have Hard with higher costs and lower income', () => {
      expect(DIFFICULTY.HARD.missionCostMultiplier)
        .toBeGreaterThan(DIFFICULTY.NORMAL.missionCostMultiplier);
      expect(DIFFICULTY.HARD.incomeMultiplier)
        .toBeLessThan(DIFFICULTY.NORMAL.incomeMultiplier);
    });
  });

  describe('COLORS', () => {
    test('should have all color categories defined', () => {
      expect(COLORS.PRIMARY).toBeDefined();
      expect(COLORS.SECONDARY).toBeDefined();
      expect(COLORS.DARK_BG).toBeDefined();
      expect(COLORS.TEXT_PRIMARY).toBeDefined();
      expect(COLORS.SUCCESS).toBeDefined();
      expect(COLORS.DANGER).toBeDefined();
    });

    test('should have valid color formats', () => {
      const hexRegex = /^#[0-9A-F]{6}$/i;
      expect(COLORS.PRIMARY).toMatch(hexRegex);
      expect(COLORS.TEXT_PRIMARY).toMatch(hexRegex);
      expect(COLORS.SUCCESS).toMatch(hexRegex);
    });
  });

  describe('TIME', () => {
    test('should have time constants defined', () => {
      expect(TIME.GAME_TICK_MS).toBe(1000);
      expect(TIME.MONTH_IN_TICKS).toBe(30);
      expect(TIME.YEAR_IN_MONTHS).toBe(12);
    });
  });

  describe('MECHANICS', () => {
    test('should have valid game mechanics', () => {
      expect(MECHANICS.MAX_ACTIVE_MISSIONS).toBeGreaterThan(0);
      expect(MECHANICS.MAX_FACILITIES).toBeGreaterThan(0);
      expect(MECHANICS.MAX_RESEARCH_PROJECTS).toBeGreaterThan(0);
    });

    test('should have valid success rate bounds', () => {
      expect(MECHANICS.MIN_MISSION_SUCCESS_RATE).toBeGreaterThan(0);
      expect(MECHANICS.MAX_MISSION_SUCCESS_RATE).toBeLessThanOrEqual(1);
      expect(MECHANICS.MIN_MISSION_SUCCESS_RATE)
        .toBeLessThan(MECHANICS.MAX_MISSION_SUCCESS_RATE);
    });
  });

  describe('RESEARCH', () => {
    test('should have research projects defined', () => {
      expect(RESEARCH.SOLAR_PROPULSION).toBeDefined();
      expect(RESEARCH.ADVANCED_LIFE_SUPPORT).toBeDefined();
      expect(RESEARCH.MINING_TECHNOLOGY).toBeDefined();
    });

    test('should have valid costs and durations', () => {
      Object.values(RESEARCH).forEach((tech) => {
        expect(tech.name).toBeDefined();
        expect(tech.cost).toBeGreaterThan(0);
        expect(tech.duration).toBeGreaterThan(0);
      });
    });
  });

  describe('EVENTS', () => {
    test('should have game events defined', () => {
      expect(EVENTS.SOLAR_FLARE).toBeDefined();
      expect(EVENTS.EQUIPMENT_FAILURE).toBeDefined();
      expect(EVENTS.BUDGET_BOOST).toBeDefined();
      expect(EVENTS.MEDIA_INTEREST).toBeDefined();
    });

    test('should have valid probabilities', () => {
      Object.values(EVENTS).forEach((event) => {
        expect(event.probability).toBeGreaterThanOrEqual(0);
        expect(event.probability).toBeLessThanOrEqual(1);
      });
    });
  });
});

describe('Currency Formatting Helpers', () => {
  describe('formatCurrency', () => {
    test('should format large numbers with B suffix', () => {
      expect(formatCurrency(1000000000)).toBe('1.00B');
      expect(formatCurrency(2500000000)).toBe('2.50B');
    });

    test('should format millions with M suffix', () => {
      expect(formatCurrency(1000000)).toBe('1.00M');
      expect(formatCurrency(5000000)).toBe('5.00M');
    });

    test('should format thousands with K suffix', () => {
      expect(formatCurrency(1000)).toBe('1.00K');
      expect(formatCurrency(5500)).toBe('5.50K');
    });

    test('should format small numbers without suffix', () => {
      expect(formatCurrency(500)).toBe('500');
      expect(formatCurrency(999)).toBe('999');
    });

    test('should handle negative values', () => {
      expect(formatCurrency(-1000000)).toBe('-1.00M');
      expect(formatCurrency(-500)).toBe('-500');
    });

    test('should handle zero', () => {
      expect(formatCurrency(0)).toBe('0');
    });
  });

  describe('formatNumber', () => {
    test('should add thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123456789)).toBe('123,456,789');
    });

    test('should handle decimals by flooring', () => {
      expect(formatNumber(1234.56)).toBe('1,234');
      expect(formatNumber(999.99)).toBe('999');
    });
  });

  describe('formatCurrencyFull', () => {
    test('should format with currency symbol', () => {
      expect(formatCurrencyFull(1000000)).toBe('Cr1,000,000');
      expect(formatCurrencyFull(1000000, '$')).toBe('$1,000,000');
    });
  });

  describe('parseCurrency', () => {
    test('should parse formatted currency strings', () => {
      expect(parseCurrency('1.00K')).toBe(1000);
      expect(parseCurrency('1.00M')).toBe(1000000);
      expect(parseCurrency('1.00B')).toBe(1000000000);
    });

    test('should handle numbers without suffix', () => {
      expect(parseCurrency('500')).toBe(500);
      expect(parseCurrency('1234')).toBe(1234);
    });

    test('should return 0 for invalid input', () => {
      expect(parseCurrency('invalid')).toBe(0);
      expect(parseCurrency('')).toBe(0);
    });
  });
});

describe('Time Calculation Helpers', () => {
  describe('formatGameTime', () => {
    test('should format ticks as game time', () => {
      expect(formatGameTime(30)).toBe('1m');
      expect(formatGameTime(360)).toBe('1y');
      expect(formatGameTime(390)).toBe('1y 1m');
    });

    test('should handle zero ticks', () => {
      expect(formatGameTime(0)).toBe('0t');
    });

    test('should handle small tick counts', () => {
      expect(formatGameTime(15)).toBe('15t');
    });
  });

  describe('ticksToMonths', () => {
    test('should convert ticks to months', () => {
      expect(ticksToMonths(30)).toBe(1);
      expect(ticksToMonths(60)).toBe(2);
      expect(ticksToMonths(150)).toBe(5);
    });
  });

  describe('monthsToTicks', () => {
    test('should convert months to ticks', () => {
      expect(monthsToTicks(1)).toBe(30);
      expect(monthsToTicks(2)).toBe(60);
      expect(monthsToTicks(5)).toBe(150);
    });
  });

  describe('ticksToYears', () => {
    test('should convert ticks to years', () => {
      expect(ticksToYears(360)).toBe(1);
      expect(ticksToYears(720)).toBe(2);
    });
  });

  describe('yearsToTicks', () => {
    test('should convert years to ticks', () => {
      expect(yearsToTicks(1)).toBe(360);
      expect(yearsToTicks(2)).toBe(720);
    });
  });

  describe('getElapsedTime', () => {
    test('should calculate elapsed time', () => {
      expect(getElapsedTime(0, 30)).toBe('1m');
      expect(getElapsedTime(100, 460)).toBe('1y');
    });
  });
});

describe('Random Number Generation Helpers', () => {
  describe('randomInt', () => {
    test('should generate random integers in range', () => {
      for (let i = 0; i < 100; i++) {
        const val = randomInt(1, 10);
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(10);
        expect(Number.isInteger(val)).toBe(true);
      }
    });

    test('should handle same min and max', () => {
      expect(randomInt(5, 5)).toBe(5);
    });
  });

  describe('randomFloat', () => {
    test('should generate random floats in range', () => {
      for (let i = 0; i < 100; i++) {
        const val = randomFloat(0, 1);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('randomChoice', () => {
    test('should pick element from array', () => {
      const arr = [1, 2, 3, 4, 5];
      const choice = randomChoice(arr);
      expect(arr).toContain(choice);
    });

    test('should return undefined for empty array', () => {
      expect(randomChoice([])).toBeUndefined();
    });

    test('should return undefined for null', () => {
      expect(randomChoice(null)).toBeUndefined();
    });
  });

  describe('randomChoices', () => {
    test('should pick multiple elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const choices = randomChoices(arr, 3);
      expect(choices.length).toBe(3);
      choices.forEach((choice) => {
        expect(arr).toContain(choice);
      });
    });

    test('should not exceed array length', () => {
      const arr = [1, 2, 3];
      const choices = randomChoices(arr, 10);
      expect(choices.length).toBeLessThanOrEqual(3);
    });
  });

  describe('weightedRandom', () => {
    test('should select from weighted choices', () => {
      const choices = { a: 0.7, b: 0.2, c: 0.1 };
      const result = weightedRandom(choices);
      expect(['a', 'b', 'c']).toContain(result);
    });

    test('should return null for empty choices', () => {
      expect(weightedRandom({})).toBeNull();
    });
  });

  describe('randomGaussian', () => {
    test('should generate values with gaussian distribution', () => {
      const values = [];
      for (let i = 0; i < 1000; i++) {
        values.push(randomGaussian(0, 1));
      }
      const mean = values.reduce((a, b) => a + b) / values.length;
      expect(Math.abs(mean)).toBeLessThan(0.2); // Should be close to 0
    });
  });

  describe('randomEvent', () => {
    test('should return boolean', () => {
      const result = randomEvent(0.5);
      expect(typeof result).toBe('boolean');
    });

    test('should never occur with probability 0', () => {
      expect(randomEvent(0)).toBe(false);
    });

    test('should always occur with probability 1', () => {
      expect(randomEvent(1)).toBe(true);
    });
  });

  describe('seededRandom', () => {
    test('should produce same value for same seed', () => {
      const val1 = seededRandom(12345);
      const val2 = seededRandom(12345);
      expect(val1).toBe(val2);
    });

    test('should be between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        const val = seededRandom(i);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    });
  });
});

describe('Utility Helpers', () => {
  describe('clamp', () => {
    test('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    test('should interpolate between values', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(0, 10, 0.5)).toBe(5);
    });
  });

  describe('calculatePercentage', () => {
    test('should calculate percentage', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 3)).toBeCloseTo(33.33, 2);
    });

    test('should return 0 for zero whole', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
    });
  });

  describe('formatPercentage', () => {
    test('should format as percentage string', () => {
      expect(formatPercentage(0.5)).toBe('50.0%');
      expect(formatPercentage(0.333)).toBe('33.3%');
    });

    test('should respect decimal places parameter', () => {
      expect(formatPercentage(0.3333, 2)).toBe('33.33%');
      expect(formatPercentage(0.5, 0)).toBe('50%');
    });
  });

  describe('shuffle', () => {
    test('should shuffle array', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled).toHaveLength(arr.length);
      shuffled.forEach((val) => {
        expect(arr).toContain(val);
      });
    });

    test('should not mutate original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffle(arr);
      expect(arr).toEqual(original);
    });
  });

  describe('deepClone', () => {
    test('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('test')).toBe('test');
      expect(deepClone(true)).toBe(true);
    });

    test('should clone arrays', () => {
      const arr = [1, 2, 3];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    test('should clone objects', () => {
      const obj = { a: 1, b: 2 };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    test('should deep clone nested structures', () => {
      const obj = { a: [1, 2], b: { c: 3 } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.a).not.toBe(obj.a);
      expect(cloned.b).not.toBe(obj.b);
    });

    test('should clone dates', () => {
      const date = new Date('2024-01-01');
      const cloned = deepClone(date);
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });
  });
});
