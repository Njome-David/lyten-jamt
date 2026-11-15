/**
 * Pure scoring functions for mission evaluation.
 * Pure TypeScript (no React/DOM/Date/Math.random).
 */

import type { RunScore, RunState, XpBreakdown } from './types';

export function scoreRun(state: RunState): RunScore {
  const isWon = state.status === 'won';

  // Stars calculation:
  // 1 = won
  // 2 = won and health >= 60
  // 3 = won and minHealth >= 40 and pressureFails === 0 and power >= 25 and air >= 25
  let stars: 0 | 1 | 2 | 3 = 0;
  if (isWon) {
    if (
      state.minHealth >= 40 &&
      state.pressureFails === 0 &&
      state.meters.power >= 25 &&
      state.meters.air >= 25
    ) {
      stars = 3;
    } else if (state.meters.health >= 60) {
      stars = 2;
    } else {
      stars = 1;
    }
  }

  // XP Breakdown
  const welcome = 50;
  const objective = isWon ? 100 : 25;
  const healthyCrew = Math.round((state.meters.health ?? 0) * 0.8);
  const pressureBonus = state.pressureWins * 25;
  const threeStarBonus = stars === 3 ? 60 : 0;
  const lessonLearned = !isWon ? 30 : 0;
  const streakMultiplier = 1.0;

  const baseTotal =
    welcome +
    objective +
    healthyCrew +
    pressureBonus +
    threeStarBonus +
    lessonLearned;
  const total = Math.round(baseTotal * streakMultiplier);

  const xp: XpBreakdown = {
    welcome,
    objective,
    healthyCrew,
    pressureBonus,
    threeStarBonus,
    lessonLearned,
    streakMultiplier,
    total,
  };

  // Compile incidents from log
  const incidents: string[] = [];
  state.log.forEach((entry) => {
    if (entry.event !== 'none') {
      if (entry.event === 'flare' && entry.flare) {
        incidents.push(`Solar flare ${entry.flare.classType} encountered (Turn ${entry.turn})`);
      } else if (entry.event === 'dust') {
        incidents.push(`Martian dust storm alert handled (Turn ${entry.turn})`);
      } else if (entry.event === 'fault') {
        incidents.push(`Subsystem hardware fault resolved (Turn ${entry.turn})`);
      } else if (entry.event === 'blackout') {
        incidents.push(`Radio blackout active (Turn ${entry.turn})`);
      }
    }
  });

  let causeSummary = '';
  let nextTimeTip = '';

  if (isWon) {
    causeSummary = 'Mission completed successfully. Outpost integrity sustained.';
    nextTimeTip =
      stars === 3
        ? 'Outstanding performance Commander! Ready for higher difficulty.'
        : 'Manage battery reserves and radiation exposure carefully to achieve 3 stars!';
  } else {
    const reason = state.lossReason ?? 'health';
    causeSummary = `Mission failed due to critical depletion of ${reason}.`;
    nextTimeTip =
      reason === 'power'
        ? 'Prioritize solar angle and retract non-essential systems during nights.'
        : reason === 'air'
        ? 'Watch out for crew consumption rates on longer steps.'
        : 'Reinforce shielding or seek shelter promptly during solar particle events.';
  }

  return {
    stars,
    xp,
    incidents,
    causeSummary,
    nextTimeTip,
  };
}
