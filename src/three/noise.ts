/**
 * Procedural seeded noise generator for lunar and martian terrain.
 * Pure TypeScript, zero external libraries.
 */

export interface NoiseGenerator {
  noise2D(x: number, y: number): number; // Returns -1 .. 1
  fbm2D(x: number, y: number, octaves?: number, persistence?: number, lacunarity?: number): number; // Returns -1 .. 1
}

export interface Crater {
  x: number;
  z: number;
  radius: number;
  depth: number;
  rimHeight: number;
}

export interface TerrainNoiseOptions {
  seed: number;
  scale?: number;
  octaves?: number;
  persistence?: number;
  lacunarity?: number;
  heightScale?: number;
  craters?: Crater[];
}

/**
 * Creates a deterministic 32-bit hash function from a seed.
 * Uses Murmur/xxHash style integer mixing.
 */
function createHash2D(seed: number) {
  const s = (seed | 0) ^ 0x9e3779b9;
  return function hash2D(ix: number, iy: number): number {
    let h = s ^ (ix * 374761393 + iy * 668265263);
    h = (h ^ (h >>> 13)) * 1274126177;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296; // 0 .. 1
  };
}

/**
 * Quintic fade curve (smootherstep: 6t^5 - 15t^4 + 10t^3).
 */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Linear interpolation.
 */
function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/**
 * Creates a seedable 2D value noise generator.
 */
export function createNoise2D(seed: number = 42): NoiseGenerator {
  const hash = createHash2D(seed);

  function noise2D(x: number, y: number): number {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = x0 + 1;
    const y1 = y0 + 1;

    const tx = x - x0;
    const ty = y - y0;

    const fx = fade(tx);
    const fy = fade(ty);

    const v00 = hash(x0, y0);
    const v10 = hash(x1, y0);
    const v01 = hash(x0, y1);
    const v11 = hash(x1, y1);

    const nx0 = lerp(v00, v10, fx);
    const nx1 = lerp(v01, v11, fx);

    // Map 0..1 to -1..1
    return lerp(nx0, nx1, fy) * 2 - 1;
  }

  function fbm2D(
    x: number,
    y: number,
    octaves: number = 4,
    persistence: number = 0.5,
    lacunarity: number = 2.0
  ): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }

  return { noise2D, fbm2D };
}

/**
 * Computes crater displacement at point (x, z).
 * Includes depression and raised rim.
 */
export function computeCraterElevation(x: number, z: number, crater: Crater): number {
  const dx = x - crater.x;
  const dz = z - crater.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  const rNorm = dist / crater.radius;

  if (rNorm >= 2.0) return 0;

  if (rNorm < 1.0) {
    // Bowl-shaped depression
    const depthProfile = Math.cos(rNorm * (Math.PI / 2));
    const depression = -crater.depth * depthProfile;
    // Slight rim contribution near border
    const rim = crater.rimHeight * Math.sin(rNorm * Math.PI);
    return depression + rim;
  }

  // Raised rim falloff outside crater radius (1.0 .. 2.0)
  const rimT = (rNorm - 1.0); // 0 .. 1
  const falloff = (1 - rimT) * (1 - rimT);
  return crater.rimHeight * falloff;
}

/**
 * Generates sample craters based on a seed and bounding region.
 */
export function generateSampleCraters(
  seed: number,
  count: number = 5,
  minRadius: number = 3,
  maxRadius: number = 8,
  bounds: number = 25
): Crater[] {
  const craters: Crater[] = [];
  const rng = createHash2D(seed);

  for (let i = 0; i < count; i++) {
    const rx = rng(i * 4, 1) * 2 - 1;
    const rz = rng(i * 4 + 1, 2) * 2 - 1;
    const rr = rng(i * 4 + 2, 3);
    const rd = rng(i * 4 + 3, 4);

    const radius = minRadius + rr * (maxRadius - minRadius);
    const depth = 0.5 + rd * 1.5;
    const rimHeight = depth * 0.25;

    craters.push({
      x: rx * bounds,
      z: rz * bounds,
      radius,
      depth,
      rimHeight,
    });
  }

  return craters;
}

/**
 * Calculates elevation at coordinate (x, z) using fbm noise and craters.
 */
export function getTerrainHeight(x: number, z: number, options: TerrainNoiseOptions): number {
  const scale = options.scale ?? 0.05;
  const octaves = options.octaves ?? 4;
  const persistence = options.persistence ?? 0.5;
  const lacunarity = options.lacunarity ?? 2.0;
  const heightScale = options.heightScale ?? 3.0;

  const generator = createNoise2D(options.seed);
  const baseNoise = generator.fbm2D(x * scale, z * scale, octaves, persistence, lacunarity);
  let elevation = baseNoise * heightScale;

  if (options.craters && options.craters.length > 0) {
    for (const crater of options.craters) {
      elevation += computeCraterElevation(x, z, crater);
    }
  }

  return elevation;
}
