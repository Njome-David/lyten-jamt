// src/three/cinematics/RepairCinematic.tsx
'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STYLE_DURATIONS_SEC, type CinematicProps } from './types';

/**
 * Repair Cinematic:
 * Structural subsystem maintenance and panel realignment.
 * - Service panel hinges back into locked position.
 * - Welding plasma torch fires with realistic spark burst.
 * - Diagnostic telemetry LED shifts from fault red/amber to nominal green.
 * - Styles:
 *   - fast (2.5s): hurried quick-weld, large spark fountain
 *   - balanced (3.5s): clean progressive seam repair and secure latch
 *   - careful (5.0s): systematic diagnostic pass, precision weld, final latch validation
 */
export function RepairCinematic({
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

  const panelHingeRef = useRef<THREE.Group>(null);
  const toolArmRef = useRef<THREE.Group>(null);
  const sparkPointsRef = useRef<THREE.Points>(null);

  // Welding sparks
  const sparkCount = style === 'fast' ? 40 : style === 'balanced' ? 20 : 10;
  const sparkPositions = useMemo(() => {
    const arr = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 0.25;
      arr[i * 3 + 1] = Math.random() * 0.35;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
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

    // Tool arm micro-welding motion
    if (toolArmRef.current) {
      const weldVibe = Math.sin(state.clock.getElapsedTime() * 25) * 0.02;
      toolArmRef.current.position.y = 0.8 + weldVibe;
    }

    // Rotating sparks
    if (sparkPointsRef.current) {
      sparkPointsRef.current.rotation.y += delta * 15;
    }
  });

  const p = reducedMotion
    ? 1.0
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / duration);

  // Panel rotation: goes from a loose -45 deg (-0.8 rad) to flush 0 rad
  const panelAngle = (1 - p) * -0.8;

  // Status indicator light: red at start, turns yellow at 0.5, green when p > 0.85
  const statusColor = p > 0.85 ? '#22c55e' : p > 0.4 ? '#eab308' : '#ef4444';

  const frameColor = isMars ? '#78350f' : '#334155';
  const panelColor = isMars ? '#cbd5e1' : '#94a3b8';
  const sparkColor = style === 'fast' ? '#38bdf8' : '#fbbf24';

  return (
    <group position={[1.5, 0, 3.8]} data-testid="cinematic-repair">
      {/* 1. Main Service Chassis Frame */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.2, 1.2, 0.4]} />
        <meshStandardMaterial color={frameColor} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Internal Subsystem Machinery Deck */}
      <mesh position={[0, 0.6, 0.05]}>
        <boxGeometry args={[0.9, 0.9, 0.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 2. Hinged Maintenance Access Hatch (closes with p) */}
      <group
        ref={panelHingeRef}
        position={[-0.5, 0.6, 0.2]}
        rotation={[0, panelAngle, 0]}
      >
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[1.0, 1.0, 0.05]} />
          <meshStandardMaterial color={panelColor} metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* 3. Diagnostic Telemetry Status LED */}
      <mesh position={[0.4, 1.1, 0.22]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 4. Robotic Welding Arm & Plasma Arc Emitter */}
      <group ref={toolArmRef} position={[0.2, 0.8, 0.4]}>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.03, 0.04, 0.4, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.15, -0.15, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* 5. Welding Sparks Fountain (active during mid-phase 0.1 < p < 0.85) */}
      {!reducedMotion && p > 0.1 && p < 0.85 && (
        <points ref={sparkPointsRef} position={[0.2, 0.65, 0.3]}>
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
            opacity={0.85}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}
