// tests/judge/judge-mode.test.ts
// Vitest tests for Space Apps Challenge Judge Mode (T21).
// Tests demo preset, event forcing, short run, May 2024 storm, Science Map modal, and JudgePanel.

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  DEFAULT_DEMO_PRESET,
  DEMO_PROFILE,
  type JudgeState,
} from '../../src/judge/types';
import { buildForcedAlert } from '../../src/judge/events';
import { JudgePanel } from '../../src/judge/JudgePanel';
import { ScienceMapModal } from '../../src/judge/ScienceMapModal';
import { getSolarContext } from '../../src/data/solar';

describe('T21: Judge Mode Presets and Data Constants', () => {
  it('defines valid 1-click Demo Preset configured for quick jury testing', () => {
    expect(DEFAULT_DEMO_PRESET.destination).toBe('moon');
    expect(DEFAULT_DEMO_PRESET.site).toBe('shackleton');
    expect(DEFAULT_DEMO_PRESET.missionId).toBe('relay');
    expect(DEFAULT_DEMO_PRESET.difficulty).toBe('easy');
    expect(DEFAULT_DEMO_PRESET.seed).toBe(1337);
    expect(DEFAULT_DEMO_PRESET.totalSteps).toBe(3); // Short run for jury evaluation
    expect(DEFAULT_DEMO_PRESET.loadout.crew).toBe(3);
  });

  it('defines valid in-memory Demo Profile without touching storage', () => {
    expect(DEMO_PROFILE.callsign).toBe('Cmdr. SpaceApps');
    expect(DEMO_PROFILE.rank).toBe('Mission Director');
    expect(DEMO_PROFILE.xp).toBeGreaterThan(1000);
    expect(DEMO_PROFILE.unlockedBadges).toContain('artemis');
    expect(DEMO_PROFILE.unlockedBadges).toContain('apollo');
  });
});

describe('T21: Event Forcing Logic (buildForcedAlert)', () => {
  const solar = getSolarContext('recent');

  it('builds an X-Class solar flare alert when forced', () => {
    const alert = buildForcedAlert('flare-x', solar, 'easy');
    expect(alert.kind).toBe('flare');
    expect(alert.title).toContain('X-CLASS');
    expect(alert.timed).toBe(true);
    expect(alert.choices).toHaveLength(3);
  });

  it('builds an M-Class solar storm alert when forced', () => {
    const alert = buildForcedAlert('flare-m', solar, 'easy');
    expect(alert.kind).toBe('flare');
    expect(alert.title).toContain('M-CLASS');
    expect(alert.choices).toHaveLength(3);
  });

  it('builds a Martian dust storm alert when forced', () => {
    const alert = buildForcedAlert('dust', solar, 'easy');
    expect(alert.kind).toBe('dust');
    expect(alert.title).toContain('DUST STORM');
    expect(alert.choices).toHaveLength(3);
  });

  it('builds a hardware fault alert when forced', () => {
    const alert = buildForcedAlert('fault', solar, 'easy');
    expect(alert.kind).toBe('fault');
    expect(alert.title).toContain('EQUIPMENT FAULT');
    expect(alert.choices).toHaveLength(3);
  });

  it('builds a power blackout alert when forced', () => {
    const alert = buildForcedAlert('blackout', solar, 'easy');
    expect(alert.kind).toBe('fault');
    expect(alert.title).toContain('BLACKOUT');
    expect(alert.timed).toBe(true);
    expect(alert.choices).toHaveLength(3);
  });
});

describe('T21: May 2024 Historic Solar Storm Replay', () => {
  it('switches solar context to historic May 2024 DONKI storm dataset', () => {
    const may2024Solar = getSolarContext('may2024');
    expect(may2024Solar.mode).toBe('may2024');
    // May 2024 had extreme solar activity
    expect(may2024Solar.level).toBe('stormy');
    expect(may2024Solar.pool.length).toBeGreaterThan(0);
    // At least one X-class flare in May 2024 dataset (including X12.0)
    const hasX = may2024Solar.pool.some((f) => f.classType.startsWith('X'));
    expect(hasX).toBe(true);
  });
});

