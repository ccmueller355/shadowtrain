# ShadowTrain

[![CI](https://github.com/ccmueller355/shadowtrain/actions/workflows/ci.yml/badge.svg)](https://github.com/ccmueller355/shadowtrain/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://ccmueller355.github.io/shadowtrain/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Version](https://img.shields.io/badge/version-0.1.1-blue)

A Shadowrun-themed, offline-first workout logger for Android and iOS, built with React Native and Expo.

Engineered on the `shadowlist` deck architecture with a deterministic 80/20 progression engine — first-class support for fixed-kettlebell and calisthenics/gymnastic-ring step-loading, timed sets, standard plate increments, and Duolingo-inspired plan-aware streaks & achievements. Zero cloud, zero accounts, zero recurring cost.

## Features

- **Minimalist Personal Kit Out of the Box** — Defaults to **Fixed Kettlebell**, **Gymnastic Rings**, **Bodyweight**, **Hand Grippers**, **Skipping Rope**, and **Stretching**, with standard gym equipment (`dumbbell`, `barbell`, `bands`, `cable`, `machine`) toggleable anytime
- **Deterministic 80/20 Progression Engine** — Pure TypeScript rule engine (`suggestNext()`):
  - **Fixed-Weight & Calisthenics Step-Loading**: `+1 rep` toward the top of your rep range, then `+1 working set` (up to 5×max), then tempo/variation progression
  - **Timed Sets (`duration_sec`)**: Automatic `+15s` progression for skipping rope, isometric holds, and mobility/stretching
  - **Adjustable Weight**: Equipment-aware linear increments (`+2.5 kg` barbell/cable, `+2 kg` dumbbell, `+5 kg` machine) and automatic `−10%` deload suggestions
- **Plan-Aware Streaks & Tiered Achievements** — Duolingo-inspired weekly consistency streaks (with active recovery check-ins and a built-in rest-day shield) plus short-, mid-, and long-term achievement badges
- **Five Hand-Crafted Shadow Themes** — _Fixer's Notebook_ (dark noir), _Stuffer Shack_ (aged parchment), _Decker's Den_ (synth terminal), _Cyber Blue_ (ocean neon), and _Fiddler's Green_ (CRT phosphor)
- **Fast Pre-Fill & Rest Timer** — Pre-fills "last done" working sets per exercise with a one-line suggestion chip and auto-starts a haptic countdown timer on set checkoff
- **100% On-Device Persistence** — `expo-sqlite` (WAL mode + serialized write queue) for structured workout history and `AsyncStorage` (via Zustand `persist`) for operator profile and preferences
- **Data Portability** — Full schema-versioned JSON export from Settings

## Implementation Status

| Milestone                   | Status  | Description                                                                             |
| :-------------------------- | :------ | :-------------------------------------------------------------------------------------- |
| **M0 - Scaffold**           | Done    | Expo SDK 58 app shell, 5 shadow themes, tab/session routes, VitePress docs, CT & CI     |
| **M1 - SQLite Layer**       | Done    | `expo-sqlite` v1 schema, migrations scaffold, single write queue, repository helpers    |
| **M2 - Exercise Seed**      | Done    | `core-kit-exercises.json` + public dataset import & `availableEquipment` picker filter  |
| **M3 - Session Logger**     | Done    | Add exercise, log sets (`reps`/`weight` or `duration_sec`), checkoff, haptic rest timer |
| **M4 - Last-Done Prefill**  | Next    | Automatic pre-fill from most recent session's working sets per exercise                 |
| **M5 - Progression Engine** | Planned | `suggestNext()` deterministic rules + unit test suite & UI suggestion chips             |
| **M6 - Progress View**      | Planned | Weekly volume/time chart + Personal Records (PR) list                                   |
| **M7 - Settings & Export**  | Planned | Equipment toggles, fixed KB weight, goal/units, and schema v1 JSON export               |
| **M8 - First Image Batch**  | Planned | 25-30 core-kit start/end cyberpunk WebP illustrations + placeholder fallback            |
| **M9 - Distribution Build** | Planned | EAS internal Android APK build & session survival across restarts                       |
| **M10 - Gamification**      | Planned | Plan-aware weekly streaks (with rest-day shield) & short/mid/long-term achievements     |

See [`docs/spec.md`](docs/spec.md) for the complete MVP specification and milestone acceptance criteria.

## Tech Stack

| Layer                | Technology                                                       |
| :------------------- | :--------------------------------------------------------------- |
| Framework            | React Native 0.88 + Expo SDK 58                                  |
| Language             | TypeScript 7 (strict mode)                                       |
| State                | Zustand 5 (`persist` middleware)                                 |
| Persistence          | `expo-sqlite` (workout data) + `AsyncStorage` (profile/theme)    |
| Progression Engine   | Pure TypeScript deterministic rules (`src/engine/suggest.ts`)    |
| Testing              | Jest 30 + `jest-expo` + React Native Testing Library (Unit & CT) |
| Linting & Formatting | ESLint 10 (`@babel/eslint-parser`) + Prettier                    |
| Documentation        | VitePress + Mermaid                                              |
| Security & CI        | Gitleaks + Expo Doctor + GitHub Actions                          |

## Getting Started

### Prerequisites

- Node.js ≥ 22 (managed via [mise](https://mise.jdx.dev/) using `.mise.toml`)
- Expo Go on your phone, or an Android/iOS emulator
- [gitleaks](https://github.com/gitleaks/gitleaks) (optional locally; auto-checked by `scripts/ci-local.sh`)

### Install

```bash
git clone https://github.com/ccmueller355/shadowtrain.git
cd shadowtrain
npm install --legacy-peer-deps
npm run hooks:install   # activates .githooks/pre-commit
```

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` for Android emulator / `i` for iOS simulator.

### Verify & Local CI

```bash
npm run ci            # full local CI: gitleaks + lint + format + tsc + expo-doctor + coverage + docs
npm run ci:quick      # fast loop: gitleaks + lint + format + tsc + coverage
npm run lint          # ESLint static analysis (npm run lint:fix to auto-fix)
npm run format:check  # Prettier format verification (npm run format to write)
npm run test:ct       # run React Native Component Tests (CT)
npm run test:coverage # run unit & CT suite with coverage thresholds (80%+)
npm run typecheck     # TypeScript strict check (tsc --noEmit)
npm run doctor        # Expo SDK health & dependency check (npx expo-doctor)
```

## CI Pipeline

8 gates enforced locally (`npm run ci`) and in GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)):

| Stage                | Gate                                                                                                 |
| :------------------- | :--------------------------------------------------------------------------------------------------- |
| **Secrets**          | `gitleaks detect --source . --verbose --config .gitleaks.toml`                                       |
| **Lint**             | `npm run lint` (ESLint)                                                                              |
| **Format**           | `npm run format:check` (Prettier)                                                                    |
| **Type Check**       | `npx tsc --noEmit` (TypeScript 7 strict mode)                                                        |
| **Expo Config**      | `npx expo config --type introspect`                                                                  |
| **Expo Doctor**      | `npx --yes expo-doctor` (20/20 SDK checks)                                                           |
| **Tests & Coverage** | `npm run test:coverage` (Unit + Component Tests, >=80% global threshold)                             |
| **Docs & Pages**     | `npm run docs:build:full` to deployed to [GitHub Pages](https://ccmueller355.github.io/shadowtrain/) |

## Project Structure

```text
shadowtrain/
├── App.tsx                          # Root component
├── index.ts                         # Entry point
├── app/                             # Screen surfaces
│   ├── (tabs)/
│   │   ├── index.tsx                # Home screen (start/resume session, recent runs)
│   │   ├── exercises.tsx            # Exercise Armory & equipment filter
│   │   ├── progress.tsx             # Telemetry, weekly volume & PRs
│   │   └── settings.tsx             # Deck Settings (themes, profile, kit, export)
│   └── session/
│       └── [id].tsx                 # Active Session Logger
├── src/
│   ├── components/
│   │   └── CyberpunkCard.tsx        # Reusable themed surface card
│   ├── db/                          # SQLite schema, migrations, seed & repositories (M1–M2)
│   ├── engine/                      # Deterministic progression engine (M5)
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Tab bar + Session Logger modal shell
│   ├── stores/
│   │   └── profileStore.ts          # Persisted operator profile & active theme
│   ├── theme/
│   │   ├── cyberpunkTheme.ts        # Default theme export
│   │   ├── themes.ts                # 5 Shadowrun theme definitions
│   │   ├── useTheme.ts              # Active theme hook
│   │   └── useThemeStyles.ts        # Memoized dynamic style generator
│   ├── types/
│   │   └── index.ts                 # Core domain types (Profile, Exercise, Session, SetRecord)
│   └── __tests__/
│       ├── scaffold.test.tsx        # App shell integration tests
│       └── components.ct.test.tsx   # Component Tests (CT) suite
├── scripts/
│   └── ci-local.sh                  # Local CI runner script
├── .githooks/
│   └── pre-commit                   # Pre-commit gate (gitleaks, header check, lint, format, tsc, jest)
├── docs/                            # VitePress documentation & MVP spec
│   ├── index.md                     # Docs home page
│   ├── spec.md                      # Complete MVP Plan & Spec (M0–M9)
│   ├── ci-and-testing.md            # Local CI, CT & GitHub Actions guide
│   └── coverage.md                  # Embedded Istanbul/LCOV coverage report
└── package.json
```

## Documentation

Full project specification, milestone roadmap (`M0`–`M9`), and coverage reports live in VitePress:

- **Live Docs Site**: [https://ccmueller355.github.io/shadowtrain/](https://ccmueller355.github.io/shadowtrain/)
- **MVP Plan & Spec**: [docs/spec.md](docs/spec.md)
- **CI, Pre-Commit & Component Testing**: [docs/ci-and-testing.md](docs/ci-and-testing.md)

```bash
npm run docs:dev          # start local VitePress dev server
npm run docs:build:full   # run coverage + bundle report into VitePress dist
```

## Agent Instructions & Contributors

This project uses AI agents to assist with development. Instructions and guardrails live in:

- [AGENTS.md](AGENTS.md) — Primary instructions for our shadow-decker operator persona **Valerie** (Neural Deck v5.1).
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — Mirror instructions for GitHub Copilot.

Special thanks to the contributors building and maintaining ShadowTrain, including the AI assistants and the operator persona `Valerie`.

## Feedback

Found a bug or have an idea? [Open an issue](https://github.com/ccmueller355/shadowtrain/issues).

## License

MIT — see [LICENSE](LICENSE) for details.
