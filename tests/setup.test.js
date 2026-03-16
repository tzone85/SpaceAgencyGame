/**
 * Setup Verification Tests
 * Verifies that the project is properly initialized
 */

import { readFileSync } from 'fs';

describe('Project Setup', () => {
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

  test('should have package.json with required dependencies', () => {
    expect(packageJson.name).toBe('stellar-command');
    expect(packageJson.devDependencies.vite).toBeDefined();
    expect(packageJson.devDependencies['@types/web']).toBeDefined();
    expect(packageJson.devDependencies.jest).toBeDefined();
  });

  test('should have required npm scripts', () => {
    expect(packageJson.scripts.dev).toBe('vite');
    expect(packageJson.scripts.build).toBe('vite build');
    expect(packageJson.scripts.test).toMatch(/jest/);
  });

  test('should be an ES module', () => {
    expect(packageJson.type).toBe('module');
  });
});
