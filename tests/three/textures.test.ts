import { describe, it, expect } from 'vitest';
import {
  createEarthTexture,
  createMarsTexture,
  createMoonTexture,
  createRegolithBumpTexture,
} from '../../src/three/stage/proceduralTextures';

describe('src/three/stage/proceduralTextures', () => {
  it('exports procedural texture generator functions', () => {
    expect(createEarthTexture).toBeDefined();
    expect(createMarsTexture).toBeDefined();
    expect(createMoonTexture).toBeDefined();
    expect(createRegolithBumpTexture).toBeDefined();
  });

  it('safely handles non-DOM / SSR environments without throwing', () => {
    // In node environment without DOM, generators return undefined gracefully
    const earth = createEarthTexture();
    const mars = createMarsTexture();
    const moon = createMoonTexture();
    const bump = createRegolithBumpTexture();

    // In Node (no document.createElement), returns undefined
    if (typeof document === 'undefined') {
      expect(earth).toBeUndefined();
      expect(mars).toBeUndefined();
      expect(moon).toBeUndefined();
      expect(bump).toBeUndefined();
    }
  });
});
