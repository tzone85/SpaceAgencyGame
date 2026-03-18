/**
 * Game Events Data
 *
 * Defines random events that can occur during gameplay.
 * Events present choices to the player with different consequences.
 * Each event has a probability of occurrence and outcome impacts.
 */

export const EVENTS = {
  METEOR_SHOWER: {
    id: 'meteor_shower',
    title: 'Meteor Shower Warning',
    description: 'An unexpected meteor shower is approaching our satellite systems.',
    probability: 0.08,
    choices: [
      {
        text: 'Reinforce satellite protection',
        budgetDelta: -15_000_000,
        moraleDelta: 5,
        description: 'Cost money but protects infrastructure',
      },
      {
        text: 'Risk it and hope for the best',
        budgetDelta: 0,
        moraleDelta: -10,
        description: 'No cost but crew morale drops',
      },
    ],
  },

  FUNDING_CUT: {
    id: 'funding_cut',
    title: 'Government Budget Reduction',
    description: 'Congress votes to reduce space agency funding for the next quarter.',
    probability: 0.05,
    choices: [
      {
        text: 'Accept the cut',
        budgetDelta: -25_000_000,
        moraleDelta: -15,
        description: 'Standard reduction applied',
      },
      {
        text: 'Launch public campaign for support',
        budgetDelta: -5_000_000,
        moraleDelta: 10,
        description: 'Spend to lobby, may restore some funding',
      },
    ],
  },

  DISCOVERY: {
    id: 'discovery',
    title: 'Scientific Discovery',
    description: 'One of our missions discovers something remarkable in space!',
    probability: 0.12,
    choices: [
      {
        text: 'Publish immediately',
        budgetDelta: 20_000_000,
        moraleDelta: 15,
        description: 'Gain prestige and funding boost',
      },
      {
        text: 'Study privately',
        budgetDelta: 0,
        moraleDelta: 5,
        description: 'Keep discovery secret for research advantage',
      },
    ],
  },

  CREW_ILLNESS: {
    id: 'crew_illness',
    title: 'Crew Health Issue',
    description: 'Several crew members are affected by a viral illness.',
    probability: 0.1,
    choices: [
      {
        text: 'Invest in medical facilities',
        budgetDelta: -10_000_000,
        moraleDelta: 10,
        description: 'Expensive but restores crew health quickly',
      },
      {
        text: 'Let nature take its course',
        budgetDelta: 0,
        moraleDelta: -20,
        description: 'Free but crew morale crashes',
      },
    ],
  },

  EQUIPMENT_FAILURE: {
    id: 'equipment_failure',
    title: 'Critical Equipment Failure',
    description: 'A critical piece of equipment in the launch facility has failed.',
    probability: 0.07,
    choices: [
      {
        text: 'Emergency repair contract',
        budgetDelta: -30_000_000,
        moraleDelta: 0,
        description: 'Expensive but restores operations quickly',
      },
      {
        text: 'In-house repair effort',
        budgetDelta: -5_000_000,
        moraleDelta: 5,
        description: 'Slow but cheaper, crew takes pride',
      },
    ],
  },

  TALENT_RECRUITMENT: {
    id: 'talent_recruitment',
    title: 'Top Talent Wants to Join',
    description: 'A world-renowned space expert wants to join our agency.',
    probability: 0.09,
    choices: [
      {
        text: 'Recruit with premium package',
        budgetDelta: -15_000_000,
        moraleDelta: 10,
        description: 'Expensive but adds valuable expertise',
      },
      {
        text: 'Negotiate lower salary',
        budgetDelta: -5_000_000,
        moraleDelta: 2,
        description: 'They might refuse, but cheaper if they accept',
      },
    ],
  },

  SOLAR_FLARE: {
    id: 'solar_flare',
    title: 'Solar Flare Event',
    description: 'A massive solar flare is disrupting communications and power systems.',
    probability: 0.06,
    choices: [
      {
        text: 'Activate protection protocols',
        budgetDelta: -8_000_000,
        moraleDelta: 5,
        description: 'Protect systems from damage',
      },
      {
        text: 'Ride it out',
        budgetDelta: 0,
        moraleDelta: -5,
        description: 'Free but risk system damage',
      },
    ],
  },

  RIVAL_MISSION: {
    id: 'rival_mission',
    title: 'Rival Agency Launches Similar Mission',
    description: 'A competing space agency is launching a similar mission before us.',
    probability: 0.11,
    choices: [
      {
        text: 'Accelerate our timeline',
        budgetDelta: -20_000_000,
        moraleDelta: 10,
        description: 'Speed up at cost, maintain first-mover advantage',
      },
      {
        text: 'Stay the course',
        budgetDelta: 0,
        moraleDelta: -10,
        description: 'Lose prestige but save budget',
      },
    ],
  },

  BREAKTHROUGH_TECHNOLOGY: {
    id: 'breakthrough_tech',
    title: 'Breakthrough in Materials Science',
    description: 'Our research team develops a revolutionary new material.',
    probability: 0.08,
    choices: [
      {
        text: 'Patent and commercialize',
        budgetDelta: 50_000_000,
        moraleDelta: 20,
        description: 'Major revenue boost and morale surge',
      },
      {
        text: 'Use for research only',
        budgetDelta: 0,
        moraleDelta: 5,
        description: 'No profit but improve our capabilities',
      },
    ],
  },

  PUBLIC_RELATIONS: {
    id: 'public_relations',
    title: 'Media Opportunity',
    description: 'A major news outlet wants to feature our space agency.',
    probability: 0.1,
    choices: [
      {
        text: 'Launch PR campaign',
        budgetDelta: -3_000_000,
        moraleDelta: 15,
        description: 'Small investment, big morale boost',
      },
      {
        text: 'Politely decline',
        budgetDelta: 0,
        moraleDelta: 0,
        description: 'No impact either way',
      },
    ],
  },

  SUPPLIER_ISSUE: {
    id: 'supplier_issue',
    title: 'Supplier Contract Dispute',
    description: 'A critical equipment supplier is demanding higher prices.',
    probability: 0.07,
    choices: [
      {
        text: 'Accept new terms',
        budgetDelta: -20_000_000,
        moraleDelta: 0,
        description: 'Maintain supply chain stability',
      },
      {
        text: 'Find new supplier',
        budgetDelta: -10_000_000,
        moraleDelta: -5,
        description: 'Cheaper but supply delays likely',
      },
    ],
  },

  ACCIDENT_NEAR_MISS: {
    id: 'accident_near_miss',
    title: 'Launch Pad Accident (Near Miss)',
    description: 'A near-catastrophic accident is narrowly averted during testing.',
    probability: 0.06,
    choices: [
      {
        text: 'Overhaul safety procedures',
        budgetDelta: -25_000_000,
        moraleDelta: 10,
        description: 'Expensive upgrade, restore crew confidence',
      },
      {
        text: 'Tighten up and continue',
        budgetDelta: -2_000_000,
        moraleDelta: -15,
        description: 'Cheap fix but crew very nervous',
      },
    ],
  },

  COMMUNITY_OUTREACH: {
    id: 'community_outreach',
    title: 'Educational Outreach Opportunity',
    description: 'Local schools want to partner with us for STEM education.',
    probability: 0.09,
    choices: [
      {
        text: 'Invest in program',
        budgetDelta: -5_000_000,
        moraleDelta: 15,
        description: 'Build reputation and inspire next generation',
      },
      {
        text: 'Skip it',
        budgetDelta: 0,
        moraleDelta: -2,
        description: 'No immediate impact',
      },
    ],
  },

  AWARD_RECOGNITION: {
    id: 'award_recognition',
    title: 'International Space Award',
    description: 'Our agency is nominated for a prestigious space award.',
    probability: 0.08,
    choices: [
      {
        text: 'Attend gala and celebrate',
        budgetDelta: -2_000_000,
        moraleDelta: 20,
        description: 'Small cost, huge morale boost and prestige',
      },
      {
        text: 'Send representation only',
        budgetDelta: -500_000,
        moraleDelta: 10,
        description: 'Minimal cost, decent morale boost',
      },
    ],
  },
};

