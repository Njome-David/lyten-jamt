'use client';

import React, { useReducer, useEffect, useCallback } from 'react';
import type { UIState, UIAction, Body, SiteId, MissionTemplateId, Difficulty, LoadoutConfig } from './types';
import { Stage2D } from './components/Stage2D';
import { PauseOverlay } from './components/PauseOverlay';
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

    case 'RESET':
      return { ...INITIAL_UI_STATE };

    default:
      return state;
  }
}

export function GameShell() {
  const [state, dispatch] = useReducer(uiReducer, INITIAL_UI_STATE);

  // Calculate mock meters based on step progress
  const meters = {
    power: Math.max(20, 100 - (state.stepIndex - 1) * 12),
    air: Math.max(30, 95 - (state.stepIndex - 1) * 8),
    health: Math.max(40, 100 - (state.stepIndex - 1) * 5),
    food: Math.max(25, 90 - (state.stepIndex - 1) * 10),
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();

      // Pause toggle works from mission screen or overlay
      if (state.screen === 'mission' && (key === 'p' || key === 'm')) {
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
            dispatch({ type: 'NAVIGATE', screen: 'mission' });
          } else if (key === 'b' || key === 'escape') {
            e.preventDefault();
            dispatch({ type: 'NAVIGATE', screen: 'difficulty' });
          }
          break;

        case 'mission':
          if (key === '1' || key === '2' || key === '3') {
            e.preventDefault();
            dispatch({ type: 'NEXT_STEP' });
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
    [state]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
      {/* Persistent Visual Stage (Stage2D fallback) */}
      <Stage2D
        body={state.destination}
        site={state.site}
        screen={state.screen}
      />

      {/* Screen Overlay Content */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
        }}
      >
        {state.screen === 'title' && (
          <Title onStart={() => dispatch({ type: 'NAVIGATE', screen: 'destination' })} />
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
            onLaunch={() => dispatch({ type: 'NAVIGATE', screen: 'mission' })}
            onBack={() => dispatch({ type: 'NAVIGATE', screen: 'difficulty' })}
          />
        )}

        {state.screen === 'mission' && (
          <Mission
            stepIndex={state.stepIndex}
            totalSteps={state.totalSteps}
            meters={meters}
            onAction={(_style) => dispatch({ type: 'NEXT_STEP' })}
            onPause={() => dispatch({ type: 'TOGGLE_PAUSE' })}
          />
        )}

        {state.screen === 'debrief' && (
          <Debrief
            destination={state.destination}
            site={state.site}
            missionId={state.missionId}
            onRestart={() => dispatch({ type: 'RESET' })}
          />
        )}
      </main>

      {/* Paused Modal Dialog */}
      {state.paused && (
        <PauseOverlay onResume={() => dispatch({ type: 'TOGGLE_PAUSE' })} />
      )}
    </div>
  );
}
