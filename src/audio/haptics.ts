// src/audio/haptics.ts
// Vibration haptics using navigator.vibrate when available.
// Conforms to PRESENTATION.md section 6 and DESIGN.md section 6.

import type { HapticPattern } from './types';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  button: 10,
  tick: 15,
  alert: [100, 50, 100],
  success: [50, 50, 50],
};

/**
 * Triggers a haptic vibration pattern if supported by the browser / mobile device.
 * Gracefully no-ops in desktop, unsupported browsers, or SSR.
 */
export function triggerHaptic(pattern: HapticPattern, enabled: boolean = true): boolean {
  if (!enabled) return false;
  if (typeof navigator === 'undefined') {
    return false;
  }

  try {
    if (typeof navigator.vibrate === 'function') {
      const vibrationData = HAPTIC_PATTERNS[pattern];
      return navigator.vibrate(vibrationData);
    }
  } catch {
    // Graceful fallback for sandboxed iframes or permission errors
  }

  return false;
}
