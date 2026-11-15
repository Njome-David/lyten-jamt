import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe('architecture: engine purity', () => {
  const files = walk('src/engine').filter((f) => /\.(ts|tsx)$/.test(f));
  const forbidden = [/Math\.random/, /\bDate\b/, /\bwindow\b/, /\bdocument\b/, /localStorage/, /from ['"]react/, /performance\.now/];
  it.each(files.length ? files : ['(none yet)'])('%s is pure', (f) => {
    if (f === '(none yet)') return;
    const src = readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const re of forbidden) expect(src, `${f} matches ${re}`).not.toMatch(re);
  });
});
