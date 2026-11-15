export type RobotExpression = "neutral" | "happy" | "worried" | "alert" | "thinking";

export interface GuideMessage {
  expression: RobotExpression;
  text: string; // Strictly <= 12 words per SPEC.md Rule 9
}

// Every line verified <= 12 words, grade 3-6, never blames the player
export const GUIDE_LINES: Record<string, GuideMessage> = {
  welcome: {
    expression: "happy",
    text: "Welcome aboard! Pick a world and plan your expedition trade-offs.",
  },
  destination: {
    expression: "thinking",
    text: "Moon signals arrive fast. Mars brings dust storms and radio delays!",
  },
  missions: {
    expression: "neutral",
    text: "Every expedition has six steps. Moon Relay is great first!",
  },
  sites: {
    expression: "thinking",
    text: "Each landing site changes sunlight and terrain power costs.",
  },
  difficulty: {
    expression: "neutral",
    text: "Higher difficulty raises resource drain, storm chance, and Mars delay.",
  },
  loadoutHint: {
    expression: "thinking",
    text: "Ten budget points force trade-offs. Every choice helps and costs!",
  },
  loadoutHydroponics: {
    expression: "thinking",
    text: "Hydroponics costs extra power early, then grows fresh food!",
  },
  missionStart: {
    expression: "happy",
    text: "Systems green! Hover each tactic to preview meter changes.",
  },
  stepNominal: {
    expression: "neutral",
    text: "Watch all four meters. Fast burns power; Careful uses air.",
  },
  lunarNight: {
    expression: "worried",
    text: "Lunar night started! Solar panels make zero power right now.",
  },
  lowPower: {
    expression: "worried",
    text: "Power is critical! Avoid Fast tactics until reserves recover.",
  },
  lowAir: {
    expression: "worried",
    text: "Air reserves are low! Faster steps save crew breathing time.",
  },
  lowFood: {
    expression: "worried",
    text: "Food is running low! Watch crew consumption on slow steps.",
  },
  lowHealth: {
    expression: "worried",
    text: "Crew health dropped! Shield against radiation on outdoor steps.",
  },
  alertFlare: {
    expression: "alert",
    text: "Real NASA solar flare detected! Protect crew health or power!",
  },
  alertDust: {
    expression: "alert",
    text: "Martian dust squall incoming! Decide how to protect solar panels.",
  },
  alertFault: {
    expression: "worried",
    text: "Hardware fault chime! Choose repair, quick patch, or manual push.",
  },
  delayExplain: {
    expression: "thinking",
    text: "Mars radio signals travel millions of kilometers before arriving!",
  },
  alertDelayNotice: {
    expression: "alert",
    text: "Earth is too far! Decide before the storm timer ends.",
  },
  win: {
    expression: "happy",
    text: "Mission accomplished! Smart engineering trade-offs kept the crew safe.",
  },
  "lose-air": {
    expression: "thinking",
    text: "Cabin oxygen ran empty from crew breathing across long steps.",
  },
  "lose-food": {
    expression: "thinking",
    text: "Food stores ran out before the final uplink completed.",
  },
  "lose-health": {
    expression: "thinking",
    text: "Space radiation and system strain overwhelmed suit protection.",
  },
  "lose-power": {
    expression: "thinking",
    text: "Batteries stayed empty two turns, halting cabin heaters.",
  },
};

export const MISSION_CONTROL_HINTS: string[] = [
  "Flight Control: Keep Power above 25 before outdoor drill or travel steps.",
  "Flight Control: Fast saves Air and Food when life support dips low.",
  "Flight Control: Careful saves battery during lunar night or dust storms.",
  "Flight Control: Sheltering during flares trades one turn for crew health.",
];
