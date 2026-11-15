// src/ui/components/MeterBar.tsx
// Single survival resource meter bar with smooth animation, critical pulse (< 25%),
// and optional delta preview tag (+10 / -15).

import React from 'react';

export type MeterType = 'power' | 'air' | 'health' | 'food';

export interface MeterBarProps {
  type: MeterType;
  value: number; // 0..100
  deltaPreview?: number; // e.g. +10 or -15
  floatingDelta?: number | null; // e.g. -12 during action consequence
}

const METER_CONFIG: Record<
  MeterType,
  { label: string; icon: string; colorVar: string; bgVar: string }
> = {
  power: {
    label: 'Power',
    icon: '⚡',
    colorVar: 'var(--power, #ffd24a)',
    bgVar: 'var(--power-bg, rgba(255, 210, 74, 0.16))',
  },
  air: {
    label: 'Air',
    icon: '💨',
    colorVar: 'var(--air, #4fd8ff)',
    bgVar: 'var(--air-bg, rgba(79, 216, 255, 0.16))',
  },
  health: {
    label: 'Health',
    icon: '❤️',
    colorVar: 'var(--health, #ff6b8b)',
    bgVar: 'var(--health-bg, rgba(255, 107, 139, 0.16))',
  },
  food: {
    label: 'Food',
    icon: '🌱',
    colorVar: 'var(--food, #8be28b)',
    bgVar: 'var(--food-bg, rgba(139, 226, 139, 0.16))',
  },
};

export const MeterBar: React.FC<MeterBarProps> = ({
  type,
  value,
  deltaPreview,
  floatingDelta,
}) => {
  const config = METER_CONFIG[type];
  const clampedValue = Math.max(0, Math.min(100, Math.round(value)));
  const isCritical = clampedValue < 25;

  return (
    <div
      data-testid={`meter-${type}`}
      data-critical={isCritical ? 'true' : 'false'}
      role="progressbar"
      aria-label={`${config.label} resource meter`}
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: '85px',
      }}
    >
      {/* Label and Value row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 'var(--text-xs, 12px)',
          fontWeight: 700,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--ink, #f1f5f9)',
          }}
        >
          <span aria-hidden="true">{config.icon}</span>
          <span>{config.label}</span>
        </span>

        <span
          data-testid={`meter-value-${type}`}
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            color: isCritical ? 'var(--meter-critical, #ff5b3a)' : config.colorVar,
          }}
        >
          {clampedValue}%
        </span>
      </div>

      {/* Progress Bar Container */}
      <div
        style={{
          position: 'relative',
          height: '8px',
          width: '100%',
          backgroundColor: 'var(--bg-deep, #05070d)',
          borderRadius: 'var(--radius-pill, 9999px)',
          overflow: 'hidden',
          border: isCritical
            ? '1px solid var(--meter-critical, #ff5b3a)'
            : '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.14))',
          animation: isCritical ? 'pulseCritical 1.2s infinite ease-in-out' : 'none',
        }}
      >
        {/* Animated Fill Bar */}
        <div
          data-testid={`meter-fill-${type}`}
          style={{
            height: '100%',
            width: `${clampedValue}%`,
            backgroundColor: isCritical
              ? 'var(--meter-critical, #ff5b3a)'
              : config.colorVar,
            borderRadius: 'var(--radius-pill, 9999px)',
            transition: 'width var(--transition-spring, 300ms cubic-bezier(0.16, 1, 0.3, 1)), background-color 200ms',
          }}
        />
      </div>

      {/* Preview Chip (shows when hovering or evaluating an option) */}
      {typeof deltaPreview === 'number' && deltaPreview !== 0 && (
        <span
          data-testid={`meter-preview-${type}`}
          style={{
            position: 'absolute',
            bottom: '-18px',
            right: 0,
            fontSize: '10px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono, monospace)',
            padding: '1px 4px',
            borderRadius: '4px',
            color: deltaPreview > 0 ? 'var(--success, #8be28b)' : 'var(--warning, #ffd24a)',
            backgroundColor: 'rgba(5, 7, 13, 0.85)',
            border: `1px solid ${deltaPreview > 0 ? 'var(--success, #8be28b)' : 'var(--warning, #ffd24a)'}`,
            pointerEvents: 'none',
          }}
        >
          {deltaPreview > 0 ? `+${deltaPreview}` : `${deltaPreview}`}
        </span>
      )}

      {/* Floating Delta on action execution */}
      {typeof floatingDelta === 'number' && floatingDelta !== 0 && (
        <span
          data-testid={`meter-floating-delta-${type}`}
          style={{
            position: 'absolute',
            top: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '11px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono, monospace)',
            color: floatingDelta > 0 ? 'var(--success, #8be28b)' : 'var(--alert, #ff5b3a)',
            animation: 'floatUp 0.8s ease-out forwards',
            pointerEvents: 'none',
          }}
        >
          {floatingDelta > 0 ? `+${floatingDelta}` : `${floatingDelta}`}
        </span>
      )}
    </div>
  );
};

export default MeterBar;
