# Shadow Train — MVP Plan & Spec

One-liner: A free, private, offline-first workout logger for one user (then whoever finds it), built on your `shadowlist` architecture, with a deterministic 80/20 progression engine (including fixed-kettlebell and calisthenics/rings step-loading), plan-aware streaks & achievements, and a consistent AI-generated visual theme.

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

| Area              | Decision                                                                                                                                                                                                    |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform          | React Native + **Expo SDK** (managed workflow), built on the `shadowlist` scaffold                                                                                                                          |
| State             | **Zustand** stores (mirror `shadowlist`)                                                                                                                                                                    |
| Persistence       | **expo-sqlite** for structured data (sessions/entries/sets/exercises); `AsyncStorage` only for small prefs (theme, units, profile) via `zustand/middleware/persist`                                         |
| Theming           | Reuse `shadowlist`'s `themes.ts` + `useTheme` + `useThemeStyles`; new shadow-themed palette                                                                                                                 |
| Exercise data     | Seed from a public dataset (e.g. `wrkout/exercises.json`) + curated `core-kit-exercises.json` (fixed kettlebell, gymnastic rings, hand-presses, skipping rope, stretching), imported to SQLite at first run |
| Progression logic | Deterministic rule engine (pure TS), **not** an LLM, **not** a proprietary algo                                                                                                                             |
| Images            | AI-generated, anchored prompt template, start/end pose per exercise, bundled as local assets                                                                                                                |
| Distribution      | EAS Build → internal install (APK / TestFlight) for personal use; optional Expo Go for dev                                                                                                                  |
| Cost target       | $0 recurring; only cost is dev time + optional image-gen API                                                                                                                                                |
| Build agent       | **Repo-local coding agent** builds the MVP, one small issue at a time                                                                                                                                       |
| Hermes harness    | Optional, **bounded side-tasks only** (planning, review, research). Never concurrent editor                                                                                                                 |
| Sync / auth       | Explicitly deferred (post-MVP)                                                                                                                                                                              |
| Naming            | **Shadow Train** (`shadow-train` / `shadowtrain`)                                                                                                                                                           |

---

## 3. Locked Product Defaults (Formerly Open Decisions)

| Decision                           | Locked Default                                                                                                                                                                                                        | Why                                                                                       |
| :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| **Units**                          | `kg` primary, `lb` toggle in settings                                                                                                                                                                                 | Most datasets/kettlebells/plates default to kg                                            |
| **Equipment selection ("My Kit")** | Multi-select in Profile/Settings; defaults to `['kettlebell', 'rings', 'bodyweight', 'hand_gripper', 'jump_rope', 'stretching']` with other equipment (`dumbbell`, `barbell`, `bands`, `cable`, `machine`) toggleable | Tailored to minimalist core kit out of the box, flexible for any gym                      |
| **Fixed kettlebell mode**          | `fixedKettlebellWeight` setting in Profile (e.g. 16 kg / 24 kg); progressions use rep & set step-loading instead of micro-weight jumps                                                                                | Kettlebells are fixed-weight; progression happens via reps, sets, ladders, and variations |
| **Split model**                    | Free-form sessions ("Push A", "KB & Rings", "Full Body", custom name) — no enforced split                                                                                                                             | Simpler than program templates; matches "80/20" ethos                                     |
| **Rep-range default**              | Strength `3–5`, Hypertrophy `8–12`, Endurance `15–20` (per-profile override)                                                                                                                                          | Covers 90% of use                                                                         |
| **Increments**                     | Fixed KB / Rings / Bodyweight / Hand Gripper → `+1 rep` then `+1 set` / variation; Timed (`jump_rope`, `stretching`, isometric holds) → `+15s`; Barbell `2.5 kg`, Dumbbell `2 kg`, Machine `5 kg`, Cable `2.5 kg`     | Matches both minimalist fixed-weight training and standard gym reality                    |
| **Deload trigger**                 | Any working set `< lower bound` of rep range → suggest `−10%` weight (or `−1 set` / reset to `repRange.min` for fixed-weight / bodyweight)                                                                            | Standard novice-safe rule                                                                 |
| **RPE tracking**                   | Optional field, off by default                                                                                                                                                                                        | Keeps MVP logging fast                                                                    |
| **Warmup sets**                    | Markable flag, excluded from progression math                                                                                                                                                                         | Avoids skewed suggestions                                                                 |
| **Rest timer**                     | Built-in countdown with haptic at end (default per-exercise seconds, overridable)                                                                                                                                     | Universal training need                                                                   |
| **Progress charts**                | Volume/week (plus reps/time summary) and PR list (no fancy analytics)                                                                                                                                                 | Enough to feel "real"                                                                     |
| **Image source**                   | One anchored character + one anchored gym background + fixed lighting; two poses per exercise                                                                                                                         | Consistency matters more than realism                                                     |
| **Image coverage MVP**             | Bundle ~20–30 exercises with images focused on the default personal kit (`kettlebell`, `rings`, `bodyweight`, `hand_gripper`, `jump_rope`, `stretching`); rest fall back to a placeholder card                        | Ship faster, 100% visual coverage for core daily movements                                |
| **License**                        | MIT for code; attribution file for dataset                                                                                                                                                                            | Keeps it honest & shareable                                                               |
| **Repo**                           | `shadow-train` (`shadowtrain`) scaffolded from `shadowlist`                                                                                                                                                           | Clean history                                                                             |

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
  repRange: { min: number; max: number }; // derived from goal, overridable
  increments: Record<string, number>; // per-equipment override (0 = fixed weight / step-loading)
  availableEquipment: Equipment[]; // defaults to ['kettlebell', 'rings', 'bodyweight', 'hand_gripper', 'jump_rope', 'stretching']
  fixedKettlebellWeight?: number; // e.g. 16 or 24 kg; triggers fixed-weight rep/set step-loading
  activeTrainerId?: 'orc-merc' | 'human-decker' | 'human-soldier' | 'elf-mage' | 'elf-wraith'; // Active Shadow Trainer (starts with 'orc-merc')
  unlockedTrainerIds?: string[]; // Starts with ['orc-merc']; unlock others with Creds (¥) / Gremlin Coins
  creds?: number; // Earned from daily/weekly missions, streaks, and progression achievements
  activeProgramId?: string; // Selected trainer split/program template
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

