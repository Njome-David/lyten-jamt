// src/audio/types.ts
// Audio and haptics types strictly following DESIGN.md section 6 and PRESENTATION.md section 6.

export type SfxType =
  | 'click'
  | 'confirm'
  | 'execute'
  | 'advice'
  | 'tick'
  | 'alert'
  | 'win'
  | 'lose'
  | 'heartbeat';

export type HapticPattern = 'button' | 'tick' | 'alert' | 'success';

export interface AudioSettings {
  muted: boolean;
  volume: number;
  sfxVolume: number;
  ambienceVolume: number;
}
