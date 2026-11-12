// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ProgressScreen from '../../app/(tabs)/progress';
import { DEFAULT_SEED_EXERCISES } from '../db';
import {
  computeIntensityLevel,
  computePersonalRecords,
  computeProgressSnapshot,
  computeSetVolume,
} from '../engine/analytics';
import { useExerciseStore } from '../stores/exerciseStore';
import { DEFAULT_PROFILE, useProfileStore } from '../stores/profileStore';
import { useSessionStore } from '../stores/sessionStore';
import { Session } from '../types';

const BASE_NOW = Date.UTC(2026, 10, 9, 12, 0, 0); // 2026-11-09T12:00:00Z
const DAY_MS = 24 * 60 * 60 * 1000;

function makeSampleSessions(): Session[] {
  return [
    {
      id: 'sess-latest',
      name: 'KB & Rings Heavy',
      startedAt: BASE_NOW - 2 * 3600 * 1000,
      finishedAt: BASE_NOW - 3600 * 1000,
      entries: [
        {
          id: 'e-kb-1',
          exerciseId: 'kb-swing-two-hand',
          position: 0,
          sets: [
            { id: 'w1', reps: 10, weight: 16, completed: true, isWarmup: true },
            ...Array.from({ length: 6 }, (_, i) => ({
              id: `s-${i}`,
              reps: 15,
              weight: 24,
              completed: true,
              isWarmup: false,
            })),
          ],
        },
        {
          id: 'e-ring-1',
          exerciseId: 'ring-support-hold',
          position: 1,
          sets: [
            { id: 'r1', durationSec: 60, completed: true, isWarmup: false },
            { id: 'r2', durationSec: 75, completed: true, isWarmup: false },
            { id: 'r3', durationSec: 0, completed: true, isWarmup: false },
          ],
        },
        {
          id: 'e-bw-1',
          exerciseId: 'bw-push-up',
          position: 2,
          sets: Array.from({ length: 6 }, (_, i) => ({
            id: `bw-${i}`,
            reps: 20,
            weight: 0,
            completed: true,
            isWarmup: false,
          })),
        },
      ],
    },
    {
      id: 'sess-mid-week',
      name: 'Midweek Moderate',
      startedAt: BASE_NOW - 2 * DAY_MS,
      finishedAt: BASE_NOW - 2 * DAY_MS + 1800 * 1000,
      entries: [
        {
          id: 'e-kb-2',
          exerciseId: 'kb-swing-two-hand',
          position: 0,
          sets: Array.from({ length: 8 }, (_, i) => ({
            id: `m-${i}`,
            reps: 12,
            weight: 20,
            completed: true,
            isWarmup: false,
          })),
        },
      ],
    },
    {
      id: 'sess-light-day',
      name: 'Light Mobility',
      startedAt: BASE_NOW - 4 * DAY_MS,
      finishedAt: BASE_NOW - 4 * DAY_MS + 900 * 1000,
      entries: [
        {
          id: 'e-str-1',
          exerciseId: 'stretch-90-90-hip',
          position: 0,
          sets: [
            { id: 'st1', durationSec: 90, completed: true, isWarmup: false },
            { id: 'st2', durationSec: 90, completed: true, isWarmup: false },
          ],
        },
      ],
    },
    {
      id: 'sess-prev-week',
      name: 'Last Week Session',
      startedAt: BASE_NOW - 10 * DAY_MS,
      finishedAt: BASE_NOW - 10 * DAY_MS + 1800 * 1000,
      entries: [
        {
          id: 'e-unknown',
          exerciseId: 'custom-unknown-move',
          position: 0,
          sets: [
            { id: 'u1', reps: 10, weight: 0, completed: true, isWarmup: false },
            { id: 'u2', reps: 0, weight: 10, completed: true, isWarmup: false },
            { id: 'u3', reps: 0, weight: 0, completed: true, isWarmup: false },
          ],
        },
      ],
    },
    {
      id: 'sess-unfinished',
      name: 'In Progress Draft',
      startedAt: BASE_NOW,
      entries: [],
    },
  ];
}

