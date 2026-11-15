/* src/data/passport.ts
   NASA Data Passport (Passeport donnees) generator.
   Dynamically aggregates real NASA snapshot metadata (meta block) and verified scientific facts.
   Adheres to docs/spec/DATA-CATALOG.md and AGENTS.md. */

import { SCIENTIFIC_FACTS } from './facts';

import recentFlaresSnapshot from './snapshots/donki-flr-recent.json';
import may2024FlaresSnapshotA from './snapshots/donki-flr-may2024-a.json';
import may2024FlaresSnapshotB from './snapshots/donki-flr-may2024-b.json';
import cmeSnapshot from './snapshots/donki-cme-recent.json';
import sepSnapshot from './snapshots/donki-sep-recent.json';
import osdrSnapshot from './snapshots/osdr-studies.json';
import avatarsSnapshot from './snapshots/images-avatars.json';

export type PassportCategory = 'solar' | 'biology' | 'avatars' | 'facts' | 'geology' | 'delay';

export interface PassportEntry {
  id: string;
  title: string;
  source: string;
  url: string;
  fetchedAt: string;
  isLive: boolean;
  credit: string;
  note?: string;
  recordCount: number;
  gameUsage: string;
  category: PassportCategory;
  tag: 'REAL';
}

export interface PassportSummary {
  totalDatasets: number;
  totalRecords: number;
  latestFetchedAt: string;
  categories: Record<PassportCategory, number>;
}

/**
 * Generates the full NASA Data Passport entries dynamically from bundled snapshots and facts.
 */
