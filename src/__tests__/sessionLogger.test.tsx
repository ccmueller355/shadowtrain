// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { Vibration } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import HomeScreen from '../../app/(tabs)/index';
import SessionLoggerScreen from '../../app/session/[id]';
import {
  DatabaseClient,
  DEFAULT_SEED_EXERCISES,
  initDatabase,
  resetDatabaseSingleton,
  saveSession,
} from '../db';
import { bootstrapLocalDatabase } from '../navigation/AppNavigator';
import { useExerciseStore } from '../stores/exerciseStore';
import { DEFAULT_PROFILE, useProfileStore } from '../stores/profileStore';
import { buildDefaultSet, getDefaultRestSeconds, useSessionStore } from '../stores/sessionStore';

class LoggerFakeDb implements DatabaseClient {
  public savedSessions = new Map<string, { finished_at: number | null; started_at: number }>();

  async execAsync(): Promise<void> {}
  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }
  async runAsync(
    source: string,
    params: (string | number | null)[] = [],
  ): Promise<{ changes: number; lastInsertRowId: number }> {
    if (source.includes('INSERT INTO sessions')) {
      const [id, started_at, finished_at] = params;
      this.savedSessions.set(String(id), {
        started_at: Number(started_at),
        finished_at: finished_at !== null ? Number(finished_at) : null,
      });
    }
    return { changes: 1, lastInsertRowId: 1 };
  }
  async getFirstAsync<T>(source: string): Promise<T | null> {
    if (source.includes('PRAGMA user_version')) {
      return { user_version: 1 } as unknown as T;
    }
    if (source.includes('COUNT(*)')) {
      return { count: 45 } as unknown as T;
    }
    if (source.includes('WHERE finished_at IS NULL')) {
      return {
        id: 'hydrated-active',
        started_at: 1700000000000,
        finished_at: null,
        name: 'Hydrated Active Session',
        notes: null,
      } as unknown as T;
    }
    return null;
  }
  async getAllAsync<T>(source: string): Promise<T[]> {
    if (source.includes('SELECT * FROM sessions ORDER BY started_at DESC')) {
      return [
        {
          id: 'hydrated-active',
          started_at: 1700000000000,
          finished_at: null,
          name: 'Hydrated Active Session',
          notes: null,
        },
        {
          id: 'hydrated-finished-1',
          started_at: 1699900000000,
          finished_at: 1699903600000,
          name: 'Completed KB Session',
          notes: 'Strong swings',
        },
      ] as unknown as T[];
    }
    return [];
  }
}