| Screen               | Purpose                                                                                                                                         | Must-have                                                                                                                           |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **Home**             | Active Trainer & Goal **Workout Plan Blueprint** (`1-Tap Start Planned Workout`), start blank session, resume in-progress, edit/delete recent   | Trainer/Goal Workout Plan card (laid-out exercises + targets), New/Planned session buttons, resume banner, tappable last 5 sessions |
| **Session (Logger)** | Add exercises, log/edit sets, see last-done prefill, rest timer, **Back / Cancel / Delete Session**                                             | Per-exercise card with sets, prefill, +set, checkoff, timer, **← Back**, **Cancel/Delete Session**, and **Finish/Save** controls    |
| **Exercise Picker**  | Search/filter exercises                                                                                                                         | Defaults to `profile.availableEquipment` filter (with quick "Show all" toggle), text search, muscle filter, equipment filter        |
| **Exercise Detail**  | Show images, instructions, history, current suggestion                                                                                          | Start/end images, "Suggested next" banner                                                                                           |
| **Progress**         | Telemetry & statistics across `Last Workout`, `Week`, `Month` (with `◀/▶` history scrubber), visual intensity heatmap & volume bars, PR list    | Window selector (`Last Workout` / `Week` / `Month`), period navigation, intensity heatmap + volume bars, PR table                   |
| **Trainers**         | Dedicated **Trainer Roster & Dossier Page** for the 5 Shadow Trainers (1 sharp HD render each, lore, skills, signature split, Creds `¥` unlock) | 5 Trainer cards/dossiers (`Orc Merc` starter + 4 Cred-unlockable trainers), active trainer & split selection                        |
| **Settings**         | Profile, Trainer & Split selector, equipment toggles, fixed KB weight, units, theme, backup & restore                                           | All of `Profile`, trainer & split selector, equipment toggles, 1-file JSON export/import (`meta.version`) + CSV session log export  |

### 5.2 Core Interaction Flow (Happy Path)

1. Home → **Start Planned Workout** (or **New Blank Session**):
   - **Adaptive Trainer & Goal Workout Plan Blueprint (`src/engine/plan.ts`)**: Home displays the laid-out exercise blueprint tailored to the active **Shadow Trainer** (`Tusk`, `Valerie`, `Vanguard`, `Lyra`, `Wraith`), the operator's **Goal** (`strength` `3–5`, `hypertrophy` `8–12`, `endurance` `15–20`), and **Available Equipment** — showing each planned movement and its next suggested target (`suggestNext()`):
     - **Refresh / Cycle Next Session (`↻ Refresh / Swap Plan`)**: A 1-tap `↻ REFRESH PLAN` button cycles through alternate workout variants (`Workout A` / `Workout B` / `Conditioning` / `Mobility Recovery`), and operators can freely add/swap/remove exercises once launched.
     - **Adapts to Previous Sessions**: Rotates movement patterns relative to the last completed session (e.g., alternating push/squat vs. pull/hinge/core) and advances 3-level ladder tiers (`beginner` → `mid` → `advanced`) when `5 × repRange.max` is mastered.
     - **Adapts to Earlier Intensity & Fatigue**: If the last session within 24–48h was high-intensity (`intensity === 3` / 13+ working sets), automatically proposes a lower-fatigue or active recovery/mobility variant (`"High load logged recently — recovery/balanced split"`).
     - **Adapts to Missed Sessions (Ramp-Back)**: If `> 5 days` have elapsed since the last workout, scales the planned sets into a **Ramp-Back / Re-Entry Session** (`"X days since last session — ramp-back volume"`) to prevent cold overreaching.
   - Tapping **Start Planned Workout** launches a session pre-populated with all planned exercises and sets ready to check off; tapping **+ Start Blank Session** starts an empty custom session.
