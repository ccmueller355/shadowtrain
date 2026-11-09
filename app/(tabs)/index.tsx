// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAppTheme } from '../../src/theme/useTheme';
import { useThemeStyles } from '../../src/theme/useThemeStyles';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';
import { useSessionStore } from '../../src/stores/sessionStore';

interface HomeScreenProps {
  onStartSession?: (sessionId: string) => void;
}

export default function HomeScreen({ onStartSession }: HomeScreenProps) {
  const theme = useAppTheme();
  const ts = useThemeStyles();
  const activeSession = useSessionStore((s) => s.activeSession);
  const recentSessions = useSessionStore((s) => s.recentSessions);
  const startSession = useSessionStore((s) => s.startSession);

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
      <Text style={[styles.title, ts.accent]}>SHADOW TRAIN</Text>
      <Text style={[styles.subtitle, ts.textMuted]}>
        OFFLINE WORKOUT LOGGER // KETTLEBELL & CALISTHENICS DECK
      </Text>

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
  title: { fontSize: 22, fontWeight: 'bold', fontFamily: 'monospace' },
  subtitle: { fontSize: 12, fontFamily: 'monospace', marginTop: 4, marginBottom: 20 },
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
