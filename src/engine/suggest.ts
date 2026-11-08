// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { Exercise, Profile, SetRecord, Units } from '../types';

export type Suggestion =
  | {
      action: 'first_time';
      reps?: number;
      weight?: number;
      durationSec?: number;
      sets: number;
      reason: string;
    }
  | {
      action: 'increase';
      reps?: number;
      weight?: number;
      durationSec?: number;
      sets: number;
      delta: number;
      reason: string;
      nextProgressionId?: string;
    }
  | {
      action: 'repeat';
      reps?: number;
      weight?: number;
      durationSec?: number;
      sets: number;
      reason: string;
    }
  | {
      action: 'deload';
      reps?: number;
      weight?: number;
      durationSec?: number;
      sets: number;
      reason: string;
    };

export function isStepLoadedExercise(exercise: Exercise, profile: Profile): boolean {
  if (
    exercise.equipment === 'rings' ||
    exercise.equipment === 'bodyweight' ||
    exercise.equipment === 'hand_gripper' ||
    exercise.equipment === 'bands'
  ) {
    return true;
  }
  if (exercise.equipment === 'kettlebell') {
    const kbIncrement = profile.increments.kettlebell ?? 0;
    return profile.fixedKettlebellWeight !== undefined || kbIncrement === 0;
  }
  return false;
}

export function suggestNext(
  history: SetRecord[] | null,
  profile: Profile,
  exercise: Exercise,
): Suggestion {
  const workingSets = (history ?? []).filter((s) => !s.isWarmup);
  const stepLoaded = isStepLoadedExercise(exercise, profile);

  // 1. No working history -> first_time
  if (workingSets.length === 0) {
    if (exercise.trackingType === 'duration') {
      const durationSec = exercise.equipment === 'jump_rope' ? 120 : 45;
      return {
        action: 'first_time',
        durationSec,
        sets: 3,
        reason: 'First time — default timed sets',
      };
    }

    if (stepLoaded) {
      const weight =
        exercise.equipment === 'kettlebell' ? (profile.fixedKettlebellWeight ?? 16) : 0;
      return {
        action: 'first_time',
        reps: profile.repRange.min,
        weight,
        sets: 3,
        reason: 'First time — start at bottom of rep range',
      };
    }

    const increment = profile.increments[exercise.equipment] ?? 2.5;
    const defaultWeight = Math.max(Number((increment * 8).toFixed(2)), 10);
    return {
      action: 'first_time',
      reps: profile.repRange.max,
      weight: defaultWeight,
      sets: 3,
      reason: 'First time — establish baseline working weight',
    };
  }

  // 2. Timed exercises (trackingType === 'duration')
  if (exercise.trackingType === 'duration') {
    const durations = workingSets.map((s) => s.durationSec ?? 45);
    const lastDuration = Math.max(...durations);
    const allCompleted = workingSets.every((s) => s.completed && (s.durationSec ?? 0) > 0);

    if (exercise.equipment === 'stretching') {
      if (allCompleted && workingSets.every((s) => (s.durationSec ?? 0) < 60)) {
        return {
          action: 'increase',
          durationSec: lastDuration + 15,
          sets: workingSets.length,
          delta: 15,
          reason: 'Stretching hold < 60s completed — add 15s',
        };
      }
      return {
        action: 'repeat',
        durationSec: lastDuration,
        sets: workingSets.length,
        reason: 'Maintain mobility hold duration',
      };
    }

    if (allCompleted && workingSets.length >= 2) {
      return {
        action: 'increase',
        durationSec: lastDuration + 15,
        sets: workingSets.length,
        delta: 15,
        reason: 'All rounds completed — add 15s',
      };
    }

    return {
      action: 'repeat',
      durationSec: lastDuration,
      sets: Math.max(workingSets.length, 3),
      reason: 'Repeat target duration across all rounds',
    };
  }

  // 3. Fixed-Weight & Calisthenics Step-Loading
  if (stepLoaded) {
    const targetWeight =
      exercise.equipment === 'kettlebell'
        ? (workingSets[0].weight ?? profile.fixedKettlebellWeight ?? 16)
        : (workingSets[0].weight ?? 0);
    const repsList = workingSets.map((s) => s.reps ?? profile.repRange.min);
    const maxReps = Math.max(...repsList);
    const minReps = Math.min(...repsList);

    if (workingSets.length < 2) {
      return {
        action: 'repeat',
        weight: targetWeight,
        reps: maxReps,
        sets: 3,
        reason: 'Under 2 working sets logged last time — repeat',
      };
    }

    if (workingSets.some((s) => (s.reps ?? 0) < profile.repRange.min)) {
      return {
        action: 'deload',
        weight: targetWeight,
        reps: profile.repRange.min,
        sets: workingSets.length > 3 ? workingSets.length - 1 : 3,
        reason: 'Missed bottom of rep range — reset to min reps',
      };
    }

    if (workingSets.some((s) => !s.completed)) {
      return {
        action: 'repeat',
        weight: targetWeight,
        reps: maxReps,
        sets: workingSets.length,
        reason: 'Incomplete working sets last session — repeat target',
      };
    }

    if (workingSets.some((s) => (s.reps ?? 0) < profile.repRange.max)) {
      const nextReps = Math.min(profile.repRange.max, minReps + 1);
      return {
        action: 'increase',
        weight: targetWeight,
        reps: nextReps,
        sets: workingSets.length,
        delta: 1,
        reason: 'Step-loading: +1 rep per set toward top of range',
      };
    }

    if (workingSets.length < 5) {
      return {
        action: 'increase',
        weight: targetWeight,
        reps: profile.repRange.max,
        sets: workingSets.length + 1,
        delta: 1,
        reason: 'Hit top of rep range across sets — add 1 working set',
      };
    }

    return {
      action: 'increase',
      weight: targetWeight,
      reps: profile.repRange.max,
      sets: 5,
      delta: 1,
      ...(exercise.nextProgressionId ? { nextProgressionId: exercise.nextProgressionId } : {}),
      reason: exercise.nextProgressionId
        ? `5×${profile.repRange.max} mastered — advance to next tier (${exercise.nextProgressionId})`
        : `5×${profile.repRange.max} mastered — advance to slow eccentric (3-1-3)`,
    };
  }

  // 4. Standard Adjustable-Weight Progression
  const rawIncrement = profile.increments[exercise.equipment];
  const increment = rawIncrement && rawIncrement > 0 ? rawIncrement : 2.5;
  const lastWeight = workingSets[0].weight ?? 20;
  const lastReps = workingSets[0].reps ?? profile.repRange.max;

  if (workingSets.length < 3) {
    return {
      action: 'repeat',
      weight: lastWeight,
      reps: lastReps,
      sets: 3,
      reason: 'Under 3 working sets logged last time',
    };
  }

  if (workingSets.some((s) => (s.reps ?? 0) < profile.repRange.min)) {
    const rawDeload = Math.floor((lastWeight * 0.9) / increment) * increment;
    const deloadWeight = Number(Math.max(increment, rawDeload).toFixed(2));
    return {
      action: 'deload',
      weight: deloadWeight,
      reps: profile.repRange.max,
      sets: workingSets.length,
      reason: `Missed min reps — deload -10% to ${deloadWeight}${profile.units}`,
    };
  }

  if (workingSets.every((s) => s.completed && (s.reps ?? 0) >= profile.repRange.max)) {
    const nextWeight = Number((lastWeight + increment).toFixed(2));
    return {
      action: 'increase',
      weight: nextWeight,
      reps: profile.repRange.max,
      sets: workingSets.length,
      delta: increment,
      reason: `All sets hit ${profile.repRange.max} reps — add +${increment}${profile.units}`,
    };
  }

  return {
    action: 'repeat',
    weight: lastWeight,
    reps: lastReps,
    sets: workingSets.length,
    reason: 'Repeat weight until all sets hit top of rep range',
  };
}

