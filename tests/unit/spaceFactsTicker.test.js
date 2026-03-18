/**
 * SpaceFactsTicker Component Tests
 *
 * Tests for SpaceFactsTicker functionality including initialization,
 * fact rotation, and animation controls
 */

import SpaceFactsTicker, {
  SPACE_FACTS,
} from "../../src/ui/SpaceFactsTicker.js";

describe("SpaceFactsTicker Component", () => {
  let ticker;

  beforeEach(() => {
    // Clear any existing ticker from DOM
    const existingTicker = document.getElementById("space-facts-ticker");
    if (existingTicker) {
      existingTicker.remove();
    }

    ticker = new SpaceFactsTicker();
    jest.useFakeTimers();
  });

  afterEach(() => {
    ticker.cleanup();
    jest.useRealTimers();
  });

  describe("Initialization", () => {
    test("should initialize with null ticker element", () => {
      expect(ticker.tickerElement).toBeNull();
      expect(ticker.tickerContent).toBeNull();
    });

    test("should create ticker UI when initialized", () => {
      ticker.initialize();

      expect(ticker.tickerElement).not.toBeNull();
      expect(ticker.tickerElement.id).toBe("space-facts-ticker");
      expect(ticker.tickerElement.className).toBe("space-facts-ticker");
    });

    test("should add ticker to DOM", () => {
      ticker.initialize();

      const tickerInDOM = document.getElementById("space-facts-ticker");
      expect(tickerInDOM).not.toBeNull();
    });

    test("should create content container", () => {
      ticker.initialize();

      expect(ticker.tickerContent).not.toBeNull();
      expect(ticker.tickerContent.className).toContain("ticker-content");
    });

    test("should display first fact on initialization", () => {
      ticker.initialize();

      expect(ticker.tickerContent.textContent).toContain("▸");
      expect(ticker.currentFactIndex).toBe(0);
    });
  });

  describe("Fact Rotation", () => {
    beforeEach(() => {
      ticker.initialize();
    });

    test("should have space facts available", () => {
      expect(SPACE_FACTS.length).toBeGreaterThan(0);
    });

    test("should populate ticker facts from SPACE_FACTS", () => {
      expect(ticker.facts.length).toBe(SPACE_FACTS.length);
    });

    test("should start rotation on initialize", () => {
      expect(ticker.rotationInterval).not.toBeNull();
    });

    test("should rotate to next fact after interval", () => {
      const firstFact = ticker.tickerContent.textContent;

      jest.advanceTimersByTime(ticker.rotationDelay);

      const secondFact = ticker.tickerContent.textContent;
      expect(firstFact).not.toBe(secondFact);
    });

    test("should cycle through all facts", () => {
      const factCount = ticker.facts.length;

      for (let i = 0; i < factCount; i++) {
        jest.advanceTimersByTime(ticker.rotationDelay);
      }

      // After cycling through all facts, should start again
      jest.advanceTimersByTime(ticker.rotationDelay);
      expect(ticker.currentFactIndex).toBeGreaterThan(factCount);
    });
  });

  describe("Animation Controls", () => {
    beforeEach(() => {
      ticker.initialize();
    });

    test("should stop rotation when stopRotation is called", () => {
      const currentFact = ticker.tickerContent.textContent;

      ticker.stopRotation();
      jest.advanceTimersByTime(ticker.rotationDelay);

      const factAfterStop = ticker.tickerContent.textContent;
      expect(currentFact).toBe(factAfterStop);
    });

    test("should restart rotation when startRotation is called after stop", () => {
      ticker.stopRotation();
      const stoppedFact = ticker.tickerContent.textContent;

      ticker.startRotation();
      jest.advanceTimersByTime(ticker.rotationDelay);

      const rotatingFact = ticker.tickerContent.textContent;
      expect(stoppedFact).not.toBe(rotatingFact);
    });

    test("should clear existing interval when starting rotation again", () => {
      const firstInterval = ticker.rotationInterval;

      ticker.startRotation();
      const secondInterval = ticker.rotationInterval;

      expect(firstInterval).not.toBe(secondInterval);
    });
  });

  describe("Rotation Delay Configuration", () => {
    beforeEach(() => {
      ticker.initialize();
    });

    test("should set custom rotation delay", () => {
      const newDelay = 10000;
      ticker.setRotationDelay(newDelay);

      expect(ticker.rotationDelay).toBe(newDelay);
    });

    test("should enforce minimum rotation delay of 1 second", () => {
      ticker.setRotationDelay(100);

      expect(ticker.rotationDelay).toBe(1000);
    });

    test("should restart animation when delay is changed", () => {
      const oldInterval = ticker.rotationInterval;

      ticker.setRotationDelay(8000);

      expect(ticker.rotationInterval).not.toBe(oldInterval);
    });
  });

  describe("Custom Facts", () => {
    beforeEach(() => {
      ticker.initialize();
    });

    test("should add custom facts to ticker", () => {
      const customFacts = ["Custom fact 1", "Custom fact 2"];
      const originalCount = ticker.facts.length;

      ticker.addFacts(customFacts);

      expect(ticker.facts.length).toBe(originalCount + 2);
      expect(ticker.facts[originalCount]).toBe("Custom fact 1");
      expect(ticker.facts[originalCount + 1]).toBe("Custom fact 2");
    });

    test("should handle non-array input gracefully", () => {
      const originalCount = ticker.facts.length;

      ticker.addFacts("Not an array");

      expect(ticker.facts.length).toBe(originalCount);
    });

    test("should display custom facts in rotation", () => {
      const originalCount = ticker.facts.length;
      const customFacts = ["Test fact from custom"];
      ticker.addFacts(customFacts);

      // Cycle through all original facts to reach the custom fact
      // Original facts are at indices 0 to originalCount-1
      // Custom fact is at index originalCount
      for (let i = 0; i < originalCount; i++) {
        jest.advanceTimersByTime(ticker.rotationDelay);
      }

      // Should now reach custom fact
      expect(ticker.tickerContent.textContent).toContain(
        "Test fact from custom",
      );
    });
  });

  describe("Cleanup", () => {
    test("should remove ticker from DOM on cleanup", () => {
      ticker.initialize();
      expect(document.getElementById("space-facts-ticker")).not.toBeNull();

      ticker.cleanup();
      expect(document.getElementById("space-facts-ticker")).toBeNull();
    });

    test("should stop rotation on cleanup", () => {
      ticker.initialize();
      ticker.cleanup();

      expect(ticker.rotationInterval).toBeNull();
    });

    test("should reset all references on cleanup", () => {
      ticker.initialize();
      ticker.cleanup();

      expect(ticker.tickerElement).toBeNull();
      expect(ticker.tickerContent).toBeNull();
      expect(ticker.facts).toEqual([]);
      expect(ticker.currentFactIndex).toBe(0);
    });
  });
});
