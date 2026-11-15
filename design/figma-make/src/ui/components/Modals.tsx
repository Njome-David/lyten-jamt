import React from "react";
import {
  ExternalLink,
  Music,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Satellite,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { MusicStatusSnapshot } from "../../audio/musicDirector";
import { GLOSSARY } from "../../content/glossary";
import { AVATARS, buildScienceMap, OSDR_GARDEN_STUDY } from "../../data/provenance";
import type { ForcedEventKind, SolarContext } from "../../engine/types";

interface PauseOverlayProps {
  muted: boolean;
  musicStatus: MusicStatusSnapshot;
  extraTime: boolean;
  onToggleMute: () => void;
  onCycleTrack: () => void;
  onToggleExtraTime: () => void;
  onResume: () => void;
  onRestartMission: () => void;
  onExitToTitle: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  muted,
  musicStatus,
  extraTime,
  onToggleMute,
  onCycleTrack,
  onToggleExtraTime,
  onResume,
  onRestartMission,
  onExitToTitle,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Mission Paused"
    >
      <div className="console-panel w-full max-w-xl rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
              <Pause className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Simulation Paused</h2>
              <p className="text-xs text-slate-400">
                All step and storm countdown timers are frozen.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResume}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
          >
            <Play className="h-4 w-4" />
            Resume
          </button>
        </div>

        {/* Settings */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="console-subpanel flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-left text-sm text-slate-200 hover:border-slate-500"
          >
            <span className="flex items-center gap-2 font-medium">
              {muted ? (
                <VolumeX className="h-4 w-4 text-rose-300" />
              ) : (
                <Volume2 className="h-4 w-4 text-emerald-300" />
              )}
              Console Audio (Key M)
            </span>
            <span className="font-mono text-xs font-semibold text-cyan-300">
              {muted ? "MUTED" : "ON"}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleExtraTime}
            className="console-subpanel flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-left text-sm text-slate-200 hover:border-slate-500"
          >
            <span className="font-medium">Extra Alert Time (2x)</span>
            <span className="font-mono text-xs font-semibold text-cyan-300">
              {extraTime ? "ENABLED" : "STANDARD"}
            </span>
          </button>

          <button
            type="button"
            onClick={onCycleTrack}
            className="console-subpanel flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-left text-sm text-slate-200 hover:border-slate-500 sm:col-span-2"
          >
            <span className="flex items-center gap-2 font-medium">
              <Music className="h-4 w-4 text-sky-300" />
              Soundtrack (Click to Switch / Quiet Breather)
            </span>
            <span className="font-mono text-xs font-semibold text-sky-300">
              {muted
                ? "MUTED"
                : musicStatus.phase === "breather"
                  ? "SPACE BREATHER"
                  : `${musicStatus.trackTitle.toUpperCase()}`}
            </span>
          </button>
        </div>

        {/* Field Manual Glossary */}
        <div className="mt-5">
          <h3 className="font-mono text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Astronaut Field Glossary
          </h3>
          <div className="mt-2.5 grid max-h-52 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {GLOSSARY.map((g) => (
              <div key={g.id} className="console-subpanel rounded-xl p-3 text-xs">
                <div className="font-display font-bold text-cyan-300">{g.term}</div>
                <p className="mt-1 text-slate-300">{g.shortDef}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onRestartMission}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            Restart Expedition
          </button>
          <button
            type="button"
            onClick={onExitToTitle}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
          >
            Return to Astronaut Hub
          </button>
        </div>
      </div>
    </div>
  );
};

interface ScienceMapModalProps {
  solar: SolarContext;
  liveLoading: boolean;
  liveStatusNote: string | null;
  onTryLiveRefresh: () => void;
  onClose: () => void;
}

