// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { DifficultyTier, Equipment, Exercise, TrackingType } from '../../types';
import { DatabaseClient } from '../migrations';
import { countExercises, upsertExercises } from '../repositories/exerciseRepo';
import { defaultWriteQueue, WriteQueue } from '../writeQueue';
import coreKitRaw from './core-kit-exercises.json';
import publicDatasetRaw from './public-exercises.json';

export interface RawSeedExercise {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: string;
  category?: string;
  trackingType?: string;
  tier?: string;
  nextProgressionId?: string;
  imageStart?: string;
  imageEnd?: string;
  instructions?: string[];
}

export function normalizeSeedExercise(raw: RawSeedExercise): Exercise {
  return {
    id: raw.id,
    name: raw.name,
    primaryMuscles: raw.primaryMuscles,
    ...(raw.secondaryMuscles && raw.secondaryMuscles.length > 0
      ? { secondaryMuscles: raw.secondaryMuscles }
      : {}),
    equipment: raw.equipment as Equipment,
    ...(raw.category ? { category: raw.category } : {}),
    trackingType: (raw.trackingType as TrackingType) ?? 'reps',
    ...(raw.tier ? { tier: raw.tier as DifficultyTier } : {}),
    ...(raw.nextProgressionId ? { nextProgressionId: raw.nextProgressionId } : {}),
    ...(raw.imageStart ? { imageStart: raw.imageStart } : {}),
    ...(raw.imageEnd ? { imageEnd: raw.imageEnd } : {}),
    ...(raw.instructions && raw.instructions.length > 0 ? { instructions: raw.instructions } : {}),
  };
}

/**
 * Merges the public exercise dataset with the curated core-kit dataset.
 * Core-kit entries take precedence on ID collision so curated metadata/images win.
 */
export function buildMergedExerciseSeed(
  coreKit: readonly RawSeedExercise[] = coreKitRaw as RawSeedExercise[],
  publicDataset: readonly RawSeedExercise[] = publicDatasetRaw as RawSeedExercise[],
): Exercise[] {
  const byId = new Map<string, Exercise>();

  for (const raw of publicDataset) {
    byId.set(raw.id, normalizeSeedExercise(raw));
  }

  for (const raw of coreKit) {
    byId.set(raw.id, normalizeSeedExercise(raw));
  }

  return [...byId.values()];
}

export const CORE_KIT_EXERCISES: readonly Exercise[] = (coreKitRaw as RawSeedExercise[]).map(
  normalizeSeedExercise,
);

export const PUBLIC_DATASET_EXERCISES: readonly Exercise[] = (
  publicDatasetRaw as RawSeedExercise[]
).map(normalizeSeedExercise);

export const DEFAULT_SEED_EXERCISES: readonly Exercise[] = buildMergedExerciseSeed();

export interface SeedResult {
  seeded: boolean;
  totalCount: number;
}

/**
 * Seeds the SQLite `exercises` table at app bootstrap ONLY if it is empty (idempotent).
 * When `force` is true, performs an additive upsert of all seed exercises.
 */
export async function seedExercisesIfEmpty(
  db: DatabaseClient,
  exercises: readonly Exercise[] = DEFAULT_SEED_EXERCISES,
  options?: { force?: boolean; queue?: WriteQueue },
): Promise<SeedResult> {
  const existingCount = await countExercises(db);
  if (existingCount > 0 && !options?.force) {
    return { seeded: false, totalCount: existingCount };
  }

  await upsertExercises(db, exercises, options?.queue ?? defaultWriteQueue);
  const totalCount = await countExercises(db);
  return { seeded: true, totalCount };
}
