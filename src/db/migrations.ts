// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import { PRAGMA_INIT_SQL, SCHEMA_VERSION, V1_SCHEMA_SQL } from './schema';

export type SqlParam = string | number | null;

export interface DatabaseClient {
  execAsync(source: string): Promise<void>;
  runAsync(
    source: string,
    params?: SqlParam[],
  ): Promise<{ changes: number; lastInsertRowId: number }>;
  getFirstAsync<T>(source: string, params?: SqlParam[]): Promise<T | null>;
  getAllAsync<T>(source: string, params?: SqlParam[]): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export interface Migration {
  version: number;
  name: string;
  upSql: string;
}

export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    name: '001_v1_initial_schema',
    upSql: V1_SCHEMA_SQL,
  },
];

export interface MigrationResult {
  fromVersion: number;
  toVersion: number;
  appliedCount: number;
}

export async function getUserVersion(db: DatabaseClient): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  return row?.user_version ?? 0;
}

export async function runMigrations(
  db: DatabaseClient,
  migrations: readonly Migration[] = MIGRATIONS,
): Promise<MigrationResult> {
  await db.execAsync(PRAGMA_INIT_SQL);
  const fromVersion = await getUserVersion(db);
  const pending = [...migrations]
    .filter((m) => m.version > fromVersion)
    .sort((a, b) => a.version - b.version);

  let currentVersion = fromVersion;
  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.upSql);
      await db.execAsync(`PRAGMA user_version = ${migration.version};`);
    });
    currentVersion = migration.version;
  }

  return {
    fromVersion,
    toVersion: currentVersion,
    appliedCount: pending.length,
  };
}

export { SCHEMA_VERSION };
