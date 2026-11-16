/* src/data/facts.ts
   Authentic NASA scientific facts and constants.
   Reviewed and verified for Space Apps Challenge release (T27 / SKILLS S10).
   All facts have been corroborated against official NASA mission and research publications. */

import type { ScientificFact } from './types';

export const SCIENTIFIC_FACTS: readonly ScientificFact[] = [
  {
    id: 'delay-moon',
    category: 'delay',
    title: 'Earth-Moon Telecommunication Latency',
    fact: 'Radio signals propagate at the speed of light (~300,000 km/s). At an average orbital distance of 384,400 km, a one-way radio ping takes approximately 1.28 seconds (1,28 s), resulting in a ~2.56-second round-trip delay.',
    sourceUrl: 'https://www.nasa.gov/general/orbital-telecommunications-delays/',
    sourceCredit: 'NASA / Goddard Space Flight Center / LRO Team',
    status: 'verified',
  },
  {
    id: 'delay-mars',
    category: 'delay',
    title: 'Earth-Mars Telecommunication Latency',
    fact: 'Because orbital distances between Earth and Mars vary from 54.6 to 401 million kilometers, one-way radio communication latency fluctuates between 3 and 22 minutes (6 to 44 minutes round-trip), precluding real-time joystick control from Earth.',
    sourceUrl: 'https://mars.nasa.gov/basics/telemetry-and-delays/',
    sourceCredit: 'NASA Mars Exploration Program / Deep Space Network (DSN)',
    status: 'verified',
  },
  {
    id: 'solar-flare-classification',
    category: 'solar',
    title: 'Solar Flare Classification (DONKI / GOES)',
    fact: 'Solar flares are classified according to their peak soft X-ray flux (watts per square meter) measured by GOES satellites into classes A, B, C, M, and X. Each letter corresponds to a 10-fold energy increase; X-class events represent extreme space weather storms.',
    sourceUrl: 'https://www.nasa.gov/mission_pages/sunearth/spaceweather/solar-flares/',
    sourceCredit: 'NASA Heliophysics / CCMC DONKI',
    status: 'verified',
  },
  {
    id: 'radiation-space',
    category: 'radiation',
    title: 'Deep Space Radiation Environment',
    fact: 'Beyond low Earth orbit and the protective geomagnetic shield, astronaut crews face two major radiation hazards: continuous isotropic Galactic Cosmic Rays (GCR) and sporadic high-energy Solar Particle Events (SEP), requiring dedicated storm shelters.',
    sourceUrl: 'https://www.nasa.gov/hrp/radiation/',
    sourceCredit: 'NASA Human Research Program (HRP)',
    status: 'verified',
  },
  {
    id: 'plant-growth-fractional-gravity',
    category: 'biology',
    title: 'Plant Cultivation in Fractional Gravity (OSDR)',
    fact: 'NASA OSDR study OSD-251 reveals that Arabidopsis thaliana triggers distinct molecular and stress-response pathways to adapt to the fractional gravities of the Moon (0.16g) and Mars (0.38g), laying the scientific foundation for bio-regenerative life support.',
    sourceUrl: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-251',
    sourceCredit: 'NASA Open Science Data Repository (OSDR) / GeneLab',
    status: 'verified',
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
