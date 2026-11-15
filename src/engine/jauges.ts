/**
 * Jauges (energy, radiation, health) utilities.
 * All values are clamped between 0 and 100.
 */
import type { Meters } from './types';

export function clampGauge(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function applyGaugeDelta(meters: Meters, delta: Partial<Meters>): Meters {
  const result: Meters = { ...meters };
  (Object.keys(delta) as (keyof Meters)[]).forEach((key) => {
    const cur = meters[key] ?? 0;
    const inc = delta[key] ?? 0;
    result[key] = clampGauge(cur + inc);
  });
  return result;
}

export const initialGauges: Meters = {
  power: 100,
  air: 100,
  health: 100,
  food: 100,
};
