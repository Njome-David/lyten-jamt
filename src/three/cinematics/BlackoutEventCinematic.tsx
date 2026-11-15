// src/three/cinematics/BlackoutEventCinematic.tsx
'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EVENT_DURATION_SEC, type EventCinematicProps } from './types';

/**
 * Radio Blackout Event Cinematic:
 * - Direct deep space carrier signal disintegrates into atmospheric static.
 * - Radio pulse rings fracture and dissipate into grey noise.
 */
export function BlackoutEventCinematic({
  progress: externalProgress,
  duration = EVENT_DURATION_SEC,
  speedMultiplier = 1,
  reducedMotion = false,
  onComplete,
}: EventCinematicProps) {
  const effectiveDuration = duration / speedMultiplier;

  const [internalTime, setInternalTime] = useState(0);
  const [completed, setCompleted] = useState(false);

  const brokenRingRef = useRef<THREE.Mesh>(null);
  const staticSphereRef = useRef<THREE.Mesh>(null);

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
      const currentProg = Math.min(1, nextTime / effectiveDuration);

      if (currentProg >= 1 && !completed) {
        setCompleted(true);
        onComplete?.();
      }
    }

    // Static disruption noise oscillation
    if (brokenRingRef.current) {
      brokenRingRef.current.rotation.z += delta * 5;
    }
    if (staticSphereRef.current) {
      staticSphereRef.current.rotation.y += delta * 3;
    }
  });

  const p = reducedMotion
    ? 0.5
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / effectiveDuration);

  // Dissipation of carrier signal: grey out
  const signalDecay = Math.max(0, 1 - p * 1.2);

  return (
    <group position={[0, 2.4, 0]} data-testid="cinematic-event-blackout">
      {/* 1. Fractured Radio Telemetry Ring */}
      <mesh ref={brokenRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2 + p * 0.8, 0.04, 6, 16]} />
        <meshBasicMaterial
          color="#64748b"
          transparent
          opacity={signalDecay * 0.7}
          wireframe
        />
      </mesh>

      {/* 2. Ionospheric Static Noise Core */}
      <mesh ref={staticSphereRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial
          color="#94a3b8"
          wireframe
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={signalDecay * 0.5}
        />
      </mesh>
    </group>
  );
}
