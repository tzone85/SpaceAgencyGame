/**
 * Stellar Horizon - Space Agency Management Game
 *
 * Main entry point. Bootstraps the Game controller which wires
 * EventBus, GameState, SaveSystem, and the Engine loop.
 */

import Game from "./core/game.js";

const game = new Game();

game.start();

export default game;
