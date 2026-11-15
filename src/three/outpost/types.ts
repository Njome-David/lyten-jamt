// Types for the Outpost kit component. No external dependencies.
import type { SiteId } from '../../engine/types';

/** Props for the OutpostKit component */
export interface OutpostKitProps {
  /** The site where the outpost is placed (moon or mars) */
  site: SiteId;
}
