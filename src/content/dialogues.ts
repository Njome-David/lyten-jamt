// src/content/dialogues.ts
// Dialogue definitions for the guided tour and companion events (Nova).
// Strictly follows PRESENTATION.md sections 4.1 & 4.2 and AGENTS.md rules.
// Every dialogue box has at most 14 words.

export type NovaExpression =
  | 'neutral'
  | 'happy'
  | 'worried'
  | 'alert'
  | 'thinking'
  | 'proud'
  | 'goodbye';

export interface Dialogue {
  /** Unique dialogue identifier */
  id: string;
  /** Dialogue text (maximum 14 words per box) */
  text: string;
  /** Speaker name - default "Nova" */
  speaker?: string;
  /** Nova companion expression */
  expression?: NovaExpression;
  /** Optional CSS selector or data-testid target for spotlight highlight */
  spotlightTarget?: string;
  /** Whether this dialogue is only shown once in player history (default true) */
  once?: boolean;
}

/** Initial guided tour shown on first launch (8 boxes, each <= 14 words) */
export const guidedTour: Dialogue[] = [
  {
    id: 'tour-01',
    speaker: 'Nova',
    expression: 'happy',
    text: "Hey, Commander! I'm Nova, your mission buddy.",
    spotlightTarget: '[data-testid="stage-2d"]',
    once: true,
  },
  {
    id: 'tour-02',
    speaker: 'Nova',
    expression: 'neutral',
    text: "I've trained for ages. Now I get to help you.",
    once: true,
  },
  {
    id: 'tour-03',
    speaker: 'Nova',
    expression: 'thinking',
    text: 'One rule of space: nothing is free.',
    once: true,
  },
  {
    id: 'tour-04',
    speaker: 'Nova',
    expression: 'happy',
    text: 'Every choice costs power, air, food, or health.',
    spotlightTarget: '[data-testid="hud-meters"]',
    once: true,
  },
  {
    id: 'tour-05',
    speaker: 'Nova',
    expression: 'neutral',
    text: 'Power runs drills, heaters and radios.',
    spotlightTarget: '[data-testid="meter-power"]',
    once: true,
  },
  {
    id: 'tour-06',
    speaker: 'Nova',
    expression: 'alert',
    text: 'Sometimes the Sun throws a tantrum. Those are solar flares!',
    once: true,
  },
  {
    id: 'tour-07',
    speaker: 'Nova',
    expression: 'proud',
    text: 'For each step, pick fast, balanced, or careful.',
    spotlightTarget: '[data-testid="option-cards"]',
    once: true,
  },
  {
    id: 'tour-08',
    speaker: 'Nova',
    expression: 'goodbye',
    text: "I'll pop in when something new happens. Good luck!",
    once: true,
  },
];

/** Event and narrative dialogue triggers (PRESENTATION.md section 4.2) */
export const narrativeDialogues: Record<string, Dialogue> = {
  firstLoadout: {
    id: 'firstLoadout',
    speaker: 'Nova',
    expression: 'thinking',
    text: 'Careful with the 10-point budget: every module has trade-offs!',
    once: true,
  },
  firstMissionStart: {
    id: 'firstMissionStart',
    speaker: 'Nova',
    expression: 'proud',
    text: 'Watch the 6-step progress track and balance your style!',
    once: true,
  },
  firstFlare: {
    id: 'firstFlare',
    speaker: 'Nova',
    expression: 'alert',
    text: 'Solar flare incoming! Find shelter before radiation spikes!',
    once: true,
  },
  firstTimedAlert: {
    id: 'firstTimedAlert',
    speaker: 'Nova',
    expression: 'alert',
    text: 'Emergency! You have 5 seconds to choose before time expires.',
    once: true,
  },
  firstMarsDelay: {
    id: 'firstMarsDelay',
    speaker: 'Nova',
    expression: 'thinking',
    text: 'Radio signals to Mars take 3 to 22 minutes to travel!',
    once: true,
  },
  firstDustStorm: {
    id: 'firstDustStorm',
    speaker: 'Nova',
    expression: 'worried',
    text: 'Dust storm detected! Solar power output will drop sharply.',
    once: true,
  },
  firstFault: {
    id: 'firstFault',
    speaker: 'Nova',
    expression: 'worried',
    text: 'Equipment failure! Decide whether to repair, bypass or push forward.',
    once: true,
  },
  firstBlackout: {
    id: 'firstBlackout',
    speaker: 'Nova',
    expression: 'alert',
    text: 'Power blackout! Life support is switching to emergency reserve.',
    once: true,
  },
  firstLunarNight: {
    id: 'firstLunarNight',
    speaker: 'Nova',
    expression: 'thinking',
    text: 'Lunar night is here: two freezing Earth weeks without sunlight!',
    once: true,
  },
  firstWin: {
    id: 'firstWin',
    speaker: 'Nova',
    expression: 'proud',
    text: 'Mission accomplished, Commander! Outstanding resource management.',
    once: true,
  },
  firstLoss: {
    id: 'firstLoss',
    speaker: 'Nova',
    expression: 'worried',
    text: 'We lost this mission, but astronauts learn from every failure.',
    once: true,
  },
};

/** All dialogues index */
export const dialogues: Dialogue[] = [
  ...guidedTour,
  ...Object.values(narrativeDialogues),
];
