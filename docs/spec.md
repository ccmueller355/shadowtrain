# Shadow Train — MVP Plan & Spec

One-liner: A free, private, offline-first workout logger for one user (then whoever finds it), built on your `shadowlist` architecture, with a deterministic 80/20 progression engine (including Pavel-style fixed-kettlebell and calisthenics/rings step-loading) and a consistent AI-generated visual theme.

---

## 1. Goals & Non-Goals

**Goals (MVP)**
- Log workouts fast and reliably, fully offline.
- First-class support for a minimalist personal kit (**fixed kettlebell**, **gymnastic rings**, **bodyweight**, **hand-presses/grippers**, **skipping rope**, and **stretching**) while allowing any gym equipment to be toggled on.
- Pre-fill "last done" per exercise and suggest the next weight, rep, set, or duration target via deterministic rules.
- Ship a distinct shadow-themed UI.
- Zero recurring cost; no accounts, no backend.

**Non-Goals (MVP)**
- No cloud sync, no auth, no social features.
- No ML algorithm, no proprietary recovery modeling.
- No HD video library, no real human coaching.
- No Rust core. (Keep the `shadowlink-rust-core` pattern as a documented future option only.)
- No monetization / paywall.

---

## 2. Locked Decisions (Fixed)

| Area | Decision |
| :--- | :--- |
| Platform | React Native + **Expo SDK** (managed workflow), built on the `shadowlist` scaffold |
| State | **Zustand** stores (mirror `shadowlist`) |
| Persistence | **expo-sqlite** for structured data (sessions/entries/sets/exercises); `AsyncStorage` only for small prefs (theme, units, profile) via `zustand/middleware/persist` |
| Theming | Reuse `shadowlist`'s `themes.ts` + `useTheme` + `useThemeStyles`; new shadow-themed palette |
| Exercise data | Seed from a public dataset (e.g. `wrkout/exercises.json`) + curated `core-kit-exercises.json` (Pavel kettlebell, gymnastic rings, hand-presses, skipping rope, stretching), imported to SQLite at first run |
| Progression logic | Deterministic rule engine (pure TS), **not** an LLM, **not** a proprietary algo |
| Images | AI-generated, anchored prompt template, start/end pose per exercise, bundled as local assets |
| Distribution | EAS Build → internal install (APK / TestFlight) for personal use; optional Expo Go for dev |
| Cost target | $0 recurring; only cost is dev time + optional image-gen API |
| Build agent | **Repo-local coding agent** builds the MVP, one small issue at a time |
| Hermes harness | Optional, **bounded side-tasks only** (planning, review, research). Never concurrent editor |
| Sync / auth | Explicitly deferred (post-MVP) |
| Naming | **Shadow Train** (`shadow-train` / `shadowtrain`) |

---

## 3. Locked Product Defaults (Formerly Open Decisions)

