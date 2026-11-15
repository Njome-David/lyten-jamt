// src/three/cinematics/FaultEventCinematic.tsx
'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EVENT_DURATION_SEC, type EventCinematicProps } from './types';

/**
 * Mechanical / Subsystem Fault Event Cinematic:
 * - Warning alarm beacons flash amber and red.
 * - Electrical short-circuit sparks crackle around power nodes.
 * - Coolant smoke vent puffs outward.
 */
export function FaultEventCinematic({
  progress: externalProgress,
  duration = EVENT_DURATION_SEC,
  speedMultiplier = 1,
  reducedMotion = false,
  onComplete,
}: EventCinematicProps) {
  const effectiveDuration = duration / speedMultiplier;

  const [internalTime, setInternalTime] = useState(0);
  const [completed, setCompleted] = useState(false);

  const alarmLightRef = useRef<THREE.PointLight>(null);
  const sparkPointsRef = useRef<THREE.Points>(null);

  // Short-circuit electrical spark positions
  const sparkCount = 24;
  const sparkPositions = useMemo(() => {
    const arr = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 0.8;
      arr[i * 3 + 1] = Math.random() * 0.8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    return arr;
  }, [sparkCount]);

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
      const currentProg = Math.min(1, nextTime / effectiveDuration);

      if (currentProg >= 1 && !completed) {
        setCompleted(true);
        onComplete?.();
      }
    }

    const t = state.clock.getElapsedTime();

    // Fast strobe alarm flash (5 Hz)
    if (alarmLightRef.current) {
      alarmLightRef.current.intensity = Math.sin(t * 15) > 0 ? 1.5 : 0.1;
    }

    // Rotating sparks
    if (sparkPointsRef.current) {
      sparkPointsRef.current.rotation.y += delta * 12;
    }
  });

  const p = reducedMotion
    ? 0.5
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / effectiveDuration);

  // Fault smoke rise
  const smokeY = 0.6 + p * 1.2;
  const smokeScale = 0.5 + p * 1.5;
  const smokeOpacity = Math.max(0, (1 - p) * 0.5);

  return (
    <group position={[0, 0, 1.8]} data-testid="cinematic-event-fault">
      {/* 1. Strobe Emergency Beacon Light */}
      <pointLight
        ref={alarmLightRef}
        position={[0, 1.5, 0]}
        color="#ef4444"
        distance={8}
        decay={2}
        intensity={1.2}
      />

      {/* Flashing Red Beacon Dome */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.9}
        />
      </mesh>

      {/* 2. Short Circuit Electric Spark Cloud */}
      {!reducedMotion && (
        <points ref={sparkPointsRef} position={[0, 0.8, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[sparkPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.12}
            color="#38bdf8"
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </points>
      )}

      {/* 3. Coolant Vent Vapor Puff */}
      <mesh position={[0, smokeY, 0]} scale={[smokeScale, smokeScale, smokeScale]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial
          color="#cbd5e1"
          transparent
          opacity={smokeOpacity}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
