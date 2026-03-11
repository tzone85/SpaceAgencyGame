/**
 * Tests for UIController class
 */

const MissionManager = require("./mission-manager.js");
const UIController = require("./ui-controller.js");

// Test utilities
const tests = [];
let passCount = 0;
let failCount = 0;

function test(description, fn) {
  tests.push({ description, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected} but got ${actual}`);
  }
}

function runTests() {
  console.log("Running UIController Tests\n");

  tests.forEach(({ description, fn }) => {
    try {
      fn();
      console.log("✓ " + description);
      passCount++;
    } catch (error) {
      console.log("✗ " + description + " - " + error.message);
      failCount++;
    }
  });

  console.log("\n" + "=".repeat(50));
  console.log(
    `Test Summary: ${passCount} passed, ${failCount} failed out of ${tests.length} tests`,
  );
  console.log("=".repeat(50) + "\n");

  process.exit(failCount > 0 ? 1 : 0);
}

// ===== TESTS =====

test("Should initialize with manager", () => {
  const manager = new MissionManager();
  const controller = new UIController(manager);
  assert(controller.manager === manager);
});

test("Should render budget display", () => {
  const manager = new MissionManager(500000);
  const controller = new UIController(manager);

  // Create mock DOM elements
  const budgetDisplay = {
    textContent: "",
    style: {},
  };

  controller.init(budgetDisplay, {
    innerHTML: "",
    classList: { add: () => {}, remove: () => {} },
  });

  assert(
    budgetDisplay.textContent.includes("500000") ||
      budgetDisplay.textContent.includes("500"),
  );
});

test("Should update budget when launchMission is successful", () => {
  const manager = new MissionManager(500000);
  manager.addMission({ id: "1", name: "Mission A", cost: 100000 });

  const controller = new UIController(manager);

  const budgetDisplay = {
    textContent: "",
    style: {},
  };

  const mockList = {
    innerHTML: "",
    classList: { add: () => {}, remove: () => {} },
  };

  controller.init(budgetDisplay, mockList);

  // Simulate launch
  const result = manager.launchMission("1");
  assert(result.success === true);
  assertEqual(manager.getBudget(), 400000);
});

test("Should show warning message when budget is insufficient", () => {
  const manager = new MissionManager(50000);
  manager.addMission({ id: "1", name: "Mission A", cost: 100000 });

  const validation = manager.canLaunchMission("1");
  assert(validation.canLaunch === false);
  assert(validation.reason.includes("Insufficient budget"));
});

test("Should maintain budget visibility even when missions are disabled", () => {
  const manager = new MissionManager(50000);
  manager.addMission({ id: "1", name: "Mission A", cost: 100000 });

  const controller = new UIController(manager);

  const budgetDisplay = {
    textContent: "",
    style: {},
  };

  const mockList = {
    innerHTML: "",
    classList: { add: () => {}, remove: () => {} },
  };

  controller.init(budgetDisplay, mockList);

  // Even with insufficient budget, display should show budget
  assert(budgetDisplay.textContent.includes("50"));
});

test("Should prevent negative budget", () => {
  const manager = new MissionManager(50000);
  manager.addMission({ id: "1", name: "Mission A", cost: 100000 });

  const result = manager.launchMission("1");
  assert(result.success === false);
  assertEqual(manager.getBudget(), 50000); // Budget unchanged
});

test("Should handle mission with zero cost", () => {
  const manager = new MissionManager(100000);
  manager.addMission({ id: "1", name: "Free Mission", cost: 0 });

  const validation = manager.canLaunchMission("1");
  assert(validation.canLaunch === true);

  const result = manager.launchMission("1");
  assert(result.success === true);
  assertEqual(manager.getBudget(), 100000); // Budget unchanged
});

test("Should allow setting new budget", () => {
  const manager = new MissionManager(100000);
  const controller = new UIController(manager);

  const budgetDisplay = {
    textContent: "",
    style: {},
  };

  const mockList = {
    innerHTML: "",
    classList: { add: () => {}, remove: () => {} },
  };

  controller.init(budgetDisplay, mockList);
  controller.updateBudget(500000);

  assertEqual(manager.getBudget(), 500000);
});

test("Should prevent setting negative budget through controller", () => {
  const manager = new MissionManager(100000);
  const controller = new UIController(manager);

  const budgetDisplay = {
    textContent: "",
    style: {},
  };

  const mockList = {
    innerHTML: "",
    classList: { add: () => {}, remove: () => {} },
  };

  controller.init(budgetDisplay, mockList);

  // When updateBudget is called with negative, manager keeps current budget
  const initialBudget = manager.getBudget();
  controller.updateBudget(-50000);

  // Budget should remain unchanged as the error is caught
  assertEqual(manager.getBudget(), initialBudget);
});

// Run all tests
runTests();
