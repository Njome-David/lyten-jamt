'use client';

import React from 'react';
import type { Body, SiteId } from '../types';

interface SitePickerProps {
  body: Body;
  onSelect: (site: SiteId) => void;
  onBack: () => void;
}

const SITES_BY_BODY: Record<Body, { id: SiteId; name: string; icon: string; desc: string; key: string }[]> = {
  moon: [
    {
      id: 'shackleton',
      name: 'Shackleton Crater',
      icon: '❄️',
      desc: 'Lunar South Pole: deep shadows, potential water ice',
      key: '1',
    },
    {
      id: 'tranquillitatis',
      name: 'Tranquillitatis',
      icon: '🌑',
      desc: 'Apollo 11 historic landing site: open basalt plains',
      key: '2',
    },
  ],
  mars: [
    {
      id: 'jezero',
      name: 'Jezero Crater',
      icon: '🏜️',
      desc: 'Ancient lake bed: clay minerals, river delta',
      key: '1',
    },
    {
      id: 'gale',
      name: 'Gale Crater',
      icon: '🌋',
      desc: 'Mount Sharp slopes: layered sulfate-bearing units',
      key: '2',
    },
  ],
};

export function SitePicker({ body, onSelect, onBack }: SitePickerProps) {
  const sites = SITES_BY_BODY[body];

  return (
    <div
      data-testid="screen-sites"
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
          Landing Site: {body === 'moon' ? 'Moon' : 'Mars'}
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--ink-dim)', margin: '0 0 20px 0' }}>
          Select the location for your base deployment
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {sites.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              data-testid={`btn-site-${s.id}`}
              onClick={() => onSelect(s.id)}
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
                <span style={{ fontSize: '26px' }} aria-hidden="true">{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '17px' }}>{s.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-dim)' }}>{s.desc}</div>
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>({s.key})</span>
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
