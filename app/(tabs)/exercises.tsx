// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAppTheme } from '../../src/theme/useTheme';
import { useThemeStyles } from '../../src/theme/useThemeStyles';
import { useProfileStore } from '../../src/stores/profileStore';
import { filterExercises, useExerciseStore } from '../../src/stores/exerciseStore';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';
import { Equipment, Exercise } from '../../src/types';

const ALL_EQUIPMENT: Equipment[] = [
  'kettlebell',
  'rings',
  'bodyweight',
  'hand_gripper',
  'jump_rope',
  'stretching',
  'dumbbell',
  'barbell',
  'bands',
  'cable',
  'machine',
];

const MUSCLE_FILTERS = [
  'all',
  'hamstrings',
  'glutes',
  'quads',
  'chest',
  'lats',
  'shoulders',
  'core',
  'forearms',
  'calves',
  'hips',
] as const;

export interface ExercisesScreenProps {
  onSelectExercise?: (exercise: Exercise) => void;
}

export default function ExercisesScreen({ onSelectExercise }: ExercisesScreenProps = {}) {
  const theme = useAppTheme();
  const ts = useThemeStyles();
  const availableEquipment = useProfileStore((s) => s.profile.availableEquipment);

  const exercises = useExerciseStore((s) => s.exercises);
  const searchQuery = useExerciseStore((s) => s.searchQuery);
  const showAllEquipment = useExerciseStore((s) => s.showAllEquipment);
  const selectedEquipment = useExerciseStore((s) => s.selectedEquipment);
  const selectedMuscle = useExerciseStore((s) => s.selectedMuscle);
  const setSearchQuery = useExerciseStore((s) => s.setSearchQuery);
  const setShowAllEquipment = useExerciseStore((s) => s.setShowAllEquipment);
  const setSelectedEquipment = useExerciseStore((s) => s.setSelectedEquipment);
  const setSelectedMuscle = useExerciseStore((s) => s.setSelectedMuscle);

  const equipmentOptions = showAllEquipment ? ALL_EQUIPMENT : availableEquipment;

  const filtered = filterExercises(exercises, {
    availableEquipment,
    showAllEquipment,
    selectedEquipment,
    selectedMuscle,
    searchQuery,
  });

  return (
    <View style={[styles.container, ts.bg]} testID="screen-exercises">
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, ts.accent]}>EXERCISE ARMORY</Text>
          <Text style={[styles.subtitle, ts.textMuted]}>
            ACTIVE KIT: {availableEquipment.join(' · ').toUpperCase()}
          </Text>
        </View>
        <Pressable
          testID="toggle-show-all-equipment"
          onPress={() => setShowAllEquipment(!showAllEquipment)}
          style={[
            styles.scopeBtn,
            {
              borderColor: showAllEquipment ? theme.colors.primary : theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.scopeBtnText,
              {
                color: showAllEquipment ? theme.colors.primary : theme.colors.textSecondary,
              },
            ]}
          >
            {showAllEquipment ? 'SHOWING ALL' : 'MY KIT ONLY'}
          </Text>
        </Pressable>
      </View>

      <TextInput
        testID="exercise-search-input"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search movement, muscle, or gear..."
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.searchInput,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
          },
        ]}
      />

      <View style={styles.filterGroup}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            testID="equip-filter-all"
            onPress={() => setSelectedEquipment('all')}
            style={[
              styles.chip,
              {
                borderColor:
                  selectedEquipment === 'all' ? theme.colors.primary : theme.colors.border,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    selectedEquipment === 'all' ? theme.colors.primary : theme.colors.textPrimary,
                },
              ]}
            >
              ALL GEAR
            </Text>
          </Pressable>
          {equipmentOptions.map((eq) => {
            const active = selectedEquipment === eq;
            return (
              <Pressable
                key={eq}
                testID={`equip-filter-${eq}`}
                onPress={() => setSelectedEquipment(eq)}
                style={[
                  styles.chip,
                  {
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? theme.colors.primary : theme.colors.textPrimary },
                  ]}
                >
                  {eq.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.filterGroup}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MUSCLE_FILTERS.map((muscle) => {
            const active = selectedMuscle === muscle;
            return (
              <Pressable
                key={muscle}
                testID={`muscle-filter-${muscle}`}
                onPress={() => setSelectedMuscle(muscle)}
                style={[
                  styles.chip,
                  {
                    borderColor: active ? theme.colors.secondary : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? theme.colors.secondary : theme.colors.textSecondary },
                  ]}
                >
                  {muscle === 'all' ? 'ALL MUSCLES' : muscle.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Text style={[styles.countText, ts.textMuted]} testID="exercise-count-label">
        SHOWING {filtered.length} MOVEMENTS
      </Text>

      <ScrollView style={styles.list} testID="exercise-list">
        {filtered.length === 0 ? (
          <CyberpunkCard glow={false}>
            <Text style={[styles.emptyText, ts.textMuted]}>
              No exercises match current filters.
            </Text>
          </CyberpunkCard>
        ) : (
          filtered.map((exercise) => (
            <Pressable
              key={exercise.id}
              testID={`exercise-item-${exercise.id}`}
              onPress={() => onSelectExercise?.(exercise)}
            >
              <CyberpunkCard glow={false} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.exerciseName, ts.text]}>{exercise.name}</Text>
                  <Text style={[styles.badge, ts.accent]}>
                    {exercise.equipment.toUpperCase()} · {exercise.trackingType.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.musclesText, ts.textMuted]}>
                  MUSCLES: {exercise.primaryMuscles.join(', ').toUpperCase()}
                </Text>
              </CyberpunkCard>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextWrap: { flex: 1, paddingRight: 8 },
  title: { fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' },
  subtitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
    marginBottom: 10,
  },
  scopeBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scopeBtnText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  searchInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  filterGroup: { marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  chipText: { fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' },
  countText: { fontSize: 11, fontFamily: 'monospace', marginBottom: 8 },
  list: { flex: 1 },
  card: { marginBottom: 8, padding: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  exerciseName: { fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' },
  badge: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  musclesText: { fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
  emptyText: { fontSize: 13, fontFamily: 'monospace' },
});
