/**
 * Budget System Tests
 *
 * Test suite for BudgetSystem: balance management, income/expenses, quarterly cycles
 */

import BudgetSystem from "../../src/systems/BudgetSystem.js";

describe("BudgetSystem", () => {
  let system;
  let mockEventBus;

  beforeEach(() => {
    mockEventBus = {
      emit: jest.fn(),
    };
    system = new BudgetSystem(mockEventBus);
  });

  describe("initialization", () => {
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

  describe("deduct", () => {
    it("should deduct funds successfully", () => {
      const result = system.deduct(10_000_000);
      expect(result).toBe(true);
      expect(system.getReport().balance).toBe(490_000_000);
    });

    it("should emit budget:updated event on successful deduction", () => {
      system.deduct(10_000_000);
      expect(mockEventBus.emit).toHaveBeenCalledWith("budget:updated", {
        balance: 490_000_000,
      });
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
  });

  describe("addIncome", () => {
    it("should add income to balance", () => {
      system.addIncome(50_000_000, "test-source");
      expect(system.getReport().balance).toBe(550_000_000);
    });

    it("should emit budget:updated event", () => {
      system.addIncome(50_000_000, "test-source");
      expect(mockEventBus.emit).toHaveBeenCalledWith("budget:updated", {
        balance: 550_000_000,
        source: "test-source",
      });
    });
  });

  describe("advanceQuarter", () => {
    it("should apply quarterly funding", () => {
      system.advanceQuarter();
      expect(system.getReport().balance).toBe(550_000_000);
    });

    it("should increment quarter", () => {
      system.advanceQuarter();
      expect(system.getReport().currentQuarter).toBe(2);
    });

    it("should roll year when quarter exceeds 4", () => {
      system.state.currentQuarter = 4;
      system.advanceQuarter();
      expect(system.getReport().currentQuarter).toBe(1);
      expect(system.getReport().currentYear).toBe(2025);
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
  });

  describe("getReport", () => {
    it("should return current budget state", () => {
      const report = system.getReport();
      expect(report).toHaveProperty("balance");
      expect(report).toHaveProperty("quarterlyFunding");
      expect(report).toHaveProperty("currentQuarter");
      expect(report).toHaveProperty("currentYear");
      expect(report).toHaveProperty("history");
    });
  });
});
