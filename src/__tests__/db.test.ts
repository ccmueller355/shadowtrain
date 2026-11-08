// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import * as SQLite from 'expo-sqlite';
import {
  countExercises,
  createExpoSqliteAdapter,
  DatabaseClient,
  deleteSession,
  enqueueWrite,
  ExerciseRow,
  finishSession,
  flushWriteQueue,
  getActiveSession,
  getDatabase,
  getExerciseById,
  getLastWorkingSetsForExercise,
  getSessionById,
  getUserVersion,
  initDatabase,
  LAST_DONE_WORKING_SETS_SQL,
  listExercises,
  listRecentSessions,
  mapRowToExercise,
  Migration,
  PRAGMA_INIT_SQL,
  resetDatabaseSingleton,
  runMigrations,
  saveSession,
  SCHEMA_VERSION,
  SessionRow,
  SetRow,
  SqlParam,
  upsertExercise,
  upsertExercises,
  V1_SCHEMA_SQL,
  WriteQueue,
  EntryRow,
  LastDoneRow,
} from '../db';
import { Exercise, Session } from '../types';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

class InMemoryDatabaseClient implements DatabaseClient {
  public userVersion = 0;
  public executedSql: string[] = [];
  public exercises = new Map<string, ExerciseRow>();
  public sessions = new Map<string, SessionRow>();
  public entries = new Map<string, EntryRow>();
  public sets = new Map<string, SetRow>();

  async execAsync(source: string): Promise<void> {
    this.executedSql.push(source);
    const versionMatch = source.match(/PRAGMA\s+user_version\s*=\s*(\d+)/i);
    if (versionMatch) {
      this.userVersion = Number(versionMatch[1]);
    }
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }

