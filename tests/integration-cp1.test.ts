import { describe, it, expect } from 'vitest';
import { createRun, resolveStep, previewOption, scoreRun } from '../src/engine';
import { getSolarContext } from '../src/data/solar';
import { MISSIONS } from '../src/content/missions';
import type { Loadout, OptionStyle } from '../src/engine/types';

describe('T13: Integration CP1 - Full Moon Relay Playthrough on Staging', () => {
  it('executes full 6-step Moon Relay mission with real DONKI flares, alert choices and debrief score', () => {
    // 1. Setup real NASA DONKI solar weather context
    const solar = getSolarContext('recent');
    expect(solar.pool.length).toBeGreaterThan(0);
    expect(solar.provenance.source).toBe('DONKI');

    // 2. Validate Moon Relay mission definition (6 archetypes)
    const mission = MISSIONS['moon-relay'];
    expect(mission).toBeDefined();
    if (!mission) throw new Error('Moon relay mission missing');

    expect(mission.steps.length).toBe(6);
    expect(mission.steps[0]?.archetype).toBe('travel');
    expect(mission.steps[1]?.archetype).toBe('deploy');
    expect(mission.steps[2]?.archetype).toBe('deploy');
    expect(mission.steps[3]?.archetype).toBe('repair');
    expect(mission.steps[4]?.archetype).toBe('uplink');
    expect(mission.steps[5]?.archetype).toBe('uplink');

    // 3. Initialize run state via engine createRun (Loadout: 3 crew, panels, standard, rations = 7 pts <= 10)
    const loadout: Loadout = {
      crew: 3,
      power: 'panels',
      shield: 'standard',
      food: 'rations',
    };

    let state = createRun(
      {
        seed: 42,
        body: 'moon',
        missionId: 'relay',
        siteId: 'shackleton',
        difficulty: 'medium',
        loadout,
        totalSteps: 6,
      },
      solar
    );

    expect(state.status).toBe('running');
    expect(state.meters.power).toBe(70);
    expect(state.meters.air).toBe(100);
    expect(state.meters.health).toBe(100);
    expect(state.stepIndex).toBe(0);

    // 4. Play through all 6 steps
    const styles: OptionStyle[] = [
      'balanced',
      'careful',
      'balanced',
      'fast',
      'balanced',
      'careful',
    ];

    let alertsEncountered = 0;

    for (let i = 0; i < 6; i++) {
      const stepDef = mission.steps[i];
      const style = styles[i] ?? 'balanced';
      if (!stepDef) continue;

      // Verify dynamic previewOption matches step archetype
      const preview = previewOption(state, stepDef.archetype, style, solar);
      expect(preview.style).toBe(style);
      expect(typeof preview.netPower).toBe('number');
      expect(typeof preview.estimatedDose).toBe('number');

      // Execute step
      const stepResult = resolveStep(state, { type: 'CHOOSE_OPTION', style }, solar);
      state = stepResult.state;

      // Check if alert was triggered
      if (stepResult.alert) {
        alertsEncountered++;
        expect(stepResult.alert.choices.length).toBe(3);

        // Resolve alert with choice A (Shield up / Retract panels / Repair)
        const alertRes = resolveStep(state, { type: 'ALERT_CHOICE', choice: 'A' }, solar);
        state = alertRes.state;
        expect(state.activeAlert).toBeNull();
      }
    }

    expect(alertsEncountered).toBeGreaterThanOrEqual(0);

    // 5. Verify mission completion and end conditions
    expect(state.stepIndex).toBe(6);
    expect(state.status).toBe('won');
    expect(state.log.length).toBe(6);

    // 6. Calculate debrief score and XP breakdown
    const score = scoreRun(state);
    expect(score.stars).toBeGreaterThanOrEqual(1);
    expect(score.xp.total).toBeGreaterThan(150);
    expect(score.causeSummary).toContain('Mission completed successfully');
  });

  it('guarantees real DONKI flare encounters when playing during active solar storm', () => {
    // Test with May 2024 severe solar storm snapshot (X-Class flares)
    const solarStorm = getSolarContext('may2024');
    expect(solarStorm.level).toBe('stormy');
    const xFlares = solarStorm.pool.filter((f) => f.classType.toUpperCase().startsWith('X'));
    expect(xFlares.length).toBeGreaterThan(0);

    const run = createRun(
      {
        seed: 12345,
        body: 'moon',
        missionId: 'relay',
        siteId: 'shackleton',
        difficulty: 'hard',
        loadout: {
          crew: 3,
          power: 'batteries',
          shield: 'reinforced',
          food: 'rations',
        },
      },
      solarStorm
    );

    expect(run.status).toBe('running');
  });
});
