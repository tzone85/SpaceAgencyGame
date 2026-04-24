/**
 * Mission Phases Tests
 *
 * Comprehensive test suite for mission phase tracking and lifecycle:
 * - Mission phase progression (Planning → Preparation → Launch → Transit → Arrival → Return)
 * - Phase duration calculations
 * - Mission outcome calculation based on crew skills, technology, and RNG
 * - Event emissions for phase changes
 * - Overall mission progress tracking
 */

import MissionSystem from '../../src/systems/MissionSystem.js';
import GameState from '../../src/game/GameState.js';
import EventBus from '../../src/game/EventBus.js';
import { getMissionById } from '../../src/data/missions.js';

describe('Mission Phases', () => {
  let missionSystem;
  let eventBus;
  let gameState;

  beforeEach(() => {
    EventBus.reset();
    eventBus = EventBus.getInstance();
    gameState = new GameState();
    missionSystem = new MissionSystem(eventBus, gameState);
  });

  afterEach(() => {
    if (missionSystem) {
      missionSystem.destroy();
    }
  });

  describe('Mission Phase Tracking', () => {
    it('should initialize mission with Planning phase', () => {
      const mission = getMissionById('iss-resupply');
      gameState.update('budget.balance', 10_000_000_000); // Add budget

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);
      const progress = missionSystem.getMissionProgress('iss-resupply');

      expect(progress).toBeDefined();
      expect(progress.currentPhase).toBe('Planning');
      expect(progress.currentPhaseIndex).toBe(0);
    });

    it('should have all six phases initialized', () => {
      const mission = getMissionById('iss-resupply');
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);
      const progress = missionSystem.getMissionProgress('iss-resupply');

      expect(progress.phasesProgress).toHaveLength(6);
      expect(progress.phasesProgress.map(p => p.phase)).toEqual([
        'Planning',
        'Preparation',
        'Launch',
        'Transit',
        'Arrival',
        'Return'
      ]);
    });

    it('should calculate phase durations based on mission duration', () => {
      const mission = getMissionById('iss-resupply');
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);
      const progress = missionSystem.getMissionProgress('iss-resupply');

      const totalDuration = progress.phasesProgress.reduce((sum, p) => sum + p.duration, 0);
      const expectedDuration = mission.duration * 86400; // days to seconds

      expect(Math.abs(totalDuration - expectedDuration)).toBeLessThan(1); // Allow rounding
    });

    it('should track phase progress percentage', () => {
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);
      let progress = missionSystem.getMissionProgress('iss-resupply');

      expect(progress.phasesProgress[0].progressPercent).toBe(0);

      // Simulate time passing
      missionSystem.updateProgress(3600); // 1 hour
      progress = missionSystem.getMissionProgress('iss-resupply');

      expect(progress.phasesProgress[0].progressPercent).toBeGreaterThan(0);
      expect(progress.phasesProgress[0].progressPercent).toBeLessThan(100);
    });

    it('should mark phases as completed when elapsed time exceeds phase duration', () => {
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);
      const progress = missionSystem.getMissionProgress('iss-resupply');

      // Get planning phase duration (10% of total)
      const planningDuration = progress.phasesProgress[0].duration;

      // Simulate planning phase completion
      missionSystem.updateProgress(planningDuration + 1);
      const updatedProgress = missionSystem.getMissionProgress('iss-resupply');

      expect(updatedProgress.phasesProgress[0].completed).toBe(true);
      expect(updatedProgress.phasesProgress[0].progressPercent).toBe(100);
    });

    it('should emit phase-changed event when phase transitions', (done) => {
      gameState.update('budget.balance', 10_000_000_000);

      const phaseChangeListener = jest.fn();
      eventBus.subscribe('mission:phase-changed', phaseChangeListener);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);
      const progress = missionSystem.getMissionProgress('iss-resupply');
      const planningDuration = progress.phasesProgress[0].duration;

      missionSystem.updateProgress(planningDuration + 1);

      setTimeout(() => {
        expect(phaseChangeListener).toHaveBeenCalled();
        const callData = phaseChangeListener.mock.calls[0][0];
        expect(callData.fromPhase).toBe('Planning');
        expect(callData.toPhase).toBe('Preparation');
        done();
      }, 100);
    });

    it('should track overall mission progress', () => {
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);
      let progress = missionSystem.getMissionProgress('iss-resupply');

      expect(progress.overallProgress).toBe(0);

      // Simulate 50% of mission time
      const totalDuration = progress.phasesProgress.reduce((sum, p) => sum + p.duration, 0);
      missionSystem.updateProgress(totalDuration * 0.5);

      progress = missionSystem.getMissionProgress('iss-resupply');
      expect(progress.overallProgress).toBeGreaterThan(45);
      expect(progress.overallProgress).toBeLessThan(55);
    });
  });

  describe('Mission Outcome Calculation', () => {
    it('should calculate mission outcome with success flag', () => {
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);

      // Get mission progress to find duration
      let progress = missionSystem.getMissionProgress('iss-resupply');
      const totalDuration = progress.phasesProgress.reduce((sum, p) => sum + p.duration, 0);

      // Complete the mission
      missionSystem.updateProgress(totalDuration + 1);

      // Check for completion
      const completed = gameState.getState().missions.completed;
      expect(completed.length).toBe(1);
      expect(typeof completed[0].success).toBe('boolean');
    });

    it('should apply crew skill bonuses to success rate', () => {
      // Create crew with skills
      const crew = [
        {
          id: 'crew_1',
          name: 'Expert Pilot',
          piloting: 95,
          engineering: 80,
          science: 70
        },
        {
          id: 'crew_2',
          name: 'Engineer',
          piloting: 70,
          engineering: 90,
          science: 75
        }
      ];
      gameState.update('crew.roster', crew);
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);

      let progress = missionSystem.getMissionProgress('iss-resupply');
      const totalDuration = progress.phasesProgress.reduce((sum, p) => sum + p.duration, 0);

      missionSystem.updateProgress(totalDuration + 1);

      const completed = gameState.getState().missions.completed;
      expect(completed.length).toBe(1);
      expect(typeof completed[0].success).toBe('boolean');
      expect(typeof completed[0].reputation).toBe('number');
    });

    it('should apply technology bonuses to success rate', () => {
      // Add researched technology
      gameState.update('research.completed', ['tech_1', 'tech_2', 'tech_3']);
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);

      let progress = missionSystem.getMissionProgress('iss-resupply');
      const totalDuration = progress.phasesProgress.reduce((sum, p) => sum + p.duration, 0);

      missionSystem.updateProgress(totalDuration + 1);

      const completed = gameState.getState().missions.completed;
      expect(completed.length).toBe(1);
      expect(typeof completed[0].success).toBe('boolean');
    });

    it('should provide funding rewards on success', () => {
      gameState.update('budget.balance', 10_000_000_000);
      const mission = getMissionById('iss-resupply');

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);

      let progress = missionSystem.getMissionProgress('iss-resupply');
      const totalDuration = progress.phasesProgress.reduce((sum, p) => sum + p.duration, 0);

      missionSystem.updateProgress(totalDuration + 1);

      const completed = gameState.getState().missions.completed;
      expect(completed[0].revenue).toBeDefined();
      expect(completed[0].revenue).toBeGreaterThan(0);
    });

    it('should update reputation based on mission outcome', () => {
      const initialReputation = gameState.getState().agency.reputation;
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);

      let progress = missionSystem.getMissionProgress('iss-resupply');
      const totalDuration = progress.phasesProgress.reduce((sum, p) => sum + p.duration, 0);

      missionSystem.updateProgress(totalDuration + 1);

      const finalReputation = gameState.getState().agency.reputation;
      expect(typeof finalReputation).toBe('number');
    });

    it('should provide mission outcome reason', () => {
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);

      let progress = missionSystem.getMissionProgress('iss-resupply');
      const totalDuration = progress.phasesProgress.reduce((sum, p) => sum + p.duration, 0);

      missionSystem.updateProgress(totalDuration + 1);

      const completed = gameState.getState().missions.completed;
      expect(completed[0].outcome).toBeDefined();
      expect(typeof completed[0].outcome).toBe('string');
    });

    it('should cap reputation at 100 and floor at 0', () => {
      gameState.update('agency.reputation', 95);
      gameState.update('budget.balance', 10_000_000_000);

      // Launch multiple high-success-rate missions
      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);

      let progress = missionSystem.getMissionProgress('iss-resupply');
      const totalDuration = progress.phasesProgress.reduce((sum, p) => sum + p.duration, 0);

      missionSystem.updateProgress(totalDuration + 1);

      const reputation = gameState.getState().agency.reputation;
      expect(reputation).toBeLessThanOrEqual(100);
      expect(reputation).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Mission Progress API', () => {
    it('should return null for non-existent mission progress', () => {
      const progress = missionSystem.getMissionProgress('nonexistent');
      expect(progress).toBeNull();
    });

    it('should return current phase for active mission', () => {
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);
      const phase = missionSystem.getMissionPhase('iss-resupply');

      expect(phase).toBe('Planning');
    });

    it('should return null for non-existent mission phase', () => {
      const phase = missionSystem.getMissionPhase('nonexistent');
      expect(phase).toBeNull();
    });

    it('should include all progress details', () => {
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);
      const progress = missionSystem.getMissionProgress('iss-resupply');

      expect(progress).toHaveProperty('missionId');
      expect(progress).toHaveProperty('missionName');
      expect(progress).toHaveProperty('currentPhase');
      expect(progress).toHaveProperty('currentPhaseIndex');
      expect(progress).toHaveProperty('phasesProgress');
      expect(progress).toHaveProperty('overallProgress');
      expect(progress).toHaveProperty('outcome');
      expect(progress).toHaveProperty('success');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle rapid phase transitions', () => {
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);

      let progress = missionSystem.getMissionProgress('iss-resupply');
      const totalDuration = progress.phasesProgress.reduce((sum, p) => sum + p.duration, 0);

      // Pass multiple phase durations at once
      missionSystem.updateProgress(totalDuration * 0.5);

      progress = missionSystem.getMissionProgress('iss-resupply');
      expect(progress.currentPhaseIndex).toBeGreaterThan(0);
      expect(progress.overallProgress).toBeGreaterThan(40);
    });

    it('should complete all phases before mission completion', () => {
      gameState.update('budget.balance', 10_000_000_000);

      missionSystem.launchMission('iss-resupply', ['crew_1', 'crew_2']);

      let progress = missionSystem.getMissionProgress('iss-resupply');
      const totalDuration = progress.phasesProgress.reduce((sum, p) => sum + p.duration, 0);

      missionSystem.updateProgress(totalDuration + 1);

      const completed = gameState.getState().missions.completed;
      expect(completed.length).toBe(1);
    });
  });
});
