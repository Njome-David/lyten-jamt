/* Faits scientifiques sources de la NASA (voir SKILLS.md S10).
   Tous les faits commencent avec le statut 'needs-review'.
   Ils ne passent en 'verified' qu'apres relecture humaine (role C) avant la release. */
import type { ScientificFact } from './types';

export const SCIENTIFIC_FACTS: readonly ScientificFact[] = [
  {
    id: 'delay-moon',
    category: 'delay',
    title: 'Délai de télécommunication Terre-Lune',
    fact: 'Les signaux radio voyagent à la vitesse de la lumière (~300 000 km/s). À une distance moyenne de 384 400 km, un aller simple prend 1,28 seconde, soit 2,56 secondes aller-retour.',
    sourceUrl: 'https://www.nasa.gov/general/orbital-telecommunications-delays/',
    sourceCredit: 'NASA / Goddard Space Flight Center / LRO Team',
    status: 'needs-review',
  },
  {
    id: 'delay-mars',
    category: 'delay',
    title: 'Délai de télécommunication Terre-Mars',
    fact: 'La distance entre la Terre et Mars varie de 54,6 à 401 millions de kilomètres. Le temps de transmission radio aller simple varie entre 3 et 22 minutes (6 à 44 minutes aller-retour).',
    sourceUrl: 'https://mars.nasa.gov/basics/telemetry-and-delays/',
    sourceCredit: 'NASA Mars Exploration Program / Deep Space Network (DSN)',
    status: 'needs-review',
  },
  {
    id: 'solar-flare-classification',
    category: 'solar',
    title: 'Classification des éruptions solaires (DONKI)',
    fact: 'Les éruptions solaires sont classées selon leur intensité en rayons X en classes A, B, C, M et X. Chaque classe est 10 fois plus puissante que la précédente ; la classe X représente les éruptions les plus violentes.',
    sourceUrl: 'https://www.nasa.gov/mission_pages/sunearth/spaceweather/solar-flares/',
    sourceCredit: 'NASA Heliophysics / CCMC DONKI',
    status: 'needs-review',
  },
  {
    id: 'radiation-space',
    category: 'radiation',
    title: 'Radiations spatiales hors du bouclier terrestre',
    fact: "En dehors de la magnétosphère terrestre, les équipages reçoivent les rayonnements cosmiques galactiques (GCR) et les événements de particules solaires (SEP), imposant des blindages et abris d'urgence.",
    sourceUrl: 'https://www.nasa.gov/hrp/radiation/',
    sourceCredit: 'NASA Human Research Program (HRP)',
    status: 'needs-review',
  },
  {
    id: 'plant-growth-fractional-gravity',
    category: 'biology',
    title: 'Culture de plantes en gravité réduite (OSDR)',
    fact: "L'étude NASA OSD-251 démontre qu'Arabidopsis thaliana active des mécanismes génétiques spécifiques pour s'adapter à la gravité fractionnaire de la Lune (0,16g) et de Mars (0,38g).",
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
