/* Verifie l'integrite des snapshots NASA. `--strict` = mode release (fichiers P0 obligatoires, faits verifies). */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const DEFAULT_DIR = 'src/data/snapshots';
export const REQUIRED_P0 = [
  'donki-flr-recent.json',
  'donki-flr-may2024-a.json',
  'donki-flr-may2024-b.json',
  'osdr-studies.json',
  'images-avatars.json',
];

export interface VerifyResult {
  errors: string[];
  warnings: string[];
  snapshotCount: number;
}

export function verifyData(options?: { dir?: string; strict?: boolean }): VerifyResult {
  const dir = options?.dir ?? DEFAULT_DIR;
  const strict = options?.strict ?? false;

  const errors: string[] = [];
  const warnings: string[] = [];

  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
  if (files.length === 0) {
    warnings.push('Aucun snapshot present (normal avant T03).');
  }

  for (const f of files) {
    try {
      const snap = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      const m = snap?.meta;
      if (!m) {
        errors.push(`${f}: meta manquant`);
        continue;
      }
      for (const k of ['source', 'url', 'fetchedAt'] as const) {
        if (!m[k]) errors.push(`${f}: meta.${k} manquant`);
      }
      if (typeof m.isLive !== 'boolean') {
        errors.push(`${f}: meta.isLive doit etre un booleen`);
      }
      if (!('data' in snap)) {
        errors.push(`${f}: data manquant`);
      } else if (snap.data === null || snap.data === undefined) {
        errors.push(`${f}: data null ou indefini`);
      } else if (Array.isArray(snap.data)) {
        if (snap.data.length === 0) {
          errors.push(`${f}: snapshot vide`);
        }
      } else if (typeof snap.data === 'object' && Object.keys(snap.data).length === 0) {
        errors.push(`${f}: snapshot vide`);
      }

      if (f.startsWith('donki-flr')) {
        if (!Array.isArray(snap.data) || snap.data.length === 0) {
          errors.push(`${f}: snapshot DONKI vide`);
        } else {
          for (let i = 0; i < snap.data.length; i++) {
            const flare = snap.data[i];
            if (!flare.flrID) errors.push(`${f}[${i}]: flrID manquant`);
            if (!flare.beginTime) errors.push(`${f}[${i}]: beginTime manquant`);
            if (!flare.peakTime) errors.push(`${f}[${i}]: peakTime manquant`);
            if (!flare.classType) errors.push(`${f}[${i}]: classType manquant`);
          }
        }
      }

      if (f.startsWith('images-') && Array.isArray(snap.data)) {
        for (const it of snap.data) {
          if (!it.credit || !it.nasa_id) errors.push(`${f}: image sans credit ou nasa_id`);
        }
      }
    } catch (e) {
      errors.push(`${f}: JSON invalide (${(e as Error).message})`);
    }
  }

  if (strict) {
    for (const r of REQUIRED_P0) {
      if (!files.includes(r)) {
        errors.push(`strict: ${r} manquant`);
      }
    }
    // Les faits utilises dans l'UI doivent etre verifies (data/facts.ts, cree en T03/T09).
    const factsPath = 'src/data/facts.ts';
    if (existsSync(factsPath)) {
      const txt = readFileSync(factsPath, 'utf8');
      if (/status:\s*['"]needs-review['"]/.test(txt)) {
        errors.push('strict: facts.ts contient des faits needs-review');
      }
    } else {
      warnings.push('strict: src/data/facts.ts absent');
    }
  }

  return { errors, warnings, snapshotCount: files.length };
}

// Execution en CLI
if (process.argv[1]?.endsWith('verify-data.ts')) {
  const STRICT = process.argv.includes('--strict');
  const result = verifyData({ strict: STRICT });

  for (const w of result.warnings) console.warn(`WARN  ${w}`);
  for (const e of result.errors) console.error(`ERROR ${e}`);

  if (result.errors.length) {
    console.error(`\n${result.errors.length} erreur(s) de donnees.`);
    process.exit(1);
  }
  console.log(`data OK (${result.snapshotCount} snapshot(s)${STRICT ? ', strict' : ''})`);
}
