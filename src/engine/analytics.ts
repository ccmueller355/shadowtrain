// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { Equipment, Exercise, Session, SetRecord, Units } from '../types';

export type ProgressWindow = 'last_workout' | 'week' | 'month';
export type IntensityLevel = 0 | 1 | 2 | 3;

export interface DayHeatmapCell {
  dateKey: string;
  label: string;
  workingSets: number;
  volume: number;
  durationSec: number;
  sessionsCount: number;
  intensity: IntensityLevel;
}

export interface VolumeBarItem {
  id: string;
  label: string;
  sublabel: string;
  workingSets: number;
  volume: number;
  durationSec: number;
  ratio: number;
}

export interface EquipmentStat {
  equipment: Equipment;
  workingSets: number;
  share: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  equipment: Equipment;
  trackingType: 'reps' | 'duration';
  badge: string;
  score: number;
  sessionName: string;
  achievedAt: number;
}

export interface ProgressSnapshot {
  window: ProgressWindow;
  offset: number;
  periodLabel: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  sessionsCount: number;
  totalWorkingSets: number;
  totalVolume: number;
  totalDurationSec: number;
  heatmap: DayHeatmapCell[];
  bars: VolumeBarItem[];
  equipmentBreakdown: EquipmentStat[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const SHORT_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function computeIntensityLevel(workingSets: number): IntensityLevel {
  if (workingSets <= 0) return 0;
  if (workingSets <= 5) return 1;
  if (workingSets <= 12) return 2;
  return 3;
}

export function computeSetVolume(set: SetRecord): number {
  if (!set.completed || set.isWarmup) return 0;
  if (set.weight && set.weight > 0 && set.reps && set.reps > 0) {
    return set.weight * set.reps;
  }
  return 0;
}

function toUtcDateKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function getFinishedSessionsSorted(sessions: Session[]): Session[] {
  return sessions
    .filter((s) => s.finishedAt !== undefined)
    .slice()
    .sort((a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt));
}

function getCompletedWorkingSets(sets: SetRecord[]): SetRecord[] {
  return sets.filter((s) => s.completed && !s.isWarmup);
}

function buildEquipmentBreakdown(
  sessions: Session[],
  exerciseMap: Map<string, Exercise>,
): EquipmentStat[] {
  const counts = new Map<Equipment, number>();
  let total = 0;

  for (const session of sessions) {
    for (const entry of session.entries) {
      const workingCount = getCompletedWorkingSets(entry.sets).length;
      if (workingCount === 0) continue;
      const eq = exerciseMap.get(entry.exerciseId)?.equipment ?? 'bodyweight';
      counts.set(eq, (counts.get(eq) ?? 0) + workingCount);
      total += workingCount;
    }
  }

  if (total === 0) return [];

  return Array.from(counts.entries())
    .map(([equipment, workingSets]) => ({
      equipment,
      workingSets,
      share: Math.round((workingSets / total) * 100),
    }))
    .sort((a, b) => b.workingSets - a.workingSets);
}

export function computeProgressSnapshot(
  sessions: Session[],
  exercises: Exercise[],
  window: ProgressWindow,
  offset = 0,
  nowMs = Date.now(),
  units: Units = 'kg',
): ProgressSnapshot {
  const safeOffset = Math.max(0, offset);
  const finished = getFinishedSessionsSorted(sessions);
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  if (window === 'last_workout') {
    const target = finished[safeOffset];
    if (!target) {
      return {
        window,
        offset: safeOffset,
        periodLabel: 'NO COMPLETED WORKOUTS',
        canGoPrev: false,
        canGoNext: safeOffset > 0,
        sessionsCount: 0,
        totalWorkingSets: 0,
        totalVolume: 0,
        totalDurationSec: 0,
        heatmap: [],
        bars: [],
        equipmentBreakdown: [],
      };
    }

    const sessionTs = target.finishedAt ?? target.startedAt;
    const dateKey = toUtcDateKey(sessionTs);
    let totalWorkingSets = 0;
    let totalVolume = 0;
    let totalDurationSec = 0;

    const rawBars: Omit<VolumeBarItem, 'ratio'>[] = target.entries.map((entry) => {
      const ex = exerciseMap.get(entry.exerciseId);
      const working = getCompletedWorkingSets(entry.sets);
      const workingSets = working.length;
      const volume = working.reduce((sum, s) => sum + computeSetVolume(s), 0);
      const durationSec = working.reduce((sum, s) => sum + (s.durationSec ?? 0), 0);
      totalWorkingSets += workingSets;
      totalVolume += volume;
      totalDurationSec += durationSec;

      const sublabel =
        durationSec > 0
          ? `${workingSets} SETS · ${durationSec}s`
          : volume > 0
            ? `${workingSets} SETS · ${volume}${units}`
            : `${workingSets} SETS · BW`;

      return {
        id: entry.id,
        label: ex?.name ?? entry.exerciseId,
        sublabel,
        workingSets,
        volume,
        durationSec,
      };
    });

    const maxSets = Math.max(1, ...rawBars.map((b) => b.workingSets));
    const bars: VolumeBarItem[] = rawBars.map((b) => ({
      ...b,
      ratio: b.workingSets / maxSets,
    }));

    return {
      window,
      offset: safeOffset,
      periodLabel: `${target.name ?? target.id} (${dateKey})`,
      canGoPrev: safeOffset + 1 < finished.length,
      canGoNext: safeOffset > 0,
      sessionsCount: 1,
      totalWorkingSets,
      totalVolume,
      totalDurationSec,
      heatmap: [
        {
          dateKey,
          label: dateKey.slice(5),
          workingSets: totalWorkingSets,
          volume: totalVolume,
          durationSec: totalDurationSec,
          sessionsCount: 1,
          intensity: computeIntensityLevel(totalWorkingSets),
        },
      ],
      bars,
      equipmentBreakdown: buildEquipmentBreakdown([target], exerciseMap),
    };
  }

  const daysCount = window === 'week' ? 7 : 28;
  const anchorDayFloor = Math.floor(nowMs / DAY_MS) * DAY_MS;
  const endDayStart = anchorDayFloor - safeOffset * daysCount * DAY_MS;
  const startDayStart = endDayStart - (daysCount - 1) * DAY_MS;
  const endExclusive = endDayStart + DAY_MS;

  const windowSessions = finished.filter((s) => {
    const ts = s.finishedAt ?? s.startedAt;
    return ts >= startDayStart && ts < endExclusive;
  });

  const olderSessionsExist = finished.some((s) => (s.finishedAt ?? s.startedAt) < startDayStart);

  const heatmap: DayHeatmapCell[] = [];
  for (let i = 0; i < daysCount; i += 1) {
    const dayStart = startDayStart + i * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    const dateKey = toUtcDateKey(dayStart);
    const dayIndex = new Date(dayStart).getUTCDay();
    const label = window === 'week' ? SHORT_DAYS[dayIndex] : dateKey.slice(5);

    const daySessions = windowSessions.filter((s) => {
      const ts = s.finishedAt ?? s.startedAt;
      return ts >= dayStart && ts < dayEnd;
    });

    let workingSets = 0;
    let volume = 0;
    let durationSec = 0;
    for (const s of daySessions) {
      for (const e of s.entries) {
        const w = getCompletedWorkingSets(e.sets);
        workingSets += w.length;
        volume += w.reduce((sum, set) => sum + computeSetVolume(set), 0);
        durationSec += w.reduce((sum, set) => sum + (set.durationSec ?? 0), 0);
      }
    }

    heatmap.push({
      dateKey,
      label,
      workingSets,
      volume,
      durationSec,
      sessionsCount: daySessions.length,
      intensity: computeIntensityLevel(workingSets),
    });
  }

  const totalWorkingSets = heatmap.reduce((sum, d) => sum + d.workingSets, 0);
  const totalVolume = heatmap.reduce((sum, d) => sum + d.volume, 0);
  const totalDurationSec = heatmap.reduce((sum, d) => sum + d.durationSec, 0);

  const rawBars: Omit<VolumeBarItem, 'ratio'>[] =
    window === 'week'
      ? heatmap.map((d) => ({
          id: d.dateKey,
          label: `${d.label} (${d.dateKey.slice(5)})`,
          sublabel:
            d.workingSets === 0
              ? 'REST'
              : `${d.workingSets} SETS · ${d.volume > 0 ? `${d.volume}${units}` : `${d.durationSec}s`}`,
          workingSets: d.workingSets,
          volume: d.volume,
          durationSec: d.durationSec,
        }))
      : [0, 1, 2, 3].map((wkIdx) => {
          const slice = heatmap.slice(wkIdx * 7, wkIdx * 7 + 7);
          const wkSets = slice.reduce((sum, d) => sum + d.workingSets, 0);
          const wkVol = slice.reduce((sum, d) => sum + d.volume, 0);
          const wkDur = slice.reduce((sum, d) => sum + d.durationSec, 0);
          const rangeLabel = `${slice[0].dateKey.slice(5)}–${slice[6].dateKey.slice(5)}`;
          return {
            id: `week-${wkIdx + 1}`,
            label: `WK ${wkIdx + 1} (${rangeLabel})`,
            sublabel: `${wkSets} SETS · ${wkVol}${units}`,
            workingSets: wkSets,
            volume: wkVol,
            durationSec: wkDur,
          };
        });

  const maxBarSets = Math.max(1, ...rawBars.map((b) => b.workingSets));
  const bars: VolumeBarItem[] = rawBars.map((b) => ({
    ...b,
    ratio: b.workingSets / maxBarSets,
  }));

  return {
    window,
    offset: safeOffset,
    periodLabel: `${toUtcDateKey(startDayStart)} → ${toUtcDateKey(endDayStart)}`,
    canGoPrev: olderSessionsExist || safeOffset < 12,
    canGoNext: safeOffset > 0,
    sessionsCount: windowSessions.length,
    totalWorkingSets,
    totalVolume,
    totalDurationSec,
    heatmap,
    bars,
    equipmentBreakdown: buildEquipmentBreakdown(windowSessions, exerciseMap),
  };
}

export function computePersonalRecords(
  sessions: Session[],
  exercises: Exercise[],
  units: Units = 'kg',
): PersonalRecord[] {
  const finished = getFinishedSessionsSorted(sessions);
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  const prMap = new Map<string, PersonalRecord>();

  for (const session of finished) {
    const achievedAt = session.finishedAt ?? session.startedAt;
    const sessionName = session.name ?? session.id;

    for (const entry of session.entries) {
      const ex = exerciseMap.get(entry.exerciseId);
      const equipment = ex?.equipment ?? 'bodyweight';
      const trackingType = ex?.trackingType ?? 'reps';
      const exerciseName = ex?.name ?? entry.exerciseId;

      for (const set of getCompletedWorkingSets(entry.sets)) {
        let score: number;
        let badge: string;

        if (trackingType === 'duration' || set.durationSec !== undefined) {
          const sec = set.durationSec ?? 0;
          if (sec <= 0) continue;
          score = sec;
          badge = `${sec}s HOLD/ROPE`;
        } else if (set.weight && set.weight > 0) {
          const reps = set.reps ?? 0;
          if (reps <= 0) continue;
          score = set.weight * 1000 + reps;
          badge = `${set.weight}${units} × ${reps}`;
        } else {
          const reps = set.reps ?? 0;
          if (reps <= 0) continue;
          score = reps;
          badge = `BW × ${reps} REPS`;
        }

        const existing = prMap.get(entry.exerciseId);
        if (!existing || score > existing.score) {
          prMap.set(entry.exerciseId, {
            exerciseId: entry.exerciseId,
            exerciseName,
            equipment,
            trackingType,
            badge,
            score,
            sessionName,
            achievedAt,
          });
        }
      }
    }
  }

  return Array.from(prMap.values()).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}
