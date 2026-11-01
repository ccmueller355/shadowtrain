// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '../../src/theme/useThemeStyles';
import { useProfileStore } from '../../src/stores/profileStore';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';

export default function ExercisesScreen() {
  const ts = useThemeStyles();
  const availableEquipment = useProfileStore((s) => s.profile.availableEquipment);

  return (
    <View style={[styles.container, ts.bg]} testID="screen-exercises">
      <Text style={[styles.title, ts.accent]}>EXERCISE ARMORY</Text>
      <Text style={[styles.subtitle, ts.textMuted]}>
        ACTIVE KIT: {availableEquipment.join(' · ').toUpperCase()}
      </Text>
      <CyberpunkCard>
        <Text style={[styles.bodyText, ts.text]}>
          Core kit seed & equipment filter online in M2.
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
