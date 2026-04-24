/**
 * Acceptance Criteria Tests for Story 01KKVMGT-s-001
 * Verifies all project setup requirements
 */

import fs from "fs";
import path from "path";

const projectRoot = path.resolve(__dirname, "..");

describe("Story 01KKVMGT-s-001 - Project Setup & Directory Structure", () => {
  describe("Acceptance Criteria 1: Package.json exists with vite and necessary dependencies", () => {
    test("should have package.json file", () => {
      const packageJsonPath = path.join(projectRoot, "package.json");
      expect(fs.existsSync(packageJsonPath)).toBe(true);
    });

    test("should have vite as devDependency", () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8"),
      );
      expect(packageJson.devDependencies).toHaveProperty("vite");
      expect(packageJson.devDependencies.vite).toMatch(/^\^/);
    });

    test("should have @types/web as devDependency (Web Audio API types)", () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8"),
      );
      expect(packageJson.devDependencies).toHaveProperty("@types/web");
    });

    test("should have jest for testing", () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8"),
      );
      expect(packageJson.devDependencies).toHaveProperty("jest");
    });

    test("should be configured as ES module", () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8"),
      );
      expect(packageJson.type).toBe("module");
    });
  });

  describe("Acceptance Criteria 2: Vite.config.js is configured for the project", () => {
    test("should have vite.config.js file", () => {
      const viteConfigPath = path.join(projectRoot, "vite.config.js");
      expect(fs.existsSync(viteConfigPath)).toBe(true);
    });

    test("should have defineConfig from vite", () => {
      const viteConfig = fs.readFileSync(
        path.join(projectRoot, "vite.config.js"),
        "utf-8",
      );
      expect(viteConfig).toContain("defineConfig");
      expect(viteConfig).toContain("import { defineConfig } from 'vite'");
    });

    test("should configure dev server on port 3000", () => {
      const viteConfig = fs.readFileSync(
        path.join(projectRoot, "vite.config.js"),
        "utf-8",
      );
      expect(viteConfig).toContain("port: 3000");
    });

    test("should have build output directory configured", () => {
      const viteConfig = fs.readFileSync(
        path.join(projectRoot, "vite.config.js"),
        "utf-8",
      );
      expect(viteConfig).toContain("outDir");
    });
  });

  describe("Acceptance Criteria 3: All directories from project structure exist", () => {
    const requiredDirs = [
      "src",
      "src/core",
      "src/entities",
      "src/systems",
      "src/scenes",
      "src/ui",
      "src/audio",
      "src/utils",
      "styles",
      "public",
      "assets",
      "assets/textures",
      "assets/models",
      "assets/audio",
      "assets/fonts",
      "assets/data",
      "tests",
      "tests/unit",
      "tests/browser",
      "docs",
      "config",
    ];

    requiredDirs.forEach((dir) => {
      test(`should have ${dir} directory`, () => {
        const fullPath = path.join(projectRoot, dir);
        expect(fs.existsSync(fullPath)).toBe(true);
        expect(fs.statSync(fullPath).isDirectory()).toBe(true);
      });
    });
  });

  describe("Acceptance Criteria 4: All files from project structure exist as empty placeholders with basic exports/comments", () => {
    const requiredFiles = [
      { path: "src/main.js", shouldContain: ["export", "Game"] },
      { path: "src/core/game.js", shouldContain: ["class Game", "export"] },
      { path: "src/core/engine.js", shouldContain: ["class Engine", "export"] },
      {
        path: "src/entities/index.js",
        shouldContain: ["export", "EntityManager"],
      },
      {
        path: "src/systems/index.js",
        shouldContain: ["export", "SystemManager"],
      },
      {
        path: "src/scenes/index.js",
        shouldContain: ["export", "SceneManager"],
      },
      { path: "src/ui/index.js", shouldContain: ["export", "UIManager"] },
      { path: "src/audio/index.js", shouldContain: ["export", "AudioManager"] },
      { path: "src/utils/index.js", shouldContain: ["export"] },
      { path: "styles/main.css", shouldContain: ["*", "html", "body"] },
      {
        path: "public/manifest.json",
        shouldContain: ["Stellar Command", "name"],
      },
      { path: "index.html", shouldContain: ["<!DOCTYPE", "src/main.js"] },
    ];

    requiredFiles.forEach(({ path: filePath, shouldContain }) => {
      test(`should have ${filePath} with proper structure`, () => {
        const fullPath = path.join(projectRoot, filePath);
        expect(fs.existsSync(fullPath)).toBe(true);

        const content = fs.readFileSync(fullPath, "utf-8");
        shouldContain.forEach((text) => {
          expect(content).toContain(text);
        });
      });
    });
  });

  describe("Acceptance Criteria 5: npm install runs successfully", () => {
    test("should have node_modules directory after npm install", () => {
      const nodeModulesPath = path.join(projectRoot, "node_modules");
      expect(fs.existsSync(nodeModulesPath)).toBe(true);
    });

    test("should have vite installed in node_modules", () => {
      const vitePath = path.join(projectRoot, "node_modules", "vite");
      expect(fs.existsSync(vitePath)).toBe(true);
    });

    test("should have jest installed in node_modules", () => {
      const jestPath = path.join(projectRoot, "node_modules", "jest");
      expect(fs.existsSync(jestPath)).toBe(true);
    });
  });

  describe("Acceptance Criteria 6: npm scripts are properly configured", () => {
    test("should have dev script configured to run vite", () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8"),
      );
      expect(packageJson.scripts.dev).toBe("vite");
    });

    test("should have build script configured", () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8"),
      );
      expect(packageJson.scripts.build).toBe("vite build");
    });

    test("should have test script configured", () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8"),
      );
      expect(packageJson.scripts.test).toContain("jest");
    });
  });
});
