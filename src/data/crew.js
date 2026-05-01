/**
 * Crew Data & Templates
 *
 * Defines crew member templates, roles with stat ranges, famous astronauts,
 * stat definitions, procedural name generation, and cost information.
 */

// Crew role templates with stat ranges
export const CREW_ROLES = {
  PILOT: {
    id: "pilot",
    name: "Pilot",
    description: "Expert pilot with exceptional flying skills",
    statRanges: {
      experience: { min: 40, max: 100 },
      morale: { min: 65, max: 100 },
      health: { min: 75, max: 100 },
      skillLevel: { min: 80, max: 100 },
    },
    baseSalary: 50000,
    recruitmentCost: 100000,
  },
  ENGINEER: {
    id: "engineer",
    name: "Engineer",
    description: "Technical expert specialized in spacecraft systems",
    statRanges: {
      experience: { min: 35, max: 95 },
      morale: { min: 60, max: 95 },
      health: { min: 70, max: 100 },
      skillLevel: { min: 75, max: 95 },
    },
    baseSalary: 45000,
    recruitmentCost: 85000,
  },
  SCIENTIST: {
    id: "scientist",
    name: "Scientist",
    description:
      "Research specialist conducting space exploration and analysis",
    statRanges: {
      experience: { min: 45, max: 100 },
      morale: { min: 70, max: 100 },
      health: { min: 75, max: 100 },
      skillLevel: { min: 78, max: 100 },
    },
    baseSalary: 48000,
    recruitmentCost: 95000,
  },
  MEDICAL_OFFICER: {
    id: "medical_officer",
    name: "Medical Officer",
    description: "Medical professional responsible for crew health and safety",
    statRanges: {
      experience: { min: 50, max: 100 },
      morale: { min: 65, max: 100 },
      health: { min: 80, max: 100 },
      skillLevel: { min: 82, max: 100 },
    },
    baseSalary: 52000,
    recruitmentCost: 110000,
  },
  MISSION_SPECIALIST: {
    id: "mission_specialist",
    name: "Mission Specialist",
    description: "Versatile specialist supporting various mission objectives",
    statRanges: {
      experience: { min: 30, max: 90 },
      morale: { min: 60, max: 95 },
      health: { min: 70, max: 100 },
      skillLevel: { min: 70, max: 90 },
    },
    baseSalary: 42000,
    recruitmentCost: 75000,
  },
};

// Crew stat definitions
export const CREW_STATS = {
  EXPERIENCE: {
    id: "experience",
    name: "Experience",
    description: "Years of space mission experience (0-100)",
    min: 0,
    max: 100,
    impact: "Increases efficiency and reliability in missions",
  },
  MORALE: {
    id: "morale",
    name: "Morale",
    description: "Psychological well-being and motivation (0-100)",
    min: 0,
    max: 100,
    impact: "Affects performance, productivity, and retention",
  },
  HEALTH: {
    id: "health",
    name: "Health",
    description: "Physical fitness and medical status (0-100)",
    min: 0,
    max: 100,
    impact: "Determines mission capability and absence risk",
  },
  SKILL_LEVEL: {
    id: "skillLevel",
    name: "Skill Level",
    description: "Proficiency in role-specific tasks (0-100)",
    min: 0,
    max: 100,
    impact: "Directly affects mission success rate and quality",
  },
};

