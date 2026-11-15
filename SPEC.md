# SPEC.md - Junior Astronaut Mission Trainer (agent-facing)

Team LYTEN, NASA Space Apps 2026, challenge "Build a Junior Astronaut Mission Trainer".
Human-facing plan lives in the team Doc. This file is the contract for coding agents. If this file and any other document disagree, **this file wins** for implementation.

Tags used everywhere: **[REAL]** = number or fact from a NASA source (must carry provenance), **[GAME]** = our design rule (must be shown with a GAME RULE chip in the UI).

---

## v1.1 amendments (priority over the sections below)

The team added requirements after v1. They live in two companion contracts. **Where they conflict with this file, they win.**

- `docs/spec/PRESENTATION.md`: persistent 3D stage, step cinematics (visible time), companion dialogues, interface rules, Data Lens. Replaces sections 5.2 and 8 below.
- `docs/spec/DATA-CATALOG.md`: expanded NASA data catalog (Best Use of Data), data integration contract. Replaces the file table in section 7.
- Engine additions: `previewOption(state, style)` and `buildPlayback(prev, next)` (pure functions; see PRESENTATION section 3).
- Save additions: `seen: string[]` and `settings.speed` (see section 6).
- Task cards (section 12) are replaced by the PR plan T01-T30 in `docs/fr/02-roadmap.md`.
- Agent rules: `AGENTS.md`, `SKILLS.md`, local `CONTEXT.md`.
- Snapshot names changed: `donki-flr-*.json`, `osdr-studies.json`, `images-avatars.json` (see DATA-CATALOG).

---

## 0. Rules for every agent (non-negotiable)

1. **Never invent NASA data.** No hand-typed flare classes, region numbers, study IDs, sols, temperatures, or quotes. Real data enters the repo only through `scripts/fetch-nasa-data.ts` or as a cited fact in `src/data/facts.ts`.
2. **Every number the player sees is tagged** REAL (with a source id) or GAME.
3. **Contract first.** `src/engine/types.ts` is frozen at T+1h. Changing it needs a message to the owner of workstream A and a note in `CHANGELOG-CONTRACT.md`.
4. **Stay in your directory** (see ownership in section 1). Cross-directory edits only through the exported interfaces.
5. **Main is always runnable.** One branch per task, small PRs, merge only if `npm run verify` passes.
6. **Keep it simple.** No new dependency without writing the reason in the PR. Allowed runtime deps: `next`, `react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei` (only if needed). Dev deps: `typescript`, `vitest`, `tsx`, `eslint`, optionally `@playwright/test`.
7. **No backend, no database, no accounts, no external runtime calls** except the optional P2 live DONKI fetch.
8. **No hand-made art.** UI art is SVG/CSS/Three primitives. Sound is synthesized with WebAudio. The only photos are the NASA avatars downloaded by the data script.
9. **Language:** English UI, reading grade 3-6, guide lines max 12 words, step cards max 25 words.
10. Before saying "done", run the task's acceptance checks and paste the result in the PR.
11. Read `AGENTS.md`, `SKILLS.md`, and keep your local `CONTEXT.md` up to date (never commit it).
12. The product must feel like a **game**: visible actions over time, uncluttered UI, companion dialogues (see PRESENTATION.md).

---

## 1. Stack and repo layout

- Next.js (App Router), TypeScript, React, `output: 'export'` (static site), `images: { unoptimized: true }`.
- Three via `@react-three/fiber`, loaded with `next/dynamic` and `ssr: false`, with a 2D fallback.
- State: React `useReducer` + context. The game engine is **pure TypeScript with no React imports**.
- Package manager: `npm`. Target OS for dev: Ubuntu. Node LTS.

