export type MayaMood = "wave" | "excited" | "focused" | "alert" | "proud";

export type MayaMomentId =
  | "intro_tour"
  | "first_world_select"
  | "first_loadout"
  | "first_mission_step"
  | "first_lunar_night"
  | "first_mars_delay"
  | "first_hydro_harvest"
  | "first_solar_flare"
  | "first_dust_storm";

export interface MayaLine {
  mood: MayaMood;
  speakerTitle?: string;
  text: string;
}

export const MAYA_MOMENTS: Record<MayaMomentId, MayaLine[]> = {
  intro_tour: [
    {
      mood: "wave",
      speakerTitle: "Maya · Junior Outpost Tutor",
      text: "Hey Commander! I'm Maya, your flight buddy on the station. Welcome to your very own deep-space outpost!",
    },
    {
      mood: "excited",
      text: "Out here, you're in charge of real Moon and Mars expeditions. Every choice has a trade-off—rushing burns battery fast, while going slow uses extra air and food.",
    },
    {
      mood: "focused",
      text: "Hit 'Play Expedition' whenever you're ready! I'll step aside so you have a clear view, and only pop in on comms when something brand-new happens.",
    },
  ],
  first_world_select: [
    {
      mood: "excited",
      text: "Pick your world! The Moon is close enough for instant Earth radio, while Mars has swirling dust storms and minutes-long signal delays.",
    },
  ],
  first_loadout: [
    {
      mood: "wave",
      text: "Welcome to your landing pad! You have 10 supply points—try swapping Solar Panels, Batteries, or the Greenhouse and watch your 3D base change live!",
    },
  ],
  first_mission_step: [
    {
      mood: "focused",
      text: "Top bar tracks Power, Air, Health, and Food. Choose Fast, Steady, or Careful below—then watch your crew carry out the job in real time!",
    },
  ],
  first_lunar_night: [
    {
      mood: "alert",
      text: "Heads up! The 14-day lunar night just swept over the plain—our solar wings make zero power in the dark, so conserve battery!",
    },
  ],
  first_mars_delay: [
    {
      mood: "focused",
      text: "Radio ping sent! Because Mars is millions of kilometers away, Houston's advice takes a couple turns to travel across space.",
    },
  ],
  first_hydro_harvest: [
    {
      mood: "proud",
      text: "Look at the greenhouse dome! Our space lettuce sprouted—it'll add fresh food back to crew supplies every turn from now on!",
    },
  ],
  first_solar_flare: [
    {
      mood: "alert",
      text: "Whoa—solar storm alarm! That flare was recorded by real NASA satellites. Boost shields or shelter the crew before radiation spikes!",
    },
  ],
  first_dust_storm: [
    {
      mood: "alert",
      text: "Martian dust squall incoming! Blowing red grit blocks sunlight and can scratch our panels—make your call before the timer hits zero!",
    },
  ],
};
