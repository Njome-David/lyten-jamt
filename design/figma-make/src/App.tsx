import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { musicDirector, type MusicStatusSnapshot } from "./audio/musicDirector";
import { playSfx, setAudioMuted, unlockAudio } from "./audio/sfx";
import { MAYA_MOMENTS, type MayaLine, type MayaMomentId } from "./content/mayaDialogues";
import { getMission } from "./content/missions";
import { getBundledSolarContext, getMay2024XFlares, tryLiveDonki } from "./data/solar";
import { STARTING_METERS } from "./engine/config/balance";
import { clampMeter, computeOptionPreview, createRun, resolveStep } from "./engine/reducer";
import { scoreRun } from "./engine/scoring";
import type {
  Body,
  Difficulty,
  ForcedEventKind,
  Loadout,
  MeterId,
  Meters,
  MissionTemplateId,
  OptionStyle,
  RunScore,
  RunState,
  SaveV1,
  SiteId,
  SolarContext,
} from "./engine/types";
import { createJudgeDemoSave, loadSave, recordMissionResult, writeSave } from "./progress/save";
import type { ExecutionVisualState, SceneViewMode } from "./three/OutpostScene3D";
import { AstronautTutor } from "./ui/components/AstronautTutor";
import { type FloatingDelta, GameHudBar } from "./ui/components/GameHudBar";
import { CreditsModal, JudgeBar, PauseOverlay, ScienceMapModal } from "./ui/components/Modals";
import { ProfileLockerModal } from "./ui/components/ProfileLockerModal";
import { GameTitleOverlay } from "./ui/screens/GameTitleOverlay";
import { OutpostDebriefOverlay } from "./ui/screens/OutpostDebriefOverlay";
import { OutpostLoadoutOverlay } from "./ui/screens/OutpostLoadoutOverlay";
import { OutpostMissionOverlay } from "./ui/screens/OutpostMissionOverlay";
import { PlanetMissionOverlay } from "./ui/screens/PlanetMissionOverlay";

const OutpostScene3D = lazy(() => import("./three/OutpostScene3D"));

type ScreenId = "title" | "select" | "loadout" | "mission" | "debrief";

const MAYA_STORAGE_KEY = "jamt.maya.v1";

const DEFAULT_LOADOUT: Loadout = {
  crew: 3,
  power: "panels",
  shield: "reinforced",
  food: "rations",
};

function loadSeenMayaMoments(): Set<MayaMomentId> {
  try {
    const raw = window.localStorage.getItem(MAYA_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr as MayaMomentId[]) : new Set();
  } catch {
    return new Set();
  }
}

function persistSeenMayaMoments(seen: Set<MayaMomentId>): void {
  try {
    window.localStorage.setItem(MAYA_STORAGE_KEY, JSON.stringify(Array.from(seen)));
  } catch {
    // Ignore storage block
  }
}

