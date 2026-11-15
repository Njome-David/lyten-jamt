// tests/data/passport.test.ts
import { describe, it, expect } from 'vitest';
import { generateDataPassport, getPassportSummary } from '../../src/data/passport';

describe('NASA Data Passport generator', () => {
  it('generates non-empty passport entries with valid provenance', () => {
    const entries = generateDataPassport();
    expect(entries.length).toBeGreaterThanOrEqual(7);

    for (const entry of entries) {
      expect(entry.id).toBeTruthy();
      expect(entry.title).toBeTruthy();
      expect(entry.source).toBeTruthy();
      expect(entry.url).toMatch(/^https?:\/\//);
      expect(entry.fetchedAt).toBeTruthy();
      expect(typeof entry.isLive).toBe('boolean');
      expect(entry.credit).toBeTruthy();
      expect(entry.recordCount).toBeGreaterThan(0);
      expect(entry.gameUsage).toBeTruthy();
      expect(entry.tag).toBe('REAL');
      expect(['solar', 'biology', 'avatars', 'facts', 'geology', 'delay']).toContain(entry.category);
    }
  });

  it('contains DONKI, OSDR, Avatars and Scientific facts with correct records', () => {
    const entries = generateDataPassport();
    const ids = entries.map((e) => e.id);

    expect(ids).toContain('donki-flr-recent');
    expect(ids).toContain('donki-flr-may2024');
    expect(ids).toContain('donki-cme-recent');
    expect(ids).toContain('donki-sep-recent');
    expect(ids).toContain('osdr-studies');
    expect(ids).toContain('images-avatars');
    expect(ids).toContain('facts-scientific');
  });

  it('computes summary statistics accurately', () => {
    const summary = getPassportSummary();
    expect(summary.totalDatasets).toBeGreaterThanOrEqual(7);
    expect(summary.totalRecords).toBeGreaterThan(10);
    expect(summary.latestFetchedAt).toBeTruthy();
    expect(summary.categories.solar).toBeGreaterThanOrEqual(4);
    expect(summary.categories.biology).toBeGreaterThanOrEqual(1);
    expect(summary.categories.avatars).toBeGreaterThanOrEqual(1);
  });
});
