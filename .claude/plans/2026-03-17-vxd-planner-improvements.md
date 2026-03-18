# VXD Planner Improvements — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add file ownership, wave hints, overlap scoring, and complexity limits to VXD's planner and dispatcher so that parallel agents don't produce merge conflicts.

**Architecture:** Extend PlannedStory with OwnedFiles and WaveHint fields. Update the Tech Lead prompt to require file paths. Add validation in the Dispatcher to reject overlapping stories and enforce sequential ordering. Add planning config section.

**Tech Stack:** Go 1.23+, SQLite, Cobra CLI

**Spec:** `docs/superpowers/specs/2026-03-17-stellar-horizon-design.md` Section 7

**Repo:** `/Users/mncedimini/Sites/misc/vortex-dispatch`

---

## Chunk 1: Data Model & Config

### Task 1: Add OwnedFiles and WaveHint to PlannedStory

**Files:**
- Modify: `internal/engine/planner.go:18-26`
- Test: `internal/engine/planner_test.go`

- [ ] **Step 1: Write failing test for new fields**

```go
func TestPlannedStory_HasFileOwnership(t *testing.T) {
    story := PlannedStory{
        ID:         "s-001",
        Title:      "test",
        OwnedFiles: []string{"src/main.js", "package.json"},
        WaveHint:   "sequential",
    }
    if len(story.OwnedFiles) != 2 {
        t.Fatalf("expected 2 owned files, got %d", len(story.OwnedFiles))
    }
    if story.WaveHint != "sequential" {
        t.Fatalf("expected sequential, got %s", story.WaveHint)
    }
}
```

- [ ] **Step 2: Run test — expect FAIL** (`story.OwnedFiles undefined`)

Run: `cd /Users/mncedimini/Sites/misc/vortex-dispatch && go test ./internal/engine/ -run TestPlannedStory_HasFileOwnership -v`

- [ ] **Step 3: Add fields to PlannedStory**

```go
type PlannedStory struct {
    ID                 string         `json:"id"`
    Title              string         `json:"title"`
    Description        string         `json:"description"`
    AcceptanceCriteria FlexibleString `json:"acceptance_criteria"`
    Complexity         int            `json:"complexity"`
    DependsOn          []string       `json:"depends_on"`
    OwnedFiles         []string       `json:"owned_files"`
    WaveHint           string         `json:"wave_hint"`
}
```

- [ ] **Step 4: Run test — expect PASS**
- [ ] **Step 5: Commit** `feat(planner): add OwnedFiles and WaveHint fields to PlannedStory`

---

### Task 2: Add planning config section

**Files:**
- Modify: `internal/config/config.go:44-50`
- Test: `internal/config/config_test.go`

- [ ] **Step 1: Write failing test**

```go
func TestConfig_PlanningDefaults(t *testing.T) {
    cfg := DefaultConfig()
    if cfg.Planning.MaxStoryComplexity != 5 {
        t.Fatalf("expected default max complexity 5, got %d", cfg.Planning.MaxStoryComplexity)
    }
    if len(cfg.Planning.SequentialFilePatterns) == 0 {
        t.Fatal("expected default sequential file patterns")
    }
}
```

- [ ] **Step 2: Run test — expect FAIL** (`cfg.Planning undefined`)

- [ ] **Step 3: Add PlanningConfig struct and defaults**

```go
type PlanningConfig struct {
    SequentialFilePatterns []string `yaml:"sequential_file_patterns"`
    MaxStoryComplexity     int      `yaml:"max_story_complexity"`
}
```

Add `Planning PlanningConfig` to Config struct. Add defaults:

```go
Planning: PlanningConfig{
    SequentialFilePatterns: []string{"package.json", "*.config.*", "src/core/*"},
    MaxStoryComplexity: 5,
},
```

- [ ] **Step 4: Run test — expect PASS**
- [ ] **Step 5: Commit** `feat(config): add planning config with sequential patterns and max complexity`

---

### Task 3: Add OwnedFiles to Story model and SQLite schema

**Files:**
- Modify: `internal/state/models.go:14-27`
- Modify: `internal/state/sqlite.go` (schema, projectStoryCreated, GetStory)
- Test: `internal/state/sqlite_test.go`

- [ ] **Step 1: Write failing test**

