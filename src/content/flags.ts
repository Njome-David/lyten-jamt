// src/content/flags.ts
// Global content flags for enabling or disabling missions and sites.
// Follows SPEC.md section 5.1 and docs/fr/02-roadmap.md (T07, T17).

import type { ContentFlags } from './schema';

export const defaultContentFlags: ContentFlags = {
  missionsEnabled: true,
  sitesEnabled: true,
  enabledTemplates: {
    relay: true,
    core: true,
    seismic: true,
    mapper: true,
    garden: true,
  },
  enabledSites: {
    shackleton: true,
    tranquillitatis: true,
    jezero: true,
    gale: true,
  },
};
