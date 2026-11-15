// src/ui/screens/Mission.tsx
// Mission command screen integrating HudBar (meters + progress track),
// OptionCard approach console with live delta previews, and AlertOverlay.
// Strictly respects DESIGN.md section 4 and PRESENTATION.md section 5.

import React, { useState } from 'react';
import type { OptionStyle } from '../types';
import type { AlertSpec } from '../../engine/types';
import { HudBar } from '../components/HudBar';
import { OptionCard, type OptionCostDeltas } from '../components/OptionCard';
import { AlertOverlay } from '../components/AlertOverlay';
import type { MeterType } from '../components/MeterBar';

export interface MissionProps {
  stepIndex: number;
  totalSteps: number;
  meters: {
    power: number;
    air: number;
    health: number;
    food: number;
  };
  solarLevel?: 'quiet' | 'active' | 'storm';
  activeAlert?: AlertSpec | null;
  styleDeltas?: Record<OptionStyle, OptionCostDeltas & { duration: string }>;
  stepTitle?: string;
  stepDescription?: string;
  isExecuting?: boolean;
  onAction: (style: OptionStyle) => void;
  onAlertChoice?: (choiceId: 'A' | 'B' | 'C' | 'EXPIRED') => void;
  onPause: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

const STYLE_DELTAS: Record<OptionStyle, OptionCostDeltas & { duration: string }> = {
  fast: {
    power: -18,
    air: -8,
    food: -5,
    faultRisk: 0.25,
    duration: '2.5s',
  },
  balanced: {
    power: -10,
    air: -4,
    food: -3,
    faultRisk: 0.1,
    duration: '3.5s',
  },
  careful: {
    power: -6,
    air: -2,
    food: -2,
    faultRisk: 0.02,
    duration: '5.0s',
  },
};

export const Mission: React.FC<MissionProps> = ({
  stepIndex,
  totalSteps,
  meters,
  solarLevel,
  styleDeltas,
  stepTitle,
  stepDescription,
  activeAlert,
  isExecuting,
  onAction,
  onAlertChoice,
  onPause,
  isMuted,
  onToggleMute,
}) => {
  const [hoveredStyle, setHoveredStyle] = useState<OptionStyle | null>(null);
  const [isDataLoupeActive, setIsDataLoupeActive] = useState(false);

  const activeDeltas = styleDeltas ?? STYLE_DELTAS;

  // Active preview deltas based on hovered card
  const deltaPreviews: Partial<Record<MeterType, number>> | undefined = hoveredStyle
    ? {
        power: activeDeltas[hoveredStyle].power,
        air: activeDeltas[hoveredStyle].air,
        food: activeDeltas[hoveredStyle].food,
      }
    : undefined;

  return (
    <div
      data-testid="screen-mission"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '16px 20px',
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Section: HudBar with ProgressTrack, Meters & Controls */}
      <HudBar
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        meters={meters}
        deltaPreviews={deltaPreviews}
        solarLevel={solarLevel}
        isMuted={isMuted}
        isDataLoupeActive={isDataLoupeActive}
        onPause={onPause}
        onToggleMute={onToggleMute}
        onToggleDataLoupe={() => setIsDataLoupeActive((prev) => !prev)}
      />

      {/* Center: Open view for 3D/2D Stage (at least 60% viewport reserved) */}
      <div style={{ flex: 1, minHeight: '120px' }} />

      {/* Bottom Console: 3 Approach Option Cards */}
      <section
        aria-label="Mission Operations Console"
        style={{
          background: 'var(--panel-gradient, rgba(12, 20, 39, 0.95))',
          border: '1px solid var(--border-panel, rgba(148, 163, 184, 0.20))',
          borderRadius: 'var(--radius-xl, 24px)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-panel, 0 14px 34px -14px rgba(2,6,23,0.75))',
          backdropFilter: 'blur(16px)',
          pointerEvents: 'auto',
          maxWidth: '920px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {stepTitle && (
          <div style={{ marginBottom: '10px' }}>
            <h3
              data-testid="mission-step-title"
              style={{
                margin: '0 0 4px 0',
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--power, #ffd24a)',
                letterSpacing: '0.02em',
              }}
            >
              Step {stepIndex}: {stepTitle}
            </h3>
            {stepDescription && (
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: 'var(--ink-dim, #94a3b8)',
                  lineHeight: 1.4,
                }}
              >
                {stepDescription}
              </p>
            )}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontSize: 'var(--text-sm, 14px)',
              fontWeight: 800,
              color: 'var(--ink, #f1f5f9)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Operational Approach Style:
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--ink-muted, #64748b)',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            Keys: [1] Fast • [2] Balanced • [3] Careful
          </span>
        </div>

        {/* 3 Option Cards Grid */}
        <div
          data-testid="option-cards"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            opacity: isExecuting ? 0.6 : 1,
            pointerEvents: isExecuting ? 'none' : 'auto',
          }}
        >
          <OptionCard
            styleType="fast"
            shortcutKey="1"
            deltas={activeDeltas.fast}
            durationLabel={activeDeltas.fast.duration}
            isHovered={hoveredStyle === 'fast'}
            onSelect={onAction}
            onHover={setHoveredStyle}
            onLeave={() => setHoveredStyle(null)}
          />

          <OptionCard
            styleType="balanced"
            shortcutKey="2"
            deltas={activeDeltas.balanced}
            durationLabel={activeDeltas.balanced.duration}
            isHovered={hoveredStyle === 'balanced'}
            onSelect={onAction}
            onHover={setHoveredStyle}
            onLeave={() => setHoveredStyle(null)}
          />

          <OptionCard
            styleType="careful"
            shortcutKey="3"
            deltas={activeDeltas.careful}
            durationLabel={activeDeltas.careful.duration}
            isHovered={hoveredStyle === 'careful'}
            onSelect={onAction}
            onHover={setHoveredStyle}
            onLeave={() => setHoveredStyle(null)}
          />
        </div>
      </section>

      {/* Emergency Alert Overlay if active */}
      {activeAlert && (
        <AlertOverlay
          alert={activeAlert}
          onSelectChoice={onAlertChoice ?? (() => {})}
        />
      )}
    </div>
  );
};

export default Mission;
