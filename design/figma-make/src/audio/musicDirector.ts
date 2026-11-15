export type TrackId = "starlight-strut" | "playful-pixels" | "arcade-overdrive";

export interface MusicTrackMeta {
  id: TrackId;
  title: string;
  src: string;
  vibe: string;
}

export const MUSIC_TRACKS: Record<TrackId, MusicTrackMeta> = {
  "starlight-strut": {
    id: "starlight-strut",
    title: "Starlight Strut",
    src: "/audio/starlight-strut.mp3",
    vibe: "Cosmic Cruise",
  },
  "playful-pixels": {
    id: "playful-pixels",
    title: "Playful Pixels",
    src: "/audio/playful-pixels.mp3",
    vibe: "Outpost Discovery",
  },
  "arcade-overdrive": {
    id: "arcade-overdrive",
    title: "Arcade Overdrive",
    src: "/audio/arcade-overdrive.mp3",
    vibe: "Storm Overdrive",
  },
};

const ALTERNATING_ORDER: TrackId[] = ["starlight-strut", "playful-pixels", "arcade-overdrive"];

export interface MusicContextInput {
  screen: "title" | "select" | "loadout" | "mission" | "debrief";
  muted: boolean;
  paused: boolean;
  modalOpen: boolean;
  mayaSpeaking: boolean;
  executingStep: boolean;
  executingFast: boolean;
  stepIndex: number;
  solarStormy: boolean;
  criticalMeters: boolean;
  lunarNightOrBlackout: boolean;
  alertKind: "flare" | "dust" | "fault" | null;
  alertTimed: boolean;
}

export type MusicPhase =
  | "awaiting-gesture"
  | "playing"
  | "ducked"
  | "breather"
  | "alert-hush"
  | "muted";

export interface MusicStatusSnapshot {
  trackId: TrackId;
  trackTitle: string;
  vibe: string;
  phase: MusicPhase;
}

type StatusListener = (snap: MusicStatusSnapshot) => void;

interface Deck {
  el: HTMLAudioElement;
  trackId: TrackId | null;
  currentVol: number;
  targetVol: number;
  fadeRatePerSec: number;
}

const BASE_MUSIC_VOLUME = 0.26;

class AdaptiveMusicDirector {
  private deckA: Deck | null = null;
  private deckB: Deck | null = null;
  private activeDeck: "A" | "B" = "A";
  private unlocked = false;
  private initialized = false;

  private currentTrack: TrackId = "starlight-strut";
  private lastPlayedCalmTrack: TrackId = "starlight-strut";

  private ctx: MusicContextInput = {
    screen: "title",
    muted: false,
    paused: false,
    modalOpen: false,
    mayaSpeaking: false,
    executingStep: false,
    executingFast: false,
    stepIndex: 0,
    solarStormy: false,
    criticalMeters: false,
    lunarNightOrBlackout: false,
    alertKind: null,
    alertTimed: false,
  };

  private prevScreen: MusicContextInput["screen"] = "title";
  private prevLunarNight = false;
  private prevAlertKind: MusicContextInput["alertKind"] = null;

  // Timed envelopes (timestamps in performance.now() ms)
  private breatherUntilMs = 0;
  private alertHushUntilMs = 0;
  private nightHushUntilMs = 0;
  private debriefDipUntilMs = 0;
  private sfxDuckUntilMs = 0;
  private manualHoldUntilMs = 0;

  private listeners = new Set<StatusListener>();
  private lastEmittedKey = "";
  private intervalId: number | null = null;

  public init(): void {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    this.deckA = this.createDeck();
    this.deckB = this.createDeck();

    const unlockOnGesture = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      this.startTrack(this.pickDesiredTrack(), 2.4);
      this.emitStatus();
    };

