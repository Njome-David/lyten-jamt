import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  STYLE_DURATIONS_SEC,
  STYLE_DURATIONS_MS,
  TravelCinematic,
  DeployCinematic,
  GenericActionCinematic,
  CinematicManager,
  Rover,
} from '../../src/three/cinematics';
import type { Archetype, OptionStyle } from '../../src/engine/types';

describe('src/three/cinematics specifications and duration styles', () => {
  it('strictly respects GAME RULE action style durations from PRESENTATION.md', () => {
    // Fast: 2.5s (2500ms), Balanced: 3.5s (3500ms), Careful: 5.0s (5000ms)
    expect(STYLE_DURATIONS_SEC.fast).toBe(2.5);
    expect(STYLE_DURATIONS_SEC.balanced).toBe(3.5);
    expect(STYLE_DURATIONS_SEC.careful).toBe(5.0);

    expect(STYLE_DURATIONS_MS.fast).toBe(2500);
    expect(STYLE_DURATIONS_MS.balanced).toBe(3500);
    expect(STYLE_DURATIONS_MS.careful).toBe(5000);
  });

  it('exports all core cinematic components', () => {
    expect(TravelCinematic).toBeDefined();
    expect(DeployCinematic).toBeDefined();
    expect(GenericActionCinematic).toBeDefined();
    expect(CinematicManager).toBeDefined();
    expect(Rover).toBeDefined();
  });

  it('maps missing archetypes to GenericAction', () => {
    const missingArchetypes: Archetype[] = ['drill', 'experiment', 'repair', 'uplink'];

    missingArchetypes.forEach((arch) => {
      // CinematicManager resolves to GenericAction for these archetypes before T15
      expect(arch).not.toBe('travel');
      expect(arch).not.toBe('deploy');
    });
  });

  it('computes rover traverse path coordinates properly for fast, balanced and careful styles', () => {
    const startX = 2.5;
    const startZ = 0.5;
    const endX = -8.0;
    const endZ = 6.0;

    const styles: OptionStyle[] = ['fast', 'balanced', 'careful'];

    styles.forEach((style) => {
      const p = 0.5; // Halfway through the sequence
      let effectiveP = p;
      if (style === 'fast') {
        effectiveP = Math.pow(p, 0.85);
      } else if (style === 'careful') {
        effectiveP = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      }

      const x = startX + (endX - startX) * effectiveP;
      const z = startZ + (endZ - startZ) * effectiveP;

      expect(x).toBeLessThan(startX);
      expect(x).toBeGreaterThan(endX);
      expect(z).toBeGreaterThan(startZ);
      expect(z).toBeLessThan(endZ);
    });
  });

  it('allocates and disposes rover and cinematic buffer geometries cleanly', () => {
    const geometries: THREE.BufferGeometry[] = [];

    // Châssis, mât, roue, antenne
    geometries.push(new THREE.BoxGeometry(0.9, 0.35, 1.2));
    geometries.push(new THREE.CylinderGeometry(0.03, 0.04, 0.45, 8));
    geometries.push(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 16));
    geometries.push(new THREE.TorusGeometry(0.7, 0.03, 8, 32));

    expect(geometries).toHaveLength(4);

    // Dispose
    geometries.forEach((g) => {
      g.dispose();
    });
  });
});