```go
func TestSQLiteStore_StoryOwnedFiles(t *testing.T) {
    es, ps, cleanup := newTestStores(t)
    defer cleanup()

    evt := state.NewEvent(state.EventStoryCreated, "tech_lead", "s-001", map[string]any{
        "req_id":      "req-001",
        "title":       "test story",
        "owned_files": []string{"src/main.js", "package.json"},
        "wave_hint":   "sequential",
    })
    es.Append(evt)
    ps.Project(evt)

    story, err := ps.GetStory("s-001")
    if err != nil {
        t.Fatal(err)
    }
    if story.WaveHint != "sequential" {
        t.Fatalf("expected sequential, got %s", story.WaveHint)
    }
}
```

- [ ] **Step 2: Run test — expect FAIL** (`story.WaveHint undefined`)

- [ ] **Step 3: Add fields to Story struct, schema migration, and projection**

Story struct additions:
```go
OwnedFiles []string
WaveHint   string
```

Schema migration:
```sql
ALTER TABLE stories ADD COLUMN owned_files TEXT NOT NULL DEFAULT '[]';
ALTER TABLE stories ADD COLUMN wave_hint TEXT NOT NULL DEFAULT 'parallel';
```

Update `projectStoryCreated()` to JSON-encode owned_files. Update `GetStory()` to scan and decode.

- [ ] **Step 4: Run test — expect PASS**
- [ ] **Step 5: Run all state tests** `go test ./internal/state/ -v`
- [ ] **Step 6: Commit** `feat(state): add owned_files and wave_hint to Story model and schema`

---

## Chunk 2: Tech Lead Prompt & Planner Validation

### Task 4: Update Tech Lead prompt to require file ownership

**Files:**
- Modify: `internal/engine/planner.go:80-97`
- Test: `internal/engine/planner_test.go`

- [ ] **Step 1: Write test for JSON parsing with owned_files**

```go
func TestPlan_ParsesOwnedFiles(t *testing.T) {
    mockResponse := `{"stories": [{"id": "s-001", "title": "Setup", "description": "Init", "acceptance_criteria": "Builds", "complexity": 2, "depends_on": [], "owned_files": ["package.json", "vite.config.js"], "wave_hint": "sequential"}]}`
    var result struct {
        Stories []PlannedStory `json:"stories"`
    }
    if err := json.Unmarshal([]byte(mockResponse), &result); err != nil {
        t.Fatal(err)
    }
    if len(result.Stories[0].OwnedFiles) != 2 {
        t.Fatalf("expected 2 owned files, got %d", len(result.Stories[0].OwnedFiles))
    }
}
```

- [ ] **Step 2: Run test — expect PASS** (fields already exist from Task 1)

- [ ] **Step 3: Update Tech Lead prompt** to include:

```
Each story MUST include:
- "owned_files": array of exact file paths this story creates or modifies. No two stories may share files.
- "wave_hint": "sequential" if story touches shared config (package.json, *.config.*, src/core/*), else "parallel".

Rules:
- Every path must be explicit (e.g. "src/systems/BudgetSystem.js", not "src/systems/").
- No story may claim a file another story also claims.
- No story should have complexity > %d. Split larger features.
```

- [ ] **Step 4: Add complexity validation in Plan()**

```go
for _, s := range stories {
    if p.config.Planning.MaxStoryComplexity > 0 && s.Complexity > p.config.Planning.MaxStoryComplexity {
        return PlanResult{}, fmt.Errorf("story %s complexity %d exceeds max %d", s.ID, s.Complexity, p.config.Planning.MaxStoryComplexity)
    }
}
```

- [ ] **Step 5: Add file overlap validation in Plan()**

```go
fileOwner := make(map[string]string)
for _, s := range stories {
    for _, f := range s.OwnedFiles {
        if owner, exists := fileOwner[f]; exists {
            return PlanResult{}, fmt.Errorf("file %s claimed by %s and %s", f, owner, s.ID)
        }
        fileOwner[f] = s.ID
    }
}
```

- [ ] **Step 6: Run full engine tests** `go test ./internal/engine/ -v`
- [ ] **Step 7: Commit** `feat(planner): require file ownership, validate complexity and overlap`

---

## Chunk 3: Dispatcher Wave Validation

### Task 5: Sequential-first ordering and overlap scoring

