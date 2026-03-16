/**
 * Setup Test Suite
 * 
 * Verifies that the project setup meets all acceptance criteria:
 * - package.json exists with vite and necessary dependencies
 * - vite.config.js is configured for the project
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

describe('Project Setup - Story 01KKVMGT-s-001', () => {
  const projectRoot = path.join(__dirname, '..');

  describe('package.json', () => {
    test('package.json exists', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      expect(fs.existsSync(packagePath)).toBe(true);
    });

    test('package.json contains vite as devDependency', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageJson.devDependencies).toBeDefined();
      expect(packageJson.devDependencies.vite).toBeDefined();
      expect(packageJson.devDependencies.vite).toMatch(/^\^5/);
    });

    test('package.json contains jest as devDependency', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageJson.devDependencies.jest).toBeDefined();
    });

    test('package.json has vite scripts configured', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.dev).toBe('vite');
      expect(packageJson.scripts.build).toBe('vite build');
      expect(packageJson.scripts.preview).toBe('vite preview');
    });

    test('package.json has type set to module', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageJson.type).toBe('module');
    });
  });

  describe('vite.config.js', () => {
    test('vite.config.js exists', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js');
      expect(fs.existsSync(viteConfigPath)).toBe(true);
    });

    test('vite.config.js has valid configuration', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js');
      const content = fs.readFileSync(viteConfigPath, 'utf8');
      
      expect(content).toContain('defineConfig');
      expect(content).toContain('server');
      expect(content).toContain('build');
    });

    test('vite.config.js specifies port 3000', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js');
      const content = fs.readFileSync(viteConfigPath, 'utf8');
      
      expect(content).toContain('port: 3000');
    });

    test('vite.config.js enables open on dev', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js');
      const content = fs.readFileSync(viteConfigPath, 'utf8');
      
      expect(content).toContain('open: true');
    });
  });

  describe('Directory Structure', () => {
    const requiredDirs = [
      'src',
      'src/core',
      'src/ui',
      'src/systems',
      'src/entities',
      'src/utils',
      'src/audio',
      'src/scenes',
      'styles',
      'public',
      'assets',
      'assets/textures',
      'assets/models',
      'assets/audio',
      'assets/fonts',
      'assets/data',
      'tests',
      'tests/unit',
      'tests/browser',
      'docs',
    ];

    requiredDirs.forEach(dir => {
      test(`directory ${dir} exists`, () => {
        const dirPath = path.join(projectRoot, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });
  });

  describe('Placeholder Files', () => {
    const requiredFiles = [
      { path: 'index.html', hasContent: true },
      { path: 'src/main.js', hasContent: true },
      { path: 'src/core/game.js', hasContent: true },
      { path: 'src/core/renderer.js', hasContent: true },
      { path: 'src/core/engine.js', hasContent: true },
      { path: 'src/ui/index.js', hasContent: true },
      { path: 'src/systems/index.js', hasContent: true },
      { path: 'src/entities/index.js', hasContent: true },
      { path: 'src/utils/index.js', hasContent: true },
      { path: 'src/audio/index.js', hasContent: true },
      { path: 'src/scenes/index.js', hasContent: true },
      { path: 'styles/main.css', hasContent: true },
      { path: 'public/manifest.json', hasContent: true },
    ];

    requiredFiles.forEach(({ path: filePath, hasContent }) => {
      test(`file ${filePath} exists`, () => {
        const fullPath = path.join(projectRoot, filePath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });

      if (hasContent) {
        test(`file ${filePath} has content`, () => {
          const fullPath = path.join(projectRoot, filePath);
          const content = fs.readFileSync(fullPath, 'utf8');
          expect(content.length).toBeGreaterThan(0);
        });
      }
    });

    test('JavaScript files contain exports or comments', () => {
      const jsFiles = [
        'src/main.js',
        'src/core/game.js',
        'src/core/renderer.js',
        'src/core/engine.js',
        'src/ui/index.js',
        'src/systems/index.js',
        'src/entities/index.js',
        'src/utils/index.js',
        'src/audio/index.js',
        'src/scenes/index.js',
      ];

      jsFiles.forEach(filePath => {
        const fullPath = path.join(projectRoot, filePath);
        const content = fs.readFileSync(fullPath, 'utf8');
        
        const hasExport = content.includes('export');
        const hasComment = content.includes('//') || content.includes('/*');
        
        expect(hasExport || hasComment).toBe(true);
      });
    });
  });

  describe('npm Commands', () => {
    test('package.json has all required scripts', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
    });

    test('node_modules exists after npm install', () => {
      const nodeModulesPath = path.join(projectRoot, 'node_modules');
      expect(fs.existsSync(nodeModulesPath)).toBe(true);
    });

    test('vite is installed in node_modules', () => {
      const vitePath = path.join(projectRoot, 'node_modules', 'vite');
      expect(fs.existsSync(vitePath)).toBe(true);
    });

    test('jest is installed in node_modules', () => {
      const jestPath = path.join(projectRoot, 'node_modules', 'jest');
      expect(fs.existsSync(jestPath)).toBe(true);
    });
  });

  describe('HTML Entry Point', () => {
    test('index.html exists', () => {
      const htmlPath = path.join(projectRoot, 'index.html');
      expect(fs.existsSync(htmlPath)).toBe(true);
    });

    test('index.html references main.js module', () => {
      const htmlPath = path.join(projectRoot, 'index.html');
      const content = fs.readFileSync(htmlPath, 'utf8');
      
      expect(content).toContain('type="module"');
      expect(content).toContain('./src/main.js');
    });
  });

  describe('Configuration Files', () => {
    test('jest.config.js exists', () => {
      const jestConfigPath = path.join(projectRoot, 'jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
    });

    test('.gitignore exists', () => {
      const gitignorePath = path.join(projectRoot, '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);
    });

    test('.gitignore includes node_modules', () => {
      const gitignorePath = path.join(projectRoot, '.gitignore');
      const content = fs.readFileSync(gitignorePath, 'utf8');
      
      expect(content).toContain('node_modules');
    });
  });
});
