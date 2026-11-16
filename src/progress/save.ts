// src/progress/save.ts
// Robust localStorage persistence and schema validation for jamt.save.v1.
// Strictly follows SPEC.md section 6 and TASKS.md ### T19.

import type { Difficulty } from '../engine/types';
import type { SaveV1, GameSettings } from './types';
import { evaluateNewBadges } from './badges';
import { getRankForXp } from './ranks';
import { calculateProgressionXp } from './xp';
import { recordDayActivity } from './streak';
import type { BadgeId } from '../content/badges';

export const SAVE_STORAGE_KEY = 'jamt.save.v1';

/**
 * Returns a clean, default initial save.
 */
export function createDefaultSave(): SaveV1 {
  return {
    v: 1,
    profile: { codename: 'Astronaut', avatarId: 'avatar-1' },
    xp: 0,
    streak: { count: 0, lastDay: '', jokerReady: false },
    badges: [],
    best: {},
    stats: { missionsPlayed: 0, missionsWon: 0, winStreak: 0, pressureWinsClean: 0, welcomeGiven: false },
    seen: [],
    settings: { muted: false, extraTime: false, speed: 1 },
  };
}

/**
 * Validates the stable SaveV1 fields. Career counters were added after the initial
 * SaveV1 release, so missing counters are valid legacy data and are filled in by
 * normalizeSave rather than causing the player's existing save to be discarded.
 */
export function isValidSave(data: unknown): data is SaveV1 {
  if (!data || typeof data !== 'object') return false;
  const s = data as Partial<SaveV1>;

  if (s.v !== 1) return false;
  if (!s.profile || typeof s.profile.codename !== 'string' || typeof s.profile.avatarId !== 'string') return false;
  if (typeof s.xp !== 'number' || !Number.isFinite(s.xp) || s.xp < 0) return false;
  if (
    !s.streak ||
    typeof s.streak.count !== 'number' ||
    typeof s.streak.lastDay !== 'string' ||
    typeof s.streak.jokerReady !== 'boolean'
  ) {
    return false;
  }
  if (!Array.isArray(s.badges)) return false;
  if (!s.best || typeof s.best !== 'object') return false;
  if (
    !s.stats ||
    typeof s.stats.winStreak !== 'number' ||
    typeof s.stats.pressureWinsClean !== 'number' ||
    typeof s.stats.welcomeGiven !== 'boolean'
  ) {
    return false;
  }
  for (const counter of [s.stats.missionsPlayed, s.stats.missionsWon]) {
    if (counter !== undefined && (typeof counter !== 'number' || !Number.isFinite(counter) || counter < 0)) {
      return false;
    }
  }
  if (!Array.isArray(s.seen)) return false;
  if (
    !s.settings ||
    typeof s.settings.muted !== 'boolean' ||
    typeof s.settings.extraTime !== 'boolean' ||
    ![1, 2, 3].includes(s.settings.speed)
  ) {
    return false;
  }

  return true;
}

function normalizeSave(save: SaveV1): SaveV1 {
  const defaults = createDefaultSave();
  return {
    ...save,
    stats: {
      ...defaults.stats,
      ...save.stats,
    },
  };
}

// In-memory fallback for SSR or headless test environments without DOM localStorage
let memoryStorage: Record<string, string> = {};

export function clearMemoryStorage(): void {
  memoryStorage = {};
}

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStorage[key] ?? null;
  } catch {
    return memoryStorage[key] ?? null;
  }
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    memoryStorage[key] = value;
  } catch {
    memoryStorage[key] = value;
  }
}

function removeStorageItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    delete memoryStorage[key];
  } catch {
    delete memoryStorage[key];
  }
}

/**
 * Loads and validates player save from localStorage (or fallback).
 * If corrupt or unreadable, safely starts fresh without crashing.
 */
export function loadSave(): SaveV1 {
  try {
    const raw = getStorageItem(SAVE_STORAGE_KEY);
    if (!raw) {
      return createDefaultSave();
    }
    const parsed: unknown = JSON.parse(raw);
    if (isValidSave(parsed)) {
      return normalizeSave(parsed);
    }
    // Corrupt or outdated shape: start fresh safely
    return createDefaultSave();
  } catch {
    // JSON parse error or access restriction: start fresh safely
    return createDefaultSave();
  }
}

/**
 * Saves player state to localStorage (or fallback).
 */
