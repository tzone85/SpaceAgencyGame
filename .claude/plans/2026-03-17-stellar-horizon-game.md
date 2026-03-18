# Stellar Horizon Game — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable space agency management game — Stellar Horizon — with 5 game systems, 7 scenes, audio, save/load, and tutorial. Deploy on Vercel.

**Architecture:** Vite + DOM/CSS (game UI) + Canvas 2D (visual effects). Immutable GameState, EventBus pub/sub, 5 independent systems, localStorage persistence. No WebGL, no Webpack.

**Tech Stack:** Vite, Vanilla JS (ES Modules), HTML5 Canvas 2D, Web Audio API, Jest, Vercel

**Spec:** `docs/superpowers/specs/2026-03-17-stellar-horizon-design.md`

**Repo:** `/Users/mncedimini/Sites/misc/space-agency-game` (github.com/tzone85/SpaceAgencyGame)

---

## Chunk 1: Foundation Cleanup (Manual — Do Not Submit to VXD)

This chunk is done manually or by a single agent, NOT via VXD dispatch. It cleans up the multi-agent mess before the real build starts.

### Task 1: Migrate to Vite, remove Webpack and WebGL

**Files:**
- Delete: `webpack.config.js`
- Delete: `src/core/renderer.js`
- Delete: `.babelrc`, `.babelrc.json`, `babel.config.js`, `babel.config.json`
- Delete: `css-extraction.test.js`, `directory-structure.test.js`, `tests/structure.test.js` (scaffolding test stubs)
- Delete: `ACCEPTANCE-VERIFICATION.md`, `VERIFICATION.md` (agent artifacts)
- Delete: `tests/unit/renderer.test.js`
- Delete: `tests/setup-webgl.js`
- Modify: `package.json` — remove webpack/babel deps, ensure vite is the dev/build tool
- Modify: `vite.config.js` — verify it's correct for the project
- Modify: `jest.config.js` — remove babel transform references, use ESM
- Modify: `index.html` — ensure it loads `src/main.js` as ES module, no webpack bundle refs

- [ ] **Step 1: Delete dead files**

```bash
cd /Users/mncedimini/Sites/misc/space-agency-game
rm -f webpack.config.js src/core/renderer.js
rm -f .babelrc .babelrc.json babel.config.js babel.config.json
rm -f css-extraction.test.js directory-structure.test.js tests/structure.test.js
rm -f ACCEPTANCE-VERIFICATION.md VERIFICATION.md
rm -f tests/unit/renderer.test.js tests/setup-webgl.js
```

- [ ] **Step 2: Clean package.json**

Read `package.json`. Remove these devDependencies if present:
- `webpack`, `webpack-cli`, `webpack-dev-server`
- `babel-jest`, `@babel/core`, `@babel/preset-env`, `@babel/plugin-*`
- `html-webpack-plugin`, `css-loader`, `style-loader`

Ensure these are present:
- `vite` (devDependency)
- `jest`, `@jest/globals` (devDependency)

