// src/three/cinematics/OutcomeCinematic.tsx
'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OUTCOME_DURATION_SEC, type OutcomeCinematicProps } from './types';

/**
 * Mission Outcome Cinematic (Victory & Defeat):
 * - Victory: Glorious sunrise dawn, radiant warm golden crest over the outpost,
 *   triumphant beacon celebration.
 * - Defeat (benevolent & gentle): Lights gently transition to a soothing night-time
 *   hibernation sleep mode. Quiet stillness, respectful, zero punishment or harshness.
 */
export function OutcomeCinematic({
  outcome,
  progress: externalProgress,
  duration = OUTCOME_DURATION_SEC,
  reducedMotion = false,
  onComplete,
}: OutcomeCinematicProps) {
  const [internalTime, setInternalTime] = useState(0);
  const [completed, setCompleted] = useState(false);

  const sunriseLightRef = useRef<THREE.DirectionalLight>(null);
  const crestRingRef = useRef<THREE.Mesh>(null);

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

    // Victory celebratory crest rotation
    if (crestRingRef.current) {
      crestRingRef.current.rotation.z += delta * 0.8;
      crestRingRef.current.position.y = 2.8 + Math.sin(t * 2) * 0.1;
    }
  });

  const p = reducedMotion
    ? 0.5
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / duration);

  const isVictory = outcome === 'victory';

  // Light transitions:
  // Victory: dawn sun rises, intensity grows from 0.5 to 2.2
  // Defeat: warm sunset fading gently into soft tranquil blue night standby (0.8 -> 0.25)
  const sunIntensity = isVictory ? 0.6 + p * 1.6 : Math.max(0.2, 0.8 * (1 - p * 0.7));
  const sunColor = isVictory ? '#fef08a' : '#38bdf8';
  const crestOpacity = isVictory ? Math.min(0.85, p * 1.2) : 0;

  return (
    <group position={[0, 0, 0]} data-testid={`cinematic-outcome-${outcome}`}>
      {/* 1. Planetary Sunrise / Nightfall Ambient Light */}
      <directionalLight
        ref={sunriseLightRef}
        position={isVictory ? [8, 5 + p * 10, 6] : [4, 3, 4]}
        intensity={sunIntensity}
        color={sunColor}
      />

      {/* 2. Victory Golden Mission Patch Crest Halo */}
      {isVictory && (
        <group position={[0, 0, 0]}>
          <mesh ref={crestRingRef} position={[0, 2.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.6, 0.05, 12, 32]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.8}
              transparent
              opacity={crestOpacity}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Triumphant central star insignia */}
          <mesh position={[0, 2.8, 0]}>
            <octahedronGeometry args={[0.3]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#fbbf24"
              emissiveIntensity={0.9}
              transparent
              opacity={crestOpacity}
            />
          </mesh>
        </group>
      )}

      {/* 3. Defeat Soothing Hibernation Beacon (Gentle Blue Standby) */}
      {!isVictory && (
        <group position={[0, 1.2, 0]}>
          <pointLight
            position={[0, 0.5, 0]}
            color="#38bdf8"
            distance={5}
            decay={2}
            intensity={0.4}
          />
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
}
