'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CelestialBody, StageMode } from './types';

interface OrbitSceneProps {
  mode: StageMode;
  selectedBody?: CelestialBody;
  onSelectBody?: (body: CelestialBody) => void;
  reducedMotion?: boolean;
}

/**
 * Procedural starfield using Points and BufferGeometry.
 */
function StarField({ count = 800 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Uniform distribution on sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 80 + Math.random() * 20;

      const sinPhi = Math.sin(phi);
      pos[i * 3] = r * sinPhi * Math.cos(theta);
      pos[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Star hues: slightly blue, warm, or white
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
        size={0.6}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Procedural Earth sphere with atmosphere halo.
 */
function EarthSphere({ position = [0, 0, -12] as [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshStandardMaterial
          color="#1e40af"
          roughness={0.7}
          metalness={0.1}
          emissive="#0d1b4a"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[3.2, 24, 24]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Procedural Moon sphere.
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

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#f1f5f9' : '#cbd5e1'}
          roughness={0.9}
          metalness={0.05}
          emissive={isSelected ? '#38bdf8' : '#000000'}
          emissiveIntensity={isSelected ? 0.25 : 0}
        />
      </mesh>
      {/* Selection halo */}
      {isSelected && (
        <mesh scale={[1.15, 1.15, 1.15]}>
          <sphereGeometry args={[1.3, 24, 24]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.25}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Procedural Mars sphere with subtle polar caps.
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

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.045;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#ff8a4c' : '#c2410c'}
          roughness={0.85}
          metalness={0.1}
          emissive={isSelected ? '#f97316' : '#431407'}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
        />
      </mesh>
      {/* Atmosphere haze */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshBasicMaterial
          color="#ea580c"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Selection halo */}
      {isSelected && (
        <mesh scale={[1.15, 1.15, 1.15]}>
          <sphereGeometry args={[1.5, 24, 24]} />
          <meshBasicMaterial
            color="#fb923c"
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

export function OrbitScene({
  mode: _mode,
  selectedBody,
  onSelectBody,
}: OrbitSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <directionalLight position={[-10, -5, -10]} intensity={0.2} color="#3b82f6" />

      <StarField />
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
