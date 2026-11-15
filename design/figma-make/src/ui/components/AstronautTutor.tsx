import React, { useEffect, useState } from "react";
import { BookOpen, ChevronRight, MessageCircle, X } from "lucide-react";
import { GLOSSARY } from "../../content/glossary";
import type { MayaLine, MayaMood } from "../../content/mayaDialogues";

export const AstronautPortraitSvg: React.FC<{ mood: MayaMood; size?: number }> = ({
  mood,
  size = 76,
}) => {
  const ringColor =
    mood === "alert" ? "#fbbf24" : mood === "proud" || mood === "excited" ? "#34d399" : "#38bdf8";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Helmet Glow Frame */}
      <circle cx="48" cy="48" r="44" fill="#0f172a" stroke={ringColor} strokeWidth="2.5" />
      <circle cx="48" cy="48" r="40" stroke="#334155" strokeWidth="1" />

      {/* Backpack Straps & Spacesuit Shoulders */}
      <path
        d="M18 82C21 69 32 64 48 64C64 64 75 69 78 82"
        fill="#f1f5f9"
        stroke="#94a3b8"
        strokeWidth="2"
      />
      {/* Orange/Cyan Artemis Suit Stripe */}
      <path d="M27 72L36 83H60L69 72" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
      <rect
        x="41"
        y="71"
        width="14"
        height="8"
        rx="3"
        fill="#1e293b"
        stroke="#38bdf8"
        strokeWidth="1.2"
      />

      {/* Outer Bubble Helmet */}
      <circle cx="48" cy="43" r="26" fill="#1e293b" stroke="#e2e8f0" strokeWidth="3" />
      <circle cx="48" cy="43" r="22.5" fill="#0b1324" />

      {/* Hair & Warm Face Inside Helmet */}
      <path
        d="M30 39C30 27 38 22 48 22C58 22 66 27 66 39C63 34 57 31 48 31C39 31 33 34 30 39Z"
        fill="#3b2316"
      />
      <circle cx="48" cy="44.5" r="14.5" fill="#eab68c" />
      {/* Soft Cheek Blush */}
      <circle cx="39.5" cy="47.5" r="2.5" fill="#f43f5e" fillOpacity="0.28" />
      <circle cx="56.5" cy="47.5" r="2.5" fill="#f43f5e" fillOpacity="0.28" />

      {/* Eyes & Brows by Mood */}
      {mood === "excited" || mood === "proud" ? (
        <>
          <path
            d="M40 42C41.2 39.5 43.8 39.5 45 42"
            stroke="#1e293b"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <path
            d="M51 42C52.2 39.5 54.8 39.5 56 42"
            stroke="#1e293b"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <path
            d="M43 49.5C45.2 52.8 50.8 52.8 53 49.5"
            stroke="#7c2d12"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </>
      ) : mood === "alert" ? (
        <>
          <path d="M39 37.5L45 39" stroke="#3b2316" strokeWidth="2" strokeLinecap="round" />
          <path d="M57 37.5L51 39" stroke="#3b2316" strokeWidth="2" strokeLinecap="round" />
          <circle cx="42.5" cy="43" r="2.4" fill="#1e293b" />
          <circle cx="53.5" cy="43" r="2.4" fill="#1e293b" />
          <ellipse cx="48" cy="51" rx="3" ry="2.2" fill="#7c2d12" />
        </>
      ) : (
        <>
          <circle cx="42.5" cy="43" r="2.2" fill="#1e293b" />
          <circle cx="53.5" cy="43" r="2.2" fill="#1e293b" />
          <circle cx="43.2" cy="42.2" r="0.7" fill="#ffffff" />
          <circle cx="54.2" cy="42.2" r="0.7" fill="#ffffff" />
          <path
            d="M44 50C46 52 50 52 52 50"
            stroke="#7c2d12"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Comm Headset Mic */}
      <path d="M62 46C60 51 56 53 52 53" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="51.5" cy="53" r="1.6" fill="#38bdf8" />

      {/* Glass Bubble Visor Glint */}
      <path
        d="M32 30C35 25 41 22.5 47 22.5"
        stroke="#ffffff"
        strokeOpacity="0.45"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

interface TutorDialogBoxProps {
  lines: MayaLine[] | null;
  fallbackTipText: string;
  onDismiss: () => void;
  onSummonTip: () => void;
}

export const AstronautTutor: React.FC<TutorDialogBoxProps> = ({
  lines,
  fallbackTipText,
  onDismiss,
  onSummonTip,
}) => {
  const [index, setIndex] = useState(0);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [lines]);

  // Allow Enter to advance Maya when she is on screen
  useEffect(() => {
    if (!lines || lines.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (index + 1 < lines.length) {
          setIndex((i) => i + 1);
        } else {
          onDismiss();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lines, index, onDismiss]);

  // When Maya is away, render only a sleek minimal comms button in the bottom-left corner
  if (!lines || lines.length === 0) {
    return (
      <>
        <div className="fixed bottom-4 left-4 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={onSummonTip}
            title={`Ask Maya: ${fallbackTipText}`}
            className="group flex items-center gap-2 rounded-full border border-sky-400/35 bg-slate-950/80 py-1.5 pr-3.5 pl-1.5 shadow-lg backdrop-blur-md transition hover:border-sky-300 hover:bg-slate-900"
          >
            <AstronautPortraitSvg mood="wave" size={34} />
            <span className="font-display text-xs font-semibold text-sky-200 group-hover:text-white">
              Maya Comms
            </span>
          </button>

          <button
            type="button"
            onClick={() => setGlossaryOpen((v) => !v)}
            title="Space Words Glossary"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/80 text-slate-300 shadow-lg backdrop-blur-md transition hover:border-sky-400/50 hover:text-white"
            aria-label="Open Space Glossary"
          >
            <BookOpen className="h-4 w-4" />
          </button>
        </div>

        {glossaryOpen && (
          <div className="fixed bottom-18 left-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-700/90 bg-slate-950/92 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold text-sky-300">
                Space Explorer Words
              </span>
              <button
                type="button"
                onClick={() => setGlossaryOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close Glossary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2.5 max-h-60 space-y-2 overflow-y-auto pr-1 text-xs">
              {GLOSSARY.map((g) => (
                <div
                  key={g.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5"
                >
                  <div className="font-bold text-white">{g.term}</div>
                  <div className="mt-0.5 text-slate-300">{g.shortDef}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  const current = lines[Math.min(index, lines.length - 1)];
  const isLast = index + 1 >= lines.length;

  const handleAdvance = () => {
    if (!isLast) {
      setIndex((i) => i + 1);
    } else {
      onDismiss();
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div
        onClick={handleAdvance}
        role="dialog"
        aria-label="Maya Astronaut Companion"
        className="pointer-events-auto w-full max-w-2xl cursor-pointer rounded-3xl border-2 border-sky-400/55 bg-slate-950/92 p-4 shadow-2xl shadow-sky-950/50 backdrop-blur-xl transition hover:border-sky-300 sm:p-5"
      >
        <div className="flex items-center gap-4">
          <AstronautPortraitSvg mood={current.mood} size={74} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-wide text-sky-300 uppercase">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {current.speakerTitle ?? "Maya · Outpost Comms"}
              </span>
              {lines.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-400">
                    {index + 1}/{lines.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss();
                    }}
                    className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300 hover:border-slate-500 hover:text-white"
                  >
                    Skip
                  </button>
                </div>
              )}
            </div>

            <p className="mt-1.5 font-display text-sm leading-relaxed font-medium text-white sm:text-base">
              “{current.text}”
            </p>

            <div className="mt-2.5 flex items-center justify-end">
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-300">
                {isLast ? "Click to got it" : "Click to continue"}
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