| Decision | Locked Default | Why |
| :--- | :--- | :--- |
| **Units** | `kg` primary, `lb` toggle in settings | Most datasets/kettlebells/plates default to kg |
| **Equipment selection ("My Kit")** | Multi-select in Profile/Settings; defaults to `['kettlebell', 'rings', 'bodyweight', 'hand_gripper', 'jump_rope', 'stretching']` with other equipment (`dumbbell`, `barbell`, `bands`, `cable`, `machine`) toggleable | Tailored to minimalist Pavel-inspired kit out of the box, flexible for any gym |
| **Fixed kettlebell mode** | `fixedKettlebellWeight` setting in Profile (e.g. 16 kg / 24 kg); progressions use Pavel-style rep & set step-loading instead of micro-weight jumps | Kettlebells are fixed-weight; progression happens via reps, sets, ladders, and variations |
| **Split model** | Free-form sessions ("Push A", "KB & Rings", "Simple & Sinister", custom name) — no enforced split | Simpler than program templates; matches "80/20" ethos |
| **Rep-range default** | Strength `3–5`, Hypertrophy `8–12`, Endurance `15–20` (per-profile override) | Covers 90% of use |
| **Increments** | Fixed KB / Rings / Bodyweight / Hand Gripper → `+1 rep` then `+1 set` / variation; Timed (`jump_rope`, `stretching`, isometric holds) → `+15s`; Barbell `2.5 kg`, Dumbbell `2 kg`, Machine `5 kg`, Cable `2.5 kg` | Matches both minimalist fixed-weight training and standard gym reality |
| **Deload trigger** | Any working set `< lower bound` of rep range → suggest `−10%` weight (or `−1 set` / reset to `repRange.min` for fixed-weight / bodyweight) | Standard novice-safe rule |
| **RPE tracking** | Optional field, off by default | Keeps MVP logging fast |
| **Warmup sets** | Markable flag, excluded from progression math | Avoids skewed suggestions |
| **Rest timer** | Built-in countdown with haptic at end (default per-exercise seconds, overridable) | Universal training need |
| **Progress charts** | Volume/week (plus reps/time summary) and PR list (no fancy analytics) | Enough to feel "real" |
| **Image source** | One anchored character + one anchored gym background + fixed lighting; two poses per exercise | Consistency matters more than realism |
| **Image coverage MVP** | Bundle ~20–30 exercises with images focused on the default personal kit (`kettlebell`, `rings`, `bodyweight`, `hand_gripper`, `jump_rope`, `stretching`); rest fall back to a placeholder card | Ship faster, 100% visual coverage for core daily movements |
| **License** | MIT for code; attribution file for dataset | Keeps it honest & shareable |
| **Repo** | `shadow-train` (`shadowtrain`) scaffolded from `shadowlist` | Clean history |

---

## 4. Data Model

### 4.1 SQLite Schema (v1)

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE exercises (
  id                TEXT PRIMARY KEY,         -- from dataset or core-kit seed, stable
  name              TEXT NOT NULL,
  primary_muscles   TEXT NOT NULL,            -- JSON array
  secondary_muscles TEXT,                     -- JSON array
  equipment         TEXT NOT NULL,            -- e.g. 'kettlebell', 'rings', 'bodyweight', 'hand_gripper', 'jump_rope', 'stretching'
  category          TEXT,                     -- e.g. 'strength', 'stretching', 'cardio', 'grip'
  tracking_type     TEXT NOT NULL DEFAULT 'reps', -- 'reps' | 'duration'
  image_start       TEXT,                     -- asset key or file URI
  image_end         TEXT,
  instructions      TEXT                      -- JSON array of strings
);

CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,
  started_at  INTEGER NOT NULL,               -- unix ms
  finished_at INTEGER,
  name        TEXT,                           -- e.g. "KB & Rings A"
  notes       TEXT
);

CREATE TABLE entries (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  position    INTEGER NOT NULL,
  notes       TEXT
);

