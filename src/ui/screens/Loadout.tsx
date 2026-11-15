'use client';

import React from 'react';
import type { LoadoutConfig } from '../types';

interface LoadoutProps {
  loadout: LoadoutConfig;
  onUpdate: (patch: Partial<LoadoutConfig>) => void;
  onLaunch: () => void;
  onBack: () => void;
}

export function Loadout({ loadout, onUpdate, onLaunch, onBack }: LoadoutProps) {
  return (
    <div
      data-testid="screen-loadout"
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
        <h2 style={{ fontSize: '26px', margin: '0 0 6px 0', fontWeight: 800 }}>
          Outpost Loadout
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--ink-dim)', margin: '0 0 20px 0' }}>
          Configure supplies and equipment before touchdown
        </p>

        {/* Loadout configuration grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px',
            textAlign: 'left',
          }}
        >
          {/* Crew */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--ink-dim)', marginBottom: '6px' }}>Crew Size</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([2, 3, 4] as const).map((count) => (
                <button
                  key={count}
                  type="button"
                  data-testid={`btn-crew-${count}`}
                  onClick={() => onUpdate({ crew: count })}
                  style={{
                    flex: 1,
                    minHeight: '38px',
                    minWidth: '38px',
                    fontSize: '14px',
                    fontWeight: loadout.crew === count ? 800 : 500,
                    background: loadout.crew === count ? 'var(--accent)' : 'transparent',
                    color: loadout.crew === count ? '#05070d' : 'inherit',
                    borderColor: loadout.crew === count ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Power */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--ink-dim)', marginBottom: '6px' }}>Power System</div>
            <button
              type="button"
              data-testid="btn-toggle-power"
              onClick={() => onUpdate({ power: loadout.power === 'panels' ? 'batteries' : 'panels' })}
              style={{
                width: '100%',
                minHeight: '38px',
                fontSize: '13px',
                fontWeight: 600,
                borderColor: 'var(--border)',
              }}
            >
              {loadout.power === 'panels' ? '☀️ Solar Panels' : '🔋 Heavy Batteries'}
            </button>
          </div>

          {/* Shield */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--ink-dim)', marginBottom: '6px' }}>Radiation Shield</div>
            <button
              type="button"
              data-testid="btn-toggle-shield"
              onClick={() => onUpdate({ shield: loadout.shield === 'standard' ? 'reinforced' : 'standard' })}
              style={{
                width: '100%',
                minHeight: '38px',
                fontSize: '13px',
                fontWeight: 600,
                borderColor: 'var(--border)',
              }}
            >
              {loadout.shield === 'standard' ? '🛡️ Standard' : '🔰 Reinforced'}
            </button>
          </div>

          {/* Food */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--ink-dim)', marginBottom: '6px' }}>Life Support Food</div>
            <button
              type="button"
              data-testid="btn-toggle-food"
              onClick={() => onUpdate({ food: loadout.food === 'rations' ? 'hydroponics' : 'rations' })}
              style={{
                width: '100%',
                minHeight: '38px',
                fontSize: '13px',
                fontWeight: 600,
                borderColor: 'var(--border)',
              }}
            >
              {loadout.food === 'rations' ? '🥫 Rations Pack' : '🌱 Hydroponics'}
            </button>
          </div>
        </div>

        {/* Launch button */}
        <button
          type="button"
          data-testid="btn-launch"
          onClick={onLaunch}
          autoFocus
          style={{
            width: '100%',
            height: '54px',
            fontSize: '18px',
            fontWeight: 700,
            background: 'var(--power)',
            color: '#05070d',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px',
            boxShadow: '0 4px 16px rgba(255, 210, 74, 0.3)',
          }}
        >
          <span aria-hidden="true">🚀</span>
          <span>Launch Mission</span>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>(Space / 1)</span>
        </button>

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
          ← Back to Difficulty (B / Esc)
        </button>
      </div>
    </div>
  );
}
