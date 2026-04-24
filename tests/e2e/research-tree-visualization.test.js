/**
 * Story 01KPZATK-s-005: Research Tree Visualization
 *
 * Acceptance Criteria:
 * 1. ResearchLab displays visual research tree
 * 2. Shows current research progress
 * 3. Allows starting new research
 * 4. Displays tech dependencies
 *
 * This test suite validates the complete research tree visualization implementation.
 */

import ResearchLab from '../../src/scenes/ResearchLab.js';
import EventBus from '../../src/game/EventBus.js';
import { getAllResearch, getResearchById, ResearchCategories } from '../../src/data/research.js';

describe('Story 01KPZATK-s-005: Research Tree Visualization', () => {
  let researchLab;
  let eventBus;

  beforeEach(() => {
    EventBus.reset();
    eventBus = EventBus.getInstance();
    researchLab = new ResearchLab();

    // Clear any existing research lab from DOM
    const existingLab = document.getElementById('researchLab');
    if (existingLab) {
      existingLab.remove();
    }
  });

  afterEach(() => {
    researchLab.cleanup();
    EventBus.reset();
  });

  describe('Acceptance Criteria 1: ResearchLab displays visual research tree', () => {
    test('should render a visual tech tree with multiple technologies', () => {
      researchLab.initialize();

      const techTree = researchLab.techTreeContainer;
      expect(techTree).toBeDefined();
      expect(techTree).not.toBeNull();

      const nodes = techTree.querySelectorAll('.tech-node');
      expect(nodes.length).toBeGreaterThan(10); // Must have at least 10-15 technologies
    });

    test('should organize technologies in a dependency hierarchy', () => {
      researchLab.initialize();

      const allResearch = getAllResearch();
      let hasHierarchy = false;

      // Check that technologies have dependencies
      Object.entries(allResearch).forEach(([id, research]) => {
        if (research.dependencies && research.dependencies.length > 0) {
          hasHierarchy = true;
        }
      });

      expect(hasHierarchy).toBe(true);
    });

    test('should display technologies in categorized layout', () => {
      researchLab.initialize();

      const categories = researchLab.techTreeContainer.querySelectorAll('.research-category-column');
      expect(categories.length).toBe(5); // 5 categories: Propulsion, Life Support, Communications, Materials, AI

      const categoryLabels = researchLab.techTreeContainer.querySelectorAll('.category-label');
      const labels = Array.from(categoryLabels).map(label => label.textContent);

      expect(labels).toContain('Propulsion');
      expect(labels).toContain('Life Support');
      expect(labels).toContain('Communications');
      expect(labels).toContain('Materials');
      expect(labels).toContain('AI');
    });

    test('should show visual tech tree with styled nodes', () => {
      researchLab.initialize();

      const nodes = researchLab.techTreeContainer.querySelectorAll('.tech-node');
      nodes.forEach(node => {
        expect(node.classList.length).toBeGreaterThan(0); // Node should have style classes
        const hasState = node.classList.contains('node-available') ||
                         node.classList.contains('node-locked') ||
                         node.classList.contains('node-active') ||
                         node.classList.contains('node-completed');
        expect(hasState).toBe(true);
      });
    });
  });

  describe('Acceptance Criteria 2: Shows current research progress', () => {
    test('should track research progress with progress bars', () => {
      researchLab.initialize();

      const node = getResearchById('basic_rockets');
      researchLab.startResearch('basic_rockets', node);

      // Simulate progress update
      eventBus.emit('research:progress', {
        researchId: 'basic_rockets',
        progress: 50
      });

      expect(researchLab.researchProgress.get('basic_rockets')).toBe(50);
    });

    test('should display progress visually in detail panel', () => {
      researchLab.initialize();

      const node = getResearchById('basic_rockets');
      researchLab.activeResearch = 'basic_rockets';
      researchLab.researchProgress.set('basic_rockets', 75);
      researchLab.renderTechTree();

      const progressFill = researchLab.nodeElements
        .get('basic_rockets')
        .querySelector('.progress-fill');

      expect(progressFill).not.toBeNull();
      expect(progressFill.style.width).toBe('75%');
    });

    test('should show active research status in detail panel', () => {
      researchLab.initialize();

      const node = getResearchById('basic_rockets');
      researchLab.startResearch('basic_rockets', node);
      researchLab.selectNode('basic_rockets', node);

      const detailText = researchLab.detailPanel.textContent;
      expect(detailText).toContain('in Progress');
    });

    test('should update progress when research:progress event is emitted', () => {
      researchLab.initialize();

      researchLab.activeResearch = 'basic_rockets';
      researchLab.researchProgress.set('basic_rockets', 0);
      researchLab.renderTechTree();

      eventBus.emit('research:progress', {
        researchId: 'basic_rockets',
        progress: 25
      });

      expect(researchLab.researchProgress.get('basic_rockets')).toBe(25);

      eventBus.emit('research:progress', {
        researchId: 'basic_rockets',
        progress: 100
      });

      expect(researchLab.researchProgress.get('basic_rockets')).toBe(100);
    });

    test('should mark research as completed when research:completed event is emitted', () => {
      researchLab.initialize();

      researchLab.activeResearch = 'basic_rockets';
      researchLab.researchProgress.set('basic_rockets', 100);

      eventBus.emit('research:completed', {
        researchId: 'basic_rockets'
      });

      expect(researchLab.completedResearch.has('basic_rockets')).toBe(true);
      expect(researchLab.activeResearch).toBeNull();
      expect(researchLab.researchProgress.has('basic_rockets')).toBe(false);
    });
  });

  describe('Acceptance Criteria 3: Allows starting new research', () => {
    test('should display START RESEARCH button for available research', () => {
      researchLab.initialize();

      const node = getResearchById('basic_rockets');
      researchLab.selectNode('basic_rockets', node);

      const button = researchLab.detailPanel.querySelector('.research-button');
      expect(button).not.toBeNull();
      expect(button.textContent).toBe('START RESEARCH');
    });

    test('should start research when START RESEARCH button is clicked', () => {
      researchLab.initialize();
      const mockEmit = jest.spyOn(eventBus, 'emit');

      const node = researchLab.nodeElements.get('basic_rockets');
      node.click();

      const button = researchLab.detailPanel.querySelector('.research-button');
      button.click();

      expect(mockEmit).toHaveBeenCalledWith(
        'research:start',
        expect.objectContaining({
          researchId: 'basic_rockets',
          name: 'Basic Rockets'
        })
      );

      mockEmit.mockRestore();
    });

    test('should emit budget:deduct event when starting research', () => {
      researchLab.initialize();
      const mockEmit = jest.spyOn(eventBus, 'emit');

      const node = getResearchById('basic_rockets');
      researchLab.startResearch('basic_rockets', node);

      expect(mockEmit).toHaveBeenCalledWith(
        'budget:deduct',
        expect.objectContaining({
          amount: 50000, // Credit cost
          reason: expect.stringContaining('Basic Rockets')
        })
      );

      mockEmit.mockRestore();
    });

    test('should prevent starting research with unmet dependencies', () => {
      researchLab.initialize();

      const node = getResearchById('ion_drives');
      researchLab.selectNode('ion_drives', node);

      // Should show "Prerequisites Not Met", not START RESEARCH
      const detailText = researchLab.detailPanel.textContent;
      expect(detailText).toContain('Prerequisites Not Met');

      const button = researchLab.detailPanel.querySelector('.research-button');
      expect(button).toBeNull();
    });

    test('should allow starting research once dependencies are met', () => {
      researchLab.initialize();

      // Mark dependency as completed
      researchLab.setCompletedResearch(new Set(['basic_rockets']));

      const node = getResearchById('ion_drives');
      researchLab.selectNode('ion_drives', node);

      // Now should show START RESEARCH button
      const button = researchLab.detailPanel.querySelector('.research-button');
      expect(button).not.toBeNull();
      expect(button.textContent).toBe('START RESEARCH');
    });

    test('should set active research state when research is started', () => {
      researchLab.initialize();

      const node = getResearchById('basic_rockets');
      researchLab.startResearch('basic_rockets', node);

      expect(researchLab.activeResearch).toBe('basic_rockets');
      expect(researchLab.researchProgress.get('basic_rockets')).toBe(0);
    });
  });

  describe('Acceptance Criteria 4: Displays tech dependencies', () => {
    test('should show prerequisites in detail panel', () => {
      researchLab.initialize();

      const node = getResearchById('ion_drives');
      researchLab.selectNode('ion_drives', node);

      const detailText = researchLab.detailPanel.textContent;
      expect(detailText).toContain('Prerequisites');
      expect(detailText).toContain('Basic Rockets');
    });

    test('should show completion status of dependencies', () => {
      researchLab.initialize();
      researchLab.setCompletedResearch(new Set(['basic_rockets']));

      const node = getResearchById('ion_drives');
      researchLab.selectNode('ion_drives', node);

      // Should show dependency with checkmark indicating completion
      const detailText = researchLab.detailPanel.textContent;
      expect(detailText).toContain('Basic Rockets');
    });

    test('should show unlocked missions and capabilities', () => {
      researchLab.initialize();

      const node = getResearchById('basic_rockets');
      researchLab.selectNode('basic_rockets', node);

      const detailText = researchLab.detailPanel.textContent;
      expect(detailText).toContain('Unlocks');
      expect(detailText).toContain('moon_orbit');
      expect(detailText).toContain('launch_small_rockets');
    });

    test('should update available nodes based on dependency completion', () => {
      researchLab.initialize();

      // Initially ion_drives should be locked
      expect(
        researchLab.nodeElements.get('ion_drives').classList.contains('node-locked')
      ).toBe(true);

      // Complete dependency
      researchLab.setCompletedResearch(new Set(['basic_rockets']));

      // Now ion_drives should be available
      expect(
        researchLab.nodeElements.get('ion_drives').classList.contains('node-available')
      ).toBe(true);
    });

    test('should handle complex dependency chains', () => {
      researchLab.initialize();

      // Verify that plasma_drives (tier 3) depends on ion_drives (tier 2) which depends on basic_rockets (tier 1)
      const basicRocketsNode = getResearchById('basic_rockets');
      const ionDrivesNode = getResearchById('ion_drives');
      const plasmaDrivesNode = getResearchById('plasma_drives');

      expect(basicRocketsNode.dependencies.length).toBe(0);
      expect(ionDrivesNode.dependencies).toContain('basic_rockets');
      expect(plasmaDrivesNode.dependencies).toContain('ion_drives');

      // Complete first
      researchLab.setCompletedResearch(new Set(['basic_rockets']));
      expect(researchLab.getNodeState('ion_drives')).toBe('available');
      expect(researchLab.getNodeState('plasma_drives')).toBe('locked');

      // Complete second
      researchLab.setCompletedResearch(new Set(['basic_rockets', 'ion_drives']));
      expect(researchLab.getNodeState('plasma_drives')).toBe('available');
    });

    test('should show lock icon on locked nodes with unmet dependencies', () => {
      researchLab.initialize();

      const lockedNode = researchLab.nodeElements.get('ion_drives');
      const lockIcon = lockedNode.querySelector('.node-lock');

      expect(lockIcon).not.toBeNull();
      expect(lockIcon.textContent).toBe('🔒');
    });
  });

  describe('Additional Implementation Details', () => {
    test('should have 10-15+ technologies in the tree', () => {
      const allResearch = getAllResearch();
      expect(Object.keys(allResearch).length).toBeGreaterThanOrEqual(10);
    });

    test('should have organized technology categories', () => {
      const allResearch = getAllResearch();

      const categories = {};
      Object.values(allResearch).forEach(research => {
        if (!categories[research.category]) {
          categories[research.category] = 0;
        }
        categories[research.category]++;
      });

      expect(Object.keys(categories).length).toBe(5);
      expect(categories[ResearchCategories.PROPULSION]).toBeGreaterThan(0);
      expect(categories[ResearchCategories.LIFE_SUPPORT]).toBeGreaterThan(0);
      expect(categories[ResearchCategories.COMMUNICATIONS]).toBeGreaterThan(0);
      expect(categories[ResearchCategories.MATERIALS]).toBeGreaterThan(0);
      expect(categories[ResearchCategories.AI]).toBeGreaterThan(0);
    });

    test('should track technologies unlocking new missions', () => {
      const basicRockets = getResearchById('basic_rockets');
      expect(basicRockets.unlockedMissions.length).toBeGreaterThan(0);
      expect(basicRockets.unlockedMissions).toContain('moon_orbit');
    });

    test('should track technologies unlocking capabilities', () => {
      const basicRockets = getResearchById('basic_rockets');
      expect(basicRockets.unlockedCapabilities.length).toBeGreaterThan(0);
      expect(basicRockets.unlockedCapabilities).toContain('launch_small_rockets');
    });

    test('should allow node selection by clicking', () => {
      researchLab.initialize();

      const node = researchLab.nodeElements.get('basic_rockets');
      expect(() => {
        node.click();
      }).not.toThrow();

      expect(researchLab.selectedNode).toBe('basic_rockets');
    });

    test('should highlight selected nodes visually', () => {
      researchLab.initialize();

      const node = getResearchById('basic_rockets');
      researchLab.selectNode('basic_rockets', node);

      const nodeElement = researchLab.nodeElements.get('basic_rockets');
      expect(nodeElement.classList.contains('node-selected')).toBe(true);
    });
  });
});
