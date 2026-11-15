'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CelestialBody, StageMode } from './types';
import {
  createEarthTexture,
  createMarsTexture,
  createMoonTexture,
  createRegolithBumpTexture,
} from './proceduralTextures';

interface OrbitSceneProps {
  mode: StageMode;
  selectedBody?: CelestialBody;
  onSelectBody?: (body: CelestialBody) => void;
  reducedMotion?: boolean;
}

/**
 * Procedural starfield using Points and BufferGeometry.
 */
function StarField({ count = 900 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 80 + Math.random() * 20;

      const sinPhi = Math.sin(phi);
      pos[i * 3] = r * sinPhi * Math.cos(theta);
      pos[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const type = Math.random();
      if (type > 0.8) {
        col[i * 3] = 0.8;
        col[i * 3 + 1] = 0.9;
        col[i * 3 + 2] = 1.0;
      } else if (type > 0.6) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.9;
        col[i * 3 + 2] = 0.7;
      } else {
        col[i * 3] = 0.95;
        col[i * 3 + 1] = 0.95;
        col[i * 3 + 2] = 0.95;
      }
    }

    return { positions: pos, colors: col };
  }, [count]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.65}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Procedural Earth sphere with realistic CanvasTexture (oceans, continents, clouds)
 * and cyan atmospheric halo.
 */
function EarthSphere({ position = [0, 0, -12] as [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const earthTexture = useMemo(() => createEarthTexture(), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* 1. Earth Body with Procedural Surface Map */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[3.2, 36, 36]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Atmospheric Halo: slightly larger sphere with transparent cyan MeshBasicMaterial */}
      <mesh scale={[1.06, 1.06, 1.06]}>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Procedural Moon sphere: cratered CanvasTexture, roughness: 1.0,
 * regolith bumpMap, wireframe removed.
 */
function MoonSphere({
  position = [-3.8, 0.4, 0] as [number, number, number],
  isSelected = false,
  onClick,
}: {
  position?: [number, number, number];
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const moonTexture = useMemo(() => createMoonTexture(), []);
  const bumpTexture = useMemo(() => createRegolithBumpTexture(), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.3, 36, 36]} />
        <meshStandardMaterial
          map={moonTexture}
          bumpMap={bumpTexture}
          bumpScale={0.06}
          roughness={1.0}
          metalness={0.0}
          emissive={isSelected ? '#38bdf8' : '#000000'}
          emissiveIntensity={isSelected ? 0.25 : 0}
        />
      </mesh>

      {/* Selection halo: soft atmospheric rim glow (wireframe removed) */}
      {isSelected && (
        <mesh scale={[1.12, 1.12, 1.12]}>
          <sphereGeometry args={[1.3, 24, 24]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.22}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Procedural Mars sphere: rusty/ochre CanvasTexture with dark maria & polar cap.
 */
function MarsSphere({
  position = [3.8, -0.4, 0] as [number, number, number],
  isSelected = false,
  onClick,
}: {
  position?: [number, number, number];
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const marsTexture = useMemo(() => createMarsTexture(), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.045;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 36, 36]} />
        <meshStandardMaterial
          map={marsTexture}
          roughness={0.9}
          metalness={0.05}
          emissive={isSelected ? '#f97316' : '#000000'}
          emissiveIntensity={isSelected ? 0.25 : 0}
        />
      </mesh>

      {/* Atmosphere haze */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshBasicMaterial
          color="#ea580c"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Selection halo (wireframe removed) */}
      {isSelected && (
        <mesh scale={[1.12, 1.12, 1.12]}>
          <sphereGeometry args={[1.5, 24, 24]} />
          <meshBasicMaterial
            color="#fb923c"
            transparent
            opacity={0.25}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * OrbitScene with realistic deep space lighting:
 * - High-intensity directional sunlight on the side (terminator line)
 * - Faint ambient light (0.1) for realistic shadows
 */
export function OrbitScene({
  mode: _mode,
  selectedBody,
  onSelectBody,
}: OrbitSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      {/* 1. Deep Space Ambient Lighting (subtle non-black dark side) */}
      <ambientLight intensity={0.1} />

      {/* 2. Strong Side Sun Directional Light for sharp planetary day/night terminator */}
      <directionalLight
        position={[14, 2, 7]}
        intensity={2.6}
        castShadow
      />

      {/* 3. Celestial Starfield */}
      <StarField />

      {/* 4. Planetary Bodies */}
      <EarthSphere />

      <MoonSphere
        isSelected={selectedBody === 'moon'}
        onClick={() => onSelectBody?.('moon')}
      />

      <MarsSphere
        isSelected={selectedBody === 'mars'}
        onClick={() => onSelectBody?.('mars')}
      />
    </group>
  );
}
