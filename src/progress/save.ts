// src/progress/save.ts
// Local storage management and mission progression recorder.
// Conforms to SPEC.md section 6 and TECHNICAL.md.

import type {
  RunScore,
  RunState,
  SaveProfile,
  SaveSettings,
  SaveV1,
} from '../engine/types';
import { evaluateBadges } from './badgesLogic';
import { getLocalDayString, updateStreak } from './streak';
import { calculateMissionXp } from './xp';

export const SAVE_KEY = 'jamt.save.v1';
export const CORRUPT_BACKUP_KEY = 'jamt.save.corrupt';

export interface LoadSaveResult {
  save: SaveV1;
  storageAvailable: boolean;
  wasCorrupted: boolean;
}

export interface RecordMissionResult {
  nextSave: SaveV1;
  newlyUnlockedBadges: string[];
  xpEarned: number;
}

export function defaultSave(): SaveV1 {
  return {
    v: 1,
    profile: {
      codename: 'Cmdr. Nova',
      avatarId: 'avatar-1',
    },
    xp: 0,
    streak: {
      count: 1,
      lastDay: getLocalDayString(),
      jokerReady: true,
    },
    badges: [],
    best: {},
    stats: {
      missionsPlayed: 0,
      missionsWon: 0,
      winStreak: 0,
      pressureWinsClean: 0,
      welcomeGiven: false,
    },
    seen: [],
    settings: {
      muted: false,
      extraTime: false,
      speed: 1,
    },
  };
}

function isStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    const probe = '__jamt_storage_test__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function loadSave(): LoadSaveResult {
  if (!isStorageAvailable()) {
    return {
      save: defaultSave(),
      storageAvailable: false,
      wasCorrupted: false,
    };
  }

  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return {
        save: defaultSave(),
        storageAvailable: true,
        wasCorrupted: false,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // JSON syntax error
      window.localStorage.setItem(CORRUPT_BACKUP_KEY, raw);
      const fallback = defaultSave();
      writeSave(fallback);
      return {
        save: fallback,
        storageAvailable: true,
        wasCorrupted: true,
      };
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      window.localStorage.setItem(CORRUPT_BACKUP_KEY, raw);
      const fallback = defaultSave();
      writeSave(fallback);
      return {
        save: fallback,
        storageAvailable: true,
        wasCorrupted: true,
      };
    }

    const obj = parsed as Record<string, unknown>;

    // Basic structural validation
    if (typeof obj.xp !== 'number' || Number.isNaN(obj.xp) || obj.xp < 0) {
      window.localStorage.setItem(CORRUPT_BACKUP_KEY, raw);
      const fallback = defaultSave();
      writeSave(fallback);
      return {
        save: fallback,
        storageAvailable: true,
        wasCorrupted: true,
      };
    }

    const base = defaultSave();

    // Deep merge with defaults to safeguard against missing optional fields
    const validatedSave: SaveV1 = {
      v: 1,
      profile: {
        codename:
          typeof (obj.profile as Record<string, unknown>)?.codename === 'string'
            ? String((obj.profile as Record<string, unknown>).codename)
            : base.profile.codename,
        avatarId:
          typeof (obj.profile as Record<string, unknown>)?.avatarId === 'string'
            ? String((obj.profile as Record<string, unknown>).avatarId)
            : base.profile.avatarId,
      },
      xp: Math.floor(obj.xp),
      streak: {
        count:
          typeof (obj.streak as Record<string, unknown>)?.count === 'number'
            ? Math.max(1, Math.floor((obj.streak as Record<string, unknown>).count as number))
            : base.streak.count,
        lastDay:
          typeof (obj.streak as Record<string, unknown>)?.lastDay === 'string'
            ? String((obj.streak as Record<string, unknown>).lastDay)
            : base.streak.lastDay,
        jokerReady:
          typeof (obj.streak as Record<string, unknown>)?.jokerReady === 'boolean'
            ? Boolean((obj.streak as Record<string, unknown>).jokerReady)
            : base.streak.jokerReady,
      },
      badges: Array.isArray(obj.badges)
        ? obj.badges.filter((b): b is string => typeof b === 'string')
        : base.badges,
      best:
        obj.best && typeof obj.best === 'object' && !Array.isArray(obj.best)
          ? (obj.best as SaveV1['best'])
          : base.best,
      stats: {
        missionsPlayed:
          typeof (obj.stats as Record<string, unknown>)?.missionsPlayed === 'number'
            ? Math.max(0, Math.floor((obj.stats as Record<string, unknown>).missionsPlayed as number))
            : base.stats.missionsPlayed,
        missionsWon:
          typeof (obj.stats as Record<string, unknown>)?.missionsWon === 'number'
            ? Math.max(0, Math.floor((obj.stats as Record<string, unknown>).missionsWon as number))
            : base.stats.missionsWon,
        winStreak:
          typeof (obj.stats as Record<string, unknown>)?.winStreak === 'number'
            ? Math.max(0, Math.floor((obj.stats as Record<string, unknown>).winStreak as number))
            : base.stats.winStreak,
        pressureWinsClean:
          typeof (obj.stats as Record<string, unknown>)?.pressureWinsClean === 'number'
            ? Math.max(0, Math.floor((obj.stats as Record<string, unknown>).pressureWinsClean as number))
            : base.stats.pressureWinsClean,
        welcomeGiven:
          typeof (obj.stats as Record<string, unknown>)?.welcomeGiven === 'boolean'
            ? Boolean((obj.stats as Record<string, unknown>).welcomeGiven)
            : base.stats.welcomeGiven,
      },
      seen: Array.isArray(obj.seen)
        ? obj.seen.filter((s): s is string => typeof s === 'string')
        : base.seen,
      settings: {
        muted:
          typeof (obj.settings as Record<string, unknown>)?.muted === 'boolean'
            ? Boolean((obj.settings as Record<string, unknown>).muted)
            : base.settings.muted,
        extraTime:
          typeof (obj.settings as Record<string, unknown>)?.extraTime === 'boolean'
            ? Boolean((obj.settings as Record<string, unknown>).extraTime)
            : base.settings.extraTime,
        speed:
          (obj.settings as Record<string, unknown>)?.speed === 1 ||
          (obj.settings as Record<string, unknown>)?.speed === 2 ||
          (obj.settings as Record<string, unknown>)?.speed === 3
            ? ((obj.settings as Record<string, unknown>).speed as 1 | 2 | 3)
            : base.settings.speed,
      },
    };

    return {
      save: validatedSave,
      storageAvailable: true,
      wasCorrupted: false,
    };
  } catch {
    return {
      save: defaultSave(),
      storageAvailable: true,
      wasCorrupted: true,
    };
  }
}

