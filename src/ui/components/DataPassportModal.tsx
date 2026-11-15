// src/ui/components/DataPassportModal.tsx
// Full NASA Data Passport dialog generated dynamically from snapshots and verified facts.
// Complies with docs/spec/DATA-CATALOG.md, PRESENTATION.md section 5.1, and DESIGN.md.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  generateDataPassport,
  getPassportSummary,
  type PassportCategory,
} from '../../data/passport';
import { DataChip } from './DataChip';

export interface DataPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<PassportCategory | 'all', { label: string; icon: string }> = {
  all: { label: 'All Sources', icon: '🌐' },
  solar: { label: 'Solar & Weather', icon: '☀️' },
  biology: { label: 'Space Biology (OSDR)', icon: '🌱' },
  avatars: { label: 'Astronaut Media', icon: '👨‍🚀' },
  delay: { label: 'Telecom & Physics', icon: '📡' },
  facts: { label: 'Science Facts', icon: '🔬' },
  geology: { label: 'Planetary Sites', icon: '🪐' },
};

export const DataPassportModal: React.FC<DataPassportModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<PassportCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const entries = useMemo(() => generateDataPassport(), []);
  const summary = useMemo(() => getPassportSummary(), []);

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

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesCategory =
        selectedCategory === 'all' || entry.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        entry.source.toLowerCase().includes(q) ||
        entry.gameUsage.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [entries, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="data-passport-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="passport-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 13, 0.90)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1400,
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        data-testid="data-passport-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(900px, 100%)',
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
        {/* Modal Header */}
        <header
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-panel, rgba(148, 163, 184, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            background: 'rgba(15, 23, 42, 0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }} aria-hidden="true">
              📖
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2
                  id="passport-modal-title"
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-title, 24px)',
                    fontWeight: 800,
                    color: 'var(--air, #4fd8ff)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  NASA Data Passport
                </h2>
                <DataChip origin="REAL" label="100% VERIFIED" size="sm" />
              </div>
              <div
                style={{
                  fontSize: 'var(--text-xs, 12px)',
                  color: 'var(--ink-dim, #94a3b8)',
                  marginTop: '2px',
                }}
              >
                Space Apps 2026 • Real Scientific Provenance & In-Game Calibration
              </div>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-close-passport"
            onClick={onClose}
            aria-label="Close NASA Data Passport (Esc)"
            style={{
              minWidth: 'var(--touch-target-min, 48px)',
              minHeight: 'var(--touch-target-min, 48px)',
              background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
              border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.2))',
              borderRadius: 'var(--radius-md, 12px)',
              color: 'var(--ink, #f1f5f9)',
              fontSize: '18px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </header>

        {/* Global Summary Bar */}
        <section
          aria-label="Dataset Statistics Summary"
          style={{
            padding: '12px 24px',
            background: 'rgba(79, 216, 255, 0.05)',
            borderBottom: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.14))',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: 'var(--text-xs, 12px)',
          }}
        >
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--ink-muted, #64748b)' }}>Sources: </span>
              <strong style={{ color: 'var(--ink, #f1f5f9)' }}>{summary.totalDatasets} datasets</strong>
            </div>
            <div>
              <span style={{ color: 'var(--ink-muted, #64748b)' }}>NASA Records: </span>
              <strong style={{ color: 'var(--air, #4fd8ff)' }}>{summary.totalRecords} telemetry entries</strong>
            </div>
            <div>
              <span style={{ color: 'var(--ink-muted, #64748b)' }}>Latest Ingestion: </span>
              <strong style={{ color: 'var(--warning, #ffd24a)' }}>
                {summary.latestFetchedAt.substring(0, 10)}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--ink-muted, #64748b)' }}>Filter:</span>
            <input
              type="text"
              data-testid="passport-search-input"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px',
                background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
                border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.2))',
                borderRadius: 'var(--radius-pill, 9999px)',
                color: 'var(--ink, #f1f5f9)',
                fontSize: '12px',
                outline: 'none',
                width: '160px',
              }}
            />
          </div>
        </section>

        {/* Category Selector Tabs */}
        <nav
          aria-label="Passport Categories"
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 24px',
            borderBottom: '1px solid var(--border-panel, rgba(148, 163, 184, 0.14))',
            overflowX: 'auto',
            background: 'rgba(12, 20, 39, 0.6)',
          }}
        >
          {(Object.keys(CATEGORY_LABELS) as Array<PassportCategory | 'all'>).map((catKey) => {
            const cat = CATEGORY_LABELS[catKey];
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                data-testid={`passport-tab-${catKey}`}
                onClick={() => setSelectedCategory(catKey)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  background: isSelected
                    ? 'var(--chip-real-bg, rgba(79, 216, 255, 0.15))'
                    : 'transparent',
                  border: isSelected
                    ? '1px solid var(--air, #4fd8ff)'
                    : '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.14))',
                  color: isSelected ? 'var(--air, #4fd8ff)' : 'var(--ink-dim, #94a3b8)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dataset Entries List */}
        <div
          data-testid="passport-entries-list"
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            flex: 1,
          }}
        >
          {filteredEntries.map((entry) => (
            <article
              key={entry.id}
              data-testid={`passport-entry-${entry.id}`}
              style={{
                background: 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))',
                border: '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.2))',
                borderRadius: 'var(--radius-lg, 16px)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 800,
                        color: 'var(--ink, #f1f5f9)',
                      }}
                    >
                      {entry.title}
                    </h3>
                    <DataChip origin="REAL" label={entry.isLive ? 'LIVE' : 'BUNDLED'} size="xs" />
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--ink-muted, #64748b)',
                      marginTop: '3px',
                    }}
                  >
                    Agency: <strong>{entry.source}</strong> • Credits: {entry.credit}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  <span
                    style={{
                      background: 'rgba(79, 216, 255, 0.1)',
                      color: 'var(--air, #4fd8ff)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: '1px solid rgba(79, 216, 255, 0.25)',
                    }}
                  >
                    {entry.recordCount} items
                  </span>
                  <span style={{ color: 'var(--ink-muted, #64748b)' }}>
                    {entry.fetchedAt.substring(0, 10)}
                  </span>
                </div>
              </div>

              {/* Game Usage Section */}
              <div
                style={{
                  background: 'rgba(5, 7, 13, 0.45)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md, 12px)',
                  borderLeft: '3px solid var(--power, #ffd24a)',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  color: 'var(--ink-dim, #94a3b8)',
                }}
              >
                <strong style={{ color: 'var(--power, #ffd24a)' }}>🎮 In-Game Role: </strong>
                {entry.gameUsage}
              </div>

              {/* Link and Notes */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  fontSize: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {entry.note && (
                  <span style={{ color: 'var(--ink-muted, #64748b)', fontStyle: 'italic' }}>
                    Note: {entry.note}
                  </span>
                )}
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--air, #4fd8ff)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 700,
                    marginLeft: 'auto',
                  }}
                >
                  <span>Official NASA Endpoint ↗</span>
                </a>
              </div>
            </article>
          ))}

          {filteredEntries.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--ink-muted, #64748b)',
                fontSize: '14px',
              }}
            >
              No datasets matching the current filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataPassportModal;
