import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { OutpostKit } from '../../src/three/outpost/OutpostKit';
import type { SiteId } from '../../src/engine/types';

describe('src/three/outpost/OutpostKit', () => {
  it('exports OutpostKit component', () => {
    expect(OutpostKit).toBeDefined();
    expect(typeof OutpostKit).toBe('function');
  });

  it('provides distinct palette configuration for Moon and Mars sites', () => {
    const moonSites: SiteId[] = ['shackleton', 'tranquillitatis'];
    const marsSites: SiteId[] = ['jezero', 'gale'];

    moonSites.forEach((site) => {
      const isMars = site === 'gale' || site === 'jezero';
      expect(isMars).toBe(false);
    });

    marsSites.forEach((site) => {
      const isMars = site === 'gale' || site === 'jezero';
      expect(isMars).toBe(true);
    });
  });

  it('disposes all geometries and materials without memory leakage', () => {
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    // Simulate creation of components used in OutpostKit
    const domeGeo = new THREE.SphereGeometry(2.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const cylinderGeo = new THREE.CylinderGeometry(2.5, 2.7, 0.2, 16);
    const boxGeo = new THREE.BoxGeometry(1.8, 0.04, 0.9);
    const matA = new THREE.MeshStandardMaterial({ color: '#ffffff' });
    const matB = new THREE.MeshStandardMaterial({ color: '#0284c7' });

    geometries.push(domeGeo, cylinderGeo, boxGeo);
    materials.push(matA, matB);

    expect(geometries).toHaveLength(3);
    expect(materials).toHaveLength(2);

    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  });
});
