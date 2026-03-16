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

    test('tests/unit directory exists', () => {
      expect(dirExists('tests/unit')).toBe(true);
    });

    test('tests/browser directory exists', () => {
      expect(dirExists('tests/browser')).toBe(true);
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

    test('src/core/renderer.js exists', () => {
      expect(fileExists('src/core/renderer.js')).toBe(true);
    });
  });

  describe('Configuration Files', () => {
    test('package.json exists', () => {
      expect(fileExists('package.json')).toBe(true);
    });

    test('vite.config.js exists', () => {
      expect(fileExists('vite.config.js')).toBe(true);
    });

    test('jest.config.js exists', () => {
      expect(fileExists('jest.config.js')).toBe(true);
    });

    test('index.html exists', () => {
      expect(fileExists('index.html')).toBe(true);
    });

    test('README.md exists', () => {
      expect(fileExists('README.md')).toBe(true);
    });

    test('.gitignore exists', () => {
      expect(fileExists('.gitignore')).toBe(true);
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
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
    });

    test('package.json includes vite dependency', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
      );
      expect(packageJson.devDependencies.vite).toBeDefined();
    });

    test('package.json includes web types', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
      );
      expect(packageJson.devDependencies['@types/web']).toBeDefined();
    });
  });

  describe('vite.config.js', () => {
    test('vite.config.js contains server configuration', () => {
      const config = fs.readFileSync(
        path.join(projectRoot, 'vite.config.js'),
        'utf8'
      );
      expect(config).toMatch(/server/);
      expect(config).toMatch(/port/);
    });
  });
});

/**
 * Test Suite: Core Module Exports
 */
describe('Core Modules', () => {
  test('Game class can be imported', async () => {
    const Game = await import(
      path.join(projectRoot, 'src/core/game.js')
    ).then((m) => m.default);
    expect(Game).toBeDefined();
    expect(typeof Game).toBe('function');
  });

  test('Engine class can be imported', async () => {
    const Engine = await import(
      path.join(projectRoot, 'src/core/engine.js')
    ).then((m) => m.default);
    expect(Engine).toBeDefined();
    expect(typeof Engine).toBe('function');
  });

  test('Renderer class can be imported', async () => {
    const Renderer = await import(
      path.join(projectRoot, 'src/core/renderer.js')
    ).then((m) => m.default);
    expect(Renderer).toBeDefined();
    expect(typeof Renderer).toBe('function');
  });

  test('Game instantiation works', async () => {
    const Game = await import(
      path.join(projectRoot, 'src/core/game.js')
    ).then((m) => m.default);
    const game = new Game();
    expect(game).toBeDefined();
    expect(game.isRunning).toBe(false);
  });

  test('Engine instantiation works', async () => {
    const Engine = await import(
      path.join(projectRoot, 'src/core/engine.js')
    ).then((m) => m.default);
    const engine = new Engine();
    expect(engine).toBeDefined();
  });

  test('Renderer instantiation works', async () => {
    const Renderer = await import(
      path.join(projectRoot, 'src/core/renderer.js')
    ).then((m) => m.default);
    const renderer = new Renderer();
    expect(renderer).toBeDefined();
    expect(renderer.isInitialized).toBe(false);
  });
});
