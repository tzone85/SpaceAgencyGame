/**
 * Budget Tracker for Space Agency Game
 * Manages budget state, mission launches, and persistence
 */

const STORAGE_KEY = 'spaceBudget';
const DEFAULT_BUDGET = 1000000;

const missions = [
    { id: 1, name: 'Moon Landing', cost: 100000, description: 'Send astronauts to the moon' },
    { id: 2, name: 'Mars Rover', cost: 250000, description: 'Deploy rover to Mars' },
    { id: 3, name: 'Satellite Launch', cost: 50000, description: 'Launch communication satellite' },
    { id: 4, name: 'Space Station Supply', cost: 75000, description: 'Resupply the space station' },
    { id: 5, name: 'Deep Space Probe', cost: 300000, description: 'Send probe to outer planets' },
];

class BudgetTracker {
    constructor() {
        this.budget = this.loadBudget();
        this.initializeUI();
    }

    /**
     * Load budget from localStorage or use default
     */
    loadBudget() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? parseInt(stored, 10) : DEFAULT_BUDGET;
    }

    /**
     * Save budget to localStorage
     */
    saveBudget() {
        localStorage.setItem(STORAGE_KEY, this.budget.toString());
    }

    /**
     * Launch a mission and deduct its cost from budget
     * Returns true if successful, false otherwise
     */
    launchMission(missionId) {
        const mission = missions.find(m => m.id === missionId);
        if (!mission) {
            console.error(`Mission ${missionId} not found`);
            return false;
        }

        if (this.budget - mission.cost < 0) {
            return false;
        }

        this.budget -= mission.cost;
        this.saveBudget();
        this.updateDisplay();
        return true;
    }

    /**
     * Reset budget to default value
     */
    resetBudget() {
        this.budget = DEFAULT_BUDGET;
        this.saveBudget();
        this.updateDisplay();
    }

    /**
     * Get current budget
     */
    getBudget() {
        return this.budget;
    }

    /**
     * Format number as currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    /**
     * Update budget display
     */
    updateDisplay() {
        const budgetDisplay = document.getElementById('budgetDisplay');
        if (budgetDisplay) {
            budgetDisplay.textContent = this.formatCurrency(this.budget);
        }
    }

    /**
     * Render missions list
     */
    renderMissions() {
        const missionsList = document.getElementById('missionsList');
        if (!missionsList) return;

        missionsList.innerHTML = '';
        missions.forEach(mission => {
            const canAfford = this.budget >= mission.cost;
            const missionCard = document.createElement('div');
            missionCard.className = 'mission-card';
            missionCard.innerHTML = `
                <div class="mission-info">
                    <h3>${mission.name}</h3>
                    <p>${mission.description}</p>
                </div>
                <div class="mission-cost">${this.formatCurrency(mission.cost)}</div>
                <button 
                    class="launch-btn" 
                    data-mission-id="${mission.id}"
                    ${!canAfford ? 'disabled' : ''}
                >
                    Launch
                </button>
            `;

            const button = missionCard.querySelector('.launch-btn');
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const success = this.launchMission(mission.id);
                if (!success) {
                    alert(`Insufficient budget! Mission costs ${this.formatCurrency(mission.cost)}, but you only have ${this.formatCurrency(this.budget)}`);
                }
                this.renderMissions();
            });

            missionsList.appendChild(missionCard);
        });
    }

    /**
     * Initialize UI elements and event listeners
     */
    initializeUI() {
        this.updateDisplay();
        this.renderMissions();

        const resetBtn = document.getElementById('resetBudgetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset the budget to $1,000,000?')) {
                    this.resetBudget();
                    this.renderMissions();
                }
            });
        }
    }
}

// Initialize tracker when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.budgetTracker = new BudgetTracker();
});
