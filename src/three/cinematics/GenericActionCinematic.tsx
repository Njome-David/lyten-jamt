// src/three/cinematics/GenericActionCinematic.tsx
'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STYLE_DURATIONS_SEC, type CinematicProps } from './types';

/**
 * GenericAction Cinematic:
 * Standard visual action sequence used whenever a specific archetype cinematic
 * (such as drill, experiment, repair, uplink) is not yet implemented or active.
 *
 * Displays a futuristic robotic telemetry probe / scanning beacon with
 * holographic energy pulses and ground scanning projection rings.
 */
export function GenericActionCinematic({
  archetype,
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

  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
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

    const t = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5;
      ringRef.current.rotation.x = Math.sin(t * 2) * 0.2;
    }
    if (coreRef.current) {
      coreRef.current.position.y = 1.2 + Math.sin(t * 3) * 0.15;
    }
  });

  const p = reducedMotion
    ? 0.5
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / duration);

  // Distinct theme color based on archetype
  const actionColor = (() => {
    switch (archetype) {
      case 'drill':
        return '#f97316'; // Orange / geothermal
      case 'experiment':
        return '#a855f7'; // Purple / scientific
      case 'repair':
        return '#eab308'; // Amber / maintenance
      case 'uplink':
        return '#06b6d4'; // Cyan / telecomm
      default:
        return isMars ? '#f97316' : '#38bdf8';
    }
  })();

  const ringScale = 0.5 + p * 1.8;
  const pulseOpacity = Math.max(0.2, (1 - (p % 0.33) * 3));

  return (
    <group position={[0, 0, 4.0]} data-testid="cinematic-generic-action">
      {/* 1. Tripod Field Telemetry Base */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 0.4, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 2. Floating Kinetic Data Core */}
      <mesh ref={coreRef} position={[0, 1.2, 0]}>
        <octahedronGeometry args={[0.35]} />
        <meshStandardMaterial
          color={actionColor}
          emissive={actionColor}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* 3. Holographic Field Scanning Ring */}
      <mesh ref={ringRef} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.03, 8, 32]} />
        <meshBasicMaterial color={actionColor} transparent opacity={0.7} />
      </mesh>

      {/* 4. Ground Projection Ring expanding with progress */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[ringScale, ringScale, ringScale]}>
        <ringGeometry args={[0.8, 0.9, 32]} />
        <meshBasicMaterial
          color={actionColor}
          transparent
          opacity={pulseOpacity * 0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 5. Vertical Scanning Light Column */}
      <mesh ref={beamRef} position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.08, 0.4, 2.0, 16, 1, true]} />
        <meshBasicMaterial
          color={actionColor}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
