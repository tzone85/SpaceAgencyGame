/**
 * Budget Data & Configuration
 *
 * Defines expense categories, income sources, and budget parameters
 * for the space agency financial system.
 */

/**
 * Expense categories with quarterly costs
 * Costs are in thousands to match budget values (500M = 500,000 thousands)
 */
export const EXPENSE_CATEGORIES = {
  PAYROLL: {
    id: "payroll",
    name: "Payroll",
    description: "Crew salaries and benefits",
    baseCost: 15000, // 15M per quarter
    scaling: 1.0, // scales with crew size
  },
  OPERATIONS: {
    id: "operations",
    name: "Operations & Maintenance",
    description: "Facility and equipment maintenance",
    baseCost: 8000, // 8M per quarter
    scaling: 0.8,
  },
  RESEARCH: {
    id: "research",
    name: "Research & Development",
    description: "Technology research programs",
    baseCost: 12000, // 12M per quarter
    scaling: 1.2,
  },
  FUEL: {
    id: "fuel",
    name: "Fuel & Propellant",
    description: "Spacecraft fuel and propellant costs",
    baseCost: 5000, // 5M per quarter
    scaling: 0.9,
  },
  TRAINING: {
    id: "training",
    name: "Training & Education",
    description: "Crew training and certification programs",
    baseCost: 4000, // 4M per quarter
    scaling: 1.1,
  },
  INFRASTRUCTURE: {
    id: "infrastructure",
    name: "Infrastructure",
    description: "Facility upgrades and new construction",
    baseCost: 3000, // 3M per quarter
    scaling: 0.6,
  },
  CONTINGENCY: {
    id: "contingency",
    name: "Contingency Fund",
    description: "Emergency and unexpected expenses",
    baseCost: 2000, // 2M per quarter
    scaling: 0.5,
  },
};

/**
 * Income sources (revenue streams)
 */
export const INCOME_SOURCES = {
  GOVERNMENT_FUNDING: {
    id: "government_funding",
    name: "Government Funding",
    description: "Quarterly government budget allocation",
    baseAmount: 50000, // 50M per quarter
  },
  SATELLITE_SERVICES: {
    id: "satellite_services",
    name: "Satellite Services",
    description: "Revenue from commercial satellite operations",
    baseAmount: 8000, // 8M per quarter
  },
  TOURISM: {
    id: "tourism",
    name: "Space Tourism",
    description: "Revenue from space tourism contracts",
    baseAmount: 5000, // 5M per quarter
  },
  GRANTS: {
    id: "grants",
    name: "Research Grants",
    description: "Grants and contracts for research projects",
    baseAmount: 3000, // 3M per quarter
  },
  CORPORATE_PARTNERSHIPS: {
    id: "corporate_partnerships",
    name: "Corporate Partnerships",
    description: "Revenue from private sector contracts",
    baseAmount: 2000, // 2M per quarter
  },
  LICENSING: {
    id: "licensing",
    name: "Technology Licensing",
    description: "Revenue from licensing developed technologies",
    baseAmount: 1000, // 1M per quarter
  },
};

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

/**
 * Budget constraints and limits
 */
export const BUDGET_CONSTRAINTS = {
  minBalance: 0,
  maxBalance: 2000000000, // 2 billion hard cap
  warningThreshold: 50000000, // Warn if balance drops below 50M
  criticalThreshold: 10000000, // Critical if below 10M
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

/**
 * Calculate total quarterly expenses
 * @param {Object} multipliers - Optional expense multipliers (crew size, research level, etc.)
 * @returns {number} Total quarterly expenses in thousands
 */
export function calculateQuarterlyExpenses(multipliers = {}) {
  let total = 0;

  for (const [key, category] of Object.entries(EXPENSE_CATEGORIES)) {
    const multiplier = multipliers[key] || 1;
    total += category.baseCost * multiplier * category.scaling;
  }

  return Math.round(total);
}

/**
 * Calculate total quarterly income
 * @param {Object} modifiers - Optional income modifiers (reputation, tech level, etc.)
 * @returns {number} Total quarterly income in thousands
 */
export function calculateQuarterlyIncome(modifiers = {}) {
  let total = 0;

  for (const [key, source] of Object.entries(INCOME_SOURCES)) {
    const modifier = modifiers[key] || 1;
    total += source.baseAmount * modifier;
  }

  return Math.round(total);
}

export default {
  BUDGET_CONFIG,
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  BUDGET_CONSTRAINTS,
  BUDGET_ENTRY_TEMPLATE,
  calculateQuarterlyExpenses,
  calculateQuarterlyIncome,
};