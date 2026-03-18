# Stellar Horizon: Space Agency Management Game — Design Spec

**Date:** 2026-03-17
**Status:** Approved
**Target:** 15-year-old gamer on M2 MacBook Air
**Repo:** github.com/tzone85/SpaceAgencyGame
**Deployment:** Vercel (auto-deploy from main)

---

## 1. Foundation Cleanup

The VXD agents have merged 14 stories to origin/main across 5 separate requirements. Before new work begins:

### 1.1 Pull and audit origin/main
- Local main is 15 commits behind origin/main
- Pull all merged work: starfield, scenes, audio, UI components, data files, tests

### 1.2 Remove dead code
- `webpack.config.js` — replaced by `vite.config.js`
- `src/core/renderer.js` — WebGL renderer, not needed for DOM/CSS + Canvas 2D
- `.babelrc` / `babel.config.cjs` / `babel.config.test.cjs` — Vite handles transforms
- Duplicate test setup files from conflicting agent approaches

### 1.3 Consolidate build config
- Single `vite.config.js` as the build tool
- Clean `package.json` — remove webpack/babel deps, ensure vite is the only bundler
- Unified `jest.config.js` with ESM support

### 1.4 Verify baseline
- `npm run dev` serves the game
- `npm test` passes
- Starfield, main menu, and launch animation render correctly

### 1.5 Archive old requirements
- Mark 01KKDXXP, 01KKE649, 01KKFZ82, 01KKHEW8 as archived
- Only 01KKVMGT (Stellar Horizon) remains active

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Build | Vite | Fast dev server, HMR, ES modules, production bundling |
| UI | DOM + CSS | Glassmorphism panels, buttons, data displays, scene layouts |
| Effects | Canvas 2D | Starfield parallax, rocket launch animation, particles |
| Audio | Web Audio API | Procedural ambient music, SFX |
| State | Vanilla JS (ES Modules) | Immutable game state, EventBus pub/sub |
| Persistence | localStorage | Save/load game state |
| Testing | Jest (jsdom) | Unit tests, 80% coverage threshold |
| Deployment | Vercel | Auto-deploy from main, preview on PRs |
| Fonts | Orbitron + Roboto Mono | Sci-fi headings + monospace data |

No runtime frameworks. No WebGL. No Webpack.

---

## 3. Architecture

```
index.html
├── Canvas Layer (behind)     — Starfield, Particles, Launch Animation
└── DOM Layer (on top)        — Scenes rendered as HTML/CSS
    └── UI Components         — Glassmorphism panels, buttons, etc.

Game Core
├── GameState                 — Single source of truth (immutable)
├── EventBus                  — Pub/sub decoupling between all modules
└── SaveSystem                — localStorage persistence

Systems (communicate only via EventBus)
├── BudgetSystem              — Balance, income, expenses, quarterly cycle
├── MissionSystem             — Catalog, launch, progress, completion
├── CrewSystem                — Recruitment, training, assignment, morale
├── ResearchSystem            — Tech tree, unlocks, duration
└── EventSystem               — Random events, storyline triggers, choices
```

### 3.1 Data flow
1. User action in a Scene (e.g. click "Launch Mission")
2. Scene emits event via EventBus (`mission:launch`)
3. Responsible System handles event, validates, updates GameState
4. System emits result events (`budget:deducted`, `mission:started`)
5. Other Systems and Scenes react to result events
6. SaveSystem auto-saves on state change

### 3.2 Rules
- GameState is immutable — systems return new objects, never mutate
- EventBus is the only coupling — systems and scenes never import each other
- Scenes are pure renderers — read state, emit user actions, no business logic
- Canvas layer is independent — runs own animation loop, listens to EventBus
- Each system is testable in isolation with a mock EventBus

---

## 4. Game State Shape

```javascript
{
  agency: {
    name: "Stellar Horizon Space Agency",
    reputation: 50,             // 0-100
    founded: "2024-Q1"
  },
  budget: {
    balance: 500_000_000,       // starting $500M
    quarterlyFunding: 50_000_000,
    currentQuarter: 1,
    currentYear: 2024,
    history: []                 // { quarter, income, expenses, balance }
  },
  missions: {
    available: [],              // unlocked mission templates
    active: [],                 // { id, templateId, crewIds, startTime, progress, status }
    completed: []               // finished missions with outcomes
  },
  crew: {
    roster: [],                 // { id, name, role, skills, morale, health, experience }
    applicants: [],             // available for recruitment
    training: []                // { crewId, program, completionTime }
  },
  research: {
    completed: [],              // unlocked tech IDs
    active: null,               // { techId, startTime, progress }
    available: []               // tech tree nodes ready to research
  },
  events: {
    active: [],                 // current random events awaiting player choice
    history: []                 // past events and outcomes
  },
  tutorial: {
    completed: false,
    currentStep: 0
  },
  meta: {
    saveVersion: 1,
    lastSaved: null,
    totalPlayTime: 0
  }
}
```

