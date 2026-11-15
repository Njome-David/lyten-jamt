/**
 * Game balance configuration constants and formulas.
 * Single source of truth for GAME rules (SPEC.md section 4).
 * Pure TypeScript (no React/DOM/Date/Math.random).
 */

import type {
  Archetype,
  Body,
  Difficulty,
  Loadout,
  Meters,
  OptionStyle,
  SolarLevel,
  StepOptionDef,
} from '../types';

export const MAX_LOADOUT_BUDGET = 10;

export const LOADOUT_COSTS = {
  crew: {
    2: 2,
    3: 3,
    4: 4,
  },
  power: {
    panels: 2,
    batteries: 3,
  },
  shield: {
    standard: 1,
    reinforced: 3,
  },
  food: {
    rations: 1,
    hydroponics: 3,
  },
} as const;

export function getLoadoutCost(loadout: Loadout): number {
  return (
    LOADOUT_COSTS.crew[loadout.crew] +
    LOADOUT_COSTS.power[loadout.power] +
    LOADOUT_COSTS.shield[loadout.shield] +
    LOADOUT_COSTS.food[loadout.food]
  );
}

export function isLoadoutValid(loadout: Loadout): boolean {
  return getLoadoutCost(loadout) <= MAX_LOADOUT_BUDGET;
}

export interface DifficultyConfig {
  consume: number;
  dose: number;
  eventRate: number;
  flareCap: 'M' | 'X';
  timerSec: number;
  marsDelayTurns: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    consume: 0.8,
    dose: 0.8,
    eventRate: 0.5,
    flareCap: 'M',
    timerSec: 15,
    marsDelayTurns: 1,
  },
  medium: {
    consume: 1.0,
    dose: 1.0,
    eventRate: 0.65,
    flareCap: 'X',
    timerSec: 12,
    marsDelayTurns: 2,
  },
  hard: {
    consume: 1.2,
    dose: 1.2,
    eventRate: 0.8,
    flareCap: 'X',
    timerSec: 10,
    marsDelayTurns: 3,
  },
};

export const INITIAL_METERS_CONFIG: Record<
  Loadout['power'],
  Record<Loadout['food'], Meters>
> = {
  panels: {
    rations: { power: 70, air: 100, health: 100, food: 100 },
    hydroponics: { power: 70, air: 100, health: 100, food: 60 },
  },
  batteries: {
    rations: { power: 100, air: 100, health: 100, food: 100 },
    hydroponics: { power: 100, air: 100, health: 100, food: 60 },
  },
};

export const BASE_STEP_OPTIONS: Record<OptionStyle, StepOptionDef> = {
  fast: {
    style: 'fast',
    power: -14,
    air: -1,
    food: -1,
    faultRisk: 0.25,
    outdoor: true,
  },
  balanced: {
    style: 'balanced',
    power: -9,
    air: -2,
    food: -2,
    faultRisk: 0.12,
    outdoor: true,
  },
  careful: {
    style: 'careful',
    power: -5,
    air: -4,
    food: -3,
    faultRisk: 0.05,
    outdoor: true,
  },
};

export const ARCHETYPE_POWER_MULTIPLIER: Record<Archetype, number> = {
  travel: 1.2,
  drill: 1.4,
  deploy: 1.0,
  experiment: 1.0,
  repair: 0.8,
  uplink: 0.6,
};

export const ARCHETYPE_OUTDOOR: Record<Archetype, boolean> = {
  travel: true,
  deploy: true,
  drill: true,
  experiment: false,
  repair: false,
  uplink: false,
};

export const BASE_RADIATION_DOSE: Record<SolarLevel, number> = {
  calm: 1.0,
  active: 2.5,
  stormy: 4.0,
};

export const SHIELD_DOSE_MULTIPLIER: Record<Loadout['shield'], number> = {
  standard: 1.0,
  reinforced: 0.4,
};

export const BODY_DOSE_MULTIPLIER: Record<Body, number> = {
  moon: 1.0,
  mars: 0.7,
};

export const STEP_ACTION_DURATIONS_MS: Record<OptionStyle, number> = {
  fast: 2500,
  balanced: 3500,
  careful: 5000,
};
