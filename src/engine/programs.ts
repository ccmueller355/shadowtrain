// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { Entry, Exercise, Profile, SetRecord } from '../types';
import { PlannedWorkout } from './plan';
import { formatSuggestionChip, Suggestion } from './suggest';

export type ProgramCategory = 'kettlebell' | 'calisthenics' | 'hybrid' | 'rings';

export interface ProgramExerciseTarget {
  exerciseId: string;
  sets: number;
  reps?: number;
  durationSec?: number;
  targetWeight?: number;
  isWarmup?: boolean;
  notes?: string;
}

export interface ProgramWorkout {
  id: string;
  title: string;
  subtitle: string;
  recommendedTimerMode: 'rest' | 'emom' | 'tabata' | 'rounds';
  timerConfig?: {
    workSec: number;
    restSec: number;
    rounds: number;
  };
  targets: ProgramExerciseTarget[];
}

export interface CultProgram {
  id: string;
  name: string;
  cultOrigin: string;
  category: ProgramCategory;
  difficulty: 'novice' | 'intermediate' | 'advanced';
  description: string;
  badge: string;
  workouts: ProgramWorkout[];
}

export const CULT_PROGRAMS: CultProgram[] = [
  {
    id: 'simple-and-sinister',
    name: 'SIMPLE & SINISTER',
    cultOrigin: 'Pavel Tsatsouline // StrongFirst',
    category: 'kettlebell',
    difficulty: 'novice',
    badge: 'CULT PROTOCOL // DAILY ARMOR',
    description:
      'The foundational kettlebell minimalist regime. 100 Swings + 10 Turkish Get-Ups building bulletproof hips, spine, and grit.',
    workouts: [
      {
        id: 'ss-standard',
        title: 'S&S · DAILY BLUEPRINT',
        subtitle: '10×10 Swings (EMOM) + 10 TGUs (1/min)',
        recommendedTimerMode: 'emom',
        timerConfig: {
          workSec: 60,
          restSec: 0,
          rounds: 10,
        },
        targets: [
          {
            exerciseId: 'kb-halo',
            sets: 3,
            reps: 5,
            isWarmup: true,
            notes: 'Halo warmup: 5 clockwise, 5 counter-clockwise',
          },
          {
            exerciseId: 'kb-goblet-squat',
            sets: 3,
            reps: 5,
            isWarmup: true,
            notes: 'Prying goblet squats at bottom',
          },
          {
            exerciseId: 'kb-swing-one-arm',
            sets: 10,
            reps: 10,
            notes: '10 sets of 10 reps (5 left, 5 right)',
          },
          {
            exerciseId: 'kb-turkish-get-up',
            sets: 10,
            reps: 1,
            notes: '10 singles total (alternating sides each rep)',
          },
        ],
      },
      {
        id: 'ss-timed-test',
        title: 'S&S · TIME TRIAL TEST',
        subtitle: 'Timeless to Sinister: 100 Swings in 5m + 10 TGUs in 10m',
        recommendedTimerMode: 'emom',
        timerConfig: {
          workSec: 60,
          restSec: 0,
          rounds: 15,
        },
        targets: [
          {
            exerciseId: 'kb-swing-one-arm',
            sets: 10,
            reps: 10,
            notes: '100 swings inside 5 minutes (EMOM 10x10)',
          },
          {
            exerciseId: 'kb-turkish-get-up',
            sets: 10,
            reps: 1,
            notes: '10 TGUs in 10 minutes (1 per min)',
          },
        ],
      },
    ],
  },
  {
    id: 'rite-of-passage',
    name: 'RITE OF PASSAGE (ROP)',
    cultOrigin: 'Pavel Tsatsouline // Enter the Kettlebell',
    category: 'kettlebell',
    difficulty: 'intermediate',
    badge: 'MILITARY PRESS MATRIX',
    description:
      'The definitive overhead pressing masterclass. Ascending ladders of Clean & Press paired with pull-ups and snatch cadence finish.',
    workouts: [
      {
        id: 'rop-light',
        title: 'ROP · LIGHT DAY',
        subtitle: '3 Ladders to (1, 2, 3) + Snatch cadence',
        recommendedTimerMode: 'rest',
        timerConfig: {
          workSec: 0,
          restSec: 90,
          rounds: 9,
        },
        targets: [
          {
            exerciseId: 'kb-clean-and-press',
            sets: 9,
            reps: 2,
            notes: 'Ladders: 3 × (1, 2, 3 reps per rung)',
          },
          {
            exerciseId: 'ring-pull-up',
            sets: 9,
            reps: 2,
            notes: 'Match C&P rungs: 3 × (1, 2, 3 reps)',
          },
          {
            exerciseId: 'kb-snatch',
            sets: 5,
            reps: 10,
            notes: 'Hardstyle snatch cadence finish',
          },
        ],
      },
      {
        id: 'rop-heavy',
        title: 'ROP · HEAVY PEAK',
        subtitle: '5 Ladders to (1, 2, 3, 4, 5) + Maximum Density',
        recommendedTimerMode: 'rest',
        timerConfig: {
          workSec: 0,
          restSec: 120,
          rounds: 15,
        },
        targets: [
          {
            exerciseId: 'kb-clean-and-press',
            sets: 15,
            reps: 3,
            notes: 'Ladders: 5 × (1, 2, 3, 4, 5 rungs)',
          },
          {
            exerciseId: 'ring-pull-up',
            sets: 15,
            reps: 3,
            notes: 'Match C&P rungs: 5 × (1, 2, 3, 4, 5 rungs)',
          },
          {
            exerciseId: 'kb-snatch',
            sets: 8,
            reps: 10,
            notes: 'Cadence finish',
          },
        ],
      },
    ],
  },
  {
    id: 'convict-calisthenics',
    name: 'CONVICT CALISTHENICS',
    cultOrigin: 'Paul Wade // The Big Six',
    category: 'calisthenics',
    difficulty: 'intermediate',
    badge: 'PRISON CELL BODYWEIGHT',
    description:
      'Pure raw calisthenics progression trees from beginner leverage to elite mastery (One-Arm Push-ups, Pistols, Hanging Leg Raises).',
    workouts: [
      {
        id: 'convict-upper',
        title: 'THE BIG SIX · UPPER ARMOR',
        subtitle: 'Push & Pull progression mastery',
        recommendedTimerMode: 'rest',
        timerConfig: {
          workSec: 0,
          restSec: 90,
          rounds: 8,
        },
        targets: [
          {
            exerciseId: 'bw-push-up',
            sets: 3,
            reps: 15,
            notes: 'Step progression: Strict 2-second eccentric cadence',
          },
          {
            exerciseId: 'bw-diamond-push-up',
            sets: 3,
            reps: 12,
            notes: 'Tricep close-grip leverage step',
          },
          {
            exerciseId: 'ring-pull-up',
            sets: 4,
            reps: 8,
            notes: 'Dead-hang full range of motion',
          },
          {
            exerciseId: 'ring-dip',
            sets: 3,
            reps: 10,
            notes: 'Deep chest & tricep lockouts',
          },
        ],
      },
      {
        id: 'convict-lower-core',
        title: 'THE BIG SIX · LOWER & MIDSECTION',
        subtitle: 'Pistol squat chain + Hanging leg raise',
        recommendedTimerMode: 'rest',
        timerConfig: {
          workSec: 0,
          restSec: 90,
          rounds: 8,
        },
        targets: [
          {
            exerciseId: 'bw-squat',
            sets: 3,
            reps: 20,
            notes: 'Full depth ass-to-grass bodyweight squats',
          },
          {
            exerciseId: 'bw-pistol-squat',
            sets: 4,
            reps: 5,
            notes: 'Unilateral single-leg strength balance',
          },
          {
            exerciseId: 'bw-leg-raise',
            sets: 4,
            reps: 10,
            notes: 'Strict toes to bar / straight-leg raises',
          },
          {
            exerciseId: 'bw-hollow-body-hold',
            sets: 3,
            durationSec: 45,
            notes: 'Gymnastic midline hollow position',
          },
        ],
      },
    ],
  },
  {
    id: 'armor-building-complex',
    name: 'ARMOR BUILDING COMPLEX',
    cultOrigin: 'Dan John // Tactical Strength',
    category: 'hybrid',
    difficulty: 'advanced',
    badge: 'DENSITY & GRIT',
    description:
      'The gold-standard complex: 2 Cleans, 1 Military Press, 3 Front Squats without putting the bell down. Tested in EMOM density waves.',
    workouts: [
      {
        id: 'abc-emom',
        title: 'ABC · EMOM DENSITY WAVE',
        subtitle: '15-20 rounds EMOM (2 Cleans + 1 Press + 3 Squats)',
        recommendedTimerMode: 'emom',
        timerConfig: {
          workSec: 60,
          restSec: 0,
          rounds: 15,
        },
        targets: [
          {
            exerciseId: 'kb-clean-and-press',
            sets: 15,
            reps: 3,
            notes: '2 Cleans + 1 Strict Press',
          },
          {
            exerciseId: 'kb-front-rack-squat',
            sets: 15,
            reps: 3,
            notes: '3 Deep Front Rack Squats to complete the complex',
          },
        ],
      },
    ],
  },
  {
    id: 'tabata-conditioning',
    name: 'TABATA PROTOCOL',
    cultOrigin: 'Prof. Izumi Tabata // High-Velocity Conditioning',
    category: 'hybrid',
    difficulty: 'intermediate',
    badge: '20s WORK // 10s REST',
    description:
      'Maximum anaerobic capacity overhaul. 8 rounds of 20 seconds maximum effort / 10 seconds rest across hardstyle ballistic patterns.',
    workouts: [
      {
        id: 'tabata-blaster',
        title: 'TABATA · BALLISTIC FUSION',
        subtitle: '8 Rounds 20s/10s (Swings, Rope, Push-ups, Squats)',
        recommendedTimerMode: 'tabata',
        timerConfig: {
          workSec: 20,
          restSec: 10,
          rounds: 8,
        },
        targets: [
          {
            exerciseId: 'kb-swing-two-hand',
            sets: 4,
            durationSec: 20,
            notes: 'Maximum cadence 2-hand swings for 20s',
          },
          {
            exerciseId: 'rope-double-unders',
            sets: 4,
            durationSec: 20,
            notes: 'High-speed jump rope sprints for 20s',
          },
        ],
      },
    ],
  },
];

