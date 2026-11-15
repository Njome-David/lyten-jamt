/**
 * Pure engine reducer and step simulation loop.
 * Pure TypeScript (no React/DOM/Date/Math.random).
 */

import type {
  Action,
  AlertSpec,
  Archetype,
  CreateRunFn,
  Flare,
  Meters,
  OptionPreview,
  OptionStyle,
  PreviewOptionFn,
  ResolveStepFn,
  RunFlags,
  RunState,
  SolarContext,
  TurnLogEntry,
} from './types';
import {
  ARCHETYPE_OUTDOOR,
  ARCHETYPE_POWER_MULTIPLIER,
  BASE_RADIATION_DOSE,
  BASE_STEP_OPTIONS,
  BODY_DOSE_MULTIPLIER,
  DIFFICULTY_CONFIG,
  INITIAL_METERS_CONFIG,
  SHIELD_DOSE_MULTIPLIER,
  isLoadoutValid,
} from './config/balance';
import { clampGauge } from './jauges';
import { mulberry32, randChoice } from './rng';
import {
  createDustAlert,
  createFallbackFlare,
  createFaultAlert,
  createFlareAlert,
  getEligibleFlares,
  rollEventKind,
} from './events';

/**
 * Creates initial mission state.
 */
export const createRun: CreateRunFn = (params, _solar) => {
  if (!isLoadoutValid(params.loadout)) {
    throw new Error('Loadout budget exceeded maximum limit of 10 points.');
  }

  const initialMeters: Meters = {
    ...INITIAL_METERS_CONFIG[params.loadout.power][params.loadout.food],
  };

  const flags: RunFlags = {
    nightActive: false,
    dustTurnsLeft: 0,
    panelsRetractedTurnsLeft: 0,
    blackoutTurnsLeft: 0,
    panelDamage: 0,
    extraFaultRisk: 0,
    radioNoiseActive: false,
  };

  return {
    seed: params.seed,
    turn: 1,
    totalSteps: params.totalSteps ?? 6,
    body: params.body,
    missionId: params.missionId,
    siteId: params.siteId,
    difficulty: params.difficulty,
    loadout: params.loadout,
    meters: { ...initialMeters },
    initialMeters: { ...initialMeters },
    meterHistory: [{ label: 'Start', meters: { ...initialMeters } }],
    stepIndex: 0,
    lowPowerTurns: 0,
    flags,
    alertsSeen: 0,
    timedAlertsSeen: 0,
    pressureWins: 0,
    pressureFails: 0,
    minHealth: initialMeters.health,
    pendingAdvice: null,
    deliveredAdvice: null,
    activeAlert: null,
    pendingStepContext: null,
    log: [],
    status: 'running',
  };
};

/**
 * Pure preview calculation of cost and gauge projections for an option.
 */
