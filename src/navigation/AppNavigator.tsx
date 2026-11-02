// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import HomeScreen from '../../app/(tabs)/index';
import ExercisesScreen from '../../app/(tabs)/exercises';
import ProgressScreen from '../../app/(tabs)/progress';
import SettingsScreen from '../../app/(tabs)/settings';
import SessionLoggerScreen from '../../app/session/[id]';
import { useAppTheme } from '../theme/useTheme';
import { useThemeStyles } from '../theme/useThemeStyles';

export type TabRoute = 'home' | 'exercises' | 'progress' | 'settings';

const TABS: { key: TabRoute; label: string }[] = [
  { key: 'home', label: 'HOME' },
  { key: 'exercises', label: 'EXERCISES' },
  { key: 'progress', label: 'PROGRESS' },
  { key: 'settings', label: 'SETTINGS' },
];

export function AppNavigator() {
  const [activeTab, setActiveTab] = useState<TabRoute>('home');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const theme = useAppTheme();
  const ts = useThemeStyles();

  if (activeSessionId) {
    return (
      <SessionLoggerScreen
        sessionId={activeSessionId}
        onFinishSession={() => setActiveSessionId(null)}
      />
    );
  }

  return (
    <View style={[styles.root, ts.bg]}>
      <View style={styles.content}>
        {activeTab === 'home' && <HomeScreen onStartSession={(id) => setActiveSessionId(id)} />}
        {activeTab === 'exercises' && <ExercisesScreen />}
        {activeTab === 'progress' && <ProgressScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      <View
        style={[
          styles.tabBar,
          { backgroundColor: theme.colors.headerBg, borderTopColor: theme.colors.border },
        ]}
      >
        {TABS.map((tab) => {
          const isFocused = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              testID={`tab-${tab.key}`}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabLabel, isFocused ? ts.accent : ts.textMuted]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
});
