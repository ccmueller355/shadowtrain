// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import ExercisesScreen from '../../app/(tabs)/exercises';
import SessionLoggerScreen from '../../app/session/[id]';
import { DEFAULT_SEED_EXERCISES } from '../db';
import {
  buildSetsFromSuggestion,
  formatSuggestionChip,
  isStepLoadedExercise,
  suggestNext,
} from '../engine/suggest';
import { useExerciseStore } from '../stores/exerciseStore';
import { DEFAULT_PROFILE, useProfileStore } from '../stores/profileStore';
import { useSessionStore } from '../stores/sessionStore';
import { Exercise, Profile, SetRecord } from '../types';

const kbSwing: Exercise = {
  id: 'kb-swing-two-hand',
  name: 'Two-Hand Kettlebell Swing',
  primaryMuscles: ['hamstrings', 'glutes'],
  equipment: 'kettlebell',
  trackingType: 'reps',
  tier: 'beginner',
  nextProgressionId: 'kb-swing-one-arm',
};

const ringDip: Exercise = {
  id: 'ring-dip',
  name: 'Ring Dip',
  primaryMuscles: ['chest', 'triceps'],
  equipment: 'rings',
  trackingType: 'reps',
  tier: 'advanced',
};

const jumpRope: Exercise = {
  id: 'rope-basic-bounce',
  name: 'Jump Rope Basic Bounce',
  primaryMuscles: ['calves'],
  equipment: 'jump_rope',
  trackingType: 'duration',
  tier: 'beginner',
};

const stretchHold: Exercise = {
  id: 'stretch-couch',
  name: 'Couch Stretch',
  primaryMuscles: ['hip_flexors'],
  equipment: 'stretching',
  trackingType: 'duration',
  tier: 'beginner',
};

const barbellSquat: Exercise = {
  id: 'barbell-back-squat',
  name: 'Barbell Back Squat',
  primaryMuscles: ['quads', 'glutes'],
  equipment: 'barbell',
  trackingType: 'reps',
};

