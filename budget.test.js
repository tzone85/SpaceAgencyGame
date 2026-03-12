/**
 * Unit Tests for Budget Tracker
 */

// Mock localStorage for Node.js testing
if (typeof localStorage === 'undefined') {
    global.localStorage = {
        store: {},
        getItem(key) {
            return this.store[key] || null;
        },
        setItem(key, value) {
            this.store[key] = value.toString();
        },
        removeItem(key) {
            delete this.store[key];
        },
        clear() {
            this.store = {};
        },
    };
}

// Mock document for Node.js testing
if (typeof document === 'undefined') {
    global.document = {
        getElementById: () => null,
        createElement: () => ({
            className: '',
            innerHTML: '',
            querySelector: () => ({
                addEventListener: () => {},
            }),
            appendChild: () => {},
        }),
        addEventListener: () => {},
    };
}

// Mock Intl.NumberFormat if needed
if (typeof Intl === 'undefined') {
    global.Intl = {
        NumberFormat: class {
            format(num) {
                return `$${num.toLocaleString()}`;
            }
        },
    };
}

const STORAGE_KEY = 'spaceBudget';
const DEFAULT_BUDGET = 1000000;

const missions = [
    { id: 1, name: 'Moon Landing', cost: 100000, description: 'Send astronauts to the moon' },
    { id: 2, name: 'Mars Rover', cost: 250000, description: 'Deploy rover to Mars' },
    { id: 3, name: 'Satellite Launch', cost: 50000, description: 'Launch communication satellite' },
];

class BudgetTracker {
    constructor() {
        this.budget = this.loadBudget();
    }

    loadBudget() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? parseInt(stored, 10) : DEFAULT_BUDGET;
    }

    saveBudget() {
        localStorage.setItem(STORAGE_KEY, this.budget.toString());
    }

    launchMission(missionId) {
        const mission = missions.find(m => m.id === missionId);
        if (!mission) {
            return false;
        }

        if (this.budget - mission.cost < 0) {
            return false;
        }

        this.budget -= mission.cost;
        this.saveBudget();
        return true;
    }

    resetBudget() {
        this.budget = DEFAULT_BUDGET;
        this.saveBudget();
    }

    getBudget() {
        return this.budget;
    }
}

// Test Suite
class TestSuite {
    constructor() {
        this.passed = 0;
        this.failed = 0;
    }

    assert(condition, message) {
        if (condition) {
            this.passed++;
            console.log(`✓ ${message}`);
        } else {
            this.failed++;
            console.error(`✗ ${message}`);
        }
    }

    assertEqual(actual, expected, message) {
        this.assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
    }

    beforeEach() {
        localStorage.clear();
    }

    run() {
        console.log('\n=== Budget Tracker Tests ===\n');

        // Test 1: Initial budget
        this.beforeEach();
        const tracker1 = new BudgetTracker();
        this.assertEqual(tracker1.getBudget(), DEFAULT_BUDGET, 'Initial budget should be $1,000,000');

        // Test 2: Budget decreases when mission is launched
        this.beforeEach();
        const tracker2 = new BudgetTracker();
        const success = tracker2.launchMission(1);
        this.assert(success, 'Mission should launch successfully');
        this.assertEqual(tracker2.getBudget(), DEFAULT_BUDGET - 100000, 'Budget should decrease by mission cost');

        // Test 3: Multiple missions reduce budget correctly
        this.beforeEach();
        const tracker3 = new BudgetTracker();
        tracker3.launchMission(1);
        tracker3.launchMission(2);
        this.assertEqual(tracker3.getBudget(), DEFAULT_BUDGET - 100000 - 250000, 'Budget should decrease by sum of mission costs');

        // Test 4: Cannot launch mission with insufficient budget
        this.beforeEach();
        const tracker4 = new BudgetTracker();
        tracker4.launchMission(2); // -250000
        tracker4.launchMission(2); // -250000
        tracker4.launchMission(2); // -250000
        tracker4.launchMission(2); // -250000
        const failSuccess = tracker4.launchMission(2); // Should fail
        this.assert(!failSuccess, 'Mission should not launch when budget is insufficient');
        this.assert(tracker4.getBudget() >= 0, 'Budget should never go below zero');

        // Test 5: Budget persists in localStorage
        this.beforeEach();
        const tracker5 = new BudgetTracker();
        tracker5.launchMission(1);
        const firstBudget = tracker5.getBudget();
        const tracker5b = new BudgetTracker();
        this.assertEqual(tracker5b.getBudget(), firstBudget, 'Budget should persist across instances');

        // Test 6: Reset budget
        this.beforeEach();
        const tracker6 = new BudgetTracker();
        tracker6.launchMission(1);
        tracker6.resetBudget();
        this.assertEqual(tracker6.getBudget(), DEFAULT_BUDGET, 'Budget should reset to default');

        // Test 7: Invalid mission returns false
        this.beforeEach();
        const tracker7 = new BudgetTracker();
        const invalidSuccess = tracker7.launchMission(999);
        this.assert(!invalidSuccess, 'Launching invalid mission should return false');
        this.assertEqual(tracker7.getBudget(), DEFAULT_BUDGET, 'Budget should not change for invalid mission');

        // Test 8: Exact budget match
        this.beforeEach();
        const tracker8 = new BudgetTracker();
        tracker8.budget = 100000; // Set to exact mission cost
        tracker8.saveBudget();
        const exactSuccess = tracker8.launchMission(1);
        this.assert(exactSuccess, 'Mission should launch when budget equals mission cost');
        this.assertEqual(tracker8.getBudget(), 0, 'Budget should be exactly zero');

        console.log(`\n=== Results ===`);
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
        console.log(`Total: ${this.passed + this.failed}\n`);

        return this.failed === 0;
    }
}

// Run tests
const testSuite = new TestSuite();
const allTestsPassed = testSuite.run();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BudgetTracker, TestSuite };
}

// Exit with proper code for CI/CD
if (typeof process !== 'undefined' && process.exit) {
    process.exit(allTestsPassed ? 0 : 1);
}
