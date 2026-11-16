'use client';

import React, { useState } from 'react';
import { DataPassportModal } from './DataPassportModal';

interface PauseOverlayProps {
  onResume: () => void;
  onOpenPassport?: () => void;
}

export function PauseOverlay({ onResume, onOpenPassport }: PauseOverlayProps) {
  const [isPassportOpen, setIsPassportOpen] = useState(false);

  const handleOpenPassport = () => {
    if (onOpenPassport) {
      onOpenPassport();
    } else {
      setIsPassportOpen(true);
    }
  };
  return (
    <div
      data-testid="overlay-pause"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Mission Paused"
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg, 20px)',
          padding: '32px 28px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ fontSize: '36px', marginBottom: '8px' }} aria-hidden="true">
          ⏸️
        </div>

        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', fontWeight: 800 }}>
          Simulation Paused
        </h2>

        <p style={{ fontSize: '15px', color: 'var(--ink-dim)', margin: '0 0 24px 0' }}>
          Outpost telemetry on hold. Take a breath, Commander.
        </p>

        <button
          type="button"
          data-testid="btn-resume"
          onClick={onResume}
          autoFocus
          style={{
            width: '100%',
            height: '50px',
            fontSize: '17px',
            fontWeight: 700,
            background: 'var(--accent)',
            color: '#05070d',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <span>Resume Mission</span>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>(P / Space)</span>
        </button>

        <button
          type="button"
          data-testid="btn-pause-passport"
          onClick={handleOpenPassport}
          style={{
            width: '100%',
            height: '44px',
            fontSize: '14px',
            fontWeight: 700,
            background: 'var(--chip-real-bg, rgba(79, 216, 255, 0.15))',
            border: '1px solid var(--chip-real-border, rgba(79, 216, 255, 0.4))',
            color: 'var(--chip-real-ink, #4fd8ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            borderRadius: 'var(--radius, 14px)',
          }}
        >
          <span aria-hidden="true">📖</span>
          <span>NASA Data Passport</span>
        </button>
      </div>

      <DataPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
      />
    </div>
  );
}
