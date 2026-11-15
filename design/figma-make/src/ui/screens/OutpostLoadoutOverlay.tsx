import React from "react";
import { ArrowLeft, BatteryCharging, Rocket, Shield, Sprout, Sun, Users } from "lucide-react";
import { getMission } from "../../content/missions";
import { SITES } from "../../content/sites";
import { LOADOUT_BUDGET, LOADOUT_COSTS } from "../../engine/config/balance";
import { loadoutPoints } from "../../engine/reducer";
import type { Body, Difficulty, Loadout, MissionTemplateId, SiteId } from "../../engine/types";
import { RealGameChip } from "../components/RealGameChip";

interface OutpostLoadoutOverlayProps {
  body: Body;
  missionId: MissionTemplateId;
  siteId: SiteId;
  difficulty: Difficulty;
  loadout: Loadout;
  onChangeLoadout: (next: Loadout) => void;
  onBack: () => void;
  onLaunchMission: () => void;
}

export const OutpostLoadoutOverlay: React.FC<OutpostLoadoutOverlayProps> = ({
  body,
  missionId,
  siteId,
  difficulty,
  loadout,
  onChangeLoadout,
  onBack,
  onLaunchMission,
}) => {
  const used = loadoutPoints(loadout);
  const overBudget = used > LOADOUT_BUDGET;
  const mission = getMission(body, missionId);
  const site = SITES[siteId];

  return (
    <div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-4 pt-2 pb-16 sm:px-6">
      {/* Top Sub-bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-950/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md hover:border-slate-500 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Change Mission
        </button>

        <div className="pointer-events-auto rounded-full border border-slate-700/80 bg-slate-950/80 px-4 py-1.5 font-mono text-xs text-slate-200 backdrop-blur-md">
          <span className="font-bold text-sky-300">{mission.title}</span> · {site.name} ·{" "}
          <span className="uppercase">{difficulty}</span>
        </div>
      </div>

      {/* Open 3D Outpost Viewport in Center */}
      <div className="my-auto py-12 text-center">
        <span className="inline-block rounded-full border border-sky-400/25 bg-slate-950/55 px-3 py-1 font-mono text-[11px] text-sky-200/90 backdrop-blur-xs">
          LIVE 3D LANDING PAD — Toggle gear below to outfit your base
        </span>
      </div>

      {/* Compact Bottom Hangar Dock */}
      <div className="pointer-events-auto rounded-3xl border border-slate-700/85 bg-slate-950/86 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
        {/* Budget Header */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-bold text-white">
              Outpost Supply Budget
            </span>
            <div className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: LOADOUT_BUDGET }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-4 rounded-xs ${
                    i < used ? (overBudget ? "bg-rose-400" : "bg-sky-400") : "bg-slate-800"
                  }`}
                />
              ))}
            </div>
            <span
              className={`font-mono text-sm font-bold ${
                overBudget ? "text-rose-300" : "text-sky-300"
              }`}
            >
              {used}/{LOADOUT_BUDGET} PTS
            </span>
            <RealGameChip
              kind="GAME"
              compact
              explanation="Max hardware costs 13 points, so fitting inside 10 points teaches real rocket payload trade-offs."
            />
          </div>

          {overBudget && (
            <span className="rounded-full bg-rose-500/20 px-3 py-1 font-mono text-xs font-bold text-rose-200">
              Over budget by {used - LOADOUT_BUDGET} pt — swap one module!
            </span>
          )}
        </div>

        {/* 4 Clean Hardware Columns + Launch CTA */}
        <div className="grid items-stretch gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          {/* 1. Crew */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-sky-300 uppercase">
              <Users className="h-3.5 w-3.5" /> Crew Size
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {([2, 3, 4] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChangeLoadout({ ...loadout, crew: c })}
                  className={`min-h-12 rounded-xl border p-1.5 text-center transition ${
                    loadout.crew === c
                      ? "border-sky-400 bg-sky-500/25 text-white"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="font-display text-sm font-bold">{c}</div>
                  <div className="font-mono text-[10px] text-amber-300">
                    {LOADOUT_COSTS.crew[c]}pt
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              {loadout.crew === 2
                ? "Saves Air & Food"
                : `-${(loadout.crew - 2) * 10}% EVA power, uses more Air`}
            </p>
          </div>

          {/* 2. Power */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-300 uppercase">
              <BatteryCharging className="h-3.5 w-3.5" /> Power Core
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onChangeLoadout({ ...loadout, power: "panels" })}
                className={`min-h-12 rounded-xl border p-2 text-left transition ${
                  loadout.power === "panels"
                    ? "border-sky-400 bg-sky-500/25 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="inline-flex items-center gap-1">
                    <Sun className="h-3 w-3 text-amber-300" /> Solar
                  </span>
                  <span className="font-mono text-[10px] text-amber-300">2pt</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onChangeLoadout({ ...loadout, power: "batteries" })}
                className={`min-h-12 rounded-xl border p-2 text-left transition ${
                  loadout.power === "batteries"
                    ? "border-sky-400 bg-sky-500/25 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Battery</span>
                  <span className="font-mono text-[10px] text-amber-300">3pt</span>
                </div>
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              {loadout.power === "panels"
                ? "70 start · Recharges in sun"
                : "100 start · Night-proof, 0 recharge"}
            </p>
          </div>

          {/* 3. Shielding */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-300 uppercase">
              <Shield className="h-3.5 w-3.5" /> Radiation Shield
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onChangeLoadout({ ...loadout, shield: "standard" })}
                className={`min-h-12 rounded-xl border p-2 text-left transition ${
                  loadout.shield === "standard"
                    ? "border-sky-400 bg-sky-500/25 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Standard</span>
                  <span className="font-mono text-[10px] text-amber-300">1pt</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onChangeLoadout({ ...loadout, shield: "reinforced" })}
                className={`min-h-12 rounded-xl border p-2 text-left transition ${
                  loadout.shield === "reinforced"
                    ? "border-sky-400 bg-sky-500/25 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Dome</span>
                  <span className="font-mono text-[10px] text-amber-300">3pt</span>
                </div>
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              {loadout.shield === "standard"
                ? "0 upkeep · Full space dose"
                : "-60% radiation · -3 Power/turn"}
            </p>
          </div>

          {/* 4. Food */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-violet-300 uppercase">
              <Sprout className="h-3.5 w-3.5" /> Food Supply
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onChangeLoadout({ ...loadout, food: "rations" })}
                className={`min-h-12 rounded-xl border p-2 text-left transition ${
                  loadout.food === "rations"
                    ? "border-sky-400 bg-sky-500/25 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Rations</span>
                  <span className="font-mono text-[10px] text-amber-300">1pt</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onChangeLoadout({ ...loadout, food: "hydroponics" })}
                className={`min-h-12 rounded-xl border p-2 text-left transition ${
                  loadout.food === "hydroponics"
                    ? "border-sky-400 bg-sky-500/25 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Biodome</span>
                  <span className="font-mono text-[10px] text-amber-300">3pt</span>
                </div>
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              {loadout.food === "rations"
                ? "100 Food ready from Turn 1"
                : "60 start · Harvests +Food Turn 3+"}
            </p>
          </div>

          {/* Start CTA */}
          <button
            type="button"
            disabled={overBudget}
            onClick={onLaunchMission}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-6 py-3 font-display text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none"
          >
            <Rocket className="h-5 w-5" />
            Start Mission
          </button>
        </div>
      </div>
    </div>
  );
};
