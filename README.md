# Space Agency Budget Tracker

A JavaScript-based budget tracking system for a space agency mission control game.

## Features

- **Budget Tracking**: Track available budget for space missions
- **Mission Launching**: Launch missions that cost budget points
- **Budget Constraints**: Prevent missions from launching when budget is insufficient
- **Persistence**: Budget values persist across browser sessions using localStorage
- **Real-time Updates**: Budget display updates immediately when missions are launched
- **Reset Functionality**: Reset budget to default value

## Acceptance Criteria ✓

- [x] Budget decreases by mission cost when mission is added
- [x] Budget display updates immediately
- [x] Budget cannot go below zero
- [x] Budget value persists during session

## Files

- `index.html` - Main HTML interface
- `styles.css` - Styling for the application

## Usage

### In Browser

Open `index.html` in a web browser to use the application.

### Features

1. **View Budget**: The current available budget is displayed at the top
2. **Launch Missions**: Click "Launch" to send a mission (if budget permits)
3. **Insufficient Budget**: If you don't have enough budget, the button is disabled
4. **Reset Budget**: Click "Reset Budget" to restore the default budget

## Implementation Details

### BudgetTracker Class

The core class that manages budget operations:

```javascript
class BudgetTracker {
    loadBudget()      // Load budget from localStorage
    saveBudget()      // Persist budget to localStorage
    launchMission()   // Deduct mission cost from budget
    resetBudget()     // Reset to default budget
    getBudget()       // Get current budget value
    updateDisplay()   // Update UI with current budget
    renderMissions()  // Render mission cards
    initializeUI()    // Initialize all UI elements
}
```

### Storage

Budget is stored in localStorage with key `spaceBudget`. This ensures persistence across browser sessions.

### Default Budget

Default budget: `$1,000,000`

### Missions

Available missions with costs:
- Moon Landing: $100,000
- Mars Rover: $250,000
- Satellite Launch: $50,000
- Space Station Supply: $75,000
- Deep Space Probe: $300,000

## Test Coverage

12 unit tests covering:
- Initial budget loading
- Budget decrease on mission launch
- Multiple mission launches
- Insufficient budget prevention
- Budget persistence
- Budget reset
- Invalid mission handling
- Edge cases (exact budget match)

All tests pass (12/12).

## Browser Compatibility

Works in all modern browsers that support:
- ES6 Classes
- localStorage API
- Fetch API
- CSS Grid
