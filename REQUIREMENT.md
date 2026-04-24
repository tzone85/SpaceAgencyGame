# Requirement: Complete Stellar Command Space Agency Game

## Context
Stellar Command is a browser-based space agency management game built with vanilla JavaScript, Vite, and HTML5 Canvas. The game has 10 scenes, 5 game systems, and a core engine. It builds and runs but core gameplay loops are incomplete — systems exist but aren't connected to drive actual gameplay.

## Current State
- Stack: Vanilla JS (ES modules), Vite 5, Jest, HTML5 Canvas
- Scenes: MainMenu, Dashboard, MissionControl, CrewQuarters, LaunchSequence, ResearchLab, Settings, Tutorial, SpaceScene (9 total)
- Systems: BudgetSystem, CrewSystem, EventSystem, MissionSystem, ResearchSystem
- Core: Game controller, Engine loop, Camera
- 37 test files exist but have import issues (need fixing)
- Build passes (Vite), deploys to Vercel

## Requirements

### 1. Fix Test Infrastructure (Priority: CRITICAL)
The 37 test files all fail due to ES module import issues with Jest. Fix the test setup:
- Update jest.config.js to handle ES modules properly (use transform with babel-jest or switch to vitest)
- Ensure all test files can import from src/ modules
- Get existing tests passing
- This MUST be done first as it blocks verification of everything else

### 2. Connect Game Systems to Dashboard (Priority: HIGH)
The Dashboard scene shows agency stats but doesn't pull live data from the game systems. Wire them:
- Dashboard should show live budget from BudgetSystem (current funds, monthly income/expense)
- Dashboard should show crew count from CrewSystem (active astronauts, scientists)
- Dashboard should show active missions from MissionSystem
- Dashboard should show current research from ResearchSystem
- Add a "Next Turn" or "Advance Time" button that ticks all systems forward

### 3. Implement Mission Lifecycle (Priority: HIGH)
MissionSystem exists but the full lifecycle isn't complete. Implement:
- Mission creation: Select destination, assign crew, allocate budget
- Mission phases: Planning → Preparation → Launch → Transit → Arrival → Return
- Mission outcomes: Success/partial/failure based on crew skill, technology, and RNG
- MissionControl scene should display active missions with phase progress bars
- LaunchSequence scene should show a launch countdown and animation
- Mission completion triggers budget changes, crew experience, and research unlocks

### 4. Implement Research Tree (Priority: MEDIUM)
ResearchSystem exists but needs a visual research tree:
- Define 10-15 technologies in a dependency tree (e.g., Rocketry → Advanced Propulsion → Nuclear Engines)
- ResearchLab scene should display the tree with unlocked/in-progress/locked states
- Researching a tech costs budget and takes turns to complete
- Completed research unlocks new mission types or improves success rates

### 5. Crew Management (Priority: MEDIUM)
CrewQuarters scene needs functional crew management:
- Recruit new crew members (costs budget, random stats)
- Crew have skills: Piloting, Engineering, Science, Leadership
- Assign crew to missions (matching skills to mission requirements)
- Crew gain experience from completed missions
- Crew can be injured or lost on failed missions

### 6. Event System Integration (Priority: MEDIUM)
EventSystem exists. Create 15-20 random events that trigger during gameplay:
- Budget events: "Government funding increase +$50M" or "Budget cut -$20M"
- Crew events: "Astronaut retires" or "Prodigy recruit available"
- Mission events: "Solar flare disrupts communications" or "Discovery of water ice"
- Technology events: "Breakthrough in propulsion" (accelerates research)
- Events should be displayed as notification cards with accept/dismiss actions

### 7. Save/Load Game State (Priority: LOW)
- Save complete game state to localStorage
- Auto-save every 5 turns
- Load game from main menu
- New Game option that resets everything

## Technical Constraints
- Vanilla JavaScript (ES modules) — no frameworks, no TypeScript
- Vite for bundling
- HTML5 Canvas for rendering (already set up)
- Tests should work (fix Jest or switch to Vitest)
- Must build with `npm run build`
- Game should be playable in browser — not just renderable

## Acceptance Criteria
- Game has a complete playable loop: Start → Manage agency → Plan mission → Launch → See results → Repeat
- All game systems interact: budget affects what you can do, research unlocks capabilities, crew affects mission success
- Tests pass with `npm test`
- Build passes with `npm run build`
- No console errors during gameplay
