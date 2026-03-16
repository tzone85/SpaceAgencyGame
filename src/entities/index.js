/**
 * Entities Module
 * 
 * Placeholder for game entities like spaceships, celestial bodies, etc.
 * This module will define entity classes and entity management.
 */

export const EntityManager = class {
  constructor() {
    this.entities = [];
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  initialize() {
    console.log('Entity Manager initialized');
  }

  destroy() {
    console.log('Entity Manager destroyed');
  }
};

export default EntityManager;
