import { musicDirector } from "./musicDirector";

export type SfxName =
  | "click"
  | "confirm"
  | "execute"
  | "alert"
  | "tick"
  | "win"
  | "lose"
  | "advice";

let audioCtx: AudioContext | null = null;
let isMuted = false;

export function setAudioMuted(muted: boolean): void {
  isMuted = muted;
}

export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  try {
    if (!audioCtx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        audioCtx = new Ctx();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      void audioCtx.resume();
    }
  } catch {
    // Audio blocked or unsupported
  }
}

function playTone(
  freq: number,
  durationSec: number,
  type: OscillatorType = "sine",
  gainPeak = 0.06,
  delaySec = 0,
): void {
  if (isMuted) return;
  unlockAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime + delaySec;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  } catch {
    // Ignore WebAudio transient errors
  }
}

export function playSfx(name: SfxName): void {
  if (isMuted) return;
  switch (name) {
    case "click":
      playTone(560, 0.055, "triangle", 0.04);
      break;
    case "confirm":
      musicDirector.notifySfxTransient(280);
      playTone(480, 0.08, "sine", 0.055, 0);
      playTone(680, 0.11, "sine", 0.055, 0.06);
      break;
    case "execute":
      playTone(330, 0.14, "triangle", 0.04, 0);
      playTone(440, 0.18, "sine", 0.045, 0.09);
      playTone(587.33, 0.22, "sine", 0.04, 0.2);
      break;
    case "advice":
      musicDirector.notifySfxTransient(420);
      playTone(620, 0.09, "sine", 0.045, 0);
      playTone(830, 0.12, "sine", 0.045, 0.08);
      break;
    case "tick":
      playTone(880, 0.04, "sine", 0.03);
      break;
    case "alert":
      musicDirector.notifySfxTransient(950);
      playTone(740, 0.14, "sawtooth", 0.045, 0);
      playTone(540, 0.16, "sawtooth", 0.045, 0.15);
      playTone(740, 0.18, "sawtooth", 0.045, 0.31);
      break;
    case "win":
      musicDirector.notifySfxTransient(1200);
      playTone(523.25, 0.14, "triangle", 0.06, 0);
      playTone(659.25, 0.14, "triangle", 0.06, 0.11);
      playTone(783.99, 0.16, "triangle", 0.06, 0.22);
      playTone(1046.5, 0.32, "sine", 0.07, 0.34);
      break;
    case "lose":
      musicDirector.notifySfxTransient(1100);
      playTone(440, 0.18, "sine", 0.055, 0);
      playTone(370, 0.2, "sine", 0.055, 0.16);
      playTone(311, 0.32, "triangle", 0.055, 0.34);
      break;
  }
}
