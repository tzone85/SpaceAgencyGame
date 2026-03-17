/**
 * Game Constants
 *
 * Centralized configuration for all game constants including budget values,
 * difficulty settings, theme colors, and game mechanics parameters.
 */

// ============================================================================
// BUDGET & CURRENCY CONSTANTS
// ============================================================================

export const BUDGET = {
  STARTING_BUDGET: 1000000, // Starting budget in credits
  STARTING_BUDGET_EASY: 1500000,
  STARTING_BUDGET_HARD: 500000,
  MIN_SAFE_BUDGET: 50000, // Minimum recommended budget before operations
  BANKRUPTCY_THRESHOLD: 0, // Game over if budget goes below this
};

export const INCOME = {
  BASE_MONTHLY_INCOME: 100000,
  RESEARCH_INCOME: 50000,
  MINING_INCOME: 75000,
  TOURISM_INCOME: 30000,
  COMMERCIAL_INCOME: 60000,
};

export const MISSION_COSTS = {
  RECONNAISSANCE: 150000,
  SAMPLE_COLLECTION: 200000,
  SATELLITE_DEPLOYMENT: 300000,
  DEEP_SPACE_PROBE: 500000,
  CREWED_MISSION: 1000000,
  COLONY_ESTABLISHMENT: 2500000,
};

export const FACILITY_COSTS = {
  MISSION_CONTROL: 300000,
  LAUNCH_PAD: 500000,
  RESEARCH_LAB: 250000,
  HABITAT: 400000,
  FUEL_DEPOT: 200000,
  OBSERVATORY: 350000,
};

// ============================================================================
// DIFFICULTY SETTINGS
// ============================================================================

export const DIFFICULTY = {
  EASY: {
    name: 'Easy',
    missionCostMultiplier: 0.7,
    incomeMultiplier: 1.3,
    researchSpeedMultiplier: 1.5,
    emergencyFrequency: 0.2,
    startingBudget: BUDGET.STARTING_BUDGET_EASY,
  },
  NORMAL: {
    name: 'Normal',
    missionCostMultiplier: 1.0,
    incomeMultiplier: 1.0,
    researchSpeedMultiplier: 1.0,
    emergencyFrequency: 0.5,
    startingBudget: BUDGET.STARTING_BUDGET,
  },
  HARD: {
    name: 'Hard',
    missionCostMultiplier: 1.5,
    incomeMultiplier: 0.8,
    researchSpeedMultiplier: 0.7,
    emergencyFrequency: 0.9,
    startingBudget: BUDGET.STARTING_BUDGET_HARD,
  },
};

// ============================================================================
// THEME COLORS
// ============================================================================

export const COLORS = {
  // Primary UI colors
  PRIMARY: '#00D9FF',        // Cyan - Primary accent
  SECONDARY: '#FF006E',      // Pink - Secondary accent
  TERTIARY: '#8338EC',       // Purple - Tertiary accent

  // Background colors
  DARK_BG: '#0A0E27',        // Deep dark blue
  DARKER_BG: '#050A1A',      // Even darker
  CARD_BG: '#151D3B',        // Card backgrounds
  OVERLAY_BG: 'rgba(0, 0, 0, 0.7)',

  // Text colors
  TEXT_PRIMARY: '#FFFFFF',   // Primary text
  TEXT_SECONDARY: '#B0B3D9', // Secondary text
  TEXT_MUTED: '#6B7096',     // Muted text

  // Status colors
  SUCCESS: '#00FF41',        // Green - Success
  WARNING: '#FFB800',        // Orange - Warning
  DANGER: '#FF004D',         // Red - Danger
  INFO: '#00D9FF',           // Cyan - Info

  // Game colors
  BUDGET_COLOR: '#00FF41',   // Green for budget
  DEBT_COLOR: '#FF004D',     // Red for debt
  NEUTRAL: '#6B7096',        // Neutral gray
};

// ============================================================================
// TIME CONSTANTS
// ============================================================================

export const TIME = {
  GAME_TICK_MS: 1000,         // Milliseconds per game tick
  MONTH_IN_TICKS: 30,         // Ticks per game month
  YEAR_IN_MONTHS: 12,         // Months per game year
  MISSION_BASE_DURATION: 10,  // Base mission duration in ticks
};

// ============================================================================
// GAME MECHANICS
// ============================================================================

export const MECHANICS = {
  MAX_ACTIVE_MISSIONS: 5,
  MAX_FACILITIES: 20,
  MAX_RESEARCH_PROJECTS: 10,
  MIN_MISSION_SUCCESS_RATE: 0.5,
  MAX_MISSION_SUCCESS_RATE: 0.95,
  REPUTATION_GAIN_MISSION: 10,
  REPUTATION_LOSS_FAILURE: 5,
  RESEARCH_COMPLETION_BONUS: 5000,
};

// ============================================================================
// RESEARCH
// ============================================================================

export const RESEARCH = {
  SOLAR_PROPULSION: {
    name: 'Solar Propulsion',
    cost: 100000,
    duration: 50,
    missionCostReduction: 0.1,
  },
  ADVANCED_LIFE_SUPPORT: {
    name: 'Advanced Life Support',
    cost: 150000,
    duration: 75,
    crewCapacityBoost: 0.2,
  },
  AUTOMATED_SYSTEMS: {
    name: 'Automated Systems',
    cost: 120000,
    duration: 60,
    missionCostReduction: 0.15,
  },
  DEEP_SPACE_COMMUNICATIONS: {
    name: 'Deep Space Communications',
    cost: 100000,
    duration: 45,
    missionRangeIncrease: 0.3,
  },
  MINING_TECHNOLOGY: {
    name: 'Mining Technology',
    cost: 80000,
    duration: 40,
    miningYieldIncrease: 0.25,
  },
};

// ============================================================================
// GAME EVENTS
// ============================================================================

export const EVENTS = {
  SOLAR_FLARE: {
    name: 'Solar Flare',
    duration: 5,
    costMultiplier: 1.5,
    probability: 0.1,
  },
  EQUIPMENT_FAILURE: {
    name: 'Equipment Failure',
    duration: 3,
    costMultiplier: 1.2,
    probability: 0.15,
  },
  BUDGET_BOOST: {
    name: 'Budget Boost',
    duration: 1,
    amount: 250000,
    probability: 0.05,
  },
  MEDIA_INTEREST: {
    name: 'Media Interest',
    duration: 7,
    incomeMultiplier: 1.3,
    probability: 0.08,
  },
};

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI = {
  SIDEBAR_WIDTH: 250,
  HEADER_HEIGHT: 60,
  FOOTER_HEIGHT: 40,
  ANIMATION_DURATION: 300,
  TOOLTIP_DELAY: 500,
};

// ============================================================================
// PAGINATION & LIMITS
// ============================================================================

export const LIMITS = {
  MAX_NOTIFICATIONS: 10,
  MAX_HISTORY_ENTRIES: 100,
  SAVE_SLOTS: 5,
};
