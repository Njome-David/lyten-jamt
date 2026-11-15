// src/progress/streak.ts
// Day-based streak tracking with automatic joker shield.
// Follows SPEC.md section 6 and docs/fr/01-implementation.md section 7.2.

import type { PlayerStreak } from './types';

export const STREAK_XP_MULTIPLIER = 1.2;
export const STREAK_BONUS_MIN_DAYS = 3;
export const JOKER_RECHARGE_DAYS = 7;

/**
 * Calculates day difference between two YYYY-MM-DD date strings.
 */
export function getDaysDifference(dayA: string, dayB: string): number {
  if (!dayA || !dayB) return 0;
  const parseDate = (d: string) => {
    const parts = d.split('-').map(Number);
    const year = parts[0] ?? 2026;
    const month = (parts[1] ?? 1) - 1;
    const day = parts[2] ?? 1;
    return new Date(Date.UTC(year, month, day)).getTime();
  };
  const msA = parseDate(dayA);
  const msB = parseDate(dayB);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((msB - msA) / msPerDay);
}

/**
 * Returns whether a streak is eligible for the 1.2x mission XP bonus.
 */
export function hasStreakBonus(streakCount: number): boolean {
  return streakCount >= STREAK_BONUS_MIN_DAYS;
}

export interface StreakUpdateResult {
  streak: PlayerStreak;
  usedJoker: boolean;
  streakReset: boolean;
  isNewDay: boolean;
}

/**
 * Updates player streak for a given local calendar day (YYYY-MM-DD).
 *
 * Rules:
 * - Same day: no change.
 * - Consecutive day (diff = 1): streak + 1.
 * - Missed 1 day (diff = 2):
 *   - If jokerReady is true: consume joker shield, save streak!
 *   - If jokerReady is false: reset streak to 1.
 * - Missed > 1 day (diff > 2): reset streak to 1.
 * - Whenever streak reaches a 7-day milestone (>= 7), the joker recharges.
 */
export function recordDayActivity(
  current: PlayerStreak,
  today: string
): StreakUpdateResult {
  if (!current.lastDay) {
    return {
      streak: { count: 1, lastDay: today, jokerReady: false },
      usedJoker: false,
      streakReset: false,
      isNewDay: true,
    };
  }

  const diff = getDaysDifference(current.lastDay, today);

  if (diff <= 0) {
    // Same day or clock skew: keep current
    return {
      streak: { ...current },
      usedJoker: false,
      streakReset: false,
      isNewDay: false,
    };
  }

  if (diff === 1) {
    const nextCount = current.count + 1;
    const jokerReady = nextCount >= JOKER_RECHARGE_DAYS ? true : current.jokerReady;
    return {
      streak: { count: nextCount, lastDay: today, jokerReady },
      usedJoker: false,
      streakReset: false,
      isNewDay: true,
    };
  }

  if (diff === 2 && current.jokerReady) {
    // 1 missed day protected by joker
    const nextCount = current.count + 1;
    return {
      streak: { count: nextCount, lastDay: today, jokerReady: false },
      usedJoker: true,
      streakReset: false,
      isNewDay: true,
    };
  }

  // Missed days with no joker or > 1 missed day: reset to 1
  return {
    streak: { count: 1, lastDay: today, jokerReady: false },
    usedJoker: false,
    streakReset: true,
    isNewDay: true,
  };
}
