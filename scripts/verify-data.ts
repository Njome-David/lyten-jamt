/* Verifie l'integrite des snapshots NASA. `--strict` = mode release (fichiers P0 obligatoires, faits verifies). */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/data/snapshots';
const STRICT = process.argv.includes('--strict');
const REQUIRED_P0 = ['donki-flr-recent.json', 'donki-flr-may2024-a.json', 'donki-flr-may2024-b.json', 'osdr-studies.json', 'images-avatars.json'];

const errors: string[] = [];
const warnings: string[] = [];

const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.json')) : [];
if (files.length === 0) warnings.push('Aucun snapshot present (normal avant T03).');

for (const f of files) {
  try {
    const snap = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const m = snap?.meta;
    if (!m) { errors.push(`${f}: meta manquant`); continue; }
    for (const k of ['source', 'url', 'fetchedAt'] as const) if (!m[k]) errors.push(`${f}: meta.${k} manquant`);
    if (typeof m.isLive !== 'boolean') errors.push(`${f}: meta.isLive doit etre un booleen`);
    if (!('data' in snap)) errors.push(`${f}: data manquant`);
    if (f.startsWith('donki-flr') && (!Array.isArray(snap.data) || snap.data.length === 0)) errors.push(`${f}: snapshot DONKI vide`);
    if (f.startsWith('images-') && Array.isArray(snap.data)) {
      for (const it of snap.data) if (!it.credit || !it.nasa_id) errors.push(`${f}: image sans credit ou nasa_id`);
    }
  } catch (e) {
    errors.push(`${f}: JSON invalide (${(e as Error).message})`);
  }
}

if (STRICT) {
  for (const r of REQUIRED_P0) if (!files.includes(r)) errors.push(`strict: ${r} manquant`);
  // Les faits utilises dans l'UI doivent etre verifies (data/facts.ts, cree en T03/T09).
  const factsPath = 'src/data/facts.ts';
  if (existsSync(factsPath)) {
    const txt = readFileSync(factsPath, 'utf8');
    if (/status:\s*['"]needs-review['"]/.test(txt)) errors.push('strict: facts.ts contient des faits needs-review');
  } else warnings.push('strict: src/data/facts.ts absent');
}

for (const w of warnings) console.warn(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
if (errors.length) { console.error(`\n${errors.length} erreur(s) de donnees.`); process.exit(1); }
console.log(`data OK (${files.length} snapshot(s)${STRICT ? ', strict' : ''})`);
