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

describe('design/ is a read-only reference, never imported', () => {
  const files = [...walk('src'), ...walk('scripts')].filter((f) => /\.(ts|tsx|mjs|js)$/.test(f));
  it.each(files.length ? files : ['(none)'])('%s does not import design/ or figma-make', (f) => {
    if (f === '(none)') return;
    const src = readFileSync(f, 'utf8');
    expect(src).not.toMatch(/from\s+['"][^'"]*(\/|^)design\//);
    expect(src).not.toMatch(/from\s+['"][^'"]*figma-make/);
  });
});
