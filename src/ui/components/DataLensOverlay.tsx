// src/ui/components/DataLensOverlay.tsx
// Data Loupe (Loupe donnees) overlay providing real-time NASA telemetry inspection
// and tagging game rules vs authentic NASA data.
// Complies with docs/spec/PRESENTATION.md section 5.1 and docs/spec/DESIGN.md.

import React from 'react';
import { DataChip } from './DataChip';

export interface DataLensOverlayProps {
  isActive: boolean;
  onClose: () => void;
  onOpenPassport: () => void;
}

export const DataLensOverlay: React.FC<DataLensOverlayProps> = ({
  isActive,
  onClose,
  onOpenPassport,
}) => {
  if (!isActive) return null;

  return (
    <div
      data-testid="data-lens-overlay"
      style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        maxWidth: '820px',
        width: 'calc(100% - 40px)',
        pointerEvents: 'auto',
        animation: 'fadeIn 200ms ease-out',
      }}
    >
      <aside
        aria-label="NASA Data Loupe Inspection Banner"
        style={{
          background: 'var(--panel-gradient, rgba(12, 20, 39, 0.96))',
          border: '1.5px solid var(--air, #4fd8ff)',
          borderRadius: 'var(--radius-lg, 16px)',
          padding: '12px 18px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75), 0 0 20px rgba(79, 216, 255, 0.15)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto' }}>
          <span style={{ fontSize: '20px' }} aria-hidden="true">
            👁️
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <strong
                style={{
                  fontSize: '13px',
                  color: 'var(--air, #4fd8ff)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Data Loupe Active
              </strong>
              <DataChip origin="REAL" label="NASA Telemetry" size="xs" />
              <DataChip origin="GAME" label="Simulation Rule" size="xs" />
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--ink-dim, #94a3b8)',
                marginTop: '2px',
              }}
            >
              Every value on screen is tagged: inspect authentic NASA sources vs calibrated simulation parameters.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            data-testid="btn-lens-open-passport"
            onClick={onOpenPassport}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md, 12px)',
              background: 'var(--chip-real-bg, rgba(79, 216, 255, 0.15))',
              border: '1px solid var(--chip-real-border, rgba(79, 216, 255, 0.4))',
              color: 'var(--chip-real-ink, #4fd8ff)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>📖</span>
            <span>Open Data Passport</span>
          </button>

          <button
            type="button"
            data-testid="btn-lens-close"
            onClick={onClose}
            aria-label="Close Data Loupe (L)"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-md, 12px)',
              background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
              border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.2))',
              color: 'var(--ink-muted, #64748b)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✕ [L]
          </button>
        </div>
      </aside>
    </div>
  );
};

export default DataLensOverlay;
