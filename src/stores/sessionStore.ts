// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { Vibration } from 'react-native';
import { create } from 'zustand';
import {
  DatabaseClient,
  deleteSession,
  getActiveSession,
  getDatabase,
  getLastWorkingSetsForExercise,
  listRecentSessions,
  saveSession,
} from '../db';
import { PlannedWorkout } from '../engine/plan';
import {
  createIntervalTimer,
  INITIAL_INTERVAL_STATE,
  INTERVAL_PRESETS,
  IntervalTimerConfig,
  IntervalTimerState,
  tickIntervalTimer,
} from '../engine/intervalTimer';
import { buildEntriesFromCultWorkout, CultProgram, ProgramWorkout } from '../engine/programs';
import { buildSetsFromSuggestion, Suggestion } from '../engine/suggest';
import { Entry, Exercise, Session, SetRecord } from '../types';
import { useProfileStore } from './profileStore';

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

function tryDeleteSessionFromDb(sessionId: string): void {
  try {
    const db = getDatabase();
    void deleteSession(db, sessionId);
  } catch {
    // Database singleton not yet initialized
  }
}

export interface SessionState {
  activeSession: Session | null;
  recentSessions: Session[];
  lastDoneCache: Record<string, SetRecord[]>;
  restTimerSec: number;
  restTimerRunning: boolean;
  intervalTimer: IntervalTimerState;
  startSession: (customId?: string, name?: string) => Session;
  startPlannedSession: (plan: PlannedWorkout, customId?: string) => Session;
  startProgramSession: (program: CultProgram, workoutIndex?: number, customId?: string) => Session;
  openExistingSession: (sessionId: string) => Session | null;
  cancelOrDeleteSession: (sessionId?: string) => void;
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
  startIntervalTimer: (configOrPreset: string | Partial<IntervalTimerConfig>) => void;
  toggleIntervalTimerRunning: () => void;
  resetIntervalTimer: () => void;
  stopIntervalTimer: () => void;
  tickIntervalTimerStep: () => void;
  finishActiveSession: (notes?: string) => Session | null;
  restoreSessionsFromBackup: (sessions: Session[]) => void;
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
  intervalTimer: INITIAL_INTERVAL_STATE,

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

  startPlannedSession: (plan, customId) => {
    const now = Date.now();
    const entries: Entry[] = plan.items.map((item, idx) => ({
      id: nextUid('entry'),
      exerciseId: item.exercise.id,
      position: idx,
      sets: buildSetsFromSuggestion(item.suggestion, () => nextUid('set')),
    }));

    const session: Session = {
      id: customId ?? nextUid('session'),
      startedAt: now,
      name: plan.title,
      entries,
    };

    set({ activeSession: session });
    tryPersistSessionToDb(session);
    return session;
  },

  startProgramSession: (program, workoutIndex = 0, customId) => {
    const profile = useProfileStore.getState().profile;
    const workout = program.workouts[workoutIndex] ?? program.workouts[0];
    const now = Date.now();
    const entries = buildEntriesFromCultWorkout(workout, profile, (prefix) => nextUid(prefix));

    const session: Session = {
      id: customId ?? nextUid('session'),
      startedAt: now,
      name: `${program.name} · ${workout.title}`,
      entries,
    };

    let nextInterval = get().intervalTimer;
    if (workout.timerConfig) {
      nextInterval = createIntervalTimer({
        mode: workout.recommendedTimerMode === 'rest' ? 'emom' : workout.recommendedTimerMode,
        rounds: workout.timerConfig.rounds,
        workSec: workout.timerConfig.workSec,
        restSec: workout.timerConfig.restSec,
      });
    }

    set({ activeSession: session, intervalTimer: nextInterval });
    tryPersistSessionToDb(session);
    return session;
  },

  openExistingSession: (sessionId) => {
    const active = get().activeSession;
    if (active && active.id === sessionId) {
      return active;
    }
    const found = get().recentSessions.find((s) => s.id === sessionId);
    if (!found) return null;
    set({ activeSession: found });
    return found;
  },

  cancelOrDeleteSession: (sessionId) => {
    const active = get().activeSession;
    const targetId = sessionId ?? active?.id;
    if (!targetId) return;

    const nextActive = active && active.id === targetId ? null : active;
    const nextRecent = get().recentSessions.filter((s) => s.id !== targetId);

    set({
      activeSession: nextActive,
      recentSessions: nextRecent,
      ...(nextActive === null ? { restTimerSec: 0, restTimerRunning: false } : {}),
    });
    tryDeleteSessionFromDb(targetId);
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

  startIntervalTimer: (configOrPreset) => {
    let timerState: IntervalTimerState;
    if (typeof configOrPreset === 'string') {
      const preset = INTERVAL_PRESETS[configOrPreset];
      timerState = preset
        ? createIntervalTimer(preset.config)
        : createIntervalTimer({ mode: 'emom' });
    } else {
      timerState = createIntervalTimer(configOrPreset);
    }
    set({ intervalTimer: { ...timerState, running: true } });
  },

  toggleIntervalTimerRunning: () => {
    const current = get().intervalTimer;
    if (current.phase === 'complete') {
      const reset = createIntervalTimer({
        mode: current.mode,
        rounds: current.totalRounds,
        workSec: current.workSec,
        restSec: current.restSec,
        prepSec: current.prepSec,
      });
      set({ intervalTimer: { ...reset, running: true } });
      return;
    }
    set({ intervalTimer: { ...current, running: !current.running } });
  },

  resetIntervalTimer: () => {
    const current = get().intervalTimer;
    const reset = createIntervalTimer({
      mode: current.mode,
      rounds: current.totalRounds,
      workSec: current.workSec,
      restSec: current.restSec,
      prepSec: current.prepSec,
    });
    set({ intervalTimer: reset });
  },

  stopIntervalTimer: () => {
    set({ intervalTimer: INITIAL_INTERVAL_STATE });
  },

  tickIntervalTimerStep: () => {
    const current = get().intervalTimer;
    if (!current.running) return;
    const result = tickIntervalTimer(current);
    if (result.didPhaseChange || result.didRoundChange || result.didComplete) {
      try {
        Vibration.vibrate(200);
      } catch {
        // Ignore in test env
      }
    }
    set({ intervalTimer: result.nextState });
  },

  finishActiveSession: (notes) => {
    const current = get().activeSession;
    if (!current) return null;

    const wasAlreadyFinished = current.finishedAt !== undefined;
    const finished: Session = {
      ...current,
      finishedAt: current.finishedAt ?? Date.now(),
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
      intervalTimer: INITIAL_INTERVAL_STATE,
    });
    if (!wasAlreadyFinished) {
      useProfileStore.getState().addCreds(25);
    }
    tryPersistSessionToDb(finished);
    return finished;
  },

  restoreSessionsFromBackup: (sessions) => {
    const finished = sessions
      .filter((s) => s.finishedAt !== undefined)
      .slice()
      .sort((a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt))
      .slice(0, 60);
    const active = sessions.find((s) => s.finishedAt === undefined) ?? null;

    set({
      activeSession: active,
      recentSessions: finished,
    });

    for (const s of sessions) {
      tryPersistSessionToDb(s);
    }
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
      intervalTimer: INITIAL_INTERVAL_STATE,
    });
  },
}));
