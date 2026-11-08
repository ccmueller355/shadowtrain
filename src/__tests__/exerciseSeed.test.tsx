// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import ExercisesScreen from '../../app/(tabs)/exercises';
import {
  buildMergedExerciseSeed,
  CORE_KIT_EXERCISES,
  DatabaseClient,
  DEFAULT_SEED_EXERCISES,
  ExerciseRow,
  initDatabase,
  normalizeSeedExercise,
  PUBLIC_DATASET_EXERCISES,
  resetDatabaseSingleton,
  seedExercisesIfEmpty,
  SqlParam,
} from '../db';
import { importExercises } from '../../scripts/import-exercises';
import { filterExercises, useExerciseStore } from '../stores/exerciseStore';
import { DEFAULT_PROFILE, useProfileStore } from '../stores/profileStore';

class SeedFakeDb implements DatabaseClient {
  public exercises = new Map<string, ExerciseRow>();

  async execAsync(): Promise<void> {}

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }

  async runAsync(
    source: string,
    params: SqlParam[] = [],
  ): Promise<{ changes: number; lastInsertRowId: number }> {
    if (source.includes('INSERT INTO exercises')) {
      const [
        id,
        name,
        primary_muscles,
        secondary_muscles,
        equipment,
        category,
        tracking_type,
        image_start,
        image_end,
        instructions,
      ] = params;
      this.exercises.set(String(id), {
        id: String(id),
        name: String(name),
        primary_muscles: String(primary_muscles),
        secondary_muscles: secondary_muscles !== null ? String(secondary_muscles) : null,
        equipment: String(equipment),
        category: category !== null ? String(category) : null,
        tracking_type: String(tracking_type),
        image_start: image_start !== null ? String(image_start) : null,
        image_end: image_end !== null ? String(image_end) : null,
        instructions: instructions !== null ? String(instructions) : null,
      });
    }
    return { changes: 1, lastInsertRowId: this.exercises.size };
  }

  async getFirstAsync<T>(source: string): Promise<T | null> {
    if (source.includes('COUNT(*)')) {
      return { count: this.exercises.size } as unknown as T;
    }
    if (source.includes('PRAGMA user_version')) {
      return { user_version: 1 } as unknown as T;
    }
    return null;
  }

  async getAllAsync<T>(source: string): Promise<T[]> {
    if (source.includes('SELECT * FROM exercises')) {
      const rows = [...this.exercises.values()].sort((a, b) => a.name.localeCompare(b.name));
      return rows as unknown as T[];
    }
    return [];
  }
}

