/* Faits scientifiques sources de la NASA (voir SKILLS.md S10).
   Tous les faits commencent avec le statut 'needs-review'.
   Ils ne passent en 'verified' qu'apres relecture humaine (role C) avant la release. */
import type { ScientificFact } from './types';

export const SCIENTIFIC_FACTS: readonly ScientificFact[] = [
  {
    id: 'delay-moon',
    category: 'delay',
    title: 'Earth-Moon Telecommunication Latency',
    fact: 'Radio signals travel at the speed of light (~300,000 km/s). At an average distance of 384,400 km, a one-way trip takes 1.28 seconds (1,28 s), or ~2.56 seconds round-trip.',
    sourceUrl: 'https://www.nasa.gov/general/orbital-telecommunications-delays/',
    sourceCredit: 'NASA / Goddard Space Flight Center / LRO Team',
    status: 'needs-review',
  },
  {
    id: 'delay-mars',
    category: 'delay',
    title: 'Earth-Mars Telecommunication Latency',
    fact: 'The distance between Earth and Mars varies between 54.6 and 401 million kilometers. Radio transmission time ranges between 3 and 22 minutes one-way (6 to 44 minutes round-trip).',
    sourceUrl: 'https://mars.nasa.gov/basics/telemetry-and-delays/',
    sourceCredit: 'NASA Mars Exploration Program / Deep Space Network (DSN)',
    status: 'needs-review',
  },
  {
    id: 'solar-flare-classification',
    category: 'solar',
    title: 'Solar Flare Classification (DONKI)',
    fact: 'Solar flares are classified by their X-ray peak intensity into classes A, B, C, M, and X. Each class is 10 times more energetic than the previous; class X represents the most severe events.',
    sourceUrl: 'https://www.nasa.gov/mission_pages/sunearth/spaceweather/solar-flares/',
    sourceCredit: 'NASA Heliophysics / CCMC DONKI',
    status: 'needs-review',
  },
  {
    id: 'radiation-space',
    category: 'radiation',
    title: 'Deep Space Radiation Environment',
    fact: 'Beyond Earth’s magnetosphere, astronaut crews encounter Galactic Cosmic Rays (GCR) and Solar Energetic Particles (SEP), requiring dedicated storm shelters and emergency shielding.',
    sourceUrl: 'https://www.nasa.gov/hrp/radiation/',
    sourceCredit: 'NASA Human Research Program (HRP)',
    status: 'needs-review',
  },
  {
    id: 'plant-growth-fractional-gravity',
    category: 'biology',
    title: 'Plant Cultivation in Fractional Gravity (OSDR)',
    fact: 'NASA study OSD-251 shows that Arabidopsis thaliana triggers specialized genetic pathways to adapt to the partial gravity of the Moon (0.16g) and Mars (0.38g).',
    sourceUrl: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-251',
    sourceCredit: 'NASA Open Science Data Repository (OSDR) / GeneLab',
    status: 'needs-review',
  },
] as const;

export function getFactById(id: string): ScientificFact | undefined {
  return SCIENTIFIC_FACTS.find((f) => f.id === id);
}

export function getFactsByCategory(category: ScientificFact['category']): ScientificFact[] {
  return SCIENTIFIC_FACTS.filter((f) => f.category === category);
}

export function getVerifiedFacts(): ScientificFact[] {
  return SCIENTIFIC_FACTS.filter((f) => f.status === 'verified');
}
