import {
  ARCHETYPE_RULES,
  BASE_STEP_OPTIONS,
  EVENT_WEIGHTS,
  LOADOUT_BUDGET,
  LOADOUT_COSTS,
  MAX_TIMED_ALERTS,
  PASSIVE_RULES,
  RADIATION_RULES,
  STARTING_METERS,
} from "./config/balance";
import { DIFFICULTY_CONFIG } from "./config/difficulty";
import { mulberry32, pickWeighted } from "./rng";
import type {
  Action,
  AlertSpec,
  Archetype,
  Body,
  Difficulty,
  EventKind,
  Flare,
  ForcedEventKind,
  Loadout,
  Meters,
  MissionTemplateId,
  OptionPreview,
  OptionStyle,
  RunState,
  SiteId,
  SolarContext,
} from "./types";

export function clampMeter(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function loadoutPoints(loadout: Loadout): number {
  return (
    LOADOUT_COSTS.crew[loadout.crew] +
    LOADOUT_COSTS.power[loadout.power] +
    LOADOUT_COSTS.shield[loadout.shield] +
    LOADOUT_COSTS.food[loadout.food]
  );
}

export function validateLoadout(loadout: Loadout): boolean {
  return loadoutPoints(loadout) <= LOADOUT_BUDGET;
}

function computeSolarGain(
  body: Body,
  siteId: SiteId,
  loadout: Loadout,
  flags: RunState["flags"],
): number {
  if (loadout.power === "batteries") return 0;
  if (flags.nightActive || flags.panelsRetractedTurnsLeft > 0) return 0;

  let lightFactor = 1.0;
  if (siteId === "shackleton") lightFactor *= PASSIVE_RULES.shackletonLightMult;
  if (flags.dustTurnsLeft > 0) lightFactor *= PASSIVE_RULES.dustStormLightMult;
  if (body === "mars") lightFactor *= PASSIVE_RULES.marsLightMult;

  const damageMult = Math.max(0.25, 1 - flags.panelDamage);
  return Math.round(PASSIVE_RULES.solarBaseGain * lightFactor * damageMult);
}

function computeOptionPowerCost(
  basePower: number,
  archetype: Archetype,
  siteId: SiteId,
  crew: Loadout["crew"],
  radioNoiseActive: boolean,
): number {
  const rule = ARCHETYPE_RULES[archetype];
  let mult = rule.powerMult;

  if (rule.crewBonusApplies && crew > 2) {
    mult *= 1 - 0.1 * (crew - 2);
  }
  if (siteId === "shackleton" && rule.outdoor) {
    mult *= 1.15;
  }
  if ((siteId === "jezero" || siteId === "gale") && archetype === "experiment") {
    mult *= 0.8;
  }
  if (siteId === "gale" && archetype === "travel") {
    mult *= 1.1;
  }
  if (radioNoiseActive && archetype === "uplink") {
    mult *= 1.15;
  }
  return Math.round(basePower * mult);
}

function computeRadiationDose(
  body: Body,
  difficulty: Difficulty,
  loadout: Loadout,
  solar: SolarContext,
  outdoor: boolean,
): number {
  const diff = DIFFICULTY_CONFIG[difficulty];
  const raw =
    RADIATION_RULES.baseDose[solar.level] *
    (outdoor ? RADIATION_RULES.outdoorMult : 1) *
    RADIATION_RULES.shieldMult[loadout.shield] *
    RADIATION_RULES.bodyMult[body] *
    diff.dose;
  return Math.max(1, Math.round(raw));
}

export function computeOptionPreview(
  state: RunState,
  archetype: Archetype,
  style: OptionStyle,
  solar: SolarContext,
): OptionPreview {
  const base = BASE_STEP_OPTIONS[style];
  const rule = ARCHETYPE_RULES[archetype];
  const diff = DIFFICULTY_CONFIG[state.difficulty];
  const c = diff.consume;
  const nextTurn = state.turn;

  const nightNext = state.siteId === "tranquillitatis" && state.stepIndex >= 3;
  const previewFlags = { ...state.flags, nightActive: nightNext };

  const optionPower = computeOptionPowerCost(
    base.power,
    archetype,
    state.siteId,
    state.loadout.crew,
    state.flags.radioNoiseActive,
  );
  const solarGain = computeSolarGain(state.body, state.siteId, state.loadout, previewFlags);
  const shieldUpkeep =
    state.loadout.shield === "reinforced" ? -PASSIVE_RULES.reinforcedShieldPowerUpkeep : 0;
  const hydroPower =
    state.loadout.food === "hydroponics" && nextTurn <= 2
      ? -PASSIVE_RULES.hydroponicsEarlyPowerCost
      : 0;
  const hydroAir =
    state.loadout.food === "hydroponics" && nextTurn <= 2
      ? -PASSIVE_RULES.hydroponicsEarlyAirCost
      : 0;

  const passiveAir = -Math.round(PASSIVE_RULES.airPerCrew * state.loadout.crew * c) + hydroAir;
  const passiveFood =
    state.loadout.food === "rations"
      ? -Math.round(PASSIVE_RULES.rationsFoodPerCrew * state.loadout.crew * c)
      : nextTurn <= 2
        ? -Math.round(PASSIVE_RULES.rationsFoodPerCrew * state.loadout.crew * c)
        : PASSIVE_RULES.hydroponicsHarvestPerCrew * state.loadout.crew;

  const estimatedDose = computeRadiationDose(
    state.body,
    state.difficulty,
    state.loadout,
    solar,
    rule.outdoor,
  );

  return {
    style,
    optionPower,
    netPower: optionPower + solarGain + shieldUpkeep + hydroPower,
    netAir: base.air + passiveAir,
    netFood: base.food + passiveFood,
    estimatedDose,
    faultRisk: Math.min(0.95, base.faultRisk + state.flags.extraFaultRisk),
    outdoor: rule.outdoor,
    solarGain,
  };
}

export function createRun(
  params: {
    seed: number;
    body: Body;
    missionId: MissionTemplateId;
    siteId: SiteId;
    difficulty: Difficulty;
    loadout: Loadout;
    shortRun?: boolean;
  },
  _solar: SolarContext,
): RunState {
  if (!validateLoadout(params.loadout)) {
    throw new Error(`Loadout exceeds ${LOADOUT_BUDGET}-point engineering budget`);
  }
  const initialMeters: Meters = {
    power: STARTING_METERS.power[params.loadout.power],
    air: STARTING_METERS.air,
    health: STARTING_METERS.health,
    food: STARTING_METERS.food[params.loadout.food],
  };

  return {
    seed: params.seed,
    turn: 1,
    totalSteps: params.shortRun ? 4 : 6,
    body: params.body,
    missionId: params.missionId,
    siteId: params.siteId,
    difficulty: params.difficulty,
    loadout: params.loadout,
    meters: { ...initialMeters },
    initialMeters: { ...initialMeters },
    meterHistory: [{ label: "Launch", meters: { ...initialMeters } }],
    stepIndex: 0,
    lowPowerTurns: 0,
    flags: {
      nightActive: false,
      dustTurnsLeft: 0,
      panelsRetractedTurnsLeft: 0,
      blackoutTurnsLeft: 0,
      panelDamage: 0,
      extraFaultRisk: 0,
      radioNoiseActive: false,
    },
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
    status: "running",
  };
}

function flareClassBucket(classType: string): "C" | "M" | "X" {
  const head = classType.trim().toUpperCase()[0];
  if (head === "X") return "X";
  if (head === "M") return "M";
  return "C";
}

function pickFlareFromPool(
  rng: () => number,
  pool: Flare[],
  cap: "M" | "X",
  desiredBucket?: "M" | "X",
  fallbackXPool?: Flare[],
): Flare | undefined {
  if (desiredBucket === "X") {
    const xCandidates = pool.filter((f) => flareClassBucket(f.classType) === "X");
    const source = xCandidates.length > 0 ? xCandidates : fallbackXPool || [];
    if (source.length > 0) {
      return source[Math.floor(rng() * source.length)];
    }
  }
  if (desiredBucket === "M") {
    const mCandidates = pool.filter((f) => flareClassBucket(f.classType) === "M");
    if (mCandidates.length > 0) {
      return mCandidates[Math.floor(rng() * mCandidates.length)];
    }
  }

  const allowed = pool.filter((f) => {
    const bucket = flareClassBucket(f.classType);
    if (cap === "M" && bucket === "X") return false;
    return true;
  });
  if (allowed.length === 0) return undefined;
  return allowed[Math.floor(rng() * allowed.length)];
}

function buildFlareAlert(
  flare: Flare,
  bucket: "M" | "X",
  timerSec: number,
  baseDoseThisTurn: number,
  solar: SolarContext,
): AlertSpec {
  const regionLabel = flare.activeRegionNum
    ? `Active Region AR ${flare.activeRegionNum}`
    : "Solar Disk";
  const timed = bucket === "X";
  return {
    kind: "flare",
    title: timed
      ? `X-Class Solar Storm (${flare.classType})`
      : `M-Class Solar Flare (${flare.classType})`,
    description: `NASA DONKI recorded a ${flare.classType} flare from ${regionLabel} peaking at ${flare.peakTime}. Radiation levels are rising fast.`,
    timed,
    durationSec: timerSec,
    flare,
    flareProvenance: solar.provenance,
    baseDoseThisTurn,
    choices: [
      {
        id: "A",
        label: "Boost Magnetic Shield",
        summary: "Spend 15 Power to cut radiation dose by 80% and finish this step.",
        tradeoffTag: "-15 Power · 0.2x Dose",
      },
      {
        id: "B",
        label: "Shelter Crew Inside",
        summary: "Spend 3 Power and cut dose by 60%, but pause step progress this turn.",
        tradeoffTag: "-3 Power · Step Paused",
      },
      {
        id: "C",
        label: "Keep Working Outside",
        summary: "Save power and finish the step, but absorb the full storm radiation.",
        tradeoffTag: "0 Power · Full Dose",
      },
    ],
  };
}

function buildDustAlert(timerSec: number): AlertSpec {
  return {
    kind: "dust",
    title: "Martian Dust Squall Approaching",
    description:
      "High winds are lifting fine red dust across the landing basin, threatening solar array output.",
    timed: true,
    durationSec: timerSec,
    choices: [
      {
        id: "A",
        label: "Retract Solar Panels",
        summary: "Protect arrays from grit damage, but solar generation drops to 0 for 2 turns.",
        tradeoffTag: "0 Solar (2 Turns) · Safe",
      },
      {
        id: "B",
        label: "Keep Panels Deployed",
        summary: "Keep 50% solar output for 2 turns, with a 20% risk of permanent abrasion.",
        tradeoffTag: "50% Solar · Grit Risk",
      },
      {
        id: "C",
        label: "Draw Battery Reserve",
        summary: "Spend 10 Power right now to run dust-repellent heaters and keep normal output.",
        tradeoffTag: "-10 Power Now",
      },
    ],
  };
}

function buildFaultAlert(): AlertSpec {
  return {
    kind: "fault",
    title: "Equipment Telemetry Fault",
    description:
      "A pressure seal and power coupling triggered a warning chime during step operations.",
    timed: false,
    durationSec: 0,
    choices: [
      {
        id: "A",
        label: "Full Diagnostic Repair",
        summary:
          "Spend 8 Power to fix the hardware cleanly, holding this mission step for next turn.",
        tradeoffTag: "-8 Power · Step Paused",
      },
      {
        id: "B",
        label: "Quick Field Patch",
        summary: "Spend 3 Power and advance now, leaving a +10% fault chance on the next step.",
        tradeoffTag: "-3 Power · +10% Next Fault",
      },
      {
        id: "C",
        label: "Override & Push Through",
        summary: "Save power and finish the step, costing 4 Crew Health from manual strain.",
        tradeoffTag: "-4 Health · Step Advances",
      },
    ],
  };
}

function finalizeTurn(
  state: RunState,
  params: {
    optionStyle: OptionStyle;
    archetype: Archetype;
    event: EventKind;
    flare?: Flare;
    alertChoice?: "A" | "B" | "C" | "EXPIRED";
    advanceStep: boolean;
    finalDose: number;
    extraPowerDelta?: number;
    extraHealthDelta?: number;
    notes: string[];
  },
): RunState {
  const meters: Meters = {
    power: clampMeter(state.meters.power + (params.extraPowerDelta ?? 0)),
    air: clampMeter(state.meters.air),
    health: clampMeter(state.meters.health - params.finalDose + (params.extraHealthDelta ?? 0)),
    food: clampMeter(state.meters.food),
  };

  const notes = [...params.notes];
  if (params.finalDose > 0) {
    notes.push(`Radiation dose -${Math.round(params.finalDose)} Health.`);
  }

  const lowPowerTurns = meters.power === 0 ? state.lowPowerTurns + 1 : 0;
  const minHealth = Math.min(state.minHealth, meters.health);
  const nextStepIndex = params.advanceStep ? state.stepIndex + 1 : state.stepIndex;
  const nextTurn = state.turn + 1;

  // Deliver Mars advice if scheduled for nextTurn
  let pendingAdvice = state.pendingAdvice;
  let deliveredAdvice = state.deliveredAdvice;
  if (pendingAdvice && nextTurn >= pendingAdvice.arrivesOnTurn) {
    deliveredAdvice = { turn: nextTurn, text: pendingAdvice.text };
    pendingAdvice = null;
    notes.push("Delayed Mission Control transmission arrived.");
  }

  let status: RunState["status"] = "running";
  let lossReason: RunState["lossReason"];
  if (meters.air <= 0) {
    status = "lost";
    lossReason = "air";
  } else if (meters.food <= 0) {
    status = "lost";
    lossReason = "food";
  } else if (meters.health <= 0) {
    status = "lost";
    lossReason = "health";
  } else if (lowPowerTurns >= 2) {
    status = "lost";
    lossReason = "power";
  } else if (nextStepIndex >= state.totalSteps) {
    status = "won";
  }

  const logEntry = {
    turn: state.turn,
    stepNumber: Math.min(state.totalSteps, state.stepIndex + 1),
    archetype: params.archetype,
    optionStyle: params.optionStyle,
    event: params.event,
    flare: params.flare,
    alertChoice: params.alertChoice,
    meters: { ...meters },
    notes,
  };

  return {
    ...state,
    turn: nextTurn,
    stepIndex: nextStepIndex,
    meters,
    meterHistory: [...state.meterHistory, { label: `T${state.turn}`, meters: { ...meters } }],
    lowPowerTurns,
    minHealth,
    pendingAdvice,
    deliveredAdvice,
    activeAlert: null,
    pendingStepContext: null,
    log: [...state.log, logEntry],
    status,
    lossReason,
  };
}

export function resolveStep(
  state: RunState,
  action: Action,
  solar: SolarContext,
  missionArchetypes: ReadonlyArray<Archetype>,
  options?: {
    forcedEvent?: ForcedEventKind;
    fallbackXPool?: Flare[];
    fallbackFlareProvenance?: SolarContext["provenance"];
  },
): { state: RunState; alert?: AlertSpec } {
  if (state.status !== "running") {
    return { state };
  }

  const diff = DIFFICULTY_CONFIG[state.difficulty];

  if (action.type === "ASK_MISSION_CONTROL") {
    if (state.flags.blackoutTurnsLeft > 0) {
      return { state };
    }
    if (state.body === "moon") {
      return {
        state: {
          ...state,
          deliveredAdvice: { turn: state.turn, text: action.hintText },
        },
      };
    }
    if (state.pendingAdvice) {
      return { state };
    }
    return {
      state: {
        ...state,
        pendingAdvice: {
          requestedOnTurn: state.turn,
          arrivesOnTurn: state.turn + diff.delayTurnsMars,
          text: action.hintText,
        },
      },
    };
  }

  if (action.type === "ALERT_CHOICE") {
    if (!state.activeAlert || !state.pendingStepContext) {
      return { state };
    }
    const alert = state.activeAlert;
    const ctx = state.pendingStepContext;
    const rng = mulberry32(state.seed + state.turn * 97 + 13);
    const choice = action.choice;

    let advanceStep = true;
    let finalDose = ctx.baseDose;
    let extraPowerDelta = 0;
    let extraHealthDelta = 0;
    let pressureWins = state.pressureWins;
    let pressureFails = state.pressureFails;
    const nextFlags = { ...state.flags };
    const notes = [...ctx.notes];

    if (alert.kind === "flare") {
      const stormDose = (alert.baseDoseThisTurn ?? ctx.baseDose) * (alert.timed ? 1.8 : 1.4);
      if (choice === "A") {
        extraPowerDelta = -15;
        finalDose = Math.max(1, Math.round(stormDose * 0.2));
        if (alert.timed) pressureWins += 1;
        notes.push(
          `Solar flare ${alert.flare?.classType ?? ""}: Magnetic shield boosted (-15 Power).`,
        );
      } else if (choice === "B") {
        extraPowerDelta = -3;
        finalDose = Math.max(1, Math.round(stormDose * 0.4));
        advanceStep = false;
        if (alert.timed) pressureWins += 1;
        notes.push(
          `Solar flare ${alert.flare?.classType ?? ""}: Crew sheltered safely; step held.`,
        );
      } else {
        finalDose = Math.max(2, Math.round(stormDose));
        if (choice === "EXPIRED") {
          pressureFails += 1;
          notes.push(`Alert timer expired during ${alert.flare?.classType ?? "solar"} flare.`);
        } else {
          notes.push(`Crew kept working through ${alert.flare?.classType ?? "solar"} storm.`);
        }
      }
    } else if (alert.kind === "dust") {
      if (choice === "A") {
        nextFlags.panelsRetractedTurnsLeft = 2;
        pressureWins += 1;
        notes.push("Dust storm: Solar panels retracted safely for 2 turns.");
      } else if (choice === "B") {
        nextFlags.dustTurnsLeft = 2;
        pressureWins += 1;
        if (rng() < 0.2) {
          nextFlags.panelDamage = Math.min(0.5, nextFlags.panelDamage + 0.25);
          notes.push("Dust storm: Grit scratched solar arrays (-25% output).");
        } else {
          notes.push("Dust storm: Panels kept operating at 50% sunlight.");
        }
      } else {
        extraPowerDelta = -10;
        if (choice === "EXPIRED") {
          pressureFails += 1;
          notes.push("Alert timer expired in dust squall; reserve heaters drew -10 Power.");
        } else {
          pressureWins += 1;
          notes.push("Dust storm: Switched to battery reserve (-10 Power).");
        }
      }
    } else if (alert.kind === "fault") {
      if (choice === "A") {
        extraPowerDelta = -8;
        advanceStep = false;
        notes.push("Equipment fault: Full diagnostic repair completed (-8 Power, step held).");
      } else if (choice === "B") {
        extraPowerDelta = -3;
        nextFlags.extraFaultRisk = 0.1;
        notes.push("Equipment fault: Quick field patch applied (-3 Power).");
      } else {
        extraHealthDelta = -4;
        notes.push("Equipment fault: Manual override strained crew (-4 Health).");
      }
    }

    const updatedState: RunState = {
      ...state,
      flags: nextFlags,
      pressureWins,
      pressureFails,
    };

    return {
      state: finalizeTurn(updatedState, {
        optionStyle: ctx.optionStyle,
        archetype: ctx.archetype,
        event: alert.kind,
        flare: alert.flare,
        alertChoice: choice,
        advanceStep,
        finalDose,
        extraPowerDelta,
        extraHealthDelta,
        notes,
      }),
    };
  }

  // CHOOSE_OPTION
  if (state.activeAlert) {
    return { state, alert: state.activeAlert };
  }

  const archetype = missionArchetypes[state.stepIndex] ?? "uplink";
  const baseOpt = BASE_STEP_OPTIONS[action.style];
  const rule = ARCHETYPE_RULES[archetype];
  const rng = mulberry32(state.seed + state.turn * 31);
  const c = diff.consume;

  // Update turn-start flags (lunar night on Tranquillitatis steps 4..6 -> stepIndex >= 3)
  const nightActive = state.siteId === "tranquillitatis" && state.stepIndex >= 3;
  const currentFlags: RunState["flags"] = {
    ...state.flags,
    nightActive,
  };

  const optionPower = computeOptionPowerCost(
    baseOpt.power,
    archetype,
    state.siteId,
    state.loadout.crew,
    currentFlags.radioNoiseActive,
  );
  const solarGain = computeSolarGain(state.body, state.siteId, state.loadout, currentFlags);
  const shieldUpkeep =
    state.loadout.shield === "reinforced" ? -PASSIVE_RULES.reinforcedShieldPowerUpkeep : 0;
  const hydroPower =
    state.loadout.food === "hydroponics" && state.turn <= 2
      ? -PASSIVE_RULES.hydroponicsEarlyPowerCost
      : 0;
  const hydroAir =
    state.loadout.food === "hydroponics" && state.turn <= 2
      ? -PASSIVE_RULES.hydroponicsEarlyAirCost
      : 0;

  const airSpend =
    baseOpt.air - Math.round(PASSIVE_RULES.airPerCrew * state.loadout.crew * c) + hydroAir;
  const foodDelta =
    baseOpt.food +
    (state.loadout.food === "rations"
      ? -Math.round(PASSIVE_RULES.rationsFoodPerCrew * state.loadout.crew * c)
      : state.turn <= 2
        ? -Math.round(PASSIVE_RULES.rationsFoodPerCrew * state.loadout.crew * c)
        : PASSIVE_RULES.hydroponicsHarvestPerCrew * state.loadout.crew);

  let power = clampMeter(state.meters.power + optionPower + solarGain + shieldUpkeep + hydroPower);
  let air = clampMeter(state.meters.air + airSpend);
  let food = clampMeter(state.meters.food + foodDelta);
  let health = state.meters.health;

  const notes: string[] = [];
  if (nightActive) {
    notes.push("Lunar night at Tranquillitatis: solar arrays generated 0 Power.");
  } else if (solarGain > 0) {
    notes.push(`Solar arrays generated +${solarGain} Power.`);
  }
  if (state.loadout.food === "hydroponics" && state.turn >= 3) {
    notes.push(
      `Hydroponics harvest restored +${PASSIVE_RULES.hydroponicsHarvestPerCrew * state.loadout.crew} Food.`,
    );
  }

  if (air < PASSIVE_RULES.strainThreshold || food < PASSIVE_RULES.strainThreshold) {
    health = clampMeter(health - PASSIVE_RULES.strainHealthPenalty);
    notes.push("Low life-support reserves caused crew strain (-3 Health).");
  }

  const baseDose = computeRadiationDose(
    state.body,
    state.difficulty,
    state.loadout,
    solar,
    rule.outdoor,
  );

  // Decrement duration flags for future turns
  const nextFlags: RunState["flags"] = {
    ...currentFlags,
    dustTurnsLeft: Math.max(0, currentFlags.dustTurnsLeft - 1),
    panelsRetractedTurnsLeft: Math.max(0, currentFlags.panelsRetractedTurnsLeft - 1),
    blackoutTurnsLeft: Math.max(0, currentFlags.blackoutTurnsLeft - 1),
    extraFaultRisk: 0,
    radioNoiseActive: false,
  };

  const midState: RunState = {
    ...state,
    meters: { power, air, health, food },
    flags: nextFlags,
  };

  // Roll or apply forced event
  const forced = options?.forcedEvent;
  let chosenEvent: EventKind = "none";
  let desiredFlareBucket: "M" | "X" | undefined;

  if (forced) {
    if (forced === "flare-x") {
      chosenEvent = "flare";
      desiredFlareBucket = "X";
    } else if (forced === "flare-m") {
      chosenEvent = "flare";
      desiredFlareBucket = "M";
    } else {
      chosenEvent = forced;
    }
  } else if (state.turn > 1) {
    const faultChance = Math.min(0.95, baseOpt.faultRisk + currentFlags.extraFaultRisk);
    if (rng() < faultChance) {
      chosenEvent = "fault";
    } else if (rng() < diff.eventRate) {
      chosenEvent = pickWeighted<EventKind>(rng, [
        { item: "flare", weight: EVENT_WEIGHTS.flare[solar.level] },
        { item: "dust", weight: state.body === "mars" ? EVENT_WEIGHTS.dustMars : 0 },
        { item: "blackout", weight: state.body === "mars" ? EVENT_WEIGHTS.blackoutMars : 0 },
        { item: "fault", weight: EVENT_WEIGHTS.fault },
      ]);
    }
  }

  // Handle Event
  if (chosenEvent === "flare") {
    const effectiveCap = desiredFlareBucket === "X" ? "X" : diff.flareCap;
    const flare = pickFlareFromPool(
      rng,
      solar.pool,
      effectiveCap,
      desiredFlareBucket,
      options?.fallbackXPool,
    );
    if (flare) {
      let bucket = flareClassBucket(flare.classType);
      if (bucket === "X" && state.timedAlertsSeen >= MAX_TIMED_ALERTS && !forced) {
        bucket = "M";
      }
      if (bucket === "C") {
        midState.flags.radioNoiseActive = true;
        notes.push(
          `Minor NASA DONKI flare (${flare.classType}): mild radio static on next uplink.`,
        );
        return {
          state: finalizeTurn(midState, {
            optionStyle: action.style,
            archetype,
            event: "flare",
            flare,
            advanceStep: true,
            finalDose: baseDose,
            notes,
          }),
        };
      }

      const flareContext: SolarContext =
        bucket === "X" &&
        !solar.pool.some((f) => f.id === flare.id) &&
        options?.fallbackFlareProvenance
          ? { ...solar, provenance: options.fallbackFlareProvenance }
          : solar;

      const alert = buildFlareAlert(flare, bucket, diff.timerSec, baseDose, flareContext);
      const waitingState: RunState = {
        ...midState,
        alertsSeen: midState.alertsSeen + 1,
        timedAlertsSeen: midState.timedAlertsSeen + (alert.timed ? 1 : 0),
        activeAlert: alert,
        pendingStepContext: {
          optionStyle: action.style,
          archetype,
          baseDose,
          notes,
        },
      };
      return { state: waitingState, alert };
    }
  } else if (chosenEvent === "dust") {
    if (state.timedAlertsSeen < MAX_TIMED_ALERTS || forced) {
      const alert = buildDustAlert(diff.timerSec);
      const waitingState: RunState = {
        ...midState,
        alertsSeen: midState.alertsSeen + 1,
        timedAlertsSeen: midState.timedAlertsSeen + 1,
        activeAlert: alert,
        pendingStepContext: {
          optionStyle: action.style,
          archetype,
          baseDose,
          notes,
        },
      };
      return { state: waitingState, alert };
    }
  } else if (chosenEvent === "fault") {
    const alert = buildFaultAlert();
    const waitingState: RunState = {
      ...midState,
      alertsSeen: midState.alertsSeen + 1,
      activeAlert: alert,
      pendingStepContext: {
        optionStyle: action.style,
        archetype,
        baseDose,
        notes,
      },
    };
    return { state: waitingState, alert };
  } else if (chosenEvent === "blackout") {
    midState.flags.blackoutTurnsLeft = 2;
    notes.push("Solar radio blackout: Mission Control link unavailable for 2 turns.");
    return {
      state: finalizeTurn(midState, {
        optionStyle: action.style,
        archetype,
        event: "blackout",
        advanceStep: true,
        finalDose: baseDose,
        notes,
      }),
    };
  }

  return {
    state: finalizeTurn(midState, {
      optionStyle: action.style,
      archetype,
      event: "none",
      advanceStep: true,
      finalDose: baseDose,
      notes,
    }),
  };
}
