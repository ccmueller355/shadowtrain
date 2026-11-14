// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { Exercise, Profile, Session, ThemeName } from '../types';
import { constantTimeEqual, hmacSha256Hex } from './vault';

export interface BackupMeta {
  format: 'shadowtrain-backup';
  version: 1;
  dbSchemaVersion: 1;
  appVersion: string;
  exportedAt: string;
  checksum?: string;
}

export interface BackupEnvelopeV1 {
  meta: BackupMeta;
  profile: Profile;
  theme?: ThemeName;
  customExercises: Exercise[];
  sessions: Session[];
}

export interface SerializeBackupOptions {
  profile: Profile;
  theme?: ThemeName;
  customExercises?: Exercise[];
  sessions: Session[];
  exportedAt?: string;
  appVersion?: string;
}

export function computeBackupChecksum(envelope: BackupEnvelopeV1): string {
  const { checksum: _ignored, ...unsignedMeta } = envelope.meta;
  const canonicalPayload = JSON.stringify({
    meta: unsignedMeta,
    profile: envelope.profile,
    ...(envelope.theme ? { theme: envelope.theme } : {}),
    customExercises: envelope.customExercises ?? [],
    sessions: envelope.sessions,
  });
  return hmacSha256Hex(canonicalPayload);
}

export function serializeBackupJson(options: SerializeBackupOptions): string {
  const unsignedEnvelope: BackupEnvelopeV1 = {
    meta: {
      format: 'shadowtrain-backup',
      version: 1,
      dbSchemaVersion: 1,
      appVersion: options.appVersion ?? '0.1.1',
      exportedAt: options.exportedAt ?? new Date().toISOString(),
    },
    profile: options.profile,
    ...(options.theme ? { theme: options.theme } : {}),
    customExercises: options.customExercises ?? [],
    sessions: options.sessions,
  };
  const checksum = computeBackupChecksum(unsignedEnvelope);
  const signedEnvelope: BackupEnvelopeV1 = {
    ...unsignedEnvelope,
    meta: {
      ...unsignedEnvelope.meta,
      checksum,
    },
  };
  return JSON.stringify(signedEnvelope, null, 2);
}

export function parseAndValidateBackupJson(rawJson: string): BackupEnvelopeV1 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('Invalid JSON payload');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Backup payload must be a JSON object');
  }

  const candidate = parsed as Partial<BackupEnvelopeV1>;
  if (!candidate.meta || candidate.meta.format !== 'shadowtrain-backup') {
    throw new Error('Unsupported backup format: expected shadowtrain-backup');
  }

  if (candidate.meta.version !== 1) {
    throw new Error(`Unsupported backup version: ${String(candidate.meta.version)}`);
  }

  if (!candidate.profile || typeof candidate.profile !== 'object') {
    throw new Error('Backup payload is missing profile object');
  }

  if (!Array.isArray(candidate.sessions)) {
    throw new Error('Backup payload is missing sessions array');
  }

  const envelope: BackupEnvelopeV1 = {
    meta: candidate.meta,
    profile: candidate.profile,
    ...(candidate.theme ? { theme: candidate.theme } : {}),
    customExercises: Array.isArray(candidate.customExercises) ? candidate.customExercises : [],
    sessions: candidate.sessions,
  };

  const providedChecksum = candidate.meta.checksum;
  const expectedChecksum = computeBackupChecksum(envelope);
  if (
    typeof providedChecksum !== 'string' ||
    !constantTimeEqual(providedChecksum, expectedChecksum)
  ) {
    throw new Error('Backup integrity check failed: invalid or missing checksum');
  }

  return envelope;
}

function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const CSV_HEADER =
  'session_id,session_name,started_at,finished_at,exercise_id,exercise_name,category,tier,set_num,weight,reps,duration_sec,is_warmup,completed';

export function serializeSessionsCsv(sessions: Session[], exercises: Exercise[]): string {
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  const rows: string[] = [CSV_HEADER];

  for (const session of sessions) {
    const startedIso = new Date(session.startedAt).toISOString();
    const finishedIso =
      session.finishedAt !== undefined ? new Date(session.finishedAt).toISOString() : '';

    for (const entry of session.entries) {
      const ex = exerciseMap.get(entry.exerciseId);
      const exName = ex?.name ?? entry.exerciseId;
      const category = ex?.category ?? '';
      const tier = ex?.tier ?? '';

      for (let idx = 0; idx < entry.sets.length; idx += 1) {
        const set = entry.sets[idx];
        const cells = [
          session.id,
          session.name ?? '',
          startedIso,
          finishedIso,
          entry.exerciseId,
          exName,
          category,
          tier,
          idx + 1,
          set.weight ?? '',
          set.reps ?? '',
          set.durationSec ?? '',
          set.isWarmup ? 1 : 0,
          set.completed ? 1 : 0,
        ];
        rows.push(cells.map(escapeCsvCell).join(','));
      }
    }
  }

  return rows.join('\n');
}
