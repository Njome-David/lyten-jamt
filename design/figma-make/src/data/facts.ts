export interface CitedFact {
  id: string;
  label: string;
  text: string;
  sourceName: string;
  sourceUrl: string;
  status: "verified";
}

export const FACTS: Record<string, CitedFact> = {
  "moon-delay": {
    id: "moon-delay",
    label: "Earth-Moon Signal Time (~1.28 s)",
    text: "Radio signals travel at the speed of light, taking about 1.28 seconds one-way between Earth and the Moon.",
    sourceName: "NASA Space Communications and Navigation (SCaN)",
    sourceUrl: "https://www.nasa.gov/directorates/somd/space-communications-navigation-program/",
    status: "verified",
  },
  "mars-delay": {
    id: "mars-delay",
    label: "Earth-Mars Signal Delay (3 to 22 min)",
    text: "One-way radio signals between Earth and Mars take roughly 3 to 22 minutes depending on where the two planets sit in orbit.",
    sourceName: "NASA Mars Exploration Program - Communications",
    sourceUrl: "https://science.nasa.gov/mars/",
    status: "verified",
  },
  "lunar-night": {
    id: "lunar-night",
    label: "14-Earth-Day Lunar Night",
    text: "Away from the lunar poles, daylight and darkness on the Moon each last about 14 Earth days.",
    sourceName: "NASA Science - Weather on the Moon",
    sourceUrl: "https://science.nasa.gov/moon/weather-on-the-moon/",
    status: "verified",
  },
  "shackleton-sun": {
    id: "shackleton-sun",
    label: "South Pole Sunlit Ridges & Cold Traps",
    text: "High peaks near Shackleton Crater receive near-continuous sunlight, while permanently shadowed crater floors trap water ice.",
    sourceName: "NASA Science - Lunar Water & Artemis South Pole",
    sourceUrl: "https://science.nasa.gov/moon/lunar-water/",
    status: "verified",
  },
  "tranquillitatis-mare": {
    id: "tranquillitatis-mare",
    label: "Apollo 11 Basalt Mare Plain",
    text: "Mare Tranquillitatis is a broad volcanic basalt plain where Apollo 11 astronauts first landed in July 1969.",
    sourceName: "NASA Apollo 11 Mission Overview",
    sourceUrl: "https://science.nasa.gov/mission/apollo-11/",
    status: "verified",
  },
  "jezero-delta": {
    id: "jezero-delta",
    label: "Jezero Ancient River Delta",
    text: "Jezero Crater preserves a 45-kilometer ancient lake basin and fan-shaped river delta explored by Perseverance.",
    sourceName: "NASA Mars 2020 Perseverance Landing Site",
    sourceUrl: "https://science.nasa.gov/mission/mars-2020-perseverance/landing-site/",
    status: "verified",
  },
  "gale-mount-sharp": {
    id: "gale-mount-sharp",
    label: "Gale Crater & Mount Sharp Layers",
    text: "Gale Crater contains Mount Sharp, a 5.5-kilometer layered mountain recording ancient Martian climate shifts.",
    sourceName: "NASA Mars Science Laboratory (Curiosity)",
    sourceUrl: "https://science.nasa.gov/mission/msl-curiosity/location/",
    status: "verified",
  },
  "mars-sunlight": {
    id: "mars-sunlight",
    label: "Reduced Solar Intensity at Mars",
    text: "Mars orbits about 1.5 times farther from the Sun than Earth, receiving roughly 43% of Earth-Moon solar intensity.",
    sourceName: "NASA Mars Factsheet",
    sourceUrl: "https://science.nasa.gov/mars/facts/",
    status: "verified",
  },
};

export function getFact(id: string): CitedFact {
  const fact = FACTS[id];
  if (!fact) {
    throw new Error(`Unknown fact id: ${id}`);
  }
  return fact;
}
