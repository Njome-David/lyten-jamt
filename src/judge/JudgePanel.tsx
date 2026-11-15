// src/judge/JudgePanel.tsx
// Inspection and demonstration control bar for NASA Space Apps Challenge judges (T21).
// Provides 1-click Play Demo, Force Event selector, Short Run toggle, May 2024 storm replay,
// speed adjuster, demo profile loader, and Science Map access.

import React from 'react';
import type { JudgeState } from './types';
import type { ForcedEventKind } from '../engine/types';
import { ScienceMapModal } from './ScienceMapModal';

export interface JudgePanelProps {
  state: JudgeState;
  onPlayDemo: () => void;
  onToggleCollapse: () => void;
  onSetShortRun: (shortRun: boolean) => void;
  onSetSolarMode: (mode: 'recent' | 'may2024') => void;
  onSetSpeed: (speed: 1 | 2 | 3) => void;
  onSetForcedEvent: (event: ForcedEventKind | null) => void;
  onSetIsScienceMapOpen: (open: boolean) => void;
  onSetDemoProfileActive: (active: boolean) => void;
}

export const JudgePanel: React.FC<JudgePanelProps> = ({
  state,
  onPlayDemo,
  onToggleCollapse,
  onSetShortRun,
  onSetSolarMode,
  onSetSpeed,
  onSetForcedEvent,
  onSetIsScienceMapOpen,
  onSetDemoProfileActive,
}) => {
  if (!state.enabled) return null;

  return (
    <>
      <aside
        data-testid="judge-panel"
        role="region"
        aria-label="Judge Inspection Bar"
        style={{
          position: 'fixed',
          top: '12px',
          right: '16px',
          zIndex: 1250,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
          pointerEvents: 'auto',
        }}
      >
        {/* Collapsed Pill Button */}
        {state.isCollapsed ? (
          <button
            type="button"
            data-testid="btn-judge-expand"
            onClick={onToggleCollapse}
            style={{
              minHeight: 'var(--touch-target-min, 48px)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill, 9999px)',
              background: 'rgba(12, 20, 39, 0.95)',
              border: '1.5px solid var(--power, #ffd24a)',
              color: 'var(--power, #ffd24a)',
              fontSize: 'var(--text-sm, 14px)',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚖️</span>
            <span>JUDGE MODE</span>
            <span style={{ fontSize: '11px', color: 'var(--ink-muted, #64748b)' }}>[J]</span>
          </button>
        ) : (
          /* Expanded Inspection Console */
          <div
            data-testid="judge-panel-content"
            style={{
              background: 'var(--panel-gradient, rgba(12, 20, 39, 0.98))',
              border: '1.5px solid var(--power, #ffd24a)',
              borderRadius: 'var(--radius-xl, 24px)',
              padding: '12px 18px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 210, 74, 0.15)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '96vw',
              boxSizing: 'border-box',
            }}
          >
            {/* Title / Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                paddingRight: '6px',
                borderRight: '1px solid var(--border-panel, rgba(148, 163, 184, 0.2))',
              }}
            >
              <span style={{ fontSize: '18px' }} aria-hidden="true">
                ⚖️
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: 'var(--power, #ffd24a)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Judge Mode
              </span>
            </div>

            {/* 1. Play Demo Button */}
            <button
              type="button"
              data-testid="btn-judge-play-demo"
              onClick={onPlayDemo}
              style={{
                minHeight: 'var(--touch-target-min, 48px)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md, 12px)',
                background: 'var(--air, #4fd8ff)',
                color: 'var(--ink-inverse, #020617)',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🚀</span>
              <span>Play Demo</span>
            </button>

            {/* 2. Short Run (3 steps) Toggle */}
            <button
              type="button"
              data-testid="btn-judge-short-run"
              onClick={() => onSetShortRun(!state.shortRun)}
              aria-pressed={state.shortRun}
              style={{
                minHeight: 'var(--touch-target-min, 48px)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md, 12px)',
                background: state.shortRun
                  ? 'rgba(79, 216, 255, 0.2)'
                  : 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
                border: state.shortRun
                  ? '1px solid var(--air, #4fd8ff)'
                  : '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.15))',
                color: state.shortRun ? 'var(--air, #4fd8ff)' : 'var(--ink, #f1f5f9)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ⏱️ {state.shortRun ? 'Short Run (3 st.)' : 'Full Run (6 st.)'}
            </button>

            {/* 3. Replay May 2024 Storm Toggle */}
            <button
              type="button"
              data-testid="btn-judge-may2024"
              onClick={() =>
                onSetSolarMode(state.solarMode === 'may2024' ? 'recent' : 'may2024')
              }
              aria-pressed={state.solarMode === 'may2024'}
              style={{
                minHeight: 'var(--touch-target-min, 48px)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md, 12px)',
                background:
                  state.solarMode === 'may2024'
                    ? 'rgba(255, 91, 58, 0.25)'
                    : 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
                border:
                  state.solarMode === 'may2024'
                    ? '1px solid var(--alert, #ff5b3a)'
                    : '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.15))',
                color:
                  state.solarMode === 'may2024'
                    ? 'var(--alert, #ff5b3a)'
                    : 'var(--ink, #f1f5f9)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ☀️ {state.solarMode === 'may2024' ? 'May 2024 Storm (Active)' : 'Normal Solar'}
            </button>

            {/* 4. Force Event Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <label
                htmlFor="judge-force-event-select"
                style={{
                  fontSize: '11px',
                  color: 'var(--ink-muted, #64748b)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Event:
              </label>
              <select
                id="judge-force-event-select"
                data-testid="select-force-event"
                value={state.forcedEvent ?? 'none'}
                onChange={(e) => {
                  const val = e.target.value;
                  onSetForcedEvent(val === 'none' ? null : (val as ForcedEventKind));
                }}
                style={{
                  minHeight: '36px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-md, 12px)',
                  background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
                  border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.2))',
                  color: 'var(--ink, #f1f5f9)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="none">Auto / Nominal</option>
                <option value="flare-x">Solar Flare X-Class</option>
                <option value="flare-m">Solar Flare M-Class</option>
                <option value="dust">Martian Dust Storm</option>
                <option value="fault">Equipment Fault</option>
                <option value="blackout">Power Blackout</option>
              </select>
            </div>

            {/* 5. Speed Controls (1x / 2x / 3x) */}
            <div
              data-testid="judge-speed-controls"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {([1, 2, 3] as const).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  data-testid={`btn-speed-${sp}x`}
                  onClick={() => onSetSpeed(sp)}
                  style={{
                    minWidth: '32px',
                    minHeight: '36px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background:
                      state.speed === sp
                        ? 'var(--power, #ffd24a)'
                        : 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
                    color:
                      state.speed === sp
                        ? 'var(--ink-inverse, #020617)'
                        : 'var(--ink-dim, #94a3b8)',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {sp}x
                </button>
              ))}
            </div>

            {/* 6. Demo Profile Switcher */}
            <button
              type="button"
              data-testid="btn-judge-demo-profile"
              onClick={() => onSetDemoProfileActive(!state.demoProfileActive)}
              aria-pressed={state.demoProfileActive}
              style={{
                minHeight: 'var(--touch-target-min, 48px)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md, 12px)',
                background: state.demoProfileActive
                  ? 'rgba(139, 226, 139, 0.2)'
                  : 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
                border: state.demoProfileActive
                  ? '1px solid var(--success, #8be28b)'
                  : '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.15))',
                color: state.demoProfileActive
                  ? 'var(--success, #8be28b)'
                  : 'var(--ink, #f1f5f9)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              👤 {state.demoProfileActive ? 'Demo Profile (On)' : 'Player Profile'}
            </button>

            {/* 7. Science Map Opener */}
            <button
              type="button"
              data-testid="btn-open-science-map"
              onClick={() => onSetIsScienceMapOpen(true)}
              style={{
                minHeight: 'var(--touch-target-min, 48px)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md, 12px)',
                background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
                border: '1px solid var(--air, #4fd8ff)',
                color: 'var(--air, #4fd8ff)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🔬</span>
              <span>Science Map</span>
            </button>

            {/* Minimize / Collapse Button */}
            <button
              type="button"
              data-testid="btn-judge-collapse"
              onClick={onToggleCollapse}
              aria-label="Minimize Judge Panel"
              style={{
                minWidth: '36px',
                minHeight: '36px',
                padding: '4px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.2))',
                color: 'var(--ink-muted, #64748b)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        )}
      </aside>

      {/* Science Map NASA Data Passport Modal */}
      <ScienceMapModal
        isOpen={state.isScienceMapOpen}
        onClose={() => onSetIsScienceMapOpen(false)}
      />
    </>
  );
};

export default JudgePanel;
