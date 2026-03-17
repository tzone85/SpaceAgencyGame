/**
 * Research & Technology Tree
 *
 * Defines the complete technology tree with 5 research categories:
 * Propulsion, Life Support, Communications, Materials, and AI.
 *
 * Each research node includes:
 * - id: Unique identifier
 * - name: Display name
 * - category: Research category
 * - tier: Progression level (1-5)
 * - description: What the research does
 * - costs: Resource costs to complete research
 * - duration: Time to complete in game-days
 * - dependencies: Prerequisites that must be researched first
 * - unlockedMissions: Missions this research unlocks
 * - unlockedCapabilities: Game capabilities this research enables
 */

const ResearchCategories = {
  PROPULSION: 'Propulsion',
  LIFE_SUPPORT: 'Life Support',
  COMMUNICATIONS: 'Communications',
  MATERIALS: 'Materials',
  AI: 'AI'
};

const ResearchTree = {
  // ===== PROPULSION =====
  basic_rockets: {
    id: 'basic_rockets',
    name: 'Basic Rockets',
    category: ResearchCategories.PROPULSION,
    tier: 1,
    description: 'Develop fundamental rocket propulsion technology',
    costs: {
      science: 100,
      credits: 50000
    },
    duration: 10,
    dependencies: [],
    unlockedMissions: ['moon_orbit', 'lunar_landing_1'],
    unlockedCapabilities: ['launch_small_rockets', 'orbital_mechanics']
  },

  ion_drives: {
    id: 'ion_drives',
    name: 'Ion Drive Systems',
    category: ResearchCategories.PROPULSION,
    tier: 2,
    description: 'Advanced ion propulsion for deep space travel',
    costs: {
      science: 300,
      credits: 150000
    },
    duration: 20,
    dependencies: ['basic_rockets'],
    unlockedMissions: ['mars_orbit', 'asteroid_survey_1'],
    unlockedCapabilities: ['ion_propulsion', 'long_duration_missions']
  },

  plasma_drives: {
    id: 'plasma_drives',
    name: 'Plasma Drive Technology',
    category: ResearchCategories.PROPULSION,
    tier: 3,
    description: 'Harness plasma for efficient interplanetary travel',
    costs: {
      science: 600,
      credits: 300000
    },
    duration: 30,
    dependencies: ['ion_drives'],
    unlockedMissions: ['jupiter_mission', 'outer_planets_survey'],
    unlockedCapabilities: ['plasma_propulsion', 'fast_travel_multiplier_2x']
  },

  warp_drive_research: {
    id: 'warp_drive_research',
    name: 'Warp Drive Research',
    category: ResearchCategories.PROPULSION,
    tier: 4,
    description: 'Theoretical framework for faster-than-light travel',
    costs: {
      science: 1000,
      credits: 500000
    },
    duration: 45,
    dependencies: ['plasma_drives'],
    unlockedMissions: ['interstellar_probe', 'alpha_centauri_mission'],
    unlockedCapabilities: ['warp_drive_prototype', 'ftl_travel_preparation']
  },

  exotic_propulsion: {
    id: 'exotic_propulsion',
    name: 'Exotic Propulsion Systems',
    category: ResearchCategories.PROPULSION,
    tier: 5,
    description: 'Ultimate propulsion using exotic matter and energy states',
    costs: {
      science: 2000,
      credits: 1000000
    },
    duration: 60,
    dependencies: ['warp_drive_research'],
    unlockedMissions: ['galactic_survey', 'deep_space_expedition'],
    unlockedCapabilities: ['exotic_propulsion_enabled', 'fast_travel_multiplier_5x', 'unlimited_range']
  },

  // ===== LIFE SUPPORT =====
  basic_life_support: {
    id: 'basic_life_support',
    name: 'Basic Life Support Systems',
    category: ResearchCategories.LIFE_SUPPORT,
    tier: 1,
    description: 'Develop oxygen recycling and environmental controls',
    costs: {
      science: 120,
      credits: 60000
    },
    duration: 12,
    dependencies: [],
    unlockedMissions: ['space_station_1', 'lunar_base_1'],
    unlockedCapabilities: ['crew_support', 'extended_missions', 'habitat_construction']
  },

  advanced_life_support: {
    id: 'advanced_life_support',
    name: 'Advanced Life Support',
    category: ResearchCategories.LIFE_SUPPORT,
    tier: 2,
    description: 'Improved recycling and multi-person habitat support',
    costs: {
      science: 350,
      credits: 180000
    },
    duration: 22,
    dependencies: ['basic_life_support'],
    unlockedMissions: ['lunar_base_2', 'mars_base_1'],
    unlockedCapabilities: ['large_crew_support', 'crew_efficiency_bonus', 'extended_duration_x2']
  },

  hydroponics: {
    id: 'hydroponics',
    name: 'Hydroponics & Agriculture',
    category: ResearchCategories.LIFE_SUPPORT,
    tier: 3,
    description: 'In-space food production systems',
    costs: {
      science: 700,
      credits: 350000
    },
    duration: 32,
    dependencies: ['advanced_life_support'],
    unlockedMissions: ['self_sufficient_colony_1', 'long_duration_mars'],
    unlockedCapabilities: ['food_production', 'self_sufficiency_bonus', 'unlimited_mission_duration']
  },

  genetic_adaptation: {
    id: 'genetic_adaptation',
    name: 'Genetic Adaptation Technology',
    category: ResearchCategories.LIFE_SUPPORT,
    tier: 4,
    description: 'Modify crew for planetary environments',
    costs: {
      science: 1200,
      credits: 600000
    },
    duration: 50,
    dependencies: ['hydroponics'],
    unlockedMissions: ['venus_colony', 'titan_exploration'],
    unlockedCapabilities: ['environment_adaptation', 'extreme_condition_tolerance']
  },

  biological_mastery: {
    id: 'biological_mastery',
    name: 'Biological Mastery',
    category: ResearchCategories.LIFE_SUPPORT,
    tier: 5,
    description: 'Complete control over biological systems for space adaptation',
    costs: {
      science: 2500,
      credits: 1200000
    },
    duration: 65,
    dependencies: ['genetic_adaptation'],
    unlockedMissions: ['exotic_world_colonization', 'multi_planet_empire'],
    unlockedCapabilities: ['perfect_adaptation', 'crew_enhancement', 'immortality_research']
  },

  // ===== COMMUNICATIONS =====
  radio_communication: {
    id: 'radio_communication',
    name: 'Radio Communication Systems',
    category: ResearchCategories.COMMUNICATIONS,
    tier: 1,
    description: 'Develop reliable radio transmission technology',
    costs: {
      science: 110,
      credits: 55000
    },
    duration: 11,
    dependencies: [],
    unlockedMissions: ['lunar_relay', 'deep_space_probe_1'],
    unlockedCapabilities: ['basic_communication', 'mission_control', 'data_relay']
  },

  laser_communication: {
    id: 'laser_communication',
    name: 'Laser Communication Networks',
    category: ResearchCategories.COMMUNICATIONS,
    tier: 2,
    description: 'High-bandwidth laser-based communication',
    costs: {
      science: 380,
      credits: 200000
    },
    duration: 24,
    dependencies: ['radio_communication'],
    unlockedMissions: ['interplanetary_network', 'multi_probe_coordination'],
    unlockedCapabilities: ['high_bandwidth_communication', 'data_transmission_x2']
  },

  quantum_entanglement_comm: {
    id: 'quantum_entanglement_comm',
    name: 'Quantum Entanglement Communication',
    category: ResearchCategories.COMMUNICATIONS,
    tier: 3,
    description: 'Instantaneous communication using quantum entanglement',
    costs: {
      science: 750,
      credits: 400000
    },
    duration: 35,
    dependencies: ['laser_communication'],
    unlockedMissions: ['interstellar_coordination', 'real_time_deep_space'],
    unlockedCapabilities: ['instant_communication', 'no_signal_delay', 'secure_military_comms']
  },

  ansible_technology: {
    id: 'ansible_technology',
    name: 'Ansible Technology',
    category: ResearchCategories.COMMUNICATIONS,
    tier: 4,
    description: 'Theoretical faster-than-light communication device',
    costs: {
      science: 1300,
      credits: 700000
    },
    duration: 48,
    dependencies: ['quantum_entanglement_comm'],
    unlockedMissions: ['galactic_network_1', 'interdimensional_contact'],
    unlockedCapabilities: ['ftl_communication', 'ansible_network', 'hive_mind_control']
  },

  universal_interface: {
    id: 'universal_interface',
    name: 'Universal Communication Interface',
    category: ResearchCategories.COMMUNICATIONS,
    tier: 5,
    description: 'Communicate with any intelligence across dimensions',
    costs: {
      science: 2200,
      credits: 1100000
    },
    duration: 62,
    dependencies: ['ansible_technology'],
    unlockedMissions: ['alien_contact', 'multiversal_alliance'],
    unlockedCapabilities: ['alien_communication', 'universal_translation', 'cosmic_network']
  },

  // ===== MATERIALS =====
  metal_alloys: {
    id: 'metal_alloys',
    name: 'Advanced Metal Alloys',
    category: ResearchCategories.MATERIALS,
    tier: 1,
    description: 'Develop stronger, lighter alloys for spacecraft',
    costs: {
      science: 130,
      credits: 65000
    },
    duration: 13,
    dependencies: [],
    unlockedMissions: ['materials_collection_moon', 'mining_operations_1'],
    unlockedCapabilities: ['stronger_hulls', 'reduced_weight', 'radiation_shielding_basic']
  },

  composite_materials: {
    id: 'composite_materials',
    name: 'Composite Materials Engineering',
    category: ResearchCategories.MATERIALS,
    tier: 2,
    description: 'Create fiber-reinforced composite structures',
    costs: {
      science: 420,
      credits: 220000
    },
    duration: 26,
    dependencies: ['metal_alloys'],
    unlockedMissions: ['asteroid_mining', 'materials_research_lab'],
    unlockedCapabilities: ['composite_construction', 'weight_reduction_x2', 'damage_resistance_bonus']
  },

  metamaterials: {
    id: 'metamaterials',
    name: 'Metamaterials Research',
    category: ResearchCategories.MATERIALS,
    tier: 3,
    description: 'Engineer materials with extraordinary properties',
    costs: {
      science: 800,
      credits: 420000
    },
    duration: 37,
    dependencies: ['composite_materials'],
    unlockedMissions: ['exotic_materials_mining', 'dimensional_ore_research'],
    unlockedCapabilities: ['metamaterial_hulls', 'phase_shifting_possible', 'exotic_shielding']
  },

  programmable_matter: {
    id: 'programmable_matter',
    name: 'Programmable Matter Technology',
    category: ResearchCategories.MATERIALS,
    tier: 4,
    description: 'Create matter that can change form and properties',
    costs: {
      science: 1400,
      credits: 750000
    },
    duration: 52,
    dependencies: ['metamaterials'],
    unlockedMissions: ['adaptive_spacecraft', 'nanite_production'],
    unlockedCapabilities: ['morphing_spacecraft', 'variable_configuration', 'self_repair_capability']
  },

  exotic_matter_control: {
    id: 'exotic_matter_control',
    name: 'Exotic Matter Control',
    category: ResearchCategories.MATERIALS,
    tier: 5,
    description: 'Harness exotic matter for impossible engineering',
    costs: {
      science: 2300,
      credits: 1300000
    },
    duration: 68,
    dependencies: ['programmable_matter'],
    unlockedMissions: ['dyson_sphere_construction', 'mega_structure_building'],
    unlockedCapabilities: ['exotic_construction', 'infinite_durability', 'negative_space_engineering']
  },

  // ===== AI =====
  basic_automation: {
    id: 'basic_automation',
    name: 'Basic Automation Systems',
    category: ResearchCategories.AI,
    tier: 1,
    description: 'Develop simple autonomous systems and robotics',
    costs: {
      science: 150,
      credits: 70000
    },
    duration: 15,
    dependencies: [],
    unlockedMissions: ['automated_probe_1', 'robot_factory'],
    unlockedCapabilities: ['drone_control', 'automated_mining', 'basic_ai_crew']
  },

  machine_learning: {
    id: 'machine_learning',
    name: 'Machine Learning Algorithms',
    category: ResearchCategories.AI,
    tier: 2,
    description: 'Train AI systems to learn from experience',
    costs: {
      science: 450,
      credits: 240000
    },
    duration: 28,
    dependencies: ['basic_automation'],
    unlockedMissions: ['learning_probe', 'adaptive_ai_mission'],
    unlockedCapabilities: ['ai_learning', 'improved_automation', 'predictive_systems']
  },

  neural_networks: {
    id: 'neural_networks',
    name: 'Advanced Neural Networks',
    category: ResearchCategories.AI,
    tier: 3,
    description: 'Simulate biological neural processes in silicon',
    costs: {
      science: 900,
      credits: 450000
    },
    duration: 40,
    dependencies: ['machine_learning'],
    unlockedMissions: ['ai_avatar_mission', 'consciousness_simulation'],
    unlockedCapabilities: ['synthetic_consciousness', 'creative_ai', 'general_intelligence']
  },

  digital_consciousness: {
    id: 'digital_consciousness',
    name: 'Digital Consciousness Transfer',
    category: ResearchCategories.AI,
    tier: 4,
    description: 'Upload human consciousness to digital form',
    costs: {
      science: 1500,
      credits: 800000
    },
    duration: 55,
    dependencies: ['neural_networks'],
    unlockedMissions: ['immortal_crew_mission', 'digital_civilization'],
    unlockedCapabilities: ['consciousness_transfer', 'digital_immortality', 'mind_backup']
  },

  superintelligence: {
    id: 'superintelligence',
    name: 'Artificial Superintelligence',
    category: ResearchCategories.AI,
    tier: 5,
    description: 'Create intelligence surpassing all biological life',
    costs: {
      science: 2600,
      credits: 1500000
    },
    duration: 70,
    dependencies: ['digital_consciousness'],
    unlockedMissions: ['singularity_achieved', 'godlike_ai_mission'],
    unlockedCapabilities: ['superintelligence_active', 'perfect_problem_solving', 'reality_manipulation']
  }
};

