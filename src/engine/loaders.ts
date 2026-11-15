/**
 * Engine loaders – asynchronous stubs for game data.
 * All functions return plain objects defined in `src/engine/types.ts`.
 * They are pure TypeScript (no React/DOM/Date/Math.random).
 */
import type { Loadout, Meters, Option, OptionId, OptionPreview, Passive, Radiation, RadiationLevel } from './types';
import { initialGauges } from './jauges';

/** Load default loadout for a given body and difficulty */
export async function loadDefaultLoadout(): Promise<Loadout> {
  // Stub – could be extended with data files later.
  return {
    crew: 3,
    power: 'panels',
    shield: 'standard',
    food: 'rations',
  };
}

/** Load initial gauges (energy, air, health, food) */
export async function loadInitialGauges(): Promise<Meters> {
  return { ...initialGauges };
}

/** Load a set of passive abilities */
export async function loadPassives(): Promise<Passive[]> {
  return [
    {
      id: 'shield' as any, // cast because enum defined elsewhere
      gaugeDelta: { health: -5 },
      description: 'Provides occasional shield boost.',
    },
    {
      id: 'energy_saver' as any,
      gaugeDelta: { power: -10 },
      description: 'Reduces power consumption.',
    },
  ];
}

/** Load radiation events for the current level */
export async function loadRadiations(): Promise<Radiation[]> {
  return [
    {
      level: RadiationLevel.LOW,
      gaugeDelta: { health: -5 },
      description: 'Mild solar radiation.',
    },
    {
      level: RadiationLevel.HIGH,
      gaugeDelta: { health: -20, power: -10 },
      description: 'Severe radiation storm.',
    },
  ];
}

/** Load predefined options (used in UI) */
export async function loadOptions(): Promise<Option[]> {
  const opts: OptionPreview[] = [
    {
      // Required fields for tests (stub values)
      style: 'fast',
      optionPower: 0,
      netPower: 0,
      netAir: 0,
      netFood: 0,
      estimatedDose: 0,
      faultRisk: 0,
      outdoor: true,
      solarGain: 0,
      // Design‑specific optional fields
      id: 'opt1',
      title: 'Boost Power',
      description: 'Increase power for the next turn.',
      cost: 35,
      reward: 50,
      risk: 'low',
      deltaEnergy: 15,
    },
    {
      style: 'balanced',
      optionPower: 0,
      netPower: 0,
      netAir: 0,
      netFood: 0,
      estimatedDose: 0,
      faultRisk: 0,
      outdoor: true,
      solarGain: 0,
      id: 'opt2',
      title: 'Shield Repair',
      description: 'Repair shields at a cost.',
      cost: 40,
      reward: 45,
      risk: 'medium',
      deltaEnergy: -10,
      deltaRadiation: -5,
    },
  ];
  return opts.map((preview) => ({ id: preview.id!, preview }));
}
