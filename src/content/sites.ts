// src/content/sites.ts
// Site definitions with 3 facts (REAL / GAME) and enabled flags.
// Follows SPEC.md section 5.1 and docs/fr/02-roadmap.md (T07).

import type { Body, SiteId } from '../engine/types';
import { validateSite, type Site } from './schema';

export const SITES: Record<SiteId, Site> = {
  shackleton: validateSite({
    id: 'shackleton',
    body: 'moon',
    name: 'Shackleton Crater',
    desc: 'Lunar South Pole with continuous sunlight on elevated rims and cold traps in darkness.',
    enabled: true,
    facts: [
      {
        text: 'Rim peaks receive nearly 90% continuous sunlight, ideal for uninterrupted solar power generation.',
        tag: 'REAL',
        source: 'NASA Lunar Reconnaissance Orbiter (LRO)',
      },
      {
        text: 'Permanently shadowed crater floors plunge to -246°C, preserving ancient volatile water ice reserves.',
        tag: 'REAL',
        source: 'NASA LCROSS & LRO Diviner',
      },
      {
        text: 'Designated as a prime study target for NASA Artemis human landing missions.',
        tag: 'GAME',
      },
    ],
  }),

  tranquillitatis: validateSite({
    id: 'tranquillitatis',
    body: 'moon',
    name: 'Sea of Tranquillity',
    desc: 'Historic Apollo 11 touchdown site consisting of vast flat ancient basalt plains.',
    enabled: true,
    facts: [
      {
        text: 'Site of the historic Apollo 11 first crewed lunar landing on July 20, 1969.',
        tag: 'REAL',
        source: 'NASA Apollo 11 Mission Archive',
      },
      {
        text: 'Vast smooth plains formed by ancient basaltic lava flooding over three billion years ago.',
        tag: 'GAME',
      },
      {
        text: 'Undergoes 14 Earth days of freezing darkness during every full lunar night cycle.',
        tag: 'GAME',
      },
    ],
  }),

  jezero: validateSite({
    id: 'jezero',
    body: 'mars',
    name: 'Jezero Crater',
    desc: 'Ancient Martian paleolake featuring fan-delta clay deposits and rich mineral diversity.',
    enabled: true,
    facts: [
      {
        text: 'Explored by NASA Perseverance rover to search for biosignatures in ancient lake sediments.',
        tag: 'REAL',
        source: 'NASA Mars 2020 Perseverance Mission',
      },
      {
        text: 'River delta sediments preserve clays and carbonates that require liquid water to form.',
        tag: 'REAL',
        source: 'NASA Mars Reconnaissance Orbiter CRISM',
      },
      {
        text: 'Subject to regional dust storms and strong thermal wind shifts across crater slopes.',
        tag: 'GAME',
      },
    ],
  }),

  gale: validateSite({
    id: 'gale',
    body: 'mars',
    name: 'Gale Crater',
    desc: 'Impact basin centered on Mount Sharp, exposing billions of years of layered Martian climate history.',
    enabled: true,
    facts: [
      {
        text: 'Explored by NASA Curiosity rover since August 2012, confirming past habitable stream conditions.',
        tag: 'REAL',
        source: 'NASA Mars Science Laboratory (MSL)',
      },
      {
        text: 'Mount Sharp rises 5.5 kilometers from the crater floor, exposing stratified sulfate layers.',
        tag: 'REAL',
        source: 'NASA MSL Science Team',
      },
      {
        text: 'Rover wheels face sharp ventifact rocks and fine atmospheric dust deposition.',
        tag: 'GAME',
      },
    ],
  }),
};

/**
 * Retrieve a site by its unique SiteId.
 */
export function getSite(id: SiteId): Site | undefined {
  return SITES[id];
}

/**
 * Return all sites, optionally filtered by body.
 */
export function getSites(body?: Body): Site[] {
  return Object.values(SITES).filter((s) => body === undefined || s.body === body);
}

/**
 * Return enabled sites, optionally filtered by body.
 */
export function getEnabledSites(body?: Body): Site[] {
  return Object.values(SITES).filter((s) => s.enabled && (body === undefined || s.body === body));
}

export const sites = SITES;
