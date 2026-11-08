// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { Vibration } from 'react-native';
import { create } from 'zustand';
import {
  DatabaseClient,
  getActiveSession,
  getDatabase,
  listRecentSessions,
  saveSession,
} from '../db';
import { Entry, Exercise, Session, SetRecord } from '../types';

export function getDefaultRestSeconds(exercise?: Exercise): number {
  if (!exercise) return 90;
  if (exercise.trackingType === 'duration' || exercise.equipment === 'stretching') {
    return 60;
  }
  return 90;
}

export function buildDefaultSet(
  id: string,
  exercise: Exercise,
  fixedKettlebellWeight = 16,
  repMin = 8,
): SetRecord {
  if (exercise.trackingType === 'duration') {
    return {
      id,
      durationSec: exercise.equipment === 'jump_rope' ? 120 : 45,
      completed: false,
      isWarmup: false,
    };
  }

  const defaultWeight =
    exercise.equipment === 'kettlebell'
      ? fixedKettlebellWeight
      : exercise.equipment === 'bodyweight' ||
          exercise.equipment === 'rings' ||
          exercise.equipment === 'hand_gripper'
        ? 0
        : 20;

  return {
    id,
    reps: repMin,
    weight: defaultWeight,
    completed: false,
    isWarmup: false,
  };
}

function tryPersistSessionToDb(session: Session): void {
  try {
    const db = getDatabase();
    void saveSession(db, session);
  } catch {
    // Database singleton not yet initialized (e.g. unit test without DB); memory state still updates
  }
}

export interface SessionState {
  activeSession: Session | null;
  recentSessions: Session[];
  restTimerSec: number;
  restTimerRunning: boolean;
  startSession: (customId?: string, name?: string) => Session;
  updateSessionName: (name: string) => void;
  addExerciseEntry: (
    exercise: Exercise,
    options?: { fixedKettlebellWeight?: number; repMin?: number },
  ) => Entry;
  removeExerciseEntry: (entryId: string) => void;
  addSet: (entryId: string, exercise?: Exercise) => void;
  updateSet: (entryId: string, setId: string, patch: Partial<SetRecord>) => void;
  toggleSetComplete: (entryId: string, setId: string, restSec?: number) => void;
  removeSet: (entryId: string, setId: string) => void;
  tickRestTimer: () => void;
  adjustRestTimer: (deltaSec: number) => void;
  stopRestTimer: () => void;
  finishActiveSession: (notes?: string) => Session | null;
  hydrateSessionsFromDb: (db?: DatabaseClient) => Promise<void>;
  resetSessionStore: () => void;
}

