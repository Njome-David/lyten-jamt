// tests/progress/progression-save.test.ts
// Exhaustive tests for progression: XP, ranks (499/500), streak & joker,
// each badge unlock condition, and corrupted save recovery.

import { beforeEach, describe, expect, it } from 'vitest';
import { BADGES } from '../../src/content/badges';
import { getSolarContext } from '../../src/data/solar';
import { createRun } from '../../src/engine';
import type { RunScore, SaveV1 } from '../../src/engine/types';
import {
  CORRUPT_BACKUP_KEY,
  SAVE_KEY,
  calculateMissionXp,
  defaultSave,
  evaluateBadges,
  getLocalDayString,
  getRankProgress,
  loadSave,
  markSeen,
  parseDayDifference,
  rankForXp,
  recordMissionResult,
  updateProfile,
  updateSettings,
  updateStreak,
  writeSave,
} from '../../src/progress';

describe('1. XP Math and Breakdown (SPEC.md section 6)', () => {
  it('calculates full win XP with welcome bonus, healthy crew, pressure wins, and 3 stars', () => {
    const xp = calculateMissionXp({
      won: true,
      health: 80,
      pressureWins: 2,
      stars: 3,
      streakDays: 1,
      welcomeGiven: false,
    });

    expect(xp.welcome).toBe(50);
    expect(xp.objective).toBe(100);
    expect(xp.healthyCrew).toBe(80);
    expect(xp.pressureBonus).toBe(100); // 2 * 50
    expect(xp.threeStarBonus).toBe(60);
    expect(xp.lessonLearned).toBe(0);
    expect(xp.streakMultiplier).toBe(1.0);
    expect(xp.total).toBe(50 + 100 + 80 + 100 + 60); // 390
  });

  it('skips welcome bonus if already given and handles 1-star win with damaged crew', () => {
    const xp = calculateMissionXp({
      won: true,
      health: 45, // < 60
      pressureWins: 0,
      stars: 1,
      streakDays: 2,
      welcomeGiven: true,
    });

    expect(xp.welcome).toBe(0);
    expect(xp.objective).toBe(100);
    expect(xp.healthyCrew).toBe(0);
    expect(xp.pressureBonus).toBe(0);
    expect(xp.threeStarBonus).toBe(0);
    expect(xp.lessonLearned).toBe(0);
    expect(xp.streakMultiplier).toBe(1.0);
    expect(xp.total).toBe(100);
  });

  it('applies lesson learned (+25) on failed mission and no objective/crew/star bonuses', () => {
    const xp = calculateMissionXp({
      won: false,
      health: 0,
      pressureWins: 1,
      stars: 0,
      streakDays: 1,
      welcomeGiven: true,
    });

    expect(xp.welcome).toBe(0);
    expect(xp.objective).toBe(0);
    expect(xp.healthyCrew).toBe(0);
    expect(xp.pressureBonus).toBe(50);
    expect(xp.threeStarBonus).toBe(0);
    expect(xp.lessonLearned).toBe(25);
    expect(xp.total).toBe(75);
  });

  it('applies x1.2 streak multiplier when streak >= 3 days', () => {
    const xp = calculateMissionXp({
      won: true,
      health: 70,
      pressureWins: 0,
      stars: 2,
      streakDays: 3,
      welcomeGiven: true,
    });

    // base: 100 (objective) + 80 (healthyCrew) = 180
    // total: Math.round(180 * 1.2) = 216
    expect(xp.streakMultiplier).toBe(1.2);
    expect(xp.total).toBe(216);
  });
});

describe('2. Ranks and Rank Boundaries (SPEC.md section 6)', () => {
  it('correctly maps all ranks and edge thresholds (499 / 500, etc.)', () => {
    expect(rankForXp(0).title).toBe('Space Cadet');
    expect(rankForXp(250).title).toBe('Space Cadet');
    expect(rankForXp(499).title).toBe('Space Cadet');

    expect(rankForXp(500).title).toBe('Mission Specialist');
    expect(rankForXp(1000).title).toBe('Mission Specialist');
    expect(rankForXp(1499).title).toBe('Mission Specialist');

    expect(rankForXp(1500).title).toBe('Expedition Pilot');
    expect(rankForXp(2500).title).toBe('Expedition Pilot');
    expect(rankForXp(3499).title).toBe('Expedition Pilot');

    expect(rankForXp(3500).title).toBe('Base Commander');
    expect(rankForXp(5000).title).toBe('Base Commander');
    expect(rankForXp(6999).title).toBe('Base Commander');

    expect(rankForXp(7000).title).toBe('NASA Flight Director');
    expect(rankForXp(12000).title).toBe('NASA Flight Director');
  });

  it('calculates rank progress and remaining XP properly', () => {
    const prog = getRankProgress(250);
    expect(prog.currentRank.title).toBe('Space Cadet');
    expect(prog.nextRank?.title).toBe('Mission Specialist');
    expect(prog.progressPercent).toBe(50);
    expect(prog.xpRemaining).toBe(250);

    const maxProg = getRankProgress(8500);
    expect(maxProg.currentRank.title).toBe('NASA Flight Director');
    expect(maxProg.nextRank).toBeNull();
    expect(maxProg.progressPercent).toBe(100);
    expect(maxProg.xpRemaining).toBe(0);
  });
});

