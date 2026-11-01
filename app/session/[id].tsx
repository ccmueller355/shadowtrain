// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../src/theme/useTheme';
import { useThemeStyles } from '../../src/theme/useThemeStyles';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';

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

  return (
    <View style={[styles.container, ts.bg]} testID="screen-session-logger">
      <View style={styles.headerRow}>
        <Text style={[styles.title, ts.accent]}>SESSION LOGGER // {sessionId}</Text>
        <TouchableOpacity
          testID="finish-session-btn"
          style={[styles.finishBtn, { borderColor: theme.colors.primary }]}
          onPress={onFinishSession}
        >
          <Text style={[styles.finishText, ts.accent]}>FINISH</Text>
        </TouchableOpacity>
      </View>

      <CyberpunkCard>
        <Text style={[styles.bodyText, ts.text]}>
          Active workout session shell. Set logging & haptic timer land in M3.
        </Text>
      </CyberpunkCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  finishBtn: { borderWidth: 1, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  finishText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  bodyText: { fontSize: 13, fontFamily: 'monospace' },
});
