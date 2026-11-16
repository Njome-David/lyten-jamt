// src/audio/index.ts
// Unified Audio & Haptics Manager for Junior Astronaut Mission Trainer.
// Strictly conforms to DESIGN.md section 6 and PRESENTATION.md section 6.

import { synthesizeSfx, type PlaySfxOptions } from './sfx';
import { CosmicAmbience } from './ambience';
import { triggerHaptic } from './haptics';
import type { AudioSettings, HapticPattern, SfxType } from './types';

export * from './types';
export * from './sfx';
export * from './ambience';
export * from './haptics';

const MUTE_STORAGE_KEY = 'jamt.audio.muted';

class AudioManager {
  private ctx: AudioContext | null = null;
  private ambience: CosmicAmbience;
  private settings: AudioSettings = {
    muted: false,
    volume: 1.0,
    sfxVolume: 0.8,
    ambienceVolume: 0.15,
  };
  private isUnlocked: boolean = false;
  private listeners: Set<(muted: boolean) => void> = new Set();

  constructor() {
    this.ambience = new CosmicAmbience();
    this.loadMuteState();
  }

  private loadMuteState(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(MUTE_STORAGE_KEY);
      if (stored !== null) {
        this.settings.muted = stored === 'true';
      }
    } catch {
      // Ignore private mode / local storage quota errors
    }
  }

  private saveMuteState(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(MUTE_STORAGE_KEY, String(this.settings.muted));
    } catch {
      // Ignore
    }
  }

  /**
   * Initialize or attach an AudioContext.
   */
  public init(ctx?: AudioContext): AudioContext | null {
    if (ctx) {
      this.ctx = ctx;
      this.ambience.setContext(ctx);
      return ctx;
    }

    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        try {
          this.ctx = new AudioCtxClass();
          this.ambience.setContext(this.ctx);
        } catch {
          // Graceful fallback if audio context creation is blocked
        }
      }
    }

    return this.ctx;
  }

  /**
   * Unlock WebAudio on first user gesture.
   */
  public unlockAudio(): void {
    if (this.isUnlocked) return;
    const ctx = this.init();
    if (ctx) {
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      this.isUnlocked = true;
      if (!this.settings.muted && !this.ambience.isPlaying()) {
        this.ambience.start(this.settings.ambienceVolume);
      }
    }
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.settings.muted;
  }

  public setMuted(muted: boolean): void {
    this.settings.muted = muted;
    this.saveMuteState();

    if (muted) {
      this.ambience.stop();
    } else if (this.isUnlocked) {
      this.ambience.start(this.settings.ambienceVolume);
    }

    this.notifyListeners();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.settings.muted);
    return this.settings.muted;
  }

  public onMuteChange(listener: (muted: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => {
      try {
        fn(this.settings.muted);
      } catch {
        // Ignore listener error
      }
    });
  }

  public playSfx(type: SfxType, options?: PlaySfxOptions): void {
    if (this.settings.muted) return;

    const ctx = this.ctx ?? this.init();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const vol = (options?.volume ?? 0.3) * this.settings.sfxVolume * this.settings.volume;
    synthesizeSfx(ctx, type, { volume: vol });
  }

  public triggerHaptic(pattern: HapticPattern): boolean {
    if (this.settings.muted) return false;
    return triggerHaptic(pattern, !this.settings.muted);
  }

  public startAmbience(): void {
    if (this.settings.muted) return;
    const ctx = this.ctx ?? this.init();
    if (ctx) {
      this.ambience.start(this.settings.ambienceVolume * this.settings.volume);
    }
  }

  public stopAmbience(): void {
    this.ambience.stop();
  }

  public isAmbiencePlaying(): boolean {
    return this.ambience.isPlaying();
  }
}

export const audioManager = new AudioManager();
