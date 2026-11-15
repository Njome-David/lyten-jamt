// src/judge/events.ts
// Helper to construct AlertSpec for judge mode event forcing.

import type { AlertSpec, ForcedEventKind, SolarContext } from '../engine/types';
import type { Difficulty } from '../ui/types';
import { createFlareAlert, createDustAlert, createFaultAlert } from '../engine/events';

export function buildForcedAlert(
  kind: ForcedEventKind,
  solar: SolarContext,
  difficulty: Difficulty = 'easy'
): AlertSpec {
  if (kind === 'flare-x') {
    const xFlare = solar.pool.find((f) => f.classType.toUpperCase().startsWith('X')) ?? {
      id: 'flare-forced-x',
      classType: 'X12.0',
      peakTime: '2024-05-14T17:10Z',
      activeRegionNum: 13664,
    };
    return createFlareAlert(xFlare, difficulty, 35, true);
  }

  if (kind === 'flare-m') {
    const mFlare = solar.pool.find((f) => f.classType.toUpperCase().startsWith('M')) ?? {
      id: 'flare-forced-m',
      classType: 'M2.5',
      peakTime: '2026-11-14T08:30Z',
      activeRegionNum: 13664,
    };
    return createFlareAlert(mFlare, difficulty, 15, true);
  }

  if (kind === 'dust') {
    return createDustAlert(difficulty, true);
  }

  if (kind === 'blackout') {
    return {
      kind: 'fault',
      title: 'POWER BLACKOUT IMMINENT',
      description: 'Major power failure! Solar array or battery grid dropping offline.',
      timed: true,
      durationSec: 10,
      choices: [
        {
          id: 'A',
          label: 'Auxiliary Biomass',
          summary: 'Food -8, restore 25 power',
          tradeoffTag: 'BIOMASS DRAIN',
        },
        {
          id: 'B',
          label: 'Shed Life Support',
          summary: 'Air -12, stabilize grid',
          tradeoffTag: 'OXYGEN RISK',
        },
        {
          id: 'C',
          label: 'Emergency Reboot',
          summary: '50% chance recovery, 50% extra drain',
          tradeoffTag: 'GAMBLE',
        },
      ],
    };
  }

  // Fallback: standard hardware fault
  return createFaultAlert();
}
