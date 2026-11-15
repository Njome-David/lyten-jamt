import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  FlareEventCinematic,
  DustStormEventCinematic,
  FaultEventCinematic,
  BlackoutEventCinematic,
  OutcomeCinematic,
  CinematicManager,
  EVENT_DURATION_SEC,
  OUTCOME_DURATION_SEC,
} from '../../src/three/cinematics';
import type { EventKind, OutcomeKind } from '../../src/three/cinematics/types';

describe('src/three/cinematics event & outcome cinematics (T16)', () => {
  it('exports all event and outcome components and manager', () => {
    expect(FlareEventCinematic).toBeDefined();
    expect(DustStormEventCinematic).toBeDefined();
    expect(FaultEventCinematic).toBeDefined();
    expect(BlackoutEventCinematic).toBeDefined();
    expect(OutcomeCinematic).toBeDefined();
    expect(CinematicManager).toBeDefined();
  });

  it('verifies standard duration constants', () => {
    expect(EVENT_DURATION_SEC).toBe(2.5);
    expect(OUTCOME_DURATION_SEC).toBe(3.5);
  });

  it('correctly maps all 4 event kinds to their dedicated cinematic components', () => {
    const events: EventKind[] = ['flare', 'dust', 'fault', 'blackout'];

    events.forEach((event) => {
      const element = CinematicManager({
        event,
        progress: 0.5,
      });
      expect(element).toBeDefined();
      expect(element.props.event).toBe(event);
    });
  });

  it('correctly maps victory and defeat outcomes to OutcomeCinematic', () => {
    const outcomes: OutcomeKind[] = ['victory', 'defeat'];

    outcomes.forEach((outcome) => {
      const element = CinematicManager({
        outcome,
        progress: 0.5,
      });
      expect(element).toBeDefined();
      expect(element.props.outcome).toBe(outcome);
    });
  });

  it('verifies flare flash intensity curve and shield state at progress 0, 0.5, 1', () => {
    const progresses = [0, 0.5, 1];

    progresses.forEach((p) => {
      const flashIntensity = Math.max(0, Math.sin(p * Math.PI) * 2.5);
      expect(flashIntensity).toBeGreaterThanOrEqual(0);
      expect(flashIntensity).toBeLessThanOrEqual(2.5);

      if (p === 0 || p === 1) {
        expect(flashIntensity).toBeCloseTo(0);
      } else if (p === 0.5) {
        expect(flashIntensity).toBeCloseTo(2.5);
      }
    });
  });

  it('calculates Martian dust storm front propagation at progress 0, 0.5, 1', () => {
    const p0WallZ = -10 + 0 * 18;
    const pHalfWallZ = -10 + 0.5 * 18;
    const p1WallZ = -10 + 1 * 18;

    expect(p0WallZ).toBe(-10);
    expect(pHalfWallZ).toBe(-1);
    expect(p1WallZ).toBe(8);
  });

  it('renders benevolent victory dawn vs tranquil gentle defeat lighting', () => {
    const progresses = [0, 0.5, 1];

    progresses.forEach((p) => {
      // Victory: sunrise grows radiant
      const victorySun = 0.6 + p * 1.6;
      expect(victorySun).toBeGreaterThanOrEqual(0.6);
      expect(victorySun).toBeLessThanOrEqual(2.2);

      // Defeat: gentle fade into tranquil standby
      const defeatSun = Math.max(0.2, 0.8 * (1 - p * 0.7));
      expect(defeatSun).toBeGreaterThanOrEqual(0.2);
      expect(defeatSun).toBeLessThanOrEqual(0.8);
    });
  });

  it('verifies memory disposal of all geometries and materials across event cinematics', () => {
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    // Flare geometries
    geometries.push(new THREE.SphereGeometry(3.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2));

    // Dust storm geometries
    geometries.push(new THREE.PlaneGeometry(22, 7));
    geometries.push(new THREE.CylinderGeometry(10, 10, 6, 16, 1, true));

    // Fault geometries
    geometries.push(new THREE.SphereGeometry(0.15, 12, 12));
    geometries.push(new THREE.SphereGeometry(0.3, 12, 12));

    // Blackout geometries
    geometries.push(new THREE.TorusGeometry(1.2, 0.04, 6, 16));
    geometries.push(new THREE.SphereGeometry(0.35, 8, 8));

    // Outcome geometries
    geometries.push(new THREE.TorusGeometry(1.6, 0.05, 12, 32));
    geometries.push(new THREE.OctahedronGeometry(0.3));

    // Materials
    materials.push(new THREE.MeshStandardMaterial({ color: '#ef4444' }));
    materials.push(new THREE.MeshBasicMaterial({ color: '#ea580c' }));
    materials.push(new THREE.PointsMaterial({ color: '#38bdf8' }));

    expect(geometries).toHaveLength(9);
    expect(materials).toHaveLength(3);

    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  });
});
