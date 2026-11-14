// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  ImageSourcePropType,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useAppTheme } from '../../src/theme/useTheme';
import { useThemeStyles } from '../../src/theme/useThemeStyles';
import { useProfileStore } from '../../src/stores/profileStore';
import { filterExercises, useExerciseStore } from '../../src/stores/exerciseStore';
import { formatLastDoneSummary, useSessionStore } from '../../src/stores/sessionStore';
import { formatSuggestionChip, suggestNext } from '../../src/engine/suggest';
import {
  getCoachDisplayForExercise,
  getSpecialistTrainerForExercise,
  isTrainerUnlocked,
} from '../../src/engine/trainers';
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
  const [fullViewModal, setFullViewModal] = useState<{
    image: ImageSourcePropType;
    title: string;
  } | null>(null);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (fullViewModal) {
        setFullViewModal(null);
        return true;
      }
      if (detailExercise) {
        setDetailExercise(null);
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [detailExercise, fullViewModal]);

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
    const coachDisplay = getCoachDisplayForExercise(detailExercise, profile);
    const { coach, isSpecialist, specialist, coachingCue } = coachDisplay;
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
          {/* M11: Adaptive Coach & Drone Showcase Card */}
          <CyberpunkCard style={styles.card}>
            <View style={styles.specialistRow} testID="exercise-specialist-card">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setFullViewModal({
                    image: coach.portrait,
                    title: `${coach.name.toUpperCase()} // SPECIALIST RENDER`,
                  })
                }
              >
                <Image
                  source={coach.portrait}
                  style={styles.specialistThumb}
                  resizeMode="contain"
                  testID="exercise-coach-portrait"
                />
              </TouchableOpacity>
              <View style={styles.specialistInfo}>
                <View style={styles.specialistBadgeRow}>
                  <Text style={[styles.badge, ts.accent]}>
                    {isSpecialist
                      ? `SPECIALIST COACH // ${coach.callsign}`
                      : `TRAINING DRONE // ${coach.callsign}`}
                  </Text>
                  {!isSpecialistUnlocked && (
                    <Text
                      style={[styles.lockedCoachTag, { borderColor: theme.colors.secondary }]}
                      testID="coach-locked-badge"
                    >
                      LOCKED SPECIALIST // {specialist.unlockCost} ¥
                    </Text>
                  )}
                </View>
                <Text style={[styles.specialistName, ts.text]}>{coach.name}</Text>
                <Text
                  style={[styles.coachingCueText, ts.accent]}
                  numberOfLines={2}
                  testID="coach-cue-text"
                >
                  "{coachingCue}"
                </Text>
                <Text style={[styles.specialistSpecialty, ts.textMuted]} numberOfLines={2}>
                  {coach.specialty}
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
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        showcase.start &&
                        setFullViewModal({
                          image: showcase.start,
                          title: `${detailExercise.name.toUpperCase()} // START POSE`,
                        })
                      }
                      style={styles.poseCol}
                    >
                      <Image
                        source={showcase.start}
                        style={[styles.poseImage, !isSpecialistUnlocked && styles.poseImageLocked]}
                        resizeMode="contain"
                        testID="exercise-pose-start"
                      />
                      <Text style={[styles.poseCaption, ts.textMuted]}>START [🔍 FULL]</Text>
                    </TouchableOpacity>
                  ) : null}
                  {showcase.end ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        showcase.end &&
                        setFullViewModal({
                          image: showcase.end,
                          title: `${detailExercise.name.toUpperCase()} // END POSE`,
                        })
                      }
                      style={styles.poseCol}
                    >
                      <Image
                        source={showcase.end}
                        style={[styles.poseImage, !isSpecialistUnlocked && styles.poseImageLocked]}
                        resizeMode="contain"
                        testID="exercise-pose-end"
                      />
                      <Text style={[styles.poseCaption, ts.textMuted]}>END [🔍 FULL]</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Cyberpunk Hologram Encryption Overlay if trainer is locked */}
                {!isSpecialistUnlocked && (
                  <View
                    style={[
                      styles.encryptedHoloBanner,
                      {
                        backgroundColor: 'rgba(20, 16, 28, 0.90)',
                        borderColor: theme.colors.secondary,
                      },
                    ]}
                    testID="coach-encrypted-overlay"
                  >
                    <Text style={[styles.encryptedBannerTitle, { color: theme.colors.secondary }]}>
                      [DEFAULT SYNTH DRONE // UPGRADE AVAILABLE]
                    </Text>
                    <Text style={[styles.encryptedBannerSub, ts.textMuted]}>
                      Unlock {specialist.callsign} ({specialist.unlockCost} ¥) in Settings to
                      decrypt {specialist.name}'s signature poses & coaching telemetry
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
              <CyberpunkCard
                glow
                style={{
                  ...styles.card,
                  borderColor: theme.colors.secondary,
                  borderWidth: 1.5,
                }}
              >
                <Text style={[styles.badge, { color: theme.colors.secondary }]}>
                  NEXT IN 3-LEVEL PROGRESSION LADDER ↗
                </Text>
                <Text style={[styles.exerciseName, ts.text]}>{nextProgression.name}</Text>
                <Text style={[styles.musclesText, { color: theme.colors.secondary }]}>
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

        {/* Full-view modal for exercise pose or specialist render */}
        <Modal
          visible={!!fullViewModal}
          transparent
          animationType="fade"
          onRequestClose={() => setFullViewModal(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setFullViewModal(null)}
            style={styles.modalBackdrop}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[styles.modalCard, { borderColor: theme.colors.primary }]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, ts.accent]} numberOfLines={1} ellipsizeMode="tail">
                  {fullViewModal?.title}
                </Text>
                <TouchableOpacity
                  onPress={() => setFullViewModal(null)}
                  style={styles.modalCloseBtn}
                  testID="close-exercise-fullview-modal"
                >
                  <Text style={styles.modalCloseText}>✕ CLOSE</Text>
                </TouchableOpacity>
              </View>
              {fullViewModal && (
                <Image
                  source={fullViewModal.image}
                  style={styles.modalFullImage}
                  resizeMode="contain"
                />
              )}
              <TouchableOpacity
                onPress={() => setFullViewModal(null)}
                style={styles.modalBottomDismissBtn}
              >
                <Text style={[styles.modalBottomDismissText, ts.textMuted]}>
                  [ TAP ANYWHERE OR PRESS TO CLOSE ]
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
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
  specialistThumb: {
    width: 56,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
    backgroundColor: '#0c0914',
  },
  specialistInfo: { flex: 1 },
  specialistName: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', marginTop: 2 },
  specialistSpecialty: { fontSize: 10, fontFamily: 'monospace', marginTop: 2 },
  coachingCueText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontStyle: 'italic',
    marginTop: 3,
    marginBottom: 2,
  },
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
  poseImage: { width: '100%', height: 180, borderRadius: 8, backgroundColor: '#0c0914' },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 3, 10, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#14101c',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2236',
    paddingBottom: 8,
    gap: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    paddingRight: 4,
  },
  modalCloseBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ff4444',
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    flexShrink: 0,
  },
  modalCloseText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#ff5555',
  },
  modalFullImage: {
    width: '100%',
    height: 440,
    maxHeight: '80%',
  },
  modalBottomDismissBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modalBottomDismissText: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
