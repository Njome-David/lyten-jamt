import avatarsRaw from "./snapshots/avatars.json";
import donkiMay2024Raw from "./snapshots/donki-may2024.json";
import donkiRecentRaw from "./snapshots/donki-recent.json";
import osdrGardenRaw from "./snapshots/osdr-garden.json";
import { FACTS } from "./facts";
import type { Flare, Provenance, Snapshot } from "../engine/types";

export interface NasaAvatar {
  id: string;
  badgeId: string | null;
  label: string;
  nasaId: string;
  title: string;
  description: string;
  credit: string;
  localSrc: string;
  sourceUrl: string;
}

export interface OsdrGardenStudy {
  id: string;
  title: string;
  organism: string;
  factors: string[];
  studyUrl: string;
}

export const AVATARS_SNAPSHOT = avatarsRaw as Snapshot<NasaAvatar[]>;
export const DONKI_RECENT_SNAPSHOT = donkiRecentRaw as Snapshot<Flare[]>;
export const DONKI_MAY2024_SNAPSHOT = donkiMay2024Raw as Snapshot<Flare[]>;
export const OSDR_GARDEN_SNAPSHOT = osdrGardenRaw as Snapshot<OsdrGardenStudy>;

export const AVATARS: NasaAvatar[] = AVATARS_SNAPSHOT.data;
export const OSDR_GARDEN_STUDY: OsdrGardenStudy = OSDR_GARDEN_SNAPSHOT.data;

export function getAvatarById(id: string): NasaAvatar {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

export interface ScienceMapRow {
  id: string;
  dataset: string;
  realValueSummary: string;
  gameRuleDriven: string;
  provenance: Provenance;
}

export function buildScienceMap(activeSolarProvenance: Provenance): ScienceMapRow[] {
  return [
    {
      id: "donki-recent",
      dataset: "NASA CCMC DONKI — Recent Solar Flares",
      realValueSummary: `${DONKI_RECENT_SNAPSHOT.data.length} verified solar flares with real Goes X-ray class, peak UTC, and Active Region IDs.`,
      gameRuleDriven:
        "Sets Today’s Sun radiation level (Calm / Active / Stormy) and populates real M/X flare alerts.",
      provenance: activeSolarProvenance,
    },
    {
      id: "donki-may2024",
      dataset: "NASA CCMC DONKI — May 2024 Superstorm Archive",
      realValueSummary: `${DONKI_MAY2024_SNAPSHOT.data.length} historical storm flares (including AR 13664 X-class events).`,
      gameRuleDriven:
        "Powers Judge Mode “Replay May 2024 Storm” and high-energy X-class emergency training.",
      provenance: DONKI_MAY2024_SNAPSHOT.meta,
    },
    {
      id: "osdr-garden",
      dataset: `NASA OSDR Study ${OSDR_GARDEN_STUDY.id} (${OSDR_GARDEN_STUDY.organism})`,
      realValueSummary: OSDR_GARDEN_STUDY.title,
      gameRuleDriven:
        "Grounds Moon Garden & Mars Garden expeditions and hydroponics trade-off lessons.",
      provenance: OSDR_GARDEN_SNAPSHOT.meta,
    },
    {
      id: "nasa-avatars",
      dataset: "NASA Image and Video Library",
      realValueSummary: `${AVATARS.length} archival NASA astronaut, spacecraft, rover, and Mission Control photographs.`,
      gameRuleDriven: "Unlocks cosmetic astronaut profile portraits via achievement badges.",
      provenance: AVATARS_SNAPSHOT.meta,
    },
    {
      id: "nasa-planetary-facts",
      dataset: "NASA SCaN & Planetary Science Reference Constants",
      realValueSummary: `${Object.keys(FACTS).length} cited physical facts (1.28s Moon latency, 3–22m Mars latency, 14-day lunar night, site geology).`,
      gameRuleDriven:
        "Calibrates Mission Control signal delay, lunar night zero-solar turns, and site power modifiers.",
      provenance: {
        source: "NASA Science & SCaN Reference Pages",
        url: "https://science.nasa.gov/",
        fetchedAt: DONKI_RECENT_SNAPSHOT.meta.fetchedAt,
        isLive: false,
        credit: "NASA Science Editorial Team",
      },
    },
  ];
}
