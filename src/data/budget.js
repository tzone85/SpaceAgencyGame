/**
 * Budget Data & Constants
 *
 * Defines financial parameters for the space agency:
 * starting balance, quarterly funding, expense categories, mission costs.
 */

export const BUDGET_CONFIG = {
  // Initial financial state
  startingBalance: 500_000_000, // $500M
  quarterlyFunding: 50_000_000, // $50M per quarter

  // Expense categories (optional, for future budgeting)
  expenseCategories: {
    CREW_SALARIES: {
      id: 'crew_salaries',
      name: 'Crew Salaries',
      baseQuarterlyCost: 50_000_000,
    },
    FACILITIES: {
      id: 'facilities',
      name: 'Facilities & Infrastructure',
      baseQuarterlyCost: 30_000_000,
    },
    MAINTENANCE: {
      id: 'maintenance',
      name: 'Vehicle Maintenance',
      baseQuarterlyCost: 25_000_000,
    },
    RESEARCH: {
      id: 'research',
      name: 'Research Operations',
      baseQuarterlyCost: 20_000_000,
    },
  },

  // Financial thresholds
  warningThreshold: 100_000_000, // Alert when balance < $100M
  criticalThreshold: 10_000_000, // Critical when balance < $10M
};

// Budget history entry template
export const BUDGET_ENTRY_TEMPLATE = {
  quarter: 0,
  year: 0,
  income: 0,
  expenses: 0,
  balance: 0,
  timestamp: null,
};

export default BUDGET_CONFIG;
