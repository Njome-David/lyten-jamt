'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeight, generateSampleCraters, type TerrainNoiseOptions } from '../noise';
import type { SiteId, CelestialBody } from './types';
import type { QualityConfig } from './quality';

interface SurfaceSceneProps {
  site?: SiteId;
  body?: CelestialBody;
  qualityConfig: QualityConfig;
}

interface SiteAtmosphere {
  groundColor: string;
  sunPosition: [number, number, number];
  sunColor: string;
  sunIntensity: number;
  ambientColor: string;
  ambientIntensity: number;
  fogColor?: string;
  fogDensity?: number;
  hasEarthInSky: boolean;
  hasDust: boolean;
}

const SITE_CONFIGS: Record<SiteId, SiteAtmosphere> = {
  shackleton: {
    groundColor: '#474f5a',
    sunPosition: [35, 4, 25], // Very low sun angle (long dramatic shadows)
    sunColor: '#fffaf0',
    sunIntensity: 2.2,
    ambientColor: '#0b111e',
    ambientIntensity: 0.18,
    hasEarthInSky: true,
    hasDust: false,
  },
  tranquillitatis: {
    groundColor: '#7a828e',
    sunPosition: [20, 28, 15], // Higher sun
    sunColor: '#ffffff',
    sunIntensity: 2.0,
    ambientColor: '#172033',
    ambientIntensity: 0.28,
    hasEarthInSky: true,
    hasDust: false,
  },
  jezero: {
    groundColor: '#a84e32',
    sunPosition: [22, 16, 14],
    sunColor: '#ffd8be',
    sunIntensity: 1.3,
    ambientColor: '#522616',
    ambientIntensity: 0.45,
    fogColor: '#b45a38',
    fogDensity: 0.018,
    hasEarthInSky: false,
    hasDust: true,
  },
  gale: {
    groundColor: '#964228',
    sunPosition: [18, 18, 18],
    sunColor: '#ffcaa4',
    sunIntensity: 1.25,
    ambientColor: '#482014',
    ambientIntensity: 0.48,
    fogColor: '#aa5232',
    fogDensity: 0.022,
    hasEarthInSky: false,
    hasDust: true,
  },
};

/**
 * Procedural terrain mesh generated from seeded noise and craters.
 */
function ProceduralTerrain({
  siteId,
  subdivisions,
  receiveShadow,
  groundColor,
}: {
  siteId: SiteId;
  subdivisions: number;
  receiveShadow: boolean;
  groundColor: string;
}) {
  const seed = siteId === 'shackleton' ? 101 : siteId === 'tranquillitatis' ? 202 : siteId === 'jezero' ? 303 : 404;

  const geometry = useMemo(() => {
    const size = 60;
    const geo = new THREE.PlaneGeometry(size, size, subdivisions, subdivisions);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    if (!pos) return geo;

    const craters = generateSampleCraters(seed, 6, 2.5, 7, size * 0.4);

    const options: TerrainNoiseOptions = {
      seed,
      scale: 0.06,
      octaves: 4,
      persistence: 0.5,
      heightScale: 2.8,
      craters,
    };

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getTerrainHeight(x, z, options);
      pos.setY(i, y);
    }

    geo.computeVertexNormals();
    return geo;
  }, [seed, subdivisions]);

  return (
    <mesh geometry={geometry} receiveShadow={receiveShadow}>
      <meshStandardMaterial
        color={groundColor}
        roughness={0.92}
        metalness={0.06}
        flatShading={false}
      />
    </mesh>
  );
}

/**
 * Instanced rocks scattered on the terrain.
 */
function InstancedRocks({
  siteId,
  count = 40,
}: {
  siteId: SiteId;
  count?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const seed = siteId === 'shackleton' ? 101 : siteId === 'tranquillitatis' ? 202 : siteId === 'jezero' ? 303 : 404;

  const geometry = useMemo(() => new THREE.DodecahedronGeometry(0.5, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: siteId === 'jezero' || siteId === 'gale' ? '#782d19' : '#333a42',
        roughness: 0.95,
      }),
    [siteId]
  );

  React.useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const craters = generateSampleCraters(seed, 6, 2.5, 7, 24);
    const options: TerrainNoiseOptions = { seed, scale: 0.06, craters };

    let placed = 0;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (seed % 10);
      const dist = 4 + (Math.sin(i * 99) * 0.5 + 0.5) * 20;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = getTerrainHeight(x, z, options) + 0.15;

      const scale = 0.4 + (Math.cos(i * 33) * 0.5 + 0.5) * 0.8;
      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(placed++, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [seed, count]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
}

/**
 * Swirling Martian dust particles.
 */
function MartianDust({ count = 200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 8 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return { positions: pos };
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    if (!posAttr) return;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const currentX = array[idx];
      if (typeof currentX === 'number') {
        const nextX = currentX + delta * 1.5;
        array[idx] = nextX > 20 ? -20 : nextX;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f97316"
        size={0.25}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Basic modular outpost base mesh (habitat dome + solar array silhouette).
 */
function OutpostPlaceholder() {
  return (
    <group position={[0, 0, 0]}>
      {/* Central habitat dome */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <sphereGeometry args={[2.2, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Base collar */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.5, 0.4, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {/* Habitat beacon */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      {/* Solar panel row placeholder */}
      <mesh position={[-4.5, 0.8, -1]} rotation={[0.3, 0.2, 0]} castShadow>
        <boxGeometry args={[3.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Earth visible from the Moon.
 */
function EarthInLunarSky() {
  return (
    <group position={[-16, 18, -32]}>
      <mesh>
        <sphereGeometry args={[2.5, 24, 24]} />
        <meshStandardMaterial
          color="#2563eb"
          roughness={0.6}
          emissive="#1e3a8a"
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[2.5, 20, 20]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.2} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

export function SurfaceScene({
  site = 'shackleton',
  qualityConfig,
}: SurfaceSceneProps) {
  const config = SITE_CONFIGS[site] ?? SITE_CONFIGS.shackleton;
  const rockCount = qualityConfig.level === 'high' ? 45 : 20;

  return (
    <group>
      {/* Ambient and fill lighting: HemisphereLight debouches lunar and planetary shadows */}
      <hemisphereLight
        args={['#e2e8f0', '#334155', 1.5]}
      />
      <ambientLight color={config.ambientColor} intensity={config.ambientIntensity} />

      {/* Main directional sunlight */}
      <directionalLight
        position={config.sunPosition}
        color={config.sunColor}
        intensity={config.sunIntensity}
        castShadow={qualityConfig.shadows}
        shadow-mapSize-width={qualityConfig.level === 'high' ? 1024 : 512}
        shadow-mapSize-height={qualityConfig.level === 'high' ? 1024 : 512}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Outpost local illumination: soft blue work lights */}
      <pointLight
        position={[0, 4.5, 0.5]}
        color="#60a5fa"
        intensity={2.0}
        distance={25}
        decay={2}
      />

      {config.fogColor && (
        <fogExp2 attach="fog" args={[config.fogColor, config.fogDensity ?? 0.02]} />
      )}

      {config.hasEarthInSky && <EarthInLunarSky />}

      <ProceduralTerrain
        siteId={site}
        subdivisions={qualityConfig.terrainSubdivisions}
        receiveShadow={qualityConfig.shadows}
        groundColor={config.groundColor}
      />

      <InstancedRocks siteId={site} count={rockCount} />
      <OutpostPlaceholder />

      {config.hasDust && qualityConfig.particlesCount > 0 && (
        <MartianDust count={qualityConfig.particlesCount} />
      )}
    </group>
  );
}
