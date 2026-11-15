// src/content/missions.ts
// Mission definitions and data for lunar and martian outpost missions.
// Follows SPEC.md section 5.1 and docs/fr/02-roadmap.md (T07, T17).

import type { Body, MissionTemplateId } from '../engine/types';
import { validateMission, type Mission } from './schema';

/**
 * Validated mission entries for Moon and Mars missions.
 */
export const MISSIONS: Record<string, Mission> = {
  // =========================================================================
  // Moon Missions (5 complete missions - T17)
  // =========================================================================
  'moon-relay': validateMission({
    id: 'moon-relay',
    templateId: 'relay',
    body: 'moon',
    title: 'Moon Relay',
    objective:
      'Deploy a high-gain radio antenna on the lunar surface to establish reliable direct communications with Earth.',
    whyItMatters:
      'Lunar outposts cannot survive without continuous direct communication relays to Mission Control on Earth.',
    enabled: true,
    steps: [
      {
        stepIndex: 1,
        archetype: 'travel',
        title: 'Drive to High Ridge',
        text: 'Drive the lunar rover across Shackleton rim to the highest ridge with a clear line of sight to Earth.',
      },
      {
        stepIndex: 2,
        archetype: 'deploy',
        title: 'Anchor Tripod Mount',
        text: 'Drill anchoring spikes into hard basalt regolith to secure the heavy communications mast against moonquakes.',
      },
      {
        stepIndex: 3,
        archetype: 'deploy',
        title: 'Erect Parabolic Dish',
        text: 'Unfold the high-gain reflective mesh dish and lock the solar-powered tracking motors into position.',
      },
      {
        stepIndex: 4,
        archetype: 'repair',
        title: 'Fix Cable Harness',
        text: 'Inspect wiring damaged by abrasive lunar dust and seal the connection with thermal insulation tape.',
      },
      {
        stepIndex: 5,
        archetype: 'uplink',
        title: 'Calibrate Carrier Signal',
        text: 'Tune transmitter frequency and aim the dish directly toward NASA Deep Space Network antennas on Earth.',
      },
      {
        stepIndex: 6,
        archetype: 'uplink',
        title: 'Verify Full Data Stream',
        text: 'Send test science packets and confirm stable two-way data telemetry with Mission Control in Houston.',
      },
    ],
  }),

  'moon-core': validateMission({
    id: 'moon-core',
    templateId: 'core',
    body: 'moon',
    title: 'Deep Core Samples',
    objective:
      'Drill deep into the lunar crust to collect ancient pristine core samples revealing solar system history.',
    whyItMatters:
      'Deep regolith preserves billions of years of solar wind and cosmic ray history untouched by weather.',
    enabled: true,
    steps: [
      {
        stepIndex: 1,
        archetype: 'travel',
        title: 'Travel to Ancient Crater',
        text: 'Drive the heavy science rover into a shadowed depression where billions of years of impacts accumulated.',
      },
      {
        stepIndex: 2,
        archetype: 'drill',
        title: 'Set Deep Drill Rig',
        text: 'Stabilize hydraulic drill legs on uneven rock and power up the tungsten-carbide rotary cutting head.',
      },
      {
        stepIndex: 3,
        archetype: 'drill',
        title: 'Extract Two-Meter Core',
        text: 'Bore two meters beneath the regolith and carefully withdraw sealed titanium tubes holding stratified lunar rock.',
      },
      {
        stepIndex: 4,
        archetype: 'experiment',
        title: 'X-Ray Spectrometry',
        text: 'Insert sample tubes into the rover spectrometer to analyze mineral composition and detect trapped volatile gases.',
      },
      {
        stepIndex: 5,
        archetype: 'repair',
        title: 'Replace Overheated Bit',
        text: 'Clean abrasive regolith grit from the chuck and swap out the overheated diamond bit.',
      },
      {
        stepIndex: 6,
        archetype: 'uplink',
        title: 'Beam Geology Telemetry',
        text: 'Transmit mineral analysis results and core tomography scans directly to scientists waiting in Houston.',
      },
    ],
  }),

  'moon-seismic': validateMission({
    id: 'moon-seismic',
    templateId: 'seismic',
    body: 'moon',
    title: 'Moonquake Station',
    objective:
      'Install passive seismometers on the Moon to detect shallow moonquakes and map lunar interior layers.',
    whyItMatters:
      'Moonquakes can last over ten minutes; studying them keeps human lunar habitats safe from structural damage.',
    enabled: true,
    steps: [
      {
        stepIndex: 1,
        archetype: 'travel',
        title: 'Scout Stable Plateau',
        text: 'Navigate the rover over boulder fields to find solid, un-fractured bedrock away from steep slopes.',
      },
      {
        stepIndex: 2,
        archetype: 'deploy',
        title: 'Plant Seismometer Sensor',
        text: 'Place the ultra-sensitive broadband seismometer on bedrock and cover it with a thermal vacuum shield.',
      },
      {
        stepIndex: 3,
        archetype: 'repair',
        title: 'Fix Thermal Sensor Wire',
        text: 'Reconnect a loose thermocouple cable to ensure sensor temperature remains stable during the lunar night.',
      },
      {
        stepIndex: 4,
        archetype: 'experiment',
        title: 'Calibrate Noise Floor',
        text: 'Record baseline vibrations from micrometeorite impacts and thermal expansion of surrounding rocks.',
      },
      {
        stepIndex: 5,
        archetype: 'experiment',
        title: 'Detect Deep Lunar Tremor',
        text: 'Capture seismic wave reverberations from a deep tidal moonquake to sound the lunar mantle.',
      },
      {
        stepIndex: 6,
        archetype: 'uplink',
        title: 'Transmit Seismic Log',
        text: 'Send continuous ground motion wave data to the international lunar seismic research network.',
      },
    ],
  }),

  'moon-mapper': validateMission({
    id: 'moon-mapper',
    templateId: 'mapper',
    body: 'moon',
    title: 'Moon Ice Mapper',
    objective:
      'Map permanently shadowed craters to locate buried water ice deposits for future astronaut drinking water.',
    whyItMatters:
      'Lunar water ice can be processed into life-support oxygen, drinking water, and liquid hydrogen rocket propellant.',
    enabled: true,
    steps: [
      {
        stepIndex: 1,
        archetype: 'deploy',
        title: 'Unpack Neutron Detector',
        text: 'Mount the active neutron spectrometer onto the front bumper of the robotic exploration rover.',
      },
      {
        stepIndex: 2,
        archetype: 'travel',
        title: 'Descend Crater Ridge',
        text: 'Carefully steer the rover down treacherous twenty-degree scree slopes into permanent darkness.',
      },
      {
        stepIndex: 3,
        archetype: 'experiment',
        title: 'Pulse Subsurface Radar',
        text: 'Fire neutron pulses into frozen soil to measure hydrogen concentration beneath the surface dust.',
      },
      {
        stepIndex: 4,
        archetype: 'travel',
        title: 'Cross Cold Trap Basin',
        text: 'Traverse the freezing crater floor with headlights, avoiding jagged boulders and hidden drop-offs.',
      },
      {
        stepIndex: 5,
        archetype: 'experiment',
        title: 'Analyze Volatile Ice',
        text: 'Confirm high-purity water ice crystals mixed with frozen carbon dioxide in the coldest shadows.',
      },
      {
        stepIndex: 6,
        archetype: 'uplink',
        title: 'Broadcast Ice Map',
        text: 'Transmit high-resolution subterranean water ice contour maps to orbital relays and Artemis base camp.',
      },
    ],
  }),

  'moon-garden': validateMission({
    id: 'moon-garden',
    templateId: 'garden',
    body: 'moon',
    title: 'Moon Garden',
    objective:
      'Grow Arabidopsis seedlings in a lunar greenhouse to test fractional gravity effects on plant roots.',
    whyItMatters:
      'Sustainable long-term space bases depend on growing fresh food and recycling carbon dioxide using plants.',
    enabled: true,
    osdrStudyId: 'OSD-251',
    steps: [
      {
        stepIndex: 1,
        archetype: 'deploy',
        title: 'Pressurize Growth Tent',
        text: 'Seal the growth tent, fill nutrient tanks, and set atmospheric pressure to comfortable plant levels.',
      },
      {
        stepIndex: 2,
        archetype: 'repair',
        title: 'Clear LED Lamp Circuit',
        text: 'Fix a tripped circuit breaker powering the red and blue growth spectrum LED illumination panels.',
      },
      {
        stepIndex: 3,
        archetype: 'experiment',
        title: 'Germinate Seeds',
        text: 'Inject aerated water into seed agar plugs to trigger sprouting of Arabidopsis thaliana seeds.',
      },
      {
        stepIndex: 4,
        archetype: 'experiment',
        title: 'Track Root Skewing',
        text: 'Record microscopic camera images of root gravitropism response under one-sixth Earth lunar gravity.',
      },
      {
        stepIndex: 5,
        archetype: 'repair',
        title: 'Flush Algae Clog',
        text: 'Disassemble clogged hydroponic nutrient delivery lines and sterilize filters with ultraviolet light.',
      },
      {
        stepIndex: 6,
        archetype: 'uplink',
        title: 'Upload Botanical Data',
        text: 'Transmit plant growth time-lapse imagery and root gene expression telemetry to OSDR scientists.',
      },
    ],
  }),

  // =========================================================================
  // Mars Missions (Relay established in T07)
  // =========================================================================
  'mars-relay': validateMission({
    id: 'mars-relay',
    templateId: 'relay',
    body: 'mars',
    title: 'Mars Relay',
    objective:
      'Set up the deep space communication relay array to bridge the long radio delay between Mars and Earth.',
    whyItMatters:
      'Mars communication signals take up to 22 minutes each way, making automated relay antennas essential.',
    enabled: true,
    steps: [
      {
        stepIndex: 1,
        archetype: 'travel',
        title: 'Cross Jezero Dunes',
        text: 'Navigate the pressurized rover around dangerous sand dunes toward the rocky delta plateau.',
      },
      {
        stepIndex: 2,
        archetype: 'deploy',
        title: 'Erect Antenna Mast',
        text: 'Raise the telescoping carbon-fiber antenna mast and secure guide cables against strong Martian gusts.',
      },
      {
        stepIndex: 3,
        archetype: 'deploy',
        title: 'Connect Solar Array',
        text: 'Deploy secondary photovoltaic panels to keep the relay powered even during regional dust storms.',
      },
      {
        stepIndex: 4,
        archetype: 'repair',
        title: 'Clear Sand from Gears',
        text: 'Dust devils fouled the motor bearings; blow out fine red dust and lubricate the rotor.',
      },
      {
        stepIndex: 5,
        archetype: 'uplink',
        title: 'Lock Orbiting Relay',
        text: 'Ping the Mars Reconnaissance Orbiter overhead to route telemetry through deep space relays.',
      },
      {
        stepIndex: 6,
        archetype: 'uplink',
        title: 'First Transmission',
        text: 'Transmit weather logs and habitat telemetry back to Earth through the Deep Space Network.',
      },
    ],
  }),
};

/**
 * Retrieve a mission by celestial body and template id.
 */
export function getMission(body: Body, templateId: MissionTemplateId): Mission | undefined {
  const key = `${body}-${templateId}`;
  return MISSIONS[key];
}

/**
 * Return all enabled missions, optionally filtered by body.
 */
export function getEnabledMissions(body?: Body): Mission[] {
  return Object.values(MISSIONS).filter((m) => m.enabled && (body === undefined || m.body === body));
}

export const missions = MISSIONS;
