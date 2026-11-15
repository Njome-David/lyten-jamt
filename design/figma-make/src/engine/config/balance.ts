import type { Archetype, Body, Loadout, OptionStyle, SolarLevel, StepOptionDef } from "../types";

export const LOADOUT_BUDGET = 10;

export const LOADOUT_COSTS = {
  crew: { 2: 2, 3: 3, 4: 4 } as const,
  power: { panels: 2, batteries: 3 } as const,
  shield: { standard: 1, reinforced: 3 } as const,
  food: { rations: 1, hydroponics: 3 } as const,
};

export const STARTING_METERS = {
  air: 100,
  health: 100,
  power: { panels: 70, batteries: 100 } as const,
  food: { rations: 100, hydroponics: 60 } as const,
};

export const PASSIVE_RULES = {
  airPerCrew: 3,
  rationsFoodPerCrew: 2,
  hydroponicsEarlyPowerCost: 4,
  hydroponicsEarlyAirCost: 2,
  hydroponicsHarvestPerCrew: 1,
  solarBaseGain: 12,
  shackletonLightMult: 1.2,
  dustStormLightMult: 0.5,
  marsLightMult: 0.6,
  reinforcedShieldPowerUpkeep: 3,
  strainThreshold: 20,
  strainHealthPenalty: 3,
};

export const RADIATION_RULES = {
  baseDose: {
    calm: 1,
    active: 2.5,
    stormy: 4,
  } satisfies Record<SolarLevel, number>,
  outdoorMult: 1.5,
  shieldMult: {
    standard: 1.0,
    reinforced: 0.4,
  } satisfies Record<Loadout["shield"], number>,
  bodyMult: {
    moon: 1.0,
    mars: 0.7,
  } satisfies Record<Body, number>,
};

export const BASE_STEP_OPTIONS: Record<OptionStyle, Omit<StepOptionDef, "outdoor">> = {
  fast: {
    style: "fast",
    power: -14,
    air: -1,
    food: -1,
    faultRisk: 0.25,
  },
  balanced: {
    style: "balanced",
    power: -9,
    air: -2,
    food: -2,
    faultRisk: 0.12,
  },
  careful: {
    style: "careful",
    power: -5,
    air: -4,
    food: -3,
    faultRisk: 0.05,
  },
};

export const ARCHETYPE_RULES: Record<
  Archetype,
  { powerMult: number; outdoor: boolean; crewBonusApplies: boolean }
> = {
  travel: { powerMult: 1.2, outdoor: true, crewBonusApplies: true },
  drill: { powerMult: 1.4, outdoor: true, crewBonusApplies: true },
  deploy: { powerMult: 1.0, outdoor: true, crewBonusApplies: true },
  experiment: { powerMult: 1.0, outdoor: false, crewBonusApplies: false },
  repair: { powerMult: 0.8, outdoor: false, crewBonusApplies: true },
  uplink: { powerMult: 0.6, outdoor: false, crewBonusApplies: false },
};

export const EVENT_WEIGHTS = {
  flare: {
    calm: 0.15,
    active: 0.3,
    stormy: 0.45,
  } satisfies Record<SolarLevel, number>,
  dustMars: 0.25,
  blackoutMars: 0.15,
  fault: 0.25,
};

export const MAX_TIMED_ALERTS = 2;
