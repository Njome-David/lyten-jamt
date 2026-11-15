// tests/progress/streak.test.ts
// Unit tests for streak tracking logic.

import { expect, test, describe } from 'vitest';
import { recordDayActivity, getDaysDifference } from '../../src/progress/streak';
import type { PlayerStreak } from '../../src/progress/types';

describe('recordDayActivity', () => {
  test('initial day creates streak count 1 and no joker', () => {
    const result = recordDayActivity({ count: 0, lastDay: '', jokerReady: false }, '2026-11-15');
    expect(result.streak).toEqual({ count: 1, lastDay: '2026-11-15', jokerReady: false });
    expect(result.usedJoker).toBe(false);
    expect(result.streakReset).toBe(false);
    expect(result.isNewDay).toBe(true);
  });

  test('consecutive days increase streak and recharge joker at 7', () => {
    const streak: PlayerStreak = { count: 6, lastDay: '2026-11-14', jokerReady: false };
    const res = recordDayActivity(streak, '2026-11-15');
    expect(res.streak.count).toBe(7);
    expect(res.streak.jokerReady).toBe(true); // recharged
  });

  test('missed one day with joker consumes it and keeps streak', () => {
    const streak: PlayerStreak = { count: 5, lastDay: '2026-11-13', jokerReady: true };
    const res = recordDayActivity(streak, '2026-11-15'); // diff 2
    expect(res.usedJoker).toBe(true);
    expect(res.streak.count).toBe(6);
    expect(res.streak.jokerReady).toBe(false);
  });

  test('missed one day without joker resets streak', () => {
    const streak: PlayerStreak = { count: 5, lastDay: '2026-11-13', jokerReady: false };
    const res = recordDayActivity(streak, '2026-11-15');
    expect(res.streakReset).toBe(true);
    expect(res.streak.count).toBe(1);
    expect(res.streak.jokerReady).toBe(false);
  });

  test('diff <=0 (same day) does not change streak', () => {
    const streak: PlayerStreak = { count: 3, lastDay: '2026-11-15', jokerReady: false };
    const res = recordDayActivity(streak, '2026-11-15');
    expect(res.isNewDay).toBe(false);
    expect(res.streak).toEqual(streak);
  });
});

describe('getDaysDifference', () => {
  test('calculates correct day difference', () => {
    expect(getDaysDifference('2026-11-01', '2026-11-03')).toBe(2);
    expect(getDaysDifference('2026-12-31', '2027-01-01')).toBe(1);
  });
});
