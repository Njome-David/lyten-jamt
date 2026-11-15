// src/ui/dialog/NovaSvg.tsx
// Pure procedural SVG illustration of companion astronaut Nova.
// Supports 6 facial expressions + goodbye gesture, strictly following PRESENTATION.md section 4.

import React from 'react';
import type { NovaExpression } from '../../content/dialogues';

export type { NovaExpression };

export interface NovaSvgProps {
  expression?: NovaExpression;
  className?: string;
  size?: number;
}

export const NovaSvg: React.FC<NovaSvgProps> = ({
  expression = 'neutral',
  className,
  size = 120,
}) => {
  return (
    <svg
      data-testid="nova-svg"
      data-expression={expression}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={className}
      role="img"
      aria-label={`Companion Nova (${expression})`}
      style={{ overflow: 'visible', flexShrink: 0 }}
    >
      <defs>
        <radialGradient id="helmet-gradient" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="60%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </radialGradient>
        <linearGradient id="visor-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="45%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="visor-sheen" x1="0%" y1="0%" x2="70%" y2="70%">
          <stop offset="0%" stopColor="#4fd8ff" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="suit-collar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* Suit Shoulders & Collar */}
      <path
        d="M 30 148 C 30 128 50 122 80 122 C 110 122 130 128 130 148 Z"
        fill="url(#suit-collar)"
        stroke="#475569"
        strokeWidth="2.5"
      />
      <rect x="70" y="126" width="20" height="8" rx="3" fill="#38bdf8" opacity="0.8" />

      {/* Helmet Shell */}
      <circle
        cx="80"
        cy="70"
        r="54"
        fill="url(#helmet-gradient)"
        stroke="#334155"
        strokeWidth="3"
      />

      {/* Helmet Audio / Comms Antennas (Ear discs) */}
      <circle cx="26" cy="70" r="8" fill="#475569" stroke="#1e293b" strokeWidth="2" />
      <circle cx="134" cy="70" r="8" fill="#475569" stroke="#1e293b" strokeWidth="2" />
      <path d="M 26 66 L 20 45" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="44" r="3" fill="#38bdf8" />

      {/* Dark Outer Visor Frame */}
      <rect
        x="36"
        y="32"
        width="88"
        height="74"
        rx="26"
        fill="#090d16"
        stroke="#475569"
        strokeWidth="3"
      />

      {/* Visor Glass Interior */}
      <rect
        x="40"
        y="36"
        width="80"
        height="66"
        rx="22"
        fill="url(#visor-glass)"
      />

      {/* Visor Glare / Sheen Reflection */}
      <path
        d="M 44 42 Q 80 38 116 52 Q 78 50 48 76 Z"
        fill="url(#visor-sheen)"
        opacity="0.85"
      />

      {/* Expressions Group inside Visor */}
      {/* 1. Neutral: calm wide eyes, slight friendly smile */}
      {expression === 'neutral' && (
        <g data-testid="expr-neutral">
          <ellipse cx="64" cy="65" rx="5" ry="6" fill="#f1f5f9" />
          <circle cx="65.5" cy="64" r="2" fill="#0f172a" />
          <circle cx="63" cy="62" r="1.2" fill="#ffffff" />

          <ellipse cx="96" cy="65" rx="5" ry="6" fill="#f1f5f9" />
          <circle cx="97.5" cy="64" r="2" fill="#0f172a" />
          <circle cx="95" cy="62" r="1.2" fill="#ffffff" />

          <path d="M 72 80 Q 80 85 88 80" stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* 2. Happy: curved smiling eyes, joyful mouth, pink cheeks */}
      {expression === 'happy' && (
        <g data-testid="expr-happy">
          <path d="M 58 66 Q 64 58 70 66" stroke="#4fd8ff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 90 66 Q 96 58 102 66" stroke="#4fd8ff" strokeWidth="3.5" strokeLinecap="round" fill="none" />

          {/* Cheeks */}
          <circle cx="56" cy="74" r="4" fill="#ff6b8b" opacity="0.6" />
          <circle cx="104" cy="74" r="4" fill="#ff6b8b" opacity="0.6" />

          {/* Open smile */}
          <path d="M 68 76 Q 80 90 92 76 Z" fill="#f1f5f9" stroke="#4fd8ff" strokeWidth="2" />
        </g>
      )}

      {/* 3. Worried: slanted eyebrows, concerned eyes, wavy nervous mouth */}
      {expression === 'worried' && (
        <g data-testid="expr-worried">
          {/* Eyebrows */}
          <path d="M 58 56 L 70 61" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 102 56 L 90 61" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

          <circle cx="65" cy="68" r="5" fill="#f1f5f9" />
          <circle cx="65" cy="68" r="2.5" fill="#0f172a" />

          <circle cx="95" cy="68" r="5" fill="#f1f5f9" />
          <circle cx="95" cy="68" r="2.5" fill="#0f172a" />

          {/* Wavy mouth */}
          <path d="M 70 83 Q 75 79 80 83 Q 85 87 90 82" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* 4. Alert: wide alarmed eyes, exclamation or open mouth, orange/red alert accents */}
      {expression === 'alert' && (
        <g data-testid="expr-alert">
          <circle cx="64" cy="64" r="7" fill="#ff5b3a" opacity="0.25" />
          <circle cx="64" cy="64" r="6" fill="#ffffff" />
          <circle cx="64" cy="64" r="3" fill="#ff5b3a" />

          <circle cx="96" cy="64" r="7" fill="#ff5b3a" opacity="0.25" />
          <circle cx="96" cy="64" r="6" fill="#ffffff" />
          <circle cx="96" cy="64" r="3" fill="#ff5b3a" />

          {/* Alert O mouth */}
          <ellipse cx="80" cy="82" rx="6" ry="7" fill="#090d16" stroke="#ff5b3a" strokeWidth="2.5" />

          {/* Little exclamation icon above visor */}
          <path d="M 80 18 L 80 26 M 80 29 L 80 30" stroke="#ff5b3a" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* 5. Thinking: glancing up-right, three thought dots */}
      {expression === 'thinking' && (
        <g data-testid="expr-thinking">
          <ellipse cx="64" cy="63" rx="5" ry="6" fill="#f1f5f9" />
          <circle cx="67" cy="60" r="2.2" fill="#0f172a" />

          <ellipse cx="96" cy="63" rx="5" ry="6" fill="#f1f5f9" />
          <circle cx="99" cy="60" r="2.2" fill="#0f172a" />

          {/* Small tilted mouth */}
          <path d="M 73 82 Q 81 80 88 83" stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Subtle bubbles/dots */}
          <circle cx="112" cy="48" r="2" fill="#ffd24a" />
          <circle cx="118" cy="42" r="3" fill="#ffd24a" />
        </g>
      )}

      {/* 6. Proud: confident sparkle eyes, star badge, broad victorious grin */}
      {expression === 'proud' && (
        <g data-testid="expr-proud">
          {/* Confident eyes */}
          <path d="M 58 64 Q 65 59 72 65" stroke="#ffd24a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 88 64 Q 95 59 102 65" stroke="#ffd24a" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Sparkles in visor */}
          <path d="M 65 68 L 65 72 M 63 70 L 67 70" stroke="#ffd24a" strokeWidth="1.5" />
          <path d="M 95 68 L 95 72 M 93 70 L 97 70" stroke="#ffd24a" strokeWidth="1.5" />

          {/* Big grin */}
          <path d="M 68 76 Q 80 88 92 76" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Star on suit */}
          <polygon
            points="80,128 82,132 87,132 83,135 85,139 80,136 75,139 77,135 73,132 78,132"
            fill="#ffd24a"
          />
        </g>
      )}

      {/* 7. Goodbye: friendly smile + articulated waving astronaut glove */}
      {expression === 'goodbye' && (
        <g data-testid="expr-goodbye">
          <ellipse cx="64" cy="65" rx="5" ry="6" fill="#f1f5f9" />
          <circle cx="65.5" cy="64" r="2" fill="#0f172a" />
          <ellipse cx="96" cy="65" rx="5" ry="6" fill="#f1f5f9" />
          <circle cx="97.5" cy="64" r="2" fill="#0f172a" />

          <path d="M 70 78 Q 80 88 90 78" stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Waving Astronaut Glove on right side */}
          <g transform="translate(118, 55) rotate(15)">
            {/* Glove wrist */}
            <rect x="0" y="14" width="16" height="8" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
            {/* Palm */}
            <circle cx="8" cy="8" r="9" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
            {/* 4 Fingers */}
            <rect x="0" y="-8" width="3.5" height="10" rx="1.8" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
            <rect x="4" y="-10" width="3.5" height="12" rx="1.8" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
            <rect x="8" y="-9" width="3.5" height="11" rx="1.8" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
            <rect x="12" y="-7" width="3.5" height="9" rx="1.8" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
            {/* Thumb */}
            <rect x="-5" y="3" width="7" height="3.5" rx="1.8" transform="rotate(-30)" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
          </g>
        </g>
      )}
    </svg>
  );
};

export default NovaSvg;