export function getCultProgramById(id: string): CultProgram | undefined {
  return CULT_PROGRAMS.find((p) => p.id === id);
}

export function buildPlannedWorkoutFromCult(
  program: CultProgram,
  workoutIndex = 0,
  exercises: Exercise[],
  profile: Profile,
): PlannedWorkout {
  const workout = program.workouts[workoutIndex] ?? program.workouts[0];
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  const items = workout.targets.map((target) => {
    const ex = exerciseMap.get(target.exerciseId) ?? {
      id: target.exerciseId,
      name: target.exerciseId,
      primaryMuscles: [],
      equipment: target.exerciseId.startsWith('kb-') ? 'kettlebell' : 'bodyweight',
      trackingType: target.durationSec !== undefined ? 'duration' : 'reps',
    };

    const isDuration = ex.trackingType === 'duration' || target.durationSec !== undefined;
    const defaultWeight =
      ex.equipment === 'kettlebell'
        ? (target.targetWeight ?? profile.fixedKettlebellWeight ?? 16)
        : 0;

    const suggestion: Suggestion = isDuration
      ? {
          action: 'first_time',
          sets: target.sets,
          durationSec: target.durationSec ?? 45,
          reason: target.notes ?? `${program.name} protocol`,
        }
      : {
          action: 'first_time',
          sets: target.sets,
          reps: target.reps ?? profile.repRange.min,
          weight: defaultWeight,
          reason: target.notes ?? `${program.name} protocol`,
        };

    return {
      exercise: ex,
      suggestion,
      targetSummary: formatSuggestionChip(suggestion, profile.units),
    };
  });

  return {
    title: `${program.name} · ${workout.title}`,
    variantLabel: workout.title,
    adaptationMode: 'standard',
    reasonChip: `${program.cultOrigin.toUpperCase()} // ${workout.subtitle}`,
    items,
  };
}

export function buildEntriesFromCultWorkout(
  workout: ProgramWorkout,
  profile: Profile,
  makeUid: (prefix: string) => string,
): Entry[] {
  return workout.targets.map((target, idx) => {
    const isDuration = target.durationSec !== undefined;
    const defaultWeight =
      target.targetWeight ??
      (target.exerciseId.startsWith('kb-') ? (profile.fixedKettlebellWeight ?? 16) : 0);

    const sets: SetRecord[] = Array.from({ length: target.sets }, (_, sIdx) => ({
      id: makeUid(`set-${idx}-${sIdx}`),
      ...(isDuration ? { durationSec: target.durationSec } : {}),
      ...(!isDuration ? { reps: target.reps ?? profile.repRange.min, weight: defaultWeight } : {}),
      completed: false,
      isWarmup: target.isWarmup ?? false,
    }));

    return {
      id: makeUid(`entry-${idx}`),
      exerciseId: target.exerciseId,
      position: idx,
      notes: target.notes,
      sets,
    };
  });
}
