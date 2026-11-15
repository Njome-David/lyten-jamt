# Junior Astronaut Mission Trainer

Command a Moon or Mars outpost in short missions where every decision costs power, air, shielding, or food, and real solar activity changes the dangers.

Built by Team LYTEN for the **2026 NASA Space Apps Challenge**, challenge **"Build a Junior Astronaut Mission Trainer"**.

- **Play (no download, no account):** `<LIVE_URL>` (fill in at release)
- **Demo video:** `<VIDEO_URL>` (fill in at release)
- **Judges:** open `<LIVE_URL>?judge=1` or press **Judge mode** on the title screen.

> Educational project built for NASA Space Apps 2026. Not affiliated with or endorsed by NASA.

---

## What it is

A turn-based simulation for ages 7-12 (and a second layer for parents and teachers). It is not a quiz and not a slideshow. You choose a body (Moon or Mars), one of five missions, a landing site, and a difficulty, then spend a limited loadout budget on crew, power, shielding, and food. Over six mission steps you make tactical choices, react to events, and see the consequences in four meters: **Power, Air & Water, Crew Health, Food**.

No choice is free:

- More crew finishes work faster but breathes more air and eats more food.
- Reinforced shielding protects the crew from radiation but draws power.
- Hydroponics feeds you later but costs power and air first.
- On Mars, Mission Control's answer arrives too late for a timed emergency, so you decide alone.

A lost mission is educational: the guide explains the physical cause.

## How to play (60 seconds)

1. Choose Moon or Mars, then a mission and a site.
2. Pick a difficulty and build your loadout (the budget forces a cut).
3. Each step, pick **Fast**, **Balanced**, or **Careful**. Watch the meters.
4. When an alert appears, decide before the timer ends.
5. Read the debrief: what happened, why, and the real NASA source.

Controls: mouse or touch, or keyboard (`1` `2` `3` choose, `Space` pause, `M` mute). There is an extra-time option for alerts.

## Judge mode

Open with `?judge=1` or the toggle on the title screen. It changes how you enter and what you can see, never the scoring.

- One-click **Play demo**, a short 4-step run, a preloaded profile.
- **Force event** menu (X flare, M flare, dust storm, fault, blackout).
- **Replay a real storm** (May 2024 DONKI records).
- **Science map**: which NASA dataset drives which rule, with source and timestamp.

## Real NASA data, honestly labelled

Every number in the game carries a chip: **REAL DATA** (with source, fetch time, and BUNDLED or LIVE) or **GAME RULE** (our design value, not a NASA measurement).

| NASA source | What it drives | Status |
|---|---|---|
| CCMC DONKI solar flares | Which flares appear as events (real class, peak time, active region), "Today's Sun", Replay a real storm | Bundled snapshot fetched by script; live fetch optional |
| OSDR (Open Science Data Repository) | The garden missions and radiation and microgravity health framing | One real study chosen by the script |
| InSight Mars weather (archive) | Mars temperature and wind reference | Archived data only; shown if available |
| NASA delay figures | Mars signal delay 3 to 22 minutes; Moon about 1.2 seconds | Cited in the app |
| NASA Image and Video Library | Badge avatars with credits and captions | Downloaded by script |

Full mapping: `docs/SCIENCE.md`. Technical details: `docs/TECHNICAL.md`. Implementation rules: `SPEC.md`.

## Run locally (Ubuntu)

```bash
# Node.js LTS (20 or newer) via nvm
git clone <REPO_URL> && cd <REPO_DIR>
npm install
npm run dev            # http://localhost:3000
```

Other scripts:

```bash
npm run verify         # typecheck, lint, tests, data checks
npm run bots           # balance simulation
npm run build          # static export to out/
NASA_API_KEY=<key> npm run data:fetch   # refresh NASA snapshots (optional)
```

The repo already contains the data snapshots, so the game runs with no network and no API key.

## Tech

Next.js (static export), React, TypeScript, Three.js via React Three Fiber (lazy-loaded, with a 2D fallback), a pure-TypeScript deterministic game engine, `localStorage` for progress, WebAudio for sound. No server, no database, no accounts, no analytics, no third-party scripts or fonts.

## Accessibility and privacy

Reading level for grades 3-6 with a glossary for terms like sol, radiation dose, latency, and microgravity. Full keyboard play, large touch targets, meters that never rely on colour alone, reduced-motion support, extra-time option, and a 2D fallback when WebGL is off. The only stored value is the codename a child types, saved on their own device.

## Known limitations

- Missions are six compressed steps, not real mission durations.
- Percentages and costs are game design values, not NASA measurements.
- Mars weather uses archived InSight data only.
- Two sites per body.
- A mission in progress is not resumed after reloading the page.
- Progress is stored in one browser only.

## Credits

Data and images: NASA CCMC (DONKI), NASA OSDR, NASA Image and Video Library. Image credits and NASA IDs are shown in the app (Image credits link) and listed in `docs/SCIENCE.md`.

Team LYTEN: `<team member names>`.

License: `<to be decided by the team before release>`. NASA media remain subject to NASA's media usage guidelines.
