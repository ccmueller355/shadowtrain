// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { themes, ThemeName } from '../../src/theme/themes';
import { useAppTheme } from '../../src/theme/useTheme';
import { useThemeStyles } from '../../src/theme/useThemeStyles';
import { useProfileStore } from '../../src/stores/profileStore';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';

const THEME_KEYS = Object.keys(themes) as ThemeName[];

export default function SettingsScreen() {
  const theme = useAppTheme();
  const ts = useThemeStyles();
  const activeTheme = useProfileStore((s) => s.theme);
  const setTheme = useProfileStore((s) => s.setTheme);
  const profile = useProfileStore((s) => s.profile);

  return (
    <View style={[styles.container, ts.bg]} testID="screen-settings">
      <Text style={[styles.title, ts.accent]}>DECK SETTINGS</Text>
      <Text style={[styles.section, ts.sectionHeader]}>VISUAL THEME</Text>
      <View style={styles.themeRow}>
        {THEME_KEYS.map((key) => {
          const selected = key === activeTheme;
          return (
            <TouchableOpacity
              key={key}
              testID={`theme-btn-${key}`}
              style={[
                styles.themeChip,
                ts.surface,
                { borderColor: selected ? theme.colors.primary : theme.colors.border },
              ]}
              onPress={() => setTheme(key)}
            >
              <Text style={[styles.chipText, selected ? ts.accent : ts.text]}>
                {themes[key].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.section, ts.sectionHeader]}>OPERATOR PROFILE</Text>
      <CyberpunkCard>
        <Text style={[styles.meta, ts.text]}>
          GOAL: {profile.goal.toUpperCase()} ({profile.repRange.min}–{profile.repRange.max} REPS)
        </Text>
        <Text style={[styles.meta, ts.textMuted]}>
          UNITS: {profile.units.toUpperCase()} // FIXED KB: {profile.fixedKettlebellWeight ?? 16}{' '}
          {profile.units}
        </Text>
      </CyberpunkCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 16 },
  section: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 8 },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  themeChip: { borderWidth: 1, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12 },
  chipText: { fontSize: 12, fontFamily: 'monospace' },
  meta: { fontSize: 13, fontFamily: 'monospace', marginBottom: 4 },
});
