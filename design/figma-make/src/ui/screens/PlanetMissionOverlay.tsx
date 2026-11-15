import React from "react";
import { ArrowLeft, ArrowRight, Compass, Radio, Sprout, Star } from "lucide-react";
import { ARCHETYPES } from "../../content/archetypes";
import { getMissionsForBody } from "../../content/missions";
import { getSitesForBody } from "../../content/sites";
import { OSDR_GARDEN_SNAPSHOT } from "../../data/provenance";
import { DIFFICULTY_CONFIG } from "../../engine/config/difficulty";
import type { Body, Difficulty, MissionTemplateId, SaveV1, SiteId } from "../../engine/types";
import { RealGameChip } from "../components/RealGameChip";

interface PlanetMissionOverlayProps {
  body: Body;
  missionId: MissionTemplateId;
  siteId: SiteId;
  difficulty: Difficulty;
  save: SaveV1;
  onSelectBody: (b: Body) => void;
  onSelectMission: (m: MissionTemplateId) => void;
  onSelectSite: (s: SiteId) => void;
  onSelectDifficulty: (d: Difficulty) => void;
  onBack: () => void;
  onProceedToLoadout: () => void;
}

export const PlanetMissionOverlay: React.FC<PlanetMissionOverlayProps> = ({
  body,
  missionId,
  siteId,
  difficulty,
  save,
  onSelectBody,
  onSelectMission,
  onSelectSite,
  onSelectDifficulty,
  onBack,
  onProceedToLoadout,
}) => {
  const missions = getMissionsForBody(body);
  const sites = getSitesForBody(body);
  const diffCfg = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between gap-4 px-4 pt-2 pb-20 sm:px-6">
      {/* Top World Switcher Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-950/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md hover:border-slate-500 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Command Hub
        </button>

        <div
          className="pointer-events-auto inline-flex rounded-full border border-slate-700/85 bg-slate-950/85 p-1 shadow-xl backdrop-blur-md"
          role="tablist"
          aria-label="Target World"
        >
          <button
            type="button"
            role="tab"
            aria-selected={body === "moon"}
            onClick={() => onSelectBody("moon")}
            className={`min-h-10 rounded-full px-5 py-1.5 font-display text-sm font-bold transition ${
              body === "moon"
                ? "bg-sky-400 text-slate-950 shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            The Moon · ~1.3s Radio
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={body === "mars"}
            onClick={() => onSelectBody("mars")}
            className={`min-h-10 rounded-full px-5 py-1.5 font-display text-sm font-bold transition ${
              body === "mars"
                ? "bg-orange-400 text-slate-950 shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Mars · 3–22m Radio
          </button>
        </div>

        <div className="hidden w-24 sm:block" />
      </div>

      {/* Two Clean Side Docks Framing the 3D Rotating Planet */}
      <div className="my-auto grid items-end gap-4 lg:grid-cols-[1.08fr_1fr_0.98fr]">
        {/* Left Dock: 5 Compact Expedition Cards */}
        <div className="pointer-events-auto rounded-3xl border border-slate-700/80 bg-slate-950/78 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <span className="font-mono text-xs font-bold tracking-wider text-sky-300 uppercase">
              1. Pick Expedition
            </span>
            <span className="font-mono text-[11px] text-slate-400">6 Steps</span>
          </div>

          <div className="space-y-2">
            {missions.map((m) => {
              const selected = m.id === missionId;
              const best = save.best[m.key] ?? {};
              const maxStars = Math.max(0, best.easy ?? 0, best.medium ?? 0, best.hard ?? 0);

              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => onSelectMission(m.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    selected
                      ? body === "moon"
                        ? "border-sky-400 bg-sky-500/18"
                        : "border-orange-400 bg-orange-500/18"
                      : "border-slate-800/90 bg-slate-900/65 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-white">{m.title}</span>
                      {m.recommended && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                          STARTER
                        </span>
                      )}
                      {m.usesOsdrGarden && (
                        <Sprout
                          className="h-3.5 w-3.5 text-emerald-300"
                          aria-label="NASA OSDR Plant Study"
                        />
                      )}
                    </div>

                    {maxStars > 0 && (
                      <span className="inline-flex items-center gap-0.5">
                        {[0, 1, 2].map((i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < maxStars ? "fill-amber-300 text-amber-300" : "text-slate-700"
                            }`}
                          />
                        ))}
                      </span>
                    )}
                  </div>

                  {selected && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs leading-relaxed text-slate-200">{m.objective}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        {m.steps.map((arch, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-slate-950/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-300"
                          >
                            {idx + 1}.{ARCHETYPES[arch].name.split(" ")[0]}
                          </span>
                        ))}
                        {m.usesOsdrGarden && (
                          <RealGameChip
                            kind="REAL"
                            compact
                            provenance={OSDR_GARDEN_SNAPSHOT.meta}
                            explanation="Inspired by real NASA ISS lettuce crop experiments (OSDR Study OSD-745)."
                          />
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Window Left Open for the 3D Planet! */}
        <div className="hidden lg:block" />

        {/* Right Dock: Landing Zone + Intensity + Launch Pad CTA */}
        <div className="pointer-events-auto space-y-3 rounded-3xl border border-slate-700/80 bg-slate-950/78 p-4 shadow-2xl backdrop-blur-xl">
          {/* Landing Zone */}
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-sky-300 uppercase">
                <Compass className="h-3.5 w-3.5" />
                2. Landing Zone
              </span>
              <RealGameChip
                kind="REAL"
                compact
                factId={body === "moon" ? "shackleton-sun" : "jezero-delta"}
              />
            </div>

            <div className="space-y-2">
              {sites.map((s) => {
                const active = s.id === siteId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectSite(s.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      active
                        ? "border-cyan-400 bg-cyan-500/18"
                        : "border-slate-800 bg-slate-900/65 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-white">{s.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {s.regionTag.split("·")[0]}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-amber-200">
                      {s.modifierSummary}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Pills */}
          <div className="border-t border-slate-800/90 pt-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-mono text-xs font-bold tracking-wider text-sky-300 uppercase">
                3. Challenge Mode
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {diffCfg.timerSec}s Storm Timer
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "easy", label: "Cadet" },
                  { id: "medium", label: "Specialist" },
                  { id: "hard", label: "Director" },
                ] as const
              ).map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => onSelectDifficulty(tier.id)}
                  className={`min-h-10 rounded-xl border font-display text-xs font-bold transition ${
                    difficulty === tier.id
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                      : "border-slate-800 bg-slate-900/75 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-2 font-mono text-[11px] text-slate-300">
              <Radio className="h-3.5 w-3.5 shrink-0 text-sky-300" />
              {body === "moon"
                ? "Instant Houston radio (~1.28s)"
                : `Mars radio delay: ${diffCfg.delayTurnsMars} turn (${diffCfg.marsDelayRealLabel.split(" ")[0]}m)`}
            </div>
          </div>

          {/* Continue to 3D Base Pad */}
          <button
            type="button"
            onClick={onProceedToLoadout}
            className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-300 px-5 py-3 font-display text-base font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:brightness-110"
          >
            Outfit 3D Outpost
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