- All arrays immutable — new arrays returned, never push/splice
- `crew.skills`: `{ piloting: 7, engineering: 4, science: 6, medical: 3 }`
- `budget.history` enables quarterly report screen
- `meta.saveVersion` allows future save migration

---

## 5. Story Decomposition & Wave Strategy

### Wave 0 — Foundation (sequential, 1 agent)

| # | Story | Owned Files |
|---|-------|------------|
| 1 | Vite migration and dead code removal | `vite.config.js`, `package.json`, delete `webpack.config.js` |
| 2 | Core game loop and scene wiring | `src/core/game.js`, `src/core/engine.js`, `index.html` |
| 3 | Game state manager | `src/game/GameState.js`, `src/game/SaveSystem.js` |
| 4 | Event bus integration | `src/game/EventBus.js` (wire to systems) |

### Wave 1 — Game Systems (parallel, 5 agents)

| # | Story | Owned Files |
|---|-------|------------|
| 5 | Budget system | `src/systems/BudgetSystem.js`, `src/data/budget.js` |
| 6 | Mission system | `src/systems/MissionSystem.js`, `src/data/missions.js` |
| 7 | Crew system | `src/systems/CrewSystem.js`, `src/data/crew.js` |
| 8 | Research system | `src/systems/ResearchSystem.js`, `src/data/research.js` |
| 9 | Random event system | `src/systems/EventSystem.js`, `src/data/events.js` |

### Wave 2 — Scenes (parallel, 5 agents)

| # | Story | Owned Files |
|---|-------|------------|
| 10 | Dashboard scene (main hub) | `src/scenes/Dashboard.js`, `styles/dashboard.css` |
| 11 | Mission Control scene | `src/scenes/MissionControl.js`, `styles/missions.css` |
| 12 | Crew Quarters scene | `src/scenes/CrewQuarters.js`, `styles/crew.css` |
| 13 | Research Lab scene | `src/scenes/ResearchLab.js`, `styles/research.css` |
| 14 | Launch Sequence scene (enhance existing) | `src/scenes/LaunchSequence.js` |

### Wave 3 — Polish and Integration (parallel, 4 agents)

| # | Story | Owned Files |
|---|-------|------------|
| 15 | Audio system (enhance existing) | `src/audio/AudioManager.js` |
| 16 | Tutorial system | `src/scenes/Tutorial.js`, `styles/tutorial.css` |
| 17 | Canvas effects (enhance existing) | `src/canvas/Starfield.js`, `src/canvas/Particles.js` |
| 18 | Main menu and scene transitions (enhance) | `src/scenes/MainMenu.js` |

### Wave 4 — Final Integration (sequential, 1 agent)

| # | Story | Owned Files |
|---|-------|------------|
| 19 | Save/load integration | `src/game/SaveSystem.js` |
| 20 | Vercel deployment config | `vercel.json`, build scripts |
| 21 | End-to-end smoke test | `tests/e2e/` |

### Dispatch rules
- Sequential stories run one at a time
- Parallel stories must have zero file ownership overlap
- Each story includes explicit owned file paths — agents must not modify files outside ownership
- Systems communicate only via EventBus — no direct imports between systems

---

## 6. Visual Design

### 6.1 Theme
- Base: `#0a0a1a` (deep space dark)
- Panels: `#111827` with `backdrop-filter: blur(12px)`, semi-transparent borders
- Primary accent: cyan `#00d4ff`
- Secondary: purple `#7b2ff7` (research)
- Warning: orange `#ff6b35` (alerts, mission costs)
- Fonts: Orbitron (headings), Roboto Mono (data/numbers)

### 6.2 Scene Layouts