export function buildSetsFromSuggestion(suggestion: Suggestion, nextId: () => string): SetRecord[] {
  const count = Math.max(1, suggestion.sets);
  return Array.from({ length: count }, () => ({
    id: nextId(),
    ...(suggestion.reps !== undefined ? { reps: suggestion.reps } : {}),
    ...(suggestion.weight !== undefined ? { weight: suggestion.weight } : {}),
    ...(suggestion.durationSec !== undefined ? { durationSec: suggestion.durationSec } : {}),
    completed: false,
    isWarmup: false,
  }));
}

export function formatSuggestionChip(suggestion: Suggestion, units: Units = 'kg'): string {
  const actionTag =
    suggestion.action === 'increase'
      ? '↑ PROGRESS'
      : suggestion.action === 'deload'
        ? '↓ DELOAD'
        : suggestion.action === 'repeat'
          ? '↻ REPEAT'
          : '★ FIRST TIME';

  if (suggestion.durationSec !== undefined) {
    return `${actionTag} // ${suggestion.sets} × ${suggestion.durationSec}s · ${suggestion.reason}`;
  }

  const weightLabel =
    suggestion.weight && suggestion.weight > 0 ? `${suggestion.weight}${units}` : 'BW';
  const repsLabel = suggestion.reps ?? 8;
  return `${actionTag} // ${suggestion.sets} × ${weightLabel} × ${repsLabel} · ${suggestion.reason}`;
}
