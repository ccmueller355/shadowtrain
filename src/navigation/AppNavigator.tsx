// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const ts = useThemeStyles();

  const safeEdgesStyle = {
    paddingTop: insets.top,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  if (activeSessionId) {
    return (
      <View style={[styles.root, ts.bg, safeEdgesStyle, { paddingBottom: insets.bottom }]}>
        <SessionLoggerScreen
          sessionId={activeSessionId}
          onFinishSession={() => setActiveSessionId(null)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, ts.bg, safeEdgesStyle]} testID="app-navigator-root">
      <View style={styles.content}>
        {activeTab === 'home' && <HomeScreen onStartSession={(id) => setActiveSessionId(id)} />}
        {activeTab === 'exercises' && <ExercisesScreen />}
        {activeTab === 'progress' && <ProgressScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      <View
        testID="app-tab-bar"
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.colors.headerBg,
            borderTopColor: theme.colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
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
    paddingTop: 12,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabLabel: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
});
