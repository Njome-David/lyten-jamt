// src/ui/components/AlertOverlay.tsx
// Critical emergency modal overlay with fluid countdown bar, real DONKI telemetry,
// and 3 trade-off choices (A / B / C) with keyboard access.
// Strictly respects DESIGN.md section 4 and PRESENTATION.md section 5.

import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { AlertSpec } from '../../engine/types';

export interface AlertOverlayProps {
  alert: AlertSpec;
  onSelectChoice: (choiceId: 'A' | 'B' | 'C' | 'EXPIRED') => void;
}

export const AlertOverlay: React.FC<AlertOverlayProps> = ({
  alert,
  onSelectChoice,
}) => {
  const durationMs = (alert.durationSec || 5) * 1000;
  const [timeLeftMs, setTimeLeftMs] = useState(durationMs);
  const startTimeRef = useRef<number | null>(null);
  const hasExpiredRef = useRef(false);

  // Countdown animation using requestAnimationFrame
  useEffect(() => {
    if (!alert.timed) return;

    let animId: number;
    startTimeRef.current = Date.now();
    hasExpiredRef.current = false;

    const tick = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, durationMs - elapsed);
      setTimeLeftMs(remaining);

      if (remaining <= 0) {
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true;
          onSelectChoice('EXPIRED');
        }
      } else {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [alert.timed, durationMs, onSelectChoice]);

  // Keyboard shortcut listener (1 / A, 2 / B, 3 / C)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === '1' || key === 'a') {
        e.preventDefault();
        onSelectChoice('A');
      } else if (key === '2' || key === 'b') {
        e.preventDefault();
        onSelectChoice('B');
      } else if (key === '3' || key === 'c') {
        e.preventDefault();
        onSelectChoice('C');
      }
    },
    [onSelectChoice]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const progressPercent = alert.timed
    ? Math.max(0, Math.min(100, (timeLeftMs / durationMs) * 100))
    : 100;
  const secondsDisplay = (timeLeftMs / 1000).toFixed(1);

  return (
    <div
      data-testid="alert-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-description"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 13, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        data-testid="alert-dialog-card"
        style={{
          width: 'min(640px, 100%)',
          background: 'var(--panel-gradient, rgba(19, 30, 56, 0.95))',
          border: '2px solid var(--alert, #ff5b3a)',
          borderRadius: 'var(--radius-xl, 24px)',
          boxShadow: '0 20px 50px rgba(255, 91, 58, 0.35)',
          padding: '24px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Header: Title and Countdown */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }} aria-hidden="true">
              🚨
            </span>
            <h2
              id="alert-title"
              data-testid="alert-title"
              style={{
                margin: 0,
                fontSize: 'var(--text-title, 28px)',
                fontWeight: 800,
                color: 'var(--alert, #ff5b3a)',
                letterSpacing: '-0.02em',
              }}
            >
              {alert.title}
            </h2>
          </div>

          {alert.timed && (
            <div
              data-testid="alert-timer-display"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 'var(--text-base, 18px)',
                fontWeight: 800,
                color: 'var(--alert, #ff5b3a)',
                background: 'rgba(255, 91, 58, 0.15)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm, 8px)',
                border: '1px solid var(--alert, #ff5b3a)',
              }}
            >
              ⏱️ {secondsDisplay}s
            </div>
          )}
        </div>

        {/* Countdown Progress Bar */}
        {alert.timed && (
          <div
            data-testid="alert-countdown-bar"
            style={{
              height: '8px',
              width: '100%',
              backgroundColor: 'var(--bg-deep, #05070d)',
              borderRadius: 'var(--radius-pill, 9999px)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: 'var(--alert, #ff5b3a)',
                transition: 'width 80ms linear',
              }}
            />
          </div>
        )}

        {/* Alert Description */}
        <p
          id="alert-description"
          data-testid="alert-description"
          style={{
            margin: 0,
            fontSize: 'var(--text-base, 18px)',
            lineHeight: 1.4,
            color: 'var(--ink, #f1f5f9)',
          }}
        >
          {alert.description}
        </p>

        {/* Real NASA Telemetry if available (DONKI Flare) */}
        {alert.flare && (
          <div
            data-testid="alert-nasa-telemetry"
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md, 12px)',
              background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
              border: '1px solid var(--chip-real-border, rgba(79, 216, 255, 0.4))',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              fontSize: 'var(--text-xs, 12px)',
            }}
          >
            <span
              style={{
                color: 'var(--chip-real-ink, #4fd8ff)',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              REAL NASA DATA (DONKI)
            </span>
            <span style={{ color: 'var(--ink, #f1f5f9)' }}>
              Class: <strong>{alert.flare.classType}</strong>
            </span>
            {alert.flare.activeRegionNum && (
              <span style={{ color: 'var(--ink, #f1f5f9)' }}>
                Region: <strong>AR {alert.flare.activeRegionNum}</strong>
              </span>
            )}
            <span style={{ color: 'var(--ink-muted, #64748b)' }}>
              Peak: {alert.flare.peakTime}
            </span>
          </div>
        )}

        {/* 3 Emergency Choices (A, B, C) */}
        <div
          data-testid="alert-choices"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '6px',
          }}
        >
          {alert.choices.map((choice, index) => {
            const keyShortcut = (index + 1).toString();
            return (
              <button
                key={choice.id}
                type="button"
                data-testid={`alert-choice-${choice.id}`}
                onClick={() => onSelectChoice(choice.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md, 12px)',
                  background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
                  border: '1px solid var(--border-panel, rgba(148, 163, 184, 0.2))',
                  color: 'var(--ink, #f1f5f9)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  minHeight: 'var(--touch-target-min, 48px)',
                  transition: 'all var(--transition-fast, 150ms ease-out)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontWeight: 800,
                        color: 'var(--air, #4fd8ff)',
                      }}
                    >
                      [{keyShortcut}] {choice.label}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 210, 74, 0.15)',
                        border: '1px solid rgba(255, 210, 74, 0.3)',
                        color: 'var(--warning, #ffd24a)',
                      }}
                    >
                      {choice.tradeoffTag}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-xs, 12px)',
                      color: 'var(--ink-dim, #94a3b8)',
                      marginTop: '4px',
                    }}
                  >
                    {choice.summary}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '16px',
                    color: 'var(--ink-muted, #64748b)',
                    paddingLeft: '12px',
                  }}
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AlertOverlay;
