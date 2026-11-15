/**
 * Automated simulation bots for game balance testing.
 * Implements 'random', 'greedy-power', and 'balanced' strategies.
 * Pure TypeScript (no React/DOM/Date/Math.random).
 */

import type {
  AlertSpec,
  Archetype,
  Body,
  Difficulty,
  Loadout,
  MissionTemplateId,
  OptionStyle,
  RunState,
  SiteId,
  SolarContext,
} from './types';
import { createRun, previewOption, resolveStep } from './reducer';
import { mulberry32, randChoice, type RngFn } from './rng';

export type BotType = 'random' | 'greedy-power' | 'balanced';

export interface BotDecision {
  style: OptionStyle;
}

export const MISSION_ARCHETYPES: Record<MissionTemplateId, Archetype[]> = {
  relay: ['travel', 'deploy', 'deploy', 'repair', 'uplink', 'uplink'],
  core: ['travel', 'drill', 'drill', 'experiment', 'repair', 'uplink'],
  seismic: ['travel', 'deploy', 'repair', 'experiment', 'experiment', 'uplink'],
  mapper: ['deploy', 'travel', 'experiment', 'travel', 'experiment', 'uplink'],
  garden: ['deploy', 'repair', 'experiment', 'experiment', 'repair', 'uplink'],
};

export function chooseBotOption(
  state: RunState,
  archetype: Archetype,
  solar: SolarContext,
  botType: BotType,
  rng: RngFn
): OptionStyle {
  const styles: OptionStyle[] = ['fast', 'balanced', 'careful'];

  if (botType === 'random') {
    return randChoice(rng, styles) ?? 'balanced';
  }

  const previews = styles.map((style) => ({
    style,
    preview: previewOption(state, archetype, style, solar),
  }));

  if (botType === 'greedy-power') {
    // Greedily picks highest netPower, ignoring risk and life support
    previews.sort((a, b) => b.preview.netPower - a.preview.netPower);
    return previews[0]?.style ?? 'balanced';
  }

  // Balanced strategy:
  // Dynamically balances power conservation, health protection and mission pace.
  const power = state.meters.power;
  const health = state.meters.health;
  const air = state.meters.air;
  const food = state.meters.food;

  // Life support priority: if air or food is critically low, speed up to finish the mission!
  if ((air < 35 || food < 35) && power >= 16) {
    return 'fast';
  }

  // Emergency power conservation: only when battery is near empty
  if (power < 16) {
    return 'careful';
  }

  // Severe health risk under solar storm -> careful
  if (health < 35 || solar.level === 'stormy') {
    return 'careful';
  }

  // Battery loadout power conservation
  if (state.loadout.power === 'batteries' && power < 25) {
    return 'careful';
  }

  // Default nominal pace
  return 'balanced';
}

export function chooseBotAlert(
  state: RunState,
  alert: AlertSpec,
  botType: BotType,
  rng: RngFn
): 'A' | 'B' | 'C' | 'EXPIRED' {
  if (botType === 'random') {
    if (alert.timed) {
      return 'EXPIRED';
    }
    const choices: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];
    return randChoice(rng, choices) ?? 'A';
  }

  if (botType === 'greedy-power') {
    // Greedy power strictly refuses to spend power
    if (alert.kind === 'flare') {
      return 'C'; // power 0 (takes full radiation dose)
    }
    if (alert.kind === 'dust') {
      return 'A'; // retract panels (power 0)
    }
    return 'C'; // fault ignore (power 0, takes crew health strain)
  }

  // Balanced bot choice
  if (alert.kind === 'flare') {
    // Shield up if power permits, protecting crew health without pausing step
    if (state.meters.power >= 18) {
      return 'A'; // Shield up: power -15, dose x0.2
    }
    // Shelter crew if low on power but can afford turn pause
    if (state.meters.air >= 45 && state.meters.food >= 45) {
      return 'B'; // Shelter: power -3, dose x0.4, pause step
    }
    // Critical life support or power -> push through
    return 'C';
  }

  if (alert.kind === 'dust') {
    if (state.meters.power > 30) {
      return 'A'; // Retract panels safely
    }
    return 'B'; // Keep panels out
  }

  if (alert.kind === 'fault') {
    // Repair properly if power and life support allow, avoiding recurring fault risk
    if (
      (state.difficulty === 'easy' || state.meters.air >= 65) &&
      state.meters.power >= 25
    ) {
      return 'A'; // Repair now
    }
    return 'B'; // Patch system: power -3, step continues
  }

  return 'A';
}

export interface BotSimulationParams {
  seed: number;
  body: Body;
  missionId: MissionTemplateId;
  siteId: SiteId;
  difficulty: Difficulty;
  loadout: Loadout;
  solar: SolarContext;
  botType: BotType;
  archetypes?: Archetype[];
}

