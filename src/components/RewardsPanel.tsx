// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { computeRewards, RewardItem } from '../engine/achievements';
import { useExerciseStore } from '../stores/exerciseStore';
import { useProfileStore } from '../stores/profileStore';
import { useSessionStore } from '../stores/sessionStore';
import { useAppTheme } from '../theme/useTheme';
import { useThemeStyles } from '../theme/useThemeStyles';
import { CyberpunkCard } from './CyberpunkCard';

const SECTIONS: { kind: RewardItem['kind']; label: string }[] = [
  { kind: 'daily', label: 'DAILY CONTRACTS' },
  { kind: 'weekly', label: 'WEEKLY CONTRACTS' },
  { kind: 'achievement', label: 'ACHIEVEMENTS' },
];

export function RewardsPanel() {
  const theme = useAppTheme();
  const ts = useThemeStyles();
  const profile = useProfileStore((s) => s.profile);
  const claimReward = useProfileStore((s) => s.claimReward);
  const recentSessions = useSessionStore((s) => s.recentSessions);
  const exercises = useExerciseStore((s) => s.exercises);

  const rewards = useMemo(
    () => computeRewards(recentSessions, exercises, profile),
    [recentSessions, exercises, profile],
  );

  return (
    <View testID="rewards-panel">
      <Text style={[styles.header, ts.sectionHeader]}>
        MISSIONS & ACHIEVEMENTS // {profile.creds ?? 0} ¥
      </Text>
      <CyberpunkCard glow={false} style={styles.card}>
        {SECTIONS.map((section) => (
          <View key={section.kind}>
            <Text style={[styles.sectionLabel, ts.textMuted]}>{section.label}</Text>
            {rewards
              .filter((r) => r.kind === section.kind)
              .map((r) => {
                const claimable = r.complete && !r.claimed;
                return (
                  <View
                    key={r.claimId}
                    testID={`reward-row-${r.id}`}
                    style={[styles.row, { borderBottomColor: theme.colors.border }]}
                  >
                    <View style={styles.info}>
                      <Text style={[styles.title, ts.text]}>{r.title}</Text>
                      <Text style={[styles.desc, ts.textMuted]}>
                        {r.description} · {r.progress}/{r.target}
                      </Text>
                    </View>
                    <TouchableOpacity
                      testID={`reward-claim-${r.id}`}
                      disabled={!claimable}
                      style={[
                        styles.claimBtn,
                        {
                          borderColor: claimable ? theme.colors.primary : theme.colors.border,
                          opacity: claimable || r.claimed ? 1 : 0.5,
                        },
                      ]}
                      onPress={() => claimReward(r.claimId, r.reward)}
                    >
                      <Text style={[styles.claimText, claimable ? ts.accent : ts.textMuted]}>
                        {r.claimed ? 'CLAIMED' : claimable ? `CLAIM +${r.reward}¥` : `${r.reward}¥`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
          </View>
        ))}
      </CyberpunkCard>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 8 },
  card: { marginBottom: 16, padding: 12 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 6,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  info: { flex: 1, marginRight: 8 },
  title: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  desc: { fontSize: 10, fontFamily: 'monospace', marginTop: 2 },
  claimBtn: { borderWidth: 1, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8 },
  claimText: { fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
});
