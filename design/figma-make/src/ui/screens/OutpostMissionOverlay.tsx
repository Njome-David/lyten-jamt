import React, { useEffect, useMemo } from "react";
import {
  Check,
  CloudLightning,
  FastForward,
  Gauge,
  Moon,
  Radio,
  Shield,
  ShieldAlert,
  Sprout,
  Wind,
  Zap,
} from "lucide-react";
import { playSfx } from "../../audio/sfx";
import { ARCHETYPES } from "../../content/archetypes";
import { MISSION_CONTROL_HINTS } from "../../content/guideLines";
import { getMission } from "../../content/missions";
import { DIFFICULTY_CONFIG } from "../../engine/config/difficulty";
import { computeOptionPreview } from "../../engine/reducer";
import type { Archetype, MeterId, OptionStyle, RunState, SolarContext } from "../../engine/types";
import type { ExecutionVisualState } from "../../three/OutpostScene3D";
import { AlertOverlay } from "../components/AlertOverlay";
import { RealGameChip } from "../components/RealGameChip";

interface OutpostMissionOverlayProps {
  run: RunState;
  solar: SolarContext;
  paused: boolean;
  extraTime: boolean;
  execution: ExecutionVisualState | null;
  onHoverPreview: (deltas: Partial<Record<MeterId, number>> | null) => void;
  onStartExecution: (style: OptionStyle) => void;
  onSkipExecution: () => void;
  onAlertChoice: (choice: "A" | "B" | "C" | "EXPIRED") => void;
  onAskMissionControl: (hintText: string) => void;
  onTogglePause: () => void;
  onAutoPause: () => void;
}

function describeLivePhase(archetype: Archetype, style: OptionStyle, progress: number): string {
  if (progress < 0.38) {
    switch (archetype) {
      case "travel":
        return style === "fast"
          ? "Rover accelerating at full battery draw across crater rim..."
          : style === "careful"
            ? "Rover sweeping green lidar beam to dodge sharp boulders..."
            : "Rover cruising along marked surface waypoints...";
      case "deploy":
        return "Astronauts hauling modular equipment onto the surface pad...";
      case "drill":
        return style === "fast"
          ? "Rotary drill boring at maximum torque into dense rock..."
          : "Stepping drill bit gently into ancient subsurface layers...";
      case "experiment":
        return "Pressurized lab running spectrometer and sample chambers...";
      case "repair":
        return "Crew inspecting dust seals, power couplings, and air filters...";
      case "uplink":
        return "High-gain parabolic dish slewing skyward toward Earth...";
    }
  }
  if (progress < 0.75) {
    return style === "fast"
      ? "High-wattage motors spiking power while saving crew breathing time..."
      : style === "careful"
        ? "Conserving battery power as longer EVA shift draws cabin oxygen..."
        : "Balancing solar generation, life support, and radiation shielding...";
  }
  return "Verifying outpost telemetry and logging step sensors...";
}

