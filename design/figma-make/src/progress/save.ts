import { BADGES } from "../content/badges";
import type { Difficulty, RunScore, RunState, SaveV1 } from "../engine/types";

const SAVE_KEY = "jamt.save.v1";
const CORRUPT_KEY = "jamt.save.corrupt";

export interface RankInfo {
  title: string;
  minXp: number;
  nextXp: number | null;
}

export const RANKS: RankInfo[] = [
  { title: "Space Cadet", minXp: 0, nextXp: 500 },
  { title: "Mission Specialist", minXp: 500, nextXp: 1500 },
  { title: "Expedition Pilot", minXp: 1500, nextXp: 3500 },
  { title: "Base Commander", minXp: 3500, nextXp: 7000 },
  { title: "NASA Flight Director", minXp: 7000, nextXp: null },
];

export function rankForXp(xp: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) return RANKS[i];
  }
  return RANKS[0];
}

export function getLocalDayString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayDiff(prevDay: string, today: string): number {
  const a = Date.parse(`${prevDay}T00:00:00Z`);
  const b = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 999;
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

export function updateStreak(streak: SaveV1["streak"], today: string): SaveV1["streak"] {
  if (!streak.lastDay) {
    return { count: 1, lastDay: today, jokerReady: streak.jokerReady };
  }
  const diff = dayDiff(streak.lastDay, today);
  if (diff <= 0) {
    return streak;
  }
  if (diff === 1) {
    const nextCount = streak.count + 1;
    return {
      count: nextCount,
      lastDay: today,
      jokerReady: nextCount >= 7 ? true : streak.jokerReady,
    };
  }
  if (diff === 2 && streak.jokerReady) {
    const nextCount = streak.count + 1;
    return {
      count: nextCount,
      lastDay: today,
      jokerReady: false,
    };
  }
  return { count: 1, lastDay: today, jokerReady: streak.jokerReady };
}

export function defaultSave(): SaveV1 {
  return {
    v: 1,
    profile: { codename: "Cmdr. Nova", avatarId: "default" },
    xp: 0,
    streak: { count: 1, lastDay: getLocalDayString(), jokerReady: true },
    badges: [],
    best: {},
    stats: {
      missionsPlayed: 0,
      missionsWon: 0,
      winStreak: 0,
      pressureWinsClean: 0,
      welcomeGiven: false,
    },
    settings: { muted: false, extraTime: false },
  };
}

export function createJudgeDemoSave(): SaveV1 {
  return {
    v: 1,
    profile: { codename: "Judge Demo", avatarId: "flawless-pilot" },
    xp: 1840,
    streak: { count: 4, lastDay: getLocalDayString(), jokerReady: true },
    badges: ["steady-observer", "flawless-pilot"],
    best: {
      "moon-relay": { easy: 3, medium: 2 },
      "mars-core": { medium: 2 },
    },
    stats: {
      missionsPlayed: 6,
      missionsWon: 5,
      winStreak: 3,
      pressureWinsClean: 5,
      welcomeGiven: true,
    },
    settings: { muted: false, extraTime: false },
  };
}

export function loadSave(): { save: SaveV1; storageAvailable: boolean } {
  try {
    const probe = "__jamt_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
  } catch {
    return { save: defaultSave(), storageAvailable: false };
  }

  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return { save: defaultSave(), storageAvailable: true };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== 1 || typeof parsed.xp !== "number" || !parsed.profile) {
      window.localStorage.setItem(CORRUPT_KEY, raw);
      return { save: defaultSave(), storageAvailable: true };
    }
    const base = defaultSave();
    return {
      storageAvailable: true,
      save: {
        ...base,
        ...parsed,
        profile: { ...base.profile, ...parsed.profile },
        streak: { ...base.streak, ...parsed.streak },
        stats: { ...base.stats, ...parsed.stats },
        settings: { ...base.settings, ...parsed.settings },
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
        best: parsed.best && typeof parsed.best === "object" ? parsed.best : {},
      },
    };
  } catch {
    return { save: defaultSave(), storageAvailable: true };
  }
}

export function writeSave(save: SaveV1): boolean {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

export function recordMissionResult(
  prev: SaveV1,
  run: RunState,
  score: RunScore,
  today = getLocalDayString(),
): { nextSave: SaveV1; newlyUnlockedBadges: string[] } {
  const won = run.status === "won";
  const nextStreak = updateStreak(prev.streak, today);
  const missionKey = `${run.body}-${run.missionId}`;
  const prevBestForMission = prev.best[missionKey] ?? {};
  const currentBest = prevBestForMission[run.difficulty] ?? 0;
  const nextStars = Math.max(currentBest, score.stars) as 0 | 1 | 2 | 3;

  const nextBest: SaveV1["best"] = {
    ...prev.best,
    [missionKey]: {
      ...prevBestForMission,
      [run.difficulty]: nextStars,
    },
  };

  const winStreak = won ? prev.stats.winStreak + 1 : 0;
  const pressureWinsClean =
    run.pressureFails === 0 ? prev.stats.pressureWinsClean + run.pressureWins : 0;

  const candidate: SaveV1 = {
    ...prev,
    xp: prev.xp + score.xp.total,
    streak: nextStreak,
    best: nextBest,
    stats: {
      missionsPlayed: prev.stats.missionsPlayed + 1,
      missionsWon: prev.stats.missionsWon + (won ? 1 : 0),
      winStreak,
      pressureWinsClean,
      welcomeGiven: true,
    },
  };

  const unlocked = new Set(prev.badges);
  const newlyUnlockedBadges: string[] = [];

  const grant = (id: string) => {
    if (!unlocked.has(id) && BADGES.some((b) => b.id === id)) {
      unlocked.add(id);
      newlyUnlockedBadges.push(id);
    }
  };

  if (candidate.streak.count >= 5) grant("steady-observer");
  if (candidate.stats.winStreak >= 3) grant("flawless-pilot");
  if (candidate.stats.winStreak >= 7) grant("space-veteran");
  if (candidate.stats.pressureWinsClean >= 10) grant("ice-cold");

  const difficulties: Difficulty[] = ["easy", "medium", "hard"];
  for (const record of Object.values(nextBest)) {
    if (difficulties.every((d) => record[d] === 3)) {
      grant("complete-constellation");
    }
  }

  candidate.badges = Array.from(unlocked);
  return { nextSave: candidate, newlyUnlockedBadges };
}