  async runAsync(
    source: string,
    params: SqlParam[] = [],
  ): Promise<{ changes: number; lastInsertRowId: number }> {
    this.executedSql.push(source);
    const normalized = source.replace(/\s+/g, ' ').trim();

    if (normalized.startsWith('INSERT INTO exercises')) {
      const [
        id,
        name,
        primary_muscles,
        secondary_muscles,
        equipment,
        category,
        tracking_type,
        tier,
        next_progression_id,
        image_start,
        image_end,
        instructions,
      ] = params;
      this.exercises.set(String(id), {
        id: String(id),
        name: String(name),
        primary_muscles: String(primary_muscles),
        secondary_muscles: secondary_muscles !== null ? String(secondary_muscles) : null,
        equipment: String(equipment),
        category: category !== null ? String(category) : null,
        tracking_type: String(tracking_type),
        tier: tier !== null ? String(tier) : null,
        next_progression_id: next_progression_id !== null ? String(next_progression_id) : null,
        image_start: image_start !== null ? String(image_start) : null,
        image_end: image_end !== null ? String(image_end) : null,
        instructions: instructions !== null ? String(instructions) : null,
      });
      return { changes: 1, lastInsertRowId: this.exercises.size };
    }

    if (normalized.startsWith('INSERT INTO sessions')) {
      const [id, started_at, finished_at, name, notes] = params;
      this.sessions.set(String(id), {
        id: String(id),
        started_at: Number(started_at),
        finished_at: finished_at !== null ? Number(finished_at) : null,
        name: name !== null ? String(name) : null,
        notes: notes !== null ? String(notes) : null,
      });
      return { changes: 1, lastInsertRowId: this.sessions.size };
    }

    if (normalized.startsWith('DELETE FROM entries WHERE session_id = ?')) {
      const sessionId = String(params[0]);
      for (const [entryId, entry] of this.entries.entries()) {
        if (entry.session_id === sessionId) {
          this.entries.delete(entryId);
          for (const [setId, setRow] of this.sets.entries()) {
            if (setRow.entry_id === entryId) {
              this.sets.delete(setId);
            }
          }
        }
      }
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (normalized.startsWith('INSERT INTO entries')) {
      const [id, session_id, exercise_id, position, notes] = params;
      this.entries.set(String(id), {
        id: String(id),
        session_id: String(session_id),
        exercise_id: String(exercise_id),
        position: Number(position),
        notes: notes !== null ? String(notes) : null,
      });
      return { changes: 1, lastInsertRowId: this.entries.size };
    }

    if (normalized.startsWith('INSERT INTO sets')) {
      const [id, entry_id, position, reps, weight, duration_sec, rpe, completed, is_warmup] =
        params;
      this.sets.set(String(id), {
        id: String(id),
        entry_id: String(entry_id),
        position: Number(position),
        reps: reps !== null ? Number(reps) : null,
        weight: weight !== null ? Number(weight) : null,
        duration_sec: duration_sec !== null ? Number(duration_sec) : null,
        rpe: rpe !== null ? Number(rpe) : null,
        completed: Number(completed),
        is_warmup: Number(is_warmup),
      });
      return { changes: 1, lastInsertRowId: this.sets.size };
    }

    if (normalized.startsWith('UPDATE sessions SET finished_at = ?, notes = ? WHERE id = ?')) {
      const [finishedAt, notes, id] = params;
      const existing = this.sessions.get(String(id));
      if (existing) {
        existing.finished_at = Number(finishedAt);
        existing.notes = notes !== null ? String(notes) : null;
      }
      return { changes: existing ? 1 : 0, lastInsertRowId: 0 };
    }

    if (normalized.startsWith('UPDATE sessions SET finished_at = ? WHERE id = ?')) {
      const [finishedAt, id] = params;
      const existing = this.sessions.get(String(id));
      if (existing) {
        existing.finished_at = Number(finishedAt);
      }
      return { changes: existing ? 1 : 0, lastInsertRowId: 0 };
    }

    if (normalized.startsWith('DELETE FROM sessions WHERE id = ?')) {
      const sessionId = String(params[0]);
      this.sessions.delete(sessionId);
      for (const [entryId, entry] of this.entries.entries()) {
        if (entry.session_id === sessionId) {
          this.entries.delete(entryId);
          for (const [setId, setRow] of this.sets.entries()) {
            if (setRow.entry_id === entryId) {
              this.sets.delete(setId);
            }
          }
        }
      }
      return { changes: 1, lastInsertRowId: 0 };
    }

    return { changes: 0, lastInsertRowId: 0 };
  }

  async getFirstAsync<T>(source: string, params: SqlParam[] = []): Promise<T | null> {
    const normalized = source.replace(/\s+/g, ' ').trim();

    if (normalized === 'PRAGMA user_version;') {
      return { user_version: this.userVersion } as unknown as T;
    }

    if (normalized === 'SELECT * FROM exercises WHERE id = ?;') {
      const row = this.exercises.get(String(params[0]));
      return (row ?? null) as unknown as T | null;
    }

    if (normalized === 'SELECT COUNT(*) AS count FROM exercises;') {
      return { count: this.exercises.size } as unknown as T;
    }

    if (normalized === 'SELECT * FROM sessions WHERE id = ?;') {
      const row = this.sessions.get(String(params[0]));
      return (row ?? null) as unknown as T | null;
    }

    if (normalized.includes('WHERE finished_at IS NULL')) {
      const active = [...this.sessions.values()]
        .filter((s) => s.finished_at === null)
        .sort((a, b) => b.started_at - a.started_at)[0];
      return (active ?? null) as unknown as T | null;
    }

    return null;
  }

  async getAllAsync<T>(source: string, params: SqlParam[] = []): Promise<T[]> {
    const normalized = source.replace(/\s+/g, ' ').trim();

    if (normalized.startsWith('SELECT * FROM exercises')) {
      let list = [...this.exercises.values()];
      let paramIdx = 0;

      const eqMatch = normalized.match(/equipment IN \(([^)]+)\)/);
      if (eqMatch) {
        const count = eqMatch[1].split(',').length;
        const eqSet = new Set(params.slice(paramIdx, paramIdx + count).map(String));
        paramIdx += count;
        list = list.filter((row) => eqSet.has(row.equipment));
      }

      if (normalized.includes('category = ?')) {
        const category = String(params[paramIdx]);
        paramIdx += 1;
        list = list.filter((row) => row.category === category);
      }

      if (normalized.includes('LOWER(name) LIKE ?')) {
        const pattern = String(params[paramIdx]).replace(/%/g, '');
        list = list.filter((row) => row.name.toLowerCase().includes(pattern));
      }

      list.sort((a, b) => a.name.localeCompare(b.name));
      return list as unknown as T[];
    }

    if (normalized.startsWith('SELECT * FROM entries WHERE session_id = ?')) {
      const sessionId = String(params[0]);
      const rows = [...this.entries.values()]
        .filter((e) => e.session_id === sessionId)
        .sort((a, b) => a.position - b.position);
      return rows as unknown as T[];
    }

    if (normalized.startsWith('SELECT * FROM sets WHERE entry_id = ?')) {
      const entryId = String(params[0]);
      const rows = [...this.sets.values()]
        .filter((s) => s.entry_id === entryId)
        .sort((a, b) => a.position - b.position);
      return rows as unknown as T[];
    }

    if (normalized.startsWith('SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?')) {
      const limit = Number(params[0]);
      const rows = [...this.sessions.values()]
        .sort((a, b) => b.started_at - a.started_at)
        .slice(0, limit);
      return rows as unknown as T[];
    }

    if (normalized.includes('FROM sets s JOIN entries e ON e.id = s.entry_id')) {
      const exerciseId = String(params[0]);
      const joined: (LastDoneRow & { setPosition: number })[] = [];

      for (const setRow of this.sets.values()) {
        if (setRow.is_warmup !== 0) continue;
        const entryRow = this.entries.get(setRow.entry_id);
        if (!entryRow || entryRow.exercise_id !== exerciseId) continue;
        const sessionRow = this.sessions.get(entryRow.session_id);
        if (!sessionRow) continue;

        joined.push({
          id: setRow.id,
          reps: setRow.reps,
          weight: setRow.weight,
          duration_sec: setRow.duration_sec,
          rpe: setRow.rpe,
          completed: setRow.completed,
          is_warmup: setRow.is_warmup,
          session_id: sessionRow.id,
          started_at: sessionRow.started_at,
          setPosition: setRow.position,
        });
      }

      joined.sort((a, b) => {
        if (b.started_at !== a.started_at) return b.started_at - a.started_at;
        return a.setPosition - b.setPosition;
      });

      return joined.slice(0, 50) as unknown as T[];
    }

    return [];
  }
}