export const OutpostMissionOverlay: React.FC<OutpostMissionOverlayProps> = ({
  run,
  solar,
  paused,
  extraTime,
  execution,
  onHoverPreview,
  onStartExecution,
  onSkipExecution,
  onAlertChoice,
  onAskMissionControl,
  onTogglePause,
  onAutoPause,
}) => {
  const mission = getMission(run.body, run.missionId);
  const diffCfg = DIFFICULTY_CONFIG[run.difficulty];
  const currentIdx = Math.min(run.stepIndex, mission.steps.length - 1);
  const currentArch = mission.steps[currentIdx];
  const archMeta = ARCHETYPES[currentArch];
  const stepText = mission.stepDescriptions[currentIdx];

  const previews = useMemo(
    () => ({
      fast: computeOptionPreview(run, currentArch, "fast", solar),
      balanced: computeOptionPreview(run, currentArch, "balanced", solar),
      careful: computeOptionPreview(run, currentArch, "careful", solar),
    }),
    [run, currentArch, solar],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

      if (e.code === "Space" || e.key === "Escape") {
        e.preventDefault();
        onTogglePause();
        return;
      }
      if (paused) return;

      if (run.activeAlert) {
        if (e.key === "1" || e.key.toUpperCase() === "A") {
          e.preventDefault();
          playSfx("confirm");
          onAlertChoice("A");
        } else if (e.key === "2" || e.key.toUpperCase() === "B") {
          e.preventDefault();
          playSfx("confirm");
          onAlertChoice("B");
        } else if (e.key === "3" || e.key.toUpperCase() === "C") {
          e.preventDefault();
          playSfx("confirm");
          onAlertChoice("C");
        }
        return;
      }

      if (execution?.active) return;

      if (e.key === "1") {
        e.preventDefault();
        onStartExecution("fast");
      } else if (e.key === "2") {
        e.preventDefault();
        onStartExecution("balanced");
      } else if (e.key === "3") {
        e.preventDefault();
        onStartExecution("careful");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paused, run.activeAlert, execution, onAlertChoice, onStartExecution, onTogglePause]);

  const lunarNight = run.siteId === "tranquillitatis" && run.stepIndex >= 3;

  return (
    <div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-between px-3 pt-2 pb-16 sm:px-6">
      {/* Minimal Top Step Pips + Active Weather Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-950/75 px-3.5 py-1.5 backdrop-blur-md">
          {Array.from({ length: run.totalSteps }).map((_, idx) => {
            const done = idx < run.stepIndex;
            const cur = idx === run.stepIndex;
            return (
              <span
                key={idx}
                className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                  cur
                    ? "bg-sky-400 text-slate-950"
                    : done
                      ? "bg-emerald-500/30 text-emerald-300"
                      : "bg-slate-800 text-slate-500"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : idx + 1}
              </span>
            );
          })}
          <span className="ml-1.5 font-mono text-xs text-slate-300">{mission.title}</span>
        </div>

        {lunarNight && (
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/50 bg-indigo-950/85 px-3 py-1 font-mono text-xs text-indigo-200 backdrop-blur-md">
            <Moon className="h-3.5 w-3.5" /> Lunar Night · 0 Solar
          </span>
        )}
        {run.flags.dustTurnsLeft > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/50 bg-orange-950/85 px-3 py-1 font-mono text-xs text-orange-200 backdrop-blur-md">
            <CloudLightning className="h-3.5 w-3.5" /> Dust Squall · 50% Sun
          </span>
        )}
        {run.flags.blackoutTurnsLeft > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/50 bg-rose-950/85 px-3 py-1 font-mono text-xs text-rose-200 backdrop-blur-md">
            <ShieldAlert className="h-3.5 w-3.5" /> Radio Blackout
          </span>
        )}
      </div>

      {/* Center Left Wide Open so 3D Outpost Crew, Rover, Drill & Weather Shine! */}
      <div className="my-auto" />

      {/* Bottom Floating Command Deck */}
      {execution && execution.active ? (
        /* STATE B: LIVE TIME-BASED EXECUTION TIMELINE */
        <div className="pointer-events-auto mx-auto w-full max-w-2xl rounded-3xl border border-sky-400/55 bg-slate-950/86 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-xs font-bold tracking-wider text-sky-300 uppercase">
                EXECUTING STEP {run.stepIndex + 1} · {execution.style.toUpperCase()} APPROACH
              </div>
              <div className="mt-1 font-display text-base font-bold text-white sm:text-lg">
                {describeLivePhase(execution.archetype, execution.style, execution.progress)}
              </div>
            </div>

            <button
              type="button"
              onClick={onSkipExecution}
              className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-300 hover:border-slate-500 hover:text-white"
            >
              Skip <FastForward className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3.5 h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 transition-none"
              style={{ width: `${Math.round(execution.progress * 100)}%` }}
            />
          </div>
        </div>
      ) : (
        /* STATE A: CLEAN COMMAND SELECTION DOCK */
        <div className="pointer-events-auto space-y-2.5">
          {/* Houston Transmission Banner (only when active/delivered) */}
          {(run.pendingAdvice || run.deliveredAdvice) && (
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-sky-400/35 bg-slate-950/85 px-4 py-2 text-xs text-sky-100 backdrop-blur-md">
              <span>
                <strong className="font-mono text-sky-300">HOUSTON: </strong>
                {run.pendingAdvice
                  ? `Signal crossing deep space... reply arrives on Turn ${run.pendingAdvice.arrivesOnTurn}.`
                  : run.deliveredAdvice?.text}
              </span>
            </div>
          )}

          <div className="rounded-3xl border border-slate-700/85 bg-slate-950/84 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
            {/* Step Header + Compact Houston Radio Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-300 uppercase">
                    Step {run.stepIndex + 1}/{run.totalSteps} · {archMeta.name}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                    {previews.balanced.outdoor ? "Outdoor EVA" : "Indoor Habitat"}
                  </span>
                </div>
                <p className="mt-0.5 font-display text-sm font-medium text-slate-100 sm:text-base">
                  {stepText}
                </p>
              </div>

              {/* Radio Houston Pill */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={run.flags.blackoutTurnsLeft > 0 || Boolean(run.pendingAdvice)}
                  onClick={() => {
                    playSfx("advice");
                    const hint =
                      MISSION_CONTROL_HINTS[
                        (run.turn + run.stepIndex) % MISSION_CONTROL_HINTS.length
                      ];
                    onAskMissionControl(hint);
                  }}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1 font-mono text-xs font-semibold text-sky-200 transition hover:bg-sky-500/25 disabled:opacity-45"
                >
                  <Radio className="h-3.5 w-3.5" />
                  {run.body === "moon"
                    ? "Ping Houston (~1.3s)"
                    : `Ping Houston (${diffCfg.delayTurnsMars}t delay)`}
                </button>
                <RealGameChip
                  kind="REAL"
                  compact
                  factId={run.body === "moon" ? "moon-delay" : "mars-delay"}
                />
              </div>
            </div>

            {/* 3 Streamlined Game Approach Cards */}
            <div className="mt-3.5 grid gap-2.5 sm:grid-cols-3">
              {(
                [
                  {
                    style: "fast",
                    badge: "Fast Rush",
                    Icon: Zap,
                    accent: "border-amber-400/40 hover:border-amber-300",
                    iconCol: "text-amber-300 bg-amber-500/15",
                  },
                  {
                    style: "balanced",
                    badge: "Steady Pace",
                    Icon: Gauge,
                    accent: "border-sky-400/40 hover:border-sky-300",
                    iconCol: "text-sky-300 bg-sky-500/15",
                  },
                  {
                    style: "careful",
                    badge: "Careful Scan",
                    Icon: Shield,
                    accent: "border-emerald-400/40 hover:border-emerald-300",
                    iconCol: "text-emerald-300 bg-emerald-500/15",
                  },
                ] as const
              ).map(({ style, badge, Icon, accent, iconCol }, idx) => {
                const p = previews[style];
                const label = archMeta.optionLabels[style];

                return (
                  <button
                    key={style}
                    type="button"
                    onMouseEnter={() =>
                      onHoverPreview({
                        power: p.netPower,
                        air: p.netAir,
                        health: -p.estimatedDose,
                        food: p.netFood,
                      })
                    }
                    onMouseLeave={() => onHoverPreview(null)}
                    onFocus={() =>
                      onHoverPreview({
                        power: p.netPower,
                        air: p.netAir,
                        health: -p.estimatedDose,
                        food: p.netFood,
                      })
                    }
                    onBlur={() => onHoverPreview(null)}
                    onClick={() => {
                      onHoverPreview(null);
                      onStartExecution(style);
                    }}
                    className={`group flex flex-col justify-between rounded-2xl border bg-slate-900/85 p-3.5 text-left transition hover:bg-slate-800/90 ${accent}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-lg ${iconCol}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-display text-xs font-bold text-white uppercase">
                            {badge}
                          </span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">[{idx + 1}]</span>
                      </div>
                      <div className="mt-1.5 font-display text-sm font-bold text-slate-100 group-hover:text-white">
                        {label.title}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400">{label.subtitle}</p>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/90 px-2 py-0.5 text-amber-300">
                        <Zap className="h-3 w-3" />
                        {p.netPower >= 0 ? `+${p.netPower}` : p.netPower}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/90 px-2 py-0.5 text-sky-300">
                        <Wind className="h-3 w-3" />
                        {p.netAir >= 0 ? `+${p.netAir}` : p.netAir}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/90 px-2 py-0.5 text-violet-300">
                        <Sprout className="h-3 w-3" />
                        {p.netFood >= 0 ? `+${p.netFood}` : p.netFood}
                      </span>
                      <span className="ml-auto text-[10px] text-slate-400">
                        {Math.round(p.faultRisk * 100)}% fault
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Storm / Fault Card */}
      {run.activeAlert && (
        <div className="pointer-events-auto">
          <AlertOverlay
            alert={run.activeAlert}
            body={run.body}
            extraTime={extraTime}
            paused={paused}
            onChoose={onAlertChoice}
            onAutoPauseHidden={onAutoPause}
          />
        </div>
      )}
    </div>
  );
};
