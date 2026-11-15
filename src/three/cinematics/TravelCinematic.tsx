// src/three/cinematics/TravelCinematic.tsx
'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Rover } from './Rover';
import { STYLE_DURATIONS_SEC, type CinematicProps } from './types';

/**
 * Travel Cinematic:
 * The rover departs the outpost and traverses the planetary terrain.
 * Supports 3 style durations:
 * - fast (2.5s): high speed, intense bumps, heavy dust rooster tail
 * - balanced (3.5s): steady cruise speed, moderate dust
 * - careful (5.0s): slow reconnaissance, minimal bumps, smooth crawl
 */
export function TravelCinematic({
  style = 'balanced',
  progress: externalProgress,
  speedMultiplier = 1,
  reducedMotion = false,
  onComplete,
  site = 'shackleton',
}: CinematicProps) {
  const isMars = site === 'gale' || site === 'jezero';
  const duration = STYLE_DURATIONS_SEC[style] / speedMultiplier;

  // Internal time tracking when progress is not externally driven
  const [internalTime, setInternalTime] = useState(0);
  const [completed, setCompleted] = useState(false);


  // Particle dust trail
  const dustCount = style === 'fast' ? 40 : style === 'balanced' ? 24 : 10;
  const dustPositions = useMemo(() => {
    const arr = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
      arr[i * 3 + 1] = Math.random() * 0.3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    return arr;
  }, [dustCount]);

  const dustRef = useRef<THREE.Points>(null);

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

  // Calculate normalized progress [0, 1]
  const p = reducedMotion
    ? 0.5
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / duration);

  // Compute rover movement path across the stage:
  // Starts near outpost [2.5, 0.4, 0] and travels diagonally towards [-8, 0.4, 6]
  const startX = 2.5;
  const startZ = 0.5;
  const endX = -8.0;
  const endZ = 6.0;

  // Progression style effects:
  // Fast: slight zig-zags and heavy pitch vibrations
  // Careful: step-wise curve with brief scan pauses
  let effectiveP = p;
  let bumpY = 0;
  let pitchAngle = 0;

  if (style === 'fast') {
    effectiveP = Math.pow(p, 0.85); // Aggressive initial acceleration
    bumpY = Math.sin(p * 45) * 0.04;
    pitchAngle = Math.cos(p * 40) * 0.06;
  } else if (style === 'careful') {
    // Smooth easing with gentle micro-pauses
    effectiveP = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    bumpY = Math.sin(p * 15) * 0.01;
    pitchAngle = Math.sin(p * 10) * 0.02;
  } else {
    // Balanced: smooth linear advance
    effectiveP = p;
    bumpY = Math.sin(p * 25) * 0.02;
    pitchAngle = Math.sin(p * 20) * 0.03;
  }

  const currentX = startX + (endX - startX) * effectiveP;
  const currentZ = startZ + (endZ - startZ) * effectiveP;
  const currentY = 0.35 + bumpY;

  // Orientation angle along travel direction
  const travelAngle = Math.atan2(endX - startX, endZ - startZ);

  // Dust cloud coordinates behind rover
  const dustX = currentX - Math.sin(travelAngle) * 0.8;
  const dustZ = currentZ - Math.cos(travelAngle) * 0.8;
  const dustY = currentY + 0.1;

  // Wheel rotation proportional to distance traveled
  const totalDist = Math.hypot(endX - startX, endZ - startZ) * effectiveP;
  const currentWheelAngle = (totalDist / 0.18) % (Math.PI * 2);

  return (
    <group data-testid="cinematic-travel">
      {/* Rover instance */}
      <Rover
        position={[currentX, currentY, currentZ]}
        rotation={[pitchAngle, travelAngle + Math.PI, 0]}
        wheelAngle={currentWheelAngle}
        isMars={isMars}
        scale={0.9}
      />

      {/* Trailing dust particle plume (only while in motion) */}
      {!reducedMotion && p > 0.02 && p < 0.98 && (
        <points ref={dustRef} position={[dustX, dustY, dustZ]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[dustPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={style === 'fast' ? 0.18 : 0.12}
            color={isMars ? '#d97706' : '#94a3b8'}
            transparent
            opacity={style === 'fast' ? 0.75 : 0.45}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}
