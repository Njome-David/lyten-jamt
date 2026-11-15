// tests/content/schema.test.ts
// Tests for content schema, missions, sites, archetypes and enabled flags (T07).

import { describe, test, expect } from 'vitest';
import { createRun, resolveStep } from '../../src/engine';
import type { Loadout, SolarContext } from '../../src/engine/types';
import {
  countWords,
  MissionSchema,
  SiteSchema,
  ContentFlagsSchema,
  ARCHETYPES,
  TEMPLATE_ARCHETYPES,
  MISSIONS,
  getMission,
  getEnabledMissions,
  SITES,
  getSite,
  getSites,
  getEnabledSites,
  type Mission,
  type Site,
} from '../../src/content';

describe('countWords helper', () => {
  test('handles empty or whitespace strings', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\t  ')).toBe(0);
  });

  test('counts words correctly with irregular spacing', () => {
    expect(countWords('Deploy radio antenna')).toBe(3);
    expect(countWords('  Rover   traverses   rugged  lunar  craters. ')).toBe(5);
  });
});

describe('Mission Schema & Relay Missions (Moon and Mars)', () => {
  test('all predefined missions pass MissionSchema validation', () => {
    for (const [key, mission] of Object.entries(MISSIONS)) {
      expect(() => MissionSchema.parse(mission), `Mission ${key} should validate`).not.toThrow();
    }
  });

  test('Moon Relay and Mars Relay exist in MISSIONS', () => {
    const moonRelay = getMission('moon', 'relay');
    const marsRelay = getMission('mars', 'relay');

    expect(moonRelay).toBeDefined();
    expect(moonRelay?.title).toBe('Moon Relay');
    expect(moonRelay?.body).toBe('moon');
    expect(moonRelay?.templateId).toBe('relay');
    expect(moonRelay?.enabled).toBe(true);

    expect(marsRelay).toBeDefined();
    expect(marsRelay?.title).toBe('Mars Relay');
    expect(marsRelay?.body).toBe('mars');
    expect(marsRelay?.templateId).toBe('relay');
    expect(marsRelay?.enabled).toBe(true);
  });

  test('every mission objective is 20 words or fewer (grade 3-6 specification)', () => {
    for (const mission of Object.values(MISSIONS)) {
      const words = countWords(mission.objective);
      expect(words, `Objective for ${mission.id} exceeds 20 words: "${mission.objective}"`).toBeLessThanOrEqual(20);
    }
  });

  test('every mission step text is 25 words or fewer (grade 3-6 specification)', () => {
    for (const mission of Object.values(MISSIONS)) {
      expect(mission.steps).toHaveLength(6);
      for (const step of mission.steps) {
        const words = countWords(step.text);
        expect(
          words,
          `Step ${step.stepIndex} in ${mission.id} exceeds 25 words: "${step.text}"`
        ).toBeLessThanOrEqual(25);
      }
    }
  });

  test('each mission steps match its template archetype sequence in order', () => {
    for (const mission of Object.values(MISSIONS)) {
      const expected = TEMPLATE_ARCHETYPES[mission.templateId];
      const archetypes = mission.steps.map((s) => s.archetype);
      expect(archetypes).toEqual(expected);
    }
  });

  describe('5 Moon Missions (T17)', () => {
    const moonTemplates = ['relay', 'core', 'seismic', 'mapper', 'garden'] as const;

    test('all 5 Moon missions exist, are enabled and validate', () => {
      const moonMissions = getEnabledMissions('moon');
      expect(moonMissions).toHaveLength(5);

      for (const t of moonTemplates) {
        const m = getMission('moon', t);
        expect(m, `Moon mission for template ${t} must exist`).toBeDefined();
        expect(m?.body).toBe('moon');
        expect(m?.templateId).toBe(t);
        expect(m?.enabled).toBe(true);
        expect(m?.steps).toHaveLength(6);
      }
    });

    test('Moon mission titles match SPEC.md section 5.1', () => {
      expect(getMission('moon', 'relay')?.title).toBe('Moon Relay');
      expect(getMission('moon', 'core')?.title).toBe('Deep Core Samples');
      expect(getMission('moon', 'seismic')?.title).toBe('Moonquake Station');
      expect(getMission('moon', 'mapper')?.title).toBe('Moon Ice Mapper');
      expect(getMission('moon', 'garden')?.title).toBe('Moon Garden');
    });

    test('Moon Garden references real NASA OSDR study OSD-251', () => {
      const garden = getMission('moon', 'garden');
      expect(garden?.osdrStudyId).toBe('OSD-251');
    });

    test('all 5 Moon missions are playable through 6 steps by a bot without crashing', () => {
      const dummySolar: SolarContext = {
        level: 'active',
        pool: [],
        provenance: { source: 'NASA DONKI', url: '', fetchedAt: '2026-11-15T00:00:00Z', isLive: false },
      };
      const loadout: Loadout = { crew: 3, power: 'panels', shield: 'standard', food: 'rations' };

      for (const t of moonTemplates) {
        let state = createRun(
          { seed: 42, body: 'moon', missionId: t, siteId: 'shackleton', difficulty: 'easy', loadout },
          dummySolar
        );

        for (let step = 0; step < 6; step++) {
          if (state.status !== 'running') break;
          const result = resolveStep(state, { type: 'CHOOSE_OPTION', style: 'balanced' }, dummySolar);
          state = result.state;
        }

        expect(state.status).toMatch(/running|won|lost/);
        expect(state.meterHistory.length).toBeGreaterThan(0);
      }
    });
  });

  test('rejects mission with objective over 20 words', () => {
    const valid = getMission('moon', 'relay')!;
    const invalid: Mission = {
      ...valid,
      objective:
        'This is an excessively long and unnecessarily verbose objective description that clearly exceeds twenty words in total length for this test case.',
    };
    expect(() => MissionSchema.parse(invalid)).toThrow(/Mission objective must not exceed 20 words/);
  });

  test('rejects mission with step text over 25 words', () => {
    const valid = getMission('moon', 'relay')!;
    const invalidSteps = [...valid.steps];
    const firstStep = invalidSteps[0]!;
    invalidSteps[0] = {
      ...firstStep,
      text: 'This is a deliberately prolonged and overly complicated step narrative text designed to test the word limit threshold of twenty-five words exactly beyond the acceptable grade level range.',
    };
    const invalid: Mission = { ...valid, steps: invalidSteps };
    expect(() => MissionSchema.parse(invalid)).toThrow(/Step text must not exceed 25 words/);
  });

  test('rejects mission with mismatching archetype sequence', () => {
    const valid = getMission('moon', 'relay')!;
    const invalidSteps = [...valid.steps];
    const firstStep = invalidSteps[0]!;
    invalidSteps[0] = { ...firstStep, archetype: 'drill' };
    const invalid: Mission = { ...valid, steps: invalidSteps };
    expect(() => MissionSchema.parse(invalid)).toThrow(/Step 1 archetype must be 'travel'/);
  });

  test('rejects mission with fewer than 6 steps', () => {
    const valid = getMission('moon', 'relay')!;
    const invalid: Mission = {
      ...valid,
      steps: valid.steps.slice(0, 5),
    };
    expect(() => MissionSchema.parse(invalid)).toThrow();
  });
});

