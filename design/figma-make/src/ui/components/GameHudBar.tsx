import React from "react";
import {
  AlertTriangle,
  Clock,
  Compass,
  HeartPulse,
  Music,
  Pause,
  Sliders,
  Sprout,
  Sun,
  Volume2,
  VolumeX,
  Wind,
  Zap,
} from "lucide-react";
import type { MusicStatusSnapshot } from "../../audio/musicDirector";
import type { MeterId, Meters, SolarContext } from "../../engine/types";
import { RealGameChip } from "./RealGameChip";

export interface FloatingDelta {
  id: string;
  meter: MeterId;
  delta: number;
}

interface GameHudBarProps {
  contextLabel: string;
  showMeters: boolean;
  meters?: Meters;
  previewDeltas?: Partial<Record<MeterId, number>> | null;
  floatingDeltas?: FloatingDelta[];
  solar: SolarContext;
  muted: boolean;
  musicStatus: MusicStatusSnapshot;
  extraTime: boolean;
  judgeEnabled: boolean;
  inMission: boolean;
  onClickHomeOrPause: () => void;
  onOpenScienceMap: () => void;
  onToggleJudge: () => void;
  onToggleExtraTime: () => void;
  onToggleMute: () => void;
  onCycleTrack: () => void;
}

const METER_CFG: Array<{
  id: MeterId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  fillClass: string;
  textClass: string;
}> = [
  {
    id: "power",
    label: "Power",
    Icon: Zap,
    fillClass: "bg-amber-400",
    textClass: "text-amber-300",
  },
  { id: "air", label: "Air", Icon: Wind, fillClass: "bg-sky-400", textClass: "text-sky-300" },
  {
    id: "health",
    label: "Health",
    Icon: HeartPulse,
    fillClass: "bg-emerald-400",
    textClass: "text-emerald-300",
  },
  {
    id: "food",
    label: "Food",
    Icon: Sprout,
    fillClass: "bg-violet-400",
    textClass: "text-violet-300",
  },
];