class MissionErrorBoundary extends React.Component<
  { onResetRun: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { onResetRun: () => void; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="console-panel max-w-md rounded-3xl p-6 text-center">
            <h1 className="font-display text-xl font-bold text-white">
              Console Telemetry Reset Needed
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Something unexpected interrupted this screen. Your astronaut save data is untouched.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onResetRun();
              }}
              className="mt-5 rounded-2xl bg-sky-400 px-5 py-2.5 font-display text-sm font-bold text-slate-950"
            >
              Return to Command Hub
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const initialLoaded = useMemo(() => loadSave(), []);
  const [realSave, setRealSave] = useState<SaveV1>(initialLoaded.save);
  const [storageAvailable] = useState<boolean>(initialLoaded.storageAvailable);

  // Judge state
  const [judgeEnabled, setJudgeEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("judge") === "1";
  });
  const [shortRun, setShortRun] = useState(false);
  const [stormReplayActive, setStormReplayActive] = useState(false);
  const [demoProfileActive, setDemoProfileActive] = useState(false);
  const [demoSave, setDemoSave] = useState<SaveV1>(() => createJudgeDemoSave());
  const [forcedEvent, setForcedEvent] = useState<ForcedEventKind | undefined>(undefined);

  // Solar state
  const [liveSolar, setLiveSolar] = useState<SolarContext | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveStatusNote, setLiveStatusNote] = useState<string | null>(null);

  const activeSolar: SolarContext = useMemo(() => {
    if (stormReplayActive) {
      return getBundledSolarContext("may2024");
    }
    if (liveSolar) {
      return liveSolar;
    }
    return getBundledSolarContext("recent");
  }, [stormReplayActive, liveSolar]);

  const activeSave = demoProfileActive ? demoSave : realSave;

  // Screen & Mission selection state
  const [screen, setScreen] = useState<ScreenId>("title");
  const [body, setBody] = useState<Body>("moon");
  const [missionId, setMissionId] = useState<MissionTemplateId>("relay");
  const [siteId, setSiteId] = useState<SiteId>("shackleton");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [loadout, setLoadout] = useState<Loadout>(DEFAULT_LOADOUT);

  // Active simulation run & debrief state
  const [run, setRun] = useState<RunState | null>(null);
  const [lastScore, setLastScore] = useState<RunScore | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);

  // Live Step Execution & Telemetry Animation State
  const [execution, setExecution] = useState<ExecutionVisualState | null>(null);
  const [previewDeltas, setPreviewDeltas] = useState<Partial<Record<MeterId, number>> | null>(null);
  const [floatingDeltas, setFloatingDeltas] = useState<FloatingDelta[]>([]);
  const [shieldBoostFlash, setShieldBoostFlash] = useState(false);
  const execCompleteRef = useRef<(() => void) | null>(null);

  // Maya Astronaut Companion State
  const seenMomentsRef = useRef<Set<MayaMomentId>>(loadSeenMayaMoments());
  const [mayaLines, setMayaLines] = useState<MayaLine[] | null>(() => {
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("judge") === "1"
    ) {
      return null;
    }
    return seenMomentsRef.current.has("intro_tour") ? null : MAYA_MOMENTS.intro_tour;
  });

  const triggerMayaOnce = useCallback((momentId: MayaMomentId) => {
    if (seenMomentsRef.current.has(momentId)) return;
    seenMomentsRef.current.add(momentId);
    persistSeenMayaMoments(seenMomentsRef.current);
    setMayaLines(MAYA_MOMENTS[momentId]);
  }, []);

  const dismissMaya = useCallback(() => {
    playSfx("click");
    if (!seenMomentsRef.current.has("intro_tour")) {
      seenMomentsRef.current.add("intro_tour");
      persistSeenMayaMoments(seenMomentsRef.current);
    }
    setMayaLines(null);
  }, []);

  // Modals
  const [lockerOpen, setLockerOpen] = useState(false);
  const [scienceMapOpen, setScienceMapOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [musicStatus, setMusicStatus] = useState<MusicStatusSnapshot>(() =>
    musicDirector.getSnapshot(),
  );

  useEffect(() => {
    return musicDirector.subscribe(setMusicStatus);
  }, []);

  useEffect(() => {
    setAudioMuted(activeSave.settings.muted);
  }, [activeSave.settings.muted]);

  // Sync Adaptive Music Director with live gameplay context
  useEffect(() => {
    const criticalMeters = Boolean(
      run &&
      screen === "mission" &&
      (run.meters.power <= 28 ||
        run.meters.air <= 28 ||
        run.meters.health <= 35 ||
        run.meters.food <= 28),
    );
    const lunarNightOrBlackout = Boolean(
      run &&
      screen === "mission" &&
      ((run.siteId === "tranquillitatis" && run.stepIndex >= 3) || run.flags.blackoutTurnsLeft > 0),
    );

    musicDirector.updateContext({
      screen,
      muted: activeSave.settings.muted,
      paused,
      modalOpen: lockerOpen || scienceMapOpen || creditsOpen,
      mayaSpeaking: Boolean(mayaLines && mayaLines.length > 0 && !run?.activeAlert && !paused),
      executingStep: Boolean(execution?.active),
      executingFast: Boolean(execution?.active && execution.style === "fast"),
      stepIndex: run ? run.stepIndex : 0,
      solarStormy: activeSolar.level === "stormy",
      criticalMeters,
      lunarNightOrBlackout,
      alertKind: run?.activeAlert ? run.activeAlert.kind : null,
      alertTimed: Boolean(run?.activeAlert?.timed),
    });
  }, [
    screen,
    activeSave.settings.muted,
    paused,
    lockerOpen,
    scienceMapOpen,
    creditsOpen,
    mayaLines,
    execution,
    run,
    activeSolar.level,
  ]);

  const updateSave = useCallback(
    (updater: (prev: SaveV1) => SaveV1) => {
      if (demoProfileActive) {
        setDemoSave((prev) => updater(prev));
      } else {
        setRealSave((prev) => {
          const next = updater(prev);
          writeSave(next);
          return next;
        });
      }
    },
    [demoProfileActive],
  );

  const handleToggleMute = useCallback(() => {
    updateSave((prev) => {
      const nextMuted = !prev.settings.muted;
      setAudioMuted(nextMuted);
      return {
        ...prev,
        settings: { ...prev.settings, muted: nextMuted },
      };
    });
  }, [updateSave]);

  const handleToggleExtraTime = useCallback(() => {
    playSfx("click");
    updateSave((prev) => ({
      ...prev,
      settings: { ...prev.settings, extraTime: !prev.settings.extraTime },
    }));
  }, [updateSave]);

  // Global 'M' shortcut for mute
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key.toUpperCase() === "M") {
        e.preventDefault();
        handleToggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleToggleMute]);

  const finishRunIfEnded = useCallback(
    (candidateRun: RunState) => {
      if (candidateRun.status === "running") {
        setRun(candidateRun);
        if (!candidateRun.activeAlert) {
          if (candidateRun.siteId === "tranquillitatis" && candidateRun.stepIndex === 3) {
            triggerMayaOnce("first_lunar_night");
          } else if (candidateRun.loadout.food === "hydroponics" && candidateRun.turn === 3) {
            triggerMayaOnce("first_hydro_harvest");
          }
        }
        return;
      }
      playSfx(candidateRun.status === "won" ? "win" : "lose");
      const score = scoreRun(candidateRun, activeSave.streak.count, activeSave.stats.welcomeGiven);
      const { nextSave, newlyUnlockedBadges } = recordMissionResult(
        activeSave,
        candidateRun,
        score,
      );
      if (demoProfileActive) {
        setDemoSave(nextSave);
      } else {
        setRealSave(nextSave);
        writeSave(nextSave);
      }
      setRun(candidateRun);
      setLastScore(score);
      setNewBadges(newlyUnlockedBadges);
      setPaused(false);
      setMayaLines(null);
      setScreen("debrief");
    },
    [activeSave, demoProfileActive, triggerMayaOnce],
  );

  const startMissionRun = useCallback(
    (params: {
      body: Body;
      missionId: MissionTemplateId;
      siteId: SiteId;
      difficulty: Difficulty;
      loadout: Loadout;
      seed?: number;
      shortRunOverride?: boolean;
      skipMayaIntro?: boolean;
    }) => {
      unlockAudio();
      playSfx("confirm");
      const seed = params.seed ?? (Date.now() & 0x7fffffff || 42026);
      const freshRun = createRun(
        {
          seed,
          body: params.body,
          missionId: params.missionId,
          siteId: params.siteId,
          difficulty: params.difficulty,
          loadout: params.loadout,
          shortRun: params.shortRunOverride ?? shortRun,
        },
        activeSolar,
      );
      setRun(freshRun);
      setExecution(null);
      setLastScore(null);
      setNewBadges([]);
      setPaused(false);
      setScreen("mission");
      if (!params.skipMayaIntro) {
        triggerMayaOnce("first_mission_step");
      } else {
        setMayaLines(null);
      }
    },
    [activeSolar, shortRun, triggerMayaOnce],
  );

  const handleQuickDemo = useCallback(() => {
    const demoLoadout: Loadout = {
      crew: 3,
      power: "panels",
      shield: "reinforced",
      food: "rations",
    };
    setBody("moon");
    setMissionId("relay");
    setSiteId("shackleton");
    setDifficulty("easy");
    setLoadout(demoLoadout);
    startMissionRun({
      body: "moon",
      missionId: "relay",
      siteId: "shackleton",
      difficulty: "easy",
      loadout: demoLoadout,
      seed: 202600,
      skipMayaIntro: true,
    });
  }, [startMissionRun]);

  const commitOptionToEngine = useCallback(
    (style: OptionStyle) => {
      if (!run) return;
      const mission = getMission(run.body, run.missionId);
      const fallbackX = getMay2024XFlares();
      const { state: nextState } = resolveStep(
        run,
        { type: "CHOOSE_OPTION", style },
        activeSolar,
        mission.steps,
        {
          forcedEvent,
          fallbackXPool: fallbackX.flares,
          fallbackFlareProvenance: fallbackX.provenance,
        },
      );
      if (forcedEvent) {
        setForcedEvent(undefined);
      }
      setExecution(null);
      finishRunIfEnded(nextState);
    },
    [run, activeSolar, forcedEvent, finishRunIfEnded],
  );

  const handleStartExecution = useCallback(
    (style: OptionStyle) => {
      if (!run || execution?.active) return;
      setMayaLines(null);
      playSfx("execute");
      const mission = getMission(run.body, run.missionId);
      const arch = mission.steps[Math.min(run.stepIndex, mission.steps.length - 1)];
      const preview = computeOptionPreview(run, arch, style, activeSolar);

      const floats: FloatingDelta[] = [
        { id: `${run.turn}-pwr`, meter: "power", delta: preview.netPower },
        { id: `${run.turn}-air`, meter: "air", delta: preview.netAir },
        { id: `${run.turn}-hlth`, meter: "health", delta: -preview.estimatedDose },
        { id: `${run.turn}-food`, meter: "food", delta: preview.netFood },
      ];
      setFloatingDeltas(floats);
      window.setTimeout(() => setFloatingDeltas([]), 1900);

      execCompleteRef.current = () => {
        playSfx("confirm");
        commitOptionToEngine(style);
      };

      setExecution({
        active: true,
        archetype: arch,
        style,
        progress: 0,
      });
    },
    [run, execution, activeSolar, commitOptionToEngine],
  );

  useEffect(() => {
    if (!execution?.active || paused) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const durationMs = reducedMotion
      ? 500
      : execution.style === "fast"
        ? 2100
        : execution.style === "balanced"
          ? 2750
          : 3350;

    let lastTime: number | null = null;
    let rafId = 0;
    let finished = false;

    const frame = (now: number) => {
      if (lastTime === null) lastTime = now;
      const dt = now - lastTime;
      lastTime = now;

      setExecution((prev) => {
        if (!prev || !prev.active) return prev;
        const nextProg = Math.min(1, prev.progress + dt / durationMs);
        if (nextProg >= 1 && !finished) {
          finished = true;
          window.setTimeout(() => {
            execCompleteRef.current?.();
            execCompleteRef.current = null;
          }, 0);
        }
        return { ...prev, progress: nextProg };
      });

      if (!finished) {
        rafId = window.requestAnimationFrame(frame);
      }
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, [execution?.active, execution?.style, paused]);

  const handleSkipExecution = useCallback(() => {
    if (!execution?.active) return;
    const fn = execCompleteRef.current;
    execCompleteRef.current = null;
    fn?.();
  }, [execution]);

  const handleAlertChoice = useCallback(
    (choice: "A" | "B" | "C" | "EXPIRED") => {
      if (!run) return;
      const alertKind = run.activeAlert?.kind;
      if (alertKind === "flare" && choice === "A") {
        setShieldBoostFlash(true);
        window.setTimeout(() => setShieldBoostFlash(false), 1800);
      }
      const mission = getMission(run.body, run.missionId);
      const { state: nextState } = resolveStep(
        run,
        { type: "ALERT_CHOICE", choice },
        activeSolar,
        mission.steps,
      );
      finishRunIfEnded(nextState);
      if (nextState.status === "running") {
        if (alertKind === "flare") triggerMayaOnce("first_solar_flare");
        else if (alertKind === "dust") triggerMayaOnce("first_dust_storm");
      }
    },
    [run, activeSolar, finishRunIfEnded, triggerMayaOnce],
  );

  const handleAskMissionControl = useCallback(
    (hintText: string) => {
      if (!run) return;
      const mission = getMission(run.body, run.missionId);
      const { state: nextState } = resolveStep(
        run,
        { type: "ASK_MISSION_CONTROL", hintText },
        activeSolar,
        mission.steps,
      );
      setRun(nextState);
      if (run.body === "mars") {
        triggerMayaOnce("first_mars_delay");
      }
    },
    [run, activeSolar, triggerMayaOnce],
  );

  const handleTryLiveDonki = async () => {
    setLiveLoading(true);
    setLiveStatusNote(null);
    const fetched = await tryLiveDonki();
    setLiveLoading(false);
    if (fetched) {
      setStormReplayActive(false);
      setLiveSolar(fetched);
      setLiveStatusNote(
        `Live NASA CCMC DONKI sync succeeded (${fetched.pool.length} recent flares).`,
      );
    } else {
      setLiveStatusNote(
        "Live CCMC DONKI endpoint unreachable or blocked by browser CORS — safely retaining verified bundled snapshot.",
      );
    }
  };

  const displayedMeters: Meters | undefined = useMemo(() => {
    if (screen === "loadout") {
      return {
        power: STARTING_METERS.power[loadout.power],
        air: STARTING_METERS.air,
        health: STARTING_METERS.health,
        food: STARTING_METERS.food[loadout.food],
      };
    }
    if (!run) return undefined;
    if (!execution?.active) return run.meters;

    const mission = getMission(run.body, run.missionId);
    const arch = mission.steps[Math.min(run.stepIndex, mission.steps.length - 1)];
    const prev = computeOptionPreview(run, arch, execution.style, activeSolar);
    const p = execution.progress;
    return {
      power: clampMeter(run.meters.power + prev.netPower * p),
      air: clampMeter(run.meters.air + prev.netAir * p),
      health: clampMeter(run.meters.health - prev.estimatedDose * p),
      food: clampMeter(run.meters.food + prev.netFood * p),
    };
  }, [screen, loadout, run, execution, activeSolar]);

  const sceneViewMode: SceneViewMode =
    screen === "title"
      ? "orbit"
      : screen === "select"
        ? "planet-select"
        : screen === "loadout"
          ? "loadout"
          : screen === "mission"
            ? "mission"
            : "debrief";

  const activeBody = run && (screen === "mission" || screen === "debrief") ? run.body : body;
  const activeSite = run && (screen === "mission" || screen === "debrief") ? run.siteId : siteId;
  const activeLoadout =
    run && (screen === "mission" || screen === "debrief") ? run.loadout : loadout;

  const hudContextLabel =
    screen === "title"
      ? "Orbital Command"
      : screen === "select"
        ? `${body === "moon" ? "Lunar" : "Martian"} Orbit`
        : screen === "loadout"
          ? "Outpost Pad"
          : screen === "mission" && run
            ? `${run.body} · Step ${Math.min(run.totalSteps, run.stepIndex + 1)}/${run.totalSteps}`
            : "Flight Debrief";

  const summonMayaContextTip = useCallback(() => {
    playSfx("click");
    if (screen === "title") {
      setMayaLines(MAYA_MOMENTS.intro_tour);
    } else if (screen === "select") {
      setMayaLines(MAYA_MOMENTS.first_world_select);
    } else if (screen === "loadout") {
      setMayaLines(MAYA_MOMENTS.first_loadout);
    } else if (screen === "mission" && run) {
      if (run.meters.power <= 28) {
        setMayaLines([
          {
            mood: "alert",
            text: "Power is running low, Commander! Pick Careful Scan to conserve battery while solar arrays recharge.",
          },
        ]);
      } else if (run.meters.air <= 30 || run.meters.food <= 30) {
        setMayaLines([
          {
            mood: "alert",
            text: "Air or Food is getting tight! Fast Rush finishes steps quicker so the crew breathes less oxygen.",
          },
        ]);
      } else {
        setMayaLines(MAYA_MOMENTS.first_mission_step);
      }
    }
  }, [screen, run]);

  return (
    <MissionErrorBoundary onResetRun={() => setScreen("title")}>
      <div className="relative flex min-h-screen flex-col overflow-x-hidden select-none">
        {/* Persistent Full-Viewport Three.js 3D Space & Outpost World */}
        <Suspense
          fallback={<div className="fixed inset-0 -z-10 bg-slate-950" aria-hidden="true" />}
        >
          <OutpostScene3D
            viewMode={sceneViewMode}
            body={activeBody}
            siteId={activeSite}
            loadout={activeLoadout}
            solarLevel={activeSolar.level}
            completedSteps={
              run && (screen === "mission" || screen === "debrief") ? run.stepIndex : 0
            }
            nightActive={Boolean(
              run && screen === "mission" && run.siteId === "tranquillitatis" && run.stepIndex >= 3,
            )}
            dustActive={Boolean(
              run &&
              screen === "mission" &&
              (run.flags.dustTurnsLeft > 0 || run.activeAlert?.kind === "dust"),
            )}
            panelsRetracted={Boolean(
              run && screen === "mission" && run.flags.panelsRetractedTurnsLeft > 0,
            )}
            flareAlertActive={Boolean(
              run && screen === "mission" && run.activeAlert?.kind === "flare",
            )}
            shieldBoostActive={shieldBoostFlash}
            hydroHarvestActive={Boolean(
              run &&
              (screen === "mission" || screen === "debrief") &&
              run.loadout.food === "hydroponics" &&
              run.turn >= 3,
            )}
            execution={screen === "mission" ? execution : null}
            onSelectOrbitBody={(pickedBody) => {
              playSfx("click");
              setBody(pickedBody);
              setSiteId(pickedBody === "moon" ? "shackleton" : "jezero");
              if (screen === "title") {
                setScreen("select");
                triggerMayaOnce("first_world_select");
              }
            }}
          />
        </Suspense>

        {/* Sleek Floating Game HUD Bar */}
        <GameHudBar
          contextLabel={hudContextLabel}
          showMeters={screen === "loadout" || screen === "mission"}
          meters={displayedMeters}
          previewDeltas={screen === "mission" && !execution?.active ? previewDeltas : null}
          floatingDeltas={floatingDeltas}
          solar={activeSolar}
          muted={activeSave.settings.muted}
          musicStatus={musicStatus}
          extraTime={activeSave.settings.extraTime}
          judgeEnabled={judgeEnabled}
          inMission={screen === "mission"}
          onClickHomeOrPause={() => {
            playSfx("click");
            if (screen === "mission") {
              setPaused((p) => !p);
            } else {
              setScreen("title");
            }
          }}
          onOpenScienceMap={() => {
            playSfx("click");
            setScienceMapOpen(true);
          }}
          onToggleJudge={() => {
            playSfx("click");
            setJudgeEnabled((v) => !v);
          }}
          onToggleExtraTime={handleToggleExtraTime}
          onToggleMute={handleToggleMute}
          onCycleTrack={() => {
            playSfx("click");
            musicDirector.cycleNextTrackManual();
          }}
        />

        {/* Compact Collapsible Judge Strip */}
        {judgeEnabled && (
          <div className="relative z-30 mt-2">
            <JudgeBar
              shortRun={shortRun}
              demoProfileActive={demoProfileActive}
              stormReplayActive={stormReplayActive}
              forcedEvent={forcedEvent}
              inMission={screen === "mission"}
              onQuickDemo={handleQuickDemo}
              onToggleShortRun={() => setShortRun((v) => !v)}
              onToggleDemoProfile={() => setDemoProfileActive((v) => !v)}
              onToggleStormReplay={() => setStormReplayActive((v) => !v)}
              onSetForcedEvent={setForcedEvent}
              onOpenScienceMap={() => setScienceMapOpen(true)}
            />
          </div>
        )}

        {!storageAvailable && (
          <div className="relative z-30 mx-auto mt-2 rounded-full bg-amber-950/85 px-4 py-1 font-mono text-xs text-amber-200">
            Browser private storage mode: session progress stays in memory only.
          </div>
        )}

        {/* Active Game Screen Overlay */}
        <main className="relative z-20 flex flex-1 flex-col">
          {screen === "title" && (
            <GameTitleOverlay
              save={activeSave}
              onPlayExpedition={() => {
                unlockAudio();
                playSfx("confirm");
                setScreen("select");
                triggerMayaOnce("first_world_select");
              }}
              onQuickDemo={handleQuickDemo}
              onOpenLocker={() => {
                playSfx("click");
                setLockerOpen(true);
              }}
              onOpenScienceMap={() => setScienceMapOpen(true)}
              onOpenCredits={() => setCreditsOpen(true)}
            />
          )}

          {screen === "select" && (
            <PlanetMissionOverlay
              body={body}
              missionId={missionId}
              siteId={siteId}
              difficulty={difficulty}
              save={activeSave}
              onSelectBody={(b) => {
                playSfx("click");
                setBody(b);
                setSiteId(b === "moon" ? "shackleton" : "jezero");
              }}
              onSelectMission={(id) => {
                playSfx("click");
                setMissionId(id);
              }}
              onSelectSite={(id) => {
                playSfx("click");
                setSiteId(id);
              }}
              onSelectDifficulty={(d) => {
                playSfx("click");
                setDifficulty(d);
              }}
              onBack={() => {
                playSfx("click");
                setScreen("title");
              }}
              onProceedToLoadout={() => {
                playSfx("confirm");
                setScreen("loadout");
                triggerMayaOnce("first_loadout");
              }}
            />
          )}

          {screen === "loadout" && (
            <OutpostLoadoutOverlay
              body={body}
              missionId={missionId}
              siteId={siteId}
              difficulty={difficulty}
              loadout={loadout}
              onChangeLoadout={(next) => {
                playSfx("click");
                setLoadout(next);
              }}
              onBack={() => {
                playSfx("click");
                setScreen("select");
              }}
              onLaunchMission={() =>
                startMissionRun({
                  body,
                  missionId,
                  siteId,
                  difficulty,
                  loadout,
                })
              }
            />
          )}

          {screen === "mission" && run && (
            <OutpostMissionOverlay
              run={run}
              solar={activeSolar}
              paused={paused}
              extraTime={activeSave.settings.extraTime}
              execution={execution}
              onHoverPreview={setPreviewDeltas}
              onStartExecution={handleStartExecution}
              onSkipExecution={handleSkipExecution}
              onAlertChoice={handleAlertChoice}
              onAskMissionControl={handleAskMissionControl}
              onTogglePause={() => {
                playSfx("click");
                setPaused((p) => !p);
              }}
              onAutoPause={() => setPaused(true)}
            />
          )}

          {screen === "debrief" && run && lastScore && (
            <OutpostDebriefOverlay
              run={run}
              score={lastScore}
              solar={activeSolar}
              newlyUnlockedBadges={newBadges}
              onReplaySame={() =>
                startMissionRun({
                  body: run.body,
                  missionId: run.missionId,
                  siteId: run.siteId,
                  difficulty: run.difficulty,
                  loadout: run.loadout,
                })
              }
              onAdjustLoadout={() => {
                playSfx("click");
                setScreen("loadout");
              }}
              onReturnToHub={() => {
                playSfx("click");
                setScreen("title");
              }}
            />
          )}
        </main>

        {/* Maya Astronaut Companion (Temporary Pop-In Dialog or Minimal Corner Comms Button) */}
        {!run?.activeAlert && !paused && screen !== "debrief" && (
          <AstronautTutor
            lines={mayaLines}
            fallbackTipText="Click for a quick flight tip from Maya"
            onDismiss={dismissMaya}
            onSummonTip={summonMayaContextTip}
          />
        )}

        {/* Overlays */}
        {lockerOpen && (
          <ProfileLockerModal
            save={activeSave}
            onUpdateProfile={(codename, avatarId) => {
              playSfx("click");
              updateSave((prev) => ({
                ...prev,
                profile: { codename, avatarId },
              }));
            }}
            onClose={() => setLockerOpen(false)}
          />
        )}

        {paused && screen === "mission" && run && (
          <PauseOverlay
            muted={activeSave.settings.muted}
            musicStatus={musicStatus}
            extraTime={activeSave.settings.extraTime}
            onToggleMute={handleToggleMute}
            onCycleTrack={() => {
              playSfx("click");
              musicDirector.cycleNextTrackManual();
            }}
            onToggleExtraTime={handleToggleExtraTime}
            onResume={() => {
              playSfx("click");
              setPaused(false);
            }}
            onRestartMission={() =>
              startMissionRun({
                body: run.body,
                missionId: run.missionId,
                siteId: run.siteId,
                difficulty: run.difficulty,
                loadout: run.loadout,
              })
            }
            onExitToTitle={() => {
              playSfx("click");
              setExecution(null);
              setPaused(false);
              setScreen("title");
            }}
          />
        )}

        {scienceMapOpen && (
          <ScienceMapModal
            solar={activeSolar}
            liveLoading={liveLoading}
            liveStatusNote={liveStatusNote}
            onTryLiveRefresh={handleTryLiveDonki}
            onClose={() => setScienceMapOpen(false)}
          />
        )}

        {creditsOpen && <CreditsModal onClose={() => setCreditsOpen(false)} />}
      </div>
    </MissionErrorBoundary>
  );
}
