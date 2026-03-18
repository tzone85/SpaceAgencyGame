/**
 * BudgetSystem Tests
 *
 * Comprehensive test suite for the BudgetSystem financial management system.
 * Tests cover deductions, income, quarterly cycles, event emissions, and state mutations.
 */

import BudgetSystem from "../../src/systems/BudgetSystem.js";
import GameState from "../../src/game/GameState.js";
import EventBus from "../../src/game/EventBus.js";
import {
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  BUDGET_CONSTRAINTS,
  calculateQuarterlyExpenses,
  calculateQuarterlyIncome,
} from "../../src/data/budget.js";

describe("BudgetSystem", () => {
  let budgetSystem;
  let gameState;
  let eventBus;
  let system;
  let mockEventBus;

  beforeEach(() => {
    // Reset EventBus singleton for each test
    EventBus.reset();
    eventBus = new EventBus();

    // Create fresh GameState
    gameState = new GameState();

    // Create BudgetSystem
    budgetSystem = new BudgetSystem(eventBus, gameState);

    // Support for legacy test style
    mockEventBus = {
      emit: jest.fn(),
    };
    system = new BudgetSystem(mockEventBus);
  });

  describe("Constructor and Initialization", () => {
    test("should initialize with eventBus and gameState", () => {
      expect(budgetSystem).toBeDefined();
      expect(budgetSystem.getEventBus()).toBe(eventBus);
    });

    test("should initialize without gameState (optional)", () => {
      const system = new BudgetSystem(eventBus);
      expect(system).toBeDefined();
    });

    test("should initialize without eventBus (optional)", () => {
      const system = new BudgetSystem(null, gameState);
      expect(system).toBeDefined();
    });

    test("should register event listeners on construction", () => {
      const unsubscribe1 = eventBus.subscribe("budget:deduct", () => {});
      const unsubscribe2 = eventBus.subscribe("budget:add-income", () => {});
      const unsubscribe3 = eventBus.subscribe("game:quarter-advance", () => {});

      expect(eventBus.listenerCount("budget:deduct")).toBeGreaterThan(1);
      expect(eventBus.listenerCount("budget:add-income")).toBeGreaterThan(1);
      expect(eventBus.listenerCount("game:quarter-advance")).toBeGreaterThan(1);
    });

    it("should initialize with default starting balance", () => {
      const report = system.getReport();
      expect(report.balance).toBe(500_000_000);
    });

    it("should initialize with quarterly funding", () => {
      const report = system.getReport();
      expect(report.quarterlyFunding).toBe(50_000_000);
    });

    it("should accept custom initial state", () => {
      const custom = new BudgetSystem(mockEventBus, {
        balance: 100_000_000,
        quarterlyFunding: 25_000_000,
      });
      const report = custom.getReport();
      expect(report.balance).toBe(100_000_000);
      expect(report.quarterlyFunding).toBe(25_000_000);
    });
  });

  describe("deduct() method", () => {
    test("should deduct amount from balance when sufficient funds", () => {
      const result = budgetSystem.deduct(10_000);

      expect(result.success).toBe(true);
      expect(result.change).toBe(-10_000);

      const state = gameState.getState();
      expect(state.budget.balance).toBe(500_000_000 - 10_000);
    });

    it("should deduct funds successfully", () => {
      const result = system.deduct(10_000_000);
      expect(result).toBe(true);
      expect(system.getReport().balance).toBe(490_000_000);
    });

    test("should emit budget:updated event on successful deduction", () => {
      const mockListener = jest.fn();
      eventBus.subscribe("budget:updated", mockListener);

      budgetSystem.deduct(5000);

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: expect.any(Number),
          change: -5000,
          type: "deduction",
        }),
      );
    });

    it("should emit budget:updated event on successful deduction", () => {
      system.deduct(10_000_000);
      expect(mockEventBus.emit).toHaveBeenCalledWith("budget:updated", {
        balance: 490_000_000,
      });
    });

    test("should emit state:changed event on successful deduction", () => {
      const mockListener = jest.fn();
      eventBus.subscribe("state:changed", mockListener);

      budgetSystem.deduct(5000);

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          component: "budget",
          change: "balance",
          newValue: expect.any(Number),
        }),
      );
    });

    test("should fail and emit budget:insufficient when insufficient funds", () => {
      const insufficientListener = jest.fn();
      eventBus.subscribe("budget:insufficient", insufficientListener);

      const result = budgetSystem.deduct(600_000_000); // More than initial balance

      expect(result.success).toBe(false);
      expect(result.shortfall).toBeGreaterThan(0);
      expect(insufficientListener).toHaveBeenCalledWith(
        expect.objectContaining({
          required: 600_000_000,
          available: 500_000_000,
          shortfall: expect.any(Number),
        }),
      );

      // Balance should not change
      const state = gameState.getState();
      expect(state.budget.balance).toBe(500_000_000);
    });

    it("should reject deduction with insufficient funds", () => {
      const result = system.deduct(600_000_000);
      expect(result).toBe(false);
      expect(system.getReport().balance).toBe(500_000_000);
    });

    it("should emit budget:insufficient on failed deduction", () => {
      system.deduct(600_000_000);
      expect(mockEventBus.emit).toHaveBeenCalledWith("budget:insufficient", {
        required: 600_000_000,
        available: 500_000_000,
      });
    });

    test("should not emit budget:updated on failed deduction", () => {
      const mockListener = jest.fn();
      eventBus.subscribe("budget:updated", mockListener);

      budgetSystem.deduct(600_000_000);

      expect(mockListener).not.toHaveBeenCalled();
    });

    test("should throw error for negative amount", () => {
      expect(() => budgetSystem.deduct(-1000)).toThrow();
    });

    test("should throw error for non-number amount", () => {
      expect(() => budgetSystem.deduct("1000")).toThrow();
    });

    test("should handle exact balance deduction", () => {
      const result = budgetSystem.deduct(500_000_000);

      expect(result.success).toBe(true);
      expect(result.balance).toBe(0);
    });

    test("should deduct zero amount successfully", () => {
      const result = budgetSystem.deduct(0);

      expect(result.success).toBe(true);
      expect(result.balance).toBe(500_000_000);
    });

    test("should work without eventBus", () => {
      const system = new BudgetSystem(null, gameState);
      const result = system.deduct(10_000);

      expect(result.success).toBe(true);
      expect(gameState.getState().budget.balance).toBe(500_000_000 - 10_000);
    });

    test("should work without gameState", () => {
      const system = new BudgetSystem(eventBus);
      const mockListener = jest.fn();
      eventBus.subscribe("budget:insufficient", mockListener);

      const result = system.deduct(10_000);

      expect(result.success).toBe(false); // No game state, so can't deduct
      expect(mockListener).toHaveBeenCalled();
    });
  });

  describe("addIncome", () => {
    test("should add income to balance", () => {
      const result = budgetSystem.addIncome(25_000, "government_funding");

      expect(result.success).toBe(true);
      expect(result.change).toBe(25_000);
      expect(result.source).toBe("government_funding");

      const state = gameState.getState();
      expect(state.budget.balance).toBe(500_000_000 + 25_000);
    });

    it("should add income to balance", () => {
      system.addIncome(50_000_000, "test-source");
      expect(system.getReport().balance).toBe(550_000_000);
    });

    test("should emit budget:updated event on income", () => {
      const mockListener = jest.fn();
      eventBus.subscribe("budget:updated", mockListener);

      budgetSystem.addIncome(15_000, "satellite_services");

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: expect.any(Number),
          change: 15_000,
          type: "income",
          source: "satellite_services",
        }),
      );
    });

    it("should emit budget:updated event", () => {
      system.addIncome(50_000_000, "test-source");
      expect(mockEventBus.emit).toHaveBeenCalledWith("budget:updated", {
        balance: 550_000_000,
        source: "test-source",
      });
    });

    test("should emit state:changed event on income", () => {
      const mockListener = jest.fn();
      eventBus.subscribe("state:changed", mockListener);

      budgetSystem.addIncome(15_000, "grants");

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          component: "budget",
          change: "balance",
          newValue: expect.any(Number),
        }),
      );
    });

    test("should add income to budget history", () => {
      budgetSystem.addIncome(10_000, "tourism");

      const state = gameState.getState();
      expect(state.budget.history).toHaveLength(1);
      expect(state.budget.history[0]).toMatchObject({
        description: "tourism",
        amount: 10_000,
        type: "income",
      });
    });

    test("should cap balance at maximum", () => {
      // Create a gameState with high balance
      const highBalanceState = new GameState();
      highBalanceState.update(
        "budget.balance",
        BUDGET_CONSTRAINTS.maxBalance - 5000,
      );

      const system = new BudgetSystem(eventBus, highBalanceState);
      const result = system.addIncome(10_000, "corporate_partnerships");

      expect(result.balance).toBe(BUDGET_CONSTRAINTS.maxBalance);
    });

    test("should throw error for zero or negative amount", () => {
      expect(() => budgetSystem.addIncome(0, "source")).toThrow();
      expect(() => budgetSystem.addIncome(-5000, "source")).toThrow();
    });

    test("should throw error for non-number amount", () => {
      expect(() => budgetSystem.addIncome("5000", "source")).toThrow();
    });

    test("should throw error for empty source", () => {
      expect(() => budgetSystem.addIncome(5000, "")).toThrow();
      expect(() => budgetSystem.addIncome(5000, "   ")).toThrow();
    });

    test("should throw error for non-string source", () => {
      expect(() => budgetSystem.addIncome(5000, 123)).toThrow();
    });

    test("should work without eventBus", () => {
      const system = new BudgetSystem(null, gameState);
      const result = system.addIncome(20_000, "licensing");

      expect(result.success).toBe(true);
      expect(gameState.getState().budget.balance).toBe(500_000_000 + 20_000);
    });

    test("should work without gameState", () => {
      const system = new BudgetSystem(eventBus);
      const result = system.addIncome(20_000, "licensing");

      expect(result.success).toBe(true);
    });
  });

  describe("advanceQuarter", () => {
    test("should increment quarter from 1 to 2", () => {
      const result = budgetSystem.advanceQuarter();

      expect(result.success).toBe(true);
      expect(result.quarter).toBe(2);

      const state = gameState.getState();
      expect(state.budget.currentQuarter).toBe(2);
    });

    it("should apply quarterly funding", () => {
      system.advanceQuarter();
      expect(system.getReport().balance).toBe(550_000_000);
    });

    it("should increment quarter", () => {
      system.advanceQuarter();
      expect(system.getReport().currentQuarter).toBe(2);
    });

    test("should wrap quarter from 4 to 1 and increment year", () => {
      gameState.update("budget.currentQuarter", 4);
      gameState.update("budget.currentYear", 2024);

      const result = budgetSystem.advanceQuarter();

      expect(result.quarter).toBe(1);
      expect(result.year).toBe(2025);

      const state = gameState.getState();
      expect(state.budget.currentQuarter).toBe(1);
      expect(state.budget.currentYear).toBe(2025);
    });

    it("should roll year when quarter exceeds 4", () => {
      system.state.currentQuarter = 4;
      system.advanceQuarter();
      expect(system.getReport().currentQuarter).toBe(1);
      expect(system.getReport().currentYear).toBe(2025);
    });

    test("should calculate quarterly income and expenses", () => {
      const result = budgetSystem.advanceQuarter();

      const expectedIncome = calculateQuarterlyIncome();
      const expectedExpenses = calculateQuarterlyExpenses();

      expect(result.income).toBe(expectedIncome);
      expect(result.expenses).toBe(expectedExpenses);
    });

    test("should apply net change to balance", () => {
      const initialBalance = gameState.getState().budget.balance;
      const result = budgetSystem.advanceQuarter();

      const expectedNetChange = result.income - result.expenses;
      const expectedBalance = initialBalance + expectedNetChange;

      expect(result.newBalance).toBe(expectedBalance);
      expect(gameState.getState().budget.balance).toBe(expectedBalance);
    });

    test("should emit budget:updated event on quarter advance", () => {
      const mockListener = jest.fn();
      eventBus.subscribe("budget:updated", mockListener);

      budgetSystem.advanceQuarter();

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "quarterly_settlement",
          income: expect.any(Number),
          expenses: expect.any(Number),
          quarter: expect.any(Number),
          year: expect.any(Number),
        }),
      );
    });

    it("should emit budget:quarter-advanced event", () => {
      system.advanceQuarter();
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "budget:quarter-advanced",
        {
          quarter: 2,
          year: 2024,
        },
      );
    });

    test("should emit state:changed event on quarter advance", () => {
      const mockListener = jest.fn();
      eventBus.subscribe("state:changed", mockListener);

      budgetSystem.advanceQuarter();

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          component: "budget",
          change: "quarterly_advance",
        }),
      );
    });

    test("should add quarterly settlement to history", () => {
      budgetSystem.advanceQuarter();

      const state = gameState.getState();
      expect(state.budget.history.length).toBeGreaterThan(0);

      const lastEntry = state.budget.history[state.budget.history.length - 1];
      expect(lastEntry.type).toBe("quarterly_settlement");
    });

    test("should not allow balance to go below minimum", () => {
      gameState.update("budget.balance", 10_000); // Very low balance

      const result = budgetSystem.advanceQuarter();

      expect(result.newBalance).toBeGreaterThanOrEqual(
        BUDGET_CONSTRAINTS.minBalance,
      );
    });

    test("should not allow balance to exceed maximum", () => {
      gameState.update("budget.balance", BUDGET_CONSTRAINTS.maxBalance - 5000);

      const result = budgetSystem.advanceQuarter();

      expect(result.newBalance).toBeLessThanOrEqual(
        BUDGET_CONSTRAINTS.maxBalance,
      );
    });

    test("should work without eventBus", () => {
      const system = new BudgetSystem(null, gameState);
      const result = system.advanceQuarter();

      expect(result.success).toBe(true);
      expect(gameState.getState().budget.currentQuarter).toBe(2);
    });

    test("should work without gameState", () => {
      const system = new BudgetSystem(eventBus);
      const result = system.advanceQuarter();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getReport", () => {
    test("should return comprehensive budget report", () => {
      const report = budgetSystem.getReport();

      expect(report).toHaveProperty("currentBalance");
      expect(report).toHaveProperty("currentQuarter");
      expect(report).toHaveProperty("currentYear");
      expect(report).toHaveProperty("quarterlyIncome");
      expect(report).toHaveProperty("quarterlyExpenses");
      expect(report).toHaveProperty("quarterlyNetChange");
    });

    it("should return current budget state", () => {
      const report = system.getReport();
      expect(report).toHaveProperty("balance");
      expect(report).toHaveProperty("quarterlyFunding");
      expect(report).toHaveProperty("currentQuarter");
      expect(report).toHaveProperty("currentYear");
      expect(report).toHaveProperty("history");
    });

    test("should include balance status", () => {
      const report = budgetSystem.getReport();

      expect(["healthy", "warning", "critical"]).toContain(report.status);
    });

    test("should report warning status when balance is low", () => {
      gameState.update(
        "budget.balance",
        BUDGET_CONSTRAINTS.warningThreshold - 1000,
      );

      const report = budgetSystem.getReport();
      expect(report.status).toBe("warning");
    });

    test("should report critical status when balance is very low", () => {
      gameState.update(
        "budget.balance",
        BUDGET_CONSTRAINTS.criticalThreshold - 1000,
      );

      const report = budgetSystem.getReport();
      expect(report.status).toBe("critical");
    });

    test("should report healthy status when balance is normal", () => {
      const report = budgetSystem.getReport();
      expect(report.status).toBe("healthy");
    });

    test("should include expense breakdown", () => {
      const report = budgetSystem.getReport();

      expect(report.expenseBreakdown).toBeDefined();
      expect(Object.keys(report.expenseBreakdown).length).toBeGreaterThan(0);
    });

    test("should include income breakdown", () => {
      const report = budgetSystem.getReport();

      expect(report.incomeBreakdown).toBeDefined();
      expect(Object.keys(report.incomeBreakdown).length).toBeGreaterThan(0);
    });

    test("should include history", () => {
      budgetSystem.addIncome(10_000, "grants");
      const report = budgetSystem.getReport();

      expect(report.history).toBeDefined();
      expect(Array.isArray(report.history)).toBe(true);
    });

    test("should calculate percentage spent", () => {
      const report = budgetSystem.getReport();

      const expected =
        ((report.quarterlyExpenses / report.quarterlyIncome) * 100).toFixed(2) +
        "";
      expect(report.percentageSpent).toBe(expected);
    });

    test("should work without gameState", () => {
      const system = new BudgetSystem(eventBus);
      const report = system.getReport();

      expect(report.error).toBeDefined();
    });
  });

  describe("Event listener integration", () => {
    test("should listen to budget:deduct event", () => {
      const mockUpdatedListener = jest.fn();
      eventBus.subscribe("budget:updated", mockUpdatedListener);

      eventBus.emit("budget:deduct", { amount: 10_000 });

      expect(mockUpdatedListener).toHaveBeenCalled();
      expect(gameState.getState().budget.balance).toBe(500_000_000 - 10_000);
    });

    test("should listen to budget:add-income event", () => {
      const mockUpdatedListener = jest.fn();
      eventBus.subscribe("budget:updated", mockUpdatedListener);

      eventBus.emit("budget:add-income", {
        amount: 15_000,
        source: "grants",
      });

      expect(mockUpdatedListener).toHaveBeenCalled();
      expect(gameState.getState().budget.balance).toBe(500_000_000 + 15_000);
    });

    test("should listen to game:quarter-advance event", () => {
      const mockUpdatedListener = jest.fn();
      eventBus.subscribe("budget:updated", mockUpdatedListener);

      eventBus.emit("game:quarter-advance");

      expect(mockUpdatedListener).toHaveBeenCalled();
      expect(gameState.getState().budget.currentQuarter).toBe(2);
    });

    test("should handle invalid budget:deduct event data", () => {
      const mockListener = jest.fn();
      eventBus.subscribe("budget:insufficient", mockListener);

      eventBus.emit("budget:deduct", { amount: "not a number" });

      // Should not crash, deduct should not be called
      // The listener in the system only calls deduct if data.amount is a number
    });

    test("should handle invalid budget:add-income event data", () => {
      const mockListener = jest.fn();
      eventBus.subscribe("budget:updated", mockListener);

      // Missing source - should not add income
      eventBus.emit("budget:add-income", { amount: 5000 });

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe("GameState integration", () => {
    test("should integrate with GameState.update()", () => {
      budgetSystem.deduct(25_000);

      const state = gameState.getState();
      expect(state.budget.balance).toBe(500_000_000 - 25_000);
    });

    test("should use GameState.batchUpdate() for quarter advance", () => {
      budgetSystem.advanceQuarter();

      const state = gameState.getState();
      expect(state.budget.currentQuarter).toBe(2);
      expect(state.budget.balance).toBeDefined();
    });

    test("should maintain immutable state pattern", () => {
      const stateBefore = gameState.getState();

      budgetSystem.deduct(50_000);

      const stateAfter = gameState.getState();

      expect(stateBefore).not.toBe(stateAfter);
      expect(stateBefore.budget.balance).not.toBe(stateAfter.budget.balance);
    });

    test("should allow setting GameState after initialization", () => {
      const system = new BudgetSystem(eventBus);
      expect(() => system.setGameState(gameState)).not.toThrow();

      system.deduct(10_000);
      expect(gameState.getState().budget.balance).toBe(500_000_000 - 10_000);
    });
  });

  describe("Budget data configuration", () => {
    test("should use budget data from budget.js", () => {
      const report = budgetSystem.getReport();

      // Verify that expense categories from data file are in report
      Object.keys(EXPENSE_CATEGORIES).forEach((key) => {
        const id = EXPENSE_CATEGORIES[key].id;
        expect(report.expenseBreakdown[id]).toBeDefined();
      });
    });

    test("should use income sources from budget.js", () => {
      const report = budgetSystem.getReport();

      // Verify that income sources from data file are in report
      Object.keys(INCOME_SOURCES).forEach((key) => {
        const id = INCOME_SOURCES[key].id;
        expect(report.incomeBreakdown[id]).toBeDefined();
      });
    });
  });
});