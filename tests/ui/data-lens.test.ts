// tests/ui/data-lens.test.ts
// Vitest unit tests for T20: Data Chips (REAL / GAME RULE), Data Loupe, and NASA Data Passport.

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DataChip } from '../../src/ui/components/DataChip';
import { DataLensOverlay } from '../../src/ui/components/DataLensOverlay';
import { DataPassportModal } from '../../src/ui/components/DataPassportModal';
import { HudBar } from '../../src/ui/components/HudBar';
import { OptionCard } from '../../src/ui/components/OptionCard';
import { Title } from '../../src/ui/screens/Title';
import { PauseOverlay } from '../../src/ui/components/PauseOverlay';

describe('T20: DataChip component', () => {
  it('renders REAL chip with cyan styling and NASA icon', () => {
    const html = renderToStaticMarkup(
      React.createElement(DataChip, { origin: 'REAL', label: 'DONKI FLR' })
    );

    expect(html).toContain('data-testid="data-chip-real"');
    expect(html).toContain('DONKI FLR');
    expect(html).toContain('🛰️');
    expect(html).toContain('var(--chip-real-border');
    expect(html).toContain('var(--chip-real-ink');
  });

  it('renders GAME chip with amber styling and simulation icon', () => {
    const html = renderToStaticMarkup(
      React.createElement(DataChip, { origin: 'GAME', label: 'GAME RULE' })
    );

    expect(html).toContain('data-testid="data-chip-game"');
    expect(html).toContain('GAME RULE');
    expect(html).toContain('⚙️');
    expect(html).toContain('var(--chip-game-border');
    expect(html).toContain('var(--chip-game-ink');
  });

  it('renders clickable link when url is supplied', () => {
    const html = renderToStaticMarkup(
      React.createElement(DataChip, {
        origin: 'REAL',
        url: 'https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR',
      })
    );

    expect(html).toContain('<a');
    expect(html).toContain('href="https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR"');
    expect(html).toContain('target="_blank"');
  });
});

describe('T20: Data Loupe integration in HUD and OptionCard', () => {
  const meters = { power: 80, air: 90, health: 85, food: 75 };

  it('displays GAME tags on resource meters and REAL tag on solar weather when loupe is active', () => {
    const inactiveHtml = renderToStaticMarkup(
      React.createElement(HudBar, {
        stepIndex: 1,
        totalSteps: 6,
        meters,
        isDataLoupeActive: false,
        onPause: () => {},
      })
    );
    expect(inactiveHtml).not.toContain('data-testid="data-chip-game"');
    expect(inactiveHtml).not.toContain('data-testid="data-chip-real"');

    const activeHtml = renderToStaticMarkup(
      React.createElement(HudBar, {
        stepIndex: 1,
        totalSteps: 6,
        meters,
        isDataLoupeActive: true,
        onPause: () => {},
        onToggleDataLoupe: () => {},
      })
    );
    expect(activeHtml).toContain('data-testid="data-chip-game"');
    expect(activeHtml).toContain('data-testid="data-chip-real"');
    expect(activeHtml).toContain('DONKI');
  });

  it('OptionCard renders RULE tag when showDataTags is enabled', () => {
    const inactiveHtml = renderToStaticMarkup(
      React.createElement(OptionCard, {
        styleType: 'fast',
        shortcutKey: '1',
        deltas: { power: -15, air: -5 },
        showDataTags: false,
        onSelect: () => {},
      })
    );
    expect(inactiveHtml).not.toContain('data-testid="data-chip-game"');

    const activeHtml = renderToStaticMarkup(
      React.createElement(OptionCard, {
        styleType: 'fast',
        shortcutKey: '1',
        deltas: { power: -15, air: -5 },
        showDataTags: true,
        onSelect: () => {},
      })
    );
    expect(activeHtml).toContain('data-testid="data-chip-game"');
    expect(activeHtml).toContain('RULE');
  });
});

describe('T20: DataLensOverlay inspection layer', () => {
  it('renders inspection banner when active', () => {
    const html = renderToStaticMarkup(
      React.createElement(DataLensOverlay, {
        isActive: true,
        onClose: () => {},
        onOpenPassport: () => {},
      })
    );

    expect(html).toContain('data-testid="data-lens-overlay"');
    expect(html).toContain('Data Loupe Active');
    expect(html).toContain('btn-lens-open-passport');
    expect(html).toContain('btn-lens-close');
  });

  it('renders nothing when inactive', () => {
    const html = renderToStaticMarkup(
      React.createElement(DataLensOverlay, {
        isActive: false,
        onClose: () => {},
        onOpenPassport: () => {},
      })
    );

    expect(html).toBe('');
  });
});

describe('T20: DataPassportModal component', () => {
  it('renders full passport dialog with generated snapshot datasets and provenance', () => {
    const html = renderToStaticMarkup(
      React.createElement(DataPassportModal, {
        isOpen: true,
        onClose: () => {},
      })
    );

    expect(html).toContain('data-testid="data-passport-modal"');
    expect(html).toContain('NASA Data Passport');
    expect(html).toContain('100% VERIFIED');
    expect(html).toContain('data-testid="passport-tab-all"');
    expect(html).toContain('data-testid="passport-tab-solar"');
    expect(html).toContain('data-testid="passport-tab-biology"');
    expect(html).toContain('data-testid="passport-tab-avatars"');

    // Generated entries from snapshots
    expect(html).toContain('data-testid="passport-entry-donki-flr-recent"');
    expect(html).toContain('data-testid="passport-entry-donki-flr-may2024"');
    expect(html).toContain('data-testid="passport-entry-osdr-studies"');
    expect(html).toContain('data-testid="passport-entry-images-avatars"');
    expect(html).toContain('data-testid="passport-entry-facts-scientific"');
    expect(html).toContain('Official NASA Endpoint');
  });

  it('renders nothing when closed', () => {
    const html = renderToStaticMarkup(
      React.createElement(DataPassportModal, {
        isOpen: false,
        onClose: () => {},
      })
    );

    expect(html).toBe('');
  });
});

describe('T20: Passport button access in Title and Pause screens', () => {
  it('Title screen provides access button to NASA Data Passport', () => {
    const html = renderToStaticMarkup(
      React.createElement(Title, { onStart: () => {} })
    );

    expect(html).toContain('data-testid="btn-title-passport"');
    expect(html).toContain('NASA Data Passport');
  });

  it('PauseOverlay provides access button to NASA Data Passport', () => {
    const html = renderToStaticMarkup(
      React.createElement(PauseOverlay, { onResume: () => {} })
    );

    expect(html).toContain('data-testid="btn-pause-passport"');
    expect(html).toContain('NASA Data Passport');
  });
});