2. Tap **+ Add Exercise** → Picker (pre-filtered to your selected equipment: Kettlebell, Rings, Bodyweight, Hand Gripper, Skipping Rope, Stretching) → select.
3. On add, app runs `suggestNext()` and pre-fills sets:
   - **No history** → default weight (`fixedKettlebellWeight` for KB, blank/0 for bodyweight/rings) and `repRange.min` (for step-loading) or `repRange.max` (for linear plate loading), or default `durationSec` (e.g. `60s` for stretching/holds, `180s` for skipping rope).
   - **History** → last weight/reps/duration + a suggested adjustment with a one-line reason chip.
4. User logs sets; each row checkoffs individually.
5. Rest timer auto-starts on checkoff (default per exercise).
6. **Finish Session** → writes `finished_at`, returns Home.
7. **Back & Cancel / Discard**: While in the Session Logger, **← Back** returns to Home (keeping the active session resumable), and **Cancel / Discard Session** deletes the draft session (`deleteSession()`) and returns Home.
8. **Edit & Delete Past Sessions**: Tapping any completed session on Home opens it in the Session Logger/Editor screen where sets, weights, reps, and session name can be edited and saved (`Save Changes`), or the session can be permanently removed (`Delete Session`).
9. If the app closes mid-session, the session is resumable (a session with `finished_at IS NULL`).

### 5.3 Deterministic Progression Engine

Pure function, unit-tested, no I/O.

