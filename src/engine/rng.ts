/**
 * Mulberry32 32-bit deterministic PRNG.
 * Pure TypeScript (no Math.random, Date, window, document).
 */

export type RngFn = () => number;

export function mulberry32(seed: number): RngFn {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a pseudo-random integer between min and max inclusive using the provided RNG.
 */
export function randInt(rng: RngFn, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Returns a pseudo-random float between min and max using the provided RNG.
 */
export function randFloat(rng: RngFn, min: number, max: number): number {
  return min + rng() * (max - min);
}

/**
 * Picks an item randomly from an array using the provided RNG.
 */
export function randChoice<T>(rng: RngFn, array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  const idx = Math.floor(rng() * array.length);
  return array[idx];
}
