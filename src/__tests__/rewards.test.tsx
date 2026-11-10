// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ProgressScreen from '../../app/(tabs)/progress';
import { DEFAULT_SEED_EXERCISES } from '../db';
import { computeRewards } from '../engine/achievements';
import { useExerciseStore } from '../stores/exerciseStore';
import { DEFAULT_PROFILE, useProfileStore } from '../stores/profileStore';
import { useSessionStore } from '../stores/sessionStore';
import { Session } from '../types';

const NOW_MS = Date.UTC(2026, 10, 10, 12, 0, 0);
const beginner = DEFAULT_SEED_EXERCISES.find(
  (e) => e.tier === 'beginner' && e.trackingType === 'reps',
)!;

const todaySession: Session = {
  id: 'rw-today',
  name: 'Rewards Session',
  startedAt: NOW_MS - 2 * 3600 * 1000,
  finishedAt: NOW_MS - 3600 * 1000,
  entries: [
    {
      id: 'rw-e1',
      exerciseId: beginner.id,
      position: 0,
      sets: Array.from({ length: 14 }, (_, i) => ({
        id: `rw-s${i}`,
        reps: 12,
        weight: 0,
        completed: true,
        isWarmup: false,
      })),
    },
  ],
};

describe('M10 Creds missions, achievements & claims', () => {
  beforeEach(() => {
    useProfileStore.setState({ profile: DEFAULT_PROFILE, theme: 'fixer' });
    useExerciseStore.setState({ exercises: [...DEFAULT_SEED_EXERCISES], hydrated: true });
    useSessionStore.getState().resetSessionStore();
  });

  it('computes empty and populated reward progress', () => {
    const empty = computeRewards([], DEFAULT_SEED_EXERCISES, DEFAULT_PROFILE, NOW_MS);
    expect(empty).toHaveLength(16);
    expect(empty.every((r) => !r.complete && !r.claimed)).toBe(true);

    const rewards = computeRewards([todaySession], DEFAULT_SEED_EXERCISES, DEFAULT_PROFILE, NOW_MS);
    const byId = (id: string) => rewards.find((r) => r.id === id)!;
    expect(byId('daily-session').complete).toBe(true);
    expect(byId('daily-sets').complete).toBe(true);
    expect(byId('daily-mobility').complete).toBe(false);
    expect(byId('first-jack-in').complete).toBe(true);
    expect(byId('tier1-graduate').complete).toBe(true);
    expect(byId('weekly-volume').progress).toBe(14);
    expect(byId('quarter-century').progress).toBe(1);
  });

  it('claims each reward once and credits Creds', () => {
    const { claimReward } = useProfileStore.getState();
    expect(claimReward('first-jack-in', 100)).toBe(true);
    expect(claimReward('first-jack-in', 100)).toBe(false);
    expect(useProfileStore.getState().profile.creds).toBe(100);

    const rewards = computeRewards(
      [todaySession],
      DEFAULT_SEED_EXERCISES,
      useProfileStore.getState().profile,
      NOW_MS,
    );
    expect(rewards.find((r) => r.id === 'first-jack-in')!.claimed).toBe(true);
  });

  it('renders the panel on Progress and claims a reward', () => {
    useSessionStore.setState({
      recentSessions: [
        { ...todaySession, finishedAt: Date.now() - 1000, startedAt: Date.now() - 2000 },
      ],
    });
    render(<ProgressScreen />);

    expect(screen.getByTestId('rewards-panel')).toBeTruthy();
    fireEvent.press(screen.getByTestId('reward-claim-first-jack-in'));
    expect(useProfileStore.getState().profile.creds).toBe(100);
    expect(screen.getByText('CLAIMED')).toBeTruthy();
  });
});