export const previewOption: PreviewOptionFn = (
  state: RunState,
  archetype: Archetype,
  style: OptionStyle,
  solar: SolarContext
): OptionPreview => {
  const baseDef = BASE_STEP_OPTIONS[style];
  const diff = DIFFICULTY_CONFIG[state.difficulty];
  const outdoor = ARCHETYPE_OUTDOOR[archetype] ?? true;

  // 1. Calculate Option Power
  let powerCost = baseDef.power * ARCHETYPE_POWER_MULTIPLIER[archetype];

  // Crew bonus for manual archetypes
  if (
    state.loadout.crew > 2 &&
    ['travel', 'deploy', 'drill', 'repair'].includes(archetype)
  ) {
    const bonus = 1 - 0.1 * (state.loadout.crew - 2);
    powerCost *= bonus;
  }

  // Site modifiers
  if (state.siteId === 'shackleton' && outdoor) {
    powerCost *= 1.15;
  }
  if (
    (state.siteId === 'jezero' || state.siteId === 'gale') &&
    archetype === 'experiment'
  ) {
    powerCost *= 0.8;
  }
  if (state.siteId === 'gale' && archetype === 'travel') {
    powerCost *= 1.1;
  }

  // Radio noise penalty on uplink
  if (state.flags.radioNoiseActive && archetype === 'uplink') {
    powerCost *= 1.15;
  }

  // 2. Solar generation
  let lightFactor = 1.0;
  if (state.siteId === 'shackleton') lightFactor = 1.2;
  if (state.body === 'mars') lightFactor *= 0.6;
  if (state.flags.nightActive) lightFactor = 0;
  if (state.flags.dustTurnsLeft > 0) lightFactor *= 0.5;
  if (state.flags.panelsRetractedTurnsLeft > 0) lightFactor = 0;
  if (state.flags.panelDamage > 0)
    lightFactor *= Math.max(0, 1 - state.flags.panelDamage);

  const solarGain = state.loadout.power === 'panels' ? 12 * lightFactor : 0;

  // Shield upkeep
  const shieldUpkeep = state.loadout.shield === 'reinforced' ? -3 : 0;

  const netPower = Math.round(powerCost + solarGain + shieldUpkeep);

  // 3. Air and Food
  const netAir = Math.round(-3 * state.loadout.crew * diff.consume + baseDef.air);

  let netFood: number;
  if (state.loadout.food === 'rations') {
    netFood = Math.round(-2 * state.loadout.crew * diff.consume + baseDef.food);
  } else {
    // Hydroponics
    netFood =
      state.turn < 3
        ? Math.round(-2 * state.loadout.crew * diff.consume + baseDef.food)
        : Math.round(1 * state.loadout.crew + baseDef.food);
  }

  // 4. Radiation Dose
  const baseDose = BASE_RADIATION_DOSE[solar.level];
  const outdoorMult = outdoor ? 1.5 : 1.0;
  const shieldMult = SHIELD_DOSE_MULTIPLIER[state.loadout.shield];
  const bodyMult = BODY_DOSE_MULTIPLIER[state.body];
  const estimatedDose = Number(
    (baseDose * outdoorMult * shieldMult * bodyMult * diff.dose).toFixed(1)
  );

  return {
    id: `opt-${archetype}-${style}`,
    title: `${style.toUpperCase()} ${archetype}`,
    description: `Execute ${archetype} with ${style} profile.`,
    cost: Math.min(100, Math.abs(Math.round(powerCost))),
    reward: 50,
    risk: baseDef.faultRisk > 0.2 ? 'high' : baseDef.faultRisk > 0.1 ? 'medium' : 'low',
    deltaEnergy: netPower,
    deltaRadiation: -estimatedDose,
    style,
    optionPower: Math.round(powerCost),
    netPower,
    netAir,
    netFood,
    estimatedDose,
    faultRisk: baseDef.faultRisk + state.flags.extraFaultRisk,
    outdoor,
    solarGain: Math.round(solarGain),
  };
};

/**
 * Pure step resolution advancing or resolving alerts.
 */
