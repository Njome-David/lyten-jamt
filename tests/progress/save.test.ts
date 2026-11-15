// tests/progress/save.test.ts
// Unit tests for save persistence and validation.

import { expect, test, describe, beforeEach } from 'vitest';
import { saveSave, loadSave, resetSave, createDefaultSave } from '../../src/progress/save';

describe('save persistence', () => {
  beforeEach(() => {
    // Ensure a clean in‑memory store before each test.
    // The save module uses an internal memoryStorage when window.localStorage is absent.
    // Resetting the module state via resetSave clears the storage key.
    resetSave();
  });

  test('loadSave returns default when nothing stored', () => {
    const s = loadSave();
    expect(s).toEqual(createDefaultSave());
  });

  test('saveSave stores and loadSave retrieves identical data', () => {
    const original = { ...createDefaultSave(), xp: 123, streak: { count: 4, lastDay: '2026-11-10', jokerReady: true } };
    const saved = saveSave(original);
    expect(saved).toBe(true);
    const loaded = loadSave();
    expect(loaded).toEqual(original);
  });

  test('resetSave clears stored data', () => {
    const modified = { ...createDefaultSave(), xp: 999 };
    saveSave(modified);
    const afterReset = resetSave();
    expect(afterReset).toEqual(createDefaultSave());
    const loaded = loadSave();
    expect(loaded).toEqual(createDefaultSave());
  });
});
