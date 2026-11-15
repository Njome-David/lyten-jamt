/* Sonde les endpoints NASA et documente statut reel + extrait dans docs/DATA-CATALOG.generated.md.
   Usage: NASA_API_KEY=xxx npm run data:probe (la cle est optionnelle; DEMO_KEY par defaut)
   Les URLs ci-dessous sont des POINTS DE DEPART a verifier: corrigez-les ici quand vous trouvez la bonne. */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const KEY = process.env.NASA_API_KEY ?? 'DEMO_KEY';
const end = new Date().toISOString().slice(0, 10);
const start = new Date(Date.now() - 20 * 864e5).toISOString().slice(0, 10);

const ENDPOINTS: { id: string; url: string; notes?: string }[] = [
  { id: 'donki-flr (CCMC)', url: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=${start}&endDate=${end}`, notes: 'Endpoint CCMC actif, pas de cle requise, fenetre max 30 jours' },
  { id: 'donki-cme (CCMC)', url: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/CME?startDate=${start}&endDate=${end}`, notes: 'Endpoint CCMC actif' },
  { id: 'donki-sep (CCMC)', url: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/SEP?startDate=${start}&endDate=${end}`, notes: 'Endpoint CCMC actif' },
  { id: 'donki-gst (CCMC)', url: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/GST?startDate=${start}&endDate=${end}`, notes: 'Endpoint CCMC actif' },
  { id: 'donki-flr (legacy api.nasa.gov)', url: `https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${KEY}`, notes: 'Ancienne URL api.nasa.gov (404 obselete)' },
  { id: 'osdr', url: 'https://osdr.nasa.gov/geode-py/ws/api/', notes: 'Endpoint OSDR a ajuster ou utiliser repo geode direct' },
  { id: 'insight-weather', url: `https://api.nasa.gov/insight_weather/?api_key=${KEY}&feedtype=json&ver=1.0`, notes: 'Archive InSight fowards sols 675-681' },
  { id: 'image-library', url: 'https://images-api.nasa.gov/search?q=perseverance%20mars&media_type=image', notes: 'NASA Image & Video Library active' },
  { id: 'apod (legacy)', url: `https://api.nasa.gov/planetary/apod?api_key=${KEY}`, notes: 'Ancien endpoint APOD' },
  { id: 'apod (science.nasa.gov)', url: 'https://science.nasa.gov/wp-json/wp/v2/apod-basic', notes: 'Nouvel endpoint APOD science.nasa.gov' },
  { id: 'epic', url: 'https://epic.gsfc.nasa.gov/api/natural', notes: 'EPIC DSCOVR actif' },
  { id: 'sdo-latest-image', url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0193.jpg', notes: 'SDO image solaire active (image/jpeg)' },
];

interface ProbeResult {
  id: string;
  url: string;
  status: number | string;
  durationMs: number;
  snippet: string;
  location?: string;
  notes?: string;
}

async function probe(e: { id: string; url: string; notes?: string }): Promise<ProbeResult> {
  const t0 = Date.now();
  try {
    const res = await fetch(e.url, { signal: AbortSignal.timeout(15000), redirect: 'manual' });
    const ct = res.headers.get('content-type') ?? '';
    const body = ct.includes('json') || ct.includes('text') ? (await res.text()).slice(0, 120).replace(/\s+/g, ' ') : `[${ct}]`;
    const loc = res.headers.get('location') ?? undefined;
    const durationMs = Date.now() - t0;
    console.log(`${res.status} ${String(durationMs).padStart(5)}ms  ${e.id}  ${loc ? '-> ' + loc : ''}\n      ${body}`);
    return {
      id: e.id,
      url: e.url.replace(/api_key=[^&]+/, 'api_key=REDACTED'),
      status: res.status,
      durationMs,
      snippet: body,
      location: loc,
      notes: e.notes,
    };
  } catch (err) {
    const durationMs = Date.now() - t0;
    const msg = (err as Error).message;
    console.log(`ERR  ${e.id}  ${msg}`);
    return {
      id: e.id,
      url: e.url.replace(/api_key=[^&]+/, 'api_key=REDACTED'),
      status: 'ERR',
      durationMs,
      snippet: msg,
      notes: e.notes,
    };
  }
}

(async () => {
  const isKeyDemo = KEY === 'DEMO_KEY';
  console.log(`Sonde NASA (cle: ${isKeyDemo ? 'DEMO_KEY (limitee)' : 'perso'})\n`);
  const results: ProbeResult[] = [];
  for (const e of ENDPOINTS) {
    results.push(await probe(e));
  }

  const generatedDate = new Date().toISOString();
  let markdown = `# DATA-CATALOG.generated.md - Statut reel des endpoints NASA

> Genere automatiquement par \`npm run data:probe\` le ${generatedDate}.
> Cle utilisee: ${isKeyDemo ? 'DEMO_KEY' : 'Cle privee fournie'}.

## 1. Resume des statuts

| ID | Statut HTTP | Latence | Notes |
|---|---|---|---|
`;

  for (const r of results) {
    const statusLabel = r.status === 200 ? `🟢 ${r.status}` : r.status === 404 ? `🔴 ${r.status}` : `🟡 ${r.status}`;
    markdown += `| \`${r.id}\` | ${statusLabel} | ${r.durationMs} ms | ${r.notes ?? ''} |\n`;
  }

  markdown += `\n## 2. Details et extraits de reponse\n\n`;

  for (const r of results) {
    markdown += `### \`${r.id}\`\n\n`;
    markdown += `- **URL**: \`${r.url}\`\n`;
    markdown += `- **Statut**: \`${r.status}\` (${r.durationMs} ms)\n`;
    if (r.location) {
      markdown += `- **Redirection**: \`${r.location}\`\n`;
    }
    markdown += `- **Extrait**: \`${r.snippet.replace(/`/g, "'")}\`\n`;
    if (r.notes) {
      markdown += `- **Note**: ${r.notes}\n`;
    }
    markdown += `\n`;
  }

  const outputPath = resolve('docs/DATA-CATALOG.generated.md');
  writeFileSync(outputPath, markdown, 'utf8');
  console.log(`\nResultats sauvegardes dans docs/DATA-CATALOG.generated.md (${results.length} endpoints sondes).`);
})();
