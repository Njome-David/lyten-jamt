import React, { useState } from "react";
import {
  Award,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HeartPulse,
  Lightbulb,
  RotateCcw,
  SlidersHorizontal,
  Sprout,
  Star,
  Trophy,
  Wind,
  Zap,
} from "lucide-react";
import { BADGES } from "../../content/badges";
import { getMission } from "../../content/missions";
import { SITES } from "../../content/sites";
import { getAvatarById, OSDR_GARDEN_SNAPSHOT, OSDR_GARDEN_STUDY } from "../../data/provenance";
import type { RunScore, RunState, SolarContext } from "../../engine/types";
import { AstronautPortraitSvg } from "../components/AstronautTutor";
import { RealGameChip } from "../components/RealGameChip";

interface OutpostDebriefOverlayProps {
  run: RunState;
  score: RunScore;
  solar: SolarContext;
  newlyUnlockedBadges: string[];
  onReplaySame: () => void;
  onAdjustLoadout: () => void;
  onReturnToHub: () => void;
}

export const OutpostDebriefOverlay: React.FC<OutpostDebriefOverlayProps> = ({
  run,
  score,
  solar,
  newlyUnlockedBadges,
  onReplaySame,
  onAdjustLoadout,
  onReturnToHub,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const won = run.status === "won";
  const mission = getMission(run.body, run.missionId);
  const site = SITES[run.siteId];

  // Compact Sparkline SVG
  const history = run.meterHistory;
  const w = 420;
  const h = 92;
  const xAt = (i: number) =>
    history.length <= 1 ? 10 : 10 + (i / (history.length - 1)) * (w - 20);
  const yAt = (v: number) => 8 + ((100 - v) / 100) * (h - 16);
  const line = (k: "power" | "air" | "health" | "food") =>
    history
      .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(p.meters[k]).toFixed(1)}`)
      .join(" ");

  return (
    <div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-6">
      <div className="pointer-events-auto max-h-[84vh] overflow-y-auto rounded-3xl border border-slate-700/85 bg-slate-950/86 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
        {/* Victory / Lesson Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span
              className={`rounded-full px-3 py-1 font-mono text-xs font-bold uppercase ${
                won ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-200"
              }`}
            >
              {won ? "Mission Accomplished" : "Test Flight · Lesson Learned"}
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {mission.title}
            </h1>
            <div className="font-mono text-xs text-slate-400">
              {site.name} · {run.difficulty.toUpperCase()}
            </div>
          </div>

          {/* Stars & XP Pill */}
          <div className="flex flex-col items-center rounded-2xl border border-slate-800 bg-slate-900/90 px-5 py-3">
            <div className="flex items-center gap-1" aria-label={`${score.stars} out of 3 stars`}>
              {[0, 1, 2].map((i) => (
                <Star
                  key={i}
                  className={`h-7 w-7 ${
                    i < score.stars ? "fill-amber-300 text-amber-300" : "text-slate-700"
                  }`}
                />
              ))}
            </div>
            <div className="mt-1 inline-flex items-center gap-1 font-mono text-sm font-bold text-sky-300">
              <Trophy className="h-4 w-4 text-amber-300" />+{score.xp.total} XP
            </div>
          </div>
        </div>

        {/* Maya's Friendly Debrief Summary */}
        <div className="mt-4 flex items-center gap-3.5 rounded-2xl border border-sky-400/30 bg-slate-900/80 p-3.5">
          <AstronautPortraitSvg mood={won ? "proud" : "focused"} size={56} />
          <div className="text-xs leading-relaxed text-slate-200 sm:text-sm">
            <p className="font-medium text-white">{score.causeSummary}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-200">
              <Lightbulb className="h-3.5 w-3.5 shrink-0" />
              {score.nextTimeTip}
            </p>
          </div>
        </div>

        {/* Badge Unlocks */}
        {newlyUnlockedBadges.length > 0 && (
          <div className="mt-4 space-y-2">
            {newlyUnlockedBadges.map((id) => {
              const badge = BADGES.find((b) => b.id === id);
              if (!badge) return null;
              const av = getAvatarById(badge.avatarId);
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-2xl border border-emerald-400/50 bg-emerald-950/45 p-3"
                >
                  <img
                    src={av.localSrc}
                    alt={av.label}
                    className="h-11 w-11 rounded-xl object-cover"
                  />
                  <div className="text-xs">
                    <div className="inline-flex items-center gap-1 font-mono font-bold text-emerald-300">
                      <Award className="h-3.5 w-3.5" /> NEW NASA AVATAR UNLOCKED!
                    </div>
                    <div className="font-display text-sm font-bold text-white">
                      {badge.name} · {av.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Compact Telemetry Sparkline */}
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/75 p-3.5">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span>OUTPOST TELEMETRY RECORDER</span>
            <span className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1 text-amber-300">
                <Zap className="h-3 w-3" /> Power
              </span>
              <span className="inline-flex items-center gap-1 text-sky-300">
                <Wind className="h-3 w-3" /> Air
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <HeartPulse className="h-3 w-3" /> Health
              </span>
              <span className="inline-flex items-center gap-1 text-violet-300">
                <Sprout className="h-3 w-3" /> Food
              </span>
            </span>
          </div>
          <svg viewBox={`0 0 ${w} ${h}`} className="mt-1.5 h-22 w-full">
            <line
              x1="10"
              x2={w - 10}
              y1={yAt(25)}
              y2={yAt(25)}
              stroke="#fb7185"
              strokeDasharray="4 4"
              strokeOpacity="0.45"
            />
            <path d={line("power")} fill="none" stroke="#fbbf24" strokeWidth="2.2" />
            <path d={line("air")} fill="none" stroke="#38bdf8" strokeWidth="2.2" />
            <path d={line("health")} fill="none" stroke="#34d399" strokeWidth="2.2" />
            <path d={line("food")} fill="none" stroke="#a78bfa" strokeWidth="2.2" />
          </svg>
        </div>

        {/* Progressive Disclosure: Real NASA Science & Log */}
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-xs font-semibold text-sky-300 hover:border-slate-600"
        >
          <span>NASA Science Context & Flight Log ({score.incidents.length} events)</span>
          {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {detailsOpen && (
          <div className="mt-2.5 space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/85 p-4 text-xs text-slate-300">
            <p>{mission.whyItMatters}</p>

            {mission.usesOsdrGarden && (
              <div className="rounded-xl border border-emerald-400/30 bg-slate-950/70 p-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-300">
                    <Sprout className="h-3.5 w-3.5" /> NASA OSDR {OSDR_GARDEN_STUDY.id}
                  </span>
                  <RealGameChip kind="REAL" compact provenance={OSDR_GARDEN_SNAPSHOT.meta} />
                </div>
                <p className="mt-1 text-slate-200">{OSDR_GARDEN_STUDY.title}</p>
                <a
                  href={OSDR_GARDEN_STUDY.studyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sky-300 hover:underline"
                >
                  Open NASA OSDR Study <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {score.incidents.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                  <span>REAL SPACE-WEATHER & MISSION EVENTS</span>
                  <RealGameChip kind="REAL" compact provenance={solar.provenance} />
                </div>
                {score.incidents.map((inc, idx) => (
                  <div key={idx} className="rounded-lg bg-slate-950/70 px-2.5 py-1.5">
                    {inc}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onReplaySame}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-400 px-5 py-3 font-display text-sm font-bold text-slate-950 hover:bg-sky-300"
          >
            <RotateCcw className="h-4 w-4" />
            Fly Again
          </button>
          <button
            type="button"
            onClick={onAdjustLoadout}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 font-display text-sm font-bold text-white hover:bg-slate-700"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Re-Outfit Base
          </button>
          <button
            type="button"
            onClick={onReturnToHub}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 font-display text-sm font-semibold text-slate-300 hover:text-white"
          >
            Hub
          </button>
        </div>
      </div>
    </div>
  );
};
