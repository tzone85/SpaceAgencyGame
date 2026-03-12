/**
 * Project Structure Verification Tests
 * 
 * Tests that verify all required directories and files
 * have been created as per the project scaffolding requirements.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * Helper function to check if a directory exists
 */
function dirExists(dirPath) {
  const fullPath = path.join(projectRoot, dirPath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

/**
 * Helper function to check if a file exists
 */
function fileExists(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
}

/**
 * Test Suite: Project Structure
 */
describe('Project Structure', () => {
  describe('Source Directories', () => {
    test('src directory exists', () => {
      expect(dirExists('src')).toBe(true);
    });

    test('src/core directory exists', () => {
      expect(dirExists('src/core')).toBe(true);
    });

    test('src/entities directory exists', () => {
      expect(dirExists('src/entities')).toBe(true);
    });

    test('src/systems directory exists', () => {
      expect(dirExists('src/systems')).toBe(true);
    });

    test('src/scenes directory exists', () => {
      expect(dirExists('src/scenes')).toBe(true);
    });

    test('src/ui directory exists', () => {
      expect(dirExists('src/ui')).toBe(true);
    });

    test('src/utils directory exists', () => {
      expect(dirExists('src/utils')).toBe(true);
    });

    test('src/audio directory exists', () => {
      expect(dirExists('src/audio')).toBe(true);
    });
  });

  describe('Asset Directories', () => {
    test('assets directory exists', () => {
      expect(dirExists('assets')).toBe(true);
    });

    test('assets/textures directory exists', () => {
      expect(dirExists('assets/textures')).toBe(true);
    });

    test('assets/models directory exists', () => {
      expect(dirExists('assets/models')).toBe(true);
    });

    test('assets/audio directory exists', () => {
      expect(dirExists('assets/audio')).toBe(true);
    });

    test('assets/fonts directory exists', () => {
      expect(dirExists('assets/fonts')).toBe(true);
    });

    test('assets/data directory exists', () => {
      expect(dirExists('assets/data')).toBe(true);
    });
  });

  describe('Project Directories', () => {
    test('tests directory exists', () => {
      expect(dirExists('tests')).toBe(true);
    });

    test('docs directory exists', () => {
      expect(dirExists('docs')).toBe(true);
    });

    test('config directory exists', () => {
      expect(dirExists('config')).toBe(true);
    });
  });

  describe('Placeholder Files', () => {
    test('src/main.js exists', () => {
      expect(fileExists('src/main.js')).toBe(true);
    });

    test('src/core/game.js exists', () => {
      expect(fileExists('src/core/game.js')).toBe(true);
    });

    test('src/core/engine.js exists', () => {
      expect(fileExists('src/core/engine.js')).toBe(true);
    });
  });

  describe('Configuration Files', () => {
    test('package.json exists', () => {
      expect(fileExists('package.json')).toBe(true);
    });

    test('README.md exists', () => {
      expect(fileExists('README.md')).toBe(true);
    });

    test('.gitignore exists', () => {
      expect(fileExists('.gitignore')).toBe(true);
    });

    test('webpack.config.js exists', () => {
      expect(fileExists('webpack.config.js')).toBe(true);
    });
  });
});

/**
 * Test Suite: File Contents
 */
describe('File Contents', () => {
  describe('package.json', () => {
    test('package.json contains game metadata', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
      );
      expect(packageJson.name).toBe('stellar-command');
      expect(packageJson.version).toBeDefined();
      expect(packageJson.description).toBeDefined();
      expect(packageJson.main).toBe('src/main.js');
    });

    test('package.json contains required scripts', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
      );
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
    });
  });

  describe('README.md', () => {
    test('README.md contains game concept', () => {
      const readme = fs.readFileSync(
        path.join(projectRoot, 'README.md'),
        'utf8'
      );
      expect(readme).toMatch(/Stellar Command/i);
      expect(readme).toMatch(/space agency/i);
      expect(readme).toMatch(/game/i);
    });

    test('README.md contains project structure information', () => {
      const readme = fs.readFileSync(
        path.join(projectRoot, 'README.md'),
        'utf8'
      );
      expect(readme).toMatch(/Project Structure/i);
      expect(readme).toMatch(/src\//);
      expect(readme).toMatch(/assets\//);
    });
  });

  describe('.gitignore', () => {
    test('.gitignore excludes node_modules', () => {
      const gitignore = fs.readFileSync(
        path.join(projectRoot, '.gitignore'),
        'utf8'
      );
      expect(gitignore).toMatch(/node_modules/);
    });

    test('.gitignore excludes build files', () => {
      const gitignore = fs.readFileSync(
        path.join(projectRoot, '.gitignore'),
        'utf8'
      );
      expect(gitignore).toMatch(/dist\/|build\//);
    });
  });
});

/**
 * Test Suite: Core Module Exports
 */
describe('Core Modules', () => {
  test('Game class can be imported', async () => {
    const { default: Game } = await import(
      path.join(projectRoot, 'src/core/game.js')
    );
    expect(Game).toBeDefined();
    expect(typeof Game).toBe('function');
  });

  test('Engine class can be imported', async () => {
    const { default: Engine } = await import(
      path.join(projectRoot, 'src/core/engine.js')
    );
    expect(Engine).toBeDefined();
    expect(typeof Engine).toBe('function');
  });

  test('Game instantiation works', async () => {
    const { default: Game } = await import(
      path.join(projectRoot, 'src/core/game.js')
    );
    const game = new Game();
    expect(game).toBeDefined();
    expect(game.isRunning).toBe(false);
  });

  test('Engine instantiation works', async () => {
    const { default: Engine } = await import(
      path.join(projectRoot, 'src/core/engine.js')
    );
    const engine = new Engine();
    expect(engine).toBeDefined();
    expect(engine.isInitialized).toBe(false);
  });
});
