// src/three/cinematics/Rover.tsx
'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';

export interface RoverProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  wheelAngle?: number;
  isMars?: boolean;
  scale?: number;
}

/**
 * Procedural 3D planetary exploration rover:
 * Clean, iconic silhouette designed for 7-12 year-olds:
 * - Clear white/light rectangular main chassis
 * - 6 distinct, prominent wheels with visible suspension axles
 * - High camera mast with dual stereo lenses overlooking the front
 * - Solar array panel deck covering the back
 */
export function Rover({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  wheelAngle = 0,
  isMars = false,
  scale = 1,
}: RoverProps) {
  const wheelRefs = useRef<Array<THREE.Mesh | null>>([]);

  const colors = useMemo(() => ({
    body: isMars ? '#f8fafc' : '#ffffff',
    solarDeck: '#0284c7',
    solarFrame: '#eab308',
    chassis: '#334155',
    wheels: '#1e293b',
    rims: '#94a3b8',
    mast: '#64748b',
    cameraHead: '#1e293b',
    cameraEyes: '#38bdf8',
    antenna: '#fbbf24',
  }), [isMars]);

  // Wheel positions: 3 on left (x=-0.8), 3 on right (x=0.8)
  const wheelOffsets: Array<[number, number, number]> = useMemo(() => [
    [-0.8, -0.2, -0.55], // Front-left
    [-0.85, -0.2, 0.0],  // Mid-left
    [-0.8, -0.2, 0.55],  // Rear-left
    [0.8, -0.2, -0.55],  // Front-right
    [0.85, -0.2, 0.0],   // Mid-right
    [0.8, -0.2, 0.55],   // Rear-right
  ], []);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]} data-testid="rover">
      {/* 1. Main Rectangular Chassis (Clear, bright & distinct) */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.05, 0.42, 1.45]} />
        <meshStandardMaterial color={colors.body} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Front bumper / hazard bar */}
      <mesh position={[0, 0.02, 0.76]}>
        <boxGeometry args={[0.9, 0.12, 0.08]} />
        <meshStandardMaterial color={colors.chassis} roughness={0.6} metalness={0.5} />
      </mesh>

      {/* 2. Solar Panels on the Back (Classic NASA planetary rover look) */}
      <group position={[0, 0.35, -0.15]}>
        {/* Outer gold-trimmed perimeter frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.95, 0.04, 0.95]} />
          <meshStandardMaterial color={colors.solarFrame} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Deep blue solar cell plate */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.88, 0.02, 0.88]} />
          <meshStandardMaterial color={colors.solarDeck} roughness={0.15} metalness={0.85} />
        </mesh>
      </group>

      {/* 3. Tall Camera Mast Standing High at Front */}
      <group position={[0.25, 0.35, 0.45]}>
        {/* Tall vertical mast pole */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.8, 12]} />
          <meshStandardMaterial color={colors.mast} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Articulated Camera Head */}
        <group position={[0, 0.82, 0.05]}>
          <mesh>
            <boxGeometry args={[0.28, 0.16, 0.18]} />
            <meshStandardMaterial color={colors.cameraHead} roughness={0.4} metalness={0.6} />
          </mesh>

          {/* Dual front stereo camera "eyes" */}
          <mesh position={[-0.08, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.08, 12]} />
            <meshStandardMaterial color={colors.cameraEyes} emissive={colors.cameraEyes} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.08, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.08, 12]} />
            <meshStandardMaterial color={colors.cameraEyes} emissive={colors.cameraEyes} emissiveIntensity={0.6} />
          </mesh>
        </group>
      </group>

      {/* 4. Rear Communication High-Gain Antenna */}
      <group position={[-0.3, 0.35, -0.55]} rotation={[-0.2, 0.3, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.5, 8]} />
          <meshStandardMaterial color={colors.mast} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 3, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.02, 0.08, 16, 1, true]} />
          <meshStandardMaterial color={colors.antenna} metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 5. Six Prominent Wheels with Suspension Links */}
      {wheelOffsets.map(([wx, wy, wz], idx) => {
        const isLeft = wx < 0;
        return (
          <group key={idx} position={[wx, wy, wz]}>
            {/* Horizontal axle connecting chassis to wheel */}
            <mesh position={[isLeft ? 0.18 : -0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
              <meshStandardMaterial color={colors.chassis} metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Rugged Wheel Tyre */}
            <mesh
              ref={(el) => {
                wheelRefs.current[idx] = el;
              }}
              rotation={[wheelAngle, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} />
              <meshStandardMaterial color={colors.wheels} roughness={0.9} metalness={0.1} />
            </mesh>

            {/* Central Wheel Rim Hubcap */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.19, 12]} />
              <meshStandardMaterial color={colors.rims} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
