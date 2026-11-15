import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { uiReducer, INITIAL_UI_STATE } from '../../src/ui/GameShell';
import { Stage2D } from '../../src/ui/components/Stage2D';
import { Title } from '../../src/ui/screens/Title';
import { Destination } from '../../src/ui/screens/Destination';
import { MissionPicker } from '../../src/ui/screens/MissionPicker';
import { SitePicker } from '../../src/ui/screens/SitePicker';
import { DifficultyPicker } from '../../src/ui/screens/DifficultyPicker';
import { Loadout } from '../../src/ui/screens/Loadout';
import { Mission } from '../../src/ui/screens/Mission';
import { Debrief } from '../../src/ui/screens/Debrief';
import { PauseOverlay } from '../../src/ui/components/PauseOverlay';

describe('T05: Shell UI and screen state machine', () => {
  it('follows full flow: title -> destination -> missions -> sites -> difficulty -> loadout -> mission -> debrief -> title', () => {
    let state = INITIAL_UI_STATE;
    expect(state.screen).toBe('title');

    // 1. Title -> Destination
    state = uiReducer(state, { type: 'NAVIGATE', screen: 'destination' });
    expect(state.screen).toBe('destination');

    // 2. Select Mars destination -> goes to missions
    state = uiReducer(state, { type: 'SELECT_DESTINATION', destination: 'mars' });
    expect(state.destination).toBe('mars');
    expect(state.site).toBe('jezero');
    expect(state.screen).toBe('missions');

    // 3. Select Core Drill mission -> goes to sites
    state = uiReducer(state, { type: 'SELECT_MISSION', missionId: 'core' });
    expect(state.missionId).toBe('core');
    expect(state.screen).toBe('sites');

    // 4. Select Gale site -> goes to difficulty
    state = uiReducer(state, { type: 'SELECT_SITE', site: 'gale' });
    expect(state.site).toBe('gale');
    expect(state.screen).toBe('difficulty');

    // 5. Select Hard difficulty -> goes to loadout
    state = uiReducer(state, { type: 'SELECT_DIFFICULTY', difficulty: 'hard' });
    expect(state.difficulty).toBe('hard');
    expect(state.screen).toBe('loadout');

    // 6. Update loadout & launch mission
    state = uiReducer(state, { type: 'UPDATE_LOADOUT', patch: { crew: 4, shield: 'reinforced' } });
    expect(state.loadout.crew).toBe(4);
    expect(state.loadout.shield).toBe('reinforced');

    state = uiReducer(state, { type: 'NAVIGATE', screen: 'mission' });
    expect(state.screen).toBe('mission');
    expect(state.stepIndex).toBe(1);

    // 7. Step through 6 steps of mission
    for (let i = 1; i <= 5; i++) {
      state = uiReducer(state, { type: 'NEXT_STEP' });
      expect(state.stepIndex).toBe(i + 1);
      expect(state.screen).toBe('mission');
    }

    // Step 6 completed -> debrief
    state = uiReducer(state, { type: 'NEXT_STEP' });
    expect(state.screen).toBe('debrief');

    // 8. Restart -> reset to title
    state = uiReducer(state, { type: 'RESET' });
    expect(state.screen).toBe('title');
    expect(state.stepIndex).toBe(1);
  });

  it('handles pause toggling and loadout updates', () => {
    let state = INITIAL_UI_STATE;
    expect(state.paused).toBe(false);

    state = uiReducer(state, { type: 'TOGGLE_PAUSE' });
    expect(state.paused).toBe(true);

    state = uiReducer(state, { type: 'TOGGLE_PAUSE' });
    expect(state.paused).toBe(false);

    state = uiReducer(state, { type: 'UPDATE_LOADOUT', patch: { food: 'hydroponics' } });
    expect(state.loadout.food).toBe('hydroponics');
  });

  it('renders Stage2D fallback SVG for Moon and Mars surfaces without WebGL', () => {
    const moonHtml = renderToStaticMarkup(
      React.createElement(Stage2D, { body: 'moon', site: 'shackleton', screen: 'mission' })
    );
    expect(moonHtml).toContain('data-testid="stage-2d"');
    expect(moonHtml).toContain('moon-shackleton-sky');
    expect(moonHtml).toContain('data-testid="surface-scene-elements"');
    expect(moonHtml).toContain('data-testid="outpost-group"');

    const marsHtml = renderToStaticMarkup(
      React.createElement(Stage2D, { body: 'mars', site: 'jezero', screen: 'mission' })
    );
    expect(marsHtml).toContain('mars-sky');
    expect(marsHtml).toContain('data-testid="surface-scene-elements"');

    const orbitHtml = renderToStaticMarkup(
      React.createElement(Stage2D, { body: 'moon', site: 'shackleton', screen: 'title' })
    );
    expect(orbitHtml).toContain('data-testid="orbit-scene-elements"');
  });

  it('renders all screens with accessible buttons and maximum 3 choices rule', () => {
    // Title
    const titleHtml = renderToStaticMarkup(
      React.createElement(Title, { onStart: () => {} })
    );
    expect(titleHtml).toContain('data-testid="btn-start"');

    // Destination
    const destHtml = renderToStaticMarkup(
      React.createElement(Destination, { onSelect: () => {}, onBack: () => {} })
    );
    expect(destHtml).toContain('data-testid="btn-destination-moon"');
    expect(destHtml).toContain('data-testid="btn-destination-mars"');

    // MissionPicker (L2 scope: 3 missions)
    const missionHtml = renderToStaticMarkup(
      React.createElement(MissionPicker, { onSelect: () => {}, onBack: () => {} })
    );
    expect(missionHtml).toContain('data-testid="btn-mission-relay"');
    expect(missionHtml).toContain('data-testid="btn-mission-core"');
    expect(missionHtml).toContain('data-testid="btn-mission-garden"');

    // SitePicker
    const siteHtml = renderToStaticMarkup(
      React.createElement(SitePicker, { body: 'moon', onSelect: () => {}, onBack: () => {} })
    );
    expect(siteHtml).toContain('data-testid="btn-site-shackleton"');
    expect(siteHtml).toContain('data-testid="btn-site-tranquillitatis"');

    // DifficultyPicker
    const diffHtml = renderToStaticMarkup(
      React.createElement(DifficultyPicker, { onSelect: () => {}, onBack: () => {} })
    );
    expect(diffHtml).toContain('data-testid="btn-difficulty-easy"');
    expect(diffHtml).toContain('data-testid="btn-difficulty-medium"');
    expect(diffHtml).toContain('data-testid="btn-difficulty-hard"');

    // Loadout
    const loadoutHtml = renderToStaticMarkup(
      React.createElement(Loadout, {
        loadout: INITIAL_UI_STATE.loadout,
        onUpdate: () => {},
        onLaunch: () => {},
        onBack: () => {},
      })
    );
    expect(loadoutHtml).toContain('data-testid="btn-launch"');

    // Mission HUD
    const hudHtml = renderToStaticMarkup(
      React.createElement(Mission, {
        stepIndex: 1,
        totalSteps: 6,
        meters: { power: 100, air: 95, health: 100, food: 90 },
        onAction: () => {},
        onPause: () => {},
      })
    );
    expect(hudHtml).toContain('data-testid="hud-meters"');
    expect(hudHtml).toContain('data-testid="btn-action-fast"');
    expect(hudHtml).toContain('data-testid="btn-action-balanced"');
    expect(hudHtml).toContain('data-testid="btn-action-careful"');

    // Debrief
    const debriefHtml = renderToStaticMarkup(
      React.createElement(Debrief, {
        destination: 'moon',
        site: 'shackleton',
        missionId: 'relay',
        onRestart: () => {},
      })
    );
    expect(debriefHtml).toContain('data-testid="btn-restart"');

    // PauseOverlay
    const pauseHtml = renderToStaticMarkup(
      React.createElement(PauseOverlay, { onResume: () => {} })
    );
    expect(pauseHtml).toContain('data-testid="overlay-pause"');
    expect(pauseHtml).toContain('data-testid="btn-resume"');
  });
});
