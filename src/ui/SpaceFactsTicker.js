/**
 * SpaceFactsTicker Component
 *
 * Displays rotating educational space facts at the bottom of the main menu
 * with a scrolling ticker effect
 */

const SPACE_FACTS = [
  'The Sun contains 99.86% of the mass of the entire Solar System',
  'A day on Venus is longer than its year',
  'There are more stars than grains of sand on all Earth\'s beaches',
  'Neptune has the strongest winds in the Solar System',
  'One million Earths could fit inside the Sun',
  'Light from the Sun takes 8 minutes and 20 seconds to reach Earth',
  'Saturn\'s rings are not solid - they are made of ice and rock',
  'Jupiter has 95 known moons, more than any other planet',
  'The Milky Way is moving through space at 1.3 million mph',
  'A supernova can briefly outshine an entire galaxy',
];

class SpaceFactsTicker {
  constructor() {
    this.tickerElement = null;
    this.tickerContent = null;
    this.facts = [...SPACE_FACTS];
    this.currentFactIndex = 0;
    this.rotationInterval = null;
    this.rotationDelay = 5000; // 5 seconds per fact
  }

  /**
   * Initialize the ticker
   */
  initialize() {
    this.createTickerUI();
    this.displayFact(0);
    this.startRotation();
  }

  /**
   * Create the ticker UI structure
   */
  createTickerUI() {
    // Create ticker container
    this.tickerElement = document.createElement('div');
    this.tickerElement.id = 'space-facts-ticker';
    this.tickerElement.className = 'space-facts-ticker';

    // Create content container with scrolling effect
    this.tickerContent = document.createElement('div');
    this.tickerContent.className = 'ticker-content';
    this.tickerElement.appendChild(this.tickerContent);

    // Append to body if not already in DOM
    if (!document.getElementById('space-facts-ticker')) {
      document.body.appendChild(this.tickerElement);
    }
  }

  /**
   * Display a specific fact
   * @param {number} index - Fact index
   */
  displayFact(index) {
    if (!this.tickerContent) return;

    const fact = this.facts[index % this.facts.length];

    // Clear content and add new fact with animation
    this.tickerContent.classList.remove('fade-in');
    this.tickerContent.textContent = '';

    // Trigger reflow to restart animation
    void this.tickerContent.offsetWidth;

    this.tickerContent.classList.add('fade-in');
    this.tickerContent.textContent = `▸ ${fact}`;
  }

  /**
   * Start the fact rotation
   */
  startRotation() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }

    this.rotationInterval = setInterval(() => {
      this.currentFactIndex++;
      this.displayFact(this.currentFactIndex);
    }, this.rotationDelay);
  }

  /**
   * Stop the fact rotation
   */
  stopRotation() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }

  /**
   * Set rotation delay in milliseconds
   * @param {number} delay - Delay in ms
   */
  setRotationDelay(delay) {
    this.rotationDelay = Math.max(1000, delay); // Minimum 1 second
    if (this.rotationInterval) {
      this.stopRotation();
      this.startRotation();
    }
  }

  /**
   * Add custom facts to the ticker
   * @param {string[]} customFacts - Array of fact strings
   */
  addFacts(customFacts) {
    if (Array.isArray(customFacts)) {
      this.facts.push(...customFacts);
    }
  }

  /**
   * Cleanup the ticker
   */
  cleanup() {
    this.stopRotation();

    // Remove ticker from DOM
    if (this.tickerElement && this.tickerElement.parentNode) {
      this.tickerElement.parentNode.removeChild(this.tickerElement);
    }

    // Reset references
    this.tickerElement = null;
    this.tickerContent = null;
    this.facts = [];
    this.currentFactIndex = 0;
    console.log('SpaceFactsTicker cleaned up');
  }
}

export default SpaceFactsTicker;
export { SPACE_FACTS };