describe('Sites Schema & Site Definitions', () => {
  test('all 4 required sites exist and validate against SiteSchema', () => {
    const requiredSites = ['shackleton', 'tranquillitatis', 'jezero', 'gale'] as const;
    for (const siteId of requiredSites) {
      const site = getSite(siteId);
      expect(site, `Site ${siteId} must be defined`).toBeDefined();
      expect(() => SiteSchema.parse(site)).not.toThrow();
      expect(site?.enabled).toBe(true);
      expect(site?.facts).toHaveLength(3);
    }
  });

  test('getSites filters correctly by body', () => {
    const moonSites = getSites('moon');
    const marsSites = getSites('mars');
    expect(moonSites.map((s) => s.id)).toEqual(['shackleton', 'tranquillitatis']);
    expect(marsSites.map((s) => s.id)).toEqual(['jezero', 'gale']);
  });

  test('rejects site with invalid fact count', () => {
    const shackleton = getSite('shackleton')!;
    const invalid: Site = {
      ...shackleton,
      facts: shackleton.facts.slice(0, 2),
    };
    expect(() => SiteSchema.parse(invalid)).toThrow();
  });
});

describe('Enabled Flags (Missions and Sites)', () => {
  test('getEnabledMissions returns only missions with enabled: true', () => {
    const enabled = getEnabledMissions();
    expect(enabled.length).toBeGreaterThan(0);
    for (const m of enabled) {
      expect(m.enabled).toBe(true);
    }
  });

  test('getEnabledMissions can filter by celestial body', () => {
    const moon = getEnabledMissions('moon');
    const mars = getEnabledMissions('mars');
    expect(moon.every((m) => m.body === 'moon')).toBe(true);
    expect(mars.every((m) => m.body === 'mars')).toBe(true);
    expect(moon.some((m) => m.templateId === 'relay')).toBe(true);
    expect(mars.some((m) => m.templateId === 'relay')).toBe(true);
  });

  test('disabling a mission excludes it from getEnabledMissions', () => {
    const mission = MISSIONS['moon-relay']!;
    const original = mission.enabled;
    try {
      mission.enabled = false;
      const filtered = getEnabledMissions('moon');
      expect(filtered.find((m) => m.id === 'moon-relay')).toBeUndefined();
    } finally {
      mission.enabled = original;
    }
  });

  test('disabling a site excludes it from getEnabledSites', () => {
    const site = SITES.shackleton;
    const original = site.enabled;
    try {
      site.enabled = false;
      const filtered = getEnabledSites('moon');
      expect(filtered.find((s) => s.id === 'shackleton')).toBeUndefined();
    } finally {
      site.enabled = original;
    }
  });

  test('ContentFlagsSchema validates flag structures', () => {
    const valid = {
      missionsEnabled: true,
      sitesEnabled: true,
      enabledTemplates: { relay: true, core: false, seismic: false, mapper: false, garden: false },
      enabledSites: { shackleton: true, tranquillitatis: true, jezero: true, gale: true },
    };
    expect(() => ContentFlagsSchema.parse(valid)).not.toThrow();
  });
});

describe('Archetypes Definition', () => {
  test('all 6 action archetypes are defined with label and description', () => {
    const archetypes = ['travel', 'deploy', 'drill', 'experiment', 'repair', 'uplink'] as const;
    for (const arch of archetypes) {
      expect(ARCHETYPES[arch]).toBeDefined();
      expect(ARCHETYPES[arch].label).toBeTruthy();
      expect(ARCHETYPES[arch].description).toBeTruthy();
    }
  });

  test('all 5 mission templates have exactly 6 archetypes in order', () => {
    const templates = ['relay', 'core', 'seismic', 'mapper', 'garden'] as const;
    for (const t of templates) {
      expect(TEMPLATE_ARCHETYPES[t]).toBeDefined();
      expect(TEMPLATE_ARCHETYPES[t]).toHaveLength(6);
    }
  });
});
