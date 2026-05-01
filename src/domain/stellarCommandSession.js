import { missions } from "../data/missions.js";
import { FAMOUS_ASTRONAUTS, generateProceduralCrew } from "../data/crew.js";
import { getAllResearch } from "../data/research.js";

const SAVE_VERSION = 2;
const DAY_GRANT_INTERVAL = 30;
const MAX_LOG_ITEMS = 18;

const STARTER_CREW_IDS = [
  "margaret_hamilton",
  "katherine_johnson",
  "sara_sabry",
  "cheick_modibo_diarra",
  "mark_shuttleworth",
  "valentina_tereshkova",
];

const AI_AGENCIES = [
  "Nova Youth Space Club",
  "Lagos Orbital Academy",
  "Cape Town Star Lab",
  "Nairobi Orbit Club",
  "Orbit Arcade Labs",
  "Moonshot High",
];

function clone(value) {
  return structuredClone(value);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function byNewest(a, b) {
  return b.day - a.day || b.id.localeCompare(a.id);
}

function normalizeCrew(raw, index = 0) {
  const stats = raw.stats || raw;
  const role = raw.role || "mission_specialist";
  const name = raw.firstName && raw.lastName
    ? `${raw.firstName} ${raw.lastName}`
    : raw.name || `${raw.firstName || "Nova"} ${raw.lastName || "Pilot"}`;

  return {
    id: raw.id || `crew-${index + 1}`,
    name,
    role,
    avatar: name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    experience: stats.experience ?? 55,
    morale: stats.morale ?? 78,
    health: stats.health ?? 88,
    skillLevel: stats.skillLevel ?? 76,
    status: "ready",
    assignedMissionId: null,
    salary: Math.round((raw.baseSalary || 52000) / 1000),
    recruitmentCost: Math.round((raw.recruitmentCost || 120000) / 1000),
    note: raw.historicalNote || "Fresh from the academy and ready to fly.",
  };
}

function normalizeMission(mission) {
  return {
    ...mission,
    cost: mission.cost,
    reward: Math.round(mission.cost * 1.35 + mission.successRate * 1.5),
    scienceReward: Math.max(18, Math.round(mission.duration * 3 + mission.requiredTechLevel * 12)),
    hypeReward: Math.max(6, Math.round(mission.successRate / 8)),
  };
}

function normalizeResearch(raw) {
  return {
    ...raw,
    creditCost: Math.max(20, Math.round(raw.costs.credits / 1000)),
    scienceCost: raw.costs.science,
  };
}

function getResearchCatalog() {
  return Object.values(getAllResearch()).map(normalizeResearch);
}

function getCompletedMissionIds(player) {
  return new Set(player.completedMissions.map((mission) => mission.missionId));
}

function getCompletedResearchIds(player) {
  return new Set(player.completedResearch);
}

function appendLog(session, event) {
  session.timeline = [
    {
      id: `${session.day}-${event.type}-${Math.random().toString(16).slice(2)}`,
      day: session.day,
      ...event,
    },
    ...session.timeline,
  ].sort(byNewest).slice(0, MAX_LOG_ITEMS);
}

function calculateTechLevel(player) {
  const completed = getCompletedResearchIds(player);
  const tiers = getResearchCatalog()
    .filter((research) => completed.has(research.id))
    .map((research) => research.tier);
  return clamp(1 + Math.max(0, ...tiers), 1, 8);
}

function createPlayer({ agencyName = "Stellar Command", playerId = null } = {}) {
  const starterCrew = STARTER_CREW_IDS
    .map((id, index) => normalizeCrew(FAMOUS_ASTRONAUTS.find((crew) => crew.id === id), index));

  return {
    id: playerId || `player-${crypto.randomUUID?.() || Date.now()}`,
    agencyName,
    credits: 820,
    science: 180,
    reputation: 48,
    hype: 36,
    techLevel: 1,
    score: 0,
    crew: starterCrew,
    activeMissions: [],
    completedMissions: [],
    completedResearch: [],
    activeResearch: null,
  };
}

function createRivals() {
  return AI_AGENCIES.map((agencyName, index) => ({
    id: `rival-${index + 1}`,
    agencyName,
    score: 35 - index * 6,
    techLevel: 1,
    reputation: 42 - index * 3,
    completedMissions: [],
    activeMission: null,
    nextLaunchDay: 7 + index * 4,
  }));
}

export function createInitialSession(options = {}) {
  const session = {
    meta: {
      saveVersion: SAVE_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    mode: options.mode || "solo",
    day: 1,
    speed: 1,
    player: createPlayer(options),
    rivals: createRivals(),
    onlinePlayers: [],
    timeline: [],
    settings: {
      sound: true,
      reducedMotion: false,
    },
  };

  appendLog(session, {
    type: "agency:founded",
    actor: "player",
    title: "Agency founded",
    body: "Pick a mission, assign crew, and start stacking wins.",
  });

  return session;
}

export function hydrateSession(saved) {
  if (!saved || saved.meta?.saveVersion !== SAVE_VERSION) {
    return createInitialSession();
  }
  return saved;
}

export function getAvailableMissions(session) {
  const player = session.player;
  const completed = getCompletedMissionIds(player);
  const active = new Set(player.activeMissions.map((mission) => mission.missionId));

  return missions
    .map(normalizeMission)
    .filter((mission) => mission.requiredTechLevel <= player.techLevel)
    .filter((mission) => !completed.has(mission.id))
    .filter((mission) => !active.has(mission.id))
    .filter((mission) => mission.dependencies.every((id) => completed.has(id)));
}

export function getAvailableResearch(session) {
  const completed = getCompletedResearchIds(session.player);
  const activeId = session.player.activeResearch?.researchId;

  return getResearchCatalog()
    .filter((research) => !completed.has(research.id))
    .filter((research) => research.id !== activeId)
    .filter((research) => research.dependencies.every((id) => completed.has(id)))
    .slice(0, 8);
}

export function getReadyCrew(session) {
  return session.player.crew.filter((crew) => crew.status === "ready");
}

export function calculateSuccessChance(session, mission, crewIds = []) {
  const crew = session.player.crew.filter((member) => crewIds.includes(member.id));
  const crewBonus = crew.length
    ? crew.reduce((sum, member) => sum + member.skillLevel + member.morale + member.health, 0) / crew.length / 300 * 12
    : 0;
  const techBonus = Math.max(0, session.player.techLevel - mission.requiredTechLevel) * 4;
  const hypeBonus = session.player.hype > 70 ? 3 : 0;

  return clamp(Math.round(mission.successRate + crewBonus + techBonus + hypeBonus), 12, 98);
}

export function launchMission(session, missionId, crewIds = [], options = {}) {
  const next = clone(session);
  const mission = getAvailableMissions(next).find((item) => item.id === missionId);

  if (!mission) {
    throw new Error(`Mission is not available: ${missionId}`);
  }
  if (next.player.credits < mission.cost) {
    throw new Error("Not enough credits to launch this mission");
  }
  if (crewIds.length !== mission.crewRequired) {
    throw new Error(`Mission requires ${mission.crewRequired} crew`);
  }

  const selectedCrew = next.player.crew.filter((crew) => crewIds.includes(crew.id));
  if (selectedCrew.length !== crewIds.length || selectedCrew.some((crew) => crew.status !== "ready")) {
    throw new Error("Crew must be ready before launch");
  }

  const successChance = calculateSuccessChance(next, mission, crewIds);
  next.player.credits -= mission.cost;
  next.player.hype = clamp(next.player.hype + 3, 0, 100);

  for (const crew of next.player.crew) {
    if (crewIds.includes(crew.id)) {
      crew.status = "assigned";
      crew.assignedMissionId = mission.id;
    }
  }

  next.player.activeMissions.push({
    id: `${mission.id}-${next.day}`,
    missionId: mission.id,
    name: mission.name,
    tier: mission.tier,
    crewIds,
    elapsedDays: 0,
    duration: mission.duration,
    cost: mission.cost,
    reward: mission.reward,
    scienceReward: mission.scienceReward,
    hypeReward: mission.hypeReward,
    successChance,
    roll: options.rng ? options.rng() : Math.random(),
    status: "active",
  });

  appendLog(next, {
    type: "mission:launched",
    actor: "player",
    title: `${mission.name} launched`,
    body: `${successChance}% success odds. ${mission.educationalFact}`,
  });

  touch(next);
  return next;
}

export function startResearch(session, researchId) {
  const next = clone(session);
  const research = getAvailableResearch(next).find((item) => item.id === researchId);

  if (!research) {
    throw new Error(`Research is not available: ${researchId}`);
  }
  if (next.player.activeResearch) {
    throw new Error("Finish active research before starting another project");
  }
  if (next.player.credits < research.creditCost || next.player.science < research.scienceCost) {
    throw new Error("Not enough science or credits for this research");
  }

  next.player.credits -= research.creditCost;
  next.player.science -= research.scienceCost;
  next.player.activeResearch = {
    researchId,
    name: research.name,
    category: research.category,
    elapsedDays: 0,
    duration: research.duration,
    tier: research.tier,
  };

  appendLog(next, {
    type: "research:started",
    actor: "player",
    title: `${research.name} started`,
    body: research.description,
  });

  touch(next);
  return next;
}

export function recruitCrew(session, role = "mission_specialist") {
  const next = clone(session);
  const crew = normalizeCrew(generateProceduralCrew(role), next.player.crew.length);
  const cost = crew.recruitmentCost;

  if (next.player.credits < cost) {
    throw new Error("Not enough credits to recruit crew");
  }

  next.player.credits -= cost;
  next.player.crew.push(crew);
  appendLog(next, {
    type: "crew:recruited",
    actor: "player",
    title: `${crew.name} joined`,
    body: `${crew.role.replaceAll("_", " ")} recruited for ${cost}M credits.`,
  });

  touch(next);
  return next;
}

export function trainCrew(session, crewId) {
  const next = clone(session);
  const crew = next.player.crew.find((member) => member.id === crewId);

  if (!crew) {
    throw new Error(`Crew member not found: ${crewId}`);
  }
  if (next.player.credits < 30) {
    throw new Error("Not enough credits for training");
  }

  next.player.credits -= 30;
  crew.skillLevel = clamp(crew.skillLevel + 4, 0, 100);
  crew.morale = clamp(crew.morale + 2, 0, 100);
  appendLog(next, {
    type: "crew:trained",
    actor: "player",
    title: `${crew.name} leveled up`,
    body: "Training improved mission odds.",
  });

  touch(next);
  return next;
}

export function advanceDays(session, days = 1, options = {}) {
  let next = clone(session);
  const rng = options.rng || Math.random;

  for (let index = 0; index < days; index += 1) {
    next.day += 1;
    next.player.science += 2 + Math.floor(next.player.techLevel / 2);

    if (next.day % DAY_GRANT_INTERVAL === 0) {
      const grant = 135 + Math.round(next.player.reputation * 1.8);
      next.player.credits += grant;
      appendLog(next, {
        type: "budget:grant",
        actor: "system",
        title: "Public funding arrived",
        body: `${grant}M credits added after a good quarter of space hype.`,
      });
    }

    next = progressResearch(next);
    next = progressMissions(next, rng);
    next = progressRivals(next, rng);
  }

  touch(next);
  return next;
}

function progressResearch(session) {
  const next = session;
  const active = next.player.activeResearch;
  if (!active) return next;

  active.elapsedDays += 1;
  if (active.elapsedDays < active.duration) return next;

  next.player.completedResearch.push(active.researchId);
  next.player.activeResearch = null;
  next.player.techLevel = calculateTechLevel(next.player);
  next.player.score += active.tier * 30;
  next.player.reputation = clamp(next.player.reputation + active.tier * 2, 0, 100);

  appendLog(next, {
    type: "research:completed",
    actor: "player",
    title: `${active.name} unlocked`,
    body: `Tech level is now ${next.player.techLevel}. Bigger missions are on the board.`,
  });

  return next;
}

function progressMissions(session, rng) {
  const next = session;
  const stillActive = [];

  for (const active of next.player.activeMissions) {
    active.elapsedDays += 1;
    if (active.elapsedDays < active.duration) {
      stillActive.push(active);
      continue;
    }

    const success = active.roll <= active.successChance / 100 || rng() <= active.successChance / 100;
    const credits = success ? active.reward : Math.round(active.reward * 0.25);
    const science = success ? active.scienceReward : Math.round(active.scienceReward * 0.45);
    const reputation = success ? active.hypeReward : -Math.max(3, Math.round(active.hypeReward / 2));

    next.player.credits += credits;
    next.player.science += science;
    next.player.reputation = clamp(next.player.reputation + reputation, 0, 100);
    next.player.hype = clamp(next.player.hype + reputation + (success ? 4 : -5), 0, 100);
    next.player.score += success ? active.reward + science : Math.round(science / 2);
    next.player.completedMissions.push({
      missionId: active.missionId,
      name: active.name,
      day: next.day,
      success,
      credits,
      science,
      reputation,
    });

    for (const crew of next.player.crew) {
      if (active.crewIds.includes(crew.id)) {
        crew.status = "ready";
        crew.assignedMissionId = null;
        crew.experience = clamp(crew.experience + (success ? 5 : 2), 0, 100);
        crew.morale = clamp(crew.morale + (success ? 4 : -6), 0, 100);
      }
    }

    appendLog(next, {
      type: "mission:completed",
      actor: "player",
      title: `${active.name} ${success ? "succeeded" : "survived a rough landing"}`,
      body: `${credits}M credits and ${science} science received.`,
      success,
    });
  }

  next.player.activeMissions = stillActive;
  return next;
}

function progressRivals(session, rng) {
  const next = session;

  for (const rival of next.rivals) {
    if (rival.activeMission) {
      rival.activeMission.elapsedDays += 1;
      if (rival.activeMission.elapsedDays >= rival.activeMission.duration) {
        const success = rng() < rival.activeMission.successChance / 100;
        rival.completedMissions.push(rival.activeMission.missionId);
        rival.score += success ? rival.activeMission.reward : Math.round(rival.activeMission.reward / 3);
        rival.reputation = clamp(rival.reputation + (success ? 4 : -2), 0, 100);
        rival.techLevel = clamp(rival.techLevel + (success && rival.completedMissions.length % 3 === 0 ? 1 : 0), 1, 8);
        appendLog(next, {
          type: "rival:mission",
          actor: "rival",
          title: `${rival.agencyName} ${success ? "scored" : "stumbled"}`,
          body: `${rival.activeMission.name} is off their board.`,
          success,
        });
        rival.activeMission = null;
        rival.nextLaunchDay = next.day + 8 + Math.floor(rng() * 10);
      }
      continue;
    }

    if (next.day < rival.nextLaunchDay) continue;

    const completed = new Set(rival.completedMissions);
    const mission = missions
      .map(normalizeMission)
      .filter((item) => item.requiredTechLevel <= rival.techLevel)
      .filter((item) => !completed.has(item.id))
      .filter((item) => item.dependencies.every((id) => completed.has(id)))
      .sort((a, b) => b.reward - a.reward)[0];

    if (!mission) continue;

    rival.activeMission = {
      missionId: mission.id,
      name: mission.name,
      elapsedDays: 0,
      duration: Math.max(3, Math.round(mission.duration * 0.8)),
      reward: mission.reward,
      successChance: clamp(mission.successRate - 4 + rival.techLevel * 2, 20, 96),
    };
    appendLog(next, {
      type: "rival:launch",
      actor: "rival",
      title: `${rival.agencyName} launched`,
      body: mission.name,
    });
  }

  return next;
}

function touch(session) {
  session.meta.updatedAt = new Date().toISOString();
}

export function summarizeSession(session) {
  const availableMissions = getAvailableMissions(session);
  return {
    day: session.day,
    score: session.player.score,
    rank: [session.player, ...session.rivals]
      .map((agency) => ({ id: agency.id, agencyName: agency.agencyName, score: agency.score }))
      .sort((a, b) => b.score - a.score),
    activeMissions: session.player.activeMissions.length,
    availableMissions: availableMissions.length,
    readyCrew: getReadyCrew(session).length,
  };
}

export function getTutorialProgress(session) {
  const player = session.player;
  const hasTrainedCrew = player.crew.some((crew) => crew.skillLevel > 99 || crew.experience > 95);
  const hasExtraCrew = player.crew.length > STARTER_CREW_IDS.length;
  const leading = summarizeSession(session).rank[0]?.id === player.id;

  const steps = [
    {
      id: "read-command",
      title: "Read Mission Control",
      tab: "Command",
      complete: true,
      body: "Credits launch missions, science unlocks research, reputation pulls in better funding, and score decides the league.",
    },
    {
      id: "launch-mission",
      title: "Launch a starter mission",
      tab: "Missions",
      complete: player.activeMissions.length > 0 || player.completedMissions.length > 0,
      body: "Open Missions and launch ISS Supply Mission or Communications Satellite Deployment. The game auto-picks ready crew.",
    },
    {
      id: "complete-mission",
      title: "Bring a mission home",
      tab: "Command",
      complete: player.completedMissions.length > 0,
      body: "Use Advance Day or Fast Week until the mission resolves. Successful missions pay credits, science, rep, and score.",
    },
    {
      id: "start-research",
      title: "Start a research project",
      tab: "Research",
      complete: Boolean(player.activeResearch) || player.completedResearch.length > 0,
      body: "Research spends science and credits now so later mission tiers open up. Basic Rockets is a strong first pick.",
    },
    {
      id: "upgrade-crew",
      title: "Improve the crew bench",
      tab: "Crew",
      complete: hasTrainedCrew || hasExtraCrew,
      body: "Train a ready crew member for better odds, or recruit a specialist when credits are healthy.",
    },
    {
      id: "learn-network",
      title: "Host or join same-WiFi play",
      tab: "Network",
      complete: session.mode === "lan" || session.onlinePlayers.length > 0,
      body: "Run npm run host on the PC, open the LAN URL on phones, then create or join a room code.",
    },
    {
      id: "take-lead",
      title: "Take first place",
      tab: "Command",
      complete: leading,
      body: "Chain missions and research to pass the rival agencies on the league table.",
    },
  ];

  const completed = steps.filter((step) => step.complete).length;
  return {
    completed,
    total: steps.length,
    percent: Math.round((completed / steps.length) * 100),
    nextStep: steps.find((step) => !step.complete) || null,
    steps,
  };
}

export { SAVE_VERSION };
