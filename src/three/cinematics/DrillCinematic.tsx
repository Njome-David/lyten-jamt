// src/three/cinematics/DrillCinematic.tsx
'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STYLE_DURATIONS_SEC, type CinematicProps } from './types';

/**
 * Drill Cinematic:
 * Automated planetary geological sampling drill rig.
 * - Drill mast descends into bedrock, core sample extraction sleeve ascends.
 * - Styles:
 *   - fast (2.5s): high vibration, heat glow, intense sparks plume
 *   - balanced (3.5s): steady continuous RPM, smooth descent
 *   - careful (5.0s): intermittent pauses for thermal management and torque check
 */
export function DrillCinematic({
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

  const drillBitRef = useRef<THREE.Group>(null);
  const sparkPointsRef = useRef<THREE.Points>(null);

  // Spark particles for cutting into regolith
  const sparkCount = style === 'fast' ? 32 : style === 'balanced' ? 16 : 8;
  const sparkPositions = useMemo(() => {
    const arr = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 0.3;
      arr[i * 3 + 1] = Math.random() * 0.4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
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
      const currentProg = Math.min(1, nextTime / duration);

      if (currentProg >= 1 && !completed) {
        setCompleted(true);
        onComplete?.();
      }
    }

    // High speed drill bit rotation
    if (drillBitRef.current) {
      drillBitRef.current.rotation.y += delta * (style === 'fast' ? 30 : style === 'balanced' ? 18 : 10);
    }

    // Dynamic spark animation
    if (sparkPointsRef.current) {
      const sparkTime = state.clock.getElapsedTime() * 10;
      sparkPointsRef.current.rotation.y = sparkTime;
    }
  });

  const p = reducedMotion
    ? 0.5
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / duration);

  // Style physics calculations:
  let drillDescent = 0;
  let coreAscent = 0;
  let shakeOffset = 0;
  let heatGlow = 0;

  if (style === 'fast') {
    // 0 to 0.7: rapid aggressive descent with high vibration and thermal buildup
    // 0.7 to 1.0: quick core retrieval
    if (p < 0.7) {
      drillDescent = (p / 0.7) * 0.8;
      shakeOffset = Math.sin(p * 60) * 0.03;
      heatGlow = (p / 0.7);
    } else {
      drillDescent = 0.8 - ((p - 0.7) / 0.3) * 0.4;
      coreAscent = Math.min(1.0, (p - 0.7) / 0.3);
      shakeOffset = Math.sin(p * 30) * 0.01;
      heatGlow = Math.max(0, 1 - (p - 0.7) * 3);
    }
  } else if (style === 'careful') {
    // Staged drilling with cooling pauses (0.0-0.3 -> pause -> 0.4-0.7 -> pause -> core retrieve)
    if (p < 0.3) {
      drillDescent = (p / 0.3) * 0.4;
    } else if (p < 0.4) {
      drillDescent = 0.4; // Cooling pause
    } else if (p < 0.7) {
      drillDescent = 0.4 + ((p - 0.4) / 0.3) * 0.4;
    } else {
      drillDescent = 0.8;
      coreAscent = Math.min(1.0, (p - 0.7) / 0.3);
    }
    shakeOffset = Math.sin(p * 20) * 0.005;
  } else {
    // Balanced: smooth steady continuous penetration and core sample lift
    drillDescent = Math.sin(p * Math.PI * 0.5) * 0.8;
    coreAscent = Math.max(0, (p - 0.6) / 0.4);
    shakeOffset = Math.sin(p * 35) * 0.015;
  }

  const frameColor = '#334155';
  const drillColor = '#94a3b8';
  const rockSampleColor = isMars ? '#ea580c' : '#38bdf8';
  const sparkColor = style === 'fast' ? '#fbbf24' : '#f97316';

  return (
    <group position={[2.8 + shakeOffset, 0, 3.2]} data-testid="cinematic-drill">
      {/* 1. Heavy Geological Drill Rig Tower */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 2.4, 6]} />
        <meshStandardMaterial color={frameColor} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <boxGeometry args={[0.6, 0.25, 0.6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Ground Anchor Base Pads */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.7, 0.85, 0.1, 6]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.5} />
      </mesh>

      {/* 2. Rotating Drill Head & Penetration Bit */}
      <group position={[0, 1.8 - drillDescent, 0]}>
        {/* Drill motor casing */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.5, 12]} />
          <meshStandardMaterial
            color="#475569"
            emissive="#ef4444"
            emissiveIntensity={heatGlow * 0.7}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Fluted drill rod bit */}
        <group ref={drillBitRef} position={[0, -0.6, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.05, 0.8, 8]} />
            <meshStandardMaterial color={drillColor} metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <coneGeometry args={[0.1, 0.2, 8]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* 3. Extracted Geological Core Sample Tube (Ascends into storage) */}
      {coreAscent > 0.05 && (
        <group position={[0.35, 0.6 + coreAscent * 0.9, 0]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.5, 12]} />
            <meshStandardMaterial
              color={rockSampleColor}
              emissive={rockSampleColor}
              emissiveIntensity={0.5}
              roughness={0.3}
              metalness={0.6}
            />
          </mesh>
        </group>
      )}

      {/* 4. Active Spark / Regolith Particle Spray */}
      {!reducedMotion && p > 0.1 && p < 0.75 && (
        <points ref={sparkPointsRef} position={[0, 0.05, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[sparkPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={style === 'fast' ? 0.14 : 0.09}
            color={sparkColor}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}
