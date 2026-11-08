// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { Entry, Session, SetRecord } from '../../types';
import { DatabaseClient } from '../migrations';
import { LAST_DONE_WORKING_SETS_SQL } from '../schema';
import { defaultWriteQueue, WriteQueue } from '../writeQueue';

export interface SessionRow {
  id: string;
  started_at: number;
  finished_at: number | null;
  name: string | null;
  notes: string | null;
}

export interface EntryRow {
  id: string;
  session_id: string;
  exercise_id: string;
  position: number;
  notes: string | null;
}

export interface SetRow {
  id: string;
  entry_id: string;
  position: number;
  reps: number | null;
  weight: number | null;
  duration_sec: number | null;
  rpe: number | null;
  completed: number;
  is_warmup: number;
}

export interface LastDoneRow {
  id: string;
  reps: number | null;
  weight: number | null;
  duration_sec: number | null;
  rpe: number | null;
  completed: number;
  is_warmup: number;
  session_id: string;
  started_at: number;
}

export function mapRowToSetRecord(
  row: Pick<SetRow, 'id' | 'reps' | 'weight' | 'duration_sec' | 'rpe' | 'completed' | 'is_warmup'>,
): SetRecord {
  return {
    id: row.id,
    ...(row.reps !== null ? { reps: row.reps } : {}),
    ...(row.weight !== null ? { weight: row.weight } : {}),
    ...(row.duration_sec !== null ? { durationSec: row.duration_sec } : {}),
    ...(row.rpe !== null ? { rpe: row.rpe } : {}),
    completed: row.completed === 1,
    isWarmup: row.is_warmup === 1,
  };
}

async function hydrateSessionEntries(db: DatabaseClient, sessionRow: SessionRow): Promise<Session> {
  const entryRows = await db.getAllAsync<EntryRow>(
    'SELECT * FROM entries WHERE session_id = ? ORDER BY position ASC;',
    [sessionRow.id],
  );

  const entries: Entry[] = [];
  for (const entryRow of entryRows) {
    const setRows = await db.getAllAsync<SetRow>(
      'SELECT * FROM sets WHERE entry_id = ? ORDER BY position ASC;',
      [entryRow.id],
    );
    entries.push({
      id: entryRow.id,
      exerciseId: entryRow.exercise_id,
      position: entryRow.position,
      sets: setRows.map(mapRowToSetRecord),
      ...(entryRow.notes !== null ? { notes: entryRow.notes } : {}),
    });
  }

  return {
    id: sessionRow.id,
    startedAt: sessionRow.started_at,
    ...(sessionRow.finished_at !== null ? { finishedAt: sessionRow.finished_at } : {}),
    ...(sessionRow.name !== null ? { name: sessionRow.name } : {}),
    ...(sessionRow.notes !== null ? { notes: sessionRow.notes } : {}),
    entries,
  };
}

export async function saveSession(
  db: DatabaseClient,
  session: Session,
  queue: WriteQueue = defaultWriteQueue,
): Promise<void> {
  await queue.enqueue(async () => {
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO sessions (id, started_at, finished_at, name, notes)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           started_at = excluded.started_at,
           finished_at = excluded.finished_at,
           name = excluded.name,
           notes = excluded.notes;`,
        [
          session.id,
          session.startedAt,
          session.finishedAt ?? null,
          session.name ?? null,
          session.notes ?? null,
        ],
      );

      // Replace session entries and sets atomically within the transaction
      await db.runAsync('DELETE FROM entries WHERE session_id = ?;', [session.id]);

      for (const entry of session.entries) {
        await db.runAsync(
          `INSERT INTO entries (id, session_id, exercise_id, position, notes)
           VALUES (?, ?, ?, ?, ?);`,
          [entry.id, session.id, entry.exerciseId, entry.position, entry.notes ?? null],
        );

        for (let idx = 0; idx < entry.sets.length; idx += 1) {
          const set = entry.sets[idx];
          await db.runAsync(
            `INSERT INTO sets (
              id, entry_id, position, reps, weight, duration_sec, rpe, completed, is_warmup
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              set.id,
              entry.id,
              idx,
              set.reps ?? null,
              set.weight ?? null,
              set.durationSec ?? null,
              set.rpe ?? null,
              set.completed ? 1 : 0,
              set.isWarmup ? 1 : 0,
            ],
          );
        }
      }
    });
  });
}

export async function getSessionById(db: DatabaseClient, id: string): Promise<Session | null> {
  const row = await db.getFirstAsync<SessionRow>('SELECT * FROM sessions WHERE id = ?;', [id]);
  if (!row) return null;
  return hydrateSessionEntries(db, row);
}

export async function getActiveSession(db: DatabaseClient): Promise<Session | null> {
  const row = await db.getFirstAsync<SessionRow>(
    'SELECT * FROM sessions WHERE finished_at IS NULL ORDER BY started_at DESC LIMIT 1;',
  );
  if (!row) return null;
  return hydrateSessionEntries(db, row);
}

export async function listRecentSessions(db: DatabaseClient, limit = 5): Promise<Session[]> {
  const rows = await db.getAllAsync<SessionRow>(
    'SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?;',
    [limit],
  );
  const sessions: Session[] = [];
  for (const row of rows) {
    sessions.push(await hydrateSessionEntries(db, row));
  }
  return sessions;
}

export async function finishSession(
  db: DatabaseClient,
  sessionId: string,
  finishedAt: number,
  notes?: string,
  queue: WriteQueue = defaultWriteQueue,
): Promise<void> {
  await queue.enqueue(async () => {
    if (notes !== undefined) {
      await db.runAsync('UPDATE sessions SET finished_at = ?, notes = ? WHERE id = ?;', [
        finishedAt,
        notes,
        sessionId,
      ]);
    } else {
      await db.runAsync('UPDATE sessions SET finished_at = ? WHERE id = ?;', [
        finishedAt,
        sessionId,
      ]);
    }
  });
}

export async function deleteSession(
  db: DatabaseClient,
  sessionId: string,
  queue: WriteQueue = defaultWriteQueue,
): Promise<void> {
  await queue.enqueue(async () => {
    await db.runAsync('DELETE FROM sessions WHERE id = ?;', [sessionId]);
  });
}

export async function getLastWorkingSetsForExercise(
  db: DatabaseClient,
  exerciseId: string,
): Promise<SetRecord[] | null> {
  const rows = await db.getAllAsync<LastDoneRow>(LAST_DONE_WORKING_SETS_SQL, [exerciseId]);
  if (rows.length === 0) return null;

  const latestSessionId = rows[0].session_id;
  return rows.filter((row) => row.session_id === latestSessionId).map(mapRowToSetRecord);
}
