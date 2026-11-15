/* Script de recuperation des donnees NASA (voir docs/spec/DATA-CATALOG.md et SKILLS.md S09).
   Recupere DONKI FLR (recent + mai 2024 en 2 fenetres) avec provenance et 2 reessais.
   Usage: npm run data:fetch */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DonkiFlare, Snapshot } from '../src/data/types';

const SNAPSHOTS_DIR = resolve('src/data/snapshots');
if (!existsSync(SNAPSHOTS_DIR)) {
  mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

interface FetchTarget {
  filename: string;
  url: string;
  note: string;
}

const end = new Date().toISOString().slice(0, 10);
const start = new Date(Date.now() - 20 * 864e5).toISOString().slice(0, 10);

const TARGETS: FetchTarget[] = [
  {
    filename: 'donki-flr-recent.json',
    url: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=${start}&endDate=${end}`,
    note: `Flares solaires des 20 derniers jours (${start} au ${end})`,
  },
  {
    filename: 'donki-flr-may2024-a.json',
    url: 'https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=2024-05-01&endDate=2024-05-15',
    note: 'Tempete solaire historique de mai 2024 (fenetre 1: 01 au 15 mai 2024, pic du 10-12 mai)',
  },
  {
    filename: 'donki-flr-may2024-b.json',
    url: 'https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=2024-05-16&endDate=2024-05-31',
    note: 'Tempete solaire historique de mai 2024 (fenetre 2: 16 au 31 mai 2024)',
  },
];

async function fetchWithRetry(url: string, retries = 2): Promise<unknown> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`  Tentative ${attempt + 1}/${retries + 1} apres attente...`);
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      lastError = err as Error;
      console.warn(`  Avertissement (tentative ${attempt + 1}): ${lastError.message}`);
    }
  }
  throw lastError ?? new Error(`Echec de fetch sur ${url}`);
}

function cleanDonkiFlares(raw: unknown[]): DonkiFlare[] {
  return raw.map((item) => {
    const it = item as Record<string, unknown>;
    return {
      flrID: String(it.flrID ?? ''),
      beginTime: String(it.beginTime ?? ''),
      peakTime: String(it.peakTime ?? ''),
      ...(it.endTime ? { endTime: String(it.endTime) } : {}),
      classType: String(it.classType ?? ''),
      ...(it.sourceLocation ? { sourceLocation: String(it.sourceLocation) } : {}),
      activeRegionNum: typeof it.activeRegionNum === 'number' ? it.activeRegionNum : null,
      ...(it.link ? { link: String(it.link) } : {}),
    };
  });
}

async function fetchAndSave(target: FetchTarget): Promise<boolean> {
  const destPath = resolve(SNAPSHOTS_DIR, target.filename);
  console.log(`Fetch: ${target.filename} (${target.url})...`);

  try {
    const rawData = await fetchWithRetry(target.url);
    if (!Array.isArray(rawData)) {
      throw new Error(`Format inattendu: attendu un tableau JSON, recu ${typeof rawData}`);
    }

    if (rawData.length === 0) {
      // Regle S09: Ne remplace jamais un bon snapshot par un vide
      if (existsSync(destPath)) {
        console.warn(`  Reponse vide reçue mais un snapshot existant est conserve (${target.filename}).`);
        return true;
      }
      throw new Error(`Aucune donnee reçue pour ${target.filename} et aucun snapshot existant.`);
    }

    const flares = cleanDonkiFlares(rawData);
    const snapshot: Snapshot<DonkiFlare[]> = {
      meta: {
        source: 'DONKI',
        url: target.url,
        fetchedAt: new Date().toISOString(),
        isLive: false,
        credit: 'NASA / GSFC Space Weather Database of Notifications, Knowledge, Information (DONKI) / CCMC',
        note: target.note,
      },
      data: flares,
    };

    writeFileSync(destPath, JSON.stringify(snapshot, null, 2), 'utf8');
    console.log(`  ✓ ${target.filename} enregistre (${flares.length} flares, taille: ${(Buffer.byteLength(JSON.stringify(snapshot)) / 1024).toFixed(1)} Ko)`);
    return true;
  } catch (err) {
    console.error(`  ✗ Echec pour ${target.filename}: ${(err as Error).message}`);
    // Verifier si un snapshot existe deja
    if (existsSync(destPath)) {
      try {
        const existing = JSON.parse(readFileSync(destPath, 'utf8'));
        if (existing?.data?.length > 0) {
          console.warn(`  Snapshot existant conserve intact pour ${target.filename}.`);
          return true;
        }
      } catch {
        // Ignorer l'erreur de lecture du snapshot existant
      }
    }
    return false;
  }
}

(async () => {
  console.log('--- Recuperation des donnees NASA DONKI FLR ---\n');
  let hasFailure = false;
  for (const target of TARGETS) {
    const ok = await fetchAndSave(target);
    if (!ok) hasFailure = true;
  }

  if (hasFailure) {
    console.error('\nErreur lors de la recuperation de certaines donnees.');
    process.exit(1);
  }
  console.log('\nTous les snapshots DONKI FLR ont ete recuperes et enregistres avec succes.');
})();
