'use client';

import React from 'react';
// import type { Body, SiteId, MissionTemplateId } from '../types';
import type { Body, SiteId, MissionTemplateId } from '../types';
import type { RunScore } from '../../engine/types';
import { TelemetrySparkline } from '../components/TelemetrySparkline';

interface DebriefProps {
  destination: Body;
  site: SiteId;
  missionId: MissionTemplateId;
  score?: RunScore | null;
  onRestart: () => void;
  meterHistory?: Array<{ label: string; meters: import('../../engine/types').Meters }>;
}

export function Debrief({ destination, site, missionId, score, onRestart, meterHistory }: DebriefProps) {
  const starsCount = score?.stars ?? 3;
  const starsDisplay = '⭐'.repeat(starsCount) || '🌑';
  const xpTotal = score?.xp?.total ?? 350;
  const isWon = starsCount > 0;

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
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg, 20px)',
          padding: '32px 28px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: 'var(--shadow-card)',
          backdropFilter: 'blur(12px)',
          pointerEvents: 'auto',
        }}
      >
        {/* Result Icon */}
        <div style={{ fontSize: '42px', marginBottom: '8px' }} aria-hidden="true">
          {isWon ? '🏆' : '⚠️'}
        </div>

        {/* Optional Telemetry */}
        {meterHistory && meterHistory.length > 0 && (
          <TelemetrySparkline data={meterHistory.map((entry, idx) => ({
            timestamp: idx,
            power: entry.meters.power,
            air: entry.meters.air,
            food: entry.meters.food,
            health: entry.meters.health,
          }))} />
        )}

        <h2 style={{ fontSize: '28px', margin: '0 0 8px 0', fontWeight: 800 }}>
          {isWon ? 'Mission Accomplished!' : 'Mission Debrief: Recovery Needed'}
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--ink-dim)', margin: '0 0 20px 0' }}>
          {score?.causeSummary ?? `Mission debrief for ${destination.toUpperCase()} outpost at ${site.toUpperCase()}`}
        </p>

        {/* Evaluation Summary */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-around',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>Rating</div>
            <div data-testid="debrief-stars" style={{ fontSize: '20px', color: 'var(--power)', fontWeight: 800 }}>
              {starsDisplay}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>Mission</div>
            <div style={{ fontSize: '15px', fontWeight: 700, textTransform: 'capitalize' }}>{missionId}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>XP Earned</div>
            <div data-testid="debrief-xp" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent, #60a5fa)' }}>
              +{xpTotal} XP
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>Status</div>
            <div style={{ fontSize: '15px', color: isWon ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
              {isWon ? 'Nominal' : 'Critical'}
            </div>
          </div>
        </div>

        {/* Incidents List */}
        {score?.incidents && score.incidents.length > 0 && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius, 12px)',
              padding: '12px 16px',
              marginBottom: '20px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#f87171', marginBottom: '6px' }}>
              INCIDENTS LOGGED [REAL DATA]:
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--ink-dim)' }}>
              {score.incidents.map((inc, i) => (
                <li key={i}>{inc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tip for next mission */}
        {score?.nextTimeTip && (
          <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--ink-dim)', marginBottom: '24px' }}>
            💡 {score.nextTimeTip}
          </p>
        )}

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
            cursor: 'pointer',
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