describe('M1 SQLite Layer, Schema, Migrations, WriteQueue & Repositories', () => {
  let db: InMemoryDatabaseClient;

  beforeEach(() => {
    db = new InMemoryDatabaseClient();
    resetDatabaseSingleton();
    jest.clearAllMocks();
  });

  describe('Schema & Migrations', () => {
    it('defines v1 schema DDL with WAL, foreign keys, 4 tables, and 3 indexes', () => {
      expect(SCHEMA_VERSION).toBe(1);
      expect(PRAGMA_INIT_SQL).toContain('PRAGMA journal_mode = WAL;');
      expect(PRAGMA_INIT_SQL).toContain('PRAGMA foreign_keys = ON;');
      expect(V1_SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS exercises');
      expect(V1_SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS sessions');
      expect(V1_SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS entries');
      expect(V1_SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS sets');
      expect(V1_SCHEMA_SQL).toContain('idx_entries_exercise');
      expect(V1_SCHEMA_SQL).toContain('idx_sessions_started');
      expect(V1_SCHEMA_SQL).toContain('idx_sets_entry');
      expect(LAST_DONE_WORKING_SETS_SQL).toContain('WHERE e.exercise_id = ? AND s.is_warmup = 0');
    });

    it('runs v1 migration on first boot and is idempotent on subsequent boots', async () => {
      expect(await getUserVersion(db)).toBe(0);

      const firstRun = await runMigrations(db);
      expect(firstRun).toEqual({
        fromVersion: 0,
        toVersion: 1,
        appliedCount: 1,
      });
      expect(await getUserVersion(db)).toBe(1);

      const secondRun = await runMigrations(db);
      expect(secondRun).toEqual({
        fromVersion: 1,
        toVersion: 1,
        appliedCount: 0,
      });
    });

    it('applies multi-step migrations in ascending version order', async () => {
      const customMigrations: Migration[] = [
        { version: 2, name: '002_second', upSql: 'SELECT 2;' },
        { version: 1, name: '001_first', upSql: 'SELECT 1;' },
      ];

      const result = await runMigrations(db, customMigrations);
      expect(result).toEqual({
        fromVersion: 0,
        toVersion: 2,
        appliedCount: 2,
      });
      expect(await getUserVersion(db)).toBe(2);
    });
  });

  describe('WriteQueue', () => {
    it('serializes concurrent writes in FIFO order and survives task failures', async () => {
      const queue = new WriteQueue();
      const order: string[] = [];

      const p1 = queue.enqueue(async () => {
        await new Promise((r) => setTimeout(r, 15));
        order.push('first');
        return 1;
      });

      const p2 = queue.enqueue(async () => {
        order.push('second-fails');
        throw new Error('simulated write error');
      });

      const p3 = queue.enqueue(async () => {
        order.push('third');
        return 3;
      });

      expect(queue.pendingCount).toBe(3);
      await expect(p1).resolves.toBe(1);
      await expect(p2).rejects.toThrow('simulated write error');
      await expect(p3).resolves.toBe(3);

      await queue.flush();
      expect(queue.pendingCount).toBe(0);
      expect(order).toEqual(['first', 'second-fails', 'third']);
    });

    it('supports global enqueueWrite and flushWriteQueue helpers', async () => {
      const result = await enqueueWrite(async () => 'locked-in');
      await flushWriteQueue();
      expect(result).toBe('locked-in');
    });
  });

  describe('Exercise Repository', () => {
    const sampleExercises: Exercise[] = [
      {
        id: 'kb-swing-2h',
        name: 'Two-Hand Kettlebell Swing',
        primaryMuscles: ['hamstrings', 'glutes'],
        secondaryMuscles: ['lower_back', 'core'],
        equipment: 'kettlebell',
        category: 'strength',
        trackingType: 'reps',
        imageStart: 'kb-swing-2h/start.webp',
        imageEnd: 'kb-swing-2h/end.webp',
        instructions: ['Hike bell back', 'Snap hips to lockout'],
      },
      {
        id: 'ring-support-hold',
        name: 'Ring Support Hold',
        primaryMuscles: ['chest', 'shoulders'],
        equipment: 'rings',
        category: 'strength',
        trackingType: 'duration',
      },
      {
        id: 'couch-stretch',
        name: 'Couch Stretch',
        primaryMuscles: ['quads', 'hip_flexors'],
        equipment: 'stretching',
        category: 'stretching',
        trackingType: 'duration',
      },
    ];

    it('upserts, counts, fetches by id, and filters exercises by equipment, category, and search', async () => {
      expect(await countExercises(db)).toBe(0);
      await upsertExercises(db, []);
      expect(await countExercises(db)).toBe(0);

      await upsertExercises(db, sampleExercises);
      expect(await countExercises(db)).toBe(3);

      const swing = await getExerciseById(db, 'kb-swing-2h');
      expect(swing).toEqual(sampleExercises[0]);
      expect(await getExerciseById(db, 'non-existent')).toBeNull();

      // Update single exercise
      await upsertExercise(db, {
        ...sampleExercises[0],
        name: 'Heavy Two-Hand KB Swing',
      });
      const updatedSwing = await getExerciseById(db, 'kb-swing-2h');
      expect(updatedSwing?.name).toBe('Heavy Two-Hand KB Swing');

      // Filter by equipment
      const kbAndRings = await listExercises(db, {
        equipment: ['kettlebell', 'rings'],
      });
      expect(kbAndRings.map((e) => e.id)).toEqual(['kb-swing-2h', 'ring-support-hold']);

      // Filter by category
      const stretchingOnly = await listExercises(db, { category: 'stretching' });
      expect(stretchingOnly.map((e) => e.id)).toEqual(['couch-stretch']);

      // Filter by text search
      const ringSearch = await listExercises(db, { search: '  ring ' });
      expect(ringSearch.map((e) => e.id)).toEqual(['ring-support-hold']);
    });

    it('handles malformed JSON arrays in mapRowToExercise gracefully', () => {
      const mapped = mapRowToExercise({
        id: 'broken-json',
        name: 'Broken JSON Exercise',
        primary_muscles: 'not-valid-json',
        secondary_muscles: '{"not":"an-array"}',
        equipment: 'bodyweight',
        category: null,
        tracking_type: 'reps',
        image_start: null,
        image_end: null,
        instructions: null,
      });
      expect(mapped.primaryMuscles).toEqual([]);
      expect(mapped.secondaryMuscles).toBeUndefined();
    });
  });

  describe('Session Repository & Last-Done Query', () => {
    const firstSession: Session = {
      id: 'session-1',
      startedAt: 1700000000000,
      finishedAt: 1700003600000,
      name: 'Simple & Sinister A',
      notes: 'Crisp swings',
      entries: [
        {
          id: 'entry-1',
          exerciseId: 'kb-swing-2h',
          position: 0,
          notes: '16kg bell',
          sets: [
            {
              id: 'set-1-warmup',
              reps: 10,
              weight: 12,
              completed: true,
              isWarmup: true,
            },
            {
              id: 'set-1-work-1',
              reps: 10,
              weight: 16,
              rpe: 7,
              completed: true,
              isWarmup: false,
            },
            {
              id: 'set-1-work-2',
              reps: 10,
              weight: 16,
              completed: true,
              isWarmup: false,
            },
          ],
        },
      ],
    };

    const secondSession: Session = {
      id: 'session-2',
      startedAt: 1700100000000,
      name: 'KB & Rings B',
      entries: [
        {
          id: 'entry-2',
          exerciseId: 'kb-swing-2h',
          position: 0,
          sets: [
            {
              id: 'set-2-work-1',
              reps: 12,
              weight: 16,
              completed: true,
              isWarmup: false,
            },
            {
              id: 'set-2-work-2',
              reps: 12,
              weight: 16,
              completed: false,
              isWarmup: false,
            },
          ],
        },
        {
          id: 'entry-3',
          exerciseId: 'ring-support-hold',
          position: 1,
          sets: [
            {
              id: 'set-3-work-1',
              durationSec: 45,
              completed: true,
              isWarmup: false,
            },
          ],
        },
      ],
    };

    it('saves, loads, lists, finishes, and deletes sessions with cascading entries and sets', async () => {
      await saveSession(db, firstSession);
      await saveSession(db, secondSession);

      const loadedFirst = await getSessionById(db, 'session-1');
      expect(loadedFirst).toEqual(firstSession);
      expect(await getSessionById(db, 'missing')).toBeNull();

      // Active session (finished_at IS NULL)
      const active = await getActiveSession(db);
      expect(active?.id).toBe('session-2');

      // Recent sessions ordered by startedAt DESC
      const recent = await listRecentSessions(db, 5);
      expect(recent.map((s) => s.id)).toEqual(['session-2', 'session-1']);

      // Finish session-2 with notes, then update without notes
      await finishSession(db, 'session-2', 1700103600000, 'Locked out rings');
      expect(await getActiveSession(db)).toBeNull();
      await finishSession(db, 'session-2', 1700103700000);

      const finishedSecond = await getSessionById(db, 'session-2');
      expect(finishedSecond?.finishedAt).toBe(1700103700000);
      expect(finishedSecond?.notes).toBe('Locked out rings');

      // Delete session-1
      await deleteSession(db, 'session-1');
      expect(await getSessionById(db, 'session-1')).toBeNull();
    });

    it('returns most recent session working sets (excluding warmups) via getLastWorkingSetsForExercise', async () => {
      await saveSession(db, firstSession);
      await saveSession(db, secondSession);

      // Should return only session-2 working sets for kb-swing-2h
      const lastSets = await getLastWorkingSetsForExercise(db, 'kb-swing-2h');
      expect(lastSets).toEqual([
        {
          id: 'set-2-work-1',
          reps: 12,
          weight: 16,
          completed: true,
          isWarmup: false,
        },
        {
          id: 'set-2-work-2',
          reps: 12,
          weight: 16,
          completed: false,
          isWarmup: false,
        },
      ]);

      // For session-1 only, warmups are excluded
      await deleteSession(db, 'session-2');
      const firstSessionSets = await getLastWorkingSetsForExercise(db, 'kb-swing-2h');
      expect(firstSessionSets?.map((s) => s.id)).toEqual(['set-1-work-1', 'set-1-work-2']);

      expect(await getLastWorkingSetsForExercise(db, 'never-logged')).toBeNull();
    });
  });

  describe('Database Bootstrap & Expo SQLite Adapter', () => {
    it('throws when getDatabase() is called before initDatabase()', () => {
      expect(() => getDatabase()).toThrow('ShadowTrain SQLite database not initialized');
    });

    it('initializes with injected client or expo-sqlite openDatabaseAsync', async () => {
      const injected = await initDatabase('test.db', db);
      expect(injected).toBe(db);
      expect(getDatabase()).toBe(db);
      expect(await getUserVersion(db)).toBe(1);

      resetDatabaseSingleton();

      const mockRawDb = {
        execAsync: jest.fn().mockResolvedValue(undefined),
        runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
        getFirstAsync: jest.fn().mockResolvedValue({ user_version: 1 }),
        getAllAsync: jest.fn().mockResolvedValue([]),
        withTransactionAsync: jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb()),
      } as unknown as SQLite.SQLiteDatabase;

      (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockRawDb);

      const adapter = await initDatabase('shadowtrain.db');
      const cached = await initDatabase('shadowtrain.db');
      expect(cached).toBe(adapter);
      expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);

      await adapter.runAsync('DELETE FROM sessions;');
      await adapter.getFirstAsync('SELECT 1;');
      await adapter.getAllAsync('SELECT 1;');
      expect(mockRawDb.runAsync).toHaveBeenCalled();
      expect(mockRawDb.getFirstAsync).toHaveBeenCalled();
      expect(mockRawDb.getAllAsync).toHaveBeenCalled();

      const directAdapter = createExpoSqliteAdapter(mockRawDb);
      await directAdapter.withTransactionAsync(async () => {
        await directAdapter.execAsync('SELECT 1;');
      });
      expect(mockRawDb.withTransactionAsync).toHaveBeenCalled();
    });
  });
});
