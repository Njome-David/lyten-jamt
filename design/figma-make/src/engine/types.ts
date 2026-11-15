export type Body = "moon" | "mars";
export type Difficulty = "easy" | "medium" | "hard";
export type MeterId = "power" | "air" | "health" | "food";
export type Meters = Record<MeterId, number>; // Clamped 0..100
export type Archetype = "travel" | "deploy" | "drill" | "experiment" | "repair" | "uplink";
export type OptionStyle = "fast" | "balanced" | "careful";
export type SolarLevel = "calm" | "active" | "stormy";
export type MissionTemplateId = "relay" | "core" | "seismic" | "mapper" | "garden";
export type SiteId = "shackleton" | "tranquillitatis" | "jezero" | "gale";

export interface Loadout {
  crew: 2 | 3 | 4;
  power: "panels" | "batteries";
  shield: "standard" | "reinforced";
  food: "rations" | "hydroponics";
}

export interface Provenance {
  source: string;
  url: string;
  fetchedAt: string;
  isLive: boolean;
  credit?: string;
  note?: string;
}

export interface Snapshot<T> {
  meta: Provenance;
  data: T;
}

export interface Flare {
  id: string;
  classType: string;
  peakTime: string;
  activeRegionNum: number | null;
  link?: string;
}

export interface SolarContext {
  level: SolarLevel;
  pool: Flare[];
  provenance: Provenance;
  mode: "recent" | "may2024";
}

export interface StepOptionDef {
  style: OptionStyle;
  power: number;
  air: number;
  food: number;
  faultRisk: number;
  outdoor: boolean;
}

export type EventKind = "flare" | "dust" | "fault" | "blackout" | "none";
export type ForcedEventKind = "flare-x" | "flare-m" | "dust" | "fault" | "blackout";

export interface AlertChoiceSpec {
  id: "A" | "B" | "C";
  label: string;
  summary: string;
  tradeoffTag: string;
}

export interface AlertSpec {
  kind: "flare" | "dust" | "fault";
  title: string;
  description: string;
  timed: boolean;
  durationSec: number;
  flare?: Flare;
  flareProvenance?: Provenance;
  baseDoseThisTurn?: number;
  choices: [AlertChoiceSpec, AlertChoiceSpec, AlertChoiceSpec];
}

export interface TurnLogEntry {
  turn: number;
  stepNumber: number;
  archetype: Archetype;
  optionStyle: OptionStyle;
  event: EventKind;
  flare?: Flare;
  alertChoice?: "A" | "B" | "C" | "EXPIRED";
  meters: Meters;
  notes: string[];
}

export interface RunState {
  seed: number;
  turn: number;
  totalSteps: number;
  body: Body;
  missionId: MissionTemplateId;
  siteId: SiteId;
  difficulty: Difficulty;
  loadout: Loadout;
  meters: Meters;
  initialMeters: Meters;
  meterHistory: Array<{ label: string; meters: Meters }>;
  stepIndex: number;
  lowPowerTurns: number;
  flags: {
    nightActive: boolean;
    dustTurnsLeft: number;
    panelsRetractedTurnsLeft: number;
    blackoutTurnsLeft: number;
    panelDamage: number;
    extraFaultRisk: number;
    radioNoiseActive: boolean;
  };
  alertsSeen: number;
  timedAlertsSeen: number;
  pressureWins: number;
  pressureFails: number;
  minHealth: number;
  pendingAdvice: { arrivesOnTurn: number; text: string; requestedOnTurn: number } | null;
  deliveredAdvice: { turn: number; text: string } | null;
  activeAlert: AlertSpec | null;
  pendingStepContext: {
    optionStyle: OptionStyle;
    archetype: Archetype;
    baseDose: number;
    notes: string[];
  } | null;
  log: TurnLogEntry[];
  status: "running" | "won" | "lost";
  lossReason?: "air" | "food" | "health" | "power";
}

export type Action =
  | { type: "CHOOSE_OPTION"; style: OptionStyle; adviceHintPool?: string[] }
  | { type: "ALERT_CHOICE"; choice: "A" | "B" | "C" | "EXPIRED" }
  | { type: "ASK_MISSION_CONTROL"; hintText: string };

export interface XpBreakdown {
  welcome: number;
  objective: number;
  healthyCrew: number;
  pressureBonus: number;
  threeStarBonus: number;
  lessonLearned: number;
  streakMultiplier: number;
  total: number;
}

export interface RunScore {
  stars: 0 | 1 | 2 | 3;
  xp: XpBreakdown;
  incidents: string[];
  causeSummary: string;
  nextTimeTip: string;
}

export interface OptionPreview {
  style: OptionStyle;
  optionPower: number;
  netPower: number;
  netAir: number;
  netFood: number;
  estimatedDose: number;
  faultRisk: number;
  outdoor: boolean;
  solarGain: number;
}

export interface SaveV1 {
  v: 1;
  profile: { codename: string; avatarId: string };
  xp: number;
  streak: { count: number; lastDay: string; jokerReady: boolean };
  badges: string[];
  best: Record<string, Partial<Record<Difficulty, 0 | 1 | 2 | 3>>>;
  stats: {
    missionsPlayed: number;
    missionsWon: number;
    winStreak: number;
    pressureWinsClean: number;
    welcomeGiven: boolean;
  };
  settings: { muted: boolean; extraTime: boolean };
}
