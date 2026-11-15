// src/content/flags.ts
// Global content flags for enabling or disabling missions and sites.
// Follows SPEC.md section 5.1 and docs/fr/02-roadmap.md (T07).

import type { ContentFlags } from './schema';

export const defaultContentFlags: ContentFlags = {
  missionsEnabled: true,
  sitesEnabled: true,
  enabledTemplates: {
    relay: true,
    core: false,
    seismic: false,
    mapper: false,
    garden: false,
  },
  enabledSites: {
    shackleton: true,
    tranquillitatis: true,
    jezero: true,
    gale: true,
  },
};