export function writeSave(save: SaveV1): boolean {
  if (!isStorageAvailable()) {
    return false;
  }
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

export function recordMissionResult(
  prevSave: SaveV1,
  run: RunState,
  score: RunScore,
  today: string = getLocalDayString()
): RecordMissionResult {
  const won = run.status === 'won';
  const streakUpdate = updateStreak(prevSave.streak, today);

  // Compute XP earned
  const xpBreakdown = calculateMissionXp({
    won,
    health: run.meters.health,
    pressureWins: run.pressureWins,
    stars: score.stars,
    streakDays: prevSave.streak.count,
    welcomeGiven: prevSave.stats.welcomeGiven,
  });
  const xpEarned = xpBreakdown.total;

  // Update best stars for mission key
  const missionKey = `${run.body}-${run.missionId}`;
  const previousMissionBest = prevSave.best[missionKey] ?? {};
  const currentBestDifficultyStars = previousMissionBest[run.difficulty] ?? 0;
  const nextStars = Math.max(currentBestDifficultyStars, score.stars) as 0 | 1 | 2 | 3;

  const nextBest: SaveV1['best'] = {
    ...prevSave.best,
    [missionKey]: {
      ...previousMissionBest,
      [run.difficulty]: nextStars,
    },
  };

  const winStreak = won ? prevSave.stats.winStreak + 1 : 0;
  const pressureWinsClean =
    run.pressureFails === 0
      ? prevSave.stats.pressureWinsClean + run.pressureWins
      : 0;

  const candidateSave: SaveV1 = {
    ...prevSave,
    xp: prevSave.xp + xpEarned,
    streak: streakUpdate.streak,
    best: nextBest,
    stats: {
      missionsPlayed: prevSave.stats.missionsPlayed + 1,
      missionsWon: prevSave.stats.missionsWon + (won ? 1 : 0),
      winStreak,
      pressureWinsClean,
      welcomeGiven: true,
    },
  };

  // Evaluate badges
  const badgeResult = evaluateBadges(candidateSave);
  candidateSave.badges = badgeResult.unlockedBadges;

  // Persist if storage available
  writeSave(candidateSave);

  return {
    nextSave: candidateSave,
    newlyUnlockedBadges: badgeResult.newlyUnlockedBadges,
    xpEarned,
  };
}

export function markSeen(save: SaveV1, key: string): SaveV1 {
  if (save.seen.includes(key)) {
    return save;
  }
  const nextSave: SaveV1 = {
    ...save,
    seen: [...save.seen, key],
  };
  writeSave(nextSave);
  return nextSave;
}

export function updateSettings(save: SaveV1, patch: Partial<SaveSettings>): SaveV1 {
  const nextSave: SaveV1 = {
    ...save,
    settings: {
      ...save.settings,
      ...patch,
    },
  };
  writeSave(nextSave);
  return nextSave;
}

export function updateProfile(save: SaveV1, patch: Partial<SaveProfile>): SaveV1 {
  const nextSave: SaveV1 = {
    ...save,
    profile: {
      ...save.profile,
      ...patch,
    },
  };
  writeSave(nextSave);
  return nextSave;
}

export function resetSave(): SaveV1 {
  const fresh = defaultSave();
  writeSave(fresh);
  return fresh;
}