Ensure scripts:
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "jest"
}
```

- [ ] **Step 3: Verify vite.config.js**

Read and ensure it has:
```js
import { defineConfig } from 'vite';
export default defineConfig({
  root: '.',
  build: { outDir: 'dist' },
  server: { port: 3000, open: true }
});
```

- [ ] **Step 4: Fix jest.config.js**

Read current file. Ensure it uses ESM without Babel:
```js
export default {
  testEnvironment: 'jsdom',
  transform: {},
  extensionsToTreatAsEsm: [],
  coverageThreshold: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 }
  }
};
```

- [ ] **Step 5: Fix index.html**

Ensure it loads main.js as module:
```html
<script type="module" src="/src/main.js"></script>
```
No webpack bundle references.

- [ ] **Step 6: Run npm install and verify**

```bash
npm install
npm run dev  # Should start Vite dev server
# Ctrl+C to stop
npm test     # Fix any test failures from deleted files
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: migrate to Vite, remove Webpack/Babel/WebGL dead code"
git push origin main
```

---

### Task 2: Clean up duplicate/conflicting files

**Files:**
- Duplicate scene managers: `src/scenes/scene-manager.js` AND `src/scenes/SceneManager.js` AND `src/managers/SceneManager.js`
- Duplicate scene manager tests: `tests/unit/scene-manager.test.js` AND `tests/unit/sceneManager.test.js`
- Empty index files that just re-export: `src/audio/index.js`, `src/entities/index.js`, `src/scenes/index.js`, `src/systems/index.js`, `src/utils/index.js`
- `.idea/` directory (IDE config, shouldn't be in repo)

- [ ] **Step 1: Identify the canonical SceneManager**

Read all three scene manager files. Keep the most complete one. Delete the others. The canonical path should be `src/managers/SceneManager.js`.

- [ ] **Step 2: Update imports across codebase**

Any file importing the deleted scene managers should import from the canonical path.

- [ ] **Step 3: Delete empty barrel files if unused**

If `src/audio/index.js` etc. just re-export and nothing imports them, delete them.

- [ ] **Step 4: Add .idea/ to .gitignore and remove**

```bash
echo ".idea/" >> .gitignore
git rm -r --cached .idea/
```

- [ ] **Step 5: Run tests**

```bash
npm test
```
Fix any broken imports.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: consolidate duplicates, remove IDE config"
git push origin main
```

---

### Task 3: Wire core game loop with GameState and EventBus

**Files:**
- Modify: `src/core/game.js` — wire to GameState and EventBus
- Modify: `src/core/engine.js` — simplify to Canvas-only rendering loop
- Create: `src/game/GameState.js` — immutable state manager
- Modify: `src/game/EventBus.js` — verify existing, enhance if needed
- Create: `src/game/SaveSystem.js` — localStorage persistence
- Modify: `src/main.js` — bootstrap everything
- Test: `tests/unit/gameState.test.js`, `tests/unit/saveSystem.test.js`

- [ ] **Step 1: Create GameState.js**

Implements the state shape from the spec (Section 4). Key methods:
- `GameState.initial()` — returns default state
- `GameState.update(state, path, value)` — returns new state with immutable update
- `GameState.getState()` — returns current state (frozen)

- [ ] **Step 2: Write GameState tests**

Test initial state shape, immutable updates, freeze behavior.

- [ ] **Step 3: Create SaveSystem.js**

- `save(state)` — JSON.stringify to localStorage
- `load()` — parse from localStorage, fall back to initial state
- `clear()` — remove save
- Catches QuotaExceededError, emits `save:error` via EventBus

- [ ] **Step 4: Write SaveSystem tests**

Mock localStorage, test save/load/error handling.

- [ ] **Step 5: Wire main.js**

```js
import { GameState } from './game/GameState.js';
import { EventBus } from './game/EventBus.js';
import { SaveSystem } from './game/SaveSystem.js';
// ... bootstrap game, connect EventBus, load saved state
```

- [ ] **Step 6: Simplify engine.js**

Remove WebGL references. Engine should:
- Run requestAnimationFrame loop
- Calculate delta time
- Call registered update callbacks
- Manage Canvas 2D context for effects layer

- [ ] **Step 7: Run all tests**

```bash
npm test
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire GameState, EventBus, SaveSystem, and core game loop"
git push origin main
```

---

## Chunk 2: Game Systems (Submit to VXD — Wave 1, parallel)

These 5 stories are submitted as a VXD requirement. Each system is isolated — communicates only via EventBus. They run in parallel with no file overlap.

### Task 4: Submit VXD requirement for game systems

- [ ] **Step 1: Create requirement file**

Create `/Users/mncedimini/Sites/misc/space-agency-game/stellar-horizon-systems.md` with:

