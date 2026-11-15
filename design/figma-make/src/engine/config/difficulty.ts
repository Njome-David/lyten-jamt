import type { Difficulty } from "../types";

export interface DifficultyParams {
  consume: number;
  dose: number;
  eventRate: number;
  flareCap: "M" | "X";
  timerSec: number;
  delayTurnsMars: number;
  marsDelayRealLabel: string;
  hintsEnabled: boolean;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyParams> = {
  easy: {
    consume: 0.8,
    dose: 0.8,
    eventRate: 0.5,
    flareCap: "M",
    timerSec: 15,
    delayTurnsMars: 1,
    marsDelayRealLabel: "3 min (closest Mars alignment)",
    hintsEnabled: true,
  },
  medium: {
    consume: 1.0,
    dose: 1.0,
    eventRate: 0.65,
    flareCap: "X",
    timerSec: 12,
    delayTurnsMars: 2,
    marsDelayRealLabel: "about 12.5 min (average one-way)",
    hintsEnabled: true,
  },
  hard: {
    consume: 1.2,
    dose: 1.2,
    eventRate: 0.8,
    flareCap: "X",
    timerSec: 10,
    delayTurnsMars: 3,
    marsDelayRealLabel: "22 min (far-side orbital distance)",
    hintsEnabled: false,
  },
};