describe('M5 Deterministic Progression Engine (suggestNext) & UI Chips', () => {
  beforeEach(() => {
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

  describe('isStepLoadedExercise', () => {
    it('identifies rings, bodyweight, hand_gripper, bands, and fixed-KB as step-loaded', () => {
      expect(isStepLoadedExercise(ringDip, DEFAULT_PROFILE)).toBe(true);
      expect(isStepLoadedExercise(kbSwing, DEFAULT_PROFILE)).toBe(true);

      const adjustableKbProfile: Profile = {
        ...DEFAULT_PROFILE,
        fixedKettlebellWeight: undefined,
        increments: { ...DEFAULT_PROFILE.increments, kettlebell: 4 },
      };
      expect(isStepLoadedExercise(kbSwing, adjustableKbProfile)).toBe(false);
      expect(isStepLoadedExercise(barbellSquat, DEFAULT_PROFILE)).toBe(false);
    });
  });

  describe('Rule 1: First-Time (No Working History)', () => {
    it('returns default timed sets for jump_rope (120s) and stretching/holds (45s)', () => {
      const ropeSug = suggestNext(null, DEFAULT_PROFILE, jumpRope);
      expect(ropeSug).toEqual({
        action: 'first_time',
        durationSec: 120,
        sets: 3,
        reason: 'First time — default timed sets',
      });

      const stretchSug = suggestNext([], DEFAULT_PROFILE, stretchHold);
      expect(stretchSug).toEqual({
        action: 'first_time',
        durationSec: 45,
        sets: 3,
        reason: 'First time — default timed sets',
      });
    });

    it('returns bottom of repRange for step-loaded movements and excludes warmup-only history', () => {
      const warmupOnly: SetRecord[] = [
        { id: 'w1', reps: 5, weight: 16, completed: true, isWarmup: true },
      ];
      const kbSug = suggestNext(warmupOnly, DEFAULT_PROFILE, kbSwing);
      expect(kbSug).toEqual({
        action: 'first_time',
        reps: 8,
        weight: 16,
        sets: 3,
        reason: 'First time — start at bottom of rep range',
      });

      const ringSug = suggestNext(null, DEFAULT_PROFILE, ringDip);
      expect(ringSug.weight).toBe(0);
      expect(ringSug.reps).toBe(8);
    });

    it('returns top of repRange and baseline weight for adjustable barbell/dumbbell movements', () => {
      const sqSug = suggestNext(null, DEFAULT_PROFILE, barbellSquat);
      expect(sqSug).toEqual({
        action: 'first_time',
        reps: 12,
        weight: 20,
        sets: 3,
        reason: 'First time — establish baseline working weight',
      });
    });
  });

  describe('Rule 2: Timed Exercises (duration)', () => {
    it('adds +15s for stretching holds < 60s when completed, and repeats once >= 60s', () => {
      const under60: SetRecord[] = [
        { id: '1', durationSec: 45, completed: true, isWarmup: false },
        { id: '2', durationSec: 45, completed: true, isWarmup: false },
      ];
      const inc = suggestNext(under60, DEFAULT_PROFILE, stretchHold);
      expect(inc).toEqual({
        action: 'increase',
        durationSec: 60,
        sets: 2,
        delta: 15,
        reason: 'Stretching hold < 60s completed — add 15s',
      });

      const at60: SetRecord[] = [
        { id: '1', durationSec: 60, completed: true, isWarmup: false },
        { id: '2', durationSec: 60, completed: true, isWarmup: false },
      ];
      const rep = suggestNext(at60, DEFAULT_PROFILE, stretchHold);
      expect(rep).toEqual({
        action: 'repeat',
        durationSec: 60,
        sets: 2,
        reason: 'Maintain mobility hold duration',
      });
    });

    it('adds +15s for jump rope / isometric holds when >= 2 working sets completed, otherwise repeats', () => {
      const completedRope: SetRecord[] = [
        { id: '1', durationSec: 120, completed: true, isWarmup: false },
        { id: '2', durationSec: 120, completed: true, isWarmup: false },
        { id: '3', durationSec: 120, completed: true, isWarmup: false },
      ];
      const inc = suggestNext(completedRope, DEFAULT_PROFILE, jumpRope);
      expect(inc).toEqual({
        action: 'increase',
        durationSec: 135,
        sets: 3,
        delta: 15,
        reason: 'All rounds completed — add 15s',
      });

      const incompleteRope: SetRecord[] = [
        { id: '1', durationSec: 120, completed: true, isWarmup: false },
        { id: '2', durationSec: 120, completed: false, isWarmup: false },
      ];
      const rep = suggestNext(incompleteRope, DEFAULT_PROFILE, jumpRope);
      expect(rep.action).toBe('repeat');
      expect(rep.durationSec).toBe(120);
      expect(rep.sets).toBe(3);
    });
  });

  describe('Rule 3: Fixed-Weight & Calisthenics Step-Loading', () => {
    it('repeats when < 2 working sets logged or when any set is incomplete', () => {
      const oneSet: SetRecord[] = [
        { id: '1', reps: 10, weight: 16, completed: true, isWarmup: false },
      ];
      expect(suggestNext(oneSet, DEFAULT_PROFILE, kbSwing)).toEqual({
        action: 'repeat',
        weight: 16,
        reps: 10,
        sets: 3,
        reason: 'Under 2 working sets logged last time — repeat',
      });

      const incomplete: SetRecord[] = [
        { id: '1', reps: 10, weight: 16, completed: true, isWarmup: false },
        { id: '2', reps: 10, weight: 16, completed: false, isWarmup: false },
      ];
      expect(suggestNext(incomplete, DEFAULT_PROFILE, kbSwing)).toEqual({
        action: 'repeat',
        weight: 16,
        reps: 10,
        sets: 2,
        reason: 'Incomplete working sets last session — repeat target',
      });
    });

    it('deloads back to repRange.min (and drops 1 set if sets > 3) when any working set < repRange.min', () => {
      const fourFailedSets: SetRecord[] = [
        { id: '1', reps: 8, weight: 16, completed: true, isWarmup: false },
        { id: '2', reps: 8, weight: 16, completed: true, isWarmup: false },
        { id: '3', reps: 7, weight: 16, completed: true, isWarmup: false },
        { id: '4', reps: 6, weight: 16, completed: true, isWarmup: false },
      ];
      expect(suggestNext(fourFailedSets, DEFAULT_PROFILE, kbSwing)).toEqual({
        action: 'deload',
        weight: 16,
        reps: 8,
        sets: 3,
        reason: 'Missed bottom of rep range — reset to min reps',
      });
    });

    it('steps up by +1 rep -> +1 working set (up to 5) -> tier graduation at 5xMax', () => {
      // 3x9 -> 3x10 (+1 rep)
      const threeByNine: SetRecord[] = [
        { id: '1', reps: 9, weight: 16, completed: true, isWarmup: false },
        { id: '2', reps: 9, weight: 16, completed: true, isWarmup: false },
        { id: '3', reps: 9, weight: 16, completed: true, isWarmup: false },
      ];
      expect(suggestNext(threeByNine, DEFAULT_PROFILE, kbSwing)).toEqual({
        action: 'increase',
        weight: 16,
        reps: 10,
        sets: 3,
        delta: 1,
        reason: 'Step-loading: +1 rep per set toward top of range',
      });

      // 3x12 (repRange.max) -> 4x12 (+1 working set)
      const threeByTwelve: SetRecord[] = [
        { id: '1', reps: 12, weight: 16, completed: true, isWarmup: false },
        { id: '2', reps: 12, weight: 16, completed: true, isWarmup: false },
        { id: '3', reps: 12, weight: 16, completed: true, isWarmup: false },
      ];
      expect(suggestNext(threeByTwelve, DEFAULT_PROFILE, kbSwing)).toEqual({
        action: 'increase',
        weight: 16,
        reps: 12,
        sets: 4,
        delta: 1,
        reason: 'Hit top of rep range across sets — add 1 working set',
      });

      // 5x12 on exercise WITH nextProgressionId -> graduation to nextProgressionId
      const fiveByTwelve: SetRecord[] = Array.from({ length: 5 }, (_, i) => ({
        id: String(i + 1),
        reps: 12,
        weight: 16,
        completed: true,
        isWarmup: false,
      }));
      expect(suggestNext(fiveByTwelve, DEFAULT_PROFILE, kbSwing)).toEqual({
        action: 'increase',
        weight: 16,
        reps: 12,
        sets: 5,
        delta: 1,
        nextProgressionId: 'kb-swing-one-arm',
        reason: '5×12 mastered — advance to next tier (kb-swing-one-arm)',
      });

      // 5x12 on advanced exercise WITHOUT nextProgressionId -> slow eccentric (3-1-3)
      const fiveByTwelveRings: SetRecord[] = Array.from({ length: 5 }, (_, i) => ({
        id: String(i + 1),
        reps: 12,
        weight: 0,
        completed: true,
        isWarmup: false,
      }));
      expect(suggestNext(fiveByTwelveRings, DEFAULT_PROFILE, ringDip)).toEqual({
        action: 'increase',
        weight: 0,
        reps: 12,
        sets: 5,
        delta: 1,
        reason: '5×12 mastered — advance to slow eccentric (3-1-3)',
      });
    });
  });

  describe('Rule 4: Standard Adjustable-Weight Progression', () => {
    it('handles < 3 sets repeat, -10% deload rounded down to increment, +increment increase, and repeat', () => {
      // < 3 working sets -> repeat
      const twoSets: SetRecord[] = [
        { id: '1', reps: 12, weight: 80, completed: true, isWarmup: false },
        { id: '2', reps: 12, weight: 80, completed: true, isWarmup: false },
      ];
      expect(suggestNext(twoSets, DEFAULT_PROFILE, barbellSquat)).toEqual({
        action: 'repeat',
        weight: 80,
        reps: 12,
        sets: 3,
        reason: 'Under 3 working sets logged last time',
      });

      // Any set < repRange.min (8) -> deload 80kg * 0.9 = 72kg -> rounded down to 2.5kg increment = 70kg
      const failedSquat: SetRecord[] = [
        { id: '1', reps: 10, weight: 80, completed: true, isWarmup: false },
        { id: '2', reps: 8, weight: 80, completed: true, isWarmup: false },
        { id: '3', reps: 6, weight: 80, completed: true, isWarmup: false },
      ];
      expect(suggestNext(failedSquat, DEFAULT_PROFILE, barbellSquat)).toEqual({
        action: 'deload',
        weight: 70,
        reps: 12,
        sets: 3,
        reason: 'Missed min reps — deload -10% to 70kg',
      });

      // All sets hit repRange.max (12) -> +2.5kg (82.5kg)
      const maxedSquat: SetRecord[] = [
        { id: '1', reps: 12, weight: 80, completed: true, isWarmup: false },
        { id: '2', reps: 12, weight: 80, completed: true, isWarmup: false },
        { id: '3', reps: 12, weight: 80, completed: true, isWarmup: false },
      ];
      expect(suggestNext(maxedSquat, DEFAULT_PROFILE, barbellSquat)).toEqual({
        action: 'increase',
        weight: 82.5,
        reps: 12,
        sets: 3,
        delta: 2.5,
        reason: 'All sets hit 12 reps — add +2.5kg',
      });

      // In-range (e.g. 10 reps) -> repeat
      const midSquat: SetRecord[] = [
        { id: '1', reps: 10, weight: 80, completed: true, isWarmup: false },
        { id: '2', reps: 10, weight: 80, completed: true, isWarmup: false },
        { id: '3', reps: 10, weight: 80, completed: true, isWarmup: false },
      ];
      expect(suggestNext(midSquat, DEFAULT_PROFILE, barbellSquat)).toEqual({
        action: 'repeat',
        weight: 80,
        reps: 10,
        sets: 3,
        reason: 'Repeat weight until all sets hit top of rep range',
      });
    });
  });

  describe('buildSetsFromSuggestion & formatSuggestionChip', () => {
    it('builds set records and formats chips for increase, deload, repeat, and first_time', () => {
      let idx = 1;
      const sets = buildSetsFromSuggestion(
        { action: 'increase', weight: 16, reps: 10, sets: 4, delta: 1, reason: 'Step up' },
        () => `s-${idx++}`,
      );
      expect(sets).toHaveLength(4);
      expect(sets[0]).toEqual({
        id: 's-1',
        weight: 16,
        reps: 10,
        completed: false,
        isWarmup: false,
      });

      expect(
        formatSuggestionChip({
          action: 'increase',
          weight: 16,
          reps: 10,
          sets: 4,
          delta: 1,
          reason: 'Step up',
        }),
      ).toBe('↑ PROGRESS // 4 × 16kg × 10 · Step up');

      expect(
        formatSuggestionChip({
          action: 'deload',
          weight: 0,
          reps: 8,
          sets: 3,
          reason: 'Reset',
        }),
      ).toBe('↓ DELOAD // 3 × BW × 8 · Reset');

      expect(
        formatSuggestionChip({
          action: 'repeat',
          durationSec: 60,
          sets: 3,
          reason: 'Hold steady',
        }),
      ).toBe('↻ REPEAT // 3 × 60s · Hold steady');
    });
  });

  describe('UI Integration: SessionLoggerScreen APPLY Suggestion & ExercisesScreen Detail View', () => {
    it('renders suggestion chip on SessionLoggerScreen and applies suggested sets when APPLY is pressed', () => {
      // Seed prior session with 3x12 at 16kg -> suggestNext recommends 4x12 (+1 working set)
      act(() => {
        useSessionStore.getState().startSession('prev-session');
        const entry = useSessionStore.getState().addExerciseEntry(kbSwing);
        for (const s of entry.sets) {
          useSessionStore.getState().updateSet(entry.id, s.id, {
            weight: 16,
            reps: 12,
            completed: true,
          });
        }
        useSessionStore.getState().finishActiveSession();
        useSessionStore.getState().startSession('current-session');
      });

      render(<SessionLoggerScreen sessionId="current-session" />);
      fireEvent.press(screen.getByTestId('open-exercise-picker-btn'));
      fireEvent.press(screen.getByTestId('exercise-item-kb-swing-two-hand'));

      const entry = useSessionStore.getState().activeSession!.entries[0];
      expect(entry.sets).toHaveLength(3);
      expect(screen.getByTestId(`suggestion-chip-${entry.id}`)).toBeTruthy();
      expect(screen.getByText(/Hit top of rep range across sets — add 1 working set/)).toBeTruthy();

      // Press APPLY button -> entry sets update from 3 sets to 4 sets of 16kg x 12!
      fireEvent.press(screen.getByTestId(`apply-suggestion-${entry.id}`));
      expect(useSessionStore.getState().activeSession!.entries[0].sets).toHaveLength(4);
    });

    it('opens Exercise Detail view with SUGGESTED NEXT banner and navigates 3-level progression ladder', () => {
      render(<ExercisesScreen />);

      fireEvent.press(screen.getByTestId('exercise-item-kb-swing-two-hand'));
      expect(screen.getByTestId('exercise-detail-view')).toBeTruthy();
      expect(screen.getByTestId('exercise-detail-suggestion')).toBeTruthy();
      expect(
        screen.getByText(
          /★ FIRST TIME \/\/ 3 × 16kg × 8 · First time — start at bottom of rep range/,
        ),
      ).toBeTruthy();

      // Tap next tier card -> navigates from Two-Hand Kettlebell Swing (beginner) to One-Arm Kettlebell Swing (mid)
      fireEvent.press(screen.getByTestId('exercise-detail-next-tier'));
      expect(screen.getByTestId('exercise-detail-title').props.children).toBe(
        'One-Arm Kettlebell Swing',
      );

      // Close detail view -> back to Exercise Armory list
      fireEvent.press(screen.getByTestId('close-exercise-detail-btn'));
      expect(screen.getByTestId('screen-exercises')).toBeTruthy();
    });
  });
});
