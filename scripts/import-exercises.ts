// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { DatabaseClient, initDatabase } from '../src/db';
import {
  buildMergedExerciseSeed,
  CORE_KIT_EXERCISES,
  DEFAULT_SEED_EXERCISES,
  normalizeSeedExercise,
  PUBLIC_DATASET_EXERCISES,
  RawSeedExercise,
  seedExercisesIfEmpty,
  SeedResult,
} from '../src/db/seed';

export {
  buildMergedExerciseSeed,
  CORE_KIT_EXERCISES,
  DEFAULT_SEED_EXERCISES,
  normalizeSeedExercise,
  PUBLIC_DATASET_EXERCISES,
  RawSeedExercise,
  seedExercisesIfEmpty,
  SeedResult,
};

/**
 * Seeds the SQLite database with the merged core-kit + public exercise library.
 * By default runs idempotently (only when `exercises` table is empty).
 */
export async function importExercises(
  db?: DatabaseClient,
  options?: { force?: boolean },
): Promise<SeedResult> {
  const client = db ?? (await initDatabase());
  return seedExercisesIfEmpty(client, DEFAULT_SEED_EXERCISES, options);
}
