/**
 * Utils Module
 *
 * Placeholder for utility functions and helpers.
 * This module will contain shared utility functions used across the game.
 */

export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

export const lerp = (a, b, t) => {
  return a + (b - a) * t;
};

export const randomRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

/**
 * Create a debounced version of a function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId = null;

  return (...args) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
};

export default {
  clamp,
  lerp,
  randomRange,
  debounce,
};
