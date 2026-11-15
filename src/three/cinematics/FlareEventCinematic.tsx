// src/three/cinematics/FlareEventCinematic.tsx
'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EVENT_DURATION_SEC, type EventCinematicProps } from './types';

/**
 * Solar Flare Event Cinematic:
 * - Sudden solar coronal flash lighting up the sky.
 * - High-energy magnetic flux of ionizing solar proton particles.
 * - Protective electromagnetic shield bubble over the outpost when shieldActive is true.
 */
export function FlareEventCinematic({
  flare,
  shieldActive = false,
  progress: externalProgress,
  duration = EVENT_DURATION_SEC,
  speedMultiplier = 1,
  reducedMotion = false,
  onComplete,
  site = 'shackleton',
}: EventCinematicProps) {
  const isMars = site === 'gale' || site === 'jezero';
  const effectiveDuration = duration / speedMultiplier;

  const [internalTime, setInternalTime] = useState(0);
  const [completed, setCompleted] = useState(false);

  const shieldRef = useRef<THREE.Mesh>(null);
  const particlePointsRef = useRef<THREE.Points>(null);
  const flashLightRef = useRef<THREE.DirectionalLight>(null);

  // Solar energetic particle (SEP) storm points
  const particleCount = 60;
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = Math.random() * 8 + 1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return arr;
  }, [particleCount]);

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

    // Solar particle downward stream
    if (particlePointsRef.current) {
      const posAttr = particlePointsRef.current.geometry.attributes.position;
      if (posAttr) {
        for (let i = 0; i < particleCount; i++) {
          let y = posAttr.getY(i) - delta * 12;
          if (y < 0) y = 9;
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
      }
    }

    // Shield bubble pulsing modulation
    if (shieldRef.current) {
      const t = state.clock.getElapsedTime();
      const scale = 1.0 + Math.sin(t * 8) * 0.02;
      shieldRef.current.scale.set(scale, scale, scale);
    }
  });

  const p = reducedMotion
    ? 0.5
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / effectiveDuration);

  // Solar flash intensity curve: explosive flash at p=0.2, then settling into auroral ionization
  const flashIntensity = Math.max(0, Math.sin(p * Math.PI) * 2.5);

  // Flare classification severity (X-class produces warmer amber/red ionizing tint)
  const flareClass = flare?.classType ?? 'M2.5';
  const isXClass = flareClass.toUpperCase().startsWith('X');
  const flashColor = isXClass ? '#ef4444' : isMars ? '#f97316' : '#38bdf8';
  const shieldColor = '#06b6d4';

  return (
    <group position={[0, 0, 0]} data-testid="cinematic-event-flare">
      {/* 1. Explosive Coronal Flare Flash Light */}
      <directionalLight
        ref={flashLightRef}
        position={[10, 15, 10]}
        intensity={flashIntensity}
        color={flashColor}
      />

      {/* 2. Ionized Solar Proton Particle Stream */}
      {!reducedMotion && (
        <points ref={particlePointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particlePositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.16}
            color={flashColor}
            transparent
            opacity={Math.min(0.9, flashIntensity * 0.6 + 0.3)}
            depthWrite={false}
          />
        </points>
      )}

      {/* 3. Electromagnetic Shield Deflection Bubble over Outpost */}
      {shieldActive && (
        <group position={[0, 0.4, 0]}>
          <mesh ref={shieldRef}>
            <sphereGeometry args={[3.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color={shieldColor}
              emissive={shieldColor}
              emissiveIntensity={0.6}
              transparent
              opacity={0.35 + Math.sin(p * Math.PI) * 0.25}
              roughness={0.1}
              metalness={0.9}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* Accessible DOM/Metadata Tag */}
      <mesh visible={false} name={`solar-flare-${flareClass}`}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
      </mesh>
    </group>
  );
}
