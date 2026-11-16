'use client';

import React, { useReducer, useEffect, useCallback, useMemo, useState } from 'react';
import type { UIState, UIAction, Body, SiteId, MissionTemplateId, Difficulty, LoadoutConfig, OptionStyle } from './types';
import { StageCanvas } from '../three/stage/StageCanvas';
import type { StageMode } from '../three/stage/types';
import DialogBox from './dialog/DialogBox';
import { PauseOverlay } from './components/PauseOverlay';
import { useDialogRunner } from './dialog/useDialogRunner';
import {
  Title,
  Destination,
  MissionPicker,
  SitePicker,
  DifficultyPicker,
  Loadout,
  Mission,
  Debrief,
} from './screens';
import { loadSave, saveSave } from '../progress/save';
import type { SaveV1 } from '../engine/types';
import { ProfileLockerModal } from './components/ProfileLockerModal';
import { createRun, resolveStep, previewOption, scoreRun } from '../engine';
import { getSolarContext } from '../data/solar';
import { MISSIONS } from '../content/missions';
import type { OptionCostDeltas } from './components/OptionCard';
import { useJudgeMode, JudgePanel, DEFAULT_DEMO_PRESET, buildForcedAlert } from '../judge';
import { audioManager } from '../audio';

const INITIAL_LOADOUT: LoadoutConfig = {
  crew: 3,
  power: 'panels',
  shield: 'standard',
  food: 'rations',
};

export const INITIAL_UI_STATE: UIState = {
  screen: 'title',
  destination: 'moon',
  site: 'shackleton',
  missionId: 'relay',
  difficulty: 'easy',
  loadout: INITIAL_LOADOUT,
  paused: false,
  stepIndex: 1,
  totalSteps: 6,
  runState: null,
  runScore: null,
  activeAlert: null,
  cinematic: null,
};

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen, paused: false };

    case 'SELECT_DESTINATION': {
      // Default to premier site of that body
      const defaultSite: SiteId = action.destination === 'moon' ? 'shackleton' : 'jezero';
      return {
        ...state,
        destination: action.destination,
        site: defaultSite,
        screen: 'missions',
      };
    }

    case 'SELECT_MISSION':
      return { ...state, missionId: action.missionId, screen: 'sites' };

    case 'SELECT_SITE':
      return { ...state, site: action.site, screen: 'difficulty' };

    case 'SELECT_DIFFICULTY':
      return { ...state, difficulty: action.difficulty, screen: 'loadout' };

    case 'UPDATE_LOADOUT':
      return { ...state, loadout: { ...state.loadout, ...action.patch } };

    case 'TOGGLE_PAUSE':
      return { ...state, paused: !state.paused };

    case 'NEXT_STEP': {
      if (state.stepIndex >= state.totalSteps) {
        return { ...state, screen: 'debrief', stepIndex: 1 };
      }
      return { ...state, stepIndex: state.stepIndex + 1 };
    }

    case 'START_MISSION':
      return {
        ...state,
        screen: 'mission',
        runState: action.runState,
        stepIndex: 1,
        totalSteps: action.runState.totalSteps,
        activeAlert: null,
        runScore: null,
        paused: false,
      };

    case 'RESOLVE_STEP_SUCCESS':
      return {
        ...state,
        runState: action.runState,
        activeAlert: action.alert ?? null,
        stepIndex: Math.min(state.totalSteps, action.runState.stepIndex + 1),
      };

    case 'SET_CINEMATIC':
      return {
        ...state,
        cinematic: action.cinematic,
      };

    case 'RESOLVE_ALERT':
      return {
        ...state,
        runState: action.runState,
        activeAlert: null,
      };

    case 'FINISH_MISSION':
      return {
        ...state,
        screen: 'debrief',
        runScore: action.score,
        activeAlert: null,
        cinematic: null,
      };

    case 'RESET':
      return { ...INITIAL_UI_STATE };

    default:
      return state;
  }
}

