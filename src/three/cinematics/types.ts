// src/three/cinematics/types.ts
import type { Archetype, OptionStyle } from '../../engine/types';

/**
 * Standard durations for action options in seconds, as defined in PRESENTATION.md:
 * Fast: 2.5s, Balanced: 3.5s, Careful: 5.0s
 */
export const STYLE_DURATIONS_SEC: Record<OptionStyle, number> = {
  fast: 2.5,
  balanced: 3.5,
  careful: 5.0,
};

/**
 * Standard durations for action options in milliseconds.
 */
export const STYLE_DURATIONS_MS: Record<OptionStyle, number> = {
  fast: 2500,
  balanced: 3500,
  careful: 5000,
};

export interface CinematicProps {
  /** Action archetype (travel, deploy, drill, experiment, repair, uplink) */
  archetype: Archetype;
  /** Approach style (fast, balanced, careful) */
  style?: OptionStyle;
  /**
   * Normalized progress [0, 1]. If provided, explicitly drives animation.
   * If undefined, the component drives its own progress over duration.
   */
  progress?: number;
  /** Speed multiplier (e.g. 3x on tap/space as per PRESENTATION.md) */
  speedMultiplier?: number;
  /** Whether reduced motion is active (renders static keyframe at 1.0s) */
  reducedMotion?: boolean;
  /** Callback fired when the cinematic reaches completion */
  onComplete?: () => void;
  /** Site identifier (moon or mars environment adjustments) */
  site?: string;
}

export interface RoverPose {
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
  roll: number;
  wheelRotation: number;
  dustIntensity: number;
}
