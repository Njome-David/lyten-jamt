/**
 * Engine events and alerts generation & resolution.
 * Pure TypeScript (no React/DOM/Date/Math.random).
 */

import type {
  AlertChoiceSpec,
  AlertSpec,
  Body,
  Difficulty,
  EventKind,
  Flare,
  SolarContext,
} from './types';
import { DIFFICULTY_CONFIG } from './config/balance';
import type { RngFn } from './rng';

/**
 * Filter flares by difficulty cap (easy: A/B/C/M, medium/hard: A/B/C/M/X).
 */
export function getEligibleFlares(pool: Flare[], cap: 'M' | 'X'): Flare[] {
  return pool.filter((f) => {
    const cls = f.classType.toUpperCase();
    if (cap === 'M') {
      return !cls.startsWith('X');
    }
    return true;
  });
}

/**
 * Fallback flare record when solar pool is empty or lacks matching flares.
 */
export function createFallbackFlare(cap: 'M' | 'X', rng: RngFn): Flare {
  const roll = rng();
  let classType = 'C2.1';
  if (roll > 0.6) {
    classType = cap === 'M' ? 'M1.5' : 'X1.0';
  } else if (roll > 0.3) {
    classType = 'M1.0';
  }
  return {
    id: `FLR-SIM-${Math.floor(roll * 10000)}`,
    classType,
    peakTime: '2026-11-15T12:00:00Z',
    activeRegionNum: null,
  };
}

/**
 * Build AlertSpec for a solar flare event.
 */
export function createFlareAlert(
  flare: Flare,
  difficulty: Difficulty,
  baseDose: number,
  canBeTimed: boolean
): AlertSpec {
  const cls = flare.classType.toUpperCase();
  const isX = cls.startsWith('X');
  const timed = isX && canBeTimed;
  const durationSec = timed ? DIFFICULTY_CONFIG[difficulty].timerSec : 0;

  const choices: [AlertChoiceSpec, AlertChoiceSpec, AlertChoiceSpec] = [
    {
      id: 'A',
      label: 'Shield up',
      summary: 'Power -15, dose x0.2',
      tradeoffTag: 'HEAVY POWER, LOW DOSE',
    },
    {
      id: 'B',
      label: 'Shelter crew',
      summary: 'Power -3, dose x0.4, pause step',
      tradeoffTag: 'LOW POWER, DELAY',
    },
    {
      id: 'C',
      label: 'Keep working',
      summary: 'Dose x1.0, advance step',
      tradeoffTag: 'RISKY DOSE, FULL SPEED',
    },
  ];

  return {
    kind: 'flare',
    title: isX ? 'SOLAR FLARE X-CLASS ALERT' : 'SOLAR STORM M-CLASS ALERT',
    description: `Solar radiation spike detected from region ${
      flare.activeRegionNum ?? 'unknown'
    } (${flare.classType}).`,
    timed,
    durationSec,
    flare,
    baseDoseThisTurn: baseDose,
    choices,
  };
}

/**
 * Build AlertSpec for a Martian dust storm.
 */
export function createDustAlert(
  difficulty: Difficulty,
  canBeTimed: boolean
): AlertSpec {
  const timed = canBeTimed;
  const durationSec = timed ? DIFFICULTY_CONFIG[difficulty].timerSec : 15;

  const choices: [AlertChoiceSpec, AlertChoiceSpec, AlertChoiceSpec] = [
    {
      id: 'A',
      label: 'Retract panels',
      summary: 'Solar power 0 for 2 turns, no damage',
      tradeoffTag: 'SAFE BUT ZERO SOLAR',
    },
    {
      id: 'B',
      label: 'Keep panels out',
      summary: 'Solar power x0.5 for 2 turns, 20% risk of panel wear',
      tradeoffTag: 'RISKY SOLAR GENERATION',
    },
    {
      id: 'C',
      label: 'Switch to battery reserve',
      summary: 'Power -10 now, solar generation unchanged',
      tradeoffTag: 'IMMEDIATE POWER DRAIN',
    },
  ];

  return {
    kind: 'dust',
    title: 'MARTIAN DUST STORM ALERT',
    description: 'Atmospheric opacity rising. Dust particles threatening solar arrays.',
    timed,
    durationSec,
    choices,
  };
}

/**
 * Build AlertSpec for equipment fault.
 */
export function createFaultAlert(): AlertSpec {
  const choices: [AlertChoiceSpec, AlertChoiceSpec, AlertChoiceSpec] = [
    {
      id: 'A',
      label: 'Repair now',
      summary: 'Power -8, step does not advance',
      tradeoffTag: 'SAFE REPAIR, LOSS OF TURN',
    },
    {
      id: 'B',
      label: 'Patch system',
      summary: 'Power -3, next fault risk +10%',
      tradeoffTag: 'QUICK FIX, FUTURE RISK',
    },
    {
      id: 'C',
      label: 'Ignore & bypass',
      summary: 'Health -4, step continues',
      tradeoffTag: 'CREW STRAIN, NO DELAY',
    },
  ];

  return {
    kind: 'fault',
    title: 'EQUIPMENT FAULT DETECTED',
    description: 'Hardware anomaly in secondary subsystem. Immediate action recommended.',
    timed: false,
    durationSec: 0,
    choices,
  };
}

/**
 * Determine if an event should trigger and which kind.
 */
export function rollEventKind(
  rng: RngFn,
  turn: number,
  body: Body,
  difficulty: Difficulty,
  solar: SolarContext,
  faultRisk: number
): EventKind {
  // Rule: no event on turn 1
  if (turn <= 1) return 'none';

  // Option's faultRisk forced roll
  if (rng() < faultRisk) {
    return 'fault';
  }

  const pEvent = DIFFICULTY_CONFIG[difficulty].eventRate;
  if (rng() >= pEvent) {
    return 'none';
  }

  const flareWeight =
    solar.level === 'stormy' ? 0.45 : solar.level === 'active' ? 0.3 : 0.15;
  const dustWeight = body === 'mars' ? 0.25 : 0.0;
  const blackoutWeight = body === 'mars' ? 0.15 : 0.0;
  const faultWeight = 0.25;

  const total = flareWeight + dustWeight + blackoutWeight + faultWeight;
  const roll = rng() * total;

  if (roll < flareWeight) return 'flare';
  if (roll < flareWeight + dustWeight) return 'dust';
  if (roll < flareWeight + dustWeight + blackoutWeight) return 'blackout';
  return 'fault';
}
