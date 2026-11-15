// src/three/outpost/types.ts
import type { SiteId } from '../../engine/types';

export interface OutpostKitProps {
  /** The site identifier (moon or mars) */
  site?: SiteId;
  /** Position offset of the outpost [x, y, z] */
  position?: [number, number, number];
  /** Global scale factor */
  scale?: number;
  /** Whether the outpost structures are fully deployed */
  deployed?: boolean;
  /** Progress of deployment animation if currently deploying [0, 1] */
  deployProgress?: number;
  /** Level of detail/quality */
  quality?: 'high' | 'low';
}
