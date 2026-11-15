import { describe, it, expect } from 'vitest';
import {
  createRun,
  resolveStep,
  previewOption,
  scoreRun,
  buildPlayback,
  mulberry32,
  getEligibleFlares,
  createFallbackFlare,
  createFlareAlert,
  createDustAlert,
} from '../src/engine';
import type { Loadout, SolarContext } from '../src/engine/types';

describe('T08: Engine events, alerts, delay, scoring & playback', () => {
  const dummySolar: SolarContext = {
    level: 'active',
    pool: [
      {
        id: 'FLR-1',
        classType: 'M2.5',
        peakTime: '2024-05-10T12:00Z',
        activeRegionNum: 13664,
      },
      {
        id: 'FLR-2',
        classType: 'X1.2',
        peakTime: '2024-05-11T14:30Z',
        activeRegionNum: 13664,
      },
      {
        id: 'FLR-3',
        classType: 'C3.0',
        peakTime: '2024-05-12T08:00Z',
        activeRegionNum: 13665,
      },
    ],
    provenance: {
      source: 'NASA DONKI',
      url: 'https://donki.nasa.gov',
      fetchedAt: '2026-11-15T00:00:00Z',
      isLive: false,
    },
  };

  const standardLoadout: Loadout = {
    crew: 3,
    power: 'panels',
    shield: 'standard',
    food: 'rations',
  };

  it('1. Deterministic simulation: same seed, actions and solar produce identical states', () => {
    const seed = 42;
    const run1 = createRun(
      {
        seed,
        body: 'moon',
        missionId: 'relay',
        siteId: 'shackleton',
        difficulty: 'medium',
        loadout: standardLoadout,
      },
      dummySolar
    );
    const run2 = createRun(
      {
        seed,
        body: 'moon',
        missionId: 'relay',
        siteId: 'shackleton',
        difficulty: 'medium',
        loadout: standardLoadout,
      },
      dummySolar
    );

    const res1 = resolveStep(run1, { type: 'CHOOSE_OPTION', style: 'balanced' }, dummySolar);
    const res2 = resolveStep(run2, { type: 'CHOOSE_OPTION', style: 'balanced' }, dummySolar);

    expect(res1.state.meters).toEqual(res2.state.meters);
    expect(res1.state.turn).toBe(res2.state.turn);
    expect(res1.state.stepIndex).toBe(res2.state.stepIndex);
  });

  it('2. Mars communication delay: Mission control advice arrives with delayed turns', () => {
    const run = createRun(
      {
        seed: 1234,
        body: 'mars',
        missionId: 'relay',
        siteId: 'jezero',
        difficulty: 'medium', // Mars delay for medium is 2 turns
        loadout: standardLoadout,
      },
      dummySolar
    );

    const askRes = resolveStep(
      run,
      { type: 'ASK_MISSION_CONTROL', hintText: 'Save battery!' },
      dummySolar
    );
    expect(askRes.state.pendingAdvice).toBeDefined();
    expect(askRes.state.pendingAdvice?.arrivesOnTurn).toBe(run.turn + 2);
    expect(askRes.state.deliveredAdvice).toBeNull();

    // Advance 1 step
    const step1 = resolveStep(
      askRes.state,
      { type: 'CHOOSE_OPTION', style: 'fast' },
      dummySolar
    );
    expect(step1.state.deliveredAdvice).toBeNull();

    // Advance 2nd step -> advice should be delivered
    const step2 = resolveStep(
      step1.state,
      { type: 'CHOOSE_OPTION', style: 'fast' },
      dummySolar
    );
    expect(step2.state.deliveredAdvice?.text).toBe('Save battery!');
    expect(step2.state.pendingAdvice).toBeNull();
  });

  it('3. Moon communication delay: Mission control advice arrives immediately', () => {
    const run = createRun(
      {
        seed: 1234,
        body: 'moon',
        missionId: 'relay',
        siteId: 'shackleton',
        difficulty: 'medium',
        loadout: standardLoadout,
      },
      dummySolar
    );

    const askRes = resolveStep(
      run,
      { type: 'ASK_MISSION_CONTROL', hintText: 'Maintain lunar rover.' },
      dummySolar
    );
    expect(askRes.state.deliveredAdvice?.text).toBe('Maintain lunar rover.');
    expect(askRes.state.pendingAdvice).toBeNull();
  });

  it('4. Handles empty solar pool without crash (fallback flare created)', () => {
    const emptySolar: SolarContext = {
      ...dummySolar,
      pool: [],
    };

    const eligible = getEligibleFlares(emptySolar.pool, 'M');
    expect(eligible.length).toBe(0);

    const rng = mulberry32(999);
    const fallback = createFallbackFlare('M', rng);
    expect(fallback).toBeDefined();
    expect(fallback.id).toContain('FLR-SIM');
    expect(fallback.classType).toBeDefined();
  });

  it('5. Timed alert expiration triggers EXPIRED choice and increments pressureFails', () => {
    const alert = createFlareAlert(
      { id: 'FLR-X', classType: 'X2.0', peakTime: '2026-11-15T00:00Z', activeRegionNum: 100 },
      'medium',
      10,
      true
    );

    const run = createRun(
      {
        seed: 55,
        body: 'moon',
        missionId: 'relay',
        siteId: 'shackleton',
        difficulty: 'medium',
        loadout: standardLoadout,
      },
      dummySolar
    );
    run.activeAlert = alert;

    const resolveExpired = resolveStep(
      run,
      { type: 'ALERT_CHOICE', choice: 'EXPIRED' },
      dummySolar
    );

    expect(resolveExpired.state.pressureFails).toBe(1);
    expect(resolveExpired.state.activeAlert).toBeNull();
  });

  it('6. Alert resolution with choice A grants pressureWins on timed alerts', () => {
    const alert = createDustAlert('medium', true);

    const run = createRun(
      {
        seed: 88,
        body: 'mars',
        missionId: 'relay',
        siteId: 'jezero',
        difficulty: 'medium',
        loadout: standardLoadout,
      },
      dummySolar
    );
    run.activeAlert = alert;

    const resolveA = resolveStep(
      run,
      { type: 'ALERT_CHOICE', choice: 'A' },
      dummySolar
    );

    expect(resolveA.state.pressureWins).toBe(1);
    expect(resolveA.state.pressureFails).toBe(0);
    expect(resolveA.state.flags.panelsRetractedTurnsLeft).toBe(2);
  });

  it('7. buildPlayback computes correct gauge deltas and animation duration', () => {
    const prev = createRun(
      {
        seed: 1,
        body: 'moon',
        missionId: 'relay',
        siteId: 'shackleton',
        difficulty: 'easy',
        loadout: standardLoadout,
      },
      dummySolar
    );
    const next = {
      ...prev,
      turn: 2,
      meters: {
        ...prev.meters,
        power: prev.meters.power - 12,
        health: prev.meters.health - 5,
      },
    };

    const playback = buildPlayback(prev, next, 'drill', 'fast');
    expect(playback.turn).toBe(2);
    expect(playback.durationMs).toBe(2500); // fast duration
    expect(playback.deltas.power).toBe(-12);
    expect(playback.deltas.health).toBe(-5);
    expect(playback.outdoor).toBe(true); // drill is outdoor
  });

  it('8. scoreRun calculates stars, XP breakdown and incidents', () => {
    const run = createRun(
      {
        seed: 777,
        body: 'moon',
        missionId: 'relay',
        siteId: 'shackleton',
        difficulty: 'easy',
        loadout: standardLoadout,
      },
      dummySolar
    );

    run.status = 'won';
    run.stepIndex = 6;
    run.minHealth = 85;
    run.meters = { power: 60, air: 70, health: 90, food: 80 };
    run.pressureWins = 2;
    run.pressureFails = 0;

    const score = scoreRun(run);
    expect(score.stars).toBe(3);
    expect(score.xp.welcome).toBe(50);
    expect(score.xp.objective).toBe(100);
    expect(score.xp.healthyCrew).toBe(72);
    expect(score.xp.pressureBonus).toBe(50);
    expect(score.xp.threeStarBonus).toBe(60);
    expect(score.xp.total).toBe(332);
  });

  it('9. previewOption projects expected values accurately', () => {
    const run = createRun(
      {
        seed: 10,
        body: 'moon',
        missionId: 'relay',
        siteId: 'shackleton',
        difficulty: 'medium',
        loadout: standardLoadout,
      },
      dummySolar
    );

    const preview = previewOption(run, 'travel', 'fast', dummySolar);
    expect(preview.style).toBe('fast');
    expect(preview.outdoor).toBe(true);
    expect(typeof preview.netPower).toBe('number');
    expect(typeof preview.netAir).toBe('number');
    expect(typeof preview.netFood).toBe('number');
    expect(typeof preview.estimatedDose).toBe('number');
    expect(preview.faultRisk).toBeGreaterThan(0);
  });
});
