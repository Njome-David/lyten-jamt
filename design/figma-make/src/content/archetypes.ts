import type { Archetype, OptionStyle } from "../engine/types";

export interface ArchetypeMeta {
  id: Archetype;
  name: string;
  environmentLabel: "Surface EVA (Outdoor)" | "Pressurized Cabin (Indoor)";
  summary: string;
  optionLabels: Record<OptionStyle, { title: string; subtitle: string }>;
}

export const ARCHETYPES: Record<Archetype, ArchetypeMeta> = {
  travel: {
    id: "travel",
    name: "Surface Traverse",
    environmentLabel: "Surface EVA (Outdoor)",
    summary: "Drive or hike across craters and rocky regolith to reach the work zone.",
    optionLabels: {
      fast: {
        title: "Full-Throttle Rover Push",
        subtitle: "High battery draw, saves breathing time",
      },
      balanced: {
        title: "Steady Waypoint Cruise",
        subtitle: "Balanced power, air, and wheel safety",
      },
      careful: {
        title: "Slow Hazard-Scan Crawl",
        subtitle: "Low power draw, uses extra air and food",
      },
    },
  },
  deploy: {
    id: "deploy",
    name: "Hardware Deployment",
    environmentLabel: "Surface EVA (Outdoor)",
    summary: "Unpack, level, and anchor mission instruments on the planetary surface.",
    optionLabels: {
      fast: { title: "Rapid Power-Winch Setup", subtitle: "Quick lock-in, heavier tool drain" },
      balanced: {
        title: "Standard Checklist Rig",
        subtitle: "Steady pace and moderate power cost",
      },
      careful: { title: "Double-Checked Alignment", subtitle: "Saves battery, longer suit time" },
    },
  },
  drill: {
    id: "drill",
    name: "Core Drilling",
    environmentLabel: "Surface EVA (Outdoor)",
    summary: "Bore into compacted rock and icy soil without jamming the rotary bit.",
    optionLabels: {
      fast: { title: "High-Torque Deep Bore", subtitle: "Heavy power cost, higher jam risk" },
      balanced: {
        title: "Pulsed Core Extraction",
        subtitle: "Balanced torque and steady progress",
      },
      careful: { title: "Gentle Step-Bit Coring", subtitle: "Protects drill bit, takes more air" },
    },
  },
  experiment: {
    id: "experiment",
    name: "Lab Analysis",
    environmentLabel: "Pressurized Cabin (Indoor)",
    summary: "Run sensors, spectrometers, and growth chambers inside the habitat.",
    optionLabels: {
      fast: { title: "Parallel High-Watt Scan", subtitle: "Fast results, spikes lab power" },
      balanced: { title: "Standard Assay Cycle", subtitle: "Balanced lab energy and crew time" },
      careful: { title: "Low-Power Calibration", subtitle: "Conserves power, uses extra rations" },
    },
  },
  repair: {
    id: "repair",
    name: "System Maintenance",
    environmentLabel: "Pressurized Cabin (Indoor)",
    summary: "Clean dust seals, rebalance power buses, and tune life-support filters.",
    optionLabels: {
      fast: { title: "Hot-Swap Module Fix", subtitle: "Uses diagnostic power, quick turnaround" },
      balanced: {
        title: "Scheduled Bench Tune-Up",
        subtitle: "Reliable maintenance and normal air use",
      },
      careful: { title: "Manual Seal Inspection", subtitle: "Minimal power, longer crew shift" },
    },
  },
  uplink: {
    id: "uplink",
    name: "Deep-Space Uplink",
    environmentLabel: "Pressurized Cabin (Indoor)",
    summary: "Beam verified science packets and crew telemetry back to Earth stations.",
    optionLabels: {
      fast: { title: "High-Gain Burst Beam", subtitle: "Strong amplifier draw, rapid send" },
      balanced: { title: "Standard Telemetry Pass", subtitle: "Clean signal and moderate power" },
      careful: { title: "Compressed Low-Gain Send", subtitle: "Tiny power draw, slower window" },
    },
  },
};
