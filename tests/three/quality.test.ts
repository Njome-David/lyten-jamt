import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectQuality,
  getQualityConfig,
  isWebGLAvailable,
  isReducedMotionPreferred,
} from '../../src/three/stage/quality';

describe('src/three/stage/quality', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides appropriate config for high, low, and fallback2d tiers', () => {
    const high = getQualityConfig('high', false);
    expect(high.level).toBe('high');
    expect(high.shadows).toBe(true);
    expect(high.dpr).toBe(1.5);
    expect(high.particlesCount).toBeGreaterThan(300);

    const low = getQualityConfig('low', false);
    expect(low.level).toBe('low');
    expect(low.shadows).toBe(false);
    expect(low.dpr).toBe(1);
    expect(low.particlesCount).toBeLessThan(high.particlesCount);

    const fallback2d = getQualityConfig('fallback2d', true);
    expect(fallback2d.level).toBe('fallback2d');
    expect(fallback2d.shadows).toBe(false);
    expect(fallback2d.particlesCount).toBe(0);
    expect(fallback2d.reducedMotion).toBe(true);
  });

  it('honors forceLevel in detectQuality', () => {
    expect(detectQuality({ forceLevel: 'high' })).toBe('high');
    expect(detectQuality({ forceLevel: 'low' })).toBe('low');
    expect(detectQuality({ forceLevel: 'fallback2d' })).toBe('fallback2d');
  });

  it('detects fallback2d when WebGL is absent', () => {
    // In node environment without WebGL mocks
    const level = detectQuality();
    expect(level).toBe('fallback2d');
    expect(isWebGLAvailable()).toBe(false);
    expect(isReducedMotionPreferred()).toBe(false);
  });
});
