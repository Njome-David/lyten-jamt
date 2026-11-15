import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock, ShieldAlert, Wrench } from "lucide-react";
import { playSfx } from "../../audio/sfx";
import type { AlertSpec, Body } from "../../engine/types";
import { RealGameChip } from "./RealGameChip";

interface AlertOverlayProps {
  alert: AlertSpec;
  body: Body;
  extraTime: boolean;
  paused: boolean;
  onChoose: (choice: "A" | "B" | "C" | "EXPIRED") => void;
  onAutoPauseHidden: () => void;
}

export const AlertOverlay: React.FC<AlertOverlayProps> = ({
  alert,
  body,
  extraTime,
  paused,
  onChoose,
  onAutoPauseHidden,
}) => {
  const totalMs = alert.timed ? alert.durationSec * (extraTime ? 2 : 1) * 1000 : 0;
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const lastFrameRef = useRef<number | null>(null);
  const lastTickSecRef = useRef<number | null>(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    setRemainingMs(totalMs);
    lastFrameRef.current = null;
    lastTickSecRef.current = null;
    resolvedRef.current = false;
    playSfx("alert");
  }, [alert, totalMs]);

  // Pause automatically if browser tab becomes hidden
  useEffect(() => {
    const onVisChange = () => {
      if (document.hidden && alert.timed) {
        onAutoPauseHidden();
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, [alert.timed, onAutoPauseHidden]);

  // performance.now() delta timer
  useEffect(() => {
    if (!alert.timed || paused || resolvedRef.current) {
      lastFrameRef.current = null;
      return;
    }

    let rafId = 0;
    const step = (now: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = now;
      }
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;

      setRemainingMs((prev) => {
        const next = Math.max(0, prev - delta);
        const secLeft = Math.ceil(next / 1000);
        if (secLeft <= 5 && secLeft > 0 && lastTickSecRef.current !== secLeft) {
          lastTickSecRef.current = secLeft;
          playSfx("tick");
        }
        if (next <= 0 && !resolvedRef.current) {
          resolvedRef.current = true;
          window.setTimeout(() => onChoose("EXPIRED"), 0);
        }
        return next;
      });

      if (!resolvedRef.current) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [alert.timed, paused, onChoose]);

  const pct = totalMs > 0 ? Math.max(0, Math.min(100, (remainingMs / totalMs) * 100)) : 100;
  const secDisplay = (remainingMs / 1000).toFixed(1);

  const Icon =
    alert.kind === "flare" ? ShieldAlert : alert.kind === "dust" ? AlertTriangle : Wrench;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-labelledby="alert-heading"
    >
      <div className="console-panel w-full max-w-2xl rounded-3xl border-2 border-amber-400/65 p-5 shadow-2xl sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/25 px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-amber-200">
                  ALERT
                </span>
                {alert.flare && alert.flareProvenance && (
                  <RealGameChip
                    kind="REAL"
                    provenance={alert.flareProvenance}
                    explanation={`Real solar flare ${alert.flare.classType} peaking at ${alert.flare.peakTime}${
                      alert.flare.activeRegionNum
                        ? ` from Active Region ${alert.flare.activeRegionNum}`
                        : ""
                    }.`}
                  />
                )}
              </div>
              <h2 id="alert-heading" className="mt-1 font-display text-xl font-bold text-white">
                {alert.title}
              </h2>
            </div>
          </div>

          {alert.timed ? (
            <div className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-slate-900/90 px-3.5 py-2 font-mono">
              <Clock className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <span className="text-base font-bold text-amber-200">{secDisplay}s</span>
              {extraTime && <span className="text-[11px] text-cyan-300">(2x)</span>}
            </div>
          ) : (
            <span className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 font-mono text-xs text-slate-300">
              UNTIMED DECISION
            </span>
          )}
        </div>

        {/* Countdown Bar */}
        {alert.timed && (
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 transition-none"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        <p className="mt-4 text-sm leading-relaxed text-slate-200 sm:text-base">
          {alert.description}
        </p>

        {/* Real NASA Flare Telemetry Strip */}
        {alert.flare && (
          <div className="console-subpanel mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl px-3.5 py-2.5 font-mono text-xs text-cyan-200">
            <span>CLASS: {alert.flare.classType}</span>
            <span>PEAK: {alert.flare.peakTime}</span>
            <span>
              REGION: {alert.flare.activeRegionNum ? `AR ${alert.flare.activeRegionNum}` : "Disk"}
            </span>
          </div>
        )}

        {alert.timed && body === "mars" && (
          <p className="mt-2.5 font-mono text-xs text-amber-200/90">
            ASTRO-7: Earth radio delay exceeds this storm window — your crew must decide locally!
          </p>
        )}

        {/* Choices A / B / C */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {alert.choices.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                if (resolvedRef.current) return;
                resolvedRef.current = true;
                playSfx("confirm");
                onChoose(c.id);
              }}
              className="group flex min-h-32 flex-col justify-between rounded-2xl border border-slate-700/90 bg-slate-900/90 p-4 text-left transition hover:border-cyan-400/70 hover:bg-slate-800/90"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-400/20 font-mono text-xs font-bold text-amber-200">
                    {c.id}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">Key {idx + 1}</span>
                </div>
                <div className="mt-2 font-display text-sm font-bold text-white group-hover:text-cyan-200">
                  {c.label}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{c.summary}</p>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5">
                <span className="rounded-md bg-slate-800 px-2 py-1 font-mono text-[11px] font-semibold text-amber-200">
                  {c.tradeoffTag}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
