// src/three/outpost/OutpostKit.tsx
'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OutpostKitProps } from './types';

/**
 * Modular Outpost Kit:
 * - Central geodesic habitat dome with airlock module
 * - Life support & storage cylinders (O2 / Water)
 * - Articulated dual solar array (unfolds or aligns)
 * - Communication relay antenna mast
 * - Ground anchor pads and beacon lights
 */
export function OutpostKit({
  site = 'shackleton',
  position = [0, 0, 0],
  scale = 1,
  deployed = true,
  deployProgress,
  quality = 'high',
}: OutpostKitProps) {
  const isMars = site === 'gale' || site === 'jezero';

  // Refs for animated or rotatable components
  const solarLeftRef = useRef<THREE.Group>(null);
  const solarRightRef = useRef<THREE.Group>(null);
  const dishRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.PointLight>(null);

  // Materials and colors defined statically to avoid re-allocations
  const colors = useMemo(() => {
    return {
      habitat: isMars ? '#f1f5f9' : '#ffffff',
      hull: isMars ? '#cbd5e1' : '#e2e8f0',
      frame: isMars ? '#78350f' : '#334155',
      solarCell: '#0284c7',
      tank: isMars ? '#e2e8f0' : '#f8fafc',
      airlock: isMars ? '#ea580c' : '#38bdf8',
      goldFoil: '#eab308',
      beacon: isMars ? '#38bdf8' : '#22c55e',
    };
  }, [isMars]);

  // Deployment factor [0, 1]
  const currentDeploy = deployProgress !== undefined ? deployProgress : deployed ? 1 : 0;

  useFrame((state, delta) => {
    // Subtle antenna tracking rotation
    if (dishRef.current) {
      dishRef.current.rotation.y += delta * 0.15;
    }

    // Solar panels tracking or fluttering smoothly
    const flutter = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.03;
    if (solarLeftRef.current) {
      solarLeftRef.current.rotation.z = (currentDeploy * Math.PI * 0.5) + flutter;
    }
    if (solarRightRef.current) {
      solarRightRef.current.rotation.z = (-currentDeploy * Math.PI * 0.5) - flutter;
    }

    // Gentle beacon light pulse
    if (beaconRef.current) {
      beaconRef.current.intensity = 0.5 + Math.sin(state.clock.getElapsedTime() * 2) * 0.3;
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]} data-testid="outpost-kit">
      {/* 1. Main Habitat Dome */}
      <group position={[0, 0, 0]}>
        {/* Base foundation ring */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[2.5, 2.7, 0.2, quality === 'high' ? 32 : 16]} />
          <meshStandardMaterial color={colors.frame} roughness={0.8} metalness={0.4} />
        </mesh>

        {/* Dome hemisphere */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[2.4, quality === 'high' ? 24 : 16, quality === 'high' ? 16 : 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={colors.habitat} roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Top observation cupola */}
        <mesh position={[0, 2.45, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 0.3, 16]} />
          <meshStandardMaterial color={colors.airlock} roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* 2. Airlock Module with Connection Tunnel */}
      <group position={[2.2, 0.45, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.7, 0.7, 1.6, 16]} />
          <meshStandardMaterial color={colors.hull} roughness={0.6} metalness={0.3} />
        </mesh>
        {/* Outer hatch frame */}
        <mesh position={[0.8, 0, 0]}>
          <boxGeometry args={[0.2, 1.2, 1.0]} />
          <meshStandardMaterial color={colors.airlock} roughness={0.5} metalness={0.5} />
        </mesh>
      </group>

      {/* 3. Life Support Tanks (O2 & Water) */}
      <group position={[-1.6, 0.6, 1.4]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 1.0, 16]} />
          <meshStandardMaterial color={colors.tank} roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[0.7, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 1.0, 16]} />
          <meshStandardMaterial color={colors.tank} roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[0.35, -0.4, 0]}>
          <boxGeometry args={[1.5, 0.15, 0.8]} />
          <meshStandardMaterial color={colors.frame} roughness={0.7} metalness={0.5} />
        </mesh>
      </group>

      {/* 4. Articulated Solar Array */}
      <group position={[-2.8, 0.8, -1.0]}>
        {/* Support mast */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 1.6, 8]} />
          <meshStandardMaterial color={colors.frame} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Central hub */}
        <mesh position={[0, 1.4, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color={colors.goldFoil} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Left Solar Panel */}
        <group ref={solarLeftRef} position={[0, 1.4, 0]}>
          <mesh position={[-1.1, 0, 0]}>
            <boxGeometry args={[1.8, 0.04, 0.9]} />
            <meshStandardMaterial color={colors.solarCell} roughness={0.2} metalness={0.8} />
          </mesh>
        </group>

        {/* Right Solar Panel */}
        <group ref={solarRightRef} position={[0, 1.4, 0]}>
          <mesh position={[1.1, 0, 0]}>
            <boxGeometry args={[1.8, 0.04, 0.9]} />
            <meshStandardMaterial color={colors.solarCell} roughness={0.2} metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* 5. Communication Relay Antenna Mast */}
      <group position={[0, 2.5, -0.8]}>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 1.4, 8]} />
          <meshStandardMaterial color={colors.frame} metalness={0.8} roughness={0.3} />
        </mesh>
        <group ref={dishRef} position={[0, 1.4, 0]} rotation={[0.4, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.05, 0.15, 16, 1, true]} />
            <meshStandardMaterial color={colors.goldFoil} metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.2]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color={colors.hull} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* 6. Ground Beacon Light */}
      <group position={[2.8, 0.2, 1.2]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.12, 0.4, 8]} />
          <meshStandardMaterial color={colors.frame} metalness={0.6} roughness={0.4} />
        </mesh>
        <pointLight
          ref={beaconRef}
          position={[0, 0.3, 0]}
          color={colors.beacon}
          distance={8}
          decay={2}
          intensity={0.6}
        />
      </group>
    </group>
  );
}
