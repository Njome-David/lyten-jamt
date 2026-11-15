import type { RunScore, RunState } from "./types";

export function scoreRun(
  state: RunState,
  streakCount: number,
  welcomeAlreadyGiven: boolean,
): RunScore {
  const won = state.status === "won";
  let stars: 0 | 1 | 2 | 3 = 0;

  if (won) {
    stars = 1;
    if (state.meters.health >= 60) {
      stars = 2;
    }
    if (
      state.minHealth >= 40 &&
      state.pressureFails === 0 &&
      state.meters.power >= 25 &&
      state.meters.air >= 25
    ) {
      stars = 3;
    }
  }

  const welcome = welcomeAlreadyGiven ? 0 : 50;
  const objective = won ? 100 : 0;
  const healthyCrew = won && state.meters.health >= 60 ? 80 : 0;
  const pressureBonus = state.pressureWins * 50;
  const threeStarBonus = stars === 3 ? 60 : 0;
  const lessonLearned = won ? 0 : 25;

  const missionSubtotal = objective + healthyCrew + pressureBonus + threeStarBonus + lessonLearned;
  const streakMultiplier = streakCount >= 3 ? 1.2 : 1.0;
  const total = welcome + Math.round(missionSubtotal * streakMultiplier);

  const incidents: string[] = [];
  for (const entry of state.log) {
    if (entry.flare) {
      const ar = entry.flare.activeRegionNum ? ` (AR ${entry.flare.activeRegionNum})` : "";
      incidents.push(
        `Turn ${entry.turn}: Real NASA DONKI ${entry.flare.classType} solar flare${ar} recorded at ${entry.flare.peakTime}.`,
      );
    } else if (entry.event === "dust") {
      incidents.push(
        `Turn ${entry.turn}: Martian dust squall reduced sunlight reaching the surface.`,
      );
    } else if (entry.event === "fault") {
      incidents.push(`Turn ${entry.turn}: Hardware fault required an engineering trade-off.`);
    } else if (entry.event === "blackout") {
      incidents.push(`Turn ${entry.turn}: Radio blackout temporarily cut Earth telemetry.`);
    }
  }

  let causeSummary = "";
  let nextTimeTip = "";

  if (won) {
    if (stars === 3) {
      causeSummary =
        "Every life-support system stayed above safety margins and all storm alerts were handled cleanly.";
      nextTimeTip =
        "Try a harder difficulty or switch landing sites to test how terrain changes solar power and radiation.";
    } else if (stars === 2) {
      causeSummary =
        "The mission objective succeeded with a healthy crew, though reserve margins ran tight near the end.";
      nextTimeTip =
        "To earn 3 stars, finish with at least 25 Power and 25 Air and resolve every timed alert before expiry.";
    } else {
      causeSummary =
        "The crew completed the science objective, but radiation or low supplies wore down crew health.";
      nextTimeTip =
        "Reinforced shielding or sheltering during M/X solar flares keeps Health above 60 for extra stars.";
    }
  } else {
    switch (state.lossReason) {
      case "air":
        causeSummary =
          "Oxygen and water reserves dropped to zero because crew breathing and longer Careful steps outpaced supply.";
        nextTimeTip =
          "Try launching with a 2- or 3-astronaut crew, or mix Balanced steps to save breathing time.";
        break;
      case "food":
        causeSummary =
          "Food stores ran empty before mission completion due to crew consumption across extended steps.";
        nextTimeTip =
          "Rations provide 100 starting Food, while Hydroponics needs careful conservation on Turns 1 and 2 before harvest.";
        break;
      case "health":
        causeSummary =
          "Cumulative space radiation and system strain lowered crew health below safe operating limits.";
        nextTimeTip =
          "Equip Reinforced Shielding (0.4x dose) or choose Boost Shield / Shelter Crew when a solar flare strikes.";
        break;
      case "power":
      default:
        causeSummary =
          "Electrical reserves stayed at zero for two consecutive turns, halting heaters and mission instruments.";
        nextTimeTip =
          "Use Balanced or Careful steps during lunar night or Mars dust storms, or bring high-density Batteries.";
        break;
    }
  }

  return {
    stars,
    xp: {
      welcome,
      objective,
      healthyCrew,
      pressureBonus,
      threeStarBonus,
      lessonLearned,
      streakMultiplier,
      total,
    },
    incidents,
    causeSummary,
    nextTimeTip,
  };
}
