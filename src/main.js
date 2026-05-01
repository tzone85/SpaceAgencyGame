/**
 * Stellar Command
 *
 * The legacy engine and scene classes remain available for unit coverage, but
 * the browser entry point now mounts the playable responsive PWA experience.
 */

import Game from "./core/game.js";
import StellarCommandApp from "./app/StellarCommandApp.js";

const root = document.getElementById("game-container") || document.body;
const game = new StellarCommandApp(root);

game.start();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
    // Offline support is a nice-to-have; the game should still run without it.
  });
}

export default game;
export { Game, StellarCommandApp };