describe('3. Streak Tracking and Joker Shield', () => {
  it('measures day differences accurately', () => {
    expect(parseDayDifference('2026-11-15', '2026-11-15')).toBe(0);
    expect(parseDayDifference('2026-11-14', '2026-11-15')).toBe(1);
    expect(parseDayDifference('2026-11-13', '2026-11-15')).toBe(2);
    expect(parseDayDifference('2026-10-31', '2026-11-01')).toBe(1); // Month boundary
  });

  it('keeps streak unchanged when training multiple times the same day', () => {
    const initial = { count: 3, lastDay: '2026-11-15', jokerReady: true };
    const res = updateStreak(initial, '2026-11-15');
    expect(res.streak.count).toBe(3);
    expect(res.usedJoker).toBe(false);
  });

  it('increments streak on consecutive days', () => {
    const initial = { count: 4, lastDay: '2026-11-14', jokerReady: false };
    const res = updateStreak(initial, '2026-11-15');
    expect(res.streak.count).toBe(5);
    expect(res.streak.lastDay).toBe('2026-11-15');
    expect(res.usedJoker).toBe(false);
  });

  it('recharges joker shield upon reaching a 7-day streak', () => {
    const initial = { count: 6, lastDay: '2026-11-14', jokerReady: false };
    const res = updateStreak(initial, '2026-11-15');
    expect(res.streak.count).toBe(7);
    expect(res.streak.jokerReady).toBe(true);
  });

  it('consumes joker shield when missing exactly 1 day (diff = 2)', () => {
    const initial = { count: 5, lastDay: '2026-11-13', jokerReady: true };
    const res = updateStreak(initial, '2026-11-15');
    expect(res.usedJoker).toBe(true);
    expect(res.streak.count).toBe(6);
    expect(res.streak.lastDay).toBe('2026-11-15');
    expect(res.streak.jokerReady).toBe(false);
  });

  it('resets streak to 1 when missing 1 day without joker ready', () => {
    const initial = { count: 5, lastDay: '2026-11-13', jokerReady: false };
    const res = updateStreak(initial, '2026-11-15');
    expect(res.usedJoker).toBe(false);
    expect(res.streak.count).toBe(1);
    expect(res.streak.lastDay).toBe('2026-11-15');
  });

  it('resets streak to 1 when missing more than 1 day even if joker is ready', () => {
    const initial = { count: 5, lastDay: '2026-11-10', jokerReady: true };
    const res = updateStreak(initial, '2026-11-15');
    expect(res.usedJoker).toBe(false);
    expect(res.streak.count).toBe(1);
  });
});

describe('4. Badge Unlock Criteria (SPEC.md section 6)', () => {
  it('defines 5 valid badges in content catalog', () => {
    expect(BADGES.length).toBe(5);
    const ids = BADGES.map((b) => b.id);
    expect(ids).toContain('steady-observer');
    expect(ids).toContain('flawless-pilot');
    expect(ids).toContain('space-veteran');
    expect(ids).toContain('ice-cold');
    expect(ids).toContain('complete-constellation');
  });

  it('unlocks Steady Observer at 5-day streak', () => {
    const save = defaultSave();
    save.streak.count = 5;
    const res = evaluateBadges(save);
    expect(res.newlyUnlockedBadges).toContain('steady-observer');
    expect(res.unlockedBadges).toContain('steady-observer');
  });

  it('unlocks Flawless Pilot at 3 consecutive wins and Space Veteran at 7', () => {
    const save = defaultSave();
    save.stats.winStreak = 3;
    const res3 = evaluateBadges(save);
    expect(res3.newlyUnlockedBadges).toContain('flawless-pilot');
    expect(res3.newlyUnlockedBadges).not.toContain('space-veteran');

    save.stats.winStreak = 7;
    const res7 = evaluateBadges(save);
    expect(res7.unlockedBadges).toContain('flawless-pilot');
    expect(res7.unlockedBadges).toContain('space-veteran');
  });

  it('unlocks Ice Cold with 10 clean pressure wins', () => {
    const save = defaultSave();
    save.stats.pressureWinsClean = 10;
    const res = evaluateBadges(save);
    expect(res.newlyUnlockedBadges).toContain('ice-cold');
  });

  it('unlocks Complete Constellation when easy, medium and hard of a mission have 3 stars', () => {
    const save = defaultSave();
    save.best['moon-relay'] = {
      easy: 3,
      medium: 3,
      hard: 2, // Not complete yet
    };
    expect(evaluateBadges(save).newlyUnlockedBadges).not.toContain('complete-constellation');

    save.best['moon-relay'] = {
      easy: 3,
      medium: 3,
      hard: 3, // Complete!
    };
    expect(evaluateBadges(save).newlyUnlockedBadges).toContain('complete-constellation');
  });
});

