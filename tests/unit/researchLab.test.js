import ResearchLab from "../../src/scenes/ResearchLab.js";
import EventBus from "../../src/game/EventBus.js";
import { getResearchById } from "../../src/data/research.js";

/**
 * ResearchLab Scene Tests
 *
 * Comprehensive test suite for ResearchLab with:
 * - Scene initialization and cleanup
 * - Tech tree rendering with categorized nodes
 * - Node state visualization (completed, available, locked, active)
 * - Detail panel display and interactions
 * - Research initiation and event emission
 * - Event listener handling
 */

describe("ResearchLab Scene", () => {
  let researchLab;
  let eventBus;

  beforeEach(() => {
    EventBus.reset();
    eventBus = EventBus.getInstance();
    researchLab = new ResearchLab();

    // Clear any existing research lab from DOM
    const existingLab = document.getElementById("researchLab");
    if (existingLab) {
      existingLab.remove();
    }
  });

  afterEach(() => {
    researchLab.cleanup();
    EventBus.reset();
  });

  describe("Initialization", () => {
    test("should initialize with empty state", () => {
      expect(researchLab.sceneElement).toBeNull();
      expect(researchLab.techTreeContainer).toBeNull();
      expect(researchLab.detailPanel).toBeNull();
      expect(researchLab.completedResearch.size).toBe(0);
      expect(researchLab.activeResearch).toBeNull();
      expect(researchLab.selectedNode).toBeNull();
    });

    test("should create scene UI when initialized", () => {
      researchLab.initialize();

      expect(researchLab.sceneElement).not.toBeNull();
      expect(researchLab.sceneElement.id).toBe("researchLab");
      expect(researchLab.sceneElement.className).toBe("research-lab-scene");
    });

    test("should add scene element to DOM", () => {
      researchLab.initialize();

      const sceneInDOM = document.getElementById("researchLab");
      expect(sceneInDOM).not.toBeNull();
      expect(sceneInDOM).toBe(researchLab.sceneElement);
    });

    test("should create header with title", () => {
      researchLab.initialize();

      const header = researchLab.sceneElement.querySelector(".research-header");
      expect(header).not.toBeNull();
      expect(header.querySelector("h1").textContent).toBe("RESEARCH LAB");
    });

    test("should create tech tree container", () => {
      researchLab.initialize();

      expect(researchLab.techTreeContainer).not.toBeNull();
      expect(researchLab.techTreeContainer.className).toBe(
        "tech-tree-container",
      );
    });

    test("should create detail panel", () => {
      researchLab.initialize();

      expect(researchLab.detailPanel).not.toBeNull();
      expect(researchLab.detailPanel.className).toBe("research-detail-panel");
    });
  });

  describe("Tech Tree Rendering", () => {
    test("should render all 5 categories", () => {
      researchLab.initialize();

      const columns = researchLab.techTreeContainer.querySelectorAll(
        ".research-category-column",
      );
      expect(columns.length).toBe(5);
    });

    test("should render category labels", () => {
      researchLab.initialize();

      const labels =
        researchLab.techTreeContainer.querySelectorAll(".category-label");
      expect(labels.length).toBe(5);
      expect(labels[0].textContent).toBe("Propulsion");
      expect(labels[1].textContent).toBe("Life Support");
      expect(labels[2].textContent).toBe("Communications");
      expect(labels[3].textContent).toBe("Materials");
      expect(labels[4].textContent).toBe("AI");
    });

    test("should create tech nodes for all research", () => {
      researchLab.initialize();

      const nodes =
        researchLab.techTreeContainer.querySelectorAll(".tech-node");
      expect(nodes.length).toBeGreaterThan(20); // At least 5 per category
    });

    test("should organize nodes by category", () => {
      researchLab.initialize();

      const propulsionColumn = researchLab.techTreeContainer.querySelector(
        ".research-category-column",
      );
      const propulsionNodes = propulsionColumn.querySelectorAll(".tech-node");
      expect(propulsionNodes.length).toBe(5); // Basic rockets, ion drives, plasma drives, warp drive, exotic propulsion
    });

    test("should organize nodes by tier within category", () => {
      researchLab.initialize();

      const firstColumn = researchLab.techTreeContainer.querySelector(
        ".research-category-column",
      );
      const nodes = firstColumn.querySelectorAll(".tech-node");
      const tiers = Array.from(nodes).map((node) => {
        const researchId = node.dataset.researchId;
        const research = getResearchById(researchId);
        return research.tier;
      });

      // Should be in ascending tier order
      for (let i = 0; i < tiers.length - 1; i++) {
        expect(tiers[i]).toBeLessThanOrEqual(tiers[i + 1]);
      }
    });
  });

  describe("Node State Management", () => {
    test("should identify available nodes (no dependencies)", () => {
      researchLab.initialize();

      const basicRocketsNode = researchLab.nodeElements.get("basic_rockets");
      expect(basicRocketsNode.classList.contains("node-available")).toBe(true);
    });

    test("should identify locked nodes (unmet dependencies)", () => {
      researchLab.initialize();

      const ionDrivesNode = researchLab.nodeElements.get("ion_drives");
      expect(ionDrivesNode.classList.contains("node-locked")).toBe(true);
    });

    test("should identify completed nodes", () => {
      researchLab.initialize();
      researchLab.setCompletedResearch(new Set(["basic_rockets"]));

      const basicRocketsNode = researchLab.nodeElements.get("basic_rockets");
      expect(basicRocketsNode.classList.contains("node-completed")).toBe(true);
    });

    test("should identify active nodes", () => {
      researchLab.initialize();
      researchLab.activeResearch = "basic_rockets";
      researchLab.renderTechTree();

      const basicRocketsNode = researchLab.nodeElements.get("basic_rockets");
      expect(basicRocketsNode.classList.contains("node-active")).toBe(true);
    });

    test("should show checkmark on completed nodes", () => {
      researchLab.initialize();
      researchLab.setCompletedResearch(new Set(["basic_rockets"]));

      const basicRocketsNode = researchLab.nodeElements.get("basic_rockets");
      const checkmark = basicRocketsNode.querySelector(".node-checkmark");
      expect(checkmark).not.toBeNull();
      expect(checkmark.textContent).toBe("✓");
    });

    test("should show lock icon on locked nodes", () => {
      researchLab.initialize();

      const ionDrivesNode = researchLab.nodeElements.get("ion_drives");
      const lockIcon = ionDrivesNode.querySelector(".node-lock");
      expect(lockIcon).not.toBeNull();
      expect(lockIcon.textContent).toBe("🔒");
    });

    test("should show progress bar on active nodes", () => {
      researchLab.initialize();
      researchLab.activeResearch = "basic_rockets";
      researchLab.researchProgress.set("basic_rockets", 50);
      researchLab.renderTechTree();

      const basicRocketsNode = researchLab.nodeElements.get("basic_rockets");
      const progressBar = basicRocketsNode.querySelector(".node-progress-bar");
      const progressFill = progressBar.querySelector(".progress-fill");
      expect(progressBar).not.toBeNull();
      expect(progressFill.style.width).toBe("50%");
    });
  });

  describe("Node Selection and Detail Panel", () => {
    test("should display initial detail panel message", () => {
      researchLab.initialize();

      const detailContent =
        researchLab.detailPanel.querySelector(".detail-content");
      expect(detailContent).not.toBeNull();
      expect(detailContent.querySelector("h2").textContent).toBe(
        "Select a Research",
      );
    });

    test("should update detail panel when node is selected", () => {
      researchLab.initialize();

      const basicRocketsNode = researchLab.nodeElements.get("basic_rockets");
      basicRocketsNode.click();

      const detailContent =
        researchLab.detailPanel.querySelector(".detail-content");
      const title = detailContent.querySelector("h2");
      expect(title.textContent).toBe("Basic Rockets");
    });

    test("should show research details in panel", () => {
      researchLab.initialize();
      const node = getResearchById("basic_rockets");
      researchLab.selectNode("basic_rockets", node);

      const detailText = researchLab.detailPanel.textContent;
      expect(detailText).toContain("Basic Rockets");
      expect(detailText).toContain("Propulsion");
      expect(detailText).toContain("Tier 1");
      expect(detailText).toContain(
        "Develop fundamental rocket propulsion technology",
      );
      expect(detailText).toContain("100"); // science cost
      expect(detailText).toContain("50000"); // credits cost
      expect(detailText).toContain("10"); // duration
    });

    test("should show prerequisites in detail panel", () => {
      researchLab.initialize();
      researchLab.setCompletedResearch(new Set(["basic_rockets"]));
      const node = getResearchById("ion_drives");
      researchLab.selectNode("ion_drives", node);

      const detailText = researchLab.detailPanel.textContent;
      expect(detailText).toContain("Prerequisites");
      expect(detailText).toContain("Basic Rockets");
    });

    test("should show unlocks in detail panel", () => {
      researchLab.initialize();
      const node = getResearchById("basic_rockets");
      researchLab.selectNode("basic_rockets", node);

      const detailText = researchLab.detailPanel.textContent;
      expect(detailText).toContain("Unlocks");
      expect(detailText).toContain("moon_orbit");
      expect(detailText).toContain("launch_small_rockets");
    });

    test("should show START RESEARCH button for available nodes", () => {
      researchLab.initialize();
      const node = getResearchById("basic_rockets");
      researchLab.selectNode("basic_rockets", node);

      const button = researchLab.detailPanel.querySelector(".research-button");
      expect(button).not.toBeNull();
      expect(button.textContent).toBe("START RESEARCH");
    });

    test("should not show START RESEARCH button for completed nodes", () => {
      researchLab.initialize();
      researchLab.setCompletedResearch(new Set(["basic_rockets"]));
      const node = getResearchById("basic_rockets");
      researchLab.selectNode("basic_rockets", node);

      const button = researchLab.detailPanel.querySelector(".research-button");
      expect(button).toBeNull();
      expect(researchLab.detailPanel.textContent).toContain(
        "Research Completed",
      );
    });

    test("should not show START RESEARCH button for locked nodes", () => {
      researchLab.initialize();
      const node = getResearchById("ion_drives");
      researchLab.selectNode("ion_drives", node);

      const button = researchLab.detailPanel.querySelector(".research-button");
      expect(button).toBeNull();
      expect(researchLab.detailPanel.textContent).toContain(
        "Prerequisites Not Met",
      );
    });

    test("should highlight selected node", () => {
      researchLab.initialize();
      const node = getResearchById("basic_rockets");
      researchLab.selectNode("basic_rockets", node);

      const selectedNode = researchLab.nodeElements.get("basic_rockets");
      expect(selectedNode.classList.contains("node-selected")).toBe(true);
    });

    test("should remove previous selection when selecting new node", () => {
      researchLab.initialize();
      const basicRocketsNode = getResearchById("basic_rockets");
      const basicAutomationNode = getResearchById("basic_automation");

      researchLab.selectNode("basic_rockets", basicRocketsNode);
      expect(
        researchLab.nodeElements
          .get("basic_rockets")
          .classList.contains("node-selected"),
      ).toBe(true);

      researchLab.selectNode("basic_automation", basicAutomationNode);
      expect(
        researchLab.nodeElements
          .get("basic_rockets")
          .classList.contains("node-selected"),
      ).toBe(false);
      expect(
        researchLab.nodeElements
          .get("basic_automation")
          .classList.contains("node-selected"),
      ).toBe(true);
    });
  });

  describe("Research Initiation", () => {
    test("should emit budget:deduct event when starting research", () => {
      researchLab.initialize();
      const mockEmit = jest.spyOn(eventBus, "emit");

      const node = getResearchById("basic_rockets");
      researchLab.startResearch("basic_rockets", node);

      expect(mockEmit).toHaveBeenCalledWith(
        "budget:deduct",
        expect.objectContaining({
          amount: 50000,
          reason: "Research: Basic Rockets",
        }),
      );

      mockEmit.mockRestore();
    });

    test("should emit research:start event when starting research", () => {
      researchLab.initialize();
      const mockEmit = jest.spyOn(eventBus, "emit");

      const node = getResearchById("basic_rockets");
      researchLab.startResearch("basic_rockets", node);

      expect(mockEmit).toHaveBeenCalledWith(
        "research:start",
        expect.objectContaining({
          researchId: "basic_rockets",
          name: "Basic Rockets",
          costs: { science: 100, credits: 50000 },
          duration: 10,
        }),
      );

      mockEmit.mockRestore();
    });

    test("should set active research when starting", () => {
      researchLab.initialize();

      const node = getResearchById("basic_rockets");
      researchLab.startResearch("basic_rockets", node);

      expect(researchLab.activeResearch).toBe("basic_rockets");
    });

    test("should initialize progress to 0 when starting research", () => {
      researchLab.initialize();

      const node = getResearchById("basic_rockets");
      researchLab.startResearch("basic_rockets", node);

      expect(researchLab.researchProgress.get("basic_rockets")).toBe(0);
    });

    test("should update node state after starting research", () => {
      researchLab.initialize();

      const node = getResearchById("basic_rockets");
      researchLab.startResearch("basic_rockets", node);

      const nodeElement = researchLab.nodeElements.get("basic_rockets");
      expect(nodeElement.classList.contains("node-active")).toBe(true);
    });
  });

  describe("Event Handling", () => {
    test("should listen for research:started event", () => {
      researchLab.initialize();

      eventBus.emit("research:started", {
        researchId: "basic_rockets",
      });

      expect(researchLab.activeResearch).toBe("basic_rockets");
      expect(researchLab.researchProgress.get("basic_rockets")).toBe(0);
    });

    test("should update progress when research:progress event is received", () => {
      researchLab.initialize();
      researchLab.activeResearch = "basic_rockets";
      researchLab.renderTechTree();

      eventBus.emit("research:progress", {
        researchId: "basic_rockets",
        progress: 50,
      });

      expect(researchLab.researchProgress.get("basic_rockets")).toBe(50);
      const progressFill = researchLab.nodeElements
        .get("basic_rockets")
        .querySelector(".progress-fill");
      expect(progressFill.style.width).toBe("50%");
    });

    test("should complete research when research:completed event is received", () => {
      researchLab.initialize();
      researchLab.activeResearch = "basic_rockets";
      researchLab.renderTechTree();

      eventBus.emit("research:completed", {
        researchId: "basic_rockets",
      });

      expect(researchLab.completedResearch.has("basic_rockets")).toBe(true);
      expect(researchLab.activeResearch).toBeNull();
      expect(researchLab.researchProgress.has("basic_rockets")).toBe(false);
      const nodeElement = researchLab.nodeElements.get("basic_rockets");
      expect(nodeElement.classList.contains("node-completed")).toBe(true);
    });

    test("should update detail panel when research completes while selected", () => {
      researchLab.initialize();
      const node = getResearchById("basic_rockets");
      researchLab.selectNode("basic_rockets", node);

      eventBus.emit("research:completed", {
        researchId: "basic_rockets",
      });

      expect(researchLab.detailPanel.textContent).toContain(
        "Research Completed",
      );
    });

    test("should handle budget:updated event", () => {
      researchLab.initialize();
      const node = getResearchById("basic_rockets");
      researchLab.selectNode("basic_rockets", node);

      eventBus.emit("budget:updated", {
        balance: 450000,
      });

      // Should still show the same detail without error
      expect(researchLab.detailPanel.textContent).toContain("Basic Rockets");
    });

    test("should make locked nodes available when dependencies are met", () => {
      researchLab.initialize();

      expect(
        researchLab.nodeElements
          .get("ion_drives")
          .classList.contains("node-locked"),
      ).toBe(true);

      // Complete the dependency
      researchLab.setCompletedResearch(new Set(["basic_rockets"]));

      expect(
        researchLab.nodeElements
          .get("ion_drives")
          .classList.contains("node-available"),
      ).toBe(true);
    });
  });

  describe("Completed Research Management", () => {
    test("should set completed research", () => {
      researchLab.initialize();

      const completed = new Set(["basic_rockets", "radio_communication"]);
      researchLab.setCompletedResearch(completed);

      expect(researchLab.completedResearch.has("basic_rockets")).toBe(true);
      expect(researchLab.completedResearch.has("radio_communication")).toBe(
        true,
      );
    });

    test("should get completed research", () => {
      researchLab.initialize();

      const completed = new Set(["basic_rockets", "radio_communication"]);
      researchLab.setCompletedResearch(completed);

      const retrieved = researchLab.getCompletedResearch();
      expect(retrieved.size).toBe(2);
      expect(retrieved.has("basic_rockets")).toBe(true);
      expect(retrieved.has("radio_communication")).toBe(true);
    });

    test("should render completed nodes with appropriate styling", () => {
      researchLab.initialize();

      const completed = new Set(["basic_rockets"]);
      researchLab.setCompletedResearch(completed);

      const nodeElement = researchLab.nodeElements.get("basic_rockets");
      expect(nodeElement.classList.contains("node-completed")).toBe(true);
      expect(nodeElement.querySelector(".node-checkmark")).not.toBeNull();
    });
  });

  describe("Lifecycle Methods", () => {
    test("should have update method that does not throw", () => {
      researchLab.initialize();
      expect(() => {
        researchLab.update(0.016); // 60 FPS delta time
      }).not.toThrow();
    });

    test("should have render method that does not throw", () => {
      researchLab.initialize();
      const mockRenderer = {};
      expect(() => {
        researchLab.render(mockRenderer);
      }).not.toThrow();
    });

    test("should remove scene from DOM on cleanup", () => {
      researchLab.initialize();
      expect(document.getElementById("researchLab")).not.toBeNull();

      researchLab.cleanup();
      expect(document.getElementById("researchLab")).toBeNull();
    });

    test("should unsubscribe from all events on cleanup", () => {
      researchLab.initialize();
      const mockUnsubscribe = jest.spyOn(eventBus, "unsubscribe");

      researchLab.cleanup();

      expect(mockUnsubscribe).toHaveBeenCalledWith(
        "research:started",
        researchLab.handleResearchStarted,
        researchLab,
      );
      expect(mockUnsubscribe).toHaveBeenCalledWith(
        "research:progress",
        researchLab.handleResearchProgress,
        researchLab,
      );
      expect(mockUnsubscribe).toHaveBeenCalledWith(
        "research:completed",
        researchLab.handleResearchCompleted,
        researchLab,
      );
      expect(mockUnsubscribe).toHaveBeenCalledWith(
        "budget:updated",
        researchLab.handleBudgetUpdated,
        researchLab,
      );

      mockUnsubscribe.mockRestore();
    });

    test("should reset all references on cleanup", () => {
      researchLab.initialize();
      researchLab.selectNode("basic_rockets", getResearchById("basic_rockets"));

      researchLab.cleanup();

      expect(researchLab.sceneElement).toBeNull();
      expect(researchLab.techTreeContainer).toBeNull();
      expect(researchLab.detailPanel).toBeNull();
      expect(researchLab.nodeElements.size).toBe(0);
      expect(researchLab.selectedNode).toBeNull();
      expect(researchLab.completedResearch.size).toBe(0);
      expect(researchLab.activeResearch).toBeNull();
      expect(researchLab.researchProgress.size).toBe(0);
    });
  });

  describe("Node Interactions", () => {
    test("should select node when clicked", () => {
      researchLab.initialize();
      const node = researchLab.nodeElements.get("basic_rockets");

      node.click();

      expect(researchLab.selectedNode).toBe("basic_rockets");
      expect(researchLab.detailPanel.textContent).toContain("Basic Rockets");
    });

    test("should start research when START RESEARCH button is clicked", () => {
      researchLab.initialize();
      const mockEmit = jest.spyOn(eventBus, "emit");

      const node = researchLab.nodeElements.get("basic_rockets");
      node.click();

      const button = researchLab.detailPanel.querySelector(".research-button");
      button.click();

      expect(mockEmit).toHaveBeenCalledWith(
        "budget:deduct",
        expect.any(Object),
      );
      expect(mockEmit).toHaveBeenCalledWith(
        "research:start",
        expect.any(Object),
      );

      mockEmit.mockRestore();
    });

    test("should allow clicking on locked nodes to view prerequisites", () => {
      researchLab.initialize();
      const node = researchLab.nodeElements.get("ion_drives");

      expect(() => {
        node.click();
      }).not.toThrow();

      expect(researchLab.selectedNode).toBe("ion_drives");
      expect(researchLab.detailPanel.textContent).toContain(
        "Ion Drive Systems",
      );
      expect(researchLab.detailPanel.textContent).toContain(
        "Prerequisites Not Met",
      );
    });

    test("should allow clicking on completed nodes to view details", () => {
      researchLab.initialize();
      researchLab.setCompletedResearch(new Set(["basic_rockets"]));

      const node = researchLab.nodeElements.get("basic_rockets");
      expect(() => {
        node.click();
      }).not.toThrow();

      expect(researchLab.selectedNode).toBe("basic_rockets");
      expect(researchLab.detailPanel.textContent).toContain(
        "Research Completed",
      );
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty completed research set", () => {
      researchLab.initialize();
      researchLab.setCompletedResearch(new Set());

      expect(researchLab.completedResearch.size).toBe(0);
      expect(() => {
        researchLab.renderTechTree();
      }).not.toThrow();
    });

    test("should handle research:progress with missing researchId", () => {
      researchLab.initialize();

      expect(() => {
        eventBus.emit("research:progress", {
          progress: 50,
        });
      }).not.toThrow();
    });

    test("should handle research:completed with missing researchId", () => {
      researchLab.initialize();

      expect(() => {
        eventBus.emit("research:completed", {});
      }).not.toThrow();
    });

    test("should handle cleanup when scene not initialized", () => {
      expect(() => {
        researchLab.cleanup();
      }).not.toThrow();
    });

    test("should handle multiple initialization calls", () => {
      expect(() => {
        researchLab.initialize();
        researchLab.initialize();
      }).not.toThrow();
    });

    test("should handle selecting valid node after multiple operations", () => {
      researchLab.initialize();
      researchLab.setCompletedResearch(new Set(["basic_rockets"]));

      expect(() => {
        const node = getResearchById("ion_drives");
        researchLab.selectNode("ion_drives", node);
      }).not.toThrow();

      expect(researchLab.selectedNode).toBe("ion_drives");
    });
  });

  describe("DOM Structure Validation", () => {
    test("should have all required DOM elements after initialization", () => {
      researchLab.initialize();

      expect(researchLab.sceneElement).not.toBeNull();
      expect(researchLab.techTreeContainer).not.toBeNull();
      expect(researchLab.detailPanel).not.toBeNull();
      expect(
        researchLab.sceneElement.querySelector(".research-header"),
      ).not.toBeNull();
      expect(
        researchLab.sceneElement.querySelector(".research-main-container"),
      ).not.toBeNull();
    });

    test("should have node names in all tech nodes", () => {
      researchLab.initialize();

      const nodes =
        researchLab.techTreeContainer.querySelectorAll(".tech-node");
      nodes.forEach((node) => {
        const nodeName = node.querySelector(".node-name");
        expect(nodeName).not.toBeNull();
        expect(nodeName.textContent.trim().length).toBeGreaterThan(0);
      });
    });

    test("should maintain node element references in map", () => {
      researchLab.initialize();

      expect(researchLab.nodeElements.size).toBeGreaterThan(0);
      researchLab.nodeElements.forEach((element, id) => {
        expect(element.dataset.researchId).toBe(id);
      });
    });

    test("should properly link node elements to research data", () => {
      researchLab.initialize();

      researchLab.nodeElements.forEach((element, id) => {
        const research = getResearchById(id);
        expect(research).not.toBeNull();
        expect(element.textContent).toContain(research.name);
      });
    });
  });

  describe("Legacy Tests", () => {
    test('should create a research lab instance', () => {
      expect(researchLab).toBeDefined();
      expect(researchLab.name).toBe('ResearchLab');
    });

    test('should initialize research lab', () => {
      expect(() => researchLab.init()).not.toThrow();
    });

    test('should update research lab', () => {
      expect(() => researchLab.update()).not.toThrow();
    });

    test('should render research lab', () => {
      expect(() => researchLab.render()).not.toThrow();
    });

    test('should destroy research lab', () => {
      expect(() => researchLab.destroy()).not.toThrow();
    });
  });
});