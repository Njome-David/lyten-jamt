// src/ui/dialog/DialogBox.tsx
// Dialog box for companion Nova following PRESENTATION.md section 4 and DESIGN.md.
// Features typewriter effect, tap/Enter/Space to complete/continue, Skip button,
// spotlight integration, and instant rendering on prefers-reduced-motion.

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NovaSvg, type NovaExpression } from './NovaSvg';
import { SpotlightOverlay } from './SpotlightOverlay';

export interface DialogueItem {
  id: string;
  text: string;
  speaker?: string;
  expression?: NovaExpression;
  spotlightTarget?: string;
}

export interface DialogBoxProps {
  dialogue: DialogueItem;
  onNext: () => void;
  onSkip?: () => void;
}

/** Check if reduced motion is requested */
function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const DialogBox: React.FC<DialogBoxProps> = ({
  dialogue,
  onNext,
  onSkip,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize typewriter or full text
  useEffect(() => {
    const text = dialogue.text;
    const reducedMotion = getPrefersReducedMotion();

    if (reducedMotion) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsTyping(false);
      }
    }, 25);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dialogue.id, dialogue.text]);

  // Advance or complete current line
  const handleUserInteract = useCallback(() => {
    if (isTyping) {
      // Tap to complete phrase immediately
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedText(dialogue.text);
      setIsTyping(false);
    } else {
      // Tap to advance to next dialogue
      onNext();
    }
  }, [isTyping, dialogue.text, onNext]);

  // Keyboard navigation: Enter or Space
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleUserInteract();
      } else if (e.key === 'Escape' && onSkip) {
        e.preventDefault();
        onSkip();
      }
    },
    [handleUserInteract, onSkip]
  );

  return (
    <>
      {/* Target spotlight if defined */}
      {dialogue.spotlightTarget && (
        <SpotlightOverlay target={dialogue.spotlightTarget} />
      )}

      {/* Dialog container positioned bottom-center */}
      <aside
        data-testid="dialog-box"
        ref={containerRef}
        role="dialog"
        aria-live="polite"
        aria-label={`Dialogue from ${dialogue.speaker ?? 'Nova'}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={handleUserInteract}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(640px, calc(100vw - 32px))',
          zIndex: 1100,
          background: 'var(--panel-gradient, rgba(12, 20, 39, 0.95))',
          border: '1.5px solid var(--border-panel, rgba(148, 163, 184, 0.25))',
          borderRadius: 'var(--radius-xl, 24px)',
          boxShadow: 'var(--shadow-panel, 0 14px 34px -14px rgba(2,6,23,0.75))',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        {/* Companion SVG Avatar */}
        <NovaSvg
          expression={dialogue.expression ?? 'neutral'}
          size={84}
          className="companion-avatar"
        />

        {/* Text and Actions */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header with speaker and tap hint */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span
              data-testid="dialog-speaker"
              style={{
                fontFamily: 'var(--font-system, system-ui)',
                fontSize: 'var(--text-sm, 14px)',
                fontWeight: 700,
                color: 'var(--air, #4fd8ff)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {dialogue.speaker ?? 'Nova'}
            </span>

            <span
              style={{
                fontSize: '12px',
                color: 'var(--ink-muted, #64748b)',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {isTyping ? 'Tap to finish' : 'Space / Tap next'}
            </span>
          </div>

          {/* Dialogue Body */}
          <p
            data-testid="dialog-text"
            style={{
              margin: 0,
              fontFamily: 'var(--font-system, system-ui)',
              fontSize: 'var(--text-base, 18px)',
              lineHeight: 1.45,
              color: 'var(--ink, #f1f5f9)',
              fontWeight: 500,
              minHeight: '2.9em',
            }}
          >
            {displayedText}
            {isTyping && (
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '16px',
                  marginLeft: '4px',
                  backgroundColor: 'var(--air, #4fd8ff)',
                  verticalAlign: 'middle',
                }}
              />
            )}
          </p>

          {/* Bottom Action Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '12px',
              marginTop: '10px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {onSkip && (
              <button
                type="button"
                data-testid="dialog-skip-btn"
                onClick={onSkip}
                style={{
                  minWidth: 'var(--touch-target-min, 48px)',
                  minHeight: 'var(--touch-target-min, 48px)',
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.2))',
                  borderRadius: 'var(--radius-md, 12px)',
                  color: 'var(--ink-dim, #94a3b8)',
                  fontSize: 'var(--text-sm, 14px)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Skip all
              </button>
            )}

            <button
              type="button"
              data-testid="dialog-next-btn"
              onClick={handleUserInteract}
              style={{
                minWidth: 'var(--touch-target-min, 48px)',
                minHeight: 'var(--touch-target-min, 48px)',
                padding: '8px 20px',
                background: 'var(--air, #4fd8ff)',
                color: 'var(--ink-inverse, #020617)',
                border: 'none',
                borderRadius: 'var(--radius-md, 12px)',
                fontSize: 'var(--text-sm, 14px)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isTyping ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DialogBox;
