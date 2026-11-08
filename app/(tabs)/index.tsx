// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../src/theme/useTheme';
import { useThemeStyles } from '../../src/theme/useThemeStyles';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';

interface HomeScreenProps {
  onStartSession?: (sessionId: string) => void;
}

export default function HomeScreen({ onStartSession }: HomeScreenProps) {
  const theme = useAppTheme();
  const ts = useThemeStyles();

  return (
    <View style={[styles.container, ts.bg]} testID="screen-home">
      <Text style={[styles.title, ts.accent]}>SHADOW TRAIN</Text>
      <Text style={[styles.subtitle, ts.textMuted]}>
        OFFLINE WORKOUT LOGGER // KETTLEBELL & CALISTHENICS DECK
      </Text>

      <TouchableOpacity
        testID="start-session-btn"
        style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]}
        onPress={() => onStartSession?.('session-new')}
      >
        <Text style={[styles.primaryBtnText, { color: theme.colors.headerBg }]}>
          + START NEW SESSION
        </Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, ts.sectionHeader]}>RECENT SESSIONS</Text>
      <CyberpunkCard>
        <Text style={[styles.bodyText, ts.textMuted]}>
          No sessions logged yet. Tap Start New Session to jack in.
        </Text>
      </CyberpunkCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', fontFamily: 'monospace' },
  subtitle: { fontSize: 12, fontFamily: 'monospace', marginTop: 4, marginBottom: 20 },
  primaryBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 24 },
  primaryBtnText: { fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 8 },
  bodyText: { fontSize: 13, fontFamily: 'monospace' },
});
