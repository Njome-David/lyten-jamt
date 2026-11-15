# NASA Science & Data Provenance Dossier

**Project:** Junior Astronaut Mission Trainer (JAMT)  
**Team:** LYTEN — NASA Space Apps Challenge 2026  
**Category Target:** Best Use of Data  
**Status:** Verified for Production Release (`v1.0`)

---

## 1. Executive Summary & Challenge Alignment

The *Junior Astronaut Mission Trainer* is an interactive web-based simulator designed for cadets aged 7 to 12. Its primary pedagogical and engineering objective is to immerse young explorers in the real trade-offs of command: managing life-support resources (Power, Air, Health, Food) while confronting genuine space environment physics on the Moon and Mars.

Rather than relying on fictional hazards or synthetic statistics, JAMT is powered by **authentic NASA scientific telemetry**. Every environmental hazard, space weather event, and biological research mission is directly anchored in peer-reviewed data from NASA mission archives and real-time space weather monitors.

---

## 2. Four-Pillar Data Integration Contract

Per `docs/spec/DATA-CATALOG.md` and `AGENTS.md`, an external NASA dataset is incorporated into JAMT **only if all four criteria are fulfilled**:

1. **Ingested and Bundled with Complete Provenance (`Snapshot<T>`)**:
   - Each dataset contains an immutable `meta` provenance block: `source`, `url`, `fetchedAt`, `isLive`, `credit`, and optional `note`.
   - The simulator runs completely offline without requiring active external network connections during gameplay.
2. **Diegetic Gameplay Hook**:
   - The data directly modulates simulation rules or visible gameplay outcomes (e.g., solar flare class determines radiation spikes; radio distance dictates communication latency).
3. **Visible Surface (`REAL` vs `GAME RULE` Demarcation)**:
   - No number is shown without explicit attribution. Authentic NASA telemetry bears the cyan `REAL` chip (`--chip-real-*`), while calibrated design parameters bear the amber `GAME RULE` chip (`--chip-game-*`).
   - Accessible at any time via the in-game **Data Loupe (L)** and the interactive **NASA Data Passport**.
4. **Automated Verification & Schema Testing**:
   - Validated continuously through `scripts/verify-data.ts` and strictly enforced before release via `npm run verify:release`.

---

## 3. NASA Dataset Inventory & Provenance Catalog

All raw snapshots are maintained in `src/data/snapshots/` with cumulative JSON footprint constrained to under 300 KB.

| # | Dataset / Source | Official NASA Endpoint | Bundled Snapshot File | Scientific Role & In-Game Hook | In-Game Surface | Verification |
|---|---|---|---|---|---|---|
| **1** | **DONKI Solar Flares (Recent)** | `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR` | `donki-flr-recent.json` | Real-time GOES satellite X-ray detections. Flare peak class (M & X) sets daily base radiation multiplier and triggers emergency alerts. | Solar Telemetry badge in HUD, Emergency Alert card, Data Loupe | `verified` |
| **2** | **DONKI May 2024 Superstorm** | `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR` | `donki-flr-may2024-a.json`, `donki-flr-may2024-b.json` | Historical G5 geomagnetic storm series featuring extreme X-class flares from Active Region AR 13664. | Replayable in Judge Mode ("May 2024 Replay") | `verified` |
| **3** | **DONKI Coronal Mass Ejections (CME)** | `https://ccmc.gsfc.nasa.gov/DONKI-API/get/CME` | `donki-cme-recent.json` | Interplanetary plasma cloud telemetry. Informs astronauts of CME transit speed, warning of impending radiation one turn ahead. | Early Warning Banner, Data Loupe | `verified` |
| **4** | **DONKI Solar Energetic Particles (SEP)** | `https://ccmc.gsfc.nasa.gov/DONKI-API/get/SEP` | `donki-sep-recent.json` | High-energy proton flux events (>10 MeV). Triggers severe radiation dosage spikes and mandatory shelter protocols. | Radiation Alert dialog, Data Passport | `verified` |
| **5** | **NASA Open Science Data Repository (OSDR)** | `https://osdr.nasa.gov/bio/repo/data/studies` | `osdr-studies.json` | Peer-reviewed space biology datasets (OSD-251, OSD-379, OSD-665): fractional gravity botany (*Arabidopsis thaliana*) and cellular radioresistance. | Bio Garden Mission series, Greenhouse loadout, Science Map | `verified` |
| **6** | **NASA Image and Video Library** | `https://images-api.nasa.gov` | `images-avatars.json` | Official astronaut flight suits and Extravehicular Mobility Unit (EMU) photography from Johnson Space Center (JSC). | Career Progression, Rank Insignias, Badge unlocks | `verified` |
| **7** | **Deep Space Network & Planetary Constants** | `https://www.nasa.gov/`, `https://mars.nasa.gov/` | `src/data/facts.ts` | Speed of light latency constants (Earth-Moon ~1.28s; Earth-Mars 3–22 min), cosmic radiation, and fractional gravity constants. | "Ask Mission Control" response lag, Science Map, Data Passport | `verified` |

---

## 4. Scientific Fundamentals & Verified Constants

Every factual statement presented in JAMT has undergone rigorous human peer review (Role C / Science Review) and is set to `status: 'verified'` in `src/data/facts.ts`.

### 4.1 Earth-Moon Telecommunication Latency (`delay-moon`)
- **Physics Constant:** Radio signals propagate in vacuum at the speed of light $c \approx 299,792\text{ km/s}$.
- **Orbital Baseline:** Mean lunar orbital distance is $384,400\text{ km}$.
- **One-Way Latency:**
  $$\Delta t = \frac{384,400\text{ km}}{299,792\text{ km/s}} \approx 1.282\text{ seconds}$$
