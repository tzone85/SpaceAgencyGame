/**
 * CSS Styling Tests for Space Dashboard Theme
 * Tests verify that the dashboard meets all acceptance criteria
 */

describe('Space Dashboard Styling', () => {
  let document;
  let window;

  beforeEach(async () => {
    // Load the HTML file
    const fs = require('fs');
    const html = fs.readFileSync('./index.html', 'utf-8');
    const DOM = require('jsdom').JSDOM;
    const dom = new DOM(html);
    document = dom.window.document;
    window = dom.window;
  });

  describe('Color Scheme - Space Theme', () => {
    test('Body has dark background gradient', () => {
      const bodyStyle = window.getComputedStyle(document.body);
      // The gradient should be present
      expect(document.querySelector('style').textContent).toContain('gradient');
      expect(document.querySelector('style').textContent).toContain('#0a0e27');
    });

    test('Budget counter has bright text color', () => {
      const counter = document.querySelector('.budget-counter');
      expect(counter).toBeTruthy();
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('color: #00ff88');
    });

    test('Mission section heading has cyan color', () => {
      const heading = document.querySelector('.mission-list-container h2');
      expect(heading).toBeTruthy();
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('#00ffff');
    });

    test('Text colors are bright for visibility on dark background', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('#e0e0ff'); // Light text
      expect(styles).toContain('#00ff88'); // Bright green
      expect(styles).toContain('#00ffff'); // Bright cyan
    });
  });

  describe('Spacing and Alignment', () => {
    test('Dashboard has max-width for centering', () => {
      const dashboard = document.querySelector('.dashboard');
      expect(dashboard).toBeTruthy();
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('max-width: 1200px');
      expect(styles).toContain('margin: 0 auto');
    });

    test('Budget counter has proper padding', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('padding: 25px');
    });

    test('Mission list items have gap spacing', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('gap: 12px');
    });

    test('Mission list container has padding and margin', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('.mission-list-container');
      expect(styles).toContain('padding: 25px');
      expect(styles).toContain('margin-top: 30px');
    });

    test('Mission list items have padding', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('.mission-list li');
      expect(styles).toContain('padding: 15px');
    });

    test('Flexbox layout for vertical stacking', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('display: flex');
      expect(styles).toContain('flex-direction: column');
    });
  });

  describe('Button Hover Effects', () => {
    test('Button has base styling', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('button {');
      expect(styles).toContain('padding: 12px 24px');
      expect(styles).toContain('background: linear-gradient');
    });

    test('Button has hover state with transform', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('button:hover {');
      expect(styles).toContain('transform: translate(0, -2px)');
    });

    test('Button has active state', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('button:active {');
    });

    test('Button has glow effects', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('box-shadow');
      expect(styles).toContain('0 0 15px');
    });

    test('Button text is uppercase and spaced', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('text-transform: uppercase');
      expect(styles).toContain('letter-spacing: 1px');
    });
  });

  describe('Mission List Readability', () => {
    test('Mission list exists', () => {
      const list = document.querySelector('.mission-list');
      expect(list).toBeTruthy();
    });

    test('Mission list items have visible styling', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('.mission-list li {');
      expect(styles).toContain('border-left: 3px solid #00ff88');
    });

    test('Mission list items have hover effects', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('.mission-list li:hover {');
      expect(styles).toContain('color: #00ff88');
    });

    test('Empty state is visually distinct', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('.mission-list.empty {');
      expect(styles).toContain('border: 1px dashed');
    });

    test('Mission section has clear heading', () => {
      const heading = document.querySelector('.mission-list-container h2');
      expect(heading.textContent).toBe('Available Missions');
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('font-size: 1.8rem');
    });
  });

  describe('Overall Design Cohesion', () => {
    test('Font family is monospace for tech aesthetic', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain("font-family: 'Courier New', monospace");
    });

    test('Consistent use of gradients', () => {
      const styles = document.querySelector('style').textContent;
      const gradientCount = (styles.match(/linear-gradient/g) || []).length;
      expect(gradientCount).toBeGreaterThan(3);
    });

    test('Consistent box-shadow for glow effects', () => {
      const styles = document.querySelector('style').textContent;
      const shadowCount = (styles.match(/box-shadow:/g) || []).length;
      expect(shadowCount).toBeGreaterThan(2);
    });

    test('Text shadows for neon glow effect', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('text-shadow');
    });

    test('Smooth transitions for interactive elements', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('transition: all 0.3s ease');
    });

    test('Budget counter has space command center styling', () => {
      const counter = document.querySelector('.budget-counter');
      expect(counter).toBeTruthy();
      expect(counter.textContent).toContain('Budget');
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('.budget-counter:hover');
    });

    test('Mission container has professional border', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('border: 2px solid #00ffff');
    });

    test('Scrollbar is themed', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('::-webkit-scrollbar');
    });
  });

  describe('Acceptance Criteria Verification', () => {
    test('✓ Dashboard has space-themed color scheme (dark backgrounds, bright text)', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('background: linear-gradient');
      expect(styles).toContain('#0a0e27'); // Dark
      expect(styles).toContain('#00ff88'); // Bright green
      expect(styles).toContain('#00ffff'); // Bright cyan
    });

    test('✓ Elements are properly spaced and aligned', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('max-width: 1200px');
      expect(styles).toContain('margin: 0 auto');
      expect(styles).toContain('gap: 12px');
      expect(styles).toContain('display: flex');
    });

    test('✓ Button has hover effects and looks clickable', () => {
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('button:hover {');
      expect(styles).toContain('cursor: pointer');
      expect(styles).toContain('transform: translate');
    });

    test('✓ Mission list entries are clearly readable', () => {
      const list = document.querySelector('.mission-list');
      const heading = document.querySelector('.mission-list-container h2');
      expect(list).toBeTruthy();
      expect(heading).toBeTruthy();
      const styles = document.querySelector('style').textContent;
      expect(styles).toContain('color: #e0e0ff'); // Light text for readability
      expect(styles).toContain('font-size: 1.8rem'); // Clear heading
    });

    test('✓ Overall design looks cohesive and professional', () => {
      const styles = document.querySelector('style').textContent;
      // Check for consistent design elements
      expect(styles).toContain('linear-gradient');
      expect(styles).toContain('box-shadow');
      expect(styles).toContain('text-shadow');
      expect(styles).toContain('transition');
      expect(styles).toContain("font-family: 'Courier New'");
    });
  });
});
