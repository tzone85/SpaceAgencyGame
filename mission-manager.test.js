/**
 * Tests for MissionManager class
 */

// Load the MissionManager class
const MissionManager = require("./mission-manager.js");

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
  console.log("Running MissionManager Tests\n");

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

test("Should initialize with default budget", () => {
  const manager = new MissionManager();
  assertEqual(manager.getBudget(), 1000000);
});

test("Should initialize with custom budget", () => {
  const manager = new MissionManager(500000);
  assertEqual(manager.getBudget(), 500000);
});

test("Should add a mission", () => {
  const manager = new MissionManager();
  manager.addMission({ id: "1", name: "Explore Alpha", cost: 100000 });
  assertEqual(manager.getMissions().length, 1);
});

test("Should throw error for mission without id", () => {
  const manager = new MissionManager();
  try {
    manager.addMission({ name: "Explore Alpha", cost: 100000 });
    throw new Error("Should have thrown an error");
  } catch (error) {
    if (error.message === "Should have thrown an error") {
      throw error;
    }
    assert(true);
  }
});

test("Should throw error for mission without name", () => {
  const manager = new MissionManager();
  try {
    manager.addMission({ id: "1", cost: 100000 });
    throw new Error("Should have thrown an error");
  } catch (error) {
    if (error.message === "Should have thrown an error") {
      throw error;
    }
    assert(true);
  }
});

test("Should throw error for mission without cost", () => {
  const manager = new MissionManager();
  try {
    manager.addMission({ id: "1", name: "Explore Alpha" });
    throw new Error("Should have thrown an error");
  } catch (error) {
    if (error.message === "Should have thrown an error") {
      throw error;
    }
    assert(true);
  }
});

test("Should throw error for mission with negative cost", () => {
  const manager = new MissionManager();
  try {
    manager.addMission({ id: "1", name: "Explore Alpha", cost: -100000 });
    throw new Error("Should have thrown an error");
  } catch (error) {
    if (error.message === "Should have thrown an error") {
      throw error;
    }
    assert(true);
  }
});

test("Should allow mission launch with sufficient budget", () => {
  const manager = new MissionManager(500000);
  manager.addMission({ id: "1", name: "Explore Alpha", cost: 100000 });
  const result = manager.canLaunchMission("1");
  assert(result.canLaunch === true);
});

test("Should prevent mission launch with insufficient budget", () => {
  const manager = new MissionManager(50000);
  manager.addMission({ id: "1", name: "Explore Alpha", cost: 100000 });
  const result = manager.canLaunchMission("1");
  assert(result.canLaunch === false);
  assert(result.reason.includes("Insufficient budget"));
});

test("Should return false for non-existent mission", () => {
  const manager = new MissionManager(500000);
  const result = manager.canLaunchMission("nonexistent");
  assert(result.canLaunch === false);
  assert(result.reason === "Mission not found");
});

test("Should launch mission and deduct cost from budget", () => {
  const manager = new MissionManager(500000);
  manager.addMission({ id: "1", name: "Explore Alpha", cost: 100000 });
  const result = manager.launchMission("1");

  assert(result.success === true);
  assertEqual(manager.getBudget(), 400000);
  assertEqual(result.newBudget, 400000);
});

test("Should fail to launch mission with insufficient budget", () => {
  const manager = new MissionManager(50000);
  manager.addMission({ id: "1", name: "Explore Alpha", cost: 100000 });
  const result = manager.launchMission("1");

  assert(result.success === false);
  assertEqual(manager.getBudget(), 50000); // Budget unchanged
});

test("Should prevent budget from going negative", () => {
  const manager = new MissionManager(50000);
  manager.addMission({ id: "1", name: "Explore Alpha", cost: 100000 });
  const result = manager.launchMission("1");

  assert(result.success === false);
  assert(manager.getBudget() >= 0);
});

test("Should allow setting budget", () => {
  const manager = new MissionManager(500000);
  manager.setBudget(750000);
  assertEqual(manager.getBudget(), 750000);
});

test("Should prevent setting negative budget", () => {
  const manager = new MissionManager(500000);
  try {
    manager.setBudget(-100000);
    throw new Error("Should have thrown an error");
  } catch (error) {
    if (error.message === "Should have thrown an error") {
      throw error;
    }
    assert(error.message.includes("Budget cannot be negative"));
  }
});

test("Should handle multiple missions", () => {
  const manager = new MissionManager(500000);
  manager.addMission({ id: "1", name: "Mission A", cost: 100000 });
  manager.addMission({ id: "2", name: "Mission B", cost: 150000 });
  manager.addMission({ id: "3", name: "Mission C", cost: 50000 });

  assertEqual(manager.getMissions().length, 3);
});

test("Should show correct error message with formatted costs", () => {
  const manager = new MissionManager(50000);
  manager.addMission({ id: "1", name: "Explore Alpha", cost: 100000 });
  const result = manager.canLaunchMission("1");

  // Check for formatted numbers (could be comma or space separated depending on locale)
  assert(result.reason.includes("100") && result.reason.includes("50"));
  assert(result.reason.includes("Insufficient budget"));
});

test("Should allow mission launch when budget equals mission cost", () => {
  const manager = new MissionManager(100000);
  manager.addMission({ id: "1", name: "Explore Alpha", cost: 100000 });
  const result = manager.canLaunchMission("1");

  assert(result.canLaunch === true);
});

test("Should deduct correct cost when launching mission", () => {
  const manager = new MissionManager(500000);
  manager.addMission({ id: "1", name: "Explore Alpha", cost: 123456 });
  const result = manager.launchMission("1");

  assert(result.success === true);
  assertEqual(manager.getBudget(), 500000 - 123456);
});

// Run all tests
runTests();
