// src/three/cinematics/CinematicManager.tsx
'use client';

import React from 'react';
import type { CinematicProps } from './types';
import { TravelCinematic } from './TravelCinematic';
import { DeployCinematic } from './DeployCinematic';
import { GenericActionCinematic } from './GenericActionCinematic';

/**
 * CinematicManager:
 * Resolves the appropriate 3D cinematic component for any mission archetype:
 * - 'travel' -> TravelCinematic (rover traverse)
 * - 'deploy' -> DeployCinematic (structure / antenna deployment)
 * - 'drill', 'experiment', 'repair', 'uplink' -> GenericActionCinematic (fallback)
 */
export function CinematicManager(props: CinematicProps) {
  switch (props.archetype) {
    case 'travel':
      return <TravelCinematic {...props} />;
    case 'deploy':
      return <DeployCinematic {...props} />;
    default:
      return <GenericActionCinematic {...props} />;
  }
}
