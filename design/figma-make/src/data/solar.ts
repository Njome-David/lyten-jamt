import donkiMay2024Raw from "./snapshots/donki-may2024.json";
import donkiRecentRaw from "./snapshots/donki-recent.json";
import type { Flare, Snapshot, SolarContext, SolarLevel } from "../engine/types";

const recentSnapshot = donkiRecentRaw as Snapshot<Flare[]>;
const may2024Snapshot = donkiMay2024Raw as Snapshot<Flare[]>;

function deriveRecentLevel(flares: Flare[], referenceIso: string): SolarLevel {
  if (flares.length === 0) return "calm";
  const refMs = Date.parse(referenceIso);
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const recentWindow = flares.filter((f) => {
    const t = Date.parse(f.peakTime);
    if (Number.isNaN(t) || Number.isNaN(refMs)) return true;
    return refMs - t <= sevenDaysMs + 24 * 60 * 60 * 1000;
  });

  const checkPool = recentWindow.length > 0 ? recentWindow : flares.slice(-5);
  if (checkPool.some((f) => f.classType.toUpperCase().startsWith("X"))) {
    return "stormy";
  }
  if (checkPool.some((f) => f.classType.toUpperCase().startsWith("M"))) {
    return "active";
  }
  return "calm";
}

export function getBundledSolarContext(mode: "recent" | "may2024" = "recent"): SolarContext {
  if (mode === "may2024") {
    return {
      level: "stormy",
      pool: may2024Snapshot.data,
      provenance: may2024Snapshot.meta,
      mode: "may2024",
    };
  }

  if (!recentSnapshot.data || recentSnapshot.data.length === 0) {
    return {
      level: "calm",
      pool: may2024Snapshot.data,
      provenance: {
        ...may2024Snapshot.meta,
        note: "Archived May 2024 fallback pool",
      },
      mode: "recent",
    };
  }

  return {
    level: deriveRecentLevel(recentSnapshot.data, recentSnapshot.meta.fetchedAt),
    pool: recentSnapshot.data,
    provenance: recentSnapshot.meta,
    mode: "recent",
  };
}

export function getMay2024XFlares(): { flares: Flare[]; provenance: SolarContext["provenance"] } {
  return {
    flares: may2024Snapshot.data.filter((f) => f.classType.toUpperCase().startsWith("X")),
    provenance: may2024Snapshot.meta,
  };
}

export async function tryLiveDonki(): Promise<SolarContext | null> {
  try {
    const end = new Date();
    const start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const url = `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=${fmt(start)}&endDate=${fmt(end)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const raw = await res.json();
    if (!Array.isArray(raw) || raw.length === 0) return null;
    const flares: Flare[] = raw
      .filter((f) => f && f.flrID && f.classType && f.peakTime)
      .map((f) => ({
        id: String(f.flrID),
        classType: String(f.classType).trim(),
        peakTime: String(f.peakTime),
        activeRegionNum: typeof f.activeRegionNum === "number" ? f.activeRegionNum : null,
        link: typeof f.link === "string" ? f.link : "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
      }));
    if (flares.length === 0) return null;
    const fetchedAt = new Date().toISOString();
    return {
      level: deriveRecentLevel(flares, fetchedAt),
      pool: flares,
      mode: "recent",
      provenance: {
        source: "NASA CCMC DONKI (Live Solar Feed)",
        url,
        fetchedAt,
        isLive: true,
        credit: "NASA Community Coordinated Modeling Center (CCMC)",
        note: "Live 14-day solar flare query",
      },
    };
  } catch {
    return null;
  }
}
