// src/ui/dialog/useDialogRunner.ts
// Hook orchestrating companion dialogues, guided tour, seen persistence, and countdown pause.
// Strictly obeys: "AUCUN dialogue declenche pendant un compte a rebours / chrono actif."

import { useCallback, useEffect, useState } from 'react';
import {
  dialogues,
  guidedTour,
  narrativeDialogues,
  type Dialogue,
} from '../../content/dialogues';

const SEEN_STORAGE_KEY = 'save.seen';

export interface UseDialogRunnerOptions {
  /** If a timed countdown/alert is active, dialogues must NOT trigger or appear */
  isCountdownActive?: boolean;
}

/** Safely read seen IDs from localStorage or memory */
function loadSeenIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed);
    } else if (typeof parsed === 'object' && parsed !== null) {
      return new Set(Object.keys(parsed).filter((k) => (parsed as Record<string, boolean>)[k]));
    }
  } catch {
    // Ignore storage parse failure
  }
  return new Set();
}

/** Persist seen IDs to localStorage */
function saveSeenIds(seenSet: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    const arr = Array.from(seenSet);
    window.localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // Ignore private mode / storage quota error
  }
}

export function useDialogRunner(options: UseDialogRunnerOptions = {}) {
  const { isCountdownActive = false } = options;

  const [queue, setQueue] = useState<Dialogue[]>([]);
  const [currentDialog, setCurrentDialog] = useState<Dialogue | null>(null);
  const [seen, setSeen] = useState<Set<string>>(() => loadSeenIds());

  // Strictly respect: NO dialog displayed while a countdown is active
  const isDialogActive = queue.length > 0 && !isCountdownActive;

  // Sync current dialog with queue head when not suppressed by countdown
  useEffect(() => {
    if (isDialogActive) {
      setCurrentDialog(queue[0] ?? null);
    } else {
      setCurrentDialog(null);
    }
  }, [queue, isDialogActive]);

  // Mark an ID as seen
  const markSeen = useCallback((id: string) => {
    setSeen((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSeenIds(next);
      return next;
    });
  }, []);

  // Advance to next dialogue in queue
  const advanceDialog = useCallback(() => {
    if (queue.length === 0) return;
    const current = queue[0];
    if (current?.id) {
      markSeen(current.id);
    }
    setQueue((prev) => prev.slice(1));
  }, [queue, markSeen]);

  // Skip all dialogues in queue
  const skipDialog = useCallback(() => {
    queue.forEach((d) => {
      if (d.id) markSeen(d.id);
    });
    setQueue([]);
    setCurrentDialog(null);
  }, [queue, markSeen]);

  // Start the 8-box guided tour if any part is unseen
  const startGuidedTour = useCallback(() => {
    const unseenTour = guidedTour.filter((d) => !seen.has(d.id));
    if (unseenTour.length > 0) {
      setQueue((prev) => {
        // avoid duplicate queueing
        const existingIds = new Set(prev.map((d) => d.id));
        const toAdd = unseenTour.filter((d) => !existingIds.has(d.id));
        return [...prev, ...toAdd];
      });
    }
  }, [seen]);

  // Trigger a specific dialogue (e.g. from narrative event or first launch)
  const triggerDialog = useCallback(
    (idOrDialog: string | Dialogue) => {
      let dialogToQueue: Dialogue | undefined;

      if (typeof idOrDialog === 'string') {
        dialogToQueue =
          narrativeDialogues[idOrDialog] ??
          dialogues.find((d) => d.id === idOrDialog);
      } else {
        dialogToQueue = idOrDialog;
      }

      if (!dialogToQueue) return;

      // If marked as once and already seen, do not trigger
      if (dialogToQueue.once && seen.has(dialogToQueue.id)) {
        return;
      }

      setQueue((prev) => {
        if (prev.some((d) => d.id === dialogToQueue?.id)) {
          return prev;
        }
        return [...prev, dialogToQueue!];
      });
    },
    [seen]
  );

  return {
    currentDialog,
    isDialogActive,
    queue,
    seen,
    startGuidedTour,
    triggerDialog,
    advanceDialog,
    skipDialog,
  };
}

export default useDialogRunner;
