'use client';

import React from 'react';
import type { SaveV1 } from '../../engine/types';
import { getRankForXp } from '../../progress/ranks';

interface TitleProps {
  onStart: () => void;
  onToggleJudge?: () => void;
  isJudgeEnabled?: boolean;
  save: SaveV1;
  onOpenLocker: () => void;
}

export function Title({ onStart, onToggleJudge, isJudgeEnabled, save, onOpenLocker }: TitleProps) {
  const rank = getRankForXp(save.xp);
  const streakDays = save.streak.count;
  const jokerReady = save.streak.jokerReady;

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
      }}
    >
      {/* Profile Card */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg, 20px)',
          padding: '24px 20px',
          maxWidth: '560px',
          width: '100%',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Avatar placeholder */}
        <div
          style={{
            width: '64px',
            height: '64px',
            background: 'var(--accent)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: '#05070d',
          }}
          aria-label="avatar"
        >
          🚀
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)' }}>{save.profile.codename}</div>
          <div style={{ fontSize: '13px', color: 'var(--ink-dim)' }}>{rank.title}</div>
          <div style={{ fontSize: '13px', color: 'var(--ink-dim)' }}>{save.xp} XP</div>
          <div style={{ fontSize: '13px', color: 'var(--ink-dim)' }}>{streakDays} day{streakDays !== 1 ? 's' : ''} streak</div>
          {jokerReady && <div style={{ fontSize: '16px' }}>🃏 Joker Shield</div>}
        </div>
      </div>

      {/* Header */}
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
        <button
          type="button"
          data-testid="btn-astronaut-locker"
          onClick={onOpenLocker}
          style={{
            width: '100%',
            height: '48px',
            fontSize: '15px',
            fontWeight: 600,
            background: 'var(--accent)',
            color: '#05070d',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          Astronaut Locker
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
