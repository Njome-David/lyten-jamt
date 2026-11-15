'use client';

import React from 'react';
import type { Body } from '../types';

interface DestinationProps {
  onSelect: (body: Body) => void;
  onBack: () => void;
}

export function Destination({ onSelect, onBack }: DestinationProps) {
  return (
    <div
      data-testid="screen-destination"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        padding: '24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg, 20px)',
          padding: '28px 24px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: 'var(--shadow-card)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <h2 style={{ fontSize: '26px', margin: '0 0 8px 0', fontWeight: 800 }}>
          Select Destination
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--ink-dim)', margin: '0 0 24px 0' }}>
          Where will your astronaut crew build their outpost?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <button
            type="button"
            data-testid="btn-destination-moon"
            onClick={() => onSelect('moon')}
            autoFocus
            style={{
              padding: '20px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              border: '2px solid rgba(79, 216, 255, 0.4)',
            }}
          >
            <span style={{ fontSize: '38px' }} aria-hidden="true">🌕</span>
            <span style={{ fontWeight: 700, fontSize: '18px' }}>The Moon</span>
            <span style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>Low delay • Shackleton</span>
            <span style={{ fontSize: '12px', color: 'var(--accent)' }}>(1)</span>
          </button>

          <button
            type="button"
            data-testid="btn-destination-mars"
            onClick={() => onSelect('mars')}
            style={{
              padding: '20px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              border: '2px solid rgba(255, 91, 58, 0.4)',
            }}
          >
            <span style={{ fontSize: '38px' }} aria-hidden="true">🔴</span>
            <span style={{ fontWeight: 700, fontSize: '18px' }}>Mars</span>
            <span style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>Radio lag • Jezero</span>
            <span style={{ fontSize: '12px', color: 'var(--accent)' }}>(2)</span>
          </button>
        </div>

        <button
          type="button"
          data-testid="btn-back"
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-dim)',
            fontSize: '14px',
            textDecoration: 'underline',
            minHeight: '40px',
          }}
        >
          ← Back to Title (B / Esc)
        </button>
      </div>
    </div>
  );
}
