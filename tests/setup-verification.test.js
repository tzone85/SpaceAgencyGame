/**
 * Setup Verification Tests
 * Verifies that all project directories and files are properly created
 */

import fs from "fs";
import path from "path";

describe("Project Structure Verification", () => {
  const projectRoot = process.cwd();

  const requiredFiles = [
    "package.json",
    "vite.config.js",
    "jest.config.js",
    "index.html",
    "src/main.js",
    "src/core/game.js",
    "src/core/engine.js",
    "styles/main.css",
    "public/manifest.json",
    "README.md",
  ];

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

  test("should have all required directories", () => {
    requiredDirs.forEach((dir) => {
      const fullPath = path.join(projectRoot, dir);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  test("should have all required files", () => {
    requiredFiles.forEach((file) => {
      const fullPath = path.join(projectRoot, file);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  test("should have valid package.json", () => {
    const packageJsonPath = path.join(projectRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    expect(packageJson.name).toBe("stellar-command");
    expect(packageJson.type).toBe("module");
  });

  test("should have valid vite.config.js", () => {
    const viteConfigPath = path.join(projectRoot, "vite.config.js");
    expect(fs.existsSync(viteConfigPath)).toBe(true);
    const content = fs.readFileSync(viteConfigPath, "utf-8");
    expect(content).toContain("defineConfig");
    expect(content).toContain("port: 3000");
  });

  test("should have valid jest.config.js", () => {
    const jestConfigPath = path.join(projectRoot, "jest.config.js");
    expect(fs.existsSync(jestConfigPath)).toBe(true);
    const content = fs.readFileSync(jestConfigPath, "utf-8");
    expect(content).toContain("testEnvironment");
  });
});
