// src/progress/save.test.ts
// Unit tests for save persistence, validation, corrupt recovery, seen moments, and settings.

import { expect, test, describe, beforeEach } from 'vitest';
import {
  saveSave,
  loadSave,
  resetSave,
  createDefaultSave,
  hasSeen,
  markSeen,
  updateSettings,
  SAVE_STORAGE_KEY,
} from '../../src/progress/save';

describe('save persistence', () => {
  beforeEach(() => {
    // Ensure a clean in-memory store before each test.
    resetSave();
  });

  test('loadSave returns default when nothing stored', () => {
    const s = loadSave();
    expect(s).toEqual(createDefaultSave());
  });

  test('saveSave stores and loadSave retrieves identical data', () => {
    const original = {
      ...createDefaultSave(),
      xp: 123,
      streak: { count: 4, lastDay: '2026-11-10', jokerReady: true },
    };
    const saved = saveSave(original);
    expect(saved).toBe(true);
    const loaded = loadSave();
    expect(loaded).toEqual(original);
  });

  test('migrates a SaveV1 from before career counters without losing progress', () => {
    const legacy = {
      ...createDefaultSave(),
      xp: 725,
      streak: { count: 4, lastDay: '2026-11-10', jokerReady: true },
      stats: { winStreak: 2, pressureWinsClean: 3, welcomeGiven: true },
    };

    expect(saveSave(legacy as ReturnType<typeof createDefaultSave>)).toBe(true);
    expect(loadSave()).toEqual({
      ...legacy,
      stats: {
        missionsPlayed: 0,
        missionsWon: 0,
        winStreak: 2,
        pressureWinsClean: 3,
        welcomeGiven: true,
      },
    });
  });

  test('resetSave clears stored data', () => {
    const modified = { ...createDefaultSave(), xp: 999 };
    saveSave(modified);
    const afterReset = resetSave();
    expect(afterReset).toEqual(createDefaultSave());
    const loaded = loadSave();
    expect(loaded).toEqual(createDefaultSave());
  });

  test('corrupted JSON syntax recovers safely to default without throwing', () => {
    // Corrupt the storage directly
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SAVE_STORAGE_KEY, '{ invalid JSON syntax');
    }
    const loaded = loadSave();
    expect(loaded).toEqual(createDefaultSave());
  });

  test('invalid schema (negative XP or missing v) recovers safely to default', () => {
    // @ts-expect-error intentionally invalid shape
    saveSave({ v: 2, xp: -100 });
    const loaded = loadSave();
    expect(loaded).toEqual(createDefaultSave());
  });

  test('records seen companion dialogues and updates settings including speed', () => {
    const initial = createDefaultSave();
    expect(hasSeen(initial, 'tour-welcome')).toBe(false);

    const withSeen = markSeen(initial, 'tour-welcome');
    expect(hasSeen(withSeen, 'tour-welcome')).toBe(true);
    expect(withSeen.seen).toContain('tour-welcome');

    // Does not duplicate
    const duplicated = markSeen(withSeen, 'tour-welcome');
    expect(duplicated.seen.filter((id) => id === 'tour-welcome').length).toBe(1);

    // Update settings (speed 1 | 2 | 3, muted, extraTime)
    const withSpeed = updateSettings(withSeen, { speed: 3, muted: true });
    expect(withSpeed.settings.speed).toBe(3);
    expect(withSpeed.settings.muted).toBe(true);

    const saved = loadSave();
    expect(saved.settings.speed).toBe(3);
    expect(saved.seen).toContain('tour-welcome');
  });
});
