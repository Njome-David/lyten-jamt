import { describe, expect, it } from 'vitest';
import {
  chooseBotAlert,
  chooseBotOption,
  runBotBatch,
  simulateSingleBotRun,
  type BotType,
} from '../src/engine/bots';
import { createRun } from '../src/engine/reducer';
import { mulberry32 } from '../src/engine/rng';
import { getSolarContext } from '../src/data/solar';
import type { AlertSpec } from '../src/engine/types';

describe('Engine Bots and Game Balance Simulation (T14)', () => {
  const solar = getSolarContext('recent');
  const rng = mulberry32(42);

  const baselineRun = createRun(
    {
      seed: 100,
      body: 'moon',
      missionId: 'relay',
      siteId: 'shackleton',
      difficulty: 'medium',
      loadout: {
        crew: 3,
        power: 'panels',
        shield: 'standard',
        food: 'rations',
      },
      totalSteps: 6,
    },
    solar
  );

  it('verifies bot option selection logic for all strategies', () => {
    // 1. Random bot yields valid options
    const styles = ['fast', 'balanced', 'careful'];
    const randomChoice = chooseBotOption(baselineRun, 'travel', solar, 'random', rng);
    expect(styles).toContain(randomChoice);

    // 2. Greedy power bot picks option with highest net power
    const greedyChoice = chooseBotOption(baselineRun, 'travel', solar, 'greedy-power', rng);
    expect(styles).toContain(greedyChoice);

    // 3. Balanced bot balances power, life support, and pace
    const balancedChoice = chooseBotOption(baselineRun, 'travel', solar, 'balanced', rng);
    expect(balancedChoice).toBe('balanced');

    // 4. Balanced bot speeds up when life support is critically low
    const lowAirState = {
      ...baselineRun,
      meters: { ...baselineRun.meters, air: 25, power: 40 },
    };
    const lowAirChoice = chooseBotOption(lowAirState, 'travel', solar, 'balanced', rng);
    expect(lowAirChoice).toBe('fast');

    // 5. Balanced bot conserves power when battery is near empty
    const lowPowerState = {
      ...baselineRun,
      meters: { ...baselineRun.meters, power: 10 },
    };
    const lowPowerChoice = chooseBotOption(lowPowerState, 'travel', solar, 'balanced', rng);
    expect(lowPowerChoice).toBe('careful');
  });

  it('verifies alert decision strategies across bots', () => {
    const flareAlert: AlertSpec = {
      kind: 'flare',
      title: 'SOLAR FLARE M-CLASS ALERT',
      description: 'M-class flare detected',
      timed: false,
      durationSec: 0,
      baseDoseThisTurn: 35,
      choices: [
        { id: 'A', label: 'Shield up', summary: 'Power -15, dose x0.2', tradeoffTag: 'SAFE' },
        { id: 'B', label: 'Shelter crew', summary: 'Power -3, dose x0.4', tradeoffTag: 'DELAY' },
        { id: 'C', label: 'Keep working', summary: 'Dose x1.0', tradeoffTag: 'RISKY' },
      ],
    };

    // Greedy power strictly refuses to spend power (picks C)
    const greedyAlertChoice = chooseBotAlert(baselineRun, flareAlert, 'greedy-power', rng);
    expect(greedyAlertChoice).toBe('C');

    // Balanced bot shields up when power is available
    const balancedAlertChoice = chooseBotAlert(baselineRun, flareAlert, 'balanced', rng);
    expect(balancedAlertChoice).toBe('A');

    // Random bot yields valid choice or EXPIRED on timed
    const randomAlertChoice = chooseBotAlert(baselineRun, flareAlert, 'random', rng);
    expect(['A', 'B', 'C', 'EXPIRED']).toContain(randomAlertChoice);
  });

  it('ensures single bot simulation is strictly deterministic and adheres to safety invariants', () => {
    const params = {
      seed: 8888,
      body: 'moon' as const,
      siteId: 'shackleton' as const,
      missionId: 'relay' as const,
      difficulty: 'medium' as const,
      loadout: {
        crew: 3 as const,
        power: 'panels' as const,
        shield: 'standard' as const,
        food: 'rations' as const,
      },
      solar,
      botType: 'balanced' as BotType,
    };

    const runA = simulateSingleBotRun(params);
    const runB = simulateSingleBotRun(params);

    // Deterministic results
    expect(runA.status).toBe(runB.status);
    expect(runA.stepIndex).toBe(runB.stepIndex);
    expect(runA.meters).toEqual(runB.meters);

    // Invariants
    expect(runA.stepIndex).toBeLessThanOrEqual(6);
    expect(runA.meters.power).toBeGreaterThanOrEqual(0);
    expect(runA.meters.power).toBeLessThanOrEqual(100);
    expect(runA.meters.air).toBeGreaterThanOrEqual(0);
    expect(runA.meters.air).toBeLessThanOrEqual(100);
    expect(runA.meters.health).toBeGreaterThanOrEqual(0);
    expect(runA.meters.health).toBeLessThanOrEqual(100);
    expect(runA.meters.food).toBeGreaterThanOrEqual(0);
    expect(runA.meters.food).toBeLessThanOrEqual(100);
  });

  it('verifies batch simulation aggregates and bounds checks across 50 runs', () => {
    const stats = runBotBatch('balanced', 'easy', 50, solar, 2000);

    expect(stats.totalRuns).toBe(50);
    expect(stats.wins + stats.losses).toBe(50);
    expect(stats.maxStepsObserved).toBeLessThanOrEqual(6);
    expect(stats.allMetersWithinBounds).toBe(true);
    expect(stats.winRatePercent).toBeGreaterThanOrEqual(60);
  });
});
