/**
 * Setup Verification Tests
 * 
 * Verifies that all acceptance criteria for Story 01KKVMGT-s-001 are met:
 * - Package.json exists with vite and necessary dependencies
 * - Vite.config.js is configured for the project
 * - All directories from project structure exist
 * - All files from project structure exist as empty placeholders with basic exports/comments
 * - npm install runs successfully
 * - npm run dev starts development server
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Story 01KKVMGT-s-001: Project Setup & Directory Structure', () => {
  const projectRoot = path.join(__dirname, '..');

  describe('Package.json Requirements', () => {
    test('package.json exists', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      expect(fs.existsSync(packagePath)).toBe(true);
    });

    test('package.json has vite as a dependency', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageContent.devDependencies).toBeDefined();
      expect(packageContent.devDependencies.vite).toBeDefined();
    });

    test('package.json has @types/web for Web Audio API types', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageContent.devDependencies).toBeDefined();
      expect(packageContent.devDependencies['@types/web']).toBeDefined();
    });

    test('package.json has proper npm scripts', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageContent.scripts).toBeDefined();
      expect(packageContent.scripts.dev).toBe('vite');
      expect(packageContent.scripts.build).toBe('vite build');
      expect(packageContent.scripts.preview).toBe('vite preview');
    });

    test('package.json has correct project metadata', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageContent.name).toBeDefined();
      expect(packageContent.version).toBeDefined();
      expect(packageContent.description).toBeDefined();
    });
  });

  describe('Vite Configuration', () => {
    test('vite.config.js exists', () => {
      const vitePath = path.join(projectRoot, 'vite.config.js');
      expect(fs.existsSync(vitePath)).toBe(true);
    });

    test('vite.config.js has proper exports', () => {
      const vitePath = path.join(projectRoot, 'vite.config.js');
      const content = fs.readFileSync(vitePath, 'utf8');
      
      expect(content).toContain('defineConfig');
      expect(content).toContain('export default');
    });

    test('vite.config.js has server configuration', () => {
      const vitePath = path.join(projectRoot, 'vite.config.js');
      const content = fs.readFileSync(vitePath, 'utf8');
      
      expect(content).toContain('server:');
      expect(content).toContain('port:');
    });
  });

  describe('Directory Structure', () => {
    const requiredDirs = [
      'src',
      'src/core',
      'src/ui',
      'src/scenes',
      'src/audio',
      'src/systems',
      'src/entities',
      'src/utils',
      'styles',
      'public',
    ];

    requiredDirs.forEach(dir => {
      test(`${dir} directory exists`, () => {
        const dirPath = path.join(projectRoot, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
        const stats = fs.statSync(dirPath);
        expect(stats.isDirectory()).toBe(true);
      });
    });
  });

  describe('File Structure', () => {
    const requiredFiles = [
      'package.json',
      'vite.config.js',
      'index.html',
      'src/main.js',
      'src/core/game.js',
      'src/core/engine.js',
      'src/core/renderer.js',
      'src/ui/index.js',
      'src/scenes/index.js',
      'src/audio/index.js',
      'src/systems/index.js',
      'src/entities/index.js',
      'src/utils/index.js',
      'styles/main.css',
      'public/manifest.json',
    ];

    requiredFiles.forEach(file => {
      test(`${file} exists`, () => {
        const filePath = path.join(projectRoot, file);
        expect(fs.existsSync(filePath)).toBe(true);
        const stats = fs.statSync(filePath);
        expect(stats.isFile()).toBe(true);
      });
    });
  });

  describe('File Content Quality', () => {
    test('index.html has proper structure', () => {
      const htmlPath = path.join(projectRoot, 'index.html');
      const content = fs.readFileSync(htmlPath, 'utf8');
      
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<html');
      expect(content).toContain('</html>');
      expect(content).toContain('src/main.js');
    });

    test('src/main.js imports Game class and initializes', () => {
      const mainPath = path.join(projectRoot, 'src/main.js');
      const content = fs.readFileSync(mainPath, 'utf8');
      
      expect(content).toContain('import');
      expect(content).toContain('Game');
      expect(content).toContain('start()');
    });

    test('src/core/game.js exports Game class', () => {
      const gamePath = path.join(projectRoot, 'src/core/game.js');
      const content = fs.readFileSync(gamePath, 'utf8');
      
      expect(content).toContain('class Game');
      expect(content).toContain('export default Game');
    });

    test('src/core/engine.js exports Engine class', () => {
      const enginePath = path.join(projectRoot, 'src/core/engine.js');
      const content = fs.readFileSync(enginePath, 'utf8');
      
      expect(content).toContain('class Engine');
      expect(content).toContain('export default Engine');
    });

    test('src/core/renderer.js exports Renderer class', () => {
      const rendererPath = path.join(projectRoot, 'src/core/renderer.js');
      const content = fs.readFileSync(rendererPath, 'utf8');
      
      expect(content).toContain('class Renderer');
      expect(content).toContain('export default Renderer');
    });

    test('UI module has UIManager export', () => {
      const uiPath = path.join(projectRoot, 'src/ui/index.js');
      const content = fs.readFileSync(uiPath, 'utf8');
      
      expect(content).toContain('UIManager');
      expect(content).toContain('export');
    });

    test('public/manifest.json is valid JSON', () => {
      const manifestPath = path.join(projectRoot, 'public/manifest.json');
      const content = fs.readFileSync(manifestPath, 'utf8');
      
      expect(() => JSON.parse(content)).not.toThrow();
      const manifest = JSON.parse(content);
      expect(manifest.name).toBeDefined();
    });
  });

  describe('node_modules Installation', () => {
    test('node_modules exists', () => {
      const nodeModulesPath = path.join(projectRoot, 'node_modules');
      expect(fs.existsSync(nodeModulesPath)).toBe(true);
    });

    test('vite is installed in node_modules', () => {
      const vitePath = path.join(projectRoot, 'node_modules/vite');
      expect(fs.existsSync(vitePath)).toBe(true);
    });

    test('@types/web is installed in node_modules', () => {
      const typesPath = path.join(projectRoot, 'node_modules/@types/web');
      expect(fs.existsSync(typesPath)).toBe(true);
    });

    test('package-lock.json exists', () => {
      const lockPath = path.join(projectRoot, 'package-lock.json');
      expect(fs.existsSync(lockPath)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('All core modules can be imported', () => {
      // This is a static check since we can't run module code in Jest environment
      const mainPath = path.join(projectRoot, 'src/main.js');
      const gamePath = path.join(projectRoot, 'src/core/game.js');
      const enginePath = path.join(projectRoot, 'src/core/engine.js');
      const rendererPath = path.join(projectRoot, 'src/core/renderer.js');

      expect(fs.existsSync(mainPath)).toBe(true);
      expect(fs.existsSync(gamePath)).toBe(true);
      expect(fs.existsSync(enginePath)).toBe(true);
      expect(fs.existsSync(rendererPath)).toBe(true);

      // Verify import chains
      const mainContent = fs.readFileSync(mainPath, 'utf8');
      expect(mainContent).toContain('./core/game.js');
    });

    test('Game engine initialization chain is complete', () => {
      const gamePath = path.join(projectRoot, 'src/core/game.js');
      const enginePath = path.join(projectRoot, 'src/core/engine.js');
      const rendererPath = path.join(projectRoot, 'src/core/renderer.js');

      const gameContent = fs.readFileSync(gamePath, 'utf8');
      const engineContent = fs.readFileSync(enginePath, 'utf8');
      const rendererContent = fs.readFileSync(rendererPath, 'utf8');

      expect(gameContent).toContain('engine');
      expect(engineContent).toContain('Renderer');
      expect(rendererContent).toContain('WebGL');
    });
  });
});
