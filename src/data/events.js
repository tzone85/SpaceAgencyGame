/**
 * Random Events Data
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

export default EVENTS;
