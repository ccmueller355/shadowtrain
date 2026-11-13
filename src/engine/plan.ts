// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { Exercise, Profile, Session, SessionDuration, SetRecord, TrainerId } from '../types';
import { formatSuggestionChip, Suggestion, suggestNext } from './suggest';
import { getTrainerById } from './trainers';

export type PlanAdaptationMode = 'standard' | 'rotated' | 'recovery_fatigue' | 'ramp_back';

export interface PlannedExerciseItem {
  exercise: Exercise;
  suggestion: Suggestion;
  targetSummary: string;
}

export interface PlannedWorkout {
  title: string;
  variantLabel: string;
  adaptationMode: PlanAdaptationMode;
  reasonChip: string;
  items: PlannedExerciseItem[];
}

export interface WeeklyStreakSummary {
  thisWeekSessions: number;
  targetDays: number;
  streakWeeks: number;
  restShieldReady: boolean;
  label: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const TRAINER_VARIANTS: Record<TrainerId, string[][]> = {
  'orc-merc': [
    ['kb-swing-two-hand', 'kb-clean-and-press', 'kb-goblet-squat', 'gripper-crush-rep'],
    ['kb-front-rack-squat', 'kb-row-one-arm', 'kb-halo', 'gripper-pinch-press'],
    ['kb-swing-one-arm', 'bw-push-up', 'rope-basic-bounce', 'stretch-90-90-hip'],
  ],
  'human-decker': [
    ['kb-swing-one-arm', 'rope-boxer-step', 'bw-hollow-body-hold', 'bw-diamond-push-up'],
    ['rope-double-under', 'kb-goblet-squat', 'bw-hanging-leg-raise', 'stretch-couch'],
    ['rope-basic-bounce', 'bw-plank', 'stretch-90-90-hip', 'stretch-pike-hamstring'],
  ],
  'human-soldier': [
    ['kb-front-rack-squat', 'kb-row-one-arm', 'bw-push-up', 'ring-row'],
    ['kb-swing-two-hand', 'kb-clean-and-press', 'ring-push-up', 'bw-squat'],
    ['kb-halo', 'ring-face-pull', 'bw-plank', 'stretch-deep-squat-pry'],
  ],
  'elf-mage': [
    ['kb-turkish-get-up', 'kb-halo', 'stretch-90-90-hip', 'stretch-cossack-squat'],
    ['stretch-deep-squat-pry', 'stretch-thoracic-bridge', 'kb-goblet-squat', 'bw-hollow-body-hold'],
    ['stretch-pike-hamstring', 'stretch-couch', 'kb-halo', 'ring-support-hold'],
  ],
  'elf-wraith': [
    ['ring-dip', 'ring-pull-up', 'ring-l-sit-hold', 'bw-pistol-squat'],
    ['ring-push-up', 'ring-row', 'ring-rollout', 'bw-pike-push-up'],
    ['ring-support-hold', 'bw-squat', 'rope-boxer-step', 'stretch-cossack-squat'],
  ],
  'drone-unit-0': [
    ['bw-push-up', 'bw-squat', 'bw-plank', 'stretch-deep-squat-pry'],
    ['kb-swing-two-hand', 'kb-goblet-squat', 'rope-basic-bounce', 'stretch-couch'],
    ['ring-row', 'ring-support-hold', 'bw-hollow-body-hold', 'stretch-90-90-hip'],
  ],
};

const VARIANT_LABELS = ['SPLIT A // PRIMARY', 'SPLIT B // ALTERNATE', 'RECOVERY & MOBILITY'];

function findLastWorkingSets(sessions: Session[], exerciseId: string): SetRecord[] | null {
  for (const s of sessions) {
    if (s.finishedAt === undefined) continue;
    for (const entry of s.entries) {
      if (entry.exerciseId !== exerciseId) continue;
      const working = entry.sets.filter((set) => !set.isWarmup && set.completed);
      if (working.length > 0) return working;
    }
  }
  return null;
}

export function generateAdaptivePlan(options: {
  profile: Profile;
  exercises: Exercise[];
  recentSessions: Session[];
  refreshIndex?: number;
  nowMs?: number;
  targetDuration?: SessionDuration;
  weeklyTargetDays?: number;
}): PlannedWorkout {
  const {
    profile,
    exercises,
    recentSessions,
    refreshIndex = 0,
    nowMs = Date.now(),
    targetDuration,
    weeklyTargetDays,
  } = options;
  const durationMode = targetDuration ?? profile.targetDuration ?? 'standard';
  const targetDays = weeklyTargetDays ?? profile.weeklyTargetDays ?? 4;
  const trainer = getTrainerById(profile.activeTrainerId);
  const finished = recentSessions
    .filter((s) => s.finishedAt !== undefined)
    .slice()
    .sort((a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt));

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  const availableSet = new Set(profile.availableEquipment);

  const latest = finished[0];
  let baseVariantIdx = 0;
  let adaptationMode: PlanAdaptationMode = 'standard';
  let reasonChip = `TAILORED FOR ${trainer.callsign} // ${profile.goal.toUpperCase()} (${profile.repRange.min}–${profile.repRange.max} REPS)`;

  if (latest) {
    const latestTs = latest.finishedAt ?? latest.startedAt;
    const daysSinceLast = Math.floor(Math.max(0, nowMs - latestTs) / DAY_MS);
    const latestWorkingSets = latest.entries.reduce(
      (sum, entry) => sum + entry.sets.filter((s) => s.completed && !s.isWarmup).length,
      0,
    );

    if (daysSinceLast >= 5) {
      adaptationMode = 'ramp_back';
      reasonChip = `RAMP-BACK // ${daysSinceLast} DAYS SINCE LAST SESSION (VOLUME SCALED)`;
    } else if (nowMs - latestTs <= 36 * 3600 * 1000 && latestWorkingSets >= 13) {
      baseVariantIdx = 2;
      adaptationMode = 'recovery_fatigue';
      reasonChip = `HIGH LOAD RECENTLY (${latestWorkingSets} SETS) // ACTIVE RECOVERY SPLIT`;
    } else {
      const splitAIds = TRAINER_VARIANTS[trainer.id][0];
      const usedSplitA = latest.entries.some((e) => splitAIds.includes(e.exerciseId));
      if (usedSplitA) {
        baseVariantIdx = 1;
        adaptationMode = 'rotated';
        reasonChip = `ROTATED FROM LAST SESSION // COMPLEMENTARY SPLIT B`;
      }
    }
  }

  const variants = TRAINER_VARIANTS[trainer.id];
  const activeVariantIdx = (baseVariantIdx + Math.max(0, refreshIndex)) % variants.length;
  const candidateIds = variants[activeVariantIdx];

  const selectedExercises: Exercise[] = [];
  for (const id of candidateIds) {
    const ex = exerciseMap.get(id);
    if (!ex) continue;

    // Upgrade to nextProgressionId if 5x max was mastered on this movement
    const priorSets = findLastWorkingSets(finished, ex.id);
    if (
      ex.nextProgressionId &&
      priorSets &&
      priorSets.length >= 5 &&
      priorSets.every((s) => (s.reps ?? 0) >= profile.repRange.max)
    ) {
      const upgraded = exerciseMap.get(ex.nextProgressionId);
      if (upgraded && availableSet.has(upgraded.equipment)) {
        selectedExercises.push(upgraded);
        continue;
      }
    }

    if (availableSet.has(ex.equipment)) {
      selectedExercises.push(ex);
    }
  }

  if (selectedExercises.length === 0) {
    const fallback = exercises.filter((e) => availableSet.has(e.equipment)).slice(0, 3);
    selectedExercises.push(...fallback);
  }

  let finalExercises = selectedExercises;
  if (durationMode === 'express') {
    finalExercises = selectedExercises.slice(0, 2);
  } else if (durationMode === 'beast') {
    const extra = exercises.filter(
      (e) => availableSet.has(e.equipment) && !selectedExercises.some((s) => s.id === e.id),
    );
    finalExercises = [...selectedExercises, ...extra].slice(0, 5);
  }

  const items: PlannedExerciseItem[] = finalExercises.map((ex) => {
    const history = findLastWorkingSets(finished, ex.id);
    const profileWithOverrides = {
      ...profile,
      targetDuration: durationMode,
      weeklyTargetDays: targetDays,
    };
    const rawSuggestion = suggestNext(history, profileWithOverrides, ex);
    let suggestion: Suggestion =
      adaptationMode === 'ramp_back' ? { ...rawSuggestion, sets: 2 } : rawSuggestion;

    if (durationMode === 'express') {
      suggestion = { ...suggestion, sets: Math.min(2, suggestion.sets) };
    } else if (durationMode === 'beast') {
      suggestion = { ...suggestion, sets: Math.max(4, suggestion.sets) };
    }

    return {
      exercise: ex,
      suggestion,
      targetSummary: formatSuggestionChip(suggestion, profile.units),
    };
  });

  const durationSuffix = ` // ${durationMode.toUpperCase()} (${finalExercises.length} MOVES) · ${targetDays}D/WK`;
  const formattedReasonChip = reasonChip.includes(durationMode.toUpperCase())
    ? reasonChip
    : `${reasonChip}${durationSuffix}`;

  const variantLabel = VARIANT_LABELS[activeVariantIdx] ?? 'CUSTOM SPLIT';

  return {
    title: `${trainer.callsign} · ${variantLabel}`,
    variantLabel,
    adaptationMode,
    reasonChip: formattedReasonChip,
    items,
  };
}

export function computeWeeklyStreak(
  recentSessions: Session[],
  weeklyTargetDays = 4,
  nowMs = Date.now(),
): WeeklyStreakSummary {
  const targetDays = Math.max(1, weeklyTargetDays);
  const finished = recentSessions.filter((s) => s.finishedAt !== undefined);
  const anchorDay = Math.floor(nowMs / DAY_MS) * DAY_MS;

  const countUniqueDaysInWindow = (weekOffset: number): number => {
    const endMs = anchorDay + DAY_MS - weekOffset * 7 * DAY_MS;
    const startMs = endMs - 7 * DAY_MS;
    const dayKeys = new Set<string>();
    for (const s of finished) {
      const ts = s.finishedAt ?? s.startedAt;
      if (ts >= startMs && ts < endMs) {
        dayKeys.add(new Date(ts).toISOString().slice(0, 10));
      }
    }
    return dayKeys.size;
  };

  const thisWeekSessions = countUniqueDaysInWindow(0);
  let streakWeeks = thisWeekSessions >= targetDays ? 1 : 0;

  for (let wk = 1; wk <= 12; wk += 1) {
    const days = countUniqueDaysInWindow(wk);
    if (days >= targetDays) {
      streakWeeks += 1;
    } else {
      break;
    }
  }

  const restShieldReady = thisWeekSessions >= Math.max(1, targetDays - 1);

  return {
    thisWeekSessions,
    targetDays,
    streakWeeks,
    restShieldReady,
    label:
      `STREAK: ${streakWeeks}W // THIS WK: ${thisWeekSessions}/${targetDays} DAYS ${restShieldReady ? '· SHIELD ACTIVE' : ''}`.trim(),
  };
}