export function simulateSingleBotRun(params: BotSimulationParams): RunState {
  const rng = mulberry32(params.seed);
  const defaultArchetypes: Archetype[] = [
    'travel',
    'deploy',
    'deploy',
    'repair',
    'uplink',
    'uplink',
  ];
  const archetypes =
    params.archetypes ??
    MISSION_ARCHETYPES[params.missionId] ??
    defaultArchetypes;

  let state = createRun(
    {
      seed: params.seed,
      body: params.body,
      missionId: params.missionId,
      siteId: params.siteId,
      difficulty: params.difficulty,
      loadout: params.loadout,
      totalSteps: 6,
    },
    params.solar
  );

  let stepsExecuted = 0;
  const maxIterations = 20; // safety ceiling

  while (state.status === 'running' && stepsExecuted < maxIterations) {
    if (state.activeAlert) {
      const alertChoice = chooseBotAlert(state, state.activeAlert, params.botType, rng);
      const res = resolveStep(
        state,
        { type: 'ALERT_CHOICE', choice: alertChoice },
        params.solar
      );
      state = res.state;
    } else {
      const currentArchetype =
        archetypes[Math.min(archetypes.length - 1, state.stepIndex)] ?? 'travel';
      const style = chooseBotOption(
        state,
        currentArchetype,
        params.solar,
        params.botType,
        rng
      );
      const res = resolveStep(state, { type: 'CHOOSE_OPTION', style }, params.solar);
      state = res.state;
      stepsExecuted++;
    }
  }

  return state;
}

export interface BotAggregateStats {
  botType: BotType;
  difficulty: Difficulty;
  totalRuns: number;
  wins: number;
  losses: number;
  winRatePercent: number;
  lossReasons: {
    power: number;
    air: number;
    health: number;
    food: number;
  };
  healthLossRatePercent: number;
  powerAirLossRatePercent: number;
  maxStepsObserved: number;
  allMetersWithinBounds: boolean;
}

export function runBotBatch(
  botType: BotType,
  difficulty: Difficulty,
  count: number,
  solar: SolarContext,
  baseSeed = 1000
): BotAggregateStats {
  let wins = 0;
  let losses = 0;
  const lossReasons = { power: 0, air: 0, health: 0, food: 0 };
  let maxSteps = 0;
  let allBoundsOk = true;

  const loadouts: Loadout[] = [
    { crew: 3, power: 'panels', shield: 'standard', food: 'rations' },
    { crew: 3, power: 'batteries', shield: 'standard', food: 'rations' },
    { crew: 4, power: 'panels', shield: 'standard', food: 'rations' },
    { crew: 3, power: 'panels', shield: 'reinforced', food: 'rations' },
    { crew: 2, power: 'panels', shield: 'standard', food: 'hydroponics' },
  ];

  const combos: Array<{ body: Body; siteId: SiteId; missionId: MissionTemplateId }> = [
    { body: 'moon', siteId: 'shackleton', missionId: 'relay' },
    { body: 'moon', siteId: 'tranquillitatis', missionId: 'core' },
    { body: 'moon', siteId: 'shackleton', missionId: 'seismic' },
    { body: 'moon', siteId: 'tranquillitatis', missionId: 'mapper' },
    { body: 'mars', siteId: 'jezero', missionId: 'relay' },
    { body: 'mars', siteId: 'gale', missionId: 'garden' },
    { body: 'mars', siteId: 'jezero', missionId: 'core' },
    { body: 'mars', siteId: 'gale', missionId: 'mapper' },
  ];

  for (let i = 0; i < count; i++) {
    const combo = combos[i % combos.length]!;
    const loadout = loadouts[i % loadouts.length]!;
    const seed = baseSeed + i;

    const finalState = simulateSingleBotRun({
      seed,
      body: combo.body,
      siteId: combo.siteId,
      missionId: combo.missionId,
      difficulty,
      loadout,
      solar,
      botType,
    });

    if (finalState.stepIndex > maxSteps) {
      maxSteps = finalState.stepIndex;
    }

    const { power, air, health, food } = finalState.meters;
    if (power < 0 || power > 100 || air < 0 || air > 100 || health < 0 || health > 100 || food < 0 || food > 100) {
      allBoundsOk = false;
    }

    if (finalState.status === 'won') {
      wins++;
    } else {
      losses++;
      const reason = finalState.lossReason ?? 'health';
      lossReasons[reason]++;
    }
  }

  const winRatePercent = Number(((wins / count) * 100).toFixed(1));
  const healthLossRatePercent =
    losses > 0 ? Number(((lossReasons.health / losses) * 100).toFixed(1)) : 0;
  const powerAirLossRatePercent =
    losses > 0
      ? Number((((lossReasons.power + lossReasons.air) / losses) * 100).toFixed(1))
      : 0;

  return {
    botType,
    difficulty,
    totalRuns: count,
    wins,
    losses,
    winRatePercent,
    lossReasons,
    healthLossRatePercent,
    powerAirLossRatePercent,
    maxStepsObserved: maxSteps,
    allMetersWithinBounds: allBoundsOk,
  };
}
