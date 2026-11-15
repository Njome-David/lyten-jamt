// tests/progress/ranks.test.ts
// Unit tests for rank progression and edge thresholds (499/500, etc.).
// Follows SPEC.md section 6 and TASKS.md ### T19.

import { describe, expect, test } from 'vitest';
import { getNextRank, getRankForXp, RANKS } from '../../src/progress/ranks';

describe('ranks and rank boundaries (SPEC.md section 6)', () => {
  test('defines exactly 5 ranks', () => {
    expect(RANKS.length).toBe(5);
    expect(RANKS.map((r) => r.id)).toEqual([
      'space-cadet',
      'mission-specialist',
      'expedition-pilot',
      'base-commander',
      'flight-director',
    ]);
  });

  test('correctly evaluates exact rank boundaries (0, 499, 500, 1499, 1500, 3499, 3500, 6999, 7000)', () => {
    // Space Cadet: 0 - 499
    expect(getRankForXp(0).id).toBe('space-cadet');
    expect(getRankForXp(250).id).toBe('space-cadet');
    expect(getRankForXp(499).id).toBe('space-cadet');

    // Mission Specialist: 500 - 1499
    expect(getRankForXp(500).id).toBe('mission-specialist');
    expect(getRankForXp(1000).id).toBe('mission-specialist');
    expect(getRankForXp(1499).id).toBe('mission-specialist');

    // Expedition Pilot: 1500 - 3499
    expect(getRankForXp(1500).id).toBe('expedition-pilot');
    expect(getRankForXp(2500).id).toBe('expedition-pilot');
    expect(getRankForXp(3499).id).toBe('expedition-pilot');

    // Base Commander: 3500 - 6999
    expect(getRankForXp(3500).id).toBe('base-commander');
    expect(getRankForXp(5000).id).toBe('base-commander');
    expect(getRankForXp(6999).id).toBe('base-commander');

    // NASA Flight Director: 7000+
    expect(getRankForXp(7000).id).toBe('flight-director');
    expect(getRankForXp(12000).id).toBe('flight-director');
  });

  test('getNextRank returns proper succeeding rank or null at maximum rank', () => {
    expect(getNextRank('space-cadet')?.id).toBe('mission-specialist');
    expect(getNextRank('mission-specialist')?.id).toBe('expedition-pilot');
    expect(getNextRank('expedition-pilot')?.id).toBe('base-commander');
    expect(getNextRank('base-commander')?.id).toBe('flight-director');
    expect(getNextRank('flight-director')).toBeNull();
  });
});
