import {
  advanceDays,
  createInitialSession,
  getAvailableMissions,
  getAvailableResearch,
  getReadyCrew,
  getTutorialProgress,
  hydrateSession,
  launchMission,
  recruitCrew,
  startResearch,
  summarizeSession,
  trainCrew,
} from "../domain/stellarCommandSession.js";
import {
  applyImpulse,
  createOrbitState,
  getOrbitTelemetry,
  projectOrbitPath,
  stepOrbit,
} from "../domain/orbitalPhysics.js";
import RealtimeClient from "../net/RealtimeClient.js";
import { createRoomCode, isValidRoomCode } from "../net/multiplayerProtocol.js";

const STORAGE_KEY = "stellar-command-session-v2";
const TABS = ["Command", "Academy", "Flight Lab", "Missions", "Research", "Crew", "Network"];
const ORBIT_CENTER = 150;
const ORBIT_SCALE = 0.78;

function money(value) {
  return `${Math.round(value).toLocaleString()}M`;
}

function percent(value) {
  return `${Math.round(value)}%`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function progress(current, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

class StellarCommandApp {
  constructor(root) {
    this.root = root;
    this.activeTab = "Command";
    this.roomCode = "";
    this.networkStatus = "Solo mode";
    this.peers = [];
    this.session = this.loadSession();
    this.client = new RealtimeClient();
    this.tickTimer = null;
    this.visualTimer = null;
    this.orbitState = createOrbitState();
  }

  start() {
    this.bindNetwork();
    this.render();
    this.tickTimer = window.setInterval(() => {
      if (document.hidden || this.session.player.activeMissions.length === 0) return;
      this.mutate((session) => advanceDays(session, 1), { sync: true });
    }, 16000);
    this.visualTimer = window.setInterval(() => {
      if (document.hidden || this.activeTab !== "Flight Lab") return;
      this.orbitState = stepOrbit(this.orbitState, 0.16);
      this.render();
    }, 110);
  }

  destroy() {
    window.clearInterval(this.tickTimer);
    window.clearInterval(this.visualTimer);
    this.client.disconnect();
  }

  bindNetwork() {
    this.client.addEventListener("status", (event) => {
      this.networkStatus = event.detail.message || event.detail.status;
      this.render();
    });
    this.client.addEventListener("room:joined", (event) => {
      this.roomCode = event.detail.roomCode || this.roomCode;
      this.networkStatus = `Room ${this.roomCode}`;
      this.render();
      this.client.syncSession(this.session);
    });
    this.client.addEventListener("room:peers", (event) => {
      this.peers = event.detail.payload?.peers || [];
      this.render();
    });
    this.client.addEventListener("session:sync", (event) => {
      const incoming = event.detail.payload?.session;
      if (!incoming || event.detail.playerId === this.session.player.id) return;
      if (incoming.day >= this.session.day) {
        this.session = hydrateSession(incoming);
        this.saveSession();
        this.networkStatus = `Synced from ${event.detail.playerId}`;
        this.render();
      }
    });
  }

  loadSession() {
    try {
      return hydrateSession(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
      return createInitialSession();
    }
  }

  saveSession() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.session));
  }

  mutate(updater, options = {}) {
    try {
      this.session = updater(this.session);
      this.saveSession();
      this.render();
      if (options.sync) this.client.syncSession(this.session);
    } catch (error) {
      this.networkStatus = error.message;
      this.render();
    }
  }

  render() {
    this.root.innerHTML = `
      <main class="sc-shell">
        ${this.renderHero()}
        <section class="sc-workspace">
          ${this.renderTabs()}
          <div class="sc-panel">
            ${this.renderActiveTab()}
          </div>
        </section>
      </main>
    `;
    this.attachEvents();
  }

  renderHero() {
    const summary = summarizeSession(this.session);
    const leader = summary.rank[0];
    return `
      <section class="sc-hero">
        ${this.renderHeroVisual()}
        <div class="sc-hero__copy">
          <p class="sc-kicker">Day ${this.session.day} / ${escapeHtml(this.session.mode.toUpperCase())}</p>
          <h1>Stellar Command</h1>
          <p class="sc-tagline">Run the agency, beat the rival clubs, and turn messy space decisions into headline wins.</p>
        </div>
        <div class="sc-stats" aria-label="Agency stats">
          ${this.stat("Credits", money(this.session.player.credits))}
          ${this.stat("Science", this.session.player.science)}
          ${this.stat("Rep", percent(this.session.player.reputation))}
          ${this.stat("Score", this.session.player.score)}
        </div>
        <div class="sc-actions">
          <button class="sc-button sc-button--primary" data-action="advance" data-days="1">Advance Day</button>
          <button class="sc-button" data-action="advance" data-days="7">Fast Week</button>
          <button class="sc-button" data-action="save">Save</button>
          <button class="sc-icon-button" title="New game" data-action="new">New</button>
        </div>
        <p class="sc-leader">Leader: ${escapeHtml(leader.agencyName)} with ${leader.score} points</p>
      </section>
    `;
  }

  renderHeroVisual() {
    return `
      <div class="sc-hero-visual" aria-hidden="true">
        <svg viewBox="0 0 420 300" role="img">
          <defs>
            <linearGradient id="planetGlow" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stop-color="#46e6b0"/>
              <stop offset="0.55" stop-color="#58d7ff"/>
              <stop offset="1" stop-color="#ffd166"/>
            </linearGradient>
          </defs>
          <g class="sc-hero-rings">
            <ellipse cx="210" cy="154" rx="156" ry="54"></ellipse>
            <ellipse cx="210" cy="154" rx="116" ry="40"></ellipse>
          </g>
          <circle class="sc-hero-planet" cx="210" cy="154" r="54"></circle>
          <path class="sc-hero-land" d="M170 141c24-24 58-19 77-2 18 16 34 7 48 1-5 31-35 61-76 61-33 0-59-16-71-39 7 3 14 1 22-21z"></path>
          <g class="sc-hero-rocket">
            <path d="M318 70l34 62-42-14-42 14 34-62c3-6 13-6 16 0z"></path>
            <path d="M304 121h28l-14 38z"></path>
            <circle cx="318" cy="102" r="8"></circle>
          </g>
          <g class="sc-hero-vector">
            <path d="M98 228h122"></path>
            <path d="M220 228l-16-10v20z"></path>
          </g>
          <g class="sc-spark-lines">
            <path d="M68 84h52"></path>
            <path d="M332 218h42"></path>
            <path d="M76 198h32"></path>
          </g>
        </svg>
      </div>
    `;
  }

  stat(label, value) {
    return `
      <div class="sc-stat">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `;
  }

  renderTabs() {
    return `
      <nav class="sc-tabs" aria-label="Game sections">
        ${TABS.map((tab) => `
          <button class="sc-tab ${tab === this.activeTab ? "is-active" : ""}" data-tab="${tab}">
            ${tab}
          </button>
        `).join("")}
      </nav>
    `;
  }

  renderActiveTab() {
    switch (this.activeTab) {
      case "Missions":
        return this.renderMissions();
      case "Academy":
        return this.renderAcademy();
      case "Flight Lab":
        return this.renderFlightLab();
      case "Research":
        return this.renderResearch();
      case "Crew":
        return this.renderCrew();
      case "Network":
        return this.renderNetwork();
      default:
        return this.renderCommand();
    }
  }

  renderCommand() {
    const tutorial = getTutorialProgress(this.session);
    return `
      <div class="sc-command">
        ${tutorial.nextStep ? this.renderCoach(tutorial) : ""}
        <section class="sc-board">
          <h2>Live Ops</h2>
          ${this.session.player.activeMissions.length
            ? this.session.player.activeMissions.map((mission) => `
              <article class="sc-row">
                <div>
                  <strong>${escapeHtml(mission.name)}</strong>
                  <span>${escapeHtml(mission.tier)} / ${mission.duration - mission.elapsedDays} days left</span>
                </div>
                <div class="sc-meter"><span style="width:${progress(mission.elapsedDays, mission.duration)}%"></span></div>
              </article>
            `).join("")
            : `<p class="sc-empty">No active missions. Pick something bold from the mission board.</p>`}
        </section>
        <section class="sc-board">
          <h2>League Table</h2>
          ${summarizeSession(this.session).rank.map((agency, index) => `
            <article class="sc-rank ${agency.id === this.session.player.id ? "is-player" : ""}">
              <span>${index + 1}</span>
              <strong>${escapeHtml(agency.agencyName)}</strong>
              <em>${agency.score}</em>
            </article>
          `).join("")}
        </section>
        <section class="sc-board sc-feed">
          <h2>Signal Feed</h2>
          ${this.session.timeline.map((event) => `
            <article>
              <span>Day ${event.day}</span>
              <strong>${escapeHtml(event.title)}</strong>
              <p>${escapeHtml(event.body)}</p>
            </article>
          `).join("")}
        </section>
      </div>
    `;
  }

  orbitPoint(point) {
    return {
      x: ORBIT_CENTER + point.x * ORBIT_SCALE,
      y: ORBIT_CENTER + point.y * ORBIT_SCALE,
    };
  }

  renderVector(origin, vector, className, scale = 8) {
    const start = this.orbitPoint(origin);
    const end = {
      x: start.x + vector.x * scale,
      y: start.y + vector.y * scale,
    };
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const left = {
      x: end.x - Math.cos(angle - 0.55) * 10,
      y: end.y - Math.sin(angle - 0.55) * 10,
    };
    const right = {
      x: end.x - Math.cos(angle + 0.55) * 10,
      y: end.y - Math.sin(angle + 0.55) * 10,
    };

    return `
      <g class="${className}">
        <path d="M ${start.x} ${start.y} L ${end.x} ${end.y}"></path>
        <path d="M ${left.x} ${left.y} L ${end.x} ${end.y} L ${right.x} ${right.y}"></path>
      </g>
    `;
  }

  renderFlightLab() {
    const telemetry = getOrbitTelemetry(this.orbitState);
    const ship = this.orbitPoint(this.orbitState.position);
    const path = projectOrbitPath(this.orbitState, 220, 0.12)
      .map((point) => this.orbitPoint(point))
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
    const gravity = {
      x: -this.orbitState.position.x / Math.max(1, telemetry.radius) * telemetry.gravity,
      y: -this.orbitState.position.y / Math.max(1, telemetry.radius) * telemetry.gravity,
    };

    return `
      <div class="sc-flight">
        <section class="sc-flight-stage">
          <svg class="sc-orbit-sim" viewBox="0 0 300 300" role="img" aria-label="Interactive orbital physics simulator">
            <defs>
              <radialGradient id="earthTeen" cx="35%" cy="28%" r="72%">
                <stop offset="0" stop-color="#7df8c7"/>
                <stop offset="0.52" stop-color="#2aa7ff"/>
                <stop offset="1" stop-color="#1b3d8f"/>
              </radialGradient>
            </defs>
            <circle class="sc-sim-grid" cx="150" cy="150" r="126"></circle>
            <circle class="sc-sim-grid sc-sim-grid--inner" cx="150" cy="150" r="82"></circle>
            <path class="sc-orbit-path" d="${path}"></path>
            <circle class="sc-planet" cx="150" cy="150" r="${this.orbitState.bodyRadius * ORBIT_SCALE}"></circle>
            <path class="sc-continent" d="M126 137c14-13 36-13 48-2 13 12 23 6 35 2-3 23-27 44-58 44-22 0-41-9-51-27 10 4 17-1 26-17z"></path>
            ${this.renderVector(this.orbitState.position, this.orbitState.velocity, "sc-vector sc-vector--velocity", 9)}
            ${this.renderVector(this.orbitState.position, gravity, "sc-vector sc-vector--gravity", 360)}
            <g class="sc-ship" transform="translate(${ship.x} ${ship.y})">
              <path d="M 0 -14 L 10 10 L 0 6 L -10 10 Z"></path>
              <circle cx="0" cy="-2" r="4"></circle>
            </g>
          </svg>
          <div class="sc-flight-controls" aria-label="Orbital burns">
            <button class="sc-button sc-button--primary" data-action="orbit-impulse" data-burn="prograde">Prograde</button>
            <button class="sc-button" data-action="orbit-impulse" data-burn="retrograde">Retrograde</button>
            <button class="sc-button" data-action="orbit-impulse" data-burn="radialOut">Radial Out</button>
            <button class="sc-button" data-action="orbit-impulse" data-burn="radialIn">Radial In</button>
            <button class="sc-button" data-action="orbit-reset">Reset</button>
          </div>
        </section>
        <section class="sc-flight-readout">
          <span class="sc-pill">Vector Physics</span>
          <h2>Orbital Flight Lab</h2>
          <p>Use short burns to see how velocity and gravity vectors reshape an orbit. Prograde adds speed, retrograde lowers it, and radial burns tilt the path.</p>
          <dl class="sc-specs sc-specs--flight">
            <div><dt>Status</dt><dd>${escapeHtml(telemetry.status)}</dd></div>
            <div><dt>Altitude</dt><dd>${telemetry.altitude}</dd></div>
            <div><dt>Speed</dt><dd>${telemetry.speed}</dd></div>
            <div><dt>Eccentricity</dt><dd>${telemetry.eccentricity}</dd></div>
            <div><dt>Gravity</dt><dd>${telemetry.gravity}</dd></div>
            <div><dt>Period</dt><dd>${Number.isFinite(telemetry.period) ? telemetry.period : "Escape"}</dd></div>
          </dl>
          <div class="sc-legend">
            <span><i class="sc-dot sc-dot--velocity"></i>Velocity vector</span>
            <span><i class="sc-dot sc-dot--gravity"></i>Gravity vector</span>
            <span><i class="sc-dot sc-dot--path"></i>Predicted path</span>
          </div>
        </section>
      </div>
    `;
  }

  renderCoach(tutorial) {
    return `
      <section class="sc-board sc-coach">
        <div>
          <span class="sc-pill">Academy ${tutorial.percent}%</span>
          <h2>Next: ${escapeHtml(tutorial.nextStep.title)}</h2>
          <p>${escapeHtml(tutorial.nextStep.body)}</p>
        </div>
        <button class="sc-button sc-button--primary" data-action="goto-tab" data-target-tab="${escapeHtml(tutorial.nextStep.tab)}">
          Go to ${escapeHtml(tutorial.nextStep.tab)}
        </button>
      </section>
    `;
  }

  renderAcademy() {
    const tutorial = getTutorialProgress(this.session);
    return `
      <div class="sc-academy">
        <section class="sc-board sc-academy__hero">
          <span class="sc-pill">Flight Academy</span>
          <h2>${tutorial.completed}/${tutorial.total} Mastery Checks</h2>
          <p>Follow these steps in order and you will understand the full loop: earn, research, improve crew, beat the table, and bring friends in over the same WiFi.</p>
          <div class="sc-meter"><span style="width:${tutorial.percent}%"></span></div>
        </section>
        <div class="sc-lessons">
          ${tutorial.steps.map((step, index) => `
            <article class="sc-lesson ${step.complete ? "is-complete" : ""}">
              <span>${step.complete ? "Done" : `Step ${index + 1}`}</span>
              <h2>${escapeHtml(step.title)}</h2>
              <p>${escapeHtml(step.body)}</p>
              <button class="sc-button" data-action="goto-tab" data-target-tab="${escapeHtml(step.tab)}">
                Open ${escapeHtml(step.tab)}
              </button>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }

  renderMissions() {
    const readyCrew = getReadyCrew(this.session);
    const available = getAvailableMissions(this.session);
    return `
      <div class="sc-grid">
        ${available.map((mission) => {
          const enoughCrew = readyCrew.length >= mission.crewRequired;
          const enoughCredits = this.session.player.credits >= mission.cost;
          return `
            <article class="sc-card">
              <span class="sc-pill">${escapeHtml(mission.tier)}</span>
              <h2>${escapeHtml(mission.name)}</h2>
              <p>${escapeHtml(mission.educationalFact)}</p>
              <dl class="sc-specs">
                <div><dt>Cost</dt><dd>${money(mission.cost)}</dd></div>
                <div><dt>Duration</dt><dd>${mission.duration}d</dd></div>
                <div><dt>Crew</dt><dd>${mission.crewRequired}</dd></div>
                <div><dt>Odds</dt><dd>${mission.successRate}%</dd></div>
              </dl>
              <button class="sc-button sc-button--primary" data-action="launch" data-mission="${mission.id}" ${!enoughCrew || !enoughCredits ? "disabled" : ""}>
                Launch
              </button>
            </article>
          `;
        }).join("") || `<p class="sc-empty">Research or complete prerequisites to unlock fresh missions.</p>`}
      </div>
    `;
  }

  renderResearch() {
    const active = this.session.player.activeResearch;
    const available = getAvailableResearch(this.session);
    return `
      ${active ? `
        <section class="sc-board">
          <h2>${escapeHtml(active.name)}</h2>
          <p>${escapeHtml(active.category)} research in progress.</p>
          <div class="sc-meter"><span style="width:${progress(active.elapsedDays, active.duration)}%"></span></div>
        </section>
      ` : ""}
      <div class="sc-grid">
        ${available.map((research) => `
          <article class="sc-card">
            <span class="sc-pill">${escapeHtml(research.category)}</span>
            <h2>${escapeHtml(research.name)}</h2>
            <p>${escapeHtml(research.description)}</p>
            <dl class="sc-specs">
              <div><dt>Credits</dt><dd>${money(research.creditCost)}</dd></div>
              <div><dt>Science</dt><dd>${research.scienceCost}</dd></div>
              <div><dt>Time</dt><dd>${research.duration}d</dd></div>
              <div><dt>Tier</dt><dd>${research.tier}</dd></div>
            </dl>
            <button class="sc-button sc-button--primary" data-action="research" data-research="${research.id}" ${active ? "disabled" : ""}>Start</button>
          </article>
        `).join("")}
      </div>
    `;
  }

  renderCrew() {
    return `
      <div class="sc-toolbar">
        <button class="sc-button sc-button--primary" data-action="recruit" data-role="pilot">Recruit Pilot</button>
        <button class="sc-button" data-action="recruit" data-role="engineer">Recruit Engineer</button>
        <button class="sc-button" data-action="recruit" data-role="scientist">Recruit Scientist</button>
      </div>
      <div class="sc-grid sc-grid--crew">
        ${this.session.player.crew.map((crew) => `
          <article class="sc-card sc-crew">
            <div class="sc-avatar">${escapeHtml(crew.avatar)}</div>
            <h2>${escapeHtml(crew.name)}</h2>
            <p>${escapeHtml(crew.role.replaceAll("_", " "))} / ${escapeHtml(crew.status)}</p>
            <dl class="sc-specs">
              <div><dt>Skill</dt><dd>${crew.skillLevel}</dd></div>
              <div><dt>Morale</dt><dd>${crew.morale}</dd></div>
              <div><dt>Health</dt><dd>${crew.health}</dd></div>
              <div><dt>XP</dt><dd>${crew.experience}</dd></div>
            </dl>
            <button class="sc-button" data-action="train" data-crew="${crew.id}" ${crew.status !== "ready" ? "disabled" : ""}>Train</button>
          </article>
        `).join("")}
      </div>
    `;
  }

  renderNetwork() {
    return `
      <div class="sc-command">
        <section class="sc-board">
          <h2>Same WiFi Room</h2>
          <p class="sc-empty">Run the LAN host on the PC, then open the shown address from phones on the same WiFi.</p>
          <div class="sc-room">
            <input id="room-code" maxlength="5" value="${escapeHtml(this.roomCode)}" placeholder="ROOM5" autocomplete="off">
            <button class="sc-button sc-button--primary" data-action="host-room">Create</button>
            <button class="sc-button" data-action="join-room">Join</button>
          </div>
          <p class="sc-status">${escapeHtml(this.networkStatus)}</p>
        </section>
        <section class="sc-board">
          <h2>Players</h2>
          ${this.peers.length
            ? this.peers.map((peer) => `<article class="sc-row"><strong>${escapeHtml(peer.agencyName || peer.playerId)}</strong><span>${escapeHtml(peer.playerId)}</span></article>`).join("")
            : `<p class="sc-empty">No LAN peers connected yet.</p>`}
        </section>
      </div>
    `;
  }

  attachEvents() {
    this.root.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        this.activeTab = button.dataset.tab;
        this.render();
      });
    });

    this.root.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => this.handleAction(button));
    });
  }

  handleAction(button) {
    const action = button.dataset.action;
    if (action === "advance") {
      this.mutate((session) => advanceDays(session, Number(button.dataset.days || 1)), { sync: true });
    }
    if (action === "goto-tab") {
      this.activeTab = button.dataset.targetTab || "Command";
      this.render();
    }
    if (action === "save") {
      this.saveSession();
      this.networkStatus = "Saved on this device";
      this.render();
    }
    if (action === "new") {
      this.session = createInitialSession({ agencyName: this.session.player.agencyName });
      this.orbitState = createOrbitState();
      this.saveSession();
      this.render();
    }
    if (action === "orbit-impulse") {
      this.orbitState = applyImpulse(this.orbitState, button.dataset.burn, 0.62);
      this.render();
    }
    if (action === "orbit-reset") {
      this.orbitState = createOrbitState();
      this.render();
    }
    if (action === "launch") {
      this.mutate((session) => {
        const mission = getAvailableMissions(session).find((item) => item.id === button.dataset.mission);
        const crewIds = getReadyCrew(session).slice(0, mission.crewRequired).map((crew) => crew.id);
        return launchMission(session, mission.id, crewIds);
      }, { sync: true });
    }
    if (action === "research") {
      this.mutate((session) => startResearch(session, button.dataset.research), { sync: true });
    }
    if (action === "recruit") {
      this.mutate((session) => recruitCrew(session, button.dataset.role), { sync: true });
    }
    if (action === "train") {
      this.mutate((session) => trainCrew(session, button.dataset.crew), { sync: true });
    }
    if (action === "host-room") {
      const roomCode = createRoomCode();
      this.roomCode = roomCode;
      this.session.mode = "lan";
      this.client.connect({
        roomCode,
        playerId: this.session.player.id,
        agencyName: this.session.player.agencyName,
      });
      this.render();
    }
    if (action === "join-room") {
      const input = this.root.querySelector("#room-code");
      const roomCode = input?.value?.trim().toUpperCase();
      if (!isValidRoomCode(roomCode)) {
        this.networkStatus = "Enter a 5 character room code";
        this.render();
        return;
      }
      this.roomCode = roomCode;
      this.session.mode = "lan";
      this.client.connect({
        roomCode,
        playerId: this.session.player.id,
        agencyName: this.session.player.agencyName,
      });
      this.render();
    }
  }
}

export default StellarCommandApp;
export { STORAGE_KEY, StellarCommandApp };
