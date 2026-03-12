const fs = require('fs');
const path = require('path');

describe('CSS Extraction from index.html', () => {
    const indexPath = path.join(__dirname, 'index.html');
    const stylesPath = path.join(__dirname, 'src', 'css', 'styles.css');

    test('External stylesheet exists at src/css/styles.css', () => {
        expect(fs.existsSync(stylesPath)).toBe(true);
    });

    test('External stylesheet is not empty', () => {
        const content = fs.readFileSync(stylesPath, 'utf8');
        expect(content.length).toBeGreaterThan(0);
    });

    test('index.html references the external stylesheet', () => {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        expect(indexContent).toContain('<link rel="stylesheet" href="src/css/styles.css">');
    });

    test('index.html does not contain inline style tag', () => {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        expect(indexContent).not.toContain('<style>');
        expect(indexContent).not.toContain('</style>');
    });

    test('styles.css contains all expected CSS rules', () => {
        const stylesContent = fs.readFileSync(stylesPath, 'utf8');

        // Verify essential CSS rules are present
        const expectedRules = [
            '* {',
            'box-sizing: border-box;',
            'body {',
            'font-family: Arial, sans-serif;',
            '.dashboard {',
            '.budget-counter {',
            '.mission-list-container {',
            '.mission-item {',
            '.launch-btn {',
            '.notification {',
            '@keyframes slideIn {',
        ];

        expectedRules.forEach(rule => {
            expect(stylesContent).toContain(rule);
        });
    });

    test('styles.css contains all notification style classes', () => {
        const stylesContent = fs.readFileSync(stylesPath, 'utf8');

        expect(stylesContent).toContain('.notification-success {');
        expect(stylesContent).toContain('.notification-error {');
        expect(stylesContent).toContain('.notification-warning {');
    });

    test('Stylesheet is properly formatted', () => {
        const stylesContent = fs.readFileSync(stylesPath, 'utf8');

        // Check for balanced braces
        const openBraces = (stylesContent.match(/{/g) || []).length;
        const closeBraces = (stylesContent.match(/}/g) || []).length;

        expect(openBraces).toBe(closeBraces);
    });

    test('Visual appearance preserved - key styles intact', () => {
        const stylesContent = fs.readFileSync(stylesPath, 'utf8');

        // Verify that all visual styling properties are present
        expect(stylesContent).toContain('background-color: #fafafa;'); // body bg
        expect(stylesContent).toContain('background-color: #f5f5f5;'); // budget-counter bg
        expect(stylesContent).toContain('border-left: 4px solid #4CAF50;'); // budget-counter left border
        expect(stylesContent).toContain('color: #4CAF50;'); // mission-cost color
        expect(stylesContent).toContain('background-color: #45a049;'); // button hover
    });
});
