import type { QualityLevel } from './quality';

export type StageMode = 'title' | 'destination' | 'sites' | 'loadout' | 'mission' | 'debrief';
export type CelestialBody = 'moon' | 'mars';
export type SiteId = 'shackleton' | 'tranquillitatis' | 'jezero' | 'gale';

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
  onSelectBody?: (body: CelestialBody) => void;
  onSelectSite?: (site: SiteId) => void;
}
