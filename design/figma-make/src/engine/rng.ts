export type RngFn = () => number;

export function mulberry32(seed: number): RngFn {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickWeighted<T>(rng: RngFn, items: ReadonlyArray<{ item: T; weight: number }>): T {
  const valid = items.filter((entry) => entry.weight > 0);
  if (valid.length === 0) {
    throw new Error("pickWeighted called with no positive weights");
  }
  const total = valid.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;
  for (const entry of valid) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.item;
    }
  }
  return valid[valid.length - 1].item;
}