```
/
  AGENTS.md SKILLS.md SPEC.md CONTEXT.template.md   # CONTEXT.md is local, git-ignored
  README.md docs/TECHNICAL.md docs/spec/ docs/fr/ docs/SCIENCE.md   # SCIENCE.md owner C
  scripts/ fetch-nasa-data.ts probe-apis.ts verify-data.ts run-bots.ts   # owner C (bots: A)
  public/avatars/*.jpg public/sites/*.jpg           # written by the fetch script only
  src/
    app/ (layout.tsx, page.tsx, globals.css)        # owner B
    engine/ types.ts rng.ts reducer.ts scoring.ts playback.ts bots.ts config/   # owner A (pure TS)
    content/ archetypes.ts missions.ts sites.ts events.ts dialogues.ts guide.ts badges.ts   # owner D
    progress/ xp.ts ranks.ts streak.ts badgesLogic.ts save.ts                  # owner D
    data/ snapshots/*.json facts.ts solar.ts provenance.ts                    # owner C
    ui/ screens/ components/ dialog/ cinematics/ (hooks)                       # owner B
    three/ stage/ kit/ cinematics/ noise.ts                                    # owner E
    audio/ sfx.ts                                                              # owner D
    judge/ judgeConfig.ts                                                      # owner B (logic hooks: A)
  tests/
```

Scripts in `package.json`: `dev`, `build`, `test`, `data:fetch`, `verify` (= typecheck + lint + test + `verify-data`), `bots` (balance simulation).

---

## 2. Screens and state machine

Single route. One client component holds `screen` state. `paused` is an overlay, not a screen.

`title -> destination -> missions -> sites -> difficulty -> loadout -> mission -> debrief -> title`

- Moon and Mars are both selectable from the start. **Nothing is locked by XP, rank, or stars.**
- Judge mode (section 9) can jump straight to `mission`.

---

## 3. Data model (types.ts, frozen at T+1h)

```ts
export type Body = 'moon' | 'mars';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type MeterId = 'power' | 'air' | 'health' | 'food';
export type Meters = Record<MeterId, number>;            // clamp 0..100
export type Archetype = 'travel'|'deploy'|'drill'|'experiment'|'repair'|'uplink';
export type OptionStyle = 'fast' | 'balanced' | 'careful';
export type SolarLevel = 'calm' | 'active' | 'stormy';
export type MissionTemplateId = 'relay'|'core'|'seismic'|'mapper'|'garden';
export type SiteId = 'shackleton'|'tranquillitatis'|'jezero'|'gale';

export interface Loadout {
  crew: 2 | 3 | 4;
  power: 'panels' | 'batteries';
  shield: 'standard' | 'reinforced';
  food: 'rations' | 'hydroponics';
}

export interface Provenance {
  source: string;        // e.g. "NASA CCMC DONKI"
  url: string;
  fetchedAt: string;     // ISO
  isLive: boolean;
  credit?: string;
  note?: string;
}
export interface Snapshot<T> { meta: Provenance; data: T }

export interface Flare { id: string; classType: string; peakTime: string; activeRegionNum: number | null }
export interface SolarContext { level: SolarLevel; pool: Flare[]; provenance: Provenance }

export interface StepOptionDef {
  style: OptionStyle;
  power: number; air: number; food: number;   // negative = spend, per step, before modifiers
  faultRisk: number;                          // 0..1 chance of Equipment fault event this turn
  outdoor: boolean;
}

export type EventKind = 'flare' | 'dust' | 'fault' | 'blackout' | 'none';

export interface RunState {
  seed: number; turn: number; body: Body; missionId: MissionTemplateId; siteId: SiteId;
  difficulty: Difficulty; loadout: Loadout; meters: Meters;
  stepIndex: number; lowPowerTurns: number;
  flags: { nightActive: boolean; dustTurnsLeft: number; blackoutTurnsLeft: number; panelDamage: number };
  alertsSeen: number; pressureWins: number; pressureFails: number; minHealth: number;
  pendingAdvice: { arrivesOnTurn: number; text: string } | null;
  log: TurnLogEntry[]; status: 'running' | 'won' | 'lost';
  lossReason?: 'air' | 'food' | 'health' | 'power';
}

export interface TurnLogEntry {
  turn: number; optionStyle: OptionStyle; event: EventKind;
  flare?: Flare;                 // REAL record shown to the player
  meters: Meters; notes: string[];
}

export type Action =
  | { type: 'CHOOSE_OPTION'; style: OptionStyle }
  | { type: 'ALERT_CHOICE'; choice: 'A' | 'B' | 'C' | 'EXPIRED' }
  | { type: 'ASK_MISSION_CONTROL' };
```