describe('M3 Session Logger, Rest Timer, Home Resume & Session Store', () => {
  beforeEach(() => {
    jest.useRealTimers();
    resetDatabaseSingleton();
    useProfileStore.setState({
      profile: DEFAULT_PROFILE,
      theme: 'fixer',
    });
    useExerciseStore.getState().resetFilters();
    useExerciseStore.setState({
      exercises: [...DEFAULT_SEED_EXERCISES].sort((a, b) => a.name.localeCompare(b.name)),
      hydrated: true,
    });
    useSessionStore.getState().resetSessionStore();
  });

  describe('buildDefaultSet & getDefaultRestSeconds helpers', () => {
    it('computes default rest and initial set payloads across equipment types', () => {
      expect(getDefaultRestSeconds()).toBe(90);

      const kbEx = DEFAULT_SEED_EXERCISES.find((e) => e.id === 'kb-swing-two-hand')!;
      const ropeEx = DEFAULT_SEED_EXERCISES.find((e) => e.id === 'rope-basic-bounce')!;
      const bwEx = DEFAULT_SEED_EXERCISES.find((e) => e.id === 'bw-push-up')!;
      const bbEx = DEFAULT_SEED_EXERCISES.find((e) => e.id === 'barbell-back-squat')!;

      expect(getDefaultRestSeconds(kbEx)).toBe(90);
      expect(getDefaultRestSeconds(ropeEx)).toBe(60);

      expect(buildDefaultSet('s1', kbEx, 24, 5)).toEqual({
        id: 's1',
        reps: 5,
        weight: 24,
        completed: false,
        isWarmup: false,
      });
      expect(buildDefaultSet('s2', ropeEx)).toEqual({
        id: 's2',
        durationSec: 120,
        completed: false,
        isWarmup: false,
      });
      expect(buildDefaultSet('s3', bwEx)).toEqual({
        id: 's3',
        reps: 8,
        weight: 0,
        completed: false,
        isWarmup: false,
      });
      expect(buildDefaultSet('s4', bbEx)).toEqual({
        id: 's4',
        reps: 8,
        weight: 20,
        completed: false,
        isWarmup: false,
      });
    });
  });

  describe('SessionLoggerScreen Full Workout Flow', () => {
    it('adds exercises via picker, logs sets, triggers rest timer, and finishes session', () => {
      jest.useFakeTimers();
      const vibrateSpy = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
      const onFinish = jest.fn();

      render(<SessionLoggerScreen sessionId="session-live-01" onFinishSession={onFinish} />);

      expect(screen.getByText('SESSION LOGGER // session-live-01')).toBeTruthy();
      expect(screen.getByText(/No exercises in session yet\. Tap \+ ADD EXERCISE/i)).toBeTruthy();

      // Edit session name
      fireEvent.changeText(screen.getByTestId('session-name-input'), 'Morning KB & Rings');
      expect(useSessionStore.getState().activeSession?.name).toBe('Morning KB & Rings');

      // Open Exercise Picker, then close it
      fireEvent.press(screen.getByTestId('open-exercise-picker-btn'));
      expect(screen.getByTestId('session-exercise-picker')).toBeTruthy();
      fireEvent.press(screen.getByTestId('close-exercise-picker-btn'));
      expect(screen.getByTestId('screen-session-logger')).toBeTruthy();

      // Open Exercise Picker and select Two-Hand Kettlebell Swing (reps)
      fireEvent.press(screen.getByTestId('open-exercise-picker-btn'));
      fireEvent.press(screen.getByTestId('exercise-item-kb-swing-two-hand'));
      expect(screen.getByText('Two-Hand Kettlebell Swing')).toBeTruthy();

      // Also add Ring Support Hold (duration)
      fireEvent.press(screen.getByTestId('open-exercise-picker-btn'));
      fireEvent.press(screen.getByTestId('exercise-item-ring-support-hold'));
      expect(screen.getByText('Ring Support Hold')).toBeTruthy();

      const session = useSessionStore.getState().activeSession!;
      expect(session.entries).toHaveLength(2);
      const swingEntry = session.entries[0];
      const holdEntry = session.entries[1];
      const firstSwingSet = swingEntry.sets[0];
      const firstHoldSet = holdEntry.sets[0];

      // Update weight & reps on swing set
      fireEvent.changeText(screen.getByTestId(`set-weight-${firstSwingSet.id}`), '24');
      fireEvent.changeText(screen.getByTestId(`set-reps-${firstSwingSet.id}`), '12');

      // Update duration on hold set
      fireEvent.changeText(screen.getByTestId(`set-duration-${firstHoldSet.id}`), '60');

      // Toggle warmup flag on first swing set
      fireEvent.press(screen.getByTestId(`toggle-warmup-${firstSwingSet.id}`));
      expect(useSessionStore.getState().activeSession?.entries[0].sets[0].isWarmup).toBe(true);

      // Check off first swing set -> starts 90s rest timer
      fireEvent.press(screen.getByTestId(`check-set-${firstSwingSet.id}`));
      expect(screen.getByTestId('rest-timer-banner')).toBeTruthy();
      expect(screen.getByText('REST TIMER // 90s')).toBeTruthy();

      // Add +15s to rest timer -> 105s
      fireEvent.press(screen.getByTestId('rest-timer-plus-15'));
      expect(screen.getByText('REST TIMER // 105s')).toBeTruthy();

      // Advance timer by 2 seconds -> 103s
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(screen.getByText('REST TIMER // 103s')).toBeTruthy();

      // Adjust rest timer down to 1s and tick to 0 -> triggers vibration
      act(() => {
        useSessionStore.getState().adjustRestTimer(-102);
        useSessionStore.getState().tickRestTimer();
      });
      expect(vibrateSpy).toHaveBeenCalledWith(300);
      expect(screen.queryByTestId('rest-timer-banner')).toBeNull();

      // Re-trigger timer and skip it
      fireEvent.press(screen.getByTestId(`check-set-${firstHoldSet.id}`));
      expect(screen.getByTestId('rest-timer-banner')).toBeTruthy();
      fireEvent.press(screen.getByTestId('rest-timer-skip'));
      expect(screen.queryByTestId('rest-timer-banner')).toBeNull();

      // Add a 4th set and remove a set
      fireEvent.press(screen.getByTestId(`add-set-${swingEntry.id}`));
      expect(useSessionStore.getState().activeSession?.entries[0].sets).toHaveLength(4);

      fireEvent.press(screen.getByTestId(`remove-set-${firstSwingSet.id}`));
      expect(useSessionStore.getState().activeSession?.entries[0].sets).toHaveLength(3);

      // Remove second entry
      fireEvent.press(screen.getByTestId(`remove-entry-${holdEntry.id}`));
      expect(useSessionStore.getState().activeSession?.entries).toHaveLength(1);

      // Finish session
      fireEvent.press(screen.getByTestId('finish-session-btn'));
      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(useSessionStore.getState().activeSession).toBeNull();
      expect(useSessionStore.getState().recentSessions).toHaveLength(1);

      vibrateSpy.mockRestore();
    });
  });

  describe('HomeScreen Resume Banner & Recent Sessions List', () => {
    it('shows resume banner when a session is active and renders recent sessions after finish', () => {
      const onStartSession = jest.fn();

      act(() => {
        useSessionStore.getState().startSession('session-active-99', 'Evening Rings');
      });

      const { rerender } = render(<HomeScreen onStartSession={onStartSession} />);
      expect(screen.getByText('ACTIVE SESSION IN PROGRESS')).toBeTruthy();
      expect(screen.getByText(/Evening Rings · 0 EXERCISES/)).toBeTruthy();

      fireEvent.press(screen.getByTestId('resume-session-btn'));
      expect(onStartSession).toHaveBeenCalledWith('session-active-99');

      act(() => {
        useSessionStore.getState().finishActiveSession('Done');
      });

      rerender(<HomeScreen onStartSession={onStartSession} />);
      expect(screen.queryByText('ACTIVE SESSION IN PROGRESS')).toBeNull();
      expect(screen.getByTestId('recent-session-session-active-99')).toBeTruthy();
      expect(screen.getByText('0 EXERCISES · 0 SETS COMPLETED')).toBeTruthy();
    });

    it('hydrates active and recent sessions from SQLite via bootstrapLocalDatabase', async () => {
      const fakeDb = new LoggerFakeDb();
      await initDatabase('test.db', fakeDb);
      await bootstrapLocalDatabase();

      expect(useSessionStore.getState().activeSession?.id).toBe('hydrated-active');
      expect(useSessionStore.getState().recentSessions.map((s) => s.id)).toEqual([
        'hydrated-finished-1',
      ]);

      // Also verify tryPersistSessionToDb writes to initialized DB
      useSessionStore.getState().updateSessionName('Updated Name');
      await saveSession(fakeDb, useSessionStore.getState().activeSession!);
      expect(fakeDb.savedSessions.has('hydrated-active')).toBe(true);
    });
  });
});
