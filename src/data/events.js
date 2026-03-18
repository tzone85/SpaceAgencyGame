/**
 * Game Events Data
 *
 * Defines random events that can occur during gameplay.
 * Events present choices to the player with different consequences.
 * Events are condition-based and trigger when game state matches the condition.
 */

const EVENTS = [
  {
    id: "solar_flare_warning",
    title: "Solar Flare Warning",
    description:
      "Space Weather Center detected an incoming solar flare that could affect satellites in 2 hours.",
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
    description:
      "Your research team made an unexpected discovery about deep space phenomena!",
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
    description:
      "International media wants to cover your agency's latest achievements!",
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
    description:
      "Your crew is expressing concerns about working conditions and compensation.",
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
    description:
      "A potentially valuable asteroid has been detected in accessible orbit.",
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
    description:
      "Observatories detected an unusual signal from deep space. Origin unknown.",
    condition: (state) =>
      state.research.active !== null || state.research.completed.length > 0,
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
    description:
      "Government officials are pressuring you to cut costs and show results.",
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
    description:
      "International coalition requests your participation in climate research from space.",
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
    description:
      "One of your crew members was injured during a training exercise.",
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
    description:
      "Space debris warning system detected potential collision with operational satellite.",
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
    description:
      "Your engineering team developed a revolutionary new propulsion system concept.",
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
    description:
      "Unexpected atmospheric phenomena detected near research station.",
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
