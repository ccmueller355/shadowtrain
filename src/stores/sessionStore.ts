// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { Vibration } from 'react-native';
import { create } from 'zustand';
import {
  DatabaseClient,
  getActiveSession,
  getDatabase,
  getLastWorkingSetsForExercise,
  listRecentSessions,
  saveSession,
} from '../db';
import { buildSetsFromSuggestion, Suggestion } from '../engine/suggest';
import { Entry, Exercise, Session, SetRecord } from '../types';

export function getDefaultRestSeconds(exercise?: Exercise): number {
  if (!exercise) return 90;
  if (exercise.trackingType === 'duration' || exercise.equipment === 'stretching') {
    return 60;
  }
  return 90;
}

export function formatLastDoneSummary(
  sets: SetRecord[] | null,
  trackingType: 'reps' | 'duration' = 'reps',
): string | null {
  if (!sets || sets.length === 0) return null;
  const working = sets.filter((s) => !s.isWarmup);
  if (working.length === 0) return null;

  const first = working[0];
  if (trackingType === 'duration' || first.durationSec !== undefined) {
    const sec = first.durationSec ?? 45;
    return `LAST DONE // ${working.length} × ${sec}s`;
  }

  const reps = first.reps ?? 8;
  const weightLabel = first.weight && first.weight > 0 ? `${first.weight}kg` : 'BW';
  return `LAST DONE // ${working.length} × ${weightLabel} × ${reps}`;
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
  lastDoneCache: Record<string, SetRecord[]>;
  restTimerSec: number;
  restTimerRunning: boolean;
  startSession: (customId?: string, name?: string) => Session;
  updateSessionName: (name: string) => void;
  getLastWorkingSets: (exerciseId: string) => SetRecord[] | null;
  fetchLastWorkingSetsFromDb: (
    exerciseId: string,
    db?: DatabaseClient,
  ) => Promise<SetRecord[] | null>;
  addExerciseEntry: (
    exercise: Exercise,
    options?: {
      fixedKettlebellWeight?: number;
      repMin?: number;
      lastWorkingSets?: SetRecord[] | null;
    },
  ) => Entry;
  removeExerciseEntry: (entryId: string) => void;
  applySuggestionToEntry: (entryId: string, suggestion: Suggestion) => void;
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

function cloneWorkingSetsForPrefill(workingSets: SetRecord[]): SetRecord[] {
  return workingSets.map((s) => ({
    id: nextUid('set'),
    ...(s.reps !== undefined ? { reps: s.reps } : {}),
    ...(s.weight !== undefined ? { weight: s.weight } : {}),
    ...(s.durationSec !== undefined ? { durationSec: s.durationSec } : {}),
    ...(s.rpe !== undefined ? { rpe: s.rpe } : {}),
    completed: false,
    isWarmup: false,
  }));
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,
  recentSessions: [],
  lastDoneCache: {},
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

  getLastWorkingSets: (exerciseId) => {
    const { recentSessions, lastDoneCache } = get();
    for (const session of recentSessions) {
      if (session.finishedAt === undefined) continue;
      for (const entry of session.entries) {
        if (entry.exerciseId !== exerciseId) continue;
        const working = entry.sets.filter((s) => !s.isWarmup);
        if (working.length > 0) {
          return working;
        }
      }
    }
    return lastDoneCache[exerciseId] ?? null;
  },

  fetchLastWorkingSetsFromDb: async (exerciseId, db) => {
    try {
      const client = db ?? getDatabase();
      const sets = await getLastWorkingSetsForExercise(client, exerciseId);
      if (sets && sets.length > 0) {
        set((state) => ({
          lastDoneCache: { ...state.lastDoneCache, [exerciseId]: sets },
        }));
        return sets;
      }
    } catch {
      // Ignore if DB singleton not initialized
    }
    return null;
  },

  addExerciseEntry: (exercise, options) => {
    const current = get().activeSession ?? get().startSession();
    const entryId = nextUid('entry');
    const fixedKb = options?.fixedKettlebellWeight ?? 16;
    const repMin = options?.repMin ?? 8;

    const priorWorkingSets = (
      options?.lastWorkingSets !== undefined
        ? options.lastWorkingSets
        : get().getLastWorkingSets(exercise.id)
    )?.filter((s) => !s.isWarmup);

    const initialSets: SetRecord[] =
      priorWorkingSets && priorWorkingSets.length > 0
        ? cloneWorkingSetsForPrefill(priorWorkingSets)
        : [0, 1, 2].map(() => buildDefaultSet(nextUid('set'), exercise, fixedKb, repMin));

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

    if (!priorWorkingSets || priorWorkingSets.length === 0) {
      void get()
        .fetchLastWorkingSetsFromDb(exercise.id)
        .then((dbSets) => {
          if (!dbSets || dbSets.length === 0) return;
          const active = get().activeSession;
          if (!active) return;
          const targetEntry = active.entries.find((e) => e.id === entryId);
          if (!targetEntry || targetEntry.sets.some((s) => s.completed)) return;
          const prefilled = cloneWorkingSetsForPrefill(dbSets);
          const nextActive: Session = {
            ...active,
            entries: active.entries.map((e) => (e.id === entryId ? { ...e, sets: prefilled } : e)),
          };
          set({ activeSession: nextActive });
          tryPersistSessionToDb(nextActive);
        });
    }

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

  applySuggestionToEntry: (entryId, suggestion) => {
    const current = get().activeSession;
    if (!current) return;
    const suggestedSets = buildSetsFromSuggestion(suggestion, () => nextUid('set'));
    const entries = current.entries.map((e) => {
      if (e.id !== entryId) return e;
      const warmups = e.sets.filter((s) => s.isWarmup);
      return {
        ...e,
        sets: [...warmups, ...suggestedSets],
      };
    });
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

    const nextCache = { ...get().lastDoneCache };
    for (const entry of finished.entries) {
      const working = entry.sets.filter((s) => !s.isWarmup);
      if (working.length > 0) {
        nextCache[entry.exerciseId] = working;
      }
    }

    const recentSessions = [
      finished,
      ...get().recentSessions.filter((s) => s.id !== finished.id),
    ].slice(0, 60);

    set({
      activeSession: null,
      recentSessions,
      lastDoneCache: nextCache,
      restTimerSec: 0,
      restTimerRunning: false,
    });
    tryPersistSessionToDb(finished);
    return finished;
  },

  hydrateSessionsFromDb: async (db) => {
    const client = db ?? getDatabase();
    const active = await getActiveSession(client);
    const allRecent = await listRecentSessions(client, 60);
    const finishedRecent = allRecent.filter((s) => s.finishedAt !== undefined).slice(0, 60);
    set({
      activeSession: active,
      recentSessions: finishedRecent,
    });
  },

  resetSessionStore: () => {
    set({
      activeSession: null,
      recentSessions: [],
      lastDoneCache: {},
      restTimerSec: 0,
      restTimerRunning: false,
    });
  },
}));