export function GameShell() {
  const {
    currentDialog,
    startGuidedTour,
    advanceDialog,
    skipDialog,
    isDialogActive,
  } = useDialogRunner();

  // Start guided tour on initial launch
  useEffect(() => {
    startGuidedTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [state, dispatch] = useReducer(uiReducer, INITIAL_UI_STATE);
  // Load persistent player save
  const [save, setSave] = useState<SaveV1>(loadSave());
  // Locker modal visibility
  const [lockerOpen, setLockerOpen] = useState(false);

  const handleOpenLocker = () => setLockerOpen(true);
  const handleCloseLocker = () => setLockerOpen(false);

  const handleUpdateProfile = (patch: Partial<SaveV1['profile']>) => {
    const updated = { ...save, profile: { ...save.profile, ...patch } };
    setSave(updated);
    saveSave(updated);
  };
  const [isExecuting, setIsExecuting] = useState(false);
  const [isMuted, setIsMuted] = useState(() => audioManager.isMuted());
  const judge = useJudgeMode();

  useEffect(() => {
    return audioManager.onMuteChange((m) => setIsMuted(m));
  }, []);

  // Unlock WebAudio on first user interaction
  useEffect(() => {
    const handleUnlock = () => audioManager.unlockAudio();
    window.addEventListener('pointerdown', handleUnlock, { once: true });
    window.addEventListener('keydown', handleUnlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
  }, []);

  // Real NASA DONKI solar weather context (supports May 2024 historic storm)
  const solarContext = useMemo(
    () => getSolarContext(judge.state.solarMode),
    [judge.state.solarMode]
  );

  // Current mission definition and step
  const missionKey = `${state.destination}-${state.missionId}`;
  const missionDef = MISSIONS[missionKey] ?? MISSIONS['moon-relay'];
  const currentStep = missionDef?.steps[Math.min(missionDef.steps.length - 1, state.stepIndex - 1)];

  // Live simulation meters (from engine if started, otherwise safe nominal fallback)
  const meters = state.runState?.meters ?? {
    power: Math.max(20, 100 - (state.stepIndex - 1) * 12),
    air: Math.max(30, 95 - (state.stepIndex - 1) * 8),
    health: Math.max(40, 100 - (state.stepIndex - 1) * 5),
    food: Math.max(25, 90 - (state.stepIndex - 1) * 10),
  };

  // Live calculated deltas for the 3 option cards via engine's previewOption
  const styleDeltas = useMemo(() => {
    if (!currentStep) return undefined;
    const baseRun =
      state.runState ??
      createRun(
        {
          seed: 42,
          body: state.destination,
          missionId: state.missionId,
          siteId: state.site,
          difficulty: state.difficulty,
          loadout: state.loadout,
          totalSteps: 6,
        },
        solarContext
      );

    const styles: OptionStyle[] = ['fast', 'balanced', 'careful'];
    const res = {} as Record<OptionStyle, OptionCostDeltas & { duration: string }>;
    styles.forEach((st) => {
      const p = previewOption(baseRun, currentStep.archetype, st, solarContext);
      res[st] = {
        power: p.netPower,
        air: p.netAir,
        food: p.netFood,
        faultRisk: p.faultRisk,
        duration: st === 'fast' ? '2.5s' : st === 'balanced' ? '3.5s' : '5.0s',
      };
    });
    return res;
  }, [state.runState, currentStep, state.destination, state.missionId, state.site, state.difficulty, state.loadout, solarContext]);

  const handleLaunch = useCallback(() => {
    audioManager.playSfx('confirm');
    audioManager.triggerHaptic('button');
    const totalSteps = judge.state.shortRun ? 3 : 6;
    const run = createRun(
      {
        seed: 42,
        body: state.destination,
        missionId: state.missionId,
        siteId: state.site,
        difficulty: state.difficulty,
        loadout: state.loadout,
        totalSteps,
      },
      solarContext
    );
    dispatch({ type: 'START_MISSION', runState: run });
  }, [judge.state.shortRun, state.destination, state.missionId, state.site, state.difficulty, state.loadout, solarContext]);

  const handlePlayDemo = useCallback(() => {
    audioManager.playSfx('confirm');
    audioManager.triggerHaptic('button');
    const totalSteps = judge.state.shortRun ? 3 : 6;
    const run = createRun(
      {
        seed: DEFAULT_DEMO_PRESET.seed,
        body: DEFAULT_DEMO_PRESET.destination,
        missionId: DEFAULT_DEMO_PRESET.missionId,
        siteId: DEFAULT_DEMO_PRESET.site,
        difficulty: DEFAULT_DEMO_PRESET.difficulty,
        loadout: DEFAULT_DEMO_PRESET.loadout,
        totalSteps,
      },
      solarContext
    );
    dispatch({ type: 'SELECT_DESTINATION', destination: DEFAULT_DEMO_PRESET.destination });
    dispatch({ type: 'SELECT_SITE', site: DEFAULT_DEMO_PRESET.site });
    dispatch({ type: 'SELECT_MISSION', missionId: DEFAULT_DEMO_PRESET.missionId });
    dispatch({ type: 'SELECT_DIFFICULTY', difficulty: DEFAULT_DEMO_PRESET.difficulty });
    dispatch({ type: 'UPDATE_LOADOUT', patch: DEFAULT_DEMO_PRESET.loadout });
    dispatch({ type: 'START_MISSION', runState: run });
  }, [judge.state.shortRun, solarContext]);

  const handleAction = useCallback(
    (style: OptionStyle) => {
      if (isExecuting) return;
      setIsExecuting(true);
      audioManager.playSfx('execute');
      audioManager.triggerHaptic('button');

      const totalSteps = judge.state.shortRun ? 3 : 6;
      const activeRun =
        state.runState ??
        createRun(
          {
            seed: 42,
            body: state.destination,
            missionId: state.missionId,
            siteId: state.site,
            difficulty: state.difficulty,
            loadout: state.loadout,
            totalSteps,
          },
          solarContext
        );

      let res = resolveStep(activeRun, { type: 'CHOOSE_OPTION', style }, solarContext);

      // Trigger forced event if judge selected one
      if (judge.state.forcedEvent) {
        const forcedAlert = buildForcedAlert(judge.state.forcedEvent, solarContext, state.difficulty);
        res = { ...res, alert: forcedAlert };
        judge.setForcedEvent(null);
      }
      const archetype = currentStep?.archetype ?? 'travel';

      dispatch({
        type: 'SET_CINEMATIC',
        cinematic: {
          archetype,
          style,
          onComplete: () => {
            dispatch({ type: 'SET_CINEMATIC', cinematic: null });
            setIsExecuting(false);

            if (res.state.status !== 'running') {
              const score = scoreRun(res.state);
              const isWon = res.state.status === 'won' || score.stars > 0;
              if (isWon) {
                audioManager.playSfx('win');
                audioManager.triggerHaptic('success');
              } else {
                audioManager.playSfx('lose');
                audioManager.triggerHaptic('alert');
              }
              dispatch({ type: 'FINISH_MISSION', score });
            } else if (res.alert) {
              audioManager.playSfx('alert');
              audioManager.triggerHaptic('alert');
              dispatch({ type: 'RESOLVE_STEP_SUCCESS', runState: res.state, alert: res.alert });
            } else {
              dispatch({ type: 'RESOLVE_STEP_SUCCESS', runState: res.state });
            }
          },
        },
      });
    },
    [isExecuting, state.runState, state.destination, state.missionId, state.site, state.difficulty, state.loadout, solarContext, currentStep, judge]
  );

  const handleAlertChoice = useCallback(
    (choice: 'A' | 'B' | 'C' | 'EXPIRED') => {
      if (!state.runState) return;
      audioManager.playSfx('confirm');
      audioManager.triggerHaptic('button');
      const res = resolveStep(state.runState, { type: 'ALERT_CHOICE', choice }, solarContext);
      if (res.state.status !== 'running') {
        const score = scoreRun(res.state);
        const isWon = res.state.status === 'won' || score.stars > 0;
        if (isWon) {
          audioManager.playSfx('win');
          audioManager.triggerHaptic('success');
        } else {
          audioManager.playSfx('lose');
          audioManager.triggerHaptic('alert');
        }
        dispatch({ type: 'FINISH_MISSION', score });
      } else {
        dispatch({ type: 'RESOLVE_ALERT', runState: res.state });
      }
    },
    [state.runState, solarContext]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or a dialogue is active
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) || isDialogActive) {
        return;
      }

      const key = e.key.toLowerCase();

      // Audio mute shortcut [M]
      if (key === 'm') {
        e.preventDefault();
        audioManager.toggleMute();
        return;
      }

      // Judge mode toggle shortcut [J]
      if (key === 'j') {
        e.preventDefault();
        judge.toggleEnabled();
        return;
      }

      // Pause toggle works from mission screen or overlay
      if (state.screen === 'mission' && (key === 'p' || key === 'escape')) {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_PAUSE' });
        return;
      }

      if (state.paused) {
        if (key === 'escape' || key === 'p' || key === ' ') {
          e.preventDefault();
          dispatch({ type: 'TOGGLE_PAUSE' });
        }
        return;
      }

      switch (state.screen) {
        case 'title':
          if (key === ' ' || key === '1' || key === 'enter') {
            e.preventDefault();
            dispatch({ type: 'NAVIGATE', screen: 'destination' });
          }
          break;

        case 'destination':
          if (key === '1') {
            e.preventDefault();
            dispatch({ type: 'SELECT_DESTINATION', destination: 'moon' });
          } else if (key === '2') {
            e.preventDefault();
            dispatch({ type: 'SELECT_DESTINATION', destination: 'mars' });
          } else if (key === 'b' || key === 'escape') {
            e.preventDefault();
            dispatch({ type: 'NAVIGATE', screen: 'title' });
          }
          break;

        case 'missions':
          if (key === '1') {
            e.preventDefault();
            dispatch({ type: 'SELECT_MISSION', missionId: 'relay' });
          } else if (key === '2') {
            e.preventDefault();
            dispatch({ type: 'SELECT_MISSION', missionId: 'core' });
          } else if (key === '3') {
            e.preventDefault();
            dispatch({ type: 'SELECT_MISSION', missionId: 'garden' });
          } else if (key === 'b' || key === 'escape') {
            e.preventDefault();
            dispatch({ type: 'NAVIGATE', screen: 'destination' });
          }
          break;

        case 'sites':
          if (key === '1') {
            e.preventDefault();
            dispatch({
              type: 'SELECT_SITE',
              site: state.destination === 'moon' ? 'shackleton' : 'jezero',
            });
          } else if (key === '2') {
            e.preventDefault();
            dispatch({
              type: 'SELECT_SITE',
              site: state.destination === 'moon' ? 'tranquillitatis' : 'gale',
            });
          } else if (key === 'b' || key === 'escape') {
            e.preventDefault();
            dispatch({ type: 'NAVIGATE', screen: 'missions' });
          }
          break;

        case 'difficulty':
          if (key === '1') {
            e.preventDefault();
            dispatch({ type: 'SELECT_DIFFICULTY', difficulty: 'easy' });
          } else if (key === '2') {
            e.preventDefault();
            dispatch({ type: 'SELECT_DIFFICULTY', difficulty: 'medium' });
          } else if (key === '3') {
            e.preventDefault();
            dispatch({ type: 'SELECT_DIFFICULTY', difficulty: 'hard' });
          } else if (key === 'b' || key === 'escape') {
            e.preventDefault();
            dispatch({ type: 'NAVIGATE', screen: 'sites' });
          }
          break;

        case 'loadout':
          if (key === ' ' || key === '1' || key === 'enter') {
            e.preventDefault();
            handleLaunch();
          } else if (key === 'b' || key === 'escape') {
            e.preventDefault();
            dispatch({ type: 'NAVIGATE', screen: 'difficulty' });
          }
          break;

        case 'mission':
          if (key === '1') {
            e.preventDefault();
            handleAction('fast');
          } else if (key === '2') {
            e.preventDefault();
            handleAction('balanced');
          } else if (key === '3') {
            e.preventDefault();
            handleAction('careful');
          }
          break;

        case 'debrief':
          if (key === ' ' || key === '1' || key === 'enter') {
            e.preventDefault();
            dispatch({ type: 'RESET' });
          }
          break;
      }
    },
    [state, isDialogActive, handleLaunch, handleAction, judge]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const stageMode: StageMode =
    state.screen === 'missions'
      ? 'destination'
      : state.screen === 'difficulty'
      ? 'sites'
      : state.screen;

  return (
    <div
      data-testid="game-shell"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      {/* Persistent 3D Visual Stage with integrated 2D Fallback */}
      <StageCanvas
        mode={stageMode}
        body={state.destination}
        site={state.site}
        cinematic={state.cinematic ?? undefined}
        onSelectBody={(dest: Body) => dispatch({ type: 'SELECT_DESTINATION', destination: dest })}
      />

      {/* Screen Overlay Content */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {state.screen === 'title' && (
          <Title
            onStart={() => dispatch({ type: 'NAVIGATE', screen: 'destination' })}
            onToggleJudge={judge.toggleEnabled}
            isJudgeEnabled={judge.state.enabled}
            save={save}
            onOpenLocker={handleOpenLocker}
          />
        )}

        {state.screen === 'destination' && (
          <Destination
            onSelect={(dest: Body) => dispatch({ type: 'SELECT_DESTINATION', destination: dest })}
            onBack={() => dispatch({ type: 'NAVIGATE', screen: 'title' })}
          />
        )}

        {state.screen === 'missions' && (
          <MissionPicker
            onSelect={(m: MissionTemplateId) => dispatch({ type: 'SELECT_MISSION', missionId: m })}
            onBack={() => dispatch({ type: 'NAVIGATE', screen: 'destination' })}
          />
        )}

        {state.screen === 'sites' && (
          <SitePicker
            body={state.destination}
            onSelect={(s: SiteId) => dispatch({ type: 'SELECT_SITE', site: s })}
            onBack={() => dispatch({ type: 'NAVIGATE', screen: 'missions' })}
          />
        )}

        {state.screen === 'difficulty' && (
          <DifficultyPicker
            onSelect={(d: Difficulty) => dispatch({ type: 'SELECT_DIFFICULTY', difficulty: d })}
            onBack={() => dispatch({ type: 'NAVIGATE', screen: 'sites' })}
          />
        )}

        {state.screen === 'loadout' && (
          <Loadout
            loadout={state.loadout}
            onUpdate={(patch: Partial<LoadoutConfig>) => dispatch({ type: 'UPDATE_LOADOUT', patch })}
            onLaunch={handleLaunch}
            onBack={() => dispatch({ type: 'NAVIGATE', screen: 'difficulty' })}
          />
        )}

        {state.screen === 'mission' && (
          <Mission
            stepIndex={state.stepIndex}
            totalSteps={state.totalSteps}
            meters={meters}
            styleDeltas={styleDeltas}
            stepTitle={currentStep?.title}
            stepDescription={currentStep?.text}
            activeAlert={state.activeAlert}
            isExecuting={isExecuting}
            isMuted={isMuted}
            onToggleMute={() => audioManager.toggleMute()}
            onAction={handleAction}
            onAlertChoice={handleAlertChoice}
            onPause={() => dispatch({ type: 'TOGGLE_PAUSE' })}
          />
        )}

        {state.screen === 'debrief' && (
          <Debrief
            destination={state.destination}
            site={state.site}
            missionId={state.missionId}
            score={state.runScore}
              meterHistory={state.runState?.meterHistory ?? []}
            onRestart={() => dispatch({ type: 'RESET' })}
          />
        )}
      </main>
        {/* Astronaut Locker Modal */}
        <ProfileLockerModal
          save={save}
          isOpen={lockerOpen}
          onClose={handleCloseLocker}
          onUpdateProfile={handleUpdateProfile}
        />

      {/* Paused Modal Dialog */}
      {isDialogActive && currentDialog && (
        <DialogBox
          dialogue={currentDialog}
          onNext={advanceDialog}
          onSkip={skipDialog}
        />
      )}
      {state.paused && (
        <PauseOverlay onResume={() => dispatch({ type: 'TOGGLE_PAUSE' })} />
      )}

      {/* Space Apps Judge Mode Inspection Bar */}
      <JudgePanel
        state={judge.state}
        onPlayDemo={handlePlayDemo}
        onToggleCollapse={judge.toggleCollapsed}
        onSetShortRun={judge.setShortRun}
        onSetSolarMode={judge.setSolarMode}
        onSetSpeed={judge.setSpeed}
        onSetForcedEvent={judge.setForcedEvent}
        onSetIsScienceMapOpen={judge.setIsScienceMapOpen}
        onSetDemoProfileActive={judge.setDemoProfileActive}
      />
    </div>
  );
}
