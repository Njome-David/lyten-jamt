/**
 * src/engine/types.ts - Junior Astronaut Mission Trainer (Contrat moteur gelé T02)
 *
 * Équipe LYTEN - NASA Space Apps Challenge 2026
 * Statut: GELÉ (V1.2 / Périmètre L2).
 * Toute modification ultérieure doit être notée dans CHANGELOG-CONTRACT.md.
 * Règle de pureté: Strictement aucun import React, DOM, Date, Math.random.
 */

// ============================================================================
// 1. Types Fondamentaux de la Simulation
// ============================================================================

export type Body = 'moon' | 'mars';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type MeterId = 'power' | 'air' | 'health' | 'food';

/** Jauges vitales clampées de 0 à 100 */
export type Meters = Record<MeterId, number>;

export type Archetype =
  | 'travel'
  | 'deploy'
  | 'drill'
  | 'experiment'
  | 'repair'
  | 'uplink';

export type OptionStyle = 'fast' | 'balanced' | 'careful';

export type SolarLevel = 'calm' | 'active' | 'stormy';

/**
 * Templates de mission.
 * Sous périmètre L2: 'relay', 'core', 'garden' sont actifs en jeu.
 * 'seismic' et 'mapper' sont conservés pour compatibilité de contrat.
 */
export type MissionTemplateId =
  | 'relay'
  | 'core'
  | 'seismic'
  | 'mapper'
  | 'garden';

export type SiteId =
  | 'shackleton'
  | 'tranquillitatis'
  | 'jezero'
  | 'gale';

export interface Loadout {
  crew: 2 | 3 | 4;
  power: 'panels' | 'batteries';
  shield: 'standard' | 'reinforced';
  food: 'rations' | 'hydroponics';
}

// ============================================================================
// 2. Traçabilité des Données NASA (Best Use of Data)
// ============================================================================

export interface Provenance {
  source: string; // Ex: "NASA CCMC DONKI", "NASA OSDR"
  url: string;
  fetchedAt: string; // Horodatage ISO (ex: "2026-11-15T10:00:00Z")
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
  mode?: 'recent' | 'may2024';
}

// ============================================================================
// 3. Options d'Étape & Événements
// ============================================================================

export interface StepOptionDef {
  style: OptionStyle;
  power: number; // Négatif = dépense par étape avant modificateurs
  air: number;
  food: number;
  faultRisk: number; // 0..1 probabilité d'avarie matérielle ce tour-ci
  outdoor: boolean;
}

export type EventKind = 'flare' | 'dust' | 'fault' | 'blackout' | 'none';

export type ForcedEventKind =
  | 'flare-x'
  | 'flare-m'
  | 'dust'
  | 'fault'
  | 'blackout';

export interface AlertChoiceSpec {
  id: 'A' | 'B' | 'C';
  label: string;
  summary: string;
  tradeoffTag: string;
}

export interface AlertSpec {
  kind: 'flare' | 'dust' | 'fault';
  title: string;
  description: string;
  timed: boolean;
  durationSec: number;
  flare?: Flare;
  flareProvenance?: Provenance;
  baseDoseThisTurn?: number;
  choices: [AlertChoiceSpec, AlertChoiceSpec, AlertChoiceSpec];
}

// ============================================================================
// 4. État de la Mission (RunState) & Journal de Vol
// ============================================================================

export interface TurnLogEntry {
  turn: number;
  stepNumber?: number;
  archetype?: Archetype;
  optionStyle: OptionStyle;
  event: EventKind;
  flare?: Flare;
  alertChoice?: 'A' | 'B' | 'C' | 'EXPIRED';
  meters: Meters;
  notes: string[];
}

export interface RunFlags {
  nightActive: boolean;
  dustTurnsLeft: number;
  panelsRetractedTurnsLeft: number;
  blackoutTurnsLeft: number;
  panelDamage: number;
  extraFaultRisk: number;
  radioNoiseActive: boolean;
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
  initialMeters?: Meters;
  meterHistory: Array<{ label: string; meters: Meters }>;
  stepIndex: number;
  lowPowerTurns: number;
  flags: RunFlags;
  alertsSeen: number;
  timedAlertsSeen: number;
  pressureWins: number;
  pressureFails: number;
  minHealth: number;
  pendingAdvice: {
    arrivesOnTurn: number;
    text: string;
    requestedOnTurn: number;
  } | null;
  deliveredAdvice: { turn: number; text: string } | null;
  activeAlert: AlertSpec | null;
  pendingStepContext: {
    optionStyle: OptionStyle;
    archetype: Archetype;
    baseDose: number;
    notes: string[];
  } | null;
  log: TurnLogEntry[];
  status: 'running' | 'won' | 'lost';
  lossReason?: 'air' | 'food' | 'health' | 'power';
}

// ============================================================================
// 5. Actions Utilisateur
// ============================================================================

export type Action =
  | { type: 'CHOOSE_OPTION'; style: OptionStyle; adviceHintPool?: string[] }
  | { type: 'ALERT_CHOICE'; choice: 'A' | 'B' | 'C' | 'EXPIRED' }
  | { type: 'ASK_MISSION_CONTROL'; hintText?: string };

// ============================================================================
// 6. Score, XP & Progression
// ============================================================================

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

// ============================================================================
// 7. Aperçu des Coûts & Animation Diégétique (PRESENTATION.md)
// ============================================================================

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

export interface StepPlayback {
  turn: number;
  archetype: Archetype;
  style: OptionStyle;
  outdoor: boolean;
  durationMs: number;
  from: Meters;
  to: Meters;
  deltas: Partial<Record<MeterId, number>>;
  event?: { kind: EventKind; timed: boolean; flare?: Flare };
  notes: string[];
}

// ============================================================================
// 8. Sauvegarde Locale du Joueur (SaveV1)
// ============================================================================

export interface SaveProfile {
  codename: string;
  avatarId: string;
}

export interface SaveStreak {
  count: number;
  lastDay: string; // Format YYYY-MM-DD
  jokerReady: boolean;
}

export interface SaveStats {
  missionsPlayed: number;
  missionsWon: number;
  winStreak: number;
  pressureWinsClean: number;
  welcomeGiven: boolean;
}

export interface SaveSettings {
  muted: boolean;
  extraTime: boolean;
  speed: 1 | 2 | 3;
}

export interface SaveV1 {
  v: 1;
  profile: SaveProfile;
  xp: number;
  streak: SaveStreak;
  badges: string[];
  best: Record<string, Partial<Record<Difficulty, 0 | 1 | 2 | 3>>>;
  stats: SaveStats;
  settings: SaveSettings;
  seen: string[];
}

// ============================================================================
// 9. Signatures Fonctionnelles Pures du Moteur
// ============================================================================

export type CreateRunFn = (
  params: {
    seed: number;
    body: Body;
    missionId: MissionTemplateId;
    siteId: SiteId;
    difficulty: Difficulty;
    loadout: Loadout;
    totalSteps?: number;
  },
  solar: SolarContext
) => RunState;

export type ResolveStepFn = (
  state: RunState,
  action: Action,
  solar: SolarContext
) => { state: RunState; alert?: AlertSpec };

export type ScoreRunFn = (state: RunState) => RunScore;

export type PreviewOptionFn = (
  state: RunState,
  archetype: Archetype,
  style: OptionStyle,
  solar: SolarContext
) => OptionPreview;

export type BuildPlaybackFn = (
  prev: RunState,
  next: RunState,
  archetype?: Archetype,
  style?: OptionStyle,
  solar?: SolarContext,
  durationMs?: number
) => StepPlayback;
