const fs = require("fs");
const path = require("path");

describe("HTML Structure and Font Loading", () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.join(__dirname, "../index.html");
    htmlContent = fs.readFileSync(htmlPath, "utf-8");
  });

  describe("DOCTYPE and Meta Tags", () => {
    test("should have proper DOCTYPE", () => {
      expect(htmlContent).toMatch(/^<!DOCTYPE html>/i);
    });

    test("should have meta charset UTF-8", () => {
      expect(htmlContent).toMatch(/<meta charset="UTF-8">/);
    });

    test("should have meta viewport for responsive design", () => {
      expect(htmlContent).toMatch(
        /<meta name="viewport" content="width=device-width, initial-scale=1\.0">/,
      );
    });

    test("should have correct title", () => {
      expect(htmlContent).toMatch(
        /<title>Stellar Command - Space Agency Management Game<\/title>/,
      );
    });

    test("should have meta description", () => {
      expect(htmlContent).toMatch(/<meta name="description"/);
    });

    test("should have theme-color meta tag", () => {
      expect(htmlContent).toMatch(
        /<meta name="theme-color" content="#000000">/,
      );
    });
  });

  describe("Canvas Element", () => {
    test("should have canvas element with starfield ID", () => {
      expect(htmlContent).toMatch(/<canvas id="starfield"><\/canvas>/);
    });

    test("should have canvas positioned as block", () => {
      expect(htmlContent).toMatch(
        /canvas#starfield\s*{[\s\S]*display:\s*block/,
      );
    });
  });

  describe("Game Container", () => {
    test("should have main game container div", () => {
      expect(htmlContent).toMatch(/<div id="game-container">/);
    });

    test("canvas should be inside game container", () => {
      expect(htmlContent).toMatch(
        /<div id="game-container">[\s\S]*<canvas id="starfield"><\/canvas>[\s\S]*<\/div>/,
      );
    });
  });

  describe("Font Loading", () => {
    test("should have font preload for orbitron-bold", () => {
      expect(htmlContent).toMatch(
        /<link rel="preload" href="\/fonts\/orbitron-bold\.woff2"/,
      );
    });

    test("should have font preload for orbitron-regular", () => {
      expect(htmlContent).toMatch(
        /<link rel="preload" href="\/fonts\/orbitron-regular\.woff2"/,
      );
    });

    test("should have font preload for roboto-mono-regular", () => {
      expect(htmlContent).toMatch(
        /<link rel="preload" href="\/fonts\/roboto-mono-regular\.woff2"/,
      );
    });

    test("should have @font-face declarations for Orbitron bold", () => {
      expect(htmlContent).toMatch(
        /@font-face\s*{[\s\S]*font-family:\s*'Orbitron'[\s\S]*font-weight:\s*700[\s\S]*}/,
      );
    });

    test("should have @font-face declarations for Orbitron regular", () => {
      expect(htmlContent).toMatch(
        /@font-face\s*{[\s\S]*font-family:\s*'Orbitron'[\s\S]*font-weight:\s*400[\s\S]*}/,
      );
    });

    test("should have @font-face declarations for Roboto Mono", () => {
      expect(htmlContent).toMatch(
        /@font-face\s*{[\s\S]*font-family:\s*'Roboto Mono'[\s\S]*}/,
      );
    });

    test("fonts should use woff2 format", () => {
      expect(htmlContent).toMatch(/format\('woff2'\)/);
    });

    test("fonts should use font-display swap for performance", () => {
      expect(htmlContent).toMatch(/font-display:\s*swap/);
    });

    test("preload links should have crossorigin attribute", () => {
      const preloadCount = (
        htmlContent.match(/<link rel="preload"[^>]*\/fonts\/[^>]*>/g) || []
      ).length;
      const crossoriginCount = (
        htmlContent.match(
          /<link rel="preload"[^>]*\/fonts\/[^>]*crossorigin[^>]*>/g,
        ) || []
      ).length;
      expect(crossoriginCount).toBe(preloadCount);
    });
  });

  describe("Favicon", () => {
    test("should have SVG favicon link", () => {
      expect(htmlContent).toMatch(
        /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg">/,
      );
    });

    test("should have PNG favicon link", () => {
      expect(htmlContent).toMatch(
        /<link rel="icon" type="image\/png" href="\/favicon\.png">/,
      );
    });

    test("should have apple-touch-icon link", () => {
      expect(htmlContent).toMatch(
        /<link rel="apple-touch-icon" href="\/favicon\.png">/,
      );
    });
  });

  describe("File System", () => {
    test("public/fonts directory should exist", () => {
      const fontsDir = path.join(__dirname, "../public/fonts");
      expect(fs.existsSync(fontsDir)).toBe(true);
    });

    test("favicon.svg should exist", () => {
      const faviconPath = path.join(__dirname, "../favicon.svg");
      expect(fs.existsSync(faviconPath)).toBe(true);
    });

    test("favicon.png should exist", () => {
      const faviconPath = path.join(__dirname, "../favicon.png");
      expect(fs.existsSync(faviconPath)).toBe(true);
    });

    test("font placeholder files should exist", () => {
      const fonts = [
        "orbitron-bold.woff2",
        "orbitron-regular.woff2",
        "roboto-mono-regular.woff2",
      ];

      fonts.forEach((font) => {
        const fontPath = path.join(__dirname, `../public/fonts/${font}`);
        expect(fs.existsSync(fontPath)).toBe(true);
      });
    });
  });

  describe("Script Loading", () => {
    test("should have module script for main.js", () => {
      expect(htmlContent).toMatch(
        /<script type="module" src="\.\/src\/main\.js"><\/script>/,
      );
    });
  });

  describe("Styling", () => {
    test("should set background color to black", () => {
      expect(htmlContent).toMatch(/background-color:\s*#000000/);
    });

    test("should use game fonts in font-family", () => {
      expect(htmlContent).toMatch(
        /font-family:\s*'Orbitron'[\s\S]*'Roboto Mono'/,
      );
    });

    test("canvas should have absolute positioning", () => {
      expect(htmlContent).toMatch(
        /canvas#starfield\s*{[\s\S]*position:\s*absolute/,
      );
    });
  });
});
