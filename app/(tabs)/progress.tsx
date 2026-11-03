// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '../../src/theme/useThemeStyles';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';

export default function ProgressScreen() {
  const ts = useThemeStyles();

  return (
    <View style={[styles.container, ts.bg]} testID="screen-progress">
      <Text style={[styles.title, ts.accent]}>TELEMETRY & PRs</Text>
      <Text style={[styles.subtitle, ts.textMuted]}>WEEKLY VOLUME // PERSONAL RECORDS</Text>
      <CyberpunkCard>
        <Text style={[styles.bodyText, ts.text]}>
          Weekly volume charts and PR boards unlock in M6.
        </Text>
      </CyberpunkCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' },
  subtitle: { fontSize: 12, fontFamily: 'monospace', marginTop: 4, marginBottom: 16 },
  bodyText: { fontSize: 13, fontFamily: 'monospace' },
});
