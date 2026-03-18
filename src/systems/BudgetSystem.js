/**
 * Budget System
 *
 * Manages agency finances: balance, income, expenses, quarterly funding cycles.
 * Communicates with other systems via EventBus.
 *
 * API:
 * - deduct(amount: number) → boolean — deduct funds, emit budget:insufficient if fails
 * - addIncome(amount: number, source: string) → void — add to balance
 * - advanceQuarter() → void — apply quarterly funding and expenses
 * - getReport() → object — return budget history and current state
 *
 * BudgetSystem - Financial Management System
 *
 * Manages the space agency's budget, including income, expenses,
 * quarterly funding cycles, and financial state tracking.
 *
 * Emits events:
 * - budget:updated: When balance changes
 * - budget:insufficient: When attempting to deduct more than available balance
 * - state:changed: When budget state is modified (includes balance and history)
 *
 * Listens for events:
 * - budget:deduct: Deduct an amount from the budget
 * - budget:add-income: Add income from a source
 * - game:quarter-advance: Process quarterly expenses and income
 */

import {
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  BUDGET_CONSTRAINTS,
  calculateQuarterlyExpenses,
  calculateQuarterlyIncome,
} from "../data/budget.js";

export class BudgetSystem {
  #eventBus;
  #gameState;

  /**
   * @param {EventBus} eventBus - EventBus instance for emitting events
   * @param {GameState} gameState - GameState instance for state mutations
   */
  constructor(eventBus, gameState = null, initialState = {}) {
    this.#eventBus = eventBus;
    this.#gameState = gameState;
    this.eventBus = eventBus;
    this.state = {
      balance: initialState.balance ?? 500_000_000,
      quarterlyFunding: initialState.quarterlyFunding ?? 50_000_000,
      currentQuarter: initialState.currentQuarter ?? 1,
      currentYear: initialState.currentYear ?? 2024,
      history: initialState.history ?? [],
    };

    // Register event listeners
    this._registerEventListeners();
  }

  /**
   * Register all event listeners
   * @private
   */
  _registerEventListeners() {
    if (!this.#eventBus) return;

    // Listen for direct deduction events
    this.#eventBus.subscribe("budget:deduct", (data) => {
      if (data && typeof data.amount === "number") {
        this.deduct(data.amount);
      }
    });

