import { jest } from "@jest/globals";

globalThis.jest = jest;

// Polyfill structuredClone for jsdom environment if not available
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
