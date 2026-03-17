/**
 * Mission Data Catalog
 *
 * Contains 20+ real space missions organized across 5 tiers:
 * LEO, Lunar, Inner Solar, Outer Solar, and Deep Space.
 * Each mission includes cost, duration, crew requirements, success rate,
 * educational facts, and unlock dependencies.
 */

export const missions = [
  // ============== LEO (Low Earth Orbit) Missions ==============

  {
    id: "iss-resupply",
    name: "ISS Supply Mission",
    tier: "LEO",
    cost: 62, // million USD
    duration: 5, // days
    crewRequired: 2,
    successRate: 98,
    requiredTechLevel: 1,
    dependencies: [],
    educationalFact:
      "The International Space Station orbits Earth every 90 minutes at 17,500 mph, serving as humanity's laboratory in space.",
  },
  {
    id: "hubble-repair",
    name: "Hubble Space Telescope Repair",
    tier: "LEO",
    cost: 250, // million USD
    duration: 8, // days
    crewRequired: 4,
    successRate: 92,
    requiredTechLevel: 2,
    dependencies: ["iss-resupply"],
    educationalFact:
      "Hubble has discovered that the universe is expanding faster than previously thought, revolutionizing our understanding of dark energy.",
  },
  {
    id: "satellite-deploy",
    name: "Communications Satellite Deployment",
    tier: "LEO",
    cost: 180, // million USD
    duration: 4, // days
    crewRequired: 2,
    successRate: 96,
    requiredTechLevel: 1,
    dependencies: [],
    educationalFact:
      "Modern satellites enable global communications, weather forecasting, and GPS navigation that billions of people rely on daily.",
  },
  {
    id: "eva-training",
    name: "Extended EVA Training Mission",
    tier: "LEO",
    cost: 145, // million USD
    duration: 6, // days
    crewRequired: 3,
    successRate: 94,
    requiredTechLevel: 2,
    dependencies: ["iss-resupply"],
    educationalFact:
      "Astronauts wear spacesuits weighing 280 pounds and require months of underwater training to prepare for spacewalks.",
  },
  {
    id: "debris-removal",
    name: "Space Debris Removal",
    tier: "LEO",
    cost: 220, // million USD
    duration: 7, // days
    crewRequired: 2,
    successRate: 85,
    requiredTechLevel: 3,
    dependencies: ["satellite-deploy", "eva-training"],
    educationalFact:
      "There are over 34,000 pieces of trackable debris in orbit moving at speeds exceeding 17,500 mph, posing collision risks to spacecraft.",
  },

  // ============== Lunar Missions ==============

  {
    id: "lunar-orbit",
    name: "Lunar Orbital Survey",
    tier: "Lunar",
    cost: 1200, // million USD
    duration: 14, // days
    crewRequired: 3,
    successRate: 91,
    requiredTechLevel: 3,
    dependencies: ["iss-resupply"],
    educationalFact:
      "The Moon is the only celestial body beyond Earth that humans have visited, with 12 astronauts having walked its surface.",
  },
  {
    id: "lunar-landing",
    name: "Lunar Landing Mission",
    tier: "Lunar",
    cost: 2800, // million USD
    duration: 21, // days
    crewRequired: 4,
    successRate: 88,
    requiredTechLevel: 4,
    dependencies: ["lunar-orbit"],
    educationalFact:
      "The Apollo 11 landing in 1969 required over 400,000 people and remains humanity's most ambitious human spaceflight achievement.",
  },
  {
    id: "moonbase-construction",
    name: "Moon Base Construction",
    tier: "Lunar",
    cost: 5600, // million USD
    duration: 35, // days
    crewRequired: 6,
    successRate: 75,
    requiredTechLevel: 5,
    dependencies: ["lunar-landing"],
    educationalFact:
      "A sustained lunar base would require self-sufficient life support systems and protection from radiation and micrometeorites.",
  },
  {
    id: "regolith-analysis",
    name: "Lunar Regolith Sample Return",
    tier: "Lunar",
    cost: 2200, // million USD
    duration: 18, // days
    crewRequired: 3,
    successRate: 87,
    requiredTechLevel: 4,
    dependencies: ["lunar-landing"],
    educationalFact:
      "Lunar regolith (moon soil) contains valuable resources including oxygen, water ice, and rare earth elements essential for future exploration.",
  },
  {
    id: "lunar-longterm",
    name: "Long Duration Lunar Stay",
    tier: "Lunar",
    cost: 4200, // million USD
    duration: 60, // days
    crewRequired: 5,
    successRate: 78,
    requiredTechLevel: 5,
    dependencies: ["moonbase-construction"],
    educationalFact:
      "Extended lunar missions require psychological resilience as astronauts experience isolation, extreme temperatures (-233°F to 260°F), and reduced gravity.",
  },

  // ============== Inner Solar System Missions ==============

  {
    id: "venus-probe",
    name: "Venus Atmospheric Probe",
    tier: "Inner Solar",
    cost: 4500, // million USD
    duration: 120, // days
    crewRequired: 0, // Unmanned
    successRate: 72,
    requiredTechLevel: 4,
    dependencies: ["satellite-deploy"],
    educationalFact:
      "Venus has surface temperatures of 900°F (475°C), hot enough to melt lead, making it the hottest planet in our solar system despite being farther from the sun than Mercury.",
  },
  {
    id: "mercury-survey",
    name: "Mercury Surface Survey",
    tier: "Inner Solar",
    cost: 3800, // million USD
    duration: 135, // days
    crewRequired: 0, // Unmanned
    successRate: 68,
    requiredTechLevel: 4,
    dependencies: ["venus-probe"],
    educationalFact:
      "Mercury experiences extreme temperature swings from -290°F at night to 800°F during the day due to its lack of atmosphere and slow rotation.",
  },
  {
    id: "asteroid-mining",
    name: "Asteroid Mining Operation",
    tier: "Inner Solar",
    cost: 6200, // million USD
    duration: 180, // days
    crewRequired: 4,
    successRate: 65,
    requiredTechLevel: 5,
    dependencies: ["debris-removal", "mercury-survey"],
    educationalFact:
      "A single metallic asteroid could contain more platinum, gold, and rare metals than have been mined in all of human history.",
  },
  {
    id: "solar-probe",
    name: "Solar Probe Mission",
    tier: "Inner Solar",
    cost: 3900, // million USD
    duration: 150, // days
    crewRequired: 0, // Unmanned
    successRate: 70,
    requiredTechLevel: 5,
    dependencies: ["venus-probe"],
    educationalFact:
      "The Parker Solar Probe reaches speeds of 586,800 mph near the Sun, making it the fastest object ever created by humanity.",
  },

  // ============== Outer Solar System Missions ==============

  {
    id: "jupiter-explorer",
    name: "Jupiter System Explorer",
    tier: "Outer Solar",
    cost: 8900, // million USD
    duration: 365, // days
    crewRequired: 5,
    successRate: 62,
    requiredTechLevel: 6,
    dependencies: ["lunar-longterm", "asteroid-mining"],
    educationalFact:
      "Jupiter is so massive that 1,300 Earths could fit inside it, and it has a Great Red Spot storm larger than Earth that has raged for at least 350 years.",
  },
  {
    id: "saturn-rings",
    name: "Saturn Rings Study",
    tier: "Outer Solar",
    cost: 7800, // million USD
    duration: 340, // days
    crewRequired: 4,
    successRate: 60,
    requiredTechLevel: 6,
    dependencies: ["jupiter-explorer"],
    educationalFact:
      "Saturn's rings are composed of countless icy particles ranging from dust-sized grains to house-sized chunks, likely remnants of a destroyed moon.",
  },
  {
    id: "neptune-mission",
    name: "Neptune Deep Probe",
    tier: "Outer Solar",
    cost: 9200, // million USD
    duration: 380, // days
    crewRequired: 4,
    successRate: 58,
    requiredTechLevel: 6,
    dependencies: ["saturn-rings"],
    educationalFact:
      "Neptune has the fastest winds in the solar system at 1,200 mph and a Great Dark Spot storm system similar to Jupiter's, though it appeared and disappeared mysteriously.",
  },
  {
    id: "uranus-investigation",
    name: "Uranus Investigation",
    tier: "Outer Solar",
    cost: 8500, // million USD
    duration: 360, // days
    crewRequired: 4,
    successRate: 59,
    requiredTechLevel: 6,
    dependencies: ["saturn-rings"],
    educationalFact:
      "Uranus rotates on its side with an axial tilt of 98 degrees, likely due to a collision with an Earth-sized object billions of years ago.",
  },

  // ============== Deep Space Missions ==============

  {
    id: "alpha-centauri",
    name: "Alpha Centauri Probe",
    tier: "Deep Space",
    cost: 15000, // million USD
    duration: 540, // days in transit/deployment
    crewRequired: 0, // Unmanned
    successRate: 45,
    requiredTechLevel: 7,
    dependencies: ["neptune-mission"],
    educationalFact:
      "Alpha Centauri is the closest star system to Earth at 4.37 light-years away. A spacecraft traveling at current speeds would take 80,000 years to reach it.",
  },
  {
    id: "interstellar-message",
    name: "Interstellar Message Probe",
    tier: "Deep Space",
    cost: 12000, // million USD
    duration: 480, // days in transit/deployment
    crewRequired: 0, // Unmanned
    successRate: 50,
    requiredTechLevel: 7,
    dependencies: ["alpha-centauri"],
    educationalFact:
      "The Voyager Golden Records carry greetings in 55 languages and sounds from Earth into deep space, serving as a message to any advanced civilization we might encounter.",
  },
  {
    id: "deep-observatory",
    name: "Deep Space Observatory",
    tier: "Deep Space",
    cost: 18000, // million USD
    duration: 600, // days
    crewRequired: 6,
    successRate: 42,
    requiredTechLevel: 8,
    dependencies: ["alpha-centauri"],
    educationalFact:
      "The James Webb Space Telescope can observe light from objects over 13 billion light-years away, essentially looking back in time to see the universe's earliest galaxies.",
  },
  {
    id: "exoplanet-survey",
    name: "Exoplanet Survey Mission",
    tier: "Deep Space",
    cost: 14000, // million USD
    duration: 520, // days
    crewRequired: 5,
    successRate: 48,
    requiredTechLevel: 7,
    dependencies: ["interstellar-message"],
    educationalFact:
      "Astronomers have discovered over 5,000 exoplanets, including Earth-sized worlds in habitable zones where liquid water could exist on the surface.",
  },
];