let idCounter = 1;
function nextUid(prefix: string): string {
  const uid = `${prefix}-${Date.now()}-${idCounter}`;
  idCounter += 1;
  return uid;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,
  recentSessions: [],
  restTimerSec: 0,
  restTimerRunning: false,

  startSession: (customId, name) => {
    const existing = get().activeSession;
    if (existing && (!customId || existing.id === customId)) {
      return existing;
    }

    const now = Date.now();
    const dateLabel = new Date(now).toISOString().slice(0, 10);
    const session: Session = {
      id: customId ?? nextUid('session'),
      startedAt: now,
      name: name ?? `Session · ${dateLabel}`,
      entries: [],
    };

    set({ activeSession: session });
    tryPersistSessionToDb(session);
    return session;
  },

  updateSessionName: (name) => {
    const current = get().activeSession;
    if (!current) return;
    const updated: Session = { ...current, name };
    set({ activeSession: updated });
    tryPersistSessionToDb(updated);
  },

  addExerciseEntry: (exercise, options) => {
    const current = get().activeSession ?? get().startSession();
    const entryId = nextUid('entry');
    const fixedKb = options?.fixedKettlebellWeight ?? 16;
    const repMin = options?.repMin ?? 8;

    const initialSets: SetRecord[] = [0, 1, 2].map(() =>
      buildDefaultSet(nextUid('set'), exercise, fixedKb, repMin),
    );

    const newEntry: Entry = {
      id: entryId,
      exerciseId: exercise.id,
      position: current.entries.length,
      sets: initialSets,
    };

    const updated: Session = {
      ...current,
      entries: [...current.entries, newEntry],
    };

    set({ activeSession: updated });
    tryPersistSessionToDb(updated);
    return newEntry;
  },

  removeExerciseEntry: (entryId) => {
    const current = get().activeSession;
    if (!current) return;
    const entries = current.entries
      .filter((e) => e.id !== entryId)
      .map((e, idx) => ({ ...e, position: idx }));
    const updated: Session = { ...current, entries };
    set({ activeSession: updated });
    tryPersistSessionToDb(updated);
  },

  addSet: (entryId, exercise) => {
    const current = get().activeSession;
    if (!current) return;
    const entries = current.entries.map((entry) => {
      if (entry.id !== entryId) return entry;
      const lastSet = entry.sets[entry.sets.length - 1];
      const nextSet: SetRecord = lastSet
        ? {
            ...lastSet,
            id: nextUid('set'),
            completed: false,
          }
        : buildDefaultSet(
            nextUid('set'),
            exercise ?? {
              id: entry.exerciseId,
              name: entry.exerciseId,
              primaryMuscles: [],
              equipment: 'kettlebell',
              trackingType: 'reps',
            },
          );
      return { ...entry, sets: [...entry.sets, nextSet] };
    });
    const updated: Session = { ...current, entries };
    set({ activeSession: updated });
    tryPersistSessionToDb(updated);
  },

  updateSet: (entryId, setId, patch) => {
    const current = get().activeSession;
    if (!current) return;
    const entries = current.entries.map((entry) => {
      if (entry.id !== entryId) return entry;
      return {
        ...entry,
        sets: entry.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
      };
    });
    const updated: Session = { ...current, entries };
    set({ activeSession: updated });
    tryPersistSessionToDb(updated);
  },

  toggleSetComplete: (entryId, setId, restSec = 90) => {
    const current = get().activeSession;
    if (!current) return;
    let newlyCompleted = false;

    const entries = current.entries.map((entry) => {
      if (entry.id !== entryId) return entry;
      return {
        ...entry,
        sets: entry.sets.map((s) => {
          if (s.id !== setId) return s;
          newlyCompleted = !s.completed;
          return { ...s, completed: newlyCompleted };
        }),
      };
    });

    const updated: Session = { ...current, entries };
    set({
      activeSession: updated,
      ...(newlyCompleted ? { restTimerSec: restSec, restTimerRunning: true } : {}),
    });
    tryPersistSessionToDb(updated);
  },

  removeSet: (entryId, setId) => {
    const current = get().activeSession;
    if (!current) return;
    const entries = current.entries.map((entry) => {
      if (entry.id !== entryId) return entry;
      return {
        ...entry,
        sets: entry.sets.filter((s) => s.id !== setId),
      };
    });
    const updated: Session = { ...current, entries };
    set({ activeSession: updated });
    tryPersistSessionToDb(updated);
  },

  tickRestTimer: () => {
    const { restTimerSec, restTimerRunning } = get();
    if (!restTimerRunning) return;
    if (restTimerSec <= 1) {
      set({ restTimerSec: 0, restTimerRunning: false });
      try {
        Vibration.vibrate(300);
      } catch {
        // Ignore vibration errors in headless/test environments
      }
      return;
    }
    set({ restTimerSec: restTimerSec - 1 });
  },

  adjustRestTimer: (deltaSec) => {
    const next = Math.max(0, get().restTimerSec + deltaSec);
    set({
      restTimerSec: next,
      restTimerRunning: next > 0,
    });
  },

  stopRestTimer: () => {
    set({ restTimerSec: 0, restTimerRunning: false });
  },

  finishActiveSession: (notes) => {
    const current = get().activeSession;
    if (!current) return null;

    const finished: Session = {
      ...current,
      finishedAt: Date.now(),
      ...(notes !== undefined ? { notes } : {}),
    };

    const recentSessions = [
      finished,
      ...get().recentSessions.filter((s) => s.id !== finished.id),
    ].slice(0, 5);

    set({
      activeSession: null,
      recentSessions,
      restTimerSec: 0,
      restTimerRunning: false,
    });
    tryPersistSessionToDb(finished);
    return finished;
  },

  hydrateSessionsFromDb: async (db) => {
    const client = db ?? getDatabase();
    const active = await getActiveSession(client);
    const allRecent = await listRecentSessions(client, 6);
    const finishedRecent = allRecent.filter((s) => s.finishedAt !== undefined).slice(0, 5);
    set({
      activeSession: active,
      recentSessions: finishedRecent,
    });
  },

  resetSessionStore: () => {
    set({
      activeSession: null,
      recentSessions: [],
      restTimerSec: 0,
      restTimerRunning: false,
    });
  },
}));
