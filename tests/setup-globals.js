import { jest } from "@jest/globals";

globalThis.jest = jest;

// Polyfill structuredClone for jsdom environment if not available
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock canvas context for Starfield testing
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === "2d") {
    return {
      fillStyle: "",
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      clearRect: jest.fn(),
    };
  }
  return null;
});
