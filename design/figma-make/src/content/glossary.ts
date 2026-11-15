export interface GlossaryEntry {
  id: string;
  term: string;
  shortDef: string;
  kidExample: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "sol",
    term: "Sol",
    shortDef: "One full day on Mars — about 24 hours and 39 minutes.",
    kidExample: "A Martian sol is just 39 minutes longer than a day on Earth.",
  },
  {
    id: "radiation-dose",
    term: "Radiation Dose",
    shortDef: "Invisible high-energy particles from the Sun and deep space absorbed by the crew.",
    kidExample: "Thick shielding and storm shelters block radiation like sunscreen blocks UV rays.",
  },
  {
    id: "latency",
    term: "Signal Latency",
    shortDef: "The time a radio message takes to travel through space at light speed.",
    kidExample: "Moon messages take 1.3 seconds; Mars messages can take up to 22 minutes!",
  },
  {
    id: "solar-flare",
    term: "Solar Flare",
    shortDef: "A sudden burst of energy and X-rays erupting from magnetic spots on the Sun.",
    kidExample: "NASA classes flares from mild C-class to medium M-class and giant X-class storms.",
  },
  {
    id: "regolith",
    term: "Regolith",
    shortDef: "The blanket of crushed rock, pebbles, and sharp dust covering the Moon and Mars.",
    kidExample: "Moon regolith clings to spacesuits like static-charged flour.",
  },
  {
    id: "microgravity",
    term: "Reduced Gravity",
    shortDef: "Weaker gravity than Earth — 1/6th on the Moon and about 3/8ths on Mars.",
    kidExample: "Plants use light and water cues to guide roots when gravity is weaker.",
  },
];
