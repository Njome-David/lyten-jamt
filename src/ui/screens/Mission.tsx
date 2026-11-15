'use client';

import React from 'react';
import type { OptionStyle } from '../types';

interface MissionProps {
  stepIndex: number;
  totalSteps: number;
  meters: {
    power: number;
    air: number;
    health: number;
    food: number;
  };
  onAction: (style: OptionStyle) => void;
  onPause: () => void;
}

const STEP_NAMES = [
  'Site Reconnaissance',
  'Array Deployment',
  'Regolith Drilling',
  'Sample Analysis',
  'System Calibration',
  'Earth Telemetry Uplink',
];

export function Mission({
  stepIndex,
  totalSteps,
  meters,
  onAction,
  onPause,
}: MissionProps) {
  const currentStepName = STEP_NAMES[(stepIndex - 1) % STEP_NAMES.length] || 'Mission Operation';

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
      }}
    >
      {/* Top HUD: Meters + Step Tracker + Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '12px 18px',
          boxShadow: 'var(--shadow-card)',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'auto',
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>
            Step {stepIndex}/{totalSteps}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
            • {currentStepName}
          </span>
        </div>

        {/* 4 Life-Support Meters */}
        <div
          data-testid="hud-meters"
          style={{
            display: 'flex',
            gap: '14px',
            alignItems: 'center',
          }}
        >
          {/* Power */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Power">
            <span aria-hidden="true">⚡</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--power)' }}>
              {meters.power}%
            </span>
          </div>

          {/* Air */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Air">
            <span aria-hidden="true">💨</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--air)' }}>
              {meters.air}%
            </span>
          </div>

          {/* Health */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Health">
            <span aria-hidden="true">❤️</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--health)' }}>
              {meters.health}%
            </span>
          </div>

          {/* Food */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Food">
            <span aria-hidden="true">🌱</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--food)' }}>
              {meters.food}%
            </span>
          </div>
        </div>

        {/* Pause Button */}
        <button
          type="button"
          data-testid="btn-pause"
          onClick={onPause}
          style={{
            minHeight: '38px',
            minWidth: '38px',
            padding: '4px 10px',
            fontSize: '13px',
            background: 'transparent',
            border: '1px solid var(--border)',
          }}
          aria-label="Pause Mission (P / M)"
        >
          ⏸️ Pause (P)
        </button>
      </div>

      {/* Center: Open view for 3D/2D Stage (at least 60% viewport) */}
      <div style={{ flex: 1 }} />

      {/* Bottom Command Console: 3 Style Choices */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg, 20px)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-card)',
          backdropFilter: 'blur(12px)',
          pointerEvents: 'auto',
          maxWidth: '820px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
            Choose Operational Approach:
          </span>
          <span style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>
            Keys: 1 (Fast), 2 (Balanced), 3 (Careful)
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
          }}
        >
          {/* Fast */}
          <button
            type="button"
            data-testid="btn-action-fast"
            onClick={() => onAction('fast')}
            autoFocus
            style={{
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid rgba(255, 210, 74, 0.4)',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚡</span> Fast
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>Saves time • High drain</div>
            <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>(1)</div>
          </button>

          {/* Balanced */}
          <button
            type="button"
            data-testid="btn-action-balanced"
            onClick={() => onAction('balanced')}
            style={{
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid rgba(79, 216, 255, 0.4)',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚖️</span> Balanced
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>Standard consumption</div>
            <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>(2)</div>
          </button>

          {/* Careful */}
          <button
            type="button"
            data-testid="btn-action-careful"
            onClick={() => onAction('careful')}
            style={{
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid rgba(139, 226, 139, 0.4)',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🛡️</span> Careful
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>Takes time • Low drain</div>
            <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>(3)</div>
          </button>
        </div>
      </div>
    </div>
  );
}