| Scene | Layout | Key Elements |
|-------|--------|-------------|
| Main Menu | Centered over starfield | Animated title, New Game / Continue / Settings, space facts ticker |
| Dashboard | 3-column grid | Left: agency + budget. Center: active missions. Right: crew + alerts. Top bar: quarter, balance, reputation |
| Mission Control | Split panel | Left: mission catalog (filter by tier). Right: detail + crew slots + launch button |
| Crew Quarters | Card grid | Crew cards with role icon, skill bars, morale. Recruit/train/assign actions |
| Research Lab | Horizontal tech tree | Nodes: completed (cyan glow), available (white), locked (grey). Click to research |
| Launch Sequence | Full-screen canvas takeover | Countdown, rocket animation, orbit insertion. DOM overlay with stats |
| Tutorial | Overlay on Dashboard | Spotlight + tooltip, "Next" to advance, dismissible |

### 6.3 Animation
- CSS transitions for UI state changes (300ms)
- CSS keyframes for ambient effects (pulsing borders, glowing text)
- Canvas for starfield parallax (mouse-tracked) and launch sequence
- Scene transitions: fade-out → fade-in (300ms)

### 6.4 Target
- MacBook Air 1440x900 / 2560x1600 retina
- CSS Grid + Flexbox
- Desktop only — no mobile

---

## 7. VXD Planner Improvements (Build First)

These changes go into the VXD codebase before re-submitting the game requirement.

### 7.1 File ownership in story specs
- Add `OwnedFiles []string` field to `PlannedStory` struct
- Tech Lead prompt requires explicit file paths per story
- Dispatcher validates no two stories in the same wave share owned files
- Overlap detected → conflicting story pushed to next wave

### 7.2 Wave strategy tags
- Add `WaveHint string` field to `PlannedStory`: `"parallel"` (default) or `"sequential"`
- Stories touching configurable patterns auto-tagged `sequential`
- Dispatcher processes sequential stories first, one at a time
- Config:
  ```yaml
  planning:
    sequential_file_patterns:
      - "package.json"
      - "*.config.*"
      - "src/core/*"
  ```

### 7.3 Conflict-risk scoring
- Before dispatching a wave, score file overlap between candidate stories
- Any pair sharing > 0 owned files → split into separate waves
- Logged for observability

### 7.4 Max story complexity enforcement
- Tech Lead prompt: "No story should have complexity > 5. Split larger features."
- New config: `routing.max_story_complexity` (default 5)
- Dispatcher rejects stories exceeding limit → escalation event for re-decomposition

### 7.5 Story retry budget
- Each story tracks attempts via REVIEW_FAILED event count
- After exceeding `routing.max_retries_before_escalation` (default 3): escalate, not reset
- Escalation includes last 3 failure reasons for Supervisor context

### Files to modify in VXD

| File | Change |
|------|--------|
| `internal/engine/planner.go` | Updated Tech Lead prompt, OwnedFiles and WaveHint fields |
| `internal/engine/dispatcher.go` | Wave validation, overlap scoring, sequential-first ordering |
| `internal/config/config.go` | New `planning` config section with sequential_file_patterns |
| `internal/state/models.go` | OwnedFiles, WaveHint fields on PlannedStory/Story |
| `internal/state/sqlite.go` | Schema migration for new fields |

---

## 8. Deployment

### 8.1 Vercel config
- `vercel.json` at project root
- Build: `npm run build` → Vite outputs to `dist/`
- GitHub integration: auto-deploy on push to main
- Preview deployments on PRs

### 8.2 Production build
- Vite tree-shakes unused code
- Fonts served as static assets from `public/fonts/`
- Canvas resources loaded lazily
- No backend — localStorage only

### 8.3 Milestones

| Milestone | Playable State | After |
|-----------|---------------|-------|
| M1 | Starfield + main menu + scene navigation | Wave 0 |
| M2 | Launch missions, spend budget, see dashboard | Wave 1 + 2 |
| M3 | Full game: all systems, tutorial, audio, save/load | Wave 3 + 4 |
| M4 | Live on Vercel, shareable URL | Wave 4 |

---

## 9. Execution Order

1. **Build VXD planner improvements** (Section 7)
2. **Foundation cleanup** (Section 1) — manual audit, Vite migration, dead code removal
3. **Submit new VXD requirement** with 21 stories from Section 5
4. **VXD agents execute Waves 0-4** with file ownership enforcement
5. **Play-test at each milestone** (M1-M4)
6. **Deploy to Vercel** after M3
