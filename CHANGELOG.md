# Changelog

All notable changes to **ShadowTrain** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-03

### Added

- **M0 Scaffold**: Bootable React Native 0.88 + Expo SDK 58 app shell with TypeScript 7 strict mode.
- **Cyberpunk Theme System**: 5 Shadowrun themes (_Fixer's Notebook_, _Stuffer Shack_, _Decker's Den_, _Cyber Blue_, _Fiddler's Green_) with `useAppTheme` and `useThemeStyles` hooks.
- **Core Navigation & Surfaces**: Tab navigation across `HomeScreen`, `ExercisesScreen`, `ProgressScreen`, `SettingsScreen`, and modal `SessionLoggerScreen`, plus `CyberpunkCard` component.
- **Operator Profile Store**: Zustand `useProfileStore` defaulting to minimalist personal kit (`kettlebell`, `rings`, `bodyweight`, `hand_gripper`, `jump_rope`, `stretching`) and `fixedKettlebellWeight: 16`.
- **Component Testing (CT) & Coverage**: React Native Testing Library integration (`scaffold.test.tsx`) and component test suite (`components.ct.test.tsx`) enforcing ≥80% global coverage thresholds.
- **CI, Linting, Formatting & Pre-Commit Gates**:
  - Local 8-stage CI runner (`scripts/ci-local.sh` via `npm run ci` / `npm run ci:quick`)
  - Repository pre-commit hook (`.githooks/pre-commit` via `npm run hooks:install`)
  - ESLint 10 (`eslint.config.mjs`) and Prettier (`.prettierrc`)
  - GitHub Actions CI & GitHub Pages deployment workflow (`.github/workflows/ci.yml`)
- **Documentation**: `README.md` with status badges, `docs/spec.md` (M0–M9 MVP spec), `docs/ci-and-testing.md`, `docs/coverage.md`, and VitePress configuration.