Engine entry points (exported from `engine/reducer.ts`):

```ts
createRun(params: {seed, body, missionId, siteId, difficulty, loadout}, solar: SolarContext): RunState
resolveStep(state: RunState, action: Action, solar: SolarContext): { state: RunState; alert?: AlertSpec }
scoreRun(state: RunState): { stars: 0|1|2|3; xp: XpBreakdown; incidents: string[] }
```

`resolveStep` is deterministic: same `(seed, actions, solar)` gives the same result. Use `mulberry32(seed + turn)` from `rng.ts`.

---

## 4. Engine rules **[GAME]** (all values live in `config/balance.ts`)

### 4.1 Loadout budget
Budget = **10 points**. Costs: crew 2/3/4 = 2/3/4; power panels 2, batteries 3; shield standard 1, reinforced 3; food rations 1, hydroponics 3. Max possible is 13, so the player must cut something. Reject loadouts over budget.

### 4.2 Starting meters
Air 100, Health 100. Power: panels 70, batteries 100. Food: rations 100, hydroponics 60.

### 4.3 Per-turn passive changes (applied after the chosen option)
Let `c = difficulty.consume` (easy 0.8, medium 1.0, hard 1.2).

| Effect | Rule |
|---|---|
| Air & Water | `air -= 3 * crew * c` |
| Food (rations) | `food -= 2 * crew * c` |
| Food (hydroponics) | turns 1-2: `food -= 2*crew*c`, `power -= 4`, `air -= 2`. Turn 3+: `food += 1 * crew` |
| Power (panels) | `power += 12 * lightFactor` where lightFactor = 1.0 base; x1.2 Shackleton; x0 during lunar night; x0.5 during dust storm; **x0.6 on Mars** |
| Power (batteries) | no generation |
| Shield upkeep | reinforced: `power -= 3` per turn |
| Crew strain | if `air < 20` or `food < 20`: `health -= 3` |

### 4.4 Radiation
`dose = baseDose[solar.level] * (outdoor ? 1.5 : 1) * shieldMult * bodyMult * difficulty.dose`
- `baseDose`: calm 1, active 2.5, stormy 4
- `shieldMult`: standard 1.0, reinforced 0.4
- `bodyMult`: moon 1.0, mars 0.7
- `difficulty.dose`: easy 0.8, medium 1.0, hard 1.2
- `health -= dose` each turn.

### 4.5 Step options
Each of the 6 archetypes has 3 options. Base vectors (before archetype and site modifiers):

| Style | power | air | food | faultRisk | Meaning |
|---|---|---|---|---|---|
| fast | -14 | -1 | -1 | 0.25 | quick, power hungry, risky |
| balanced | -9 | -2 | -2 | 0.12 | middle |
| careful | -5 | -4 | -3 | 0.05 | safe but longer, so more air and food |

Archetype power multipliers: travel x1.2, drill x1.4, deploy x1.0, experiment x1.0, repair x0.8, uplink x0.6.
Outdoor: travel, deploy, drill = true. experiment, repair, uplink = false.
Crew bonus: each crew above 2 reduces the option's power cost by 10 percent (travel, deploy, drill, repair only).

Site modifiers: Shackleton outdoor power x1.15; Tranquillitatis turns 4-6 are lunar night; Jezero and Gale experiment power x0.8; Gale travel power x1.1.

### 4.6 Events (rolled after each step)
`pEvent = difficulty.eventRate` (easy 0.5, medium 0.65, hard 0.8). If an event happens, pick the kind by weights:

| Kind | Weight |
|---|---|
| flare | calm 0.15, active 0.30, stormy 0.45 |
| dust | 0.25 on Mars, 0 on Moon |
| blackout | 0.15 on Mars, 0 on Moon |
| fault | 0.25 (plus the option's `faultRisk` forces it) |

Rules: no event on turn 1; max 2 timed alerts per mission; flare severity cap per difficulty (easy M, medium X, hard X).

**Flare**: draw a **real Flare record** from `solar.pool` whose class is within the cap, using the seeded RNG. Show its real `classType`, `peakTime`, `activeRegionNum`.
- class A/B/C: minor. Radio noise: Uplink option power x1.15 this turn. No decision.
- class M: Solar Storm Alert. Dose x1.4 this turn. Untimed choice A/B/C below.
- class X: timed alert (timer: easy 15 s, medium 12 s, hard 10 s). Same choices.

| Choice | Effect |
|---|---|
| A Shield up | power -15, dose x0.2 |
| B Shelter crew | power -3, dose x0.4, step does **not** advance |
| C Keep working | dose x1.0, step advances |

`EXPIRED` = choice C plus `pressureFails += 1`. A choice A or B in time = `pressureWins += 1`.

**Dust storm (Mars)**: timed. A Retract panels (generation x0 for 2 turns, no damage); B Keep panels out (generation x0.5 for 2 turns, 20 percent chance `panelDamage += 0.25` permanently); C Switch to battery reserve (power -10 now, generation unchanged).
**Fault**: A Repair now (power -8, step does not advance); B Patch (power -3, next faultRisk +0.1); C Ignore (health -4).
**Blackout (Mars)**: Ask Mission Control disabled for 2 turns.

### 4.7 Mission Control and communication delay
- Moon: advice arrives instantly. Show the label "Signal delay: about 1.2 seconds" **[REAL]**.
- Mars: `pendingAdvice.arrivesOnTurn = turn + delayTurns`, with `delayTurns` easy 1, medium 2, hard 3. Label shows real range **[REAL]**: easy "3 min", medium "about 12.5 min", hard "22 min" (the labels map to the real min, average, max one-way times; the turn counts are **[GAME]**).
- During any timed alert the advice always arrives after the timer. The guide says so.
- Advice text is a generic safe hint from `guideLines.ts`. It never reveals a hidden number.

### 4.8 End conditions
- **Lost** if air <= 0, food <= 0, health <= 0, or power == 0 for 2 consecutive turns.
- **Won** when `stepIndex === 6` and not lost.
- Stars: 1 = won. 2 = won and `health >= 60`. 3 = won and `minHealth >= 40` and `pressureFails === 0` and `power >= 25` and `air >= 25`.
- Difficulty is **only** these parameters (plus hints on/off in the UI: on for easy and medium):

| Param | Easy | Medium | Hard |
|---|---|---|---|
| consume | 0.8 | 1.0 | 1.2 |
| dose | 0.8 | 1.0 | 1.2 |
| eventRate | 0.5 | 0.65 | 0.8 |
| flare cap | M | X | X |
| timer s | 15 | 12 | 10 |
| delayTurns (Mars) | 1 | 2 | 3 |

### 4.9 Balance tests (the agent must tune numbers until these pass)
`npm run bots` runs 1000 seeded runs per `(body x mission x site x difficulty)` with three bots (`random`, `greedy-power`, `balanced`). Targets:
- `balanced` bot win rate: easy 70-90 percent, medium 45-70 percent, hard 20-45 percent.
- `random` bot win rate: under 25 percent on medium and hard.
- No run longer than 6 steps. Meters always within 0..100.
- At least 20 percent of lost runs end by health, to prove radiation matters; at least 20 percent end by power or air.

---

## 5. Content **[GAME text, REAL where cited]** (owner D)

### 5.1 Missions (5 templates, played on both bodies = 10 missions)

| id | Steps (archetypes in order) | Moon title | Mars title |
|---|---|---|---|
| relay | travel, deploy, deploy, repair, uplink, uplink | Moon Relay | Mars Relay |
| core | travel, drill, drill, experiment, repair, uplink | Deep Core Samples | Mars Core Samples |
| seismic | travel, deploy, repair, experiment, experiment, uplink | Moonquake Station | Marsquake Station |
| mapper | deploy, travel, experiment, travel, experiment, uplink | Moon Ice Mapper | Mars Water Mapper |
| garden | deploy, repair, experiment, experiment, repair, uplink | Moon Garden | Mars Garden |

The `garden` missions reference one real OSDR study chosen by the fetch script (`osdr-garden.json`). Its debrief shows the study id, title, and link. Do not write study details by hand.

Sites: Moon = `shackleton`, `tranquillitatis`. Mars = `jezero`, `gale`. Each site card has 3 short facts. A fact is either cited in `facts.ts` (REAL) or tagged GAME.

For each `(template x body)` write: title, objective (max 20 words), 6 step texts (max 25 words, grade 3-6), and one "why it matters" debrief line. Reuse archetype option labels with a per-step blurb. Put all of this in `content/missions.ts` as data, not code. Each mission entry has `enabled: boolean` (default true). The picker shows only enabled missions, so cutting an unfinished mission is a one-line change and never leaves a broken card on screen. Site entries carry the same `enabled` flag.

### 5.2 Guide character (replaced)

See `docs/spec/PRESENTATION.md` section 4 (companion Nova: click-to-continue dialog boxes, first-time triggers, saved in `save.seen`).

---

## 6. Progression and save (owner D)

XP (all **[GAME]**):
- Welcome +50 (once). Objective +100. Crew healthy (`health >= 60`) +80. Each timed decision won +50. Three stars +60. Lost or ended early +25 ("lesson learned"). Streak of 3+ days: x1.2 on mission XP.

Ranks (cosmetic only): Space Cadet 0-499, Mission Specialist 500-1499, Expedition Pilot 1500-3499, Base Commander 3500-6999, NASA Flight Director 7000+. **Nothing is gated by rank.**

Streak: day-based (`YYYY-MM-DD` local). Joker shield: 1 automatic save of a missed day, recharges after a 7-day streak.

Badges (each unlocks one NASA avatar):

| Badge | Condition | Avatar query hint (for the data script) |
|---|---|---|
| Steady Observer | 5-day streak | astronaut spacewalk ISS EVA |
| Flawless Pilot | 3 wins in a row with no loss | Orion Artemis crew launch suit portrait |
| Space Veteran | 7 wins in a row (tier 2: 15) | Perseverance rover Mars surface |
| Ice Cold | 10 timed decisions won with no critical failure | Mission Control Houston |
| Complete Constellation | 3 stars on easy, medium and hard of the same mission | Artemis program emblem |

Save: `localStorage` key `jamt.save.v1`.

```ts
interface SaveV1 {
  v: 1;
  profile: { codename: string; avatarId: string };
  xp: number;
  streak: { count: number; lastDay: string; jokerReady: boolean };
  badges: string[];
  best: Record<string, Partial<Record<Difficulty, 0|1|2|3>>>;   // key = `${body}-${missionId}`
  stats: { winStreak: number; pressureWinsClean: number; welcomeGiven: boolean };
  seen: string[];                       // companion moments already shown
  settings: { muted: boolean; extraTime: boolean; speed: 1 | 2 | 3 };
}
```
`save.ts`: wrap every read and write in try/catch, validate shape, migrate by `v`, and on corrupt data start fresh without crashing. Never store personal data other than a codename the child typed.

---

## 7. Data pipeline and provenance (owner C)

`npm run data:fetch` runs `scripts/fetch-nasa-data.ts`. Each output is a `Snapshot<T>` with full `Provenance`. Commit the outputs so the build needs no network. Use `NASA_API_KEY` from the environment only for endpoints that need it, never in client code.

The file list, endpoints (starting points to verify), game hooks and priorities are in `docs/spec/DATA-CATALOG.md`.

Rules for the script: retry twice with backoff; on failure exit non-zero and print which endpoint failed; **never** write placeholder data; never overwrite a good snapshot with an empty one.

`facts.ts` holds cited constants, each `{ id, text, sourceUrl, status: 'needs-review' | 'verified' }`. Seed it with: Moon one-way delay about 1.2 s; Mars one-way delay 3 to 22 minutes (NASA); lunar night about 14 Earth days; near-continuous sunlight on some south-polar peaks; and any site fact used on a site card. Source URLs come from NASA pages the agent finds and opens. A human flips `status` to `verified` after reading the page.

`verify-data.ts` fails the build if: a snapshot lacks provenance; any fact used in the UI is `needs-review`; an avatar lacks `credit` or `nasa_id`; or a `donki` snapshot is empty.

`data/solar.ts`: `getSolarContext(snap)` -> level = `stormy` if any X in the last 7 days of the recent window, else `active` if any M, else `calm`. `pool` = all flares in the snapshot. If the recent window is empty, use level `calm` and the May 2024 pool, and mark `provenance.note = "archived pool"`.

**P2 live fetch:** `tryLiveDonki()` with a 3-second timeout. On success set `isLive: true` and `fetchedAt: now`. On any failure keep the bundled snapshot. Test CORS first; if blocked, drop the feature.

UI provenance rules: every REAL number has a chip linking to its source, showing `source`, `fetchedAt`, and `LIVE` or `BUNDLED`. The judge panel lists every snapshot with these fields.

---

## 8. UI, audio, 3D (replaced)

See `docs/spec/PRESENTATION.md` (stage, cinematics, companion, interface rules, sound, haptics). Keyboard map stays: `1/2/3` choose, `Space` pause or speed, `M` mute.

---

## 9. Judge mode (owner E, UI by B)

Enabled by `?judge=1` or a visible "Judge mode" toggle on the title screen. It never alters scoring rules; it only changes entry and visibility.

1. **Play demo** button: Moon, Shackleton, `relay`, easy, preset loadout, fixed seed, no profile needed.
2. **Force event menu** (X flare, M flare, dust storm, fault, blackout) that injects the event on the next turn using a real record from the bundled pool.
3. **Short run**: 4 steps instead of 6.
4. **Demo profile**: rank Expedition Pilot, streak 4, 2 badges, so progression UI is visible. Held in memory only; it does **not** overwrite a real save.
5. **Replay a real storm**: sets the solar pool to the May 2024 snapshot with level `stormy`.
6. **Science map panel**: table of dataset -> rule driven -> snapshot provenance (generated from `facts.ts` and the snapshot metas, not hand-typed).

---

## 10. Testing

| Layer | What | Tool |
|---|---|---|
| Engine unit | determinism, clamping, each rule in section 4, loadout budget, event caps | Vitest |
| Balance | bot simulation targets in 4.9 | `npm run bots` |
| Data | `verify-data.ts` rules in section 7 | `npm run verify` |
| Save | corrupt JSON, old version, missing keys, `localStorage` throwing | Vitest |
| Progression | XP math, rank edges (499/500), streak with joker, each badge condition | Vitest |
| Smoke e2e (P1) | load, judge "Play demo", finish run, see debrief and provenance chip | Playwright |
| Manual | phone Chrome (Android), keyboard-only, WebGL off, offline, throttled network, incognito link | Checklist in the team Doc |

---

## 11. Deployment

- Host: Vercel static deployment of the `out/` directory. Fallback: Netlify drop of `out/`, or GitHub Pages (needs `basePath`).
- No server code, no runtime env vars. `NASA_API_KEY` is used only locally by `data:fetch`.
- Deploy a staging URL by T+8h and redeploy from `main` at each checkpoint. The final URL is tested in a private window on desktop and on a phone.
- Footer on every screen: "Educational project built for NASA Space Apps 2026. Not affiliated with or endorsed by NASA." plus an Image credits link.

---

## 12. Task cards (replaced)

Task cards, owners, dependencies, due times and the PR merge order are in `docs/fr/02-roadmap.md` (PR plan T01-T30). Branch names: `tNN-slug`.

---

## 13. Known limitations (state them honestly in the README)

- Missions are 6 compressed steps, not real mission durations.
- All percentages and costs are game design values, not NASA measurements.
- Mars surface weather uses archived InSight data only, if available.
- Only 2 sites per body; site values are simplified from qualitative NASA facts.
- Progress is stored in one browser only.

Future: more sites and missions, shareable progress code, live Mars data from newer missions, teacher mode with seeds and a class report, translations.
