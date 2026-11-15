export interface BadgeDef {
  id: string;
  name: string;
  conditionText: string;
  avatarId: string;
}

export const BADGES: BadgeDef[] = [
  {
    id: "steady-observer",
    name: "Steady Observer",
    conditionText: "Reach a 5-day mission training streak.",
    avatarId: "steady-observer",
  },
  {
    id: "flawless-pilot",
    name: "Flawless Pilot",
    conditionText: "Win 3 expeditions in a row without a loss.",
    avatarId: "flawless-pilot",
  },
  {
    id: "space-veteran",
    name: "Space Veteran",
    conditionText: "Win 7 expeditions in a row.",
    avatarId: "space-veteran",
  },
  {
    id: "ice-cold",
    name: "Ice Cold",
    conditionText: "Resolve 10 timed alerts cleanly without timer expiry.",
    avatarId: "ice-cold",
  },
  {
    id: "complete-constellation",
    name: "Complete Constellation",
    conditionText: "Earn 3 stars on Easy, Medium, and Hard of the same mission.",
    avatarId: "complete-constellation",
  },
];
