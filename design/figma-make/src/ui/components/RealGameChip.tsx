import React, { useState } from "react";
import { ExternalLink, Satellite, SlidersHorizontal, X } from "lucide-react";
import { getFact } from "../../data/facts";
import type { Provenance } from "../../engine/types";

interface RealGameChipProps {
  kind: "REAL" | "GAME";
  factId?: string;
  provenance?: Provenance;
  explanation?: string;
  compact?: boolean;
}

export const RealGameChip: React.FC<RealGameChipProps> = ({
  kind,
  factId,
  provenance,
  explanation,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const fact = factId ? getFact(factId) : undefined;

  const isReal = kind === "REAL";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title={isReal ? "Inspect verified NASA source" : "Inspect simulation rule"}
        className={`inline-flex items-center gap-1 rounded-full border font-mono tracking-wide transition hover:brightness-110 ${
          compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]"
        } ${
          isReal
            ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
            : "border-amber-400/35 bg-amber-500/12 text-amber-200"
        }`}
      >
        {isReal ? (
          <Satellite className="h-3 w-3 shrink-0 text-cyan-300" aria-hidden="true" />
        ) : (
          <SlidersHorizontal className="h-3 w-3 shrink-0 text-amber-300" aria-hidden="true" />
        )}
        <span className="font-semibold">{isReal ? "REAL" : "GAME RULE"}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={isReal ? "Verified NASA Data Source" : "Simulation Design Rule"}
        >
          <div
            className="console-panel w-full max-w-md rounded-2xl p-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold ${
                    isReal
                      ? "border-cyan-400/45 bg-cyan-500/15 text-cyan-200"
                      : "border-amber-400/45 bg-amber-500/15 text-amber-200"
                  }`}
                >
                  {isReal ? (
                    <Satellite className="h-3.5 w-3.5 text-cyan-300" />
                  ) : (
                    <SlidersHorizontal className="h-3.5 w-3.5 text-amber-300" />
                  )}
                  {isReal ? "REAL NASA PROVENANCE" : "GAME DESIGN RULE"}
                </span>
                {isReal && provenance && (
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${
                      provenance.isLive
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-slate-700/80 text-slate-200"
                    }`}
                  >
                    {provenance.isLive ? "LIVE FEED" : "BUNDLED SNAPSHOT"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white"
                aria-label="Close source details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isReal ? (
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                {fact && (
                  <>
                    <p className="font-display text-base font-semibold text-white">{fact.label}</p>
                    <p className="leading-relaxed text-slate-300">{fact.text}</p>
                    <div className="console-subpanel rounded-xl p-3 font-mono text-xs text-slate-300">
                      <div>Source: {fact.sourceName}</div>
                      <div className="mt-1 text-emerald-300">
                        Verification: Human-verified reference
                      </div>
                    </div>
                    <a
                      href={fact.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/25"
                    >
                      Open Official NASA Reference
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </>
                )}

                {provenance && (
                  <>
                    {explanation && <p className="leading-relaxed text-slate-300">{explanation}</p>}
                    <div className="console-subpanel space-y-1.5 rounded-xl p-3 font-mono text-xs text-slate-300">
                      <div>
                        <span className="text-slate-400">Dataset:</span> {provenance.source}
                      </div>
                      <div>
                        <span className="text-slate-400">Fetched UTC:</span> {provenance.fetchedAt}
                      </div>
                      {provenance.credit && (
                        <div>
                          <span className="text-slate-400">Credit:</span> {provenance.credit}
                        </div>
                      )}
                      {provenance.note && (
                        <div>
                          <span className="text-slate-400">Window:</span> {provenance.note}
                        </div>
                      )}
                    </div>
                    <a
                      href={provenance.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/25"
                    >
                      Inspect NASA Endpoint / Archive
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p className="font-display text-base font-semibold text-white">
                  Playable Engineering Trade-Off
                </p>
                <p className="leading-relaxed">
                  {explanation ??
                    "This number is a simplified simulation rule designed so a multi-day space expedition plays out in six clear tactical turns while preserving real cause-and-effect trade-offs."}
                </p>
                <div className="console-subpanel rounded-xl p-3 text-xs text-amber-200/90">
                  Why label it? Scientific honesty means separating verified NASA records (REAL)
                  from game-balance math (GAME RULE).
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
