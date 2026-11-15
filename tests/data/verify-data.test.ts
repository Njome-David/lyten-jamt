import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { verifyData } from '../../scripts/verify-data';

describe('verifyData (T03)', () => {
  const testDir = join(__dirname, '../../tmp-test-snapshots');

  beforeEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('validates real bundled snapshots in src/data/snapshots', () => {
    const res = verifyData();
    expect(res.errors).toEqual([]);
    expect(res.snapshotCount).toBeGreaterThanOrEqual(3);
  });

  it('detects missing meta', () => {
    writeFileSync(join(testDir, 'test.json'), JSON.stringify({ data: [1, 2, 3] }));
    const res = verifyData({ dir: testDir });
    expect(res.errors).toContain('test.json: meta manquant');
  });

  it('detects missing meta fields (source, url, fetchedAt, isLive)', () => {
    writeFileSync(
      join(testDir, 'test.json'),
      JSON.stringify({
        meta: { source: 'DONKI' },
        data: [{ id: 1 }],
      })
    );
    const res = verifyData({ dir: testDir });
    expect(res.errors).toContain('test.json: meta.url manquant');
    expect(res.errors).toContain('test.json: meta.fetchedAt manquant');
    expect(res.errors).toContain('test.json: meta.isLive doit etre un booleen');
  });

  it('detects missing data property', () => {
    writeFileSync(
      join(testDir, 'test.json'),
      JSON.stringify({
        meta: { source: 'DONKI', url: 'https://test', fetchedAt: '2026-01-01', isLive: false },
      })
    );
    const res = verifyData({ dir: testDir });
    expect(res.errors).toContain('test.json: data manquant');
  });

  it('detects an empty snapshot (empty array or empty object)', () => {
    writeFileSync(
      join(testDir, 'empty-array.json'),
      JSON.stringify({
        meta: { source: 'TEST', url: 'https://test', fetchedAt: '2026-01-01', isLive: false },
        data: [],
      })
    );
    writeFileSync(
      join(testDir, 'empty-obj.json'),
      JSON.stringify({
        meta: { source: 'TEST', url: 'https://test', fetchedAt: '2026-01-01', isLive: false },
        data: {},
      })
    );
    const res = verifyData({ dir: testDir });
    expect(res.errors).toContain('empty-array.json: snapshot vide');
    expect(res.errors).toContain('empty-obj.json: snapshot vide');
  });

  it('detects empty DONKI FLR snapshot and missing flare fields', () => {
    writeFileSync(
      join(testDir, 'donki-flr-empty.json'),
      JSON.stringify({
        meta: { source: 'DONKI', url: 'https://test', fetchedAt: '2026-01-01', isLive: false },
        data: [],
      })
    );
    writeFileSync(
      join(testDir, 'donki-flr-invalid.json'),
      JSON.stringify({
        meta: { source: 'DONKI', url: 'https://test', fetchedAt: '2026-01-01', isLive: false },
        data: [{ flrID: 'FLR-1' }], // missing beginTime, peakTime, classType
      })
    );
    const res = verifyData({ dir: testDir });
    expect(res.errors).toContain('donki-flr-empty.json: snapshot DONKI vide');
    expect(res.errors).toContain('donki-flr-invalid.json[0]: beginTime manquant');
    expect(res.errors).toContain('donki-flr-invalid.json[0]: peakTime manquant');
    expect(res.errors).toContain('donki-flr-invalid.json[0]: classType manquant');
  });

  it('detects invalid JSON', () => {
    writeFileSync(join(testDir, 'corrupt.json'), '{ invalid json');
    const res = verifyData({ dir: testDir });
    expect(res.errors.some((e) => e.startsWith('corrupt.json: JSON invalide'))).toBe(true);
  });

  it('strict mode flags missing required P0 files', () => {
    const res = verifyData({ dir: testDir, strict: true });
    expect(res.errors).toContain('strict: donki-flr-recent.json manquant');
    expect(res.errors).toContain('strict: donki-flr-may2024-a.json manquant');
    expect(res.errors).toContain('strict: donki-flr-may2024-b.json manquant');
  });
});
