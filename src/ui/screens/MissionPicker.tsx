'use client';

import React from 'react';
import type { MissionTemplateId } from '../types';

interface MissionPickerProps {
  onSelect: (missionId: MissionTemplateId) => void;
  onBack: () => void;
}

const MISSIONS: { id: MissionTemplateId; name: string; icon: string; desc: string; key: string }[] = [
  {
    id: 'relay',
    name: 'Radio Relay',
    icon: '📡',
    desc: 'Deploy antenna and establish Earth uplink',
    key: '1',
  },
  {
    id: 'core',
    name: 'Core Drill',
    icon: '⛏️',
    desc: 'Extract regolith core samples from depth',
    key: '2',
  },
  {
    id: 'garden',
    name: 'Bio Garden',
    icon: '🌱',
    desc: 'Test plant growth in microgravity habitat',
    key: '3',
  },
];

export function MissionPicker({ onSelect, onBack }: MissionPickerProps) {
  return (
    <div
      data-testid="screen-missions"
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
          Select Mission
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--ink-dim)', margin: '0 0 20px 0' }}>
          Choose your outpost priority (L2 Scope)
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {MISSIONS.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              data-testid={`btn-mission-${m.id}`}
              onClick={() => onSelect(m.id)}
              autoFocus={idx === 0}
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '26px' }} aria-hidden="true">{m.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '17px' }}>{m.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-dim)' }}>{m.desc}</div>
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>({m.key})</span>
            </button>
          ))}
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
          ← Back (B / Esc)
        </button>
      </div>
    </div>
  );
}
