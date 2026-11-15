// src/judge/ScienceMapModal.tsx
// Science Map / NASA Data Passport modal dialog for Space Apps Challenge judges.
// Details real NASA endpoints (DONKI, OSDR, PDS), bundled snapshots, and REAL vs GAME tags.

import React, { useEffect, useCallback } from 'react';
import { SCIENTIFIC_FACTS } from '../data/facts';

export interface ScienceMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DatasetEntry {
  id: string;
  name: string;
  source: string;
  endpoint: string;
  type: 'BUNDLED' | 'LIVE';
  description: string;
  gameUsage: string;
}

const NASA_DATASETS: DatasetEntry[] = [
  {
    id: 'donki-flr',
    name: 'DONKI Solar Flares & Space Weather',
    source: 'NASA Heliophysics / CCMC GSFC',
    endpoint: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR',
    type: 'BUNDLED',
    description: 'Real solar X-ray flux detections with flare class (M & X), peak times, and active region numbers.',
    gameUsage: 'Drives solar flare alerts, countdowns, radiation spikes, and dynamic solar weather status in the HUD.',
  },
  {
    id: 'donki-may2024',
    name: 'May 2024 Historic Solar Superstorm',
    source: 'NASA Heliophysics / CCMC DONKI',
    endpoint: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR (2024-05-08 to 2024-05-15)',
    type: 'BUNDLED',
    description: 'Record-setting extreme solar storm series, featuring the massive X12.0 solar flare from active region AR 13664.',
    gameUsage: 'Replayable in Judge Mode to experience extreme radiation shielding decisions with genuine historical telemetry.',
  },
  {
    id: 'osdr-biology',
    name: 'Open Science Data Repository (OSDR)',
    source: 'NASA Biological & Physical Sciences / GeneLab',
    endpoint: 'https://osdr.nasa.gov/bio/repo/data/studies/',
    type: 'BUNDLED',
    description: 'Peer-reviewed space biology datasets: OSD-251 (fractional gravity botany), OSD-379 (radiorésistance), OSD-665 (cell survival).',
    gameUsage: 'Directly informs the hydroponic greenhouse mission steps, crew radiation recovery mechanics, and experiment archetypes.',
  },
  {
    id: 'pds-planetary',
    name: 'Planetary Data System (PDS)',
    source: 'NASA PDS / LRO (LOLA) / MRO (HiRISE)',
    endpoint: 'https://pds.nasa.gov/',
    type: 'BUNDLED',
    description: 'Topographic elevation maps, permanently shadowed regions (PSR), and crater morphology for Moon and Mars.',
    gameUsage: 'Calibrates landing site challenges: Shackleton (PSR ice & severe night), Tranquillitatis, Jezero (river delta), and Gale Crater.',
  },
];

export const ScienceMapModal: React.FC<ScienceMapModalProps> = ({ isOpen, onClose }) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="science-map-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="science-map-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 13, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        padding: '20px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        data-testid="science-map-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(860px, 100%)',
          maxHeight: '90vh',
          background: 'var(--panel-gradient, rgba(12, 20, 39, 0.98))',
          border: '1.5px solid var(--air, #4fd8ff)',
          borderRadius: 'var(--radius-xl, 24px)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(79, 216, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-panel, rgba(148, 163, 184, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            background: 'rgba(15, 23, 42, 0.75)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }} aria-hidden="true">
              🔬
            </span>
            <div>
              <h2
                id="science-map-title"
                style={{
                  margin: 0,
                  fontSize: 'var(--text-title, 24px)',
                  fontWeight: 800,
                  color: 'var(--air, #4fd8ff)',
                  letterSpacing: '-0.02em',
                }}
              >
                NASA Science & Data Passport
              </h2>
              <div
                style={{
                  fontSize: 'var(--text-xs, 12px)',
                  color: 'var(--ink-dim, #94a3b8)',
                  marginTop: '2px',
                }}
              >
                Space Apps 2026 • Full Data Provenance & Real Science Mapping
              </div>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-close-science-map"
            onClick={onClose}
            aria-label="Close Science Map"
            style={{
              minWidth: '40px',
              minHeight: '40px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md, 12px)',
              background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
              border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.2))',
              color: 'var(--ink, #f1f5f9)',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Data Tagging Legend */}
          <section
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg, 16px)',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.15))',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  background: 'var(--chip-real-bg, rgba(79, 216, 255, 0.15))',
                  border: '1px solid var(--chip-real-border, rgba(79, 216, 255, 0.4))',
                  color: 'var(--chip-real-ink, #4fd8ff)',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                REAL NASA DATA
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-dim, #94a3b8)' }}>
                Directly parsed from official NASA snapshots with verifiable provenance.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  background: 'var(--chip-game-bg, rgba(255, 210, 74, 0.12))',
                  border: '1px solid var(--chip-game-border, rgba(255, 210, 74, 0.35))',
                  color: 'var(--chip-game-ink, #ffd24a)',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                GAME RULE
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-dim, #94a3b8)' }}>
                Calibrated trade-off value designed for kids (7–12 yo) agency gameplay.
              </span>
            </div>
          </section>

          {/* NASA Datasets Table */}
          <section>
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: 'var(--text-base, 18px)',
                fontWeight: 700,
                color: 'var(--ink, #f1f5f9)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🛰️</span> Active NASA Open Data Integrations
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {NASA_DATASETS.map((ds) => (
                <div
                  key={ds.id}
                  data-testid={`dataset-card-${ds.id}`}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-lg, 16px)',
                    background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
                    border: '1px solid var(--border-panel, rgba(148, 163, 184, 0.2))',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '15px',
                          color: 'var(--ink, #f1f5f9)',
                        }}
                      >
                        {ds.name}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(79, 216, 255, 0.15)',
                          border: '1px solid rgba(79, 216, 255, 0.4)',
                          color: 'var(--air, #4fd8ff)',
                        }}
                      >
                        {ds.type}
                      </span>
                    </div>

                    <a
                      href={ds.endpoint}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '11px',
                        color: 'var(--air, #4fd8ff)',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      NASA Source ↗
                    </a>
                  </div>

                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--ink-muted, #64748b)',
                      marginBottom: '8px',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    Source: {ds.source}
                  </div>

                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '13px',
                      color: 'var(--ink-dim, #94a3b8)',
                      lineHeight: 1.4,
                    }}
                  >
                    {ds.description}
                  </p>

                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--power, #ffd24a)',
                      background: 'rgba(255, 210, 74, 0.08)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 210, 74, 0.2)',
                    }}
                  >
                    <strong>In-Game Impact:</strong> {ds.gameUsage}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sourced Scientific Facts */}
          <section>
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: 'var(--text-base, 18px)',
                fontWeight: 700,
                color: 'var(--ink, #f1f5f9)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>📚</span> Verified Scientific Fundamentals
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
              }}
            >
              {SCIENTIFIC_FACTS.map((fact) => (
                <div
                  key={fact.id}
                  data-testid={`fact-card-${fact.id}`}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md, 12px)',
                    background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
                    border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.15))',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '13px',
                        color: 'var(--air, #4fd8ff)',
                        marginBottom: '4px',
                      }}
                    >
                      {fact.title}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--ink-dim, #94a3b8)',
                        lineHeight: 1.35,
                      }}
                    >
                      {fact.fact}
                    </div>
                  </div>

                  <a
                    href={fact.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '11px',
                      color: 'var(--ink-muted, #64748b)',
                      textDecoration: 'none',
                    }}
                  >
                    Credit: {fact.sourceCredit} ↗
                  </a>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ScienceMapModal;