**Files:**
- Modify: `internal/engine/dispatcher.go:41-102`
- Test: `internal/engine/dispatcher_test.go`

- [ ] **Step 1: Write test for sequential-first ordering**

```go
func TestDispatchWave_SequentialFirst(t *testing.T) {
    // Create DAG with 3 ready stories: 1 sequential, 2 parallel
    // Verify only the 1 sequential story is dispatched
}
```

- [ ] **Step 2: Write test for overlap rejection**

```go
func TestDispatchWave_RejectsOverlap(t *testing.T) {
    // Create 2 parallel stories sharing "package.json"
    // Verify only 1 dispatched per wave
}
```

- [ ] **Step 3: Run tests — expect FAIL**

- [ ] **Step 4: Implement sequential-first ordering**

```go
var sequential, parallel []PlannedStory
for _, s := range readyStories {
    if s.WaveHint == "sequential" {
        sequential = append(sequential, s)
    } else {
        parallel = append(parallel, s)
    }
}
if len(sequential) > 0 {
    readyStories = sequential[:1] // one at a time
} else {
    readyStories = parallel
}
```

- [ ] **Step 5: Implement overlap filtering**

```go
func filterOverlappingStories(stories []PlannedStory) []PlannedStory {
    claimed := make(map[string]bool)
    var result []PlannedStory
    for _, s := range stories {
        overlap := false
        for _, f := range s.OwnedFiles {
            if claimed[f] {
                overlap = true
                log.Printf("[dispatcher] deferring %s: file %s claimed", s.ID, f)
                break
            }
        }
        if !overlap {
            for _, f := range s.OwnedFiles {
                claimed[f] = true
            }
            result = append(result, s)
        }
    }
    return result
}
```

- [ ] **Step 6: Implement auto-tagging from config patterns**

```go
func (d *Dispatcher) autoTagWaveHints(stories []PlannedStory) {
    for i := range stories {
        if stories[i].WaveHint != "" { continue }
        for _, f := range stories[i].OwnedFiles {
            if d.matchesSequentialPattern(f) {
                stories[i].WaveHint = "sequential"
                break
            }
        }
        if stories[i].WaveHint == "" {
            stories[i].WaveHint = "parallel"
        }
    }
}
```

- [ ] **Step 7: Run tests — expect PASS**
- [ ] **Step 8: Run full suite** `go test ./... -v`
- [ ] **Step 9: Commit** `feat(dispatcher): sequential-first ordering, overlap scoring, auto-tagging`

---

## Chunk 4: Integration & NXD Port

### Task 6: Wire config, update example, build and install

**Files:**
- Modify: `vxd.config.example.yaml`
- Verify: all wiring works end-to-end

- [ ] **Step 1: Update example config**

Add to `vxd.config.example.yaml`:
```yaml
planning:
  sequential_file_patterns:
    - "package.json"
    - "*.config.*"
    - "src/core/*"
  max_story_complexity: 5
```

- [ ] **Step 2: Run full suite** `go test ./...`
- [ ] **Step 3: Build and install** `go build ./... && go install ./cmd/vxd/`
- [ ] **Step 4: Verify** `vxd config validate`
- [ ] **Step 5: Commit and push**

```bash
git add . && git commit -m "feat: wire planning config, update example" && git push origin main
```

---

### Task 7: Port all changes to NXD

**Repo:** `/Users/mncedimini/Sites/misc/nexus-dispatch`

- [ ] **Step 1: Copy PlannedStory changes** (planner.go)
- [ ] **Step 2: Copy PlanningConfig** (config.go)
- [ ] **Step 3: Copy Story model + schema changes** (models.go, sqlite.go)
- [ ] **Step 4: Copy Tech Lead prompt + validation** (planner.go)
- [ ] **Step 5: Copy Dispatcher changes** (dispatcher.go)
- [ ] **Step 6: Update example config** (nxd.config.example.yaml)
- [ ] **Step 7: Fix import paths** — `github.com/tzone85/nexus-dispatch/...`
- [ ] **Step 8: Run tests** `go test ./...`
- [ ] **Step 9: Build and install** `go build ./... && go install ./cmd/nxd/`
- [ ] **Step 10: Commit and push**

```bash
git add . && git commit -m "feat: port planner improvements from VXD" && git push origin main
```