// Famous astronauts as recruitable crew members
export const FAMOUS_ASTRONAUTS = [
  {
    id: "neil_armstrong",
    firstName: "Neil",
    lastName: "Armstrong",
    role: CREW_ROLES.PILOT.id,
    stats: {
      experience: 95,
      morale: 85,
      health: 82,
      skillLevel: 98,
    },
    recruitmentCost: 250000,
    baseSalary: 75000,
    historicalNote: "First person to walk on the Moon",
  },
  {
    id: "buzz_aldrin",
    firstName: "Buzz",
    lastName: "Aldrin",
    role: CREW_ROLES.SCIENTIST.id,
    stats: {
      experience: 93,
      morale: 88,
      health: 80,
      skillLevel: 96,
    },
    recruitmentCost: 240000,
    baseSalary: 72000,
    historicalNote: "Lunar Module Eagle pilot and Moon walker",
  },
  {
    id: "yuri_gagarin",
    firstName: "Yuri",
    lastName: "Gagarin",
    role: CREW_ROLES.PILOT.id,
    stats: {
      experience: 92,
      morale: 90,
      health: 85,
      skillLevel: 94,
    },
    recruitmentCost: 245000,
    baseSalary: 73000,
    historicalNote: "First human in space",
  },
  {
    id: "valentina_tereshkova",
    firstName: "Valentina",
    lastName: "Tereshkova",
    role: CREW_ROLES.PILOT.id,
    stats: {
      experience: 91,
      morale: 89,
      health: 84,
      skillLevel: 93,
    },
    recruitmentCost: 235000,
    baseSalary: 71000,
    historicalNote: "First woman in space",
  },
  {
    id: "alan_turing",
    firstName: "Alan",
    lastName: "Turing",
    role: CREW_ROLES.ENGINEER.id,
    stats: {
      experience: 88,
      morale: 75,
      health: 70,
      skillLevel: 99,
    },
    recruitmentCost: 200000,
    baseSalary: 68000,
    historicalNote: "Computing pioneer and systems engineer",
  },
  {
    id: "margaret_hamilton",
    firstName: "Margaret",
    lastName: "Hamilton",
    role: CREW_ROLES.ENGINEER.id,
    stats: {
      experience: 90,
      morale: 92,
      health: 86,
      skillLevel: 97,
    },
    recruitmentCost: 220000,
    baseSalary: 70000,
    historicalNote: "Apollo guidance computer software architect",
  },
  {
    id: "katherine_johnson",
    firstName: "Katherine",
    lastName: "Johnson",
    role: CREW_ROLES.SCIENTIST.id,
    stats: {
      experience: 95,
      morale: 88,
      health: 83,
      skillLevel: 99,
    },
    recruitmentCost: 230000,
    baseSalary: 72000,
    historicalNote: "NASA mathematician and space research pioneer",
  },
  {
    id: "wernher_von_braun",
    firstName: "Wernher",
    lastName: "Von Braun",
    role: CREW_ROLES.ENGINEER.id,
    stats: {
      experience: 92,
      morale: 80,
      health: 78,
      skillLevel: 98,
    },
    recruitmentCost: 240000,
    baseSalary: 75000,
    historicalNote: "Rocket scientist and systems engineer",
  },
  {
    id: "mark_shuttleworth",
    firstName: "Mark",
    lastName: "Shuttleworth",
    role: CREW_ROLES.PILOT.id,
    stats: {
      experience: 89,
      morale: 88,
      health: 84,
      skillLevel: 94,
    },
    recruitmentCost: 230000,
    baseSalary: 70000,
    historicalNote: "South African entrepreneur and the first African from an independent nation to travel to space",
  },
  {
    id: "sara_sabry",
    firstName: "Sara",
    lastName: "Sabry",
    role: CREW_ROLES.SCIENTIST.id,
    stats: {
      experience: 88,
      morale: 92,
      health: 86,
      skillLevel: 94,
    },
    recruitmentCost: 225000,
    baseSalary: 69000,
    historicalNote: "Egyptian engineer and the first African woman to travel to space",
  },
  {
    id: "cheick_modibo_diarra",
    firstName: "Cheick",
    lastName: "Diarra",
    role: CREW_ROLES.ENGINEER.id,
    stats: {
      experience: 91,
      morale: 87,
      health: 82,
      skillLevel: 96,
    },
    recruitmentCost: 215000,
    baseSalary: 68000,
    historicalNote: "Malian astrophysicist who worked on NASA planetary missions including Mars Pathfinder",
  },
];

// Name generation pools for procedural crew
export const NAME_POOLS = {
  firstNames: [
    "Alex",
    "Bailey",
    "Casey",
    "Dakota",
    "Ellis",
    "Finley",
    "Gabriel",
    "Harper",
    "Indigo",
    "Jordan",
    "Kelly",
    "Logan",
    "Morgan",
    "Noah",
    "Olivia",
    "Parker",
    "Quinn",
    "Riley",
    "Sam",
    "Taylor",
    "Unai",
    "Victoria",
    "Wade",
    "Xander",
    "Yara",
    "Zach",
    "Adrian",
    "Blake",
    "Cameron",
    "Dana",
    "Evan",
    "Flynn",
    "Grace",
    "Hunter",
    "Iris",
    "Juno",
    "Kai",
    "Luna",
    "Max",
    "Nova",
    "Orion",
    "Phoenix",
    "Quinn",
    "River",
    "Sage",
    "Taylor",
    "Unity",
    "Vega",
    "Willow",
    "Xander",
    "Yuki",
    "Zara",
    "Amina",
    "Amara",
    "Ayanda",
    "Chidi",
    "Ife",
    "Kofi",
    "Kwame",
    "Lindiwe",
    "Makena",
    "Mpho",
    "Nandi",
    "Neo",
    "Nomsa",
    "Sizwe",
    "Tendai",
    "Thandi",
    "Zanele",
    "Zola",
  ],
  lastNames: [
    "Adams",
    "Baker",
    "Carter",
    "Davis",
    "Ellis",
    "Foster",
    "Graham",
    "Harris",
    "Irving",
    "Jackson",
    "Kelly",
    "Lambert",
    "Murphy",
    "Nelson",
    "O'Brien",
    "Parker",
    "Quinn",
    "Richards",
    "Stewart",
    "Thompson",
    "Underwood",
    "Vaughn",
    "Walker",
    "Xavier",
    "Young",
    "Zimmerman",
    "Anderson",
    "Bennett",
    "Chen",
    "Donnelly",
    "Emerson",
    "Finch",
    "Garcia",
    "Hayes",
    "Ingram",
    "Jensen",
    "Khan",
    "Lewis",
    "Mitchell",
    "Norton",
    "Oconnor",
    "Patterson",
    "Quincy",
    "Roberts",
    "Santos",
    "Turner",
    "Underhill",
    "Vance",
    "Wells",
    "Xavier",
    "York",
    "Zeppelin",
    "Abebe",
    "Adebayo",
    "Chiume",
    "Diallo",
    "Diarra",
    "Diop",
    "Dlamini",
    "El-Sayed",
    "Hassan",
    "Kamau",
    "Maseko",
    "Mensah",
    "Mthembu",
    "Ndlovu",
    "Nkrumah",
    "Okafor",
    "Okonkwo",
    "Tshabalala",
  ],
};

