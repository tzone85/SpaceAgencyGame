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
 */

export class BudgetSystem {
  constructor(eventBus, initialState = {}) {
    this.eventBus = eventBus;
    this.state = {
      balance: initialState.balance ?? 500_000_000,
      quarterlyFunding: initialState.quarterlyFunding ?? 50_000_000,
      currentQuarter: initialState.currentQuarter ?? 1,
      currentYear: initialState.currentYear ?? 2024,
      history: initialState.history ?? [],
    };
  }

  /**
   * Deduct funds from budget
   * @param {number} amount - Amount to deduct
   * @returns {boolean} - true if successful, false if insufficient funds
   */
  deduct(amount) {
    if (this.state.balance < amount) {
      this.eventBus?.emit?.('budget:insufficient', {
        required: amount,
        available: this.state.balance,
      });
      return false;
    }
    this.state.balance -= amount;
    this.eventBus?.emit?.('budget:updated', { balance: this.state.balance });
    return true;
  }

  /**
   * Add income to budget
   * @param {number} amount - Amount to add
   * @param {string} source - Income source (e.g., "quarterly-funding")
   */
  addIncome(amount, source) {
    this.state.balance += amount;
    this.eventBus?.emit?.('budget:updated', {
      balance: this.state.balance,
      source,
    });
  }

  /**
   * Advance to next quarter, apply funding
   */
  advanceQuarter() {
    this.addIncome(this.state.quarterlyFunding, 'quarterly-funding');
    this.state.currentQuarter += 1;
    if (this.state.currentQuarter > 4) {
      this.state.currentQuarter = 1;
      this.state.currentYear += 1;
    }
    this.eventBus?.emit?.('budget:quarter-advanced', {
      quarter: this.state.currentQuarter,
      year: this.state.currentYear,
    });
  }

  /**
   * Get budget report
   * @returns {object} - Budget state and history
   */
  getReport() {
    return { ...this.state };
  }
}

export default BudgetSystem;
