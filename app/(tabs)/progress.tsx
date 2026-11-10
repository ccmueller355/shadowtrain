// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CyberpunkCard } from '../../src/components/CyberpunkCard';
import { RewardsPanel } from '../../src/components/RewardsPanel';
import {
  computePersonalRecords,
  computeProgressSnapshot,
  IntensityLevel,
  ProgressWindow,
} from '../../src/engine/analytics';
import { useExerciseStore } from '../../src/stores/exerciseStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useAppTheme } from '../../src/theme/useTheme';
import { useThemeStyles } from '../../src/theme/useThemeStyles';

const WINDOW_OPTIONS: { key: ProgressWindow; label: string }[] = [
  { key: 'last_workout', label: 'LAST WORKOUT' },
  { key: 'week', label: 'WEEK' },
  { key: 'month', label: 'MONTH' },
];

export default function ProgressScreen() {
  const theme = useAppTheme();
  const ts = useThemeStyles();
  const recentSessions = useSessionStore((s) => s.recentSessions);
  const exercises = useExerciseStore((s) => s.exercises);
  const units = useProfileStore((s) => s.profile.units);

  const [windowMode, setWindowMode] = useState<ProgressWindow>('week');
  const [offset, setOffset] = useState(0);

  const snapshot = useMemo(
    () => computeProgressSnapshot(recentSessions, exercises, windowMode, offset, Date.now(), units),
    [recentSessions, exercises, windowMode, offset, units],
  );

  const personalRecords = useMemo(
    () => computePersonalRecords(recentSessions, exercises, units),
    [recentSessions, exercises, units],
  );

  const handleSelectWindow = (nextWindow: ProgressWindow) => {
    setWindowMode(nextWindow);
    setOffset(0);
  };

  const getIntensityColor = (level: IntensityLevel): string => {
    if (level === 0) return theme.colors.surface;
    if (level === 1) return `${theme.colors.primary}44`;
    if (level === 2) return `${theme.colors.primary}99`;
    return theme.colors.primary;
  };

  return (
    <ScrollView style={[styles.container, ts.bg]} testID="screen-progress">
      <Text style={[styles.title, ts.accent]}>TELEMETRY & PRs</Text>
      <Text style={[styles.subtitle, ts.textMuted]}>
        VOLUME ANALYTICS // INTENSITY HEATMAP // PERSONAL RECORDS
      </Text>

      <View style={styles.windowRow}>
        {WINDOW_OPTIONS.map((opt) => {
          const active = opt.key === windowMode;
          return (
            <TouchableOpacity
              key={opt.key}
              testID={`window-btn-${opt.key}`}
              style={[
                styles.windowChip,
                ts.surface,
                { borderColor: active ? theme.colors.primary : theme.colors.border },
              ]}
              onPress={() => handleSelectWindow(opt.key)}
            >
              <Text style={[styles.windowChipText, active ? ts.accent : ts.text]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <CyberpunkCard glow={false} style={styles.scrubberCard}>
        <View style={styles.scrubberRow}>
          <TouchableOpacity
            testID="period-prev-btn"
            disabled={!snapshot.canGoPrev}
            style={[
              styles.navBtn,
              {
                borderColor: snapshot.canGoPrev ? theme.colors.primary : theme.colors.border,
                opacity: snapshot.canGoPrev ? 1 : 0.4,
              },
            ]}
            onPress={() => setOffset((prev) => prev + 1)}
          >
            <Text style={[styles.navBtnText, ts.accent]}>◀ PREV</Text>
          </TouchableOpacity>

          <Text style={[styles.periodLabel, ts.text]} testID="period-label" numberOfLines={1}>
            {snapshot.periodLabel}
          </Text>

          <TouchableOpacity
            testID="period-next-btn"
            disabled={!snapshot.canGoNext}
            style={[
              styles.navBtn,
              {
                borderColor: snapshot.canGoNext ? theme.colors.primary : theme.colors.border,
                opacity: snapshot.canGoNext ? 1 : 0.4,
              },
            ]}
            onPress={() => setOffset((prev) => Math.max(0, prev - 1))}
          >
            <Text style={[styles.navBtnText, ts.accent]}>NEXT ▶</Text>
          </TouchableOpacity>
        </View>
      </CyberpunkCard>

      <View style={styles.kpiRow}>
        <CyberpunkCard glow={false} style={styles.kpiCard}>
          <Text style={[styles.kpiLabel, ts.textMuted]}>SESSIONS</Text>
          <Text style={[styles.kpiValue, ts.accent]} testID="stat-sessions">
            {snapshot.sessionsCount}
          </Text>
        </CyberpunkCard>
        <CyberpunkCard glow={false} style={styles.kpiCard}>
          <Text style={[styles.kpiLabel, ts.textMuted]}>WORKING SETS</Text>
          <Text style={[styles.kpiValue, ts.accent]} testID="stat-sets">
            {snapshot.totalWorkingSets}
          </Text>
        </CyberpunkCard>
        <CyberpunkCard glow={false} style={styles.kpiCard}>
          <Text style={[styles.kpiLabel, ts.textMuted]}>VOLUME ({units.toUpperCase()})</Text>
          <Text style={[styles.kpiValue, ts.accent]} testID="stat-volume">
            {snapshot.totalVolume}
          </Text>
        </CyberpunkCard>
        <CyberpunkCard glow={false} style={styles.kpiCard}>
          <Text style={[styles.kpiLabel, ts.textMuted]}>TIMED (SEC)</Text>
          <Text style={[styles.kpiValue, ts.accent]} testID="stat-duration">
            {snapshot.totalDurationSec}
          </Text>
        </CyberpunkCard>
      </View>

      <RewardsPanel />

      <Text style={[styles.sectionHeader, ts.sectionHeader]}>INTENSITY HEATMAP</Text>
      <CyberpunkCard glow={false} style={styles.sectionCard}>
        {snapshot.heatmap.length === 0 ? (
          <Text style={[styles.emptyText, ts.textMuted]} testID="heatmap-empty">
            No completed sessions logged yet.
          </Text>
        ) : (
          <View style={styles.heatmapGrid}>
            {snapshot.heatmap.map((cell) => (
              <View
                key={cell.dateKey}
                testID={`heatmap-cell-${cell.dateKey}`}
                style={[
                  styles.heatmapCell,
                  {
                    backgroundColor: getIntensityColor(cell.intensity),
                    borderColor: cell.intensity > 0 ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.heatmapLabel,
                    {
                      color:
                        cell.intensity === 3 ? theme.colors.headerBg : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {cell.label}
                </Text>
                <Text
                  style={[
                    styles.heatmapSets,
                    {
                      color:
                        cell.intensity === 3 ? theme.colors.headerBg : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {cell.workingSets}S
                </Text>
              </View>
            ))}
          </View>
        )}
      </CyberpunkCard>

      <Text style={[styles.sectionHeader, ts.sectionHeader]}>VOLUME & SET DISTRIBUTION</Text>
      <CyberpunkCard glow={false} style={styles.sectionCard}>
        {snapshot.bars.length === 0 || snapshot.totalWorkingSets === 0 ? (
          <Text style={[styles.emptyText, ts.textMuted]} testID="volume-bars-empty">
            No working sets recorded in this window.
          </Text>
        ) : (
          snapshot.bars.map((bar) => (
            <View key={bar.id} testID={`volume-bar-${bar.id}`} style={styles.barRow}>
              <View style={styles.barHeader}>
                <Text style={[styles.barLabel, ts.text]} numberOfLines={1}>
                  {bar.label}
                </Text>
                <Text style={[styles.barSublabel, ts.textMuted]}>{bar.sublabel}</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.round(bar.ratio * 100)}%`,
                      backgroundColor: bar.workingSets > 0 ? theme.colors.primary : 'transparent',
                    },
                  ]}
                />
              </View>
            </View>
          ))
        )}
      </CyberpunkCard>

      {snapshot.equipmentBreakdown.length > 0 && (
        <>
          <Text style={[styles.sectionHeader, ts.sectionHeader]}>EQUIPMENT BREAKDOWN</Text>
          <CyberpunkCard glow={false} style={styles.sectionCard}>
            <View style={styles.eqGrid}>
              {snapshot.equipmentBreakdown.map((eq) => (
                <View
                  key={eq.equipment}
                  testID={`equipment-stat-${eq.equipment}`}
                  style={[styles.eqChip, { borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.eqName, ts.accent]}>
                    {eq.equipment.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={[styles.eqMeta, ts.text]}>
                    {eq.workingSets} SETS ({eq.share}%)
                  </Text>
                </View>
              ))}
            </View>
          </CyberpunkCard>
        </>
      )}

      <Text style={[styles.sectionHeader, ts.sectionHeader]}>PERSONAL RECORDS (PR BOARD)</Text>
      <CyberpunkCard glow={false} style={styles.sectionCard}>
        {personalRecords.length === 0 ? (
          <Text style={[styles.emptyText, ts.textMuted]} testID="pr-board-empty">
            Complete working sets to unlock Personal Records.
          </Text>
        ) : (
          personalRecords.map((pr) => (
            <View
              key={pr.exerciseId}
              testID={`pr-row-${pr.exerciseId}`}
              style={[styles.prRow, { borderBottomColor: theme.colors.border }]}
            >
              <View style={styles.prInfo}>
                <Text style={[styles.prName, ts.text]}>{pr.exerciseName}</Text>
                <Text style={[styles.prMeta, ts.textMuted]}>
                  {pr.equipment.replace('_', ' ').toUpperCase()} · {pr.sessionName}
                </Text>
              </View>
              <View style={[styles.prBadge, { borderColor: theme.colors.primary }]}>
                <Text style={[styles.prBadgeText, ts.accent]}>{pr.badge}</Text>
              </View>
            </View>
          ))
        )}
      </CyberpunkCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' },
  subtitle: { fontSize: 11, fontFamily: 'monospace', marginTop: 4, marginBottom: 14 },
  windowRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  windowChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  windowChipText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  scrubberCard: { marginBottom: 12, padding: 10 },
  scrubberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { borderWidth: 1, borderRadius: 4, paddingVertical: 5, paddingHorizontal: 10 },
  navBtnText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  periodLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginHorizontal: 8,
  },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  kpiCard: { flex: 1, minWidth: '45%', padding: 10 },
  kpiLabel: { fontSize: 10, fontFamily: 'monospace' },
  kpiValue: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace', marginTop: 4 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  sectionCard: { marginBottom: 16, padding: 12 },
  emptyText: { fontSize: 12, fontFamily: 'monospace' },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heatmapCell: {
    width: '12.5%',
    minWidth: 40,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 6,
    alignItems: 'center',
  },
  heatmapLabel: { fontSize: 9, fontWeight: 'bold', fontFamily: 'monospace' },
  heatmapSets: { fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
  barRow: { marginBottom: 10 },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace', flex: 1 },
  barSublabel: { fontSize: 10, fontFamily: 'monospace', marginLeft: 8 },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  eqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  eqChip: { borderWidth: 1, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  eqName: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  eqMeta: { fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  prInfo: { flex: 1, marginRight: 8 },
  prName: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  prMeta: { fontSize: 10, fontFamily: 'monospace', marginTop: 2 },
  prBadge: { borderWidth: 1, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8 },
  prBadgeText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
});