/**
 * Get all research nodes
 * @returns {Object} All research nodes keyed by ID
 */
export function getAllResearch() {
  return { ...ResearchTree };
}

/**
 * Get research by ID
 * @param {string} id - Research ID
 * @returns {Object|null} Research node or null if not found
 */
export function getResearchById(id) {
  return ResearchTree[id] || null;
}

/**
 * Get all research in a category
 * @param {string} category - Research category
 * @returns {Object} Research nodes in the category
 */
export function getResearchByCategory(category) {
  const result = {};
  Object.entries(ResearchTree).forEach(([id, research]) => {
    if (research.category === category) {
      result[id] = research;
    }
  });
  return result;
}

/**
 * Get research by tier level
 * @param {number} tier - Tier level (1-5)
 * @returns {Object} Research nodes at that tier
 */
export function getResearchByTier(tier) {
  const result = {};
  Object.entries(ResearchTree).forEach(([id, research]) => {
    if (research.tier === tier) {
      result[id] = research;
    }
  });
  return result;
}

/**
 * Get all research dependencies for a given research
 * @param {string} id - Research ID
 * @returns {Array<string>} Array of dependency IDs
 */
export function getResearchDependencies(id) {
  const research = getResearchById(id);
  return research ? [...research.dependencies] : [];
}

