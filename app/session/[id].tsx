// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ExercisesScreen from '../(tabs)/exercises';
import { useAppTheme } from '../../src/theme/useTheme';
import { useThemeStyles } from '../../src/theme/useThemeStyles';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';
import { useProfileStore } from '../../src/stores/profileStore';
import { useExerciseStore } from '../../src/stores/exerciseStore';
import { formatSuggestionChip, suggestNext } from '../../src/engine/suggest';
import { formatIntervalTime } from '../../src/engine/intervalTimer';
import {
  formatLastDoneSummary,
  getDefaultRestSeconds,
  useSessionStore,
} from '../../src/stores/sessionStore';
import { Exercise } from '../../src/types';

interface SessionLoggerScreenProps {
  sessionId?: string;
  onFinishSession?: () => void;
}

export default function SessionLoggerScreen({
  sessionId = 'session-new',
  onFinishSession,
}: SessionLoggerScreenProps) {
  const theme = useAppTheme();
  const ts = useThemeStyles();
  const [pickerOpen, setPickerOpen] = useState(false);

  const profile = useProfileStore((s) => s.profile);
  const exercises = useExerciseStore((s) => s.exercises);

  const activeSession = useSessionStore((s) => s.activeSession);
  const restTimerSec = useSessionStore((s) => s.restTimerSec);
  const restTimerRunning = useSessionStore((s) => s.restTimerRunning);
  const startSession = useSessionStore((s) => s.startSession);
  const updateSessionName = useSessionStore((s) => s.updateSessionName);
  const getLastWorkingSets = useSessionStore((s) => s.getLastWorkingSets);
  const addExerciseEntry = useSessionStore((s) => s.addExerciseEntry);
  const removeExerciseEntry = useSessionStore((s) => s.removeExerciseEntry);
  const applySuggestionToEntry = useSessionStore((s) => s.applySuggestionToEntry);
  const addSet = useSessionStore((s) => s.addSet);
  const updateSet = useSessionStore((s) => s.updateSet);
  const toggleSetComplete = useSessionStore((s) => s.toggleSetComplete);
  const removeSet = useSessionStore((s) => s.removeSet);
  const tickRestTimer = useSessionStore((s) => s.tickRestTimer);
  const adjustRestTimer = useSessionStore((s) => s.adjustRestTimer);
  const stopRestTimer = useSessionStore((s) => s.stopRestTimer);
  const intervalTimer = useSessionStore((s) => s.intervalTimer);
  const startIntervalTimer = useSessionStore((s) => s.startIntervalTimer);
  const toggleIntervalTimerRunning = useSessionStore((s) => s.toggleIntervalTimerRunning);
  const resetIntervalTimer = useSessionStore((s) => s.resetIntervalTimer);
  const stopIntervalTimer = useSessionStore((s) => s.stopIntervalTimer);
  const tickIntervalTimerStep = useSessionStore((s) => s.tickIntervalTimerStep);
  const finishActiveSession = useSessionStore((s) => s.finishActiveSession);
  const openExistingSession = useSessionStore((s) => s.openExistingSession);
  const cancelOrDeleteSession = useSessionStore((s) => s.cancelOrDeleteSession);

  useEffect(() => {
    const current = useSessionStore.getState().activeSession;
    if (!current || current.id !== sessionId) {
      const opened = openExistingSession(sessionId);
      if (!opened) {
        startSession(sessionId);
      }
    }
  }, [sessionId, openExistingSession, startSession]);

  useEffect(() => {
    if (!restTimerRunning) return undefined;
    const interval = setInterval(() => {
      tickRestTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimerRunning, tickRestTimer]);

  useEffect(() => {
    if (!intervalTimer.running) return undefined;
    const interval = setInterval(() => {
      tickIntervalTimerStep();
    }, 1000);
    return () => clearInterval(interval);
  }, [intervalTimer.running, tickIntervalTimerStep]);

  const handleBack = () => {
    onFinishSession?.();
  };

  const handleCancelOrDelete = () => {
    cancelOrDeleteSession(sessionId);
    onFinishSession?.();
  };

  const handleFinish = () => {
    finishActiveSession();
    onFinishSession?.();
  };

  const handleSelectExercise = (exercise: Exercise) => {
    addExerciseEntry(exercise, {
      fixedKettlebellWeight: profile.fixedKettlebellWeight,
      repMin: profile.repRange.min,
    });
    setPickerOpen(false);
  };

  if (pickerOpen) {
    return (
      <View style={[styles.pickerContainer, ts.bg]} testID="session-exercise-picker">
        <View style={styles.pickerHeader}>
          <Text style={[styles.title, ts.accent]}>SELECT EXERCISE</Text>
          <TouchableOpacity
            testID="close-exercise-picker-btn"
            style={[styles.finishBtn, { borderColor: theme.colors.border }]}
            onPress={() => setPickerOpen(false)}
          >
            <Text style={[styles.finishText, ts.textMuted]}>CLOSE</Text>
          </TouchableOpacity>
        </View>
        <ExercisesScreen onSelectExercise={handleSelectExercise} />
      </View>
    );
  }

  const exerciseById = new Map(exercises.map((e) => [e.id, e]));
  const entries = activeSession?.entries ?? [];

  return (
    <View style={[styles.container, ts.bg]} testID="screen-session-logger">
      <View style={styles.headerRow}>
        <TouchableOpacity
          testID="session-back-btn"
          style={[styles.finishBtn, { borderColor: theme.colors.border }]}
          onPress={handleBack}
        >
          <Text style={[styles.finishText, ts.textMuted]}>← BACK</Text>
        </TouchableOpacity>

        <Text style={[styles.title, ts.accent]} numberOfLines={1}>
          SESSION LOGGER // {sessionId}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            testID="cancel-session-btn"
            style={[styles.finishBtn, { borderColor: theme.colors.danger }]}
            onPress={handleCancelOrDelete}
          >
            <Text style={[styles.finishText, { color: theme.colors.danger }]}>CANCEL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="finish-session-btn"
            style={[styles.finishBtn, { borderColor: theme.colors.primary }]}
            onPress={handleFinish}
          >
            <Text style={[styles.finishText, ts.accent]}>FINISH</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        testID="session-name-input"
        value={activeSession?.name ?? ''}
        onChangeText={updateSessionName}
        placeholder="Session name (e.g. KB & Rings A)"
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.sessionNameInput,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
          },
        ]}
      />

      {(restTimerRunning || restTimerSec > 0) && (
        <View
          testID="rest-timer-banner"
          style={[
            styles.timerBanner,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Text style={[styles.timerText, ts.accent]}>REST TIMER // {restTimerSec}s</Text>
          <View style={styles.timerActions}>
            <TouchableOpacity
              testID="rest-timer-plus-15"
              style={[styles.timerBtn, { borderColor: theme.colors.border }]}
              onPress={() => adjustRestTimer(15)}
            >
              <Text style={[styles.timerBtnText, ts.text]}>+15s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="rest-timer-skip"
              style={[styles.timerBtn, { borderColor: theme.colors.danger }]}
              onPress={stopRestTimer}
            >
              <Text style={[styles.timerBtnText, { color: theme.colors.danger }]}>SKIP</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {intervalTimer.mode !== 'off' ? (
        <View
          testID="interval-timer-banner"
          style={[
            styles.intervalBanner,
            {
              backgroundColor: theme.colors.surface,
              borderColor:
                intervalTimer.phase === 'work'
                  ? theme.colors.primary
                  : intervalTimer.phase === 'prep'
                    ? theme.colors.secondary
                    : theme.colors.border,
            },
          ]}
        >
          <View style={styles.intervalHeader}>
            <View style={styles.intervalBadgeRow}>
              <Text style={[styles.intervalModeBadge, ts.accent]}>
                [{intervalTimer.mode.toUpperCase()}]
              </Text>
              <Text style={[styles.intervalRoundText, ts.text]}>
                ROUND {intervalTimer.currentRound}/{intervalTimer.totalRounds}
              </Text>
            </View>
            <Text
              style={[
                styles.intervalPhaseBadge,
                {
                  color:
                    intervalTimer.phase === 'work'
                      ? theme.colors.primary
                      : intervalTimer.phase === 'prep'
                        ? theme.colors.secondary
                        : theme.colors.textSecondary,
                },
              ]}
            >
              ● {intervalTimer.phase.toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.intervalCountdown, ts.accent]} testID="interval-timer-countdown">
            {formatIntervalTime(intervalTimer.remainingSec)}
          </Text>

          <View style={styles.intervalActionRow}>
            <TouchableOpacity
              testID="interval-timer-toggle"
              style={[
                styles.intervalBtn,
                {
                  backgroundColor: intervalTimer.running ? 'transparent' : theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={toggleIntervalTimerRunning}
            >
              <Text
                style={[
                  styles.intervalBtnText,
                  {
                    color: intervalTimer.running ? theme.colors.primary : theme.colors.headerBg,
                  },
                ]}
              >
                {intervalTimer.running ? '❚❚ PAUSE' : '▶ START'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="interval-timer-reset"
              style={[styles.intervalBtn, { borderColor: theme.colors.border }]}
              onPress={resetIntervalTimer}
            >
              <Text style={[styles.intervalBtnText, ts.textMuted]}>↻ RESET</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="interval-timer-close"
              style={[styles.intervalBtn, { borderColor: theme.colors.danger }]}
              onPress={stopIntervalTimer}
            >
              <Text style={[styles.intervalBtnText, { color: theme.colors.danger }]}>✕ STOP</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.presetBar} testID="interval-preset-bar">
          <Text style={[styles.presetBarLabel, ts.textMuted]}>ROUND TIMER:</Text>
          <TouchableOpacity
            testID="interval-preset-emom"
            style={[styles.presetChip, { borderColor: theme.colors.primary }]}
            onPress={() => startIntervalTimer('emom-10')}
          >
            <Text style={[styles.presetChipText, ts.accent]}>EMOM 10×60s</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="interval-preset-tabata"
            style={[styles.presetChip, { borderColor: theme.colors.primary }]}
            onPress={() => startIntervalTimer('tabata-standard')}
          >
            <Text style={[styles.presetChipText, ts.accent]}>TABATA 20/10</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="interval-preset-combat"
            style={[styles.presetChip, { borderColor: theme.colors.primary }]}
            onPress={() => startIntervalTimer('combat-rounds')}
          >
            <Text style={[styles.presetChipText, ts.accent]}>COMBAT 3m</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        testID="open-exercise-picker-btn"
        style={[styles.addExerciseBtn, { borderColor: theme.colors.primary }]}
        onPress={() => setPickerOpen(true)}
      >
        <Text style={[styles.addExerciseText, ts.accent]}>+ ADD EXERCISE</Text>
      </TouchableOpacity>

      <ScrollView style={styles.entriesList} testID="session-entries-list">
        {entries.length === 0 ? (
          <CyberpunkCard>
            <Text style={[styles.bodyText, ts.textMuted]}>
              No exercises in session yet. Tap + ADD EXERCISE to load movements.
            </Text>
          </CyberpunkCard>
        ) : (
          entries.map((entry) => {
            const exercise = exerciseById.get(entry.exerciseId);
            const isDuration = exercise?.trackingType === 'duration';
            const restDefault = getDefaultRestSeconds(exercise);
            const lastWorkingSets = getLastWorkingSets(entry.exerciseId);
            const lastDoneSummary = formatLastDoneSummary(
              lastWorkingSets,
              isDuration ? 'duration' : 'reps',
            );
            const effectiveExercise: Exercise = exercise ?? {
              id: entry.exerciseId,
              name: entry.exerciseId,
              primaryMuscles: [],
              equipment: 'kettlebell',
              trackingType: 'reps',
            };
            const suggestion = suggestNext(lastWorkingSets, profile, effectiveExercise);
            const suggestionLabel = formatSuggestionChip(suggestion, profile.units);

            return (
              <CyberpunkCard key={entry.id} glow={false} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleWrap}>
                    <Text style={[styles.entryTitle, ts.text]}>
                      {exercise?.name ?? entry.exerciseId}
                    </Text>
                    {exercise && (
                      <Text style={[styles.entrySub, ts.accent]}>
                        {exercise.equipment.toUpperCase()}
                        {exercise.tier ? ` · ${exercise.tier.toUpperCase()}` : ''}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    testID={`remove-entry-${entry.id}`}
                    onPress={() => removeExerciseEntry(entry.id)}
                  >
                    <Text style={[styles.removeText, { color: theme.colors.danger }]}>REMOVE</Text>
                  </TouchableOpacity>
                </View>

                <View
                  testID={
                    lastDoneSummary ? `last-done-chip-${entry.id}` : `first-time-chip-${entry.id}`
                  }
                  style={[
                    styles.prefillChip,
                    {
                      borderColor: lastDoneSummary ? theme.colors.primary : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                >
                  <Text
                    style={[styles.prefillChipText, lastDoneSummary ? ts.accent : ts.textMuted]}
                  >
                    {lastDoneSummary ?? 'FIRST TIME // DEFAULT PREFILL'}
                  </Text>
                </View>

                <View
                  testID={`suggestion-chip-${entry.id}`}
                  style={[
                    styles.suggestionRow,
                    {
                      borderColor:
                        suggestion.action === 'increase'
                          ? theme.colors.primary
                          : suggestion.action === 'deload'
                            ? theme.colors.danger
                            : theme.colors.secondary,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      {
                        color:
                          suggestion.action === 'increase'
                            ? theme.colors.primary
                            : suggestion.action === 'deload'
                              ? theme.colors.danger
                              : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {suggestionLabel}
                  </Text>
                  {suggestion.action !== 'first_time' && (
                    <TouchableOpacity
                      testID={`apply-suggestion-${entry.id}`}
                      style={[styles.applyBtn, { borderColor: theme.colors.primary }]}
                      onPress={() => applySuggestionToEntry(entry.id, suggestion)}
                    >
                      <Text style={[styles.applyBtnText, ts.accent]}>APPLY</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {entry.sets.map((set, idx) => (
                  <View
                    key={set.id}
                    testID={`set-row-${set.id}`}
                    style={[
                      styles.setRow,
                      set.completed && { backgroundColor: theme.colors.checkedBg },
                    ]}
                  >
                    <TouchableOpacity
                      testID={`toggle-warmup-${set.id}`}
                      style={[
                        styles.warmupBadge,
                        {
                          borderColor: set.isWarmup ? theme.colors.secondary : theme.colors.border,
                        },
                      ]}
                      onPress={() => updateSet(entry.id, set.id, { isWarmup: !set.isWarmup })}
                    >
                      <Text
                        style={[
                          styles.warmupText,
                          {
                            color: set.isWarmup
                              ? theme.colors.secondary
                              : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        {set.isWarmup ? 'W' : `#${idx + 1}`}
                      </Text>
                    </TouchableOpacity>

                    {isDuration ? (
                      <View style={styles.inputGroup}>
                        <TextInput
                          testID={`set-duration-${set.id}`}
                          keyboardType="numeric"
                          value={String(set.durationSec ?? 0)}
                          onChangeText={(val) =>
                            updateSet(entry.id, set.id, {
                              durationSec: Number(val.replace(/[^0-9]/g, '')) || 0,
                            })
                          }
                          style={[
                            styles.setInput,
                            {
                              borderColor: theme.colors.border,
                              color: theme.colors.textPrimary,
                            },
                          ]}
                        />
                        <Text style={[styles.unitLabel, ts.textMuted]}>SEC</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.inputGroup}>
                          <TextInput
                            testID={`set-weight-${set.id}`}
                            keyboardType="numeric"
                            value={String(set.weight ?? 0)}
                            onChangeText={(val) =>
                              updateSet(entry.id, set.id, {
                                weight: Number(val.replace(/[^0-9.]/g, '')) || 0,
                              })
                            }
                            style={[
                              styles.setInput,
                              {
                                borderColor: theme.colors.border,
                                color: theme.colors.textPrimary,
                              },
                            ]}
                          />
                          <Text style={[styles.unitLabel, ts.textMuted]}>
                            {profile.units.toUpperCase()}
                          </Text>
                        </View>

                        <View style={styles.inputGroup}>
                          <TextInput
                            testID={`set-reps-${set.id}`}
                            keyboardType="numeric"
                            value={String(set.reps ?? 0)}
                            onChangeText={(val) =>
                              updateSet(entry.id, set.id, {
                                reps: Number(val.replace(/[^0-9]/g, '')) || 0,
                              })
                            }
                            style={[
                              styles.setInput,
                              {
                                borderColor: theme.colors.border,
                                color: theme.colors.textPrimary,
                              },
                            ]}
                          />
                          <Text style={[styles.unitLabel, ts.textMuted]}>REPS</Text>
                        </View>
                      </>
                    )}

                    <TouchableOpacity
                      testID={`check-set-${set.id}`}
                      style={[
                        styles.checkBtn,
                        {
                          borderColor: set.completed ? theme.colors.primary : theme.colors.border,
                          backgroundColor: set.completed ? theme.colors.primary : 'transparent',
                        },
                      ]}
                      onPress={() => toggleSetComplete(entry.id, set.id, restDefault)}
                    >
                      <Text
                        style={[
                          styles.checkBtnText,
                          {
                            color: set.completed ? theme.colors.headerBg : theme.colors.textPrimary,
                          },
                        ]}
                      >
                        {set.completed ? '✓' : 'LOG'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      testID={`remove-set-${set.id}`}
                      style={styles.deleteSetBtn}
                      onPress={() => removeSet(entry.id, set.id)}
                    >
                      <Text style={[styles.deleteSetText, ts.textMuted]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  testID={`add-set-${entry.id}`}
                  style={[styles.addSetBtn, { borderColor: theme.colors.border }]}
                  onPress={() => addSet(entry.id, exercise)}
                >
                  <Text style={[styles.addSetText, ts.textMuted]}>+ ADD SET</Text>
                </TouchableOpacity>
              </CyberpunkCard>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  pickerContainer: { flex: 1 },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  headerActions: { flexDirection: 'row', gap: 6 },
  title: { flex: 1, fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  finishBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  finishText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  sessionNameInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  timerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  timerText: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  timerActions: { flexDirection: 'row', gap: 8 },
  timerBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timerBtnText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  intervalBanner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  intervalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  intervalBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  intervalModeBadge: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  intervalRoundText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  intervalPhaseBadge: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  intervalCountdown: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginVertical: 4,
  },
  intervalActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    width: '100%',
    justifyContent: 'center',
  },
  intervalBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  intervalBtnText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  presetBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  presetBarLabel: { fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' },
  presetChip: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  presetChipText: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  addExerciseBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseText: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  entriesList: { flex: 1 },
  bodyText: { fontSize: 13, fontFamily: 'monospace' },
  entryCard: { marginBottom: 12, padding: 12 },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTitleWrap: { flex: 1, paddingRight: 8 },
  entryTitle: { fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' },
  entrySub: { fontSize: 10, fontFamily: 'monospace', marginTop: 2 },
  removeText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  prefillChip: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  prefillChipText: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    paddingRight: 8,
  },
  applyBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  applyBtnText: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  warmupBadge: {
    borderWidth: 1,
    borderRadius: 4,
    width: 30,
    paddingVertical: 4,
    alignItems: 'center',
    marginRight: 6,
  },
  warmupText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  setInput: {
    borderWidth: 1,
    borderRadius: 4,
    width: 52,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  unitLabel: { fontSize: 10, fontFamily: 'monospace', marginLeft: 4 },
  checkBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 'auto',
  },
  checkBtnText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  deleteSetBtn: { paddingHorizontal: 6, paddingVertical: 4, marginLeft: 4 },
  deleteSetText: { fontSize: 12, fontFamily: 'monospace' },
  addSetBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 6,
  },
  addSetText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
});
