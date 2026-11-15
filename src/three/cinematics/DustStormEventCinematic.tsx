// src/three/cinematics/DustStormEventCinematic.tsx
'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EVENT_DURATION_SEC, type EventCinematicProps } from './types';

/**
 * Martian Dust Storm Event Cinematic:
 * - Sweeping atmospheric dust front obscures terrain and sky.
 * - Heavy swirl of ochre sand particles traverses from horizon to outpost.
 */
export function DustStormEventCinematic({
  progress: externalProgress,
  duration = EVENT_DURATION_SEC,
  speedMultiplier = 1,
  reducedMotion = false,
  onComplete,
}: EventCinematicProps) {
  const effectiveDuration = duration / speedMultiplier;

  const [internalTime, setInternalTime] = useState(0);
  const [completed, setCompleted] = useState(false);

  const dustWallRef = useRef<THREE.Mesh>(null);
  const stormParticlesRef = useRef<THREE.Points>(null);

  // Swirling dust particle field
  const particleCount = 80;
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = Math.random() * 5 + 0.2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    return arr;
  }, [particleCount]);

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

    // Move dust particles horizontally to simulate high-speed Martian wind
    if (stormParticlesRef.current) {
      const posAttr = stormParticlesRef.current.geometry.attributes.position;
      if (posAttr) {
        for (let i = 0; i < particleCount; i++) {
          let x = posAttr.getX(i) + delta * 9;
          if (x > 9) x = -9;
          posAttr.setX(i, x);
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  const p = reducedMotion
    ? 0.5
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / effectiveDuration);

  // Dust wall advances from -10 to +8 along Z axis
  const wallZ = -10 + p * 18;
  const stormOpacity = Math.min(0.85, Math.sin(p * Math.PI) * 0.95);

  return (
    <group position={[0, 0, 0]} data-testid="cinematic-event-dust">
      {/* 1. Advancing Atmospheric Dust Wall Curtain */}
      <mesh ref={dustWallRef} position={[0, 2.5, wallZ]}>
        <planeGeometry args={[22, 7]} />
        <meshBasicMaterial
          color="#c2410c"
          transparent
          opacity={stormOpacity * 0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Swirling Regolith Dust Storm Particles */}
      {!reducedMotion && (
        <points ref={stormParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particlePositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.22}
            color="#ea580c"
            transparent
            opacity={Math.min(0.9, stormOpacity * 0.8 + 0.2)}
            depthWrite={false}
          />
        </points>
      )}

      {/* 3. Ambient Fog Dust Tint Cylinder */}
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[10, 10, 6, 16, 1, true]} />
        <meshBasicMaterial
          color="#9a3412"
          transparent
          opacity={stormOpacity * 0.25}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
