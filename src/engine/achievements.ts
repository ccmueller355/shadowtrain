// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { DifficultyTier, Equipment, Exercise, Profile, Session } from '../types';
import { computePersonalRecords } from './analytics';
import { computeWeeklyStreak } from './plan';

export type RewardKind = 'daily' | 'weekly' | 'achievement';

export interface RewardItem {
  claimId: string;
  id: string;
  kind: RewardKind;
  tier?: 1 | 2 | 3;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  complete: boolean;
  claimed: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayIndex(ms: number): number {
  return Math.floor(ms / DAY_MS);
}

function workingSetsOf(session: Session) {
  return session.entries.flatMap((e) => e.sets.filter((s) => s.completed && !s.isWarmup));
}

function equipmentOf(sessions: Session[], exerciseMap: Map<string, Exercise>): Set<Equipment> {
  const found = new Set<Equipment>();
  for (const s of sessions) {
    for (const e of s.entries) {
      if (e.sets.some((set) => set.completed && !set.isWarmup)) {
        const eq = exerciseMap.get(e.exerciseId)?.equipment;
        if (eq) found.add(eq);
      }
    }
  }
  return found;
}

function isTierMastered(
  sessions: Session[],
  exerciseMap: Map<string, Exercise>,
  tier: DifficultyTier,
  repMax: number,
): boolean {
  return sessions.some((s) =>
    s.entries.some((e) => {
      if (exerciseMap.get(e.exerciseId)?.tier !== tier) return false;
      const working = e.sets.filter((set) => set.completed && !set.isWarmup);
      return (
        working.length >= 5 &&
        working.every((set) => (set.reps ?? 0) >= repMax || (set.durationSec ?? 0) >= 60)
      );
    }),
  );
}

export function computeRewards(
  sessions: Session[],
  exercises: Exercise[],
  profile: Profile,
  nowMs = Date.now(),
): RewardItem[] {
  const finished = sessions.filter((s) => s.finishedAt !== undefined);
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  const claimedSet = new Set(profile.claimedRewardIds ?? []);
  const targetDays = profile.weeklyTargetDays ?? 4;
  const repMax = profile.repRange.max;

  const today = dayIndex(nowMs);
  const weekIdx = Math.floor((today + 3) / 7); // Monday-based week
  const weekStartDay = weekIdx * 7 - 3;
  const dateKey = new Date(nowMs).toISOString().slice(0, 10);

  const finishedDay = (s: Session) => dayIndex(s.finishedAt ?? s.startedAt);
  const todaySessions = finished.filter((s) => finishedDay(s) === today);
  const weekSessions = finished.filter(
    (s) => finishedDay(s) >= weekStartDay && finishedDay(s) < weekStartDay + 7,
  );

  const todaySets = todaySessions.reduce((sum, s) => sum + workingSetsOf(s).length, 0);
  const weekSets = weekSessions.reduce((sum, s) => sum + workingSetsOf(s).length, 0);
  const weekDays = new Set(weekSessions.map(finishedDay)).size;
  const weekEquipment = equipmentOf(weekSessions, exerciseMap).size;
  const todayMobility = equipmentOf(todaySessions, exerciseMap);
  const mobilityDone = todayMobility.has('stretching') || todayMobility.has('jump_rope') ? 1 : 0;

  const streakWeeks = computeWeeklyStreak(finished, targetDays, nowMs).streakWeeks;
  const prCount = computePersonalRecords(finished, exercises, profile.units).length;
  const kitCount = equipmentOf(finished, exerciseMap).size;

  const make = (
    kind: RewardKind,
    id: string,
    periodKey: string | null,
    title: string,
    description: string,
    reward: number,
    progress: number,
    target: number,
    tier?: 1 | 2 | 3,
  ): RewardItem => {
    const claimId = periodKey ? `${id}:${periodKey}` : id;
    return {
      claimId,
      id,
      kind,
      ...(tier ? { tier } : {}),
      title,
      description,
      reward,
      progress: Math.min(progress, target),
      target,
      complete: progress >= target,
      claimed: claimedSet.has(claimId),
    };
  };

  const dk = dateKey;
  const wk = `W${weekIdx}`;

  return [
    make(
      'daily',
      'daily-session',
      dk,
      'DAILY // FINISH A SESSION',
      'Finish 1 workout today',
      15,
      todaySessions.length,
      1,
    ),
    make(
      'daily',
      'daily-sets',
      dk,
      'DAILY // 12 WORKING SETS',
      'Complete 12+ working sets today',
      25,
      todaySets,
      12,
    ),
    make(
      'daily',
      'daily-mobility',
      dk,
      'DAILY // MOBILITY OR ROPE',
      'Log a stretching or jump-rope movement today',
      20,
      mobilityDone,
      1,
    ),
    make(
      'weekly',
      'weekly-target',
      wk,
      'WEEKLY // HIT YOUR TARGET',
      `Train ${targetDays} different days this week`,
      100,
      weekDays,
      targetDays,
    ),
    make(
      'weekly',
      'weekly-volume',
      wk,
      'WEEKLY // 40 WORKING SETS',
      'Complete 40+ working sets this week',
      50,
      weekSets,
      40,
    ),
    make(
      'weekly',
      'weekly-variety',
      wk,
      'WEEKLY // KIT VARIETY',
      'Train 3 equipment types this week',
      30,
      weekEquipment,
      3,
    ),
    make(
      'achievement',
      'first-jack-in',
      null,
      'First Jack-In',
      'Finish your 1st workout',
      100,
      finished.length,
      1,
      1,
    ),
    make(
      'achievement',
      'kit-explorer',
      null,
      'Kit Explorer',
      'Log 3+ equipment types',
      100,
      kitCount,
      3,
      1,
    ),
    make(
      'achievement',
      'week-one-locked',
      null,
      'Week One Locked',
      'Hit your weekly target once',
      100,
      streakWeeks,
      1,
      1,
    ),
    make(
      'achievement',
      'tier1-graduate',
      null,
      'Tier 1 Graduate',
      '5 × max reps on a beginner move',
      100,
      isTierMastered(finished, exerciseMap, 'beginner', repMax) ? 1 : 0,
      1,
      1,
    ),
    make(
      'achievement',
      'four-week-rhythm',
      null,
      '4-Week Rhythm',
      'Hit your target 4 weeks running',
      250,
      streakWeeks,
      4,
      2,
    ),
    make(
      'achievement',
      'quarter-century',
      null,
      'Quarter-Century Runner',
      'Complete 25 sessions',
      250,
      finished.length,
      25,
      2,
    ),
    make(
      'achievement',
      'tier2-specialist',
      null,
      'Tier 2 Specialist',
      '5 × max reps on a mid-tier move',
      250,
      isTierMastered(finished, exerciseMap, 'mid', repMax) ? 1 : 0,
      1,
      2,
    ),
    make(
      'achievement',
      'pr-hunter',
      null,
      'PR Hunter',
      'Hold 10 Personal Records',
      250,
      prCount,
      10,
      2,
    ),
    make(
      'achievement',
      'iron-link-12',
      null,
      '12-Week Iron Link',
      'Hit your target 12 weeks running',
      500,
      streakWeeks,
      12,
      3,
    ),
    make(
      'achievement',
      'tier3-master',
      null,
      'Tier 3 Master',
      '5 × max reps on an advanced move',
      500,
      isTierMastered(finished, exerciseMap, 'advanced', repMax) ? 1 : 0,
      1,
      3,
    ),
  ];
}
