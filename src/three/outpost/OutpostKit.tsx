// src/three/outpost/OutpostKit.tsx
'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
// import { useThree } from '@react-three/fiber'; // not used
import type { SiteId } from '../../engine/types';

/**
 * Simple placeholder outpost kit.
 * - Habitat dome (sphere)
 * - Two solar panels (boxes)
 * - Simple travel animation (rover is not part of this component, just a demo rotation)
 */
export function OutpostKit({ site }: { site: SiteId }) {
  // References for animation
  const domeRef = useRef<THREE.Mesh>(null);
  const panelLeftRef = useRef<THREE.Mesh>(null);
  const panelRightRef = useRef<THREE.Mesh>(null);

  // Simple idle animation: rotate dome slowly
  useFrame((state, delta) => {
    if (domeRef.current) {
      domeRef.current.rotation.y += delta * 0.1;
    }
    // Panels could flutter a bit
    const sway = Math.sin(state.clock.getElapsedTime()) * 0.02;
    if (panelLeftRef.current) panelLeftRef.current.rotation.z = sway;
    if (panelRightRef.current) panelRightRef.current.rotation.z = -sway;
  });

  // Basic colors based on site (moon vs mars)
  const isMars = site === 'gale' || site === 'jezero';
  const domeColor = isMars ? '#c84e31' : '#e0e0e0';
  const panelColor = isMars ? '#a0522d' : '#8b8b8b';

  return (
    <group>
      {/* Habitat dome */}
      <mesh ref={domeRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color={domeColor} metalness={0.2} roughness={0.7} />
      </mesh>
      {/* Solar panel left */}
      <mesh ref={panelLeftRef} position={[-1.2, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.02, 1.2]} />
        <meshStandardMaterial color={panelColor} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Solar panel right */}
      <mesh ref={panelRightRef} position={[1.2, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.02, 1.2]} />
        <meshStandardMaterial color={panelColor} metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}