/**
 * Mission tier progression system
 * Defines the hierarchy and unlock order of mission tiers
 */
export const missionTiers = [
  {
    name: "LEO",
    displayName: "Low Earth Orbit",
    level: 1,
    description: "Missions in low Earth orbit around our planet",
    costModifier: 1,
  },
  {
    name: "Lunar",
    displayName: "Lunar Operations",
    level: 2,
    description: "Missions to and around our Moon",
    costModifier: 1.8,
  },
  {
    name: "Inner Solar",
    displayName: "Inner Solar System",
    level: 3,
    description: "Exploration of the inner planets and asteroids",
    costModifier: 3.2,
  },
  {
    name: "Outer Solar",
    displayName: "Outer Solar System",
    level: 4,
    description: "Deep exploration of gas giants and outer planets",
    costModifier: 5.1,
  },
  {
    name: "Deep Space",
    displayName: "Deep Space Exploration",
    level: 5,
    description: "Interstellar probes and extrastellar missions",
    costModifier: 8.5,
  },
];

/**
 * Get a mission by ID
 */
export function getMissionById(missionId) {
  return missions.find((mission) => mission.id === missionId);
}

/**
 * Get missions by tier
 */
export function getMissionsByTier(tierName) {
  return missions.filter((mission) => mission.tier === tierName);
}

/**
 * Get missions available given tech level
 */
export function getAvailableMissions(techLevel) {
  return missions.filter((mission) => mission.requiredTechLevel <= techLevel);
}

/**
 * Check if a mission can be unlocked
 */
export function canUnlockMission(missionId, unlockedMissionIds) {
  const mission = getMissionById(missionId);
  if (!mission) return false;

  // Check if all dependencies are satisfied
  return mission.dependencies.every((depId) =>
    unlockedMissionIds.includes(depId)
  );
}

/**
 * Get tier by name
 */
export function getTierByName(tierName) {
  return missionTiers.find((tier) => tier.name === tierName);
}

/**
 * Calculate total missions count
 */
export const totalMissions = missions.length;

/**
 * Export default object for convenience
 */
export default {
  missions,
  missionTiers,
  getMissionById,
  getMissionsByTier,
  getAvailableMissions,
  canUnlockMission,
  getTierByName,
  totalMissions,
};
