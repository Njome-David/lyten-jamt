/* Module de meteo spatiale basee sur les vraies donnees NASA DONKI FLR.
   Determine le niveau d'activite solaire ('calm' | 'active' | 'stormy')
   et les modificateurs de dose de radiation associes. */
import type { DonkiFlare, Snapshot, SolarLevel } from './types';
import type { Flare, SolarContext } from '../engine/types';
import recentFlaresSnapshot from './snapshots/donki-flr-recent.json';
import may2024FlaresSnapshot from './snapshots/donki-flr-may2024-a.json';

export interface SolarStatus {
  level: SolarLevel;
  flareCount: number;
  highestClass?: string;
  stormWarning: boolean;
  baseRadiationMultiplier: number;
  label: string;
}

export function classifyFlare(classType: string): 'X' | 'M' | 'C' | 'B' | 'A' | 'other' {
  const upper = classType.toUpperCase();
  if (upper.startsWith('X')) return 'X';
  if (upper.startsWith('M')) return 'M';
  if (upper.startsWith('C')) return 'C';
  if (upper.startsWith('B')) return 'B';
  if (upper.startsWith('A')) return 'A';
  return 'other';
}

export function getSolarLevelFromFlares(flares: readonly DonkiFlare[]): SolarLevel {
  let hasM = false;
  for (const f of flares) {
    const cls = classifyFlare(f.classType);
    if (cls === 'X') return 'stormy';
    if (cls === 'M') hasM = true;
  }
  return hasM ? 'active' : 'calm';
}

export function getSolarRadiationMultiplier(level: SolarLevel): number {
  switch (level) {
    case 'stormy':
      return 2.5;
    case 'active':
      return 1.5;
    case 'calm':
    default:
      return 1.0;
  }
}

export function getSolarStatus(flares?: readonly DonkiFlare[]): SolarStatus {
  const data = flares ?? ((recentFlaresSnapshot as unknown as Snapshot<DonkiFlare[]>).data);
  const level = getSolarLevelFromFlares(data);

  let highest = '';
  const order = ['other', 'A', 'B', 'C', 'M', 'X'];

  for (const f of data) {
    if (!highest) {
      highest = f.classType;
      continue;
    }
    const c1 = classifyFlare(f.classType);
    const c2 = classifyFlare(highest);
    if (order.indexOf(c1) > order.indexOf(c2)) {
      highest = f.classType;
    }
  }

  const mult = getSolarRadiationMultiplier(level);
  const labels: Record<SolarLevel, string> = {
    calm: 'Soleil calme (flux nominal)',
    active: 'Soleil actif (éruptions moyennes de classe M)',
    stormy: 'Tempête solaire (éruptions majeures de classe X)',
  };

  return {
    level,
    flareCount: data.length,
    highestClass: highest || undefined,
    stormWarning: level === 'stormy',
    baseRadiationMultiplier: mult,
    label: labels[level],
  };
}

// Fonction utilisee notamment pour le mode jury / "Rejouer une vraie tempete" (mai 2024)
export function getMay2024StormData(): { status: SolarStatus; flares: DonkiFlare[] } {
  const flares = (may2024FlaresSnapshot as unknown as Snapshot<DonkiFlare[]>).data;
  return {
    status: getSolarStatus(flares),
    flares,
  };
}

/**
 * Build SolarContext for simulation engine based on real DONKI flare snapshots.
 */
export function getSolarContext(mode: 'recent' | 'may2024' = 'recent'): SolarContext {
  const snapshot = (
    mode === 'may2024' ? may2024FlaresSnapshot : recentFlaresSnapshot
  ) as unknown as Snapshot<DonkiFlare[]>;
  const flares = snapshot.data;
  const status = getSolarStatus(flares);

  const pool: Flare[] = flares.map((f) => ({
    id: f.flrID,
    classType: f.classType,
    peakTime: f.peakTime,
    activeRegionNum: f.activeRegionNum ?? null,
    link: f.link,
  }));

  return {
    level: status.level,
    pool,
    provenance: {
      source: snapshot.meta.source,
      url: snapshot.meta.url,
      fetchedAt: snapshot.meta.fetchedAt,
      isLive: snapshot.meta.isLive,
      credit: snapshot.meta.credit,
      note: snapshot.meta.note,
    },
    mode,
  };
}
