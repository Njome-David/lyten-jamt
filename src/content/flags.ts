// src/content/flags.ts
// Global content flags for enabling/disabling groups of content.
// Language: English – code comments in English as required.

import { ContentFlagsSchema, ContentFlags } from "./schema";

// Default flags – can be adjusted later via UI or config.
export const defaultContentFlags: ContentFlags = ContentFlagsSchema.parse({
  missionsEnabled: true,
  sitesEnabled: true,
});
