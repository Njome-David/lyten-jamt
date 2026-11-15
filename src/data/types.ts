/* Contrat de donnees NASA et snapshots (voir docs/spec/DATA-CATALOG.md section 4) */

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