describe('M2 Exercise Seed, Import Script, Store & Equipment Picker', () => {
  beforeEach(() => {
    resetDatabaseSingleton();
    useProfileStore.setState({
      profile: DEFAULT_PROFILE,
      theme: 'fixer',
    });
    useExerciseStore.getState().resetFilters();
    useExerciseStore.setState({
      exercises: [...DEFAULT_SEED_EXERCISES].sort((a, b) => a.name.localeCompare(b.name)),
      hydrated: false,
    });
  });

  describe('Seed Dataset & import-exercises.ts', () => {
    it('contains all 37 core-kit movements across all 6 personal kit categories plus public gym dataset', () => {
      expect(CORE_KIT_EXERCISES.length).toBe(37);
      expect(PUBLIC_DATASET_EXERCISES.length).toBe(8);
      expect(DEFAULT_SEED_EXERCISES.length).toBe(45);

      const coreEquipment = new Set(CORE_KIT_EXERCISES.map((e) => e.equipment));
      expect([...coreEquipment].sort()).toEqual([
        'bodyweight',
        'hand_gripper',
        'jump_rope',
        'kettlebell',
        'rings',
        'stretching',
      ]);
    });

    it('normalizes raw seed entries and gives core-kit priority on ID collision', () => {
      const minimal = normalizeSeedExercise({
        id: 'minimal-test',
        name: 'Minimal Exercise',
        primaryMuscles: ['core'],
        equipment: 'bodyweight',
      });
      expect(minimal.trackingType).toBe('reps');
      expect(minimal.secondaryMuscles).toBeUndefined();

      const merged = buildMergedExerciseSeed(
        [
          {
            id: 'shared-id',
            name: 'Curated Core Swing',
            primaryMuscles: ['glutes'],
            equipment: 'kettlebell',
          },
        ],
        [
          {
            id: 'shared-id',
            name: 'Public Generic Swing',
            primaryMuscles: ['hamstrings'],
            equipment: 'kettlebell',
          },
        ],
      );
      expect(merged).toHaveLength(1);
      expect(merged[0].name).toBe('Curated Core Swing');
    });

    it('seeds SQLite idempotently on first run and supports force re-import', async () => {
      const fakeDb = new SeedFakeDb();
      await initDatabase('test.db', fakeDb);

      const firstSeed = await importExercises();
      expect(firstSeed).toEqual({ seeded: true, totalCount: 45 });

      const secondSeed = await seedExercisesIfEmpty(fakeDb);
      expect(secondSeed).toEqual({ seeded: false, totalCount: 45 });

      const forcedSeed = await importExercises(fakeDb, { force: true });
      expect(forcedSeed).toEqual({ seeded: true, totalCount: 45 });
    });
  });

  describe('useExerciseStore & filterExercises', () => {
    it('hydrates exercises from SQLite and filters by equipment, muscle, and search query', async () => {
      const fakeDb = new SeedFakeDb();
      const loaded = await useExerciseStore.getState().hydrateFromDb(fakeDb);
      expect(loaded).toHaveLength(45);
      expect(useExerciseStore.getState().hydrated).toBe(true);

      // Filter by default personal kit (excludes barbell/dumbbell/cable/machine/bands)
      const kitOnly = filterExercises(loaded, {
        availableEquipment: DEFAULT_PROFILE.availableEquipment,
      });
      expect(kitOnly).toHaveLength(37);

      // Show all equipment
      const allGear = filterExercises(loaded, {
        availableEquipment: DEFAULT_PROFILE.availableEquipment,
        showAllEquipment: true,
      });
      expect(allGear).toHaveLength(45);

      // Filter by secondary muscle match and equipment search
      const obliquesMatches = filterExercises(loaded, {
        availableEquipment: DEFAULT_PROFILE.availableEquipment,
        selectedMuscle: 'obliques',
      });
      expect(obliquesMatches.map((e) => e.id)).toEqual(['kb-swing-one-arm']);

      const equipQueryMatches = filterExercises(loaded, {
        availableEquipment: DEFAULT_PROFILE.availableEquipment,
        searchQuery: 'jump_rope',
      });
      expect(equipQueryMatches).toHaveLength(3);
    });
  });

  describe('ExercisesScreen Picker UI', () => {
    it('filters by active kit, toggles Show All, filters by gear/muscle chips, searches, and selects exercise', () => {
      const onSelectExercise = jest.fn();
      render(<ExercisesScreen onSelectExercise={onSelectExercise} />);

      // Default personal kit = 37 exercises
      expect(screen.getByText('SHOWING 37 MOVEMENTS')).toBeTruthy();
      expect(screen.getByText('Two-Hand Kettlebell Swing')).toBeTruthy();
      expect(screen.queryByText('Barbell Back Squat')).toBeNull();

      // Toggle Show All Equipment -> 45 exercises
      fireEvent.press(screen.getByTestId('toggle-show-all-equipment'));
      expect(screen.getByText('SHOWING 45 MOVEMENTS')).toBeTruthy();
      expect(screen.getByText('Barbell Back Squat')).toBeTruthy();

      // Filter to Kettlebell only -> 9 KB exercises
      fireEvent.press(screen.getByTestId('equip-filter-kettlebell'));
      expect(screen.getByText('SHOWING 9 MOVEMENTS')).toBeTruthy();

      // Tap ALL GEAR chip -> back to 45
      fireEvent.press(screen.getByTestId('equip-filter-all'));
      expect(screen.getByText('SHOWING 45 MOVEMENTS')).toBeTruthy();

      // Filter by muscle chip (forearms)
      fireEvent.press(screen.getByTestId('muscle-filter-forearms'));
      expect(screen.getByText('Hand Gripper Crush Rep')).toBeTruthy();

      // Reset muscle chip to all
      fireEvent.press(screen.getByTestId('muscle-filter-all'));

      // Search by text
      fireEvent.changeText(screen.getByTestId('exercise-search-input'), 'Turkish Get-Up');
      expect(screen.getByText('SHOWING 1 MOVEMENTS')).toBeTruthy();

      // Tap exercise card -> invokes callback
      fireEvent.press(screen.getByTestId('exercise-item-kb-turkish-get-up'));
      expect(onSelectExercise).toHaveBeenCalledTimes(1);
      expect(onSelectExercise.mock.calls[0][0].id).toBe('kb-turkish-get-up');

      // Search with no match -> shows empty state card
      fireEvent.changeText(
        screen.getByTestId('exercise-search-input'),
        'nonexistent-cyber-lift-999',
      );
      expect(screen.getByText('SHOWING 0 MOVEMENTS')).toBeTruthy();
      expect(screen.getByText('No exercises match current filters.')).toBeTruthy();

      // Reset filters via store action
      act(() => {
        useExerciseStore.getState().resetFilters();
      });
      expect(screen.getByText('SHOWING 37 MOVEMENTS')).toBeTruthy();
    });
  });
});
