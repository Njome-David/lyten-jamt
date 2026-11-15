'use client';

import React from 'react';
import type { Body, SiteId, MissionTemplateId } from '../types';

interface DebriefProps {
  destination: Body;
  site: SiteId;
  missionId: MissionTemplateId;
  onRestart: () => void;
}

export function Debrief({ destination, site, missionId, onRestart }: DebriefProps) {
  return (
    <div
      data-testid="screen-debrief"
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
          padding: '32px 28px',
          maxWidth: '540px',
          width: '100%',
          boxShadow: 'var(--shadow-card)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ fontSize: '42px', marginBottom: '8px' }} aria-hidden="true">
          🏆
        </div>

        <h2 style={{ fontSize: '28px', margin: '0 0 8px 0', fontWeight: 800 }}>
          Mission Accomplished!
        </h2>

        <p style={{ fontSize: '15px', color: 'var(--ink-dim)', margin: '0 0 20px 0' }}>
          Mission debrief for {destination.toUpperCase()} outpost at {site.toUpperCase()}
        </p>

        {/* Evaluation Summary */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-around',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>Rating</div>
            <div style={{ fontSize: '20px', color: 'var(--power)', fontWeight: 800 }}>⭐⭐⭐</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>Mission Type</div>
            <div style={{ fontSize: '15px', fontWeight: 700, textTransform: 'capitalize' }}>{missionId}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>Survival</div>
            <div style={{ fontSize: '15px', color: 'var(--success)', fontWeight: 700 }}>100% Nominal</div>
          </div>
        </div>

        {/* Restart Action */}
        <button
          type="button"
          data-testid="btn-restart"
          onClick={onRestart}
          autoFocus
          style={{
            width: '100%',
            height: '52px',
            fontSize: '18px',
            fontWeight: 700,
            background: 'var(--power)',
            color: '#05070d',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(255, 210, 74, 0.3)',
          }}
        >
          <span aria-hidden="true">🔄</span>
          <span>Train Next Mission</span>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>(Space / 1)</span>
        </button>
      </div>
    </div>
  );
}
