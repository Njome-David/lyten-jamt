// src/audio/sfx.ts
// Pure WebAudio procedural synthesizer for all in-game sound effects (0 KB external assets).
// Conforms strictly to DESIGN.md section 6.1 and PRESENTATION.md section 6.

import type { SfxType } from './types';

export interface PlaySfxOptions {
  volume?: number;
}

/**
 * Procedural synthesizer for WebAudio sound effects.
 * Safe to call with any mock AudioContext or standard browser AudioContext.
 */
export function synthesizeSfx(ctx: AudioContext, type: SfxType, options: PlaySfxOptions = {}): void {
  if (!ctx || ctx.state === 'suspended') {
    // If context is suspended or missing, attempt resume if available or skip
    try {
      if (ctx?.state === 'suspended') {
        void ctx.resume();
      }
    } catch {
      // Ignore resume error in headless/test environments
    }
  }

  const baseVolume = options.volume ?? 0.25;
  const now = ctx.currentTime;

  switch (type) {
    case 'click': {
      // 560 Hz (Triangle), 55 ms
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560, now);

      gain.gain.setValueAtTime(baseVolume * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
      break;
    }

    case 'confirm': {
      // 480 Hz -> 680 Hz (Double Sinus), 110 ms
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(480, now);
      gain1.gain.setValueAtTime(baseVolume * 0.7, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(680, now + 0.05);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(baseVolume * 0.7, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.05);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.11);
      break;
    }

    case 'execute': {
      // Triad 330 Hz, 440 Hz, 587 Hz (Triangle + Sinus), 220 ms
      const frequencies = [330, 440, 587];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime((baseVolume * 0.4) / frequencies.length, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
      });
      break;
    }

    case 'advice': {
      // 620 Hz -> 830 Hz (Soft chime Sine), 120 ms
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(830, now + 0.12);

      gain.gain.setValueAtTime(baseVolume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
      break;
    }

    case 'tick': {
      // 880 Hz (Short sharp Sine), 40 ms
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(baseVolume * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }

    case 'alert': {
      // 740 Hz -> 540 Hz -> 740 Hz (Urgent Sawtooth sweep), 310 ms
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.linearRampToValueAtTime(540, now + 0.15);
      osc.frequency.linearRampToValueAtTime(740, now + 0.31);

      gain.gain.setValueAtTime(baseVolume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.31);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.31);
      break;
    }

    case 'win': {
      // C major ascending arpeggio (523 -> 659 -> 784 -> 1046 Hz), 450 ms
      const notes = [523, 659, 784, 1046];
      const step = 0.45 / notes.length;

      notes.forEach((freq, idx) => {
        const start = now + idx * step;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(baseVolume * 0.7, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + step * 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + step * 1.5);
      });
      break;
    }

    case 'lose': {
      // Minor descending progression (440 -> 370 -> 311 Hz), 500 ms
      const notes = [440, 370, 311];
      const step = 0.5 / notes.length;

      notes.forEach((freq, idx) => {
        const start = now + idx * step;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(baseVolume * 0.5, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + step * 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + step * 1.4);
      });
      break;
    }

    case 'heartbeat': {
      // Low-frequency heartbeat double pulse (sub-25% meter indicator)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(65, now);
      osc1.frequency.exponentialRampToValueAtTime(45, now + 0.08);
      gain1.gain.setValueAtTime(baseVolume * 0.8, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(60, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(40, now + 0.22);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(baseVolume * 0.7, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.08);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.22);
      break;
    }
  }
}
