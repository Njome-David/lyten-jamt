import { describe, it, expect } from 'vitest';
import {
  SCIENTIFIC_FACTS,
  getFactById,
  getFactsByCategory,
  getVerifiedFacts,
} from '../../src/data/facts';

describe('scientific facts (T09 / S10)', () => {
  it('contains essential NASA facts', () => {
    expect(SCIENTIFIC_FACTS.length).toBeGreaterThanOrEqual(5);
  });

  it('all facts start with needs-review status (SKILLS S10)', () => {
    for (const f of SCIENTIFIC_FACTS) {
      expect(f.status).toBe('needs-review');
    }
  });

  it('every fact has valid structure and HTTPS NASA source URL', () => {
    for (const f of SCIENTIFIC_FACTS) {
      expect(f.id).toBeTruthy();
      expect(f.title).toBeTruthy();
      expect(f.fact).toBeTruthy();
      expect(f.sourceUrl).toMatch(/^https:\/\/(www\.)?(nasa\.gov|mars\.nasa\.gov|osdr\.nasa\.gov)/);
      expect(f.sourceCredit).toContain('NASA');
    }
  });

  it('includes mandatory Moon and Mars communication latency facts', () => {
    const moon = getFactById('delay-moon');
    expect(moon).toBeDefined();
    expect(moon?.fact).toContain('1,28');

    const mars = getFactById('delay-mars');
    expect(mars).toBeDefined();
    expect(mars?.fact).toContain('3');
    expect(mars?.fact).toContain('22');
  });

  it('getFactsByCategory filters correctly', () => {
    const delayFacts = getFactsByCategory('delay');
    expect(delayFacts.length).toBeGreaterThanOrEqual(2);
    expect(delayFacts.every((f) => f.category === 'delay')).toBe(true);
  });

  it('getVerifiedFacts returns empty list when all facts are needs-review', () => {
    expect(getVerifiedFacts()).toEqual([]);
  });
});
