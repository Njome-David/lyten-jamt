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
 * Procedural 3D planetary exploration rover (6-wheel rocker-bogie style)
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
    chassis: isMars ? '#78350f' : '#334155',
    wheels: '#1e293b',
    goldFoil: '#eab308',
    sensor: '#38bdf8',
    mast: '#475569',
  }), [isMars]);

  // Wheel positions relative to rover center: 3 on left, 3 on right
  const wheelOffsets: Array<[number, number, number]> = useMemo(() => [
    [-0.6, -0.2, -0.5],
    [-0.65, -0.2, 0.0],
    [-0.6, -0.2, 0.5],
    [0.6, -0.2, -0.5],
    [0.65, -0.2, 0.0],
    [0.6, -0.2, 0.5],
  ], []);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]} data-testid="rover">
      {/* 1. Main Body / Equipment Deck */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.9, 0.35, 1.2]} />
        <meshStandardMaterial color={colors.body} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Top Solar panel / Instrument plate */}
      <mesh position={[0, 0.29, 0]}>
        <boxGeometry args={[0.82, 0.04, 1.1]} />
        <meshStandardMaterial color={colors.goldFoil} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 2. Camera Mast (MastCam) */}
      <group position={[0.25, 0.45, 0.4]}>
        {/* Vertical mast */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.45, 8]} />
          <meshStandardMaterial color={colors.mast} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Head / Stereo camera */}
        <mesh position={[0, 0.45, 0.05]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.18, 0.1, 0.12]} />
          <meshStandardMaterial color={colors.chassis} metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Left and right lenses */}
        <mesh position={[-0.05, 0.45, 0.12]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={colors.sensor} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.05, 0.45, 0.12]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={colors.sensor} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* 3. Rear Antenna Dish */}
      <group position={[-0.25, 0.4, -0.4]} rotation={[-0.3, 0.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
          <meshStandardMaterial color={colors.mast} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.02, 0.06, 12, 1, true]} />
          <meshStandardMaterial color={colors.goldFoil} metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 4. Rocker-Bogie Chassis Suspension Tubes */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.0, 0.08, 0.9]} />
        <meshStandardMaterial color={colors.chassis} roughness={0.6} metalness={0.5} />
      </mesh>

      {/* 5. Six Rugged Wheels */}
      {wheelOffsets.map(([wx, wy, wz], idx) => (
        <group key={idx} position={[wx, wy, wz]}>
          <mesh
            ref={(el) => {
              wheelRefs.current[idx] = el;
            }}
            rotation={[wheelAngle, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.18, 0.18, 0.14, 16]} />
            <meshStandardMaterial color={colors.wheels} roughness={0.9} metalness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