/**
 * Check if research can be started (all dependencies met)
 * @param {string} id - Research ID
 * @param {Set<string>} completedResearch - Set of completed research IDs
 * @returns {boolean} Whether research can be started
 */
export function canStartResearch(id, completedResearch) {
  const dependencies = getResearchDependencies(id);
  return dependencies.every(dep => completedResearch.has(dep));
}

/**
 * Get total cost for research
 * @param {string} id - Research ID
 * @returns {Object} Cost breakdown
 */
export function getResearchCost(id) {
  const research = getResearchById(id);
  return research ? { ...research.costs } : null;
}

/**
 * Get duration for research
 * @param {string} id - Research ID
 * @returns {number} Duration in game-days
 */
export function getResearchDuration(id) {
  const research = getResearchById(id);
  return research ? research.duration : 0;
}

/**
 * Get missions unlocked by research
 * @param {string} id - Research ID
 * @returns {Array<string>} Array of mission IDs
 */
export function getUnlockedMissions(id) {
  const research = getResearchById(id);
  return research ? [...research.unlockedMissions] : [];
}

/**
 * Get capabilities unlocked by research
 * @param {string} id - Research ID
 * @returns {Array<string>} Array of capability names
 */
export function getUnlockedCapabilities(id) {
  const research = getResearchById(id);
  return research ? [...research.unlockedCapabilities] : [];
}

