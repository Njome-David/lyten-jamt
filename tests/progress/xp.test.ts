// tests/progress/xp.test.ts
// Unit tests for XP calculation.

import { expect, test, describe } from 'vitest';
import { calculateProgressionXp } from '../../src/progress/xp';

describe('calculateProgressionXp', () => {
  test('welcome bonus only', () => {
    const res = calculateProgressionXp({
      isWon: false,
      finalHealth: 0,
      timedDecisionsWon: 0,
      stars: 0,
      giveWelcome: true,
      streakCount: 0,
    });
    expect(res.missionXp).toBe(25);
    expect(res.total).toBe(75);
  });

  test('won mission without streak', () => {
    const res = calculateProgressionXp({
      isWon: true,
      finalHealth: 70,
      timedDecisionsWon: 2,
      stars: 3,
      giveWelcome: false,
      streakCount: 2,
    });
    // 100 (objective) + 80 (healthy) + 2*50 (timed) + 60 (3 stars) = 340
    // missionBase is internal
    expect(res.missionXp).toBe(340);
    expect(res.total).toBe(340);
    expect(res.streakMultiplier).toBe(1);
  });

  test('won mission with streak bonus', () => {
    const res = calculateProgressionXp({
      isWon: true,
      finalHealth: 80,
      timedDecisionsWon: 1,
      stars: 2,
      giveWelcome: false,
      streakCount: 4,
    });
    // missionBase = 100 + 80 + 50 = 230
    // streak multiplier 1.2 => 276 (rounded)
    expect(res.missionXp).toBe(276);
    expect(res.total).toBe(276);
    expect(res.streakMultiplier).toBe(1.2);
  });

  test('lost mission with lesson learned', () => {
    const res = calculateProgressionXp({
      isWon: false,
      finalHealth: 30,
      timedDecisionsWon: 0,
      stars: 0,
      giveWelcome: false,
      streakCount: 0,
    });
    // lessonLearned 25
    expect(res.missionXp).toBe(25);
    expect(res.total).toBe(25);
  });
});