describe('5. Save, Load, and Corrupt Recovery', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const storageMock = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = String(value);
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
      length: 0,
      key: () => null,
    };

    // Attach mock window & localStorage in node environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = {
      localStorage: storageMock,
    };
  });

  it('handles environment when storage is unavailable (private mode or SSR)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).window;
    const res = loadSave();
    expect(res.storageAvailable).toBe(false);
    expect(res.save.profile.codename).toBe('Cmdr. Nova');
  });

  it('loads defaultSave when localStorage is empty', () => {
    const res = loadSave();
    expect(res.save.profile.codename).toBe('Cmdr. Nova');
    expect(res.save.xp).toBe(0);
    expect(res.save.streak.count).toBe(1);
    expect(res.save.seen).toEqual([]);
    expect(res.save.settings.speed).toBe(1);
    expect(res.wasCorrupted).toBe(false);
  });

  it('saves and reloads SaveV1 data faithfully', () => {
    const custom: SaveV1 = {
      ...defaultSave(),
      profile: { codename: 'AstroKid', avatarId: 'avatar-3' },
      xp: 1200,
      badges: ['steady-observer'],
      seen: ['tour-welcome'],
      settings: { muted: true, extraTime: true, speed: 2 },
    };

    const written = writeSave(custom);
    expect(written).toBe(true);

    const reloaded = loadSave();
    expect(reloaded.save.profile.codename).toBe('AstroKid');
    expect(reloaded.save.profile.avatarId).toBe('avatar-3');
    expect(reloaded.save.xp).toBe(1200);
    expect(reloaded.save.badges).toEqual(['steady-observer']);
    expect(reloaded.save.seen).toEqual(['tour-welcome']);
    expect(reloaded.save.settings.speed).toBe(2);
    expect(reloaded.save.settings.muted).toBe(true);
    expect(reloaded.wasCorrupted).toBe(false);
  });

  it('recovers from corrupt JSON syntax without crashing, backing up to corrupt key', () => {
    mockStorage[SAVE_KEY] = '{invalid json';

    const res = loadSave();
    expect(res.wasCorrupted).toBe(true);
    expect(res.save.profile.codename).toBe('Cmdr. Nova');
    expect(res.save.xp).toBe(0);

    const backup = mockStorage[CORRUPT_BACKUP_KEY];
    expect(backup).toBe('{invalid json');
  });

  it('recovers from invalid schema types (negative XP / invalid object) without crashing', () => {
    mockStorage[SAVE_KEY] = JSON.stringify({ xp: -50, profile: null });

    const res = loadSave();
    expect(res.wasCorrupted).toBe(true);
    expect(res.save.xp).toBe(0);
  });

  it('updates seen moments and settings immutably', () => {
    const save = defaultSave();
    const updatedSeen = markSeen(save, 'first_flare');
    expect(updatedSeen.seen).toContain('first_flare');
    expect(save.seen).not.toContain('first_flare'); // Immutable

    const updatedSettings = updateSettings(updatedSeen, { speed: 3 });
    expect(updatedSettings.settings.speed).toBe(3);

    const updatedProfile = updateProfile(updatedSettings, { codename: 'Orion' });
    expect(updatedProfile.profile.codename).toBe('Orion');
  });

  it('records mission results and advances save state', () => {
    const save = defaultSave();
    const run = createRun(
      {
        seed: 42,
        body: 'moon',
        missionId: 'relay',
        siteId: 'shackleton',
        difficulty: 'easy',
        loadout: {
          crew: 3,
          power: 'panels',
          shield: 'standard',
          food: 'rations',
        },
      },
      getSolarContext('recent')
    );
    run.status = 'won';
    run.meters.health = 85;
    run.pressureWins = 2;
    run.pressureFails = 0;

    const dummyScore: RunScore = {
      stars: 3,
      xp: {
        welcome: 50,
        objective: 100,
        healthyCrew: 80,
        pressureBonus: 100,
        threeStarBonus: 60,
        lessonLearned: 0,
        streakMultiplier: 1.0,
        total: 390,
      },
      incidents: [],
      causeSummary: 'Success',
      nextTimeTip: 'Great',
    };

    const res = recordMissionResult(save, run, dummyScore, getLocalDayString());
    expect(res.nextSave.xp).toBe(390);
    expect(res.nextSave.stats.missionsWon).toBe(1);
    expect(res.nextSave.stats.winStreak).toBe(1);
    expect(res.nextSave.best['moon-relay']?.easy).toBe(3);
    expect(res.nextSave.stats.welcomeGiven).toBe(true);
  });
});