describe('T21: JudgePanel Component', () => {
  const baseState: JudgeState = {
    enabled: true,
    isCollapsed: false,
    shortRun: true,
    solarMode: 'recent',
    speed: 1,
    forcedEvent: null,
    isScienceMapOpen: false,
    demoProfileActive: false,
  };

  it('renders nothing when judge mode is disabled', () => {
    const html = renderToStaticMarkup(
      React.createElement(JudgePanel, {
        state: { ...baseState, enabled: false },
        onPlayDemo: () => {},
        onToggleCollapse: () => {},
        onSetShortRun: () => {},
        onSetSolarMode: () => {},
        onSetSpeed: () => {},
        onSetForcedEvent: () => {},
        onSetIsScienceMapOpen: () => {},
        onSetDemoProfileActive: () => {},
      })
    );
    expect(html).toBe('');
  });

  it('renders collapsed pill button when isCollapsed is true', () => {
    const html = renderToStaticMarkup(
      React.createElement(JudgePanel, {
        state: { ...baseState, isCollapsed: true },
        onPlayDemo: () => {},
        onToggleCollapse: () => {},
        onSetShortRun: () => {},
        onSetSolarMode: () => {},
        onSetSpeed: () => {},
        onSetForcedEvent: () => {},
        onSetIsScienceMapOpen: () => {},
        onSetDemoProfileActive: () => {},
      })
    );
    expect(html).toContain('data-testid="judge-panel"');
    expect(html).toContain('data-testid="btn-judge-expand"');
    expect(html).toContain('JUDGE MODE');
  });

  it('renders full inspection controls when expanded', () => {
    const html = renderToStaticMarkup(
      React.createElement(JudgePanel, {
        state: baseState,
        onPlayDemo: () => {},
        onToggleCollapse: () => {},
        onSetShortRun: () => {},
        onSetSolarMode: () => {},
        onSetSpeed: () => {},
        onSetForcedEvent: () => {},
        onSetIsScienceMapOpen: () => {},
        onSetDemoProfileActive: () => {},
      })
    );
    expect(html).toContain('data-testid="judge-panel-content"');
    expect(html).toContain('data-testid="btn-judge-play-demo"');
    expect(html).toContain('data-testid="btn-judge-short-run"');
    expect(html).toContain('data-testid="btn-judge-may2024"');
    expect(html).toContain('data-testid="select-force-event"');
    expect(html).toContain('data-testid="judge-speed-controls"');
    expect(html).toContain('data-testid="btn-speed-1x"');
    expect(html).toContain('data-testid="btn-speed-2x"');
    expect(html).toContain('data-testid="btn-speed-3x"');
    expect(html).toContain('data-testid="btn-judge-demo-profile"');
    expect(html).toContain('data-testid="btn-open-science-map"');
    expect(html).toContain('data-testid="btn-judge-collapse"');
  });
});

describe('T21: ScienceMapModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const html = renderToStaticMarkup(
      React.createElement(ScienceMapModal, { isOpen: false, onClose: () => {} })
    );
    expect(html).toBe('');
  });

  it('renders full NASA Data Passport when isOpen is true', () => {
    const html = renderToStaticMarkup(
      React.createElement(ScienceMapModal, { isOpen: true, onClose: () => {} })
    );
    expect(html).toContain('data-testid="science-map-modal"');
    expect(html).toContain('NASA Science &amp; Data Passport');
    expect(html).toContain('REAL NASA DATA');
    expect(html).toContain('GAME RULE');
    expect(html).toContain('data-testid="dataset-card-donki-flr"');
    expect(html).toContain('data-testid="dataset-card-donki-may2024"');
    expect(html).toContain('data-testid="dataset-card-osdr-biology"');
    expect(html).toContain('data-testid="dataset-card-pds-planetary"');
    expect(html).toContain('data-testid="btn-close-science-map"');
  });
});