const EVENTS = [
  {
    id: "solar_flare_warning",
    title: "Solar Flare Warning",
    description: "Space Weather Center detected an incoming solar flare that could affect satellites in 2 hours.",
    condition: (state) => state.missions.active.length > 0,
    choices: [
      {
        id: "action_satellites",
        text: "Take emergency action to protect satellites",
        consequences: { budget: -15_000_000, reputation: 15 },
      },
      {
        id: "accept_risk",
        text: "Accept the risk and continue operations",
        consequences: { budget: 0, reputation: -10 },
      },
    ],
  },
  {
    id: "crew_discovery",
    title: "Breakthrough Discovery",
    description: "Your research team made an unexpected discovery about deep space phenomena!",
    condition: (state) => state.research.active !== null,
    choices: [
      {
        id: "publish_immediately",
        text: "Publish immediately for prestige",
        consequences: { budget: 5_000_000, reputation: 25 },
      },
      {
        id: "research_further",
        text: "Research further before publishing",
        consequences: { budget: -10_000_000, reputation: 10 },
      },
    ],
  },
  {
    id: "budget_audit",
    title: "Budget Audit Required",
    description: "Government auditors want to review your spending practices.",
    condition: (state) => state.budget.balance > 100_000_000,
    choices: [
      {
        id: "full_transparency",
        text: "Full transparency with auditors",
        consequences: { budget: -2_000_000, reputation: 20 },
      },
      {
        id: "minimal_disclosure",
        text: "Provide minimal disclosure",
        consequences: { budget: 0, reputation: -15 },
      },
    ],
  },
  {
    id: "equipment_malfunction",
    title: "Critical Equipment Malfunction",
    description: "A key piece of space equipment is showing signs of failure.",
    condition: (state) => state.missions.active.length > 0,
    choices: [
      {
        id: "emergency_repair",
        text: "Launch emergency repair mission",
        consequences: { budget: -25_000_000, reputation: 5 },
      },
      {
        id: "retire_equipment",
        text: "Retire and replace the equipment",
        consequences: { budget: -40_000_000, reputation: 0 },
      },
    ],
  },
  {
    id: "media_coverage",
    title: "Major Media Coverage",
    description: "International media wants to cover your agency's latest achievements!",
    condition: (state) => state.agency.reputation > 60,
    choices: [
      {
        id: "embrace_coverage",
        text: "Embrace the publicity",
        consequences: { budget: 10_000_000, reputation: 30 },
      },
      {
        id: "maintain_privacy",
        text: "Maintain low profile",
        consequences: { budget: 0, reputation: 5 },
      },
    ],
  },
  {
    id: "crew_mutiny",
    title: "Crew Discontent",
    description: "Your crew is expressing concerns about working conditions and compensation.",
    condition: (state) => state.crew.roster.length > 5,
    choices: [
      {
        id: "improve_conditions",
        text: "Improve working conditions and benefits",
        consequences: { budget: -8_000_000, reputation: 10 },
      },
      {
        id: "strict_discipline",
        text: "Enforce strict discipline",
        consequences: { budget: 0, reputation: -20 },
      },
    ],
  },
  {
    id: "asteroid_opportunity",
    title: "Asteroid Mining Opportunity",
    description: "A potentially valuable asteroid has been detected in accessible orbit.",
    condition: (state) => state.budget.balance > 50_000_000,
    choices: [
      {
        id: "launch_mining",
        text: "Launch mining expedition",
        consequences: { budget: -30_000_000, reputation: 20 },
      },
      {
        id: "scientific_study",
        text: "Focus on scientific study instead",
        consequences: { budget: -5_000_000, reputation: 15 },
      },
    ],
  },
  {
    id: "alien_signal",
    title: "Unusual Signal Detected",
    description: "Observatories detected an unusual signal from deep space. Origin unknown.",
    condition: (state) => state.research.active !== null || state.research.completed.length > 0,
    choices: [
      {
        id: "investigate_thoroughly",
        text: "Investigate with all available resources",
        consequences: { budget: -20_000_000, reputation: 25 },
      },
      {
        id: "monitor_passively",
        text: "Monitor passively and gather data",
        consequences: { budget: -2_000_000, reputation: 8 },
      },
    ],
  },
  {
    id: "political_pressure",
    title: "Political Pressure",
    description: "Government officials are pressuring you to cut costs and show results.",
    condition: (state) => state.budget.currentQuarter > 2,
    choices: [
      {
        id: "launch_quick_mission",
        text: "Launch quick mission for quick wins",
        consequences: { budget: -15_000_000, reputation: 20 },
      },
      {
        id: "resist_pressure",
        text: "Resist pressure and stick to long-term plans",
        consequences: { budget: 0, reputation: -10 },
      },
    ],
  },
  {
    id: "climate_initiative",
    title: "Climate Research Initiative",
    description: "International coalition requests your participation in climate research from space.",
    condition: (state) => state.agency.reputation > 50,
    choices: [
      {
        id: "join_initiative",
        text: "Join the climate initiative",
        consequences: { budget: -12_000_000, reputation: 25 },
      },
      {
        id: "decline_participation",
        text: "Decline participation",
        consequences: { budget: 0, reputation: -5 },
      },
    ],
  },
  {
    id: "training_accident",
    title: "Training Accident",
    description: "One of your crew members was injured during a training exercise.",
    condition: (state) => state.crew.training.length > 0,
    choices: [
      {
        id: "upgrade_safety",
        text: "Immediately upgrade safety protocols",
        consequences: { budget: -5_000_000, reputation: 15 },
      },
      {
        id: "minimal_response",
        text: "File incident report and continue",
        consequences: { budget: 0, reputation: -10 },
      },
    ],
  },
  {
    id: "satellite_collision",
    title: "Satellite Collision Risk",
    description: "Space debris warning system detected potential collision with operational satellite.",
    condition: (state) => state.missions.active.length > 0,
    choices: [
      {
        id: "perform_evasion",
        text: "Perform expensive evasive maneuver",
        consequences: { budget: -8_000_000, reputation: 10 },
      },
      {
        id: "accept_collision_risk",
        text: "Accept the collision risk",
        consequences: { budget: 0, reputation: -15 },
      },
    ],
  },
  {
    id: "tech_breakthrough",
    title: "Technology Breakthrough",
    description: "Your engineering team developed a revolutionary new propulsion system concept.",
    condition: (state) => state.research.active !== null,
    choices: [
      {
        id: "fast_track_development",
        text: "Fast-track development and testing",
        consequences: { budget: -18_000_000, reputation: 30 },
      },
      {
        id: "cautious_development",
        text: "Proceed with cautious, methodical approach",
        consequences: { budget: -8_000_000, reputation: 15 },
      },
    ],
  },
  {
    id: "partnership_offer",
    title: "Partnership Opportunity",
    description: "A major aerospace company offers a strategic partnership.",
    condition: (state) => state.agency.reputation > 40,
    choices: [
      {
        id: "accept_partnership",
        text: "Accept partnership with equity sharing",
        consequences: { budget: 20_000_000, reputation: 15 },
      },
      {
        id: "remain_independent",
        text: "Remain independent",
        consequences: { budget: 0, reputation: 5 },
      },
    ],
  },
  {
    id: "supply_chain_issue",
    title: "Supply Chain Disruption",
    description: "A critical component supplier announced unexpected shutdown.",
    condition: (state) => state.missions.active.length > 0,
    choices: [
      {
        id: "find_alternative",
        text: "Quickly find alternative supplier",
        consequences: { budget: -10_000_000, reputation: 10 },
      },
      {
        id: "delay_mission",
        text: "Delay mission until resolved",
        consequences: { budget: -3_000_000, reputation: -10 },
      },
    ],
  },
  {
    id: "crew_anniversary",
    title: "Crew Anniversary Celebration",
    description: "Your agency is celebrating its founding anniversary!",
    condition: (state) => state.crew.roster.length > 3,
    choices: [
      {
        id: "grand_celebration",
        text: "Organize grand celebration event",
        consequences: { budget: -2_000_000, reputation: 20 },
      },
      {
        id: "quiet_remembrance",
        text: "Quiet internal remembrance",
        consequences: { budget: 0, reputation: 5 },
      },
    ],
  },
  {
    id: "atmospheric_mystery",
    title: "Atmospheric Anomaly",
    description: "Unexpected atmospheric phenomena detected near research station.",
    condition: (state) => state.research.active !== null,
    choices: [
      {
        id: "launch_expedition",
        text: "Launch research expedition immediately",
        consequences: { budget: -12_000_000, reputation: 25 },
      },
      {
        id: "schedule_study",
        text: "Schedule a formal research program",
        consequences: { budget: -6_000_000, reputation: 12 },
      },
    ],
  },
];

export default EVENTS;