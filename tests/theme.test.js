/**
 * Tests for Core CSS Theme & Glassmorphism Styles
 * Story: 01KKVMGT-s-003
 *
 * These tests verify the CSS file structure and content meets acceptance criteria.
 */

import fs from "fs";
import path from "path";

// Get project root: tests/ is in the project root, so go up one level
const projectRoot = path.resolve(__dirname, "..");

describe("Theme & Glassmorphism Styles - CSS File Verification", () => {
  let cssContent;

  beforeAll(() => {
    const cssPath = path.join(projectRoot, "styles", "main.css");
    cssContent = fs.readFileSync(cssPath, "utf-8");
  });

  // ========================================================================
  // TEST GROUP 1: CSS File Exists & Structure
  // ========================================================================

  describe("CSS File Structure", () => {
    test("styles/main.css file should exist", () => {
      const cssPath = path.join(projectRoot, "styles", "main.css");
      expect(fs.existsSync(cssPath)).toBe(true);
    });

    test("CSS file should contain root selector with CSS custom properties", () => {
      expect(cssContent).toMatch(/:root\s*\{/);
    });

    test("CSS file should not be empty", () => {
      expect(cssContent.length).toBeGreaterThan(1000);
    });
  });

  // ========================================================================
  // TEST GROUP 2: CSS Custom Properties (Theme Colors)
  // ========================================================================

  describe("CSS Custom Properties - Colors", () => {
    test("should define --color-bg-primary (deep space dark)", () => {
      expect(cssContent).toMatch(/--color-bg-primary\s*:\s*#0a0a1a/);
    });

    test("should define --color-bg-secondary", () => {
      expect(cssContent).toMatch(/--color-bg-secondary\s*:/);
    });

    test("should define --color-bg-tertiary", () => {
      expect(cssContent).toMatch(/--color-bg-tertiary\s*:/);
    });

    test("should define cyan neon accent (--color-accent-cyan)", () => {
      expect(cssContent).toMatch(/--color-accent-cyan\s*:\s*#00d4ff/);
    });

    test("should define purple neon accent", () => {
      expect(cssContent).toMatch(/--color-accent-purple\s*:/);
    });

    test("should define pink neon accent", () => {
      expect(cssContent).toMatch(/--color-accent-pink\s*:/);
    });

    test("should define green accent", () => {
      expect(cssContent).toMatch(/--color-accent-green\s*:/);
    });

    test("should define text color variables", () => {
      expect(cssContent).toMatch(/--color-text-primary\s*:\s*#ffffff/);
      expect(cssContent).toMatch(/--color-text-secondary\s*:/);
      expect(cssContent).toMatch(/--color-text-tertiary\s*:/);
    });

    test("should define glass effect colors", () => {
      expect(cssContent).toMatch(/--color-glass-bg\s*:\s*rgba/);
      expect(cssContent).toMatch(/--color-glass-border\s*:/);
    });
  });

  // ========================================================================
  // TEST GROUP 3: CSS Custom Properties - Typography
  // ========================================================================

  describe("CSS Custom Properties - Typography", () => {
    test("should define --font-game for pixel aesthetic", () => {
      expect(cssContent).toMatch(/--font-game\s*:\s*'Press Start 2P'/);
    });

    test("should define --font-data for sans-serif", () => {
      expect(cssContent).toMatch(/--font-data\s*:/);
    });
  });

  // ========================================================================
  // TEST GROUP 4: CSS Custom Properties - Design System
  // ========================================================================

  describe("CSS Custom Properties - Design System", () => {
    test("should define spacing scale variables", () => {
      expect(cssContent).toMatch(/--space-xs\s*:/);
      expect(cssContent).toMatch(/--space-sm\s*:/);
      expect(cssContent).toMatch(/--space-md\s*:/);
      expect(cssContent).toMatch(/--space-lg\s*:/);
      expect(cssContent).toMatch(/--space-xl\s*:/);
      expect(cssContent).toMatch(/--space-2xl\s*:/);
    });

    test("should define border radius variables", () => {
      expect(cssContent).toMatch(/--radius-sm\s*:/);
      expect(cssContent).toMatch(/--radius-md\s*:/);
      expect(cssContent).toMatch(/--radius-lg\s*:/);
      expect(cssContent).toMatch(/--radius-xl\s*:/);
    });

    test("should define transition timing variables", () => {
      expect(cssContent).toMatch(/--transition-fast\s*:/);
      expect(cssContent).toMatch(/--transition-base\s*:/);
      expect(cssContent).toMatch(/--transition-slow\s*:/);
    });

    test("should define shadow variables", () => {
      expect(cssContent).toMatch(/--shadow-sm\s*:/);
      expect(cssContent).toMatch(/--shadow-md\s*:/);
      expect(cssContent).toMatch(/--shadow-lg\s*:/);
      expect(cssContent).toMatch(/--shadow-glass\s*:/);
    });

    test("should define glass effect variables", () => {
      expect(cssContent).toMatch(/--glass-opacity\s*:/);
      expect(cssContent).toMatch(/--glass-blur\s*:\s*16px/);
      expect(cssContent).toMatch(/--glass-border-opacity\s*:/);
    });
  });

  // ========================================================================
  // TEST GROUP 5: Glassmorphism Components
  // ========================================================================

  describe("Glassmorphism Styles", () => {
    test("should have .glass class with backdrop-filter", () => {
      expect(cssContent).toMatch(/\.glass\s*\{[^}]*backdrop-filter\s*:\s*blur/);
    });

    test("should have .glass-panel class with padding", () => {
      expect(cssContent).toMatch(
        /\.glass-panel\s*\{[^}]*padding\s*:\s*var\(--space-lg\)/,
      );
    });

    test("should have .glass-panel-cyan variant", () => {
      expect(cssContent).toMatch(/\.glass-panel-cyan\s*\{/);
    });

    test("should have .glass-panel-purple variant", () => {
      expect(cssContent).toMatch(/\.glass-panel-purple\s*\{/);
    });

    test("should have .glass-panel-pink variant", () => {
      expect(cssContent).toMatch(/\.glass-panel-pink\s*\{/);
    });

    test("should have .glass-panel-green variant", () => {
      expect(cssContent).toMatch(/\.glass-panel-green\s*\{/);
    });

    test("should have .glass-intense variant with stronger blur", () => {
      expect(cssContent).toMatch(
        /\.glass-intense\s*\{[^}]*backdrop-filter\s*:\s*blur\(20px\)/,
      );
    });

    test("should have .glass-light variant", () => {
      expect(cssContent).toMatch(
        /\.glass-light\s*\{[^}]*backdrop-filter\s*:\s*blur\(8px\)/,
      );
    });
  });

  // ========================================================================
  // TEST GROUP 6: Typography Styles
  // ========================================================================

  describe("Typography Styles", () => {
    test("should have h1-h6 selectors with font-game", () => {
      expect(cssContent).toMatch(
        /h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{[^}]*font-family\s*:\s*var\(--font-game\)/,
      );
    });

    test("should have h1 with large font size", () => {
      expect(cssContent).toMatch(/h1\s*\{[^}]*font-size\s*:\s*2\.5rem/);
    });

    test("should have paragraph styles with data font", () => {
      expect(cssContent).toMatch(
        /p\s*\{[^}]*font-family\s*:\s*var\(--font-data\)/,
      );
    });

    test("should have code and pre styling", () => {
      expect(cssContent).toMatch(/code,\s*pre\s*\{/);
    });

    test("should apply text-shadow to headings for glow effect", () => {
      expect(cssContent).toMatch(
        /h[1-6]\s*\{[^}]*text-shadow\s*:\s*0\s*0\s*10px/,
      );
    });
  });

  // ========================================================================
  // TEST GROUP 7: Base Layout & Container Styles
  // ========================================================================

  describe("Base Layout & Container Styles", () => {
    test("should have reset styles with universal selector", () => {
      expect(cssContent).toMatch(/\*\s*\{[^}]*margin\s*:\s*0/);
      expect(cssContent).toMatch(/\*\s*\{[^}]*padding\s*:\s*0/);
      expect(cssContent).toMatch(/\*\s*\{[^}]*box-sizing\s*:\s*border-box/);
    });

    test("should have .container class with flex", () => {
      expect(cssContent).toMatch(/\.container\s*\{[^}]*display\s*:\s*flex/);
      expect(cssContent).toMatch(
        /\.container\s*\{[^}]*flex-direction\s*:\s*column/,
      );
    });

    test("should have .container-full for fullscreen", () => {
      expect(cssContent).toMatch(/\.container-full\s*\{[^}]*width\s*:\s*100vw/);
      expect(cssContent).toMatch(
        /\.container-full\s*\{[^}]*height\s*:\s*100vh/,
      );
    });

    test("should have .grid classes", () => {
      expect(cssContent).toMatch(/\.grid\s*\{[^}]*display\s*:\s*grid/);
      expect(cssContent).toMatch(
        /\.grid-2\s*\{[^}]*grid-template-columns\s*:\s*repeat\(2/,
      );
      expect(cssContent).toMatch(
        /\.grid-3\s*\{[^}]*grid-template-columns\s*:\s*repeat\(3/,
      );
      expect(cssContent).toMatch(
        /\.grid-4\s*\{[^}]*grid-template-columns\s*:\s*repeat\(4/,
      );
    });

    test("should have .flex classes", () => {
      expect(cssContent).toMatch(/\.flex\s*\{[^}]*display\s*:\s*flex/);
      expect(cssContent).toMatch(
        /\.flex-col\s*\{[^}]*flex-direction\s*:\s*column/,
      );
      expect(cssContent).toMatch(/\.flex-center\s*\{/);
      expect(cssContent).toMatch(/\.flex-between\s*\{/);
    });

    test("should have .header styles", () => {
      expect(cssContent).toMatch(
        /\.header\s*\{[^}]*padding\s*:\s*var\(--space-lg\)/,
      );
      expect(cssContent).toMatch(/\.header\s*\{[^}]*border-bottom/);
    });

    test("should have .footer styles", () => {
      expect(cssContent).toMatch(
        /\.footer\s*\{[^}]*padding\s*:\s*var\(--space-md\)/,
      );
      expect(cssContent).toMatch(/\.footer\s*\{[^}]*border-top/);
    });

    test("should have .wrapper class with overflow scroll", () => {
      expect(cssContent).toMatch(/\.wrapper\s*\{[^}]*overflow-y\s*:\s*auto/);
    });

    test("should have .section class with spacing", () => {
      expect(cssContent).toMatch(
        /\.section\s*\{[^}]*padding\s*:\s*var\(--space-xl\)/,
      );
      expect(cssContent).toMatch(/\.section\s*\{[^}]*border-bottom/);
    });
  });

  // ========================================================================
  // TEST GROUP 8: Dark Space Theme Implementation
  // ========================================================================

  describe("Dark Space Theme Implementation", () => {
    test("body should have dark background", () => {
      expect(cssContent).toMatch(
        /body\s*\{[^}]*background-color\s*:\s*var\(--color-bg-primary\)/,
      );
    });

    test("should have text color utilities", () => {
      expect(cssContent).toMatch(
        /\.text-primary\s*\{[^}]*color\s*:\s*var\(--color-text-primary\)/,
      );
      expect(cssContent).toMatch(/\.text-secondary\s*\{/);
      expect(cssContent).toMatch(/\.text-tertiary\s*\{/);
    });

    test("should have accent color utilities", () => {
      expect(cssContent).toMatch(
        /\.text-accent-cyan\s*\{[^}]*color\s*:\s*var\(--color-accent-cyan\)/,
      );
      expect(cssContent).toMatch(/\.text-accent-purple\s*\{/);
      expect(cssContent).toMatch(/\.text-accent-pink\s*\{/);
      expect(cssContent).toMatch(/\.text-accent-green\s*\{/);
    });

    test("should have background color utilities", () => {
      expect(cssContent).toMatch(
        /\.bg-primary\s*\{[^}]*background-color\s*:\s*var\(--color-bg-primary\)/,
      );
      expect(cssContent).toMatch(/\.bg-secondary\s*\{/);
      expect(cssContent).toMatch(/\.bg-tertiary\s*\{/);
    });

    test("should have shadow utilities", () => {
      expect(cssContent).toMatch(
        /\.shadow-sm\s*\{[^}]*box-shadow\s*:\s*var\(--shadow-sm\)/,
      );
      expect(cssContent).toMatch(/\.shadow-md\s*\{/);
      expect(cssContent).toMatch(/\.shadow-lg\s*\{/);
      expect(cssContent).toMatch(/\.shadow-glass\s*\{/);
    });

    test("should have spacing utilities", () => {
      expect(cssContent).toMatch(
        /\.m-md\s*\{[^}]*margin\s*:\s*var\(--space-md\)/,
      );
      expect(cssContent).toMatch(
        /\.p-md\s*\{[^}]*padding\s*:\s*var\(--space-md\)/,
      );
      expect(cssContent).toMatch(
        /\.mt-md\s*\{[^}]*margin-top\s*:\s*var\(--space-md\)/,
      );
      expect(cssContent).toMatch(
        /\.mb-md\s*\{[^}]*margin-bottom\s*:\s*var\(--space-md\)/,
      );
    });
  });

  // ========================================================================
  // TEST GROUP 9: Animations
  // ========================================================================

  describe("Animations & Transitions", () => {
    test("should define glow animation", () => {
      expect(cssContent).toMatch(/@keyframes\s+glow\s*\{/);
    });

    test("should define pulse animation", () => {
      expect(cssContent).toMatch(/@keyframes\s+pulse\s*\{/);
    });

    test("should define shimmer animation", () => {
      expect(cssContent).toMatch(/@keyframes\s+shimmer\s*\{/);
    });

    test("should have .glow-text class", () => {
      expect(cssContent).toMatch(/\.glow-text\s*\{[^}]*animation\s*:\s*glow/);
    });

    test("should have .pulse class", () => {
      expect(cssContent).toMatch(/\.pulse\s*\{[^}]*animation\s*:\s*pulse/);
    });
  });

  // ========================================================================
  // TEST GROUP 10: Responsive Design
  // ========================================================================

  describe("Responsive Design", () => {
    test("should have mobile media query", () => {
      expect(cssContent).toMatch(/@media\s*\(\s*max-width\s*:\s*768px\s*\)/);
    });

    test("should have small screen media query", () => {
      expect(cssContent).toMatch(/@media\s*\(\s*max-width\s*:\s*480px\s*\)/);
    });
  });

  // ========================================================================
  // TEST GROUP 11: Scrollbar Styling
  // ========================================================================

  describe("Scrollbar Styling", () => {
    test("should define webkit scrollbar styles", () => {
      expect(cssContent).toMatch(/::-webkit-scrollbar\s*\{/);
      expect(cssContent).toMatch(/::-webkit-scrollbar-track\s*\{/);
      expect(cssContent).toMatch(/::-webkit-scrollbar-thumb\s*\{/);
    });

    test("should define Firefox scrollbar styles", () => {
      expect(cssContent).toMatch(/scrollbar-color\s*:/);
      expect(cssContent).toMatch(/scrollbar-width\s*:\s*thin/);
    });
  });
});

describe("HTML Integration - CSS Link", () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.join(projectRoot, "index.html");
    htmlContent = fs.readFileSync(htmlPath, "utf-8");
  });

  test("index.html should link to styles/main.css", () => {
    expect(htmlContent).toMatch(
      /<link[^>]*href\s*=\s*["\']\.\/styles\/main\.css["\']/,
    );
    expect(htmlContent).toMatch(/rel\s*=\s*["\']stylesheet["\']/);
  });

  test("index.html should import Press Start 2P font from Google Fonts", () => {
    expect(htmlContent).toMatch(/fonts\.googleapis\.com/);
    expect(htmlContent).toMatch(/Press\+Start\+2P/);
  });

  test("index.html should have preconnect for font performance", () => {
    expect(htmlContent).toMatch(/<link[^>]*rel\s*=\s*["\']preconnect["']/);
  });

  test("should not have inline styles for canvas (deferred to CSS)", () => {
    // Check that body and html don't have inline style attributes with theming
    const inlineStyleCount = (
      htmlContent.match(/<(body|html)[^>]*style\s*=/g) || []
    ).length;
    // Should have minimal inline styles (only canvas display)
    expect(inlineStyleCount).toBeLessThanOrEqual(1);
  });
});
