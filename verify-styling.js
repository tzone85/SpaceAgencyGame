#!/usr/bin/env node

/**
 * Quick verification script for space dashboard styling
 * Checks that the HTML file has all required elements and CSS
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

const checks = [
  {
    name: 'HTML has DOCTYPE',
    check: () => html.includes('<!DOCTYPE html>')
  },
  {
    name: 'Title is "Stellar Command Academy"',
    check: () => html.includes('<title>Stellar Command Academy</title>')
  },
  {
    name: 'CSS contains space theme colors',
    check: () => html.includes('#0a0e27') && html.includes('#00ff88')
  },
  {
    name: 'Dashboard container exists',
    check: () => html.includes('id="dashboard-container"')
  },
  {
    name: 'Budget counter element exists',
    check: () => html.includes('data-budget-counter') && html.includes('Budget: $1,000,000')
  },
  {
    name: 'Mission list container exists',
    check: () => html.includes('class="mission-list-container"')
  },
  {
    name: 'Mission list heading exists',
    check: () => html.includes('<h2>Available Missions</h2>')
  },
  {
    name: 'Mission list exists with proper ID',
    check: () => html.includes('id="missionList"')
  },
  {
    name: 'CSS has monospace font',
    check: () => html.includes("'Courier New'")
  },
  {
    name: 'CSS has dark background gradients',
    check: () => html.includes('linear-gradient') && html.includes('135deg')
  },
  {
    name: 'Budget counter has glow shadow effects',
    check: () => html.includes('box-shadow: 0 0 20px rgba(0, 255, 136')
  },
  {
    name: 'Mission list items have border styling',
    check: () => html.includes('border-left: 3px solid #00ff88')
  },
  {
    name: 'Button styling exists',
    check: () => html.includes('button {') && html.includes('padding: 12px 24px')
  },
  {
    name: 'Button has hover effects',
    check: () => html.includes('button:hover') && html.includes('transform: translate')
  },
  {
    name: 'Mission list has hover transitions',
    check: () => html.includes('.mission-list li:hover') && html.includes('transition: all')
  },
  {
    name: 'Text shadows for neon effect',
    check: () => html.includes('text-shadow: 0 0 10px')
  },
  {
    name: 'Scrollbar is styled',
    check: () => html.includes('::-webkit-scrollbar')
  },
  {
    name: 'CSS has proper spacing and alignment',
    check: () => html.includes('max-width: 1200px') && html.includes('margin: 0 auto')
  },
  {
    name: 'Mission list uses flexbox',
    check: () => html.includes('display: flex') && html.includes('flex-direction: column')
  },
  {
    name: 'Cyan color for mission heading',
    check: () => html.includes('color: #00ffff')
  }
];

console.log('\n🚀 Space Dashboard Styling Verification\n');
console.log('=' .repeat(50));

let passed = 0;
let failed = 0;

checks.forEach((check, index) => {
  const result = check.check();
  const status = result ? '✓ PASS' : '✗ FAIL';
  console.log(`${index + 1}. ${status} - ${check.name}`);
  if (result) passed++;
  else failed++;
});

console.log('=' .repeat(50));
console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('✨ All styling checks passed! Space dashboard theme is properly implemented.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some styling checks failed. Please review the CSS.\n');
  process.exit(1);
}
