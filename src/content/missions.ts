// src/content/missions.ts
// Mission definitions for Moon and Mars relay missions.
// Language: English – code comments in English as required.

import { Mission, MissionSchema } from "./schema";
import { PlanetEnum } from "./schema";

// Helper to ensure objects conform to the Zod schema at runtime (optional).
const validate = (mission: Mission) => MissionSchema.parse(mission);

export const missions = {
  // Moon relay missions (example entries)
  moonRelay1: validate({
    id: "moon-relay-1",
    title: "Lunar Survey",
    description: "Collect geological samples from the Sea of Tranquility.",
    planet: PlanetEnum.enum.Moon,
    enabled: true,
    cost: 10,
    rewards: ["badge_lunar_survey", "xp_100"],
  }),
  moonRelay2: validate({
    id: "moon-relay-2",
    title: "Lunar Habitat Deployment",
    description: "Deploy a temporary habitat module for future missions.",
    planet: PlanetEnum.enum.Moon,
    enabled: true,
    cost: 20,
    rewards: ["badge_habitat", "xp_200"],
  }),
  // Mars relay missions (example entries)
  marsRelay1: validate({
    id: "mars-relay-1",
    title: "Martian Soil Analysis",
    description: "Analyze soil composition in the Elysium Planitia region.",
    planet: PlanetEnum.enum.Mars,
    enabled: true,
    cost: 15,
    rewards: ["badge_mars_soil", "xp_150"],
  }),
  marsRelay2: validate({
    id: "mars-relay-2",
    title: "Mars Dust Storm Shelter",
    description: "Find shelter during a regional dust storm.",
    planet: PlanetEnum.enum.Mars,
    enabled: true,
    cost: 25,
    rewards: ["badge_storm_shelter", "xp_250"],
  }),
} as const;

export type MissionKey = keyof typeof missions;
