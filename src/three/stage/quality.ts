/**
 * 3D Stage Quality detection and configurations.
 * Handles WebGL capabilities, device constraints, and accessibility preferences.
 */

export type QualityLevel = 'high' | 'low' | 'fallback2d';

export interface QualityConfig {
  level: QualityLevel;
  shadows: boolean;
  dpr: number;
  particlesCount: number;
  terrainSubdivisions: number;
  reducedMotion: boolean;
}

export interface QualityDetectOptions {
  forceLevel?: QualityLevel;
  testContext?: boolean; // Set false in test runners without WebGL mocks
}

/**
 * Checks if the current environment supports WebGL rendering.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Checks if the user prefers reduced motion.
 */
export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detects the recommended quality tier based on device specifications and WebGL support.
 */
export function detectQuality(options: QualityDetectOptions = {}): QualityLevel {
  if (options.forceLevel) {
    return options.forceLevel;
  }

  // SSR or non-browser environment defaults to fallback2d
  if (typeof window === 'undefined') {
    return 'fallback2d';
  }

  if (options.testContext !== false && !isWebGLAvailable()) {
    return 'fallback2d';
  }

  // Hardware heuristics
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;

  // Low hardware constraints
  if (cores < 4 || memory < 4) {
    return 'low';
  }

  return 'high';
}

/**
 * Returns complete rendering configuration for a given quality level.
 */
export function getQualityConfig(
  level: QualityLevel,
  reducedMotion: boolean = false
): QualityConfig {
  if (level === 'fallback2d') {
    return {
      level: 'fallback2d',
      shadows: false,
      dpr: 1,
      particlesCount: 0,
      terrainSubdivisions: 16,
      reducedMotion,
    };
  }

  if (level === 'low') {
    return {
      level: 'low',
      shadows: false,
      dpr: 1,
      particlesCount: 150,
      terrainSubdivisions: 32,
      reducedMotion,
    };
  }

  return {
    level: 'high',
    shadows: true,
    dpr: 1.5,
    particlesCount: 500,
    terrainSubdivisions: 64,
    reducedMotion,
  };
}