    // Listen for income events
    this.#eventBus.subscribe("budget:add-income", (data) => {
      if (data && typeof data.amount === "number" && data.source) {
        this.addIncome(data.amount, data.source);
      }
    });

    // Listen for quarter advance events
    this.#eventBus.subscribe("game:quarter-advance", () => {
      this.advanceQuarter();
    });
  }

  /**
   * Deduct funds from budget
   * @param {number} amount - Amount to deduct
   * @returns {boolean} - true if successful, false if insufficient funds
   */
  deduct(amount) {
    if (typeof amount !== "number" || amount < 0) {
      throw new Error("Deduction amount must be a non-negative number");
    }

    const currentState = this.#gameState?.getState?.();
    const currentBalance = currentState?.budget?.balance ?? this.state.balance;

    // Check if sufficient funds
    if (
      currentBalance < amount ||
      (BUDGET_CONSTRAINTS &&
        currentBalance - amount < BUDGET_CONSTRAINTS.minBalance)
    ) {
      if (this.#eventBus) {
        this.#eventBus.emit("budget:insufficient", {
          required: amount,
          available: currentBalance,
          shortfall: amount - currentBalance,
        });
      }
      if (this.eventBus) {
        this.eventBus.emit?.("budget:insufficient", {
          required: amount,
          available: currentBalance,
        });
      }
      return false;
    }

    // Update game state
    const newBalance = currentBalance - amount;
    if (this.#gameState) {
      this.#gameState.update("budget.balance", newBalance);
    } else {
      this.state.balance = newBalance;
    }

    // Emit events
    if (this.#eventBus) {
      this.#eventBus.emit("budget:updated", {
        balance: newBalance,
        change: -amount,
        type: "deduction",
      });

      this.#eventBus.emit("state:changed", {
        component: "budget",
        change: "balance",
        newValue: newBalance,
      });
    }
    if (this.eventBus) {
      this.eventBus.emit?.("budget:updated", { balance: newBalance });
    }

    return true;
  }

  /**
   * Add income to budget
   * @param {number} amount - Amount to add
   * @param {string} source - Income source (e.g., "quarterly-funding")
   */
  addIncome(amount, source) {
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Income amount must be a positive number");
    }

    if (typeof source !== "string" || !source.trim()) {
      throw new Error("Income source must be a non-empty string");
    }

    const currentState = this.#gameState?.getState?.();
    const currentBalance = currentState?.budget?.balance ?? this.state.balance;

    // Calculate new balance with cap
    let newBalance = currentBalance + amount;
    if (BUDGET_CONSTRAINTS && newBalance > BUDGET_CONSTRAINTS.maxBalance) {
      newBalance = BUDGET_CONSTRAINTS.maxBalance;
    }

    // Update game state
    if (this.#gameState) {
      this.#gameState.update("budget.balance", newBalance);
    } else {
      this.state.balance = newBalance;
    }

    // Update history
    this._addToHistory(source, amount, "income");

    // Emit events
    if (this.#eventBus) {
      this.#eventBus.emit("budget:updated", {
        balance: newBalance,
        change: amount,
        type: "income",
        source: source,
      });

      this.#eventBus.emit("state:changed", {
        component: "budget",
        change: "balance",
        newValue: newBalance,
      });
    }
    if (this.eventBus) {
      this.eventBus.emit?.("budget:updated", {
        balance: newBalance,
        source,
      });
    }
  }

  /**
   * Advance to next quarter, apply funding
   */
  advanceQuarter() {
    const currentState = this.#gameState?.getState?.();
    const currentBalance = currentState?.budget?.balance ?? this.state.balance;
    const currentQuarter =
      currentState?.budget?.currentQuarter ?? this.state.currentQuarter;
    const currentYear =
      currentState?.budget?.currentYear ?? this.state.currentYear;

    // Calculate income and expenses if available
    let quarterlyIncome, quarterlyExpenses, netChange;
    if (calculateQuarterlyIncome && calculateQuarterlyExpenses) {
      quarterlyIncome = calculateQuarterlyIncome();
      quarterlyExpenses = calculateQuarterlyExpenses();
      netChange = quarterlyIncome - quarterlyExpenses;
    } else {
      quarterlyIncome = this.state.quarterlyFunding;
      quarterlyExpenses = 0;
      netChange = quarterlyIncome;
    }

    // Calculate new balance
    let newBalance = currentBalance + netChange;
    if (BUDGET_CONSTRAINTS) {
      newBalance = Math.max(
        BUDGET_CONSTRAINTS.minBalance,
        Math.min(BUDGET_CONSTRAINTS.maxBalance, newBalance),
      );
    }

    // Update quarter and year
    let newQuarter = currentQuarter + 1;
    let newYear = currentYear;
    if (newQuarter > 4) {
      newQuarter = 1;
      newYear += 1;
    }

    // Batch update game state
    if (this.#gameState) {
      this.#gameState.batchUpdate({
        "budget.balance": newBalance,
        "budget.currentQuarter": newQuarter,
        "budget.currentYear": newYear,
      });
    } else {
      this.addIncome(this.state.quarterlyFunding, "quarterly-funding");
      this.state.currentQuarter = newQuarter;
      this.state.currentYear = newYear;
    }

    // Record in history
    this._addToHistory(
      `Q${currentQuarter} ${currentYear}`,
      netChange,
      "quarterly_settlement",
    );

    // Emit events
    if (this.#eventBus) {
      this.#eventBus.emit("budget:updated", {
        balance: newBalance,
        change: netChange,
        type: "quarterly_settlement",
        income: quarterlyIncome,
        expenses: quarterlyExpenses,
        quarter: newQuarter,
        year: newYear,
      });

      this.#eventBus.emit("state:changed", {
        component: "budget",
        change: "quarterly_advance",
        quarter: newQuarter,
        year: newYear,
        newBalance: newBalance,
      });
    }
    if (this.eventBus) {
      this.eventBus.emit?.("budget:quarter-advanced", {
        quarter: newQuarter,
        year: newYear,
      });
    }
  }

  /**
   * Get budget report
   * @returns {object} - Budget state and history
   */
  getReport() {
    const currentState = this.#gameState?.getState?.();
    if (!currentState) {
      return { ...this.state };
    }

    const budget = currentState.budget;
    const history = budget.history || [];

    // Calculate totals from budget data if available
    let totalExpenses, totalIncome;
    if (calculateQuarterlyExpenses && calculateQuarterlyIncome) {
      totalExpenses = calculateQuarterlyExpenses();
      totalIncome = calculateQuarterlyIncome();
    }

    // Calculate balance status
    let isWarning = false;
    let isCritical = false;
    if (BUDGET_CONSTRAINTS) {
      isWarning = budget.balance < BUDGET_CONSTRAINTS.warningThreshold;
      isCritical = budget.balance < BUDGET_CONSTRAINTS.criticalThreshold;
    }

    const report = {
      currentBalance: budget.balance,
      currentQuarter: budget.currentQuarter,
      currentYear: budget.currentYear,
      history: history,
    };

    if (totalIncome && totalExpenses) {
      report.quarterlyIncome = totalIncome;
      report.quarterlyExpenses = totalExpenses;
      report.quarterlyNetChange = totalIncome - totalExpenses;
      report.percentageSpent = ((totalExpenses / totalIncome) * 100).toFixed(2);
      report.status = isCritical
        ? "critical"
        : isWarning
          ? "warning"
          : "healthy";
    }

    if (BUDGET_CONSTRAINTS) {
      report.warningThreshold = BUDGET_CONSTRAINTS.warningThreshold;
      report.criticalThreshold = BUDGET_CONSTRAINTS.criticalThreshold;
    }

    if (EXPENSE_CATEGORIES) {
      report.expenseBreakdown = Object.entries(EXPENSE_CATEGORIES).reduce(
        (acc, [key, category]) => {
          acc[category.id] = {
            name: category.name,
            baseCost: category.baseCost,
            description: category.description,
          };
          return acc;
        },
        {},
      );
    }

    if (INCOME_SOURCES) {
      report.incomeBreakdown = Object.entries(INCOME_SOURCES).reduce(
        (acc, [key, source]) => {
          acc[source.id] = {
            name: source.name,
            baseAmount: source.baseAmount,
            description: source.description,
          };
          return acc;
        },
        {},
      );
    }

    return report;
  }

  /**
   * Add entry to budget history
   * @private
   * @param {string} description - Description of the transaction
   * @param {number} amount - Amount (positive or negative)
   * @param {string} type - Transaction type
   */
  _addToHistory(description, amount, type) {
    const currentState = this.#gameState?.getState?.();
    if (!currentState || !this.#gameState) {
      // Fallback to local state
      if (this.state.history) {
        this.state.history.push({
          timestamp: new Date().toISOString(),
          description,
          amount,
          type,
          balance: this.state.balance,
        });
      }
      return;
    }

    const history = currentState.budget.history || [];
    const newEntry = {
      timestamp: new Date().toISOString(),
      description,
      amount,
      type,
      balance: currentState.budget.balance,
    };

    const newHistory = [...history, newEntry];
    this.#gameState.update("budget.history", newHistory);
  }

  /**
   * Set the GameState instance (for testing or late initialization)
   * @param {GameState} gameState - GameState instance
   */
  setGameState(gameState) {
    this.#gameState = gameState;
  }

  /**
   * Get the EventBus instance (for testing)
   * @returns {EventBus} The EventBus instance
   */
  getEventBus() {
    return this.#eventBus;
  }
}

export default BudgetSystem;
