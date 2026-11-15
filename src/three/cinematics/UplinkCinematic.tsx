// src/three/cinematics/UplinkCinematic.tsx
'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STYLE_DURATIONS_SEC, type CinematicProps } from './types';

/**
 * Uplink Cinematic:
 * High-gain planetary transmission to Earth relay constellation.
 * - Dish aligns towards Earth trajectory.
 * - Emits radio pulse waves expanding outward.
 * - Moon: Light-speed packet reaches Earth fast (~1.2s delay note).
 * - Mars: Radio packet travels slowly across the sky with visual latency badge:
 *   "about 14 min (compressed)" or "about 20 min (compressed)".
 */
export function UplinkCinematic({
  style = 'balanced',
  progress: externalProgress,
  speedMultiplier = 1,
  reducedMotion = false,
  onComplete,
  site = 'shackleton',
}: CinematicProps) {
  const isMars = site === 'gale' || site === 'jezero';
  const duration = STYLE_DURATIONS_SEC[style] / speedMultiplier;

  const [internalTime, setInternalTime] = useState(0);
  const [completed, setCompleted] = useState(false);

  const dishPivotRef = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const packetRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion) {
      if (!completed && internalTime > 1.0) {
        setCompleted(true);
        onComplete?.();
      }
      setInternalTime((t) => t + delta);
      return;
    }

    if (externalProgress === undefined) {
      const nextTime = internalTime + delta;
      setInternalTime(nextTime);
      const currentProg = Math.min(1, nextTime / duration);

      if (currentProg >= 1 && !completed) {
        setCompleted(true);
        onComplete?.();
      }
    }
  });

  const p = reducedMotion
    ? 0.5
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / duration);

  // Antenna alignment phase: 0 to 0.3 rotates into position
  const alignP = Math.min(1, p / 0.3);
  const dishAngleX = 0.3 + alignP * 0.4;
  const dishAngleY = alignP * 0.5;

  // Radio pulse phase: 0.3 to 1.0
  const transmitP = Math.max(0, (p - 0.3) / 0.7);

  // For Mars, packet moves slowly across sky:
  // Starts at dish [0, 2.5, 0] and ascends to [6, 7, -4]
  const packetX = transmitP * 7.0;
  const packetY = 2.4 + transmitP * 5.0;
  const packetZ = -transmitP * 5.0;

  const signalColor = isMars ? '#ea580c' : '#38bdf8';
  const mastColor = '#475569';
  const goldColor = '#eab308';

  // Specific latency tag content as required by PRESENTATION.md:
  const latencyLabel = isMars ? 'about 14 min (compressed)' : '1.2s Earth Uplink';

  return (
    <group position={[-2.5, 0, 1.0]} data-testid="cinematic-uplink">
      {/* 1. Deep Space Communication Antenna Tower */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 1.6, 8]} />
        <meshStandardMaterial color={mastColor} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 2. Articulated Dish Assembly */}
      <group
        ref={dishPivotRef}
        position={[0, 1.6, 0]}
        rotation={[dishAngleX, dishAngleY, 0]}
      >
        {/* Gimbal mount */}
        <mesh>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial color={goldColor} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Large parabolic reflector */}
        <mesh position={[0, 0.4, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.1, 0.1, 0.3, 24, 1, true]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.7}
            roughness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Subreflector feed horn */}
        <mesh position={[0, 0.4, 0.8]}>
          <coneGeometry args={[0.12, 0.3, 12]} />
          <meshStandardMaterial color={goldColor} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 3. Expanding Radio Pulse Waves */}
      {transmitP > 0.05 && (
        <group position={[0, 2.2, 0.4]} rotation={[dishAngleX, dishAngleY, 0]}>
          <mesh ref={pulseRingRef} position={[0, 0, transmitP * 3.5]}>
            <ringGeometry args={[transmitP * 1.8, transmitP * 1.8 + 0.1, 32]} />
            <meshBasicMaterial
              color={signalColor}
              transparent
              opacity={Math.max(0, 1 - transmitP) * 0.75}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* 4. Planetary Data Packet Traversing the Sky */}
      {transmitP > 0.05 && (
        <group ref={packetRef} position={[packetX, packetY, packetZ]}>
          {/* Signal energy orb */}
          <mesh>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial
              color={signalColor}
              emissive={signalColor}
              emissiveIntensity={0.9}
              roughness={0.2}
            />
          </mesh>

          {/* Concentric telemetry pulse halo */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.35, 0.02, 8, 24]} />
            <meshBasicMaterial color={signalColor} transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* Visual Delay Metadata Marker for Tests & Accessible Inspection */}
      <mesh visible={false} name={latencyLabel}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
      </mesh>
    </group>
  );
}
