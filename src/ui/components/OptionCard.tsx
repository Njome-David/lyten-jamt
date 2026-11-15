// src/ui/components/OptionCard.tsx
// Operational approach choice card (Fast, Balanced, Careful) with cost chips and keyboard shortcuts.
// Strictly respects DESIGN.md section 4 and PRESENTATION.md section 5.

import React from 'react';
import type { OptionStyle } from '../types';
import { DataChip } from './DataChip';

export interface OptionCostDeltas {
  power: number;
  air?: number;
  food?: number;
  faultRisk?: number; // 0..1
  radiation?: number; // mGy
}

export interface OptionCardProps {
  styleType: OptionStyle;
  shortcutKey: '1' | '2' | '3';
  deltas: OptionCostDeltas;
  durationLabel?: string;
  isHovered?: boolean;
  showDataTags?: boolean;
  onSelect: (style: OptionStyle) => void;
  onHover?: (style: OptionStyle) => void;
  onLeave?: () => void;
}

const STYLE_META: Record<
  OptionStyle,
  {
    title: string;
    icon: string;
    subtitle: string;
    color: string;
    borderColor: string;
    bgHover: string;
  }
> = {
  fast: {
    title: 'Fast',
    icon: '⚡',
    subtitle: 'High speed • High drain',
    color: 'var(--power, #ffd24a)',
    borderColor: 'rgba(255, 210, 74, 0.45)',
    bgHover: 'rgba(255, 210, 74, 0.12)',
  },
  balanced: {
    title: 'Balanced',
    icon: '⚖️',
    subtitle: 'Standard consumption',
    color: 'var(--air, #4fd8ff)',
    borderColor: 'rgba(79, 216, 255, 0.45)',
    bgHover: 'rgba(79, 216, 255, 0.12)',
  },
  careful: {
    title: 'Careful',
    icon: '🛡️',
    subtitle: 'Takes time • Low drain',
    color: 'var(--success, #8be28b)',
    borderColor: 'rgba(139, 226, 139, 0.45)',
    bgHover: 'rgba(139, 226, 139, 0.12)',
  },
};

export const OptionCard: React.FC<OptionCardProps> = ({
  styleType,
  shortcutKey,
  deltas,
  durationLabel,
  isHovered = false,
  showDataTags = false,
  onSelect,
  onHover,
  onLeave,
}) => {
  const meta = STYLE_META[styleType];

  return (
    <button
      type="button"
      data-testid={`btn-action-${styleType}`}
      onClick={() => onSelect(styleType)}
      onMouseEnter={() => onHover?.(styleType)}
      onMouseLeave={() => onLeave?.()}
      onFocus={() => onHover?.(styleType)}
      onBlur={() => onLeave?.()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        padding: '16px',
        borderRadius: 'var(--radius-lg, 16px)',
        background: isHovered
          ? meta.bgHover
          : 'var(--panel-gradient, rgba(12, 20, 39, 0.95))',
        border: `1.5px solid ${isHovered ? meta.color : meta.borderColor}`,
        boxShadow: isHovered
          ? `0 8px 24px -6px ${meta.borderColor}`
          : 'var(--shadow-panel, 0 14px 34px -14px rgba(2,6,23,0.75))',
        cursor: 'pointer',
        textAlign: 'left',
        minHeight: '120px',
        minWidth: 'var(--touch-target-min, 48px)',
        transition: 'all var(--transition-fast, 150ms ease-out)',
        boxSizing: 'border-box',
        outline: 'none',
      }}
    >
      {/* Top Header: Title, Icon, Shortcut key badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }} aria-hidden="true">
            {meta.icon}
          </span>
          <span
            style={{
              fontSize: 'var(--text-base, 18px)',
              fontWeight: 800,
              color: meta.color,
            }}
          >
            {meta.title}
          </span>
        </div>

        {/* Keyboard shortcut badge */}
        <span
          data-testid={`option-shortcut-${shortcutKey}`}
          style={{
            fontSize: '11px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono, monospace)',
            padding: '2px 8px',
            borderRadius: '6px',
            background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
            border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.2))',
            color: 'var(--ink-muted, #64748b)',
          }}
        >
          [{shortcutKey}]
        </span>
      </div>

      {/* Subtitle / summary */}
      <div
        style={{
          fontSize: 'var(--text-xs, 12px)',
          color: 'var(--ink-dim, #94a3b8)',
          marginBottom: '12px',
          lineHeight: 1.3,
        }}
      >
        {meta.subtitle}
        {durationLabel && ` • ${durationLabel}`}
      </div>

      {/* Cost / Resource Deltas Chips */}
      <div
        data-testid={`option-chips-${styleType}`}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
        }}
      >
        {showDataTags && (
          <DataChip
            origin="GAME"
            label="RULE"
            size="xs"
            sourceDetail="Calibrated action cost tradeoff"
          />
        )}
        {/* Power delta chip */}
        <span
          data-testid="chip-power"
          style={{
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono, monospace)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm, 8px)',
            background: 'rgba(255, 210, 74, 0.14)',
            border: '1px solid rgba(255, 210, 74, 0.3)',
            color: 'var(--power, #ffd24a)',
          }}
        >
          {deltas.power > 0 ? `+${deltas.power}` : deltas.power} ⚡
        </span>

        {/* Air delta chip */}
        {typeof deltas.air === 'number' && (
          <span
            data-testid="chip-air"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'rgba(79, 216, 255, 0.14)',
              border: '1px solid rgba(79, 216, 255, 0.3)',
              color: 'var(--air, #4fd8ff)',
            }}
          >
            {deltas.air > 0 ? `+${deltas.air}` : deltas.air} 💨
          </span>
        )}

        {/* Food delta chip */}
        {typeof deltas.food === 'number' && (
          <span
            data-testid="chip-food"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'rgba(139, 226, 139, 0.14)',
              border: '1px solid rgba(139, 226, 139, 0.3)',
              color: 'var(--food, #8be28b)',
            }}
          >
            {deltas.food > 0 ? `+${deltas.food}` : deltas.food} 🌱
          </span>
        )}

        {/* Fault risk chip */}
        {typeof deltas.faultRisk === 'number' && deltas.faultRisk > 0 && (
          <span
            data-testid="chip-risk"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'rgba(255, 91, 58, 0.14)',
              border: '1px solid rgba(255, 91, 58, 0.3)',
              color: 'var(--alert, #ff5b3a)',
            }}
          >
            Risk {Math.round(deltas.faultRisk * 100)}%
          </span>
        )}
      </div>
    </button>
  );
};

export default OptionCard;