```ts
type Suggestion =
  | { action: 'first_time'; reps?: number; weight?: number; durationSec?: number; sets?: number }
  | {
      action: 'increase';
      reps?: number;
      weight?: number;
      durationSec?: number;
      sets?: number;
      delta: number;
      reason: string;
    }
  | {
      action: 'repeat';
      reps?: number;
      weight?: number;
      durationSec?: number;
      sets?: number;
      reason: string;
    }
  | {
      action: 'deload';
      reps?: number;
      weight?: number;
      durationSec?: number;
      sets?: number;
      reason: string;
    };

function suggestNext(
  history: SetRecord[] | null, // last session's working sets, ordered
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
   - If all working sets completed target duration: `increase` `durationSec` by `+15s` (reason: _"All rounds completed — add 15s"_).
   - Otherwise: `repeat` same duration.
3. **Fixed-Weight & Calisthenics Step-Loading** (`rings`, `bodyweight`, `hand_gripper`, or `kettlebell` with `fixedKettlebellWeight` / `increment === 0`):
   - **Under-logged (<2 working sets)** → `repeat` same sets & reps.
   - **Any working set `reps < repRange.min`** → `deload`: keep weight, reset target reps to `repRange.min` (and drop 1 set if `sets > 3`).
   - **Not all working sets reached `repRange.max`** → `increase` target by **+1 rep** at the same weight (capped at `repRange.max`), reason: _"Step-loading: +1 rep per set toward top of range"_.
   - **All working sets `reps >= repRange.max` and `workingSets.length < 5`** → `increase` by **+1 working set** at `repRange.min`–`repRange.max` (volume ladder / step-loading), reason: _"Hit top of rep range across sets — add 1 working set"_.
   - **All 5 working sets `reps >= repRange.max`** → `increase` variation/tier graduation chip (keep weight & 5×`repRange.max`), reason: _"5×max mastered — advance to next tier variation (`nextProgressionId`) or slow eccentric (3-1-3)"_.
4. **Standard Adjustable-Weight Progression** (`barbell`, `dumbbell`, `machine`, `cable`, or `kettlebell` with non-zero increment):
   - **<3 working sets logged** → `repeat` with reason _"Under 3 working sets logged last time"_.
   - **All working sets `reps >= repRange.max`** → `increase` `weight` by equipment increment; `reps = repRange.max`.
   - **Any working set `reps < repRange.min`** → `deload` `weight` by 10% (rounded _down_ to the increment).
   - **Otherwise** → `repeat` same weight & reps.

**Edge cases handled explicitly:**

- Warmups (`isWarmup = true`) excluded from all progression math.
- Cable/machine: use declared increment; skip increase if user marked "at max".
- The UI shows the suggestion as an **editable pre-fill** — never auto-applies without the user's checkoff.

### 5.4 Exercise Library Ingestion & KISS 3-Level Progression Ladders

- `src/db/seed/core-kit-exercises.json` defines the curated core movements for the default personal kit, organized into **KISS 3-Level Progression Ladders (`tier: 'beginner' | 'mid' | 'advanced'` + `nextProgressionId`)** inspired by Paul Wade (_Convict Conditioning_) calisthenics progressions and 3-tier kettlebell/rings mastery:
  - **Bodyweight (Paul Wade 3-Level Progressions)**:
    - _Push Chain_: `Push-Up` (`beginner`) → `Diamond Push-Up` (`mid`) → `Pike Push-Up` (`advanced`)
    - _Squat Chain_: `Bodyweight Squat` (`beginner`) → `Pistol Squat (Assisted/Full)` (`advanced`)
    - _Core / Leg Raise Chain_: `Plank` (`beginner`) → `Hollow Body Hold` (`mid`) → `Hanging / Floor Leg Raise` (`advanced`)
  - **Kettlebell (3-Level Ladders)**:
    - _Ballistic Hinge Chain_: `Two-Hand Kettlebell Swing` (`beginner`) → `One-Arm Kettlebell Swing` (`mid`) → `Kettlebell Snatch` (`advanced`)
    - _Overhead & Grind Chain_: `Kettlebell Halo` (`beginner`) → `Kettlebell Clean & Military Press` (`mid`) → `Turkish Get-Up` (`advanced`)
    - _Squat & Pull Chain_: `Kettlebell Goblet Squat` (`beginner`) → `Kettlebell Front Rack Squat` (`mid`); `One-Arm Kettlebell Row` (`beginner`)
  - **Gymnastic Rings (3-Level Ladders)**:
    - _Push Chain_: `Ring Support Hold` (`beginner`) → `Ring Push-Up` (`mid`) → `Ring Dip` (`advanced`)
    - _Pull Chain_: `Ring Row` (`beginner`) → `Ring Face Pull` (`mid`) → `Ring Pull-Up / Chin-Up` (`advanced`)
    - _Core Chain_: `Ring Rollout / Fallout` (`mid`) → `Ring L-Sit Hold` (`advanced`)
  - **Hand-Presses (`hand_gripper` 3-Level Ladder)**: `Hand Gripper Crush Rep` (`beginner`) → `Fingertip / Pinch Grip Press` (`mid`) → `Hand Gripper Overcrush / Isometric Hold` (`advanced`)
  - **Skipping Rope (`jump_rope` 3-Level Ladder)**: `Jump Rope Basic Bounce` (`beginner`) → `Jump Rope Boxer Step` (`mid`) → `Jump Rope High Knees / Double-Under Practice` (`advanced`)
  - **Stretching (`stretching` 3-Level Mobility)**: `Pike Hamstring Relaxed Stretch` / `90/90 Hip Switch & Hold` (`beginner`) → `Deep Squat Pry` / `Couch Stretch` (`mid`) → `Cossack Squat Hold` / `Thoracic Bridge / Dead Hang Decompression` (`advanced`)
- One-off script `scripts/import-exercises.ts` merges the public JSON dataset with `core-kit-exercises.json`, maps fields to the `exercises` table, and seeds SQLite.
- Run at app bootstrap **only if** `exercises` table is empty (idempotent).
- All exercise IDs are stable, so a future re-import is additive, not destructive.

### 5.5 The 5 Unlockable Shadow Trainers & Image Pipeline

Instead of generic avatars or duplicate icon sets, ShadowTrain features **5 distinct Shadowrun Trainers** across the 3 metatypes (`Orc`, `Human`, `Elf`). Every operator starts with the **Orc Heavy Merc (`orc-merc`)** unlocked by default and earns **Creds (`¥`) / Gremlin Coins** from daily/weekly missions, streaks, and 3-level progression achievements (`§5.7`) to unlock the remaining 4 trainers on the **Trainer Dossier Page**:

| ID              | Name & Callsign            | Race / Class                                          | Unlock Cost         | Specialty & Training Style                                                                 | Minimal Lore / Background                                                                                                                                              |
| :-------------- | :------------------------- | :---------------------------------------------------- | :------------------ | :----------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orc-merc`      | **Kaelen "Tusk" Vorga**    | **Orc Male** — _Bodybuilder & Heavy Weapons Merc_     | **Starter (`0 ¥`)** | **Heavy Iron & Raw Mass** (`Kettlebell` Power, `Barbell`/`Dumbbell` Hypertrophy, Grip)     | Former corporate heavy-weapons specialist turned underground pit boss. Chrome-plated left arm, orange ballistic visor, zero tolerance for half-reps.                   |
| `human-decker`  | **Valerie "Glitch" Vance** | **Human Female** — _Attractive Elite Shadow-Decker_   | **`250 ¥` Creds**   | **High-Density Kit & Neural Conditioning** (`Kettlebell` + `Jump Rope` + `Core` Intervals) | 28-year-old rogue matrix architect who treats physical conditioning like overclocking a cyberdeck: high-output intervals, razor-sharp form, and zero wasted cycles.    |
| `human-soldier` | **Marcus "Vanguard" Kade** | **Human Male** — _Cyber-Modded Universal Soldier_     | **`500 ¥` Creds**   | **Tactical Hybrid Split (`Workout A / B`)** (`Kettlebell` + `Bodyweight` + `Barbell`)      | Augmented black-ops operative with subdermal armor and myomer muscle lacing. Runs relentless, balanced push/pull/hinge/squat tactical splits built for field survival. |
| `elf-mage`      | **Lyra "Aether" Vael**     | **Elf Female** — _Attractive Hermetic Mage & Adept_   | **`750 ¥` Creds**   | **Mobility Flow, Get-Ups & Isometric Control** (`Stretching`, `Kettlebell` TGU, Holds)     | Neon-lit astral adept who channels mana through structural alignment, deep joint decompression, slow-eccentric control, and active recovery shields.                   |
| `elf-wraith`    | **Soren "Wraith" Kael**    | **Elf Male** — _Wraith Assassin & Calisthenics/Rings_ | **`1,000 ¥` Creds** | **Convict Calisthenics & Gymnastic Rings Mastery** (`Rings`, `Bodyweight` Lv1–3, `Rope`)   | High-altitude corporate infiltrator and silent assassin. Zero clanking iron — masters pure leverage (`Ring L-Sits`, `Muscle-Ups`, `Pistol Squats`) in dead silence.    |

