/**
 * Tests to verify project directory structure is properly established
 */

const fs = require('fs');
const path = require('path');

describe('Project Directory Structure', () => {
  const requiredDirectories = [
    'src/js',
    'src/css',
    'tests/unit',
    'tests/browser'
  ];

  requiredDirectories.forEach((dir) => {
    test(`${dir} directory exists`, () => {
      const dirPath = path.join(__dirname, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
      
      // Verify it's actually a directory
      const stat = fs.statSync(dirPath);
      expect(stat.isDirectory()).toBe(true);
    });
  });

  test('src directory exists', () => {
    const srcPath = path.join(__dirname, 'src');
    expect(fs.existsSync(srcPath)).toBe(true);
    expect(fs.statSync(srcPath).isDirectory()).toBe(true);
  });

  test('tests directory exists', () => {
    const testsPath = path.join(__dirname, 'tests');
    expect(fs.existsSync(testsPath)).toBe(true);
    expect(fs.statSync(testsPath).isDirectory()).toBe(true);
  });

  test('all required directories are accessible', () => {
    const requiredDirs = [
      'src',
      'src/js',
      'src/css',
      'tests',
      'tests/unit',
      'tests/browser'
    ];

    requiredDirs.forEach((dir) => {
      const dirPath = path.join(__dirname, dir);
      expect(() => {
        fs.readdirSync(dirPath);
      }).not.toThrow();
    });
  });
});
