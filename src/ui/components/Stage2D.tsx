'use client';

import React from 'react';
import type { Body, SiteId, ScreenId } from '../types';

interface Stage2DProps {
  body: Body;
  site: SiteId;
  screen: ScreenId;
  reducedMotion?: boolean;
}

export function Stage2D({ body, site, screen, reducedMotion: _reducedMotion = false }: Stage2DProps) {
  const isMars = body === 'mars';
  const isOrbit = screen === 'title' || screen === 'destination';
  const isShackleton = site === 'shackleton';

  const skyGradientId = isMars ? 'mars-sky' : isShackleton ? 'moon-shackleton-sky' : 'moon-sky';
  const groundColor = isMars ? '#7a311e' : isShackleton ? '#222733' : '#303748';
  const hillsColor = isMars ? '#4d1c11' : isShackleton ? '#121620' : '#1b202c';
  const distantHillsColor = isMars ? '#2c0f09' : '#0a0d14';

  return (
    <div
      data-testid="stage-2d"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
      aria-label={`Visual stage: ${isOrbit ? 'Orbit view' : `${body} surface at ${site}`}`}
      role="img"
    >
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          {/* Moon skies */}
          <linearGradient id="moon-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020308" />
            <stop offset="70%" stopColor="#080d1a" />
            <stop offset="100%" stopColor="#10182c" />
          </linearGradient>

          <linearGradient id="moon-shackleton-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#010205" />
            <stop offset="60%" stopColor="#040710" />
            <stop offset="100%" stopColor="#0a0f1d" />
          </linearGradient>

          {/* Mars sky */}
          <linearGradient id="mars-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a0907" />
            <stop offset="55%" stopColor="#3d1810" />
            <stop offset="100%" stopColor="#6e2d1d" />
          </linearGradient>

          {/* Earth glow */}
          <radialGradient id="earth-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8be2ff" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#2264c7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#051433" stopOpacity="0" />
          </radialGradient>

          {/* Sun glow */}
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8e7" stopOpacity="1" />
            <stop offset="40%" stopColor="#ffd24a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff9a1f" stopOpacity="0" />
          </radialGradient>

          {/* Mars dust haze */}
          <linearGradient id="mars-haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8a50" stopOpacity="0" />
            <stop offset="100%" stopColor="#c85a32" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Sky Background */}
        <rect x="0" y="0" width="1200" height="800" fill={`url(#${skyGradientId})`} />

        {/* Orbit mode stars & celestial bodies */}
        {isOrbit ? (
          <g data-testid="orbit-scene-elements">
            {/* Stars */}
            {[
              [80, 120, 2], [190, 80, 1.5], [260, 210, 1], [340, 140, 2.5],
              [480, 90, 1.5], [620, 190, 1.2], [750, 70, 2], [880, 160, 1.5],
              [990, 110, 2], [1120, 180, 1.5], [150, 320, 1.2], [420, 290, 1],
              [780, 310, 1.5], [1050, 270, 2]
            ].map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="#eaf1ff" opacity={0.7 + (i % 3) * 0.15} />
            ))}

            {/* Earth in deep space */}
            <circle cx="280" cy="240" r="100" fill="url(#earth-glow)" />
            <circle cx="280" cy="240" r="70" fill="#1b4d9b" />
            <ellipse cx="270" cy="230" rx="40" ry="25" fill="#4fa8ff" opacity="0.7" />
            <ellipse cx="300" cy="255" rx="30" ry="18" fill="#eaf1ff" opacity="0.6" />

            {/* Target Moon or Mars orbital sphere */}
            <g transform={`translate(${isMars ? '860, 340' : '820, 320'})`}>
              <circle
                cx="0"
                cy="0"
                r={isMars ? 130 : 95}
                fill={isMars ? '#b44422' : '#8892a4'}
              />
              <circle
                cx={isMars ? -30 : -20}
                cy={isMars ? -30 : -20}
                r={isMars ? 120 : 85}
                fill={isMars ? '#d45a32' : '#a8b2c6'}
                opacity="0.4"
              />
              {/* Craters / features */}
              <circle cx="-20" cy="15" r={isMars ? 24 : 18} fill={isMars ? '#7a2812' : '#5b6475'} opacity="0.7" />
              <circle cx="35" cy="-25" r={isMars ? 18 : 14} fill={isMars ? '#7a2812' : '#5b6475'} opacity="0.6" />
              <circle cx="20" cy="40" r={isMars ? 15 : 12} fill={isMars ? '#7a2812' : '#5b6475'} opacity="0.5" />
            </g>
          </g>
        ) : (
          /* Surface mode: landscape & outpost */
          <g data-testid="surface-scene-elements">
            {/* Stars for Moon or high atmosphere */}
            {!isMars && (
              <g opacity="0.85">
                {[
                  [60, 90, 1.5], [140, 50, 2], [220, 110, 1], [320, 70, 2.5],
                  [460, 130, 1.2], [580, 80, 1.8], [720, 100, 2], [840, 60, 1.5],
                  [960, 120, 1], [1080, 85, 2.2], [1150, 140, 1.5]
                ].map(([cx, cy, r], i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} fill="#eaf1ff" />
                ))}
                {/* Earth in lunar sky */}
                <circle cx="980" cy="180" r="54" fill="url(#earth-glow)" />
                <circle cx="980" cy="180" r="38" fill="#1e54a8" />
                <ellipse cx="975" cy="175" rx="22" ry="14" fill="#69beff" opacity="0.8" />
                <ellipse cx="990" cy="190" rx="16" ry="10" fill="#ffffff" opacity="0.7" />
              </g>
            )}

            {/* Sun */}
            <circle
              cx={isMars ? '240' : isShackleton ? '140' : '220'}
              cy={isMars ? '210' : isShackleton ? '440' : '200'}
              r={isMars ? 45 : isShackleton ? 32 : 55}
              fill="url(#sun-glow)"
            />

            {/* Mars atmosphere dust haze */}
            {isMars && <rect x="0" y="250" width="1200" height="550" fill="url(#mars-haze)" />}

            {/* Distant Hills / Crater wall */}
            <path
              d="M 0 490 Q 220 410 460 470 T 920 440 Q 1060 420 1200 480 L 1200 800 L 0 800 Z"
              fill={distantHillsColor}
            />

            {/* Midground Terrain */}
            <path
              d="M 0 530 Q 300 470 600 520 T 1200 510 L 1200 800 L 0 800 Z"
              fill={hillsColor}
            />

            {/* Foreground Terrain with craters */}
            <path
              d="M 0 580 Q 250 550 520 590 T 1000 570 Q 1100 580 1200 560 L 1200 800 L 0 800 Z"
              fill={groundColor}
            />

            {/* Craters on ground */}
            <ellipse cx="320" cy="650" rx="60" ry="16" fill={hillsColor} opacity="0.7" />
            <ellipse cx="880" cy="680" rx="85" ry="20" fill={hillsColor} opacity="0.6" />

            {/* Outpost Complex */}
            <g transform="translate(480, 480)" data-testid="outpost-group">
              {/* Habitat Dome */}
              <ellipse cx="140" cy="110" rx="90" ry="55" fill="#cad5e8" />
              <ellipse cx="140" cy="110" rx="82" ry="48" fill="#eaf1ff" opacity="0.9" />
              {/* Airlock */}
              <rect x="220" y="105" width="30" height="25" rx="4" fill="#606d85" />

              {/* Bio-Dome (Mars) or Lab Module (Moon) */}
              <ellipse
                cx="50"
                cy="115"
                rx="45"
                ry="35"
                fill={isMars ? 'rgba(139, 226, 139, 0.45)' : 'rgba(79, 216, 255, 0.35)'}
                stroke={isMars ? '#8be28b' : '#4fd8ff'}
                strokeWidth="2"
              />

              {/* Solar Panels Array */}
              <g transform="translate(-110, 80)">
                <line x1="0" y1="40" x2="0" y2="0" stroke="#8a97ae" strokeWidth="4" />
                <rect x="-35" y="-15" width="70" height="28" rx="2" fill="#203d6d" stroke="#4fd8ff" strokeWidth="1.5" />
                <line x1="-35" y1="-1" x2="35" y2="-1" stroke="#4fd8ff" strokeWidth="1" />
                <line x1="-12" y1="-15" x2="-12" y2="13" stroke="#4fd8ff" strokeWidth="1" />
                <line x1="12" y1="-15" x2="12" y2="13" stroke="#4fd8ff" strokeWidth="1" />
              </g>

              {/* Comm Antenna Dish */}
              <g transform="translate(290, 70)">
                <line x1="0" y1="50" x2="0" y2="0" stroke="#717d93" strokeWidth="4" />
                <path d="M -25 -20 A 30 30 0 0 1 25 -20 L 0 0 Z" fill="#9fb0cf" stroke="#cad5e8" strokeWidth="2" />
                <circle cx="0" cy="-28" r="3" fill="#ff5b3a" />
              </g>

              {/* Rover */}
              <g transform="translate(-50, 115)">
                {/* Wheels */}
                <circle cx="-25" cy="28" r="10" fill="#1b202c" stroke="#606d85" strokeWidth="3" />
                <circle cx="2" cy="28" r="10" fill="#1b202c" stroke="#606d85" strokeWidth="3" />
                <circle cx="28" cy="28" r="10" fill="#1b202c" stroke="#606d85" strokeWidth="3" />
                {/* Body */}
                <rect x="-30" y="8" width="62" height="18" rx="4" fill="#ffd24a" />
                <rect x="-18" y="0" width="28" height="12" rx="3" fill="#eaf1ff" opacity="0.85" />
                {/* Mast */}
                <line x1="15" y1="8" x2="18" y2="-8" stroke="#414a5c" strokeWidth="2" />
                <circle cx="19" cy="-10" r="3" fill="#4fd8ff" />
              </g>

              {/* Astronaut silhouette */}
              <g transform="translate(180, 118)">
                <circle cx="0" cy="0" r="5" fill="#eaf1ff" />
                <rect x="-3" y="5" width="6" height="10" rx="2" fill="#cad5e8" />
                <line x1="-2" y1="15" x2="-2" y2="24" stroke="#8a97ae" strokeWidth="2" />
                <line x1="2" y1="15" x2="2" y2="24" stroke="#8a97ae" strokeWidth="2" />
              </g>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
