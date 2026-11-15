/* Contrat de donnees NASA, snapshots et modeles scientifiques (docs/spec/DATA-CATALOG.md) */

export interface Provenance {
  source: string;
  url: string;
  fetchedAt: string;
  isLive: boolean;
  credit?: string;
  note?: string;
}

export interface Snapshot<T> {
  meta: Provenance;
  data: T;
}

export interface DonkiFlare {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime?: string;
  classType: string;
  sourceLocation?: string;
  activeRegionNum?: number | null;
  link?: string;
}

export interface OsdrStudy {
  id: string;
  gldsId?: string;
  title: string;
  organism: string;
  mission: string;
  factors: string[];
  description: string;
  url: string;
  keyFinding: string;
}

export interface AvatarItem {
  id: string;
  name: string;
  nasa_id: string;
  title: string;
  credit: string;
  description: string;
  file: string;
}

export type SolarLevel = 'calm' | 'active' | 'stormy';

export type FactStatus = 'needs-review' | 'verified';

export interface ScientificFact {
  id: string;
  category: 'delay' | 'radiation' | 'solar' | 'biology' | 'geology';
  title: string;
  fact: string;
  sourceUrl: string;
  sourceCredit: string;
  status: FactStatus;
}