```markdown
# Stellar Horizon: Game Systems

Build 5 independent game systems for Stellar Horizon. Each system communicates ONLY via EventBus — no direct imports between systems.

## Existing code context
- GameState is at src/game/GameState.js (immutable, returns new state objects)
- EventBus is at src/game/EventBus.js (pub/sub with on/emit/off)
- Game data exists at src/data/missions.js, src/data/crew.js, src/data/research.js
- UI components exist at src/ui/components.js (read-only, do not modify)
- Utility functions at src/utils/constants.js and src/utils/helpers.js (read-only)

## Story 1: Budget System
owned_files: ["src/systems/BudgetSystem.js", "src/data/budget.js", "tests/unit/budgetSystem.test.js"]
wave_hint: parallel
complexity: 3

Implement BudgetSystem that manages agency finances:
- Starting balance $500M, quarterly funding $50M
- deduct(amount) — rejects if insufficient, emits budget:insufficient
- addIncome(amount, source) — adds to balance
- advanceQuarter() — applies quarterly funding, expenses
- getReport() — returns budget history
- Listens to: budget:deduct, budget:add-income
- Emits: budget:updated, budget:insufficient, budget:quarter-advanced

## Story 2: Mission System
owned_files: ["src/systems/MissionSystem.js", "tests/unit/missionSystem.test.js"]
wave_hint: parallel
complexity: 5

Implement MissionSystem using existing src/data/missions.js data:
- getMissionsByTier(tier) — filter available missions
- launchMission(missionId, crewIds) — validate crew/budget, start mission
- updateProgress(deltaTime) — advance active missions
- completeMission(missionId) — resolve outcome, apply rewards
- Listens to: mission:launch, game:tick
- Emits: mission:started, mission:completed, mission:failed, budget:deduct

## Story 3: Crew System
owned_files: ["src/systems/CrewSystem.js", "tests/unit/crewSystem.test.js"]
wave_hint: parallel
complexity: 3

Implement CrewSystem using existing src/data/crew.js data:
- recruit(crewMember) — add to roster
- assignToCrew(crewId, missionId) — validate availability
- trainCrew(crewId, program) — improve skills over time
- updateMorale(crewId, delta) — adjust morale
- Listens to: crew:recruit, crew:assign, crew:train, mission:completed
- Emits: crew:updated, crew:training-complete

## Story 4: Research System
owned_files: ["src/systems/ResearchSystem.js", "tests/unit/researchSystem.test.js"]
wave_hint: parallel
complexity: 3

Implement ResearchSystem using existing src/data/research.js data:
- getAvailable() — tech tree nodes ready to research
- startResearch(techId) — begin research, deduct budget
- updateProgress(deltaTime) — advance active research
- completeResearch(techId) — unlock tech, update available missions
- Listens to: research:start, game:tick
- Emits: research:started, research:completed, budget:deduct

## Story 5: Random Event System
owned_files: ["src/systems/EventSystem.js", "src/data/events.js", "tests/unit/eventSystem.test.js"]
wave_hint: parallel
complexity: 3

Implement EventSystem with random events:
- Create events.js data file with 15+ events (meteor shower, funding cut, discovery, etc.)
- checkForEvents(gameState) — roll dice based on game state, trigger events
- presentEvent(event) — emit for UI to show player choices
- resolveEvent(eventId, choiceIndex) — apply consequences
- Listens to: game:tick, event:resolve
- Emits: event:triggered, event:resolved, budget:deduct, budget:add-income
```

- [ ] **Step 2: Submit to VXD**

```bash
cd /Users/mncedimini/Sites/misc/space-agency-game
vxd req --file stellar-horizon-systems.md
```

- [ ] **Step 3: Monitor and let VXD agents work**

```bash
vxd resume <req-id>
# Or let auto-resume handle it
```

- [ ] **Step 4: Verify all 5 systems are merged**

```bash
vxd status --req <req-id>
# All 5 stories should be "merged"
```

---

## Chunk 3: Scenes (Submit to VXD — Wave 2, parallel)

After all systems are merged, submit the scenes requirement. Each scene is an isolated DOM component that reads state and emits actions via EventBus.

