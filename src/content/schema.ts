// src/content/schema.ts
// Zod schemas and validation rules for game content (missions, sites, archetypes).
// Strictly follows SPEC.md section 5.1 and docs/fr/02-roadmap.md (T07).

import { z } from 'zod';
import type { MissionTemplateId } from '../engine/types';
import { TEMPLATE_ARCHETYPES } from './archetypes';

/**
 * Counts words in a string separated by whitespace.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export const BodyEnum = z.enum(['moon', 'mars']);
export const MissionTemplateIdEnum = z.enum(['relay', 'core', 'seismic', 'mapper', 'garden']);
export const SiteIdEnum = z.enum(['shackleton', 'tranquillitatis', 'jezero', 'gale']);
export const ArchetypeEnum = z.enum(['travel', 'deploy', 'drill', 'experiment', 'repair', 'uplink']);

/**
 * Step schema: each step has an index (1..6), an archetype,
 * a short title, and a text of at most 25 words (grade 3-6 rule).
 */
export const MissionStepSchema = z.object({
  stepIndex: z.number().int().min(1).max(6),
  archetype: ArchetypeEnum,
  title: z.string().min(1),
  text: z.string().min(1).refine((t) => countWords(t) <= 25, {
    message: 'Step text must not exceed 25 words (grade 3-6 rule)',
  }),
});
export type MissionStep = z.infer<typeof MissionStepSchema>;

/**
 * Mission schema:
 * - objective: max 20 words
 * - steps: exactly 6 steps
 * - step archetypes must match TEMPLATE_ARCHETYPES[templateId]
 * - whyItMatters: debrief line explaining scientific relevance
 * - enabled: boolean flag to allow clean runtime toggling
 */
export const MissionSchema = z
  .object({
    id: z.string().min(1),
    templateId: MissionTemplateIdEnum,
    body: BodyEnum,
    title: z.string().min(1),
    objective: z.string().min(1).refine((t) => countWords(t) <= 20, {
      message: 'Mission objective must not exceed 20 words',
    }),
    whyItMatters: z.string().min(1),
    enabled: z.boolean(),
    steps: z.array(MissionStepSchema).length(6),
  })
  .superRefine((val, ctx) => {
    const expected = TEMPLATE_ARCHETYPES[val.templateId as MissionTemplateId];
    if (expected) {
      val.steps.forEach((step, idx) => {
        if (step.archetype !== expected[idx]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Step ${idx + 1} archetype must be '${expected[idx]}' for template '${val.templateId}', got '${step.archetype}'`,
            path: ['steps', idx, 'archetype'],
          });
        }
      });
    }
  });
export type Mission = z.infer<typeof MissionSchema>;

/**
 * Site fact schema: 3 facts per site, tagged REAL or GAME.
 */
export const SiteFactSchema = z.object({
  text: z.string().min(1),
  tag: z.enum(['REAL', 'GAME']),
  source: z.string().optional(),
});
export type SiteFact = z.infer<typeof SiteFactSchema>;

/**
 * Site schema: Moon or Mars location with exactly 3 facts and enabled flag.
 */
export const SiteSchema = z.object({
  id: SiteIdEnum,
  body: BodyEnum,
  name: z.string().min(1),
  desc: z.string().min(1),
  facts: z.array(SiteFactSchema).length(3),
  enabled: z.boolean(),
});
export type Site = z.infer<typeof SiteSchema>;

/**
 * Global content flags for missions and sites.
 */
export const ContentFlagsSchema = z.object({
  missionsEnabled: z.boolean(),
  sitesEnabled: z.boolean(),
  enabledTemplates: z.record(MissionTemplateIdEnum, z.boolean()).optional(),
  enabledSites: z.record(SiteIdEnum, z.boolean()).optional(),
});
export type ContentFlags = z.infer<typeof ContentFlagsSchema>;

/**
 * Helper to validate a mission against the schema.
 */
export function validateMission(data: unknown): Mission {
  return MissionSchema.parse(data);
}

/**
 * Helper to validate a site against the schema.
 */
export function validateSite(data: unknown): Site {
  return SiteSchema.parse(data);
}
