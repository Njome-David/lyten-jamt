import { describe, it, expect } from 'vitest';
import type {
  Body,
  Difficulty,
  MeterId,
  Meters,
  Archetype,
  OptionStyle,
  SolarLevel,
  MissionTemplateId,
  SiteId,
  Loadout,
  Provenance,
  Snapshot,
  Flare,
  SolarContext,
  RunState,
  Action,
  RunScore,
  OptionPreview,
  StepPlayback,
  SaveV1,
  CreateRunFn,
  ResolveStepFn,
  ScoreRunFn,
  PreviewOptionFn,
  BuildPlaybackFn,
} from '../src/engine/types';

describe('engine contract (T02)', () => {
  it('instantiates valid types according to the L2 contract', () => {
    const body: Body = 'moon';
    const difficulty: Difficulty = 'easy';
    const meterId: MeterId = 'power';
    const archetype: Archetype = 'travel';
    const style: OptionStyle = 'balanced';
    const solarLevel: SolarLevel = 'stormy';
    const missionId: MissionTemplateId = 'relay';
    const siteId: SiteId = 'shackleton';

    expect(body).toBe('moon');
    expect(difficulty).toBe('easy');
    expect(meterId).toBe('power');
    expect(archetype).toBe('travel');
    expect(style).toBe('balanced');
    expect(solarLevel).toBe('stormy');
    expect(missionId).toBe('relay');
    expect(siteId).toBe('shackleton');

    const meters: Meters = {
      power: 70,
      air: 100,
      health: 100,
      food: 100,
    };
    expect(meters.power).toBe(70);

    const loadout: Loadout = {
      crew: 3,
      power: 'panels',
      shield: 'reinforced',
      food: 'rations',
    };
    expect(loadout.crew).toBe(3);

    const provenance: Provenance = {
      source: 'NASA CCMC DONKI',
      url: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR',
      fetchedAt: '2026-11-15T10:00:00Z',
      isLive: false,
    };
    expect(provenance.isLive).toBe(false);

    const snapshot: Snapshot<string> = {
      meta: provenance,
      data: 'sample-payload',
    };
    expect(snapshot.data).toBe('sample-payload');

    const flare: Flare = {
      id: 'FLR-2024-05-14',
      classType: 'X8.7',
      peakTime: '2024-05-14T16:51Z',
      activeRegionNum: 13664,
    };
    expect(flare.classType).toBe('X8.7');

    const solar: SolarContext = {
      level: 'stormy',
      pool: [flare],
      provenance,
    };
    expect(solar.level).toBe('stormy');

    const playback: StepPlayback = {
      turn: 1,
      archetype,
      style,
      outdoor: true,
      durationMs: 3500,
      from: meters,
      to: { ...meters, power: 61 },
      deltas: { power: -9 },
      notes: ['Rover reached waypoint'],
    };
    expect(playback.durationMs).toBe(3500);

    const preview: OptionPreview = {
      style,
      optionPower: -14,
      netPower: -9,
      netAir: -2,
      netFood: -2,
      estimatedDose: 1.5,
      faultRisk: 0.12,
      outdoor: true,
      solarGain: 12,
    };
    expect(preview.netPower).toBe(-9);

    const score: RunScore = {
      stars: 3,
      xp: {
        welcome: 50,
        objective: 100,
        healthyCrew: 80,
        pressureBonus: 50,
        threeStarBonus: 60,
        lessonLearned: 0,
        streakMultiplier: 1.2,
        total: 408,
      },
      incidents: ['Solar flare X8.7 encountered'],
      causeSummary: 'Mission Accomplished with high telemetry integrity.',
      nextTimeTip: 'Try higher challenge difficulty on Mars!',
    };
    expect(score.stars).toBe(3);

    const action: Action = {
      type: 'CHOOSE_OPTION',
      style: 'fast',
    };
    expect(action.type).toBe('CHOOSE_OPTION');

    const save: SaveV1 = {
      v: 1,
      profile: { codename: 'Cmdr. Nova', avatarId: 'avatar-default' },
      xp: 150,
      streak: { count: 1, lastDay: '2026-11-15', jokerReady: true },
      badges: ['first-launch'],
      best: { relay: { easy: 3 } },
      stats: {
        missionsPlayed: 1,
        missionsWon: 1,
        winStreak: 1,
        pressureWinsClean: 1,
        welcomeGiven: true,
      },
      settings: { muted: false, extraTime: false, speed: 1 },
      seen: ['firstLaunch', 'firstLoadout'],
    };
    expect(save.seen).toContain('firstLaunch');
    expect(save.settings.speed).toBe(1);

    // Verify functional contracts / signatures
    const mockCreateRun: CreateRunFn = (p) => ({
      seed: p.seed,
      turn: 1,
      totalSteps: 6,
      body: p.body,
      missionId: p.missionId,
      siteId: p.siteId,
      difficulty: p.difficulty,
      loadout: p.loadout,
      meters: { power: 100, air: 100, health: 100, food: 100 },
      meterHistory: [],
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
      minHealth: 100,
      pendingAdvice: null,
      deliveredAdvice: null,
      activeAlert: null,
      pendingStepContext: null,
      log: [],
      status: 'running',
    });

    const mockResolveStep: ResolveStepFn = (s) => ({ state: s });
    const mockScoreRun: ScoreRunFn = () => score;
    const mockPreviewOption: PreviewOptionFn = () => preview;
    const mockBuildPlayback: BuildPlaybackFn = () => playback;

    const runState: RunState = mockCreateRun(
      {
        seed: 42,
        body: 'moon',
        missionId: 'relay',
        siteId: 'shackleton',
        difficulty: 'easy',
        loadout,
      },
      solar
    );

    expect(runState.seed).toBe(42);
    expect(mockResolveStep(runState, action, solar).state.status).toBe('running');
    expect(mockScoreRun(runState).stars).toBe(3);
    expect(mockPreviewOption(runState, 'travel', 'fast', solar).faultRisk).toBe(0.12);
    expect(mockBuildPlayback(runState, runState).durationMs).toBe(3500);
  });
});
