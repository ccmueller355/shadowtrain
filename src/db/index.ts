// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import * as SQLite from 'expo-sqlite';
import { DatabaseClient, runMigrations, SqlParam } from './migrations';

export const DEFAULT_DB_NAME = 'shadowtrain.db';

let dbInstance: DatabaseClient | null = null;
let initPromise: Promise<DatabaseClient> | null = null;

export function createExpoSqliteAdapter(rawDb: SQLite.SQLiteDatabase): DatabaseClient {
  return {
    execAsync: (source: string) => rawDb.execAsync(source),
    runAsync: (source: string, params: SqlParam[] = []) => rawDb.runAsync(source, params),
    getFirstAsync: <T>(source: string, params: SqlParam[] = []) =>
      rawDb.getFirstAsync<T>(source, params),
    getAllAsync: <T>(source: string, params: SqlParam[] = []) =>
      rawDb.getAllAsync<T>(source, params),
    withTransactionAsync: (task: () => Promise<void>) => rawDb.withTransactionAsync(task),
  };
}

export async function initDatabase(
  dbName: string = DEFAULT_DB_NAME,
  injectedClient?: DatabaseClient,
): Promise<DatabaseClient> {
  if (injectedClient) {
    await runMigrations(injectedClient);
    dbInstance = injectedClient;
    return injectedClient;
  }

  if (dbInstance) {
    return dbInstance;
  }

  if (!initPromise) {
    initPromise = (async () => {
      const rawDb = await SQLite.openDatabaseAsync(dbName);
      const client = createExpoSqliteAdapter(rawDb);
      await runMigrations(client);
      dbInstance = client;
      return client;
    })();
  }

  return initPromise;
}

export function getDatabase(): DatabaseClient {
  if (!dbInstance) {
    throw new Error('ShadowTrain SQLite database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

export function resetDatabaseSingleton(): void {
  dbInstance = null;
  initPromise = null;
}

export * from './schema';
export * from './migrations';
export * from './writeQueue';
export * from './repositories/exerciseRepo';
export * from './repositories/sessionRepo';
export * from './seed';
