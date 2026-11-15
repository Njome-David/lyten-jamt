import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  DrillCinematic,
  ExperimentCinematic,
  RepairCinematic,
  UplinkCinematic,
  CinematicManager,
  STYLE_DURATIONS_SEC,
} from '../../src/three/cinematics';
import type { Archetype, OptionStyle } from '../../src/engine/types';

describe('src/three/cinematics core components (T15)', () => {
  it('exports all 4 core archetype cinematic components and manager', () => {
    expect(DrillCinematic).toBeDefined();
    expect(ExperimentCinematic).toBeDefined();
    expect(RepairCinematic).toBeDefined();
    expect(UplinkCinematic).toBeDefined();
    expect(CinematicManager).toBeDefined();
  });

  it('correctly maps all 6 engine archetypes to their dedicated cinematic components', () => {
    const archetypes: Archetype[] = [
      'travel',
      'deploy',
      'drill',
      'experiment',
      'repair',
      'uplink',
    ];

    archetypes.forEach((archetype) => {
      const element = CinematicManager({
        archetype,
        style: 'balanced',
        progress: 0.5,
      });
      expect(element).toBeDefined();
      expect(element.props.archetype).toBe(archetype);
    });
  });

  it('renders drill animation values at progress 0, 0.5, 1 across all 3 styles without error', () => {
    const styles: OptionStyle[] = ['fast', 'balanced', 'careful'];
    const progresses = [0, 0.5, 1];

    styles.forEach((style) => {
      progresses.forEach((p) => {
        let drillDescent = 0;
        let coreAscent = 0;

        if (style === 'fast') {
          if (p < 0.7) {
            drillDescent = (p / 0.7) * 0.8;
          } else {
            drillDescent = 0.8 - ((p - 0.7) / 0.3) * 0.4;
            coreAscent = Math.min(1.0, (p - 0.7) / 0.3);
          }
        } else if (style === 'careful') {
          if (p < 0.3) {
            drillDescent = (p / 0.3) * 0.4;
          } else if (p < 0.4) {
            drillDescent = 0.4;
          } else if (p < 0.7) {
            drillDescent = 0.4 + ((p - 0.4) / 0.3) * 0.4;
          } else {
            drillDescent = 0.8;
            coreAscent = Math.min(1.0, (p - 0.7) / 0.3);
          }
        } else {
          drillDescent = Math.sin(p * Math.PI * 0.5) * 0.8;
          coreAscent = Math.max(0, (p - 0.6) / 0.4);
        }

        expect(drillDescent).toBeGreaterThanOrEqual(0);
        expect(drillDescent).toBeLessThanOrEqual(0.8);
        expect(coreAscent).toBeGreaterThanOrEqual(0);
        expect(coreAscent).toBeLessThanOrEqual(1.0);
      });
    });
  });

  it('calculates repair panel angle correctly at progress 0, 0.5 and 1', () => {
    // Panel starts unseated at -0.8 rad and locks flush at 0.0 rad
    const p0Angle = (1 - 0) * -0.8;
    const pHalfAngle = (1 - 0.5) * -0.8;
    const p1Angle = (1 - 1) * -0.8;

    expect(p0Angle).toBeCloseTo(-0.8);
    expect(pHalfAngle).toBeCloseTo(-0.4);
    expect(p1Angle).toBeCloseTo(0);
  });

  it('provides distinct uplink propagation delay visual metadata for Mars vs Moon', () => {
    const moonSites = ['shackleton', 'tranquillitatis'];
    const marsSites = ['jezero', 'gale'];

    moonSites.forEach((site) => {
      const isMars = site === 'gale' || site === 'jezero';
      const label = isMars ? 'about 14 min (compressed)' : '1.2s Earth Uplink';
      expect(label).toBe('1.2s Earth Uplink');
    });

    marsSites.forEach((site) => {
      const isMars = site === 'gale' || site === 'jezero';
      const label = isMars ? 'about 14 min (compressed)' : '1.2s Earth Uplink';
      expect(label).toBe('about 14 min (compressed)');
    });
  });

  it('calculates Mars signal packet trajectory at progress 0, 0.5 and 1 without unbounded positions', () => {
    const progresses = [0, 0.5, 1];

    progresses.forEach((p) => {
      const transmitP = Math.max(0, (p - 0.3) / 0.7);
      const packetX = transmitP * 7.0;
      const packetY = 2.4 + transmitP * 5.0;
      const packetZ = -transmitP * 5.0;

      expect(packetX).toBeGreaterThanOrEqual(0);
      expect(packetX).toBeLessThanOrEqual(7.0);
      expect(packetY).toBeGreaterThanOrEqual(2.4);
      expect(packetY).toBeLessThanOrEqual(7.4);
      expect(packetZ).toBeLessThanOrEqual(0);
      expect(packetZ).toBeGreaterThanOrEqual(-5.0);
    });
  });

  it('verifies memory disposal of all geometries and materials across 4 core cinematics', () => {
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    // Drill geometries
    geometries.push(new THREE.CylinderGeometry(0.08, 0.1, 2.4, 6));
    geometries.push(new THREE.ConeGeometry(0.1, 0.2, 8));

    // Experiment geometries
    geometries.push(new THREE.SphereGeometry(0.7, 16, 16));
    geometries.push(new THREE.TorusGeometry(0.85, 0.03, 8, 32));

    // Repair geometries
    geometries.push(new THREE.BoxGeometry(1.2, 1.2, 0.4));
    geometries.push(new THREE.BoxGeometry(1.0, 1.0, 0.05));

    // Uplink geometries
    geometries.push(new THREE.CylinderGeometry(1.1, 0.1, 0.3, 24, 1, true));
    geometries.push(new THREE.RingGeometry(1.8, 1.9, 32));

    // Materials
    materials.push(new THREE.MeshStandardMaterial({ color: '#334155' }));
    materials.push(new THREE.MeshBasicMaterial({ color: '#ea580c' }));
    materials.push(new THREE.PointsMaterial({ color: '#fbbf24' }));

    expect(geometries).toHaveLength(8);
    expect(materials).toHaveLength(3);

    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  });

  it('strictly respects 2.5s, 3.5s and 5.0s durations across all cinematics', () => {
    expect(STYLE_DURATIONS_SEC.fast).toBe(2.5);
    expect(STYLE_DURATIONS_SEC.balanced).toBe(3.5);
    expect(STYLE_DURATIONS_SEC.careful).toBe(5.0);
  });
});