export function saveSave(save: SaveV1): boolean {
  try {
    const serialized = JSON.stringify(save);
    setStorageItem(SAVE_STORAGE_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resets the player save to factory default.
 */
export function resetSave(): SaveV1 {
  const fresh = createDefaultSave();
  removeStorageItem(SAVE_STORAGE_KEY);
  return fresh;
}

/**
 * Checks if a dialogue ID was already seen.
 */
export function hasSeen(save: SaveV1, dialogueId: string): boolean {
  return save.seen.includes(dialogueId);
}

/**
 * Marks a companion dialogue as seen and returns updated save.
 */
export function markSeen(save: SaveV1, dialogueId: string): SaveV1 {
  if (hasSeen(save, dialogueId)) return save;
  const updated: SaveV1 = {
    ...save,
    seen: [...save.seen, dialogueId],
  };
  saveSave(updated);
  return updated;
}

/**
 * Updates player settings (speed, muted, extraTime).
 */
export function updateSettings(save: SaveV1, patch: Partial<GameSettings>): SaveV1 {
  const updated: SaveV1 = {
    ...save,
    settings: {
      ...save.settings,
      ...patch,
    },
  };
  saveSave(updated);
  return updated;
}

export interface RecordMissionParams {
  missionKey: string; // e.g. "moon-relay"
  difficulty: Difficulty;
  isWon: boolean;
  stars: 0 | 1 | 2 | 3;
  finalHealth: number;
  timedDecisionsWon: number;
  todayDate: string; // "YYYY-MM-DD"
}

export interface MissionProgressResult {
  save: SaveV1;
  newBadges: BadgeId[];
  earnedXp: number;
  rankUp: boolean;
  previousRankTitle: string;
  newRankTitle: string;
}

/**
 * Integrates mission completion outcome into the save:
 * calculates XP, updates streak, checks badges, and records best stars.
 */
export function recordMissionCompletion(
  currentSave: SaveV1,
  params: RecordMissionParams
): MissionProgressResult {
  const prevRank = getRankForXp(currentSave.xp);

  // 1. Update streak
  const streakUpdate = recordDayActivity(currentSave.streak, params.todayDate);

  // 2. Calculate XP
  const giveWelcome = !currentSave.stats.welcomeGiven;
  const xpBreakdown = calculateProgressionXp({
    isWon: params.isWon,
    finalHealth: params.finalHealth,
    timedDecisionsWon: params.timedDecisionsWon,
    stars: params.stars,
    giveWelcome,
    streakCount: streakUpdate.streak.count,
  });

  const nextXp = currentSave.xp + xpBreakdown.total;

  // 3. Update stats
  const nextWinStreak = params.isWon ? currentSave.stats.winStreak + 1 : 0;
  const nextPressureWinsClean = currentSave.stats.pressureWinsClean + params.timedDecisionsWon;

  // 4. Update best stars
  const missionRecords = { ...(currentSave.best[params.missionKey] ?? {}) };
  const prevBestForDiff = missionRecords[params.difficulty] ?? 0;
  if (params.stars > prevBestForDiff) {
    missionRecords[params.difficulty] = params.stars;
  }
  const nextBest = {
    ...currentSave.best,
    [params.missionKey]: missionRecords,
  };

  const candidateSave: SaveV1 = {
    ...currentSave,
    xp: nextXp,
    streak: streakUpdate.streak,
    best: nextBest,
    stats: {
      missionsPlayed: currentSave.stats.missionsPlayed + 1,
      missionsWon: currentSave.stats.missionsWon + (params.isWon ? 1 : 0),
      winStreak: nextWinStreak,
      pressureWinsClean: nextPressureWinsClean,
      welcomeGiven: true,
    },
  };

  // 5. Evaluate newly unlocked badges
  const newBadges = evaluateNewBadges(candidateSave);
  const finalBadges = Array.from(new Set([...candidateSave.badges, ...newBadges]));

  const finalSave: SaveV1 = {
    ...candidateSave,
    badges: finalBadges,
  };

  saveSave(finalSave);

  const nextRank = getRankForXp(finalSave.xp);
  const rankUp = nextRank.id !== prevRank.id;

  return {
    save: finalSave,
    newBadges,
    earnedXp: xpBreakdown.total,
    rankUp,
    previousRankTitle: prevRank.title,
    newRankTitle: nextRank.title,
  };
}
