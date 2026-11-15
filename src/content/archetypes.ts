// src/content/archetypes.ts
// Archetype definitions and template step sequences.
// Follows SPEC.md section 5.1 and docs/TECHNICAL.md layer rules.

import type { Archetype, MissionTemplateId } from '../engine/types';

export interface ArchetypeDef {
  id: Archetype;
  label: string;
  name: string;
  description: string;
}

export const ARCHETYPES: Record<Archetype, ArchetypeDef> = {
  travel: {
    id: 'travel',
    label: 'Travel',
    name: 'Trajet',
    description: 'Drive rover across rugged planetary terrain to reach designated site coordinates.',
  },
  deploy: {
    id: 'deploy',
    label: 'Deploy',
    name: 'Déploiement',
    description: 'Unpack, assemble, and anchor hardware, solar panels, antenna arrays, or habitat modules.',
  },
  drill: {
    id: 'drill',
    label: 'Drill',
    name: 'Forage',
    description: 'Operate rotary percussion drill to extract core samples from beneath the regolith.',
  },
  experiment: {
    id: 'experiment',
    label: 'Experiment',
    name: 'Expérience',
    description: 'Run scientific analysis, biological tests, or geological spectrometry.',
  },
  repair: {
    id: 'repair',
    label: 'Repair',
    name: 'Réparation',
    description: 'Diagnose equipment faults, replace worn modules, seal micro-leaks, or recalibrate instruments.',
  },
  uplink: {
    id: 'uplink',
    label: 'Uplink',
    name: 'Liaison',
    description: 'Align high-gain dish, transmit telemetry and science packets back to Earth.',
  },
};

/**
 * 6-step archetype sequence for each mission template.
 * Defined in SPEC.md section 5.1.
 */
export const TEMPLATE_ARCHETYPES: Record<
  MissionTemplateId,
  [Archetype, Archetype, Archetype, Archetype, Archetype, Archetype]
> = {
  relay: ['travel', 'deploy', 'deploy', 'repair', 'uplink', 'uplink'],
  core: ['travel', 'drill', 'drill', 'experiment', 'repair', 'uplink'],
  seismic: ['travel', 'deploy', 'repair', 'experiment', 'experiment', 'uplink'],
  mapper: ['deploy', 'travel', 'experiment', 'travel', 'experiment', 'uplink'],
  garden: ['deploy', 'repair', 'experiment', 'experiment', 'repair', 'uplink'],
};
