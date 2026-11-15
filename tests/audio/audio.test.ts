// tests/audio/audio.test.ts
// Unit tests for WebAudio sound synthesis, cosmic ambience, haptics, and AudioManager.
// Conforms to DESIGN.md section 6 and PRESENTATION.md section 6.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  synthesizeSfx,
  CosmicAmbience,
  triggerHaptic,
  audioManager,
  type SfxType,
  type HapticPattern,
} from '../../src/audio';

// Mock WebAudio infrastructure for Node.js / headless test runner
class MockAudioParam {
  public value: number = 0;
  public setValueAtTime = vi.fn((val: number) => {
    this.value = val;
  });
  public linearRampToValueAtTime = vi.fn((val: number) => {
    this.value = val;
  });
  public exponentialRampToValueAtTime = vi.fn((val: number) => {
    this.value = val;
  });
}

class MockGainNode {
  public gain = new MockAudioParam();
  public connect = vi.fn();
  public disconnect = vi.fn();
}

class MockOscillatorNode {
  public type: OscillatorType = 'sine';
  public frequency = new MockAudioParam();
  public connect = vi.fn();
  public disconnect = vi.fn();
  public start = vi.fn();
  public stop = vi.fn();
}

class MockBiquadFilterNode {
  public type: BiquadFilterType = 'lowpass';
  public frequency = new MockAudioParam();
  public Q = new MockAudioParam();
  public connect = vi.fn();
  public disconnect = vi.fn();
}

class MockAudioContext {
  public currentTime: number = 0;
  public state: AudioContextState = 'running';
  public destination = {};

  public createGain(): GainNode {
    return new MockGainNode() as unknown as GainNode;
  }

  public createOscillator(): OscillatorNode {
    return new MockOscillatorNode() as unknown as OscillatorNode;
  }

  public createBiquadFilter(): BiquadFilterNode {
    return new MockBiquadFilterNode() as unknown as BiquadFilterNode;
  }

  public resume = vi.fn(async () => {
    this.state = 'running';
  });

  public suspend = vi.fn(async () => {
    this.state = 'suspended';
  });
}

describe('T25: WebAudio procedural sound synthesis (0 KB assets)', () => {
  let mockCtx: MockAudioContext;

  beforeEach(() => {
    mockCtx = new MockAudioContext();
  });

  const allSfx: SfxType[] = [
    'click',
    'confirm',
    'execute',
    'advice',
    'tick',
    'alert',
    'win',
    'lose',
    'heartbeat',
  ];

  allSfx.forEach((sfx) => {
    it(`synthesizes procedural SFX "${sfx}" without throwing`, () => {
      expect(() => {
        synthesizeSfx(mockCtx as unknown as AudioContext, sfx);
      }).not.toThrow();
    });
  });

  it('resumes suspended context when playing a sound', () => {
    mockCtx.state = 'suspended';
    synthesizeSfx(mockCtx as unknown as AudioContext, 'click');
    expect(mockCtx.resume).toHaveBeenCalled();
  });
});

describe('T25: Cosmic space ambience synthesizer', () => {
  let mockCtx: MockAudioContext;
  let ambience: CosmicAmbience;

  beforeEach(() => {
    mockCtx = new MockAudioContext();
    ambience = new CosmicAmbience(mockCtx as unknown as AudioContext);
  });

  it('starts ambient drone and sets playing state to true', () => {
    expect(ambience.isPlaying()).toBe(false);
    ambience.start(0.2);
    expect(ambience.isPlaying()).toBe(true);
  });

  it('stops ambient drone and resets state', () => {
    ambience.start();
    expect(ambience.isPlaying()).toBe(true);
    ambience.stop();
    expect(ambience.isPlaying()).toBe(false);
  });

  it('adjusts volume cleanly while running', () => {
    ambience.start();
    expect(() => ambience.setVolume(0.5)).not.toThrow();
    expect(() => ambience.setVolume(-1)).not.toThrow(); // clamps gracefully
    expect(() => ambience.setVolume(2)).not.toThrow();
  });
});

describe('T25: Haptics vibration support (navigator.vibrate)', () => {
  const patterns: HapticPattern[] = ['button', 'tick', 'alert', 'success'];

  beforeEach(() => {
    // Mock navigator
    vi.stubGlobal('navigator', {
      vibrate: vi.fn(() => true),
    });
  });

  patterns.forEach((pat) => {
    it(`triggers haptic pattern "${pat}" when enabled`, () => {
      const result = triggerHaptic(pat, true);
      expect(result).toBe(true);
      expect(navigator.vibrate).toHaveBeenCalled();
    });
  });

  it('does not trigger vibration when enabled is false', () => {
    const result = triggerHaptic('button', false);
    expect(result).toBe(false);
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });

  it('handles environment without navigator.vibrate without throwing', () => {
    vi.stubGlobal('navigator', {});
    const result = triggerHaptic('alert', true);
    expect(result).toBe(false);
  });
});

describe('T25: AudioManager singleton and mute handling', () => {
  let mockCtx: MockAudioContext;

  beforeEach(() => {
    mockCtx = new MockAudioContext();
    audioManager.init(mockCtx as unknown as AudioContext);
    audioManager.setMuted(false);
  });

  it('toggles mute status and notifies listeners', () => {
    let capturedMuted: boolean | null = null;
    const unsubscribe = audioManager.onMuteChange((m) => {
      capturedMuted = m;
    });

    expect(audioManager.isMuted()).toBe(false);
    const toggled = audioManager.toggleMute();
    expect(toggled).toBe(true);
    expect(audioManager.isMuted()).toBe(true);
    expect(capturedMuted).toBe(true);

    audioManager.toggleMute();
    expect(audioManager.isMuted()).toBe(false);
    expect(capturedMuted).toBe(false);

    unsubscribe();
  });

  it('suppresses SFX and haptics when muted', () => {
    audioManager.setMuted(true);
    const vibrateSpy = vi.fn();
    vi.stubGlobal('navigator', { vibrate: vibrateSpy });

    audioManager.playSfx('click');
    expect(vibrateSpy).not.toHaveBeenCalled();

    const hapticResult = audioManager.triggerHaptic('button');
    expect(hapticResult).toBe(false);
  });

  it('unlocks audio context on unlockAudio()', () => {
    audioManager.unlockAudio();
    expect(audioManager.getContext()).toBeDefined();
  });
});
