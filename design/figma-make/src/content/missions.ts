import type { Archetype, Body, MissionTemplateId } from "../engine/types";

export interface MissionDef {
  key: string;
  id: MissionTemplateId;
  body: Body;
  title: string;
  badgeTag: string;
  recommended?: boolean;
  objective: string; // <= 20 words
  steps: [Archetype, Archetype, Archetype, Archetype, Archetype, Archetype];
  stepDescriptions: [string, string, string, string, string, string]; // <= 25 words each
  whyItMatters: string;
  usesOsdrGarden?: boolean;
  enabled: boolean;
}

export const MISSIONS: MissionDef[] = [
  {
    key: "moon-relay",
    id: "relay",
    body: "moon",
    title: "Moon Relay",
    badgeTag: "Starter Comms Expedition",
    recommended: true,
    objective: "Build a lunar radio relay tower to keep crater crews linked with Earth.",
    steps: ["travel", "deploy", "deploy", "repair", "uplink", "uplink"],
    stepDescriptions: [
      "Drive the rover up a bright crater ridge with clear sightlines toward Earth.",
      "Unfold the tripod mast and anchor its legs into packed lunar regolith.",
      "Mount the high-gain dish and connect insulated power cables to the base.",
      "Clean electrostatic moon dust from the transceiver seals inside the cabin.",
      "Run a calibration ping between the lunar habitat and Earth tracking stations.",
      "Lock the relay beacon online and stream full expedition telemetry home.",
    ],
    whyItMatters:
      "Craters near the Moon’s South Pole can block direct radio lines to Earth, making surface relays vital for Artemis explorers.",
    enabled: true,
  },
  {
    key: "moon-core",
    id: "core",
    body: "moon",
    title: "Deep Core Samples",
    badgeTag: "Lunar Geology",
    objective: "Drill ancient lunar rock cores and seal icy samples for Earth labs.",
    steps: ["travel", "drill", "drill", "experiment", "repair", "uplink"],
    stepDescriptions: [
      "Navigate across boulder-strewn ejecta to reach untouched bedrock layers.",
      "Bore the upper meter of compacted regolith to set the core casing.",
      "Extract a deep frozen core tube without warming trapped volatiles.",
      "Scan the rock core inside the airlock spectrometer for water-ice signatures.",
      "Purge abrasive lunar dust from the rotary drill clutch and suit joints.",
      "Transmit mineral spectra and core logs to geology teams on Earth.",
    ],
    whyItMatters:
      "Lunar core tubes preserve billions of years of solar history and reveal trapped water ice for future life support.",
    enabled: true,
  },
  {
    key: "moon-seismic",
    id: "seismic",
    body: "moon",
    title: "Moonquake Station",
    badgeTag: "Geophysics Network",
    objective: "Install an ultra-sensitive seismometer to measure moonquakes and meteor impacts.",
    steps: ["travel", "deploy", "repair", "experiment", "experiment", "uplink"],
    stepDescriptions: [
      "Carry the seismic package away from habitat vibrations onto quiet regolith.",
      "Level the sensor dome and drape thermal foil against extreme temperature swings.",
      "Recalibrate the thermal heater loop inside the cabin control rack.",
      "Record baseline ground tremors to filter out rover and footstep noise.",
      "Analyze a sharp subsurface vibration wave echoing through the lunar crust.",
      "Send seismic waveforms to planetary scientists mapping the Moon’s core.",
    ],
    whyItMatters:
      "Moonquakes can last for over ten minutes, helping engineers design safe, quake-ready lunar habitats.",
    enabled: true,
  },
  {
    key: "moon-mapper",
    id: "mapper",
    body: "moon",
    title: "Moon Ice Mapper",
    badgeTag: "Resource Reconnaissance",
    objective: "Map hidden underground water ice across shadowed craters with neutron sensors.",
    steps: ["deploy", "travel", "experiment", "travel", "experiment", "uplink"],
    stepDescriptions: [
      "Attach the neutron detector boom onto the front chassis of the rover.",
      "Roll along the sunlit rim bordering a cold shadowed crater basin.",
      "Measure hydrogen dips that reveal buried frost beneath dry lunar soil.",
      "Cross a second ridge to compare sunlit regolith against shaded slopes.",
      "Cross-check radar echoes inside the cabin to estimate ice depth.",
      "Upload the high-resolution water-ice map for future Artemis landings.",
    ],
    whyItMatters:
      "Water ice on the Moon can be purified for drinking water and split into breathable oxygen and rocket fuel.",
    enabled: true,
  },
  {
    key: "moon-garden",
    id: "garden",
    body: "moon",
    title: "Moon Garden",
    badgeTag: "OSDR Space Biology",
    objective: "Grow leafy greens in a lunar chamber under space radiation and low gravity.",
    steps: ["deploy", "repair", "experiment", "experiment", "repair", "uplink"],
    stepDescriptions: [
      "Set up the sealed LED plant chamber and prime nutrient water pillows.",
      "Balance cabin humidity scrubbers so young seedlings do not dry out.",
      "Measure leaf growth and antioxidant levels under lunar radiation doses.",
      "Compare plant health samples using NASA Space Biology assay protocols.",
      "Flush root oxygenation lines to keep the hydroponic tray thriving.",
      "Send crop nutrition results to NASA Open Science biology archives.",
    ],
    whyItMatters:
      "Fresh space-grown greens supply vitamins and morale on long missions where cargo resupply from Earth is costly.",
    usesOsdrGarden: true,
    enabled: true,
  },
  {
    key: "mars-relay",
    id: "relay",
    body: "mars",
    title: "Mars Relay",
    badgeTag: "Red Planet Comms",
    objective: "Establish a high-power surface transceiver linking Mars explorers with orbiters.",
    steps: ["travel", "deploy", "deploy", "repair", "uplink", "uplink"],
    stepDescriptions: [
      "Drive across rust-colored sand ripples to an elevated basalt bench.",
      "Anchor the wind-braced mast into fractured Martian rock.",
      "Align the X-band dish with overhead Mars relay orbiters.",
      "Brush fine iron-oxide dust off cable connectors and cooling vents.",
      "Test delayed packet handshakes across millions of kilometers to Earth.",
      "Stream crisp panoramic telemetry through the Deep Space Network.",
    ],
    whyItMatters:
      "Because Mars signals take 3 to 22 minutes each way, reliable surface-to-orbiter relays keep crews connected.",
    enabled: true,
  },
  {
    key: "mars-core",
    id: "core",
    body: "mars",
    title: "Mars Core Samples",
    badgeTag: "Astrobiology Drilling",
    objective: "Collect sealed mudstone cores that may hold clues of ancient Martian life.",
    steps: ["travel", "drill", "drill", "experiment", "repair", "uplink"],
    stepDescriptions: [
      "Traverse ancient shoreline rocks showing water-carved ripples and mineral veins.",
      "Drill into fine-grained mudstone formed in a calm ancient lake.",
      "Core a second salt-rich layer and seal both sterile titanium tubes.",
      "Scan rock powder inside the lab for organic carbon molecules.",
      "Clear red rock flour from the percussive drill chuck and air filters.",
      "Transmit sample coordinates and spectra to Mars Sample Return planners.",
    ],
    whyItMatters:
      "Billions of years ago Mars had liquid lakes and rivers; sealed rock cores preserve the best record of past habitability.",
    enabled: true,
  },
  {
    key: "mars-seismic",
    id: "seismic",
    body: "mars",
    title: "Marsquake Station",
    badgeTag: "Interior Crust Study",
    objective: "Shield a Martian seismometer from wind to detect deep marsquakes.",
    steps: ["travel", "deploy", "repair", "experiment", "experiment", "uplink"],
    stepDescriptions: [
      "Haul the seismic vault onto flat ground clear of loose pebbles.",
      "Place the heavy wind and thermal shield over the sensor head.",
      "Tune cabin power regulators against cold Martian night drops.",
      "Filter atmospheric wind gusts from faint crustal rumble signals.",
      "Pinpoint a marsquake echoing through the planet’s mantle.",
      "Beam interior crust thickness data back to geophysics teams.",
    ],
    whyItMatters:
      "Following NASA’s InSight lander, marsquake waves reveal how rocky planets form crusts, mantles, and cores.",
    enabled: true,
  },
  {
    key: "mars-mapper",
    id: "mapper",
    body: "mars",
    title: "Mars Water Mapper",
    badgeTag: "Subsurface Ice Survey",
    objective: "Use ground-penetrating radar to locate buried glacier ice beneath Martian dust.",
    steps: ["deploy", "travel", "experiment", "travel", "experiment", "uplink"],
    stepDescriptions: [
      "Mount the subsurface radar antenna onto the pressurized rover stern.",
      "Drive a straight survey line across dusty polygon-patterned ground.",
      "Log radar reflections bouncing off a buried ice sheet.",
      "Survey upslope toward crater walls to measure ice thickness.",
      "Verify ice purity inside the lab so crews know filter needs.",
      "Send buried water coordinates to future Mars base engineers.",
    ],
    whyItMatters:
      "Accessible underground water ice lets future Mars crews make drinking water, oxygen, and propellant on site.",
    enabled: true,
  },
  {
    key: "mars-garden",
    id: "garden",
    body: "mars",
    title: "Mars Garden",
    badgeTag: "OSDR Space Biology",
    objective: "Cultivate hardy lettuce crops for a self-reliant Red Planet crew.",
    steps: ["deploy", "repair", "experiment", "experiment", "repair", "uplink"],
    stepDescriptions: [
      "Install red-and-blue grow lamps and plant lettuce seeds in rooting pillows.",
      "Seal water-recovery condensers to recycle every drop transpired by leaves.",
      "Check leaf pigments and mineral uptake using NASA OSDR benchmarks.",
      "Test microbiological safety so harvested greens are safe for dinner.",
      "Clean nutrient pumps and rebalance cabin carbon-dioxide levels.",
      "Transmit harvest yield data to Earth space-agriculture researchers.",
    ],
    whyItMatters:
      "A round-trip Mars expedition can last over two years, making reliable greenhouse crops crucial for crew nutrition.",
    usesOsdrGarden: true,
    enabled: true,
  },
];

export function getMissionsForBody(body: Body): MissionDef[] {
  return MISSIONS.filter((m) => m.enabled && m.body === body);
}

export function getMission(body: Body, id: MissionTemplateId): MissionDef {
  const found = MISSIONS.find((m) => m.body === body && m.id === id);
  if (!found) {
    return MISSIONS[0];
  }
  return found;
}
