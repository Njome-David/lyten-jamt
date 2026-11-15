import React, { useState } from "react";
import { Award, Check, Flame, Lock, UserCheck, X } from "lucide-react";
import { BADGES } from "../../content/badges";
import { AVATARS, getAvatarById } from "../../data/provenance";
import type { SaveV1 } from "../../engine/types";
import { rankForXp } from "../../progress/save";

interface ProfileLockerModalProps {
  save: SaveV1;
  onUpdateProfile: (codename: string, avatarId: string) => void;
  onClose: () => void;
}

export const ProfileLockerModal: React.FC<ProfileLockerModalProps> = ({
  save,
  onUpdateProfile,
  onClose,
}) => {
  const [name, setName] = useState(save.profile.codename);
  const [saved, setSaved] = useState(false);
  const rank = rankForXp(save.xp);
  const currentAvatar = getAvatarById(save.profile.avatarId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim().slice(0, 20) || "Cmdr. Nova";
    setName(clean);
    onUpdateProfile(clean, save.profile.avatarId);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Commander Locker and NASA Badges"
    >
      <div
        className="console-panel max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-semibold text-sky-300 uppercase">
              COMMANDER LOCKER
            </span>
            <h2 className="font-display text-2xl font-bold text-white">
              Astronaut ID & NASA Badges
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Close Locker"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ID Strip */}
        <div className="console-subpanel mt-4 flex items-center gap-4 rounded-2xl p-4">
          <img
            src={currentAvatar.localSrc}
            alt={currentAvatar.label}
            className="h-18 w-18 shrink-0 rounded-2xl border-2 border-sky-400/60 object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-300">{rank.title}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[11px] text-amber-200">
                <Flame className="h-3 w-3 text-amber-300" />
                {save.streak.count}d Streak · {save.xp} XP
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                aria-label="Astronaut Codename"
                className="min-h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-display text-sm font-bold text-white focus:border-sky-400"
              />
              <button
                type="submit"
                className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl bg-sky-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-sky-300"
              >
                {saved ? <Check className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                {saved ? "Saved" : "Save"}
              </button>
            </form>
          </div>
        </div>

        {/* NASA Avatar Shelf */}
        <div className="mt-5">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 uppercase">
              <Award className="h-3.5 w-3.5 text-sky-300" />
              Official NASA Mission Portraits
            </span>
            <span>
              {1 + save.badges.length}/{AVATARS.length} Unlocked
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {AVATARS.map((av) => {
              const unlocked = av.badgeId === null || save.badges.includes(av.badgeId);
              const selected = save.profile.avatarId === av.id;
              const badge = BADGES.find((b) => b.id === av.badgeId);
              return (
                <button
                  key={av.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onUpdateProfile(name.trim() || save.profile.codename, av.id)}
                  className={`flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition ${
                    selected
                      ? "border-sky-400 bg-sky-500/20"
                      : unlocked
                        ? "border-slate-700/80 bg-slate-900/75 hover:border-slate-500"
                        : "cursor-not-allowed border-slate-800 bg-slate-950/60 opacity-55"
                  }`}
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                    <img src={av.localSrc} alt={av.label} className="h-full w-full object-cover" />
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75">
                        <Lock className="h-4 w-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-white">{av.label}</div>
                    <div className="truncate text-[10px] text-slate-400">
                      {unlocked ? `NASA ${av.nasaId}` : (badge?.conditionText ?? "Locked")}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
