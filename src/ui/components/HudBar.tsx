// src/ui/components/HudBar.tsx
// Top HUD bar grouping progress track, survival meters, solar indicator, and mission controls.
// Strictly respects DESIGN.md section 4 and PRESENTATION.md section 5.

import React from 'react';
import { ProgressTrack } from './ProgressTrack';
import { MeterBar, type MeterType } from './MeterBar';
import { DataChip } from './DataChip';

export interface HudBarProps {
  stepIndex: number;
  totalSteps?: number;
  meters: {
    power: number;
    air: number;
    health: number;
    food: number;
  };
  deltaPreviews?: Partial<Record<MeterType, number>>;
  floatingDeltas?: Partial<Record<MeterType, number>>;
  solarLevel?: 'quiet' | 'active' | 'storm';
  isMuted?: boolean;
  isDataLoupeActive?: boolean;
  onPause: () => void;
  onToggleMute?: () => void;
  onToggleDataLoupe?: () => void;
}

export const HudBar: React.FC<HudBarProps> = ({
  stepIndex,
  totalSteps = 6,
  meters,
  deltaPreviews,
  floatingDeltas,
  solarLevel = 'quiet',
  isMuted = false,
  isDataLoupeActive = false,
  onPause,
  onToggleMute,
  onToggleDataLoupe,
}) => {
  return (
    <header
      data-testid="hud-bar"
      role="banner"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: 'var(--panel-gradient, rgba(12, 20, 39, 0.95))',
        border: '1px solid var(--border-panel, rgba(148, 163, 184, 0.20))',
        borderRadius: 'var(--radius-xl, 24px)',
        padding: '12px 20px',
        boxShadow: 'var(--shadow-panel, 0 14px 34px -14px rgba(2,6,23,0.75))',
        backdropFilter: 'blur(16px)',
        pointerEvents: 'auto',
        maxWidth: '1040px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Left: Progress Track */}
      <div style={{ flexShrink: 0 }}>
        <ProgressTrack currentStep={stepIndex} totalSteps={totalSteps} />
      </div>

      {/* Center: 4 Life-Support Resource Meters */}
      <div
        data-testid="hud-meters"
        style={{
          display: 'flex',
          gap: '18px',
          alignItems: 'center',
          flex: '1 1 auto',
          justifyContent: 'center',
          minWidth: '340px',
        }}
      >
        <MeterBar
          type="power"
          value={meters.power}
          deltaPreview={deltaPreviews?.power}
          floatingDelta={floatingDeltas?.power}
          showDataTag={isDataLoupeActive}
        />
        <MeterBar
          type="air"
          value={meters.air}
          deltaPreview={deltaPreviews?.air}
          floatingDelta={floatingDeltas?.air}
          showDataTag={isDataLoupeActive}
        />
        <MeterBar
          type="health"
          value={meters.health}
          deltaPreview={deltaPreviews?.health}
          floatingDelta={floatingDeltas?.health}
          showDataTag={isDataLoupeActive}
        />
        <MeterBar
          type="food"
          value={meters.food}
          deltaPreview={deltaPreviews?.food}
          floatingDelta={floatingDeltas?.food}
          showDataTag={isDataLoupeActive}
        />
      </div>

      {/* Right: Solar Telemetry Badge & Quick Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {/* Solar status pill */}
        <div
          data-testid="solar-status-badge"
          title={`Solar Space Weather: ${solarLevel}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            borderRadius: 'var(--radius-pill, 9999px)',
            background:
              solarLevel === 'storm'
                ? 'var(--alert-bg, rgba(255, 91, 58, 0.15))'
                : 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
            border:
              solarLevel === 'storm'
                ? '1px solid var(--alert, #ff5b3a)'
                : '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.14))',
            fontSize: 'var(--text-xs, 12px)',
            fontWeight: 700,
            color: solarLevel === 'storm' ? 'var(--alert, #ff5b3a)' : 'var(--warning, #ffd24a)',
          }}
        >
          <span aria-hidden="true">☀️</span>
          <span style={{ textTransform: 'capitalize' }}>{solarLevel}</span>
          {isDataLoupeActive && (
            <DataChip
              origin="REAL"
              label="DONKI"
              size="xs"
              sourceDetail="GOES Solar X-Ray flux telemetry"
            />
          )}
        </div>

        {/* Data Loupe Button */}
        {onToggleDataLoupe && (
          <button
            type="button"
            data-testid="btn-data-loupe"
            onClick={onToggleDataLoupe}
            aria-label="Toggle Data Loupe NASA tags"
            aria-pressed={isDataLoupeActive}
            style={{
              minWidth: 'var(--touch-target-min, 48px)',
              minHeight: 'var(--touch-target-min, 48px)',
              padding: '8px',
              borderRadius: 'var(--radius-md, 12px)',
              border: isDataLoupeActive
                ? '1px solid var(--air, #4fd8ff)'
                : '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.14))',
              background: isDataLoupeActive
                ? 'var(--chip-real-bg, rgba(79, 216, 255, 0.15))'
                : 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
              color: isDataLoupeActive ? 'var(--air, #4fd8ff)' : 'var(--ink, #f1f5f9)',
              fontSize: '14px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            👁️
          </button>
        )}

        {/* Audio Mute Button */}
        {onToggleMute && (
          <button
            type="button"
            data-testid="btn-toggle-audio"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
            style={{
              minWidth: 'var(--touch-target-min, 48px)',
              minHeight: 'var(--touch-target-min, 48px)',
              padding: '8px',
              borderRadius: 'var(--radius-md, 12px)',
              border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.14))',
              background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}

        {/* Pause Button */}
        <button
          type="button"
          data-testid="btn-pause"
          onClick={onPause}
          aria-label="Pause Mission (P)"
          style={{
            minWidth: 'var(--touch-target-min, 48px)',
            minHeight: 'var(--touch-target-min, 48px)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md, 12px)',
            border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.14))',
            background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
            fontSize: 'var(--text-sm, 14px)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--ink, #f1f5f9)',
          }}
        >
          <span aria-hidden="true">⏸️</span>
          <span>Pause</span>
        </button>
      </div>
    </header>
  );
};

export default HudBar;
