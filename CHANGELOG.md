## v0.1.1 — 2026-11-03

### Added

- **Documentation & Status Badges**: Added `README.md` with CI, GitHub Pages Docs, MIT License, and Version badges, implementation status table (`M0`–`M9`), and 8-stage CI pipeline reference (#2).
- **VitePress Docs & GitHub Pages**: Expanded `docs/index.md` with Mermaid build roadmap and milestone table, added `docs/ci-and-testing.md` and `docs/coverage.md` (embedding LCOV report at `/shadowtrain/coverage/index.html`), and configured GitHub Pages deployment in `.github/workflows/ci.yml` (#2).
- **Component Testing (CT) & Coverage Thresholds**: Added `src/__tests__/components.ct.test.tsx` (`npm run test:ct`) covering `CyberpunkCard`, `HomeScreen`, `ExercisesScreen`, `ProgressScreen`, `SettingsScreen`, and `SessionLoggerScreen`, and raised global Jest coverage thresholds to 80% (#2).
- **Local CI, Linting, Formatting & Pre-Commit Hook**:
  - Added 8-stage local CI pipeline `scripts/ci-local.sh` (`npm run ci` / `npm run ci:quick`) running Gitleaks, ESLint, Prettier, TypeScript strict check, Expo Config introspection, Expo Doctor (20/20 checks), Jest coverage, and VitePress build (#2).
  - Added `.githooks/pre-commit` (`npm run hooks:install`) enforcing staged Gitleaks scan, Neural Deck v5.1 header verification, ESLint, Prettier, `tsc --noEmit`, and Jest coverage (#2).
  - Configured ESLint 10 (`eslint.config.mjs`), Prettier (`.prettierrc`), and `.github/dependabot.yml` (#2).
  - Updated `AGENTS.md` to enforce mandatory human-in-the-loop PR review before squash merging (#2).

## v0.1.0 — 2026-11-02

### Added

- **M0 Scaffold**: Bootable React Native 0.88 + Expo SDK 58 app shell with TypeScript 7 strict mode (#1).
- **Cyberpunk Theme System**: 5 Shadowrun themes (_Fixer's Notebook_, _Stuffer Shack_, _Decker's Den_, _Cyber Blue_, _Fiddler's Green_) with `useAppTheme` and `useThemeStyles` hooks (#1).
- **Core Navigation & Surfaces**: Tab navigation across `HomeScreen`, `ExercisesScreen`, `ProgressScreen`, `SettingsScreen`, and modal `SessionLoggerScreen`, plus `CyberpunkCard` component (#1).
- **Operator Profile Store**: Zustand `useProfileStore` defaulting to minimalist personal kit (`kettlebell`, `rings`, `bodyweight`, `hand_gripper`, `jump_rope`, `stretching`) and `fixedKettlebellWeight: 16` (#1).
