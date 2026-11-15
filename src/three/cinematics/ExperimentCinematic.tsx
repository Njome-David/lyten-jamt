// src/three/cinematics/ExperimentCinematic.tsx
'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STYLE_DURATIONS_SEC, type CinematicProps } from './types';

/**
 * Experiment Cinematic:
 * Planetary science laboratory analysis & biosphere monitoring chamber.
 * - Laboratory observation pod illuminates, holographic progression ring rotates.
 * - Spectroscopic scanning beam sweeps the sample area.
 * - Styles:
 *   - fast (2.5s): high-intensity flash pulse, rapid thermal scan
 *   - balanced (3.5s): smooth sequential multi-spectrum analysis
 *   - careful (5.0s): iterative calibration passes, triple verification sweep
 */
export function ExperimentCinematic({
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
  const scannerConeRef = useRef<THREE.Mesh>(null);
  const podGlowRef = useRef<THREE.PointLight>(null);

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

    // Rotating holographic ring
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (style === 'fast' ? 4 : style === 'balanced' ? 2 : 1);
    }

    // Oscillating scanning cone
    if (scannerConeRef.current) {
      scannerConeRef.current.rotation.y = Math.sin(t * 3) * 0.4;
    }

    // Gentle lab pod interior pulse
    if (podGlowRef.current) {
      podGlowRef.current.intensity = 0.8 + Math.sin(t * 4) * 0.4;
    }
  });

  const p = reducedMotion
    ? 0.5
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / duration);

  // Style characteristics:
  let beamIntensity = 0.5;
  let scanArc = 0;

  if (style === 'fast') {
    // Sharp fast laser bursts
    beamIntensity = Math.abs(Math.sin(p * Math.PI * 6));
    scanArc = p * Math.PI * 2;
  } else if (style === 'careful') {
    // Controlled passes with pauses
    beamIntensity = 0.4 + Math.sin(p * Math.PI * 3) * 0.4;
    scanArc = Math.sin(p * Math.PI * 4) * 0.6;
  } else {
    // Balanced smooth sweep
    beamIntensity = Math.sin(p * Math.PI);
    scanArc = p * Math.PI;
  }

  const themeColor = isMars ? '#a855f7' : '#06b6d4';
  const laserColor = style === 'fast' ? '#ef4444' : themeColor;

  return (
    <group position={[-1.5, 0, 4.2]} data-testid="cinematic-experiment">
      {/* 1. Science Module Base Pod */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 0.8, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Transparent Biosphere / Analysis Dome */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={themeColor}
          transparent
          opacity={0.45}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Internal Specimen Target */}
      <mesh position={[0, 0.85, 0]}>
        <dodecahedronGeometry args={[0.22]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive={themeColor}
          emissiveIntensity={p * 0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Interior Lab Glow Light */}
      <pointLight
        ref={podGlowRef}
        position={[0, 1.0, 0]}
        color={themeColor}
        distance={6}
        decay={2}
        intensity={0.8}
      />

      {/* 2. Holographic Progression Ring (rises with progress) */}
      <mesh
        ref={ringRef}
        position={[0, 0.5 + p * 1.0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.85, 0.03, 8, 32]} />
        <meshBasicMaterial color={themeColor} transparent opacity={0.7} />
      </mesh>

      {/* 3. Spectroscopic Laser Scanning Cone */}
      <group position={[0, 2.0, 0]} rotation={[0, scanArc, 0]}>
        <mesh ref={scannerConeRef} position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.05, 0.6, 1.2, 16, 1, true]} />
          <meshBasicMaterial
            color={laserColor}
            transparent
            opacity={Math.max(0.1, beamIntensity * 0.45)}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
