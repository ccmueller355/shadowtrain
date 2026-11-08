// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { create } from 'zustand';
import {
  DatabaseClient,
  DEFAULT_SEED_EXERCISES,
  initDatabase,
  listExercises,
  seedExercisesIfEmpty,
} from '../db';
import { Equipment, Exercise } from '../types';

export interface ExerciseFilterCriteria {
  availableEquipment: readonly Equipment[];
  showAllEquipment?: boolean;
  selectedEquipment?: Equipment | 'all';
  selectedMuscle?: string | 'all';
  searchQuery?: string;
}

export function filterExercises(
  exercises: readonly Exercise[],
  criteria: ExerciseFilterCriteria,
): Exercise[] {
  const {
    availableEquipment,
    showAllEquipment = false,
    selectedEquipment = 'all',
    selectedMuscle = 'all',
    searchQuery = '',
  } = criteria;

  const allowedSet = showAllEquipment ? null : new Set<Equipment>(availableEquipment);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return exercises
    .filter((exercise) => {
      if (allowedSet && !allowedSet.has(exercise.equipment)) {
        return false;
      }
      if (selectedEquipment !== 'all' && exercise.equipment !== selectedEquipment) {
        return false;
      }
      if (
        selectedMuscle !== 'all' &&
        !exercise.primaryMuscles.includes(selectedMuscle) &&
        !(exercise.secondaryMuscles ?? []).includes(selectedMuscle)
      ) {
        return false;
      }
      if (normalizedQuery.length > 0) {
        const matchesName = exercise.name.toLowerCase().includes(normalizedQuery);
        const matchesMuscle = exercise.primaryMuscles.some((m) =>
          m.toLowerCase().includes(normalizedQuery),
        );
        const matchesEquipment = exercise.equipment.toLowerCase().includes(normalizedQuery);
        if (!matchesName && !matchesMuscle && !matchesEquipment) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface ExerciseState {
  exercises: Exercise[];
  hydrated: boolean;
  searchQuery: string;
  showAllEquipment: boolean;
  selectedEquipment: Equipment | 'all';
  selectedMuscle: string | 'all';
  setSearchQuery: (searchQuery: string) => void;
  setShowAllEquipment: (showAllEquipment: boolean) => void;
  setSelectedEquipment: (selectedEquipment: Equipment | 'all') => void;
  setSelectedMuscle: (selectedMuscle: string | 'all') => void;
  resetFilters: () => void;
  hydrateFromDb: (db?: DatabaseClient) => Promise<Exercise[]>;
}

const INITIAL_EXERCISES = [...DEFAULT_SEED_EXERCISES].sort((a, b) => a.name.localeCompare(b.name));

export const useExerciseStore = create<ExerciseState>((set) => ({
  exercises: INITIAL_EXERCISES,
  hydrated: false,
  searchQuery: '',
  showAllEquipment: false,
  selectedEquipment: 'all',
  selectedMuscle: 'all',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setShowAllEquipment: (showAllEquipment) => set({ showAllEquipment, selectedEquipment: 'all' }),
  setSelectedEquipment: (selectedEquipment) => set({ selectedEquipment }),
  setSelectedMuscle: (selectedMuscle) => set({ selectedMuscle }),
  resetFilters: () =>
    set({
      searchQuery: '',
      showAllEquipment: false,
      selectedEquipment: 'all',
      selectedMuscle: 'all',
    }),
  hydrateFromDb: async (db?: DatabaseClient) => {
    const client = db ?? (await initDatabase());
    await seedExercisesIfEmpty(client);
    const loaded = await listExercises(client);
    set({ exercises: loaded, hydrated: true });
    return loaded;
  },
}));
