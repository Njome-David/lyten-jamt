import type { Body, SiteId } from "../engine/types";

export interface SiteFactItem {
  kind: "REAL" | "GAME";
  text: string;
  factId?: string;
}

export interface SiteDef {
  id: SiteId;
  body: Body;
  name: string;
  regionTag: string;
  tagline: string;
  modifierSummary: string;
  enabled: boolean;
  facts: [SiteFactItem, SiteFactItem, SiteFactItem];
}

export const SITES: Record<SiteId, SiteDef> = {
  shackleton: {
    id: "shackleton",
    body: "moon",
    name: "Shackleton Crater Rim",
    regionTag: "Lunar South Pole · 89.9° S",
    tagline: "Sunlit polar peaks overlooking ancient ice-filled shadows.",
    modifierSummary: "+20% solar power · +15% outdoor step power cost",
    enabled: true,
    facts: [
      {
        kind: "REAL",
        factId: "shackleton-sun",
        text: "High rim peaks catch near-continuous sunlight while the deep crater floor traps water ice.",
      },
      {
        kind: "GAME",
        text: "Solar panels generate 1.2x power here, but steep polar ridges cost 1.15x outdoor power.",
      },
      {
        kind: "REAL",
        factId: "moon-delay",
        text: "Earth Mission Control sits 1.28 light-seconds away for instant voice advice.",
      },
    ],
  },
  tranquillitatis: {
    id: "tranquillitatis",
    body: "moon",
    name: "Sea of Tranquility",
    regionTag: "Lunar Equator · 0.67° N",
    tagline: "Flat volcanic plains where lunar night freezes solar arrays.",
    modifierSummary: "Smooth terrain · Lunar Night hits Steps 4–6 (0 solar)",
    enabled: true,
    facts: [
      {
        kind: "REAL",
        factId: "tranquillitatis-mare",
        text: "Flat basalt plains where Apollo 11 astronauts first walked on the Moon.",
      },
      {
        kind: "REAL",
        factId: "lunar-night",
        text: "Equatorial lunar nights last about 14 Earth days in deep cold darkness.",
      },
      {
        kind: "GAME",
        text: "Steps 4–6 enter lunar night: solar arrays drop to 0 output, favoring Batteries.",
      },
    ],
  },
  jezero: {
    id: "jezero",
    body: "mars",
    name: "Jezero Crater Delta",
    regionTag: "Mars · 18.38° N, 77.58° E",
    tagline: "An ancient Martian lakebed rich in clay minerals and river sediments.",
    modifierSummary: "-20% Lab Experiment power · Mars 0.6x sunlight",
    enabled: true,
    facts: [
      {
        kind: "REAL",
        factId: "jezero-delta",
        text: "Ancient lakebed and river delta explored by NASA’s Perseverance rover.",
      },
      {
        kind: "REAL",
        factId: "mars-sunlight",
        text: "Farther from the Sun, Mars receives less than half of lunar sunlight.",
      },
      {
        kind: "GAME",
        text: "Rich surface clays cut Lab Analysis power costs by 20% at Jezero.",
      },
    ],
  },
  gale: {
    id: "gale",
    body: "mars",
    name: "Gale Crater & Mount Sharp",
    regionTag: "Mars · 5.4° S, 137.8° E",
    tagline: "Towering rock layers recording how ancient Mars lost its water.",
    modifierSummary: "-20% Experiment power · +10% Traverse power",
    enabled: true,
    facts: [
      {
        kind: "REAL",
        factId: "gale-mount-sharp",
        text: "Home to 5.5-km Mount Sharp, climbed by NASA’s Curiosity rover.",
      },
      {
        kind: "REAL",
        factId: "mars-delay",
        text: "Radio messages to Earth take 3 to 22 minutes each way.",
      },
      {
        kind: "GAME",
        text: "Layered outcrops cut Experiment power 20%, while slopes add 10% Traverse power.",
      },
    ],
  },
};

export function getSitesForBody(body: Body): SiteDef[] {
  return Object.values(SITES).filter((s) => s.enabled && s.body === body);
}
