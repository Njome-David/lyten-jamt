// src/judge/useJudgeMode.ts
// Hook managing Judge Mode state, detection from URL query (?judge=1), and keyboard triggers.

import { useState, useEffect, useCallback } from 'react';
import type { JudgeState } from './types';
import type { ForcedEventKind } from '../engine/types';

export function isJudgeModeRequested(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('judge') === '1' || params.get('judge') === 'true';
  } catch {
    return false;
  }
}

export function useJudgeMode() {
  const [state, setState] = useState<JudgeState>(() => ({
    enabled: isJudgeModeRequested(),
    isCollapsed: false,
    shortRun: true, // Default to short run (3 steps) for judges
    solarMode: 'recent',
    speed: 1,
    forcedEvent: null,
    isScienceMapOpen: false,
    demoProfileActive: false,
  }));

  // Auto-enable if URL has ?judge=1
  useEffect(() => {
    if (isJudgeModeRequested()) {
      setState((prev) => ({ ...prev, enabled: true }));
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setState((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const toggleCollapsed = useCallback(() => {
    setState((prev) => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  }, []);

  const setShortRun = useCallback((shortRun: boolean) => {
    setState((prev) => ({ ...prev, shortRun }));
  }, []);

  const setSolarMode = useCallback((solarMode: 'recent' | 'may2024') => {
    setState((prev) => ({ ...prev, solarMode }));
  }, []);

  const setSpeed = useCallback((speed: 1 | 2 | 3) => {
    setState((prev) => ({ ...prev, speed }));
  }, []);

  const setForcedEvent = useCallback((forcedEvent: ForcedEventKind | null) => {
    setState((prev) => ({ ...prev, forcedEvent }));
  }, []);

  const setIsScienceMapOpen = useCallback((isScienceMapOpen: boolean) => {
    setState((prev) => ({ ...prev, isScienceMapOpen }));
  }, []);

  const setDemoProfileActive = useCallback((demoProfileActive: boolean) => {
    setState((prev) => ({ ...prev, demoProfileActive }));
  }, []);

  return {
    state,
    toggleEnabled,
    toggleCollapsed,
    setShortRun,
    setSolarMode,
    setSpeed,
    setForcedEvent,
    setIsScienceMapOpen,
    setDemoProfileActive,
  };
}

export default useJudgeMode;