export const resolveStep: ResolveStepFn = (
  state: RunState,
  action: Action,
  solar: SolarContext
): { state: RunState; alert?: AlertSpec } => {
  if (state.status !== 'running') {
    return { state };
  }

  const nextState: RunState = {
    ...state,
    flags: { ...state.flags },
    meters: { ...state.meters },
    log: [...state.log],
    meterHistory: [...state.meterHistory],
  };

  const rng = mulberry32(nextState.seed + nextState.turn);

  // --------------------------------------------------------------------------
  // 1. Handling ASK_MISSION_CONTROL
  // --------------------------------------------------------------------------
  if (action.type === 'ASK_MISSION_CONTROL') {
    if (nextState.flags.blackoutTurnsLeft > 0) {
      return { state: nextState };
    }

    const diff = DIFFICULTY_CONFIG[nextState.difficulty];
    const hint =
      action.hintText ?? 'Conserve battery power and seek shelter during flares.';

    if (nextState.body === 'moon') {
      nextState.deliveredAdvice = { turn: nextState.turn, text: hint };
      nextState.pendingAdvice = null;
    } else {
      nextState.pendingAdvice = {
        arrivesOnTurn: nextState.turn + diff.marsDelayTurns,
        text: hint,
        requestedOnTurn: nextState.turn,
      };
    }
    return { state: nextState };
  }

  // --------------------------------------------------------------------------
  // 2. Handling ALERT_CHOICE
  // --------------------------------------------------------------------------
  if (action.type === 'ALERT_CHOICE') {
    const alert = nextState.activeAlert;
    if (!alert) {
      return { state: nextState };
    }

    const choice = action.choice;
    const isExpired = choice === 'EXPIRED';

    if (isExpired) {
      nextState.pressureFails += 1;
    } else if (alert.timed) {
      nextState.pressureWins += 1;
    }

    const notes: string[] = [];

    if (alert.kind === 'flare') {
      const baseDose = alert.baseDoseThisTurn ?? 2.5;
      if (choice === 'A') {
        nextState.meters.power = clampGauge(nextState.meters.power - 15);
        nextState.meters.health = clampGauge(
          nextState.meters.health - baseDose * 0.2
        );
        notes.push('Shield boosted: heavy power drain, radiation mitigated.');
      } else if (choice === 'B') {
        nextState.meters.power = clampGauge(nextState.meters.power - 3);
        nextState.meters.health = clampGauge(
          nextState.meters.health - baseDose * 0.4
        );
        nextState.stepIndex = Math.max(0, nextState.stepIndex - 1);
        notes.push('Crew sheltered: step paused to protect astronauts.');
      } else {
        // C or EXPIRED
        nextState.meters.health = clampGauge(nextState.meters.health - baseDose);
        notes.push(
          isExpired
            ? 'Alert timed out! Full radiation exposure taken.'
            : 'Crew continued operations amidst solar flare.'
        );
      }
    } else if (alert.kind === 'dust') {
      if (choice === 'A') {
        nextState.flags.panelsRetractedTurnsLeft = 2;
        notes.push('Solar arrays retracted to prevent storm wear.');
      } else if (choice === 'B') {
        nextState.flags.dustTurnsLeft = 2;
        if (rng() < 0.2) {
          nextState.flags.panelDamage += 0.25;
          notes.push('Panels sustained dust abrasion damage.');
        } else {
          notes.push('Panels kept active with moderate dust obscuration.');
        }
      } else {
        // C or EXPIRED
        nextState.meters.power = clampGauge(nextState.meters.power - 10);
        notes.push('Emergency battery reserve engaged.');
      }
    } else if (alert.kind === 'fault') {
      if (choice === 'A') {
        nextState.meters.power = clampGauge(nextState.meters.power - 8);
        nextState.stepIndex = Math.max(0, nextState.stepIndex - 1);
        notes.push('Immediate hardware overhaul executed: step paused.');
      } else if (choice === 'B') {
        nextState.meters.power = clampGauge(nextState.meters.power - 3);
        nextState.flags.extraFaultRisk += 0.1;
        notes.push('Temporary software bypass patched.');
      } else {
        // C or EXPIRED
        nextState.meters.power = clampGauge(nextState.meters.power - 6);
        nextState.meters.health = clampGauge(nextState.meters.health - 8);
        notes.push('Fault ignored: electrical short and astronaut strain incurred.');
      }
    }

    nextState.activeAlert = null;

    // Check status after alert resolution
    checkRunOutcome(nextState);

    return { state: nextState };
  }

  // --------------------------------------------------------------------------
  // 3. Handling CHOOSE_OPTION
  // --------------------------------------------------------------------------
  if (action.type === 'CHOOSE_OPTION') {
    const archetype: Archetype =
      nextState.pendingStepContext?.archetype ?? 'travel';
    const preview = previewOption(nextState, archetype, action.style, solar);

    // Apply preview changes
    nextState.meters.power = clampGauge(nextState.meters.power + preview.netPower);
    nextState.meters.air = clampGauge(nextState.meters.air + preview.netAir);
    nextState.meters.food = clampGauge(nextState.meters.food + preview.netFood);
    nextState.meters.health = clampGauge(
      nextState.meters.health - preview.estimatedDose
    );

    // Crew strain penalty if air or food is critically low
    if (nextState.meters.air < 20 || nextState.meters.food < 20) {
      nextState.meters.health = clampGauge(nextState.meters.health - 3);
    }

    // Step index advances
    nextState.stepIndex += 1;

    // Turn counter advances
    nextState.turn += 1;

    // Track min health
    nextState.minHealth = Math.min(nextState.minHealth, nextState.meters.health);

    // Track low power consecutive turns
    if (nextState.meters.power <= 0) {
      nextState.lowPowerTurns += 1;
      // Complete power failure strains life support
      nextState.meters.air = clampGauge(nextState.meters.air - 12);
      nextState.meters.health = clampGauge(nextState.meters.health - 6);
    } else {
      nextState.lowPowerTurns = 0;
    }

    // Decrement turn flags
    if (nextState.flags.dustTurnsLeft > 0) nextState.flags.dustTurnsLeft -= 1;
    if (nextState.flags.panelsRetractedTurnsLeft > 0)
      nextState.flags.panelsRetractedTurnsLeft -= 1;
    if (nextState.flags.blackoutTurnsLeft > 0)
      nextState.flags.blackoutTurnsLeft -= 1;
    nextState.flags.radioNoiseActive = false;

    // Check Tranquillitatis lunar night
    if (nextState.siteId === 'tranquillitatis') {
      nextState.flags.nightActive = nextState.turn >= 4 && nextState.turn <= 6;
    }

    // Deliver advice if Mars delay elapsed
    if (
      nextState.pendingAdvice &&
      nextState.turn >= nextState.pendingAdvice.arrivesOnTurn
    ) {
      nextState.deliveredAdvice = {
        turn: nextState.turn,
        text: nextState.pendingAdvice.text,
      };
      nextState.pendingAdvice = null;
    }

    // Roll Event
    const eventKind = rollEventKind(
      rng,
      nextState.turn,
      nextState.body,
      nextState.difficulty,
      solar,
      preview.faultRisk
    );

    let triggeredAlert: AlertSpec | undefined;
    let selectedFlare: Flare | undefined;

    if (eventKind === 'flare') {
      const cap = DIFFICULTY_CONFIG[nextState.difficulty].flareCap;
      const eligible = getEligibleFlares(solar.pool, cap);

      const hasX = eligible.some((f) => f.classType.toUpperCase().startsWith('X'));
      const triggerX =
        cap === 'X' &&
        !hasX &&
        rng() < (nextState.difficulty === 'hard' ? 0.75 : 0.50);

      if (triggerX) {
        selectedFlare = createFallbackFlare('X', rng);
      } else {
        const stormEligible = eligible.filter((f) => {
          const cls = f.classType.toUpperCase();
          return cls.startsWith('M') || cls.startsWith('X');
        });

        const preferStorm =
          (solar.level === 'active' || solar.level === 'stormy') &&
          stormEligible.length > 0 &&
          rng() < 0.7;

        selectedFlare = preferStorm
          ? randChoice(rng, stormEligible)
          : eligible.length > 0
          ? randChoice(rng, eligible)
          : createFallbackFlare(cap, rng);
      }

      if (selectedFlare) {
        const cls = selectedFlare.classType.toUpperCase();
        if (cls.startsWith('A') || cls.startsWith('B') || cls.startsWith('C')) {
          nextState.flags.radioNoiseActive = true;
        } else {
          const canBeTimed = nextState.timedAlertsSeen < 2;
          triggeredAlert = createFlareAlert(
            selectedFlare,
            nextState.difficulty,
            preview.estimatedDose,
            canBeTimed
          );
        }
      }
    } else if (eventKind === 'dust') {
      const canBeTimed = nextState.timedAlertsSeen < 2;
      triggeredAlert = createDustAlert(nextState.difficulty, canBeTimed);
    } else if (eventKind === 'fault') {
      triggeredAlert = createFaultAlert();
    } else if (eventKind === 'blackout') {
      nextState.flags.blackoutTurnsLeft = 2;
    }

    if (triggeredAlert) {
      nextState.activeAlert = triggeredAlert;
      nextState.alertsSeen += 1;
      if (triggeredAlert.timed) {
        nextState.timedAlertsSeen += 1;
      }
    }

    // Record turn entry in log
    const entry: TurnLogEntry = {
      turn: nextState.turn - 1,
      stepNumber: nextState.stepIndex,
      archetype,
      optionStyle: action.style,
      event: eventKind,
      flare: selectedFlare,
      meters: { ...nextState.meters },
      notes: [`Action ${action.style} executed on ${archetype}.`],
    };
    nextState.log.push(entry);
    nextState.meterHistory.push({
      label: `Turn ${entry.turn}`,
      meters: { ...nextState.meters },
    });

    // Check outcome
    checkRunOutcome(nextState);

    return { state: nextState, alert: triggeredAlert };
  }

  return { state: nextState };
};

/**
 * Checks win or loss conditions.
 */
function checkRunOutcome(state: RunState): void {
  if (state.meters.air <= 0) {
    state.status = 'lost';
    state.lossReason = 'air';
  } else if (state.meters.food <= 0) {
    state.status = 'lost';
    state.lossReason = 'food';
  } else if (state.meters.health <= 0) {
    state.status = 'lost';
    state.lossReason = 'health';
  } else if (state.lowPowerTurns >= 2) {
    state.status = 'lost';
    state.lossReason = 'power';
  } else if (state.stepIndex >= state.totalSteps) {
    state.status = 'won';
  }
}