### Task 5: Submit VXD requirement for scenes

- [ ] **Step 1: Create requirement file**

Create `/Users/mncedimini/Sites/misc/space-agency-game/stellar-horizon-scenes.md` with the 5 scene stories:

1. **Dashboard scene** — 3-column grid, agency overview, active missions, crew status
   - owned_files: `src/scenes/Dashboard.js`, `styles/dashboard.css`, `tests/unit/dashboard.test.js`
2. **Mission Control scene** — split panel, mission catalog, launch flow
   - owned_files: `src/scenes/MissionControl.js`, `styles/missions.css`, `tests/unit/missionControl.test.js`
3. **Crew Quarters scene** — card grid, crew management
   - owned_files: `src/scenes/CrewQuarters.js`, `styles/crew.css`, `tests/unit/crewQuarters.test.js`
4. **Research Lab scene** — horizontal tech tree visualization
   - owned_files: `src/scenes/ResearchLab.js`, `styles/research.css`, `tests/unit/researchLab.test.js`
5. **Launch Sequence scene** — enhance existing, full canvas takeover
   - owned_files: `src/scenes/LaunchSequence.js`, `tests/unit/launch-sequence.test.js`

Each scene spec includes:
- Exact DOM structure to render
- CSS class names matching the glassmorphism theme
- EventBus events to listen for and emit
- State reads needed from GameState
- Reference to `src/ui/components.js` for shared components (read-only)
- Reference to `styles/main.css` and `styles/animations.css` for shared theme (read-only)

- [ ] **Step 2: Submit to VXD**

```bash
vxd req --file stellar-horizon-scenes.md
```

- [ ] **Step 3: Monitor and verify all 5 scenes merged**

---

## Chunk 4: Polish & Integration (Submit to VXD — Wave 3+4)

### Task 6: Submit VXD requirement for polish

- [ ] **Step 1: Create requirement file**

Create `/Users/mncedimini/Sites/misc/space-agency-game/stellar-horizon-polish.md` with:

**Wave 3 (parallel, 4 agents):**
1. Audio system enhancement — `src/audio/AudioManager.js`
2. Tutorial system — `src/scenes/Tutorial.js`, `styles/tutorial.css`
3. Canvas effects enhancement — `src/canvas/Starfield.js`, `src/canvas/Particles.js`
4. Main menu + scene transitions — `src/scenes/MainMenu.js`

**Wave 4 (sequential, 1 agent at a time):**
5. Save/load integration — `src/game/SaveSystem.js`, `src/core/game.js`
6. Vercel deployment — `vercel.json`
7. E2E smoke test — `tests/e2e/`

- [ ] **Step 2: Submit to VXD**

```bash
vxd req --file stellar-horizon-polish.md
```

- [ ] **Step 3: Monitor through all waves**

- [ ] **Step 4: Play-test at each milestone**

| Milestone | Check |
|-----------|-------|
| M1 (after Wave 0) | Starfield + main menu + scene navigation works |
| M2 (after Waves 1+2) | Can launch missions, budget updates, dashboard shows data |
| M3 (after Waves 3+4) | All systems work, tutorial plays, audio works, save/load works |
| M4 (after deploy) | Game loads on Vercel URL |

---

## Chunk 5: Deployment Verification

### Task 7: Verify Vercel deployment

- [ ] **Step 1: Connect repo to Vercel**

Go to vercel.com, import github.com/tzone85/SpaceAgencyGame. Settings:
- Framework: Vite
- Build: `npm run build`
- Output: `dist`

- [ ] **Step 2: Verify production build**

```bash
npm run build
npx vite preview  # Test locally
```

- [ ] **Step 3: Share URL with the player**

The game should be live at the Vercel URL. Test:
- Main menu loads with starfield
- Can start new game
- Dashboard shows agency data
- Can navigate between scenes
- Can launch a mission
- Save/load works across sessions
- Audio plays

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: Stellar Horizon v1.0 — playable space agency management game"
git push origin main
```
