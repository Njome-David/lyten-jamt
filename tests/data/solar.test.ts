import { describe, it, expect } from 'vitest';
import {
  classifyFlare,
  getSolarLevelFromFlares,
  getSolarRadiationMultiplier,
  getSolarStatus,
  getMay2024StormData,
} from '../../src/data/solar';
import type { DonkiFlare } from '../../src/data/types';

describe('solar module (T09)', () => {
  const dummyFlare = (cls: string): DonkiFlare => ({
    flrID: '2026-01-01T00:00:00-FLR-001',
    beginTime: '2026-01-01T00:00Z',
    peakTime: '2026-01-01T00:10Z',
    classType: cls,
  });

  describe('classifyFlare', () => {
    it('correctly identifies flare classes', () => {
      expect(classifyFlare('X1.5')).toBe('X');
      expect(classifyFlare('x2.8')).toBe('X');
      expect(classifyFlare('M4.2')).toBe('M');
      expect(classifyFlare('C1.0')).toBe('C');
      expect(classifyFlare('B5.6')).toBe('B');
      expect(classifyFlare('A0.9')).toBe('A');
      expect(classifyFlare('unknown')).toBe('other');
    });
  });

  describe('getSolarLevelFromFlares', () => {
    it('returns stormy when any X flare is present', () => {
      const flares = [dummyFlare('C1.0'), dummyFlare('X1.2'), dummyFlare('M2.0')];
      expect(getSolarLevelFromFlares(flares)).toBe('stormy');
    });

    it('returns active when M flare is present without X', () => {
      const flares = [dummyFlare('C1.0'), dummyFlare('M3.5'), dummyFlare('C5.0')];
      expect(getSolarLevelFromFlares(flares)).toBe('active');
    });

    it('returns calm when only C or lower flares are present', () => {
      const flares = [dummyFlare('C1.0'), dummyFlare('B2.0'), dummyFlare('A5.0')];
      expect(getSolarLevelFromFlares(flares)).toBe('calm');
    });

    it('returns calm for empty flare list', () => {
      expect(getSolarLevelFromFlares([])).toBe('calm');
    });
  });

  describe('getSolarRadiationMultiplier', () => {
    it('provides correct multipliers per solar level', () => {
      expect(getSolarRadiationMultiplier('calm')).toBe(1.0);
      expect(getSolarRadiationMultiplier('active')).toBe(1.5);
      expect(getSolarRadiationMultiplier('stormy')).toBe(2.5);
    });
  });

  describe('getSolarStatus', () => {
    it('evaluates status for given flares', () => {
      const status = getSolarStatus([dummyFlare('M2.1')]);
      expect(status.level).toBe('active');
      expect(status.flareCount).toBe(1);
      expect(status.highestClass).toBe('M2.1');
      expect(status.stormWarning).toBe(false);
      expect(status.baseRadiationMultiplier).toBe(1.5);
      expect(status.label).toContain('actif');
    });

    it('evaluates status with default recent snapshot without crashing', () => {
      const status = getSolarStatus();
      expect(['calm', 'active', 'stormy']).toContain(status.level);
      expect(status.flareCount).toBeGreaterThanOrEqual(0);
      expect(status.baseRadiationMultiplier).toBeGreaterThanOrEqual(1.0);
    });
  });

  describe('getMay2024StormData', () => {
    it('replays May 2024 historic storm with stormy status', () => {
      const { status, flares } = getMay2024StormData();
      expect(status.level).toBe('stormy');
      expect(status.stormWarning).toBe(true);
      expect(status.baseRadiationMultiplier).toBe(2.5);
      expect(flares.length).toBeGreaterThan(0);
      expect(flares.some((f) => f.classType.startsWith('X'))).toBe(true);
    });
  });
});