export const ScienceMapModal: React.FC<ScienceMapModalProps> = ({
  solar,
  liveLoading,
  liveStatusNote,
  onTryLiveRefresh,
  onClose,
}) => {
  const rows = buildScienceMap(solar.provenance);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Science and NASA Data Provenance Map"
    >
      <div
        className="console-panel max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/35 bg-cyan-500/15 px-3 py-1 font-mono text-xs font-semibold text-cyan-200">
              <Satellite className="h-3.5 w-3.5" />
              SCIENCE & PROVENANCE MAP
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">
              How Real NASA Data Drives the Simulation
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Every value shown in the trainer is tagged{" "}
              <strong className="text-cyan-300">REAL</strong> (verified NASA record) or{" "}
              <strong className="text-amber-300">GAME RULE</strong> (calibrated 6-step trade-off).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white"
            aria-label="Close Science Map"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Optional Live DONKI Refresh */}
        <div className="console-subpanel mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3.5">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-white">Active Solar Feed: </span>
            <span className="font-mono text-cyan-300">
              {solar.provenance.isLive ? "LIVE CCMC DONKI" : "BUNDLED SNAPSHOT"}
            </span>{" "}
            · Fetched {solar.provenance.fetchedAt.slice(0, 16).replace("T", " ")} UTC
            {liveStatusNote && <div className="mt-1 text-amber-200">{liveStatusNote}</div>}
          </div>
          <button
            type="button"
            disabled={liveLoading}
            onClick={onTryLiveRefresh}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-3.5 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${liveLoading ? "animate-spin" : ""}`} />
            {liveLoading ? "Checking CCMC DONKI..." : "Try Live DONKI Sync (3s)"}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="console-subpanel rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-white">{row.dataset}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                    row.provenance.isLive
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-800 text-cyan-200"
                  }`}
                >
                  {row.provenance.isLive ? "LIVE" : "BUNDLED"} ·{" "}
                  {row.provenance.fetchedAt.slice(0, 10)}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-300">
                <strong className="text-cyan-300">Verified Data:</strong> {row.realValueSummary}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                <strong className="text-amber-300">Simulation Rule Driven:</strong>{" "}
                {row.gameRuleDriven}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-400">
                <span>Credit: {row.provenance.credit ?? row.provenance.source}</span>
                <a
                  href={row.provenance.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-300 hover:underline"
                >
                  Source Endpoint <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CreditsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="NASA Image and Data Credits"
    >
      <div
        className="console-panel max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              NASA Data & Image Attributions
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Educational project built for NASA Space Apps 2026. Not affiliated with or endorsed by
              NASA.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white"
            aria-label="Close Credits"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-300">
          <p>
            • <strong>Space Weather Records:</strong> NASA Community Coordinated Modeling Center
            (CCMC) / Space Weather Database Of Notifications, Knowledge, Information (DONKI).
          </p>
          <p>
            • <strong>Space Biology Study ({OSDR_GARDEN_STUDY.id}):</strong>{" "}
            {OSDR_GARDEN_STUDY.title} — NASA Open Science Data Repository (OSDR).
          </p>
          <p>
            • <strong>Soundtrack Music:</strong> <em>Starlight Strut</em>, <em>Playful Pixels</em>,
            and <em>Arcade Overdrive</em> — free music generated with ElevenLabs.
          </p>
        </div>

        <h3 className="mt-5 font-mono text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Archival NASA Avatar Photographs
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {AVATARS.map((av) => (
            <div key={av.id} className="console-subpanel flex gap-3 rounded-2xl p-3">
              <img
                src={av.localSrc}
                alt={av.title}
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1 text-xs">
                <div className="truncate font-display font-bold text-white">{av.label}</div>
                <div className="truncate font-mono text-[11px] text-cyan-300">
                  NASA ID: {av.nasaId}
                </div>
                <div className="text-[11px] text-slate-400">Credit: {av.credit}</div>
                <a
                  href={av.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:underline"
                >
                  images.nasa.gov <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface JudgeBarProps {
  shortRun: boolean;
  demoProfileActive: boolean;
  stormReplayActive: boolean;
  forcedEvent?: ForcedEventKind;
  inMission: boolean;
  onQuickDemo: () => void;
  onToggleShortRun: () => void;
  onToggleDemoProfile: () => void;
  onToggleStormReplay: () => void;
  onSetForcedEvent: (ev: ForcedEventKind | undefined) => void;
  onOpenScienceMap: () => void;
}

export const JudgeBar: React.FC<JudgeBarProps> = ({
  shortRun,
  demoProfileActive,
  stormReplayActive,
  forcedEvent,
  inMission,
  onQuickDemo,
  onToggleShortRun,
  onToggleDemoProfile,
  onToggleStormReplay,
  onSetForcedEvent,
  onOpenScienceMap,
}) => {
  return (
    <div className="border-b border-amber-400/30 bg-amber-950/30 px-4 py-2.5">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-amber-400/20 px-2 py-1 font-mono text-[11px] font-bold text-amber-200">
            JUDGE CONSOLE
          </span>
          <button
            type="button"
            onClick={onQuickDemo}
            className="min-h-9 rounded-lg bg-amber-400 px-3 py-1.5 font-semibold text-slate-950 hover:bg-amber-300"
          >
            Play Preset Demo
          </button>
          <button
            type="button"
            onClick={onToggleShortRun}
            className={`min-h-9 rounded-lg border px-2.5 py-1 font-mono text-[11px] ${
              shortRun
                ? "border-amber-400 bg-amber-400/20 text-amber-100"
                : "border-slate-700 bg-slate-900/70 text-slate-300"
            }`}
          >
            4-Step Short Run: {shortRun ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            onClick={onToggleStormReplay}
            className={`min-h-9 rounded-lg border px-2.5 py-1 font-mono text-[11px] ${
              stormReplayActive
                ? "border-rose-400 bg-rose-500/20 text-rose-100"
                : "border-slate-700 bg-slate-900/70 text-slate-300"
            }`}
          >
            May 2024 Superstorm: {stormReplayActive ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            onClick={onToggleDemoProfile}
            className={`min-h-9 rounded-lg border px-2.5 py-1 font-mono text-[11px] ${
              demoProfileActive
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                : "border-slate-700 bg-slate-900/70 text-slate-300"
            }`}
          >
            Demo Profile: {demoProfileActive ? "ON (In-Memory)" : "OFF"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {inMission && (
            <label className="flex items-center gap-1.5 font-mono text-[11px] text-amber-200">
              <span>Next Turn Event:</span>
              <select
                value={forcedEvent ?? ""}
                onChange={(e) =>
                  onSetForcedEvent((e.target.value || undefined) as ForcedEventKind | undefined)
                }
                className="min-h-9 rounded-lg border border-amber-400/40 bg-slate-900 px-2 py-1 text-xs text-white"
              >
                <option value="">Natural RNG</option>
                <option value="flare-x">Force Real X-Class Flare</option>
                <option value="flare-m">Force Real M-Class Flare</option>
                <option value="dust">Force Mars Dust Squall</option>
                <option value="fault">Force Equipment Fault</option>
                <option value="blackout">Force Radio Blackout</option>
              </select>
            </label>
          )}
          <button
            type="button"
            onClick={onOpenScienceMap}
            className="min-h-9 rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-1 font-mono text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25"
          >
            Science Map
          </button>
        </div>
      </div>
    </div>
  );
};
