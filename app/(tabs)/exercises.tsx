// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Image } from 'react-native';
import { useAppTheme } from '../../src/theme/useTheme';
import { useThemeStyles } from '../../src/theme/useThemeStyles';
import { useProfileStore } from '../../src/stores/profileStore';
import { filterExercises, useExerciseStore } from '../../src/stores/exerciseStore';
import { formatLastDoneSummary, useSessionStore } from '../../src/stores/sessionStore';
import { formatSuggestionChip, suggestNext } from '../../src/engine/suggest';
import { getSpecialistTrainerForExercise, isTrainerUnlocked } from '../../src/engine/trainers';
import { getExerciseShowcase } from '../../src/engine/exerciseShowcases';
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
  const profile = useProfileStore((s) => s.profile);
  const availableEquipment = profile.availableEquipment;
  const getLastWorkingSets = useSessionStore((s) => s.getLastWorkingSets);
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);

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

  if (detailExercise) {
    const lastSets = getLastWorkingSets(detailExercise.id);
    const lastSummary = formatLastDoneSummary(lastSets, detailExercise.trackingType);
    const suggestion = suggestNext(lastSets, profile, detailExercise);
    const suggestionChip = formatSuggestionChip(suggestion, profile.units);
    const specialist = getSpecialistTrainerForExercise(detailExercise);
    const isSpecialistUnlocked = isTrainerUnlocked(profile, specialist.id);
    const showcase = getExerciseShowcase(detailExercise.id);
    const nextProgression = detailExercise.nextProgressionId
      ? exercises.find((e) => e.id === detailExercise.nextProgressionId)
      : undefined;

    return (
      <View style={[styles.container, ts.bg]} testID="exercise-detail-view">
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.title, ts.accent]} testID="exercise-detail-title">
              {detailExercise.name}
            </Text>
            <Text style={[styles.subtitle, ts.textMuted]}>
              {detailExercise.equipment.toUpperCase()}
              {detailExercise.tier ? ` · TIER: ${detailExercise.tier.toUpperCase()}` : ''} ·{' '}
              {detailExercise.trackingType.toUpperCase()}
            </Text>
          </View>
          <Pressable
            testID="close-exercise-detail-btn"
            onPress={() => setDetailExercise(null)}
            style={[styles.scopeBtn, { borderColor: theme.colors.primary }]}
          >
            <Text style={[styles.scopeBtnText, ts.accent]}>BACK</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.list}>
          {/* M8: Specialist Trainer Showcase Card */}
          <CyberpunkCard style={styles.card}>
            <View style={styles.specialistRow} testID="exercise-specialist-card">
              <Image source={specialist.portrait} style={styles.specialistThumb} />
              <View style={styles.specialistInfo}>
                <View style={styles.specialistBadgeRow}>
                  <Text style={[styles.badge, ts.accent]}>
                    SPECIALIST COACH // {specialist.callsign}
                  </Text>
                  {!isSpecialistUnlocked && (
                    <Text
                      style={[styles.lockedCoachTag, { borderColor: theme.colors.secondary }]}
                      testID="coach-locked-badge"
                    >
                      ENCRYPTED // {specialist.unlockCost} ¥
                    </Text>
                  )}
                </View>
                <Text style={[styles.specialistName, ts.text]}>{specialist.name}</Text>
                <Text style={[styles.specialistSpecialty, ts.textMuted]} numberOfLines={2}>
                  {specialist.specialty}
                </Text>
              </View>
            </View>

            {/* Start/End showcase poses; themed fallback card when none bundled */}
            {showcase?.start || showcase?.end ? (
              <View style={styles.poseRowContainer}>
                <View
                  style={[styles.poseRow, !isSpecialistUnlocked && styles.poseRowEncrypted]}
                  testID="exercise-pose-images"
                >
                  {showcase.start ? (
                    <View style={styles.poseCol}>
                      <Image
                        source={showcase.start}
                        style={[styles.poseImage, !isSpecialistUnlocked && styles.poseImageLocked]}
                        resizeMode="contain"
                        testID="exercise-pose-start"
                      />
                      <Text style={[styles.poseCaption, ts.textMuted]}>START</Text>
                    </View>
                  ) : null}
                  {showcase.end ? (
                    <View style={styles.poseCol}>
                      <Image
                        source={showcase.end}
                        style={[styles.poseImage, !isSpecialistUnlocked && styles.poseImageLocked]}
                        resizeMode="contain"
                        testID="exercise-pose-end"
                      />
                      <Text style={[styles.poseCaption, ts.textMuted]}>END</Text>
                    </View>
                  ) : null}
                </View>

                {/* Cyberpunk Hologram Encryption Overlay if trainer is locked */}
                {!isSpecialistUnlocked && (
                  <View
                    style={[
                      styles.encryptedHoloBanner,
                      {
                        backgroundColor: 'rgba(20, 16, 28, 0.88)',
                        borderColor: theme.colors.secondary,
                      },
                    ]}
                    testID="coach-encrypted-overlay"
                  >
                    <Text style={[styles.encryptedBannerTitle, { color: theme.colors.secondary }]}>
                      [DOSSIER ENCRYPTED // {specialist.unlockCost} ¥]
                    </Text>
                    <Text style={[styles.encryptedBannerSub, ts.textMuted]}>
                      Unlock {specialist.callsign} in Settings with Creds to decrypt full coach
                      telemetry & breakdown
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View
                testID="exercise-pose-fallback-card"
                style={[
                  styles.poseFallback,
                  {
                    borderColor: theme.colors.primary,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
              >
                <Text style={[styles.poseCode, ts.accent]}>
                  POSE // {specialist.callsign} · {detailExercise.equipment.toUpperCase()}
                </Text>
                <Text style={[styles.poseTitle, ts.text]}>{detailExercise.name}</Text>
                <Text style={[styles.poseMeta, ts.textMuted]}>
                  HD SPECIALIST SHOWCASE // Æ CYBERNETICS RIG
                </Text>
              </View>
            )}
          </CyberpunkCard>

          <CyberpunkCard style={styles.card}>
            <Text style={[styles.badge, ts.accent]}>SUGGESTED NEXT</Text>
            <Text
              testID="exercise-detail-suggestion"
              style={[styles.detailSuggestionText, ts.text]}
            >
              {suggestionChip}
            </Text>
            <Text style={[styles.musclesText, ts.textMuted]}>
              {lastSummary ?? 'NO PRIOR WORKING SETS LOGGED'}
            </Text>
          </CyberpunkCard>

          <CyberpunkCard glow={false} style={styles.card}>
            <Text style={[styles.badge, ts.accent]}>TARGET MUSCLES</Text>
            <Text style={[styles.musclesText, ts.text]}>
              PRIMARY: {detailExercise.primaryMuscles.join(', ').toUpperCase()}
            </Text>
            {detailExercise.secondaryMuscles && detailExercise.secondaryMuscles.length > 0 && (
              <Text style={[styles.musclesText, ts.textMuted]}>
                SECONDARY: {detailExercise.secondaryMuscles.join(', ').toUpperCase()}
              </Text>
            )}
          </CyberpunkCard>

          {nextProgression && (
            <Pressable
              testID="exercise-detail-next-tier"
              onPress={() => setDetailExercise(nextProgression)}
            >
              <CyberpunkCard glow={false} style={styles.card}>
                <Text style={[styles.badge, ts.accent]}>NEXT IN 3-LEVEL PROGRESSION LADDER ↗</Text>
                <Text style={[styles.exerciseName, ts.text]}>{nextProgression.name}</Text>
                <Text style={[styles.musclesText, ts.textMuted]}>
                  TIER: {(nextProgression.tier ?? 'advanced').toUpperCase()} · TAP TO INSPECT
                </Text>
              </CyberpunkCard>
            </Pressable>
          )}

          {detailExercise.instructions && detailExercise.instructions.length > 0 && (
            <CyberpunkCard glow={false} style={styles.card}>
              <Text style={[styles.badge, ts.accent]}>EXECUTION PROTOCOL</Text>
              {detailExercise.instructions.map((step, idx) => (
                <Text key={idx} style={[styles.instructionText, ts.text]}>
                  {idx + 1}. {step}
                </Text>
              ))}
            </CyberpunkCard>
          )}
        </ScrollView>
      </View>
    );
  }

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
              onPress={() => {
                if (onSelectExercise) {
                  onSelectExercise(exercise);
                } else {
                  setDetailExercise(exercise);
                }
              }}
            >
              <CyberpunkCard glow={false} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.exerciseName, ts.text]}>{exercise.name}</Text>
                  <Text style={[styles.badge, ts.accent]}>
                    {exercise.equipment.toUpperCase()}
                    {exercise.tier ? ` · ${exercise.tier.toUpperCase()}` : ''} ·{' '}
                    {exercise.trackingType.toUpperCase()}
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
  detailSuggestionText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 6,
    marginBottom: 4,
  },
  instructionText: { fontSize: 12, fontFamily: 'monospace', marginTop: 6 },
  emptyText: { fontSize: 13, fontFamily: 'monospace' },
  specialistRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  specialistThumb: { width: 56, height: 56, borderRadius: 8, borderWidth: 1, marginRight: 12 },
  specialistInfo: { flex: 1 },
  specialistName: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', marginTop: 2 },
  specialistSpecialty: { fontSize: 10, fontFamily: 'monospace', marginTop: 2 },
  poseFallback: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poseRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginVertical: 6 },
  poseRowContainer: { position: 'relative' },
  poseRowEncrypted: { opacity: 0.35 },
  poseImageLocked: { opacity: 0.6 },
  poseCol: { flex: 1, maxWidth: 170, alignItems: 'center' },
  poseImage: { width: '100%', height: 160, borderRadius: 8 },
  poseCaption: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace', marginTop: 4 },
  specialistBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  lockedCoachTag: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    color: '#ffaa00',
  },
  encryptedHoloBanner: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: '25%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encryptedBannerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  encryptedBannerSub: {
    fontSize: 9,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 12,
  },
  poseCode: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  poseTitle: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', marginVertical: 4 },
  poseMeta: { fontSize: 9, fontFamily: 'monospace' },
});
