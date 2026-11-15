// src/three/cinematics/DeployCinematic.tsx
'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STYLE_DURATIONS_SEC, type CinematicProps } from './types';

/**
 * Deploy Cinematic:
 * Modular automated deployment sequence for remote equipment, solar towers,
 * and high-gain antenna dishes.
 * Supports 3 style profiles:
 * - fast (2.5s): rapid hydraulic extension, energetic overshoot oscillations
 * - balanced (3.5s): smooth steady extension with servo lock
 * - careful (5.0s): staged deployment, laser calibration pulse, structural lock
 */
export function DeployCinematic({
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

  const mastRef = useRef<THREE.Group>(null);
  const dishRef = useRef<THREE.Group>(null);
  const panelLeftRef = useRef<THREE.Group>(null);
  const panelRightRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Mesh>(null);

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

  const p = reducedMotion
    ? 1.0
    : externalProgress !== undefined
      ? Math.max(0, Math.min(1, externalProgress))
      : Math.min(1, internalTime / duration);

  // Style physics behaviors:
  // Fast: overshoot bounce when opening
  // Balanced: smooth easeOut
  // Careful: two-stage pause (0.0 -> 0.4 -> pause -> 1.0)
  let mastProgress = p;
  let panelProgress = p;
  let dishProgress = p;
  let laserOpacity = 0;

  if (style === 'fast') {
    // Dynamic spring oscillation
    const spring = Math.sin(p * Math.PI * 3) * Math.exp(-p * 3) * 0.15;
    mastProgress = Math.min(1, p * 1.3);
    panelProgress = Math.max(0, Math.min(1, p + spring));
    dishProgress = Math.max(0, Math.min(1, p * 1.2));
  } else if (style === 'careful') {
    // Staged step deployment with calibration laser scan
    if (p < 0.35) {
      mastProgress = p / 0.35;
      panelProgress = 0;
      dishProgress = 0;
    } else if (p < 0.65) {
      mastProgress = 1;
      panelProgress = (p - 0.35) / 0.3;
      dishProgress = 0;
      laserOpacity = Math.sin((p - 0.35) * Math.PI * 4) * 0.8;
    } else {
      mastProgress = 1;
      panelProgress = 1;
      dishProgress = (p - 0.65) / 0.35;
      laserOpacity = 0;
    }
  } else {
    // Balanced: standard cubic ease-out
    mastProgress = 1 - Math.pow(1 - p, 3);
    panelProgress = Math.max(0, (p - 0.2) / 0.8);
    dishProgress = Math.max(0, (p - 0.4) / 0.6);
  }

  const baseColor = isMars ? '#78350f' : '#334155';
  const mastColor = '#64748b';
  const panelColor = '#0284c7';
  const goldColor = '#eab308';
  const laserColor = isMars ? '#38bdf8' : '#22c55e';

  // Position: deployed slightly in front of the outpost
  return (
    <group position={[-2.0, 0, 3.5]} data-testid="cinematic-deploy">
      {/* Heavy Tripod Foundation Pad */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 0.16, 6]} />
        <meshStandardMaterial color={baseColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Telescoping Mast (extends vertically with mastProgress) */}
      <group ref={mastRef} position={[0, 0.16, 0]}>
        {/* Base cylinder */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.15, 0.18, 1.2, 12]} />
          <meshStandardMaterial color={baseColor} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Telescoping upper tube */}
        <group position={[0, 0.6 + mastProgress * 1.4, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 1.4, 12]} />
            <meshStandardMaterial color={mastColor} metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Articulated Deployment Head / Hub */}
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial color={goldColor} metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Left Expanding Solar Wing */}
          <group
            ref={panelLeftRef}
            position={[0, 0.7, 0]}
            rotation={[0, 0, panelProgress * (Math.PI / 2)]}
          >
            <mesh position={[-0.9 * panelProgress, 0, 0]}>
              <boxGeometry args={[1.6 * panelProgress, 0.04, 0.8]} />
              <meshStandardMaterial color={panelColor} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>

          {/* Right Expanding Solar Wing */}
          <group
            ref={panelRightRef}
            position={[0, 0.7, 0]}
            rotation={[0, 0, -panelProgress * (Math.PI / 2)]}
          >
            <mesh position={[0.9 * panelProgress, 0, 0]}>
              <boxGeometry args={[1.6 * panelProgress, 0.04, 0.8]} />
              <meshStandardMaterial color={panelColor} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>

          {/* Parabolic High-Gain Dish (pivots upwards) */}
          <group
            ref={dishRef}
            position={[0, 0.9, 0]}
            rotation={[dishProgress * (Math.PI / 3), 0, 0]}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.6 * dishProgress, 0.04, 0.15, 16, 1, true]} />
              <meshStandardMaterial
                color={goldColor}
                metalness={0.9}
                roughness={0.15}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>

          {/* Laser calibration scan beam (for careful style) */}
          {laserOpacity > 0.05 && (
            <mesh ref={laserRef} position={[0, 0.5, 1.2]} rotation={[Math.PI / 3, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.25, 2.4, 8]} />
              <meshBasicMaterial
                color={laserColor}
                transparent
                opacity={laserOpacity}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}
