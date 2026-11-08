// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { DifficultyTier, Equipment, Exercise, TrackingType } from '../../types';
import { DatabaseClient, SqlParam } from '../migrations';
import { defaultWriteQueue, WriteQueue } from '../writeQueue';

export interface ExerciseRow {
  id: string;
  name: string;
  primary_muscles: string;
  secondary_muscles: string | null;
  equipment: string;
  category: string | null;
  tracking_type: string;
  tier?: string | null;
  next_progression_id?: string | null;
  image_start: string | null;
  image_end: string | null;
  instructions: string | null;
}

export interface ExerciseFilter {
  equipment?: Equipment[];
  category?: string;
  search?: string;
}

function parseJsonArray(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function mapRowToExercise(row: ExerciseRow): Exercise {
  const secondaryMuscles = parseJsonArray(row.secondary_muscles);
  const instructions = parseJsonArray(row.instructions);

  return {
    id: row.id,
    name: row.name,
    primaryMuscles: parseJsonArray(row.primary_muscles) ?? [],
    ...(secondaryMuscles ? { secondaryMuscles } : {}),
    equipment: row.equipment as Equipment,
    ...(row.category ? { category: row.category } : {}),
    trackingType: (row.tracking_type as TrackingType) || 'reps',
    ...(row.tier ? { tier: row.tier as DifficultyTier } : {}),
    ...(row.next_progression_id ? { nextProgressionId: row.next_progression_id } : {}),
    ...(row.image_start ? { imageStart: row.image_start } : {}),
    ...(row.image_end ? { imageEnd: row.image_end } : {}),
    ...(instructions ? { instructions } : {}),
  };
}

const UPSERT_EXERCISE_SQL = `
INSERT INTO exercises (
  id, name, primary_muscles, secondary_muscles, equipment,
  category, tracking_type, tier, next_progression_id, image_start, image_end, instructions
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  primary_muscles = excluded.primary_muscles,
  secondary_muscles = excluded.secondary_muscles,
  equipment = excluded.equipment,
  category = excluded.category,
  tracking_type = excluded.tracking_type,
  tier = excluded.tier,
  next_progression_id = excluded.next_progression_id,
  image_start = excluded.image_start,
  image_end = excluded.image_end,
  instructions = excluded.instructions;
`;

function toExerciseParams(exercise: Exercise): SqlParam[] {
  return [
    exercise.id,
    exercise.name,
    JSON.stringify(exercise.primaryMuscles),
    exercise.secondaryMuscles ? JSON.stringify(exercise.secondaryMuscles) : null,
    exercise.equipment,
    exercise.category ?? null,
    exercise.trackingType,
    exercise.tier ?? null,
    exercise.nextProgressionId ?? null,
    exercise.imageStart ?? null,
    exercise.imageEnd ?? null,
    exercise.instructions ? JSON.stringify(exercise.instructions) : null,
  ];
}

export async function upsertExercise(
  db: DatabaseClient,
  exercise: Exercise,
  queue: WriteQueue = defaultWriteQueue,
): Promise<void> {
  await queue.enqueue(async () => {
    await db.runAsync(UPSERT_EXERCISE_SQL, toExerciseParams(exercise));
  });
}

export async function upsertExercises(
  db: DatabaseClient,
  exercises: readonly Exercise[],
  queue: WriteQueue = defaultWriteQueue,
): Promise<void> {
  if (exercises.length === 0) return;
  await queue.enqueue(async () => {
    await db.withTransactionAsync(async () => {
      for (const exercise of exercises) {
        await db.runAsync(UPSERT_EXERCISE_SQL, toExerciseParams(exercise));
      }
    });
  });
}

export async function getExerciseById(db: DatabaseClient, id: string): Promise<Exercise | null> {
  const row = await db.getFirstAsync<ExerciseRow>('SELECT * FROM exercises WHERE id = ?;', [id]);
  return row ? mapRowToExercise(row) : null;
}

export async function countExercises(db: DatabaseClient): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM exercises;');
  return row?.count ?? 0;
}

export async function listExercises(
  db: DatabaseClient,
  filter?: ExerciseFilter,
): Promise<Exercise[]> {
  const clauses: string[] = [];
  const params: SqlParam[] = [];

  if (filter?.equipment && filter.equipment.length > 0) {
    const placeholders = filter.equipment.map(() => '?').join(', ');
    clauses.push(`equipment IN (${placeholders})`);
    params.push(...filter.equipment);
  }

  if (filter?.category) {
    clauses.push('category = ?');
    params.push(filter.category);
  }

  if (filter?.search && filter.search.trim().length > 0) {
    clauses.push('LOWER(name) LIKE ?');
    params.push(`%${filter.search.trim().toLowerCase()}%`);
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await db.getAllAsync<ExerciseRow>(
    `SELECT * FROM exercises ${whereSql} ORDER BY name ASC;`,
    params,
  );
  return rows.map(mapRowToExercise);
}
