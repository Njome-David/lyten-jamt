// src/judge/types.ts
// Contract types and presets for the Space Apps Judge Mode (T21).
// Strictly adheres to TECHNICAL.md, PRESENTATION.md, and DESIGN.md.

import type { Body, SiteId, MissionTemplateId, Difficulty, LoadoutConfig } from '../ui/types';
import type { ForcedEventKind } from '../engine/types';

export interface DemoProfile {
  callsign: string;
  rank: string;
  xp: number;
  streak: number;
  unlockedBadges: string[];
}

export const DEMO_PROFILE: DemoProfile = {
  callsign: 'Cmdr. SpaceApps',
  rank: 'Mission Director',
  xp: 1337,
  streak: 5,
  unlockedBadges: ['artemis', 'curiosity', 'apollo', 'first-step', 'flare-survivor'],
};

export interface DemoMissionPreset {
  destination: Body;
  site: SiteId;
  missionId: MissionTemplateId;
  difficulty: Difficulty;
  seed: number;
  loadout: LoadoutConfig;
  totalSteps: number;
}

export const DEFAULT_DEMO_PRESET: DemoMissionPreset = {
  destination: 'moon',
  site: 'shackleton',
  missionId: 'relay',
  difficulty: 'easy',
  seed: 1337,
  loadout: {
    crew: 3,
    power: 'panels',
    shield: 'standard',
    food: 'rations',
  },
  totalSteps: 3, // Default short run for quick jury evaluation
};

export interface JudgeState {
  enabled: boolean;
  isCollapsed: boolean;
  shortRun: boolean;
  solarMode: 'recent' | 'may2024';
  speed: 1 | 2 | 3;
  forcedEvent: ForcedEventKind | null;
  isScienceMapOpen: boolean;
  demoProfileActive: boolean;
}
