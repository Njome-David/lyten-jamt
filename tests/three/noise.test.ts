import { describe, it, expect } from 'vitest';
import {
  createNoise2D,
  computeCraterElevation,
  generateSampleCraters,
  getTerrainHeight,
  type Crater,
} from '../../src/three/noise';

describe('src/three/noise', () => {
  it('generates deterministic noise values for identical seeds and coordinates', () => {
    const n1 = createNoise2D(12345);
    const n2 = createNoise2D(12345);

    expect(n1.noise2D(1.5, 2.3)).toBe(n2.noise2D(1.5, 2.3));
    expect(n1.fbm2D(10.2, 5.8)).toBe(n2.fbm2D(10.2, 5.8));
  });

  it('generates different noise values for different seeds', () => {
    const n1 = createNoise2D(101);
    const n2 = createNoise2D(999);

    expect(n1.noise2D(3.2, 4.1)).not.toBe(n2.noise2D(3.2, 4.1));
  });

  it('bounds noise outputs within [-1, 1]', () => {
    const n = createNoise2D(42);
    for (let x = -10; x <= 10; x += 2.5) {
      for (let y = -10; y <= 10; y += 2.5) {
        const val = n.noise2D(x, y);
        expect(val).toBeGreaterThanOrEqual(-1);
        expect(val).toBeLessThanOrEqual(1);

        const fbm = n.fbm2D(x, y);
        expect(fbm).toBeGreaterThanOrEqual(-1);
        expect(fbm).toBeLessThanOrEqual(1);
      }
    }
  });

  it('computes crater elevation with depression at center and raised rim at edges', () => {
    const crater: Crater = {
      x: 0,
      z: 0,
      radius: 10,
      depth: 2,
      rimHeight: 0.5,
    };

    // Center should be negative (depression)
    const center = computeCraterElevation(0, 0, crater);
    expect(center).toBeLessThan(0);

    // Rim near crater edge
    const rim = computeCraterElevation(10, 0, crater);
    expect(rim).toBeGreaterThanOrEqual(0);

    // Far away should be 0
    const far = computeCraterElevation(25, 25, crater);
    expect(far).toBe(0);
  });

  it('generates sample craters within bounds and applies to terrain height', () => {
    const craters = generateSampleCraters(42, 3, 2, 6, 20);
    expect(craters).toHaveLength(3);
    const firstCrater = craters[0];
    expect(firstCrater).toBeDefined();
    if (!firstCrater) return;

    const heightWithCraters = getTerrainHeight(firstCrater.x, firstCrater.z, {
      seed: 42,
      craters,
    });
    const heightWithoutCraters = getTerrainHeight(firstCrater.x, firstCrater.z, {
      seed: 42,
      craters: [],
    });

    expect(heightWithCraters).toBeLessThan(heightWithoutCraters);
  });
});
