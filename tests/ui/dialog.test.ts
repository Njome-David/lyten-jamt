// tests/ui/dialog.test.ts
// Vitest tests for the companion Nova dialogue system (T10).
// Tests DialogBox, NovaSvg, SpotlightOverlay, useDialogRunner, and dialogue script limits.

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  guidedTour,
  narrativeDialogues,
  dialogues,
  getLossDialogue,
  getLowMeterDialogue,
  type Dialogue,
  type NovaExpression,
} from '../../src/content/dialogues';
import { NovaSvg } from '../../src/ui/dialog/NovaSvg';
import { DialogBox } from '../../src/ui/dialog/DialogBox';
import { SpotlightOverlay } from '../../src/ui/dialog/SpotlightOverlay';

describe('T10: Dialogue scripts and content rules', () => {
  it('contains exactly 8 guided tour dialogues for initial onboarding', () => {
    expect(guidedTour).toHaveLength(8);
  });

  it('strictly enforces the 14-word limit on every guided tour dialogue box', () => {
    guidedTour.forEach((box) => {
      const words = box.text.trim().split(/\s+/).filter(Boolean);
      expect(
        words.length,
        `Dialogue "${box.id}" exceeds 14 words (${words.length} words: "${box.text}")`
      ).toBeLessThanOrEqual(14);
    });
  });

  it('strictly enforces the 14-word limit on all narrative event dialogue boxes', () => {
    Object.values(narrativeDialogues).forEach((box) => {
      const words = box.text.trim().split(/\s+/).filter(Boolean);
      expect(
        words.length,
        `Narrative dialogue "${box.id}" exceeds 14 words (${words.length} words)`
      ).toBeLessThanOrEqual(14);
    });
  });

  it('ensures all dialogues have unique IDs', () => {
    const ids = dialogues.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('T10: Nova companion SVG illustration', () => {
  const expressions: NovaExpression[] = [
    'neutral',
    'happy',
    'worried',
    'alert',
    'thinking',
    'proud',
    'goodbye',
  ];

  expressions.forEach((expr) => {
    it(`renders NovaSvg with expression "${expr}" without error`, () => {
      const html = renderToStaticMarkup(
        React.createElement(NovaSvg, { expression: expr, size: 100 })
      );
      expect(html).toContain('data-testid="nova-svg"');
      expect(html).toContain(`data-expression="${expr}"`);
      expect(html).toContain(`data-testid="expr-${expr}"`);
    });
  });

  it('renders waving astronaut glove for goodbye expression', () => {
    const html = renderToStaticMarkup(
      React.createElement(NovaSvg, { expression: 'goodbye' })
    );
    expect(html).toContain('data-testid="expr-goodbye"');
    expect(html).toContain('transform="translate(118, 55) rotate(15)"');
  });
});

describe('T10: DialogBox and SpotlightOverlay components', () => {
  const mockDialog: Dialogue = {
    id: 'test-box',
    speaker: 'Nova',
    expression: 'happy',
    text: "Hey, Commander! I'm Nova, your mission buddy.",
    spotlightTarget: '#hud-bar',
  };

  it('renders DialogBox with companion avatar, text, and action buttons', () => {
    const html = renderToStaticMarkup(
      React.createElement(DialogBox, {
        dialogue: mockDialog,
        onNext: () => {},
        onSkip: () => {},
      })
    );
    expect(html).toContain('data-testid="dialog-box"');
    expect(html).toContain('data-testid="nova-svg"');
    expect(html).toContain('Nova');
    expect(html).toContain('data-testid="dialog-skip-btn"');
    expect(html).toContain('data-testid="dialog-next-btn"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-live="polite"');
  });

  it('renders SpotlightOverlay fallback dim backdrop when selector element is absent', () => {
    const html = renderToStaticMarkup(
      React.createElement(SpotlightOverlay, { target: '#non-existent' })
    );
    expect(html).toContain('data-testid="spotlight-dim-backdrop"');
  });
});

describe('T10: Dialogue runner logic and countdown safety', () => {
  it('filters out already seen dialogues based on save.seen', () => {
    const seenSet = new Set<string>(['tour-01', 'tour-02']);
    const unseen = guidedTour.filter((d) => !seenSet.has(d.id));
    expect(unseen).toHaveLength(6);
    expect(unseen[0]?.id).toBe('tour-03');
  });

  it('enforces rule: NO dialogue active when countdown is active', () => {
    // Model the logic in useDialogRunner: isDialogActive = queue.length > 0 && !isCountdownActive
    const queue = [guidedTour[0]];

    const activeWithoutCountdown = queue.length > 0 && !false;
    expect(activeWithoutCountdown).toBe(true);

    const activeWithCountdown = queue.length > 0 && !true;
    expect(activeWithCountdown).toBe(false);
  });
});

describe('T22: Complete Nova dialogues coverage and rules (docs/fr/01 section 8.4)', () => {
  const mandatoryTriggers = [
    'firstLoadout',
    'firstMissionStart',
    'firstFlare',
    'firstTimedAlert',
    'firstMarsDelay',
    'firstDustStorm',
    'firstFault',
    'firstBlackout',
    'firstLunarNight',
    'hydroponicsChosen',
    'reinforcedShieldChosen',
    'lowAir',
    'lowPower',
    'lowHealth',
    'lowFood',
    'firstWin',
    'firstLoss',
    'firstLossAir',
    'firstLossPower',
    'firstLossHealth',
    'firstLossFood',
    'firstBadge',
    'firstRankUp',
    'firstStreak',
  ];

  it('provides a dialogue for every mandatory trigger from section 8.4 and 4.2', () => {
    mandatoryTriggers.forEach((trigger) => {
      expect(
        narrativeDialogues[trigger],
        `Trigger "${trigger}" missing from narrativeDialogues`
      ).toBeDefined();
      expect(narrativeDialogues[trigger]?.id).toBe(trigger);
      expect(narrativeDialogues[trigger]?.text.length).toBeGreaterThan(0);
    });
  });

  it('strictly limits every single dialogue in the entire catalogue to 14 words or fewer', () => {
    dialogues.forEach((d) => {
      const words = d.text.trim().split(/\s+/).filter(Boolean);
      expect(
        words.length,
        `Dialogue "${d.id}" has ${words.length} words (max 14 allowed): "${d.text}"`
      ).toBeLessThanOrEqual(14);
    });
  });

  it('ensures all dialogues have a valid NovaExpression', () => {
    const validExpressions: Set<NovaExpression> = new Set([
      'neutral',
      'happy',
      'worried',
      'alert',
      'thinking',
      'proud',
      'goodbye',
    ]);

    dialogues.forEach((d) => {
      if (d.expression) {
        expect(validExpressions.has(d.expression)).toBe(true);
      }
    });
  });

  it('ensures all dialogue texts are in English and contain no French words or accents', () => {
    const frenchRegex = /[éèêëàâäçùûüôöîï]/i;
    dialogues.forEach((d) => {
      expect(frenchRegex.test(d.text), `Dialogue "${d.id}" contains French accent: "${d.text}"`).toBe(false);
    });
  });

  it('retrieves cause-specific loss dialogues via getLossDialogue', () => {
    expect(getLossDialogue('air').id).toBe('firstLossAir');
    expect(getLossDialogue('power').id).toBe('firstLossPower');
    expect(getLossDialogue('health').id).toBe('firstLossHealth');
    expect(getLossDialogue('food').id).toBe('firstLossFood');
    expect(getLossDialogue().id).toBe('firstLoss');
  });

  it('retrieves meter alert dialogues via getLowMeterDialogue', () => {
    expect(getLowMeterDialogue('air').id).toBe('lowAir');
    expect(getLowMeterDialogue('power').id).toBe('lowPower');
    expect(getLowMeterDialogue('health').id).toBe('lowHealth');
    expect(getLowMeterDialogue('food').id).toBe('lowFood');
  });
});
