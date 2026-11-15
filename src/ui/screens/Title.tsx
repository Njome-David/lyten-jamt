'use client';

import React from 'react';

interface TitleProps {
  onStart: () => void;
  onToggleJudge?: () => void;
  isJudgeEnabled?: boolean;
}

export function Title({ onStart, onToggleJudge, isJudgeEnabled }: TitleProps) {
  return (
    <div
      data-testid="screen-title"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        padding: 'var(--space-lg, 24px)',
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
          padding: '32px 28px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: 'var(--shadow-card)',
          backdropFilter: 'blur(12px)',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--accent)',
            marginBottom: '12px',
            fontWeight: 700,
          }}
        >
          NASA Space Apps • Team LYTEN
        </div>

        <h1
          style={{
            fontSize: '32px',
            lineHeight: 1.2,
            margin: '0 0 16px 0',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          Junior Astronaut Mission Trainer
        </h1>

        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.45,
            color: 'var(--ink-dim)',
            margin: '0 0 28px 0',
          }}
        >
          Take command of an outpost on the Moon or Mars. Every decision costs power, air, food, or health.
        </p>

        <button
          type="button"
          data-testid="btn-start"
          onClick={onStart}
          autoFocus
          style={{
            width: '100%',
            height: '56px',
            fontSize: '19px',
            fontWeight: 700,
            background: 'var(--power)',
            color: '#05070d',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 16px rgba(255, 210, 74, 0.35)',
            marginBottom: '14px',
          }}
        >
          <span aria-hidden="true">🚀</span>
          <span>Start Mission</span>
          <span style={{ fontSize: '13px', opacity: 0.75, marginLeft: '6px' }}>(Space / 1)</span>
        </button>

        {onToggleJudge && (
          <button
            type="button"
            data-testid="btn-title-judge-mode"
            onClick={onToggleJudge}
            style={{
              width: '100%',
              minHeight: '44px',
              fontSize: '13px',
              fontWeight: 700,
              background: isJudgeEnabled ? 'rgba(255, 210, 74, 0.15)' : 'transparent',
              border: isJudgeEnabled ? '1px solid var(--power)' : '1px solid var(--border)',
              color: isJudgeEnabled ? 'var(--power)' : 'var(--ink-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <span>⚖️</span>
            <span>{isJudgeEnabled ? 'Judge Mode Active' : 'Space Apps Judge Mode [J]'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