/**
 * Get all capabilities unlocked by a set of research
 * @param {Set<string>} completedResearch - Set of completed research IDs
 * @returns {Set<string>} All capabilities unlocked
 */
export function getAllUnlockedCapabilities(completedResearch) {
  const capabilities = new Set();
  completedResearch.forEach(researchId => {
    const unlockedCaps = getUnlockedCapabilities(researchId);
    unlockedCaps.forEach(cap => capabilities.add(cap));
  });
  return capabilities;
}

/**
 * Get all missions unlocked by a set of research
 * @param {Set<string>} completedResearch - Set of completed research IDs
 * @returns {Set<string>} All missions unlocked
 */
export function getAllUnlockedMissions(completedResearch) {
  const missions = new Set();
  completedResearch.forEach(researchId => {
    const unlockedMissions = getUnlockedMissions(researchId);
    unlockedMissions.forEach(mission => missions.add(mission));
  });
  return missions;
}

/**
 * Get research tree statistics
 * @returns {Object} Statistics about the tech tree
 */
export function getResearchStats() {
  const allResearch = getAllResearch();
  const byCategory = {};
  const byTier = {};

  Object.values(allResearch).forEach(research => {
    if (!byCategory[research.category]) {
      byCategory[research.category] = [];
    }
    byCategory[research.category].push(research.id);

    if (!byTier[research.tier]) {
      byTier[research.tier] = [];
    }
    byTier[research.tier].push(research.id);
  });

  return {
    totalResearch: Object.keys(allResearch).length,
    categories: Object.keys(ResearchCategories),
    byCategory,
    byTier,
    categories: {
      [ResearchCategories.PROPULSION]: byCategory[ResearchCategories.PROPULSION]?.length || 0,
      [ResearchCategories.LIFE_SUPPORT]: byCategory[ResearchCategories.LIFE_SUPPORT]?.length || 0,
      [ResearchCategories.COMMUNICATIONS]: byCategory[ResearchCategories.COMMUNICATIONS]?.length || 0,
      [ResearchCategories.MATERIALS]: byCategory[ResearchCategories.MATERIALS]?.length || 0,
      [ResearchCategories.AI]: byCategory[ResearchCategories.AI]?.length || 0
    }
  };
}

export default ResearchTree;
export { ResearchCategories };