- **Trainer Dossier Page**:
  - Dedicated view showcasing **1 sharp HD portrait (`1024×1024` WebP)** per trainer (`assets/trainers/<trainer_id>.webp`), callsign, class, skill ratings (`Strength`, `Conditioning`, `Mobility`, `Calisthenics`, `Tech`), backstory, signature split program, and **Unlock (`¥`) / Set Active** action.
- **Exercise Showcases & Specialist Pose Mapping (No Duplicate 5× Icon Sets Needed)**:
  - Each exercise showcase (`assets/exercises/<exercise_id>/{start,end}.webp`) is demonstrated by the **Trainer whose specialty matches that movement** (e.g., _Tusk_ showcases heavy KB Swings, Presses, Goblet Squats, Grippers & Barbell lifts; _Wraith_ showcases Gymnastic Rings & Convict Calisthenics progressions; _Lyra_ showcases Stretching, Mobility & Turkish Get-Ups; _Valerie_ showcases Jump Rope & Core; _Vanguard_ showcases Tactical Hybrid movements).
- **Anchored Image Prompt Template** (kept in `docs/image-prompts.md`):

  ```
  Character: <Trainer HD description: Tusk (Orc Merc) | Valerie (Human Decker) | Vanguard (Human Soldier) | Lyra (Elf Mage) | Wraith (Elf Assassin)>
  Environment: <dark Æ CYBERNETICS gym / rooftop background>, <cyan (#00f0ff) & orange (#ff8c00) neon rim-lighting>
  Pose: <portrait | start | end> position of <exercise name>
  Style: <fixed render style, "sharp HD cyberpunk illustration, matte charcoal #14101c background, cyan/orange neon rim-light">
  ```

- Fallback: a themed cyberpunk placeholder card with the specialist trainer callsign and exercise name (so the app is never broken).

### 5.6 Data Portability (1-File JSON Backup/Restore + CSV Session Log)

- **Single-File Everything Bundle (`.json`)**: Both **Export** and **Import** operate on a single self-contained `.json` file (`shadowtrain-backup-YYYY-MM-DD.json`) containing all user state (`profile` + preferences, custom `exercises`, `sessions` with nested `entries` and `sets`, and gamification/achievement state).
- **Mandatory `meta` Version Envelope**:
  ```json
  {
    "meta": {
      "format": "shadowtrain-backup",
      "version": 1,
      "dbSchemaVersion": 1,
      "appVersion": "0.1.1",
      "exportedAt": "2026-11-08T19:56:00.000Z"
    },
    "profile": { ... },
    "customExercises": [ ... ],
    "sessions": [ ... ]
  }
  ```
- **JSON Export**: Settings → **"Export Backup (.json)"** serializes the full state with the `meta` header and opens the OS share/save sheet.
- **JSON Import**: Settings → **"Import Backup (.json)"** selects a `.json` file, validates `meta.format === 'shadowtrain-backup'` and `meta.version` (running any format migration if needed), and restores `profile` + SQLite workout history inside a single serialized transaction.
- **CSV Session Log Export (`.csv`)**: Settings → **"Export Sessions (.csv)"** exports a flat spreadsheet of all logged sets (`session_id,session_name,started_at,finished_at,exercise_id,exercise_name,category,tier,set_num,weight,reps,duration_sec,is_warmup,completed_at`) for analysis in Excel/LibreOffice/Pandas.

### 5.7 Gamification: Creds (`¥`), Unlockable Trainers, Streaks & Achievements (`M10`)

Duolingo-inspired motivation combined with a Shadowrun **Creds (`¥`) / Gremlin Coin** progression loop — rewarding daily/weekly missions, streaks, and 3-level progression mastery (`beginner` → `mid` → `advanced`) to unlock all **5 Shadow Trainers** (`§5.5`):

- **Creds (`¥`) / Gremlin Coin Economy & Trainer Unlocks**:
  - **Starter Trainer**: Operators start with **Kaelen "Tusk" Vorga (`orc-merc`)** unlocked (`0 ¥`).
  - **Earning Creds (`¥`)**:
    - **Session Completion**: `+25 ¥` per finished workout session.
    - **Daily / Weekly Missions**: `+15 ¥` to `+50 ¥` for completing mission contracts (e.g., _"Complete 12+ working sets"_, _"Apply a `suggestNext()` progression"_, _"Log a mobility or jump-rope session"_).
    - **Weekly Target Streak Bonus**: `+100 ¥` each week you hit your `weeklyTargetDays`.
    - **Achievement Unlocks**: `+100 ¥` (Short-Term / Level 1), `+250 ¥` (Mid-Term / Level 2), `+500 ¥` (Long-Term / Level 3 Mastery).
  - **Spending Creds (`¥`)**: Unlock **Valerie "Glitch" Vance (`250 ¥`)**, **Marcus "Vanguard" Kade (`500 ¥`)**, **Lyra "Aether" Vael (`750 ¥`)**, and **Soren "Wraith" Kael (`1,000 ¥`)** — along with their signature training splits and coaching style.
