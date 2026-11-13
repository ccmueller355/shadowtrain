// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';
import { computeWeeklyStreak, generateAdaptivePlan } from '../../src/engine/plan';
import { CULT_PROGRAMS, CultProgram } from '../../src/engine/programs';
import { getTrainerById } from '../../src/engine/trainers';
import { useExerciseStore } from '../../src/stores/exerciseStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useAppTheme } from '../../src/theme/useTheme';
import { useThemeStyles } from '../../src/theme/useThemeStyles';

interface HomeScreenProps {
  onStartSession?: (sessionId: string) => void;
}

export default function HomeScreen({ onStartSession }: HomeScreenProps) {
  const theme = useAppTheme();
  const ts = useThemeStyles();
  const activeSession = useSessionStore((s) => s.activeSession);
  const recentSessions = useSessionStore((s) => s.recentSessions);
  const startSession = useSessionStore((s) => s.startSession);
  const startPlannedSession = useSessionStore((s) => s.startPlannedSession);
  const startProgramSession = useSessionStore((s) => s.startProgramSession);
  const openExistingSession = useSessionStore((s) => s.openExistingSession);
  const cancelOrDeleteSession = useSessionStore((s) => s.cancelOrDeleteSession);
  const profile = useProfileStore((s) => s.profile);
  const exercises = useExerciseStore((s) => s.exercises);

  const [refreshIndex, setRefreshIndex] = useState(0);
  const [selectedProgramId, setSelectedProgramId] = useState<string>(CULT_PROGRAMS[0].id);
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState(0);

  const currentProgram = CULT_PROGRAMS.find((p) => p.id === selectedProgramId) ?? CULT_PROGRAMS[0];
  const currentWorkout =
    currentProgram.workouts[selectedWorkoutIndex] ?? currentProgram.workouts[0];

  const activeTrainer = getTrainerById(profile.activeTrainerId);

  const adaptivePlan = useMemo(
    () =>
      generateAdaptivePlan({
        profile,
        exercises,
        recentSessions,
        refreshIndex,
      }),
    [profile, exercises, recentSessions, refreshIndex],
  );

  const streakSummary = useMemo(
    () => computeWeeklyStreak(recentSessions, profile.weeklyTargetDays ?? 4),
    [recentSessions, profile.weeklyTargetDays],
  );

  const handleStartNew = () => {
    startSession('session-new');
    onStartSession?.('session-new');
  };

  const handleStartPlanned = () => {
    const created = startPlannedSession(adaptivePlan, 'session-planned');
    onStartSession?.(created.id);
  };

  const handleStartProgram = (prog: CultProgram, wIndex = 0) => {
    const created = startProgramSession(prog, wIndex, `session-${prog.id}`);
    onStartSession?.(created.id);
  };

  const handleResume = () => {
    if (activeSession) {
      onStartSession?.(activeSession.id);
    }
  };

  const handleEditPastSession = (sessionId: string) => {
    const opened = openExistingSession(sessionId);
    if (opened) {
      onStartSession?.(opened.id);
    }
  };

  return (
    <ScrollView style={[styles.container, ts.bg]} testID="screen-home">
      <View style={styles.headerRow}>
        <View style={styles.headerTitleCol}>
          <Text style={[styles.title, ts.accent]}>SHADOW TRAIN</Text>
          <Text style={[styles.subtitle, ts.textMuted]}>
            OFFLINE WORKOUT LOGGER // KETTLEBELL & CALISTHENICS DECK
          </Text>
        </View>
        <View
          style={[styles.credsChip, { borderColor: theme.colors.primary }]}
          testID="home-creds-badge"
        >
          <Text style={[styles.credsChipText, ts.accent]}>{profile.creds ?? 0} ¥</Text>
        </View>
      </View>

      <CyberpunkCard glow={false} style={styles.trainerBanner}>
        <View style={styles.trainerBannerRow} testID="home-active-trainer-card">
          <Image
            source={activeTrainer.portrait}
            style={[styles.trainerAvatar, { borderColor: theme.colors.primary }]}
          />
          <View style={styles.trainerMetaCol}>
            <Text style={[styles.trainerLabel, ts.accent]}>
              ACTIVE TRAINER // {activeTrainer.callsign}
            </Text>
            <Text style={[styles.trainerName, ts.text]}>{activeTrainer.name}</Text>
            <Text style={[styles.trainerSplit, ts.textMuted]} testID="home-streak-badge">
              {streakSummary.label}
            </Text>
          </View>
        </View>
      </CyberpunkCard>

      {activeSession && (
        <CyberpunkCard style={styles.resumeCard}>
          <Text style={[styles.resumeLabel, ts.accent]}>ACTIVE SESSION IN PROGRESS</Text>
          <Text style={[styles.resumeTitle, ts.text]}>
            {activeSession.name ?? activeSession.id} · {activeSession.entries.length} EXERCISES
          </Text>
          <View style={styles.resumeActionRow}>
            <TouchableOpacity
              testID="resume-session-btn"
              style={[styles.resumeBtn, { borderColor: theme.colors.primary }]}
              onPress={handleResume}
            >
              <Text style={[styles.resumeBtnText, ts.accent]}>RESUME SESSION →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="discard-active-session-btn"
              style={[styles.discardBtn, { borderColor: theme.colors.danger }]}
              onPress={() => cancelOrDeleteSession(activeSession.id)}
            >
              <Text style={[styles.discardBtnText, { color: theme.colors.danger }]}>DISCARD</Text>
            </TouchableOpacity>
          </View>
        </CyberpunkCard>
      )}

      <CyberpunkCard glow={false} style={styles.planCard}>
        <View testID="home-workout-plan-card">
          <View style={styles.planHeaderRow}>
            <Text style={[styles.planTitle, ts.accent]} testID="plan-title">
              {adaptivePlan.title}
            </Text>
            <TouchableOpacity
              testID="refresh-plan-btn"
              style={[styles.refreshBtn, { borderColor: theme.colors.primary }]}
              onPress={() => setRefreshIndex((prev) => prev + 1)}
            >
              <Text style={[styles.refreshBtnText, ts.accent]}>↻ REFRESH</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.planReason, ts.textMuted]} testID="plan-reason-chip">
            {adaptivePlan.reasonChip}
          </Text>

          {adaptivePlan.items.map((item) => (
            <View
              key={item.exercise.id}
              testID={`plan-item-${item.exercise.id}`}
              style={[styles.planItemRow, { borderColor: theme.colors.border }]}
            >
              <Text style={[styles.planExName, ts.text]} numberOfLines={1}>
                {item.exercise.name}
              </Text>
              <Text style={[styles.planExTarget, ts.accent]} numberOfLines={1}>
                {item.targetSummary.replace('SUGGESTED // ', '')}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            testID="start-planned-session-btn"
            style={[styles.plannedBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleStartPlanned}
          >
            <Text style={[styles.primaryBtnText, { color: theme.colors.headerBg }]}>
              ⚡ START PLANNED WORKOUT ({adaptivePlan.items.length} MOVES)
            </Text>
          </TouchableOpacity>
        </View>
      </CyberpunkCard>

      <CyberpunkCard glow={false} style={styles.planCard}>
        <View testID="cult-programs-card">
          <Text style={[styles.planTitle, ts.accent]}>CULT PROTOCOLS // TEMPLATE MATRIX</Text>
          <Text style={[styles.planReason, ts.textMuted]}>
            TIME-TESTED HARDSTYLE & PRISON CALISTHENICS BLUEPRINTS
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.programTabsRow}
          >
            {CULT_PROGRAMS.map((prog) => {
              const active = prog.id === selectedProgramId;
              return (
                <TouchableOpacity
                  key={prog.id}
                  testID={`select-program-${prog.id}`}
                  style={[
                    styles.programTabChip,
                    {
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      backgroundColor: active ? theme.colors.surface : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setSelectedProgramId(prog.id);
                    setSelectedWorkoutIndex(0);
                  }}
                >
                  <Text style={[styles.programTabChipText, active ? ts.accent : ts.textMuted]}>
                    {prog.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.programDetailsBox}>
            <View style={styles.programMetaRow}>
              <Text style={[styles.programBadgeText, ts.accent]}>{currentProgram.badge}</Text>
              <Text style={[styles.programOriginText, ts.textMuted]}>
                {currentProgram.cultOrigin}
              </Text>
            </View>
            <Text style={[styles.programDescText, ts.text]}>{currentProgram.description}</Text>

            {currentProgram.workouts.length > 1 && (
              <View style={styles.workoutVariantRow}>
                {currentProgram.workouts.map((w, wIdx) => {
                  const isWActive = wIdx === selectedWorkoutIndex;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      testID={`select-workout-${w.id}`}
                      style={[
                        styles.workoutVariantBtn,
                        {
                          borderColor: isWActive ? theme.colors.primary : theme.colors.border,
                          backgroundColor: isWActive ? theme.colors.border : 'transparent',
                        },
                      ]}
                      onPress={() => setSelectedWorkoutIndex(wIdx)}
                    >
                      <Text
                        style={[styles.workoutVariantBtnText, isWActive ? ts.accent : ts.textMuted]}
                      >
                        {w.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.targetsListBox}>
              <Text style={[styles.targetsListTitle, ts.accent]}>
                {currentWorkout.title} // {currentWorkout.subtitle}
              </Text>
              {currentWorkout.targets.map((t, idx) => (
                <View key={`${t.exerciseId}-${idx}`} style={styles.targetItemRow}>
                  <Text style={[styles.targetExName, ts.text]}>• {t.exerciseId}</Text>
                  <Text style={[styles.targetSetsReps, ts.textMuted]}>
                    {t.sets} × {t.durationSec ? `${t.durationSec}s` : `${t.reps} reps`}
                    {t.isWarmup ? ' (WARMUP)' : ''}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              testID="launch-cult-program-btn"
              style={[styles.plannedBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleStartProgram(currentProgram, selectedWorkoutIndex)}
            >
              <Text style={[styles.primaryBtnText, { color: theme.colors.headerBg }]}>
                ⚡ LAUNCH CULT WORKOUT ({currentWorkout.recommendedTimerMode.toUpperCase()})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CyberpunkCard>

      <TouchableOpacity
        testID="start-session-btn"
        style={[styles.secondaryStartBtn, ts.surface, { borderColor: theme.colors.primary }]}
        onPress={handleStartNew}
      >
        <Text style={[styles.secondaryBtnText, ts.accent]}>+ START NEW SESSION (BLANK)</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, ts.sectionHeader]}>RECENT SESSIONS</Text>
      {recentSessions.length === 0 ? (
        <CyberpunkCard>
          <Text style={[styles.bodyText, ts.textMuted]}>
            No sessions logged yet. Tap Start New Session to jack in.
          </Text>
        </CyberpunkCard>
      ) : (
        recentSessions.slice(0, 5).map((session) => {
          const completedSets = session.entries.reduce(
            (sum, entry) => sum + entry.sets.filter((s) => s.completed).length,
            0,
          );
          return (
            <CyberpunkCard key={session.id} glow={false} style={styles.recentCard}>
              <View testID={`recent-session-${session.id}`} style={styles.recentRow}>
                <View style={styles.recentInfo}>
                  <Text style={[styles.recentName, ts.text]}>{session.name ?? session.id}</Text>
                  <Text style={[styles.recentMeta, ts.textMuted]}>
                    {session.entries.length} EXERCISES · {completedSets} SETS COMPLETED
                  </Text>
                </View>
                <View style={styles.recentActions}>
                  <TouchableOpacity
                    testID={`edit-session-${session.id}`}
                    style={[styles.smallActionBtn, { borderColor: theme.colors.primary }]}
                    onPress={() => handleEditPastSession(session.id)}
                  >
                    <Text style={[styles.smallActionText, ts.accent]}>EDIT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID={`delete-session-${session.id}`}
                    style={[styles.smallActionBtn, { borderColor: theme.colors.danger }]}
                    onPress={() => cancelOrDeleteSession(session.id)}
                  >
                    <Text style={[styles.smallActionText, { color: theme.colors.danger }]}>
                      DEL
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CyberpunkCard>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerTitleCol: { flex: 1, marginRight: 10 },
  title: { fontSize: 22, fontWeight: 'bold', fontFamily: 'monospace' },
  subtitle: { fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
  credsChip: {
    flexShrink: 0,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  credsChipText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  trainerBanner: { marginBottom: 14, padding: 10 },
  trainerBannerRow: { flexDirection: 'row', alignItems: 'center' },
  trainerAvatar: { width: 52, height: 52, borderRadius: 6, borderWidth: 1, marginRight: 10 },
  trainerMetaCol: { flex: 1 },
  trainerLabel: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  trainerName: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', marginTop: 2 },
  trainerSplit: { fontSize: 10, fontFamily: 'monospace', marginTop: 2 },
  resumeCard: { marginBottom: 14, padding: 14 },
  resumeLabel: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  resumeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 4,
    marginBottom: 10,
  },
  resumeActionRow: { flexDirection: 'row', gap: 8 },
  resumeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  resumeBtnText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  discardBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  discardBtnText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  planCard: { marginBottom: 12, padding: 12 },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planTitle: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', flex: 1 },
  refreshBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  refreshBtnText: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  planReason: { fontSize: 10, fontFamily: 'monospace', marginBottom: 8 },
  planItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  planExName: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace', flex: 1 },
  planExTarget: { fontSize: 10, fontFamily: 'monospace', marginLeft: 8 },
  plannedBtn: {
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  secondaryStartBtn: {
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryBtnText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  bodyText: { fontSize: 13, fontFamily: 'monospace' },
  recentCard: { marginBottom: 10, padding: 12 },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentInfo: { flex: 1, marginRight: 8 },
  recentName: { fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' },
  recentMeta: { fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
  recentActions: { flexDirection: 'row', gap: 6 },
  smallActionBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  smallActionText: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  programTabsRow: { flexDirection: 'row', marginBottom: 10, paddingVertical: 2 },
  programTabChip: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  programTabChipText: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  programDetailsBox: { paddingTop: 2 },
  programMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  programBadgeText: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  programOriginText: { fontSize: 9, fontFamily: 'monospace' },
  programDescText: { fontSize: 11, fontFamily: 'monospace', marginBottom: 8 },
  workoutVariantRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  workoutVariantBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  workoutVariantBtnText: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  targetsListBox: {
    borderTopWidth: 1,
    borderTopColor: '#33333344',
    paddingTop: 6,
    marginBottom: 6,
  },
  targetsListTitle: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 4 },
  targetItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  targetExName: { fontSize: 10, fontFamily: 'monospace' },
  targetSetsReps: { fontSize: 10, fontFamily: 'monospace' },
});
