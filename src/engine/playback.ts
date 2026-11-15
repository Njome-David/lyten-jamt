/**
 * Diegetic playback builder for UI step execution.
 * Pure TypeScript (no React/DOM/Date/Math.random).
 */

import type {
  Archetype,
  BuildPlaybackFn,
  MeterId,
  OptionStyle,
  RunState,
  SolarContext,
  StepPlayback,
} from './types';
import { ARCHETYPE_OUTDOOR, STEP_ACTION_DURATIONS_MS } from './config/balance';

export const buildPlayback: BuildPlaybackFn = (
  prev: RunState,
  next: RunState,
  archetype?: Archetype,
  style?: OptionStyle,
  _solar?: SolarContext,
  durationMs?: number
): StepPlayback => {
  const chosenStyle = style ?? next.log[next.log.length - 1]?.optionStyle ?? 'balanced';
  const resolvedArchetype =
    archetype ?? next.log[next.log.length - 1]?.archetype ?? 'travel';
  const outdoor = ARCHETYPE_OUTDOOR[resolvedArchetype] ?? true;
  const resolvedDuration = durationMs ?? STEP_ACTION_DURATIONS_MS[chosenStyle] ?? 3500;

  const from = { ...prev.meters };
  const to = { ...next.meters };

  const deltas: Partial<Record<MeterId, number>> = {
    power: to.power - from.power,
    air: to.air - from.air,
    health: to.health - from.health,
    food: to.food - from.food,
  };

  const lastEntry = next.log[next.log.length - 1];
  const event =
    lastEntry && lastEntry.event !== 'none'
      ? {
          kind: lastEntry.event,
          timed: Boolean(next.activeAlert?.timed),
          flare: lastEntry.flare,
        }
      : undefined;

  const notes = lastEntry?.notes ? [...lastEntry.notes] : [];

  return {
    turn: next.turn,
    archetype: resolvedArchetype,
    style: chosenStyle,
    outdoor,
    durationMs: resolvedDuration,
    from,
    to,
    deltas,
    event,
    notes,
  };
};