- **Plan-Aware Streaks (Low-Pressure, Recovery-Safe)**:
  - **Weekly Target Rhythm**: Users set a realistic weekly target in Profile (e.g., `weeklyTargetDays = 3` or `4` sessions/week). Hitting the weekly target advances the weekly streak and keeps the flame/cyber-link active.
  - **Active Recovery Counts**: Logging a short `stretching` or `jump_rope` mobility session counts as an active check-in day.
  - **Rest-Day Shield (Streak Freeze)**: Built-in weekly rest buffer so planned off-days or a single missed window never wipe out hard-earned momentum.
- **Tiered Achievements (Short / Mid / Long-Term + 3-Level Progression Mastery)**:
  - **Short-Term (First Steps & Beginner Tier — Level 1)**:
    - _First Jack-In_: Finish your 1st logged workout session.
    - _Kit Explorer_: Log movements across 3+ core-kit equipment types.
    - _Tier 1 Graduate (Beginner Mastery)_: Master `5 × repRange.max` on any `beginner`-tier bodyweight, kettlebell, or ring movement and unlock its `mid`-tier variation.
    - _Week One Locked_: Hit your weekly training target for 1 full week.
  - **Mid-Term (Consistency & Mid Tier — Level 2)**:
    - _4-Week Rhythm_: Hit your weekly target streak for 4 consecutive weeks.
    - _Quarter-Century Runner_: Complete 25 logged sessions.
    - _Tier 2 Specialist (Mid Mastery)_: Master `5 × repRange.max` on a `mid`-tier movement (e.g. `Diamond Push-Up`, `One-Arm Kettlebell Swing`, `Ring Push-Up`) to unlock `advanced` tier.
    - _PR Hunter_: Unlock 10 Personal Records across exercises.
  - **Long-Term (Shadow Legend & Advanced Tier — Level 3)**:
    - _12-Week & 52-Week Iron Link_: Sustain your weekly streak for a full quarter and full year.
    - _Centurion Deck_: Complete 100 logged sessions.
    - _Tier 3 Master (Advanced Mastery)_: Master `5 × repRange.max` (or target hold duration) on an `advanced`-tier movement (`Pistol Squat`, `Pike Push-Up`, `Turkish Get-Up`, `Kettlebell Snatch`, `Ring Dip`, `Ring L-Sit Hold`) across the core kit.

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

| #       | Milestone                                   | Acceptance Criteria                                                                                                                                | Est. |
| :------ | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------- | :--- |
| **M0**  | Scaffold from `shadowlist`                  | Repo builds, tabs render, theme hook works, grocery logic removed                                                                                  | S    |
| **M1**  | SQLite layer + schema                       | Schema created on first run, migrations scaffold in place, repo helpers tested                                                                     | S    |
| **M2**  | Import exercises & equipment filter         | `import-exercises.ts` seeds DB (core kit + public dataset); picker filters by `availableEquipment`                                                 | S    |
| **M3**  | Logger screen (no suggestions)              | Add exercise, log sets (reps/weight or duration), finish session; session persists & resumes                                                       | M    |
| **M4**  | Last-done prefill                           | Reopening an exercise pre-fills last session's working sets                                                                                        | S    |
| **M5**  | Progression engine                          | `suggestNext()` implemented (fixed-KB/rings step-loading + timed + plate increments), unit tests green, suggestion chip shown on Logger & Detail   | M    |
| **M6**  | Progress & Statistics view                  | Time-window selector (`Last Workout` / `Week` / `Month`) + `◀/▶` history navigation, visual intensity heatmap & volume chart, PR list              | M    |
| **M7**  | Settings, Trainers & I/O                    | Profile edits, 5-Trainer Dossier & Split selector, 1-file JSON export/import (`meta.version: 1`) + CSV session log export                          | M    |
| **M8**  | Trainer HD renders & exercise batch         | 5 sharp HD Trainer portraits (`Orc Merc`, `Decker`, `Soldier`, `Mage`, `Wraith`) + 25–30 core-kit specialist showcase images & fallback            | M    |
| **M9**  | Distribution build                          | EAS internal build installs on device; session survives app restart                                                                                | S    |
| **M10** | Trainer Plans, Edit/Delete, Creds & Streaks | Trainer+Goal Workout Plan blueprint (`Start Planned Workout`), edit/delete past sessions + Logger Back/Cancel, Creds (`¥`) missions & streaks      | M    |
| **M11** | Æ Training Drone & Specialist Unlock Skins  | Generic stock Wireframe Training Drone for base movements; unlocking Trainers dynamically skins exercises with elite Specialist poses & cues       | S    |
| **M12** | Program Templates & Round-Based Timer       | Cult programs (Simple & Sinister, Rite of Passage, Convict Calisthenics) + interval/round-based timer (EMOM/Tabata/Rounds) with extensible catalog | M    |
| **M13** | Visual Overhaul: Seductive Shadow Roster    | High-glam cyberpunk revamp, 5 Trainer editorial dossiers in VitePress + 100% complete START/END WebP exercise frames                               | M    |
| **M14** | Offline Cyberpunk Audio Sound Pack          | Cybernetic voice cues, countdown beeps, interval bells, and coach quips on rest timer expiration                                                   | S    |
| **M15** | Cryptographic Vault & Ledger Integrity      | AsyncStorage Profile persistence, SQLite ledger replay/reconciliation, and HMAC-SHA256 tamper-proof backup checksum                                | S    |

