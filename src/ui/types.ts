import type { RunState, RunScore, AlertSpec, StepPlayback } from '../engine/types';
import type { CinematicProps } from '../three/cinematics/types';

export type ScreenId =
  | 'title'
  | 'destination'
  | 'missions'
  | 'sites'
  | 'difficulty'
  | 'loadout'
  | 'mission'
  | 'debrief';

export type Body = 'moon' | 'mars';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type SiteId = 'shackleton' | 'tranquillitatis' | 'jezero' | 'gale';
export type MissionTemplateId = 'relay' | 'core' | 'garden';
export type OptionStyle = 'fast' | 'balanced' | 'careful';

export interface LoadoutConfig {
  crew: 2 | 3 | 4;
  power: 'panels' | 'batteries';
  shield: 'standard' | 'reinforced';
  food: 'rations' | 'hydroponics';
}

export interface UIState {
  screen: ScreenId;
  destination: Body;
  site: SiteId;
  missionId: MissionTemplateId;
  difficulty: Difficulty;
  loadout: LoadoutConfig;
  paused: boolean;
  stepIndex: number;
  totalSteps: number;
  runState?: RunState | null;
  runScore?: RunScore | null;
  activeAlert?: AlertSpec | null;
  cinematic?: CinematicProps | null;
}

export type UIAction =
  | { type: 'NAVIGATE'; screen: ScreenId }
  | { type: 'SELECT_DESTINATION'; destination: Body }
  | { type: 'SELECT_SITE'; site: SiteId }
  | { type: 'SELECT_MISSION'; missionId: MissionTemplateId }
  | { type: 'SELECT_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'UPDATE_LOADOUT'; patch: Partial<LoadoutConfig> }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'NEXT_STEP' }
  | { type: 'START_MISSION'; runState: RunState }
  | { type: 'RESOLVE_STEP_SUCCESS'; runState: RunState; alert?: AlertSpec | null; playback?: StepPlayback }
  | { type: 'SET_CINEMATIC'; cinematic: CinematicProps | null }
  | { type: 'RESOLVE_ALERT'; runState: RunState }
  | { type: 'FINISH_MISSION'; score: RunScore }
  | { type: 'RESET' };