    window.addEventListener("pointerdown", unlockOnGesture, { passive: true });
    window.addEventListener("keydown", unlockOnGesture, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (!this.deckA || !this.deckB) return;
      if (document.hidden) {
        this.deckA.el.pause();
        this.deckB.el.pause();
      } else if (this.unlocked && !this.ctx.muted) {
        const active = this.getActiveDeck();
        if (active && active.trackId && this.breatherUntilMs <= performance.now()) {
          void active.el.play().catch(() => {});
        }
      }
    });

    this.intervalId = window.setInterval(() => this.tick(0.05), 50);
  }

  private createDeck(): Deck {
    const el = new Audio();
    el.preload = "auto";
    el.loop = false;
    el.volume = 0;
    const deck: Deck = {
      el,
      trackId: null,
      currentVol: 0,
      targetVol: 0,
      fadeRatePerSec: 0.2,
    };
    el.addEventListener("ended", () => {
      if (this.getActiveDeck() === deck) {
        this.handleNaturalTrackEnd();
      }
    });
    return deck;
  }

  private getActiveDeck(): Deck | null {
    return this.activeDeck === "A" ? this.deckA : this.deckB;
  }

  private getInactiveDeck(): Deck | null {
    return this.activeDeck === "A" ? this.deckB : this.deckA;
  }

  private handleNaturalTrackEnd(): void {
    const now = performance.now();
    // Give a serene "space silence" breather (8.5s in calm exploration, 3s in intense storm) before alternating!
    const highTension = this.ctx.solarStormy || this.ctx.criticalMeters;
    const silenceSec = highTension ? 3.0 : 9.5;
    this.breatherUntilMs = now + silenceSec * 1000;

    // Pre-select next alternating track
    if (highTension && this.currentTrack !== "arcade-overdrive") {
      this.currentTrack = "arcade-overdrive";
    } else if (this.currentTrack === "starlight-strut") {
      this.currentTrack = "playful-pixels";
      this.lastPlayedCalmTrack = "playful-pixels";
    } else if (this.currentTrack === "playful-pixels") {
      this.currentTrack =
        this.ctx.screen === "mission" && this.ctx.stepIndex >= 3
          ? "arcade-overdrive"
          : "starlight-strut";
      if (this.currentTrack === "starlight-strut") {
        this.lastPlayedCalmTrack = "starlight-strut";
      }
    } else {
      this.currentTrack =
        this.lastPlayedCalmTrack === "starlight-strut" ? "playful-pixels" : "starlight-strut";
      this.lastPlayedCalmTrack = this.currentTrack;
    }
    this.emitStatus();
  }

  private pickDesiredTrack(): TrackId {
    const c = this.ctx;
    if (c.screen === "loadout") {
      return "playful-pixels";
    }
    if (c.screen === "debrief") {
      return "starlight-strut";
    }
    if (c.screen === "mission") {
      if (
        c.alertTimed ||
        c.solarStormy ||
        c.criticalMeters ||
        (c.executingFast && c.stepIndex >= 3)
      ) {
        return "arcade-overdrive";
      }
      if (c.lunarNightOrBlackout) {
        return "starlight-strut";
      }
      return this.lastPlayedCalmTrack === "starlight-strut" && c.stepIndex >= 1
        ? "playful-pixels"
        : this.currentTrack === "arcade-overdrive"
          ? "playful-pixels"
          : this.currentTrack;
    }
    // Title or Select
    return this.currentTrack === "arcade-overdrive" ? "starlight-strut" : this.currentTrack;
  }

  private startTrack(trackId: TrackId, crossfadeSec = 1.8): void {
    if (!this.deckA || !this.deckB) return;
    this.currentTrack = trackId;
    if (trackId !== "arcade-overdrive") {
      this.lastPlayedCalmTrack = trackId;
    }

    const current = this.getActiveDeck()!;
    if (current.trackId === trackId && !current.el.paused && !current.el.ended) {
      return;
    }

    // Fade out current deck
    current.targetVol = 0;
    current.fadeRatePerSec = 1 / Math.max(0.25, crossfadeSec);

    // Swap active deck and fade in
    this.activeDeck = this.activeDeck === "A" ? "B" : "A";
    const next = this.getActiveDeck()!;
    const meta = MUSIC_TRACKS[trackId];
    if (next.trackId !== trackId) {
      next.el.src = meta.src;
      next.trackId = trackId;
    }
    next.el.currentTime = 0;
    next.currentVol = 0;
    next.el.volume = 0;
    next.fadeRatePerSec = 1 / Math.max(0.3, crossfadeSec);

    if (this.unlocked && !this.ctx.muted && !document.hidden) {
      void next.el.play().catch(() => {});
    }
    this.emitStatus();
  }

  public updateContext(nextCtx: MusicContextInput): void {
    this.init();
    const now = performance.now();

    // Detect dramatic transitions
    // 1. Timed emergency alert just struck -> sudden 2.2s dramatic hush, then surge into Arcade Overdrive!
    if (nextCtx.alertKind && nextCtx.alertKind !== this.prevAlertKind) {
      if (nextCtx.alertTimed) {
        this.alertHushUntilMs = now + 2200;
        this.breatherUntilMs = 0;
      }
    }

    // 2. Lunar Night or Radio Blackout just fell -> 4.8s atmospheric hush!
    if (nextCtx.lunarNightOrBlackout && !this.prevLunarNight && nextCtx.screen === "mission") {
      this.nightHushUntilMs = now + 4800;
    }

    // 3. Entering Debrief -> brief dip so win/lose fanfare rings clearly
    if (nextCtx.screen === "debrief" && this.prevScreen !== "debrief") {
      this.debriefDipUntilMs = now + 1800;
      this.breatherUntilMs = 0;
    }

    // 4. Entering Loadout Hangar -> cancel breather so Playful Pixels greets the base builder
    if (nextCtx.screen === "loadout" && this.prevScreen !== "loadout") {
      this.breatherUntilMs = 0;
    }

    this.prevScreen = nextCtx.screen;
    this.prevLunarNight = nextCtx.lunarNightOrBlackout;
    this.prevAlertKind = nextCtx.alertKind;
    this.ctx = nextCtx;

    if (this.unlocked && !nextCtx.muted && now >= this.manualHoldUntilMs) {
      const desired = this.pickDesiredTrack();
      if (desired !== this.currentTrack && now >= this.breatherUntilMs) {
        const fade = desired === "arcade-overdrive" ? 1.1 : 2.0;
        this.startTrack(desired, fade);
      }
    }

    this.emitStatus();
  }

  public notifySfxTransient(durationMs = 550): void {
    const until = performance.now() + durationMs;
    if (until > this.sfxDuckUntilMs) {
      this.sfxDuckUntilMs = until;
    }
  }

  public cycleNextTrackManual(): void {
    this.init();
    this.unlocked = true;
    const now = performance.now();

    // Cycle: Track 1 -> Track 2 -> Track 3 -> Space Breather (10s quiet) -> Track 1
    if (this.breatherUntilMs > now) {
      this.breatherUntilMs = 0;
      this.manualHoldUntilMs = now + 25000;
      this.startTrack("starlight-strut", 1.0);
      return;
    }

    const idx = ALTERNATING_ORDER.indexOf(this.currentTrack);
    if (idx === ALTERNATING_ORDER.length - 1) {
      // Enter serene space breather manually
      this.breatherUntilMs = now + 12000;
      const active = this.getActiveDeck();
      if (active) {
        active.targetVol = 0;
        active.fadeRatePerSec = 1.4;
      }
      this.emitStatus();
      return;
    }

    const nextTrack = ALTERNATING_ORDER[(idx + 1) % ALTERNATING_ORDER.length];
    this.breatherUntilMs = 0;
    this.manualHoldUntilMs = now + 25000;
    this.startTrack(nextTrack, 1.0);
  }

  private computeDesiredActiveVolume(now: number): {
    vol: number;
    rate: number;
    phase: MusicPhase;
  } {
    if (this.ctx.muted) {
      return { vol: 0, rate: 4.0, phase: "muted" };
    }
    if (!this.unlocked) {
      return { vol: 0, rate: 1.0, phase: "awaiting-gesture" };
    }
    if (now < this.alertHushUntilMs) {
      return { vol: 0.02, rate: 3.8, phase: "alert-hush" };
    }
    if (now < this.nightHushUntilMs) {
      return { vol: 0.0, rate: 1.4, phase: "breather" };
    }
    if (now < this.breatherUntilMs) {
      return { vol: 0.0, rate: 0.9, phase: "breather" };
    }

    let mult = 1.0;
    let phase: MusicPhase = "playing";

    if (this.ctx.paused || this.ctx.modalOpen) {
      mult *= 0.32;
      phase = "ducked";
    } else if (this.ctx.alertKind) {
      // Keep music focused & slightly ducked during active alert choices
      mult *= this.ctx.alertTimed ? 0.68 : 0.42;
      phase = "ducked";
    } else if (this.ctx.mayaSpeaking) {
      mult *= 0.45;
      phase = "ducked";
    } else if (this.ctx.executingStep) {
      // Gentle cinematic swell while watching 3D crew/rover execute the step!
      mult *= 1.18;
    }

    if (this.ctx.lunarNightOrBlackout && this.ctx.screen === "mission") {
      mult *= 0.68;
    }
    if (this.ctx.screen === "debrief") {
      mult *= now < this.debriefDipUntilMs ? 0.18 : 0.62;
    }
    if (now < this.sfxDuckUntilMs) {
      mult *= 0.58;
    }

    const vol = Math.max(0, Math.min(0.36, BASE_MUSIC_VOLUME * mult));
    return { vol, rate: 1.35, phase };
  }

  private tick(dtSec: number): void {
    if (!this.deckA || !this.deckB) return;
    const now = performance.now();

    // If breather just finished, smoothly start the queued alternating track!
    if (
      this.unlocked &&
      !this.ctx.muted &&
      this.breatherUntilMs > 0 &&
      now >= this.breatherUntilMs
    ) {
      this.breatherUntilMs = 0;
      this.startTrack(this.currentTrack, 3.0);
    }

    // If timed alert hush just ended, surge into Arcade Overdrive!
    if (
      this.unlocked &&
      !this.ctx.muted &&
      this.alertHushUntilMs > 0 &&
      now >= this.alertHushUntilMs
    ) {
      this.alertHushUntilMs = 0;
      if (this.ctx.alertTimed) {
        this.startTrack("arcade-overdrive", 0.9);
      }
    }

    const active = this.getActiveDeck()!;
    const inactive = this.getInactiveDeck()!;

    const desired = this.computeDesiredActiveVolume(now);
    active.targetVol = desired.vol;
    active.fadeRatePerSec = desired.rate;
    inactive.targetVol = 0;

    // Ensure active deck is playing if it has positive target volume
    if (
      this.unlocked &&
      !document.hidden &&
      active.targetVol > 0.005 &&
      active.trackId &&
      active.el.paused
    ) {
      void active.el.play().catch(() => {});
    }

    for (const deck of [active, inactive]) {
      const diff = deck.targetVol - deck.currentVol;
      const maxStep = BASE_MUSIC_VOLUME * deck.fadeRatePerSec * dtSec * 2.2;
      if (Math.abs(diff) <= maxStep) {
        deck.currentVol = deck.targetVol;
      } else {
        deck.currentVol += Math.sign(diff) * maxStep;
      }
      deck.el.volume = Math.max(0, Math.min(1, deck.currentVol));

      if (deck.currentVol <= 0.001 && deck.targetVol === 0 && !deck.el.paused) {
        deck.el.pause();
      }
    }

    this.emitStatus(desired.phase);
  }

  public getSnapshot(overridePhase?: MusicPhase): MusicStatusSnapshot {
    const meta = MUSIC_TRACKS[this.currentTrack];
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    const phase = overridePhase ?? this.computeDesiredActiveVolume(now).phase;
    return {
      trackId: meta.id,
      trackTitle: meta.title,
      vibe: meta.vibe,
      phase,
    };
  }

  private emitStatus(overridePhase?: MusicPhase): void {
    const snap = this.getSnapshot(overridePhase);
    const key = `${snap.trackId}:${snap.phase}`;
    if (key === this.lastEmittedKey) return;
    this.lastEmittedKey = key;
    this.listeners.forEach((fn) => fn(snap));
  }

  public subscribe(fn: StatusListener): () => void {
    this.init();
    fn(this.getSnapshot());
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
}

export const musicDirector = new AdaptiveMusicDirector();