export const GameHudBar: React.FC<GameHudBarProps> = ({
  contextLabel,
  showMeters,
  meters,
  previewDeltas,
  floatingDeltas = [],
  solar,
  muted,
  musicStatus,
  extraTime,
  judgeEnabled,
  inMission,
  onClickHomeOrPause,
  onOpenScienceMap,
  onToggleJudge,
  onToggleExtraTime,
  onToggleMute,
  onCycleTrack,
}) => {
  return (
    <header className="pointer-events-none relative z-30 w-full px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2.5">
        {/* Top-Left Command Pill */}
        <button
          type="button"
          onClick={onClickHomeOrPause}
          className="pointer-events-auto inline-flex min-h-11 items-center gap-2.5 rounded-full border border-slate-700/80 bg-slate-950/80 py-1.5 pr-4 pl-2 shadow-lg backdrop-blur-md transition hover:border-sky-400/60 hover:bg-slate-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
            {inMission ? <Pause className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
          </span>
          <div className="text-left">
            <div className="font-display text-xs font-bold tracking-wide text-white uppercase">
              {contextLabel}
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              {inMission ? "Space / Pause" : "Outpost Command"}
            </div>
          </div>
        </button>

        {/* Top-Center Compact Resource Meters */}
        {showMeters && meters && (
          <div
            className="pointer-events-auto order-3 flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-700/80 bg-slate-950/82 px-3 py-2 shadow-xl backdrop-blur-md sm:order-2 sm:w-auto sm:gap-4 sm:rounded-full sm:px-5"
            role="region"
            aria-label="Outpost Life Support Telemetry"
          >
            {METER_CFG.map(({ id, label, Icon, fillClass, textClass }) => {
              const val = meters[id];
              const low = val <= 24;
              const prev = previewDeltas?.[id];
              const activeFloat = floatingDeltas.find((f) => f.meter === id);

              return (
                <div
                  key={id}
                  className="relative flex min-w-16 flex-1 items-center gap-2 sm:w-28 sm:flex-none"
                  aria-label={`${label}: ${val} out of 100`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${low ? "text-rose-400" : textClass}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="truncate text-[11px] font-semibold text-slate-300">
                        {label}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          low ? "text-rose-300" : "text-white"
                        }`}
                      >
                        {low && <AlertTriangle className="mr-0.5 inline h-3 w-3 text-rose-400" />}
                        {val}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          low ? "bg-rose-400" : fillClass
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, val))}%` }}
                      />
                    </div>
                  </div>

                  {/* Hover Preview Pill */}
                  {typeof prev === "number" && prev !== 0 && !activeFloat && (
                    <span
                      className={`absolute -bottom-5 right-0 rounded-full bg-slate-900/95 px-1.5 py-0.5 font-mono text-[10px] font-bold shadow ${
                        prev > 0 ? "text-emerald-300" : "text-amber-300"
                      }`}
                    >
                      {prev > 0 ? `+${prev}` : prev}
                    </span>
                  )}

                  {/* Live Execution Floating Delta */}
                  {activeFloat && activeFloat.delta !== 0 && (
                    <span
                      key={activeFloat.id}
                      className={`animate-bounce absolute -bottom-6 right-0 rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold shadow-lg ${
                        activeFloat.delta > 0
                          ? "border-emerald-400/50 bg-emerald-950/90 text-emerald-300"
                          : "border-amber-400/50 bg-amber-950/90 text-amber-200"
                      }`}
                    >
                      {activeFloat.delta > 0 ? `+${activeFloat.delta}` : activeFloat.delta}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Top-Right Compact Controls */}
        <div className="pointer-events-auto order-2 flex items-center gap-1.5 sm:order-3">
          {/* Today's Sun + NASA Provenance */}
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-950/80 py-1 pr-1.5 pl-2.5 shadow-lg backdrop-blur-md md:inline-flex">
            <button
              type="button"
              onClick={onOpenScienceMap}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-200 hover:text-white"
              title="Open NASA Science & Provenance Map"
            >
              <Sun
                className={`h-3.5 w-3.5 ${
                  solar.level === "stormy"
                    ? "text-rose-300"
                    : solar.level === "active"
                      ? "text-amber-300"
                      : "text-emerald-300"
                }`}
              />
              <span className="capitalize">{solar.level} Sun</span>
            </button>
            <RealGameChip
              kind="REAL"
              compact
              provenance={solar.provenance}
              explanation="Derived from real NASA CCMC DONKI solar flare observations."
            />
          </div>

          {/* Judge Console Toggle */}
          <button
            type="button"
            onClick={onToggleJudge}
            aria-pressed={judgeEnabled}
            title="Judge & Demo Controls"
            className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3 font-mono text-xs font-semibold shadow-lg backdrop-blur-md transition ${
              judgeEnabled
                ? "border-amber-400 bg-amber-400/20 text-amber-200"
                : "border-slate-700/80 bg-slate-950/80 text-slate-300 hover:border-slate-500 hover:text-white"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Judge</span>
          </button>

          {/* 2x Alert Timer Toggle */}
          <button
            type="button"
            onClick={onToggleExtraTime}
            aria-pressed={extraTime}
            title="Double Storm Alert Timer (2x Accessibility)"
            className={`inline-flex h-10 items-center gap-1 rounded-full border px-2.5 font-mono text-xs font-semibold shadow-lg backdrop-blur-md transition ${
              extraTime
                ? "border-emerald-400/65 bg-emerald-500/20 text-emerald-200"
                : "border-slate-700/80 bg-slate-950/80 text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            2x
          </button>

          {/* Adaptive Soundtrack Switcher Pill */}
          <button
            type="button"
            onClick={onCycleTrack}
            title={
              muted || musicStatus.phase === "muted"
                ? "Soundtrack muted (unmute with Key M)"
                : musicStatus.phase === "breather"
                  ? "Space Silence Breather — click to switch track"
                  : `Playing: ${musicStatus.trackTitle} (${musicStatus.vibe}) — click to switch track or pause music`
            }
            aria-label="Switch background music track"
            className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[11px] font-semibold shadow-lg backdrop-blur-md transition ${
              !muted && (musicStatus.phase === "playing" || musicStatus.phase === "ducked")
                ? "border-sky-400/50 bg-slate-950/85 text-sky-200 hover:border-sky-300"
                : "border-slate-700/80 bg-slate-950/80 text-slate-400 hover:text-white"
            }`}
          >
            <Music
              className={`h-3.5 w-3.5 ${
                !muted && musicStatus.phase === "playing" ? "text-sky-300" : "text-slate-400"
              }`}
            />
            <span className="hidden lg:inline">
              {muted
                ? "Off"
                : musicStatus.phase === "breather" || musicStatus.phase === "alert-hush"
                  ? "Hush"
                  : musicStatus.trackTitle.split(" ")[0]}
            </span>
          </button>

          {/* Audio Mute */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute audio" : "Mute audio"}
            title="Toggle Audio (Key M)"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/80 text-slate-300 shadow-lg backdrop-blur-md transition hover:border-slate-500 hover:text-white"
          >
            {muted ? (
              <VolumeX className="h-4 w-4 text-rose-300" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
