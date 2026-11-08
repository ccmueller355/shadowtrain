// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───

export const SCHEMA_VERSION = 1;

export const PRAGMA_INIT_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
`;

export const V1_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS exercises (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  primary_muscles   TEXT NOT NULL,
  secondary_muscles TEXT,
  equipment         TEXT NOT NULL,
  category          TEXT,
  tracking_type     TEXT NOT NULL DEFAULT 'reps',
  image_start       TEXT,
  image_end         TEXT,
  instructions      TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  started_at  INTEGER NOT NULL,
  finished_at INTEGER,
  name        TEXT,
  notes       TEXT
);

CREATE TABLE IF NOT EXISTS entries (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  position    INTEGER NOT NULL,
  notes       TEXT
);

CREATE TABLE IF NOT EXISTS sets (
  id           TEXT PRIMARY KEY,
  entry_id     TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL,
  reps         INTEGER,
  weight       REAL,
  duration_sec INTEGER,
  rpe          REAL,
  completed    INTEGER NOT NULL DEFAULT 0,
  is_warmup    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_entries_exercise ON entries(exercise_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sets_entry       ON sets(entry_id, position);
`;

export const LAST_DONE_WORKING_SETS_SQL = `
SELECT
  s.id,
  s.reps,
  s.weight,
  s.duration_sec,
  s.rpe,
  s.completed,
  s.is_warmup,
  se.id AS session_id,
  se.started_at
FROM sets s
JOIN entries e  ON e.id = s.entry_id
JOIN sessions se ON se.id = e.session_id
WHERE e.exercise_id = ? AND s.is_warmup = 0
ORDER BY se.started_at DESC, s.position ASC
LIMIT 50;
`;
