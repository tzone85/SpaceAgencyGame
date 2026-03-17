/**
 * Game Helper Functions
 *
 * Utility functions for common operations including currency formatting,
 * time calculations, and random number generation.
 */

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format a number as currency with appropriate suffix (K, M, B)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  const absAmount = Math.abs(amount);

  if (absAmount >= 1000000000) {
    return (amount / 1000000000).toFixed(2) + 'B';
  }
  if (absAmount >= 1000000) {
    return (amount / 1000000).toFixed(2) + 'M';
  }
  if (absAmount >= 1000) {
    return (amount / 1000).toFixed(2) + 'K';
  }

  return amount.toFixed(0);
}

/**
 * Format a number with thousand separators
 * @param {number} amount - The amount to format
 * @returns {string} Formatted string with separators
 */
export function formatNumber(amount) {
  return Math.floor(amount).toLocaleString('en-US');
}

/**
 * Format currency with full precision and symbol
 * @param {number} amount - The amount to format
 * @param {string} symbol - Currency symbol (default: 'Cr')
 * @returns {string} Formatted currency string
 */
export function formatCurrencyFull(amount, symbol = 'Cr') {
  const formatted = formatNumber(amount);
  return `${symbol}${formatted}`;
}

/**
 * Parse a formatted currency string back to a number
 * @param {string} str - The formatted currency string
 * @returns {number} Parsed amount
 */
export function parseCurrency(str) {
  const multipliers = { K: 1000, M: 1000000, B: 1000000000 };
  const regex = /^(-?\d+\.?\d*)\s*([KMB])?$/;
  const match = str.match(regex);

  if (!match) return 0;

  const [, numStr, suffix] = match;
  const num = parseFloat(numStr);
  const multiplier = suffix ? multipliers[suffix] : 1;

  return num * multiplier;
}

// ============================================================================
// TIME CALCULATIONS
// ============================================================================

/**
 * Convert game ticks to formatted time string
 * @param {number} ticks - Number of game ticks
 * @param {number} ticksPerMonth - Ticks per month (default: 30)
 * @returns {string} Formatted time string (e.g., "2y 3m")
 */
export function formatGameTime(ticks, ticksPerMonth = 30) {
  const monthsPerYear = 12;
  const totalMonths = Math.floor(ticks / ticksPerMonth);
  const years = Math.floor(totalMonths / monthsPerYear);
  const months = totalMonths % monthsPerYear;

  if (years > 0 && months > 0) {
    return `${years}y ${months}m`;
  }
  if (years > 0) {
    return `${years}y`;
  }
  if (months > 0) {
    return `${months}m`;
  }

  return `${ticks}t`;
}

/**
 * Convert ticks to months
 * @param {number} ticks - Number of game ticks
 * @param {number} ticksPerMonth - Ticks per month (default: 30)
 * @returns {number} Number of months
 */
export function ticksToMonths(ticks, ticksPerMonth = 30) {
  return Math.floor(ticks / ticksPerMonth);
}

/**
 * Convert months to ticks
 * @param {number} months - Number of months
 * @param {number} ticksPerMonth - Ticks per month (default: 30)
 * @returns {number} Number of ticks
 */
export function monthsToTicks(months, ticksPerMonth = 30) {
  return months * ticksPerMonth;
}

/**
 * Convert ticks to years
 * @param {number} ticks - Number of game ticks
 * @param {number} ticksPerMonth - Ticks per month (default: 30)
 * @returns {number} Number of years
 */
export function ticksToYears(ticks, ticksPerMonth = 30) {
  return ticksToMonths(ticks, ticksPerMonth) / 12;
}

/**
 * Convert years to ticks
 * @param {number} years - Number of years
 * @param {number} ticksPerMonth - Ticks per month (default: 30)
 * @returns {number} Number of ticks
 */
export function yearsToTicks(years, ticksPerMonth = 30) {
  return monthsToTicks(years * 12, ticksPerMonth);
}

/**
 * Get elapsed time from a start tick to current tick
 * @param {number} startTick - Starting tick
 * @param {number} currentTick - Current tick
 * @param {number} ticksPerMonth - Ticks per month (default: 30)
 * @returns {string} Formatted elapsed time
 */
export function getElapsedTime(startTick, currentTick, ticksPerMonth = 30) {
  const elapsed = currentTick - startTick;
  return formatGameTime(elapsed, ticksPerMonth);
}

// ============================================================================
// RANDOM NUMBER GENERATION
// ============================================================================

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random number between min and max (floating point)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Get a random element from an array
 * @param {Array} arr - Array to pick from
 * @returns {*} Random element from array
 */
export function randomChoice(arr) {
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random elements from an array
 * @param {Array} arr - Array to pick from
 * @param {number} count - Number of elements to pick
 * @returns {Array} Array of random elements
 */
export function randomChoices(arr, count) {
  if (!arr || arr.length === 0) return [];
  const result = [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * Generate a weighted random choice
 * @param {Object} choices - Object with choice as key and weight as value
 * @returns {string} Selected choice
 */
export function weightedRandom(choices) {
  const entries = Object.entries(choices);
  if (entries.length === 0) return null;

  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [choice, weight] of entries) {
    random -= weight;
    if (random <= 0) return choice;
  }

  return entries[entries.length - 1][0];
}

/**
 * Generate a random value with gaussian distribution (bell curve)
 * Uses Box-Muller transform
 * @param {number} mean - Mean value
 * @param {number} stdDev - Standard deviation
 * @returns {number} Random value
 */
export function randomGaussian(mean = 0, stdDev = 1) {
  let u1 = 0;
  let u2 = 0;

  while (u1 === 0) u1 = Math.random(); // Converting [0,1) to (0,1)
  while (u2 === 0) u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Determine if an event occurs with given probability
 * @param {number} probability - Probability between 0 and 1
 * @returns {boolean} Whether event occurs
 */
export function randomEvent(probability) {
  return Math.random() < probability;
}

/**
 * Generate a seed-based random number for deterministic randomness
 * @param {number} seed - Seed value
 * @returns {number} Pseudo-random number between 0 and 1
 */
export function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0 to 1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Calculate percentage of part relative to whole
 * @param {number} part - The part value
 * @param {number} whole - The whole value
 * @returns {number} Percentage (0 to 100)
 */
export function calculatePercentage(part, whole) {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

/**
 * Format a value as a percentage string
 * @param {number} value - Value between 0 and 1
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 1) {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} arr - Array to shuffle
 * @returns {Array} New shuffled array
 */
export function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Deep clone an object or array
 * @param {*} obj - Object to clone
 * @returns {*} Deep cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}
