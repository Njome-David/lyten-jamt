'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitScene } from './OrbitScene';
import { OutpostKit } from '../outpost/OutpostKit';
import { CinematicManager } from '../cinematics/CinematicManager';
import { SurfaceScene } from './SurfaceScene';
import { detectQuality, getQualityConfig, type QualityConfig, type QualityLevel } from './quality';
import type { StageMode, CelestialBody, SiteId, StageProps } from './types';

/**
 * Camera controller that smoothly transitions between screen perspectives.
 */
function CameraController({
  mode,
  body,
  reducedMotion = false,
}: {
  mode: StageMode;
  body?: CelestialBody;
  reducedMotion?: boolean;
}) {
  const { camera } = useThree();

  // Reusable vectors to avoid allocations in useFrame
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  // Determine target camera pose based on mode and body
  useMemo(() => {
    switch (mode) {
      case 'title':
        targetPos.current.set(0, 2, 10);
        targetLook.current.set(0, 0, -2);
        break;
      case 'destination':
        if (body === 'moon') {
          targetPos.current.set(-3.8, 1.2, 4.5);
          targetLook.current.set(-3.8, 0.4, 0);
        } else if (body === 'mars') {
          targetPos.current.set(3.8, 0.8, 5.0);
          targetLook.current.set(3.8, -0.4, 0);
        } else {
          targetPos.current.set(0, 1.5, 9.0);
          targetLook.current.set(0, 0, 0);
        }
        break;
      case 'sites':
        targetPos.current.set(0, 8, 13);
        targetLook.current.set(0, 1, 0);
        break;
      case 'loadout':
        targetPos.current.set(8, 5, 9);
        targetLook.current.set(0, 1.2, 0);
        break;
      case 'mission':
        targetPos.current.set(7, 4.5, 8.5);
        targetLook.current.set(0, 1.0, 0);
        break;
      case 'debrief':
        targetPos.current.set(5, 3.2, 6.5);
        targetLook.current.set(0, 1.5, 0);
        break;
    }
  }, [mode, body]);

  useFrame((_, delta) => {
    const lerpSpeed = reducedMotion ? 1 : Math.min(1, delta * 3.5);
    camera.position.lerp(targetPos.current, lerpSpeed);
    currentLook.current.lerp(targetLook.current, lerpSpeed);
    camera.lookAt(currentLook.current);
  });

  return null;
}

/**
 * 2D Fallback view when WebGL is unavailable or performance tier is fallback2d.
 */
export function Stage2DFallback({
  mode,
  site = 'shackleton',
}: {
  mode: StageMode;
  site?: SiteId;
}) {
  const isMars = site === 'jezero' || site === 'gale';
  const bgColor = isMars ? 'linear-gradient(180deg, #1f0d08 0%, #4a2113 70%, #85371c 100%)' : 'linear-gradient(180deg, #050914 0%, #0d1527 60%, #1e293b 100%)';

  return (
    <div
      data-testid="stage-2d-fallback"
      style={{
        position: 'absolute',
        inset: 0,
        background: bgColor,
        overflow: 'hidden',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ opacity: 0.15, transform: 'scale(1.2)' }}>
        <svg width="400" height="400" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="25" fill={isMars ? '#ea580c' : '#38bdf8'} opacity="0.3" />
        </svg>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          fontSize: '12px',
          color: 'var(--ink-muted, #64748b)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Stage 2D Mode ({mode} - {site})
      </div>
    </div>
  );
}

/**
 * The single persistent 3D Canvas for the entire game.
 */
export function StageCanvas({
  mode,
  body = 'moon',
  site = 'shackleton',
  quality,
  cinematic,
  onSelectBody,
  onSelectSite: _onSelectSite,
}: StageProps) {
  const [detectedLevel, setDetectedLevel] = useState<QualityLevel>(quality ?? 'high');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const lvl = quality ?? detectQuality();
    setDetectedLevel(lvl);
  }, [quality]);

  const qualityConfig: QualityConfig = useMemo(() => {
    return getQualityConfig(detectedLevel);
  }, [detectedLevel]);

  // SSR protection
  if (!isClient) {
    return <Stage2DFallback mode={mode} site={site} />;
  }

  // 2D fallback when WebGL is absent or quality is fallback2d
  if (qualityConfig.level === 'fallback2d') {
    return <Stage2DFallback mode={mode} site={site} />;
  }

  const isOrbit = mode === 'title' || mode === 'destination';

  return (
    <div
      data-testid="stage-3d-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    >
      <Canvas
        camera={{ position: [0, 2, 10], fov: 45 }}
        dpr={[1, qualityConfig.dpr]}
        shadows={qualityConfig.shadows}
        gl={{
          antialias: qualityConfig.level === 'high',
          powerPreference: 'high-performance',
          alpha: true,
        }}
      >
        <CameraController
          mode={mode}
          body={body}
          reducedMotion={qualityConfig.reducedMotion}
        />

        {isOrbit ? (
          <OrbitScene
            mode={mode}
            selectedBody={body}
            onSelectBody={onSelectBody}
            reducedMotion={qualityConfig.reducedMotion}
          />
        ) : (
          <>
            <SurfaceScene
              site={site}
              body={body}
              qualityConfig={qualityConfig}
            />
            {(mode === 'mission' || mode === 'debrief' || mode === 'loadout') && (
              <OutpostKit site={site} quality={qualityConfig.level === 'high' ? 'high' : 'low'} />
            )}
            {cinematic && (
              <CinematicManager
                {...cinematic}
                site={site}
                reducedMotion={qualityConfig.reducedMotion || cinematic.reducedMotion}
              />
            )}
          </>
        )}
      </Canvas>
    </div>
  );
}
