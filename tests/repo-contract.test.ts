import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe('repo contract (T01)', () => {
  const required = ['AGENTS.md', 'SKILLS.md', 'SPEC.md', 'CONTEXT.template.md', 'docs/TECHNICAL.md', 'docs/spec/PRESENTATION.md', 'docs/spec/DATA-CATALOG.md', 'docs/spec/DESIGN.md', 'design/README.md', 'TASKS.md', 'scripts/next-task.sh', '.github/pull_request_template.md', '.githooks/commit-msg'];
  it.each(required)('%s exists', (f) => expect(existsSync(f)).toBe(true));
  it('CONTEXT.md is git-ignored (local only)', () => {
    expect(readFileSync('.gitignore', 'utf8')).toMatch(/^CONTEXT\.md$/m);
  });
  it('pointer files exist for every agent', () => {
    for (const f of ['CLAUDE.md', 'GEMINI.md', '.github/copilot-instructions.md', '.cursor/rules/agents.mdc']) expect(existsSync(f)).toBe(true);
  });
});
