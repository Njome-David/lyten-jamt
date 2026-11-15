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
  hydroponicsChosen: {
    id: 'hydroponicsChosen',
    speaker: 'Nova',
    expression: 'happy',
    text: 'Greenhouse active! Fresh salads for everyone, but it needs steady power.',
    once: true,
  },
  reinforcedShieldChosen: {
    id: 'reinforcedShieldChosen',
    speaker: 'Nova',
    expression: 'thinking',
    text: 'Heavy shields mounted! We are safe from flares, but maneuvers cost more.',
    once: true,
  },
  lowAir: {
    id: 'lowAir',
    speaker: 'Nova',
    expression: 'alert',
    text: 'Warning! Oxygen reserves are dipping below twenty-five percent. Check life support!',
    once: false,
  },
  lowPower: {
    id: 'lowPower',
    speaker: 'Nova',
    expression: 'alert',
    text: 'Power alert! Battery cells are critical. Power down heavy tools immediately!',
    once: false,
  },
  lowHealth: {
    id: 'lowHealth',
    speaker: 'Nova',
    expression: 'worried',
    text: 'Medical alert! Crew stamina is exhausted. Provide rest and medical treatment!',
    once: false,
  },
  lowFood: {
    id: 'lowFood',
    speaker: 'Nova',
    expression: 'worried',
    text: 'Rations running low! Food stores are nearly empty. Harvest crops soon!',
    once: false,
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
  firstLossAir: {
    id: 'firstLossAir',
    speaker: 'Nova',
    expression: 'worried',
    text: 'Life support ran out of air. Space suits need oxygen management, Commander!',
    once: true,
  },
  firstLossPower: {
    id: 'firstLossPower',
    speaker: 'Nova',
    expression: 'worried',
    text: 'Batteries drained completely. Without electricity, outpost systems stop. We will recharge!',
    once: true,
  },
  firstLossHealth: {
    id: 'firstLossHealth',
    speaker: 'Nova',
    expression: 'worried',
    text: 'The crew was too injured to continue. Health and safety come first!',
    once: true,
  },
  firstLossFood: {
    id: 'firstLossFood',
    speaker: 'Nova',
    expression: 'worried',
    text: 'We ran out of emergency food. Astronauts need calories to explore space!',
    once: true,
  },
  firstBadge: {
    id: 'firstBadge',
    speaker: 'Nova',
    expression: 'proud',
    text: 'Incredible work! You earned your very first NASA mission badge, Commander!',
    once: true,
  },
  firstRankUp: {
    id: 'firstRankUp',
    speaker: 'Nova',
    expression: 'proud',
    text: 'Promotion approved! You earned enough XP to reach a brand new rank!',
    once: true,
  },
  firstStreak: {
    id: 'firstStreak',
    speaker: 'Nova',
    expression: 'happy',
    text: 'Three days in a row! Daily training unlocked your streak XP bonus!',
    once: true,
  },
};

/** Helper to retrieve cause-specific or fallback first loss dialogue */
export function getLossDialogue(cause?: 'air' | 'power' | 'health' | 'food'): Dialogue {
  if (cause === 'air') return narrativeDialogues.firstLossAir!;
  if (cause === 'power') return narrativeDialogues.firstLossPower!;
  if (cause === 'health') return narrativeDialogues.firstLossHealth!;
  if (cause === 'food') return narrativeDialogues.firstLossFood!;
  return narrativeDialogues.firstLoss!;
}

/** Helper to retrieve meter warning dialogue */
export function getLowMeterDialogue(meter: 'air' | 'power' | 'health' | 'food'): Dialogue {
  if (meter === 'air') return narrativeDialogues.lowAir!;
  if (meter === 'power') return narrativeDialogues.lowPower!;
  if (meter === 'health') return narrativeDialogues.lowHealth!;
  return narrativeDialogues.lowFood!;
}

/** All dialogues index */
export const dialogues: Dialogue[] = [
  ...guidedTour,
  ...Object.values(narrativeDialogues),
];
