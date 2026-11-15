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
import { FlareEventCinematic } from './FlareEventCinematic';
import { DustStormEventCinematic } from './DustStormEventCinematic';
import { FaultEventCinematic } from './FaultEventCinematic';
import { BlackoutEventCinematic } from './BlackoutEventCinematic';
import { OutcomeCinematic } from './OutcomeCinematic';
import { GenericActionCinematic } from './GenericActionCinematic';

/**
 * CinematicManager:
 * Resolves the appropriate 3D cinematic component for:
 * 1. Mission Outcomes: 'victory' or 'defeat'
 * 2. Unscheduled Events: 'flare', 'dust', 'fault', 'blackout'
 * 3. Step Archetypes: 'travel', 'deploy', 'drill', 'experiment', 'repair', 'uplink'
 * 4. Fallback: GenericActionCinematic
 */
export function CinematicManager(props: CinematicProps) {
  // 1. Mission Final Outcome (Victory / Defeat)
  if (props.outcome) {
    return <OutcomeCinematic outcome={props.outcome} {...props} />;
  }

  // 2. Unscheduled Event Interludes
  if (props.event && props.event !== 'none') {
    switch (props.event) {
      case 'flare':
        return <FlareEventCinematic event="flare" {...props} />;
      case 'dust':
        return <DustStormEventCinematic event="dust" {...props} />;
      case 'fault':
        return <FaultEventCinematic event="fault" {...props} />;
      case 'blackout':
        return <BlackoutEventCinematic event="blackout" {...props} />;
      default:
        return <GenericActionCinematic archetype="repair" {...props} />;
    }
  }

  // 3. Action Archetypes
  switch (props.archetype) {
    case 'travel':
      return <TravelCinematic {...props} archetype="travel" />;
    case 'deploy':
      return <DeployCinematic {...props} archetype="deploy" />;
    case 'drill':
      return <DrillCinematic {...props} archetype="drill" />;
    case 'experiment':
      return <ExperimentCinematic {...props} archetype="experiment" />;
    case 'repair':
      return <RepairCinematic {...props} archetype="repair" />;
    case 'uplink':
      return <UplinkCinematic {...props} archetype="uplink" />;
    default:
      return <GenericActionCinematic archetype={props.archetype ?? 'repair'} {...props} />;
  }
}
