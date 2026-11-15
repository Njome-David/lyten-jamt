import fs from "node:fs/promises";
import path from "node:path";

const SNAPSHOT_DIR = path.resolve("src/data/snapshots");
const AVATAR_DIR = path.resolve("public/avatars");

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

async function fetchWithRetry(url, retries = 2) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 600 * (i + 1)));
      }
    }
  }
  throw lastErr;
}

function trimFlares(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((f) => f && f.flrID && f.classType && f.peakTime)
    .map((f) => ({
      id: String(f.flrID),
      classType: String(f.classType).trim(),
      peakTime: String(f.peakTime),
      activeRegionNum: typeof f.activeRegionNum === "number" ? f.activeRegionNum : null,
      link: typeof f.link === "string" ? f.link : "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
    }));
}

async function main() {
  await fs.mkdir(SNAPSHOT_DIR, { recursive: true });
  await fs.mkdir(AVATAR_DIR, { recursive: true });
  const fetchedAt = new Date().toISOString();

  // 1. Recent DONKI flares (last 28 days, <= 30-day limit)
  const end = new Date();
  const start = new Date(end.getTime() - 28 * 24 * 60 * 60 * 1000);
  const recentUrl = `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=${formatDate(start)}&endDate=${formatDate(end)}`;
  console.log("Fetching recent DONKI:", recentUrl);
  const recentRes = await fetchWithRetry(recentUrl);
  const recentRaw = await recentRes.json();
  const recentFlares = trimFlares(recentRaw);
  await fs.writeFile(
    path.join(SNAPSHOT_DIR, "donki-recent.json"),
    JSON.stringify(
      {
        meta: {
          source: "NASA CCMC DONKI (Solar Flare Catalog)",
          url: recentUrl,
          fetchedAt,
          isLive: false,
          credit: "NASA Community Coordinated Modeling Center (CCMC)",
          note: `28-day window (${formatDate(start)} to ${formatDate(end)})`,
        },
        data: recentFlares.slice(-60),
      },
      null,
      2,
    ),
  );
  console.log(`Saved donki-recent.json (${recentFlares.slice(-60).length} flares)`);

  // 2. Historic May 2024 Solar Storm (split 05-01..05-30 + 05-31 for 30-day rule)
  const mayUrlA =
    "https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=2024-05-01&endDate=2024-05-30";
  const mayUrlB =
    "https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=2024-05-31&endDate=2024-05-31";
  console.log("Fetching May 2024 storm:", mayUrlA);
  const [mayResA, mayResB] = await Promise.all([fetchWithRetry(mayUrlA), fetchWithRetry(mayUrlB)]);
  const mayFlaresAll = [...trimFlares(await mayResA.json()), ...trimFlares(await mayResB.json())];
  // Keep representative M/X/C flares prioritizing famous AR 13664 and major events while staying compact
  const xAndMFlares = mayFlaresAll.filter(
    (f) => f.classType.startsWith("X") || f.classType.startsWith("M"),
  );
  const cFlares = mayFlaresAll.filter((f) => f.classType.startsWith("C")).slice(0, 12);
  const mayTrimmed = [...xAndMFlares.slice(0, 38), ...cFlares];
  await fs.writeFile(
    path.join(SNAPSHOT_DIR, "donki-may2024.json"),
    JSON.stringify(
      {
        meta: {
          source: "NASA CCMC DONKI (May 2024 Geomagnetic Superstorm)",
          url: mayUrlA,
          fetchedAt,
          isLive: false,
          credit: "NASA Community Coordinated Modeling Center (CCMC)",
          note: "May 2024 solar storm archive (2024-05-01 to 2024-05-31, split per 30-day API rule)",
        },
        data: mayTrimmed,
      },
      null,
      2,
    ),
  );
  console.log(`Saved donki-may2024.json (${mayTrimmed.length} flares)`);

  // 3. NASA OSDR Plant Growth Study (OSD-745)
  const osdrSearchUrl = "https://osdr.nasa.gov/osdr/data/search?term=OSD-745&from=0&size=1";
  console.log("Fetching OSDR plant study:", osdrSearchUrl);
  const osdrRes = await fetchWithRetry(osdrSearchUrl);
  const osdrJson = await osdrRes.json();
  const hit = osdrJson?.hits?.hits?.[0]?._source;
  if (!hit) {
    throw new Error("OSDR study OSD-745 not found");
  }
  const osdrStudy = {
    id: String(hit["Accession"] || "OSD-745"),
    title: String(hit["Study Title"]).trim(),
    organism: String(hit["organism"] || "Lactuca sativa").trim(),
    factors: String(hit["Study Factor Name"] || "Spaceflight")
      .split(/\s{2,}/)
      .map((s) => s.trim())
      .filter(Boolean),
    studyUrl: `https://osdr.nasa.gov/bio/repo/data/studies/${String(hit["Accession"] || "OSD-745")}`,
  };
  await fs.writeFile(
    path.join(SNAPSHOT_DIR, "osdr-garden.json"),
    JSON.stringify(
      {
        meta: {
          source: "NASA Open Science Data Repository (OSDR)",
          url: osdrStudy.studyUrl,
          fetchedAt,
          isLive: false,
          credit: "NASA GeneLab / Open Science Data Repository",
        },
        data: osdrStudy,
      },
      null,
      2,
    ),
  );
  console.log(`Saved osdr-garden.json (${osdrStudy.id})`);

  // 4. NASA Image and Video Library Avatars
  const avatarQueries = [
    {
      id: "default",
      badgeId: null,
      label: "Lunar Explorer",
      query: "Apollo 11 Aldrin lunar surface astronaut",
    },
    {
      id: "steady-observer",
      badgeId: "steady-observer",
      label: "EVA Spacewalker",
      query: "astronaut spacewalk ISS EVA",
    },
    {
      id: "flawless-pilot",
      badgeId: "flawless-pilot",
      label: "Orion Crew Explorer",
      query: "Orion Moon Earth Artemis",
    },
    {
      id: "space-veteran",
      badgeId: "space-veteran",
      label: "Mars Rover Specialist",
      query: "Perseverance rover Mars surface",
    },
    {
      id: "ice-cold",
      badgeId: "ice-cold",
      label: "Flight Controller",
      query: "Mission Control Houston",
    },
    {
      id: "complete-constellation",
      badgeId: "complete-constellation",
      label: "Lunar Horizon",
      query: "Earthrise Apollo 8 Moon",
    },
  ];

  const avatars = [];
  for (const item of avatarQueries) {
    const searchUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(item.query)}&media_type=image&page_size=8`;
    const res = await fetchWithRetry(searchUrl);
    const json = await res.json();
    const items = json?.collection?.items || [];
    const chosen = items.find(
      (entry) =>
        entry?.data?.[0]?.nasa_id &&
        entry?.links?.[0]?.href &&
        !String(entry.data[0].title || "")
          .toLowerCase()
          .includes("logo") &&
        !String(entry.data[0].title || "")
          .toLowerCase()
          .includes("insignia"),
    );
    if (!chosen) {
      throw new Error(`No NASA image found for ${item.id}`);
    }
    const d = chosen.data[0];
    const thumbHref = chosen.links[0].href;
    const imgRes = await fetchWithRetry(thumbHref);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const fileName = `avatar-${item.id}.jpg`;
    await fs.writeFile(path.join(AVATAR_DIR, fileName), buf);

    avatars.push({
      id: item.id,
      badgeId: item.badgeId,
      label: item.label,
      nasaId: String(d.nasa_id),
      title: String(d.title || item.label).trim(),
      description: String(d.description || "")
        .slice(0, 220)
        .trim(),
      credit: String(d.photographer || d.secondary_creator || d.center || "NASA").trim(),
      localSrc: `/avatars/${fileName}`,
      sourceUrl: `https://images.nasa.gov/details/${encodeURIComponent(String(d.nasa_id))}`,
    });
    console.log(`Downloaded ${fileName} (${Math.round(buf.length / 1024)} KB) -> ${d.nasa_id}`);
  }

  await fs.writeFile(
    path.join(SNAPSHOT_DIR, "avatars.json"),
    JSON.stringify(
      {
        meta: {
          source: "NASA Image and Video Library",
          url: "https://images.nasa.gov/",
          fetchedAt,
          isLive: false,
          credit: "NASA Image and Video Library",
        },
        data: avatars,
      },
      null,
      2,
    ),
  );
  console.log("All NASA snapshots fetched and saved.");
}

main().catch((err) => {
  console.error("NASA fetch failed:", err);
  process.exit(1);
});