CREATE TABLE sets (
  id           TEXT PRIMARY KEY,
  entry_id     TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL,
  reps         INTEGER,
  weight       REAL,
  duration_sec INTEGER,                       -- for jump_rope, stretching, and isometric ring/grip holds
  rpe          REAL,
  completed    INTEGER NOT NULL DEFAULT 0,
  is_warmup    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_entries_exercise ON entries(exercise_id);
CREATE INDEX idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX idx_sets_entry       ON sets(entry_id, position);
```

**"Last done" query** (fast path, indexed):

```sql
SELECT s.reps, s.weight, s.duration_sec, s.rpe, s.completed, s.is_warmup, se.started_at
FROM sets s
JOIN entries e  ON e.id = s.entry_id
JOIN sessions se ON se.id = e.session_id
WHERE e.exercise_id = ? AND s.is_warmup = 0
ORDER BY se.started_at DESC, s.position ASC
LIMIT 50;
```

Take the most recent session's working sets → that's the pre-fill.

### 4.2 TypeScript Types

```ts
type Goal = 'strength' | 'hypertrophy' | 'endurance';
type Experience = 'novice' | 'intermediate' | 'advanced';
type Units = 'kg' | 'lb';
type TrackingType = 'reps' | 'duration';

type Equipment =
  | 'kettlebell'
  | 'rings'
  | 'bodyweight'
  | 'hand_gripper'
  | 'jump_rope'
  | 'stretching'
  | 'dumbbell'
  | 'barbell'
  | 'bands'
  | 'cable'
  | 'machine';

interface Profile {
  goal: Goal;
  experience: Experience;
  units: Units;
  repRange: { min: number; max: number };   // derived from goal, overridable
  increments: Record<string, number>;        // per-equipment override (0 = fixed weight / step-loading)
  availableEquipment: Equipment[];           // defaults to ['kettlebell', 'rings', 'bodyweight', 'hand_gripper', 'jump_rope', 'stretching']
  fixedKettlebellWeight?: number;            // e.g. 16 or 24 kg; triggers Pavel-style rep/set step-loading
}

interface Exercise {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: Equipment;
  category?: string;
  trackingType: TrackingType;
  imageStart?: string;
  imageEnd?: string;
  instructions?: string[];
}

interface Session {
  id: string;
  startedAt: number;
  finishedAt?: number;
  name?: string;
  notes?: string;
  entries: Entry[];
}

interface Entry {
  id: string;
  exerciseId: string;
  position: number;
  sets: SetRecord[];
  notes?: string;
}

interface SetRecord {
  id: string;
  reps?: number;
  weight?: number;
  durationSec?: number;
  rpe?: number;
  completed: boolean;
  isWarmup: boolean;
}
```

### 4.3 Storage Split

- **SQLite**: everything in §4.1 (`exercises`, `sessions`, `entries`, `sets`).
- **AsyncStorage / `persist`**: `Profile` (including `availableEquipment` and `fixedKettlebellWeight`), `theme`, last-used rest timer durations, onboarding flag.

---

## 5. Feature Spec (MVP)

### 5.1 Screens

| Screen | Purpose | Must-have |
| :--- | :--- | :--- |
| **Home** | Start session, resume in-progress, list of recent sessions | New session button, resume banner, last 5 sessions |
| **Session (Logger)** | Add exercises, log sets (reps/weight or duration), see last-done prefill, rest timer | Per-exercise card with sets, prefill, +set, checkoff, timer |
| **Exercise Picker** | Search/filter exercises | Defaults to `profile.availableEquipment` filter (with quick "Show all" toggle), text search, muscle filter, equipment filter |
| **Exercise Detail** | Show images, instructions, history, current suggestion | Start/end images, "Suggested next" banner |
| **Progress** | Volume/week, PR list | Two simple charts + PR table |
| **Settings** | Profile, available equipment selector, fixed KB weight, units, theme, increments override, export data | All of `Profile`, equipment toggles, JSON export |

### 5.2 Core Interaction Flow (Happy Path)

1. Home → **New Session** (auto-name "Session · <date>", editable).
2. Tap **+ Add Exercise** → Picker (pre-filtered to your selected equipment: Kettlebell, Rings, Bodyweight, Hand Gripper, Skipping Rope, Stretching) → select.
3. On add, app runs `suggestNext()` and pre-fills sets:
   - **No history** → default weight (`fixedKettlebellWeight` for KB, blank/0 for bodyweight/rings) and `repRange.min` (for step-loading) or `repRange.max` (for linear plate loading), or default `durationSec` (e.g. `60s` for stretching/holds, `180s` for skipping rope).
   - **History** → last weight/reps/duration + a suggested adjustment with a one-line reason chip.
4. User logs sets; each row checkoffs individually.
5. Rest timer auto-starts on checkoff (default per exercise).
6. **Finish Session** → writes `finished_at`, returns Home.
7. If the app closes mid-session, the session is resumable (a session with `finished_at IS NULL`).

### 5.3 Deterministic Progression Engine

Pure function, unit-tested, no I/O.

```ts
type Suggestion =
  | { action: 'first_time'; reps?: number; weight?: number; durationSec?: number; sets?: number }
  | { action: 'increase';   reps?: number; weight?: number; durationSec?: number; sets?: number; delta: number; reason: string }
  | { action: 'repeat';     reps?: number; weight?: number; durationSec?: number; sets?: number; reason: string }
  | { action: 'deload';     reps?: number; weight?: number; durationSec?: number; sets?: number; reason: string };

function suggestNext(
  history: SetRecord[] | null,   // last session's working sets, ordered
  profile: Profile,
  exercise: Exercise,
): Suggestion;
```

**Rules (evaluated in order):**

1. **No history** → `first_time`:
   - If `trackingType === 'duration'`: `durationSec = exercise.equipment === 'jump_rope' ? 120 : 45`, `sets = 3`.
   - If fixed-weight / step-loaded (`rings`, `bodyweight`, `hand_gripper`, or `kettlebell` when `fixedKettlebellWeight` is set): `reps = repRange.min`, `weight = fixedKettlebellWeight` (if KB), `sets = 3`.
   - Otherwise (adjustable weight): `reps = repRange.max`, `sets = 3`.
2. **Timed exercises (`trackingType === 'duration'`)**:
   - If `exercise.equipment === 'stretching'`: `repeat` last `durationSec` (or `+15s` if all sets < 60s and completed).
   - If all working sets completed target duration: `increase` `durationSec` by `+15s` (reason: *"All rounds completed — add 15s"*).
   - Otherwise: `repeat` same duration.
3. **Pavel / Fixed-Weight & Calisthenics Step-Loading** (`rings`, `bodyweight`, `hand_gripper`, or `kettlebell` with `fixedKettlebellWeight` / `increment === 0`):
   - **Under-logged (<2 working sets)** → `repeat` same sets & reps.
   - **Any working set `reps < repRange.min`** → `deload`: keep weight, reset target reps to `repRange.min` (and drop 1 set if `sets > 3`).
   - **Not all working sets reached `repRange.max`** → `increase` target by **+1 rep** at the same weight (capped at `repRange.max`), reason: *"Step-loading: +1 rep per set toward top of range"*.
   - **All working sets `reps >= repRange.max` and `workingSets.length < 5`** → `increase` by **+1 working set** at `repRange.min`–`repRange.max` (Pavel volume ladder / step-loading), reason: *"Hit top of rep range across sets — add 1 working set"*.
   - **All 5 working sets `reps >= repRange.max`** → `increase` variation/tempo chip (keep weight & 5×`repRange.max`), reason: *"5×max mastered — slow eccentric (3-1-3), pause at bottom/lockout, or progress variation"*.
4. **Standard Adjustable-Weight Progression** (`barbell`, `dumbbell`, `machine`, `cable`, or `kettlebell` with non-zero increment):
   - **<3 working sets logged** → `repeat` with reason *"Under 3 working sets logged last time"*.
   - **All working sets `reps >= repRange.max`** → `increase` `weight` by equipment increment; `reps = repRange.max`.
   - **Any working set `reps < repRange.min`** → `deload` `weight` by 10% (rounded *down* to the increment).
   - **Otherwise** → `repeat` same weight & reps.

**Edge cases handled explicitly:**
- Warmups (`isWarmup = true`) excluded from all progression math.
- Cable/machine: use declared increment; skip increase if user marked "at max".
- The UI shows the suggestion as an **editable pre-fill** — never auto-applies without the user's checkoff.

### 5.4 Exercise Library Ingestion

- `src/db/seed/core-kit-exercises.json` defines the curated core movements for the default personal kit:
  - **Kettlebell (Pavel staples)**: Two-Hand Kettlebell Swing, One-Arm Kettlebell Swing, Turkish Get-Up, Kettlebell Goblet Squat, Kettlebell Clean & Military Press, Kettlebell Snatch, Kettlebell Halo, One-Arm Kettlebell Row, Kettlebell Front Rack Squat.
  - **Gymnastic Rings**: Ring Support Hold (duration), Ring Row, Ring Push-Up, Ring Dip, Ring Pull-Up / Chin-Up, Ring Face Pull, Ring L-Sit Hold (duration), Ring Rollout / Fallout.
  - **Bodyweight**: Push-Up, Diamond Push-Up, Pike Push-Up, Bodyweight Squat, Pistol Squat (Assisted/Full), Hollow Body Hold (duration), Plank (duration), Hanging / Floor Leg Raise.
  - **Hand-Presses (`hand_gripper`)**: Hand Gripper Crush Rep, Hand Gripper Overcrush / Isometric Hold (duration), Fingertip / Pinch Grip Press.
  - **Skipping Rope (`jump_rope`)**: Jump Rope Basic Bounce (duration), Jump Rope Boxer Step (duration), Jump Rope High Knees / Double-Under Practice (duration).
  - **Stretching (`stretching`)**: Couch Stretch (Hip Flexors), 90/90 Hip Switch & Hold, Cossack Squat Hold, Thoracic Bridge / Dead Hang Decompression, Pike Hamstring Relaxed Stretch, Deep Squat Pry (Goblet/Bodyweight).
- One-off script `scripts/import-exercises.ts` merges the public JSON dataset with `core-kit-exercises.json`, maps fields to the `exercises` table, and seeds SQLite.
- Run at app bootstrap **only if** `exercises` table is empty (idempotent).
- All exercise IDs are stable, so a future re-import is additive, not destructive.

### 5.5 Image Pipeline

- **Anchored template** (kept in `docs/image-prompts.md`):

  ```
  Character: <fixed description>, wearing <fixed outfit>
  Environment: <fixed gym background>, <fixed lighting>
  Pose: <start | end> position of <exercise name>
  Style: <fixed render style, e.g. "muted cyberpunk, rim-light">
  ```

- Two images per exercise: `start` and `end`.
- Stored under `assets/exercises/<exercise_id>/{start,end}.webp` (WebP, ≤150 KB each).
- **MVP batch**: 25–30 exercises covering the entire `core-kit-exercises.json` list above (kettlebell, rings, bodyweight, hand-presses, skipping rope, stretching).
- Fallback: a themed placeholder card with exercise name (so the app is never broken).
- Regenerating an image never touches the DB — the DB just stores `image_start`/`image_end` keys, and a `useExerciseImage()` hook resolves to asset-or-placeholder.

### 5.6 Data Portability

- **Export**: Settings → "Export data" writes a single JSON (schema v1) to the share sheet.
- **Import** is post-MVP; the export format is the contract for it.

---

## 6. Architecture

### 6.1 Repo Layout (based on `shadowlist`)

```
shadow-train/
├── app/                        # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx           # Home
│   │   ├── exercises.tsx
│   │   ├── progress.tsx
│   │   └── settings.tsx
│   └── session/[id].tsx        # Logger
├── src/
│   ├── db/                     # expo-sqlite layer
│   │   ├── schema.ts
│   │   ├── migrations.ts
│   │   ├── seed/
│   │   │   └── core-kit-exercises.json
│   │   └── repositories/       # exerciseRepo, sessionRepo, etc.
│   ├── engine/                 # pure progression engine (no React)
│   │   ├── suggest.ts
│   │   └── suggest.test.ts
│   ├── stores/                 # Zustand
│   │   ├── profileStore.ts
│   │   ├── sessionStore.ts
│   │   └── exerciseStore.ts
│   ├── theme/                  # from shadowlist
│   ├── components/
│   └── hooks/
├── assets/exercises/           # AI images
├── scripts/import-exercises.ts
├── docs/
│   ├── image-prompts.md
│   └── spec.md                 # this doc
└── package.json
```

### 6.2 Concurrency Model

- All SQLite writes go through a single write queue in `db/` (a small promise chain).
- UI writes go **memory-first, persist-after**: Zustand updates the store, `db/` flushes to disk in a batched transaction.
- Reads for the logger come from the store, not SQLite, after hydration.

### 6.3 Testing

- **Vitest/Jest** for `engine/suggest.ts` — pure functions, near-100% coverage (including fixed-KB step-loading, rings/bodyweight progression, timed sets, and standard plate increments).
- **React Native Testing Library** for the logger screen's prefill + checkoff behavior.
- **Manual** for visuals and PWA feel.
- No E2E in MVP.

---

## 7. Milestones (ordered, agent-sized)

Each milestone = **one issue**, one coding-agent session, one PR.

| # | Milestone | Acceptance Criteria | Est. |
| :--- | :--- | :--- | :--- |
| **M0** | Scaffold from `shadowlist` | Repo builds, tabs render, theme hook works, grocery logic removed | S |
| **M1** | SQLite layer + schema | Schema created on first run, migrations scaffold in place, repo helpers tested | S |
| **M2** | Import exercises & equipment filter | `import-exercises.ts` seeds DB (core kit + public dataset); picker filters by `availableEquipment` | S |
| **M3** | Logger screen (no suggestions) | Add exercise, log sets (reps/weight or duration), finish session; session persists & resumes | M |
| **M4** | Last-done prefill | Reopening an exercise pre-fills last session's working sets | S |
| **M5** | Progression engine | `suggestNext()` implemented (fixed-KB/rings step-loading + timed + plate increments), unit tests green, suggestion chip shown on Logger & Detail | M |
| **M6** | Progress view | Volume/week chart + PR list | S |
| **M7** | Settings + export | Profile edits (equipment toggles, fixed KB weight, goal, units) persist; export JSON produces valid file | S |
| **M8** | First image batch | 25–30 core-kit exercises have start/end images; placeholder fallback works | M |
| **M9** | Distribution build | EAS internal build installs on device; session survives app restart | S |

### 7.1 Build Phases

1. **Phase 1: Foundation & Core Kit Data (`M0` → `M2`) — *Start Here***
   - *Goal*: Bootable app shell, SQLite database online, and personal equipment kit seeded and browsable.
   - **M0 (Scaffold)**: Port Expo SDK 56 + TypeScript + Jest + VitePress + `src/theme/` from `../shadowlist`; strip grocery logic; wire up **Home**, **Exercises**, **Progress**, **Settings**, and **Session Logger** routes.
   - **M1 (SQLite & Profile Store)**: Set up `expo-sqlite` v1 schema, migration runner, and single write queue (`src/db/`); configure `profileStore.ts` defaulting to `['kettlebell', 'rings', 'bodyweight', 'hand_gripper', 'jump_rope', 'stretching']` + `fixedKettlebellWeight`.
   - **M2 (Exercise Seed & Equipment Picker)**: Seed `core-kit-exercises.json` + public dataset; build the **Exercise Picker** pre-filtered by `availableEquipment`.
2. **Phase 2: Playable Logger & Pavel Engine (`M3` → `M5`)**
   - *Goal*: Log real kettlebell, rings, bodyweight, grip, rope, and stretching sessions with deterministic progression.
   - **M3 (Session Logger & Rest Timer)**: Start/resume session, add exercises, log sets (`reps`/`weight` or `duration_sec`), check off sets, auto-start haptic rest timer, finish session.
   - **M4 ("Last Done" Pre-fill)**: Query last completed session's working sets per exercise and pre-fill logger rows.
   - **M5 (Progression Engine)**: Implement `suggestNext()` in `src/engine/suggest.ts` with ~100% test coverage (Pavel fixed-KB & rings/bodyweight step-loading, timed `+15s` progression, and standard plate increments) + reason chips on Logger & Detail.
3. **Phase 3: Analytics & Control Deck (`M6` → `M7`)**
   - *Goal*: Track weekly volume/PRs and customize equipment/profile on the fly.
   - **M6 (Progress View)**: Weekly volume/time chart + Personal Records (PR) list.
   - **M7 (Settings & Data Export)**: Equipment toggles, fixed KB weight setting, `kg`/`lb`, goal, theme selector, and full JSON export.
4. **Phase 4: Visual Chrome & Field Deployment (`M8` → `M9`)**
   - *Goal*: Custom cyberpunk start/end pose illustrations for the core kit and standalone installable APK.
   - **M8 (Core Kit AI Image Batch)**: Draft `docs/image-prompts.md` and bundle WebP `start`/`end` pose images for the 25–30 core-kit exercises + themed placeholder fallback.
   - **M9 (EAS Distribution Build)**: Configure `eas.json` & GitHub Actions release workflow and build the installable Android APK.

**Definition of done (every milestone):**
- `tsc --noEmit` clean.
- `jest` green.
- Diff ≤ ~400 lines net (split if bigger).
- Acceptance criteria checked by *you* on device, not just the agent.

---

## 8. Agent Operating Model

**Primary builder:** repo-local coding agent.

Rules for the agent (paste at top of every task):
1. Read `docs/spec.md` and the `shadowlist` repo first.
2. Only implement the milestone in this issue; no unrelated refactors.
3. Run `tsc --noEmit` and `jest` before returning.
4. Produce a diff summary + the test output.
5. Do not modify `engine/` tests to make them pass; fix the implementation instead.

**Hermes (optional, bounded):**
- Planning: break M3 or M5 into sub-issues.
- Review: read a finished diff and flag risks.
- Research: "best `expo-sqlite` patterns for batched writes".
- **Never** edit the repo while the coding agent is active.
- **Never** merge.

**You:** decide scope, review every diff, tap through every acceptance criterion on device.

---

## 9. Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **Scope creep** (progress analytics, sync, wearables) | Non-goals list in §1 is the contract. Anything new → post-MVP backlog. |
| **Image style drift** | Anchored template in `docs/image-prompts.md`; reject any image that deviates; regenerate not reprompt-inline. |
| **Progression edge cases** (fixed KB, rings, bodyweight, timed holds, cables, maxed machines) | §5.3 explicit handling + unit tests for each case. |
| **SQLite schema churn** | `migrations.ts` from day one (even with one migration); every schema change gets a migration. |
| **Expo SDK upgrades break the build** | Pin SDK in `app.json`; upgrade only at milestone boundaries, never mid-milestone. |
| **Agent invents architecture** | Every milestone issue starts with "follow §X of docs/spec.md; do not add new dependencies without approval." |
| **Hermes/coding-agent conflict** | Only one editor at a time; Hermes read-only on the repo. |

---

## 10. Post-MVP Backlog (explicitly not now)

- **LLM decision layer** — schema-validated `suggestNext` for full *session plans*, not per-exercise deltas. Keep the deterministic engine as the fallback / explainer.
- **Cloud sync** — self-hosted per `Workout.cool` pattern, only if the app ever escapes personal use.
- **PWA wrapper** — if you want "installable on desktop" without EAS.
- **Wearable / HealthKit** — needs a dev build; schedule only after M9.
- **Rust analytics core** — `shadowlink-rust-core`-style extraction of engine for cross-surface reuse. Not before you have two surfaces.
- **Program templates** (Simple & Sinister, Enter the Kettlebell ROP, 5/3/1, GZCLP, etc.) — layered on top of the existing session model.
- **Import** — pairs with §5.6 export format.

---

## 11. Immediate Next Actions

1. Scaffold `shadow-train` from `shadowlist` (M0).
2. Open issues M0–M9 with the acceptance criteria from §7.
3. Hand M0 to the coding agent.
4. Start drafting `docs/image-prompts.md` for the core kit (`kettlebell`, `rings`, `bodyweight`, `hand_gripper`, `jump_rope`, `stretching`) while M0–M2 land.
