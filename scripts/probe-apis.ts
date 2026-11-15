/* Sonde les endpoints NASA et affiche statut + extrait. Aucune donnee n'est ecrite dans src/.
   Usage: NASA_API_KEY=xxx npm run data:probe   (la cle est optionnelle; DEMO_KEY par defaut)
   Les URLs ci-dessous sont des POINTS DE DEPART a verifier: corrigez-les ici quand vous trouvez la bonne. */
const KEY = process.env.NASA_API_KEY ?? 'DEMO_KEY';
const end = new Date().toISOString().slice(0, 10);
const start = new Date(Date.now() - 20 * 864e5).toISOString().slice(0, 10);

const ENDPOINTS: { id: string; url: string }[] = [
  { id: 'donki-flr (CCMC)', url: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=${start}&endDate=${end}` },
  { id: 'donki-cme (CCMC)', url: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/CME?startDate=${start}&endDate=${end}` },
  { id: 'donki-sep (CCMC)', url: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/SEP?startDate=${start}&endDate=${end}` },
  { id: 'donki-gst (CCMC)', url: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/GST?startDate=${start}&endDate=${end}` },
  { id: 'donki-flr (legacy api.nasa.gov)', url: `https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${KEY}` },
  { id: 'osdr', url: 'https://osdr.nasa.gov/geode-py/ws/api/' },
  { id: 'insight-weather', url: `https://api.nasa.gov/insight_weather/?api_key=${KEY}&feedtype=json&ver=1.0` },
  { id: 'image-library', url: 'https://images-api.nasa.gov/search?q=perseverance%20mars&media_type=image' },
  { id: 'apod (legacy)', url: `https://api.nasa.gov/planetary/apod?api_key=${KEY}` },
  { id: 'apod (science.nasa.gov)', url: 'https://science.nasa.gov/wp-json/wp/v2/apod-basic' },
  { id: 'epic', url: 'https://epic.gsfc.nasa.gov/api/natural' },
  { id: 'sdo-latest-image', url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0193.jpg' },
];

async function probe(e: { id: string; url: string }) {
  const t0 = Date.now();
  try {
    const res = await fetch(e.url, { signal: AbortSignal.timeout(15000), redirect: 'manual' });
    const ct = res.headers.get('content-type') ?? '';
    const body = ct.includes('json') || ct.includes('text') ? (await res.text()).slice(0, 120).replace(/\s+/g, ' ') : `[${ct}]`;
    console.log(`${res.status} ${String(Date.now() - t0).padStart(5)}ms  ${e.id}  ${res.headers.get('location') ? '-> ' + res.headers.get('location') : ''}\n      ${body}`);
  } catch (err) {
    console.log(`ERR  ${e.id}  ${(err as Error).message}`);
  }
}

(async () => {
  console.log(`Sonde NASA (cle: ${KEY === 'DEMO_KEY' ? 'DEMO_KEY (limitee)' : 'perso'})\n`);
  for (const e of ENDPOINTS) await probe(e);
  console.log('\nCopiez les resultats dans docs/DATA-CATALOG.generated.md (statut reel de chaque source).');
})();