/**
 * Generate a random crew member with procedural stats
 * @param {string} roleId - The role ID to generate for
 * @returns {Object} A generated crew member
 */
export function generateProceduralCrew(roleId) {
  const role = Object.values(CREW_ROLES).find((r) => r.id === roleId);
  if (!role) {
    throw new Error(`Invalid role ID: ${roleId}`);
  }

  const firstNameIndex = Math.floor(
    Math.random() * NAME_POOLS.firstNames.length,
  );
  const lastNameIndex = Math.floor(Math.random() * NAME_POOLS.lastNames.length);

  const firstName = NAME_POOLS.firstNames[firstNameIndex];
  const lastName = NAME_POOLS.lastNames[lastNameIndex];

  const stats = {};
  Object.entries(role.statRanges).forEach(([statKey, range]) => {
    stats[statKey] = Math.floor(
      Math.random() * (range.max - range.min + 1) + range.min,
    );
  });

  return {
    id: `crew_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    firstName,
    lastName,
    role: roleId,
    stats,
    baseSalary: role.baseSalary,
    recruitmentCost: role.recruitmentCost,
    isRecruited: false,
  };
}

/**
 * Get a template for creating a new crew member of a specific role
 * @param {string} roleId - The role ID
 * @returns {Object} A crew role template
 */
export function getCrewRoleTemplate(roleId) {
  const role = Object.values(CREW_ROLES).find((r) => r.id === roleId);
  if (!role) {
    throw new Error(`Invalid role ID: ${roleId}`);
  }
  return { ...role };
}

/**
 * Get all crew roles
 * @returns {Array} Array of all crew role templates
 */
export function getAllCrewRoles() {
  return Object.values(CREW_ROLES);
}

/**
 * Get all crew stat definitions
 * @returns {Array} Array of all crew stat definitions
 */
export function getAllCrewStats() {
  return Object.values(CREW_STATS);
}

/**
 * Get a specific crew stat definition
 * @param {string} statId - The stat ID
 * @returns {Object} The crew stat definition
 */
export function getCrewStatDefinition(statId) {
  const stat = Object.values(CREW_STATS).find((s) => s.id === statId);
  if (!stat) {
    throw new Error(`Invalid stat ID: ${statId}`);
  }
  return { ...stat };
}

/**
 * Get famous astronaut by ID
 * @param {string} id - The astronaut ID
 * @returns {Object} The famous astronaut data
 */
export function getFamousAstronaut(id) {
  const astronaut = FAMOUS_ASTRONAUTS.find((a) => a.id === id);
  if (!astronaut) {
    throw new Error(`Astronaut not found: ${id}`);
  }
  return {
    ...astronaut,
    stats: { ...astronaut.stats },
  };
}

/**
 * Get all famous astronauts
 * @returns {Array} Array of all famous astronauts
 */
export function getAllFamousAstronauts() {
  return FAMOUS_ASTRONAUTS.map((a) => ({
    ...a,
    stats: { ...a.stats },
  }));
}

export default {
  CREW_ROLES,
  CREW_STATS,
  FAMOUS_ASTRONAUTS,
  NAME_POOLS,
  generateProceduralCrew,
  getCrewRoleTemplate,
  getAllCrewRoles,
  getAllCrewStats,
  getCrewStatDefinition,
  getFamousAstronaut,
  getAllFamousAstronauts,
};
