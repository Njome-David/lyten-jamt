// src/audio/ambience.ts
// Pure WebAudio procedural synthesizer for cosmic space drone ambience.
// Replaces heavy MP3 files (0 KB bundle size). Conforms to DESIGN.md section 6.2.

export class CosmicAmbience {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscRoot: OscillatorNode | null = null;
  private oscHarmonic: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isRunning: boolean = false;
  private targetVolume: number = 0.12;

  constructor(ctx?: AudioContext) {
    if (ctx) {
      this.ctx = ctx;
    }
  }

  public setContext(ctx: AudioContext): void {
    if (this.isRunning) {
      this.stop();
    }
    this.ctx = ctx;
  }

  public isPlaying(): boolean {
    return this.isRunning;
  }

  public start(volume?: number): void {
    if (!this.ctx) return;
    if (this.isRunning) return;

    if (volume !== undefined) {
      this.targetVolume = volume;
    }

    try {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      // Master ambience gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, this.targetVolume), now + 2.0);

      // Low-pass filter to keep sound warm and unobtrusive
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(140, now);
      this.filter.Q.setValueAtTime(2.0, now);

      // Root 55 Hz (A1) deep drone
      this.oscRoot = this.ctx.createOscillator();
      this.oscRoot.type = 'sine';
      this.oscRoot.frequency.setValueAtTime(55, now);

      // 110 Hz subtle harmonic
      this.oscHarmonic = this.ctx.createOscillator();
      this.oscHarmonic.type = 'triangle';
      this.oscHarmonic.frequency.setValueAtTime(110, now);

      // Slow LFO for gentle cosmic pulsation
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.08, now); // ~12 sec cycle
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(30, now); // modulates filter cutoff +/- 30 Hz

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.filter.frequency);

      const rootGain = this.ctx.createGain();
      rootGain.gain.setValueAtTime(0.7, now);
      this.oscRoot.connect(rootGain);
      rootGain.connect(this.filter);

      const harmGain = this.ctx.createGain();
      harmGain.gain.setValueAtTime(0.3, now);
      this.oscHarmonic.connect(harmGain);
      harmGain.connect(this.filter);

      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.oscRoot.start(now);
      this.oscHarmonic.start(now);
      this.lfo.start(now);

      this.isRunning = true;
    } catch {
      // Graceful fallback for mock contexts / restricted environments
      this.isRunning = false;
    }
  }

  public stop(): void {
    if (!this.isRunning || !this.ctx || !this.masterGain) {
      this.isRunning = false;
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      const oscRoot = this.oscRoot;
      const oscHarmonic = this.oscHarmonic;
      const lfo = this.lfo;

      setTimeout(() => {
        try {
          oscRoot?.stop();
          oscHarmonic?.stop();
          lfo?.stop();
          oscRoot?.disconnect();
          oscHarmonic?.disconnect();
          lfo?.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      }, 900);
    } catch {
      // Ignore audio shutdown errors
    } finally {
      this.isRunning = false;
      this.oscRoot = null;
      this.oscHarmonic = null;
      this.lfo = null;
      this.filter = null;
      this.masterGain = null;
    }
  }

  public setVolume(volume: number): void {
    this.targetVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(this.targetVolume, now + 0.1);
      } catch {
        // Ignore
      }
    }
  }
}