### 7.1 Build Phases

1. **Phase 1: Foundation & Core Kit Data (`M0` → `M2`) — _Start Here_**
   - _Goal_: Bootable app shell, SQLite database online, and personal equipment kit seeded and browsable.
   - **M0 (Scaffold)**: Port Expo SDK 58 + TypeScript + Jest + VitePress + `src/theme/` from `../shadowlist`; strip grocery logic; wire up **Home**, **Exercises**, **Progress**, **Settings**, and **Session Logger** routes.
   - **M1 (SQLite & Profile Store)**: Set up `expo-sqlite` v1 schema, migration runner, and single write queue (`src/db/`); configure `profileStore.ts` defaulting to `['kettlebell', 'rings', 'bodyweight', 'hand_gripper', 'jump_rope', 'stretching']` + `fixedKettlebellWeight`.
   - **M2 (Exercise Seed & Equipment Picker)**: Seed `core-kit-exercises.json` + public dataset; build the **Exercise Picker** pre-filtered by `availableEquipment`.
2. **Phase 2: Playable Logger & Step-Loading Engine (`M3` → `M5`)**
   - _Goal_: Log real kettlebell, rings, bodyweight, grip, rope, and stretching sessions with deterministic progression.
   - **M3 (Session Logger & Rest Timer)**: Start/resume session, add exercises, log sets (`reps`/`weight` or `duration_sec`), check off sets, auto-start haptic rest timer, finish session.
   - **M4 ("Last Done" Pre-fill)**: Query last completed session's working sets per exercise and pre-fill logger rows.
   - **M5 (Progression Engine)**: Implement `suggestNext()` in `src/engine/suggest.ts` with ~100% test coverage (fixed-KB & rings/bodyweight step-loading, timed `+15s` progression, and standard plate increments) + reason chips on Logger & Detail.
3. **Phase 3: Analytics, Control Deck & Gamification (`M6` → `M7`, `M10`)**
   - _Goal_: Track weekly volume/PRs, customize equipment/profile on the fly, and reward short/mid/long-term consistency.
   - **M6 (Progress & Statistics View)**: Time-window selector (`Last Workout`, `Week`, `Month`) with `◀ PREV / NEXT ▶` history scrubber, visual intensity heatmap & volume/time bar chart, equipment breakdown, and Personal Records (PR) list.
   - **M7 (Settings, Trainer Dossiers & Data Import/Export)**: 5-Trainer Roster & Dossier page (`Orc Merc` starter + 4 Cred-unlockable trainers with skills, lore & signature splits), equipment toggles, fixed KB weight setting, `kg`/`lb`, goal, theme selector, single-file JSON backup export & import (`meta.version: 1`), and CSV session log export.
   - **M10 (Adaptive Trainer & Goal Workout Plans + Session Edit/Delete + Creds Economy, Missions & Streaks)**: Adaptive Trainer & Goal Workout Plan engine (`src/engine/plan.ts` — adapts to previous session rotation, recent high intensity/fatigue, and missed-session ramp-back + `↻ Refresh Plan` variant switcher & `Start Planned Workout`), reopen/edit/delete past sessions from Home + `← Back` and `Cancel / Discard` controls on the Session Logger, plus daily/weekly mission contracts, tiered achievements that award Creds (`¥`) / Gremlin Coins to unlock all 5 Trainers, and plan-aware Duolingo-style weekly streak tracker (with rest-day shield) (`src/engine/achievements.ts`).
4. **Phase 4: Visual Chrome & Field Deployment (`M8` → `M9`, `M11`)**
   - _Goal_: Sharp HD renders for each of the 5 Shadow Trainers, specialist start/end pose illustrations for the core kit, stock training drone skins, and standalone installable APK.
   - **M8 (5 Trainer HD Renders & Core Kit Showcase Batch)**: Draft `docs/image-prompts.md`, bundle the 5 sharp `1024×1024` HD Trainer portraits (`Tusk`, `Valerie`, `Vanguard`, `Lyra`, `Wraith`), and bundle WebP `start`/`end` exercise showcase poses demonstrated by each movement's specialist trainer + themed placeholder fallback.
   - **M9 (EAS Distribution Build)**: Configure `eas.json` & GitHub Actions release workflow and build the installable Android APK.
   - **M11 (Æ CYBERNETICS Training Drone & Specialist Skins)**: Add the generic stock Wireframe Training Drone for base movements. Unlocking Shadow Trainers with Creds (¥) dynamically upgrades exercises from stock drone to elite Specialist trainer showcase skins and voice cues.