export function generateDataPassport(): PassportEntry[] {
  const entries: PassportEntry[] = [
    {
      id: 'donki-flr-recent',
      title: 'DONKI Solar Flare Telemetry (Recent)',
      source: recentFlaresSnapshot.meta.source,
      url: recentFlaresSnapshot.meta.url,
      fetchedAt: recentFlaresSnapshot.meta.fetchedAt,
      isLive: recentFlaresSnapshot.meta.isLive,
      credit: recentFlaresSnapshot.meta.credit || 'NASA / GSFC DONKI / CCMC',
      note: recentFlaresSnapshot.meta.note,
      recordCount: recentFlaresSnapshot.data.length,
      gameUsage:
        'Calculates real-time daily solar space weather (calm / active / stormy), base radiation levels, and triggers in-game flare alerts with real active region numbers and peak times.',
      category: 'solar',
      tag: 'REAL',
    },
    {
      id: 'donki-flr-may2024',
      title: 'DONKI Historical Solar Superstorm (May 2024)',
      source: may2024FlaresSnapshotA.meta.source,
      url: may2024FlaresSnapshotA.meta.url,
      fetchedAt: may2024FlaresSnapshotA.meta.fetchedAt,
      isLive: may2024FlaresSnapshotA.meta.isLive,
      credit: may2024FlaresSnapshotA.meta.credit || 'NASA / GSFC DONKI / CCMC',
      note: 'Extreme X-class flares from AR 13664 during the historic May 2024 G5 solar storm.',
      recordCount: may2024FlaresSnapshotA.data.length + may2024FlaresSnapshotB.data.length,
      gameUsage:
        'Replayable scenario in Judge Mode to experience extreme historical radiation events with authentic satellite telemetry.',
      category: 'solar',
      tag: 'REAL',
    },
    {
      id: 'donki-cme-recent',
      title: 'DONKI Coronal Mass Ejections (CME)',
      source: cmeSnapshot.meta.source,
      url: cmeSnapshot.meta.url,
      fetchedAt: cmeSnapshot.meta.fetchedAt,
      isLive: cmeSnapshot.meta.isLive,
      credit: cmeSnapshot.meta.credit || 'NASA / CCMC',
      note: cmeSnapshot.meta.note,
      recordCount: cmeSnapshot.data.length,
      gameUsage:
        'Plasma propagation warning system: informs astronauts one turn ahead when a fast CME is en route towards the Moon or Mars.',
      category: 'solar',
      tag: 'REAL',
    },
    {
      id: 'donki-sep-recent',
      title: 'DONKI Solar Energetic Particles (SEP)',
      source: sepSnapshot.meta.source,
      url: sepSnapshot.meta.url,
      fetchedAt: sepSnapshot.meta.fetchedAt,
      isLive: sepSnapshot.meta.isLive,
      credit: sepSnapshot.meta.credit || 'NASA / CCMC',
      note: sepSnapshot.meta.note,
      recordCount: sepSnapshot.data.length,
      gameUsage:
        'High-energy proton radiation dosage spikes triggering mandatory shelter and EVA suspension protocols.',
      category: 'solar',
      tag: 'REAL',
    },
    {
      id: 'osdr-studies',
      title: 'NASA Open Science Data Repository (OSDR)',
      source: osdrSnapshot.meta.source,
      url: osdrSnapshot.meta.url,
      fetchedAt: osdrSnapshot.meta.fetchedAt,
      isLive: osdrSnapshot.meta.isLive,
      credit: osdrSnapshot.meta.credit || 'NASA / OSDR / GeneLab',
      note: osdrSnapshot.meta.note,
      recordCount: osdrSnapshot.data.length,
      gameUsage:
        'Real space biology datasets (Arabidopsis thaliana in fractional gravity, radioresistance) grounding hydroponic greenhouse missions and crew radiation recovery.',
      category: 'biology',
      tag: 'REAL',
    },
    {
      id: 'images-avatars',
      title: 'NASA Image and Video Library Astronaut Avatars',
      source: avatarsSnapshot.meta.source,
      url: avatarsSnapshot.meta.url,
      fetchedAt: avatarsSnapshot.meta.fetchedAt,
      isLive: avatarsSnapshot.meta.isLive,
      credit: avatarsSnapshot.meta.credit || 'NASA / Johnson Space Center (JSC)',
      note: avatarsSnapshot.meta.note,
      recordCount: avatarsSnapshot.data.length,
      gameUsage:
        'Authentic astronaut flight suit and EVA EMU portrait unlockables tied to career progression and badges.',
      category: 'avatars',
      tag: 'REAL',
    },
    {
      id: 'facts-scientific',
      title: 'NASA Scientific Constants & Space Physics Facts',
      source: 'NASA Planetary Science & Deep Space Network',
      url: 'https://www.nasa.gov/',
      fetchedAt: '2026-11-15T12:00:00Z',
      isLive: false,
      credit: 'NASA GSFC, JPL DSN, Human Research Program',
      note: 'Peer-reviewed physical constants: Moon radio delay (1.28 s), Mars transmission delays (3-22 min), cosmic rays and fractional gravity.',
      recordCount: SCIENTIFIC_FACTS.length,
      gameUsage:
        'Calibrates telecommunication delays, "Ask Mission Control" dialog intervals, and pedagogical science popups.',
      category: 'delay',
      tag: 'REAL',
    },
  ];

  return entries;
}

/**
 * Returns overall statistics of bundled NASA data sources.
 */
export function getPassportSummary(): PassportSummary {
  const entries = generateDataPassport();

  const categories: Record<PassportCategory, number> = {
    solar: 0,
    biology: 0,
    avatars: 0,
    facts: 0,
    geology: 0,
    delay: 0,
  };

  let totalRecords = 0;
  let latestFetchedAt = '';

  for (const entry of entries) {
    totalRecords += entry.recordCount;
    categories[entry.category] = (categories[entry.category] || 0) + 1;
    if (!latestFetchedAt || entry.fetchedAt > latestFetchedAt) {
      latestFetchedAt = entry.fetchedAt;
    }
  }

  return {
    totalDatasets: entries.length,
    totalRecords,
    latestFetchedAt,
    categories,
  };
}
