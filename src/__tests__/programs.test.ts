// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import {
  buildEntriesFromCultWorkout,
  buildPlannedWorkoutFromCult,
  COOLDOWN_CULT_PROGRAMS,
  CULT_PROGRAMS,
  getCultProgramById,
  WORKOUT_CULT_PROGRAMS,
} from '../engine/programs';
import { Exercise, Profile } from '../types';

describe('Cult Program Templates & Catalog (M12)', () => {
  const mockProfile: Profile = {
    goal: 'strength',
    experience: 'intermediate',
    units: 'kg',
    repRange: { min: 8, max: 12 },
    increments: { kettlebell: 4 },
    availableEquipment: ['kettlebell', 'rings', 'bodyweight', 'jump_rope'],
    fixedKettlebellWeight: 24,
  };

  const mockExercises: Exercise[] = [
    {
      id: 'kb-swing-one-arm',
      name: 'One-Arm Kettlebell Swing',
      primaryMuscles: ['hamstrings', 'glutes'],
      equipment: 'kettlebell',
      trackingType: 'reps',
    },
    {
      id: 'kb-turkish-get-up',
      name: 'Turkish Get-Up',
      primaryMuscles: ['shoulders', 'core'],
      equipment: 'kettlebell',
      trackingType: 'reps',
    },
    {
      id: 'ring-pull-up',
      name: 'Ring Pull-up',
      primaryMuscles: ['lats'],
      equipment: 'rings',
      trackingType: 'reps',
    },
    {
      id: 'kb-clean-and-press',
      name: 'Kettlebell Clean & Press',
      primaryMuscles: ['shoulders'],
      equipment: 'kettlebell',
      trackingType: 'reps',
    },
  ];

  it('exposes foundational cult programs in the catalog', () => {
    const ids = CULT_PROGRAMS.map((p) => p.id);
    expect(ids).toContain('simple-and-sinister');
    expect(ids).toContain('rite-of-passage');
    expect(ids).toContain('convict-calisthenics');
    expect(ids).toContain('armor-building-complex');
    expect(ids).toContain('tabata-conditioning');
    expect(ids).toContain('bio-hacker-desk-reset');
    expect(ids).toContain('full-body-cooldown');

    expect(WORKOUT_CULT_PROGRAMS.every((p) => p.category !== 'mobility')).toBe(true);
    expect(COOLDOWN_CULT_PROGRAMS.map((p) => p.id)).toEqual([
      'bio-hacker-desk-reset',
      'full-body-cooldown',
    ]);
  });

  it('retrieves program by id', () => {
    const ss = getCultProgramById('simple-and-sinister');
    expect(ss).toBeDefined();
    expect(ss?.name).toBe('SIMPLE & SINISTER');
    expect(ss?.cultOrigin).toContain('Pavel Tsatsouline');
    expect(ss?.workouts.length).toBeGreaterThanOrEqual(2);
  });

  it('builds planned workout from Simple & Sinister with EMOM timer config', () => {
    const ss = getCultProgramById('simple-and-sinister')!;
    const plan = buildPlannedWorkoutFromCult(ss, 0, mockExercises, mockProfile);

    expect(plan.title).toContain('SIMPLE & SINISTER');
    expect(plan.reasonChip).toContain('PAVEL TSATSOULINE');
    expect(plan.items.length).toBe(4); // Halo, Goblet Squat, Swings, TGU

    const swingItem = plan.items.find((i) => i.exercise.id === 'kb-swing-one-arm');
    expect(swingItem).toBeDefined();
    expect(swingItem?.suggestion.sets).toBe(10);
    expect(swingItem?.suggestion.reps).toBe(10);
    expect(swingItem?.suggestion.weight).toBe(24);
  });

  it('builds entries and sets for session store from cult workout', () => {
    const rop = getCultProgramById('rite-of-passage')!;
    const workout = rop.workouts[0];
    let idGen = 0;
    const entries = buildEntriesFromCultWorkout(workout, mockProfile, (p) => `${p}-${idGen++}`);

    expect(entries.length).toBe(workout.targets.length);
    const cpEntry = entries.find((e) => e.exerciseId === 'kb-clean-and-press');
    expect(cpEntry).toBeDefined();
    expect(cpEntry?.sets.length).toBe(9);
    expect(cpEntry?.sets[0].reps).toBe(2);
    expect(cpEntry?.sets[0].weight).toBe(24);
    expect(cpEntry?.sets[0].completed).toBe(false);
  });
});