- **Round-Trip Delay:** $\approx 2.56\text{ seconds}$.
- **In-Game Translation:** Immediate communication is possible with perceptible half-second cadence in the companion dialogue.

### 4.2 Earth-Mars Telecommunication Latency (`delay-mars`)
- **Orbital Baseline:** Because Earth and Mars follow eccentric heliocentric orbits, their mutual distance fluctuates between:
  - **Closest Approach (Opposition):** $\approx 54.6\text{ million km}$ ($3.03\text{ light-minutes}$).
  - **Farthest Separation (Conjunction):** $\approx 401\text{ million km}$ ($22.29\text{ light-minutes}$).
- **In-Game Translation:** Highlights the necessity of autonomous outpost decision-making; direct joystick teleoperation from Earth is physically impossible.

### 4.3 Solar Flare Classification & Flux Scaling (`solar-flare-classification`)
- **Measurement Standard:** Peak soft X-ray irradiance in the $0.1–0.8\text{ nm}$ ($1–8\text{ Å}$) wavelength band monitored by NOAA/NASA GOES spacecraft.
- **Logarithmic Scale:**
  - Class A: $< 10^{-7}\text{ W/m}^2$
  - Class B: $10^{-7}\text{ to } 10^{-6}\text{ W/m}^2$
  - Class C: $10^{-6}\text{ to } 10^{-5}\text{ W/m}^2$ (Minor)
  - Class M: $10^{-5}\text{ to } 10^{-4}\text{ W/m}^2$ (Moderate; radio blackouts)
  - Class X: $> 10^{-4}\text{ W/m}^2$ (Severe; hazardous proton storms)
- **In-Game Translation:** Class M sets the space weather level to `active` ($1.5\times$ radiation); Class X sets the level to `stormy` ($2.5\times$ radiation).

### 4.4 Deep Space Radiation Environment (`radiation-space`)
- **Space Radiation Hazards:** Crews beyond the Van Allen belts are subjected to:
  1. **Galactic Cosmic Rays (GCR):** High-energy relativistic atomic nuclei originating outside the solar system; steady and difficult to shield against.
  2. **Solar Particle Events (SEP):** Bursts of solar protons accelerated during CME shocks and flares; sporadic but lethal without thick regolith or water-wall shielding.
- **In-Game Translation:** The radiation shield loadout (*Standard* vs *Reinforced*) determines health degradation during EVA and emergency solar alerts.

### 4.5 Plant Biology in Fractional Gravity (`plant-growth-fractional-gravity`)
- **Source Study:** NASA OSDR Study **OSD-251** (*GeneLab*): *Transcriptomic and proteomic adaptations of Arabidopsis thaliana in simulated lunar and Martian microenvironments*.
- **Scientific Finding:** Seedlings activate specialized transcription factors to preserve root directional growth and water nutrient uptake in fractional gravities ($0.16g$ on the Moon; $0.38g$ on Mars).
- **In-Game Translation:** Directly underpins the **Bio Garden** mission archetype and hydroponics module mechanics.

---

## 5. REAL vs GAME RULE Calibration Matrix

To maintain scientific integrity without sacrificing educational engagement for children, JAMT clearly differentiates authentic data from game mechanics:

| Component | Displayed Element | Classification | Source / Design Rationale |
|---|---|---|---|
| **Resource Meters** | 0–100% Power, Air, Health, Food | `GAME RULE` | Normalized pedagogical scale calibrated for 5–10 minute game loops. |
| **Solar Status** | Calm, Active, Stormy | `REAL` | Derived directly from recent GOES/DONKI satellite X-ray flare records. |
| **Solar Flare Alert** | Class (e.g. M2.5), Peak Time, AR 13664 | `REAL` | Exact telemetry ingested from NASA GSFC CCMC DONKI database. |
| **Approach Cards** | Fast (-18⚡, -8💨), Balanced, Careful | `GAME RULE` | Operational tradeoff models calibrated to ensure strategic tension. |
| **Fault Risk** | Risk % (42% Fast, 10% Balanced, 4% Careful) | `GAME RULE` | Mathematical hazard probability model based on accelerated duty cycles. |
| **Radio Latency** | Moon (~1.28 s) vs Mars (3–22 min) | `REAL` | Exact physical constants derived from light speed and orbital mechanics. |
| **Outpost Sites** | Shackleton Crater, Jezero Delta, Gale Crater | `REAL` | Authentic landing coordinates and morphology from LRO LOLA and MRO HiRISE. |
| **Water Ice Reserves** | Shackleton Permanently Shadowed Regions (PSR) | `REAL` | Calibrated from NASA LRO Diviner temperature maps ($-246^\circ\text{C}$). |
| **Astronaut Avatars** | Flight Suits & EMU Photography | `REAL` | Official imagery from NASA Johnson Space Center (JSC) public domain library. |

---

## 6. Scientific Verification & Release Pipeline

The scientific accuracy of JAMT is verified automatically by a multi-stage testing pipeline:

```bash
# Full development check (TypeScript, Lint, Vitest unit tests, Data schema)
npm run verify

# Strict release audit (enforces P0 snapshots + 100% verified scientific facts)
npm run verify:release
```

### Release Audit Checklist:
- [x] All 7 bundled snapshot files are present in `src/data/snapshots/`.
- [x] Every snapshot validates against the strict `meta: Provenance` schema.
- [x] 100% of facts in `src/data/facts.ts` have `status: 'verified'`.
- [x] Zero synthetically generated or placeholder NASA records exist in the repository.
- [x] Interface components (`ScienceMapModal`, `DataPassportModal`) query exclusively through `getVerifiedFacts()`.
- [x] Offline execution guaranteed with 0 external network requests during runtime.

---

*Authored by Team LYTEN for NASA Space Apps Challenge 2026.*
