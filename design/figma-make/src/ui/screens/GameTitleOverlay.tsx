import React from "react";
import { Award, Play, Rocket, Satellite } from "lucide-react";
import { getAvatarById } from "../../data/provenance";
import type { SaveV1 } from "../../engine/types";
import { rankForXp } from "../../progress/save";

interface GameTitleOverlayProps {
  save: SaveV1;
  onPlayExpedition: () => void;
  onQuickDemo: () => void;
  onOpenLocker: () => void;
  onOpenScienceMap: () => void;
  onOpenCredits: () => void;
}

export const GameTitleOverlay: React.FC<GameTitleOverlayProps> = ({
  save,
  onPlayExpedition,
  onQuickDemo,
  onOpenLocker,
  onOpenScienceMap,
  onOpenCredits,
}) => {
  const avatar = getAvatarById(save.profile.avatarId);
  const rank = rankForXp(save.xp);

  return (
    <div className="pointer-events-none relative z-20 flex flex-1 flex-col justify-between px-4 pb-5 sm:px-8 sm:pb-7">
      {/* Center-Left Game Title Card (leaves right & center 3D Earth-Moon-Mars open!) */}
      <div className="my-auto max-w-lg pt-6">
        <div className="pointer-events-auto rounded-3xl border border-slate-700/75 bg-slate-950/72 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/35 bg-sky-500/15 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-sky-200 uppercase">
            <Satellite className="h-3.5 w-3.5 text-sky-300" />
            Outpost Commander Simulation
          </div>

          <h1 className="mt-3 font-display text-3xl leading-tight font-bold tracking-tight text-white sm:text-5xl">
            Junior Astronaut
            <span className="block bg-gradient-to-r from-sky-300 via-cyan-200 to-amber-300 bg-clip-text text-2xl text-transparent sm:text-3xl">
              Mission Trainer
            </span>
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            Build and command a living 3D Moon or Mars outpost powered by real NASA space-weather
            data.
          </p>

          {/* Primary Game Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onPlayExpedition}
              className="inline-flex min-h-13 flex-1 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-300 px-6 py-3.5 font-display text-base font-bold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:brightness-110"
            >
              <Rocket className="h-5 w-5" />
              Play Expedition
            </button>

            <button
              type="button"
              onClick={onQuickDemo}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-amber-400/50 bg-amber-400/15 px-5 py-3 font-display text-sm font-bold text-amber-200 transition hover:bg-amber-400/25"
            >
              <Play className="h-4 w-4" />
              Quick Play
            </button>
          </div>

          {/* Compact Commander Locker Strip */}
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-800/90 pt-4">
            <button
              type="button"
              onClick={onOpenLocker}
              className="group flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 py-1.5 pr-3.5 pl-1.5 text-left transition hover:border-sky-400/50"
            >
              <img
                src={avatar.localSrc}
                alt={avatar.label}
                className="h-10 w-10 rounded-xl object-cover"
              />
              <div>
                <div className="font-display text-xs font-bold text-white group-hover:text-sky-200">
                  {save.profile.codename}
                </div>
                <div className="font-mono text-[10px] text-sky-300">
                  {rank.title} · {save.xp} XP
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenLocker}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 font-mono text-xs font-semibold text-slate-200 hover:border-sky-400/50 hover:text-white"
            >
              <Award className="h-4 w-4 text-amber-300" />
              Badges ({save.badges.length}/5)
            </button>
          </div>
        </div>
      </div>

      {/* Minimal Legal & Credits Line at Bottom-Right */}
      <div className="pointer-events-auto ml-auto flex flex-wrap items-center gap-3 rounded-full border border-slate-800/80 bg-slate-950/70 px-4 py-1.5 text-[11px] text-slate-400 backdrop-blur-md">
        <span>NASA Space Apps 2026 · Not endorsed by NASA</span>
        <button
          type="button"
          onClick={onOpenScienceMap}
          className="font-semibold text-sky-300 hover:underline"
        >
          NASA Sources
        </button>
        <button
          type="button"
          onClick={onOpenCredits}
          className="font-semibold text-sky-300 hover:underline"
        >
          Credits
        </button>
      </div>
    </div>
  );
};
