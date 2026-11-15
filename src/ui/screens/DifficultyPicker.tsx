'use client';

import React from 'react';
import type { Difficulty } from '../types';

interface DifficultyPickerProps {
  onSelect: (difficulty: Difficulty) => void;
  onBack: () => void;
}

const DIFFICULTIES: { id: Difficulty; label: string; icon: string; desc: string; key: string }[] = [
  {
    id: 'easy',
    label: 'Cadet (Easy)',
    icon: '🟢',
    desc: 'High initial reserves and lenient consumption',
    key: '1',
  },
  {
    id: 'medium',
    label: 'Pilot (Medium)',
    icon: '🟡',
    desc: 'Standard mission challenge with realistic hazards',
    key: '2',
  },
  {
    id: 'hard',
    label: 'Commander (Hard)',
    icon: '🔴',
    desc: 'Severe solar weather and strict life-support budgets',
    key: '3',
  },
];

export function DifficultyPicker({ onSelect, onBack }: DifficultyPickerProps) {
  return (
    <div
      data-testid="screen-difficulty"
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
        pointerEvents: 'none',
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
          pointerEvents: 'auto',
        }}
      >
        <h2 style={{ fontSize: '26px', margin: '0 0 8px 0', fontWeight: 800 }}>
          Mission Difficulty
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--ink-dim)', margin: '0 0 20px 0' }}>
          Select training level for your outpost
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {DIFFICULTIES.map((d, idx) => (
            <button
              key={d.id}
              type="button"
              data-testid={`btn-difficulty-${d.id}`}
              onClick={() => onSelect(d.id)}
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
                <span style={{ fontSize: '24px' }} aria-hidden="true">{d.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '17px' }}>{d.label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-dim)' }}>{d.desc}</div>
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>({d.key})</span>
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
