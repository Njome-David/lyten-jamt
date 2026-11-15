// src/progress/streak.ts
// Pure streak calculation with joker shield protection.
// Conforms to SPEC.md section 6:
// - Day-based (YYYY-MM-DD local)
// - Joker shield: 1 automatic save of a missed day (diff === 2)
// - Recharges after reaching a 7-day streak

import type { SaveStreak } from '../engine/types';

export function getLocalDayString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDayDifference(prevDay: string, today: string): number {
  if (!prevDay || !today) return 999;
  const [y1, m1, d1] = prevDay.split('-').map(Number);
  const [y2, m2, d2] = today.split('-').map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 999;

  const date1 = Date.UTC(y1, m1 - 1, d1);
  const date2 = Date.UTC(y2, m2 - 1, d2);
  const msDiff = date2 - date1;
  return Math.round(msDiff / (24 * 60 * 60 * 1000));
}

export function updateStreak(
  streak: SaveStreak,
  today: string = getLocalDayString()
): { streak: SaveStreak; usedJoker: boolean } {
  if (!streak.lastDay || streak.count <= 0) {
    return {
      streak: {
        count: 1,
        lastDay: today,
        jokerReady: streak.jokerReady ?? true,
      },
      usedJoker: false,
    };
  }

  const diff = parseDayDifference(streak.lastDay, today);

  // Same day: return untouched
  if (diff <= 0) {
    return {
      streak,
      usedJoker: false,
    };
  }

  // Consecutive day
  if (diff === 1) {
    const nextCount = streak.count + 1;
    return {
      streak: {
        count: nextCount,
        lastDay: today,
        jokerReady: nextCount >= 7 ? true : streak.jokerReady,
      },
      usedJoker: false,
    };
  }

  // Missed exactly 1 day (diff === 2) and joker shield is ready
  if (diff === 2 && streak.jokerReady) {
    const nextCount = streak.count + 1;
    return {
      streak: {
        count: nextCount,
        lastDay: today,
        jokerReady: false,
      },
      usedJoker: true,
    };
  }

  // Broken streak (more than 1 day missed or joker already spent)
  return {
    streak: {
      count: 1,
      lastDay: today,
      jokerReady: streak.jokerReady,
    },
    usedJoker: false,
  };
}
