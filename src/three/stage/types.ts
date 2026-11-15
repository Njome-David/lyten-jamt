import type { Body, SiteId } from '../../engine/types';
import type { QualityLevel } from './quality';
import type { CinematicProps } from '../cinematics/types';

export type StageMode = 'title' | 'destination' | 'sites' | 'loadout' | 'mission' | 'debrief';
export type CelestialBody = Body;
export type { SiteId };

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface StageProps {
  mode: StageMode;
  body?: CelestialBody;
  site?: SiteId;
  quality?: QualityLevel;
  cinematic?: CinematicProps;
  onSelectBody?: (body: CelestialBody) => void;
  onSelectSite?: (site: SiteId) => void;
}
