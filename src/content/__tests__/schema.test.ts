// src/content/__tests__/schema.test.ts
// Unit tests for content schema validation.
// Language: English – comments in English as required.

import { describe, test, expect } from "vitest";
import { MissionSchema, ContentFlagsSchema, PlanetEnum } from "../schema";

describe("MissionSchema validation", () => {
  test("valid mission passes", () => {
    const validMission = {
      id: "test-moon-1",
      title: "Test Mission",
      description: "A test mission on the Moon.",
      planet: "Moon" as const,
      enabled: true,
      cost: 10,
      rewards: ["badge_test", "xp_50"],
    };
    expect(() => MissionSchema.parse(validMission)).not.toThrow();
  });

  test("invalid planet fails", () => {
    const invalidMission = {
      id: "bad-mission",
      title: "Bad",
      description: "Invalid planet",
      // @ts-ignore deliberately wrong value
      planet: "Venus",
      enabled: true,
      cost: 5,
      rewards: [],
    };
    expect(() => MissionSchema.parse(invalidMission)).toThrow();
  });
});

describe("ContentFlagsSchema validation", () => {
  test("valid flags pass", () => {
    const flags = { missionsEnabled: true, sitesEnabled: false };
    expect(() => ContentFlagsSchema.parse(flags)).not.toThrow();
  });

  test("missing flag fails", () => {
    const incomplete = { missionsEnabled: true } as any;
    expect(() => ContentFlagsSchema.parse(incomplete)).toThrow();
  });
});

describe("PlanetEnum values", () => {
  test("contains Moon and Mars", () => {
    expect(PlanetEnum.options).toContain("Moon");
    expect(PlanetEnum.options).toContain("Mars");
  });
});
