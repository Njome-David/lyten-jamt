// src/three/cinematics/CinematicManager.tsx
'use client';

import React from 'react';
import type { CinematicProps } from './types';
import { TravelCinematic } from './TravelCinematic';
import { DeployCinematic } from './DeployCinematic';
import { DrillCinematic } from './DrillCinematic';
import { ExperimentCinematic } from './ExperimentCinematic';
import { RepairCinematic } from './RepairCinematic';
import { UplinkCinematic } from './UplinkCinematic';
import { GenericActionCinematic } from './GenericActionCinematic';

/**
 * CinematicManager:
 * Resolves the appropriate 3D cinematic component for all mission archetypes:
 * - 'travel'     -> TravelCinematic (rover terrain traverse)
 * - 'deploy'     -> DeployCinematic (solar mast and antenna deployment)
 * - 'drill'      -> DrillCinematic (geological core sampling)
 * - 'experiment' -> ExperimentCinematic (science lab bio/spectro analysis)
 * - 'repair'     -> RepairCinematic (maintenance panel re-seat & welding)
 * - 'uplink'     -> UplinkCinematic (Earth radio transmission with propagation latency)
 * - default      -> GenericActionCinematic (safe visual fallback)
 */
export function CinematicManager(props: CinematicProps) {
  switch (props.archetype) {
    case 'travel':
      return <TravelCinematic {...props} />;
    case 'deploy':
      return <DeployCinematic {...props} />;
    case 'drill':
      return <DrillCinematic {...props} />;
    case 'experiment':
      return <ExperimentCinematic {...props} />;
    case 'repair':
      return <RepairCinematic {...props} />;
    case 'uplink':
      return <UplinkCinematic {...props} />;
    default:
      return <GenericActionCinematic {...props} />;
  }
}