5. **Phase 5: Cult Programs, Glam Roster & Cyber-Audio (`M12` → `M14`)**
   - _Goal_: Extensible cult workout templates, round/interval-based timers, provocative visual character overhaul, and immersive cyber audio cues.
   - **M12 (Program Templates & Round-Based Timer)**: Layer extensible program templates on top of the session engine:
     - _Simple & Sinister_ (Pavel Tsatsouline: 100 Swings + 10 TGUs, timed tests).
     - _Rite of Passage (ROP)_ (Clean & Press ladders + Snatch cadence).
     - _Convict Calisthenics Progression Trees_ (Step 1 ➔ 10).
     - Configurable Round & Interval Timer in Session Logger: EMOM, Tabata, round count, work/rest interval beepers.
   - **M13 (Visual Overhaul: Seductive Shadow Roster) [COMPLETED]**: High-voltage visual revamp of the female and elven operatives in `assets/trainers/`, `assets/exercises/`, and `docs/trainers/`. Infuse raw cyberpunk allure, form-fitting tactical cyberware, lethal elegance, and provocative aesthetic charisma (Valerie "Glitch", Lyra "Aether", Kaelen "Titan", Marcus "Vanguard", Soren "Wraith", and UNIT-0 Spar-Drone). Includes 100% complete START/END WebP exercise frames for all 14 core movements and full VitePress editorial dossiers.
   - **M14 (Offline Cyberpunk Audio Sound Pack)**: Offline synthesized voice cues, countdown beeps, interval bells, and trainer completion quips when timers expire or sets finish.
   - **M15 (Cryptographic Vault & Ledger Integrity)**: Dual-ledger persistence & anti-tampering:
     - Wire `@react-native-async-storage/async-storage` via `zustand/middleware/persist` to `useProfileStore` so profile and Creds survive app termination.
     - Implement a deterministic ledger replay engine (`src/engine/vault.ts` or `analytics.ts`): reconstruct and reconcile Cred balances directly from the SQLite session ledger and claimed achievement records.
     - Introduce cryptographic payload signatures (HMAC-SHA256 checksum) in `src/engine/portability.ts` backup envelopes (`meta.checksum`) to reject manually edited or forged backup files.
     - Add unit tests for anti-tamper rejection and ledger reconciliation.

**Definition of done (every milestone):**

- `tsc --noEmit` clean.
- `jest` green.
- Diff ≤ ~400 lines net (split if bigger).
- Acceptance criteria checked by _you_ on device, not just the agent.

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

| Risk                                                                                          | Mitigation                                                                                                    |
| :-------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Scope creep** (progress analytics, sync, wearables)                                         | Non-goals list in §1 is the contract. Anything new → post-MVP backlog.                                        |
| **Image style drift**                                                                         | Anchored template in `docs/image-prompts.md`; reject any image that deviates; regenerate not reprompt-inline. |
| **Progression edge cases** (fixed KB, rings, bodyweight, timed holds, cables, maxed machines) | §5.3 explicit handling + unit tests for each case.                                                            |
| **SQLite schema churn**                                                                       | `migrations.ts` from day one (even with one migration); every schema change gets a migration.                 |
| **Expo SDK upgrades break the build**                                                         | Pin SDK in `app.json`; upgrade only at milestone boundaries, never mid-milestone.                             |
| **Agent invents architecture**                                                                | Every milestone issue starts with "follow §X of docs/spec.md; do not add new dependencies without approval."  |
| **Hermes/coding-agent conflict**                                                              | Only one editor at a time; Hermes read-only on the repo.                                                      |

---

## 10. Post-MVP Backlog (explicitly not now)

- **LLM decision layer** — schema-validated `suggestNext` for full _session plans_, not per-exercise deltas. Keep the deterministic engine as the fallback / explainer.
- **Cloud sync** — self-hosted per `Workout.cool` pattern, only if the app ever escapes personal use.
- **PWA wrapper** — if you want "installable on desktop" without EAS.
- **Wearable / HealthKit** — needs a dev build; schedule only after M9.
- **Rust analytics core** — `shadowlink-rust-core`-style extraction of engine for cross-surface reuse. Not before you have two surfaces.
- **Program templates** (Simple & Sinister, Enter the Kettlebell ROP, 5/3/1, GZCLP, etc.) — layered on top of the existing session model.

---

## 11. Immediate Next Actions

1. Scaffold `shadow-train` from `shadowlist` (M0).
2. Open issues M0–M9 with the acceptance criteria from §7.
3. Hand M0 to the coding agent.
4. Start drafting `docs/image-prompts.md` for the core kit (`kettlebell`, `rings`, `bodyweight`, `hand_gripper`, `jump_rope`, `stretching`) while M0–M2 land.
