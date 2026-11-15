// tests/progress/badges.test.ts
// Unit tests for badge condition checking and unlocking.

import { expect, test, describe } from 'vitest';
import { isBadgeConditionMet, evaluateNewBadges } from '../../src/progress/badges';
import type { SaveV1 } from '../../src/progress/types';

describe('badge conditions', () => {
  const baseSave: SaveV1 = {
    v: 1,
    profile: { codename: 'Astronaut', avatarId: 'avatar-1' },
    xp: 0,
    streak: { count: 0, lastDay: '', jokerReady: false },
    badges: [],
    best: {
      // sample best record structure (missionId -> {easy, medium, hard})
      'moon-relay': { easy: 3, medium: 3, hard: 3 },
      'mars-relay': { easy: 2, medium: 2, hard: 2 },
    },
    stats: { winStreak: 0, pressureWinsClean: 0, welcomeGiven: false, missionsPlayed: 0, missionsWon: 0 },
    seen: [],
    settings: { muted: false, extraTime: false, speed: 1 },
  };

  test('steady-observer unlocked at streak >=5', () => {
    const s = { ...baseSave, streak: { count: 5, lastDay: '', jokerReady: false } };
    expect(isBadgeConditionMet('steady-observer', s)).toBe(true);
  });

  test('flawless-pilot unlocked at winStreak >=3', () => {
    const s = { ...baseSave, stats: { ...baseSave.stats, winStreak: 3 } };
    expect(isBadgeConditionMet('flawless-pilot', s)).toBe(true);
  });

  test('space-veteran unlocked at winStreak >=7', () => {
    const s = { ...baseSave, stats: { ...baseSave.stats, winStreak: 7 } };
    expect(isBadgeConditionMet('space-veteran', s)).toBe(true);
  });

  test('ice-cold unlocked at pressureWinsClean >=10', () => {
    const s = { ...baseSave, stats: { ...baseSave.stats, pressureWinsClean: 10 } };
    expect(isBadgeConditionMet('ice-cold', s)).toBe(true);
  });

  test('complete-constellation unlocked when any mission has 3 stars all difficulties', () => {
    const s = { ...baseSave };
    expect(isBadgeConditionMet('complete-constellation', s)).toBe(true);
  });

  test('evaluateNewBadges returns newly unlocked IDs', () => {
    const s = { ...baseSave, streak: { count: 5, lastDay: '', jokerReady: false }, stats: { ...baseSave.stats, winStreak: 7, pressureWinsClean: 10 } };
    const newIds = evaluateNewBadges(s);
    expect(newIds).toEqual(expect.arrayContaining(['steady-observer', 'space-veteran', 'ice-cold', 'complete-constellation']));
  });
});
