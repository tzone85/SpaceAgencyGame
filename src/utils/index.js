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

export default {
  clamp,
  lerp,
  randomRange,
};
