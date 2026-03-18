import CrewQuarters from '../../src/scenes/CrewQuarters.js';
import EventBus from '../../src/game/EventBus.js';

describe('Crew Quarters Scene', () => {
  let crewQuarters;
  let eventBus;

  const mockCrewMember = {
    id: "crew_001",
    firstName: "John",
    lastName: "Doe",
    role: "pilot",
    status: "available",
    stats: {
      piloting: 85,
      engineering: 45,
      science: 60,
      medical: 30,
      morale: 75,
      health: 90,
    },
  };

  const mockCrewMember2 = {
    id: "crew_002",
    firstName: "Jane",
    lastName: "Smith",
    role: "engineer",
    status: "assigned",
    stats: {
      piloting: 50,
      engineering: 90,
      science: 70,
      medical: 40,
      morale: 85,
      health: 88,
    },
  };

  const mockCrewMember3 = {
    id: "crew_003",
    firstName: "Bob",
    lastName: "Johnson",
    role: "scientist",
    status: "available",
    stats: {
      piloting: 40,
      engineering: 55,
      science: 95,
      medical: 50,
      morale: 70,
      health: 92,
    },
  };

  beforeEach(() => {
    EventBus.reset();
    eventBus = EventBus.getInstance();
    crewQuarters = new CrewQuarters();

    // Clear any existing crew quarters from DOM
    const existingScene = document.getElementById("crewQuarters");
    if (existingScene) {
      existingScene.remove();
    }
  });

  afterEach(() => {
    if (crewQuarters) {
      crewQuarters.cleanup();
      crewQuarters.destroy();
    }
    EventBus.reset();
  });

  test('should create a crew quarters instance', () => {
    expect(crewQuarters).toBeDefined();
    expect(crewQuarters.name).toBe('CrewQuarters');
  });

  test('should initialize crew quarters', () => {
    expect(() => crewQuarters.init()).not.toThrow();
  });

  test('should update crew quarters', () => {
    expect(() => crewQuarters.update()).not.toThrow();
  });

  test('should render crew quarters', () => {
    expect(() => crewQuarters.render()).not.toThrow();
  });

  test('should destroy crew quarters', () => {
    expect(() => crewQuarters.destroy()).not.toThrow();
  });

  describe("Initialization", () => {
    test("should initialize with no scene element initially", () => {
      expect(crewQuarters.sceneElement).toBeNull();
      expect(crewQuarters.tabsContainer).toBeNull();
      expect(crewQuarters.gridContainer).toBeNull();
      expect(crewQuarters.tabs).toEqual([]);
    });

    test("should create scene UI when initialized", () => {
      crewQuarters.initialize();

      expect(crewQuarters.sceneElement).not.toBeNull();
      expect(crewQuarters.sceneElement.id).toBe("crewQuarters");
      expect(crewQuarters.sceneElement.className).toBe("crew-quarters");
    });

    test("should add scene element to DOM", () => {
      crewQuarters.initialize();

      const sceneInDOM = document.getElementById("crewQuarters");
      expect(sceneInDOM).not.toBeNull();
      expect(sceneInDOM).toBe(crewQuarters.sceneElement);
    });

    test("should start with roster tab active", () => {
      crewQuarters.initialize();

      expect(crewQuarters.currentTab).toBe("roster");
      const activeTab = crewQuarters.tabs.find((t) =>
        t.classList.contains("crew-quarters__tab--active"),
      );
      expect(activeTab).not.toBeUndefined();
      expect(activeTab.dataset.tab).toBe("roster");
    });

    test("should initialize crew members as empty", () => {
      expect(crewQuarters.crewMembers).toEqual({
        roster: [],
        applicants: [],
        training: [],
      });
    });
  });

  describe("UI Elements", () => {
    beforeEach(() => {
      crewQuarters.initialize();
    });

    test("should create title element", () => {
      const title = crewQuarters.sceneElement.querySelector(
        ".crew-quarters__title",
      );
      expect(title).not.toBeNull();
      expect(title.textContent).toBe("CREW QUARTERS");
    });

    test("should create three tabs", () => {
      expect(crewQuarters.tabs.length).toBe(3);
    });

    test("should create tabs with correct labels", () => {
      const labels = crewQuarters.tabs.map((t) => t.textContent);
      expect(labels).toEqual(["ROSTER", "APPLICANTS", "TRAINING"]);
    });

    test("should create tabs with correct data attributes", () => {
      expect(crewQuarters.tabs[0].dataset.tab).toBe("roster");
      expect(crewQuarters.tabs[1].dataset.tab).toBe("applicants");
      expect(crewQuarters.tabs[2].dataset.tab).toBe("training");
    });

    test("should create grid container", () => {
      expect(crewQuarters.gridContainer).not.toBeNull();
      expect(crewQuarters.gridContainer.className).toBe("crew-quarters__grid");
    });
  });

  describe("Tab Navigation", () => {
    beforeEach(() => {
      crewQuarters.initialize();
      crewQuarters.setCrewData(
        [mockCrewMember],
        [mockCrewMember2],
        [mockCrewMember3],
      );
    });

    test("should switch to applicants tab", () => {
      crewQuarters.switchTab("applicants");

      expect(crewQuarters.currentTab).toBe("applicants");
      const activeTab = crewQuarters.tabs.find((t) =>
        t.classList.contains("crew-quarters__tab--active"),
      );
      expect(activeTab.dataset.tab).toBe("applicants");
    });

    test("should switch to training tab", () => {
      crewQuarters.switchTab("training");

      expect(crewQuarters.currentTab).toBe("training");
      const activeTab = crewQuarters.tabs.find((t) =>
        t.classList.contains("crew-quarters__tab--active"),
      );
      expect(activeTab.dataset.tab).toBe("training");
    });

    test("should update grid display when switching tabs", () => {
      crewQuarters.switchTab("applicants");
      let cards = crewQuarters.gridContainer.querySelectorAll(".crew-card");
      expect(cards.length).toBe(1);

      crewQuarters.switchTab("roster");
      cards = crewQuarters.gridContainer.querySelectorAll(".crew-card");
      expect(cards.length).toBe(1);
    });

    test("should handle tab click events", () => {
      const applicantsTab = crewQuarters.tabs[1];
      applicantsTab.click();

      expect(crewQuarters.currentTab).toBe("applicants");
    });

    test("should only show active tab as active", () => {
      crewQuarters.switchTab("training");

      const activeTabs = crewQuarters.tabs.filter((t) =>
        t.classList.contains("crew-quarters__tab--active"),
      );
      expect(activeTabs.length).toBe(1);
      expect(activeTabs[0].dataset.tab).toBe("training");
    });
  });

  describe("Crew Display", () => {
    beforeEach(() => {
      crewQuarters.initialize();
    });

    test("should display empty state when no crew", () => {
      crewQuarters.updateCrewDisplay();

      const emptyState = crewQuarters.gridContainer.querySelector(
        ".crew-quarters__empty",
      );
      expect(emptyState).not.toBeNull();
      expect(emptyState.textContent).toBe("No crew in roster");
    });

    test("should display crew cards when crew exists", () => {
      crewQuarters.setCrewData([mockCrewMember], [], []);

      const cards = crewQuarters.gridContainer.querySelectorAll(".crew-card");
      expect(cards.length).toBe(1);
    });

    test("should display multiple crew cards", () => {
      crewQuarters.setCrewData(
        [mockCrewMember, mockCrewMember2, mockCrewMember3],
        [],
        [],
      );

      const cards = crewQuarters.gridContainer.querySelectorAll(".crew-card");
      expect(cards.length).toBe(3);
    });

    test("should display crew names correctly", () => {
      crewQuarters.setCrewData([mockCrewMember], [], []);

      const nameElement =
        crewQuarters.gridContainer.querySelector(".crew-card__name");
      expect(nameElement.textContent).toBe("John Doe");
    });

    test("should display status badge", () => {
      crewQuarters.setCrewData([mockCrewMember], [], []);

      const statusBadge =
        crewQuarters.gridContainer.querySelector(".crew-card__status");
      expect(statusBadge).not.toBeNull();
      expect(statusBadge.textContent).toBe("AVAILABLE");
    });

    test("should display skill bars for all skills", () => {
      crewQuarters.setCrewData([mockCrewMember], [], []);

      const skillBars = crewQuarters.gridContainer.querySelectorAll(
        ".crew-card__skill-bar",
      );
      expect(skillBars.length).toBe(4); // piloting, engineering, science, medical
    });

    test("should display morale and health indicators", () => {
      crewQuarters.setCrewData([mockCrewMember], [], []);

      const moraleDisplay = crewQuarters.gridContainer.querySelector(
        ".crew-card__stat:first-child",
      );
      const healthDisplay = crewQuarters.gridContainer.querySelector(
        ".crew-card__stat:nth-child(2)",
      );

      expect(moraleDisplay).not.toBeNull();
      expect(healthDisplay).not.toBeNull();
    });

    test("should set skill bar widths correctly", () => {
      crewQuarters.setCrewData([mockCrewMember], [], []);

      const pilotigBar = crewQuarters.gridContainer.querySelector(
        ".crew-card__skill-bar-fill--piloting",
      );
      expect(pilotigBar.style.width).toBe("85%");
    });
  });

  describe("Crew Cards", () => {
    beforeEach(() => {
      crewQuarters.initialize();
      crewQuarters.setCrewData([mockCrewMember], [], []);
    });

    test("should create crew card with correct data attribute", () => {
      const card = crewQuarters.gridContainer.querySelector(".crew-card");
      expect(card.dataset.memberId).toBe("crew_001");
    });

    test("should display role icon with correct class", () => {
      const roleIcon = crewQuarters.gridContainer.querySelector(
        ".crew-card__role-icon",
      );
      expect(roleIcon).not.toBeNull();
      expect(roleIcon.classList.contains("crew-card__role-icon--pilot")).toBe(
        true,
      );
    });

    test("should have role icon title with role name", () => {
      const roleIcon = crewQuarters.gridContainer.querySelector(
        ".crew-card__role-icon",
      );
      expect(roleIcon.title).toBe("Pilot");
    });

    test("should display correct status class", () => {
      const statusBadge =
        crewQuarters.gridContainer.querySelector(".crew-card__status");
      expect(
        statusBadge.classList.contains("crew-card__status--available"),
      ).toBe(true);
    });

    test("should display skill values correctly", () => {
      const skillValues = crewQuarters.gridContainer.querySelectorAll(
        ".crew-card__skill-value",
      );
      expect(skillValues[0].textContent).toBe("85"); // piloting
    });

    test("should display stat values correctly", () => {
      const statValues = crewQuarters.gridContainer.querySelectorAll(
        ".crew-card__stat-value",
      );
      expect(statValues[0].textContent).toBe("75"); // morale
      expect(statValues[1].textContent).toBe("90"); // health
    });
  });

  describe("Action Buttons", () => {
    test("should display RECRUIT button for applicants", () => {
      crewQuarters.initialize();
      crewQuarters.setCrewData([], [mockCrewMember], []);
      crewQuarters.switchTab("applicants");

      const recruitBtn = crewQuarters.gridContainer.querySelector(
        ".crew-card__action-btn--recruit",
      );
      expect(recruitBtn).not.toBeNull();
      expect(recruitBtn.textContent).toBe("RECRUIT");
    });

    test("should display TRAIN and ASSIGN buttons for roster", () => {
      crewQuarters.initialize();
      crewQuarters.setCrewData([mockCrewMember], [], []);

      const trainBtn = crewQuarters.gridContainer.querySelector(
        ".crew-card__action-btn--train",
      );
      const assignBtn = crewQuarters.gridContainer.querySelector(
        ".crew-card__action-btn--assign",
      );

      expect(trainBtn).not.toBeNull();
      expect(assignBtn).not.toBeNull();
      expect(trainBtn.textContent).toBe("TRAIN");
      expect(assignBtn.textContent).toBe("ASSIGN");
    });

    test("should not display ASSIGN button for assigned crew", () => {
      crewQuarters.initialize();
      const assignedMember = { ...mockCrewMember, status: "assigned" };
      crewQuarters.setCrewData([assignedMember], [], []);

      const assignBtn = crewQuarters.gridContainer.querySelector(
        ".crew-card__action-btn--assign",
      );
      expect(assignBtn).toBeNull();
    });

    test("should not display action buttons for training tab", () => {
      crewQuarters.initialize();
      crewQuarters.setCrewData([], [], [mockCrewMember]);
      crewQuarters.switchTab("training");

      const actionBtns = crewQuarters.gridContainer.querySelectorAll(
        ".crew-card__action-btn",
      );
      expect(actionBtns.length).toBe(0);
    });
  });

  describe("Event Handling", () => {
    beforeEach(() => {
      crewQuarters.initialize();
      crewQuarters.setCrewData([mockCrewMember], [], []);
    });

    test("should subscribe to crew:updated event", () => {
      const listeners = eventBus.getListeners("crew:updated");
      expect(listeners.length).toBeGreaterThan(0);
    });

    test("should subscribe to crew:training-complete event", () => {
      const listeners = eventBus.getListeners("crew:training-complete");
      expect(listeners.length).toBeGreaterThan(0);
    });

    test("should subscribe to budget:updated event", () => {
      const listeners = eventBus.getListeners("budget:updated");
      expect(listeners.length).toBeGreaterThan(0);
    });

    test("should handle crew:updated event", () => {
      const newCrewData = {
        roster: [mockCrewMember2],
        applicants: [],
        training: [],
      };

      eventBus.emit("crew:updated", { crew: newCrewData });

      expect(crewQuarters.crewMembers).toEqual(newCrewData);
    });

    test("should update display on crew:updated event", () => {
      const newCrewData = {
        roster: [mockCrewMember2],
        applicants: [],
        training: [],
      };

      eventBus.emit("crew:updated", { crew: newCrewData });

      const cards = crewQuarters.gridContainer.querySelectorAll(".crew-card");
      expect(cards.length).toBe(1);
      const name = crewQuarters.gridContainer.querySelector(".crew-card__name");
      expect(name.textContent).toBe("Jane Smith");
    });

    test("should handle crew:training-complete event", () => {
      const updateSpy = jest.spyOn(crewQuarters, "updateCrewDisplay");

      eventBus.emit("crew:training-complete", { memberId: "crew_001" });

      expect(updateSpy).toHaveBeenCalled();
      updateSpy.mockRestore();
    });
  });

  describe("Recruit Action", () => {
    beforeEach(() => {
      crewQuarters.initialize();
      crewQuarters.setCrewData([], [mockCrewMember], []);
      crewQuarters.switchTab("applicants");
    });

    test("should emit crew:recruit event on recruit button click", () => {
      const emitSpy = jest.spyOn(eventBus, "emit");

      const recruitBtn = crewQuarters.gridContainer.querySelector(
        ".crew-card__action-btn--recruit",
      );
      recruitBtn.click();

      expect(emitSpy).toHaveBeenCalledWith("crew:recruit", {
        memberId: "crew_001",
      });
      emitSpy.mockRestore();
    });

    test("should emit recruit event with correct crew ID", () => {
      const emitSpy = jest.spyOn(eventBus, "emit");
      crewQuarters.handleRecruit(mockCrewMember);

      expect(emitSpy).toHaveBeenCalledWith("crew:recruit", {
        memberId: "crew_001",
      });
      emitSpy.mockRestore();
    });
  });

  describe("Train Action", () => {
    beforeEach(() => {
      crewQuarters.initialize();
      crewQuarters.setCrewData([mockCrewMember], [], []);
    });

    test("should emit crew:train event when training is selected", () => {
      const emitSpy = jest.spyOn(eventBus, "emit");
      global.prompt = jest.fn(() => "piloting");

      const trainBtn = crewQuarters.gridContainer.querySelector(
        ".crew-card__action-btn--train",
      );
      trainBtn.click();

      expect(emitSpy).toHaveBeenCalledWith("crew:train", {
        memberId: "crew_001",
        skill: "piloting",
      });
      emitSpy.mockRestore();
    });

    test("should not emit event if training is cancelled", () => {
      const emitSpy = jest.spyOn(eventBus, "emit");
      global.prompt = jest.fn(() => null);

      crewQuarters.handleTrain(mockCrewMember);

      expect(emitSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({
          0: "crew:train",
        }),
      );
      emitSpy.mockRestore();
    });

    test("should not emit event if invalid skill is selected", () => {
      const emitSpy = jest.spyOn(eventBus, "emit");
      global.prompt = jest.fn(() => "invalid_skill");

      crewQuarters.handleTrain(mockCrewMember);

      expect(emitSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({
          0: "crew:train",
        }),
      );
      emitSpy.mockRestore();
    });

    test("should emit event with correct skill", () => {
      const emitSpy = jest.spyOn(eventBus, "emit");
      global.prompt = jest.fn(() => "engineering");

      crewQuarters.handleTrain(mockCrewMember);

      const firstCall = emitSpy.mock.calls.find(
        (call) => call[0] === "crew:train",
      );
      expect(firstCall).toBeDefined();
      expect(firstCall[1].skill).toBe("engineering");
      emitSpy.mockRestore();
    });
  });

  describe("Assign Action", () => {
    beforeEach(() => {
      crewQuarters.initialize();
      crewQuarters.setCrewData([mockCrewMember], [], []);
    });

    test("should emit crew:assign event on assign button click", () => {
      const emitSpy = jest.spyOn(eventBus, "emit");

      const assignBtn = crewQuarters.gridContainer.querySelector(
        ".crew-card__action-btn--assign",
      );
      assignBtn.click();

      expect(emitSpy).toHaveBeenCalledWith("crew:assign", {
        memberId: "crew_001",
      });
      emitSpy.mockRestore();
    });

    test("should emit assign event with correct crew ID", () => {
      const emitSpy = jest.spyOn(eventBus, "emit");
      crewQuarters.handleAssign(mockCrewMember);

      expect(emitSpy).toHaveBeenCalledWith("crew:assign", {
        memberId: "crew_001",
      });
      emitSpy.mockRestore();
    });
  });

  describe("Helper Methods", () => {
    beforeEach(() => {
      crewQuarters.initialize();
    });

    test("should get correct skill labels", () => {
      expect(crewQuarters.getSkillLabel("piloting")).toBe("Piloting");
      expect(crewQuarters.getSkillLabel("engineering")).toBe("Engineering");
      expect(crewQuarters.getSkillLabel("science")).toBe("Science");
      expect(crewQuarters.getSkillLabel("medical")).toBe("Medical");
    });

    test("should return skill name if label not found", () => {
      expect(crewQuarters.getSkillLabel("unknown")).toBe("unknown");
    });

    test("should get correct role names", () => {
      expect(crewQuarters.getRoleName("pilot")).toBe("Pilot");
      expect(crewQuarters.getRoleName("engineer")).toBe("Engineer");
      expect(crewQuarters.getRoleName("scientist")).toBe("Scientist");
      expect(crewQuarters.getRoleName("medical_officer")).toBe(
        "Medical Officer",
      );
    });

    test("should return role ID if role not found", () => {
      expect(crewQuarters.getRoleName("unknown_role")).toBe("unknown_role");
    });
  });

  describe("Lifecycle Methods", () => {
    test("should have update method that does not throw", () => {
      crewQuarters.initialize();
      expect(() => {
        crewQuarters.update(0.016);
      }).not.toThrow();
    });

    test("should have render method that does not throw", () => {
      crewQuarters.initialize();
      const mockRenderer = {};
      expect(() => {
        crewQuarters.render(mockRenderer);
      }).not.toThrow();
    });

    test("should remove scene from DOM on cleanup", () => {
      crewQuarters.initialize();
      expect(document.getElementById("crewQuarters")).not.toBeNull();

      crewQuarters.cleanup();
      expect(document.getElementById("crewQuarters")).toBeNull();
    });

    test("should reset all references on cleanup", () => {
      crewQuarters.initialize();
      crewQuarters.setCrewData([mockCrewMember], [], []);
      crewQuarters.cleanup();

      expect(crewQuarters.sceneElement).toBeNull();
      expect(crewQuarters.tabsContainer).toBeNull();
      expect(crewQuarters.gridContainer).toBeNull();
      expect(crewQuarters.tabs).toEqual([]);
      expect(crewQuarters.crewMembers).toEqual({
        roster: [],
        applicants: [],
        training: [],
      });
    });

    test("should unsubscribe from events on cleanup", () => {
      crewQuarters.initialize();
      const initialListeners = eventBus.getListeners("crew:updated").length;

      crewQuarters.cleanup();
      const finalListeners = eventBus.getListeners("crew:updated").length;

      expect(finalListeners).toBeLessThan(initialListeners);
    });
  });

  describe("Data Management", () => {
    beforeEach(() => {
      crewQuarters.initialize();
    });

    test("should set crew data correctly", () => {
      crewQuarters.setCrewData(
        [mockCrewMember],
        [mockCrewMember2],
        [mockCrewMember3],
      );

      expect(crewQuarters.crewMembers.roster).toContain(mockCrewMember);
      expect(crewQuarters.crewMembers.applicants).toContain(mockCrewMember2);
      expect(crewQuarters.crewMembers.training).toContain(mockCrewMember3);
    });

    test("should handle empty crew data", () => {
      crewQuarters.setCrewData([], [], []);

      expect(crewQuarters.crewMembers.roster).toEqual([]);
      expect(crewQuarters.crewMembers.applicants).toEqual([]);
      expect(crewQuarters.crewMembers.training).toEqual([]);
    });

    test("should handle null crew data as empty arrays", () => {
      crewQuarters.setCrewData(null, null, null);

      expect(crewQuarters.crewMembers.roster).toEqual([]);
      expect(crewQuarters.crewMembers.applicants).toEqual([]);
      expect(crewQuarters.crewMembers.training).toEqual([]);
    });
  });

  describe("Skill Bar Creation", () => {
    beforeEach(() => {
      crewQuarters.initialize();
    });

    test("should create skill bar with correct structure", () => {
      const skillBar = crewQuarters.createSkillBar("piloting", 85);

      expect(skillBar.querySelector(".crew-card__skill-label")).not.toBeNull();
      expect(
        skillBar.querySelector(".crew-card__skill-bar-wrapper"),
      ).not.toBeNull();
      expect(skillBar.querySelector(".crew-card__skill-value")).not.toBeNull();
    });

    test("should set skill bar width correctly", () => {
      const skillBar = crewQuarters.createSkillBar("engineering", 45);
      const fill = skillBar.querySelector(".crew-card__skill-bar-fill");

      expect(fill.style.width).toBe("45%");
    });

    test("should set correct skill bar color class", () => {
      const skillBar = crewQuarters.createSkillBar("science", 60);
      const fill = skillBar.querySelector(".crew-card__skill-bar-fill");

      expect(
        fill.classList.contains("crew-card__skill-bar-fill--science"),
      ).toBe(true);
    });

    test("should display correct skill value", () => {
      const skillBar = crewQuarters.createSkillBar("medical", 30);
      const value = skillBar.querySelector(".crew-card__skill-value");

      expect(value.textContent).toBe("30");
    });
  });
});