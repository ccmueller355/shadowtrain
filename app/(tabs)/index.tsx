// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';
import { getTrainerById } from '../../src/engine/trainers';
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
  const profile = useProfileStore((s) => s.profile);

  const activeTrainer = getTrainerById(profile.activeTrainerId);

  const handleStartNew = () => {
    startSession('session-new');
    onStartSession?.('session-new');
  };

  const handleResume = () => {
    if (activeSession) {
      onStartSession?.(activeSession.id);
    }
  };

  return (
    <ScrollView style={[styles.container, ts.bg]} testID="screen-home">
      <View style={styles.headerRow}>
        <View>
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
            <Text style={[styles.trainerSplit, ts.textMuted]} numberOfLines={1}>
              {activeTrainer.programName}
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
          <TouchableOpacity
            testID="resume-session-btn"
            style={[styles.resumeBtn, { borderColor: theme.colors.primary }]}
            onPress={handleResume}
          >
            <Text style={[styles.resumeBtnText, ts.accent]}>RESUME SESSION →</Text>
          </TouchableOpacity>
        </CyberpunkCard>
      )}

      <TouchableOpacity
        testID="start-session-btn"
        style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]}
        onPress={handleStartNew}
      >
        <Text style={[styles.primaryBtnText, { color: theme.colors.headerBg }]}>
          + START NEW SESSION
        </Text>
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
              <View testID={`recent-session-${session.id}`}>
                <Text style={[styles.recentName, ts.text]}>{session.name ?? session.id}</Text>
                <Text style={[styles.recentMeta, ts.textMuted]}>
                  {session.entries.length} EXERCISES · {completedSets} SETS COMPLETED
                </Text>
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
  title: { fontSize: 22, fontWeight: 'bold', fontFamily: 'monospace' },
  subtitle: { fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
  credsChip: { borderWidth: 1, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  credsChipText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  trainerBanner: { marginBottom: 14, padding: 10 },
  trainerBannerRow: { flexDirection: 'row', alignItems: 'center' },
  trainerAvatar: { width: 52, height: 52, borderRadius: 6, borderWidth: 1, marginRight: 10 },
  trainerMetaCol: { flex: 1 },
  trainerLabel: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  trainerName: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', marginTop: 2 },
  trainerSplit: { fontSize: 10, fontFamily: 'monospace', marginTop: 2 },
  resumeCard: { marginBottom: 16, padding: 14 },
  resumeLabel: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  resumeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 4,
    marginBottom: 10,
  },
  resumeBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  resumeBtnText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryBtnText: { fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  bodyText: { fontSize: 13, fontFamily: 'monospace' },
  recentCard: { marginBottom: 10, padding: 12 },
  recentName: { fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' },
  recentMeta: { fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
});
