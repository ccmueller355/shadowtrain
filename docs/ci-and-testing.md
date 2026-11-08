# CI, Pre-Commit & Component Testing

ShadowTrain enforces strict local and remote quality gates so every milestone (`M0`–`M9`) lands cleanly on `main`.

---

## 1. Local CI (`scripts/ci-local.sh`)

Run the full verification pipeline locally before opening a Pull Request:

```bash
npm run ci
```

Or run the fast loop during active development (skips `expo-doctor` network check and VitePress build):

```bash
npm run ci:quick
```

### Pipeline Stages

| Stage                     | Command                                                        | Purpose                                                                             |
| :------------------------ | :------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **1. Secrets Scan**       | `gitleaks detect --source . --verbose --config .gitleaks.toml` | Ensures no API keys, tokens, or credentials exist in commit history or working tree |
| **2. ESLint**             | `npm run lint`                                                 | Static analysis via ESLint 9 + `typescript-eslint` across `src/` and `app/`         |
| **3. Format Check**       | `npm run format:check`                                         | Verifies consistent formatting via Prettier across code and documentation           |
| **4. Type Check**         | `npx tsc --noEmit`                                             | Verifies TypeScript 7.x strict mode across `src/` and `app/`                        |
| **5. Expo Config**        | `npx expo config --type introspect`                            | Validates `app.json` and Expo plugin configuration                                  |
| **6. Expo Doctor**        | `npx --yes expo-doctor`                                        | Runs 20 health & SDK 58 dependency compatibility checks                             |
| **7. Unit & CT Coverage** | `npm run test:coverage`                                        | Runs Jest unit tests + React Native Component Tests with coverage enforcement       |
| **8. Docs Build**         | `npm run docs:build`                                           | Verifies VitePress documentation and Mermaid diagrams compile cleanly               |

---

## 2. Linting & Formatting

```bash
npm run lint           # Run ESLint across src/, app/, App.tsx, index.ts
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Format code and markdown files with Prettier
npm run format:check   # Verify formatting without modifying files
```

---

## 3. Pre-Commit Hook (`.githooks/pre-commit`)

Enable the repository-tracked git hooks once after cloning:

```bash
npm run hooks:install
```

_(Also configured automatically via the `prepare` lifecycle script during `npm install`.)_

On every `git commit`, `.githooks/pre-commit` automatically verifies:

1. **Staged Secrets Scan** — `gitleaks protect --staged --verbose --config .gitleaks.toml`
2. **Neural Deck Header Check** — Ensures staged `.ts` / `.tsx` files in `src/`, `app/`, and `scripts/` start with `// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───`
3. **ESLint Check** — `npm run lint`
4. **Prettier Format Check** — `npm run format:check`
5. **TypeScript Strict Check** — `npx tsc --noEmit`
6. **Jest Test & Coverage Suite** — `npm run test:coverage`

---

## 4. Component Testing (CT) & Coverage

Component tests live in `src/__tests__/components.ct.test.tsx` and use `@testing-library/react-native` to test isolated UI components and screens against the live Zustand stores and theme system.

```bash
npm run test:ct         # Run only the Component Tests (CT)
npm run test:coverage   # Run full test suite with Istanbul/LCOV coverage thresholds
```

### What CT Covers

- **`CyberpunkCard`**: Renders child nodes, applies active theme `surface` and `primary` border colors, toggles glow shadow, and merges custom styles.
- **`HomeScreen`**: Renders deck title, empty-state card, and triggers `onStartSession` callback with session ID.
- **`ExercisesScreen`**: Reflects `profileStore` `availableEquipment` kit badges and updates dynamically when equipment is toggled in the store.
- **`ProgressScreen`**: Renders telemetry & PR placeholder cards with active theme tokens.
- **`SettingsScreen`**: Renders all 5 Shadowrun themes (`fixer`, `stuffer`, `decker`, `cyber`, `terminal`), switches active theme on press, and displays operator profile metrics (`goal`, `repRange`, `units`, `fixedKettlebellWeight`).
- **`SessionLoggerScreen`**: Renders active session header and invokes `onFinishSession` when Finish is pressed.

---

## 5. GitHub Actions CI (`.github/workflows/ci.yml`)

Every Pull Request targeting `main` and every push to `main` runs the automated GitHub Actions workflow:

1. **Gitleaks Secrets Scan** (`gitleaks v8.21.2`)
2. **Clean Dependency Install** (`npm ci --legacy-peer-deps`)
3. **ESLint** (`npm run lint`)
4. **Prettier Format Check** (`npm run format:check`)
5. **TypeScript Check** (`npx tsc --noEmit`)
6. **Expo Config Introspection** (`npx expo config --type introspect`)
7. **Expo Doctor** (`npx --yes expo-doctor`)
8. **Jest Unit + Component Tests with Coverage** (`npm run test:coverage`)
9. **Full VitePress + Coverage Docs Build** (`npm run docs:build:full`)
