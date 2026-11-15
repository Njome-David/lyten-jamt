// src/content/schema.ts
// Zod schema for game content (missions, flags, etc.).
// Language: English – code comments are in English as required.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Planet enum – the only planets used for relay missions.
// ---------------------------------------------------------------------------
export const PlanetEnum = z.enum(["Moon", "Mars"]);
export type Planet = z.infer<typeof PlanetEnum>;

// ---------------------------------------------------------------------------
// Mission schema – defines the shape of a mission entry.
// ---------------------------------------------------------------------------
export const MissionSchema = z.object({
  /** Unique identifier for the mission */
  id: z.string().min(1),
  /** Short title displayed to the player */
  title: z.string().min(1),
  /** Full description (max 200 words, but not enforced here) */
  description: z.string().min(1),
  /** Planet on which the mission takes place */
  planet: PlanetEnum,
  /** Whether the mission is currently enabled in the game */
  enabled: z.boolean(),
  /** Cost to start the mission – real NASA‑sourced value must be tagged REAL elsewhere */
  cost: z.number().nonnegative(),
  /** Rewards identifiers (e.g., badge names, XP bonuses) */
  rewards: z.array(z.string()),
});
export type Mission = z.infer<typeof MissionSchema>;

// ---------------------------------------------------------------------------
// Content flags – global switches controlling which content groups are active.
// ---------------------------------------------------------------------------
export const ContentFlagsSchema = z.object({
  /** Enable all relay missions (both Moon and Mars) */
  missionsEnabled: z.boolean(),
  /** Enable site markers on the map */
  sitesEnabled: z.boolean(),
});
export type ContentFlags = z.infer<typeof ContentFlagsSchema>;

// Export a single object for convenient imports elsewhere.
export const ContentSchema = {
  mission: MissionSchema,
  flags: ContentFlagsSchema,
};
