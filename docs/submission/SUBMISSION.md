# Junior Astronaut Mission Trainer (JAMT)
## NASA International Space Apps Challenge 2026 Submission Dossier

**Team**: LYTEN  
**Challenge**: *Build a Junior Astronaut Mission Trainer*  
**Category Focus**: Best Use of Data | Best Mission Concept | Educational Impact  
**Live Application**: [https://lyten-jamt.vercel.app](https://lyten-jamt.vercel.app) *(or production URL)*  
**Source Code Repository**: [https://github.com/Njome-David/lyten-jamt](https://github.com/Njome-David/lyten-jamt)  
**Demo Video**: [https://youtu.be/placeholder-demo-video](https://youtu.be/placeholder-demo-video) *(Public with English captions)*  

---

## 1. High-Level Summary (Elevator Pitch)

**Junior Astronaut Mission Trainer (JAMT)** is an immersive, web-based space mission simulation designed for children aged 7 to 12. Unlike passive educational quizzes or simplified arcade games, JAMT puts young commanders in genuine charge of a lunar or martian outpost where **every decision has a real physical cost**, and **real NASA space science directly governs the dangers**.

Players manage an outpost across six tactical mission steps—balancing four interdependent vital life-support meters: **Power, Air & Water, Crew Health, and Food**. When a real solar flare erupts or a Martian dust storm strikes, players must adapt in real time. On Mars, the realistic 3-to-22-minute light-speed communication delay prevents Mission Control from providing immediate help, teaching kids autonomy, resilience, and scientific troubleshooting.

Every single metric in JAMT is honestly labeled with an interactive **REAL DATA** or **GAME RULE** chip. With zero accounts, zero trackers, 100% procedural 3D graphics and audio (0 KB audio downloads), and full offline capability powered by NASA open data, JAMT turns complex astrophysics, biology, and space engineering into an unforgettable educational adventure.

---

## 2. Project Description & Educational Vision

### The Pedagogical Problem
Space education for youth frequently oscillates between two extremes:
1. Abstract, fact-heavy quizzes that test rote memorization without building intuition.
2. Fantasy action games that ignore orbital mechanics, radiation hazards, and life-support realities.

### The JAMT Solution: Consequential Systems Thinking
Children learn best through **agency, experimentation, and constructive failure**. In JAMT:
- **No decision is free**: Adding more crew members accelerates construction and repair, but increases oxygen and food consumption. Reinforcing radiation shields protects health during a coronal mass ejection, but drains critical battery reserves. Planting space crops in hydroponics provides long-term nutrition, but requires immediate water and power sacrifices.
- **Constructive, educational failure**: When life-support fails or an outpost is evacuated, the mission does not end with a generic "Game Over." Instead, **Nova** (our 12-year-old astronaut companion) walks the cadet through the scientific root cause (e.g., *"Our solar panels got covered by Martian dust, which dropped power generation below life-support heaters during the night"*), encouraging critical analysis and re-engagement.
- **Two cognitive layers**: Designed with a clean, uncluttered interface for 7-to-12-year-olds (one focal point per screen, 3 distinct options max, large 48px touch targets), backed by an expandable "Data Loupe" layer for curious kids, parents, and educators wanting to dig into genuine scientific papers and NASA registries.

---

## 3. Real NASA Data Integration ("Best Use of Data")

JAMT was architected around the core rule that **NASA data must never be cosmetic**. Every integrated dataset directly changes a game rule, an event probability, or a visual indicator.

| NASA Source & API | Exact Endpoint / Dataset | In-Game Manifestation & Rule Impact | Scientific Integrity Status |
|---|---|---|---|
| **NASA CCMC DONKI** (Space Weather Database) | `/DONKI/FLR` (Solar Flares) & `/DONKI/CME` | Eruptions (C, M, X class) dictate active radiation hazards. Real active regions (e.g., AR3664) and peak flux trigger dynamic shield emergency protocols. | **REAL DATA** (Bundled snapshot + Live API hook) |
| **NASA DONKI Historical Archives** | May 10–12, 2024 Geomagnetic Superstorm records | Dedicated **"Replay a Real Storm"** mode in Judge Settings, allowing cadets to experience how the strongest solar storm in two decades impacted space infrastructure. | **REAL DATA** (Verified historical record) |
| **NASA OSDR** (Open Science Data Repository) | GeneLab Study `OSD-251` (*Arabidopsis thaliana* spaceflight seedling experiments) | Drives the **Botanical Greenhouse & Garden missions** on Moon and Mars. Real transcriptomic data on radiation stress and root microgravity adaptations is featured in mission debriefs. | **REAL DATA** (Source DOI & GeneLab accession) |
| **NASA Planetary Exploration Archives** | InSight Mars Lander weather & Apollo lunar environmental telemetry | True surface temperature ranges (-130°C to 0°C on Mars, -170°C to +120°C on Moon), atmospheric pressures, and day/night cycle lengths driving thermal heater drain. | **REAL DATA** (Archival sensor benchmarks) |
| **NASA Deep Space Network (DSN) Latency** | DSN telemetry & speed of light calculations | **Communication Latency Simulation**: Moon communications take ~1.28 seconds (near-instant help), while Mars takes 3 to 22 minutes. On Mars, asking Mission Control for emergency help fails because the signal arrives long after the crisis window! | **REAL DATA** (Astrodynamics constant) |
| **NASA Image & Video Library** | Johnson Space Center (JSC) Extravehicular Mobility Unit (EMU) and Apollo/Artemis archives | Real spacesuit photography and mission insignias tied to career rank progressions and unlockable educational astronaut badges. | **REAL DATA** (NASA Media Usage Guidelines compliant) |

### The "REAL DATA" vs "GAME RULE" Ethical Policy
In strict compliance with our team charter, **no NASA data point is ever invented or simulated without disclosure**. 
- Whenever a value is drawn directly from NASA archives or telemetry, it is marked with a **REAL DATA** badge linking directly to the source agency URL, snapshot date, and observation instruments.
- Whenever a value is calibrated for game balance (e.g., percentage costs of a repair kit), it is transparently tagged as a **GAME RULE**.
- Cadets can press **`L`** at any moment to open the **Data Loupe**, revealing the scientific provenance behind every element on screen, or explore the complete **NASA Data Passport**.

---

## 4. Technical Architecture & Innovation

JAMT is engineered as a modern, lightweight, privacy-respecting Progressive Web Application:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
├───────────────────────────────┬─────────────────────────────┤
│      UI & Screens (Next.js)   │   Procedural 3D Stage (R3F) │
│  - Focused Kid-First UI       │   - Single persistent Canvas│
│  - Real / Game Rule Chips     │   - Dynamic Lunar/Martian   │
│  - Data Loupe & Passport      │     lighting & dust storm   │
│  - Judge & Demo Mode Overlay  │   - Zero external 3D assets │
│                               │   - 2D Parallax CSS Fallback│
├───────────────────────────────┴─────────────────────────────┤
│             Pure Deterministic Engine (TypeScript)           │
│  - Zero DOM / Zero Math.random / Zero external side-effects │
│  - Seeded PRNG for reproducible runs                        │
│  - Four Interdependent Vital Life-Support Meters            │
├───────────────────────────────┬─────────────────────────────┤
│ Procedural WebAudio Synthesis │ Verified NASA Data Snapshots│
│  - 0 KB audio files           │  - Bundled JSON snapshots   │
│  - 9 SFX synthesizers         │  - Optional live DONKI sync │
│  - Cosmic Drone Ambience      │  - 100% offline functional  │
│  - Mobile Haptic Vibrations   │  - Strict schema validated  │
└───────────────────────────────┴─────────────────────────────┘
```

1. **Zero External Runtime Footprint (0 KB Audio & Fast Bundling)**:
   - All 9 sound effects and the cosmic ambient drone are procedurally synthesized using pure **WebAudio oscillators, noise generators, and biquad filters**. No external MP3/WAV files are downloaded, keeping bundle size microscopic and mobile data usage near zero.
2. **Procedural 3D with 2D Parallax Fallback**:
   - Outposts, terrain, and atmospheric scattering are procedurally rendered via React Three Fiber. On low-end school tablets or devices without WebGL, the game automatically switches to an optimized 2D parallax stage with zero visual breakage.
3. **Deterministic Simulation Engine**:
   - The game rules in `src/engine/` are isolated from React and browser APIs, using seeded pseudo-random number generation. This allows the bot simulation suite (`npm run bots`) to run thousands of autonomous games to guarantee mathematical balance.
4. **Privacy & Classroom Safety First**:
   - **Zero accounts, zero cookies, zero analytics, zero external scripts or tracking pixels**. The cadet's progress is saved strictly in their local browser storage.
   - Fully compliant with child safety guidelines: no real miner's likeness or voice is used.

---

## 5. Judge & Evaluation Features

Judges can test the entire experience instantly without repetitive playthroughs:
- **One-Click Demo Run**: Press `?judge=1` in the URL or toggle **Judge Mode** on the title screen to launch a calibrated 4-step mission.
- **Force Event Trigger**: Instantly trigger an X-class solar flare, an M-class flare, a Martian dust storm, or an oxygen scrubber failure to evaluate the emergency UI and procedural cinematics.
- **Replay a Real Storm**: Experience the actual May 10, 2024 solar superstorm using authentic DONKI solar flux measurements.
- **Science Map**: Browse an interactive visualization of every active NASA dataset, endpoint URL, ingestion date, and in-game usage.

---

## 6. Future Perspectives & Educational Expansion

- **Classroom Teacher Dashboard**: Local network synchronization allowing teachers to broadcast a specific historical space weather event to an entire classroom simultaneously.
- **Artemis Base Camp Expansion**: Integrating live telemetry from the upcoming Artemis lunar landings and Gateway space station passes.
- **Multilingual Support**: Community localization with French, Spanish, and Arabic space science glossaries.

---

*Educational project created by Team LYTEN for the 2026 NASA Space Apps Challenge. Not affiliated with or endorsed by NASA.*
