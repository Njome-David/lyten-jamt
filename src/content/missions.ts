// src/content/missions.ts
// Mission definitions and data for relay missions (Moon Relay and Mars Relay).
// Follows SPEC.md section 5.1 and docs/fr/02-roadmap.md (T07).

import type { Body, MissionTemplateId } from '../engine/types';
import { validateMission, type Mission } from './schema';

/**
 * Validated mission entries for relay missions on Moon and Mars.
 */
export const MISSIONS: Record<string, Mission> = {
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
