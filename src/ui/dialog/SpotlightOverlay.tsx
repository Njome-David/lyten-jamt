// src/ui/dialog/SpotlightOverlay.tsx
// Pure CSS/SVG spotlight overlay that focuses attention on an interface target element.
// Renders backdrop cutout, pointerEvents: none, and safe in SSR.

import React, { useEffect, useState } from 'react';

export interface SpotlightOverlayProps {
  /** CSS selector or data-testid query (e.g. '[data-testid="hud-meters"]') */
  target: string;
}

interface ElementRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({ target }) => {
  const [rect, setRect] = useState<ElementRect | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const measure = () => {
      const el = document.querySelector(target) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        // Add a gentle margin of 8px around the element
        setRect({
          left: Math.max(0, r.left - 8),
          top: Math.max(0, r.top - 8),
          width: r.width + 16,
          height: r.height + 16,
        });
      } else {
        setRect(null);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
    };
  }, [target]);

  if (!rect) {
    // If no target found yet, render subtle dim backdrop
    return (
      <div
        data-testid="spotlight-dim-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 13, 0.55)',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />
    );
  }

  return (
    <div
      data-testid="spotlight-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* Box shadow on the cutout box creates a dark semi-transparent mask with an illuminated hole */}
      <div
        data-testid="spotlight-target-box"
        style={{
          position: 'fixed',
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: '0 0 0 9999px rgba(5, 7, 13, 0.65)',
          border: '2px solid var(--air, #4fd8ff)',
          pointerEvents: 'none',
          transition: 'all 0.25s ease-out',
        }}
      />
    </div>
  );
};

export default SpotlightOverlay;
