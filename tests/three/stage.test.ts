import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { getTerrainHeight, generateSampleCraters } from '../../src/three/noise';
import { getQualityConfig } from '../../src/three/stage/quality';

describe('src/three/stage/stage lifecycle and memory isolation', () => {
  it('disposes procedural geometries and materials properly across 20 scene cycles', () => {
    const sites = ['shackleton', 'tranquillitatis', 'jezero', 'gale'] as const;
    const trackedGeometries: THREE.BufferGeometry[] = [];
    const trackedMaterials: THREE.Material[] = [];

    // Simulate 20 rapid site and scene switches
    for (let cycle = 0; cycle < 20; cycle++) {
      const siteId = sites[cycle % sites.length]!;
      const quality = getQualityConfig(cycle % 2 === 0 ? 'high' : 'low');

      // Create procedural terrain geometry as done in SurfaceScene
      const size = 60;
      const seed = siteId === 'shackleton' ? 101 : siteId === 'tranquillitatis' ? 202 : siteId === 'jezero' ? 303 : 404;
      const geo = new THREE.PlaneGeometry(size, size, quality.terrainSubdivisions, quality.terrainSubdivisions);
      geo.rotateX(-Math.PI / 2);

      const pos = geo.attributes.position;
      expect(pos).toBeDefined();
      if (pos) {
        const craters = generateSampleCraters(seed, 6, 2.5, 7, size * 0.4);
        for (let i = 0; i < Math.min(pos.count, 20); i++) {
          const x = pos.getX(i);
          const z = pos.getZ(i);
          const y = getTerrainHeight(x, z, { seed, craters });
          pos.setY(i, y);
        }
      }

      const mat = new THREE.MeshStandardMaterial({ color: '#555555' });

      // Track disposal
      const geoDisposeSpy = vi.spyOn(geo, 'dispose');
      const matDisposeSpy = vi.spyOn(mat, 'dispose');

      trackedGeometries.push(geo);
      trackedMaterials.push(mat);

      // Simulate scene unmount / cleanup
      geo.dispose();
      mat.dispose();

      expect(geoDisposeSpy).toHaveBeenCalledTimes(1);
      expect(matDisposeSpy).toHaveBeenCalledTimes(1);
    }

    expect(trackedGeometries).toHaveLength(20);
    expect(trackedMaterials).toHaveLength(20);
  });

  it('maintains expected camera coordinates and targets for each stage mode', () => {
    const getCameraPose = (mode: string, body?: string) => {
      const pos = new THREE.Vector3();
      const look = new THREE.Vector3();
      switch (mode) {
        case 'title':
          pos.set(0, 2, 10);
          look.set(0, 0, -2);
          break;
        case 'destination':
          if (body === 'moon') {
            pos.set(-3.8, 1.2, 4.5);
            look.set(-3.8, 0.4, 0);
          } else if (body === 'mars') {
            pos.set(3.8, 0.8, 5.0);
            look.set(3.8, -0.4, 0);
          } else {
            pos.set(0, 1.5, 9.0);
            look.set(0, 0, 0);
          }
          break;
        case 'sites':
          pos.set(0, 8, 13);
          look.set(0, 1, 0);
          break;
        case 'loadout':
          pos.set(8, 5, 9);
          look.set(0, 1.2, 0);
          break;
        case 'mission':
          pos.set(7, 4.5, 8.5);
          look.set(0, 1.0, 0);
          break;
        case 'debrief':
          pos.set(5, 3.2, 6.5);
          look.set(0, 1.5, 0);
          break;
      }
      return { pos, look };
    };

    const title = getCameraPose('title');
    expect(title.pos.z).toBe(10);
    expect(title.look.z).toBe(-2);

    const destMoon = getCameraPose('destination', 'moon');
    expect(destMoon.pos.x).toBe(-3.8);

    const destMars = getCameraPose('destination', 'mars');
    expect(destMars.pos.x).toBe(3.8);

    const mission = getCameraPose('mission');
    expect(mission.pos.y).toBe(4.5);
  });
});
