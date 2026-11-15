// tests/ui/hud.test.ts
// Vitest unit tests for T12: Mission HUD (ProgressTrack, MeterBar, OptionCard, AlertOverlay, Mission).

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProgressTrack } from '../../src/ui/components/ProgressTrack';
import { MeterBar } from '../../src/ui/components/MeterBar';
import { OptionCard } from '../../src/ui/components/OptionCard';
import { AlertOverlay } from '../../src/ui/components/AlertOverlay';
import { HudBar } from '../../src/ui/components/HudBar';
import { Mission } from '../../src/ui/screens/Mission';
import type { AlertSpec } from '../../src/engine/types';

describe('T12: ProgressTrack component', () => {
  it('renders 6 steps with completed, active, and upcoming states', () => {
    // Current step 3 out of 6
    const html = renderToStaticMarkup(
      React.createElement(ProgressTrack, { currentStep: 3, totalSteps: 6 })
    );

    expect(html).toContain('data-testid="progress-track"');
    expect(html).toContain('Step 3/6');

    // Step 1 & 2 completed
    expect(html).toContain('data-testid="step-node-1" data-status="completed"');
    expect(html).toContain('data-testid="step-node-2" data-status="completed"');

    // Step 3 active
    expect(html).toContain('data-testid="step-node-3" data-status="active" aria-current="step"');

    // Step 4, 5, 6 upcoming
    expect(html).toContain('data-testid="step-node-4" data-status="upcoming"');
    expect(html).toContain('data-testid="step-node-5" data-status="upcoming"');
    expect(html).toContain('data-testid="step-node-6" data-status="upcoming"');
  });
});

describe('T12: MeterBar component', () => {
  it('renders each of the 4 survival meters with canonical labels and icons', () => {
    const types: Array<'power' | 'air' | 'health' | 'food'> = ['power', 'air', 'health', 'food'];
    types.forEach((type) => {
      const html = renderToStaticMarkup(
        React.createElement(MeterBar, { type, value: 75 })
      );
      expect(html).toContain(`data-testid="meter-${type}"`);
      expect(html).toContain(`data-testid="meter-fill-${type}"`);
      expect(html).toContain('75%');
    });
  });

  it('triggers critical pulse warning when meter value is under 25%', () => {
    const normalHtml = renderToStaticMarkup(
      React.createElement(MeterBar, { type: 'power', value: 50 })
    );
    expect(normalHtml).toContain('data-critical="false"');

    const criticalHtml = renderToStaticMarkup(
      React.createElement(MeterBar, { type: 'power', value: 20 })
    );
    expect(criticalHtml).toContain('data-critical="true"');
  });

  it('renders hover preview chip and floating delta', () => {
    const html = renderToStaticMarkup(
      React.createElement(MeterBar, {
        type: 'air',
        value: 80,
        deltaPreview: -15,
        floatingDelta: +10,
      })
    );
    expect(html).toContain('data-testid="meter-preview-air"');
    expect(html).toContain('-15');
    expect(html).toContain('data-testid="meter-floating-delta-air"');
    expect(html).toContain('+10');
  });
});

describe('T12: OptionCard component', () => {
  it('renders approach card with style title, shortcut key, and delta chips', () => {
    const html = renderToStaticMarkup(
      React.createElement(OptionCard, {
        styleType: 'fast',
        shortcutKey: '1',
        deltas: { power: -18, air: -8, food: -5, faultRisk: 0.25 },
        durationLabel: '2.5s',
        onSelect: () => {},
      })
    );

    expect(html).toContain('data-testid="btn-action-fast"');
    expect(html).toContain('Fast');
    expect(html).toContain('[1]');
    expect(html).toContain('data-testid="chip-power"');
    expect(html).toContain('-18');
    expect(html).toContain('data-testid="chip-air"');
    expect(html).toContain('-8');
    expect(html).toContain('data-testid="chip-food"');
    expect(html).toContain('-5');
    expect(html).toContain('data-testid="chip-risk"');
    expect(html).toContain('Risk 25%');
  });
});

describe('T12: AlertOverlay emergency modal', () => {
  const mockAlert: AlertSpec = {
    kind: 'flare',
    title: 'Solar Flare M2.5 Warning',
    description: 'Energetic solar proton event incoming from active region AR 13664.',
    timed: true,
    durationSec: 5,
    flare: {
      id: 'flare-test-01',
      classType: 'M2.5',
      peakTime: '2026-11-14T08:30Z',
      activeRegionNum: 13664,
    },
    choices: [
      { id: 'A', label: 'Shelter in Habitat', summary: 'High air consumption', tradeoffTag: '-Air' },
      { id: 'B', label: 'Power Secondary Shields', summary: 'High battery drain', tradeoffTag: '-Power' },
      { id: 'C', label: 'Ride it Out', summary: 'Risk radiation sickness', tradeoffTag: '+Dose' },
    ],
  };

  it('renders modal dialog with countdown bar, real DONKI telemetry, and 3 emergency choices', () => {
    const html = renderToStaticMarkup(
      React.createElement(AlertOverlay, {
        alert: mockAlert,
        onSelectChoice: () => {},
      })
    );

    expect(html).toContain('data-testid="alert-overlay"');
    expect(html).toContain('role="alertdialog"');
    expect(html).toContain('Solar Flare M2.5 Warning');
    expect(html).toContain('data-testid="alert-countdown-bar"');
    expect(html).toContain('data-testid="alert-nasa-telemetry"');
    expect(html).toContain('M2.5');
    expect(html).toContain('AR 13664');

    // 3 choices
    expect(html).toContain('data-testid="alert-choice-A"');
    expect(html).toContain('Shelter in Habitat');
    expect(html).toContain('data-testid="alert-choice-B"');
    expect(html).toContain('Power Secondary Shields');
    expect(html).toContain('data-testid="alert-choice-C"');
    expect(html).toContain('Ride it Out');
  });
});

describe('T12: HudBar and Mission full screen integration', () => {
  const meters = { power: 85, air: 90, health: 95, food: 70 };

  it('renders HudBar with progress track, 4 meters, and controls', () => {
    const html = renderToStaticMarkup(
      React.createElement(HudBar, {
        stepIndex: 2,
        totalSteps: 6,
        meters,
        onPause: () => {},
      })
    );

    expect(html).toContain('data-testid="hud-bar"');
    expect(html).toContain('data-testid="progress-track"');
    expect(html).toContain('data-testid="hud-meters"');
    expect(html).toContain('data-testid="btn-pause"');
  });

  it('renders full Mission screen with top HUD, open center, and bottom 3 option cards', () => {
    const html = renderToStaticMarkup(
      React.createElement(Mission, {
        stepIndex: 1,
        totalSteps: 6,
        meters,
        onAction: () => {},
        onPause: () => {},
      })
    );

    expect(html).toContain('data-testid="screen-mission"');
    expect(html).toContain('data-testid="hud-bar"');
    expect(html).toContain('data-testid="option-cards"');
    expect(html).toContain('data-testid="btn-action-fast"');
    expect(html).toContain('data-testid="btn-action-balanced"');
    expect(html).toContain('data-testid="btn-action-careful"');
  });
});
