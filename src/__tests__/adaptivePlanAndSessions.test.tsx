// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../app/(tabs)/index';
import SessionLoggerScreen from '../../app/session/[id]';
import { DEFAULT_SEED_EXERCISES } from '../db';
import { computeWeeklyStreak, generateAdaptivePlan } from '../engine/plan';
import { useExerciseStore } from '../stores/exerciseStore';
import { DEFAULT_PROFILE, useProfileStore } from '../stores/profileStore';
import { useSessionStore } from '../stores/sessionStore';
import { Session } from '../types';

const NOW_MS = Date.UTC(2026, 10, 9, 12, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

describe('M10 Adaptive Workout Plan, Weekly Streaks, Session Edit/Delete & Logger Back/Cancel', () => {
  beforeEach(() => {
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

  describe('generateAdaptivePlan & computeWeeklyStreak pure engine', () => {
    it('generates standard, rotated, tier-upgraded, fatigue-recovery, and ramp-back plans', () => {
      // 1. Standard plan (no prior sessions)
      const standard = generateAdaptivePlan({
        profile: DEFAULT_PROFILE,
        exercises: DEFAULT_SEED_EXERCISES,
        recentSessions: [],
        nowMs: NOW_MS,
      });
      expect(standard.adaptationMode).toBe('standard');
      expect(standard.title).toContain('TUSK · SPLIT A // PRIMARY');
      expect(standard.items.length).toBeGreaterThanOrEqual(3);

      // 2. Rotated plan when last session used Split A (2 days ago, moderate sets)
      const rotatedSession: Session = {
        id: 's-rot',
        startedAt: NOW_MS - 2 * DAY_MS,
        finishedAt: NOW_MS - 2 * DAY_MS + 1800 * 1000,
        entries: [
          {
            id: 'e1',
            exerciseId: 'kb-swing-two-hand',
            position: 0,
            sets: Array.from({ length: 5 }, (_, i) => ({
              id: `set-${i}`,
              reps: 12,
              weight: 16,
              completed: true,
              isWarmup: false,
            })),
          },
        ],
      };

      const rotated = generateAdaptivePlan({
        profile: DEFAULT_PROFILE,
        exercises: DEFAULT_SEED_EXERCISES,
        recentSessions: [rotatedSession],
        nowMs: NOW_MS,
      });
      expect(rotated.adaptationMode).toBe('rotated');
      expect(rotated.title).toContain('SPLIT B // ALTERNATE');

      // Refreshing cycles back to Split A where kb-swing-two-hand was mastered (5x12) -> upgrades to kb-swing-one-arm!
      const refreshedToSplitA = generateAdaptivePlan({
        profile: DEFAULT_PROFILE,
        exercises: DEFAULT_SEED_EXERCISES,
        recentSessions: [rotatedSession],
        refreshIndex: 2,
        nowMs: NOW_MS,
      });
      expect(refreshedToSplitA.items.some((i) => i.exercise.id === 'kb-swing-one-arm')).toBe(true);

      // 3. High-fatigue recovery split when >=13 working sets logged within 36h
      const fatigueSession: Session = {
        id: 's-fat',
        startedAt: NOW_MS - 12 * 3600 * 1000,
        finishedAt: NOW_MS - 11 * 3600 * 1000,
        entries: [
          {
            id: 'e-fat',
            exerciseId: 'kb-swing-two-hand',
            position: 0,
            sets: Array.from({ length: 14 }, (_, i) => ({
              id: `f-${i}`,
              reps: 10,
              weight: 24,
              completed: true,
              isWarmup: false,
            })),
          },
        ],
      };

      const recovery = generateAdaptivePlan({
        profile: DEFAULT_PROFILE,
        exercises: DEFAULT_SEED_EXERCISES,
        recentSessions: [fatigueSession],
        nowMs: NOW_MS,
      });
      expect(recovery.adaptationMode).toBe('recovery_fatigue');
      expect(recovery.title).toContain('RECOVERY & MOBILITY');

      // 4. Ramp-back plan when >=5 days since last session
      const oldSession: Session = {
        id: 's-old',
        startedAt: NOW_MS - 7 * DAY_MS,
        finishedAt: NOW_MS - 7 * DAY_MS + 1800 * 1000,
        entries: [],
      };

      const rampBack = generateAdaptivePlan({
        profile: DEFAULT_PROFILE,
        exercises: DEFAULT_SEED_EXERCISES,
        recentSessions: [oldSession],
        nowMs: NOW_MS,
      });
      expect(rampBack.adaptationMode).toBe('ramp_back');
      expect(rampBack.items[0].suggestion.sets).toBe(2);

      // 5. Fallback when trainer exercises don't match availableEquipment
      const fallbackPlan = generateAdaptivePlan({
        profile: { ...DEFAULT_PROFILE, availableEquipment: ['barbell'] },
        exercises: DEFAULT_SEED_EXERCISES,
        recentSessions: [],
        nowMs: NOW_MS,
      });
      expect(fallbackPlan.items.length).toBeGreaterThan(0);
    });

    it('computes weekly streak and rest-day shield status', () => {
      const sessions: Session[] = [0, 1, 2, 7, 8, 9].map((dayOffset) => ({
        id: `s-day-${dayOffset}`,
        startedAt: NOW_MS - dayOffset * DAY_MS,
        finishedAt: NOW_MS - dayOffset * DAY_MS + 1000,
        entries: [],
      }));

      const streak = computeWeeklyStreak(sessions, 3, NOW_MS);
      expect(streak.thisWeekSessions).toBe(3);
      expect(streak.streakWeeks).toBe(2);
      expect(streak.restShieldReady).toBe(true);
      expect(streak.label).toContain('STREAK: 2W');
    });
  });

  describe('Home & SessionLogger — Planned Workout, Back/Cancel, and Edit/Delete Past Sessions', () => {
    it('refreshes plan, starts planned workout, supports Back & Cancel, and edits/deletes past sessions', () => {
      const onStartSession = jest.fn();

      const { rerender, unmount } = render(<HomeScreen onStartSession={onStartSession} />);

      // Cycle plan variant via REFRESH button
      expect(screen.getByTestId('plan-title').props.children).toContain('SPLIT A // PRIMARY');
      fireEvent.press(screen.getByTestId('refresh-plan-btn'));
      expect(screen.getByTestId('plan-title').props.children).toContain('SPLIT B // ALTERNATE');

      // Start Planned Workout -> populates activeSession with planned entries
      fireEvent.press(screen.getByTestId('start-planned-session-btn'));
      expect(onStartSession).toHaveBeenCalledWith('session-planned');
      const plannedActive = useSessionStore.getState().activeSession!;
      expect(plannedActive.entries.length).toBeGreaterThanOrEqual(3);

      unmount();

      // Render SessionLoggerScreen for 'session-planned' and test ← BACK (keeps session active)
      const onFinish = jest.fn();
      const loggerRender = render(
        <SessionLoggerScreen sessionId="session-planned" onFinishSession={onFinish} />,
      );
      fireEvent.press(screen.getByTestId('session-back-btn'));
      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(useSessionStore.getState().activeSession?.id).toBe('session-planned');

      // Finish the planned session so it lands in recentSessions (+25 Creds)
      fireEvent.press(screen.getByTestId('finish-session-btn'));
      expect(useSessionStore.getState().activeSession).toBeNull();
      expect(useSessionStore.getState().recentSessions).toHaveLength(1);
      expect(useProfileStore.getState().profile.creds).toBe(25);
      loggerRender.unmount();

      // Re-render HomeScreen -> verify recent session has EDIT and DEL buttons
      const homeRender2 = render(<HomeScreen onStartSession={onStartSession} />);
      fireEvent.press(screen.getByTestId('edit-session-session-planned'));
      expect(useSessionStore.getState().activeSession?.id).toBe('session-planned');
      homeRender2.unmount();

      // Edit session name in SessionLoggerScreen and save -> preserves creds (no double award)
      const editLogger = render(
        <SessionLoggerScreen sessionId="session-planned" onFinishSession={onFinish} />,
      );
      fireEvent.changeText(screen.getByTestId('session-name-input'), 'Edited Planned Session');
      fireEvent.press(screen.getByTestId('finish-session-btn'));
      expect(useSessionStore.getState().recentSessions[0].name).toBe('Edited Planned Session');
      expect(useProfileStore.getState().profile.creds).toBe(25);
      editLogger.unmount();

      // Start a draft session and test CANCEL in SessionLoggerScreen
      const cancelLogger = render(
        <SessionLoggerScreen sessionId="session-draft-cancel" onFinishSession={onFinish} />,
      );
      expect(useSessionStore.getState().activeSession?.id).toBe('session-draft-cancel');
      fireEvent.press(screen.getByTestId('cancel-session-btn'));
      expect(useSessionStore.getState().activeSession).toBeNull();
      cancelLogger.unmount();

      // Finally test DEL on recent session & DISCARD on active session from HomeScreen
      useSessionStore.getState().startSession('session-to-discard', 'Discard Me');
      render(<HomeScreen onStartSession={onStartSession} />);
      fireEvent.press(screen.getByTestId('discard-active-session-btn'));
      expect(useSessionStore.getState().activeSession).toBeNull();

      fireEvent.press(screen.getByTestId('delete-session-session-planned'));
      expect(useSessionStore.getState().recentSessions).toHaveLength(0);
    });
  });
});
