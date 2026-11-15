// src/ui/components/DataChip.tsx
// Visual chip identifying whether a value originates from authentic NASA data (REAL)
// or a calibrated gameplay rule (GAME RULE).
// Strictly adheres to docs/spec/DESIGN.md section 2.5 and PRESENTATION.md section 5.1.

import React from 'react';

export type DataOrigin = 'REAL' | 'GAME';

export interface DataChipProps {
  origin: DataOrigin;
  label?: string;
  sourceDetail?: string;
  url?: string;
  size?: 'xs' | 'sm' | 'base';
  onClick?: () => void;
}

export const DataChip: React.FC<DataChipProps> = ({
  origin,
  label,
  sourceDetail,
  url,
  size = 'xs',
  onClick,
}) => {
  const isReal = origin === 'REAL';
  const displayLabel = label ?? (isReal ? 'REAL' : 'GAME RULE');

  const defaultTitle = isReal
    ? `Verified NASA Data Source${sourceDetail ? `: ${sourceDetail}` : ''}`
    : `Calibrated Simulation Rule${sourceDetail ? `: ${sourceDetail}` : ''}`;

  const padding =
    size === 'xs'
      ? '1px 6px'
      : size === 'sm'
      ? '2px 8px'
      : '4px 10px';

  const fontSize =
    size === 'xs'
      ? '10px'
      : size === 'sm'
      ? '11px'
      : '12px';

  const elementStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding,
    fontSize,
    fontWeight: 800,
    fontFamily: 'var(--font-mono, monospace)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    borderRadius: 'var(--radius-pill, 9999px)',
    lineHeight: 1.2,
    border: isReal
      ? '1px solid var(--chip-real-border, rgba(79, 216, 255, 0.40))'
      : '1px solid var(--chip-game-border, rgba(255, 210, 74, 0.35))',
    background: isReal
      ? 'var(--chip-real-bg, rgba(79, 216, 255, 0.15))'
      : 'var(--chip-game-bg, rgba(255, 210, 74, 0.12))',
    color: isReal
      ? 'var(--chip-real-ink, #4fd8ff)'
      : 'var(--chip-game-ink, #ffd24a)',
    cursor: onClick || url ? 'pointer' : 'default',
    textDecoration: 'none',
    boxSizing: 'border-box',
    userSelect: 'none',
    transition: 'transform var(--transition-fast, 150ms ease-out)',
  };

  const content = (
    <>
      <span aria-hidden="true" style={{ fontSize: '9px' }}>
        {isReal ? '🛰️' : '⚙️'}
      </span>
      <span>{displayLabel}</span>
    </>
  );

  if (url) {
    return (
      <a
        data-testid={`data-chip-${origin.toLowerCase()}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={defaultTitle}
        style={elementStyle}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        data-testid={`data-chip-${origin.toLowerCase()}`}
        title={defaultTitle}
        onClick={onClick}
        style={{
          ...elementStyle,
          border: elementStyle.border,
          outline: 'none',
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      data-testid={`data-chip-${origin.toLowerCase()}`}
      title={defaultTitle}
      style={elementStyle}
    >
      {content}
    </span>
  );
};

export default DataChip;