describe('M6 Telemetry, Progress Snapshot, Personal Records & ProgressScreen', () => {
  beforeEach(() => {
    // Pin the clock: fixtures are relative to BASE_NOW, ProgressScreen reads Date.now()
    jest.spyOn(Date, 'now').mockReturnValue(BASE_NOW);
    useProfileStore.setState({
      profile: DEFAULT_PROFILE,
      theme: 'fixer',
    });
    useExerciseStore.setState({
      exercises: [...DEFAULT_SEED_EXERCISES],
      hydrated: true,
    });
    useSessionStore.getState().resetSessionStore();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('computeIntensityLevel & computeSetVolume pure helpers', () => {
    it('buckets working set counts into 0..3 intensity levels and computes set volume', () => {
      expect(computeIntensityLevel(0)).toBe(0);
      expect(computeIntensityLevel(-1)).toBe(0);
      expect(computeIntensityLevel(3)).toBe(1);
      expect(computeIntensityLevel(5)).toBe(1);
      expect(computeIntensityLevel(6)).toBe(2);
      expect(computeIntensityLevel(12)).toBe(2);
      expect(computeIntensityLevel(13)).toBe(3);

      expect(
        computeSetVolume({ id: '1', reps: 10, weight: 24, completed: true, isWarmup: false }),
      ).toBe(240);
      expect(
        computeSetVolume({ id: '2', reps: 10, weight: 24, completed: true, isWarmup: true }),
      ).toBe(0);
      expect(
        computeSetVolume({ id: '3', reps: 10, weight: 24, completed: false, isWarmup: false }),
      ).toBe(0);
      expect(
        computeSetVolume({ id: '4', reps: 15, weight: 0, completed: true, isWarmup: false }),
      ).toBe(0);
    });
  });

  describe('computeProgressSnapshot & computePersonalRecords', () => {
    it('computes last_workout, week, and month snapshots with offset navigation', () => {
      const sessions = makeSampleSessions();

      // Empty last_workout
      const emptyLast = computeProgressSnapshot(
        [],
        DEFAULT_SEED_EXERCISES,
        'last_workout',
        0,
        BASE_NOW,
      );
      expect(emptyLast.sessionsCount).toBe(0);
      expect(emptyLast.periodLabel).toBe('NO COMPLETED WORKOUTS');
      expect(emptyLast.canGoPrev).toBe(false);

      // Latest workout (offset 0)
      const last0 = computeProgressSnapshot(
        sessions,
        DEFAULT_SEED_EXERCISES,
        'last_workout',
        0,
        BASE_NOW,
      );
      expect(last0.sessionsCount).toBe(1);
      expect(last0.totalWorkingSets).toBe(15); // 6 KB + 3 Ring Hold + 6 Push-Up
      expect(last0.totalVolume).toBe(6 * 24 * 15); // 2160
      expect(last0.totalDurationSec).toBe(135); // 60 + 75
      expect(last0.canGoPrev).toBe(true);
      expect(last0.canGoNext).toBe(false);
      expect(last0.bars).toHaveLength(3);
      expect(last0.equipmentBreakdown).toHaveLength(3);

      // Previous workout (offset 1)
      const last1 = computeProgressSnapshot(
        sessions,
        DEFAULT_SEED_EXERCISES,
        'last_workout',
        1,
        BASE_NOW,
      );
      expect(last1.periodLabel).toContain('Midweek Moderate');
      expect(last1.canGoNext).toBe(true);

      // Week window (7 days)
      const week0 = computeProgressSnapshot(sessions, DEFAULT_SEED_EXERCISES, 'week', 0, BASE_NOW);
      expect(week0.heatmap).toHaveLength(7);
      expect(week0.sessionsCount).toBe(3);
      expect(week0.totalWorkingSets).toBe(25); // 15 + 8 + 2
      expect(week0.canGoPrev).toBe(true);

      // Month window (28 days, 4 weekly bars)
      const month0 = computeProgressSnapshot(
        sessions,
        DEFAULT_SEED_EXERCISES,
        'month',
        0,
        BASE_NOW,
      );
      expect(month0.heatmap).toHaveLength(28);
      expect(month0.bars).toHaveLength(4);
      expect(month0.sessionsCount).toBe(4);
    });

    it('computes personal records across weighted, bodyweight, and timed exercises', () => {
      const prs = computePersonalRecords(makeSampleSessions(), DEFAULT_SEED_EXERCISES, 'kg');
      expect(prs.length).toBeGreaterThanOrEqual(4);

      const swingPr = prs.find((p) => p.exerciseId === 'kb-swing-two-hand')!;
      expect(swingPr.badge).toBe('24kg × 15');

      const ringPr = prs.find((p) => p.exerciseId === 'ring-support-hold')!;
      expect(ringPr.badge).toBe('75s HOLD/ROPE');

      const pushupPr = prs.find((p) => p.exerciseId === 'bw-push-up')!;
      expect(pushupPr.badge).toBe('BW × 20 REPS');
    });
  });

  describe('ProgressScreen UI & Scrubber Navigation', () => {
    it('renders empty state and switches windows cleanly when no sessions exist', () => {
      render(<ProgressScreen />);

      expect(screen.getByTestId('screen-progress')).toBeTruthy();
      expect(screen.getByTestId('volume-bars-empty')).toBeTruthy();
      expect(screen.getByTestId('pr-board-empty')).toBeTruthy();

      fireEvent.press(screen.getByTestId('window-btn-last_workout'));
      expect(screen.getByTestId('heatmap-empty')).toBeTruthy();
    });

    it('renders populated telemetry, scrubs history with PREV/NEXT, and displays PR board', () => {
      useSessionStore.setState({
        recentSessions: makeSampleSessions().filter((s) => s.finishedAt !== undefined),
      });

      render(<ProgressScreen />);

      // Default window is WEEK
      expect(screen.getByTestId('stat-sessions').props.children).toBe(3);
      expect(screen.getByTestId('stat-sets').props.children).toBe(25);
      expect(screen.getByTestId('pr-row-kb-swing-two-hand')).toBeTruthy();
      expect(screen.getByText('24kg × 15')).toBeTruthy();

      // Scrub backward 1 week, then forward
      fireEvent.press(screen.getByTestId('period-prev-btn'));
      expect(screen.getByTestId('stat-sessions').props.children).toBe(1);

      fireEvent.press(screen.getByTestId('period-next-btn'));
      expect(screen.getByTestId('stat-sessions').props.children).toBe(3);

      // Switch to MONTH view
      fireEvent.press(screen.getByTestId('window-btn-month'));
      expect(screen.getByTestId('stat-sessions').props.children).toBe(4);
      expect(screen.getByTestId('volume-bar-week-1')).toBeTruthy();

      // Switch to LAST WORKOUT view and scrub PREV / NEXT
      fireEvent.press(screen.getByTestId('window-btn-last_workout'));
      expect(screen.getByTestId('period-label').props.children).toContain('KB & Rings Heavy');
      expect(screen.getByTestId('equipment-stat-kettlebell')).toBeTruthy();

      fireEvent.press(screen.getByTestId('period-prev-btn'));
      expect(screen.getByTestId('period-label').props.children).toContain('Midweek Moderate');

      fireEvent.press(screen.getByTestId('period-next-btn'));
      expect(screen.getByTestId('period-label').props.children).toContain('KB & Rings Heavy');
    });
  });
});
